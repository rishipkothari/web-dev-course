---
order: 19
part: C - Production readiness
title: Working with AI agents safely
minutes: 40
---

# 19 - Working with AI agents safely

**Goal:** a repeatable way of working with Claude Code that keeps you in charge of decisions, keeps changes small, and makes the agent better at your project over time.

**Why:** the agent writes most of the code. Your job is to decide what gets built, check what was built, and make the rules sharper every time something goes wrong.

## The session routine

1. **Start:** Claude reads `LEARNING.md` and says where you are (the `CLAUDE.md` session-start section). Correct it if it is wrong.
2. **Plan before code.** For anything touching more than one file, use plan mode (Shift+Tab cycles modes in the terminal; plan mode in the app). Read the plan. Cut scope until it is one shippable step.
3. **Small diffs.** Ask for one step, run it, look at it. A 40-line diff you understand beats a 600-line diff you approve on faith.
4. **Read the diff before every commit.** `git diff` or the VS Code source control panel. Look especially at: migrations, anything in `.claude/` or `.github/`, `package.json`, and any file you did not expect to change.
5. **End:** ship-check, commit, push, LEARNING.md entry.

## Cloud sessions

- Cloud sessions start from a fresh clone; push before switching, always.
- The cloud environment holds **development values only**. Never paste a production value into it, even "just for a second".
- The hooks, skills and `CLAUDE.md` come with the clone because they are committed.

## Making the agent better at your project

- **Every correction becomes a rule.** If you tell Claude the same thing twice, add it to `CLAUDE.md`. If a mistake could be dangerous, add it to the hook.
- **Repeated procedures become skills.** When you notice you are describing the same multi-step process again, ask Claude to "use skill-creator to make a skill for this". The template's four skills started this way.
- **Let Claude write its own database rules.** After a few schema changes, ask: "Based on our migrations so far, propose additions to the Database section of CLAUDE.md." Review and keep the good ones.

## Things to refuse

- "I'll just skip that failing test / lint rule." No: fix it or ask why it fails.
- Any suggestion to run something against production from a session.
- Adding a dependency or service you did not ask for. The `CLAUDE.md` ask-before list covers this; hold the line.
- "Paste your API key here." Never.

## Exercise

1. Review the last three PRs. For each, name one thing you would now catch earlier.
2. Turn one of those into a `CLAUDE.md` rule or a new skill.
3. Ask a fresh session to explain the project's rules back to you; fix anything it gets wrong in `CLAUDE.md`.

**Done when:** `CLAUDE.md` has at least one rule that came from your own experience.
