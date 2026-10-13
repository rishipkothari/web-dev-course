---
name: db-change
description: Use for every database schema change in this project - adding, altering, renaming or dropping tables, columns, indexes or constraints with Drizzle. Walks through schema edit, generated migration, SQL review, and applying to the development branch only.
---

# Database change (Drizzle + Neon)

Follow these steps in order. Do not skip the review step.

## 1. Classify the change
- **Safe (additive):** new table, new nullable column, new column with a default, new index.
- **Risky:** rename, drop, type change, `NOT NULL` on a column that already has rows, unique constraint on existing data, backfill.

If risky, stop and propose an **expand and contract** plan across separate PRs before writing anything:
1. Expand: add the new shape alongside the old (new column, nullable).
2. Migrate code: write to both, read from the new; backfill in a separate migration or script.
3. Contract: once production runs the new code, drop the old shape in a later PR.

## 2. Edit the schema
Change `src/db/schema.ts` only. Use snake_case for table and column names. Use `.references()` for foreign keys (`relations()` does not create them).

## 3. Generate
`npx drizzle-kit generate --name <snake_case_description>`
If drizzle-kit asks whether a column was renamed or created, stop and ask the owner; the wrong answer drops data.

## 4. Review
Show the owner the full generated `.sql` file. Call out every `DROP`, `ALTER COLUMN ... TYPE`, `SET NOT NULL`, `RENAME`, and anything that rewrites a large table. Wait for the owner's go-ahead.

## 5. Apply to development
`npx drizzle-kit migrate` (uses `DATABASE_URL_UNPOOLED` from `.env.local` or the cloud environment, which must be the `development` branch). Then confirm with a query or `npx drizzle-kit studio`.

## 6. Commit together
The schema change and its migration file go in the same commit as the code that uses them.

## Never
- `drizzle-kit push`.
- Editing or deleting a migration that has been applied anywhere. Fix forward with a new one.
- Running a migration against production. Production migrates only inside the Vercel production build, when the owner merges to `main`. That means the migration is live before the new code: anything not purely additive needs the expand and contract plan from step 1.
