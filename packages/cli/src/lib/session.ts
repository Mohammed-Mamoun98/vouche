import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createApiClient, type SessionPayload } from "@vouch/shared";

interface Credentials {
  dashboard_base_url?: string;
  team_id?: string;
  developer_id?: string;
}

function getCredentials(): Credentials | null {
  try {
    const content = readFileSync(
      path.join(os.homedir(), ".vouch", "credentials"),
      "utf-8",
    );
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function reportSession(
  data: Omit<SessionPayload, "team_id" | "developer_id">,
): Promise<void> {
  const creds = getCredentials();
  if (!creds?.dashboard_base_url || !creds.team_id || !creds.developer_id) {
    console.warn(
      "vouch: dashboard reporting not configured (run 'vouch login' to set up)",
    );
    return;
  }

  const client = createApiClient(creds.dashboard_base_url);

  try {
    await client.createSession({
      ...data,
      team_id: creds.team_id,
      developer_id: creds.developer_id,
    });
  } catch (err) {
    console.warn(`vouch: failed to report analytics — ${err}`);
  }
}

export function getCurrentBranch(): string {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf-8",
    }).trim();
  } catch {
    return "unknown";
  }
}
