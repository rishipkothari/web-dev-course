---
order: 12
part: B - The hygiene loop
title: Auth with Neon Auth (local) - email and password
minutes: 55
---

# 12 - Auth with Neon Auth (local): email and password

**Goal:** a visitor can create an account with an email and a password, sign in, and sign out on localhost against the `development` branch. You can describe every hop, and you know which parts Neon owns.

**Why:** email and password is the baseline almost every real app offers, and it needs no Google or GitHub account. Managed auth is what most small apps use, so the skill is not writing auth, it is wiring a managed service in correctly and knowing where it can break. Neon Auth is managed Better Auth whose users live in your own database, in the `neon_auth` schema, and branch with it (`stack.md` section 9). Google sign-in is added next to this in module 13b; the two methods share the same user table.

## The flow in five hops

1. The sign-up form calls `authClient.signUp.email({ name, email, password })`. The request goes to **your app's** `/api/auth/...` route.
2. Your route forwards it to the **development branch's Auth URL** (`NEON_AUTH_BASE_URL`).
3. Neon **hashes the password** (the plain password is never stored) and writes a `user` row and an `account` row to `neon_auth`, then creates a `session` row.
4. Neon returns the session to your app.
5. Your app's `/api/auth` route sets a session cookie, signed with `NEON_AUTH_COOKIE_SECRET`, on your app's own domain.

Signing in later is the same trip: `authClient.signIn.email({ email, password })`, Neon compares the password against the stored hash, and a new `session` row is created.

## You do

1. **Neon Console** -> your project -> select the `development` branch -> **Better Auth** -> **Enable Auth**.
2. Settings -> Better Auth -> **Project Info**: copy this branch's **Auth URL** into `.env.local` as `NEON_AUTH_BASE_URL` (and into the cloud environment, if you work there). Check it is the development branch's URL; label it the way module 4 had you label connection strings.
3. `NEON_AUTH_COOKIE_SECRET`: `openssl rand -base64 32` in Git Bash, into `.env.local`.
4. Settings -> Better Auth: confirm **Allow Localhost** is on for `development`, and that the **email and password** method is enabled. Look for the email verification setting and note its state (`stack.md` says it is off by default).

## Claude builds (ask: "add Neon Auth with email and password sign-up and sign-in, following the neon-auth skill")

- `npm install @neondatabase/auth@latest`
- `src/lib/auth/server.ts`: `createNeonAuth` with `NEON_AUTH_BASE_URL` and the cookie secret, exported as `auth`. Fail loudly at startup if either variable is missing.
- Route handler `src/app/api/auth/[...path]/route.ts`: `export const { GET, POST } = auth.handler()`.
- `src/lib/auth/client.ts` with `createAuthClient` from `@neondatabase/auth/next`.
- A sign-up form (name, email, password), a sign-in form, a sign-out button, and a page that shows the session (name, email, expiry) read on the server with `const { data: session } = await auth.getSession()`. Show the error message from a failed attempt on the form instead of swallowing it.
- `drizzle.config.ts` keeps `schemaFilter: ["public"]`, so drizzle-kit never touches Neon's `neon_auth` schema. No Drizzle migration in this module: Neon created the auth tables when you enabled auth.

## Check

1. Create an account on localhost, then sign out and sign back in.
2. **Look at what Neon created.** In the Neon SQL editor on `development`:
   ```sql
   select table_name from information_schema.tables where table_schema = 'neon_auth' order by 1;
   ```
   Then look at the user table, the account table (your email/password login lives here) and the session table (your active session). Find the password column and confirm it is a hash, not your password. Write the table names and the user id's column type into `LEARNING.md`; module 14 needs them.
3. **Can your tables point at Neon's?** Neon does not document whether a real foreign key into `neon_auth` is supported. On a throwaway Neon branch (Branches -> New branch from `development`), ask Claude to try one by hand in the SQL editor, a scratch table with `user_id ... references neon_auth.<user table>(id)`, and note what happens. Then delete the branch. Record the answer in `LEARNING.md`. Until it is a clear yes, app tables store `user_id` without a hard constraint (module 14).
4. Browser dev tools -> Application -> Cookies: find the session cookie on `localhost`. Note it is `HttpOnly`, so page JavaScript cannot read it.
5. Sign out, and check the session row is gone.

## Email in development

Neon's shared sender (`auth@mail.myneon.app`) is on by default in development. It is rate-limited and, per `stack.md` section 9a, sends codes rather than links. Turn email verification on for `development`, create another account, and see what arrives and what your app must do with it. Neon's docs do not say how verification and password reset behave through the shared sender, so write what you observe in `LEARNING.md`: what the email contains, whether a reset flow exists in the SDK, and what your app has to add. Then decide whether to leave verification on for development.

No email provider and no domain are needed for any of this. They come in only when a project has real users (`stack.md` section 9a).

## Break it on purpose

1. **Wrong password.** Sign in with a wrong password. Read the error. Notice it should not tell you whether the email exists.
2. **Duplicate email.** Sign up twice with the same email. Read the error.
3. **Untrusted origin.** Turn **Allow Localhost** off on `development`. Sign in. Read the error: Neon refused to send the browser back to an origin it does not trust. Turn it back on.
4. **Wrong cookie secret.** While signed in, change one character of `NEON_AUTH_COOKIE_SECRET` in `.env.local` and restart `npm run dev`, reload. Neon does not document exactly what this secret protects, so observe: if you are signed out, the cookie's signature no longer checks out, and rotating it is how you would force everyone to sign in again. If you are still signed in, it only protects a cached copy and the session itself lives on at Neon. Write down which in `LEARNING.md` (module 13's emergency lever depends on it). Put the value back.

## The Next.js 16 note

Next.js 16 renamed `middleware.ts` to `proxy.ts`. A `proxy.ts` using `auth.middleware(...)` to redirect signed-out visitors is a convenience. Every protected page and server action checks the session itself with `auth.getSession()` (module 14).

**Done when:** you can create an account, sign in and sign out locally, the `neon_auth` tables, the password hash and the foreign-key answer are in `LEARNING.md`, and the broken versions produced errors you could explain.
