```markdown
# Vouch — Claude Code Brief

## What is Vouch?

Vouch is a CLI tool that intercepts git pushes and interviews developers
about their code changes. The goal is to ensure developers actually
understand what they are shipping — especially AI-generated code.

When a developer runs `git push`, a pre-push hook fires `vouch check`.
Vouch reads the diff, sends it to an AI model, generates 2-3 targeted
questions, and asks them interactively in the terminal. The developer
types their answers. The AI evaluates understanding and either clears
the push or blocks it with exit 1.

This is not a code review tool. It reviews the developer, not the code.

---

## Repo structure

This is a pnpm monorepo.

```

vouch/

├── packages/

│   ├── cli/          # @vouch/cli — the CLI tool, published to npm

│   ├── dashboard/    # @vouch/dashboard — local Next.js dashboard

│   └── shared/       # @vouch/shared — shared types + API client

├── examples/

│   ├── solo-setup/

│   └── team-setup/

├── package.json

├── pnpm-workspace.yaml

├── biome.json

├── tsconfig.base.json

└── .vouchrc.example

```

---

## Tooling decisions — do not change these

- **Package manager**: pnpm (never npm or yarn)
- **Linter/formatter**: Biome (never ESLint or Prettier)
- **TypeScript**: strict mode, project references
- **CLI build**: tsup
- **Commits**: Conventional Commits (feat:, fix:, chore:, etc.) — see full rules below
- **Node version**: 18+ (use native fetch, no node-fetch)
- **No unnecessary dependencies** — prefer Node.js built-ins

---

## Commit rules (Conventional Commits)

Format: `<type>[optional scope]: <description>`

Types: feat, fix, refactor, chore, docs, style, test, perf, ci, build, revert

Rules:
- Description is lowercase, imperative mood ("add" not "adds"), no trailing period
- Scope in parentheses after type when there's a clear module: `feat(auth):`
- Breaking changes: append `!` to type/scope and/or add `BREAKING CHANGE:` footer
- Body starts one blank line after description — explain *why*, not *what*
- Keep subject under ~72 characters
- Never include `Co-authored-by:` lines
- One commit = one logical unit of change. Split unrelated changes into separate commits.

---

## AI provider support

The CLI supports three providers via a unified AIAdapter interface.
The active provider is configured in `.vouchrc` per repo, and the
API key is stored in `~/.vouch/credentials` (never in the repo).

| Provider | Auth | Notes |
|----------|------|-------|
| openrouter | api key | default for solo use |
| anthropic | api key | Claude direct |
| ollama | none | local inference, base_url required |

All AI calls from the CLI go through `packages/cli/src/lib/ai.ts`.
Never call AI providers directly from command files.

---

## Auth model

- `vouch login` — interactive setup, stores credentials in `~/.vouch/credentials` as JSON (chmod 600)
- `vouch whoami` — prints current auth state
- `vouch logout` — deletes `~/.vouch/credentials`
- No OAuth server yet — solo mode only, user provides their own API key
- Credentials shape:

```

{

"provider": "openrouter",

"openrouter_key": "",

"anthropic_key": "",

"ollama_base_url": "http://localhost:11434",

"dashboard_base_url": "",

"team_id": "",

"developer_id": ""

}

```

---

## Config file — .vouchrc

Lives at the git repo root. Committed to version control.
Controls per-repo audit behaviour.

```

{

"provider": "openrouter",

"model": "anthropic/claude-3.5-sonnet",

"min_questions": 2,

"sensitivity": "high",

"watched_paths": ["src/", "lib/"],

"blocked_paths": ["*.lock", "dist/", "*.generated.ts"]

}

```jsx

---

## Database — Supabase

Only the dashboard server talks to Supabase. The CLI never connects
directly — it reports analytics via HTTP to the dashboard API.

Tables:

- `teams` — team / org
- `developers` — users, linked to a team
- `projects` — repos, linked to a team
- `sessions` — one row per audit run (scores + metadata only, no diff or Q&A text)

The Supabase client lives in the dashboard package.
The shared API client lives in `packages/shared/src/api.ts`.

If the dashboard URL is not configured, analytics reporting must
fail silently (warn to stderr only — never block a push).

---

## Shared types

All types live in `packages/shared/src/types.ts` and are imported
by both CLI and dashboard. Never redefine types locally in a package.

Key types: Outcome, VouchConfig, Session, SessionQuestion,
Developer, Project, SessionPayload.

---

## CLI commands

| Command | Description |
|---------|-------------|
| `vouch check` | Run the audit on the last commit — called by pre-push hook |
| `vouch init` | Write pre-push hook to .git/hooks/pre-push, create .vouchrc |
| `vouch login` | Interactive credential setup |
| `vouch whoami` | Print current auth state |
| `vouch logout` | Delete ~/.vouch/credentials |

Entry point: `packages/cli/src/index.ts`
Commands: `packages/cli/src/commands/*.ts`
Lib: `packages/cli/src/lib/*.ts`

---

## Error handling rules

- If Vouch itself crashes unexpectedly: print the error, exit 0 (never block a push due to a Vouch bug)
- If the developer fails the audit: exit 1 (blocks the push)
- If dashboard is unavailable: warn to stderr, continue (analytics are optional)
- If AI provider fails: print clear error with instructions, exit 0
- If .vouchrc is missing: use defaults, do not throw

---

## What is NOT built yet

- No dashboard (Next.js) — CLI first
- No team OAuth — solo mode only for now
- No GitHub App or merge gates
- No voice interface
- No web server or backend proxy — CLI calls AI directly using the user's own key

Do not scaffold any of the above unless explicitly asked.

---

## Current build phase

Phase 1 — Proof of concept. The goal right now is to get
`vouch check` working end to end:

1. Read git diff
2. Send to AI
3. Ask questions in terminal
4. Accept typed answers
5. Print pass or fail
6. Report analytics to dashboard if configured (scores + metadata only)

See the Claude Code Prompts page in Notion for the full
step-by-step build sequence.

---

## Session orchestration (tmux multi-agent)

I (the planner) dispatch work to agents via tmux sessions.
Each message requires two separate Bash calls: one to type,
one to press Enter.

| Session | Role | Responsibility |
|---------|------|----------------|
| `agent-developer` | Coder | Implements code from my plan |
| `agent-reviewer` | Reviewer | Reads files, produces structured review |

Flow:
- Planner `→` agent-developer — implement features, fix bugs, refactor
- Planner `→` agent-reviewer — code review after implementation
- I poll every ~10s via `tmux capture-pane` to check progress
```