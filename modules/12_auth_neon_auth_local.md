---
order: 12
part: B - The hygiene loop
title: Auth with Neon Auth (local)
minutes: 50
---

# 12 - Auth with Neon Auth (local)

**Goal:** "Sign in with Google" works on localhost against the `development` branch, you can describe every hop of the flow, and you know which parts Neon owns.

**Why:** managed auth is what most real small apps use, so the skill is not writing auth, it is wiring a managed service in correctly and knowing where it can break. Neon Auth is managed Better Auth whose users live in your own database, in the `neon_auth` schema, and branch with it (`stack.md` section 9).

**Why Google and not email/password:** email/password in production needs your own email provider and a domain. That is deferred; see `stack.md` section 9a.

## The flow in six hops

1. Your sign-in button calls `authClient.signIn.social({ provider: "google", callbackURL: "/" })`. The request goes to **your app's** `/api/auth/...` route.
2. Your route forwards it to the **development branch's Auth URL** (`NEON_AUTH_BASE_URL`), which redirects the browser to Google.
3. You log in at Google and approve. In development the consent screen shows Neon's name, because Neon's shared Google credentials are in use.
4. Google redirects back to the **Neon Auth URL** + `/callback/google` with a one-time code. Neon swaps the code for tokens, server to server, and finds or creates your user in `neon_auth`.
5. Neon sends the browser back to your `callbackURL`, but only if that origin is a **trusted domain** for this branch (`localhost` is trusted by default in development).
6. Your app's `/api/auth` route sets a session cookie, signed with `NEON_AUTH_COOKIE_SECRET`, on your app's own domain.

Notice what you did not register: no Google app, no callback URL. Neon's shared development credentials cover hops 3 and 4. In production you supply your own (module 13).

## You do

1. **Neon Console** -> your project -> select the `development` branch -> **Better Auth** -> **Enable Auth**.
2. Settings -> Better Auth -> **Project Info**: copy this branch's **Auth URL** into `.env.local` as `NEON_AUTH_BASE_URL` (and into the cloud environment, if you work there). Check it is the development branch's URL; label it the way module 4 had you label connection strings.
3. `NEON_AUTH_COOKIE_SECRET`: `openssl rand -base64 32` in Git Bash, into `.env.local`.
4. Settings -> Better Auth: confirm **Allow Localhost** is on for `development`.

## Claude builds (ask: "add Neon Auth with Google sign-in, following the neon-auth skill")

- `npm install @neondatabase/auth@latest`
- `src/lib/auth/server.ts`: `createNeonAuth` with `NEON_AUTH_BASE_URL` and the cookie secret, exported as `auth`. Fail loudly at startup if either variable is missing.
- Route handler `src/app/api/auth/[...path]/route.ts`: `export const { GET, POST } = auth.handler()`.
- `src/lib/auth/client.ts` with `createAuthClient` from `@neondatabase/auth/next`.
- Sign-in (Google) and sign-out buttons, and a page that shows the session (name, email, expiry) read on the server with `const { data: session } = await auth.getSession()`.
- `drizzle.config.ts` keeps `schemaFilter: ["public"]`, so drizzle-kit never touches Neon's `neon_auth` schema. No Drizzle migration in this module: Neon created the auth tables when you enabled auth.

## Check

1. Sign in on localhost.
2. **Look at what Neon created.** In the Neon SQL editor on `development`:
   ```sql
   select table_name from information_schema.tables where table_schema = 'neon_auth' order by 1;
   ```
   Then look at the user table and the session table (your active session). Write the table names and the user id's column type into `LEARNING.md`; module 14 needs them.
3. **Can your tables point at Neon's?** Neon does not document whether a real foreign key into `neon_auth` is supported. On a throwaway Neon branch (Branches -> New branch from `development`), ask Claude to try one by hand in the SQL editor, a scratch table with `user_id ... references neon_auth.<user table>(id)`, and note what happens. Then delete the branch. Record the answer in `LEARNING.md`. Until it is a clear yes, app tables store `user_id` without a hard constraint (module 14).
4. Browser dev tools -> Application -> Cookies: find the session cookie on `localhost`. Note it is `HttpOnly`, so page JavaScript cannot read it.
5. Sign out, and check the session row is gone.

## Break it on purpose

1. **Untrusted origin.** Turn **Allow Localhost** off on `development`. Sign in. Read the error: Neon refused to send the browser back to an origin it does not trust (hop 5). Turn it back on.
2. **Wrong cookie secret.** While signed in, change one character of `NEON_AUTH_COOKIE_SECRET` in `.env.local` and restart `npm run dev`, reload. Neon does not document exactly what this secret protects, so observe: if you are signed out, the cookie's signature no longer checks out, and rotating it is how you would force everyone to sign in again. If you are still signed in, it only protects a cached copy and the session itself lives on at Neon. Write down which in `LEARNING.md` (module 13's emergency lever depends on it). Put the value back.

## The Next.js 16 note

Next.js 16 renamed `middleware.ts` to `proxy.ts`. A `proxy.ts` using `auth.middleware(...)` to redirect signed-out visitors is a convenience. Every protected page and server action checks the session itself with `auth.getSession()` (module 14).

**Done when:** you can sign in and out locally, the `neon_auth` tables and the foreign-key answer are in `LEARNING.md`, and both broken versions produced errors you could explain.
