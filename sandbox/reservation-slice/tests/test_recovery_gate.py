"""RS-2 recovery-gate cases (EXPECTATIONS-RS2.md). Real processes, persistent stores.

Synchronization is on explicit stdout lines from the processes. DEADLINE_S bounds a hung
run; it never orders events. Every case writes its evidence (pass or fail) when
RS_EVIDENCE_DIR is set.
"""
import hashlib
import json
import os
import secrets
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

from rs_slice import client as wc  # noqa: E402
from rs_slice import writer as wr  # noqa: E402
from rs_slice.store import dump as witness_dump, sha256_hex  # noqa: E402

DEADLINE_S = 20.0
BASE_ENV = {**os.environ, "PYTHONPATH": str(ROOT / "src"), "PYTHONUNBUFFERED": "1"}
BASE_ENV.pop("RS_CREDENTIAL", None)

RS1_OP, RS1_PAYLOAD = "op-C", b'{"marker":"C","v":1}'   # RS-1 crash-case op and payload
H2_ROUTING_NOTE = (
    "RS-1 request sequence and payload preserved (reserve with response lost at witness commit; "
    "SIGKILL witness and client; restart; recover; retry; write). The crash portion runs the "
    "unchanged RS-1 client process. Recovery and the final write are routed through the RS-2 "
    "writer. The unchanged RS-1 client writing directly to its own local database would bypass "
    "the RS-2 writer entirely; that path is not exercised and is not what this case tests.")


