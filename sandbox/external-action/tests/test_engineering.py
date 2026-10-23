"""Engineering checks only. These are not the frozen P1/N1–N11 acceptance run."""
import base64
import json
import sqlite3
import tempfile
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from resona_sandbox.actors import DestinationVerifier as CoreVerifier, Executor, Marker, Witness
from resona_sandbox.storage import ContentStore, HeadCustodian, MarkerStore, NonceStore, OpLog, RevocationStore
from resona_sandbox.wire import Hold, b64, canonical, fingerprint, parse_json, sha, sign_approval, sign_token, approvals_hash
from resona_sandbox.storage import connect

NOW = datetime(2026, 9, 26, 16, 0, tzinfo=timezone.utc)
ROLES = ("policy_owner", "domain_adjudicator", "external_validator")


class TestClock:
    def __init__(self, value=NOW):
        self.value = value
    def __call__(self):
        return self.value


class DestinationVerifier(CoreVerifier):
    # Compatibility helper for historical fixtures that specify a test instant.
    # Production has no caller-supplied now; both checks call the injected clock.
    def apply(self, action, token, when=None):
        if when is not None:
            self.clock.value = when
        return super().apply(action, token)
    def revoke(self, request_id, when=None):
        if when is not None:
            self.clock.value = when
        return super().revoke(request_id)


