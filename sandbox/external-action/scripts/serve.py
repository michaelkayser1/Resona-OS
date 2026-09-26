"""Loopback-only process adapters. Never connect these to production tools."""
import argparse
import json
import os
import sys
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib import request as http

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey

from resona_sandbox.actors import Executor, Marker, Witness, validate_proposal
from resona_sandbox.storage import ContentStore, HeadCustodian, MarkerStore, NonceStore, OpLog
from resona_sandbox.wire import Hold, iso, parse_json


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


def marker_client(action, moment):
    base = required("MARKER_URL")
    if not base.startswith("http://127.0.0.1:"):
        raise Hold("INVALID_MARKER_URL")
    payload = json.dumps(action, sort_keys=True, separators=(",", ":")).encode()
    req = http.Request(base + "/marker", data=payload,
                       headers={"Content-Type": "application/json",
                                "Authorization": "Bearer " + required("MARKER_AUTH_TOKEN")})
    try:
        with http.urlopen(req, timeout=3) as response:
            return parse_json(response.read())
    except Exception as exc:
        raise Hold("MARKER_UNAVAILABLE") from exc


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("role", choices=("marker", "witness", "executor", "custodian"))
    parser.add_argument("--port", type=int, required=True)
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        raise SystemExit("Invalid port")
    role = args.role
    auth = required(role.upper() + "_AUTH_TOKEN")

    if role == "marker":
        actor = Marker(MarkerStore(required("MARKER_DB")), OpLog(required("MARKER_LOG_DB"), "marker"))
    elif role == "witness":
        actor = Witness(ContentStore(required("WITNESS_CONTENT_DB"), read_only=True), required("WITNESS_KEY_ID"),
                        private("WITNESS_PRIVATE_KEY_FILE"), OpLog(required("WITNESS_LOG_DB"), "witness"))
        attest_auth = required("WITNESS_ATTEST_AUTH_TOKEN")
        if attest_auth == auth:
            raise SystemExit("Witness intake and attestation tokens must differ")
    elif role == "executor":
        actor = Executor(NonceStore(required("EXECUTOR_NONCE_DB")),
                         {required("WITNESS_KEY_ID"): public("WITNESS_PUBLIC_KEY_FILE")},
                         marker_client, OpLog(required("EXECUTOR_LOG_DB"), "executor"))
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
            required_auth = (attest_auth if role == "witness" and self.path == "/attest" else auth)
            if self.headers.get("Authorization") != "Bearer " + required_auth:
                self.respond(403, {"error": "FORBIDDEN"})
                return
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 65536:
                self.respond(400, {"error": "INVALID_LENGTH"})
                return
            try:
                body = parse_json(self.rfile.read(length))
                if role == "marker" and self.path == "/marker":
                    result = actor.write(body, now())
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
                self.respond(409, {"decision": "HOLD", "reason": exc.code})
            except Exception:
                self.respond(500, {"error": "INTERNAL_ERROR"})

        def do_GET(self):
            if self.headers.get("Authorization") != "Bearer " + auth:
                self.respond(403, {"error": "FORBIDDEN"})
                return
            if role == "marker" and self.path == "/markers":
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
