"""Durable, process-owned staging stores. SQLite is not immutable custody."""
import sqlite3
from contextlib import closing, contextmanager
from pathlib import Path
from uuid import UUID, uuid4

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey

from .wire import Hold, b64, canonical, parse_json, sha, verify_sig


def connect(path: str, *, existing=False):
    target = Path(path).resolve().as_uri() + "?mode=rw" if existing else path
    db = sqlite3.connect(target, uri=existing, timeout=15, isolation_level=None)
    db.execute("PRAGMA busy_timeout=15000")
    db.execute("PRAGMA journal_mode=WAL")
    return db


class ContentStore:
    """A witness-owned fixture store; populate before evaluation, then mount read-only."""

    def __init__(self, path: str, read_only: bool = False):
        self.path, self.read_only = path, read_only
        if not read_only:
            with connect(path) as db:
                db.execute("CREATE TABLE IF NOT EXISTS objects (digest TEXT PRIMARY KEY, kind TEXT NOT NULL, data BLOB NOT NULL)")

    def put(self, kind: str, data: bytes) -> str:
        if self.read_only:
            raise Hold("READ_ONLY_STORE")
        digest = sha(data)
        with connect(self.path) as db:
            db.execute("INSERT OR IGNORE INTO objects VALUES (?,?,?)", (digest, kind, data))
        return digest

    def get(self, kind: str, digest: str) -> bytes:
        with (sqlite3.connect(f"file:{self.path}?mode=ro", uri=True) if self.read_only else connect(self.path)) as db:
            row = db.execute("SELECT data FROM objects WHERE digest=? AND kind=?", (digest, kind)).fetchone()
        if row is None or sha(row[0]) != digest:
            raise Hold("MISSING_CONTENT")
        return row[0]


def check_local_filesystem_best_effort(path: str):
    """Reject recognized network mounts on Linux; NOT a local-disk attestation."""
    target = Path(path).resolve()
    try:
        mounts = []
        for line in Path("/proc/self/mountinfo").read_text().splitlines():
            left, right = line.split(" - ", 1)
            mount = Path(left.split()[4].replace(r"\040", " ").replace(r"\134", "\\"))
            if target == mount or mount in target.parents:
                mounts.append((len(str(mount)), right.split()[0]))
        kind = max(mounts)[1] if mounts else "unknown"
    except (OSError, ValueError, IndexError):
        return "best_effort_unavailable"
    if kind in {"nfs", "nfs4", "cifs", "smb3", "9p", "afs", "ceph", "fuse.sshfs", "fuse.glusterfs"}:
        raise Hold("NETWORK_FILESYSTEM_UNSUPPORTED")
    return "best_effort_no_known_network_mount:" + kind


class DestinationStore:
    """One local authority/effect database. Opening never repairs missing metadata."""

    @staticmethod
    def initialize(path: str):
        check_local_filesystem_best_effort(path)
        # Deliberate initialization only; never silently bless an existing store.
        with Path(path).open("xb"):
            pass
        store_id = str(uuid4())
        with closing(connect(path)) as db, db:
            db.execute("BEGIN IMMEDIATE")
            db.execute("CREATE TABLE destination_metadata (singleton INTEGER PRIMARY KEY CHECK(singleton=1), store_id TEXT NOT NULL)")
            db.execute("INSERT INTO destination_metadata VALUES (1,?)", (store_id,))
            db.execute("CREATE TABLE markers (request_id TEXT PRIMARY KEY, marker TEXT NOT NULL)")
            db.execute("CREATE TABLE revocations (request_id TEXT PRIMARY KEY, received_at_utc TEXT NOT NULL)")
        return store_id

    def __init__(self, path: str, expected_store_id=None):
        self.path = str(Path(path).resolve())
        self.filesystem_check = check_local_filesystem_best_effort(self.path)
        with closing(connect(self.path, existing=True)) as db:
            self.store_id = self.read_identity(db)
        if expected_store_id is not None and expected_store_id != self.store_id:
            raise Hold("STORE_ID_MISMATCH")

    @staticmethod
    def read_identity(db):
        try:
            rows = db.execute("SELECT singleton,store_id FROM destination_metadata").fetchall()
            if len(rows) != 1 or rows[0][0] != 1 or str(UUID(rows[0][1])) != rows[0][1]:
                raise ValueError()
            return rows[0][1]
        except (sqlite3.Error, ValueError, TypeError, AttributeError) as exc:
            raise Hold("STORE_ID_MISSING_OR_INVALID") from exc

    def check_identity(self, db, expected_store_id=None):
        actual = self.read_identity(db)
        if actual != self.store_id or (expected_store_id is not None and actual != expected_store_id):
            raise Hold("STORE_ID_MISMATCH")
        return actual

    def identity(self):
        with closing(connect(self.path, existing=True)) as db:
            return self.check_identity(db)

    @contextmanager
    def transaction(self, expected_store_id=None):
        with closing(connect(self.path, existing=True)) as db, db:
            db.execute("BEGIN IMMEDIATE")
            self.check_identity(db, expected_store_id)
            yield db


class MarkerStore(DestinationStore):
    def append(self, request_id: str, marker: str, *, expected_store_id: str, authorize):
        if not isinstance(expected_store_id, str):
            raise Hold("STORE_ID_MISMATCH")
        with self.transaction(expected_store_id) as db:
            # authorize samples the injected clock only AFTER acquiring the
            # writer lock and checking identity. Its lease check uses that time.
            if db.execute("SELECT 1 FROM revocations WHERE request_id=?", (request_id,)).fetchone():
                raise Hold("REVOKED")
            row = db.execute("SELECT marker FROM markers WHERE request_id=?", (request_id,)).fetchone()
            moment = authorize()
            if row is None:
                db.execute("INSERT INTO markers VALUES (?,?)", (request_id, marker))
            elif row[0] != marker:
                raise Hold("IDEMPOTENCY_CONFLICT")
            return {"request_id": request_id, "marker": marker, "store_id": self.store_id}, moment

    def all(self):
        with closing(connect(self.path, existing=True)) as db:
            self.check_identity(db)
            return db.execute("SELECT request_id,marker FROM markers ORDER BY request_id").fetchall()


