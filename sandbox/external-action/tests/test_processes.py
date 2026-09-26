"""Loopback process wiring smoke test, not the preregistered acceptance test."""
import json
import os
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path
from urllib import error, request

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from resona_sandbox.storage import ContentStore
from resona_sandbox.wire import b64, fingerprint, sign_approval

ROOT = Path(__file__).resolve().parents[1]


def port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def post(url, token, payload):
    req = request.Request(url, json.dumps(payload).encode(),
                          {"Authorization": "Bearer " + token, "Content-Type": "application/json"})
    with request.urlopen(req, timeout=3) as response:
        return json.load(response)


class ProcessWiring(unittest.TestCase):
    def test_process_refuses_start_without_local_test_mode(self):
        env = {**os.environ, "PYTHONPATH": str(ROOT / "src")}
        env.pop("RESONA_SANDBOX_MODE", None)
        result = subprocess.run(
            [sys.executable, str(ROOT / "scripts/serve.py"), "marker", "--port", str(port())],
            env=env, capture_output=True, text=True, timeout=5)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("RESONA_SANDBOX_MODE=local_test", result.stderr)

    def test_separate_processes_and_custodian_head(self):
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            marker_port, witness_port, executor_port, custodian_port = [port() for _ in range(4)]
            marker_url = f"http://127.0.0.1:{marker_port}"
            witness_url = f"http://127.0.0.1:{witness_port}"
            executor_url = f"http://127.0.0.1:{executor_port}"
            custodian_url = f"http://127.0.0.1:{custodian_port}"
            keys = {str(i): Ed25519PrivateKey.from_private_bytes(bytes([i]) * 32) for i in range(1, 6)}
            witness_private = home / "witness.key"
            witness_public = home / "witness.pub"
            witness_private.write_text((bytes([4]) * 32).hex())
            raw_public = keys["4"].public_key().public_bytes(
                serialization.Encoding.Raw, serialization.PublicFormat.Raw)
            witness_public.write_text(raw_public.hex())
            head_private = home / "witness-head.key"
            head_private.write_text((bytes([5]) * 32).hex())
            head_public = keys["5"].public_key().public_bytes(
                serialization.Encoding.Raw, serialization.PublicFormat.Raw)
            (home / "custodian-keys.json").write_text(json.dumps({"witness": head_public.hex()}))
            (home / "custodian-token").write_text("custodian-secret")
            content_path = str(home / "content.sqlite")
            content = ContentStore(content_path)
            roles = ("policy_owner", "domain_adjudicator", "external_validator")
            signers = {}
            for i, role in enumerate(roles, 1):
                raw = keys[str(i)].public_key().public_bytes(
                    serialization.Encoding.Raw, serialization.PublicFormat.Raw)
                signers["K" + str(i)] = {
                    "role": role, "actor_id": "A" + str(i), "public_key": b64(raw),
                }
            policy = {"version": "v1", "required_roles": list(roles), "signers": signers,
                      "rules": [{"action_class": "WRITE_MARKER_V1", "target": "test-marker-ledger"}]}
            policy_hash = content.put("policy", json.dumps(policy, sort_keys=True).encode())
            evidence_hash = content.put("evidence", b"engineering smoke fixture")
            action = {"action_class": "WRITE_MARKER_V1", "destination": "staging://markers",
                      "evidence_sha256": evidence_hash, "marker": "smoke_marker",
                      "max_scope": "one_marker", "policy_sha256": policy_hash,
                      "request_id": "smoke_request", "target": "test-marker-ledger"}
            fp = fingerprint(action)
            proposal = {
                "schema_version": "0.1", "action": action, "action_fingerprint": fp,
                "approvals": [
                    sign_approval({"role": role, "actor_id": "A" + str(i),
                                   "key_id": "K" + str(i), "action_fingerprint": fp}, keys[str(i)])
                    for i, role in enumerate(roles, 1)
                ],
            }
            settings = {
                "marker": {
                    "MARKER_AUTH_TOKEN": "marker-secret", "MARKER_DB": str(home / "marker.sqlite"),
                    "MARKER_LOG_DB": str(home / "marker-log.sqlite"),
                },
                "witness": {
                    "WITNESS_AUTH_TOKEN": "witness-secret", "WITNESS_CONTENT_DB": content_path,
                    "WITNESS_LOG_DB": str(home / "witness-log.sqlite"), "WITNESS_KEY_ID": "W1",
                    "WITNESS_PRIVATE_KEY_FILE": str(witness_private),
                    "WITNESS_ATTEST_AUTH_TOKEN": "internal-attest-secret",
                },
                "executor": {
                    "EXECUTOR_AUTH_TOKEN": "executor-secret", "EXECUTOR_NONCE_DB": str(home / "nonce.sqlite"),
                    "EXECUTOR_LOG_DB": str(home / "executor-log.sqlite"), "WITNESS_KEY_ID": "W1",
                    "WITNESS_PUBLIC_KEY_FILE": str(witness_public), "MARKER_URL": marker_url,
                    "MARKER_AUTH_TOKEN": "marker-secret",
                },
                "custodian": {
                    "CUSTODIAN_AUTH_TOKEN": "custodian-secret", "CUSTODIAN_DB": str(home / "custodian.sqlite"),
                    "CUSTODIAN_KEYS_FILE": str(home / "custodian-keys.json"),
                },
            }
            processes = []
            try:
                for role, selected_port in zip(settings, (marker_port, witness_port, executor_port, custodian_port)):
                    env = {**os.environ, "PYTHONPATH": str(ROOT / "src"),
                           "RESONA_SANDBOX_MODE": "local_test", **settings[role]}
                    processes.append(subprocess.Popen(
                        [sys.executable, str(ROOT / "scripts/serve.py"), role, "--port", str(selected_port)],
                        env=env, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE))
                for selected_port in (marker_port, witness_port, executor_port, custodian_port):
                    for attempt in range(50):
                        try:
                            with socket.create_connection(("127.0.0.1", selected_port), timeout=0.1):
                                break
                        except OSError:
                            time.sleep(0.02)
                    else:
                        self.fail("process did not start")
                intake = post(witness_url + "/proposals", "witness-secret", proposal)
                self.assertEqual(intake, {"request_id": "smoke_request", "decision": "HOLD"})
                token = post(witness_url + "/attest", "internal-attest-secret", proposal)
                result = post(executor_url + "/execute", "executor-secret",
                              {"proposal": proposal, "token": token})
                self.assertEqual(result["decision"], "DISPATCHED")
                self.assertEqual(result["marker_record_id"], "smoke_request")
                with self.assertRaises(error.HTTPError) as replay:
                    post(executor_url + "/execute", "executor-secret", {"proposal": proposal, "token": token})
                self.assertEqual(replay.exception.code, 409)
                with self.assertRaises(error.HTTPError) as forbidden:
                    post(marker_url + "/marker", "witness-secret", action)
                self.assertEqual(forbidden.exception.code, 403)
                req = request.Request(marker_url + "/markers", headers={"Authorization": "Bearer marker-secret"})
                with request.urlopen(req, timeout=3) as response:
                    self.assertEqual(json.load(response)["markers"], [["smoke_request", "smoke_marker"]])
                publish = subprocess.run([
                    sys.executable, str(ROOT / "scripts/publish_head.py"), "--actor", "witness",
                    "--log-db", str(home / "witness-log.sqlite"), "--key-file", str(head_private),
                    "--custodian-url", custodian_url, "--custodian-token-file", str(home / "custodian-token")],
                    env={**os.environ, "PYTHONPATH": str(ROOT / "src")},
                    capture_output=True, text=True, timeout=5)
                self.assertEqual(publish.returncode, 0, publish.stderr)
                req = request.Request(custodian_url + "/heads/witness",
                                      headers={"Authorization": "Bearer custodian-secret"})
                with request.urlopen(req, timeout=3) as response:
                    self.assertEqual(json.load(response)["count"], "2")
            finally:
                for process in processes:
                    process.terminate()
                for process in processes:
                    try:
                        process.communicate(timeout=3)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.communicate()


if __name__ == "__main__":
    unittest.main()
