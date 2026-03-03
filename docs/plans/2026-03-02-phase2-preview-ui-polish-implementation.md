# Phase 2 Preview UI Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish Phase 2 internal UI so it matches the Liquid Glass shell and removes clunky purple-heavy CTAs.

**Architecture:** Keep the existing Phase 2 structure and handlers, but restyle the segmented control, search input, empty state, and item cards using `cf-glass-soft` and neutral glass buttons.

**Tech Stack:** React + Vite + Tailwind utilities + custom global CSS utilities (`cf-*`)

---

### Task 1: Write acceptance checks (pre-change)

**Files:**
- Verify: `src/components/Phase2.jsx`

**Step 1: Confirm current clunky markers exist**

Run: `rg -n \"bg-purple-600|bg-slate-900 border border-slate-700 rounded-lg p-4\" src/components/Phase2.jsx`
Expected: matches present before edits.

### Task 2: Update segmented control + search bar styling

**Files:**
- Modify: `src/components/Phase2.jsx`

**Steps**

- Convert segmented container to `cf-glass-soft` and reduce height.
- Replace search bar with a glass input row (no absolute positioning).

### Task 3: Update item card styling + action hierarchy

**Files:**
- Modify: `src/components/Phase2.jsx`

**Steps**

- Convert card container to `cf-glass-soft`.
- Replace solid Preview bar with neutral glass button (accent via icon/border).
- Align Edit/Delete buttons visually (same height and border language).
- Lighten labels/badges to reduce "admin UI" feeling.

### Task 4: Reduce purple dominance in nav badge (small consistency tweak)

**Files:**
- Modify: `src/App.jsx`

**Steps**

- Change Phase 2 badge color from purple to indigo.

### Task 5: Verify checks (post-change) and build

**Files:**
- Verify: `src/components/Phase2.jsx`
- Verify: `src/App.jsx`

**Step 1: Confirm clunky markers removed**

Run: `rg -n \"bg-purple-600\" src/components/Phase2.jsx`
Expected: no matches or reduced to non-dominant use only.

**Step 2: Build**

Run: `npm run build`
Expected: success.
