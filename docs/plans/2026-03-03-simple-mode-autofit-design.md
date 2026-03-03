# Simple Mode Auto-Fit Design

## Problem
In simple/stacked mode, dragging a block into a row with partial remaining width can fail if the block's current/default `colSpan` is wider than the free slot, even when one or more columns are still available.

## Goal
Allow practical side-by-side placement by auto-fitting width for the active block during simple-mode drag/resize.

## Behavior
- Simple-mode drag computes a target `row/col/colSpan` proposal.
- Validation checks free contiguous columns from the proposed `col` in that row.
- If at least one free column exists, proposal is valid and `colSpan` is reduced to fit.
- If no free column exists at the proposed start, proposal is invalid (blocked red).
- Drop commits only valid proposals.

## Scope
- `src/composer/layout.js`: add auto-fit logic to simple proposal validator.
- `src/components/composer/ComposerCanvasBlockOverlay.jsx`: allow full-column targeting in simple mode and rely on validator-provided fitted layout.
- `scripts/verify_composer_canvas_validation.mjs`: guard for auto-fit logic presence.

## Non-Goals
- No canvas-mode behavior changes.
- No packing algorithm rewrite.
- No global insertion/reflow semantics.
