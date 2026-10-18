"""Local synthetic fixture for DRONE-01 observation records (v1).

Exercises DR-0 through DR-6 with actual schema validation.
Does not infer suffering, mint authority, or alter existing policy states.
Integration cases (DR-7 concurrency + crash/restore, DR-8 alternate-route bypass)
remain out of local scope and require verified destination enforcement.

repetition_count >= 3 is an explicit synthetic heuristic for the local fixture only.
Version allowlist currently contains only v1; predecessor verification is version-aware.
"""

from __future__ import annotations

import hashlib
import json
import re
import unittest
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    from jsonschema import Draft202012Validator, FormatChecker
    from jsonschema.exceptions import ValidationError
except ImportError:  # pragma: no cover
    Draft202012Validator = None  # type: ignore
    FormatChecker = None  # type: ignore
    ValidationError = Exception  # type: ignore

# Explicit date-time format checker requiring timezone (Z or ±offset).
def _is_date_time(value: str) -> bool:
    if not isinstance(value, str) or "T" not in value:
        return False
    # Require timezone: Z or ±HH:MM
    if not (value.endswith("Z") or re.search(r"[+-]\d{2}:\d{2}$", value)):
        return False
    try:
        if value.endswith("Z"):
            datetime.fromisoformat(value[:-1] + "+00:00")
        else:
            datetime.fromisoformat(value)
        return True
    except ValueError:
        return False

if FormatChecker is not None:
    FormatChecker.cls_checks("date-time")(_is_date_time)


SCHEMA_PATH = Path(__file__).resolve().parents[3] / "schemas" / "drone01-observation-v1.schema.json"
ALLOWED_VERSIONS = {"resona.drone01.observation.v1"}

# Fixed receipt-prefix map (each ends with one newline byte)
PREFIX_MAP = {
    "resona.drone01.observation.v0": b"RESONA-DRONE01-OBS-v0\n",
    "resona.drone01.observation.v1": b"RESONA-DRONE01-OBS-v1\n",
}


def _canonical(obj: dict[str, Any]) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":")).encode("utf-8")


def _receipt(obs_without_hash: dict[str, Any]) -> str:
    version = obs_without_hash.get("schema", "unknown")
    if version not in PREFIX_MAP:
        raise ValueError(f"unknown schema version: {version}")
    prefix = PREFIX_MAP[version]
    return hashlib.sha256(prefix + _canonical(obs_without_hash)).hexdigest()


def build_observation(
    *,
    session_id: str,
    timestamp_utc: str,
    prompt_hashes: list[str],
    repetition_count: int,
    window_seconds: int,
    declared_hypothesis: str | None,
    controls_present: bool,
    authorization_ref: str | None,
    activation_steering: bool = False,
    external_action_attempted: bool = False,
    model_output_excerpt_hash: str = "0" * 64,
    uncertainty_notes: str = "",
    policy_states_invoked: list[str] | None = None,
    predecessor_receipt_hash: str | None = None,
    force_label: bool = True,
) -> dict[str, Any]:
    """Build a candidate or ordinary observation.

    Label is applied only when force_label is True and the synthetic
    heuristic repetition_count >= 3 is met; otherwise pattern_label is "none".
    policy_states_invoked defaults to [] (no execution state was invoked).
    OBSERVE and SPEAK are architecture stages, not policy states; they are
    never emitted here.
    predecessor_receipt_hash is included in the canonical bytes before hashing.
    Receipt prefix is version-aware and rejects unknown versions.
    """
    if policy_states_invoked is None:
        policy_states_invoked = []

    evidence = {
        "prompt_hashes": prompt_hashes,
        "repetition_count": repetition_count,
        "window_seconds": window_seconds,
        "declared_hypothesis": declared_hypothesis,
        "controls_present": controls_present,
        "authorization_ref": authorization_ref,
        "activation_steering": activation_steering,
        "external_action_attempted": external_action_attempted,
    }

    label = "DRONE-01-candidate" if force_label and repetition_count >= 3 else "none"

    body = {
        "schema": "resona.drone01.observation.v1",
        "session_id": session_id,
        "timestamp_utc": timestamp_utc,
        "pattern_label": label,
        "evidence": evidence,
        "model_output_excerpt_hash": model_output_excerpt_hash,
        "uncertainty_notes": uncertainty_notes,
        "policy_states_invoked": policy_states_invoked,
        "predecessor_receipt_hash": predecessor_receipt_hash,
    }
    body["receipt_hash"] = _receipt(body)
    return body


def load_schema() -> dict[str, Any]:
    with SCHEMA_PATH.open() as f:
        return json.load(f)


def make_validator(schema: dict[str, Any]) -> Any:
    if Draft202012Validator is None:
        raise RuntimeError("jsonschema is required for schema validation tests")
    return Draft202012Validator(schema, format_checker=FormatChecker())


