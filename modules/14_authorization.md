---
order: 14
part: B - The hygiene loop
title: Authorization - who may do what
minutes: 45
---

# 14 - Authorization: who may do what

**Goal:** users can only change their own rows, enforced on the server, and you have proven it with a second account.

**Why:** authentication answers "who are you?"; authorization answers "may you do this?". Almost every real data leak is an authorization bug: the server trusted something the browser sent.

## The rule

Every server action and route handler that touches user-owned data:

1. Gets the session on the server (`const { data: session } = await auth.getSession()`). No session -> refuse.
2. Uses `session.user.id`, never a user id sent from the browser.
3. Puts that id **in the SQL**: `where(and(eq(guestbook_entries.id, entry_id), eq(guestbook_entries.user_id, session.user.id)))`. Then "not yours" and "does not exist" look the same, which is what you want.

Hiding a delete button in the UI is a convenience, not a check. Anyone can send the request without the button.

## Steps

1. **db-change:** add `user_id` to `guestbook_entries`, with the same type as the user id in `neon_auth` (module 12 recorded it). Add a real foreign key only if module 12's test showed one works; otherwise the column stays unconstrained and the ownership check below is what protects it. Show the author by joining to Neon's user table in the query. Existing rows have no owner: make it nullable (expand), or delete development's sample rows and reseed. On production, existing rows stay ownerless and simply cannot be deleted by anyone; that is acceptable here.
2. **Claude builds:** signed-in users can post; entries show the author; a delete action that follows the three-part rule above.
3. **Second user.** Sign in on localhost with a second Google account (or ask a friend), post an entry.

## Prove it

1. As user A, find user B's entry id (it is in the page or the database).
2. Call the delete action for B's entry as A. Ask Claude to show you how to send that request directly (from the browser console, or a small script) instead of through the UI.
3. It must fail, and B's row must still be there.
4. Ask Claude to write a test for the ownership check in the delete logic (pure function taking `session_user_id` and the row) so it stays proven.

## Row-level security (optional)

Postgres can enforce ownership itself with RLS policies, so even a buggy query cannot read others' rows. Supabase leans on it heavily. Here, with one server talking to the database as one role, app-layer checks are the primary defence and RLS is an optional extra layer. Know it exists; add it if a project stores something truly sensitive.

**Done when:** the forged delete fails, and a test proves the rule.
