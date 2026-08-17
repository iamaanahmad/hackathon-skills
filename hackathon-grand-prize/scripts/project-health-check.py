#!/usr/bin/env python3
"""Simple project health gate checklist generator."""

from __future__ import annotations

import argparse
import json

CHECKS = (
    "build_passes",
    "tests_pass",
    "lint_passes",
    "critical_flows_work",
    "error_states_present",
    "security_reviewed",
    "demo_fallback_ready",
    "secrets_scanned",
)


def evaluate(payload: dict[str, bool]) -> tuple[bool, list[str]]:
    missing = [check for check in CHECKS if check not in payload]
    if missing:
        raise ValueError(f"Missing required checks: {', '.join(missing)}")

    failed = [check for check in CHECKS if not bool(payload[check])]
    return len(failed) == 0, failed


def main() -> int:
    parser = argparse.ArgumentParser(description="Evaluate core readiness checks.")
    parser.add_argument("--checks-json", required=True, help="JSON object of boolean checks")
    args = parser.parse_args()

    payload = json.loads(args.checks_json)
    ok, failed = evaluate(payload)
    if ok:
        print("Health check passed: ready for demo/pitch rehearsal.")
        return 0

    print("Health check failed. Resolve these checks first:")
    for item in failed:
        print(f"- {item}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
