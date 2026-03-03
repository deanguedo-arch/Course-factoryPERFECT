# Phase 4 Compile UI Polish (Design Spec)

**Date:** 2026-03-02

## Goal

Make Phase 4 feel consistent with the refined shell, Phase 2, and Phase 1 visual hierarchy.

## Problems

- Publish mode controls and compile CTA rely on loud solid fills.
- Multiple slate blocks still feel opaque and heavy inside the glass shell.
- Export and beta publish sections look visually disconnected from each other.

## Approach

- Apply glass-style surfaces (`cf-glass-soft`) to high-visibility section containers.
- Replace loud primary fills with border+tint active/primary controls.
- Keep semantic emphasis where necessary (warnings/toggles), but reduce saturation.
- Preserve compile/export behavior completely.

## Scope

- Asset Base URL + Publishing Mode blocks.
- Beta publish sections (full + delta).
- Export module section.
- Legacy compile configuration and main compile/download actions.

## Acceptance Criteria

- Phase 4 no longer has dominant slab-like CTA blocks.
- Controls and surfaces read as one system with other phases.
- Build passes.
