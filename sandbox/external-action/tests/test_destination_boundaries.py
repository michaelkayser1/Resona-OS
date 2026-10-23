"""Final destination boundary regressions; synthetic UTC clock, local only."""
import threading
import sqlite3
import unittest
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from unittest.mock import patch

import test_engineering as engineering
from test_engineering import NOW
from resona_sandbox.actors import DestinationVerifier, Marker
from resona_sandbox.storage import MarkerStore
from resona_sandbox.storage import connect, check_local_filesystem_best_effort
from resona_sandbox.wire import Hold


class DestinationBoundaries(unittest.TestCase):
    def setUp(self):
        self.fixture = engineering.Engineering()
        self.fixture.setUp()
        self.addCleanup(self.fixture.doCleanups)
        self.time = NOW + timedelta(seconds=1)
        self.fixture.clock.value = self.time

    def paused(self, after, split=False):
        c = self.fixture
        p = c.proposal(request_id="boundary_probe")
        token = c.witness.decide(p, NOW, nonce="boundary-probe")
        marker = c.marker
        if split:
            MarkerStore.initialize(str(c.root / "other.sqlite"))
            marker = Marker(MarkerStore(str(c.root / "other.sqlite")), c.marker_log,
                            {"W1": c.witness_key.public_key()}, c.policy_hash, c.clock)
        entered, release = threading.Event(), threading.Event()
        def delayed(action, token, store_id):
            entered.set()
            if not release.wait(5):
                raise RuntimeError("release timeout")
            return marker.write(action, token, store_id)
        verifier = DestinationVerifier(c.revocations, {"W1": c.witness_key.public_key()},
                                       delayed, c.verifier_log, c.policy_hash, clock=c.clock)
        with ThreadPoolExecutor(max_workers=1) as pool:
            future = pool.submit(verifier.apply, p["action"], token)
            try:
                self.assertTrue(entered.wait(5))
                self.time = after
                c.clock.value = after
            finally:
                release.set()
            try:
                result = future.result(timeout=5)["decision"]
            except Hold as exc:
                result = exc.code
        return result, marker.store.all()

    def test_mismatched_destination_refuses_effect(self):
        result, markers = self.paused(NOW + timedelta(seconds=2), split=True)
        self.assertEqual(result, "STORE_ID_MISMATCH")
        self.assertEqual(markers, [])

    def test_paused_across_expiry_refuses_effect(self):
        result, markers = self.paused(NOW + timedelta(seconds=60))
        self.assertEqual(result, "EXPIRED_OR_EARLY")
        self.assertEqual(markers, [])

    def test_paused_clock_rollback_before_not_before_refuses_effect(self):
        # Initial verification is within the lease. Before final commitment,
        # the injected clock moves back below nbf. Ordinary early presentation
        # is already rejected at the first verifier check.
        result, markers = self.paused(NOW - timedelta(seconds=1))
        self.assertEqual(result, "EXPIRED_OR_EARLY")
        self.assertEqual(markers, [])

    def test_clock_sampled_after_waiting_for_writer_lock(self):
        c = self.fixture
        p = c.proposal(request_id="lock_wait")
        token = c.witness.decide(p, NOW, nonce="lock-wait")
        waiting = threading.Event()
        def traced_connect(path, **kwargs):
            db = connect(path, **kwargs)
            db.set_trace_callback(lambda sql: waiting.set() if sql == "BEGIN IMMEDIATE" else None)
            return db
        blocker = sqlite3.connect(c.marker_store.path, isolation_level=None)
        blocker.execute("BEGIN IMMEDIATE")
        try:
            with patch("resona_sandbox.storage.connect", traced_connect), ThreadPoolExecutor(max_workers=1) as pool:
                f = pool.submit(c.destination.apply, p["action"], token)
                try:
                    self.assertTrue(waiting.wait(5))
                    c.clock.value = NOW + timedelta(seconds=60)
                finally:
                    blocker.rollback()
                with self.assertRaisesRegex(Hold, "EXPIRED_OR_EARLY"):
                    f.result(timeout=5)
        finally:
            blocker.close()
        self.assertEqual(c.marker_store.all(), [])

    def test_exact_not_before_is_inclusive(self):
        c = self.fixture
        p = c.proposal(request_id="exact_nbf")
        token = c.witness.decide(p, NOW, nonce="exact-nbf")
        c.clock.value = NOW
        result = c.marker.write(p["action"], token, c.marker_store.store_id)
        self.assertEqual(result["request_id"], "exact_nbf")
        self.assertEqual(c.marker_store.all(), [("exact_nbf", "M1")])

    def test_identity_changed_after_startup_refuses_effect(self):
        c = self.fixture
        p = c.proposal()
        token = c.witness.decide(p, NOW)
        with sqlite3.connect(c.marker_store.path) as db:
            db.execute("UPDATE destination_metadata SET store_id='00000000-0000-0000-0000-000000000000'")
        with self.assertRaisesRegex(Hold, "STORE_ID_MISMATCH"):
            c.marker.write(p["action"], token, c.marker_store.store_id)
        with sqlite3.connect(c.marker_store.path) as db:
            self.assertEqual(db.execute("SELECT * FROM markers").fetchall(), [])

    def test_missing_metadata_refuses_startup_and_effect(self):
        c = self.fixture
        p = c.proposal()
        token = c.witness.decide(p, NOW)
        with sqlite3.connect(c.marker_store.path) as db:
            db.execute("DROP TABLE destination_metadata")
        with self.assertRaisesRegex(Hold, "STORE_ID_MISSING_OR_INVALID"):
            MarkerStore(c.marker_store.path)
        with self.assertRaisesRegex(Hold, "STORE_ID_MISSING_OR_INVALID"):
            c.marker.write(p["action"], token, c.marker_store.store_id)
        with sqlite3.connect(c.marker_store.path) as db:
            self.assertEqual(db.execute("SELECT * FROM markers").fetchall(), [])

    def test_database_replaced_after_startup_refuses_effect(self):
        c = self.fixture
        p = c.proposal()
        token = c.witness.decide(p, NOW)
        replacement = c.root / "replacement.sqlite"
        replacement_id = MarkerStore.initialize(str(replacement))
        self.assertNotEqual(replacement_id, c.marker_store.store_id)
        replacement.replace(c.marker_store.path)
        with self.assertRaisesRegex(Hold, "STORE_ID_MISMATCH"):
            c.marker.write(p["action"], token, c.marker_store.store_id)
        with sqlite3.connect(c.marker_store.path) as db:
            self.assertEqual(db.execute("SELECT * FROM markers").fetchall(), [])

    def test_missing_message_store_id_refuses_effect(self):
        c = self.fixture
        p = c.proposal()
        token = c.witness.decide(p, NOW)
        with self.assertRaisesRegex(Hold, "STORE_ID_MISMATCH"):
            c.marker.write(p["action"], token, None)
        self.assertEqual(c.marker_store.all(), [])

    def test_initializer_does_not_migrate_existing_database(self):
        c = self.fixture
        with self.assertRaises(FileExistsError):
            MarkerStore.initialize(c.marker_store.path)
        self.assertEqual(c.marker_store.identity(), c.marker_store.store_id)

    def test_known_network_mount_is_rejected_best_effort(self):
        mounts = "1 0 0:1 / / rw - nfs4 server:/share rw\n"
        with patch("pathlib.Path.read_text", return_value=mounts):
            with self.assertRaisesRegex(Hold, "NETWORK_FILESYSTEM_UNSUPPORTED"):
                check_local_filesystem_best_effort(str(self.fixture.root))