class Engineering(unittest.TestCase):
    def test_frozen_wire_vector(self):
        vector = json.loads((Path(__file__).parent / "vectors/fingerprint-v0.1.json").read_text())
        fp = fingerprint(vector["action"])
        self.assertEqual(fp, vector["action_fingerprint"])
        approval = sign_approval({"role": "policy_owner", "actor_id": "A1", "key_id": "K1",
                                  "action_fingerprint": fp},
                                 Ed25519PrivateKey.from_private_bytes(b"\x01" * 32))
        self.assertEqual(approval["signature"], vector["approval_signature"])
        token = sign_token({
            "schema_version": "0.1", "request_id": "R1", "action_fingerprint": fp,
            "policy_sha256": "a" * 64, "evidence_sha256": "b" * 64,
            "approvals_sha256": approvals_hash([approval]), "witness_key_id": "W1",
            "nonce": "N1", "not_before_utc": "2026-09-26T16:00:00Z",
            "expires_at_utc": "2026-09-26T16:01:00Z",
        }, Ed25519PrivateKey.from_private_bytes(b"\x04" * 32))
        self.assertEqual(token["signature"], vector["witness_signature"])

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.keys = {role: Ed25519PrivateKey.from_private_bytes(bytes([i]) * 32)
                     for i, role in enumerate(ROLES, 1)}
        self.witness_key = Ed25519PrivateKey.from_private_bytes(b"\x04" * 32)
        self.head_key = Ed25519PrivateKey.from_private_bytes(b"\x05" * 32)
        self.content = ContentStore(str(self.root / "content.sqlite"))
        signers = {}
        for i, role in enumerate(ROLES, 1):
            raw = self.keys[role].public_key().public_bytes(
                encoding=serialization.Encoding.Raw, format=serialization.PublicFormat.Raw)
            signers["K" + str(i)] = {"role": role, "actor_id": "A" + str(i), "public_key": b64(raw)}
        self.policy = {
            "version": "v1",
            "required_roles": list(ROLES),
            "rules": [{"action_class": "WRITE_MARKER_V1", "target": "test-marker-ledger"}],
            "signers": signers,
        }
        self.policy_hash = self.content.put("policy", json.dumps(self.policy, sort_keys=True).encode())
        self.evidence_hash = self.content.put("evidence", b"test-only evidence")
        self.witness_log = OpLog(str(self.root / "witness.sqlite"), "witness")
        self.marker_log = OpLog(str(self.root / "marker-log.sqlite"), "marker")
        self.executor_log = OpLog(str(self.root / "executor-log.sqlite"), "executor")
        self.verifier_log = OpLog(str(self.root / "verifier-log.sqlite"), "verifier")
        MarkerStore.initialize(str(self.root / "marker.sqlite"))
        self.marker_store = MarkerStore(str(self.root / "marker.sqlite"))
        self.clock = TestClock()
        self.nonces = NonceStore(str(self.root / "nonce.sqlite"))
        self.revocations = RevocationStore(str(self.root / "marker.sqlite"))
        self.witness = Witness(self.content, "W1", self.witness_key, self.witness_log, self.policy_hash)
        self.marker = Marker(self.marker_store, self.marker_log, {"W1": self.witness_key.public_key()}, self.policy_hash, self.clock)
        self.executor = Executor(
            self.nonces, {"W1": self.witness_key.public_key()}, lambda action, token, when: self.write_marker(action, when, token), self.executor_log, self.policy_hash)
        self.destination = DestinationVerifier(
            self.revocations, {"W1": self.witness_key.public_key()}, self.marker.write,
            self.verifier_log, self.policy_hash, clock=self.clock)

    def write_marker(self, action, when, token=None):
        self.clock.value = when
        if token is None:
            token = self.witness.decide(self.proposal(**action), when)
        result = self.marker.write(action, token, self.marker_store.store_id)
        return {k: v for k, v in result.items() if k != "store_id"}

    def proposal(self, request_id="R1", **changes):
        action = {
            "action_class": "WRITE_MARKER_V1", "destination": "staging://markers",
            "evidence_sha256": self.evidence_hash, "marker": "M1", "max_scope": "one_marker",
            "policy_sha256": self.policy_hash, "request_id": request_id, "target": "test-marker-ledger",
            **changes,
        }
        fp = fingerprint(action)
        approvals = [
            sign_approval({"role": role, "actor_id": "A" + str(i), "key_id": "K" + str(i),
                           "action_fingerprint": fp}, self.keys[role])
            for i, role in enumerate(ROLES, 1)
        ]
        return {"schema_version": "0.1", "action": action, "action_fingerprint": fp, "approvals": approvals}

    def test_fingerprint_and_duplicate_fields(self):
        p = self.proposal()
        self.assertEqual(fingerprint(p["action"]), p["action_fingerprint"])
        reordered = dict(reversed(list(p["action"].items())))
        self.assertEqual(fingerprint(reordered), p["action_fingerprint"])
        spaced = json.dumps(reordered, indent=2).encode()
        self.assertEqual(fingerprint(parse_json(spaced)), p["action_fingerprint"])
        with self.assertRaisesRegex(Hold, "DUPLICATE_KEY"):
            parse_json(b'{"request_id":"R1","request_id":"R2"}')
        with self.assertRaisesRegex(Hold, "NON_STRING_VALUE"):
            canonical({"x": 0.2})
        with self.assertRaisesRegex(Hold, "INVALID_FIELDS"):
            fingerprint({**p["action"], "marker": 1})
        with self.assertRaisesRegex(Hold, "INVALID_FIELDS"):
            fingerprint({**p["action"], "extra": "value"})
        with self.assertRaisesRegex(Hold, "INVALID_FIELDS"):
            self.witness.decide({**p, "algorithm": "none"}, NOW)

    def test_exactly_one_marker_and_restart_replay(self):
        p = self.proposal()
        token = self.witness.decide(p, NOW, nonce="fixed-nonce")
        self.assertEqual(self.executor.dispatch(p, token, NOW), {
            "request_id": "R1", "decision": "DISPATCHED", "reason": "MARKER_CONFIRMED",
            "recorded_at_utc": "2026-09-26T16:00:00Z", "marker_record_id": "R1",
        })
        fresh = Executor(NonceStore(str(self.root / "nonce.sqlite")),
                         {"W1": self.witness_key.public_key()}, lambda action, token, when: self.write_marker(action, when, token), self.executor_log, self.policy_hash)
        with self.assertRaisesRegex(Hold, "REPLAY"):
            fresh.dispatch(p, token, NOW)
        self.assertEqual(self.marker_store.all(), [("R1", "M1")])

    def test_path2_cached_token_rejected_after_destination_revocation(self):
        p = self.proposal(request_id="path2_revoked")
        token = self.witness.decide(p, NOW, nonce="cached-before-revocation")
        self.destination.revoke("path2_revoked", NOW + timedelta(seconds=5))

        # Simulate two uncoordinated presenters holding the same still-unexpired token.
        presenter_a = DestinationVerifier(
            RevocationStore(str(self.root / "marker.sqlite")),
            {"W1": self.witness_key.public_key()}, self.marker.write,
            self.verifier_log, self.policy_hash, clock=self.clock)
        presenter_b = DestinationVerifier(
            RevocationStore(str(self.root / "marker.sqlite")),
            {"W1": self.witness_key.public_key()}, self.marker.write,
            self.verifier_log, self.policy_hash, clock=self.clock)

        for verifier in (presenter_a, presenter_b):
            with self.assertRaisesRegex(Hold, "REVOKED"):
                verifier.apply(p["action"], token, NOW + timedelta(seconds=6))
        self.assertEqual(self.marker_store.all(), [])

    def test_destination_revocation_boundary_and_expiry_are_distinct(self):
        p = self.proposal(request_id="boundary")
        token = self.witness.decide(p, NOW, nonce="boundary-token")
        # Before the verifier receives revocation, the signed authority remains live.
        allowed = self.destination.apply(p["action"], token, NOW + timedelta(seconds=9))
        self.assertEqual(allowed["decision"], "EFFECT_ALLOWED")
        self.assertEqual(self.marker_store.all(), [("boundary", "M1")])

        self.destination.revoke("boundary", NOW + timedelta(seconds=10))
        # After the recorded revocation boundary, the same unexpired token is stale.
        with self.assertRaisesRegex(Hold, "REVOKED"):
            self.destination.apply(p["action"], token, NOW + timedelta(seconds=11))

        expired = self.proposal(request_id="expired_only")
        expired_token = self.witness.decide(expired, NOW, nonce="expired-token")
        with self.assertRaisesRegex(Hold, "EXPIRED_OR_EARLY"):
            self.destination.apply(expired["action"], expired_token, NOW + timedelta(seconds=60))
        self.assertEqual(self.marker_store.all(), [("boundary", "M1")])

    def test_100_paused_effects_rejected_after_revocation_ack(self):
        p = self.proposal(request_id="paused_batch")
        token = self.witness.decide(p, NOW, nonce="paused-batch")
        ready = threading.Barrier(101, timeout=15)
        release = threading.Event()

        def delayed_marker(action, token, store_id):
            # All workers have passed the early verifier lookup. Simulate a
            # delayed request reaching the marker after revocation ACK.
            ready.wait()
            if not release.wait(15):
                raise RuntimeError("marker release timeout")
            return self.marker.write(action, token, store_id)

        verifiers = [DestinationVerifier(
            self.revocations, {"W1": self.witness_key.public_key()}, delayed_marker,
            self.verifier_log, self.policy_hash, clock=self.clock) for _ in range(100)]

        def apply(verifier):
            try:
                return verifier.apply(p["action"], token, NOW + timedelta(seconds=1))["decision"]
            except Hold as exc:
                return exc.code

        with ThreadPoolExecutor(max_workers=100) as pool:
            futures = [pool.submit(apply, verifier) for verifier in verifiers]
            try:
                ready.wait()
                self.assertEqual(self.marker_store.all(), [])
                receipt = self.destination.revoke("paused_batch", NOW + timedelta(seconds=2))
                self.assertEqual(receipt["decision"], "REVOKED")
            finally:
                release.set()
            self.assertEqual([f.result(timeout=15) for f in futures], ["REVOKED"] * 100)
        self.assertEqual(self.marker_store.all(), [])

    def test_marker_transaction_precedes_revocation_ack(self):
        inside = threading.Event()
        release = threading.Event()
        attempted = threading.Event()
        acknowledged = threading.Event()

        def traced_connect(path, **kwargs):
            db = connect(path, **kwargs)
            def trace(sql):
                if sql.startswith("INSERT INTO markers"):
                    inside.set()
                    if not release.wait(15):
                        raise RuntimeError("transaction release timeout")
            db.set_trace_callback(trace)
            return db

        def revoke():
            attempted.set()
            receipt = self.destination.revoke("R1", NOW + timedelta(seconds=2))
            self.assertEqual(self.marker_store.all(), [("R1", "M1")])
            acknowledged.set()
            return receipt

        with patch("resona_sandbox.storage.connect", traced_connect), ThreadPoolExecutor(max_workers=2) as pool:
            effect = pool.submit(self.write_marker, self.proposal()["action"], NOW)
            try:
                self.assertTrue(inside.wait(15))
                # A distinct connection cannot acquire the destination writer
                # lock while the final check/write transaction is in flight.
                with sqlite3.connect(self.root / "marker.sqlite", timeout=0) as db:
                    with self.assertRaises(sqlite3.OperationalError):
                        db.execute("BEGIN IMMEDIATE")
                revocation = pool.submit(revoke)
                self.assertTrue(attempted.wait(15))
                self.assertFalse(acknowledged.is_set())
            finally:
                release.set()
            self.assertEqual(effect.result(timeout=15)["request_id"], "R1")
            self.assertEqual(revocation.result(timeout=15)["decision"], "REVOKED")
        with self.assertRaisesRegex(Hold, "REVOKED"):
            self.write_marker(self.proposal()["action"], NOW)

    def test_old_request_time_cannot_bypass_committed_revocation(self):
        p = self.proposal(request_id="old_clock")
        token = self.witness.decide(p, NOW, nonce="old-clock")
        self.destination.revoke("old_clock", NOW + timedelta(seconds=5))
        with self.assertRaisesRegex(Hold, "REVOKED"):
            self.destination.apply(p["action"], token, NOW + timedelta(seconds=1))
        with self.assertRaisesRegex(Hold, "REVOKED"):
            self.write_marker(p["action"], NOW)
        self.assertEqual(self.marker_store.all(), [])

    def test_destination_rejects_token_for_wrong_action_scope(self):
        p = self.proposal(request_id="scope_a")
        token = self.witness.decide(p, NOW, nonce="scope-token")
        other = self.proposal(request_id="scope_b")
        with self.assertRaisesRegex(Hold, "TOKEN_SCOPE_MISMATCH"):
            self.destination.apply(other["action"], token, NOW + timedelta(seconds=1))
        self.assertEqual(self.marker_store.all(), [])

    def test_missing_evidence_and_post_approval_mutation_hold(self):
        p = self.proposal(evidence_sha256="f" * 64)
        with self.assertRaisesRegex(Hold, "MISSING_CONTENT"):
            self.witness.decide(p, NOW)
        p = self.proposal()
        token = self.witness.decide(p, NOW, nonce="N1")
        p["action"]["marker"] = "M2"
        with self.assertRaisesRegex(Hold, "FINGERPRINT_MISMATCH"):
            self.executor.dispatch(p, token, NOW)
        self.assertEqual(self.marker_store.all(), [])

    def test_expiry_role_collision_and_unavailable_policy(self):
        p = self.proposal()
        token = self.witness.decide(p, NOW, nonce="N2")
        with self.assertRaisesRegex(Hold, "EXPIRED_OR_EARLY"):
            self.executor.dispatch(p, token, NOW + timedelta(seconds=60))
        p["approvals"][1]["actor_id"] = "A1"
        with self.assertRaises(Hold):
            self.witness.decide(p, NOW)
        p = self.proposal(policy_sha256="e" * 64)
        with self.assertRaisesRegex(Hold, "POLICY_NOT_ACTIVE"):
            self.witness.decide(p, NOW)

    def test_conflicting_and_uncovered_policy(self):
        for rules, reason in [
            ([], "UNCOVERED_ACTION"),
            ([self.policy["rules"][0], self.policy["rules"][0]], "POLICY_CONFLICT"),
        ]:
            policy = {**self.policy, "rules": rules}
            digest = self.content.put("policy", json.dumps(policy, sort_keys=True).encode())
            self.witness.active_policy_sha256 = digest
            with self.assertRaisesRegex(Hold, reason):
                self.witness.decide(self.proposal(policy_sha256=digest), NOW)

    def test_concurrent_marker_idempotence(self):
        p = self.proposal()
        with ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(lambda _: self.write_marker(p["action"], NOW), range(16)))
        self.assertTrue(all(x == {"request_id": "R1", "marker": "M1"} for x in results))
        self.assertEqual(self.marker_store.all(), [("R1", "M1")])

    def test_two_executor_instances_share_nonce_store_race(self):
        p = self.proposal()
        token = self.witness.decide(p, NOW, nonce="shared-nonce")
        executors = [
            Executor(NonceStore(str(self.root / "nonce.sqlite")),
                     {"W1": self.witness_key.public_key()},
                     lambda action, token, when: self.write_marker(action, when, token),
                     self.executor_log, self.policy_hash)
            for _ in range(2)
        ]
        def attempt(index):
            try:
                executors[index % 2].dispatch(p, token, NOW)
                return "DISPATCHED"
            except Hold as exc:
                return exc.code
        with ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(attempt, range(8)))
        self.assertEqual(results.count("DISPATCHED"), 1)
        self.assertEqual(results.count("REPLAY"), 7)
        self.assertEqual(self.marker_store.all(), [("R1", "M1")])

    def test_distinct_nonce_stores_both_dispatch_one_marker(self):
        p = self.proposal()
        token = self.witness.decide(p, NOW, nonce="one-token")
        executors = [Executor(NonceStore(str(self.root / f"nonce-{i}.sqlite")),
                              {"W1": self.witness_key.public_key()}, lambda action, token, when: self.write_marker(action, when, token),
                              self.executor_log, self.policy_hash) for i in range(2)]
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(lambda e: e.dispatch(p, token, NOW), executors))
        self.assertEqual([r["decision"] for r in results], ["DISPATCHED", "DISPATCHED"])
        self.assertEqual(self.marker_store.all(), [("R1", "M1")])

    def test_retired_policy_with_old_signers_cannot_authorize(self):
        old_keys = {role: Ed25519PrivateKey.generate() for role in ROLES}
        old_policy = json.loads(json.dumps(self.policy))
        old_policy["version"] = "retired"
        for i, role in enumerate(ROLES, 1):
            raw = old_keys[role].public_key().public_bytes(
                serialization.Encoding.Raw, serialization.PublicFormat.Raw)
            old_policy["signers"]["K" + str(i)]["public_key"] = b64(raw)
        old_hash = self.content.put("policy", json.dumps(old_policy, sort_keys=True).encode())
        p = self.proposal(policy_sha256=old_hash)
        fp = p["action_fingerprint"]
        p["approvals"] = [sign_approval({"role": role, "actor_id": "A" + str(i),
                                           "key_id": "K" + str(i), "action_fingerprint": fp},
                                          old_keys[role]) for i, role in enumerate(ROLES, 1)]
        with self.assertRaisesRegex(Hold, "POLICY_NOT_ACTIVE"):
            self.witness.decide(p, NOW)
        self.assertEqual(self.marker_store.all(), [])

    def test_executor_pin_rejects_unexpired_old_policy_token_after_rotation(self):
        old_proposal = self.proposal()
        old_token = self.witness.decide(old_proposal, NOW, nonce="old-policy-token")
        replacement = {**self.policy, "version": "v2"}
        new_hash = self.content.put("policy", json.dumps(replacement, sort_keys=True).encode())
        rotated_executor = Executor(self.nonces, {"W1": self.witness_key.public_key()},
                                    lambda action, token, when: self.write_marker(action, when, token), self.executor_log, new_hash)
        with self.assertRaisesRegex(Hold, "POLICY_NOT_ACTIVE"):
            rotated_executor.dispatch(old_proposal, old_token, NOW + timedelta(seconds=1))
        self.assertEqual(self.marker_store.all(), [])
        # A separately updated witness issues under the new pin; the executor accepts it.
        rotated_witness = Witness(self.content, "W1", self.witness_key, self.witness_log, new_hash)
        new_proposal = self.proposal(policy_sha256=new_hash)
        new_token = rotated_witness.decide(new_proposal, NOW, nonce="new-policy-token")
        # Destination pins also require a deliberate update; the old marker
        # must reject the new policy before that controlled reconfiguration.
        with self.assertRaisesRegex(Hold, "POLICY_NOT_ACTIVE"):
            self.marker.write(new_proposal["action"], new_token, self.marker_store.store_id)
        self.marker = Marker(self.marker_store, self.marker_log,
                             {"W1": self.witness_key.public_key()}, new_hash, self.clock)
        self.assertEqual(rotated_executor.dispatch(new_proposal, new_token, NOW)["decision"], "DISPATCHED")
        self.assertEqual(self.marker_store.all(), [("R1", "M1")])

    def test_executor_requires_valid_policy_pin(self):
        for bad in (None, "", "A" * 64, "x" * 64):
            with self.assertRaisesRegex(ValueError, "active policy"):
                Executor(self.nonces, {"W1": self.witness_key.public_key()},
                         lambda action, token, when: self.write_marker(action, when, token), self.executor_log, bad)

    def test_marker_write_then_lost_ack_requires_reconciliation(self):
        p = self.proposal()
        token = self.witness.decide(p, NOW, nonce="lost-ack")
        def lost_ack(action, token, when):
            self.write_marker(action, when, token)
            raise Hold("MARKER_UNAVAILABLE")
        executor = Executor(self.nonces, {"W1": self.witness_key.public_key()},
                            lost_ack, self.executor_log, self.policy_hash)
        with self.assertRaisesRegex(Hold, "MARKER_UNAVAILABLE"):
            executor.dispatch(p, token, NOW)
        self.assertEqual(self.marker_store.all(), [("R1", "M1")])
        with self.assertRaisesRegex(Hold, "REPLAY"):
            self.executor.dispatch(p, token, NOW)
        self.assertEqual(self.marker_store.all(), [("R1", "M1")])

    def test_exact_expiry_boundary_and_missing_token(self):
        p = self.proposal()
        token = self.witness.decide(p, NOW, nonce="expiry")
        with self.assertRaisesRegex(Hold, "EXPIRED_OR_EARLY"):
            self.executor.dispatch(p, token, NOW + timedelta(seconds=60))
        with self.assertRaisesRegex(Hold, "INVALID_FIELDS"):
            self.executor.dispatch(p, None, NOW)
        with self.assertRaisesRegex(Hold, "INVALID_FIELDS"):
            self.executor.dispatch({**p, "coherence": "maximal"}, None, NOW)
        self.assertEqual(self.marker_store.all(), [])
        self.executor.dispatch(p, token, NOW + timedelta(seconds=59))
        self.assertEqual(self.marker_store.all(), [("R1", "M1")])

    def test_restored_marker_backup_reopens_local_uniqueness(self):
        backup_path = self.root / "marker-backup.sqlite"
        with sqlite3.connect(self.root / "marker.sqlite") as source, sqlite3.connect(backup_path) as backup:
            source.backup(backup)
        self.write_marker(self.proposal()["action"], NOW)
        self.assertEqual(self.marker_store.all(), [("R1", "M1")])
        restored = MarkerStore(str(backup_path))
        self.assertEqual(restored.all(), [])
        # This demonstrates a limit, not successful rollback protection.
        restored.append("R1", "M1", expected_store_id=restored.store_id, authorize=lambda: NOW)
        self.assertEqual(restored.all(), [("R1", "M1")])

    def test_same_actor_cannot_fill_two_signed_roles(self):
        policy = json.loads(json.dumps(self.policy))
        policy["signers"]["K2"]["actor_id"] = "A1"
        digest = self.content.put("policy", json.dumps(policy, sort_keys=True).encode())
        self.witness.active_policy_sha256 = digest
        p = self.proposal(policy_sha256=digest)
        p["approvals"][1] = sign_approval({
            "role": "domain_adjudicator", "actor_id": "A1", "key_id": "K2",
            "action_fingerprint": p["action_fingerprint"],
        }, self.keys["domain_adjudicator"])
        with self.assertRaisesRegex(Hold, "ROLE_COLLISION"):
            self.witness.decide(p, NOW)

    def test_held_head_detects_truncation(self):
        self.witness_log.append({"event": "first"})
        self.witness_log.append({"event": "second"})
        custodian = HeadCustodian(str(self.root / "custodian.sqlite"),
                                 {"witness": self.head_key.public_key()})
        custodian.accept(self.witness_log.signed_head(self.head_key))
        self.assertEqual(self.witness_log.verify(custodian.held("witness"))["count"], "2")
        with sqlite3.connect(self.root / "witness.sqlite") as db:
            db.execute("DELETE FROM events WHERE seq=2")
        self.assertEqual(self.witness_log.verify()["count"], "1")
        with self.assertRaisesRegex(Hold, "HEAD_MISMATCH"):
            self.witness_log.verify(custodian.held("witness"))


if __name__ == "__main__":
    unittest.main()
