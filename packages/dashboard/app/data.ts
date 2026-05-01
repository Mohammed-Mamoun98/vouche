import type { BranchStats, Developer, Project, Session } from "./types";

export const PROJECTS: Project[] = [
  { id: "vouch", name: "vouch", color: "#c8f135" },
  { id: "vouch-cli", name: "vouch-cli", color: "#a78bfa" },
];

export const DEVELOPERS: Developer[] = [
  {
    id: "d1",
    name: "Yusuf Chen",
    username: "ychen",
    initials: "YC",
    role: "admin",
  },
  {
    id: "d2",
    name: "Sarah Miller",
    username: "sarahm",
    initials: "SM",
    role: "member",
  },
  {
    id: "d3",
    name: "Alex Thompson",
    username: "athompson",
    initials: "AT",
    role: "member",
  },
  {
    id: "d4",
    name: "Jordan Lee",
    username: "jlee",
    initials: "JL",
    role: "member",
  },
];

export const SESSIONS: Session[] = [
  {
    id: "s1",
    developer: DEVELOPERS[0] ?? ({} as Developer),
    branch: "feat/auth-redesign",
    commit_sha: "a1b2c3d",
    commit_message: "Refactor authentication flow with OAuth2 support",
    outcome: "pass",
    confidence_score: 0.94,
    duration_seconds: 847,
    created_at: "2 min ago",
  },
  {
    id: "s2",
    developer: DEVELOPERS[1] ?? ({} as Developer),
    branch: "fix/memory-leak",
    commit_sha: "e4f5g6h",
    commit_message: "Fix memory leak in session cache",
    outcome: "flag",
    confidence_score: 0.72,
    duration_seconds: 234,
    created_at: "1 hour ago",
  },
  {
    id: "s3",
    developer: DEVELOPERS[2] ?? ({} as Developer),
    branch: "feat/dashboard-metrics",
    commit_sha: "i7j8k9l",
    commit_message: "Add real-time metrics to dashboard",
    outcome: "pass",
    confidence_score: 0.88,
    duration_seconds: 156,
    created_at: "2 hours ago",
  },
  {
    id: "s4",
    developer: DEVELOPERS[3] ?? ({} as Developer),
    branch: "chore/update-deps",
    commit_sha: "m0n1o2p",
    commit_message: "Update all dependencies to latest versions",
    outcome: "skip",
    confidence_score: 0.61,
    duration_seconds: 89,
    created_at: "3 hours ago",
  },
  {
    id: "s5",
    developer: DEVELOPERS[0] ?? ({} as Developer),
    branch: "feat/api-v2",
    commit_sha: "q3r4s5t",
    commit_message: "Implement API v2 with breaking changes",
    outcome: "pass",
    confidence_score: 0.91,
    duration_seconds: 423,
    created_at: "4 hours ago",
  },
  {
    id: "s6",
    developer: DEVELOPERS[1] ?? ({} as Developer),
    branch: "fix/race-condition",
    commit_sha: "u6v7w8x",
    commit_message: "Resolve race condition in async handlers",
    outcome: "pass",
    confidence_score: 0.85,
    duration_seconds: 312,
    created_at: "5 hours ago",
  },
  {
    id: "s7",
    developer: DEVELOPERS[2] ?? ({} as Developer),
    branch: "feat/user-roles",
    commit_sha: "y9z0a1b",
    commit_message: "Add role-based access control",
    outcome: "flag",
    confidence_score: 0.68,
    duration_seconds: 567,
    created_at: "6 hours ago",
  },
  {
    id: "s8",
    developer: DEVELOPERS[3] ?? ({} as Developer),
    branch: "refactor/db-schema",
    commit_sha: "c2d3e4f",
    commit_message: "Normalize database schema",
    outcome: "pass",
    confidence_score: 0.89,
    duration_seconds: 234,
    created_at: "7 hours ago",
  },
];

export const BRANCH_STATS: BranchStats[] = [
  {
    name: "main",
    status: "active",
    session_count: 24,
    last_activity: "2 min ago",
    contributors: [
      DEVELOPERS[0] ?? ({} as Developer),
      DEVELOPERS[1] ?? ({} as Developer),
    ],
  },
  {
    name: "develop",
    status: "active",
    session_count: 18,
    last_activity: "1 hour ago",
    contributors: [
      DEVELOPERS[2] ?? ({} as Developer),
      DEVELOPERS[3] ?? ({} as Developer),
    ],
  },
  {
    name: "feat/dashboard",
    status: "active",
    session_count: 12,
    last_activity: "3 hours ago",
    contributors: [
      DEVELOPERS[0] ?? ({} as Developer),
      DEVELOPERS[2] ?? ({} as Developer),
    ],
  },
  {
    name: "feat/auth-redesign",
    status: "stale",
    session_count: 8,
    last_activity: "2 days ago",
    contributors: [DEVELOPERS[1] ?? ({} as Developer)],
  },
  {
    name: "fix/ui-bugs",
    status: "merged",
    session_count: 5,
    last_activity: "1 week ago",
    contributors: [DEVELOPERS[3] ?? ({} as Developer)],
  },
];

export const STATS = {
  totalReviews: 142,
  passed: 118,
  flagged: 19,
  skipped: 5,
  avgConfidence: 0.86,
  avgDuration: "4.2 min",
} as const;
