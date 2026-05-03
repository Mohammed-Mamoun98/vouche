import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  plan: text("plan", { enum: ["free", "team", "enterprise"] })
    .notNull()
    .default("free"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const developers = pgTable(
  "developers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    githubUsername: text("github_username"),
    email: text("email"),
    name: text("name").notNull(),
    role: text("role", { enum: ["admin", "member"] })
      .notNull()
      .default("member"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_developers_team_id").on(table.teamId)],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    repoUrl: text("repo_url"),
    config: jsonb("config").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_projects_team_id").on(table.teamId)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    developerId: uuid("developer_id")
      .notNull()
      .references(() => developers.id, { onDelete: "cascade" }),
    branch: text("branch").notNull(),
    commitSha: text("commit_sha").notNull(),
    commitMessage: text("commit_message").notNull().default(""),
    diffSummary: text("diff_summary").notNull().default(""),
    modelUsed: text("model_used").notNull().default(""),
    outcome: text("outcome", { enum: ["pass", "flag", "skip"] }).notNull(),
    confidenceScore: integer("confidence_score").notNull().default(0),
    durationSeconds: integer("duration_seconds").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_sessions_project_created").on(
      table.projectId,
      table.createdAt.desc(),
    ),
    index("idx_sessions_developer_created").on(
      table.developerId,
      table.createdAt.desc(),
    ),
    index("idx_sessions_project_branch_created").on(
      table.projectId,
      table.branch,
      table.createdAt.desc(),
    ),
  ],
);

export const sessionQuestions = pgTable(
  "session_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    order: integer("order").notNull(),
    question: text("question").notNull(),
    answer: text("answer").notNull().default(""),
    questionScore: integer("question_score").notNull().default(0),
  },
  (table) => [
    index("idx_session_questions_session_id").on(table.sessionId),
  ],
);
