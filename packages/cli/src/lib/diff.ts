import { execSync } from "node:child_process";
import type { VouchConfig } from "@vouch/shared";

const MAX_DIFF_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Runs 'git diff HEAD~1 HEAD' and returns the raw diff string.
 * Throws if not in a git repo or if there are no commits yet.
 */
export async function getDiff(): Promise<string> {
  try {
    execSync("git rev-parse --git-dir", { stdio: "pipe" });
  } catch {
    throw new Error("Not a git repository");
  }

  try {
    execSync("git rev-parse HEAD", { stdio: "pipe" });
  } catch {
    throw new Error("No commits exist in this repository");
  }

  const diff = execSync("git diff HEAD~1 HEAD", {
    encoding: "utf-8",
    maxBuffer: MAX_DIFF_BYTES,
  });

  return diff;
}

/**
 * Filters diff sections based on VouchConfig watched/blocked paths.
 * Simple glob matching: *, ?, **, path prefixes.
 */
function globMatch(pattern: string, filePath: string): boolean {
  if (pattern === "**") return true;
  if (pattern.endsWith("/")) {
    return filePath.startsWith(pattern) || filePath.includes(pattern);
  }
  if (pattern.includes("*")) {
    const regex = pattern
      .replace(/\./g, "\\.")
      .replace(/\*\*/g, ".*")
      .replace(/\*/g, "[^/]*")
      .replace(/\?/g, ".");
    return new RegExp(`^${regex}$`).test(filePath);
  }
  return filePath.endsWith(pattern) || filePath.includes(`/${pattern}`);
}

function shouldIncludeFile(filePath: string, config: VouchConfig): boolean {
  for (const blocked of config.blocked_paths) {
    if (globMatch(blocked, filePath)) return false;
  }
  if (config.watched_paths.length === 0) return true;
  for (const watched of config.watched_paths) {
    if (globMatch(watched, filePath)) return true;
  }
  return false;
}

/**
 * Filters diff output, keeping only sections for files matching config rules.
 * Files matching blocked_paths are removed.
 * If watched_paths is non-empty, only files matching those patterns are kept.
 */
export function filterDiff(diff: string, config: VouchConfig): string {
  const lines = diff.split("\n");
  const result: string[] = [];
  let inFileSection = false;
  let currentFilePath = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("diff --git")) {
      const match = line.match(/diff --git a\/.+? b\/(.+)/);
      currentFilePath = match?.[1] || "";
      inFileSection = shouldIncludeFile(currentFilePath, config);
      if (inFileSection) result.push(line);
    } else if (inFileSection) {
      result.push(line);
    }
  }

  return result.join("\n");
}

/**
 * Parses diff output and returns summary statistics.
 */
export function getDiffMeta(diff: string): {
  files: string[];
  additions: number;
  deletions: number;
} {
  const meta = { files: [] as string[], additions: 0, deletions: 0 };

  for (const line of diff.split("\n")) {
    if (line.startsWith("diff --git")) {
      const match = line.match(/diff --git a\/.+? b\/(.+)/);
      if (match) meta.files.push(match[1]);
    } else if (line.startsWith("+") && !line.startsWith("+++")) {
      meta.additions++;
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      meta.deletions++;
    }
  }

  return meta;
}
