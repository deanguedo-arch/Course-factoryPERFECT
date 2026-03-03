# Simple Mode Grid Drag Fix Design

## Problem

Stacked/simple mode drag currently only shows a vertical insertion line and does not actually move blocks by row/column in a usable way. Authors can resize width, but drag feels non-functional.

## Goal

Restore practical movement in simple mode with the same interaction clarity as canvas mode:
- live grid placement preview while dragging
- blocked-red preview for invalid targets
- commit only on valid drop
- no commit on invalid drop

## Chosen Approach

Use constrained simple-grid placement during drag (row/col/colSpan), not insertion-only ordering.

### Canvas Mode
- Keep existing behavior unchanged.

### Simple Mode
- Drag computes a live row/col proposal from pointer position.
- Proposal is validated against simple-mode bounds/collision rules.
- Valid proposal renders normal draft preview.
- Invalid proposal renders blocked-red preview.
- Drop commits only valid proposals through `onSimpleLayoutChange`.
- Invalid drop reverts with no layout update.

### Simple Resize
- Keep width resize behavior.
- Run the same simple proposal validation before commit.

## Architecture

- Add pure helper in `src/composer/layout.js`:
  - `validateComposerSimpleProposal(activities, activeIndex, proposal, { maxColumns })`
- Update `src/components/composer/ComposerCanvasBlockOverlay.jsx`:
  - remove insertion-line simple drag path
  - use simple proposal validation for drag and resize-x
  - gate commit by proposal validity
- Keep Phase1/EditModal callback surface stable (`onSimpleLayoutChange`) for this fix.

## Verification

- Update `scripts/verify_composer_canvas_validation.mjs` to enforce:
  - simple proposal validator export exists
  - overlay uses simple validator
  - insertion-line hooks are no longer required for simple drag
- Run:
  - `node scripts/verify_composer_canvas_validation.mjs`
  - `node scripts/verify_composer_part_c.mjs`
  - `node scripts/verify_composer_light_mode_legibility.mjs`
  - `node scripts/verify_composer_canvas_overlay_redesign.mjs`
  - `node scripts/verify_builder_ui_final_polish.mjs`
  - `node scripts/verify_builder_ui_theme_system.mjs`
  - `node scripts/verify_ui_consistency.mjs`
  - `node scripts/verify_phase1_micro_controls.mjs`
  - `npm run build`

## Risks

- Simple row targeting relies on row bands from DOM measurement; edge behavior at extreme zoom can still need a dedicated math pass.
- This fix intentionally does not change canvas mode behavior.
