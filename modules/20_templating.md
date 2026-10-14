---
order: 20
part: C - Production readiness
title: Turn it into a template
minutes: 45
---

# 20 - Turn it into a template

**Goal:** a GitHub template repo with auth, database, UI, CI and agent guardrails already wired, so a new project is live in under an hour.

**Why:** "start every project from the same template" is the habit that makes everything above automatic. The agent sees working patterns from the first prompt and copies them.

## Steps

1. **New repo** `nextjs_starter` (public). Copy the finished tutorial project into it, then strip it to the bones: keep sign-in, the session page, one example table with its migration, the environment badge, the shadcn components you used, one unit test, the smoke test, and the whole guardrail kit (`CLAUDE.md`, `.claude/`, `.github/`, `scripts/`).
2. **Reset migrations** for a fresh start: delete `drizzle/` and regenerate a single initial migration from the stripped schema (this repo has never been applied anywhere, so this is the one time deleting migrations is fine).
3. **Placeholders:** `CLAUDE.md` top section and `README.md` say PROJECT_NAME.
4. **Make it a template:** Settings -> General -> Template repository.
5. **Write `docs/new_project_checklist.md`** in the starter (below), and test it by creating a throwaway project from the template and timing yourself.

## New project checklist (target: under an hour)

1. GitHub: "Use this template" -> new public repo. Clone it.
2. Squash-only merges; `main` ruleset with required `ci` check (module 6, 7).
3. Neon: new project; `development` branch; strings into `.env.local` (module 4).
4. Neon Auth on both branches with email and password; trusted domains (modules 12, 13). Optional: a Google OAuth client for `production` entered in the Neon Console (module 13b).
5. `.env.local`: all development values. `npm install`, `npx drizzle-kit migrate`, `npm run dev`, sign in.
6. Vercel: import the repo; Preview and Production variables; deploy (module 5).
7. Sign in on production.
8. Sentry project and uptime monitor (module 17).
9. Update `CLAUDE.md` "What this is"; start `LEARNING.md` with the environment table.
10. Re-run the vendor skill installs to pick up newer versions; review the diffs.

## Keep it alive

When a project teaches you something (a new rule, a better skill, a fixed gotcha), copy it back into the starter in a small PR. A template that is never updated slowly becomes the thing you fight.

**Done when:** a throwaway project went from template to signed-in-on-production with the checklist, and you noted how long it took.
