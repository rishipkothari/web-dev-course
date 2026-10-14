---
order: 13.5
part: B - The hygiene loop
title: Add Google sign-in beside email and password
minutes: 45
---

# 13b - Add Google sign-in beside email and password

**Goal:** "Continue with Google" works next to the email and password form, on localhost and on production, and you can describe every hop of the OAuth flow.

**Why:** most real apps offer both: a form for people who want a password of their own, and a social button for people who do not. OAuth is the piece most people treat as magic. In development you register nothing, so you can watch each redirect first. In production you register your own Google client, and the error you get when a URL is wrong will make sense because you saw the working version.

## The flow in six hops

1. Your sign-in button calls `authClient.signIn.social({ provider: "google", callbackURL: "/" })`. The request goes to **your app's** `/api/auth/...` route.
2. Your route forwards it to the **branch's Auth URL** (`NEON_AUTH_BASE_URL`), which redirects the browser to Google.
3. You log in at Google and approve. In development the consent screen shows Neon's name, because Neon's shared Google credentials are in use.
4. Google redirects back to the **Neon Auth URL** + `/callback/google` with a one-time code. Neon swaps the code for tokens, server to server, and finds or creates your user in `neon_auth`.
5. Neon sends the browser back to your `callbackURL`, but only if that origin is a **trusted domain** for this branch.
6. Your app's `/api/auth` route sets the same signed session cookie as the email and password flow.

Notice what you did not register in development: no Google app, no callback URL. Neon's shared development credentials cover hops 3 and 4.

## Development: you do almost nothing

Google is on by default on `development` with Neon's shared credentials. Check in Neon Console, `development` branch -> Settings -> Auth -> OAuth providers.

## Claude builds (ask: "add a Continue with Google button next to the email form, following the neon-auth skill")

- A button calling `authClient.signIn.social({ provider: "google", callbackURL: "/" })`.
- No new tables: Google users land in the same `neon_auth` user table, with a row in the account table that names Google as the provider.

## Check on development

1. Sign in with Google on localhost, then look at `neon_auth` in the Neon SQL editor. Compare the account rows for your email and password user and your Google user.
2. **Same email, two methods.** Sign in with Google using an email address you already registered with a password. Does Neon link the two to one user or create two? Neon's docs do not say; write what you observe in `LEARNING.md`. This is the question every app with both methods has to answer.

## Production

1. **Your own Google OAuth client.** Google Cloud Console -> create a project named after the app -> APIs & Services:
   - **OAuth consent screen:** user type **External**; app name; your email. Leave it in **Testing** and add yourself (and anyone else who will sign in) as **test users**.
   - **Credentials -> Create credentials -> OAuth client ID**, type Web application. **Authorized redirect URI:** the URL shown in Neon's "Add OAuth provider" dialog for the `production` branch (the production Auth URL + `/callback/google`). Not your Vercel URL: Google sends the code to Neon (hop 4).
2. **Give the credentials to Neon, not Vercel.** Neon Console, `production` branch -> Settings -> Auth -> OAuth providers -> Google -> Configure: paste the client id and secret directly there.
3. Ship the button through the normal loop and sign in with Google on production. The consent screen now shows **your** app name.

Settings on `development` do not exist on `production`: the trusted domain and the email and password setting were done in module 13, but the Google client is a separate step per branch.

## Previews

Previews use `development`, so Google works there through Neon's shared credentials once the wildcard trusted domain from module 13 is in place. Claude cannot finish a Google login in its container (it needs your Google account), so you click through the Google step yourself on a preview.

## Break it on purpose

1. **Wrong redirect URI.** In Google Cloud, change the authorized redirect URI of your production client by one character. Sign in on production. Read Google's `redirect_uri_mismatch` error. Fix it.
2. **Untrusted origin.** On `development`, remove the preview wildcard (or turn Allow Localhost off), sign in with Google, and read the error from hop 5. Put it back.
3. **Test users.** Sign in on production with a Google account that is not listed as a test user. Read the error and why the consent screen's Testing state causes it.

## Emergency lever

A leaked Google client secret is rotated entirely in Google Cloud and the Neon Console, no redeploy (module 18, drill 3).

**Done when:** both sign-in methods work on localhost and production, the same-email question is answered in `LEARNING.md`, and the broken versions produced errors you could explain.
