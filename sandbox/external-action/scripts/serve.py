"""Loopback-only process adapters. Never connect these to production tools."""
import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib import error, request as http

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey

from resona_sandbox.actors import DestinationVerifier, Executor, Marker, Witness, validate_proposal
from resona_sandbox.storage import ContentStore, HeadCustodian, MarkerStore, NonceStore, OpLog
from resona_sandbox.wire import Hold, ID_RE, iso, parse_json


def required(name):
    value = os.environ.get(name)
    if not value:
        raise SystemExit(f"Missing {name}")
    return value


def private(name):
    return Ed25519PrivateKey.from_private_bytes(bytes.fromhex(Path(required(name)).read_text().strip()))


def public(name):
    return Ed25519PublicKey.from_public_bytes(bytes.fromhex(Path(required(name)).read_text().strip()))


def now():
    return datetime.now(timezone.utc)


def destination_request(path, body=None, *, revoke=False):
    base = required("MARKER_URL")
    if not base.startswith("http://127.0.0.1:"):
        raise Hold("INVALID_MARKER_URL")
    payload = None if body is None else json.dumps(body, sort_keys=True, separators=(",", ":")).encode()
    credential = required("MARKER_REVOKE_AUTH_TOKEN" if revoke else "MARKER_AUTH_TOKEN")
    req = http.Request(base + path, data=payload,
                       headers={"Content-Type": "application/json", "Authorization": "Bearer " + credential})
    try:
        with http.urlopen(req, timeout=3) as response:
            return parse_json(response.read())
    except error.HTTPError as exc:
        if exc.code == 409:
            try:
                result = parse_json(exc.read())
                reason = result.get("reason") if isinstance(result, dict) else None
                if isinstance(reason, str):
                    raise Hold(reason) from exc
            except Hold:
                raise
            except Exception:
                pass
        raise Hold("MARKER_UNAVAILABLE") from exc
    except Exception as exc:
        raise Hold("MARKER_UNAVAILABLE") from exc


def marker_client(action, token, store_id):
    return destination_request("/marker", {"action": action, "token": token, "store_id": store_id})


class RemoteRevocations:
    """No local SQLite path: effects and revocations go to ONE destination URL."""
    def __init__(self):
        self.store_id = required("DESTINATION_STORE_ID")
        for attempt in range(50):
            try:
                identity = destination_request("/identity")
                break
            except Hold as exc:
                if exc.code != "MARKER_UNAVAILABLE" or attempt == 49:
                    raise
                time.sleep(0.02)
        if not isinstance(identity, dict) or identity.get("store_id") != self.store_id:
            raise Hold("STORE_ID_MISMATCH")

    def revoke(self, request_id, ignored_timestamp):
        result = destination_request("/revoke", {"request_id": request_id, "store_id": self.store_id}, revoke=True)
        if (not isinstance(result, dict) or result.get("store_id") != self.store_id or
                result.get("request_id") != request_id or result.get("decision") != "REVOKED"):
            raise Hold("REVOCATION_RECEIPT_MISMATCH")
        return result["received_at_utc"]


def verifier_client(action, token, moment):
    base = required("VERIFIER_URL")
    if not base.startswith("http://127.0.0.1:"):
        raise Hold("INVALID_VERIFIER_URL")
    payload = json.dumps({"action": action, "token": token}, sort_keys=True, separators=(",", ":")).encode()
    req = http.Request(base + "/effect", data=payload,
                       headers={"Content-Type": "application/json",
                                "Authorization": "Bearer " + required("VERIFIER_AUTH_TOKEN")})
    try:
        with http.urlopen(req, timeout=3) as response:
            return parse_json(response.read())
    except error.HTTPError as exc:
        if exc.code == 409:
            try:
                body = parse_json(exc.read())
                reason = body.get("reason") if isinstance(body, dict) else None
                if isinstance(reason, str):
                    raise Hold(reason) from exc
            except Hold:
                raise
            except Exception:
                pass
        raise Hold("VERIFIER_UNAVAILABLE") from exc
    except Exception as exc:
        raise Hold("VERIFIER_UNAVAILABLE") from exc

