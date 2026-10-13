---
order: 4
part: A - Setup
title: Neon - branches and connection strings
minutes: 40
---

# 04 - Neon: branches and connection strings

**Goal:** one Neon project with a `production` branch and a `development` branch, and the development connection strings wired into `.env.local`.

**Why:** a Neon branch is a full copy of the database (schema and data) that shares storage with its parent until something changes. That makes "a safe copy of prod to experiment on" nearly free, which is the whole reason this course uses Neon.

## Steps

1. **Create the project** in the Neon console. Name it after the app. Pick the AWS region nearest your Vercel functions (US East is a good default for Philadelphia).
2. **Branches.** Neon creates a root branch called `production`. If it did not also create `development`, create it: Branches -> New branch -> parent `production` -> name `development`.
3. **Get the two development strings.** With the `development` branch selected, open Connect:
   - Pooling **on**: the host contains `-pooler`. This is `DATABASE_URL`.
   - Pooling **off**: no `-pooler`. This is `DATABASE_URL_UNPOOLED`.
4. **Paste both into `.env.local`** (your editor, not a chat).
5. **Label the danger.** Look at the production branch's host name and note how it differs from development's (each branch has its own endpoint id, `ep-...`). Write that difference in your environment table in LEARNING.md. When you ever see a connection string, you should be able to tell which branch it is at a glance.
6. **Cloud sessions:** put the same two development values in the Claude cloud environment's variables, and allow Neon's host in its network settings if the session needs database access.

## Pooled vs direct, in one paragraph

Serverless functions open and close connections constantly; Postgres handles that badly. The pooler (PgBouncer) sits in front and reuses a small set of real connections. The app uses it. Migrations need a real, continuous session (they run several statements and may take locks), so drizzle-kit uses the direct string.

## Reset from parent

`development` will get messy. **Reset from parent** throws away everything on it and replaces it with a fresh copy of `production`'s current schema and data. Branches -> `development` -> Reset from parent. There is no undo, which is fine for dev and is why `production` (a root branch) cannot be reset at all.

## Free-tier facts that matter

- Compute sleeps after 5 minutes idle; the first query after that is slower.
- History window is **6 hours**: you can restore or branch from any moment in the last 6 hours, no further. Module 18 drills this.
- 10 branches per project, 1 GB per project.

## Check

Ask Claude to write a tiny script that runs `select current_database(), now()` using `DATABASE_URL` and prints the result (it reads the variable in code; it never opens `.env.local`). It should succeed. Then look at the Neon console: `development` shows recent activity, `production` does not.

## What breaks if it is wrong

- Pooled string used for migrations: occasional strange migration errors.
- Production string in `.env.local`: everything you do locally hits real data. This is the one to never get wrong.

**Done when:** `.env.local` has both development strings, the test query works, and your environment table says how to tell the branches apart.
