# CLAUDE.md - PROJECT_NAME

<!-- Copied from web-dev-course/template. Replace PROJECT_NAME and the "What this is" section; keep the rest unless you have a reason. -->

## What this is
ONE_PARAGRAPH_DESCRIPTION. The owner is a hobbyist developer: strong in SQL and data, new to web engineering. Explain new concepts briefly the first time they appear, prefer explicit over magic, and treat "why" questions as part of the work.

The plan and progress log live in `LEARNING.md`. **Read it at the start of every session** and say which phase we are on before doing anything else.

Course reference (stack facts, limits, settings): https://github.com/rishipkothari/web-dev-course/blob/main/stack.md

---

## Stack

| Piece | Choice |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| Hosting | Vercel |
| Database | Neon Postgres (`production` root branch, `development` child) |
| DB access | Drizzle ORM; migrations with drizzle-kit |
| Auth | Better Auth (self-hosted), Drizzle adapter |
| UI | Tailwind CSS + shadcn/ui |
| Tests | Vitest; Playwright smoke test |
| Errors | Sentry |

Do not swap, add or remove a stack piece without asking. Read `AGENTS.md`: this Next.js version differs from your training data, and its docs are in `node_modules/next/dist/docs/`.

---

## Environments and secrets

| Environment | Git branch | Neon branch | Secrets live in |
|---|---|---|---|
| Local PC | feature branches | `development` | `.env.local` |
| Cloud session | feature branches | `development` | cloud environment variables |
| Preview | non-`main` branches | `development` | Vercel Preview variables |
| Production | `main` | `production` | Vercel Production variables only |

- **Never ask the owner to paste a secret, token, key or password into chat.** Name the dashboard and the variable; they enter it there.
- **Never read secret files.** Do not open, print, copy or grep `.env`, `.env.local` or any `.env.*` other than `.env.example`. If you need to know whether a variable is set, check `process.env.NAME !== undefined` in code or ask.
- This session holds **development values only**. Never request, accept or use a production connection string.
- Never commit `.env*` other than `.env.example`.
- When adding a variable: add the name to `.env.example` with a comment, then list every place it must be set (`.env.local`, cloud environment, Vercel Preview, Vercel Production) and which value goes where.
- After any Vercel variable change, remind the owner to redeploy.

---

## Git

- Pull before starting. One branch per task, named in snake_case after the task (`add_guestbook_table`).
- Never commit to, push to, or merge into `main`. Changes reach `main` only through a pull request the owner merges.
- Do not commit without permission. When told to commit: message of at most 6 sentences, then push the branch, then remind the owner the branch is pushed and where.
- Open a pull request only when the owner asks.
- Before the session ends or the owner switches machines, everything must be pushed.

---

## Database

- All schema changes go through `src/db/schema.ts` and `npx drizzle-kit generate`. **Never** run `drizzle-kit push`. Never write DDL by hand into the database or ask the owner to click it in a dashboard.
- After generating, show the owner the generated SQL and point out anything destructive (`DROP`, `ALTER ... TYPE`, `SET NOT NULL`, renames) before applying.
- Apply migrations to the `development` branch only (`npx drizzle-kit migrate`). Production migrations run only inside the Vercel production build (`scripts/vercel_build.mjs`), which happens when the owner merges a PR to `main`. Never run a migration against production any other way.
- Never edit or delete a migration file that has been applied anywhere. Fix forward with a new migration.
- Risky changes (rename, drop, type change, NOT NULL on existing rows, backfills) use expand and contract across separate PRs. Propose the steps first.
- `relations()` do not create foreign keys; use `.references()` for real constraints.
- Use the `db-change` skill for every schema change.

---

## Auth and authorization

- Every server action, route handler and protected page checks the session itself with `auth.api.getSession`. The `proxy.ts` cookie check is a convenience redirect, never the security check.
- Every query that reads or changes user-owned rows filters by the session user's id on the server. Never trust a user id sent from the browser.
- New auth tables come from `npx auth@latest generate`, then the normal Drizzle migration flow.

---

## Testing and CI

- Pure logic (calculations, parsing, date math) gets Vitest tests in the same PR.
- Before saying a task is done: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` pass locally or in the container. Use the `ship-check` skill.
- CI (`.github/workflows/ci.yml`) must pass before merge. Do not weaken or skip a check to make it pass; ask.

---

## Ask before

- Adding, removing or upgrading a dependency.
- Swapping or adding any stack piece or service, especially anything paid.
- Anything that touches production: data, variables, deploys, the Neon `production` branch.
- Deleting files you did not create in this task.
- Changing `.claude/`, `.github/`, or this file.

---

## Session start

1. Read `LEARNING.md`; say the current phase and the next step.
2. `git status` and the current branch; pull if behind.
3. Propose a short plan (plan mode for anything over one file). Build after the owner agrees.

## End of a phase
Add an entry to `LEARNING.md`: what we did, why, what each new setting means, what breaks if it is wrong.

---

## Style and naming

- No em dashes (the long dash). Use hyphens or other plain ASCII.
- Descriptive snake_case names for variables, functions, database columns and files we choose. Exceptions the tools force: React components are PascalCase (`GuestbookForm`), framework files keep their names (`page.tsx`, `route.ts`, `proxy.ts`), and skill folders use hyphens.
- Short comments where a beginner would ask "why?".
