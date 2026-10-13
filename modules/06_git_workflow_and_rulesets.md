---
order: 6
part: B - The hygiene loop
title: Git workflow and the main ruleset
minutes: 45
---

# 06 - Git workflow and the main ruleset

**Goal:** every change reaches production through the same loop, and GitHub itself refuses anything else.

**Why:** "I do everything on prod" is a workflow problem, not a carefulness problem. The loop makes the safe path the only path.

## The loop

```
switch main + pull -> new branch -> commits -> push -> pull request
   -> CI runs + Vercel preview deploys -> you check the preview -> squash merge
   -> production deploys from main
```

Five git commands cover almost all of it (Claude usually runs them; you should recognize them):

| Command | Means |
|---|---|
| `git switch main` then `git pull` | Get the latest merged work |
| `git switch -c add_guestbook` | New branch for one task |
| `git add -A` then `git commit -m "..."` | Record a checkpoint |
| `git push -u origin add_guestbook` | Send the branch to GitHub (first push) |
| `gh pr create --fill` | Open a pull request |

The `new-feature` skill does the first two and a plan; ask Claude to "start a new feature: X".

## Steps

1. **Repo public.** Settings -> General -> Danger Zone -> Change visibility. Before doing this on an existing repo, ask Claude to scan the full git history for committed secrets. (Branch protection on private repos needs GitHub Pro; on public repos it is free. Your secrets are never in the repo, so public is safe.)
2. **Squash merging only.** Settings -> General -> Pull Requests: allow squash merging, untick the others. One PR becomes one commit on `main`: readable history, one-click revert.
3. **Ruleset on `main`.** Settings -> Rules -> Rulesets -> New branch ruleset:
   - Target: default branch.
   - Enforcement: Active.
   - Rules: Restrict deletions; Require a pull request before merging (0 approvals is fine solo); Block force pushes.
   - "Require status checks to pass" gets added in module 7, once CI exists.
   - Bypass list: leave empty. Yes, that includes you.
4. **Run the loop once** with a trivial change (a line of text): branch, commit, push, PR, look at the preview, squash merge, watch production update.

## Break it on purpose

From your own terminal (not Claude, whose hook already blocks it):

```powershell
git switch main
git commit --allow-empty -m "direct push test"
git push
```

GitHub rejects it: the ruleset applies to you too. Clean up with `git reset --hard origin/main`.

## What breaks if it is wrong

- No ruleset: one tired evening, one push to `main`, production changes without a preview.
- Merge commits instead of squash: history full of "fix typo" commits, harder rollback.
- Long-lived branches: they drift from `main` and merge painfully. Keep branches to a task, hours to days.

**Done when:** a direct push to `main` is rejected and one change has gone through the full loop.
