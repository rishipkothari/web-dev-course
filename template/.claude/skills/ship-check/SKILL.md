---
name: ship-check
description: Use before saying a task is done, before committing, or before the owner opens a pull request. Runs the same checks as CI and summarizes what changed and what the owner must do.
---

# Ship check

1. Run, in order, and stop at the first failure (fix it, do not skip it):
   - `npm run lint`
   - `npm run typecheck`
   - `npm test`
   - `npx drizzle-kit check`
   - `npm run build`
2. `git status` and `git diff --stat`: confirm only intended files changed, no `.env*` file except `.env.example`, no stray debug code.
3. Summarize for the owner:
   - What changed and why (3 to 5 lines).
   - New migrations, with the one-line meaning of each.
   - New environment variables and where they must be set.
   - Anything that needs doing around the merge (set a Vercel variable, redeploy). Merging runs any new migrations on production during the build: say so explicitly, and flag any migration that is not purely additive, because it is live before the code and survives a code rollback.
4. Ask whether to commit. After committing: push the branch and tell the owner it is pushed and that a PR can be opened.