def main():
    if os.environ.get("RESONA_SANDBOX_MODE") != "local_test":
        raise SystemExit("Sandbox process requires RESONA_SANDBOX_MODE=local_test")
    parser = argparse.ArgumentParser()
    parser.add_argument("role", choices=("marker", "witness", "executor", "verifier", "custodian"))
    parser.add_argument("--port", type=int, required=True)
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        raise SystemExit("Invalid port")
    role = args.role
    auth = required(role.upper() + "_AUTH_TOKEN")

    if role == "marker":
        actor = Marker(MarkerStore(required("DESTINATION_DB"), required("DESTINATION_STORE_ID")),
                       OpLog(required("MARKER_LOG_DB"), "marker"),
                       {required("WITNESS_KEY_ID"): public("WITNESS_PUBLIC_KEY_FILE")},
                       required("MARKER_ACTIVE_POLICY_SHA256"))
        marker_revoke_auth = required("MARKER_REVOKE_AUTH_TOKEN")
        if marker_revoke_auth == auth:
            raise SystemExit("Marker effect and revocation tokens must differ")
    elif role == "witness":
        actor = Witness(ContentStore(required("WITNESS_CONTENT_DB"), read_only=True), required("WITNESS_KEY_ID"),
                        private("WITNESS_PRIVATE_KEY_FILE"), OpLog(required("WITNESS_LOG_DB"), "witness"),
                        required("WITNESS_ACTIVE_POLICY_SHA256"))
        attest_auth = required("WITNESS_ATTEST_AUTH_TOKEN")
        if attest_auth == auth:
            raise SystemExit("Witness intake and attestation tokens must differ")
    elif role == "executor":
        actor = Executor(NonceStore(required("EXECUTOR_NONCE_DB")),
                         {required("WITNESS_KEY_ID"): public("WITNESS_PUBLIC_KEY_FILE")},
                         verifier_client, OpLog(required("EXECUTOR_LOG_DB"), "executor"),
                         required("EXECUTOR_ACTIVE_POLICY_SHA256"))
    elif role == "verifier":
        if any(name in os.environ for name in ("DESTINATION_DB", "VERIFIER_REVOCATION_DB", "MARKER_DB")):
            raise SystemExit("Verifier must not open a destination database; use the destination owner API")
        actor = DestinationVerifier(RemoteRevocations(),
                                    {required("WITNESS_KEY_ID"): public("WITNESS_PUBLIC_KEY_FILE")},
                                    marker_client, OpLog(required("VERIFIER_LOG_DB"), "verifier"),
                                    required("VERIFIER_ACTIVE_POLICY_SHA256"))
        revoke_auth = required("VERIFIER_REVOKE_AUTH_TOKEN")
        if revoke_auth == auth:
            raise SystemExit("Verifier effect and revocation tokens must differ")
    else:
        keys = json.loads(Path(required("CUSTODIAN_KEYS_FILE")).read_text())
        actor = HeadCustodian(required("CUSTODIAN_DB"),
                              {name: Ed25519PublicKey.from_public_bytes(bytes.fromhex(value))
                               for name, value in keys.items()})

    class Handler(BaseHTTPRequestHandler):
        def respond(self, status, obj):
            body = json.dumps(obj, sort_keys=True, separators=(",", ":")).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_POST(self):
            required_auth = auth
            if role == "witness" and self.path == "/attest":
                required_auth = attest_auth
            elif role == "verifier" and self.path == "/revoke":
                required_auth = revoke_auth
            elif role == "marker" and self.path == "/revoke":
                required_auth = marker_revoke_auth
            if self.headers.get("Authorization") != "Bearer " + required_auth:
                self.respond(403, {"error": "FORBIDDEN"})
                return
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 65536:
                self.respond(400, {"error": "INVALID_LENGTH"})
                return
            body = None
            try:
                body = parse_json(self.rfile.read(length))
                if role == "marker" and self.path == "/marker":
                    if not isinstance(body, dict) or set(body) != {"action", "token", "store_id"}:
                        raise Hold("INVALID_FIELDS")
                    result = actor.write(body["action"], body["token"], body["store_id"])
                elif role == "marker" and self.path == "/revoke":
                    if (not isinstance(body, dict) or set(body) != {"request_id", "store_id"} or
                            not isinstance(body["request_id"], str) or not ID_RE.fullmatch(body["request_id"])):
                        raise Hold("INVALID_FIELDS")
                    stored = actor.revoke(body["request_id"], body["store_id"])
                    result = {"request_id": body["request_id"], "decision": "REVOKED",
                              "received_at_utc": stored, "store_id": actor.store.store_id}
                elif role == "witness" and self.path == "/proposals":
                    validate_proposal(body)
                    actor.log.append({"request_id": body["action"]["request_id"],
                                      "decision": "SUBMITTED_HOLD", "at_utc": iso(now())})
                    result = {"request_id": body["action"]["request_id"], "decision": "HOLD"}
                elif role == "witness" and self.path == "/attest":
                    result = actor.decide(body, now())
                elif role == "executor" and self.path == "/execute":
                    if not isinstance(body, dict) or set(body) != {"proposal", "token"}:
                        raise Hold("INVALID_FIELDS")
                    result = actor.dispatch(body["proposal"], body["token"], now())
                elif role == "verifier" and self.path == "/effect":
                    if not isinstance(body, dict) or set(body) != {"action", "token"}:
                        raise Hold("INVALID_FIELDS")
                    result = actor.apply(body["action"], body["token"])
                elif role == "verifier" and self.path == "/revoke":
                    if not isinstance(body, dict) or set(body) != {"request_id"} or (
                        not isinstance(body["request_id"], str) or not ID_RE.fullmatch(body["request_id"])
                    ):
                        raise Hold("INVALID_FIELDS")
                    result = actor.revoke(body["request_id"])
                elif role == "custodian" and self.path == "/heads":
                    actor.accept(body)
                    result = {"accepted": True}
                else:
                    self.respond(404, {"error": "NOT_FOUND"})
                    return
                self.respond(200, result)
            except Hold as exc:
                if role == "witness" and self.path == "/proposals":
                    actor.log.append({"request_id": "invalid", "decision": "HOLD",
                                      "reason": exc.code, "at_utc": iso(now())})
                if role == "executor" and self.path == "/execute":
                    proposal = body.get("proposal", {}) if isinstance(body, dict) else {}
                    action = proposal.get("action", {}) if isinstance(proposal, dict) else {}
                    request_id = action.get("request_id", "invalid") if isinstance(action, dict) else "invalid"
                    if not isinstance(request_id, str) or not ID_RE.fullmatch(request_id):
                        request_id = "invalid"
                    self.respond(409, {"request_id": str(request_id), "decision": "HOLD",
                                       "reason": exc.code, "recorded_at_utc": iso(now()),
                                       "marker_record_id": None})
                elif role == "verifier" and self.path == "/effect":
                    action = body.get("action", {}) if isinstance(body, dict) else {}
                    request_id = action.get("request_id", "invalid") if isinstance(action, dict) else "invalid"
                    if not isinstance(request_id, str) or not ID_RE.fullmatch(request_id):
                        request_id = "invalid"
                    self.respond(409, {"request_id": str(request_id), "decision": "HOLD",
                                       "reason": exc.code, "recorded_at_utc": iso(now()),
                                       "marker_record_id": None})
                else:
                    self.respond(409, {"decision": "HOLD", "reason": exc.code})
            except Exception:
                self.respond(500, {"error": "INTERNAL_ERROR"})

        def do_GET(self):
            if self.headers.get("Authorization") != "Bearer " + auth:
                self.respond(403, {"error": "FORBIDDEN"})
                return
            if role == "marker" and self.path == "/identity":
                try:
                    self.respond(200, {"store_id": actor.store.identity(), "filesystem_check": actor.store.filesystem_check})
                except Hold as exc:
                    self.respond(409, {"decision": "HOLD", "reason": exc.code})
            elif role == "marker" and self.path == "/markers":
                self.respond(200, {"markers": actor.store.all()})
            elif role == "custodian" and self.path.startswith("/heads/"):
                try:
                    self.respond(200, actor.held(self.path.removeprefix("/heads/")))
                except Hold as exc:
                    self.respond(404, {"error": exc.code})
            else:
                self.respond(404, {"error": "NOT_FOUND"})

        def log_message(self, format, *args):
            return  # Do not print request bodies, signatures, or bearer credentials.

    ThreadingHTTPServer(("127.0.0.1", args.port), Handler).serve_forever()


if __name__ == "__main__":
    main()
