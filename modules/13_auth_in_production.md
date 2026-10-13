---
order: 13
part: B - The hygiene loop
title: Auth in production (and previews)
minutes: 35
---

# 13 - Auth in production (and previews)

**Goal:** login works on the production URL with its own OAuth app and secrets, and you have decided how previews handle login.

**Why:** each environment needs its own OAuth app, because a GitHub OAuth app has exactly one callback URL. Mixing them up is the classic deploy-day auth failure.

## Steps

1. **Ship the auth code** from module 12 through the normal loop. The auth tables' migration runs during the production build.
2. **Second OAuth app** at GitHub, `<project> prod`:
   - Homepage: `https://<your-app>.vercel.app`
   - Callback: `https://<your-app>.vercel.app/api/auth/callback/github`
3. **Vercel Production variables** (Sensitive): `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` from the prod app; a new `BETTER_AUTH_SECRET` (never reuse the local one); `BETTER_AUTH_URL=https://<your-app>.vercel.app`.
4. **Redeploy production** (variable changes need it). Sign in on production. Check the `user` table on the `production` Neon branch.

## Previews: pick one

Preview URLs change with every deploy, so they cannot be registered as callback URLs.

- **Option A (default): no login on previews.** Test login locally; previews are for checking everything else. Simple, nothing extra to configure. Pages that require a session simply redirect to sign-in on previews.
- **Option B: Better Auth's OAuth proxy plugin.** It routes the OAuth round trip through your production URL and hands the session back to the preview. More moving parts; worth it only when you regularly need to click through logged-in flows on a preview. Read its current docs before adding it.

Start with A. Write the choice into your `LEARNING.md`.

## Break it on purpose

Set Production `BETTER_AUTH_URL` to `http://` instead of `https://`, redeploy, sign in, read the error. Fix and redeploy.

## Emergency lever

Changing `BETTER_AUTH_SECRET` in an environment invalidates every session there: everyone is logged out. That is how you respond if you think a session was stolen. Know it exists; do not practise it on production.

**Done when:** you are signed in on production, your user row is in the production branch, and your preview choice is written down.
