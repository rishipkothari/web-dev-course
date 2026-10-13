# template - the project kit

Files to copy into any new project built on this stack. It is not a runnable app on its own: it is the rules, guardrails and config that make an app safe to build with an AI agent. Module 20 turns a finished project, with this kit inside it, into a GitHub template repo you start every new project from.

## What is here

| Path | What it does | Module |
|---|---|---|
| `CLAUDE.md` | The agent's rulebook. Edit the top section per project | 2 |
| `.claude/settings.json` | Blocks the agent from reading or editing secret files; registers the hooks | 2 |
| `.claude/hooks/guard_commands.mjs` | Blocks: push or commit on `main`, force push, `gh pr merge`, `drizzle-kit push`, production-targeted commands, shell reads of `.env*` | 2 |
| `.claude/hooks/session_start.sh` | Cloud sessions only: install the Node version from `.nvmrc`, then `npm install` | 2 |
| `.claude/skills/db-change/` | The schema-change procedure | 9 |
| `.claude/skills/new-feature/` | Branch, plan, then build | 6 |
| `.claude/skills/add-secret/` | New environment variable without ever handling its value | 5 |
| `.claude/skills/ship-check/` | The CI checks, run locally, plus a merge summary | 7 |
| `.github/workflows/ci.yml` | Lint, typecheck, tests, migration check, build on every PR | 7 |
| `scripts/vercel_build.mjs` | Production builds migrate first, then build | 10 |
| `drizzle.config.ts` | drizzle-kit settings | 8 |
| `.env.example` | Variable names, no values | 3 |

## Copying it into a project (Windows PowerShell, from the course repo folder)

```powershell
$target = "C:\code\my_new_project"
Copy-Item -Recurse -Force template\.claude, template\.github, template\scripts $target
Copy-Item -Force template\CLAUDE.md, template\.env.example, template\drizzle.config.ts $target
```

Then in the project:

1. Edit the top of `CLAUDE.md` (project name and description).
2. Add these scripts to `package.json`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "vercel-build": "node scripts/vercel_build.mjs",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run"
}
```

3. Install the vendor skills (review each `SKILL.md` first):

```powershell
npx skills add neondatabase/agent-skills --skill neon-postgres -a claude-code
npx skills add better-auth/skills -a claude-code
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices -a claude-code
```

Check each one ended up as a folder under `.claude/skills/`. If it only landed in `.agents/skills/`, copy the folder into `.claude/skills/`. Commit them, so cloud sessions get them too.

4. If the project already had a `.claude/settings.json`, merge by hand: keep both sets of hooks.

## Adding your own skill
Ask Claude: "use the skill-creator skill to make a skill for X". Put it under `.claude/skills/<name-with-hyphens>/SKILL.md`, commit it, and copy it back into this template if every project should have it.
