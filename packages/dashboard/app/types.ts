import type { Outcome } from "../../shared/src/types";

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface Developer {
  id: string;
  name: string;
  username: string;
  initials: string;
  role: "admin" | "member";
  avatar?: string;
}

export interface Session {
  id: string;
  developer: Developer;
  branch: string;
  commit_sha: string;
  commit_message: string;
  outcome: Outcome;
  confidence_score: number;
  duration_seconds: number;
  created_at: string;
}

export interface BranchStats {
  name: string;
  status: "active" | "stale" | "merged";
  session_count: number;
  last_activity: string;
  contributors: Developer[];
}

export interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export type View =
  | "overview"
  | "branches"
  | "developers"
  | "developer-detail"
  | "session"
  | "settings";