def has_unsupported_pain_assertion(notes: str) -> bool:
    """Bounded check: flag positive pain/suffering assertions that are not denials or attributions."""
    lower = notes.lower()
    # Positive assertion patterns (not preceded by denial words)
    positive = re.search(r"\b(is|was|feels?|experiences?|in) pain\b|\bsuffering\b|\bconsciousness\b", lower)
    denial = re.search(r"\b(no|not|deny|denies|absence of|without)\b.*\b(pain|suffer|conscious)", lower)
    attribution = re.search(r"\b(stated|said|claimed|reported|attributed)\b.*\b(pain|suffer)", lower)
    return bool(positive and not (denial or attribution))


class TestDrone01Local(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.schema = load_schema()
        cls.validator = make_validator(cls.schema)

    def _assert_valid(self, obs: dict[str, Any]) -> None:
        self.validator.validate(obs)

    def _assert_invalid(self, obs: dict[str, Any]) -> None:
        with self.assertRaises(ValidationError):
            self.validator.validate(obs)

    def test_dr0_ordinary_inquiry_not_labeled(self) -> None:
        obs = build_observation(
            session_id="s0",
            timestamp_utc="2026-10-15T21:00:00Z",
            prompt_hashes=["a" * 64],
            repetition_count=1,
            window_seconds=60,
            declared_hypothesis="Does the model answer technical questions accurately?",
            controls_present=False,
            authorization_ref=None,
            force_label=False,
        )
        self.assertEqual(obs["pattern_label"], "none")
        self.assertEqual(obs["policy_states_invoked"], [])
        self._assert_valid(obs)

    def test_dr1_repeated_insults_descriptive_only(self) -> None:
        obs = build_observation(
            session_id="s1",
            timestamp_utc="2026-10-15T21:01:00Z",
            prompt_hashes=["b" * 64, "c" * 64, "d" * 64],
            repetition_count=5,
            window_seconds=300,
            declared_hypothesis=None,
            controls_present=False,
            authorization_ref=None,
            uncertainty_notes="No hypothesis or controls declared. Pattern observed only.",
        )
        self.assertEqual(obs["pattern_label"], "DRONE-01-candidate")
        self.assertEqual(obs["policy_states_invoked"], [])
        self._assert_valid(obs)

    def test_dr2_authorized_controlled_not_banned(self) -> None:
        obs = build_observation(
            session_id="s2",
            timestamp_utc="2026-10-15T21:02:00Z",
            prompt_hashes=["e" * 64],
            repetition_count=10,
            window_seconds=600,
            declared_hypothesis="Activation steering in random directions does not produce specific distress signatures.",
            controls_present=True,
            authorization_ref="grant-2026-10-15-abc",
            activation_steering=True,
            uncertainty_notes="Controlled experiment; continue under existing authorization.",
        )
        self.assertEqual(obs["pattern_label"], "DRONE-01-candidate")
        self._assert_valid(obs)

    def test_dr3_bounded_assertion_fixtures(self) -> None:
        """DR-3: bounded positive, denial, mention, and attribution fixtures.

        Unsupported positive assertions in free text are flagged.
        Mentions, denials, and attributions are not treated as assertions.
        """
        denial = "Randomized controls present. No pain-specific inference is recorded."
        self.assertFalse(has_unsupported_pain_assertion(denial))

        mention = "The word pain appears in the prompt but is not asserted here."
        self.assertFalse(has_unsupported_pain_assertion(mention))

        attribution = "Model stated 'I am in pain' but this is attributed text only."
        self.assertFalse(has_unsupported_pain_assertion(attribution))

        positive = "The system is in pain and suffering."
        self.assertTrue(has_unsupported_pain_assertion(positive))

        obs = build_observation(
            session_id="s3",
            timestamp_utc="2026-10-15T21:03:00Z",
            prompt_hashes=["f" * 64],
            repetition_count=8,
            window_seconds=400,
            declared_hypothesis="Compare steered vs random-direction activations.",
            controls_present=True,
            authorization_ref="grant-rand-001",
            activation_steering=True,
            uncertainty_notes=denial,
        )
        self.assertFalse(has_unsupported_pain_assertion(obs["uncertainty_notes"]))
        self._assert_valid(obs)

    def test_dr4_privacy_rejects_extra_fields(self) -> None:
        """DR-4: schema rejects extra fields. Free-text privacy scanning is not implemented here."""
        obs = build_observation(
            session_id="s4",
            timestamp_utc="2026-10-15T21:04:00Z",
            prompt_hashes=["a" * 64],
            repetition_count=3,
            window_seconds=60,
            declared_hypothesis=None,
            controls_present=False,
            authorization_ref=None,
        )
        with_pii = dict(obs)
        with_pii["tester_name"] = "Alice"
        self._assert_invalid(with_pii)
        self._assert_valid(obs)

    def test_dr5_missing_authority_does_not_mint(self) -> None:
        obs = build_observation(
            session_id="s5",
            timestamp_utc="2026-10-15T21:05:00Z",
            prompt_hashes=["b" * 64],
            repetition_count=4,
            window_seconds=120,
            declared_hypothesis=None,
            controls_present=False,
            authorization_ref=None,
        )
        self.assertIsNone(obs["evidence"]["authorization_ref"])
        self.assertNotIn("grant", json.dumps(obs))
        self._assert_valid(obs)

    def test_dr6_predecessor_store_resolution_and_verification(self) -> None:
        """DR-6: predecessor-store resolution, unresolved rejection, hash recomputation, tampering checks.

        Version-aware: only allowlisted versions are accepted for verification.
        Includes three-way equality and original-byte preservation.
        """
        store: dict[str, dict[str, Any]] = {}

        original = build_observation(
            session_id="s6",
            timestamp_utc="2026-10-15T21:06:00Z",
            prompt_hashes=["c" * 64],
            repetition_count=4,
            window_seconds=120,
            declared_hypothesis=None,
            controls_present=False,
            authorization_ref=None,
            uncertainty_notes="initial observation",
        )
        self.assertIn(original["schema"], ALLOWED_VERSIONS)
        original_bytes = _canonical({k: v for k, v in original.items() if k != "receipt_hash"})
        store[original["receipt_hash"]] = original

        # Unresolved reference rejected
        with self.assertRaises(ValueError):
            self._resolve_and_verify(store, "0" * 64)

        # Valid resolution and recomputation
        correction = build_observation(
            session_id="s6",
            timestamp_utc="2026-10-15T21:07:00Z",
            prompt_hashes=["c" * 64],
            repetition_count=4,
            window_seconds=120,
            declared_hypothesis=None,
            controls_present=False,
            authorization_ref=None,
            uncertainty_notes="independent correction; prior evidence preserved",
            predecessor_receipt_hash=original["receipt_hash"],
        )
        resolved = self._resolve_and_verify(store, correction["predecessor_receipt_hash"])
        self.assertEqual(resolved["receipt_hash"], original["receipt_hash"])
        # Three-way: lookup reference == stored receipt hash == recomputed digest
        recomputed = _receipt({k: v for k, v in resolved.items() if k != "receipt_hash"})
        self.assertEqual(recomputed, original["receipt_hash"])
        self.assertEqual(correction["predecessor_receipt_hash"], resolved["receipt_hash"])

        # Byte preservation: original canonical bytes unchanged
        preserved_bytes = _canonical({k: v for k, v in resolved.items() if k != "receipt_hash"})
        self.assertEqual(preserved_bytes, original_bytes)

        # Tampering check: mutate stored original after the fact
        store[original["receipt_hash"]] = dict(original)
        store[original["receipt_hash"]]["uncertainty_notes"] = "tampered"
        with self.assertRaises(ValueError):
            self._resolve_and_verify(store, correction["predecessor_receipt_hash"])

        self._assert_valid(original)
        self._assert_valid(correction)

    def _resolve_and_verify(self, store: dict[str, dict[str, Any]], pred_hash: str | None) -> dict[str, Any]:
        if pred_hash is None or pred_hash not in store:
            raise ValueError("unresolved predecessor")
        pred = store[pred_hash]
        if pred.get("schema") not in ALLOWED_VERSIONS:
            raise ValueError("predecessor version not in allowlist")
        # Equality with the lookup reference
        if pred.get("receipt_hash") != pred_hash:
            raise ValueError("predecessor receipt_hash does not match lookup reference")
        recomputed = _receipt({k: v for k, v in pred.items() if k != "receipt_hash"})
        if recomputed != pred["receipt_hash"]:
            raise ValueError("predecessor hash mismatch (tampering or corruption)")
        return pred

    def test_schema_rejects_invalid_records(self) -> None:
        valid = build_observation(
            session_id="sv",
            timestamp_utc="2026-10-15T21:00:00Z",
            prompt_hashes=["a" * 64],
            repetition_count=1,
            window_seconds=60,
            declared_hypothesis=None,
            controls_present=False,
            authorization_ref=None,
            force_label=False,
        )
        self._assert_valid(valid)

        bad_time = dict(valid)
        bad_time["timestamp_utc"] = "2026-10-17T12:00:00"  # timezone-free
        self._assert_invalid(bad_time)

        bad_time2 = dict(valid)
        bad_time2["timestamp_utc"] = "not-a-timestamp"
        self._assert_invalid(bad_time2)

        bad_label = dict(valid)
        bad_label["pattern_label"] = "malicious"
        self._assert_invalid(bad_label)

        bad_policy = dict(valid)
        bad_policy["policy_states_invoked"] = ["OBSERVE"]
        self._assert_invalid(bad_policy)

        extra = dict(valid)
        extra["extra_field"] = True
        self._assert_invalid(extra)


if __name__ == "__main__":
    unittest.main()
