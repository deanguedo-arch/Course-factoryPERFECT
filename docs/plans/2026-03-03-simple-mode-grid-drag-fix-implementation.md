# Simple Mode Grid Drag Fix Implementation Plan

**Goal:** Replace broken insertion-line-only simple drag behavior with real grid movement (row/col/colSpan) plus valid/invalid preview gating.

## Task 1: RED Verifier Update

Files:
- Modify: `scripts/verify_composer_canvas_validation.mjs`

Steps:
1. Change checks to require:
   - `validateComposerSimpleProposal` export in `src/composer/layout.js`
   - overlay usage of `validateComposerSimpleProposal`
   - simple mode commit path through `onSimpleLayoutChange` with validity gating
2. Remove requirements tied to insertion-line-only behavior:
   - `resolveComposerSimpleInsertionTarget`
   - `onSimpleInsertionChange`
   - `cf-composer-insertion-line`
   - `cf-composer-insertion-gap`
3. Run `node scripts/verify_composer_canvas_validation.mjs` and confirm RED failure.

## Task 2: Add Pure Simple Proposal Validator

Files:
- Modify: `src/composer/layout.js`

Steps:
1. Add `validateComposerSimpleProposal(activities, activeIndex, proposal, { maxColumns })`.
2. Validate bounds and collisions for simple mode while excluding the active block.
3. Return `{ valid, reason, layout }` normalized to integer `row/col/colSpan`.
4. Re-run verifier and ensure helper-related checks pass.

## Task 3: Replace Overlay Simple Drag Path

Files:
- Modify: `src/components/composer/ComposerCanvasBlockOverlay.jsx`

Steps:
1. Remove insertion-target drag flow (`previewKind === 'simple-insert'`, insertion preview state, insertion commit path).
2. Compute simple drag proposal via pointer-to-grid conversion (`row/col/colSpan`).
3. Validate with `validateComposerSimpleProposal`.
4. Show:
   - normal draft preview when valid
   - blocked-red preview when invalid
5. Commit only valid simple proposals to `onSimpleLayoutChange`.
6. Keep canvas mode logic unchanged.

## Task 4: Remove Obsolete Wiring

Files:
- Modify: `src/components/Phase1.jsx`
- Modify: `src/components/modals/EditModal.jsx`

Steps:
1. Remove `moveComposerActivityToInsertion` imports and insertion callback functions.
2. Remove `onSimpleInsertionChange`/`selectedIndex`/`activities` overlay props if no longer needed.
3. Keep `onSimpleLayoutChange` wiring intact.

## Task 5: CSS + Validation Sweep

Files:
- Modify: `src/index.css` (only if insertion-only classes can be removed safely)
- Modify: `docs/plans/2026-03-03-session-handoff.md`

Steps:
1. Keep invalid preview styles used by both canvas and simple paths.
2. Remove unused insertion-line/gap styles if no longer referenced.
3. Run full checks:
   - `node scripts/verify_composer_canvas_validation.mjs`
   - `node scripts/verify_composer_part_c.mjs`
   - `node scripts/verify_composer_light_mode_legibility.mjs`
   - `node scripts/verify_composer_canvas_overlay_redesign.mjs`
   - `node scripts/verify_builder_ui_final_polish.mjs`
   - `node scripts/verify_builder_ui_theme_system.mjs`
   - `node scripts/verify_ui_consistency.mjs`
   - `node scripts/verify_phase1_micro_controls.mjs`
   - `npm run build`
4. Update handoff log and commit.
