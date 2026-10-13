---
order: 7
part: B - The hygiene loop
title: CI guardrails
minutes: 40
---

# 07 - CI guardrails

**Goal:** every pull request runs lint, typecheck, unit tests, a migration consistency check and a build, and a red run blocks the merge.

**Why:** the agent writes most of the code. CI is the reviewer that never gets tired: it checks every change the same way, on a clean machine, before it can reach `main`.

## What CI is

GitHub Actions starts a fresh Linux machine for each pull request, checks out the branch, and runs the steps in `.github/workflows/ci.yml`. A failing step turns the PR's check red. With the ruleset requiring it, the merge button stays disabled until it is green.

## Steps

1. **Copy `template/.github/workflows/ci.yml`** into the project (done if you copied the kit).
2. **Scripts in `package.json`** (from `template/README.md`): `typecheck` (`tsc --noEmit`) and `test` (`vitest run`). Install Vitest if the project does not have it yet: ask Claude to "add Vitest with one trivial passing test".
3. **Read the workflow.** Note: placeholder environment values, no real secrets, nothing touches a database. CI checks the code, not the data.
4. **Open a PR** and watch the Checks tab. First runs take a couple of minutes (npm install); later runs use the cache.
5. **Require it.** Edit the `main` ruleset -> Require status checks to pass -> add `ci`. (The check only appears in the list after it has run once.)
6. **`ship-check` skill.** It runs the same steps locally. Make "run ship-check" the last thing you ask for before opening a PR; fixing locally is faster than waiting on CI.

## Break it on purpose

Ask Claude for a branch with a deliberate TypeScript error (assign a string to a number). Open the PR, watch CI fail, read the failing step's log, and note that the merge button is blocked. Fix, push again, watch it go green.

## What each step catches

| Step | Catches |
|---|---|
| Lint | Bug-prone patterns, unused code, React hook mistakes |
| Typecheck | Wrong types, misspelled properties, missing arguments |
| Unit tests | Logic that no longer does what it did |
| `drizzle-kit check` | Migration files that conflict or were edited out of order |
| Build | Anything that would fail the Vercel deploy |

## What breaks if it is wrong

- CI not required in the ruleset: a red check is advice, not a gate.
- "Just skip the failing test": the agent may suggest it. The template's `CLAUDE.md` tells it not to; you should refuse too.

**Done when:** a PR with a type error cannot be merged, and the fixed version can.
