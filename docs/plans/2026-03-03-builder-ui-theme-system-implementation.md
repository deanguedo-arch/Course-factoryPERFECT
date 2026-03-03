# Builder UI Theme System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a builder-only dark/light theme system with a simple persisted toggle while finishing the remaining inconsistent builder screens and modal interiors.

**Architecture:** Store the builder theme in `App.jsx`, persist it to local storage, and apply it through a document-level `data-builder-theme` attribute. Drive shared builder surfaces from tokenized CSS in `src/index.css`, then normalize the remaining outlier screens and edit interiors onto the same shared control system and accent rules.

**Tech Stack:** React, Vite, Tailwind utility classes, shared `cf-*` CSS utilities, Node verifier scripts

---

### Task 1: Document And Lock The Target

**Files:**
- Create: `docs/plans/2026-03-03-builder-ui-theme-system-design.md`
- Create: `docs/plans/2026-03-03-builder-ui-theme-system-implementation.md`

**Step 1: Save the approved design**

- Capture the approved builder-only scope, theme goals, and finishing targets in the design doc.

**Step 2: Save the implementation plan**

- Break the redesign into testable tasks with verifier-first execution.

### Task 2: Write The Failing Verifier

**Files:**
- Create: `scripts/verify_builder_ui_theme_system.mjs`
- Modify: `src/App.jsx`
- Modify: `src/index.css`
- Modify: `src/components/Phase0.jsx`
- Modify: `src/components/Phase3.jsx`

**Step 1: Write the failing verifier**

- Check for:
  - builder theme local storage key and document dataset wiring in `src/App.jsx`
  - dark and light theme selectors in `src/index.css`
  - a visible shell toggle in `src/App.jsx`
  - removal of key legacy control patterns in `Phase 0` and `Phase 3`

**Step 2: Run test to verify it fails**

Run: `node scripts/verify_builder_ui_theme_system.mjs`

Expected: FAIL because the builder theme system and remaining cleanup targets are not implemented yet.

### Task 3: Implement The Theme System

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/index.css`

**Step 1: Write minimal implementation**

- Add builder theme state with dark default and local storage persistence.
- Apply `data-builder-theme` to `document.documentElement`.
- Add a simple header toggle control that switches between dark and light themes.
- Split the current builder tokens into explicit dark and light token sets.
- Add a scoped light-theme override layer for common hard-coded dark utility classes inside the builder shell.

**Step 2: Run verifier to check progress**

Run: `node scripts/verify_builder_ui_theme_system.mjs`

Expected: theme-system checks move toward pass while visual cleanup checks still fail if not completed.

### Task 4: Normalize Phase 0 And Phase 3

**Files:**
- Modify: `src/components/Phase0.jsx`
- Modify: `src/components/Phase3.jsx`
- Modify: `src/index.css`

**Step 1: Bring Phase 0 controls onto the shared system**

- Replace the old select, textarea, button, and selection-list shells with shared glass/control classes.

**Step 2: Bring Phase 3 controls onto the shared system**

- Replace old flat backup/restore/reset controls and safety panels with shared panels and semantic action hierarchy.

**Step 3: Re-run the verifier**

Run: `node scripts/verify_builder_ui_theme_system.mjs`

Expected: `Phase 0` and `Phase 3` legacy-pattern checks pass.

### Task 5: Clean Modal And Drawer Interiors

**Files:**
- Modify: `src/components/Phase1.jsx`
- Modify: `src/components/Phase2.jsx`
- Modify: `src/components/Phase4.jsx`
- Modify: `src/index.css`

**Step 1: Update the worst remaining raw interiors**

- Replace repeated raw field wrappers, interior panels, badge rows, and hard-edged selection blocks with shared builder patterns.
- Reduce excessive uppercase micro-labeling where it is visually noisy.
- Align accent usage to the tighter semantic palette.

**Step 2: Verify green**

Run:
- `node scripts/verify_builder_ui_theme_system.mjs`
- `node scripts/verify_ui_consistency.mjs`
- `node scripts/verify_phase1_micro_controls.mjs`
- `npm run build`

Expected:
- All verifier scripts PASS
- Production build succeeds

### Task 6: Final Review Notes

**Files:**
- Modify: `docs/plans/2026-03-02-session-log.md` if additional session logging is needed

**Step 1: Record notable decisions if necessary**

- Note the builder-only theme boundary and the chosen token/override approach if future handoff value justifies it.
