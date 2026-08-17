#!/usr/bin/env python3
"""Validate required submission sections in a markdown file."""

from __future__ import annotations

import argparse
from pathlib import Path

REQUIRED_PHRASES = (
    "project title",
    "tagline",
    "problem",
    "solution",
    "innovation",
    "architecture",
    "sponsor",
    "setup",
    "demo",
    "impact",
)


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate hackathon submission markdown.")
    parser.add_argument("--file", required=True, help="Path to README/submission markdown file")
    args = parser.parse_args()

    content = Path(args.file).read_text(encoding="utf-8").lower()

    missing = [phrase for phrase in REQUIRED_PHRASES if phrase not in content]
    if missing:
        print("Submission validation failed. Missing phrases:")
        for phrase in missing:
            print(f"- {phrase}")
        return 1

    print("Submission validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
