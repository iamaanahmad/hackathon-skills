import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = fileURLToPath(new URL("../", import.meta.url));
const MANIFEST_PATH = path.join(PACKAGE_ROOT, "skills.json");
const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function sourceInsidePackage(relativePath) {
  if (typeof relativePath !== "string" || !relativePath.trim() || path.isAbsolute(relativePath)) {
    throw new Error("skill path must be a non-empty relative path");
  }
  const sourcePath = path.resolve(PACKAGE_ROOT, relativePath);
  const relative = path.relative(PACKAGE_ROOT, sourcePath);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`skill path escapes the package: ${relativePath}`);
  }
  return sourcePath;
}

async function validateSkill(entry, names) {
  assertObject(entry, "skill entry");
  const { name, description } = entry;
  if (typeof name !== "string" || !SKILL_NAME.test(name)) {
    throw new Error(`invalid skill name: ${JSON.stringify(name)}`);
  }
  if (names.has(name)) {
    throw new Error(`duplicate skill name in catalog: ${name}`);
  }
  names.add(name);
  if (typeof description !== "string" || !description.trim()) {
    throw new Error(`skill ${name} must have a non-empty description`);
  }

  const sourcePath = sourceInsidePackage(entry.path);
  const skillFile = path.join(sourcePath, "SKILL.md");
  const info = await stat(skillFile).catch(() => null);
  if (!info?.isFile()) {
    throw new Error(`skill ${name} is missing SKILL.md at ${entry.path}`);
  }
  const content = await readFile(skillFile, "utf8");
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const declaredName = frontmatter?.[1].match(/^name:\s*([a-z0-9-]+)\s*$/m)?.[1];
  if (declaredName !== name) {
    throw new Error(
      `skill ${name} frontmatter name is ${JSON.stringify(declaredName)} instead of ${JSON.stringify(name)}`,
    );
  }
  if (path.basename(sourcePath) !== name) {
    throw new Error(`skill ${name} path must end with its name`);
  }

  return { name, description: description.trim(), sourcePath, relativePath: entry.path };
}

export async function loadCatalog() {
  const raw = await readFile(MANIFEST_PATH, "utf8");
  const manifest = JSON.parse(raw);
  assertObject(manifest, "skills.json");
  if (manifest.schemaVersion !== 1) {
    throw new Error(`unsupported skills.json schemaVersion: ${manifest.schemaVersion}`);
  }
  if (!Array.isArray(manifest.skills) || manifest.skills.length === 0) {
    throw new Error("skills.json must contain at least one skill");
  }

  const names = new Set();
  return Promise.all(manifest.skills.map((entry) => validateSkill(entry, names)));
}

export async function packageMetadata() {
  const raw = await readFile(path.join(PACKAGE_ROOT, "package.json"), "utf8");
  return JSON.parse(raw);
}
