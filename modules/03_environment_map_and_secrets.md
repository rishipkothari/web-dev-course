---
order: 3
part: A - Setup
title: The environment map and secrets
minutes: 30
---

# 03 - The environment map and secrets

**Goal:** a one-page table, for your project, of every place the app runs, which database it touches, and where its secrets live.

**Why:** "I broke prod" almost always means "I ran something against prod that I thought was dev". The fix is not carefulness, it is a map where production is reachable from as few places as possible.

## The model

Four environments, one rule: **production values live only in Vercel Production.**

| Environment | Git branch | Runs on | Database | Secrets live in |
|---|---|---|---|---|
| Local PC | feature branches | localhost:3000 | Neon `development` | `.env.local` |
| Cloud session | feature branches | container | Neon `development` | cloud environment variables |
| Preview | non-`main` branches | Vercel preview URL | Neon `development` | Vercel Preview variables |
| Production | `main` | Vercel production URL | Neon `production` | Vercel Production variables |

Staging is left out on purpose. It earns its overhead when real users exist.

## Steps

1. Add a short "Environments" section to your project's `LEARNING.md` with the table above, filled with your real URLs (production URL, the Neon project name). No secrets, only names and URLs.
2. Open `.env.example`. For each variable, write next to it (in your head or in LEARNING.md) where each environment's value comes from. stack.md section 3 has the full table.
3. Create `.env.local` from the template:
   ```powershell
   copy .env.example .env.local
   ```
   It stays empty until module 4.

## The secrets rules

1. **Never paste a secret into a chat**, including with Claude. Type it into the dashboard or `.env.local` directly. The template's `add-secret` skill tells you where each value goes without ever seeing it.
2. **Same names, different values.** Code reads `process.env.DATABASE_URL`; which database that is depends on where the code runs.
3. **`.env.example` is the list.** Adding a variable without adding it there is how environments drift apart.
4. **Committed secret = rotated secret.** Git history is permanent, and your repos are public.
5. **`NEXT_PUBLIC_` means public.** Anything with that prefix is sent to every visitor's browser.

## Check

Without looking: which environments can reach the production database? (Answer: only Vercel Production. Not your PC, not Claude.)

**Done when:** the table is in your `LEARNING.md` and `.env.local` exists.
