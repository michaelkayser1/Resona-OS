"""RS-2 effect writer: the recovery-gate enforcement boundary.

Separate process, own SQLite store, newline-delimited JSON over a Unix socket.
The effect store is a local stand-in for a destination. Credential separation here is
local (one host, one OS user); it is not independence from the host operator.

Gate states (open = blocking):
  ATTEMPT             registered before reserving; one write allowed with the attempt credential
  WRITTEN             effect written on the normal path
  OPEN                recovery classified the op UNRESOLVED; no write allowed
  CLEARED_CONFIRMED   reconciler confirmed an existing matching effect; no further write
  CLEARED_AUTHORIZED  reconciler authorized one write; consumed with the effect write
  CONSUMED            the authorized write happened
Anything else, or a cleared state without a matching authenticated resolution, is malformed.
"""
import argparse
import hashlib
import hmac
import json
import os
import secrets
import socketserver
import sqlite3
import sys
import threading

from . import client as witness_client

KNOWN = {"ATTEMPT", "WRITTEN", "OPEN", "CLEARED_CONFIRMED", "CLEARED_AUTHORIZED", "CONSUMED"}
NEEDS_RID = KNOWN - {"ATTEMPT"}
OUTCOMES = {"EFFECT_CONFIRMED", "EFFECT_ABSENT_AUTHORIZED_TO_PROCEED", "INDETERMINATE"}
RECONCILER = "reconciler"
CLIENT = "client"

# Allowed request keys per operation. Anything else (including any identity field) is refused.
ALLOWED = {
    "register_attempt": {"op", "credential", "op_id", "payload_sha256"},
    "write": {"op", "credential", "op_id", "reservation_id", "payload_sha256", "attempt_credential"},
    "mark_unresolved": {"op", "credential", "op_id", "reservation_id", "payload_sha256"},
    "reconcile": {"op", "credential", "op_id", "outcome", "evidence"},
    "state": {"op", "credential", "op_id"},
}
MAY = {"register_attempt": {CLIENT}, "write": {CLIENT}, "mark_unresolved": {CLIENT, RECONCILER},
       "reconcile": {RECONCILER}, "state": {CLIENT, RECONCILER}}

SCHEMA = """
CREATE TABLE IF NOT EXISTS gates (
    op_id TEXT PRIMARY KEY, payload_sha256 TEXT, reservation_id TEXT, state TEXT,
    attempt_digest TEXT, resolution_id INTEGER, updated_seq INTEGER);
CREATE TABLE IF NOT EXISTS resolutions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, op_id TEXT NOT NULL, reservation_id TEXT NOT NULL,
    payload_sha256 TEXT NOT NULL, outcome TEXT NOT NULL, actor TEXT NOT NULL,
    credential_fingerprint TEXT NOT NULL, evidence TEXT NOT NULL, seq INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS effects (
    op_id TEXT PRIMARY KEY, reservation_id TEXT NOT NULL, payload_sha256 TEXT NOT NULL,
    actor TEXT NOT NULL, via TEXT NOT NULL, resolution_id INTEGER, seq INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS audit (
    seq INTEGER PRIMARY KEY AUTOINCREMENT, op TEXT, op_id TEXT, actor TEXT,
    decision TEXT NOT NULL, reason TEXT);
CREATE TRIGGER IF NOT EXISTS resolutions_append_only_u BEFORE UPDATE ON resolutions
BEGIN SELECT RAISE(ABORT, 'resolutions are append-only'); END;
CREATE TRIGGER IF NOT EXISTS resolutions_append_only_d BEFORE DELETE ON resolutions
BEGIN SELECT RAISE(ABORT, 'resolutions are append-only'); END;
CREATE TRIGGER IF NOT EXISTS effects_append_only_u BEFORE UPDATE ON effects
BEGIN SELECT RAISE(ABORT, 'effects are append-only'); END;
CREATE TRIGGER IF NOT EXISTS effects_append_only_d BEFORE DELETE ON effects
BEGIN SELECT RAISE(ABORT, 'effects are append-only'); END;
CREATE TRIGGER IF NOT EXISTS audit_append_only_u BEFORE UPDATE ON audit
BEGIN SELECT RAISE(ABORT, 'audit is append-only'); END;
CREATE TRIGGER IF NOT EXISTS audit_append_only_d BEFORE DELETE ON audit
BEGIN SELECT RAISE(ABORT, 'audit is append-only'); END;
"""
# gates deliberately carries no CHECK on state: malformed rows must be representable so the
# fail-closed path can be tested. Validation is in Writer._validate_gate.


