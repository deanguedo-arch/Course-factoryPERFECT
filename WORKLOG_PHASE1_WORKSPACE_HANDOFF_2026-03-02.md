# Phase 1 Workspace Handoff

Date: 2026-03-02

## Current Goal State

Phase 1 should feel like a builder, not a long form page.

The current direction is:

- keep a compact top bar only
- give Composer one large main workspace
- move secondary controls into the canvas rail/drawer
- avoid a full-width preamble before the editor

## What Was Already Completed Before This Layout Pass

These changes were already in place before the latest workspace refactor:

- `hubConfig` became the single source of truth for hub shell appearance
- `Hub Settings` UI was added to Phase 1
- Phase 5 was simplified to `Ops`
- legacy imports were made backward compatible for old theme/font/custom CSS fields
- hub rendering was switched to `hubConfig`
- project import/export and migration handling were preserved

Relevant files from that phase:

- `src/utils/hubConfig.js`
- `src/utils/migrations.js`
- `src/data/constants.js`
- `src/utils/generators.js`
- `src/components/Phase5.jsx`
- `src/App.jsx`
- `src/components/Phase4.jsx`
- `src/components/modals/EditModal.jsx`
- `README.md`

## What Changed In This Latest Phase 1 Workspace Pass

### 1. Removed the oversized top-of-page Hub block

The earlier full-width `Hub Settings` section above the Harvest tabs was removed from Phase 1.

Reason:

- it consumed too much vertical space before the actual builder

### 2. Added a compact Module Manager top bar

Phase 1 now shows a tighter status/control row for Module Manager:

- module type
- current draft
- setup status
- module id when available

Primary file:

- `src/components/Phase1.jsx`

### 3. First pass: page-level left sidebar

There was an intermediate state where these lived in a page sidebar:

- Hub Settings
- Session & Drafts
- Module Setup

That state was intentionally superseded for Composer because it still reduced the usable canvas width too much.

### 4. Final pass: Composer gets the full workspace width

Composer now hides the Phase 1 page sidebar entirely and uses the canvas rail/drawer for secondary controls.

This is the current intended behavior:

- Composer mode: one large workspace
- Standalone/External mode: page sidebar layout still exists

Primary file:

- `src/components/Phase1.jsx`

Key anchor:

- `moduleManagerType !== 'composer'` conditional around the page sidebar

### 5. Hub / Drafts / Setup moved into the Composer rail

Three new rail panels were added for Composer:

- `hub`
- `drafts`
- `setup`

These appear alongside the existing Composer rail items:

- `grid`
- `outline`
- `templates`
- `issues`

Primary file:

- `src/components/Phase1.jsx`

Important anchors:

- `moduleManagerComposerRailItems`
- `moduleManagerComposerDrawerTitle`
- `moduleManagerComposerDrawerContent`

### 6. Composer drawer now supports side placement

`ComposerCanvasShell` was extended to support a side drawer instead of only stacking the drawer above the preview.

New prop:

- `drawerPlacement`

Current usage:

- Phase 1 Composer passes `drawerPlacement="side"`

Primary file:

- `src/components/composer/ComposerCanvasShell.jsx`

Important anchors:

- `drawerPlacement = 'stacked'`
- `useSideDrawer`

## Current File-Level Status

### `src/components/Phase1.jsx`

Current state:

- oversized top Hub block removed
- compact Module Manager top bar added
- page sidebar remains only for non-Composer module types
- Composer rail now owns:
  - Hub Settings
  - Session & Drafts
  - Module Setup
- `ComposerCanvasShell` in Phase 1 now receives:
  - `drawerPlacement="side"`
  - `railItems={moduleManagerComposerRailItems}`
  - `drawerTitle={moduleManagerComposerDrawerTitle}`
  - `drawerContent={moduleManagerComposerDrawerContent}`

Key anchors currently present:

- `moduleManagerComposerRailItems`
- `moduleManagerComposerDrawerContent`
- `moduleManagerType !== 'composer'`
- `drawerPlacement="side"`

### `src/components/composer/ComposerCanvasShell.jsx`

Current state:

- supports `drawerPlacement="stacked"` default
- supports `drawerPlacement="side"` for a 3-column shell:
  - rail
  - drawer
  - preview

No other consumers were changed by force because the default remains `stacked`.

## Validation

Build command:

```powershell
npm.cmd run build
```

Latest result:

- passed

## UX State Right Now

Composer mode now matches the intended direction much more closely:

- the canvas is the dominant surface
- setup controls are reachable from the rail instead of consuming page height
- the previous “whole webpage before the workspace” issue is reduced

Still true:

- the compact Module Manager top bar still exists above the Composer workspace
- Standalone and External still use the page sidebar layout
- the Composer rail now carries both builder tools and workspace/admin controls

## Best Next Steps

If continuing this refactor, this is the clean sequence:

1. Compress the top bar further.
   - likely move draft/setup summary into the canvas header area
   - keep only module type switcher or merge that into Harvest tabs

2. Tune the rail information architecture.
   - decide whether `Hub`, `Drafts`, and `Setup` stay mixed with `Add/Outline/Library/Audit`
   - alternative: separate “workspace” controls from “content” controls visually

3. Match the drawer styling more closely to the desired visual reference.
   - narrower or wider side drawer as needed
   - more compact panel density
   - optional persistent drawer width token

4. Decide whether Standalone and External should also become full-workspace layouts.
   - right now only Composer gets the “one large workspace” treatment

5. Optional cleanup pass.
   - remove now-unused collapse state if any page-sidebar-only controls are no longer needed
   - reduce duplicate panel markup if the sidebar and drawer variants need to be unified

## Suggested Continuation Targets

If picking this up again, start here:

- `src/components/Phase1.jsx`
  - search for `moduleManagerComposerRailItems`
  - search for `moduleManagerComposerDrawerContent`
  - search for `moduleManagerType !== 'composer'`
  - search for `drawerPlacement="side"`

- `src/components/composer/ComposerCanvasShell.jsx`
  - search for `drawerPlacement`
  - search for `useSideDrawer`

## Summary

The current implementation is stable and building.

The important decision already made is:

- Composer should use a full-width workspace
- Hub / Drafts / Setup should live in the canvas rail drawer, not as a page sidebar

That is the current baseline to continue from.
