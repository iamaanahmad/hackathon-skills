# hackathon-grand-prize

Canonical cross-platform Agent Skill for maximizing hackathon winning probability.

## Source of truth

Core intelligence lives in:
- `hackathon-grand-prize/SKILL.md`

Detailed frameworks and templates are intentionally split into `references/` and `assets/` for progressive disclosure.

## Install / discovery

This repository includes lightweight adapters that point clients to the canonical skill:

- GitHub Copilot / VS Code: `.github/skills/hackathon-grand-prize/SKILL.md`
- Claude Code: `.claude/skills/hackathon-grand-prize/SKILL.md`
- Codex-compatible clients: `.agents/skills/hackathon-grand-prize/SKILL.md`
- Cursor: `.cursor/rules/hackathon-grand-prize.mdc`
- Kiro: `.kiro/steering/hackathon-grand-prize.md`

### Antigravity

Use the native skill/custom-instruction mechanism available in your Antigravity environment. If native Agent Skills are supported, register `hackathon-grand-prize/SKILL.md` directly. If not, use a minimal adapter that references this canonical file instead of duplicating instructions.

## Optional helper scripts

- `scripts/score-project.py`: score an idea using weighted criteria
- `scripts/validate-submission.py`: validate README/submission completeness
- `scripts/project-health-check.py`: quick build/test/security readiness checklist

These scripts are portable Python 3 tools with no third-party dependencies.
