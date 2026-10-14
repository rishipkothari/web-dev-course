---
order: 13
part: B - The hygiene loop
title: Auth in production (and previews)
minutes: 45
---

# 13 - Auth in production (and previews)

**Goal:** sign-in works on the production URL with your own Google credentials, and on preview deploys against `development`.

**Why:** each Neon branch has its own auth: its own Auth URL, users, OAuth credentials and trusted domains. Settings you made on `development` in module 12 do **not** exist on `production`. Forgetting that is the classic deploy-day auth failure with this stack.

## Production

1. **Enable auth on `production`.** Neon Console -> select the `production` branch -> Better Auth -> Enable Auth (skip if it already shows as enabled). Copy its **Auth URL**. It must differ from development's.
2. **Your own Google OAuth client.** Google Cloud Console -> create a project named after the app -> APIs & Services:
   - **OAuth consent screen:** user type **External**; app name; your email. Leave it in **Testing** and add yourself (and anyone else who will sign in) as **test users**.
   - **Credentials -> Create credentials -> OAuth client ID**, type Web application. **Authorized redirect URI:** the URL shown in Neon's "Add OAuth provider" dialog for the `production` branch (the production Auth URL + `/callback/google`). Not your Vercel URL: Google sends the code to Neon (hop 4).
3. **Give the credentials to Neon, not Vercel.** Neon Console, `production` branch -> Settings -> Auth -> OAuth providers -> Google -> Configure: paste the client id and secret directly there.
4. **Trusted domains on `production`:** add `https://<your-app>.vercel.app`. Turn **Allow Localhost off**.
5. **Vercel Production variables:** `NEON_AUTH_BASE_URL` = the **production** Auth URL; `NEON_AUTH_COOKIE_SECRET` = a new value (Sensitive; never reuse the local one).
6. **Ship the auth code** from module 12 through the normal loop, then redeploy if you changed variables after the last deploy.
7. Sign in on production. The consent screen now shows **your** app name. In the Neon SQL editor on `production`, find your user in `neon_auth`.

## Previews

Previews use the `development` branch, which already has Google working through Neon's shared credentials. The only missing piece is that Neon must trust the preview URLs (hop 5).

1. **Vercel Preview variables:** `NEON_AUTH_BASE_URL` = the **development** Auth URL; `NEON_AUTH_COOKIE_SECRET` = its own value.
2. **Trusted domain on `development`:** add a wildcard for preview URLs. Previews look like `https://<project>-<hash>-<team>.vercel.app`. Try `https://<project>-*-<team>.vercel.app` first.
3. Open a preview deploy and sign in.
4. If Neon rejects the wildcard, or sign-in still fails on the preview, pick one and write the choice in `LEARNING.md`:
   - **`https://*.vercel.app` on `development` only.** It works, at the cost that the dev branch would send people back to any Vercel site. Acceptable for dev-only test users. Never on `production`.
   - **No sign-in on previews.** Test signed-in flows locally; use previews for everything else.

## Break it on purpose

On a preview: remove the `development` wildcard trusted domain, sign in, read the error. Put it back. (Not on production; the same mistake there locks real users out.)

## Emergency levers

- **A user's sessions:** delete their session rows in `neon_auth` on `production`, in the SQL editor. This is a data fix, like module 18's restore, not a schema change.
- **Everyone:** rotate `NEON_AUTH_COOKIE_SECRET` in Vercel Production and redeploy, **if** module 12 showed that rotating it signs people out. If it did not, the session rows are the lever.
- **A leaked Google client secret:** rotation happens entirely in Google Cloud and the Neon Console, no redeploy (module 18).

Know these exist; do not practise them on production.

**Done when:** you are signed in on production with your own Google consent screen, your user row is on the `production` branch, and previews either sign in or have a written reason why not.
