import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getDefaultConfig } from "../lib/config";

function getGitHookDir(): string {
  try {
    return execSync("git rev-parse --git-path hooks", {
      encoding: "utf-8",
    }).trim();
  } catch {
    throw new Error("Not a git repository");
  }
}

function getGitRoot(): string {
  try {
    return execSync("git rev-parse --show-toplevel", {
      encoding: "utf-8",
    }).trim();
  } catch {
    throw new Error("Not a git repository");
  }
}

const PRE_PUSH_HOOK = `#!/bin/sh
# Vouch — AI code accountability pre-push hook
# Run \`vouch check\` before each push
echo ""
echo "🔎 vouch: reviewing your changes..."
vouch check
if [ $? -ne 0 ]; then
  echo ""
  echo "✋ vouch: push blocked — review flagged."
  echo "   Answer the questions above and try again."
  echo ""
  exit 1
fi
exit 0
`;

export async function initCommand(): Promise<void> {
  const hookDir = getGitHookDir();
  const gitRoot = getGitRoot();

  if (!existsSync(hookDir)) {
    mkdirSync(hookDir, { recursive: true });
  }

  const hookPath = path.join(hookDir, "pre-push");
  writeFileSync(hookPath, PRE_PUSH_HOOK, { mode: 0o755 });
  console.log(`vouch: pre-push hook installed at ${hookPath}`);

  const vouchrcPath = path.join(gitRoot, ".vouchrc");
  if (existsSync(vouchrcPath)) {
    console.log(`vouch: .vouchrc already exists at ${vouchrcPath} (skipping)`);
  } else {
    const config = getDefaultConfig();
    writeFileSync(vouchrcPath, `${JSON.stringify(config, null, 2)}\n`);
    console.log(`vouch: config created at ${vouchrcPath}`);
  }

  console.log("\nvouch: init complete. Run 'vouch login' to set up your API key.");
}
