# Composer Light Mode Legibility Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Repair light-mode readability in the composer workspace by making composer chrome theme-aware and replacing the remaining dark-only inspector toolbar fragments.

**Architecture:** Add explicit composer theme classes in `src/index.css`, move shared composer components to those classes, and directly patch the duplicated rich-editor control fragments in `Phase1.jsx` and `EditModal.jsx`. Verify with a new script that checks both CSS coverage and removal of key dark-only patterns.

**Tech Stack:** React, Vite, shared `cf-*` CSS utilities, Node verifier scripts

---

### Task 1: Save The Design And Plan

**Files:**
- Create: `docs/plans/2026-03-03-composer-light-mode-legibility-design.md`
- Create: `docs/plans/2026-03-03-composer-light-mode-legibility-implementation.md`

**Step 1: Save the approved repair boundary**

- Document the narrow composer-only legibility scope.

**Step 2: Save the implementation plan**

- Break the fix into verifier-first steps.

### Task 2: Write The Failing Verifier

**Files:**
- Create: `scripts/verify_composer_light_mode_legibility.mjs`
- Modify: `src/index.css`
- Modify: `src/components/composer/ComposerPaneCard.jsx`
- Modify: `src/components/composer/ComposerInspectorSection.jsx`
- Modify: `src/components/composer/ComposerPreviewToolbar.jsx`
- Modify: `src/components/composer/ComposerWorkspaceControls.jsx`
- Modify: `src/components/composer/ComposerCanvasShell.jsx`
- Modify: `src/components/Phase1.jsx`
- Modify: `src/components/modals/EditModal.jsx`

**Step 1: Write the failing verifier**

- Check for:
  - explicit composer theme classes in `src/index.css`
  - light-mode composer selectors in `src/index.css`
  - removal of dark-only raw panel classes from shared composer components
  - removal of dark-only rich-editor toolbar fragments from `Phase1.jsx` and `EditModal.jsx`

**Step 2: Run test to verify it fails**

Run: `node scripts/verify_composer_light_mode_legibility.mjs`

Expected: FAIL before implementation.

### Task 3: Make Shared Composer Chrome Theme-Aware

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/composer/ComposerPaneCard.jsx`
- Modify: `src/components/composer/ComposerActivityEditorPane.jsx`
- Modify: `src/components/composer/ComposerInspectorSection.jsx`
- Modify: `src/components/composer/ComposerPreviewToolbar.jsx`
- Modify: `src/components/composer/ComposerWorkspaceControls.jsx`
- Modify: `src/components/composer/ComposerCanvasShell.jsx`

**Step 1: Add composer classes**

- Add composer panel, section, toolbar, rail, and control classes with dark and light behavior.

**Step 2: Rewire shared composer components**

- Replace raw dark utility assumptions with the new composer classes.

### Task 4: Patch Local Inspector Toolbars

**Files:**
- Modify: `src/components/Phase1.jsx`
- Modify: `src/components/modals/EditModal.jsx`
- Modify: `src/index.css`

**Step 1: Replace duplicated local dark-only toolbar blocks**

- Convert the rich/plain toggle wrappers, toolbar rows, color/fill controls, and reset actions to the theme-aware shared styling.

**Step 2: Keep behavior unchanged**

- Do not alter editor commands or data flow.

### Task 5: Verify Green

**Files:**
- Modify: any touched files above if follow-up fixes are needed

**Step 1: Run the legibility verifier**

Run: `node scripts/verify_composer_light_mode_legibility.mjs`

Expected: PASS

**Step 2: Run the existing verifier suite and build**

Run:
- `node scripts/verify_builder_ui_final_polish.mjs`
- `node scripts/verify_builder_ui_theme_system.mjs`
- `node scripts/verify_ui_consistency.mjs`
- `node scripts/verify_phase1_micro_controls.mjs`
- `npm run build`

Expected: all PASS
