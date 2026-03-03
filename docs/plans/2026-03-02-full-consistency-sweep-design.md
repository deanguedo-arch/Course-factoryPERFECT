# Full Consistency Sweep (Design Spec)

**Date:** 2026-03-02

## Goal

Make the tool feel like one product instead of a polished shell wrapped around mixed internal styles.

## Problems Observed

- Shared controls still use different visual languages across phases.
- Fast Lane, section nav, action buttons, tabs, and field wrappers do not share a common hierarchy.
- Phase 1 still contains several heavy legacy editor patterns: solid purple/blue fills, flat slate toolbars, and dense form blocks that ignore the newer glass system.
- Phase 5 still reads like an older admin panel instead of the same product as Phases 1, 2, and 4.

## Approach (Approved)

**Full consistency sweep with shared control utilities plus deeper Phase 1 internals.**

- Add a small shared control system in `src/index.css` for buttons, tab rails, pills, field shells, muted panels, alerts, and nav items.
- Rewire shell-level controls in `src/App.jsx` and `src/components/Section.jsx` to use the same hierarchy.
- Push the same system into the visible Phase 1 assessment/editor internals instead of stopping at the outer shell.
- Align Phase 2, Phase 4, and Phase 5 actions to the same primary/secondary/danger language.
- Preserve behavior. This pass is about visual structure, readability, and action hierarchy only.

## UX Rules For This Pass

- One primary action style per screen section.
- Neutral actions should look interactive without becoming bright slabs.
- Tabs should read as part of a rail, not as isolated colored buttons.
- Inputs should prioritize readability first, glass second.
- Semantic danger/warning colors should be reserved for destructive or exceptional actions only.

## Non-Goals

- No backend or data-model changes.
- No composer logic changes.
- No full component-library rewrite.

## Acceptance Criteria

- Shared controls across shell, Phase 1, Phase 2, Phase 4, and Phase 5 use the same visual system.
- Fast Lane and section nav no longer rely on one-off solid indigo/slate buttons.
- The high-traffic Phase 1 editor tabs, toggles, buttons, and field wrappers match the rest of the app.
- Phase 5 export/import/maintenance controls follow the same hierarchy as the rest of the tool.
- `npm run build` passes.
