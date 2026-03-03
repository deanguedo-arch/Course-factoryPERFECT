# Composer Canvas Overlay Redesign (Design Spec)

**Date:** 2026-03-03

## Goal

Fix the composer block move/edit experience by replacing the long floating action strip with a canvas-first interaction model that is shorter, clearer, and reliable in both dark and light mode.

## Problem

- The current block overlay is overloaded.
- It mixes drag, reorder, resize, duplicate, and delete into one long floating bar.
- The same arrow controls change meaning depending on mode:
  - in flow mode they reorder block placement
  - in canvas mode they adjust `x` and `y`
- This creates a workflow that feels clunky, visually noisy, and easy to misread.
- Light mode makes the problem worse because the dense floating control strip has too many old dark-style surfaces and too much text packed into a small area.

## Recommended Approach

Use a canvas-first redesign:

1. Reduce the floating overlay to a minimal chrome layer:
   - block label
   - drag grip
   - resize handles
2. Make direct drag-and-drop the primary move interaction on the canvas.
3. Remove arrangement arrows and block actions from the overlay.
4. Keep exact controls and destructive actions in the shared selected-section drawer UI:
   - canvas mode: `X`, `Y`, `W`, `H`
   - flow mode: move and span controls
   - duplicate and delete actions
5. Keep drag preview explicit:
   - visible ghost state
   - clear drop target
   - small live position chip

## Why This Approach

- The problem is workflow first, not just styling.
- Shortening the overlay without changing the interaction model would still leave too much meaning in one place.
- The composer already has the basis for direct manipulation and a shared selected-section drawer, so the best solution is to simplify and re-home controls instead of adding more toolbar logic.
- This reduces light-mode theming risk because the floating surface becomes much smaller and more consistent.

## Interaction Model

- Selecting a block shows a clean frame and compact top pill.
- Dragging is the primary move system.
- The floating overlay no longer contains mode labels, arrow movement controls, duplicate, or delete.
- Resize remains a separate interaction through dedicated handles.
- Invalid drops revert cleanly to the original position.
- The preview must always show where the block will land before commit.

## Control Placement

- **Overlay**
  - label
  - drag grip
  - resize handles
- **Selected Section drawer**
  - duplicate
  - delete
  - flow-mode move controls
  - flow-mode width/span controls
  - canvas-mode exact `X`, `Y`, `W`, `H` controls

## Scope

- `src/components/composer/ComposerCanvasBlockOverlay.jsx`
- `src/components/composer/ComposerCanvasDrawer.jsx`
- `src/components/composer/ComposerCanvasGrid.jsx` only if drag-handle semantics need adjustment
- `src/index.css`
- Shared verifier script for this redesign

## Non-Goals

- No backend or export changes
- No data-model rewrite
- No multi-select drag behavior
- No keyboard movement redesign
- No compiled course output changes

## Acceptance Criteria

- The floating block overlay is visibly shorter and no longer reads like a horizontal control panel.
- Canvas movement is driven by direct drag-and-drop, not arrow clicking.
- Duplicate and delete remain accessible in the selected-section drawer.
- Canvas mode keeps precise numeric controls without cluttering the overlay.
- Light mode remains legible for the redesigned overlay and selected-section controls.
- A dedicated verifier passes.
- Existing builder UI verifiers and `npm run build` still pass.
