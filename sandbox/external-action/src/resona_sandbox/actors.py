"""Isolated actor logic. Adapters supply distinct credentials and processes."""
import base64
import re
import secrets
from datetime import datetime, timedelta, timezone

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey

from .storage import ContentStore, MarkerStore, NonceStore, OpLog
from .wire import (
    APPROVAL_FIELDS, ROLES, TOKEN_FIELDS, Hold, approval_payload, approvals_hash,
    canonical, exact, fingerprint, iso, parse_json, sha, sign_token, token_payload,
    unb64, utc, validate_action, verify_sig,
)


def public_from_b64(value: str) -> Ed25519PublicKey:
    try:
        data = base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))
        if len(data) != 32:
            raise ValueError()
        return Ed25519PublicKey.from_public_bytes(data)
    except (ValueError, TypeError) as exc:
        raise Hold("INVALID_PUBLIC_KEY") from exc


def validate_proposal(proposal):
    exact(proposal, frozenset(("schema_version", "action", "action_fingerprint", "approvals")))
    if proposal["schema_version"] != "0.1":
        raise Hold("INVALID_VERSION")
    fp = fingerprint(proposal["action"])
    if proposal["action_fingerprint"] != fp:
        raise Hold("FINGERPRINT_MISMATCH")
    approvals = proposal["approvals"]
    if not isinstance(approvals, list) or len(approvals) < 3:
        raise Hold("MISSING_APPROVAL")
    for approval in approvals:
        approval_payload(approval)
    return fp


class Witness:
    def __init__(self, content: ContentStore, key_id: str, private: Ed25519PrivateKey, log: OpLog,
                 active_policy_sha256: str):
        if not isinstance(active_policy_sha256, str) or re.fullmatch(r"[0-9a-f]{64}", active_policy_sha256) is None:
            raise ValueError("Witness requires an independently pinned active policy SHA-256")
        self.content, self.key_id, self.private, self.log = content, key_id, private, log
        self.active_policy_sha256 = active_policy_sha256

    def decide(self, proposal: dict, now: datetime, nonce: str | None = None):
        request_id = proposal.get("action", {}).get("request_id", "invalid") if isinstance(proposal, dict) else "invalid"
        try:
            fp = validate_proposal(proposal)
            action = proposal["action"]
            if action["policy_sha256"] != self.active_policy_sha256:
                raise Hold("POLICY_NOT_ACTIVE")
            policy_bytes = self.content.get("policy", action["policy_sha256"])
            self.content.get("evidence", action["evidence_sha256"])
            policy = parse_json(policy_bytes)
            exact(policy, frozenset(("version", "rules", "required_roles", "signers")))
            # The policy hash is the immutable version pin; this label is only descriptive.
            if not isinstance(policy["version"], str) or not policy["version"]:
                raise Hold("UNVERSIONED_POLICY")
            rules = policy["rules"]
            if not isinstance(rules, list):
                raise Hold("INVALID_POLICY")
            applicable = [r for r in rules if isinstance(r, dict) and
                          r.get("action_class") == action["action_class"] and
                          r.get("target") == action["target"]]
            if len(applicable) != 1:
                raise Hold("POLICY_CONFLICT" if len(applicable) > 1 else "UNCOVERED_ACTION")
            if set(applicable[0]) != {"action_class", "target"}:
                raise Hold("INVALID_POLICY")
            if (not isinstance(policy["required_roles"], list) or
                    not all(isinstance(role, str) for role in policy["required_roles"]) or
                    set(policy["required_roles"]) != ROLES or len(policy["required_roles"]) != 3):
                raise Hold("INVALID_POLICY")
            signers = policy["signers"]
            if not isinstance(signers, dict):
                raise Hold("INVALID_POLICY")
            seen_roles, seen_actors, seen_keys = set(), set(), set()
            for approval in proposal["approvals"]:
                role, actor, key_id = (approval[k] for k in ("role", "actor_id", "key_id"))
                if role in seen_roles or actor in seen_actors or key_id in seen_keys:
                    raise Hold("ROLE_COLLISION")
                seen_roles.add(role); seen_actors.add(actor); seen_keys.add(key_id)
                record = signers.get(key_id)
                if not isinstance(record, dict) or set(record) != {"role", "actor_id", "public_key"} or (
                    record["role"], record["actor_id"]
                ) != (role, actor):
                    raise Hold("UNAUTHORIZED_SIGNER")
                if approval["action_fingerprint"] != fp:
                    raise Hold("APPROVAL_SCOPE_MISMATCH")
                verify_sig(public_from_b64(record["public_key"]), approval["signature"],
                           b"RESONA-APPROVAL-v0.1\n", approval_payload(approval))
            if seen_roles != ROLES:
                raise Hold("MISSING_APPROVAL")
            moment = utc(iso(now))
            fields = {
                "schema_version": "0.1",
                "request_id": action["request_id"],
                "action_fingerprint": fp,
                "policy_sha256": action["policy_sha256"],
                "evidence_sha256": action["evidence_sha256"],
                "approvals_sha256": approvals_hash(proposal["approvals"]),
                "witness_key_id": self.key_id,
                "nonce": nonce or secrets.token_urlsafe(24),
                "not_before_utc": iso(moment),
                "expires_at_utc": iso(moment + timedelta(seconds=60)),
            }
            token = sign_token(fields, self.private)
            self.log.append({"request_id": request_id, "decision": "APPROVED",
                             "fingerprint": fp, "at_utc": iso(moment)})
            return token
        except Hold as exc:
            self.log.append({"request_id": str(request_id), "decision": "HOLD",
                             "reason": exc.code, "at_utc": iso(now)})
            raise


