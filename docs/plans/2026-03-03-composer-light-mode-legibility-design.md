# Composer Light Mode Legibility Fix (Design Spec)

**Date:** 2026-03-03

## Goal

Fix the builder light-mode readability problems in the composer workspace, especially the inspector, toolbar chrome, and rich-text editing surfaces.

## Problem

- The global builder light-mode override layer is too broad and not specific enough for composer-specific surfaces.
- Several shared composer components still hard-code dark `slate` backgrounds and text assumptions.
- The Phase 1 composer inspector and the modal composer inspector still contain local dark-only toolbar fragments.
- In light mode this creates broken contrast: some text is recolored for light mode while the surrounding panel remains dark, and some controls keep dark styling without the corresponding readable text treatment.

## Recommended Approach

Use a hybrid repair:

1. Add explicit theme-aware composer surface classes in `src/index.css`.
2. Rewire the shared composer chrome components to those classes:
   - `ComposerPaneCard`
   - `ComposerActivityEditorPane`
   - `ComposerInspectorSection`
   - `ComposerPreviewToolbar`
   - `ComposerWorkspaceControls`
   - `ComposerCanvasShell`
3. Patch the remaining local rich-editor toolbars in:
   - `src/components/Phase1.jsx`
   - `src/components/modals/EditModal.jsx`
4. Keep the global light override layer, but narrow the composer legibility fix to explicit component classes instead of relying on raw utility overrides.

## Why This Approach

- A CSS-only override would stay brittle because the composer surfaces are still expressed through many raw dark utility strings.
- A full composer rewrite is unnecessary and higher risk.
- A hybrid pass gives the composer a real theme-aware shell while only touching the high-risk local toolbar fragments directly.

## Scope

- Builder UI only
- Composer workspace chrome
- Composer inspector sections
- Rich/plain toggle blocks
- Rich-text toolbar rows and color/fill controls

## Non-Goals

- No compiled output changes
- No behavior changes to the composer
- No redesign of lesson content itself
- No broad app-wide light-mode pass outside the composer legibility issue

## Acceptance Criteria

- The composer inspector is readable in light mode.
- Shared composer surfaces no longer depend on dark-only raw `slate` classes.
- The Phase 1 and EditModal rich editor toolbars use theme-aware shared styling.
- A dedicated light-mode legibility verifier passes.
- Existing UI verifiers and `npm run build` still pass.
