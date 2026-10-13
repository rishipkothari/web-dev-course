---
order: 16
part: C - Production readiness
title: Testing, proportionally
minutes: 50
---

# 16 - Testing, proportionally

**Goal:** unit tests on the logic that matters, one browser smoke test on the critical path, and a sense of what is not worth testing.

**Why:** a hobby project does not need 90% coverage. It needs tests where a silent bug would cost you (money math, permissions, date logic) and one check that the app starts and the main page works.

## What to test

| Test it | Skip it |
|---|---|
| Pure calculations (payouts, scores, rankings) | Layout and styling |
| Permission rules (the module 14 ownership check) | Third-party libraries themselves |
| Parsing external data (an API response into your types) | Code that only passes data through |
| Date and time-zone logic | Every component |

The trick that makes testing easy: **keep logic in plain functions** (input -> output, no database, no network) in files like `src/lib/payout_calculator.ts`. Then tests are short and fast. Ask Claude to structure code this way; the template's `CLAUDE.md` already does.

## Steps: unit tests (Vitest)

1. Vitest is installed from module 7. Ask Claude for a small pure function with real edge cases, for example "split a pot among weekly high scorers, with ties". Write the test cases **yourself first** in plain English: normal week, a tie, a week with no games, rounding to cents. Then have Claude turn them into tests and write the function.
2. `npm test`. Then break the function on purpose (change a `>` to `>=`) and watch a test catch it.
3. CI already runs `npm test`.

Testing tip from data work: tests are your validation set. Edge cases you would check in a spreadsheet are exactly the test cases.

## Steps: one smoke test (Playwright)

1. Ask Claude to add Playwright with **one** test: the home page loads, shows the heading, and the sign-in button is present.
2. Run it locally: `npx playwright test` (it starts the dev server first). `npx playwright test --ui` shows the browser.
3. Keep it out of CI for now: browser tests need the dev server and are slower and flakier. Run it before releases. Add it to CI once it has been stable for a few weeks.

## What breaks if it is wrong

- Tests that hit the real development database: slow, and they fail when data changes. Keep unit tests pure.
- Snapshot tests of whole pages: they break on every design change and teach you to click "update" without reading.

**Done when:** a pure function has tests you designed, a deliberate bug is caught, and the smoke test passes locally.
