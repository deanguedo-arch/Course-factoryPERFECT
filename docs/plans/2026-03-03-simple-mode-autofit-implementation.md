# Simple Mode Auto-Fit Implementation Plan

## Task 1: RED verifier update
- Update `scripts/verify_composer_canvas_validation.mjs` to require auto-fit markers in simple validator.
- Run verifier and confirm fail.

## Task 2: Implement simple validator auto-fit
- Modify `validateComposerSimpleProposal` in `src/composer/layout.js`.
- Compute contiguous available span from proposal start column.
- Return valid fitted layout if available span > 0.
- Return invalid when no contiguous space at target start.

## Task 3: Overlay simple target range fix
- In `src/components/composer/ComposerCanvasBlockOverlay.jsx`, simple drag should allow column targeting up to `metrics.cols` (not `cols - span + 1`) so fitter can place into narrow remainder slots.
- Keep commit gated by validator validity.

## Task 4: Verify and ship
- Run:
  - `node scripts/verify_composer_canvas_validation.mjs`
  - `node scripts/verify_composer_part_c.mjs`
  - `node scripts/verify_composer_light_mode_legibility.mjs`
  - `node scripts/verify_composer_canvas_overlay_redesign.mjs`
  - `npm run build`
- Commit behavior fix.
