"""Synthetic local acceptance checks. Run from the attribution directory."""
import sqlite3
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from guard import AttributionGuard, sign_grant, text_hash


class GuardTests(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.key = Ed25519PrivateKey.generate()
        self.guard = AttributionGuard(Path(tmp.name) / "test.db", self.key.public_key())
        self.statement = "Synthetic fictional attribution."
        self.fields = dict(request_id="r1", subject="Fictional Subject",
                           statement=self.statement, destination="example.invalid/post",
                           purpose="attribution", now=100)
        self.grant = dict(grant_id="g1", subject="Fictional Subject",
                          statement_sha256=text_hash(self.statement),
                          destination="example.invalid/post", purpose="attribution",
                          policy_id="attribution-v1", issued_at=100, expires_at=200)

    def signed(self, **changes):
        return sign_grant(self.key, {**self.grant, **changes})

    def denied(self, reason, **changes):
        before = self.guard.publications()
        self.assertEqual(self.guard.publish(**{**self.fields, **changes}), ("DENY", reason))
        self.assertEqual(before, self.guard.publications())
        self.assertEqual(self.guard.audit()[-1][-1], "UNCHANGED")

    def test_authorized_and_replay(self):
        self.assertEqual(self.guard.publish(**self.fields, signed_grant=self.signed()),
                         ("ALLOW", "OK"))
        self.denied("REPLAY", signed_grant=self.signed())
        self.denied("REPLAY", request_id="other", signed_grant=self.signed())
        self.denied("REPLAY", signed_grant=self.signed(grant_id="other"))
        self.assertEqual(len(self.guard.publications()), 1)

    def test_missing_and_tampered_authorization(self):
        self.denied("NO_CONSENT")
        token = self.signed()
        token["grant"]["subject"] = "Altered"
        self.denied("BAD_SIGNATURE", signed_grant=token)

    def test_scopes_and_active_policy(self):
        for change in (dict(statement="changed"), dict(destination="evil.invalid"),
                       dict(purpose="promotion"), dict(subject="Other Person")):
            self.denied("SCOPE_MISMATCH", signed_grant=self.signed(), **change)
        self.denied("POLICY_MISMATCH", signed_grant=self.signed(policy_id="old"))

    def test_exact_time_boundaries(self):
        for t in (99, 200, 201):
            self.denied("OUTSIDE_WINDOW", signed_grant=self.signed(), now=t)
        self.assertEqual(self.guard.publish(**{**self.fields, "now": 199},
                         signed_grant=self.signed()), ("ALLOW", "OK"))

    def test_revocation(self):
        self.guard.revoke("g1")
        self.denied("REVOKED", signed_grant=self.signed())

    def test_concurrent_duplicates(self):
        signed = self.signed()
        with ThreadPoolExecutor(max_workers=8) as pool:
            answers = list(pool.map(lambda _: self.guard.publish(
                **self.fields, signed_grant=signed), range(8)))
        self.assertEqual(answers.count(("ALLOW", "OK")), 1)
        self.assertEqual(answers.count(("DENY", "REPLAY")), 7)
        self.assertEqual(len(self.guard.publications()), 1)
        self.assertEqual(len(self.guard.audit()), 8)

    def test_audit_failure_rolls_back(self):
        with self.guard.db() as con:
            con.execute("""CREATE TRIGGER block_audit BEFORE INSERT ON audit
                           BEGIN SELECT RAISE(ABORT, 'audit failed'); END""")
        with self.assertRaises(sqlite3.DatabaseError):
            self.guard.publish(**self.fields, signed_grant=self.signed())
        self.assertEqual(self.guard.publications(), [])


if __name__ == "__main__":
    unittest.main()
