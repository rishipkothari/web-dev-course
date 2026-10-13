---
order: 1
part: A - Setup
title: Machine setup
minutes: 45
---

# 01 - Machine setup

**Goal:** one Windows machine that can clone, run, and push a Next.js project, with the same Node version as Vercel and cloud sessions.

**Why:** "works on my machine" bugs mostly come from version drift. Pinning Node and using one shell setup removes a whole class of problems before they start.

## You do

1. **Node.js 24 LTS** from nodejs.org (the LTS installer, defaults). If an older Node is installed, uninstall it first in "Add or remove programs".
2. **Git for Windows** from git-scm.com (defaults). This installs Git Bash and Git Credential Manager, which handles GitHub login through the browser.
3. **VS Code** (optional but useful for reading diffs).
4. **GitHub CLI** (`gh`) from cli.github.com. Then, in a new terminal:
   ```powershell
   gh auth login
   ```
   Choose GitHub.com, HTTPS, log in with a browser.
5. **PowerShell execution policy**, once:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```
   Without it, `npm` fails with "npm.ps1 cannot be loaded". `RemoteSigned` lets local scripts run and requires downloaded ones to be signed; it affects only your user.
6. **Git identity**, once:
   ```powershell
   git config --global user.name "Your Name"
   git config --global user.email "the-email-on-your-github-account"
   ```

## Check

Open a **new, non-admin** terminal (admin terminals start in `C:\WINDOWS\system32`, where npm finds no project):

```powershell
node -v        # v24.x
npm -v
git --version
gh auth status # Logged in to github.com
```

Then clone any project of yours, `cd` into it, `npm install`, `npm run dev`, and open http://localhost:3000.

## How the version is pinned

- `.nvmrc` contains `24`. Cloud sessions read it (the session-start hook installs that version).
- `package.json` has `"engines": { "node": "24.x" }`. Vercel reads it; npm warns on mismatch.

## What breaks if it is wrong

| Symptom | Cause |
|---|---|
| `npm.ps1 cannot be loaded` | Execution policy not set |
| `ENOENT ... system32\package.json` | Running npm outside the project folder (usually an admin terminal) |
| Build passes locally, fails on Vercel | Node version mismatch |
| App starts on port 3001 | Something else holds 3000; stop it, because the local OAuth callback is registered on 3000 |

## A note on Windows 10

Consumer security updates for Windows 10 end on October 13, 2026 (stack.md, section 13). The machine will hold your GitHub login and development database strings. Plan an upgrade; nothing in this course needs it.

**Done when:** all four version checks print, and a project runs on localhost:3000.
