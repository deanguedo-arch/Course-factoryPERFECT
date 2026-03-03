# Full Consistency Sweep Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Normalize the tool's shared controls and deeper Phase 1 editor surfaces so the app reads as one coherent liquid-glass product.

**Architecture:** Add a reusable `cf-*` control layer in `src/index.css`, then swap repeated one-off Tailwind strings in the shell and targeted phases to those shared classes. Keep all existing handlers and screen structure intact.

**Tech Stack:** React + Vite + Tailwind utilities + custom global CSS utilities (`cf-*`) + Node verification script

---

### Task 1: Write the failing consistency verifier

**Files:**
- Create: `scripts/verify_ui_consistency.mjs`

**Steps**

- Read `src/index.css`, `src/App.jsx`, `src/components/Section.jsx`, `src/components/Phase1.jsx`, `src/components/Phase5.jsx`.
- Assert that the new utility classes do not yet exist everywhere they need to.
- Run the verifier and confirm it fails before any UI code changes.

### Task 2: Add shared control utilities

**Files:**
- Modify: `src/index.css`

**Steps**

- Add reusable classes for `cf-btn`, button variants, `cf-tab-rail`, `cf-tab-btn`, `cf-pill`, `cf-input-shell`, `cf-panel-muted`, `cf-alert`, and `cf-nav-item`.
- Keep contrast and focus states readable.
- Keep motion small and cheap.

### Task 3: Rewire shell navigation and Fast Lane

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Section.jsx`

**Steps**

- Replace one-off Fast Lane buttons with shared button variants.
- Move section nav active/inactive styling into the shared nav item pattern.
- Keep collapsed and expanded behavior unchanged.

### Task 4: Normalize deep Phase 1 editor controls

**Files:**
- Modify: `src/components/Phase1.jsx`

**Steps**

- Convert assessment mode tabs, question-type toggles, generation actions, helper panels, and repeated field wrappers to the shared control system.
- Reduce solid purple/blue dominance in the visible assessment/editor flows.
- Keep dense editor areas readable and maintain current behavior.

### Task 5: Align remaining phase controls

**Files:**
- Modify: `src/components/Phase2.jsx`
- Modify: `src/components/Phase4.jsx`
- Modify: `src/components/Phase5.jsx`

**Steps**

- Reuse the shared button/input/alert patterns where existing screens still have one-off controls.
- Bring Phase 5 import/export/maintenance controls into the same hierarchy.

### Task 6: Verify and build

**Files:**
- Verify: `scripts/verify_ui_consistency.mjs`
- Verify: `src/index.css`
- Verify: `src/App.jsx`
- Verify: `src/components/Section.jsx`
- Verify: `src/components/Phase1.jsx`
- Verify: `src/components/Phase2.jsx`
- Verify: `src/components/Phase4.jsx`
- Verify: `src/components/Phase5.jsx`

**Steps**

- Run `node scripts/verify_ui_consistency.mjs` and confirm it passes.
- Run `npm run build` and confirm the app still builds cleanly.
