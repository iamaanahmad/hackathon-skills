import { cp, lstat, mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";

async function pathExists(target) {
  try {
    await lstat(target);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function isSameOrInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export async function installSkill({ sourcePath, destination, force, dryRun }) {
  const source = path.resolve(sourcePath);
  const target = path.resolve(destination);
  if (isSameOrInside(source, target)) {
    throw new Error("destination cannot be the source package or a directory inside it");
  }

  const exists = await pathExists(target);
  if (exists && !force) {
    const error = new Error(
      `destination already exists: ${target}; rerun with --force to preserve it as a backup and install`,
    );
    error.code = "EEXIST";
    throw error;
  }

  const backup = exists ? `${target}.backup-${timestamp()}` : null;
  if (dryRun) {
    return { destination: target, backup, changed: false, dryRun: true };
  }

  const parent = path.dirname(target);
  const temporary = path.join(
    parent,
    `.${path.basename(target)}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`,
  );
  await mkdir(parent, { recursive: true });

  let movedExisting = false;
  try {
    await cp(source, temporary, {
      recursive: true,
      force: false,
      errorOnExist: true,
      dereference: true,
      preserveTimestamps: true,
    });
    if (exists) {
      await rename(target, backup);
      movedExisting = true;
    }
    await rename(temporary, target);
    return { destination: target, backup, changed: true, dryRun: false };
  } catch (error) {
    await rm(temporary, { recursive: true, force: true }).catch(() => undefined);
    if (movedExisting && !(await pathExists(target))) {
      await rename(backup, target).catch(() => undefined);
    }
    throw error;
  }
}
