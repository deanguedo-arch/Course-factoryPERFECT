# Phase 1 Micro Controls Cleanup (Design Spec)

**Date:** 2026-03-03

## Goal

Finish the Phase 1 visual cleanup by removing the last legacy editor micro-controls that still make the screen feel stitched together.

## Remaining Problems

- Several deep Phase 1 editor fragments still use old flat slate buttons and raw field wrappers.
- The shared control language is present in the main flows, but some helper/editing tools still fall back to the older visual system.
- These leftovers are small individually, but together they make Phase 1 feel less finished than the rest of the tool.

## Scope

Target only the remaining low-level editor controls inside `src/components/Phase1.jsx`:

- Selected composer activity style panel
- Resource builder inputs and mini-actions
- Knowledge-check builder field/action rows
- Worksheet helper rich-text toolbar and add-block controls
- Fillable-chart builder fields and add/remove actions
- Remaining small helper/import/save buttons that still use the legacy slate/indigo patterns

## Approach

- Reuse the existing shared controls from `src/index.css` instead of adding a second visual system.
- Replace repeated old class strings with `cf-btn`, `cf-input-shell`, `cf-panel-muted`, and `cf-tab-*` where appropriate.
- Keep behavior unchanged. This is a styling and hierarchy pass only.

## Non-Goals

- No new layout changes.
- No logic changes in composer/editor behavior.
- No broader Materials or Scope C redesign.

## Acceptance Criteria

- The targeted Phase 1 editor fragments no longer use the old solid slate/indigo micro-control classes.
- The remaining helper toolbars and mini-actions visually match the shared control system.
- A dedicated verifier for these leftover patterns passes.
- `npm run build` passes.
