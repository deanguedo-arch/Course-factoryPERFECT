# Phase 1 Module Manager UI Polish (Design Spec)

**Date:** 2026-03-02

## Goal

Bring Phase 1 Module Manager controls into the same Liquid Glass language as the shell and Phase 2 polish pass.

## Problems

- Harvest mode toggle still reads as old solid-slate tabs.
- Module Manager top bar and status chips look dense and boxed.
- Session/draft action buttons have mixed hierarchy and loud primary fills.
- Side control cards feel heavy because of stacked shadows and opaque fills.

## Approach

- Convert high-visibility control surfaces to `cf-glass-soft`.
- Replace solid active fills with subtle border+tint active states.
- Keep destructive actions semantic but less saturated.
- Preserve all behavior and data flow (styling-only pass).

## Scope

- Harvest mode toggle in Phase 1.
- Module Manager top mode selector and status chips.
- Session/Drafts controls and side-card shells.
- Module setup expand/collapse control.

## Non-Goals

- No refactor of deep builder internals.
- No changes to composer/editor logic.
- No global style token changes in this pass.

## Acceptance Criteria

- Phase 1 no longer looks visually disconnected from shell/Phase 2.
- Control hierarchy is clearer and less noisy.
- Build succeeds.
