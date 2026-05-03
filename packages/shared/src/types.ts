export type Outcome = "pass" | "flag" | "skip";

export interface VouchConfig {
  provider: "openrouter" | "ollama" | "anthropic";
  model: string;
  min_questions: number;
  sensitivity: "low" | "medium" | "high";
  watched_paths: string[];
  blocked_paths: string[];
  base_url?: string;
}

export interface SessionQuestion {
  id: string;
  session_id: string;
  order: number;
  question: string;
  answer: string;
  question_score: number;
  created_at: string;
}

export interface Session {
  id: string;
  project_id: string;
  developer_id: string;
  branch: string;
  commit_sha: string;
  commit_message: string;
  diff_summary: string;
  model_used: string;
  outcome: Outcome;
  confidence_score: number;
  duration_seconds: number;
  created_at: string;
  questions: SessionQuestion[];
}

export interface Developer {
  id: string;
  team_id: string;
  github_username: string;
  email: string;
  name: string;
  role: "admin" | "member";
}

export interface Project {
  id: string;
  team_id: string;
  name: string;
  repo_url: string;
  config: VouchConfig;
}
