# Builder UI Final Polish (Design Spec)

**Date:** 2026-03-03

## Goal

Do a final narrow builder-UI polish pass now that the theme system exists, focusing on the parts that still make the tool feel slightly busy or cramped.

## Scope

This pass is limited to:

- spacing and label density
- type scale and uppercase restraint
- accent-color restraint in builder controls
- shared feedback surfaces such as toasts and code blocks

## Target Areas

- main shell labels in `src/App.jsx`
- shared feedback components in `src/components/Shared.jsx`
- Phase 2 source toggle, pills, and edit labels in `src/components/Phase2.jsx`
- Phase 4 builder-only labels and action section headings in `src/components/Phase4.jsx`
- Phase 5 top summary labels in `src/components/Phase5.jsx`

## Rules

- Keep semantics intact: primary, success, warning, and danger still mean something.
- Remove decorative accent drift where the control meaning is not semantic.
- Reduce tiny uppercase labels where the UI is already dense.
- Prefer shared `cf-*` control patterns instead of one-off local styles.
- Do not touch compiled course output styling or generator theme behavior.

## Non-Goals

- No new layout architecture.
- No further workflow changes.
- No deep Phase 1 redesign in this pass.
- No compiled output visual changes.

## Acceptance Criteria

- The shell reads calmer and less dashboard-like.
- Phase 2 tabs and badges no longer use a three-accent active system.
- Phase 4 builder labels and section headings are less shouty and less color-fragmented.
- Shared toasts and code blocks match the builder glass/control language better.
- Existing verifiers pass, the new polish verifier passes, and `npm run build` passes.
