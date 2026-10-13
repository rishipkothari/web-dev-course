---
order: 2
part: A - Setup
title: Claude Code guardrails
minutes: 45
---

# 02 - Claude Code guardrails

**Goal:** the agent physically cannot push to `main`, run `drizzle-kit push`, or read your secret files, and it knows the project's rules from the first message of every session.

**Why first:** good habits are cheapest when they are automatic. `CLAUDE.md` is guidance, and an agent can misread guidance. A hook is code that runs before every shell command and refuses the dangerous ones. You want both before the first line of app code.

## The three layers

| Layer | File | Strength |
|---|---|---|
| Rules | `CLAUDE.md` | The agent reads it every session; it can still make mistakes |
| Permissions | `.claude/settings.json` -> `permissions.deny` | Claude Code refuses to read or edit the listed files |
| Hooks | `.claude/hooks/guard_commands.mjs` | Runs before every Bash command; exit code 2 blocks it with a reason |

All three are committed to the repo, so a cloud session (a fresh clone) gets them too. Anything you put only in `~/.claude` on your PC does not exist in the cloud.

## Steps

1. **Copy the kit** from this course's `template/` folder into your project (see `template/README.md`). Edit the top of `CLAUDE.md`.
2. **Read `guard_commands.mjs`.** It is about 90 lines. You should be able to say, for each rule, what mistake it prevents.
3. **Read `settings.json`.** Note the deny list: `.env`, `.env.local`, `.env.production*`, `.vercel/`.
4. **Start Claude Code** in the project and ask: "What are this project's git and database rules?" It should answer from `CLAUDE.md`.

## Break it on purpose

Ask Claude, in a throwaway branch:

1. "Run `git push origin main`." It should be blocked with the hook's message.
2. "Show me what's in .env.local." Blocked by the deny rule, and by the hook if it tries `cat`.
3. "Run `npx drizzle-kit push`." Blocked.

Seeing the block messages once makes them familiar when they appear for real.

## Install the vendor skills

Skills are folders of instructions Claude loads when a task matches their description. Vendor skills carry each tool's current best practices, which matters because these tools change faster than any model's training data.

```powershell
npx skills add neondatabase/agent-skills --skill neon-postgres -a claude-code
npx skills add better-auth/skills -a claude-code
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices -a claude-code
```

Before committing them, open each `SKILL.md` and skim it. A skill is instructions your agent will follow, so a malicious one is a real attack path; stick to the vendors' own repos. Confirm each landed under `.claude/skills/`, then commit.

Do **not** install the Neon MCP server (it reaches your whole Neon account, production included) or Vercel's deploy skill (deploys go through git).

## What breaks if it is wrong

- Hook not registered or Node missing: nothing is blocked and nothing tells you. That is why you test it above.
- Kit only in `~/.claude`: the PC is safe, cloud sessions are not.
- Skill from an unknown repo: unreviewed instructions inside your agent.

**Done when:** all three "break it" attempts are blocked, and the skills are committed.
