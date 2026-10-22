"""Execute the RS-1 suite against a committed revision and retain the evidence bundle.

Usage (from sandbox/reservation-slice):  python3 run_slice.py
Refuses to run on a dirty tree, so the bundle names the exact code that ran.
Failures are retained exactly like passes.
"""
import datetime
import hashlib
import json
import os
import platform
import sqlite3
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
TEST_CMD = [sys.executable, "-m", "unittest", "discover", "-s", "tests", "-v"]


def git(*args):
    return subprocess.run(["git", *args], cwd=HERE, capture_output=True, text=True,
                          check=True).stdout.strip()


def main():
    # RS-2 H3: the whole repository working tree must be clean, not only this directory.
    dirty = git("status", "--porcelain", "--untracked-files=all", "--", ":/")
    if dirty:
        sys.exit(f"refusing to run: repository working tree is not clean:\n{dirty}")
    commit = git("rev-parse", "HEAD")
    started = datetime.datetime.now(datetime.timezone.utc)
    run_id = started.strftime("%Y%m%dT%H%M%SZ") + "-" + commit[:12]
    out = HERE / "evidence" / run_id
    cases = out / "cases"
    cases.mkdir(parents=True)

    env = {**os.environ, "RS_EVIDENCE_DIR": str(cases), "PYTHONDONTWRITEBYTECODE": "1"}
    proc = subprocess.run(TEST_CMD, cwd=HERE, env=env, capture_output=True, text=True)
    finished = datetime.datetime.now(datetime.timezone.utc)
    (out / "unittest.stdout.txt").write_text(proc.stdout)
    (out / "unittest.stderr.txt").write_text(proc.stderr)

    per_case = {}
    for f in sorted(cases.glob("*.json")):
        rec = json.loads(f.read_text())
        wr = rec.get("witness_records", {})
        per_case[f.stem] = {
            "status": rec["status"],
            "classifications": rec.get("classifications", []),
            "reservation_count": wr.get("reservation_count"),
            "writer_counts": ({k: len(rec["writer_records"][k]) for k in
                               ("gates", "resolutions", "effects")}
                              if "writer_records" in rec else None),
            "invariant_checks": rec.get("invariant_checks"),
            "reservations_per_op_id": wr.get("reservations_per_op_id"),
            "reserved_events_per_op_id": wr.get("reserved_events_per_op_id"),
            "distinct_op_ids_reaching_witness": rec.get("distinct_op_ids_reaching_witness"),
        }

    manifest = {
        "evidence_class": "local engineering evidence: RS-1 reservation protocol and RS-2 "
                          "recovery-gate enforcement under the tested conditions; not an "
                          "acceptance run; Gate A and Gate B unchanged",
        "commit": commit,
        "branch": git("rev-parse", "--abbrev-ref", "HEAD"),
        "expectations_blob_sha1": {"EXPECTATIONS.md": git("hash-object", "EXPECTATIONS.md"),
                                   "EXPECTATIONS-RS2.md": git("hash-object", "EXPECTATIONS-RS2.md")},
        "cleanliness_scope": "whole repository (git status --porcelain --untracked-files=all -- :/)",
        "started_utc": started.isoformat(),
        "finished_utc": finished.isoformat(),
        "commands": {"runner": f"cd sandbox/reservation-slice && python3 run_slice.py",
                     "suite": " ".join(["python3", *TEST_CMD[1:]]),
                     "suite_env": {"RS_EVIDENCE_DIR": "evidence/<run_id>/cases",
                                   "PYTHONDONTWRITEBYTECODE": "1"}},
        "environment": {"python": sys.version, "sqlite": sqlite3.sqlite_version,
                        "platform": platform.platform(), "machine": platform.machine(),
                        "kernel": platform.release()},
        "unittest_returncode": proc.returncode,
        "per_case": per_case,
        "cases_recorded": len(per_case),
        "note": "StoreGuards is a direct-SQL schema check and writes no case file; its result is "
                "in unittest.stdout.txt / unittest.stderr.txt.",
    }
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n")
    sums = {str(p.relative_to(out)): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(out.rglob("*")) if p.is_file()}
    (out / "SHA256SUMS.json").write_text(json.dumps(sums, indent=2, sort_keys=True) + "\n")
    print(json.dumps({"run_id": run_id, "commit": commit, "returncode": proc.returncode,
                      "per_case_status": {k: v["status"] for k, v in per_case.items()}}, indent=2))
    sys.exit(proc.returncode)


if __name__ == "__main__":
    main()
