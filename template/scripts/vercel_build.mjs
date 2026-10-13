// Vercel runs this instead of `npm run build` because package.json defines "vercel-build".
// Production builds: apply pending migrations to the production Neon branch, then build.
// Preview builds: build only. Several branches share the development database, so
// they never migrate it automatically; you migrate development by hand (db-change skill).
// If the migration fails, this script exits non-zero, the build fails, and the
// previous production deploy keeps serving traffic.

import { execSync } from "node:child_process";

const vercel_environment = process.env.VERCEL_ENV ?? "unknown";

function run_step(step_label, shell_command) {
  console.log(`\n[vercel_build] ${step_label}: ${shell_command}`);
  execSync(shell_command, { stdio: "inherit" });
}

if (vercel_environment === "production") {
  if (!process.env.DATABASE_URL_UNPOOLED) {
    console.error("[vercel_build] DATABASE_URL_UNPOOLED is not set for Production. Refusing to build without migrating.");
    process.exit(1);
  }
  run_step("migrate production", "npx drizzle-kit migrate");
} else {
  console.log(`[vercel_build] VERCEL_ENV=${vercel_environment}: skipping migrations.`);
}

run_step("build", "npx next build");
