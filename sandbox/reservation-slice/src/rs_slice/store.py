"""Persistent witness reservation store (RS-1 slice).

Local SQLite file. It provides durable uniqueness for this slice only; an operator with
file access can alter it. It is not independent custody.
"""
import hashlib
import sqlite3

SCHEMA = """
CREATE TABLE IF NOT EXISTS reservations (
    op_id          TEXT PRIMARY KEY,
    reservation_id TEXT NOT NULL UNIQUE,
    payload_sha256 TEXT NOT NULL,
    status         TEXT NOT NULL CHECK (status IN ('ACTIVE', 'REVOKED')),
    created_seq    INTEGER NOT NULL,
    revoked_seq    INTEGER
);
CREATE TABLE IF NOT EXISTS events (
    seq            INTEGER PRIMARY KEY AUTOINCREMENT,
    op_id          TEXT NOT NULL,
    kind           TEXT NOT NULL,
    reservation_id TEXT,
    payload_sha256 TEXT
);
CREATE TRIGGER IF NOT EXISTS reservation_identity_immutable
BEFORE UPDATE OF op_id, reservation_id, payload_sha256, created_seq ON reservations
BEGIN SELECT RAISE(ABORT, 'reservation identity is immutable'); END;
CREATE TRIGGER IF NOT EXISTS reservation_status_one_way
BEFORE UPDATE OF status ON reservations
WHEN NOT (OLD.status = 'ACTIVE' AND NEW.status = 'REVOKED')
BEGIN SELECT RAISE(ABORT, 'status may only move ACTIVE -> REVOKED'); END;
CREATE TRIGGER IF NOT EXISTS reservation_no_delete
BEFORE DELETE ON reservations
BEGIN SELECT RAISE(ABORT, 'reservations are never deleted'); END;
CREATE TRIGGER IF NOT EXISTS events_no_update
BEFORE UPDATE ON events
BEGIN SELECT RAISE(ABORT, 'events are append-only'); END;
CREATE TRIGGER IF NOT EXISTS events_no_delete
BEFORE DELETE ON events
BEGIN SELECT RAISE(ABORT, 'events are append-only'); END;
"""


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


class WitnessStore:
    def __init__(self, path: str):
        self.path = path
        self.db = sqlite3.connect(path, isolation_level=None, timeout=5)
        self.db.execute("PRAGMA journal_mode=WAL")
        self.db.execute("PRAGMA synchronous=FULL")
        self.db.executescript(SCHEMA)

    def _row(self, op_id):
        return self.db.execute(
            "SELECT op_id, reservation_id, payload_sha256, status FROM reservations WHERE op_id=?",
            (op_id,)).fetchone()

    @staticmethod
    def _view(row, outcome):
        return {"outcome": outcome, "op_id": row[0], "reservation_id": row[1],
                "payload_sha256": row[2], "status": row[3]}

    def _event(self, op_id, kind, rid=None, digest=None):
        self.db.execute(
            "INSERT INTO events (op_id, kind, reservation_id, payload_sha256) VALUES (?,?,?,?)",
            (op_id, kind, rid, digest))

    def reserve(self, op_id: str, payload: bytes) -> dict:
        """One transaction. Returns RESERVED, REPLAYED or IDEMPOTENCY_CONFLICT."""
        digest = sha256_hex(payload)
        self.db.execute("BEGIN IMMEDIATE")
        try:
            row = self._row(op_id)
            if row is None:
                seq = self.db.execute("SELECT COALESCE(MAX(seq), 0) + 1 FROM events").fetchone()[0]
                rid = f"R-{seq:08d}"
                self.db.execute(
                    "INSERT INTO reservations (op_id, reservation_id, payload_sha256, status,"
                    " created_seq) VALUES (?,?,?,'ACTIVE',?)", (op_id, rid, digest, seq))
                self._event(op_id, "RESERVED", rid, digest)
                result = self._view(self._row(op_id), "RESERVED")
            elif row[2] == digest:
                self._event(op_id, "REPLAYED", row[1], digest)
                result = self._view(row, "REPLAYED")
            else:
                self._event(op_id, "CONFLICT", row[1], digest)
                result = {"outcome": "IDEMPOTENCY_CONFLICT", "op_id": op_id,
                          "reservation_id": row[1], "status": row[3],
                          "stored_payload_sha256": row[2], "presented_payload_sha256": digest}
            self.db.execute("COMMIT")
            return result
        except BaseException:
            self.db.execute("ROLLBACK")
            raise

    def revoke(self, op_id: str) -> dict:
        self.db.execute("BEGIN IMMEDIATE")
        try:
            row = self._row(op_id)
            if row is None:
                self._event(op_id, "REVOKE_NOT_FOUND")
                result = {"outcome": "NOT_FOUND", "op_id": op_id}
            elif row[3] == "REVOKED":
                self._event(op_id, "REVOKE_REPEAT", row[1])
                result = self._view(row, "ALREADY_REVOKED")
            else:
                seq = self.db.execute("SELECT COALESCE(MAX(seq), 0) + 1 FROM events").fetchone()[0]
                self.db.execute("UPDATE reservations SET status='REVOKED', revoked_seq=? WHERE op_id=?",
                                (seq, op_id))
                self._event(op_id, "REVOKED", row[1])
                result = self._view(self._row(op_id), "REVOKED")
            self.db.execute("COMMIT")
            return result
        except BaseException:
            self.db.execute("ROLLBACK")
            raise

    def lookup(self, op_id: str) -> dict:
        row = self._row(op_id)
        return {"outcome": "NOT_FOUND", "op_id": op_id} if row is None else self._view(row, "FOUND")


def dump(path: str) -> dict:
    """Read-only full dump of a store file, for evidence."""
    db = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    try:
        cols = ["op_id", "reservation_id", "payload_sha256", "status", "created_seq", "revoked_seq"]
        res = [dict(zip(cols, r)) for r in db.execute(
            f"SELECT {', '.join(cols)} FROM reservations ORDER BY created_seq")]
        ecols = ["seq", "op_id", "kind", "reservation_id", "payload_sha256"]
        ev = [dict(zip(ecols, r)) for r in db.execute(
            f"SELECT {', '.join(ecols)} FROM events ORDER BY seq")]
        per_op = {}
        for r in res:
            per_op[r["op_id"]] = per_op.get(r["op_id"], 0) + 1
        reserved_events = {}
        for e in ev:
            if e["kind"] == "RESERVED":
                reserved_events[e["op_id"]] = reserved_events.get(e["op_id"], 0) + 1
        return {"reservations": res, "events": ev, "reservation_count": len(res),
                "reservations_per_op_id": per_op,
                "reserved_events_per_op_id": reserved_events,
                "integrity_check": db.execute("PRAGMA integrity_check").fetchone()[0]}
    finally:
        db.close()
