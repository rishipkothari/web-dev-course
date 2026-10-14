---
title: Stack and configuration reference
verified: 2026-10-12 (auth sections 2026-10-14)
---

# Stack and configuration reference

The one page to open when you need a setting, a limit, or a reason. Facts that change (prices, limits) carry the date they were checked (**2026-10-12**, auth and email **2026-10-14**) and a source at the bottom. Re-check anything older than about six months before relying on it.

---

## 1. The stack at a glance

| Piece | Choice | One-line reason |
|---|---|---|
| Code and CI | GitHub (public repos while learning) + GitHub Actions | Free branch protection and CI on public repos |
| Framework | Next.js 16 (App Router), TypeScript | Frontend and backend in one project, one language |
| Hosting | Vercel Hobby | Push to deploy, a preview URL per branch, zero config for Next.js |
| Database | Neon Postgres | 100 free projects, cheap branches; dev and prod are branches of one project |
| DB access and migrations | Drizzle ORM + drizzle-kit | Schema is TypeScript, migrations are plain SQL files you can read |
| Auth | Neon Auth (managed Better Auth) | Someone else runs auth, but your users are still SQL tables in your own database and branch with it |
| UI | Tailwind CSS + shadcn/ui | The default an AI agent knows best; copy-in components, no UI library lock-in |
| Tests | Vitest (logic) + Playwright (one smoke test) | Fast unit tests, one browser check of the critical path |
| Errors | Sentry (Developer plan) | Free tier is enough for hobby traffic |
| Agent | Claude Code + project `CLAUDE.md`, settings, hooks, skills | The rules travel with the repo, including into cloud sessions |

---

## 2. Environments

Staging is deliberately **not** used yet. It comes back when a project has real users (Nannager). Until then preview deploys do its job.

| Environment | Git branch | Runs on | Neon branch (and its auth) | Sign-in setup | Secrets live in |
|---|---|---|---|---|---|
| Local (your PC) | feature branches | `npm run dev`, `http://localhost:3000` | `development` | email and password: nothing to register; Google: Neon's shared development credentials | `.env.local` (gitignored) |
| Cloud Claude session | feature branches | the container | `development` | same as local | Cloud environment variables (dev values only) |
| Preview | any non-`main` branch | Vercel Preview URL | `development` | same as local; preview URLs allowed by a wildcard trusted domain (section 9) | Vercel **Preview** variables |
| Production | `main` | Vercel Production URL | `production` | email and password: nothing to register (your own SMTP before real users, section 9a); Google: your own OAuth client, entered in the Neon Console | Vercel **Production** variables only |

**Rules that make this safe**
- Same variable **names** everywhere, different **values**. `.env.example` lists names only and is committed.
- Production values exist in exactly one place: Vercel Production variables. Never on your PC, never in a cloud session, never in GitHub.
- Production migrations run only inside the Vercel **production build**, before the new code is built (section 8). The approval step is merging the pull request. If the migration fails, the build fails and the previous deploy keeps serving.

---

## 3. Environment variables

