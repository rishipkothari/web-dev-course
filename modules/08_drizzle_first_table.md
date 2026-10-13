---
order: 8
part: B - The hygiene loop
title: Drizzle - your first table
minutes: 45
---

# 08 - Drizzle: your first table

**Goal:** a table defined in TypeScript, a generated SQL migration you have read line by line, and an app page that reads from it.

**Why:** your SQL is your strongest skill. Drizzle keeps SQL visible: schema in TypeScript, but every change becomes a plain `.sql` file you can read before it runs.

## Steps

1. **Install** (ask Claude; it asks before adding dependencies):
   `drizzle-orm`, `@neondatabase/serverless`, and dev dependencies `drizzle-kit`, `dotenv`.
2. **Config.** `drizzle.config.ts` from the template: schema in `src/db/schema.ts`, migrations in `drizzle/`, credentials from `DATABASE_URL_UNPOOLED`.
3. **Database client.** Ask Claude for `src/db/client.ts` using `drizzle-orm/neon-http` and `DATABASE_URL` (pooled).
4. **Schema.** Ask for a `guestbook_entries` table: `id` (identity primary key), `message` (text, not null), `created_at` (timestamptz, default now). Compare the TypeScript with the `CREATE TABLE` you would have written.
5. **Generate:**
   ```powershell
   npx drizzle-kit generate --name create_guestbook_entries
   ```
   Open the new file under `drizzle/`. Read it. Also open `drizzle/meta/_journal.json`: that is how drizzle-kit knows which migrations exist and in what order.
6. **Do not apply it yet.** That is module 9.

## How generate works

drizzle-kit keeps a snapshot of the schema after each migration (`drizzle/meta/*.json`). `generate` compares your current `schema.ts` with the last snapshot and writes the SQL for the difference. It never looks at the database. That is why the migration files, not the database, are the source of truth.

## Read the SQL like a reviewer

For every generated file, ask:
- Does anything **drop** or **rename**?
- Does anything add `NOT NULL` to a table that might already have rows?
- Does anything change a column's **type**?
- Would it lock or rewrite a big table?

None of these apply to a new table, which is why "add a table" is the easy case. Module 11 covers the hard ones.

## Gotchas

- `relations()` in Drizzle only power its query API. They **do not** create foreign keys. Use `.references(() => other_table.id)` on the column.
- Use snake_case names in the schema; Drizzle uses your names as-is in SQL.

**Done when:** a migration file exists, you can explain every line of it, and nothing has touched the database yet.
