---
order: 13
part: B - The hygiene loop
title: Auth in production (and previews)
minutes: 40
---

# 13 - Auth in production (and previews)

**Goal:** email and password sign-in works on the production URL, and on preview deploys against `development`.

**Why:** each Neon branch has its own auth: its own Auth URL, users, settings and trusted domains. Settings you made on `development` in module 12 do **not** exist on `production`. Forgetting that is the classic deploy-day auth failure with this stack.

## Production

1. **Enable auth on `production`.** Neon Console -> select the `production` branch -> Better Auth -> Enable Auth (skip if it already shows as enabled). Copy its **Auth URL**. It must differ from development's.
2. **Match the settings.** Email and password enabled. Email verification: leave it as you decided in module 12, and read the note below.
3. **Trusted domains on `production`:** add `https://<your-app>.vercel.app`. Turn **Allow Localhost off**.
4. **Vercel Production variables:** `NEON_AUTH_BASE_URL` = the **production** Auth URL; `NEON_AUTH_COOKIE_SECRET` = a new value (Sensitive; never reuse the local one).
5. **Ship the auth code** from module 12 through the normal loop, then redeploy if you changed variables after the last deploy.
6. Create an account on production and sign in. In the Neon SQL editor on `production`, find your user in `neon_auth`.

**Email in production.** Neon's shared sender is for development only. With email verification **off**, anyone can create an account under any address, and password reset cannot send mail. That is acceptable for a playground with no real users, and unacceptable for a real project. A real project needs your own SMTP provider and a domain you own before launch (`stack.md` section 9a). Record in `LEARNING.md` that this playground runs without it.

## Previews

Previews use the `development` branch, so email and password already works against it. The only missing piece is that Neon must trust the preview URLs, because after sign-in it sends the browser back to your app.

1. **Vercel Preview variables:** `NEON_AUTH_BASE_URL` = the **development** Auth URL; `NEON_AUTH_COOKIE_SECRET` = its own value.
2. **Trusted domain on `development`:** add a wildcard for preview URLs. Previews look like `https://<project>-<hash>-<team>.vercel.app`. Try `https://<project>-*-<team>.vercel.app` first.
3. Open a preview deploy, create an account and sign in.
4. If Neon rejects the wildcard, or sign-in still fails on the preview, pick one and write the choice in `LEARNING.md`:
   - **`https://*.vercel.app` on `development` only.** It works, at the cost that the dev branch would send people back to any Vercel site. Acceptable for dev-only test users. Never on `production`.
   - **No sign-in on previews.** Test signed-in flows locally; use previews for everything else.

Because email and password needs no third-party app, a signed-in flow can be tested on a preview by you, and by Claude in its container, without anyone handing over a Google or GitHub login.

## Break it on purpose

On a preview: remove the `development` wildcard trusted domain, sign in, read the error. Put it back. (Not on production; the same mistake there locks real users out.)

## Emergency levers

- **A user's sessions:** delete their session rows in `neon_auth` on `production`, in the SQL editor. This is a data fix, like module 18's restore, not a schema change.
- **Everyone:** rotate `NEON_AUTH_COOKIE_SECRET` in Vercel Production and redeploy, **if** module 12 showed that rotating it signs people out. If it did not, the session rows are the lever.

Know these exist; do not practise them on production.

**Done when:** you have an account on production, your user row is on the `production` branch, and previews either sign in or have a written reason why not.
