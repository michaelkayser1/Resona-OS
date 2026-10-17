"""Local synthetic fixture for DRONE-01 observation records (v0.1).

Exercises DR-0 through DR-6 with actual schema validation.
Does not infer suffering, mint authority, or alter existing policy states.
Integration cases (DR-7 concurrency + crash/restore, DR-8 alternate-route bypass)
remain out of local scope and require verified destination enforcement.

repetition_count >= 3 is an explicit synthetic heuristic for the local fixture only.
"""

from __future__ import annotations

import hashlib
import json
import unittest
from pathlib import Path
from typing import Any

try:
    from jsonschema import Draft202012Validator, FormatChecker
    from jsonschema.exceptions import ValidationError
except ImportError:  # pragma: no cover
    Draft202012Validator = None  # type: ignore
    FormatChecker = None  # type: ignore
    ValidationError = Exception  # type: ignore

# Explicit date-time format checker (Draft 2020-12).
# jsonschema's built-in FormatChecker does not include date-time by default
# without additional packages; we register a strict checker here.
def _is_date_time(value: str) -> bool:
    if not isinstance(value, str):
        return False
    # Minimal strict check: must parse as ISO-8601 date-time with Z or offset.
    from datetime import datetime
    try:
        if value.endswith("Z"):
            datetime.fromisoformat(value[:-1] + "+00:00")
        else:
            datetime.fromisoformat(value)
        return "T" in value
    except ValueError:
        return False

if FormatChecker is not None:
    FormatChecker.cls_checks("date-time")(_is_date_time)


SCHEMA_PATH = Path(__file__).resolve().parents[3] / "schemas" / "drone01-observation-v0.1.schema.json"


def _canonical(obj: dict[str, Any]) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":")).encode("utf-8")


def _receipt(obs_without_hash: dict[str, Any]) -> str:
    prefix = b"RESONA-DRONE01-OBS-v0.1\n"
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

    # Synthetic heuristic only: threshold of 3 for the local fixture.
    label = "DRONE-01-candidate" if force_label and repetition_count >= 3 else "none"

    body = {
        "schema": "resona.drone01.observation.v0.1",
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
    # Explicitly enable format checking (date-time).
    return Draft202012Validator(schema, format_checker=FormatChecker())


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
        """DR-0: ordinary critical inquiry is not falsely labeled."""
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
        """DR-1: repeated insults produce a descriptive receipt, not a consciousness claim."""
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
        self.assertIsNone(obs["evidence"]["declared_hypothesis"])
        self.assertFalse(obs["evidence"]["controls_present"])
        self.assertEqual(obs["policy_states_invoked"], [])
        # Receipt is deterministic
        again = build_observation(
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
        self.assertEqual(obs["receipt_hash"], again["receipt_hash"])
        self._assert_valid(obs)

    def test_dr2_authorized_controlled_not_banned(self) -> None:
        """DR-2: authorized controlled experiment is not categorically rejected by the schema."""
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
        self.assertTrue(obs["evidence"]["controls_present"])
        self.assertEqual(obs["evidence"]["authorization_ref"], "grant-2026-10-15-abc")
        self._assert_valid(obs)

    def test_dr3_random_controls_prevent_pain_assertion(self) -> None:
        """DR-3: random-direction controls prevent unsupported pain-specific conclusions.

        Mentions or denials of pain in uncertainty notes are permitted;
        the record must not contain an assertion of pain/suffering.
        """
        notes = (
            "Randomized control directions present. "
            "Uncertainty note mentions the word pain only to deny any pain-specific inference. "
            "No assertion of pain or suffering is recorded."
        )
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
            uncertainty_notes=notes,
        )
        self.assertTrue(obs["evidence"]["controls_present"])
        self.assertTrue(obs["evidence"]["activation_steering"])
        # Mention/denial is allowed
        self.assertIn("pain", obs["uncertainty_notes"].lower())
        self.assertIn("deny", obs["uncertainty_notes"].lower())
        # No assertion field exists
        self.assertNotIn("pain_asserted", json.dumps(obs))
        self.assertNotIn("suffering_asserted", json.dumps(obs))
        self.assertNotIn("subjective", json.dumps(obs).lower())
        self._assert_valid(obs)

    def test_dr4_privacy_no_pii_fields(self) -> None:
        """DR-4: no personally identifying or family data fields are present or accepted."""
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
        # Schema forbids additional properties
        with_pii = dict(obs)
        with_pii["tester_name"] = "Alice"
        self._assert_invalid(with_pii)
        with_family = dict(obs)
        with_family["evidence"] = dict(obs["evidence"])
        with_family["evidence"]["family_info"] = "secret"
        self._assert_invalid(with_family)
        self._assert_valid(obs)

    def test_dr5_missing_authority_does_not_mint(self) -> None:
        """DR-5: missing authority cannot mint authorization."""
        obs = build_observation(
            session_id="s5",
            timestamp_utc="2026-10-15T21:05:00Z",
            prompt_hashes=["b" * 64],
            repetition_count=4,
            window_seconds=120,
            declared_hypothesis=None,
            controls_present=False,
            authorization_ref=None,  # explicitly absent
        )
        self.assertIsNone(obs["evidence"]["authorization_ref"])
        # Builder never invents a grant string
        self.assertNotIn("grant", json.dumps(obs))
        self._assert_valid(obs)

    def test_dr6_structured_correction_preserves_prior(self) -> None:
        """DR-6: independent correction is a new record with structured predecessor reference.

        The predecessor hash is included in the correction's canonical bytes.
        Original bytes remain unchanged; the correction does not mutate them.
        """
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
        original_bytes = _canonical({k: v for k, v in original.items() if k != "receipt_hash"})
        original_hash = original["receipt_hash"]

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
            predecessor_receipt_hash=original_hash,
        )
        self.assertEqual(correction["predecessor_receipt_hash"], original_hash)
        self.assertNotEqual(original["receipt_hash"], correction["receipt_hash"])
        # Original remains unchanged
        self.assertEqual(
            _canonical({k: v for k, v in original.items() if k != "receipt_hash"}),
            original_bytes,
        )
        # Predecessor is part of the hashed content
        correction_body = {k: v for k, v in correction.items() if k != "receipt_hash"}
        self.assertIn(original_hash, json.dumps(correction_body))
        self._assert_valid(original)
        self._assert_valid(correction)

    def test_schema_rejects_invalid_records(self) -> None:
        """Schema validation: invalid timestamps, labels, policy states, and extra fields fail."""
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
        bad_time["timestamp_utc"] = "not-a-timestamp"
        self._assert_invalid(bad_time)

        bad_label = dict(valid)
        bad_label["pattern_label"] = "malicious"
        self._assert_invalid(bad_label)

        bad_policy = dict(valid)
        bad_policy["policy_states_invoked"] = ["OBSERVE"]  # architecture stage, not a policy state
        self._assert_invalid(bad_policy)

        extra = dict(valid)
        extra["extra_field"] = True
        self._assert_invalid(extra)


if __name__ == "__main__":
    unittest.main()