class Proc:
    def __init__(self, argv, transcript, label, env):
        self.label, self.transcript = label, transcript
        self.p = subprocess.Popen([sys.executable, "-m", *argv], env=env,
                                  stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        self.fd, self.buf = self.p.stdout.fileno(), b""
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


def b64(b):
    return b64encode(b).decode()


class GateCase(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="rs2-"))
        self.wstore = str(self.tmp / "witness.sqlite")
        self.gstore = str(self.tmp / "writer.sqlite")
        self.local = str(self.tmp / "local-effects.sqlite")
        self.wsock = str(self.tmp / "witness.sock")
        self.gsock = str(self.tmp / "writer.sock")
        self.client_cred = secrets.token_hex(32)
        self.recon_cred = secrets.token_hex(32)
        self.creds_file = self.tmp / "credentials.json"
        self.creds_file.write_text(json.dumps({wr.sha(self.client_cred): wr.CLIENT,
                                               wr.sha(self.recon_cred): wr.RECONCILER}))
        self.transcript, self.classifications, self.observations = [], [], []
        self.procs, self.counters = [], {}
        self.ops_reaching_witness, self.injected_malformed = set(), set()
        self.notes = []

    def tearDown(self):
        for pr in self.procs:
            if pr.p.poll() is None:
                pr.sigkill()
        shutil.rmtree(self.tmp, ignore_errors=True)

    # process helpers ------------------------------------------------------
    def _label(self, kind):
        self.counters[kind] = self.counters.get(kind, 0) + 1
        return f"{kind}#{self.counters[kind]}"

    def spawn(self, kind, argv, cred=None):
        env = dict(BASE_ENV)
        if cred is not None:
            env["RS_CREDENTIAL"] = cred
        pr = Proc(argv, self.transcript, self._label(kind), env)
        self.procs.append(pr)
        return pr

    def start_witness(self, *faults):
        pr = self.spawn("witness", ["rs_slice.server", "--db", self.wstore, "--socket", self.wsock,
                                    *faults])
        pr.wait_for("READY")
        return pr

    def start_writer(self, *extra):
        pr = self.spawn("writer", ["rs_slice.writer", "--db", self.gstore, "--socket", self.gsock,
                                   "--witness-socket", self.wsock, "--credentials",
                                   str(self.creds_file), *extra])
        pr.wait_for("READY")
        return pr

    def gated(self, cred, *args):
        return self.spawn("gated", ["rs_slice.gated", "--witness-socket", self.wsock,
                                    "--writer-socket", self.gsock, "--local-db", self.local, *args],
                          cred)

    def wreq(self, cred, **fields):
        req = {"credential": cred, **fields} if cred is not None else dict(fields)
        return wc.call(self.gsock, req)

    def reserve(self, op, payload):
        self.ops_reaching_witness.add(op)
        return wc.reserve(self.wsock, op, payload)

    def open_gate(self, op, payload):
        r = self.reserve(op, payload)
        g = self.wreq(self.client_cred, op="mark_unresolved", op_id=op,
                      reservation_id=r["reservation_id"], payload_sha256=sha256_hex(payload))
        self.assertEqual(g["decision"], "GATE_OPENED", g)
        return r

    def write(self, op, rid, payload, **extra):
        return self.wreq(self.client_cred, op="write", op_id=op, reservation_id=rid,
                         payload_sha256=sha256_hex(payload), **extra)

    def reconcile(self, op, outcome, cred=None, **extra):
        return self.wreq(self.recon_cred if cred is None else cred, op="reconcile", op_id=op,
                         outcome=outcome, evidence={"basis": "harness", "case": self.id()}, **extra)

    # evidence helpers -----------------------------------------------------
    def snap(self):
        d = wr.dump(self.gstore)
        return {k: d[k] for k in ("gates", "resolutions", "effects")}

    def observe(self, step, value):
        self.observations.append({"step": step, "value": value})
        return value

    def classify(self, label, value):
        self.classifications.append({"label": label, "classification": value})

    def refused(self, step, call, reason):
        """A refused request must carry the reason and leave gate/resolution/effect state unchanged."""
        before = self.snap()
        resp = self.observe(step, call())
        self.assertEqual(resp, {"decision": "REFUSED", "reason": reason}, step)
        self.assertEqual(self.snap(), before, f"{step}: state changed on refusal")
        self.classify(step, "REFUSED_" + reason + "_STATE_UNCHANGED")
        return resp

    def gate(self, op):
        return next((g for g in self.snap()["gates"] if g["op_id"] == op), None)

    def run(self, result=None):
        case_dir = os.environ.get("RS_EVIDENCE_DIR")
        before = len(result.failures) + len(result.errors) if result else 0
        out = super().run(result)
        if case_dir and result is not None:
            failed = len(result.failures) + len(result.errors) > before
            rec = getattr(self, "_evidence", {})
            rec.update({"case": self.id(), "status": "FAIL" if failed else "PASS",
                        "failure": (result.failures + result.errors)[-1][1] if failed else None})
            Path(case_dir).mkdir(parents=True, exist_ok=True)
            Path(case_dir, self._testMethodName + ".json").write_text(
                json.dumps(rec, indent=2, sort_keys=True) + "\n")
        return out

    def seal(self):
        wd, gd = witness_dump(self.wstore), wr.dump(self.gstore)
        self._evidence = {"transcript": self.transcript, "observations": self.observations,
                          "classifications": self.classifications, "notes": self.notes,
                          "witness_records": wd, "writer_records": gd,
                          "distinct_op_ids_reaching_witness": sorted(self.ops_reaching_witness),
                          "injected_malformed_gates": sorted(self.injected_malformed)}
        self.assertEqual(wd["integrity_check"], "ok")
        self.assertEqual(gd["integrity_check"], "ok")
        for op, n in wd["reserved_events_per_op_id"].items():
            self.assertEqual(n, 1, op)
        self.assertEqual(wd["reservation_count"], len(self.ops_reaching_witness))
        effects = {e["op_id"]: e for e in gd["effects"]}
        resolutions = {r["id"]: r for r in gd["resolutions"]}
        checks = {"cleared_gates_with_matching_resolution": 0, "open_gates_without_effect": 0,
                  "effects_not_written_while_gate_open": 0}
        for g in gd["gates"]:
            op = g["op_id"]
            if op in self.injected_malformed:
                self.assertNotIn(op, effects, f"{op}: effect on injected malformed gate")
                continue
            if g["state"] in ("CLEARED_CONFIRMED", "CLEARED_AUTHORIZED", "CONSUMED"):
                res = [r for r in gd["resolutions"] if r["id"] == g["resolution_id"]]
                self.assertEqual(len(res), 1, op)
                r = res[0]
                self.assertEqual((r["op_id"], r["reservation_id"], r["payload_sha256"], r["actor"]),
                                 (op, g["reservation_id"], g["payload_sha256"], wr.RECONCILER), op)
                checks["cleared_gates_with_matching_resolution"] += 1
            if g["state"] == "OPEN":
                self.assertNotIn(op, effects, f"{op}: effect exists while gate is open at seal")
                checks["open_gates_without_effect"] += 1
        # No effect may be written while its gate was open: walk the audit log per op.
        for op, e in effects.items():
            open_ = False
            for a in gd["audit"]:
                if a["op_id"] != op or a["decision"] == "REFUSED":
                    continue
                if a["decision"] == "GATE_OPENED":
                    open_ = True
                elif a["decision"] == "RESOLVED" and a["seq"] < e["seq"]:
                    res = [r for r in gd["resolutions"] if r["op_id"] == op and r["seq"] == a["seq"]]
                    if res and res[0]["outcome"] != "INDETERMINATE":
                        open_ = False
                elif a["decision"] == "WRITTEN" and a["seq"] == e["seq"]:
                    self.assertFalse(open_, f"{op}: effect written while gate open")
                    checks["effects_not_written_while_gate_open"] += 1
        self.assertEqual(checks["effects_not_written_while_gate_open"], len(effects))
        for r in gd["resolutions"]:
            if r["op_id"] not in self.injected_malformed:
                self.assertEqual(r["actor"], wr.RECONCILER)
        self._evidence["invariant_checks"] = checks
        return gd

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
                                      "notes": self.notes, "seal_error": traceback.format_exc()}
            raise

    # cases -----------------------------------------------------------------
    def test_g0_normal_path_control(self):
        def body():
            op, payload = "op-N", b'{"marker":"N","v":1}'
            self.start_witness()
            self.start_writer()
            self.ops_reaching_witness.add(op)
            c = self.gated(self.client_cred, "run", "--op-id", op, "--payload-b64", b64(payload))
            w = self.observe("normal_write", c.wait_for("WRITE"))
            self.assertEqual(c.finish(), 0)
            self.assertEqual((w["decision"], w["via"]), ("WRITTEN", "ATTEMPT"))
            self.classify("normal_path", "WRITTEN_VIA_ATTEMPT")
            rid = wc.lookup(self.wsock, op)["reservation_id"]
            self.refused("second_write_same_op", lambda: self.write(op, rid, payload),
                         "ALREADY_WRITTEN")
            self.seal()
        self._guarded(body)

    def test_h2_rs1_sequence_routed_through_writer(self):
        def body():
            self.notes.append(H2_ROUTING_NOTE)
            w1 = self.start_witness("--hold-after-commit-for", RS1_OP)
            g1 = self.start_writer()
            # Unchanged RS-1 client process for the crash portion.
            rs1 = self.spawn("rs1-client", ["rs_slice.client", "--socket", self.wsock, "--local-db",
                                            self.local, "run", "--op-id", RS1_OP, "--payload-b64",
                                            b64(RS1_PAYLOAD), "--block-on-response-lost"])
            committed = self.observe("witness_commit_signal", w1.wait_for("COMMITTED"))
            w1.wait_for("HOLDING")
            self.ops_reaching_witness.add(RS1_OP)
            self.observe("witness_sigkill_rc", w1.sigkill())
            rs1.wait_for("RESPONSE_LOST")
            self.observe("rs1_client_sigkill_rc", rs1.sigkill())
            self.start_witness()
            rid = committed["reservation_id"]

            pre = self.gated(self.client_cred, "retry", "--op-id", RS1_OP, "--payload-b64",
                             b64(RS1_PAYLOAD))
            pr = self.observe("write_before_recovery", pre.wait_for("WRITE"))
            pre.finish()
            self.assertEqual(pr, {"decision": "REFUSED", "reason": "GATE_MISSING"})
            self.classify("write_before_recovery", "REFUSED_GATE_MISSING")

            rec = self.gated(self.client_cred, "recover", "--op-id", RS1_OP)
            r = self.observe("recovery", rec.wait_for("RECOVERY"))
            rec.finish()
            self.assertEqual(r["classification"], "WITNESS_PERSISTED_LOCAL_EFFECT_UNRESOLVED")
            self.assertEqual(r["writer"], {"decision": "GATE_OPENED"})
            self.classify("recovery", r["classification"] + "+GATE_OPENED")

            for i, restart in enumerate((False, True)):
                if restart:
                    self.observe("writer_sigkill_rc", g1.sigkill())
                    g1 = self.start_writer()
                rt = self.gated(self.client_cred, "retry", "--op-id", RS1_OP, "--payload-b64",
                                b64(RS1_PAYLOAD))
                res = self.observe(f"retry_reserve_{i}", rt.wait_for("RESERVE"))
                wres = self.observe(f"retry_write_{i}", rt.wait_for("WRITE"))
                rt.finish()
                self.assertEqual((res["outcome"], res["reservation_id"], res["status"]),
                                 ("REPLAYED", rid, "ACTIVE"))
                self.assertEqual(wres, {"decision": "REFUSED", "reason": "GATE_OPEN"})
                self.classify(f"retry_{'after_writer_restart' if restart else 'after_recovery'}",
                              "ACTIVE_REPLAY_REFUSED_GATE_OPEN")
            self.assertEqual(self.gate(RS1_OP)["state"], "OPEN")
            self.assertIsNone(wc.LocalEffects(self.local).get(RS1_OP))
            self.assertEqual(self.snap()["effects"], [])
            self.seal()
        self._guarded(body)

    def test_g1_restart_without_recovery_refused(self):
        def body():
            op, payload = "op-S", b'{"marker":"S","v":1}'
            w1 = self.start_witness("--hold-after-commit-for", op)
            self.start_writer()
            c = self.gated(self.client_cred, "run", "--op-id", op, "--payload-b64", b64(payload),
                           "--block-on-response-lost")
            self.observe("register", c.wait_for("REGISTER"))
            w1.wait_for("COMMITTED")
            self.ops_reaching_witness.add(op)
            w1.sigkill()
            c.wait_for("RESPONSE_LOST")
            c.sigkill()
            self.start_witness()
            rt = self.gated(self.client_cred, "retry", "--op-id", op, "--payload-b64", b64(payload))
            self.observe("retry_reserve", rt.wait_for("RESERVE"))
            wres = self.observe("retry_write_without_attempt_credential", rt.wait_for("WRITE"))
            rt.finish()
            self.assertEqual(wres, {"decision": "REFUSED", "reason": "ATTEMPT_CREDENTIAL_INVALID"})
            self.classify("retry_without_recovery", "REFUSED_ATTEMPT_CREDENTIAL_INVALID")
            self.refused("re_register_attempt", lambda: self.wreq(
                self.client_cred, op="register_attempt", op_id=op,
                payload_sha256=sha256_hex(payload)), "ATTEMPT_EXISTS")
            self.assertEqual(self.snap()["effects"], [])
            self.seal()
        self._guarded(body)

    def test_g1_fail_closed_gate_states(self):
        def body():
            self.start_witness()
            g1 = self.start_writer()
            p = {op: ('{"marker":"%s"}' % op).encode() for op in
                 ("op-miss", "op-bogus", "op-nobind", "op-nores", "op-wrongres", "op-clientres",
                  "op-mmp", "op-mmr")}
            r = {op: self.reserve(op, p[op]) for op in p}
            h = {op: sha256_hex(p[op]) for op in p}
            g1.sigkill()
            # Inject malformed gate state directly (operator-level tamper while writer is down).
            db = sqlite3.connect(self.gstore)
            rid = lambda op: r[op]["reservation_id"]  # noqa: E731
            db.execute("INSERT INTO gates VALUES ('op-bogus',?,?,'BOGUS',NULL,NULL,0)",
                       (h["op-bogus"], rid("op-bogus")))
            db.execute("INSERT INTO gates VALUES ('op-nobind',?,NULL,'OPEN',NULL,NULL,0)",
                       (h["op-nobind"],))
            db.execute("INSERT INTO gates VALUES ('op-nores',?,?,'CLEARED_AUTHORIZED',NULL,NULL,0)",
                       (h["op-nores"], rid("op-nores")))
            cur = db.execute("INSERT INTO resolutions (op_id, reservation_id, payload_sha256, outcome,"
                             " actor, credential_fingerprint, evidence, seq) VALUES"
                             " ('op-wrongres',?,?, 'EFFECT_ABSENT_AUTHORIZED_TO_PROCEED','reconciler',"
                             " 'injected','{}',0)", (rid("op-wrongres"), "0" * 64))
            db.execute("INSERT INTO gates VALUES ('op-wrongres',?,?,'CLEARED_AUTHORIZED',NULL,?,0)",
                       (h["op-wrongres"], rid("op-wrongres"), cur.lastrowid))
            cur = db.execute("INSERT INTO resolutions (op_id, reservation_id, payload_sha256, outcome,"
                             " actor, credential_fingerprint, evidence, seq) VALUES"
                             " ('op-clientres',?,?, 'EFFECT_ABSENT_AUTHORIZED_TO_PROCEED','client',"
                             " 'injected','{}',0)", (rid("op-clientres"), h["op-clientres"]))
            db.execute("INSERT INTO gates VALUES ('op-clientres',?,?,'CLEARED_AUTHORIZED',NULL,?,0)",
                       (h["op-clientres"], rid("op-clientres"), cur.lastrowid))
            db.commit()
            db.close()
            self.injected_malformed.update({"op-bogus", "op-nobind", "op-nores", "op-wrongres",
                                            "op-clientres"})
            self.notes.append("op-bogus, op-nobind, op-nores, op-wrongres, op-clientres carry "
                              "directly injected malformed gate state; seal excludes them from the "
                              "cleared-gate check and asserts they have no effect.")
            self.start_writer()
            expect = {"op-miss": "GATE_MISSING", "op-bogus": "GATE_MALFORMED_STATE",
                      "op-nobind": "GATE_MALFORMED_BINDING",
                      "op-nores": "GATE_MALFORMED_CLEARED_WITHOUT_MATCHING_RESOLUTION",
                      "op-wrongres": "GATE_MALFORMED_CLEARED_WITHOUT_MATCHING_RESOLUTION",
                      "op-clientres": "GATE_MALFORMED_CLEARED_WITHOUT_MATCHING_RESOLUTION"}
            for op, reason in expect.items():
                self.refused(f"write_{op}", lambda op=op: self.write(op, rid(op), p[op]), reason)

            # Payload mismatch on a valid attempt gate, even with a valid attempt credential.
            self.ops_reaching_witness.add("op-mmp")
            reg = self.wreq(self.client_cred, op="register_attempt", op_id="op-mmp",
                            payload_sha256=h["op-mmp"])
            self.refused("write_op-mmp_other_payload", lambda: self.write(
                "op-mmp", rid("op-mmp"), b'{"marker":"other"}',
                attempt_credential=reg["attempt_credential"]), "GATE_MISMATCH_PAYLOAD")

            # Reservation-ID mismatch on an authorized gate: refused, permission not consumed.
            g = self.wreq(self.client_cred, op="mark_unresolved", op_id="op-mmr",
                          reservation_id=rid("op-mmr"), payload_sha256=h["op-mmr"])
            self.assertEqual(g["decision"], "GATE_OPENED")
            rc = self.observe("authorize_op-mmr",
                              self.reconcile("op-mmr", "EFFECT_ABSENT_AUTHORIZED_TO_PROCEED"))
            self.assertEqual(rc["gate_state"], "CLEARED_AUTHORIZED")
            self.refused("write_op-mmr_wrong_rid", lambda: self.write(
                "op-mmr", "R-99999999", p["op-mmr"]), "GATE_MISMATCH_RESERVATION")
            ok = self.observe("write_op-mmr_correct", self.write("op-mmr", rid("op-mmr"), p["op-mmr"]))
            self.assertEqual(ok["decision"], "WRITTEN")
            self.classify("write_op-mmr_correct_after_mismatch", "WRITTEN_ONCE_VIA_AUTHORIZED")
            effects = [e["op_id"] for e in self.snap()["effects"]]
            self.assertEqual(effects, ["op-mmr"])
            self.seal()
        self._guarded(body)

    def test_g3_authenticated_authority(self):
        def body():
            op, payload = "op-Au", b'{"marker":"Au","v":1}'
            self.start_witness()
            self.start_writer()
            self.open_gate(op, payload)
            AUTH = "EFFECT_ABSENT_AUTHORIZED_TO_PROCEED"
            self.refused("reconcile_wrong_credential",
                         lambda: self.reconcile(op, AUTH, cred=secrets.token_hex(32)),
                         "UNAUTHENTICATED")
            self.refused("reconcile_no_credential",
                         lambda: wc.call(self.gsock, {"op": "reconcile", "op_id": op,
                                                      "outcome": AUTH, "evidence": {}}),
                         "UNAUTHENTICATED")
            self.refused("reconcile_client_credential",
                         lambda: self.reconcile(op, AUTH, cred=self.client_cred),
                         "UNAUTHORIZED_FOR_RECONCILE")
            self.refused("reconcile_client_credential_claiming_reconciler",
                         lambda: self.reconcile(op, AUTH, cred=self.client_cred, actor="reconciler"),
                         "UNEXPECTED_FIELDS:actor")
            self.refused("reconcile_reconciler_credential_with_identity_field",
                         lambda: self.reconcile(op, AUTH, identity="reconciler"),
                         "UNEXPECTED_FIELDS:identity")
            self.refused("client_write_while_open",
                         lambda: self.write(op, wc.lookup(self.wsock, op)["reservation_id"], payload),
                         "GATE_OPEN")
            self.assertEqual(self.snap()["resolutions"], [])
            rp = self.gated(self.recon_cred, "reconcile", "--op-id", op, "--outcome", AUTH,
                            "--evidence", '{"basis":"harness reconciler process"}')
            res = self.observe("reconcile_reconciler_process", rp.wait_for("RECONCILE"))
            rp.finish()
            self.assertEqual((res["decision"], res["actor"]), ("RESOLVED", "reconciler"))
            row = self.snap()["resolutions"][0]
            self.assertEqual(row["actor"], "reconciler")
            self.assertEqual(row["credential_fingerprint"], wr.sha(self.recon_cred)[:16])
            self.classify("reconcile_reconciler_process", "RESOLVED_ACTOR_DERIVED_FROM_CREDENTIAL")
            self.seal()
        self._guarded(body)

    def test_g4_resolution_semantics(self):
        def body():
            self.start_witness()
            self.start_writer()
            AUTH = "EFFECT_ABSENT_AUTHORIZED_TO_PROCEED"

            # INDETERMINATE; and CONFIRMED refused without a matching effect.
            op, pl = "op-Ind", b'{"marker":"Ind"}'
            rid = self.open_gate(op, pl)["reservation_id"]
            self.refused("confirm_without_effect", lambda: self.reconcile(op, "EFFECT_CONFIRMED"),
                         "NO_MATCHING_EFFECT")
            ind = self.observe("indeterminate", self.reconcile(op, "INDETERMINATE"))
            self.assertEqual((ind["decision"], ind["gate_state"]), ("RESOLVED", "OPEN"))
            self.classify("indeterminate", "RESOLVED_INDETERMINATE_GATE_STAYS_OPEN")
            self.refused("write_after_indeterminate", lambda: self.write(op, rid, pl), "GATE_OPEN")

            # CONFIRMED: effect written, client killed before its local record.
            op, pl = "op-Conf", b'{"marker":"Conf"}'
            self.ops_reaching_witness.add(op)
            c = self.gated(self.client_cred, "run", "--op-id", op, "--payload-b64", b64(pl),
                           "--block-after-write")
            self.observe("conf_write", c.wait_for("WRITE"))
            c.wait_for("BLOCKED_AFTER_WRITE")
            self.observe("conf_client_sigkill_rc", c.sigkill())
            rec = self.gated(self.client_cred, "recover", "--op-id", op)
            r = self.observe("conf_recovery", rec.wait_for("RECOVERY"))
            rec.finish()
            self.assertEqual(r["classification"], "WITNESS_PERSISTED_LOCAL_EFFECT_UNRESOLVED")
            self.assertEqual(r["writer"], {"decision": "GATE_OPENED"})
            self.notes.append("op-Conf: the effect was written on the normal path before recovery "
                              "opened the gate (client killed after write, before its local "
                              "record). Between GATE_OPENED and EFFECT_CONFIRMED the store holds an "
                              "effect for an open gate; no effect was written while it was open.")
            rid = r["witness"]["reservation_id"]
            self.refused("authorize_with_existing_effect", lambda: self.reconcile(op, AUTH),
                         "EFFECT_EXISTS")
            cf = self.observe("confirm", self.reconcile(op, "EFFECT_CONFIRMED"))
            self.assertEqual(cf["gate_state"], "CLEARED_CONFIRMED")
            self.classify("confirm", "CLEARED_CONFIRMED")
            self.refused("write_after_confirm", lambda: self.write(op, rid, pl),
                         "CONFIRMED_EFFECT_NO_FURTHER_WRITE")

            # AUTHORIZED: at most one effect.
            op, pl = "op-Auth", b'{"marker":"Auth"}'
            rid = self.open_gate(op, pl)["reservation_id"]
            self.assertEqual(self.reconcile(op, AUTH)["gate_state"], "CLEARED_AUTHORIZED")
            w = self.observe("authorized_write", self.write(op, rid, pl))
            self.assertEqual((w["decision"], w["via"]), ("WRITTEN", "AUTHORIZED_RESOLUTION"))
            self.classify("authorized_write", "WRITTEN_ONCE_PERMISSION_CONSUMED")
            self.refused("second_authorized_write", lambda: self.write(op, rid, pl), "ALREADY_WRITTEN")

            # Revoked before reconciliation: authorization refused.
            op, pl = "op-Rev1", b'{"marker":"Rev1"}'
            self.open_gate(op, pl)
            self.observe("revoke_op-Rev1", wc.revoke(self.wsock, op))
            self.refused("authorize_revoked", lambda: self.reconcile(op, AUTH), "RESERVATION_REVOKED")

            # Revoked after authorization: write refused, permission not consumed.
            op, pl = "op-Rev2", b'{"marker":"Rev2"}'
            rid = self.open_gate(op, pl)["reservation_id"]
            self.assertEqual(self.reconcile(op, AUTH)["gate_state"], "CLEARED_AUTHORIZED")
            self.observe("revoke_op-Rev2", wc.revoke(self.wsock, op))
            self.refused("write_after_revocation", lambda: self.write(op, rid, pl),
                         "RESERVATION_REVOKED")
            self.assertEqual(self.gate(op)["state"], "CLEARED_AUTHORIZED")

            self.assertEqual(sorted(e["op_id"] for e in self.snap()["effects"]),
                             ["op-Auth", "op-Conf"])
            self.seal()
        self._guarded(body)

    def test_g5_sigkill_at_reconcile_commit_hooks(self):
        def body():
            AUTH = "EFFECT_ABSENT_AUTHORIZED_TO_PROCEED"
            self.start_witness()
            g = self.start_writer()
            ops = {"pre_reconcile_commit": ("op-Pre", b'{"marker":"Pre"}'),
                   "post_reconcile_commit": ("op-Post", b'{"marker":"Post"}')}
            rids = {op: self.open_gate(op, pl)["reservation_id"] for op, pl in ops.values()}
            for point, (op, pl) in ops.items():
                g.sigkill()
                g = self.start_writer("--hold-at", point)
                rp = self.gated(self.recon_cred, "reconcile", "--op-id", op, "--outcome", AUTH)
                hook = g.wait_for("HOOK")
                while hook["point"] != point:   # pre-commit HOOK precedes post-commit on every reconcile
                    self.observe(f"{point}_passed_hook", hook)
                    hook = g.wait_for("HOOK")
                self.observe(f"{point}_hook", hook)
                g.wait_for("HOLDING")
                self.observe(f"{point}_writer_sigkill_rc", g.sigkill())
                rp.wait_for("RESPONSE_LOST")
                rp.sigkill()
                g = self.start_writer()
                st = self.observe(f"{point}_state_after_restart",
                                  self.wreq(self.client_cred, op="state", op_id=op))
                res = [r for r in self.snap()["resolutions"] if r["op_id"] == op]
                if point == "pre_reconcile_commit":
                    self.assertEqual(st["gate"]["state"], "OPEN")
                    self.assertEqual(res, [])
                    self.classify(point, "GATE_OPEN_NO_RESOLUTION")
                    self.refused("write_after_pre_commit_crash",
                                 lambda: self.write(op, rids[op], pl), "GATE_OPEN")
                else:
                    self.assertEqual(st["gate"]["state"], "CLEARED_AUTHORIZED")
                    self.assertEqual(len(res), 1)
                    self.assertEqual((res[0]["id"], res[0]["actor"], res[0]["outcome"]),
                                     (st["gate"]["resolution_id"], "reconciler", AUTH))
                    self.classify(point, "CLEARED_WITH_COMPLETE_AUTHENTICATED_RESOLUTION")
                    w = self.observe("write_after_post_commit_crash", self.write(op, rids[op], pl))
                    self.assertEqual(w["decision"], "WRITTEN")
                    self.refused("second_write_after_post_commit_crash",
                                 lambda: self.write(op, rids[op], pl), "ALREADY_WRITTEN")
            self.seal()
        self._guarded(body)


if __name__ == "__main__":
    unittest.main()
