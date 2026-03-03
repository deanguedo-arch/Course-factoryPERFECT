# Composer Canvas Validation Design

## Goal

Finish the builder interaction layer so composer movement is clear and predictable in both stacked and freeform canvas modes.

## Decision Summary

### Stacked / Simple Mode

- Dragging shows a thin insertion line.
- A small gap opens where the block will land.
- Surrounding blocks shift just enough to make the drop target obvious.
- Release commits the reorder into that insertion target.

### Freeform / Canvas Mode

- Dragging uses live snap with a clear preview.
- Resizing uses live snap with a clear preview.
- Invalid placements stay under the cursor in a blocked red state.
- Invalid release reverts to the last valid position with no saved change.
- Occupied or overflowing positions are rejected.
- No auto-push and no auto-reflow.

## Approaches Considered

### 1. Validity-Aware Preview Layer

Add a validation-aware preview state on top of the current overlay movement system.

Pros:

- matches the chosen UX exactly
- limited surface area
- preserves existing history and layout plumbing

Cons:

- requires explicit validity logic for canvas and explicit insertion targeting for stacked mode

### 2. Commit-Time Validation Only

Allow drag and resize previews without validating until release.

Pros:

- simpler implementation

Cons:

- poor UX because authors do not know whether the move will stick until they drop

### 3. Auto-Reflow Canvas Movement

Push nearby blocks automatically when dragging or resizing into occupied space.

Pros:

- can feel “smart” in some editors

Cons:

- contradicts the desired workflow
- too unpredictable for this composer

## Decision

Use `Approach 1`.

This adds the least risky implementation surface while producing the most predictable authoring behavior.

## Architecture

### Files

- `src/components/composer/ComposerCanvasBlockOverlay.jsx`
- `src/composer/layout.js`
- `src/index.css`
- possible glue:
  - `src/components/Phase1.jsx`
  - `src/components/modals/EditModal.jsx`

### Layout Helpers

Add pure helper functions in `src/composer/layout.js`:

- canvas-target validation
  - bounds
  - collision against sibling blocks
- stacked insertion targeting
  - pointer position to insertion target
  - insertion index / row-gap metadata

These must stay independent of React so they can be reused in both module composer and modal composer paths.

### Overlay Behavior

Upgrade `ComposerCanvasBlockOverlay.jsx` so it tracks transient preview state:

- `proposal`
- `previewFrame`
- `previewKind`
- `valid`

In canvas mode:

- compute snapped target continuously
- validate it against sibling blocks and bounds
- show standard draft preview when valid
- show blocked red preview when invalid
- commit only if valid on release

In stacked mode:

- compute insertion target instead of only rounded row/col values
- render insertion line and small gap preview
- commit reorder into the resolved insertion slot on release

### History

- valid drag/resize commits push history normally
- invalid release cancels and reverts
- invalid release does not push a history snapshot

## Visual Rules

- keep the current minimal overlay chrome
- add only local preview-state CSS
- use thin insertion line plus small spacing cue in stacked mode
- use blocked red preview in canvas mode
- do not mix this pass with another broad visual redesign

## Validation

Add a dedicated interaction verifier that checks:

- blocked-invalid preview hooks/classes exist
- insertion-preview hooks/classes exist
- overlay commit path distinguishes valid vs invalid release
- invalid release does not commit

Re-run:

- `node scripts/verify_composer_canvas_validation.mjs`
- `node scripts/verify_composer_part_c.mjs`
- `node scripts/verify_composer_light_mode_legibility.mjs`
- `node scripts/verify_composer_canvas_overlay_redesign.mjs`
- `npm run build`

## Finish Line

This pass is done when:

- stacked mode shows a clear insertion target
- canvas mode shows live valid/invalid snap preview
- invalid drop reverts cleanly
- verification scripts pass
- the final audit finds only small fixups, not another structural interaction phase
