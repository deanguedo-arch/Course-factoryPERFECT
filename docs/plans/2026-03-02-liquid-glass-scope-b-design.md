# Liquid Glass Scope B (Design Spec)

**Date:** 2026-03-02

## Goal

Apply a cohesive "liquid glass" style to major app surfaces while keeping the tool fast and readable.

Scope B covers:

- Sidebar shell
- Fast Lane card
- Main phase shell surfaces (outer wrappers and primary phase panels)
- Ops page primary surface and internal summary cards

## Non-Goals (Scope C Deferred)

- No full restyling of all inputs, textareas, and dense form internals.
- No SVG refraction-only liquid filter dependency.
- No behavior/workflow changes.

## Visual Rules

### Background Atmosphere

- Add layered radial gradients behind the app shell.
- Add subtle noise texture to avoid flat color banding.
- Keep contrast high enough for long session use.

### Glass Surface System

- Reusable classes:
  - `cf-glass-surface` for major panels.
  - `cf-glass-nav` for navigation surfaces.
  - `cf-glass-soft` for lighter sub-surfaces.
  - `cf-glass-strong` for emphasis where needed.
- Core properties:
  - Semi-transparent dark fill
  - Soft inner highlight + border
  - Backdrop blur/saturate when available
  - Controlled shadow depth

### Readability and Safety

- Keep text and icon contrast consistent with current dark UI.
- Keep interactive controls readable (do not over-transparent input-heavy controls).
- Preserve existing spacing and hierarchy changes from Dense Pro pass.

## Browser Strategy

- Baseline styling works everywhere via translucent fill, border, and shadows.
- If `backdrop-filter` is supported, enable blur/saturation enhancement.
- No dependency on Chrome-only SVG refraction for this pass.

## Acceptance Criteria

- App no longer feels flat/card-stacked; major surfaces share one glass language.
- Sidebar and main shell feel visually connected.
- Existing interactions and flow remain unchanged.
- `npm run build` passes.
