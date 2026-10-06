"""Reproducible local engineering challenge; not independent acceptance evidence."""
import argparse
import copy
import json
import os
import secrets
import socket
import sqlite3
import subprocess
import sys
import time
from pathlib import Path
from urllib import error, request

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from resona_sandbox.storage import ContentStore, OpLog
from resona_sandbox.wire import b64, fingerprint, sign_approval, sha

ROLES = ("policy_owner", "domain_adjudicator", "external_validator")


def save(path, value):
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n")


def call(url, credential, body=None):
    req = request.Request(url, data=None if body is None else json.dumps(body).encode(),
                          headers={"Authorization": "Bearer " + credential,
                                   "Content-Type": "application/json"})
    try:
        with request.urlopen(req, timeout=5) as response:
            return response.status, json.load(response)
    except error.HTTPError as exc:
        return exc.code, json.load(exc)


def free_ports():
    sockets = []
    try:
        for _ in range(4):
            sock = socket.socket()
            sock.bind(("127.0.0.1", 0))
            sockets.append(sock)
        return [sock.getsockname()[1] for sock in sockets]
    finally:
        for sock in sockets:
            sock.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True, help="New directory; never overwrites a run")
    parser.add_argument("--serve", action="store_true", help="Keep processes alive for manual attacks")
    args = parser.parse_args()
    home = args.output.resolve()
    home.mkdir(mode=0o700, parents=True, exist_ok=False)
    private, client, evidence = [home / name for name in ("private", "client", "evidence")]
    for directory in (private, client, evidence):
        directory.mkdir(mode=0o700)
    keys = [Ed25519PrivateKey.generate() for _ in range(4)]
    witness_key = keys[3]
    (private / "witness.key").write_text(witness_key.private_bytes(
        serialization.Encoding.Raw, serialization.PrivateFormat.Raw, serialization.NoEncryption()).hex())
    (private / "witness.pub").write_text(witness_key.public_key().public_bytes(
        serialization.Encoding.Raw, serialization.PublicFormat.Raw).hex())
    head_keys = {role: Ed25519PrivateKey.generate() for role in ("marker", "witness", "executor")}
    save(private / "head-public.json", {role: key.public_key().public_bytes(
        serialization.Encoding.Raw, serialization.PublicFormat.Raw).hex() for role, key in head_keys.items()})
    credentials = {name: secrets.token_urlsafe(32) for name in ("marker", "witness", "attest", "executor", "custodian")}
    content = ContentStore(str(private / "content.sqlite"))
    policy = {"version": "security-challenge-v1", "required_roles": list(ROLES),
              "rules": [{"action_class": "WRITE_MARKER_V1", "target": "test-marker-ledger"}],
              "signers": {"K" + str(i): {"role": role, "actor_id": "A" + str(i),
                           "public_key": b64(key.public_key().public_bytes(
                               serialization.Encoding.Raw, serialization.PublicFormat.Raw))}
                          for i, (role, key) in enumerate(zip(ROLES, keys), 1)}}
    policy_hash = content.put("policy", json.dumps(policy, sort_keys=True).encode())
    evidence_hash = content.put("evidence", b"Synthetic one-marker challenge. No patient or enterprise data.")

    def proposal(request_id, marker):
        action = {"action_class": "WRITE_MARKER_V1", "destination": "staging://markers",
                  "target": "test-marker-ledger", "max_scope": "one_marker", "request_id": request_id,
                  "marker": marker, "policy_sha256": policy_hash, "evidence_sha256": evidence_hash}
        fp = fingerprint(action)
        return {"schema_version": "0.1", "action": action, "action_fingerprint": fp,
                "approvals": [sign_approval({"role": role, "actor_id": "A" + str(i), "key_id": "K" + str(i),
                                             "action_fingerprint": fp}, key)
                              for i, (role, key) in enumerate(zip(ROLES, keys), 1)]}

    ports = free_ports()
    urls = {role: f"http://127.0.0.1:{port}" for role, port in zip(("marker", "witness", "executor", "custodian"), ports)}
    settings = {
        "marker": {"MARKER_AUTH_TOKEN": credentials["marker"], "MARKER_DB": str(private / "marker.sqlite"),
                   "MARKER_LOG_DB": str(private / "marker-log.sqlite")},
        "witness": {"WITNESS_AUTH_TOKEN": credentials["witness"], "WITNESS_ATTEST_AUTH_TOKEN": credentials["attest"],
                    "WITNESS_CONTENT_DB": str(private / "content.sqlite"), "WITNESS_LOG_DB": str(private / "witness-log.sqlite"),
                    "WITNESS_KEY_ID": "W1", "WITNESS_PRIVATE_KEY_FILE": str(private / "witness.key"),
                    "WITNESS_ACTIVE_POLICY_SHA256": policy_hash},
        "executor": {"EXECUTOR_AUTH_TOKEN": credentials["executor"], "EXECUTOR_NONCE_DB": str(private / "nonce.sqlite"),
                     "EXECUTOR_LOG_DB": str(private / "executor-log.sqlite"), "EXECUTOR_ACTIVE_POLICY_SHA256": policy_hash,
                     "WITNESS_KEY_ID": "W1", "WITNESS_PUBLIC_KEY_FILE": str(private / "witness.pub"),
                     "MARKER_URL": urls["marker"], "MARKER_AUTH_TOKEN": credentials["marker"]},
        "custodian": {"CUSTODIAN_AUTH_TOKEN": credentials["custodian"], "CUSTODIAN_DB": str(private / "custodian.sqlite"),
                      "CUSTODIAN_KEYS_FILE": str(private / "head-public.json")},
    }
    processes, handles, cases = [], [], []

    def markers():
        status, body = call(urls["marker"] + "/markers", credentials["marker"])
        if status != 200:
            raise RuntimeError("Cannot reconcile destination ledger")
        return body["markers"]

    def check(name, role, path, credential, body, status_expected, result_expected, expected_rows):
        before = markers()
        status, result = call(urls[role] + path, credential, body)
        after = markers()
        passed = status == status_expected and all(result.get(k) == v for k, v in result_expected.items()) and after == expected_rows
        cases.append({"case": name, "passed": passed, "http_status": status, "response": result,
                      "before_markers": before, "after_markers": after, "expected_markers": expected_rows})
        print(("PASS " if passed else "FAIL ") + name + ": " + str(result.get("reason", result.get("decision", result.get("error", "")))), flush=True)
        return result

    try:
        for role, port in zip(settings, ports):
            handle = (private / (role + "-stderr.txt")).open("w")
            handles.append(handle)
            # Do not inherit other actors' environment variables from the host.
            env = {k: os.environ[k] for k in ("PATH", "SYSTEMROOT") if k in os.environ}
            env.update({"PYTHONPATH": str(ROOT / "src"), "RESONA_SANDBOX_MODE": "local_test", **settings[role]})
            processes.append(subprocess.Popen([sys.executable, str(ROOT / "scripts/serve.py"), role, "--port", str(port)],
                                              env=env, stdout=subprocess.DEVNULL, stderr=handle))
        for selected_port in ports:
            for _ in range(100):
                if any(p.poll() is not None for p in processes):
                    raise RuntimeError("Actor exited; inspect private/*-stderr.txt")
                try:
                    with socket.create_connection(("127.0.0.1", selected_port), timeout=0.1):
                        break
                except OSError:
                    time.sleep(0.02)
            else:
                raise RuntimeError("Actor startup timed out")
        original = proposal("authorized_request", "authorized_marker")
        check("intake_is_not_authorization", "witness", "/proposals", credentials["witness"], original,
              200, {"decision": "HOLD"}, [])
        check("intake_credential_cannot_attest", "witness", "/attest", credentials["witness"], original,
              403, {"error": "FORBIDDEN"}, [])
        status, token = call(urls["witness"] + "/attest", credentials["attest"], original)
        if status != 200 or "signature" not in token:
            raise RuntimeError("Trusted setup could not obtain baseline authorization")
        changed = copy.deepcopy(original)
        changed["action"]["marker"] = "unauthorized_marker"
        changed["action_fingerprint"] = fingerprint(changed["action"])
        check("altered_marker_with_recomputed_fingerprint", "executor", "/execute", credentials["executor"],
              {"proposal": changed, "token": token}, 409, {"reason": "TOKEN_SCOPE_MISMATCH"}, [])
        forged = copy.deepcopy(token)
        forged["nonce"] = "forged_nonce"
        check("altered_signed_token", "executor", "/execute", credentials["executor"],
              {"proposal": original, "token": forged}, 409, {"reason": "BAD_SIGNATURE"}, [])
        expanded = copy.deepcopy(original)
        expanded["action"]["max_scope"] = "two_markers"
        check("expanded_scope", "executor", "/execute", credentials["executor"],
              {"proposal": expanded, "token": token}, 409, {"reason": "UNSUPPORTED_ACTION"}, [])
        missing = copy.deepcopy(original)
        missing["approvals"].pop()
        check("missing_approval", "witness", "/attest", credentials["attest"], missing,
              409, {"reason": "MISSING_APPROVAL"}, [])
        check("direct_marker_with_proposer_credential", "marker", "/marker", credentials["witness"], original["action"],
              403, {"error": "FORBIDDEN"}, [])
        rows = [["authorized_request", "authorized_marker"]]
        check("authorized_write", "executor", "/execute", credentials["executor"],
              {"proposal": original, "token": token}, 200, {"decision": "DISPATCHED"}, rows)
        check("replay", "executor", "/execute", credentials["executor"],
              {"proposal": original, "token": token}, 409, {"reason": "REPLAY"}, rows)
        held_heads = {}
        for role, key in head_keys.items():
            log = OpLog(str(private / (role + "-log.sqlite")), role)
            status, result = call(urls["custodian"] + "/heads", credentials["custodian"], log.signed_head(key))
            if status != 200:
                raise RuntimeError("Head publication failed")
            status, held = call(urls["custodian"] + "/heads/" + role, credentials["custodian"])
            if status != 200:
                raise RuntimeError("Head retrieval failed")
            log.verify(held)
            held_heads[role] = held
            with sqlite3.connect(private / (role + "-log.sqlite")) as db:
                events = [{"seq": seq, "prev_hash": prev, "body": json.loads(body), "hash": digest}
                          for seq, prev, body, digest in db.execute("SELECT seq,prev_hash,body,hash FROM events ORDER BY seq")]
            save(evidence / (role + "-events.json"), events)
        # A second preapproved action is deliberately left unredeemed for Ariel.
        manual = proposal("manual_request", "manual_authorized_marker")
        status, manual_token = call(urls["witness"] + "/attest", credentials["attest"], manual)
        if status != 200:
            raise RuntimeError("Manual fixture authorization failed")
        save(client / "execute.json", {"proposal": manual, "token": manual_token})
        save(client / "connection.json", {"witness_url": urls["witness"], "executor_url": urls["executor"],
                                          "marker_url": urls["marker"], "witness_intake_token": credentials["witness"],
                                          "executor_token": credentials["executor"]})
        manifest = {str(path.relative_to(ROOT)): sha(path.read_bytes())
                    for path in sorted(ROOT.rglob("*.py")) if ".venv" not in path.parts and "__pycache__" not in path.parts}
        report = {"classification": "LOCAL_ENGINEERING_ONLY_NOT_P1_N1_N11", "policy_sha256": policy_hash,
                  "evidence_sha256": evidence_hash, "source_sha256": manifest, "cases": cases,
                  "all_passed": all(c["passed"] for c in cases), "held_heads_at_suite_end": held_heads,
                  "suite_end_markers": markers(), "manual_token_expires_at_utc": manual_token["expires_at_utc"],
                  "limitations": ["One host and OS user; no independent custody", "No downstream enterprise effects tested",
                                  "Manual token expires in 60 seconds", "Snapshot heads precede manual authorization and attacks"]}
        save(evidence / "report.json", report)
        print("Evidence: " + str(evidence / "report.json"), flush=True)
        if not report["all_passed"]:
            return 1
        if args.serve:
            print("Live client fixture: " + str(client) + "; token expires " + manual_token["expires_at_utc"], flush=True)
            print("Use only client credentials. Ctrl-C stops actors and captures final markers.", flush=True)
            try:
                while True:
                    if any(p.poll() is not None for p in processes):
                        raise RuntimeError("Actor exited during manual challenge")
                    time.sleep(0.2)
            except KeyboardInterrupt:
                save(evidence / "manual-final-markers.json", markers())
        return 0
    finally:
        for process in processes:
            process.terminate()
        for process in processes:
            try:
                process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
        for handle in handles:
            handle.close()


if __name__ == "__main__":
    raise SystemExit(main())
