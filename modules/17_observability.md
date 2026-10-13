---
order: 17
part: C - Production readiness
title: Seeing what production is doing
minutes: 40
---

# 17 - Seeing what production is doing

**Goal:** when production breaks, you find out from an alert, not from a user, and you can see the error after the fact.

**Why:** Vercel Hobby keeps runtime logs for **1 hour**. An error at 2 a.m. is gone by breakfast. You need somewhere errors persist, plus a check that the site is up.

## Steps: Sentry

1. Create a free Sentry account (Developer plan: 1 user, 5k errors per month, 30-day lookback) and a Next.js project.
2. Ask Claude to set it up with Sentry's Next.js wizard or manual steps (ask before adding the dependency). `SENTRY_DSN` follows the `add-secret` flow: Preview and Production in Vercel, optional locally.
3. Tag events with the environment (`VERCEL_ENV`) so preview noise is separable from production.
4. Ship it. Then deliberately throw an error from a test route on a preview, and find it in Sentry with its stack trace.

## Steps: uptime and the daily job

Sentry's free plan includes **1 uptime monitor** and **1 cron monitor**.

1. Uptime monitor on the production URL. Alert by email.
2. The cron monitor is for later: when a project has a daily job (ff-sandbox's weekly summary), it alerts if the job did not check in.

## Steps: the logs you have

- **Vercel runtime logs** (Project -> Logs): last hour only. Filter by status code to find 500s.
- **Build logs** (Deployments -> a deploy): kept with the deploy. This is where migration output lives.
- **Neon** (Monitoring): connections, compute usage. Useful when the app is slow.

## Spending guards

- Vercel Hobby cannot overspend: it pauses features when free limits are hit. Note the pause behavior in your LEARNING.md.
- Neon Free has hard limits, no bill.
- Any paid API (Anthropic, later Stripe) gets a monthly limit set in its own console the day the key is created.

## Break it on purpose

Ship a page that throws on a specific query parameter. Hit it on production. Within minutes: Sentry email, stack trace, environment tag. Then remove the page.

**Done when:** a production error reached your inbox and the uptime monitor is green.
