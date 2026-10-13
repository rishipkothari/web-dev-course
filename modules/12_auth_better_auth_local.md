---
order: 12
part: B - The hygiene loop
title: Auth with Better Auth (local)
minutes: 55
---

# 12 - Auth with Better Auth (local)

**Goal:** "Sign in with GitHub" works on localhost, and you can describe every hop of the OAuth flow.

**Why:** OAuth is the piece most people treat as magic. You will register the app yourself and watch each redirect, so when it breaks (it will, usually on a callback URL) the error makes sense.

## The flow in five hops

1. Your app redirects the browser to GitHub with your **client id** and **callback URL**.
2. You log in at GitHub and approve.
3. GitHub redirects back to the callback URL with a one-time **code**.
4. Your server swaps the code (plus the **client secret**) for an access token, server to server.
5. Better Auth looks up or creates the user, stores a **session** row, and sets a session cookie.

The client secret never touches the browser. The callback URL must match the one registered at GitHub exactly.

## You do

1. **GitHub -> Settings -> Developer settings -> OAuth Apps -> New OAuth App** named `<project> local`:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
2. Generate a client secret. Put `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` into `.env.local` (and the cloud environment, if you work there).
3. `BETTER_AUTH_SECRET`: `openssl rand -base64 32` in Git Bash, into `.env.local`. `BETTER_AUTH_URL=http://localhost:3000`.

## Claude builds (ask: "add Better Auth with GitHub login, following the better-auth skills")

- `npm install better-auth @better-auth/drizzle-adapter`
- `src/lib/auth.ts`: `betterAuth` with the Drizzle adapter (`provider: "pg"`), the GitHub social provider, and `nextCookies()` as the last plugin.
- Auth tables: `npx auth@latest generate` writes them into the Drizzle schema; then the normal **db-change** flow (generate, read the SQL, migrate development). Note the tables: `user`, `session`, `account`, `verification`.
- Route handler `src/app/api/auth/[...all]/route.ts` with `toNextJsHandler(auth)`.
- `src/lib/auth_client.ts` with `createAuthClient`.
- Sign-in and sign-out buttons, and a page that shows the session (user name, email, session expiry) read on the server with `auth.api.getSession`.

## Check

1. Sign in on localhost. Then, in the Neon SQL editor on `development`, look at `user`, `account` (the GitHub link) and `session` (your active session).
2. Browser dev tools -> Application -> Cookies: find the session cookie. Note it is `HttpOnly`, so page JavaScript cannot read it.
3. Sign out: the session row disappears.

## Break it on purpose

1. Change the OAuth app's callback URL at GitHub to `http://localhost:3001/...`. Sign in. Read GitHub's "redirect_uri is not associated" error. Fix it.
2. Change one character of `GITHUB_CLIENT_SECRET` in `.env.local`, restart `npm run dev`, sign in. The redirect to GitHub works, the code exchange (hop 4) fails. Read the server terminal. Fix it.

## The Next.js 16 note

Next.js 16 renamed `middleware.ts` to `proxy.ts`. A `proxy.ts` that redirects when there is no session cookie is a convenience, not security: the cookie's presence is not checked against the database. Every protected page and server action checks the session itself (module 14).

**Done when:** you can sign in and out locally, and both broken versions produced errors you could explain.
