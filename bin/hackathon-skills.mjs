#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import { listAgents, resolveAgent, resolveSkillRoot } from "../lib/agents.mjs";
import { loadCatalog, packageMetadata } from "../lib/catalog.mjs";
import { installSkill } from "../lib/installer.mjs";

const HELP = `hackathon-skills — install portable Agent Skills

Usage:
  hackathon-skills list [--json]
  hackathon-skills agents [--json]
  hackathon-skills add <skill> --agent <agent> [options]
  hackathon-skills install <skill> --agent <agent> [options]

Install options:
  -a, --agent <name>   Target agent (run "agents" to list)
  -s, --scope <scope>  project (default) or user
      --cwd <path>     Project base directory (default: current directory)
      --target <path>  Explicit skills directory; overrides the native path
      --force          Preserve an existing skill as a timestamped backup
      --dry-run        Print the destination without changing files
      --json           Emit machine-readable output
  -h, --help           Show help
  -v, --version        Show package version

Examples:
  npx hackathon-skills list
  npx hackathon-skills add hackathon-grand-prize --agent kiro
  npx hackathon-skills add hackathon-grand-prize --agent claude --scope user
  npx hackathon-skills add hackathon-grand-prize --agent cursor --dry-run
`;

class UsageError extends Error {
  constructor(message) {
    super(message);
    this.name = "UsageError";
  }
}

function requireValue(args, index, option) {
  const value = args[index + 1];
  if (!value || value.startsWith("-")) {
    throw new UsageError(`${option} requires a value`);
  }
  return value;
}

function parseInstall(args) {
  const options = {
    skill: null,
    agent: null,
    scope: "project",
    scopeExplicit: false,
    cwd: process.cwd(),
    target: null,
    force: false,
    dryRun: false,
    json: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === "--agent" || token === "-a") {
      options.agent = requireValue(args, index, token);
      index += 1;
    } else if (token === "--scope" || token === "-s") {
      options.scope = requireValue(args, index, token).toLowerCase();
      options.scopeExplicit = true;
      index += 1;
    } else if (token === "--cwd") {
      options.cwd = path.resolve(requireValue(args, index, token));
      index += 1;
    } else if (token === "--target") {
      options.target = requireValue(args, index, token);
      index += 1;
    } else if (token === "--force") {
      options.force = true;
    } else if (token === "--dry-run") {
      options.dryRun = true;
    } else if (token === "--json") {
      options.json = true;
    } else if (token === "--help" || token === "-h") {
      options.help = true;
    } else if (token.startsWith("-")) {
      throw new UsageError(`unknown option: ${token}`);
    } else if (!options.skill) {
      options.skill = token;
    } else {
      throw new UsageError(`unexpected argument: ${token}`);
    }
  }

  if (options.help) return options;
  if (!options.skill) throw new UsageError("a skill name is required");
  if (!options.agent) throw new UsageError("--agent is required");
  if (!new Set(["project", "user"]).has(options.scope)) {
    throw new UsageError("--scope must be project or user");
  }
  if (options.target && options.scopeExplicit) {
    throw new UsageError("--target cannot be combined with --scope");
  }
  return options;
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function listCommand(json) {
  const skills = (await loadCatalog()).map(({ sourcePath: _sourcePath, ...skill }) => skill);
  if (json) return printJson({ skills });
  console.log("Available skills:");
  for (const skill of skills) {
    console.log(`- ${skill.name}: ${skill.description}`);
  }
}

function agentsCommand(json) {
  const agents = listAgents();
  if (json) return printJson({ agents });
  console.log("Supported agents:");
  for (const agent of agents) {
    const user = agent.user ?? "not documented; use --target";
    const aliases = agent.aliases.length ? `; aliases: ${agent.aliases.join(", ")}` : "";
    console.log(`- ${agent.name}: project=${agent.project}; user=${user}${aliases}`);
  }
}

async function addCommand(args) {
  const options = parseInstall(args);
  if (options.help) {
    console.log(HELP);
    return;
  }

  const catalog = await loadCatalog();
  const skill = catalog.find((entry) => entry.name === options.skill);
  if (!skill) {
    throw new UsageError(
      `unknown skill ${JSON.stringify(options.skill)}; run "hackathon-skills list"`,
    );
  }
  let agent;
  try {
    agent = resolveAgent(options.agent);
  } catch (error) {
    throw new UsageError(error.message);
  }
  const root = resolveSkillRoot({
    agent,
    scope: options.scope,
    cwd: options.cwd,
    target: options.target,
  });
  const destination = path.join(root, skill.name);
  const result = await installSkill({
    sourcePath: skill.sourcePath,
    destination,
    force: options.force,
    dryRun: options.dryRun,
  });

  const output = {
    skill: skill.name,
    agent: agent.name,
    scope: options.target ? "custom" : options.scope,
    destination: result.destination,
    backup: result.backup,
    dryRun: result.dryRun,
    installed: result.changed,
  };
  if (options.json) return printJson(output);

  if (result.dryRun) {
    console.log(`Dry run: would install ${skill.name} to ${result.destination}`);
    if (result.backup) console.log(`Existing destination would be backed up to ${result.backup}`);
    return;
  }
  console.log(`Installed ${skill.name} for ${agent.label}: ${result.destination}`);
  if (result.backup) console.log(`Previous installation preserved at: ${result.backup}`);
}

async function main() {
  const args = process.argv.slice(2);
  const metadata = await packageMetadata();
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    console.log(HELP);
    return;
  }
  if (args[0] === "--version" || args[0] === "-v") {
    console.log(metadata.version);
    return;
  }

  const command = args.shift();
  if (command === "list") {
    const unknown = args.filter((value) => value !== "--json");
    if (unknown.length) throw new UsageError(`unknown option: ${unknown[0]}`);
    return listCommand(args.includes("--json"));
  }
  if (command === "agents") {
    const unknown = args.filter((value) => value !== "--json");
    if (unknown.length) throw new UsageError(`unknown option: ${unknown[0]}`);
    return agentsCommand(args.includes("--json"));
  }
  if (command === "add" || command === "install") {
    return addCommand(args);
  }
  throw new UsageError(`unknown command: ${command}`);
}

main().catch((error) => {
  const jsonRequested = process.argv.includes("--json");
  const usage = error instanceof UsageError;
  if (jsonRequested) {
    printJson({ error: error.message, type: usage ? "usage" : "operation" });
  } else {
    console.error(`Error: ${error.message}`);
    if (usage) console.error('Run "hackathon-skills --help" for usage.');
  }
  process.exitCode = usage ? 2 : 1;
});
