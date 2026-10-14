// drizzle-kit settings. drizzle-kit (generate, migrate, check, studio) reads this file.
// It uses the DIRECT (unpooled) Neon connection: migrations need a real Postgres session.
// Locally that comes from .env.local, which must point at the development branch.
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" }); // no-op on Vercel and in CI, where variables are already set

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  schemaFilter: ["public"], // only our own tables; neon_auth belongs to Neon Auth
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
  verbose: true, // print the SQL it runs
});
