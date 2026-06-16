# Loop Engineering Demo

An autonomous **loop engineering** demo using Claude Code. You define a frontend
feature as a goal; Claude Code loops — build → run → test → screenshot →
compare → fix — until the goal is satisfied, with **no human intervention**.

- **Stack:** Next.js + Tailwind
- **Orchestration:** Claude Code native `/loop` + `/goal` (Approach A)
- **Verification (hybrid):** Playwright (functional/structural) + Claude visual
  judgment against your reference screenshot

---

## One-time setup

```bash
nvm use 20
npm install
npx playwright install chromium
```

## How to run a demo

### 1. Define the goal
Edit **`TASK.md`** — name the feature, list concrete functional requirements,
note any animations.

### 2. Provide the visual target
Save your screenshot as **`reference.png`** in the project root.

### 3. Start the autonomous loop (in Claude Code)
```
/goal Every functional requirement in TASK.md works in the running app, AND the live UI visually matches reference.png (layout, color, spacing, type, animation).

/loop Build the feature in TASK.md. Each iteration: implement in app/page.tsx, translate each TASK.md requirement into a Playwright test in tests/feature.spec.ts, run `npm run verify`, capture the UI with `npm run shot`, visually compare .loop/current.png to reference.png, and fix the gaps. Stop only when /goal is fully met.
```

Claude Code then iterates autonomously until both halves of the goal pass.

---

## The loop, visualized

```
        ┌──────────────────────────────────────────────┐
        │                                               │
        ▼                                               │
  read TASK.md ─► implement ─► npm run verify ─► npm run shot ─► compare to
   + reference     (page.tsx)   (Playwright)      (screenshot)   reference.png
                                                                      │
                              /goal met? ──no──► identify gaps ───────┘
                                  │
                                 yes
                                  ▼
                                 STOP
```

## Files

| Path | Role |
|------|------|
| `TASK.md` | **The goal you hand the loop** (feature + requirements) |
| `reference.png` | Visual target the UI must match |
| `app/page.tsx` | Empty canvas the loop builds into |
| `tests/feature.spec.ts` | Functional gate — loop fills from TASK.md |
| `scripts/shot.mjs` | Captures live UI to `.loop/current.png` |
| `playwright.config.ts` | Boots dev server + runs the functional gate |

## Reset between demos
Revert `app/page.tsx` to the placeholder and `tests/feature.spec.ts` to its
starter state, clear `TASK.md`, and swap `reference.png`.
