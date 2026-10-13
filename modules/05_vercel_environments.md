---
order: 5
part: A - Setup
title: Vercel environments and variables
minutes: 40
---

# 05 - Vercel environments and variables

**Goal:** Preview deploys talk to `development`, Production talks to `production`, and a page in the app shows which environment you are looking at.

**Why:** an environment you cannot see is an environment you will confuse. One visible label on every page prevents a whole category of mistakes.

## Steps

1. **Set Preview variables.** Vercel -> Project -> Settings -> Environment Variables. Add `DATABASE_URL` with the `development` pooled string, ticked for **Preview** only.
2. **Set Production variables.** Add `DATABASE_URL` (production pooled) and `DATABASE_URL_UNPOOLED` (production direct), ticked for **Production** only. The direct one is used by the production build's migration step (module 10).
3. **Mark secrets as Sensitive.** Sensitive values cannot be read back in the dashboard after saving; you can only replace them. That is the point.
4. **Environment badge.** Ask Claude: "Add a small fixed badge to the root layout that shows `process.env.VERCEL_ENV`, or `local` when it is unset." `VERCEL_ENV` is set by Vercel itself, so no new variable is needed.
5. Push a branch, open the preview: the badge says `preview`. Production says `production`. Localhost says `local`.

## Branch-scoped Preview variables

A Preview variable can be scoped to one git branch, overriding the general Preview value for that branch only. You do not need it now. It is how a future `staging` branch would get its own database, so know that it exists.

## Using the `add-secret` skill

From now on, when Claude needs a new variable it follows `.claude/skills/add-secret`: adds the name to `.env.example`, then gives you a table of where each value goes. Try it once: "We'll need a variable called `DEMO_GREETING`; set it up." It should not ask you for the value.

## Gotchas

- **Changing a variable does not affect existing deploys.** Redeploy (Deployments -> latest -> Redeploy) after every change. This is the most common "I set it but it doesn't work".
- A missing Preview variable can let the build pass and the page fail at runtime. Check the preview, not just the green tick.
- Leave Deployment Protection (Vercel Authentication) on for previews, so only you can open them.

## Break it on purpose

Delete the Preview `DATABASE_URL`, redeploy a preview, and load the page that queries the database. Read the error in the preview's runtime logs (Hobby keeps them for 1 hour). Put it back and redeploy.

**Done when:** the badge shows the right environment in all three places, and you have seen the missing-variable error once.
