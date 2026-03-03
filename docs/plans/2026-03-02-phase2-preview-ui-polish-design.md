# Phase 2 Preview UI Polish (Design Spec)

**Date:** 2026-03-02

## Goal

Make Phase 2 ("Preview & Test") feel like it belongs inside the new Liquid Glass shell by reducing heavy slate blocks and overbearing purple CTAs.

## Problems Observed

- Cards read as old slate admin components inside a glass frame.
- Primary actions are huge and loud (solid purple Preview bars).
- Action hierarchy is off (giant CTA next to tiny gray icon buttons).
- Segmented control + search bar feel tall/bulky.

## Approach (Recommended)

**Phase 2 internal polish (targeted scope):**

- Convert Phase 2 internal containers (segmented control, search, cards, empty state) to `cf-glass-soft` style.
- Replace solid purple Preview button with a neutral glass primary button (accent via border/icon only).
- Make icon actions visually consistent with the primary button (same height, border, glass fill).
- Tighten vertical density (slightly smaller paddings and radii).
- Reduce purple as a dominant color (use indigo/neutral accents; keep semantic colors only as subtle text/borders).

## Non-Goals

- No full scope C redesign of all inputs across the app.
- No behavior changes unless strictly necessary (keep Preview/Edit/Delete actions).

## Acceptance Criteria

- No more solid purple slabs dominating the card row.
- Cards feel lighter and cohesive with the glass shell.
- Action row reads as a single control group.
- Segmented control + search are tighter but still readable.
- `npm run build` passes.
