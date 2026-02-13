# Work Log (2026-02-13)

## Context
- Goal: Improve Module Composer usability and visual output quality while keeping changes stability-first.
- Branch state at time of work:
  - `master` with local commits on top of `origin/master`.
  - Workspace contained build output changes in `dist/` (treated as an artifact and intentionally left uncommitted).

## Summary Of Implemented Improvements

### 1) Module Composer: Outline, Issues, Templates, Vault Folder Import
- Added a left-panel mode switch for composer activities:
  - `Grid` (existing), plus `Outline`, `Issues`, and `Templates`.
- Added activity templates:
  - Save the currently selected activity as a template.
  - Insert a template as a new activity.
  - Stored in browser `localStorage`.
- Added a validation-backed Issues panel:
  - Shows warnings/errors per activity with click-to-jump.
- Added Vault folder import for `resource_list` activities:
  - Select a folder in Vault Browser.
  - Append every file in that folder to the resource list.

### 2) Settings: Theme Packs
- Added one-click "Theme Packs" in Phase 5 to apply coherent visual defaults (accent/background/text/button/container/font/material theme) at once.
- Tracks the current selected pack via a `visualThemePack` field in `Course Settings` (falls back to `custom` when not set).

## File-Level Change Log

### `src/components/composer/ComposerSidebarTools.jsx`
- New component that powers the composer left-panel non-grid modes:
  - `Outline` mode: search + jump + quick duplicate/delete.
  - `Issues` mode: validation list + click-to-select.
  - `Templates` mode: save/insert/delete templates.
- Local template storage:
  - Key: `course_factory_composer_activity_templates_v1`
  - Max templates: 50

### `src/composer/activityRegistry.js`
- Added validation helpers:
  - `validateComposerActivity(activity)` returns issues for one activity.
  - `validateComposerActivities(activities)` returns issues for the full list.
- Checks are intentionally lightweight and focused on common authoring footguns:
  - Missing `embed_block.url`, missing `image_block.url`, empty `resource_list.items`, rubric size clamping warnings, etc.

### `src/components/Phase1.jsx`
- Integrated `ComposerSidebarTools` into Module Manager composer mode:
  - Adds left-panel tabs: `Grid / Outline / Issues / Templates`.
  - Uses the new validation functions for Issues view.
  - Adds template insertion (`addComposerActivityFromTemplate`).
- Vault Browser enhancements in composer workflows:
  - Resource list: new `Import Vault Folder` button.
  - Vault Browser is opened in `folder` selection mode for that action.
  - Folder import appends items using `src/data/vault.json` paths under `/Course-factoryPERFECT/materials/...`.
- Updated Vault selection handler to support:
  - `{ kind: 'vault-file', file }`
  - `{ kind: 'vault-folder', segments }`

### `src/components/VaultBrowser.jsx`
- Extended props:
  - `mode = 'file'` (default)
  - `mode = 'folder'` enables a "Use This Folder" action in the current breadcrumb folder.
- Updated `onSelect` payload shape:
  - File: `{ kind: 'vault-file', file }`
  - Folder: `{ kind: 'vault-folder', segments }`

### `src/components/Phase5.jsx`
- Added Theme Packs UI and application logic.
- Uses a stable accent swatch map (hex) to avoid dynamic Tailwind class generation issues.
- Pack application updates multiple `Course Settings` fields in one click.

## How It Works (Nuts And Bolts)

### Composer activity validation
- Validation lives in `src/composer/activityRegistry.js` so it can be reused by other UIs in the future.
- Each validation result is a list of `{ level: 'error' | 'warn', message: string }`.
- The Issues panel is just a view over `validateComposerActivities(...)`, not a separate rules system.

### Templates
- A template stores:
  - `activity.type`
  - a deep-cloned `activity.data`
  - a lightweight `layout.colSpan`
- Insert creates a new activity id and positions it at the end of the grid (next row).

### Vault folder import
- Vault index is a flat list of file records in `src/data/vault.json`.
- Selecting a folder provides a segment array (breadcrumb).
- Import builds a prefix like:
  - `/Course-factoryPERFECT/materials/<segments...>/`
- Then filters vault files by that prefix and appends missing items into the current `resource_list.items`.

### Theme packs
- Theme packs are curated sets of settings updates.
- Clicking a pack calls `updateSettings({ ...pack.updates, visualThemePack: pack.id })`.
- The existing "Reset to Functional Visual Defaults" button remains available.

## Validation / Smoke Checks Performed
- Production build completed successfully via repo-local Node:
  - `npm run build`

## Known Limitations / Notes
- `dist/` is still a build artifact and will change on each build. Keep it uncommitted unless you explicitly decide to commit build output.
- Templates are stored per-browser/per-machine (localStorage), not in project JSON.
- Vault folder import uses the Vault index file list; it assumes `scripts/scan-vault.cjs` is kept up to date when adding/removing files.

## Next Steps (Optional)
- Add an "Include subfolders" toggle for Vault folder import.
- Expand validation rules for more activity types as you find recurring authoring errors.
- Add a "duplicate + insert below" convenience action and/or drag handles in Outline view.

