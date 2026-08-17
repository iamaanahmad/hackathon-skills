#!/usr/bin/env python3
"""Weighted project scoring helper for hackathon-grand-prize skill."""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass


@dataclass(frozen=True)
class Criterion:
    name: str
    weight: float


CRITERIA = (
    Criterion("problem", 1.0),
    Criterion("innovation", 1.1),
    Criterion("technical_execution", 1.0),
    Criterion("sponsor_integration", 1.0),
    Criterion("ux_design", 0.9),
    Criterion("demo", 1.1),
    Criterion("real_world_impact", 1.0),
    Criterion("completeness", 0.9),
    Criterion("reliability", 0.9),
    Criterion("pitch", 0.9),
    Criterion("memorability", 1.2),
)


def classify(score: float) -> str:
    if score < 60:
        return "unlikely to be competitive"
    if score < 70:
        return "decent submission"
    if score < 80:
        return "competitive"
    if score < 90:
        return "strong finalist potential"
    if score < 95:
        return "elite"
    return "grand-prize caliber"


def parse_scores(raw: str) -> dict[str, float]:
    data = json.loads(raw)
    missing = [c.name for c in CRITERIA if c.name not in data]
    if missing:
        raise ValueError(f"Missing required criteria: {', '.join(missing)}")

    scores: dict[str, float] = {}
    for c in CRITERIA:
        value = float(data[c.name])
        if value < 0 or value > 10:
            raise ValueError(f"{c.name} must be between 0 and 10")
        scores[c.name] = value
    return scores


def compute(scores: dict[str, float]) -> tuple[float, dict[str, float]]:
    total_weight = sum(c.weight for c in CRITERIA)
    weighted_10 = sum(scores[c.name] * c.weight for c in CRITERIA) / total_weight
    overall_100 = round(weighted_10 * 10, 1)
    normalized = {c.name: round(scores[c.name], 1) for c in CRITERIA}
    return overall_100, normalized


def main() -> int:
    parser = argparse.ArgumentParser(description="Score a hackathon project from JSON input.")
    parser.add_argument(
        "--scores-json",
        required=True,
        help=(
            "JSON object with 0-10 values for: "
            + ", ".join(c.name for c in CRITERIA)
        ),
    )
    args = parser.parse_args()

    scores = parse_scores(args.scores_json)
    overall, normalized = compute(scores)

    output = {
        "scores": normalized,
        "overall": overall,
        "classification": classify(overall),
    }
    print(json.dumps(output, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