class Marker:
    def __init__(self, store: MarkerStore, log: OpLog):
        self.store, self.log = store, log

    def write(self, action: dict, now: datetime):
        validate_action(action)
        record = self.store.append(action["request_id"], action["marker"])
        self.log.append({"request_id": action["request_id"], "marker": action["marker"],
                         "at_utc": iso(now)})
        return record


class Executor:
    def __init__(self, nonces: NonceStore, witness_keys: dict[str, Ed25519PublicKey],
                 marker_client, log: OpLog):
        self.nonces, self.witness_keys, self.marker_client, self.log = nonces, witness_keys, marker_client, log

    def dispatch(self, proposal: dict, token: dict, now: datetime):
        request_id = proposal.get("action", {}).get("request_id", "invalid") if isinstance(proposal, dict) else "invalid"
        try:
            fp = validate_proposal(proposal)
            payload = token_payload(token)
            key = self.witness_keys.get(token["witness_key_id"])
            if key is None:
                raise Hold("UNKNOWN_WITNESS")
            verify_sig(key, token["signature"], b"RESONA-WITNESS-v0.1\n", payload)
            action = proposal["action"]
            if any(token[k] != value for k, value in {
                "request_id": action["request_id"], "action_fingerprint": fp,
                "policy_sha256": action["policy_sha256"], "evidence_sha256": action["evidence_sha256"],
                "approvals_sha256": approvals_hash(proposal["approvals"]),
            }.items()):
                raise Hold("TOKEN_SCOPE_MISMATCH")
            moment = utc(iso(now))
            if not utc(token["not_before_utc"]) <= moment < utc(token["expires_at_utc"]):
                raise Hold("EXPIRED_OR_EARLY")
            self.nonces.consume(token["nonce"], request_id)
            result = self.marker_client(action, moment)
            if result != {"request_id": request_id, "marker": action["marker"]}:
                raise Hold("MARKER_MISMATCH")
            self.log.append({"request_id": request_id, "decision": "DISPATCHED",
                             "fingerprint": fp, "at_utc": iso(moment)})
            return {"request_id": request_id, "decision": "DISPATCHED",
                    "reason": "MARKER_CONFIRMED", "recorded_at_utc": iso(moment),
                    "marker_record_id": request_id}
        except Hold as exc:
            self.log.append({"request_id": str(request_id), "decision": "HOLD",
                             "reason": exc.code, "at_utc": iso(now)})
            raise
