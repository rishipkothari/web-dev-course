---
order: 18
part: C - Production readiness
title: Rollback and restore drills
minutes: 45
---

# 18 - Rollback and restore drills

**Goal:** you have rolled back bad code, restored lost data, and rotated a secret, each once, calmly, before you ever need to.

**Why:** recovery steps you have never practised are recovery steps you will get wrong under stress. These three drills cover most real incidents.

## Drill 1: roll back code (10 minutes)

1. Merge a visible, harmless "bad" change (wrong heading text).
2. Vercel -> Deployments -> the previous production deploy -> **Instant Rollback**. Production serves the old code within seconds, no rebuild.
3. Fix forward properly: revert the PR on GitHub (the "Revert" button on the merged PR makes a new PR), merge it.
4. Note: after a rollback, Vercel may stop automatically promoting new `main` deploys to production until you undo the rollback. Read the banner on the project page and note what it says in your runbook.

Remember: rollback swaps **code only**. The database keeps whatever migrations ran.

## Drill 2: restore data (20 minutes)

The setup: you delete rows on production that you should not have.

1. Note the time. On production (via the app, as yourself), delete a few of your own guestbook entries.
2. Neon console -> `production` -> create a **branch from a point in time** a few minutes before the deletion. Name it `recovery_<date>`. This is within the **6-hour** free history window; after 6 hours this drill is impossible.
3. Query the recovery branch in the SQL editor: the rows are there.
4. Copy just those rows back: `INSERT INTO guestbook_entries SELECT ... ` from an export of the recovery branch, run on production in the SQL editor. (Copying selected rows back is the realistic recovery; restoring the whole branch would also undo everything else that happened since.) This hand-run SQL is a data fix, not a schema change, so it does not conflict with the migration rule.
5. Delete the recovery branch.

Takeaway for the free plan: if you will make a risky change, branch production **first** (module 11). A named branch does not expire.

## Drill 3: rotate a secret (10 minutes)

Pretend the production Google client secret leaked.

1. Google Cloud Console -> APIs & Services -> Credentials -> your OAuth client -> add a new client secret.
2. Neon Console, `production` branch -> Settings -> Auth -> OAuth providers -> Google -> replace the secret. No Vercel change and no redeploy: Neon holds it.
3. Sign in on production: works.
4. Delete the old secret in Google Cloud.

Same pattern for any key: create new, deploy new, verify, revoke old. Never revoke first.

## Write it down

Add a "Runbook" section to `LEARNING.md` with the three procedures in your own words, and the date you practised each.

**Done when:** all three drills are done and in your runbook.