def sha(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()


class Refused(Exception):
    def __init__(self, reason):
        super().__init__(reason)
        self.reason = reason


def emit(tag, obj=None):
    sys.stdout.write(tag + ("" if obj is None else " " + json.dumps(obj, sort_keys=True)) + "\n")
    sys.stdout.flush()


class Writer:
    def __init__(self, db_path, witness_socket, credentials, hold_at=None):
        self.db = sqlite3.connect(db_path, isolation_level=None, timeout=5)
        self.db.execute("PRAGMA journal_mode=WAL")
        self.db.execute("PRAGMA synchronous=FULL")
        self.db.executescript(SCHEMA)
        self.witness_socket = witness_socket
        self.credentials = credentials  # {sha256(token): actor}
        self.hold_at = hold_at

    # identity ------------------------------------------------------------
    def authenticate(self, token):
        if not isinstance(token, str) or not token:
            return None, None
        digest = sha(token)
        actor = None
        for known, name in self.credentials.items():
            if hmac.compare_digest(known, digest):
                actor = name
        return actor, (digest[:16] if actor else None)

    # helpers -------------------------------------------------------------
    def _seq(self):
        return self.db.execute("SELECT COALESCE(MAX(seq), 0) + 1 FROM audit").fetchone()[0]

    def _gate(self, op_id):
        r = self.db.execute("SELECT op_id, payload_sha256, reservation_id, state, attempt_digest,"
                            " resolution_id FROM gates WHERE op_id=?", (op_id,)).fetchone()
        if r is None:
            return None
        return dict(zip(["op_id", "payload_sha256", "reservation_id", "state", "attempt_digest",
                         "resolution_id"], r))

    def _resolution(self, rid):
        r = self.db.execute("SELECT id, op_id, reservation_id, payload_sha256, outcome, actor"
                            " FROM resolutions WHERE id=?", (rid,)).fetchone()
        return None if r is None else dict(zip(
            ["id", "op_id", "reservation_id", "payload_sha256", "outcome", "actor"], r))

    def _effect(self, op_id):
        r = self.db.execute("SELECT op_id, reservation_id, payload_sha256 FROM effects WHERE op_id=?",
                            (op_id,)).fetchone()
        return None if r is None else dict(zip(["op_id", "reservation_id", "payload_sha256"], r))

    def _validate_gate(self, g):
        """Fail-closed structural validation. Returns the gate or raises Refused."""
        if g is None:
            raise Refused("GATE_MISSING")
        if g["state"] not in KNOWN:
            raise Refused("GATE_MALFORMED_STATE")
        if not g["payload_sha256"] or len(g["payload_sha256"]) != 64:
            raise Refused("GATE_MALFORMED_BINDING")
        if g["state"] in NEEDS_RID and not g["reservation_id"]:
            raise Refused("GATE_MALFORMED_BINDING")
        if g["state"] in ("CLEARED_CONFIRMED", "CLEARED_AUTHORIZED", "CONSUMED"):
            want = {"CLEARED_CONFIRMED": "EFFECT_CONFIRMED"}.get(
                g["state"], "EFFECT_ABSENT_AUTHORIZED_TO_PROCEED")
            res = self._resolution(g["resolution_id"]) if g["resolution_id"] is not None else None
            if (res is None or res["outcome"] != want or res["actor"] != RECONCILER
                    or res["op_id"] != g["op_id"] or res["reservation_id"] != g["reservation_id"]
                    or res["payload_sha256"] != g["payload_sha256"]):
                raise Refused("GATE_MALFORMED_CLEARED_WITHOUT_MATCHING_RESOLUTION")
        return g

    def _witness(self, op_id, reservation_id, payload_sha256, require_active):
        try:
            w = witness_client.lookup(self.witness_socket, op_id)
        except Exception:
            raise Refused("WITNESS_UNAVAILABLE")
        if w.get("outcome") != "FOUND":
            raise Refused("WITNESS_NOT_FOUND")
        if w["reservation_id"] != reservation_id or w["payload_sha256"] != payload_sha256:
            raise Refused("WITNESS_BINDING_MISMATCH")
        if w["status"] == "REVOKED":
            raise Refused("RESERVATION_REVOKED")
        if require_active and w["status"] != "ACTIVE":
            raise Refused("RESERVATION_NOT_ACTIVE")
        return w

    # operations (each runs inside BEGIN IMMEDIATE; Refused rolls back) ---
    def register_attempt(self, actor, req):
        if self._gate(req["op_id"]) is not None:
            raise Refused("ATTEMPT_EXISTS")
        token = secrets.token_hex(32)
        self.db.execute("INSERT INTO gates (op_id, payload_sha256, reservation_id, state,"
                        " attempt_digest, resolution_id, updated_seq) VALUES (?,?,NULL,'ATTEMPT',?,NULL,?)",
                        (req["op_id"], req["payload_sha256"], sha(token), self._seq()))
        return {"decision": "ATTEMPT_REGISTERED", "attempt_credential": token}

    def write(self, actor, req):
        g = self._validate_gate(self._gate(req["op_id"]))
        if g["payload_sha256"] != req["payload_sha256"]:
            raise Refused("GATE_MISMATCH_PAYLOAD")
        if g["reservation_id"] is not None and g["reservation_id"] != req["reservation_id"]:
            raise Refused("GATE_MISMATCH_RESERVATION")
        state = g["state"]
        if state == "OPEN":
            raise Refused("GATE_OPEN")
        if state == "CLEARED_CONFIRMED":
            raise Refused("CONFIRMED_EFFECT_NO_FURTHER_WRITE")
        if state in ("WRITTEN", "CONSUMED"):
            raise Refused("ALREADY_WRITTEN")
        if self._effect(req["op_id"]) is not None:
            raise Refused("EFFECT_ALREADY_EXISTS")
        if state == "ATTEMPT":
            presented = req.get("attempt_credential")
            if not isinstance(presented, str) or not hmac.compare_digest(
                    sha(presented), g["attempt_digest"] or ""):
                raise Refused("ATTEMPT_CREDENTIAL_INVALID")
            self._witness(req["op_id"], req["reservation_id"], req["payload_sha256"], True)
            seq = self._seq()
            self.db.execute("INSERT INTO effects VALUES (?,?,?,?, 'ATTEMPT', NULL, ?)",
                            (req["op_id"], req["reservation_id"], req["payload_sha256"], actor, seq))
            self.db.execute("UPDATE gates SET state='WRITTEN', reservation_id=?, attempt_digest=NULL,"
                            " updated_seq=? WHERE op_id=?", (req["reservation_id"], seq, req["op_id"]))
            return {"decision": "WRITTEN", "via": "ATTEMPT"}
        # CLEARED_AUTHORIZED: current revocation check, then consume with the effect write.
        self._witness(req["op_id"], req["reservation_id"], req["payload_sha256"], True)
        seq = self._seq()
        self.db.execute("INSERT INTO effects VALUES (?,?,?,?, 'AUTHORIZED_RESOLUTION', ?, ?)",
                        (req["op_id"], req["reservation_id"], req["payload_sha256"], actor,
                         g["resolution_id"], seq))
        self.db.execute("UPDATE gates SET state='CONSUMED', updated_seq=? WHERE op_id=?",
                        (seq, req["op_id"]))
        return {"decision": "WRITTEN", "via": "AUTHORIZED_RESOLUTION",
                "resolution_id": g["resolution_id"]}

    def mark_unresolved(self, actor, req):
        g = self._gate(req["op_id"])
        if g is not None:
            g = self._validate_gate(g)
            if g["payload_sha256"] != req["payload_sha256"]:
                raise Refused("GATE_MISMATCH_PAYLOAD")
            if g["reservation_id"] is not None and g["reservation_id"] != req["reservation_id"]:
                raise Refused("GATE_MISMATCH_RESERVATION")
            if g["state"] == "OPEN":
                return {"decision": "ALREADY_OPEN"}
            if g["state"] not in ("ATTEMPT", "WRITTEN"):
                raise Refused("ALREADY_RESOLVED")
        try:
            w = witness_client.lookup(self.witness_socket, req["op_id"])
        except Exception:
            raise Refused("WITNESS_UNAVAILABLE")
        if (w.get("outcome") != "FOUND" or w["reservation_id"] != req["reservation_id"]
                or w["payload_sha256"] != req["payload_sha256"]):
            raise Refused("WITNESS_BINDING_MISMATCH")
        seq = self._seq()
        if g is None:
            self.db.execute("INSERT INTO gates VALUES (?,?,?,'OPEN',NULL,NULL,?)",
                            (req["op_id"], req["payload_sha256"], req["reservation_id"], seq))
        else:
            self.db.execute("UPDATE gates SET state='OPEN', reservation_id=?, attempt_digest=NULL,"
                            " updated_seq=? WHERE op_id=?", (req["reservation_id"], seq, req["op_id"]))
        return {"decision": "GATE_OPENED"}

    def reconcile(self, actor, fingerprint, req):
        if req["outcome"] not in OUTCOMES:
            raise Refused("UNKNOWN_OUTCOME")
        g = self._validate_gate(self._gate(req["op_id"]))
        if g["state"] != "OPEN":
            raise Refused("GATE_NOT_OPEN")
        effect = self._effect(req["op_id"])
        outcome = req["outcome"]
        if outcome == "EFFECT_CONFIRMED":
            if effect is None or effect["reservation_id"] != g["reservation_id"] \
                    or effect["payload_sha256"] != g["payload_sha256"]:
                raise Refused("NO_MATCHING_EFFECT")
        elif outcome == "EFFECT_ABSENT_AUTHORIZED_TO_PROCEED":
            if effect is not None:
                raise Refused("EFFECT_EXISTS")
            self._witness(req["op_id"], g["reservation_id"], g["payload_sha256"], True)
        seq = self._seq()
        cur = self.db.execute(
            "INSERT INTO resolutions (op_id, reservation_id, payload_sha256, outcome, actor,"
            " credential_fingerprint, evidence, seq) VALUES (?,?,?,?,?,?,?,?)",
            (g["op_id"], g["reservation_id"], g["payload_sha256"], outcome, actor, fingerprint,
             json.dumps(req.get("evidence"), sort_keys=True), seq))
        res_id = cur.lastrowid
        if outcome != "INDETERMINATE":
            new_state = ("CLEARED_CONFIRMED" if outcome == "EFFECT_CONFIRMED"
                         else "CLEARED_AUTHORIZED")
            self.db.execute("UPDATE gates SET state=?, resolution_id=?, updated_seq=? WHERE op_id=?",
                            (new_state, res_id, seq, g["op_id"]))
        return {"decision": "RESOLVED", "outcome": outcome, "resolution_id": res_id,
                "actor": actor, "gate_state": "OPEN" if outcome == "INDETERMINATE" else new_state}

    def state(self, actor, req):
        g = self._gate(req["op_id"])
        if g is not None:
            g = {k: v for k, v in g.items() if k != "attempt_digest"}
        return {"decision": "STATE", "gate": g, "effect": self._effect(req["op_id"])}

    # dispatch ------------------------------------------------------------
    def handle(self, req):
        op = req.get("op") if isinstance(req, dict) else None
        op_id = req.get("op_id") if isinstance(req, dict) else None
        actor, fingerprint = self.authenticate(req.get("credential") if isinstance(req, dict) else None)
        try:
            if op not in ALLOWED:
                raise Refused("UNKNOWN_OP")
            extra = set(req) - ALLOWED[op]
            if extra:
                raise Refused("UNEXPECTED_FIELDS:" + ",".join(sorted(extra)))
            if actor is None:
                raise Refused("UNAUTHENTICATED")
            if actor not in MAY[op]:
                raise Refused("UNAUTHORIZED_FOR_" + op.upper())
            self.db.execute("BEGIN IMMEDIATE")
            try:
                try:
                    if op == "reconcile":
                        resp = self.reconcile(actor, fingerprint, req)
                    else:
                        resp = getattr(self, op)(actor, req)
                except (KeyError, TypeError, AttributeError):
                    raise Refused("MALFORMED_REQUEST")
                self.db.execute("INSERT INTO audit (op, op_id, actor, decision, reason)"
                                " VALUES (?,?,?,?,NULL)", (op, op_id, actor, resp["decision"]))
                if op == "reconcile":
                    self._hook("pre_reconcile_commit", op_id, resp)   # immediately before COMMIT
                self.db.execute("COMMIT")
            except BaseException:
                self.db.execute("ROLLBACK")
                raise
            if op == "reconcile":
                self._hook("post_reconcile_commit", op_id, resp)      # immediately after COMMIT
            return resp
        except Refused as r:
            self.db.execute("INSERT INTO audit (op, op_id, actor, decision, reason)"
                            " VALUES (?,?,?,'REFUSED',?)", (op, op_id, actor, r.reason))
            return {"decision": "REFUSED", "reason": r.reason}

    def _hook(self, point, op_id, resp):
        emit("HOOK", {"point": point, "op_id": op_id, "response": resp})
        if self.hold_at == point:
            emit("HOLDING", {"point": point})
            threading.Event().wait()  # never released; harness SIGKILLs here


def dump(path):
    db = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    try:
        out = {}
        for table, order in (("gates", "op_id"), ("resolutions", "id"), ("effects", "op_id"),
                             ("audit", "seq")):
            cur = db.execute(f"SELECT * FROM {table} ORDER BY {order}")
            cols = [c[0] for c in cur.description]
            rows = [dict(zip(cols, r)) for r in cur]
            if table == "gates":
                for r in rows:
                    r["attempt_digest"] = "<present>" if r["attempt_digest"] else None
            out[table] = rows
        out["integrity_check"] = db.execute("PRAGMA integrity_check").fetchone()[0]
        return out
    finally:
        db.close()


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", required=True)
    ap.add_argument("--socket", required=True)
    ap.add_argument("--witness-socket", required=True)
    ap.add_argument("--credentials", required=True, help="JSON {sha256(token): actor}")
    ap.add_argument("--hold-at", choices=["pre_reconcile_commit", "post_reconcile_commit"])
    args = ap.parse_args(argv)
    with open(args.credentials) as f:
        creds = json.load(f)
    w = Writer(args.db, args.witness_socket, creds, args.hold_at)
    lock = threading.Lock()

    class Handler(socketserver.StreamRequestHandler):
        def handle(self):
            line = self.rfile.readline()
            if not line:
                return
            try:
                req = json.loads(line)
            except ValueError:
                req = None
            with lock:
                resp = w.handle(req if isinstance(req, dict) else {})
            self.wfile.write((json.dumps(resp, sort_keys=True) + "\n").encode())

    if os.path.exists(args.socket):
        os.unlink(args.socket)
    server = socketserver.UnixStreamServer(args.socket, Handler)
    emit("READY", {"pid": os.getpid(), "db": args.db})
    server.serve_forever()


if __name__ == "__main__":
    main()