| Name | What it is | Local / cloud | Vercel Preview | Vercel Production |
|---|---|---|---|---|
| `DATABASE_URL` | Neon **pooled** connection string (host contains `-pooler`). Used by the running app | dev branch | dev branch | prod branch |
| `DATABASE_URL_UNPOOLED` | Neon **direct** connection string. Used only by drizzle-kit (migrations) | dev branch | - | prod branch (used by the build's migrate step) |
| `NEON_AUTH_BASE_URL` | The Neon branch's own Auth URL (Console -> Settings -> Better Auth -> Project Info, with that branch selected). Not secret, but it decides which branch's users you sign in to | dev branch | dev branch | prod branch |
| `NEON_AUTH_COOKIE_SECRET` | Random string, 32+ characters. Signs the app's session cookie. Different per environment | yes | yes | yes |
| `SENTRY_DSN` | Where errors are sent (not secret, but per project) | optional | yes | yes |

Project-specific variables (Yahoo, Anthropic API, cron secret) are listed in each project's own `.env.example`.

The Google OAuth client id and secret are **not** environment variables. They are entered in the Neon Console on the `production` branch (section 9), so they never touch Vercel, your PC or a cloud session.

**Generating a secret:** `openssl rand -base64 32` in Git Bash. Paste the result straight into the dashboard or `.env.local`, never into a chat.

**`VERCEL_ENV`** is set by Vercel automatically (`preview` or `production`). Locally it is unset. Use it to show which environment is running; do not invent your own variable for that.

---

## 4. GitHub

**Why:** your code host already; Actions gives free CI on public repos.

**Settings that matter**
- **Visibility: public** while learning. Branch protection and rulesets on private repos need GitHub Pro (about $4/month). Secrets never live in the repo, so public costs nothing in safety, as long as `.gitignore` covers `.env*`. Before flipping an existing repo to public, scan its history for committed secrets (Claude can do this).
- **Ruleset on `main`:** require a pull request, require the `ci` status check to pass, block force pushes, block deletion. Settings -> Rules -> Rulesets.
- **No secrets in GitHub.** CI runs with dummy values; nothing in Actions ever talks to a real database.
- **Merge button:** allow squash merging only. One PR becomes one commit on `main`, which makes rollback and history readable.

**Gotchas**
- A PR is a GitHub feature, not a git one. Opening one needs the website or `gh`.
- A secret committed once is in history forever. Rotate it; deleting the file does not help.

---

## 5. Next.js

**Why:** pages and API routes in one TypeScript project; Vercel deploys it with no config.

**Settings that matter**
- `package.json` `engines.node` = `24.x` and `.nvmrc` = `24`. Vercel, the cloud container and your PC then agree.
- `AGENTS.md` is written by Next.js itself and tells agents to read the docs bundled in `node_modules/next/dist/docs/`. Keep it; it is the best defence against an agent using APIs from an older Next.js.

**Gotchas**
- Next.js 16 renamed `middleware.ts` to `proxy.ts` (function `proxy`). Older tutorials and older AI training data say middleware.
- If `npm run dev` says it moved to port 3001, something (usually an older dev server) holds 3000. Stop it rather than working on 3001, so you are not testing a stale copy.

---

## 6. Vercel (Hobby)

**Why:** push to deploy; every branch gets a preview URL.

**Free-tier limits that matter (checked 2026-10-12)**
- Non-commercial, personal use only. Anything that earns money needs Pro, $20 per developer seat per month.
- Runtime logs: **1 hour** of retention. You will not find yesterday's error in Vercel logs; that is what Sentry is for.
- Cron jobs: up to 100 per project, but **at most once per day**, and timing is only accurate to within the hour. A more frequent schedule fails the deploy.
- Function maximum duration 300 seconds; 100 deployments per day; 200 projects.

**Settings that matter**
- Project -> Settings -> Build and Deployment: Framework Preset = **Next.js**, no Output Directory override.
- Environment variables are scoped to **Production**, **Preview**, and **Development**. A Preview variable can additionally be scoped to **one git branch**, which overrides the general Preview value for that branch only. This is how a future staging branch would get its own database.
- Deployment Protection: leave Vercel Authentication on for previews, so only you can open preview URLs.

**Gotchas**
- **Changing a variable does not change running deployments.** Redeploy after any change.
- A preview build that reads `DATABASE_URL` uses the Preview value. If you forgot to set it, the build may pass and the page fails at runtime.
- Instant rollback (Deployments -> a previous production deploy -> Instant Rollback) rolls back **code only**. The database stays where it is. This is why risky migrations use expand and contract (module 11).

---

## 7. Neon

**Why:** branching makes dev and prod two branches of one project; the free tier fits many hobby apps at once.

**Free-tier limits that matter (checked 2026-10-12)**
- 100 projects, 10 branches per project, 1 GB storage per project (20 GB total), 100 compute-hours per project per month.
- Compute suspends after 5 minutes idle; the first query after that takes a moment longer. Cannot be turned off on Free.
- **History window: 6 hours.** Point-in-time restore and "branch from a past moment" reach back only 6 hours. If you break prod data on Friday and notice on Sunday, restore cannot help. Take a manual snapshot or a `pg_dump` before risky changes.
- Neon Auth (managed Better Auth) up to 60k monthly active users. This course's auth (section 9).
- Commercial use on the Free plan is not addressed on the pricing page. Read Neon's terms before charging money for anything.
- Paid (Launch) plan is usage-based with no monthly minimum: about $0.106 per compute-hour and $0.35 per GB-month (checked 2026-10-12).

**Branch layout per app**
- One Neon **project** per app.
- Root branch `production`. Neon creates it with that name; keep it.
- Child branch `development` (create it from `production` if Neon did not). Local, cloud sessions and previews all use it.
- **Reset from parent** overwrites `development` with a fresh copy of `production`'s current schema and data. Branches page -> the branch -> Reset from parent, or `neon branches reset development --parent`. Everything on `development` is discarded, with no backup. Root branches cannot be reset.

**Connection strings (Dashboard -> Connect)**
- **Pooled** (host has `-pooler`): goes through Neon's connection pooler, which handles many short-lived serverless connections. Use for the app: `DATABASE_URL`.
- **Direct** (no `-pooler`): a plain Postgres session. Use for drizzle-kit migrations: `DATABASE_URL_UNPOOLED`. Migrations need session features the pooler does not guarantee.
- Each branch has its own pair. Copying the `production` string where `development` belongs is the most damaging mistake in this whole stack; module 4 has you label them.

**Agent tooling**
- Install the `neon-postgres` and `neon-auth` agent skills (section 12).
- **Do not** install the Neon MCP server while learning. It authenticates to your whole Neon account, which includes production. If you add it later, use its read-only mode.

---

## 8. Drizzle ORM + drizzle-kit

**Why:** tables are defined in TypeScript, and drizzle-kit turns schema changes into plain SQL migration files you read before applying.

**Settings that matter**
- `drizzle.config.ts`: `dialect: "postgresql"`, `schema: "./src/db/schema.ts"`, `out: "./drizzle"`, `schemaFilter: ["public"]` (keeps drizzle-kit away from Neon Auth's `neon_auth` schema), credentials from `DATABASE_URL_UNPOOLED`.
- App driver: `drizzle-orm/neon-http` with `@neondatabase/serverless`, reading `DATABASE_URL`.

**The only commands you use**
| Command | What it does | Where |
|---|---|---|
| `npx drizzle-kit generate` | Compares schema.ts with the last migration and writes a new `.sql` file | anywhere |
| `npx drizzle-kit migrate` | Applies unapplied migration files to the database in the config | dev: by hand. prod: only inside the Vercel production build |
| `npx drizzle-kit check` | Checks the migration folder is consistent | CI |
| `npx drizzle-kit studio` | A local table browser | dev only |

**How production migrations run.** `package.json` has `"vercel-build": "node scripts/vercel_build.mjs"`. Vercel runs a `vercel-build` script instead of `build` when one exists. The script runs `drizzle-kit migrate` only when `VERCEL_ENV` is `production`, then `next build`. Order is guaranteed: migrate, build, then traffic switches. Preview builds never migrate, because several feature branches share the `development` database and must not race each other; you migrate `development` by hand.

The consequence to remember: the new database shape is live a minute or two **before** the new code, and stays live if the code is rolled back. Additive changes are harmless either way. Destructive ones need expand and contract (module 11).

**Banned: `drizzle-kit push`.** It changes the database to match your schema directly, with no migration file. That is exactly the "click it in a dashboard" habit this course exists to break. The template's hook blocks it.

**Gotchas**
- Never edit a migration that has been applied anywhere. Write a new one.
- Drizzle `relations()` are for the query API only and **do not create foreign keys**. Use `.references()` on the column for a real constraint.
- drizzle-kit sometimes reads a column rename as "drop and add", which deletes data. It asks interactively; read the generated SQL every time.

---

## 9. Neon Auth (managed Better Auth)

**Why:** Neon runs the auth service (sign-in flows, OAuth, sessions, rate limiting), so you are not maintaining auth code. Unlike Clerk, the users still live **in your own database**, in the `neon_auth` schema, so a payouts query can join to the user's name in plain SQL. And because it lives in the database, auth **branches with it**: each Neon branch gets its own copy of users, sessions and auth settings, and its own Auth URL. It is Better Auth underneath, so self-running Better Auth stays an exit route.

**What Neon owns vs what you own**
- Neon owns the `neon_auth` schema: its tables, and their changes. **Drizzle never touches it.** `drizzle.config.ts` sets `schemaFilter: ["public"]`, so drizzle-kit only reads and migrates your own `public` tables.
- You own the app code that calls it, your own tables that refer to users, and the per-branch settings in the Console (OAuth providers, trusted domains, email).
- Not documented by Neon (checked 2026-10-14): whether a real foreign key from your tables to `neon_auth`'s user table is supported. Until module 12's check says otherwise, app tables store `user_id` as `text` and join to the user table in queries, without a hard constraint.

**Setup shape (checked against the docs 2026-10-14)**
- Console: select the branch -> **Better Auth** page -> **Enable Auth**. Copy that branch's Auth URL from Settings -> Better Auth -> Project Info.
- `npm install @neondatabase/auth@latest`
- `src/lib/auth/server.ts`: `createNeonAuth` from `@neondatabase/auth/next/server`, with `baseUrl: process.env.NEON_AUTH_BASE_URL` and `cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET }`. Export it as `auth`.
- Route handler `src/app/api/auth/[...path]/route.ts`: `export const { GET, POST } = auth.handler()`.
- Client `src/lib/auth/client.ts` (`'use client'`): `createAuthClient` from `@neondatabase/auth/next`.
- Create an account from the client: `authClient.signUp.email({ name, email, password })`. Sign in: `authClient.signIn.email({ email, password })`. Google (module 13b): `authClient.signIn.social({ provider: "google", callbackURL: "/" })`. Sign out: `authClient.signOut()`. Check the `neon-auth` skill for the current method names; the SDK is newer than most training data.
- Session on the server: `const { data: session } = await auth.getSession()`, then `session?.user`. Pages that read it are dynamic (`export const dynamic = "force-dynamic"`).
- `proxy.ts` (Next.js 16): `auth.middleware({ loginUrl: "/sign-in" })` with a `matcher` for protected paths. A convenience redirect only: **every protected page and server action still checks the session itself.**
- Agent skill: `neon-auth` (section 12). The Neon Auth SDK is newer than most AI training data, so the skill matters more here than usual.

**Sign-in methods: email and password first, then Google (decided 2026-10-14)**
- **Email and password** is the baseline and needs no outside account. Neon hashes the password and stores it in the `neon_auth` account table. Setup in module 12; email sending in section 9a.
- **Google** is added beside it in module 13b. Both methods write to the same user table.
- Neon Auth's built-in OAuth providers are Google, GitHub and Vercel. Custom providers (Yahoo, for example) are not listed, so Yahoo in ff-sandbox is a separate "connect your Yahoo account" flow for API access, not the login.
- **Development:** Google works with Neon's **shared development credentials**, on by default. Nothing to register. The consent screen shows Neon's name and logo; that is fine for dev.
- **Production:** your own Google OAuth client (Google Cloud Console -> APIs & Services -> Credentials -> OAuth client ID, type Web application). Its authorized redirect URI is the **production branch's Auth URL** + `/callback/google` (shown in Neon's "Add OAuth provider" dialog). Client id and secret go into the Neon Console on the `production` branch (Settings -> Auth -> OAuth providers), not into Vercel.
- While learning, leave the Google consent screen in **Testing** and add yourself (and anyone else who needs to sign in) as test users. Publishing it is a Nannager step.

**Trusted domains (where Neon may send the browser back to)**
- Per branch. `localhost` is allowed by default ("Allow Localhost" toggle).
- `production`: add `https://<your-app>.vercel.app`, and turn **Allow Localhost off**.
- `development`: add a wildcard covering your Vercel preview URLs. That is what makes sign-in work on previews. Neon documents subdomain wildcards (`https://*.something.vercel.app`), but Vercel preview URLs look like `https://<project>-<hash>-<team>.vercel.app`, with no shared parent. Try the narrow pattern `https://<project>-*-<team>.vercel.app` first. If Neon rejects a wildcard in the middle, the fallback is `https://*.vercel.app` on `development` only: it lets the dev branch send people back to any Vercel site, which is an acceptable risk for dev-only test users and never acceptable on `production`. Module 13 has you test this.

**Gotchas**
- `NEON_AUTH_BASE_URL` decides which branch's users you are signing in to. A production Auth URL in `.env.local` means you are creating users in production from your PC. Label them like connection strings (module 4).
- Settings changed on `development` are **not** copied to `production`. A child branch copies its parent's auth settings once, when created; after that you apply changes to each branch by hand.
- Users created on `development` do not exist in production, and vice versa (after the branch point).
- What "Reset from parent" does to auth settings is not documented (checked 2026-10-14). After a reset, check that `development`'s trusted domains and Allow Localhost are still what you expect.
- What rotating `NEON_AUTH_COOKIE_SECRET` does to existing sessions is not spelled out in Neon's docs (checked 2026-10-14). Module 12 has you observe it; do not count on it as an emergency sign-out until you have.

### 9a. Email sending for email/password (decided 2026-10-14: shared dev sender now, own SMTP before real users)

**Decision:** email and password is the first sign-in method, with Google added beside it (modules 12, 13, 13b). In development and in the playground, Neon's shared sender is enough. A project with real users needs your own SMTP provider and a domain first. This replaces the earlier decision (same day) to start with Google only.

**Why:** Neon's shared email sender (`auth@mail.myneon.app`) is for development only: rate-limited, and it sends codes, not verification links. So development needs nothing extra, but production email (verification, password reset) needs your own SMTP provider, and a real sender needs a domain you own with DNS records. That is a second vendor, a domain, and DNS, which a playground with no real users can postpone. Until then, run with email verification off and accept that anyone can sign up under any address. Not documented by Neon (checked 2026-10-14): how verification and password reset behave through the shared sender. Module 12 has you observe it. (Clerk does not avoid this: a Clerk production instance also requires a domain you own, with DNS records.)

**When you add your own SMTP (checked 2026-10-14)**
- Turn on email verification (off by default, and without it anyone can sign up as any address).
- Provider: **Resend**, through its SMTP interface. Neon Console, per branch: Settings -> Better Auth -> **Custom SMTP provider** (host, port, username, password, sender email, sender name).
- Resend free tier: 3,000 emails/month, **100/day**, 3 domains, 30-day log retention. Pro is $20/month.
- Without a verified domain, Resend sends only from `onboarding@resend.dev` and only to your own account address; anything else gets a 403.
- Testing without spamming yourself: send to `delivered@resend.dev` (or `bounced@` / `complained@`). Placeholder domains like `example.com` are rejected.
- Custom SMTP changes the sender, not the content: emails still use Neon's default templates. Custom templates need Neon's email webhooks and your own sending code.
- The SMTP password (Resend API key) lives in the Neon Console, not in Vercel.

---

## 10. Claude Code configuration (per project, committed)

| File | Purpose |
|---|---|
| `CLAUDE.md` | Rules: stack, environments, secrets, git, database, naming, style, ask-before list |
| `.claude/settings.json` | Denies reading `.env*` secret files; registers hooks |
| `.claude/hooks/guard_commands.mjs` | Blocks pushes to `main`, force pushes, `drizzle-kit push`, production-targeted commands, and shell reads of secret files |
| `.claude/hooks/session_start.sh` | Cloud sessions only: install the pinned Node and `npm install` |
| `.claude/skills/*/SKILL.md` | Vendor best-practice skills plus your own workflow skills |

Everything is committed so cloud sessions, which start from a fresh clone, get the same rules. Skills in `~/.claude` on your PC do **not** exist in cloud sessions.

The hook is the real guardrail; `CLAUDE.md` is guidance an agent can misread. Hooks are written in Node (not bash + `jq`) because Node is guaranteed to exist on every machine that runs the project.

---

## 11. UI, tests, errors

- **Tailwind + shadcn/ui:** `npx shadcn@latest init` adds Tailwind config and a `components/ui` folder. Components are copied into your repo, so you own and can edit them.
- **Vitest:** unit tests for pure functions (payout math, date logic). Runs in CI.
- **Playwright:** one smoke test (home page loads, sign-in button exists). Run locally before releases; add to CI once stable.
- **Sentry Developer plan (checked 2026-10-12):** free, 1 user, 5k errors per month, 30-day lookback, 1 uptime monitor, 1 cron monitor. The uptime and cron monitors cover the "is it up" and "did the daily job run" checks.

---

## 12. Agent skills

Install per project, commit them, review each `SKILL.md` before installing (a skill is instructions your agent will follow, so treat it like a dependency).

| Skill | Source | Install |
|---|---|---|
| `neon-postgres` | Neon (official) | `npx skills add neondatabase/agent-skills --skill neon-postgres -a claude-code` |
| `neon-auth` | Neon (official): Neon Auth setup, OAuth, sessions | `npx skills add neondatabase/agent-skills --skill neon-auth -a claude-code` |
| `vercel-react-best-practices` | Vercel (official) | `npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices -a claude-code` |
| Drizzle | no official skill; community ones vary in quality | use the course's own `db-change` skill instead |
| Workflow skills: `db-change`, `new-feature`, `add-secret`, `ship-check` | this course's `template/` | copied with the template |

**Where they land:** Claude Code reads skills from `.claude/skills/`. The `skills` CLI sometimes installs into `.agents/skills/` and links from there; links need Developer Mode on Windows. After installing, confirm each skill's folder exists under `.claude/skills/`; if it only exists under `.agents/skills/`, copy the folder across.

**Skip:** Vercel's `deploy-to-vercel` (deploys go through git), and any skill that bundles an MCP server with account-wide access.

**Naming exception:** skill names must be lowercase with hyphens (`db-change`); that is the Agent Skills format's rule, not ours.

---

## 13. Windows specifics

- **PowerShell execution policy:** `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, once. Otherwise `npm.ps1 cannot be loaded`.
- **Run npm from the project folder,** in a normal (not admin) terminal. Admin terminals start in `C:\WINDOWS\system32`.
- **Git Bash** comes with Git for Windows. Claude Code uses it to run hooks; it also gives you `openssl`.
- **Line endings:** the repo's `.gitattributes` forces LF.
- **Windows 10 support (checked 2026-10-12):** consumer Extended Security Updates end **October 13, 2026**. After that Windows 10 receives no security patches. For a machine that holds GitHub credentials and dev database strings, plan the move to Windows 11 (if the hardware qualifies) or another machine. Nothing in this stack requires Windows 11.

---

## 14. What is free and what is not

| Service | Free tier covers | The cliff | Price after the cliff (checked 2026-10-12) |
|---|---|---|---|
| GitHub | Public repos, Actions on public repos, rulesets on public repos | Branch protection on **private** repos | Pro, about $4/month |
| Vercel | Personal, non-commercial; daily cron; 1 h logs | **Any commercial use**; cron more often than daily | Pro, $20/developer seat/month |
| Neon | 100 projects, 1 GB each, 6 h history | Storage over 1 GB, longer restore history, (check terms for commercial use) | Launch, usage-based, no minimum |
| Neon Auth | 60k monthly active users; email and password, and Google via Neon's shared credentials in dev | More than 60k MAU; your own SMTP for email in production | Neon Launch plan (usage-based) (checked 2026-10-14) |
| Resend (only when a project needs production email, section 9a) | 3,000 emails/month, 100/day, 3 domains | More than 100 emails in a day | Pro, $20/month (checked 2026-10-14) |
| Sentry | 5k errors/month, 1 user | More errors, more users | Team plan |
| Anthropic API | none | first token | per-token; set a monthly spend limit in the Console |
| Yahoo Fantasy API | free with a developer app | rate limits (undocumented) | - |

Nannager, if it earns money, needs at minimum Vercel Pro and a Neon terms check. Fantasy football can stay free.

---

## 15. Alternatives considered

| Option | Why not (for now) |
|---|---|
| **Supabase** | Packages auth, database, storage and RLS nicely, but the free tier allows 2 active projects and pauses after a week idle. dev + prod for one app already uses both. Its local dev stack needs Docker. |
| **Better Auth, self-run** | The library under Neon Auth, run inside your own app. Chosen first (2026-10-12), replaced 2026-10-14: you would own rate limiting, email wiring, MFA and patching. Remains the exit route from Neon Auth, and the answer if you ever need a custom Better Auth plugin. |
| **Clerk** | The most mature hosted auth: polished prebuilt UI, organizations, bot protection, email included. But users live in Clerk, not your database, so SQL joins need a copy kept in sync by webhooks; MFA and removing Clerk branding need Pro ($25/month); production needs a domain you own (checked 2026-10-14). **Re-evaluate for Nannager.** |
| **Kinde** | Same category as Clerk: hosted auth with its own user store. Clerk, Kinde and Neon Auth are alternatives to each other, not layers. |
| **Google only, no email/password** | Considered 2026-10-14 and dropped the same day: most real apps offer email and password, and you wanted accounts that do not depend on Google or GitHub. The cost, an SMTP provider and a domain before real users, is postponed, not avoided (section 9a). |
| **Firebase** | NoSQL (Firestore) throws away your SQL strength; a different mental model from everything else here. |
| **Auth.js (NextAuth v5)** | Now maintained by the Better Auth team, who recommend Better Auth for new projects. |
| **Prisma** | Good, but its schema language hides SQL more than Drizzle and its migration tooling is heavier. |
| **A standing staging environment** | Overhead without users. Previews plus a resettable `development` branch cover it until Nannager. |

---

## 16. Sources (checked 2026-10-12 unless noted)

- Neon pricing: https://neon.com/pricing
- Neon history window: https://neon.com/docs/introduction/history-window
- Neon reset from parent: https://neon.com/docs/guides/reset-from-parent
- Neon Auth overview: https://neon.com/docs/auth/overview
- Neon Auth Next.js quick start: https://neon.com/docs/auth/quick-start/nextjs (2026-10-14)
- Neon Auth OAuth setup: https://neon.com/docs/auth/guides/setup-oauth (2026-10-14)
- Neon Auth branching: https://neon.com/docs/auth/branching-authentication (2026-10-14)
- Neon Auth production checklist: https://neon.com/docs/auth/production-checklist (2026-10-14)
- Clerk pricing: https://clerk.com/pricing (2026-10-14)
- Clerk production deployment: https://clerk.com/docs/deployments/overview (2026-10-14)
- Neon agent skills: https://neon.com/docs/ai/agent-skills
- Vercel Hobby plan: https://vercel.com/docs/plans/hobby
- Vercel cron limits: https://vercel.com/docs/cron-jobs/usage-and-pricing
- Vercel environment variables across environments: https://vercel.com/docs/environment-variables/manage-across-environments
- GitHub protected branches availability: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- Resend pricing: https://resend.com/pricing (checked 2026-10-14)
- Resend testing addresses: https://resend.com/docs/knowledge-base/what-email-addresses-to-use-for-testing (checked 2026-10-14)
- Resend 403 on the resend.dev domain: https://resend.com/docs/knowledge-base/403-error-resend-dev-domain (checked 2026-10-14)
- Vercel agent skills: https://github.com/vercel-labs/agent-skills
- Sentry pricing: https://sentry.io/pricing/
- Windows 10 consumer ESU end date: https://learn.microsoft.com/en-ca/answers/questions/5805066/windows-esu-does-enrollment-end-on-13-oct-2026-or
