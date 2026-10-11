"""Isolated local attribution-consent destination guard; not wired to production."""
import base64
import hashlib
import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()


def text_hash(value):
    return hashlib.sha256(value.encode()).hexdigest()


def sign_grant(key: Ed25519PrivateKey, grant):
    """Test/trusted issuer only. Never expose issuer signing key to a model."""
    return {"grant": grant, "signature": base64.b64encode(key.sign(canonical(grant))).decode()}


class AttributionGuard:
    def __init__(self, path, issuer_public_key, active_policy="attribution-v1"):
        self.path = str(path)
        self.issuer_key = issuer_public_key
        self.active_policy = active_policy
        with self.db() as con:
            con.executescript("""
            CREATE TABLE IF NOT EXISTS publications(
              request_id TEXT PRIMARY KEY, grant_id TEXT UNIQUE NOT NULL,
              subject TEXT NOT NULL, destination TEXT NOT NULL,
              statement TEXT NOT NULL, purpose TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS revoked(grant_id TEXT PRIMARY KEY);
            CREATE TABLE IF NOT EXISTS audit(
              id INTEGER PRIMARY KEY AUTOINCREMENT, request_id TEXT NOT NULL,
              policy_id TEXT NOT NULL, decision TEXT NOT NULL,
              reason TEXT NOT NULL, effect TEXT NOT NULL);
            """)

    @contextmanager
    def db(self):
        con = sqlite3.connect(self.path, timeout=10, isolation_level=None)
        try:
            yield con
        finally:
            con.close()

    def revoke(self, grant_id):
        with self.db() as con:
            con.execute("INSERT OR IGNORE INTO revoked VALUES(?)", (grant_id,))

    def publications(self):
        with self.db() as con:
            return con.execute("SELECT * FROM publications ORDER BY request_id").fetchall()

    def audit(self):
        with self.db() as con:
            return con.execute("SELECT request_id,policy_id,decision,reason,effect FROM audit ORDER BY id").fetchall()

    def evaluate(self, con, *, request_id, subject, statement, destination, purpose, signed_grant, now):
        if not signed_grant:
            return "NO_CONSENT"
        if not isinstance(signed_grant, dict):
            return "BAD_GRANT"
        grant, sig = signed_grant.get("grant"), signed_grant.get("signature")
        if not isinstance(grant, dict) or not isinstance(sig, str):
            return "BAD_GRANT"
        try:
            self.issuer_key.verify(base64.b64decode(sig, validate=True), canonical(grant))
        except (ValueError, TypeError, InvalidSignature):
            return "BAD_SIGNATURE"
        required = ("grant_id", "subject", "statement_sha256", "destination",
                    "purpose", "policy_id", "issued_at", "expires_at")
        if any(k not in grant for k in required):
            return "BAD_GRANT"
        if grant["policy_id"] != self.active_policy:
            return "POLICY_MISMATCH"
        if (grant["subject"], grant["statement_sha256"], grant["destination"], grant["purpose"]) != (
            subject, text_hash(statement), destination, purpose
        ):
            return "SCOPE_MISMATCH"
        if not (type(grant["issued_at"]) is int and type(grant["expires_at"]) is int
                and grant["issued_at"] <= now < grant["expires_at"]):
            return "OUTSIDE_WINDOW"
        if con.execute("SELECT 1 FROM revoked WHERE grant_id=?", (grant["grant_id"],)).fetchone():
            return "REVOKED"
        if con.execute("SELECT 1 FROM publications WHERE request_id=? OR grant_id=?",
                       (request_id, grant["grant_id"])).fetchone():
            return "REPLAY"
        return "OK"

    def publish(self, *, request_id, subject, statement, destination, purpose,
                signed_grant=None, now=None):
        """Trusted destination call. Exception => fail closed, no successful write."""
        now = int(datetime.now(timezone.utc).timestamp()) if now is None else int(now)
        with self.db() as con:
            try:
                con.execute("BEGIN IMMEDIATE")
                reason = self.evaluate(con, request_id=request_id, subject=subject,
                    statement=statement, destination=destination, purpose=purpose,
                    signed_grant=signed_grant, now=now)
                if reason == "OK":
                    try:
                        con.execute("INSERT INTO publications VALUES(?,?,?,?,?,?)",
                            (request_id, signed_grant["grant"]["grant_id"], subject,
                             destination, statement, purpose))
                    except sqlite3.IntegrityError:
                        reason = "REPLAY"
                decision = "ALLOW" if reason == "OK" else "DENY"
                effect = "PUBLISHED" if decision == "ALLOW" else "UNCHANGED"
                con.execute("INSERT INTO audit(request_id,policy_id,decision,reason,effect) VALUES(?,?,?,?,?)",
                    (request_id, self.active_policy, decision, reason, effect))
                con.commit()
                return decision, reason
            except Exception:
                con.rollback()
                raise
