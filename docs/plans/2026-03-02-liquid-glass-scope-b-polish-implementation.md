# Liquid Glass Scope B Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish existing Liquid Glass scope B visuals by reducing heaviness and improving readability through CSS token tuning.

**Architecture:** Keep existing `cf-*` class usage in JSX and adjust global CSS variables/values in `src/index.css` only.

**Tech Stack:** React + Vite + Tailwind utilities + custom global CSS

---

### Task 1: Define token-level acceptance checks

**Files:**
- Verify: `src/index.css`

**Step 1: Write failing checks**

- Check for tuned token names and lower blur values not yet present.

**Step 2: Run check**

Run: `rg -n "cf-glass-blur-main|cf-glass-blur-soft|blur\\(14px\\)|blur\\(10px\\)" src/index.css`
Expected: no matches before edits.

### Task 2: Tune glass atmosphere and surface tokens

**Files:**
- Modify: `src/index.css`

**Step 1: Add/adjust clarity tokens**

- Add `--cf-glass-blur-main`, `--cf-glass-blur-soft`, saturation tokens.
- Lower border/highlight/noise intensity.

**Step 2: Apply tokens in class rules**

- Update `@supports` blur/saturation values to new tokens.
- Keep fallback behavior intact.

**Step 3: Verify checks pass**

Run: `rg -n "cf-glass-blur-main|cf-glass-blur-soft|blur\\(14px\\)|blur\\(10px\\)" src/index.css`
Expected: matches present after edits.

### Task 3: Validate build

**Files:**
- Verify: `src/index.css`

**Step 1: Run build**

Run: `npm run build`
Expected: successful production build.

**Step 2: Spot-check**

- Main shell remains glass but lighter/cleaner.
- No layout regressions.
