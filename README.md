# Vouch

> The git push that makes you prove you understand your own code.

Vouch intercepts `git push` and interviews you about your changes before letting them through. It reads your diff, sends it to an AI, and asks you 2–3 targeted questions in the terminal. Answer well — push goes through. Answer poorly — push is blocked.

This is not a code review tool. **It reviews the developer, not the code.**

---

## Why

AI-generated code is everywhere. Developers are shipping code they didn't write and don't fully understand. Vouch puts a lightweight checkpoint between your keyboard and your remote — a moment where you have to demonstrate understanding before your changes land.

---

## How it works

```
git push
  └── pre-push hook fires vouch check
        └── reads git diff
        └── sends diff to AI
        └── AI generates 2–3 targeted questions
        └── you answer in the terminal
        └── AI evaluates your understanding
              ├── pass → push proceeds (exit 0)
              └── flag → push is blocked (exit 1)
```

---

## Quick start

```bash
# Install
npm install -g @vouch/cli

# Set up your API key
vouch login

# Install the git hook in any repo
cd your-project
vouch init

# That's it — your next git push will trigger vouch automatically
```

---

## CLI commands

| Command | Description |
|---|---|
| `vouch check` | Run the audit on the latest commit (called by pre-push hook) |
| `vouch init` | Install the pre-push hook and create `.vouchrc` |
| `vouch login` | Set up your AI provider and API key |
| `vouch whoami` | Print current auth state |
| `vouch logout` | Remove stored credentials |

---

## Configuration

Vouch is configured per-repo via `.vouchrc` at the git root:

```json
{
  "provider": "openrouter",
  "model": "anthropic/claude-3.5-sonnet",
  "min_questions": 2,
  "sensitivity": "high",
  "watched_paths": ["src/", "lib/"],
  "blocked_paths": ["*.lock", "dist/", "*.generated.ts"]
}
```

Credentials (API keys) are stored in `~/.vouch/credentials` — never in the repo.

### Supported AI providers

| Provider | Notes |
|---|---|
| `openrouter` | Default — access to many models via one key |
| `anthropic` | Claude direct |
| `ollama` | Local inference, no API key needed |

---

## Monorepo structure

```
vouch/
├── packages/
│   ├── cli/          # @vouch/cli — the CLI tool, published to npm
│   ├── dashboard/    # @vouch/dashboard — local session history dashboard
│   └── shared/       # @vouch/shared — shared types + Supabase client
├── examples/
│   ├── solo-setup/   # Single developer setup
│   └── team-setup/   # Team setup with Supabase logging
└── .vouchrc.example
```

**Stack:** pnpm · Turborepo · TypeScript · tsdown · Biome · Supabase

---

## Development

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm lint
```

---

## What's not built yet

- Dashboard UI (Next.js) — CLI ships first
- Team OAuth — solo mode only for now
- GitHub App / merge gate integration
- Voice interface

---

## Error handling philosophy

Vouch follows a strict rule: **it must never block a push due to its own bugs.**

- Vouch crash → exit 0 (push proceeds)
- Developer fails the audit → exit 1 (push blocked)
- AI provider down → warn, exit 0
- Supabase unavailable → warn to stderr, push proceeds
