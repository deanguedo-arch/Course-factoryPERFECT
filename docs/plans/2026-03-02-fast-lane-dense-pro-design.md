# Fast Lane + Dense Pro Tool (Design Spec)

**Date:** 2026-03-02

## Goal

Make Course Factory feel like a fast, cohesive pro tool for a single power user (Dean). Default workflow is:

- App opens to `Phase 1 → Module Manager → Composer`
- State resumes from Module Manager autosave (continue last draft/module)
- Navigation is task-speed oriented (Fast Lane), not phase-education oriented

## Non-Goals (This Pass)

- No backend rewrites or data model changes unless required for UX.
- No new external design system library.
- No full theme engine / multiple themes (keep current dark direction).
- No large component extraction/refactor unless it reduces duplication immediately.

## Information Architecture

### Sidebar (Primary)

**Fast Lane (top):**

- `Resume Composer` (primary)
- `Jump to Preview` (secondary)
- `Jump to Compile` (secondary)

**Factory Line (below):**

- Keep phase destinations, but visually demote (smaller, less contrast).
- Phases are *destinations*, not the workflow itself.

### Default Entry

- Initial view should be `Phase 1 → Composer`, resuming autosave.
- If autosave is missing/invalid: start in composer with a sane starter state (existing behavior).

## Visual System (Dense Pro Tool)

### Surface Rules (Stop Card Nesting)

- Each page gets **one primary surface**.
- Inside the surface, prefer **section headers + dividers** over additional boxed cards.
- Limit nested bordered cards to cases where a list/summary truly needs containment.

### Border + Depth Rules

- Reduce border contrast (use `border-slate-800/70` style).
- Use separators (`border-t`) and spacing for structure, not more boxes.
- Use a single shadow language (subtle, not multiple competing shadows).

### Typography Rules

- Reduce all-caps microcopy usage.
- Use 3 tiers:
  - Page title (bold, 18–20px)
  - Section title (bold, 14–16px)
  - Meta/muted (10–12px, slate-500/600)

### Button Hierarchy Rules

- 1 primary CTA per page.
- Secondary actions are outlined/neutral.
- Destructive actions stay red but should not dominate the page.

### Spacing + Shape

- Default radius: `rounded-2xl` for primary surfaces, `rounded-xl` for controls.
- Default padding: 16–20px.
- Default gaps: 12–16px.

### Accent Policy

- One primary accent per page (prefer existing app accent family: indigo/sky, stay consistent).
- Use amber/rose only for warning/danger semantics (not decoration).

## Page-Specific Notes

### Phase 5: Ops (from screenshot)

Problems:

- Multiple heavyweight cards and colored borders make it feel bulky.
- Metrics, import/export, defaults, and maintenance all compete equally.

Desired:

- One surface containing:
  - Compact meta strip (course, storage, counts)
  - `Project JSON` section (export/import, clear hierarchy)
  - `Compile Defaults` section (checkbox list, lighter containment)
  - `Maintenance` section (danger last; destructive actions visually contained)

## Acceptance Criteria

- On refresh/open, app lands in `Phase 1 → Composer`.
- Module Manager restores autosave without user intervention.
- Sidebar shows Fast Lane actions; works in expanded and collapsed modes.
- Ops page uses one main surface with section dividers (less nested boxing).
- `npm run build` passes.

