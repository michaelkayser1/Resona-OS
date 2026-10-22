"""RS-1 cases. Each case uses its own persistent witness store file and real processes.

Synchronization is on explicit stdout signals from the processes (READY, COMMITTED,
RESPONSE_LOST, BLOCKED_BEFORE_SEND). Deadlines below bound a hung run; they are never
used to order events.
"""
import json
import os
import selectors
import shutil
import signal
import sqlite3
import subprocess
import sys
import tempfile
import traceback
import unittest
from base64 import b64encode
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from rs_slice import client  # noqa: E402
from rs_slice.store import WitnessStore, dump, sha256_hex  # noqa: E402

DEADLINE_S = 20.0
ENV = {**os.environ, "PYTHONPATH": str(ROOT / "src"), "PYTHONUNBUFFERED": "1"}


class Proc:
    """A child process whose stdout lines are the synchronization channel."""

    def __init__(self, argv, transcript, label):
        self.label, self.transcript = label, transcript
        self.p = subprocess.Popen([sys.executable, "-m", *argv], env=ENV, stdout=subprocess.PIPE,
                                  stderr=subprocess.PIPE)
        self.fd = self.p.stdout.fileno()
        self.buf = b""
        self.sel = selectors.DefaultSelector()
        self.sel.register(self.fd, selectors.EVENT_READ)
        transcript.append({"proc": label, "event": "spawned", "pid": self.p.pid,
                           "argv": ["python", "-m", *argv]})

    def _next_line(self):
        while b"\n" not in self.buf:
            if not self.sel.select(timeout=DEADLINE_S):
                return None, "deadline"
            chunk = os.read(self.fd, 65536)
            if not chunk:
                return None, "eof"
            self.buf += chunk
        line, self.buf = self.buf.split(b"\n", 1)
        return line.decode(), None

    def wait_for(self, tag):
        """Block until a line starting with tag arrives; return its JSON body."""
        while True:
            line, why = self._next_line()
            if line is None:
                err = self.p.stderr.read().decode() if why == "eof" else ""
                raise AssertionError(f"{self.label}: no {tag} ({why}); stderr={err!r}")
            self.transcript.append({"proc": self.label, "stdout": line})
            head, _, body = line.partition(" ")
            if head == tag:
                return json.loads(body) if body else None

    def sigkill(self):
        os.kill(self.p.pid, signal.SIGKILL)
        rc = self.p.wait(timeout=DEADLINE_S)
        self.transcript.append({"proc": self.label, "event": "SIGKILL", "returncode": rc})
        self._close()
        return rc

    def finish(self):
        rc = self.p.wait(timeout=DEADLINE_S)
        rest = self.buf + self.p.stdout.read()
        for line in rest.decode().splitlines():
            self.transcript.append({"proc": self.label, "stdout": line})
        err = self.p.stderr.read().decode()
        if err:
            self.transcript.append({"proc": self.label, "stderr": err})
        self.transcript.append({"proc": self.label, "event": "exited", "returncode": rc})
        self._close()
        return rc

    def _close(self):
        self.sel.close()
        self.p.stdout.close()
        self.p.stderr.close()


