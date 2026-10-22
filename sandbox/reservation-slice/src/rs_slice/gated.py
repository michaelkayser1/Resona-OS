"""RS-2 client-side and reconciler CLI. Every effect goes through the writer process.

The credential comes from the RS_CREDENTIAL environment variable; the writer derives
identity from it. Nothing here asserts an identity.
"""
import argparse
import base64
import json
import os
import sys
import threading

from . import client as wc
from .store import sha256_hex


def wcall(sock, req):
    return wc.call(sock, req)


def emit(tag, obj=None):
    sys.stdout.write(tag + ("" if obj is None else " " + json.dumps(obj, sort_keys=True)) + "\n")
    sys.stdout.flush()


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--witness-socket", required=True)
    ap.add_argument("--writer-socket", required=True)
    ap.add_argument("--local-db", required=True)
    sub = ap.add_subparsers(dest="cmd", required=True)
    run = sub.add_parser("run", help="normal path: register attempt, reserve, write, record")
    run.add_argument("--op-id", required=True)
    run.add_argument("--payload-b64", required=True)
    run.add_argument("--block-on-response-lost", action="store_true")
    run.add_argument("--block-after-write", action="store_true",
                     help="harness kill point: effect written, local record not yet written")
    rec = sub.add_parser("recover", help="RS-1 classification; UNRESOLVED opens the writer gate")
    rec.add_argument("--op-id", required=True)
    rt = sub.add_parser("retry", help="post-restart retry: reserve, then write via the writer")
    rt.add_argument("--op-id", required=True)
    rt.add_argument("--payload-b64", required=True)
    rc = sub.add_parser("reconcile")
    rc.add_argument("--op-id", required=True)
    rc.add_argument("--outcome", required=True)
    rc.add_argument("--evidence", default="{}")
    args = ap.parse_args(argv)

    cred = os.environ.get("RS_CREDENTIAL", "")
    local = wc.LocalEffects(args.local_db)

    if args.cmd == "run":
        payload = base64.b64decode(args.payload_b64)
        digest = sha256_hex(payload)
        reg = wcall(args.writer_socket, {"op": "register_attempt", "credential": cred,
                                         "op_id": args.op_id, "payload_sha256": digest})
        emit("REGISTER", reg)
        if reg.get("decision") != "ATTEMPT_REGISTERED":
            return 4
        attempt = reg["attempt_credential"]  # held in memory only
        try:
            resp = wc.reserve(args.witness_socket, args.op_id, payload)
        except wc.ResponseLost as exc:
            emit("RESPONSE_LOST", {"op_id": args.op_id, "detail": str(exc)})
            if args.block_on_response_lost:
                threading.Event().wait()
            return 3
        emit("RESERVE", resp)
        w = wcall(args.writer_socket, {"op": "write", "credential": cred, "op_id": args.op_id,
                                       "reservation_id": resp.get("reservation_id"),
                                       "payload_sha256": digest, "attempt_credential": attempt})
        emit("WRITE", w)
        if w.get("decision") == "WRITTEN":
            if args.block_after_write:
                emit("BLOCKED_AFTER_WRITE", {"op_id": args.op_id})
                threading.Event().wait()
            local.record(args.op_id, resp["reservation_id"])
        return 0

    if args.cmd == "recover":
        witness = wc.lookup(args.witness_socket, args.op_id)
        local_rid = local.get(args.op_id)
        cls = wc.classify_recovery(local_rid, witness)
        gate = None
        if cls == "WITNESS_PERSISTED_LOCAL_EFFECT_UNRESOLVED":
            gate = wcall(args.writer_socket, {"op": "mark_unresolved", "credential": cred,
                                              "op_id": args.op_id,
                                              "reservation_id": witness["reservation_id"],
                                              "payload_sha256": witness["payload_sha256"]})
        emit("RECOVERY", {"op_id": args.op_id, "classification": cls, "witness": witness,
                          "local_reservation_id": local_rid, "writer": gate})
        return 0

    if args.cmd == "retry":
        payload = base64.b64decode(args.payload_b64)
        resp = wc.reserve(args.witness_socket, args.op_id, payload)
        emit("RESERVE", resp)
        w = wcall(args.writer_socket, {"op": "write", "credential": cred, "op_id": args.op_id,
                                       "reservation_id": resp.get("reservation_id"),
                                       "payload_sha256": sha256_hex(payload)})
        emit("WRITE", w)
        if w.get("decision") == "WRITTEN":
            local.record(args.op_id, resp["reservation_id"])
        return 0

    try:
        r = wcall(args.writer_socket, {"op": "reconcile", "credential": cred, "op_id": args.op_id,
                                       "outcome": args.outcome,
                                       "evidence": json.loads(args.evidence)})
    except wc.ResponseLost as exc:
        emit("RESPONSE_LOST", {"op_id": args.op_id, "detail": str(exc)})
        threading.Event().wait()
    emit("RECONCILE", r)
    return 0


if __name__ == "__main__":
    sys.exit(main())
