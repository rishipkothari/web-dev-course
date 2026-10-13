// PreToolUse hook for the Bash tool (registered in .claude/settings.json).
// Claude Code sends the pending command as JSON on stdin. Exit code 2 blocks the
// command and shows our message to Claude; exit code 0 lets it run.
// Written in Node, not bash + jq, because Node exists on every machine that runs this project.

import { execSync } from "node:child_process";

const blocked_rules = [
  {
    pattern: /\bdrizzle-kit\s+push\b/,
    reason:
      "drizzle-kit push changes the database without a migration file. Use `npx drizzle-kit generate`, show the SQL, then `npx drizzle-kit migrate` on development.",
  },
  {
    pattern: /\bgit\s+push\b.*(\s--force\b|\s-f\b|\s--force-with-lease\b|\s\+\S)/,
    reason: "Force pushes rewrite shared history. Ask the owner to do it themselves if it is really needed.",
  },
  {
    pattern: /\bgit\s+push\b.*(\s|:)(main|master)\b/,
    reason: "Pushing to main is not allowed. Push the feature branch; main changes only through a pull request.",
  },
  {
    pattern: /\bgh\s+pr\s+merge\b/,
    reason: "Merging pull requests is the owner's job.",
  },
  {
    pattern: /\bvercel\b.*\s--prod\b/,
    reason: "Production deploys happen by merging to main, not from a session.",
  },
  {
    pattern: /(--environment[=\s]+production|\benv\s+pull\b.*\bproduction\b)/,
    reason: "This session must never hold production values.",
  },
  {
    pattern: /\bneon\b.*\bbranches\s+(delete|reset|restore)\b.*\bproduction\b/,
    reason: "The production Neon branch is changed only by the owner.",
  },
  {
    pattern:
      /\b(cat|type|more|less|head|tail|grep|rg|sed|awk|Get-Content|gc|cp|copy|mv|base64|xxd|od|strings)\b[^|;&]*\.env(?!\.example)(\.[\w.-]+)?\b/,
    reason: "Secret files (.env, .env.local, ...) are never read or copied by the agent. Check variables with process.env in code, or ask.",
  },
];

function read_stdin() {
  return new Promise((resolve) => {
    let input_text = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (input_text += chunk));
    process.stdin.on("end", () => resolve(input_text));
  });
}

function current_git_branch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

function block(reason) {
  process.stderr.write(`Blocked by .claude/hooks/guard_commands.mjs: ${reason}\n`);
  process.exit(2);
}

const hook_input = JSON.parse((await read_stdin()) || "{}");
const command_text = hook_input?.tool_input?.command ?? "";

// Creating .env.local from the names-only template is safe and part of setup.
const is_template_copy = /^\s*(cp|copy)\s+\.env\.example\s+\.env\.local\s*$/.test(command_text);

for (const rule of blocked_rules) {
  if (is_template_copy && rule.reason.startsWith("Secret files")) continue;
  if (rule.pattern.test(command_text)) block(rule.reason);
}

// A bare `git push` (no branch named) while on main would push main.
if (/\bgit\s+push\b/.test(command_text)) {
  const branch_name = current_git_branch();
  if (branch_name === "main" || branch_name === "master") {
    block("You are on main. Create a feature branch (`git switch -c task_name`) and push that instead.");
  }
}

// Committing directly on main is the first step toward pushing it.
if (/\bgit\s+commit\b/.test(command_text)) {
  const branch_name = current_git_branch();
  if (branch_name === "main" || branch_name === "master") {
    block("Do not commit on main. Create a feature branch first.");
  }
}

process.exit(0);
