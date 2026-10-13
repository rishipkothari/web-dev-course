---
order: 11
part: B - The hygiene loop
title: Risky migrations - expand and contract
minutes: 50
---

# 11 - Risky migrations: expand and contract

**Goal:** rename a column with data in it, on production, without a single failed request and with a working rollback at every step.

**Why:** because migrations run before the new code and survive a code rollback (module 10), any change the old code cannot tolerate must be split into steps where both old and new code work.

## The pattern

| Step | PR | Database | Code |
|---|---|---|---|
| 1. Expand | PR 1 | Add the new shape alongside the old (nullable) | Writes both, reads old |
| 2. Backfill | PR 2 | Data migration copies old -> new | Writes both, reads new |
| 3. Enforce | PR 3 | Add `NOT NULL` / constraints on the new shape | Writes new only |
| 4. Contract | PR 4 | Drop the old shape | Old shape no longer mentioned |

At every boundary, the code currently live and the code you might roll back to both work with the database as it is.

## The drill: rename `message` to `body`

Ask Claude to "use db-change to rename guestbook_entries.message to body using expand and contract", and follow its plan:

1. **Expand:** add nullable `body`. Code inserts into both columns, still reads `message`. Merge.
2. **Backfill:** a migration with `UPDATE guestbook_entries SET body = message WHERE body IS NULL;`. Generate an empty migration with `npx drizzle-kit generate --custom --name backfill_guestbook_body` and put the SQL in it. Code switches reads to `body`. Merge.
3. **Enforce:** `body` becomes `NOT NULL`; code stops writing `message`. Merge.
4. **Contract:** drop `message`. Merge.

Check the live site after each merge.

## The dangerous cases, and what to do

| Change | Why it is dangerous | Safe approach |
|---|---|---|
| Rename column | Old code queries the old name | Expand and contract (above). When generate asks "renamed or created?", the honest answer for this pattern is "created" |
| Drop column | Rolled-back code still reads it | Stop using it first, drop in a later PR |
| `SET NOT NULL` on existing rows | Fails if any row is null | Backfill first, then enforce |
| Change type | May fail or rewrite the table | New column of the new type, backfill, switch, drop old |
| Big backfill | Long locks | Batches (`WHERE id BETWEEN ...`), outside peak hours |
| Unique constraint | Fails on existing duplicates | Query for duplicates first, clean, then add |

## Before any risky production change

Take a safety copy: Neon console -> `production` -> create a branch from it named `before_<change>_<date>`. It costs almost nothing, and unlike the 6-hour history window it does not expire. Delete it a week later (10-branch limit).

## Break it on purpose (on development only)

Generate a migration that adds `NOT NULL` to a column that has nulls in development. Run `migrate`. Read Postgres's error. Then reset development from parent.

**Done when:** `message` is gone from production, `body` holds all the data, and the site never errored along the way.
