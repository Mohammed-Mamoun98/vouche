import { createInterface } from "node:readline";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const CREDENTIALS_DIR = path.join(os.homedir(), ".vouch");
const CREDENTIALS_PATH = path.join(CREDENTIALS_DIR, "credentials");

interface Credentials {
  provider: string;
  openrouter_key?: string;
  anthropic_key?: string;
  ollama_base_url?: string;
  dashboard_base_url?: string;
  team_id?: string;
  developer_id?: string;
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string): Promise<string> =>
  new Promise((resolve) => rl.question(q, resolve));

export async function loginCommand(): Promise<void> {
  console.log("vouch: interactive login\n");

  const provider = await ask("AI provider (openrouter | anthropic | ollama) [openrouter]: ");
  const selectedProvider = provider.trim() || "openrouter";

  let openrouterKey = "";
  let anthropicKey = "";
  let ollamaBaseUrl = "";

  if (selectedProvider === "openrouter") {
    openrouterKey = await ask("OpenRouter API key: ");
    if (!openrouterKey.trim()) {
      console.log("\nvouch: warning — OpenRouter API key is empty. AI calls will fail.");
    }
  } else if (selectedProvider === "anthropic") {
    anthropicKey = await ask("Anthropic API key: ");
    if (!anthropicKey.trim()) {
      console.log("\nvouch: warning — Anthropic API key is empty. AI calls will fail.");
    }
  } else if (selectedProvider === "ollama") {
    ollamaBaseUrl = await ask("Ollama base URL [http://localhost:11434]: ");
  }

  const dashboardUrl = await ask("Dashboard URL (optional — leave blank to skip): ");
  const teamId = await ask("Team ID (optional): ");
  const developerId = await ask("Developer ID (optional): ");

  const creds: Credentials = {
    provider: selectedProvider,
    ...(openrouterKey && { openrouter_key: openrouterKey }),
    ...(anthropicKey && { anthropic_key: anthropicKey }),
    ...(ollamaBaseUrl && { ollama_base_url: ollamaBaseUrl }),
    ...(dashboardUrl.trim() && { dashboard_base_url: dashboardUrl.trim() }),
    ...(teamId.trim() && { team_id: teamId.trim() }),
    ...(developerId.trim() && { developer_id: developerId.trim() }),
  };

  try {
    mkdirSync(CREDENTIALS_DIR, { recursive: true });
  } catch {
    // Directory already exists — safe to proceed
  }

  writeFileSync(CREDENTIALS_PATH, JSON.stringify(creds, null, 2), { mode: 0o600 });
  console.log(`\nvouch: credentials saved to ${CREDENTIALS_PATH}`);

  rl.close();
}

export function whoamiCommand(): void {
  if (!existsSync(CREDENTIALS_PATH)) {
    console.log("vouch: not logged in. Run 'vouch login' to authenticate.");
    return;
  }

  try {
    const content = readFileSync(CREDENTIALS_PATH, "utf-8");
    const creds = JSON.parse(content);
    console.log("vouch: authenticated");
    console.log(`  Provider:    ${creds.provider || "not set"}`);
    console.log(`  Dashboard:   ${creds.dashboard_base_url || "not configured"}`);
    console.log(`  Team ID:     ${creds.team_id || "not set"}`);
    console.log(`  Developer:   ${creds.developer_id || "not set"}`);
    console.log(`  Config:      ${CREDENTIALS_PATH}`);
  } catch {
    console.log("vouch: credentials file is corrupted. Run 'vouch login' to re-authenticate.");
  }
}

export function logoutCommand(): void {
  if (!existsSync(CREDENTIALS_PATH)) {
    console.log("vouch: not logged in.");
    return;
  }

  unlinkSync(CREDENTIALS_PATH);
  console.log("vouch: credentials deleted.");
}
