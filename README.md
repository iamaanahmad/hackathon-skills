# Hackathon Grand Prize Agent Skill

A production-oriented, cross-platform [Agent Skill](https://agentskills.io/) that helps coding agents choose, build, validate, demo, pitch, and submit hackathon projects with the strongest realistic chance of winning.

The skill optimizes for one memorable, working core workflow—not feature count. It combines hackathon research, idea scoring, differentiation, architecture, sponsor strategy, execution planning, engineering gates, security review, demo recovery, judge red-teaming, and submission readiness.

## Canonical package

The single source of truth is [`hackathon-grand-prize/`](hackathon-grand-prize/):

- [`SKILL.md`](hackathon-grand-prize/SKILL.md) — activation, routing, workflow, safety, and completion gates
- [`references/`](hackathon-grand-prize/references/) — detailed frameworks loaded only when needed
- [`assets/`](hackathon-grand-prize/assets/) — fillable scorecard, demo, pitch, and submission artifacts
- [`scripts/`](hackathon-grand-prize/scripts/) — dependency-free validation and scoring helpers

## Use it

Ask naturally, for example:

```text
Analyze this hackathon's official rules and recommend three differentiated ideas.
Review our current project like a hostile judge and fix the highest-impact gaps.
Create a deterministic three-minute demo with fallback and recovery paths.
Prepare and validate our final README, pitch, and submission checklist.
```

Or invoke one of the documented modes, including `/hackathon-analyze`, `/hackathon-ideas`, `/hackathon-build`, `/hackathon-review`, `/hackathon-demo`, `/hackathon-pitch`, and `/hackathon-submit`.

## Install with npm / npx

The repository is packaged as the zero-dependency `hackathon-skills` CLI. List the catalog and install one skill into an agent's native project directory:

```powershell
npx hackathon-skills list
npx hackathon-skills add hackathon-grand-prize --agent kiro
```

Other examples:

```powershell
npx hackathon-skills add hackathon-grand-prize --agent claude --scope user
npx hackathon-skills add hackathon-grand-prize --agent cursor --dry-run
npx hackathon-skills agents
```

Supported agent values are `agents`, `claude`, `codex`, `antigravity`, `cursor`, `kiro`, and `copilot`. Project scope is the default. Use `--target <skills-directory>` for an explicitly verified custom location. Existing installations are refused by default; `--force` preserves the previous directory as a timestamped backup before installing. Use `--json` for automation.

Running with `npx` does not add a dependency to the target project. Until the first registry release, the same CLI can be exercised from a local package tarball produced by `npm pack`.

## Manual install

Install the **entire** `hackathon-grand-prize/` directory into one skill directory supported by your client. Do not copy only `SKILL.md`; the skill depends on its bundled references, assets, and scripts.

| Client | Recommended project destination |
|---|---|
| Claude Code | `.claude/skills/hackathon-grand-prize/` |
| OpenAI Codex | `.agents/skills/hackathon-grand-prize/` |
| Google Antigravity CLI | `.agents/skills/hackathon-grand-prize/` |
| Cursor | `.cursor/skills/hackathon-grand-prize/` or `.agents/skills/hackathon-grand-prize/` |
| Kiro | `.kiro/skills/hackathon-grand-prize/` |
| VS Code / GitHub Copilot | `.github/skills/hackathon-grand-prize/` or `.agents/skills/hackathon-grand-prize/` |

Choose one destination per client/workspace to avoid duplicate skill-name discovery. This repository also contains lightweight development adapters in `.agents`, `.claude`, `.github`, `.cursor`, and `.kiro`; they reference the canonical package and are not standalone distributions.

See the [package compatibility and installation guide](hackathon-grand-prize/README.md) for exact commands and client notes.

## Validate

Python 3.9 or newer is required only for the optional helper scripts; no third-party packages are used.

```powershell
python hackathon-grand-prize/scripts/validate-skill.py
python -m compileall -q hackathon-grand-prize/scripts
```

The scoring, health, and submission commands are documented in [`hackathon-grand-prize/README.md`](hackathon-grand-prize/README.md). CLI exit codes are consistent: `0` passes, `1` reports a failed gate, and `2` reports invalid input or usage.

## Design principles

- One canonical, self-contained skill package
- Trigger-rich metadata and explicit mode routing
- Progressive disclosure through focused references
- Official-source research with dated citations
- Facts, assumptions, proof strength, and presentation medium tracked separately
- Human approval for destructive, production, financial, or external actions
- Deterministic validation, demo fallbacks, and evidence-backed readiness gates

## Publishing

This package is released under the [MIT License](LICENSE). Before publishing, authenticate the npm account that owns the package name and run:

```powershell
npm whoami
npm pack --dry-run
npm publish --access public
```

The unscoped name `hackathon-skills` returned as unregistered on npm on 2026-08-17, but availability is not reserved until publication. Enable npm account two-factor authentication and trusted publishing/provenance where your release workflow supports it.

## Standards and client documentation

This package follows the open [Agent Skills specification](https://agentskills.io/specification). Client paths and behavior are based on current official documentation for [GitHub Copilot](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-skills), [Claude Code](https://docs.anthropic.com/en/docs/claude-code/skills), [Cursor](https://cursor.com/docs/skills), [Kiro](https://kiro.dev/docs/skills), and [Google Antigravity CLI](https://codelabs.developers.google.com/antigravity/how-to-create-agent-skills-for-antigravity-cli). Packaging follows the official npm guidance for [package binaries and npx](https://docs.npmjs.com/cli/v11/commands/npx) and [public package publishing](https://docs.npmjs.com/cli/v10/commands/npm-publish/).

Content derived from those sources is rephrased for compliance with licensing restrictions.
