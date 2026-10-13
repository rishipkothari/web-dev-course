---
name: add-secret
description: Use whenever code needs a new environment variable, API key, client id/secret, or connection string. Adds the name to .env.example and tells the owner exactly where each value must be set, without ever handling the value.
---

# Add an environment variable

You never see, ask for, or write the value. The owner enters values in dashboards or `.env.local` themselves.

1. **Name it.** UPPER_SNAKE_CASE. Only prefix with `NEXT_PUBLIC_` if the browser genuinely needs it; anything prefixed is visible to every visitor, so never for secrets.
2. **Add the name to `.env.example`** with a one-line comment: what it is and where to get it. No value.
3. **Read it safely in code.** Fail loudly at startup if it is missing (for example, throw an error naming the variable) instead of failing later with a confusing error.
4. **Tell the owner where to set it,** as a table:

| Place | Value to use |
|---|---|
| `.env.local` (PC) | development value |
| Cloud environment (session settings) | development value |
| Vercel Preview | development value (or "not needed") |
| Vercel Production | production value |

5. **Remind** the owner to redeploy on Vercel after setting it, and to restart `npm run dev` locally.
6. If the value is a production credential, it goes only in Vercel Production. Never in this session.
