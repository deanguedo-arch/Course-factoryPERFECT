# Builder UI Theme System And Finish Pass (Design Spec)

**Date:** 2026-03-03

## Goal

Take the builder UI from an uneven `8/10` state to a more finished system by adding a real builder-only theme system and eliminating the remaining old-admin visual debt.

## Problems Observed

- The builder currently has only one real visual mode. Many screens still assume dark-only utility classes.
- `Phase 0` and `Phase 3` still feel like older product surfaces even after the broader consistency work.
- Several modal and drawer interiors in `Phase 1`, `Phase 2`, and `Phase 4` still drop out of the shared control system and revert to raw slate fields and hard-edged panels.
- Accent usage is too noisy. Different areas compete with indigo, sky, cyan, emerald, purple, amber, and rose without a clear semantic system.
- Dense areas overuse tiny uppercase labels and bordered capsules, which makes the tool feel technical and cramped instead of intentional.

## Approved Scope

This pass covers the **builder tool UI only**.

- Add a builder-level theme system with:
  - `Dark` as the default first-load theme
  - an Apple-inspired `Light` mode
  - a simple theme toggle in the main shell
  - local persistence so the builder returns to the user's last theme
- Bring `Phase 0` and `Phase 3` into the same shared surface/control system as the stronger phases.
- Clean the remaining modal and drawer interiors in `Phase 1`, `Phase 2`, and `Phase 4`.
- Reduce accent colors to a tighter semantic set:
  - one primary
  - one success
  - one warning
  - one danger
- Reduce the overly compressed “tiny uppercase dashboard” feel where it is visually excessive.

## Design Direction

### Theme Model

- Use a builder-specific theme attribute on the root document for the app shell, separate from compiled course output themes.
- Keep the existing glass direction, but make it more disciplined:
  - `Dark`: premium midnight glass with deeper navy ink, quieter glow, and tighter contrast control
  - `Light`: frosted white/ice surfaces with soft blue-gray depth, inspired by Apple-style glass panels
- The toggle should be fast and obvious, not hidden in settings.

### Implementation Strategy

- Extend `src/index.css` with two token sets:
  - `html[data-builder-theme='dark']`
  - `html[data-builder-theme='light']`
- Continue using the existing shared `cf-*` surface and control classes, but drive them from theme tokens instead of a dark-only assumption.
- Add a scoped override layer for common legacy dark utility classes inside the builder shell so light mode works without rewriting every JSX class in one pass.
- Rewire the highest-visibility legacy fragments in `Phase 0`, `Phase 3`, and selected edit interiors to use the shared controls directly.

### Visual Rules

- One primary accent family across the builder.
- Success, warning, and danger reserved for true semantic meaning.
- Inputs and editors should prioritize clarity first, glass second.
- Labels should stay readable but use less forced uppercase where density is already high.
- Glass effects should support structure, not create haze.

## Non-Goals

- No changes to compiled course output themes or generated site styling.
- No backend or data-model changes.
- No behavior changes to composer flows, exports, imports, backup logic, or compile logic beyond the theme toggle itself.

## Acceptance Criteria

- The builder has a working dark/light theme toggle in the main shell.
- Dark mode is the default on first load.
- Theme preference persists locally.
- `Phase 0` and `Phase 3` no longer look like older isolated screens.
- The targeted modal/drawer interiors in `Phase 1`, `Phase 2`, and `Phase 4` use the shared visual language.
- Accent usage is reduced to a more coherent semantic system.
- The builder still builds successfully with `npm run build`.
