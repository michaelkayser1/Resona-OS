"""Reservation client with a local effect-record store and an observational recovery step.

The "local effect record" is a stand-in row written after a reservation response is
received. No destination effect exists in this slice; fencing and effect enforcement
are out of scope.
"""
import argparse
import base64
import json
import socket
import sqlite3
import sys
import threading


class ResponseLost(Exception):
    """The request may or may not have been committed; the client cannot tell."""


def call(sock_path, req, timeout=10.0):
    s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    s.settimeout(timeout)
    try:
        s.connect(sock_path)
        s.sendall((json.dumps(req) + "\n").encode())
        data = b""
        while not data.endswith(b"\n"):
            chunk = s.recv(65536)
            if not chunk:
                raise ResponseLost("connection closed before a complete response")
            data += chunk
        return json.loads(data)
    finally:
        s.close()


def reserve(sock_path, op_id, payload: bytes):
    return call(sock_path, {"op": "reserve", "op_id": op_id,
                            "payload_b64": base64.b64encode(payload).decode()})


def revoke(sock_path, op_id):
    return call(sock_path, {"op": "revoke", "op_id": op_id})


def lookup(sock_path, op_id):
    return call(sock_path, {"op": "lookup", "op_id": op_id})


class LocalEffects:
    def __init__(self, path):
        self.db = sqlite3.connect(path, isolation_level=None)
        self.db.execute("PRAGMA synchronous=FULL")
        self.db.execute("CREATE TABLE IF NOT EXISTS effects (op_id TEXT PRIMARY KEY,"
                        " reservation_id TEXT NOT NULL)")

    def record(self, op_id, rid):
        self.db.execute("INSERT INTO effects (op_id, reservation_id) VALUES (?,?)", (op_id, rid))

    def get(self, op_id):
        row = self.db.execute("SELECT reservation_id FROM effects WHERE op_id=?", (op_id,)).fetchone()
        return None if row is None else row[0]


def classify_recovery(local_rid, witness):
    """E3: witness presence establishes persistence only; a missing local record stays unresolved."""
    found = witness.get("outcome") == "FOUND"
    if local_rid is None and found:
        return "WITNESS_PERSISTED_LOCAL_EFFECT_UNRESOLVED"
    if local_rid is None and not found:
        return "NO_WITNESS_RESERVATION_LOCAL_EFFECT_ABSENT"
    if not found:
        return "DISCREPANCY_LOCAL_RECORD_WITHOUT_WITNESS_RESERVATION"
    if local_rid != witness["reservation_id"]:
        return "DISCREPANCY_RESERVATION_ID_MISMATCH"
    return "LOCAL_EFFECT_RECORDED_MATCHES_WITNESS"


def emit(tag, obj=None):
    sys.stdout.write(tag + ("" if obj is None else " " + json.dumps(obj, sort_keys=True)) + "\n")
    sys.stdout.flush()


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--socket", required=True)
    ap.add_argument("--local-db", required=True)
    sub = ap.add_subparsers(dest="cmd", required=True)
    run = sub.add_parser("run")
    run.add_argument("--op-id", required=True)
    run.add_argument("--payload-b64", required=True)
    run.add_argument("--block-on-response-lost", action="store_true",
                     help="harness kill point: block instead of recording anything")
    run.add_argument("--block-before-send", action="store_true",
                     help="harness kill point: block before contacting the witness")
    rec = sub.add_parser("recover")
    rec.add_argument("--op-id", required=True)
    args = ap.parse_args(argv)

    local = LocalEffects(args.local_db)
    if args.cmd == "run":
        if args.block_before_send:
            emit("BLOCKED_BEFORE_SEND", {"op_id": args.op_id})
            threading.Event().wait()
        try:
            resp = reserve(args.socket, args.op_id, base64.b64decode(args.payload_b64))
        except ResponseLost as exc:
            emit("RESPONSE_LOST", {"op_id": args.op_id, "detail": str(exc)})
            if args.block_on_response_lost:
                threading.Event().wait()
            return 3
        if resp["outcome"] in ("RESERVED", "REPLAYED") and resp["status"] == "ACTIVE":
            local.record(args.op_id, resp["reservation_id"])
        emit("RESULT", resp)
        return 0
    witness = lookup(args.socket, args.op_id)
    local_rid = local.get(args.op_id)
    emit("RECOVERY", {"op_id": args.op_id, "local_reservation_id": local_rid, "witness": witness,
                      "classification": classify_recovery(local_rid, witness)})
    return 0


if __name__ == "__main__":
    sys.exit(main())
