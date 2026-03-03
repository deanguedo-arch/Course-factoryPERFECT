# Builder UI Final Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish the builder UI with a narrow spacing/type/accent polish pass and then create a clean commit of the related builder UI work.

**Architecture:** Add one small verifier for the remaining high-noise UI patterns, replace those patterns with the shared builder system in the shell/shared components/Phase 2/Phase 4/Phase 5, then run the existing verifier suite and build before committing the related builder UI changes.

**Tech Stack:** React, Vite, shared `cf-*` CSS utilities, Node verifier scripts, git

---

### Task 1: Lock The Final Polish Target

**Files:**
- Create: `docs/plans/2026-03-03-builder-ui-final-polish-design.md`
- Create: `docs/plans/2026-03-03-builder-ui-final-polish-implementation.md`

**Step 1: Save the design**

- Capture the narrow polish scope and the explicit non-goals.

**Step 2: Save the implementation plan**

- Keep the pass limited to builder-only UI polish and commit preparation.

### Task 2: Write The Failing Polish Verifier

**Files:**
- Create: `scripts/verify_builder_ui_final_polish.mjs`
- Modify: `src/App.jsx`
- Modify: `src/components/Shared.jsx`
- Modify: `src/components/Phase2.jsx`
- Modify: `src/components/Phase4.jsx`
- Modify: `src/components/Phase5.jsx`

**Step 1: Write the failing verifier**

- Check for remaining high-noise patterns in the targeted files:
  - old uppercase-heavy shell labels
  - multi-accent Phase 2 toggle states
  - old shared toast/code-block styling
  - shouty Phase 4 builder labels/headings
  - uppercase-heavy Phase 5 summary labels

**Step 2: Run test to verify it fails**

Run: `node scripts/verify_builder_ui_final_polish.mjs`

Expected: FAIL before the new polish changes are applied.

### Task 3: Implement The Narrow Polish Pass

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Shared.jsx`
- Modify: `src/components/Phase2.jsx`
- Modify: `src/components/Phase4.jsx`
- Modify: `src/components/Phase5.jsx`
- Modify: `src/index.css` if shared polish tokens are needed

**Step 1: Calm the shell labels**

- Reduce excessive uppercase/tracking in the main shell labels.

**Step 2: Normalize shared feedback components**

- Bring toasts and code blocks closer to the builder glass/control system.

**Step 3: Reduce accent drift in Phase 2 and Phase 4**

- Move Phase 2 tabs/pills to a tighter primary-based language.
- Simplify Phase 4 builder headings and labels without touching compiled-output strings.

**Step 4: Clean Phase 5 summary label density**

- Reduce the dashboard feel in the top metrics.

### Task 4: Verify, Review, And Commit

**Files:**
- Modify: related builder UI files already changed in this session

**Step 1: Verify green**

Run:
- `node scripts/verify_builder_ui_final_polish.mjs`
- `node scripts/verify_builder_ui_theme_system.mjs`
- `node scripts/verify_ui_consistency.mjs`
- `node scripts/verify_phase1_micro_controls.mjs`
- `npm run build`

Expected: all pass.

**Step 2: Review diff**

- Check the final changed files for regressions or overreach.

**Step 3: Commit**

- Create one clean non-amended commit containing the related builder UI work.
