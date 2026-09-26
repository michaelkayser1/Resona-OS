"""Deterministic v0.1 wire format and Ed25519 operations."""
import base64
import hashlib
import json
import re
from datetime import datetime, timezone

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey

ACTION_FIELDS = frozenset(("action_class", "destination", "evidence_sha256", "marker",
                           "max_scope", "policy_sha256", "request_id", "target"))
APPROVAL_FIELDS = frozenset(("role", "actor_id", "key_id", "action_fingerprint", "signature"))
TOKEN_FIELDS = frozenset(("schema_version", "request_id", "action_fingerprint", "policy_sha256",
                          "evidence_sha256", "approvals_sha256", "witness_key_id", "nonce",
                          "not_before_utc", "expires_at_utc", "signature"))
ROLES = frozenset(("policy_owner", "domain_adjudicator", "external_validator"))
ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,128}$")
HEX_RE = re.compile(r"^[a-f0-9]{64}$")
UTC_RE = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$")


class Hold(ValueError):
    """A rejected request, with a stable reason code."""

    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


def parse_json(data: bytes):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise Hold("DUPLICATE_KEY")
            result[key] = value
        return result
    try:
        return json.loads(data, object_pairs_hook=unique,
                          parse_constant=lambda _: (_ for _ in ()).throw(Hold("INVALID_NUMBER")))
    except (UnicodeError, json.JSONDecodeError) as exc:
        raise Hold("INVALID_JSON") from exc


def canonical(value) -> bytes:
    def check(item):
        if isinstance(item, str):
            return
        if isinstance(item, list):
            for child in item:
                check(child)
            return
        if isinstance(item, dict):
            for key, child in item.items():
                if not isinstance(key, str) or not key.isascii():
                    raise Hold("INVALID_KEY")
                check(child)
            return
        raise Hold("NON_STRING_VALUE")
    check(value)
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def unb64(value: str) -> bytes:
    try:
        if not isinstance(value, str) or len(value) != 86 or not re.fullmatch(r"[A-Za-z0-9_-]{86}", value):
            raise ValueError()
        data = base64.urlsafe_b64decode(value + "==")
        if len(data) != 64 or b64(data) != value:
            raise ValueError()
        return data
    except (ValueError, base64.binascii.Error) as exc:
        raise Hold("INVALID_SIGNATURE_ENCODING") from exc


def exact(obj, fields):
    if not isinstance(obj, dict) or frozenset(obj) != fields:
        raise Hold("INVALID_FIELDS")


def validate_action(action):
    exact(action, ACTION_FIELDS)
    if not all(isinstance(v, str) for v in action.values()):
        raise Hold("INVALID_FIELDS")
    if (action["action_class"], action["destination"], action["target"], action["max_scope"]) != (
        "WRITE_MARKER_V1", "staging://markers", "test-marker-ledger", "one_marker"
    ):
        raise Hold("UNSUPPORTED_ACTION")
    if not all(ID_RE.fullmatch(action[k]) for k in ("marker", "request_id")):
        raise Hold("INVALID_ID")
    if not all(HEX_RE.fullmatch(action[k]) for k in ("policy_sha256", "evidence_sha256")):
        raise Hold("INVALID_HASH")


def fingerprint(action) -> str:
    validate_action(action)
    return sha(b"RESONA-ACTION-v0.1\n" + canonical(action))


def approval_payload(approval):
    exact(approval, APPROVAL_FIELDS)
    if approval["role"] not in ROLES or not all(
        isinstance(approval[k], str) and ID_RE.fullmatch(approval[k])
        for k in ("actor_id", "key_id")
    ) or not isinstance(approval["action_fingerprint"], str) or not HEX_RE.fullmatch(
        approval["action_fingerprint"]
    ):
        raise Hold("INVALID_APPROVAL")
    return {k: approval[k] for k in ("role", "actor_id", "key_id", "action_fingerprint")}


def sign_approval(fields, private: Ed25519PrivateKey) -> dict:
    payload = dict(fields)
    payload["signature"] = ""
    approval_payload(payload)
    payload["signature"] = b64(private.sign(b"RESONA-APPROVAL-v0.1\n" + canonical(fields)))
    return payload


def verify_sig(public: Ed25519PublicKey, signature: str, domain: bytes, obj):
    try:
        public.verify(unb64(signature), domain + canonical(obj))
    except Exception as exc:
        raise Hold("BAD_SIGNATURE") from exc


def approvals_hash(approvals) -> str:
    ordered = sorted(approvals, key=lambda a: (a["role"], a["actor_id"], a["key_id"]))
    return sha(canonical(ordered))


def utc(value: str) -> datetime:
    if not isinstance(value, str) or not UTC_RE.fullmatch(value):
        raise Hold("INVALID_UTC")
    try:
        return datetime.strptime(value, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    except ValueError as exc:
        raise Hold("INVALID_UTC") from exc


def iso(dt: datetime) -> str:
    if dt.tzinfo is None:
        raise Hold("INVALID_UTC")
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def token_payload(token):
    exact(token, TOKEN_FIELDS)
    if token["schema_version"] != "0.1":
        raise Hold("INVALID_VERSION")
    for key in ("request_id", "witness_key_id", "nonce"):
        if not isinstance(token[key], str) or not ID_RE.fullmatch(token[key]):
            raise Hold("INVALID_ID")
    for key in ("action_fingerprint", "policy_sha256", "evidence_sha256", "approvals_sha256"):
        if not isinstance(token[key], str) or not HEX_RE.fullmatch(token[key]):
            raise Hold("INVALID_HASH")
    for key in ("not_before_utc", "expires_at_utc"):
        utc(token[key])
    return {k: v for k, v in token.items() if k != "signature"}


def sign_token(fields, private: Ed25519PrivateKey) -> dict:
    token = {**fields, "signature": ""}
    payload = token_payload(token)
    token["signature"] = b64(private.sign(b"RESONA-WITNESS-v0.1\n" + canonical(payload)))
    return token
