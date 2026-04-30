import type { Outcome } from "./types";

export interface SessionPayload {
  team_id: string;
  developer_id: string;
  branch: string;
  commit_sha: string;
  commit_message: string;
  diff_summary: string;
  model_used: string;
  outcome: Outcome;
  confidence_score: number;
  duration_seconds: number;
}

export interface ApiClient {
  createSession(data: SessionPayload): Promise<{ id: string }>;
}

export function createApiClient(baseUrl: string): ApiClient {
  return {
    async createSession(data: SessionPayload) {
      const response = await fetch(`${baseUrl}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(
          `Dashboard API error: ${response.status} ${response.statusText}`,
        );
      }

      return response.json() as Promise<{ id: string }>;
    },
  };
}
