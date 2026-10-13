---
order: 9
part: B - The hygiene loop
title: Migrations on development
minutes: 40
---

# 09 - Migrations on development

**Goal:** apply migrations to the `development` branch, seed it, and reset it from production when it gets messy.

**Why:** development is where you are allowed to break things. Knowing you can reset it in one click is what makes experimenting relaxed.

## Steps

1. **Apply:**
   ```powershell
   npx drizzle-kit migrate
   ```
   It applies every migration not yet recorded in the database. Drizzle tracks applied ones in a table called `__drizzle_migrations` (schema `drizzle`). Look at it in the Neon SQL editor (development branch selected): one row per applied migration.
2. **Look:** `npx drizzle-kit studio` opens a table browser on development. Add a row by hand.
3. **Seed.** Ask Claude for `scripts/seed_development.ts` that inserts a few sample rows, plus an npm script `seed`. Seeds are for development only; the script should refuse to run when `VERCEL_ENV` is `production`.
4. **Show it.** Ask for a page that lists guestbook entries (a server component querying with Drizzle). Run `npm run dev` and see your rows.
5. **The `db-change` skill.** From now on, start every schema change with "use db-change to add X". Read the skill once so you know what it will ask you.

## Reset from parent (the dev safety net)

Development drifts: test rows, half-finished migrations. To start clean:

1. Neon console -> Branches -> `development` -> Reset from parent.
2. `development` now equals `production`: same schema, same data. Anything only on development is gone.
3. `npx drizzle-kit migrate` again applies whatever migrations your branch has that production does not yet.

## Break it on purpose

1. Add a column `author_name` (text) to the schema, generate, migrate.
2. Now edit that migration file (change the column type) and run `migrate` again. Nothing happens: drizzle-kit recorded it as applied and will never run it again. This is why **applied migrations are never edited**.
3. Undo the mess: delete the edited migration file and its snapshot entry (Claude can do this, since it was never merged anywhere), revert the schema, then reset `development` from parent.

## Rules (also in `CLAUDE.md`)

- Migrations apply to development by hand, and to production only through the production build (module 10).
- An applied migration is never edited. Fix forward with a new one.
- Never `drizzle-kit push`.

**Done when:** the page lists seeded rows, you have reset development once, and you can explain why editing an applied migration does nothing.
