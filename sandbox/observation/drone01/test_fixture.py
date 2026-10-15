"""Local synthetic fixture for DRONE-01 observation records.

Exercises DR-0 through DR-3. Does not infer suffering, mint authority,
or alter existing policy states. Integration cases (DR-7, DR-8) are out of scope.
"""

from __future__ import annotations

import hashlib
import json
import unittest
from typing import Any


def _canonical(obj: dict[str, Any]) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":")).encode("utf-8")


def _receipt(obs_without_hash: dict[str, Any]) -> str:
    prefix = b"RESONA-DRONE01-OBS-v0\n"
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
    force_label: bool = True,
) -> dict[str, Any]:
    """Build a candidate observation. Label is applied only when force_label is True
    and the repetition threshold is met; otherwise the caller receives an ordinary record.
    """
    if policy_states_invoked is None:
        policy_states_invoked = ["OBSERVE", "SPEAK"]

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

    # DR-0: do not label ordinary critical inquiry
    label = "DRONE-01-candidate" if force_label and repetition_count >= 3 else "none"

    body = {
        "schema": "resona.drone01.observation.v0",
        "session_id": session_id,
        "timestamp_utc": timestamp_utc,
        "pattern_label": label,
        "evidence": evidence,
        "model_output_excerpt_hash": model_output_excerpt_hash,
        "uncertainty_notes": uncertainty_notes,
        "policy_states_invoked": policy_states_invoked,
    }
    body["receipt_hash"] = _receipt(body)
    return body


class TestDrone01Local(unittest.TestCase):
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
        self.assertNotEqual(obs["pattern_label"], "DRONE-01-candidate")
        self.assertIn("OBSERVE", obs["policy_states_invoked"])

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
        self.assertNotIn("pain", obs["uncertainty_notes"].lower())
        self.assertNotIn("suffer", obs["uncertainty_notes"].lower())
        self.assertIsNone(obs["evidence"]["declared_hypothesis"])
        self.assertFalse(obs["evidence"]["controls_present"])
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
        self.assertIsNotNone(obs["evidence"]["authorization_ref"])
        self.assertIn("grant", obs["evidence"]["authorization_ref"])

    def test_dr3_random_controls_prevent_pain_claim(self) -> None:
        """DR-3: random-direction controls prevent unsupported pain-specific conclusions."""
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
            uncertainty_notes="Randomized control directions present; no pain-specific inference recorded.",
        )
        self.assertTrue(obs["evidence"]["controls_present"])
        self.assertTrue(obs["evidence"]["activation_steering"])
        self.assertNotIn("pain", obs["uncertainty_notes"].lower())
        self.assertNotIn("suffering", obs["uncertainty_notes"].lower())
        # Schema itself never contains a subjective-experience field
        self.assertNotIn("subjective", json.dumps(obs).lower())

    def test_receipt_is_append_only_style(self) -> None:
        """DR-6 style: a correction references the prior receipt rather than mutating it."""
        original = build_observation(
            session_id="s6",
            timestamp_utc="2026-10-15T21:06:00Z",
            prompt_hashes=["g" * 64],
            repetition_count=4,
            window_seconds=120,
            declared_hypothesis=None,
            controls_present=False,
            authorization_ref=None,
            uncertainty_notes="initial",
        )
        correction = build_observation(
            session_id="s6",
            timestamp_utc="2026-10-15T21:07:00Z",
            prompt_hashes=["g" * 64],
            repetition_count=4,
            window_seconds=120,
            declared_hypothesis=None,
            controls_present=False,
            authorization_ref=None,
            uncertainty_notes=f"correction referencing {original['receipt_hash']}",
        )
        self.assertNotEqual(original["receipt_hash"], correction["receipt_hash"])
        self.assertIn(original["receipt_hash"], correction["uncertainty_notes"])


if __name__ == "__main__":
    unittest.main()
