# Composer Part C Design

## Goal

Finish the remaining builder-tool UI-system work inside the composer so dark mode and light mode feel coherent across all deeper editor surfaces, not just the shell and primary paths.

## Scope

`Part C` is the final major builder-UI sweep. It targets the remaining deep composer/editor pockets that still rely on legacy raw utility styling or older control patterns.

Included:

- `src/components/composer/ComposerActivityBuilderFooter.jsx`
- `src/components/composer/ComposerLayoutControls.jsx`
- `src/components/composer/ComposerResponsiveControls.jsx`
- `src/components/composer/ComposerSidebarTools.jsx`
- `src/components/composer/ComposerPreviewPane.jsx`
- `src/components/composer/ComposerUndoRedoControls.jsx`
- `src/components/composer/ComposerWorkspaceFrame.jsx`
- `src/components/composer/HotspotEditor.jsx`

Touched only if needed for consistency glue:

- `src/components/Phase1.jsx`
- `src/components/modals/EditModal.jsx`
- `src/index.css`

Excluded:

- backend or data-model changes
- compiled course output styling
- repo-wide lint cleanup
- major composer interaction redesigns beyond small UI-driven cleanup

## Approaches Considered

### 1. Full Composer-System Completion

Normalize all remaining deep composer/editor controls to the shared builder system, including specialty editors, responsive controls, validation and library side panels, footer tools, preview frame, and undo/redo controls.

Pros:

- actually finishes the UI system
- removes the last obvious old-UI pockets
- reduces future light-mode patching

Cons:

- larger pass than a main-path-only cleanup

### 2. Main-Path Completion Only

Finish only the most visible composer paths and leave lower-frequency specialty editors for later.

Pros:

- faster

Cons:

- leaves visible legacy debt behind
- creates another partial finish line

### 3. Visual Patching Only

Patch contrast and spacing without converting the remaining controls to shared primitives.

Pros:

- lowest effort

Cons:

- preserves the mixed-system problem
- more brittle over time

## Decision

Use `Approach 1`.

The remaining debt is localized enough that a full composer-system completion pass is realistic, and stopping short would leave obvious mismatches inside the deepest editor surfaces.

## Control Language

The remaining composer tools should stop behaving like isolated mini-apps.

Use the shared builder language consistently:

- `Panels`: `cf-composer-panel`, `cf-composer-panel-soft`, `cf-panel-muted`, `cf-alert`
- `Buttons`: `cf-btn-primary`, `cf-btn-secondary`, `cf-btn-success`, `cf-btn-warning`, `cf-btn-danger`
- `Tabs/segmented controls`: `cf-tab-rail`, `cf-tab-btn`
- `Inputs`: `cf-input-shell` and existing `cf-composer-toolbar-field` patterns
- `Status`: theme-token-driven success/warning/error states, not ad hoc emerald/amber/rose stacks
- `Text`: reduce decorative tiny-uppercase usage where it compresses the UI without adding meaning

## File-by-File Intent

### `ComposerActivityBuilderFooter.jsx`

- Convert add-section controls, width selectors, and block actions to shared panel, button, and input styles.
- Reduce the dense "admin footer" feel while keeping the tool fast to scan.

### `ComposerLayoutControls.jsx`

- Convert row/layout toggles and numeric fields into shared grouped controls.
- Keep precision, but align visual language with the rest of the builder.

### `ComposerResponsiveControls.jsx`

- Make device-override controls readable in light mode.
- Align toggles, labels, and numeric inputs with shared builder primitives.

### `ComposerSidebarTools.jsx`

- Treat this as the largest remaining legacy pocket.
- Normalize component library, snippets, validation, audit, search, and action rows.
- Preserve hierarchy so the panel does not flatten into one washed-out surface.

### `ComposerPreviewPane.jsx` and `ComposerWorkspaceFrame.jsx`

- Align preview shell, empty states, and frame surfaces with the builder theme system.
- Preserve deliberate darker preview/canvas treatment only where it is functionally justified.

### `ComposerUndoRedoControls.jsx`

- Bring these into the same micro-control language as the rest of the toolbar.

### `HotspotEditor.jsx`

- Convert form rows, canvas shell, hotspot list, and action controls.
- Preserve behavior; improve surface consistency and readability.

## Guardrails

- Avoid raw `bg-slate-900` / `text-white` stacks unless there is a real preview or canvas reason.
- Avoid long runs of tiny uppercase labels unless they act as true section labels.
- Do not add new interactions just to justify redesign work.
- If a control remains awkward after restyling, fold it into the shared hierarchy instead of inventing a new pattern.

## Validation Strategy

- Add a dedicated `Part C` verifier that checks the targeted composer files for remaining raw legacy utility patterns that should no longer exist.
- Re-run the existing composer/theme verifiers.
- Run `npm run build`.
- Treat full `npm run lint` as informational unless a failure is directly introduced in a touched Part C file.

## Finish Line

`Part C` is done when:

- the targeted composer files use the shared builder system or intentionally special-case styling for real preview/canvas reasons
- light mode is readable in the deeper specialty editors and sidebar tools
- dark mode keeps depth and contrast
- there are no major remaining "old app" pockets inside the composer
- a quick visual pass suggests the builder reads as one finished tool instead of shell plus leftovers

## Recommended End State

After `Part C`, stop major UI-system work and do one blunt final audit. Fix only concrete issues found in that audit rather than continuing open-ended polish.