class SliceCase(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="rs1-"))
        self.store = str(self.tmp / "witness.sqlite")
        self.local = str(self.tmp / "local-effects.sqlite")
        self.sock = str(self.tmp / "witness.sock")
        self.transcript, self.classifications, self.observations = [], [], []
        self.procs = []
        self.distinct_ops_reaching_witness = set()

    def tearDown(self):
        for pr in self.procs:
            if pr.p.poll() is None:
                pr.sigkill()
        shutil.rmtree(self.tmp, ignore_errors=True)

    # helpers -------------------------------------------------------------
    def start_witness(self, *faults):
        pr = Proc(["rs_slice.server", "--db", self.store, "--socket", self.sock, *faults],
                  self.transcript, f"witness#{sum(p.label.startswith('witness') for p in self.procs) + 1}")
        self.procs.append(pr)
        pr.wait_for("READY")
        return pr

    def client_proc(self, *args):
        pr = Proc(["rs_slice.client", "--socket", self.sock, "--local-db", self.local, *args],
                  self.transcript, f"client#{sum(p.label.startswith('client') for p in self.procs) + 1}")
        self.procs.append(pr)
        return pr

    def observe(self, step, value):
        self.observations.append({"step": step, "value": value})
        return value

    def classify(self, label, value):
        self.classifications.append({"label": label, "classification": value})

    def run(self, result=None):
        """Record evidence for every case, pass or fail."""
        case_dir = os.environ.get("RS_EVIDENCE_DIR")
        before = len(result.failures) + len(result.errors) if result else 0
        out = super().run(result)
        if case_dir and result is not None:
            failed = len(result.failures) + len(result.errors) > before
            detail = None
            if failed:
                detail = (result.failures + result.errors)[-1][1]
            rec = getattr(self, "_evidence", {})
            rec.update({"case": self.id(), "status": "FAIL" if failed else "PASS",
                        "failure": detail})
            Path(case_dir).mkdir(parents=True, exist_ok=True)
            Path(case_dir, self._testMethodName + ".json").write_text(
                json.dumps(rec, indent=2, sort_keys=True) + "\n")
        return out

    def seal(self):
        """Snapshot witness records and counts, and check the count criteria."""
        d = dump(self.store)
        self._evidence = {"transcript": self.transcript, "observations": self.observations,
                          "classifications": self.classifications, "witness_records": d,
                          "distinct_op_ids_reaching_witness": sorted(self.distinct_ops_reaching_witness)}
        self.assertEqual(d["integrity_check"], "ok")
        for op, n in d["reservations_per_op_id"].items():
            self.assertEqual(n, 1, op)
        for op, n in d["reserved_events_per_op_id"].items():
            self.assertEqual(n, 1, f"{op}: more than one RESERVED event")
        self.assertEqual(d["reservation_count"], len(self.distinct_ops_reaching_witness))
        return d

    def _guarded(self, body):
        try:
            body()
        except BaseException:
            if not hasattr(self, "_evidence"):
                try:
                    self.seal()
                except BaseException:
                    self._evidence = {"transcript": self.transcript,
                                      "observations": self.observations,
                                      "classifications": self.classifications,
                                      "seal_error": traceback.format_exc()}
            raise

    # cases ---------------------------------------------------------------
    def test_e4_response_loss_then_idempotent_retry(self):
        def body():
            op, payload = "op-A", b'{"marker":"A","v":1}'
            w = self.start_witness("--drop-response-for", op)
            c = self.client_proc("run", "--op-id", op, "--payload-b64", b64encode(payload).decode())
            committed = w.wait_for("COMMITTED")        # witness commit confirmed first
            w.wait_for("DROPPED_RESPONSE")
            lost = c.wait_for("RESPONSE_LOST")
            self.assertEqual(c.finish(), 3)
            self.distinct_ops_reaching_witness.add(op)
            self.observe("witness_commit_signal", committed)
            self.observe("client_first_attempt", lost)
            self.classify("first_attempt", "RESPONSE_LOST")
            self.assertEqual(committed["outcome"], "RESERVED")
            self.assertIsNone(client.LocalEffects(self.local).get(op))

            retry = self.observe("retry_same_bytes", client.reserve(self.sock, op, payload))
            self.assertEqual(retry["outcome"], "REPLAYED")
            self.assertEqual(retry["reservation_id"], committed["reservation_id"])
            self.assertEqual(retry["payload_sha256"], sha256_hex(payload))
            self.assertEqual(retry["status"], "ACTIVE")
            self.classify("retry", "REPLAYED_SAME_RESERVATION")
            w.sigkill()
            self.seal()
        self._guarded(body)

    def test_e1_same_op_id_different_bytes_conflicts(self):
        def body():
            op, payload = "op-B", b'{"marker":"B","v":1}'
            variants = {"changed_value": b'{"marker":"B","v":2}',
                        "whitespace_only": b'{"marker": "B","v":1}',
                        "trailing_newline": payload + b"\n"}
            w = self.start_witness()
            first = self.observe("first_reserve", client.reserve(self.sock, op, payload))
            self.distinct_ops_reaching_witness.add(op)
            self.assertEqual(first["outcome"], "RESERVED")
            before = dump(self.store)["reservations"]
            for name, other in variants.items():
                r = self.observe(f"conflict_{name}", client.reserve(self.sock, op, other))
                self.assertEqual(r["outcome"], "IDEMPOTENCY_CONFLICT", name)
                self.assertEqual(r["reservation_id"], first["reservation_id"])
                self.assertEqual(r["stored_payload_sha256"], sha256_hex(payload))
                self.classify(name, r["outcome"])
            self.assertEqual(dump(self.store)["reservations"], before)
            again = self.observe("same_bytes_after_conflicts", client.reserve(self.sock, op, payload))
            self.assertEqual((again["outcome"], again["reservation_id"]),
                             ("REPLAYED", first["reservation_id"]))
            self.classify("same_bytes_after_conflicts", "REPLAYED_SAME_RESERVATION")
            w.sigkill()
            self.seal()
        self._guarded(body)

    def test_e3_sigkill_restart_recovery(self):
        def body():
            op, payload = "op-C", b'{"marker":"C","v":1}'
            control = "op-C-control"
            w1 = self.start_witness("--hold-after-commit-for", op)
            c1 = self.client_proc("run", "--op-id", op, "--payload-b64", b64encode(payload).decode(),
                                  "--block-on-response-lost")
            committed = self.observe("witness_commit_signal", w1.wait_for("COMMITTED"))
            w1.wait_for("HOLDING")
            self.distinct_ops_reaching_witness.add(op)
            self.observe("witness_sigkill_rc", w1.sigkill())   # crash after commit, before reply
            self.observe("client_saw", c1.wait_for("RESPONSE_LOST"))
            self.observe("client_sigkill_rc", c1.sigkill())    # client crash before local record

            c2 = self.client_proc("run", "--op-id", control, "--payload-b64",
                                  b64encode(b"control").decode(), "--block-before-send")
            c2.wait_for("BLOCKED_BEFORE_SEND")
            self.observe("control_client_sigkill_rc", c2.sigkill())

            w2 = self.start_witness()                          # fresh process, same store file
            rec = self.client_proc("recover", "--op-id", op)
            r = self.observe("recovery", rec.wait_for("RECOVERY"))
            self.assertEqual(rec.finish(), 0)
            self.assertIsNone(r["local_reservation_id"])
            self.assertEqual(r["witness"]["outcome"], "FOUND")
            self.assertEqual(r["witness"]["reservation_id"], committed["reservation_id"])
            self.assertEqual(r["classification"], "WITNESS_PERSISTED_LOCAL_EFFECT_UNRESOLVED")
            self.classify("recovery_after_restart", r["classification"])

            rc = self.client_proc("recover", "--op-id", control)
            rr = self.observe("control_recovery", rc.wait_for("RECOVERY"))
            rc.finish()
            self.assertEqual(rr["classification"], "NO_WITNESS_RESERVATION_LOCAL_EFFECT_ABSENT")
            self.classify("control_recovery", rr["classification"])

            retry = self.client_proc("run", "--op-id", op, "--payload-b64",
                                     b64encode(payload).decode())
            rt = self.observe("retry_after_restart", retry.wait_for("RESULT"))
            retry.finish()
            self.assertEqual((rt["outcome"], rt["reservation_id"], rt["status"]),
                             ("REPLAYED", committed["reservation_id"], "ACTIVE"))
            self.classify("retry_after_restart", "REPLAYED_SAME_RESERVATION")
            w2.sigkill()
            self.seal()
        self._guarded(body)

    def test_e2_revocation_aware_retry(self):
        def body():
            op, payload = "op-D", b'{"marker":"D","v":1}'
            w1 = self.start_witness("--drop-response-for", op)
            c = self.client_proc("run", "--op-id", op, "--payload-b64", b64encode(payload).decode())
            committed = self.observe("witness_commit_signal", w1.wait_for("COMMITTED"))
            c.wait_for("RESPONSE_LOST")
            c.finish()
            self.distinct_ops_reaching_witness.add(op)
            rv = self.observe("revoke", client.revoke(self.sock, op))
            self.assertEqual((rv["outcome"], rv["reservation_id"]), ("REVOKED", committed["reservation_id"]))

            def check_retry(step):
                r = self.observe(step, client.reserve(self.sock, op, payload))
                self.assertEqual(r["outcome"], "REPLAYED")
                self.assertEqual(r["reservation_id"], committed["reservation_id"])
                self.assertEqual(r["status"], "REVOKED")
                self.classify(step, "REPLAYED_ORIGINAL_IDENTITY_STATUS_REVOKED")

            check_retry("retry_after_revoke")
            cf = self.observe("different_bytes_after_revoke",
                              client.reserve(self.sock, op, b'{"marker":"D","v":2}'))
            self.assertEqual((cf["outcome"], cf["status"]), ("IDEMPOTENCY_CONFLICT", "REVOKED"))
            self.classify("different_bytes_after_revoke", cf["outcome"])

            cl = self.client_proc("run", "--op-id", op, "--payload-b64", b64encode(payload).decode())
            res = self.observe("client_process_retry", cl.wait_for("RESULT"))
            cl.finish()
            self.assertEqual(res["status"], "REVOKED")
            self.assertIsNone(client.LocalEffects(self.local).get(op))

            w1.sigkill()
            w2 = self.start_witness()
            lk = self.observe("lookup_after_restart", client.lookup(self.sock, op))
            self.assertEqual((lk["reservation_id"], lk["status"]), (committed["reservation_id"], "REVOKED"))
            check_retry("retry_after_restart")
            w2.sigkill()
            self.seal()
        self._guarded(body)


class StoreGuards(unittest.TestCase):
    """Schema-level guards on the witness store (direct SQL, no process)."""

    def test_identity_immutable_status_one_way_no_delete(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = str(Path(tmp, "w.sqlite"))
            s = WitnessStore(path)
            s.reserve("op-E", b"x")
            s.revoke("op-E")
            db = sqlite3.connect(path)
            for sql in ("UPDATE reservations SET reservation_id='R-99999999' WHERE op_id='op-E'",
                        "UPDATE reservations SET payload_sha256='00' WHERE op_id='op-E'",
                        "UPDATE reservations SET status='ACTIVE' WHERE op_id='op-E'",
                        "DELETE FROM reservations WHERE op_id='op-E'",
                        "DELETE FROM events",
                        "UPDATE events SET kind='X'"):
                with self.assertRaises(sqlite3.IntegrityError, msg=sql):
                    db.execute(sql)
            db.close()
            self.assertEqual(dump(path)["reservation_count"], 1)


if __name__ == "__main__":
    unittest.main()
