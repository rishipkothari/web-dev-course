---
order: 15
part: C - Production readiness
title: UI foundation - Tailwind and shadcn/ui
minutes: 40
---

# 15 - UI foundation: Tailwind and shadcn/ui

**Goal:** the project uses Tailwind CSS and shadcn/ui, so every future page (yours or Claude's) follows one visual pattern.

**Why:** an agent follows the patterns it finds. A project with one styling system gets consistent new pages; a project with three gets a fourth. Tailwind plus shadcn is also the combination AI agents produce most reliably.

## What they are

- **Tailwind CSS:** utility classes in the markup (`className="p-4 text-sm font-medium"`) instead of separate CSS files. Looks noisy at first; the payoff is that a component's look is visible where the component is.
- **shadcn/ui:** not a library you import, but a CLI that **copies** component source (Button, Card, Dialog, Form) into `src/components/ui/`. You own the code and can change it. Built on accessible primitives, styled with Tailwind.

## Steps

1. Branch: `add_tailwind_shadcn`.
2. `npx shadcn@latest init` (ask Claude to run it and explain each prompt). It installs Tailwind if missing, adds a theme in `globals.css`, a `components.json`, and a `cn()` helper.
3. Add a few components: `npx shadcn@latest add button card input`.
4. Ask Claude to restyle the guestbook page using Card, Input and Button, and to remove the old CSS module.
5. Add a short "UI conventions" section to `CLAUDE.md`: "Use shadcn/ui components from `src/components/ui`; style with Tailwind classes; no new CSS modules; add components with `npx shadcn@latest add <name>`."
6. Ship it through the loop. Check the preview on your phone too.

## What breaks if it is wrong

- Editing a file under `components/ui/` and later re-running `shadcn add` for the same component overwrites your change. Make variants instead, or note the edit.
- Mixing CSS modules and Tailwind on the same element: two sources of truth for one look.

## When this matters for the template

Because the template project will include this setup, every future project starts with the same look and the same instructions. That is the "establish patterns" habit.

**Done when:** the guestbook uses shadcn components and `CLAUDE.md` states the UI convention.
