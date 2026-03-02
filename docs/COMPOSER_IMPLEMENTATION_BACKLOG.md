# Composer Implementation Backlog

Date: 2026-03-01

Related:
- [COMPOSER_WORLD_CLASS_AUDIT.md](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/docs/COMPOSER_WORLD_CLASS_AUDIT.md)
- [COMPOSER_MASTER_PLAN.md](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/docs/COMPOSER_MASTER_PLAN.md)

## Usage

This is the execution backlog for the composer rebuild.

Status keys:
- `todo`
- `in_progress`
- `done`
- `blocked`

Priority keys:
- `P0` foundation blocker
- `P1` high-value workflow improvement
- `P2` premium feature
- `P3` later differentiator

## Epic 1: Shared Composer Foundation

### CF-COMP-001
- Status: `todo`
- Priority: `P0`
- Title: Extract shared composer preview bridge
- Goal: unify preview follow, remount, and selection sync logic
- Targets:
  - `src/hooks/useComposerPreviewBridge.js`
  - `src/components/Phase1.jsx`
  - `src/components/modals/EditModal.jsx`
- Acceptance:
  - both flows use shared preview hook/helper
  - preview reset/follow logic is not duplicated

### CF-COMP-002
- Status: `todo`
- Priority: `P0`
- Title: Add EditModal undo/redo parity
- Goal: match create-flow history behavior in edit flow
- Targets:
  - `src/components/modals/EditModal.jsx`
  - shared history hook file
- Acceptance:
  - `Cmd/Ctrl+Z` and redo work in edit flow
  - drag/resize is one history step

### CF-COMP-003
- Status: `todo`
- Priority: `P0`
- Title: Extract shared composer history hook
- Goal: centralize snapshot batching and undo/redo
- Targets:
  - `src/hooks/useComposerHistory.js`
  - `src/components/Phase1.jsx`
  - `src/components/modals/EditModal.jsx`

### CF-COMP-004
- Status: `todo`
- Priority: `P0`
- Title: Extract shared composer workspace controller
- Goal: centralize selection, layout mutation, and activity updates
- Targets:
  - `src/hooks/useComposerWorkspaceState.js`
  - `src/components/Phase1.jsx`
  - `src/components/modals/EditModal.jsx`

### CF-COMP-005
- Status: `todo`
- Priority: `P0`
- Title: Split large composer UI into shared shell components
- Targets:
  - `src/components/composer/ComposerShell.jsx`
  - `src/components/composer/ComposerToolbar.jsx`
  - `src/components/composer/ComposerBuilderPane.jsx`
  - `src/components/composer/ComposerPreviewPane.jsx`
  - `src/components/composer/ComposerInspector.jsx`

## Epic 2: Workflow Consistency

### CF-COMP-006
- Status: `todo`
- Priority: `P1`
- Title: Normalize create/edit workspace controls
- Goal: same controls and behavior in both surfaces

### CF-COMP-007
- Status: `todo`
- Priority: `P1`
- Title: Add dirty-state and save-state indicators
- Goal: make draft state obvious

### CF-COMP-008
- Status: `todo`
- Priority: `P1`
- Title: Reduce default workspace tuning burden
- Goal: stronger defaults for pane sizing and visibility

## Epic 3: Preview-First Editing

### CF-COMP-009
- Status: `todo`
- Priority: `P1`
- Title: Add block overlays inside preview
- Goal: click rendered blocks to select and inspect

### CF-COMP-010
- Status: `todo`
- Priority: `P1`
- Title: Add hover actions and insertion affordances in preview

### CF-COMP-011
- Status: `todo`
- Priority: `P1`
- Title: Add preview grid/spacing guides

## Epic 4: Layout Model 2.0

### CF-COMP-012
- Status: `todo`
- Priority: `P1`
- Title: Add section/container/stack primitives

### CF-COMP-013
- Status: `todo`
- Priority: `P1`
- Title: Add nested layout tree support

### CF-COMP-014
- Status: `todo`
- Priority: `P1`
- Title: Replace flat block list with outline tree

## Epic 5: Responsive Composer

### CF-COMP-015
- Status: `todo`
- Priority: `P1`
- Title: Add desktop/tablet/mobile breakpoints

### CF-COMP-016
- Status: `todo`
- Priority: `P1`
- Title: Add device preview toggle

### CF-COMP-017
- Status: `todo`
- Priority: `P1`
- Title: Add per-breakpoint visibility and order

### CF-COMP-018
- Status: `todo`
- Priority: `P1`
- Title: Add responsive spacing and typography controls

## Epic 6: Components And Reuse

### CF-COMP-019
- Status: `todo`
- Priority: `P1`
- Title: Replace browser-local templates with project component library

### CF-COMP-020
- Status: `todo`
- Priority: `P1`
- Title: Add symbols and instances

### CF-COMP-021
- Status: `todo`
- Priority: `P2`
- Title: Add starter section library

## Epic 7: Design System

### CF-COMP-022
- Status: `todo`
- Priority: `P1`
- Title: Add project-level typography, spacing, radius, and shadow tokens

### CF-COMP-023
- Status: `todo`
- Priority: `P2`
- Title: Add block variants and semantic states

### CF-COMP-024
- Status: `todo`
- Priority: `P2`
- Title: Reduce ad hoc style overrides in favor of tokens

## Epic 8: Power Authoring

### CF-COMP-025
- Status: `todo`
- Priority: `P2`
- Title: Add command palette

### CF-COMP-026
- Status: `todo`
- Priority: `P2`
- Title: Add slash insert menu

### CF-COMP-027
- Status: `todo`
- Priority: `P2`
- Title: Add multi-select and bulk edit

### CF-COMP-028
- Status: `todo`
- Priority: `P2`
- Title: Add copy/paste across modules

### CF-COMP-029
- Status: `todo`
- Priority: `P2`
- Title: Add lock/hide/protect block actions

## Epic 9: QA And Recovery

### CF-COMP-030
- Status: `todo`
- Priority: `P1`
- Title: Expand validation into preflight QA

### CF-COMP-031
- Status: `todo`
- Priority: `P1`
- Title: Add issue categories and fix suggestions

### CF-COMP-032
- Status: `todo`
- Priority: `P1`
- Title: Add named snapshots and restore points

### CF-COMP-033
- Status: `todo`
- Priority: `P2`
- Title: Add safe-mode preview on compile/runtime failure

## Epic 10: Preview/Export Confidence

### CF-COMP-034
- Status: `todo`
- Priority: `P1`
- Title: Expand composer fixtures for layout and breakpoint cases

### CF-COMP-035
- Status: `todo`
- Priority: `P2`
- Title: Add visual regression coverage for composer templates

### CF-COMP-036
- Status: `todo`
- Priority: `P2`
- Title: Add runtime smoke tests for interactive blocks

## Epic 11: Course Factory Differentiators

### CF-COMP-037
- Status: `todo`
- Priority: `P2`
- Title: Add course-aware content bindings

### CF-COMP-038
- Status: `todo`
- Priority: `P2`
- Title: Add AI-assisted section suggestions

### CF-COMP-039
- Status: `todo`
- Priority: `P3`
- Title: Add quality scoring for visual/instructional readiness

## Suggested Execution Order

1. CF-COMP-001
2. CF-COMP-002
3. CF-COMP-003
4. CF-COMP-004
5. CF-COMP-005
6. CF-COMP-009
7. CF-COMP-015
8. CF-COMP-019
9. CF-COMP-030

## Notes

- Do not add many new block types until Epics 1-5 are underway.
- Keep backward compatibility and migrations explicit for any layout model changes.
- Every composer milestone should include parity checks for preview and export.