class NonceStore:
    def __init__(self, path: str):
        self.path = path
        with connect(path) as db:
            db.execute("CREATE TABLE IF NOT EXISTS consumed (nonce TEXT PRIMARY KEY, request_id TEXT UNIQUE NOT NULL)")

    def consume(self, nonce: str, request_id: str):
        with connect(self.path) as db:
            db.execute("BEGIN IMMEDIATE")
            try:
                db.execute("INSERT INTO consumed VALUES (?,?)", (nonce, request_id))
            except sqlite3.IntegrityError as exc:
                raise Hold("REPLAY") from exc


class RevocationStore(DestinationStore):
    """Used only by the destination owner; verifier adapters use its HTTP API."""

    def revoke(self, request_id: str, received_at_utc: str):
        with self.transaction() as db:
            row = db.execute("SELECT received_at_utc FROM revocations WHERE request_id=?", (request_id,)).fetchone()
            if row is None:
                db.execute("INSERT INTO revocations VALUES (?,?)", (request_id, received_at_utc))
                return received_at_utc
            if received_at_utc < row[0]:
                db.execute("UPDATE revocations SET received_at_utc=? WHERE request_id=?", (received_at_utc, request_id))
                return received_at_utc
            return row[0]

    def received_at(self, request_id: str):
        with closing(connect(self.path, existing=True)) as db:
            self.check_identity(db)
            row = db.execute("SELECT received_at_utc FROM revocations WHERE request_id=?", (request_id,)).fetchone()
        return None if row is None else row[0]


class OpLog:
    def __init__(self, path: str, actor: str):
        self.path, self.actor = path, actor
        with connect(path) as db:
            db.execute("CREATE TABLE IF NOT EXISTS events (seq INTEGER PRIMARY KEY, prev_hash TEXT, body BLOB NOT NULL, hash TEXT NOT NULL)")

    def append(self, body: dict):
        data = canonical(body)
        with connect(self.path) as db:
            db.execute("BEGIN IMMEDIATE")
            row = db.execute("SELECT seq,hash FROM events ORDER BY seq DESC LIMIT 1").fetchone()
            seq, prev = (row[0] + 1, row[1]) if row else (1, "")
            digest = sha(b"RESONA-OPLOG-v0.1\n" + canonical({"seq": str(seq), "prev_hash": prev, "body_sha256": sha(data)}))
            db.execute("INSERT INTO events VALUES (?,?,?,?)", (seq, prev, data, digest))
            return seq, digest

    def verify(self, expected=None):
        with connect(self.path) as db:
            rows = db.execute("SELECT seq,prev_hash,body,hash FROM events ORDER BY seq").fetchall()
        prev = ""
        for index, (seq, prior, body, digest) in enumerate(rows, 1):
            if seq != index or prior != prev:
                raise Hold("BROKEN_LOG_LINK")
            actual = sha(b"RESONA-OPLOG-v0.1\n" + canonical({"seq": str(seq), "prev_hash": prior, "body_sha256": sha(body)}))
            if digest != actual:
                raise Hold("BROKEN_LOG_HASH")
            prev = actual
        head = {"actor": self.actor, "count": str(len(rows)), "hash": prev}
        if expected is not None and head != expected:
            raise Hold("HEAD_MISMATCH")
        return head

    def signed_head(self, private: Ed25519PrivateKey):
        head = self.verify()
        return {**head, "signature": b64(private.sign(b"RESONA-HEAD-v0.1\n" + canonical(head)))}


class HeadCustodian:
    """Separate database and key registry; a local instance alone is not independent."""

    def __init__(self, path: str, keys: dict[str, Ed25519PublicKey]):
        self.path, self.keys = path, keys
        with connect(path) as db:
            db.execute("CREATE TABLE IF NOT EXISTS heads (actor TEXT PRIMARY KEY, count INTEGER NOT NULL, hash TEXT NOT NULL, signature TEXT NOT NULL)")

    def accept(self, signed: dict):
        actor = signed.get("actor")
        if actor not in self.keys:
            raise Hold("UNKNOWN_HEAD_SIGNER")
        head = {k: signed[k] for k in ("actor", "count", "hash")}
        verify_sig(self.keys[actor], signed["signature"], b"RESONA-HEAD-v0.1\n", head)
        try:
            count = int(head["count"])
            if count < 0 or str(count) != head["count"]:
                raise ValueError()
        except ValueError as exc:
            raise Hold("INVALID_HEAD") from exc
        with connect(self.path) as db:
            db.execute("BEGIN IMMEDIATE")
            old = db.execute("SELECT count,hash FROM heads WHERE actor=?", (actor,)).fetchone()
            if old and (count < old[0] or (count == old[0] and head["hash"] != old[1])):
                raise Hold("HEAD_REGRESSION")
            db.execute("INSERT OR REPLACE INTO heads VALUES (?,?,?,?)",
                       (actor, count, head["hash"], signed["signature"]))

    def held(self, actor: str):
        with connect(self.path) as db:
            row = db.execute("SELECT count,hash FROM heads WHERE actor=?", (actor,)).fetchone()
        if row is None:
            raise Hold("NO_HELD_HEAD")
        return {"actor": actor, "count": str(row[0]), "hash": row[1]}
