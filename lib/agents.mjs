import os from "node:os";
import path from "node:path";

export const AGENTS = Object.freeze({
  agents: Object.freeze({
    label: "Generic Agent Skills",
    aliases: Object.freeze(["generic", "agent-skills"]),
    project: Object.freeze([".agents", "skills"]),
    user: Object.freeze([".agents", "skills"]),
  }),
  claude: Object.freeze({
    label: "Claude Code",
    aliases: Object.freeze(["claude-code"]),
    project: Object.freeze([".claude", "skills"]),
    user: Object.freeze([".claude", "skills"]),
  }),
  codex: Object.freeze({
    label: "OpenAI Codex",
    aliases: Object.freeze(["openai-codex"]),
    project: Object.freeze([".agents", "skills"]),
    user: Object.freeze([".agents", "skills"]),
  }),
  antigravity: Object.freeze({
    label: "Google Antigravity CLI",
    aliases: Object.freeze(["agy"]),
    project: Object.freeze([".agents", "skills"]),
    user: null,
  }),
  cursor: Object.freeze({
    label: "Cursor",
    aliases: Object.freeze([]),
    project: Object.freeze([".cursor", "skills"]),
    user: Object.freeze([".cursor", "skills"]),
  }),
  kiro: Object.freeze({
    label: "Kiro",
    aliases: Object.freeze([]),
    project: Object.freeze([".kiro", "skills"]),
    user: Object.freeze([".kiro", "skills"]),
  }),
  copilot: Object.freeze({
    label: "VS Code / GitHub Copilot",
    aliases: Object.freeze(["github-copilot", "vscode"]),
    project: Object.freeze([".github", "skills"]),
    user: Object.freeze([".copilot", "skills"]),
  }),
});

const AGENT_ALIASES = new Map();
for (const [name, config] of Object.entries(AGENTS)) {
  AGENT_ALIASES.set(name, name);
  for (const alias of config.aliases) {
    AGENT_ALIASES.set(alias, name);
  }
}

export function resolveAgent(input) {
  const normalized = String(input ?? "").trim().toLowerCase();
  const name = AGENT_ALIASES.get(normalized);
  if (!name) {
    throw new Error(
      `unknown agent ${JSON.stringify(input)}; run "hackathon-skills agents" for supported values`,
    );
  }
  return { name, ...AGENTS[name] };
}

export function resolveSkillRoot({ agent, scope, cwd, target }) {
  if (target) {
    return path.resolve(cwd, target);
  }
  const segments = agent[scope];
  if (!segments) {
    throw new Error(
      `${agent.label} does not have a documented ${scope} install path; use project scope or --target`,
    );
  }
  const base = scope === "user" ? os.homedir() : cwd;
  return path.resolve(base, ...segments);
}

export function listAgents() {
  return Object.entries(AGENTS).map(([name, config]) => ({
    name,
    label: config.label,
    project: path.join(...config.project),
    user: config.user ? path.join("~", ...config.user) : null,
    aliases: [...config.aliases],
  }));
}
