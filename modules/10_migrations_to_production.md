---
order: 10
part: B - The hygiene loop
title: Migrations to production
minutes: 40
---

# 10 - Migrations to production

**Goal:** merging a PR that contains a migration applies it to production automatically, in the right order, and a failed migration cannot take the site down.

**Why:** the question "who runs prod migrations, and when?" needs exactly one answer. Here it is: the Vercel production build, every time, triggered only by merging to `main`.

## How it works

`package.json` has a `vercel-build` script. When it exists, Vercel runs it instead of `build`. Ours (`scripts/vercel_build.mjs`) does:

1. If `VERCEL_ENV` is `production`: run `drizzle-kit migrate` against the production branch (using `DATABASE_URL_UNPOOLED`, which exists only in Vercel Production).
2. Run `next build`.
3. Only if both succeed does Vercel switch traffic to the new deploy.

If the migration fails, the build fails and the previous deploy keeps serving. Preview builds skip step 1, because several branches share the development database and must not migrate it in parallel.

## Steps

1. **Copy `scripts/vercel_build.mjs`** and add `"vercel-build": "node scripts/vercel_build.mjs"` to `package.json` (both in the template).
2. **Check the variables:** Vercel Production has `DATABASE_URL_UNPOOLED` (production direct string). Preview does not need it.
3. **Ship the guestbook table:** PR with the migration from module 8 -> CI green -> preview works (it uses development, already migrated) -> squash merge.
4. **Read the production build log** (Deployments -> the new production deploy -> Building). Find the `[vercel_build] migrate production` line and the SQL drizzle-kit ran.
5. **Confirm** in the Neon console, `production` branch: the table exists and `__drizzle_migrations` has a row.

## The ordering you must understand

The migration runs **before** the new code is live, and **stays** if you later roll back the code (Vercel's instant rollback only swaps code).

- **Additive** migrations (new table, new nullable column) are harmless under both: old code ignores the new shape.
- **Destructive** ones (drop, rename, type change, NOT NULL) can break the old code that is still serving for a minute, or the old code you roll back to. They need expand and contract: module 11.

## Fix forward, not back

There is no "down migration" here. If a migration was wrong, write a new one that corrects it. On production you never edit or delete an applied migration, and you never hand-run SQL to "fix" the schema, because then the files and the database disagree, and the next generate will be wrong.

## Break it on purpose

Make the production migrate step fail without touching any data:

1. In Vercel Production variables, edit `DATABASE_URL_UNPOOLED` and change one character of the password. (Copy the original from the Neon console first; Sensitive values cannot be read back.)
2. Merge any small PR (or Redeploy production).
3. Watch the build fail at `[vercel_build] migrate production` with an authentication error.
4. Open the production URL: still up, serving the previous deploy.
5. Restore the correct value from the Neon console, redeploy, confirm green.

The lesson: a broken migration step blocks the deploy, it does not break the site.

**Done when:** one migration has reached production through a merge, and you have watched a failing one leave the site running.
