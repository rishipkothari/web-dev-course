# web-dev-course

A hands-on crash course in the normal practices of web development, for a hobbyist building real apps with Claude Code: separate environments, migrations, auth, CI, and running things in production without breaking them.

Each module is one sitting of 30 to 60 minutes: a little reading, mostly doing, and usually one thing you break on purpose so the error is familiar later. Modules are project-agnostic. You do them in a practice project first (`cc-tutorial-webapp-1`), then a lighter pass in a real one (`ff-sandbox`).

## Start here

- **[stack.md](stack.md)** - the reference: every tool, why it was chosen, the settings that matter, free-tier limits (dated), costs, and alternatives considered.
- **[template/](template/)** - the kit you copy into every project: `CLAUDE.md`, guardrail hooks, workflow skills, CI, and the production build script.

## Modules

| # | Module | Min | Part |
|---|---|---|---|
| 01 | [Machine setup](modules/01_machine_setup.md) | 45 | A - Setup |
| 02 | [Claude Code guardrails](modules/02_claude_code_guardrails.md) | 45 | A - Setup |
| 03 | [The environment map and secrets](modules/03_environment_map_and_secrets.md) | 30 | A - Setup |
| 04 | [Neon: branches and connection strings](modules/04_neon_branches_and_connections.md) | 40 | A - Setup |
| 05 | [Vercel environments and variables](modules/05_vercel_environments.md) | 40 | A - Setup |
| 06 | [Git workflow and the main ruleset](modules/06_git_workflow_and_rulesets.md) | 45 | B - Hygiene loop |
| 07 | [CI guardrails](modules/07_ci_guardrails.md) | 40 | B - Hygiene loop |
| 08 | [Drizzle: your first table](modules/08_drizzle_first_table.md) | 45 | B - Hygiene loop |
| 09 | [Migrations on development](modules/09_migrations_on_development.md) | 40 | B - Hygiene loop |
| 10 | [Migrations to production](modules/10_migrations_to_production.md) | 40 | B - Hygiene loop |
| 11 | [Risky migrations: expand and contract](modules/11_risky_migrations.md) | 50 | B - Hygiene loop |
| 12 | [Auth with Neon Auth (local)](modules/12_auth_neon_auth_local.md) | 50 | B - Hygiene loop |
| 13 | [Auth in production (and previews)](modules/13_auth_in_production.md) | 45 | B - Hygiene loop |
| 14 | [Authorization: who may do what](modules/14_authorization.md) | 45 | B - Hygiene loop |
| 15 | [UI foundation: Tailwind and shadcn/ui](modules/15_ui_tailwind_shadcn.md) | 40 | C - Production readiness |
| 16 | [Testing, proportionally](modules/16_testing.md) | 50 | C - Production readiness |
| 17 | [Seeing what production is doing](modules/17_observability.md) | 40 | C - Production readiness |
| 18 | [Rollback and restore drills](modules/18_rollback_and_restore_drills.md) | 45 | C - Production readiness |
| 19 | [Working with AI agents safely](modules/19_working_with_agents.md) | 40 | C - Production readiness |
| 20 | [Turn it into a template](modules/20_templating.md) | 45 | C - Production readiness |
| 21 | [Payments with Stripe (stub)](modules/21_payments_stub.md) | - | D - Later |

## Design decisions

- **Guardrails before features.** The hooks, the `main` ruleset and CI come before the first table, so every later module happens inside them.
- **No staging (yet).** Local, cloud and preview share a resettable `development` database branch; production is separate. Staging returns with payments (module 21).
- **One answer to "who runs prod migrations?":** the Vercel production build, triggered by merging to `main` (module 10).
- **Public repos.** Free branch protection; secrets never live in git anyway.
- **Managed auth, users in your own database.** Neon Auth runs sign-in; users are SQL tables in the `neon_auth` schema and branch with the data. Clerk gets a fresh look before Nannager (`stack.md` section 15).

## Using it from a project

Each project's `LEARNING.md` links to the module it is on. Claude can read a module directly from its raw URL, for example:
`https://raw.githubusercontent.com/rishipkothari/web-dev-course/main/modules/08_drizzle_first_table.md`

## Conventions

Front matter on every module (`order`, `part`, `title`, `minutes`). File names in snake_case. No em dashes. Facts that change carry the date they were checked.
