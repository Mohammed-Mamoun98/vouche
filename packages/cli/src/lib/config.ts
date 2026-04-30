import { execSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { VouchConfig } from "@vouch/shared";

const DEFAULT_BLOCKED_PATHS = ["*.lock", "dist/", "node_modules/"];

export function getDefaultConfig(): VouchConfig {
  return {
    provider: "openrouter",
    model: "anthropic/claude-3.5-sonnet",
    min_questions: 2,
    sensitivity: "medium",
    watched_paths: [],
    blocked_paths: [...DEFAULT_BLOCKED_PATHS],
  };
}

function getGitRoot(cwd: string): string {
  try {
    return execSync("git rev-parse --show-toplevel", {
      encoding: "utf-8",
      cwd,
    }).trim();
  } catch {
    return cwd;
  }
}

async function findConfigFile(startDir: string): Promise<string | null> {
  let dir = path.resolve(startDir);
  const gitRoot = getGitRoot(dir);

  while (dir !== gitRoot && dir !== path.dirname(dir)) {
    const configPath = path.join(dir, ".vouchrc");
    try {
      await fs.access(configPath);
      return configPath;
    } catch {
      // Continue walking up
    }
    dir = path.dirname(dir);
  }

  // Also check git root
  const rootConfig = path.join(gitRoot, ".vouchrc");
  try {
    await fs.access(rootConfig);
    return rootConfig;
  } catch {
    return null;
  }
}

export async function loadConfig(cwd?: string): Promise<VouchConfig> {
  const startDir = cwd || process.cwd();
  const configPath = await findConfigFile(startDir);

  if (!configPath) {
    throw new Error(
      `.vouchrc not found in ${startDir} or any parent directory up to git root`,
    );
  }

  let content: string;
  try {
    content = await fs.readFile(configPath, "utf-8");
  } catch (err) {
    throw new Error(`Failed to read .vouchrc at ${configPath}: ${err}`);
  }

  let parsed: Partial<VouchConfig>;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`Invalid JSON in .vouchrc at ${configPath}`);
  }

  if (!parsed.provider) {
    throw new Error("Missing required field 'provider' in .vouchrc");
  }
  if (!parsed.model) {
    throw new Error("Missing required field 'model' in .vouchrc");
  }

  return {
    provider: parsed.provider,
    model: parsed.model,
    min_questions: parsed.min_questions ?? 2,
    sensitivity: parsed.sensitivity ?? "medium",
    watched_paths: parsed.watched_paths ?? [],
    blocked_paths: parsed.blocked_paths ?? [...DEFAULT_BLOCKED_PATHS],
    base_url: parsed.base_url,
  };
}
