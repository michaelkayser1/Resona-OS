"""Witness process: one SQLite store, newline-delimited JSON over a Unix socket.

Fault injection (test harness only), applied strictly after the reservation commit:
  --drop-response-for OP_ID   commit, announce, then close without responding (once)
  --hold-after-commit-for OP  commit, announce, then block forever without responding,
                              so the harness can SIGKILL the process at that point.
The announcement is one stdout line: COMMITTED <json>. The harness synchronizes on it.
"""
import argparse
import base64
import json
import os
import socketserver
import sys
import threading

from .store import WitnessStore


def emit(tag, obj=None):
    sys.stdout.write(tag + ("" if obj is None else " " + json.dumps(obj, sort_keys=True)) + "\n")
    sys.stdout.flush()


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", required=True)
    ap.add_argument("--socket", required=True)
    ap.add_argument("--drop-response-for", action="append", default=[])
    ap.add_argument("--hold-after-commit-for", action="append", default=[])
    args = ap.parse_args(argv)

    store = WitnessStore(args.db)
    drop_once = set(args.drop_response_for)
    hold = set(args.hold_after_commit_for)
    lock = threading.Lock()

    class Handler(socketserver.StreamRequestHandler):
        def handle(self):
            line = self.rfile.readline()
            if not line:
                return
            req = json.loads(line)
            op, op_id = req["op"], req["op_id"]
            with lock:
                if op == "reserve":
                    resp = store.reserve(op_id, base64.b64decode(req["payload_b64"], validate=True))
                elif op == "revoke":
                    resp = store.revoke(op_id)
                elif op == "lookup":
                    resp = store.lookup(op_id)
                else:
                    resp = {"outcome": "BAD_REQUEST"}
                # Faults fire only after the store call above has committed.
                if op == "reserve" and op_id in hold:
                    emit("COMMITTED", resp)
                    emit("HOLDING", {"op_id": op_id})
                    threading.Event().wait()  # never released; harness kills the process
                if op == "reserve" and op_id in drop_once:
                    drop_once.discard(op_id)
                    emit("COMMITTED", resp)
                    emit("DROPPED_RESPONSE", {"op_id": op_id})
                    return  # connection closes with no response bytes
            self.wfile.write((json.dumps(resp, sort_keys=True) + "\n").encode())

    if os.path.exists(args.socket):
        os.unlink(args.socket)
    server = socketserver.UnixStreamServer(args.socket, Handler)
    emit("READY", {"pid": os.getpid(), "db": args.db})
    server.serve_forever()


if __name__ == "__main__":
    main()
