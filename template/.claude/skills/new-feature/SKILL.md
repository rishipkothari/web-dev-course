---
name: new-feature
description: Use when starting any new task or feature in this project. Syncs with GitHub, creates a correctly named branch, and produces a small plan before any code is written.
---

# Start a new feature

1. **Sync.** `git status`. If there are uncommitted changes, stop and ask what to do with them. Then `git switch main` and `git pull`.
2. **Branch.** `git switch -c <snake_case_task_name>`. One branch per task.
3. **Read context.** `LEARNING.md` (current phase), then only the files the task touches.
4. **Plan.** Write a plan of at most about 10 lines: what changes, which files, any schema change (use the `db-change` skill), any new environment variable (use the `add-secret` skill), and how we will check it works. Keep the scope to one small, shippable thing; if the task is bigger, propose how to split it.
5. **Wait** for the owner to agree before writing code.
6. **Build in small steps,** running the app or tests after each step.
7. **Finish** with the `ship-check` skill.
