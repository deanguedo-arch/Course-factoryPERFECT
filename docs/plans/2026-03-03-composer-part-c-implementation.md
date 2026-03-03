# Composer Part C Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish the remaining deep composer/editor UI surfaces so the builder uses one coherent control system in both dark mode and light mode.

**Architecture:** This pass uses the existing builder theme tokens and `cf-*`/`cf-composer-*` primitives rather than inventing new local style stacks. Verification is driven by a dedicated Part C legacy-pattern checker plus the existing composer/theme verifiers, with behavior kept stable unless a UI structure is actively blocking consistency.

**Tech Stack:** React 19, Vite, JSX, Tailwind utility classes, shared builder theme tokens in `src/index.css`, Node-based verification scripts.

---

### Task 1: Add Part C Verification Guardrails

**Files:**
- Create: `scripts/verify_composer_part_c.mjs`
- Modify: `docs/plans/2026-03-03-composer-part-c-implementation.md`
- Test: `scripts/verify_composer_part_c.mjs`

**Step 1: Write the failing test**

Create `scripts/verify_composer_part_c.mjs` with checks that intentionally fail against the current raw legacy styling in:

- `src/components/composer/ComposerActivityBuilderFooter.jsx`
- `src/components/composer/ComposerLayoutControls.jsx`
- `src/components/composer/ComposerResponsiveControls.jsx`
- `src/components/composer/ComposerSidebarTools.jsx`
- `src/components/composer/ComposerPreviewPane.jsx`
- `src/components/composer/ComposerUndoRedoControls.jsx`
- `src/components/composer/ComposerWorkspaceFrame.jsx`
- `src/components/composer/HotspotEditor.jsx`

The script should fail when it finds raw patterns such as:

- `bg-slate-900`
- `bg-slate-950`
- `border-slate-700`
- `text-white`
- `bg-indigo-600`
- `bg-emerald-600`
- `bg-rose-600`

Only exempt lines that are deliberately tied to preview/canvas content and cannot yet move to shared primitives.

**Step 2: Run test to verify it fails**

Run:

```bash
node scripts/verify_composer_part_c.mjs
```

Expected: `FAIL` with messages pointing at at least some of the target files above.

**Step 3: Write minimal implementation**

Implement the verifier so it reports:

- which files still contain forbidden legacy patterns
- which allowlist patterns are intentionally permitted
- a final pass/fail exit code

**Step 4: Run test to verify it passes structure-only expectations**

Run:

```bash
node scripts/verify_composer_part_c.mjs
```

Expected: still `FAIL`, but now because the UI files have not been migrated yet, not because the verifier itself is broken.

**Step 5: Commit**

Do not commit yet. This verifier is only useful once at least one Part C task is implemented.

### Task 2: Normalize Footer, Layout, and Responsive Control Surfaces

**Files:**
- Modify: `src/components/composer/ComposerActivityBuilderFooter.jsx`
- Modify: `src/components/composer/ComposerLayoutControls.jsx`
- Modify: `src/components/composer/ComposerResponsiveControls.jsx`
- Modify: `src/index.css`
- Test: `scripts/verify_composer_part_c.mjs`

**Step 1: Write the failing test**

Use the Part C verifier from Task 1 as the failing test target for these files.

**Step 2: Run test to verify it fails**

Run:

```bash
node scripts/verify_composer_part_c.mjs
```

Expected: `FAIL` citing the footer/layout/responsive files.

**Step 3: Write minimal implementation**

Refactor these three files to shared builder primitives:

- `ComposerActivityBuilderFooter.jsx`
  - convert the add-section panel to `cf-composer-panel-soft` or `cf-panel-muted`
  - move quick insert buttons to `cf-btn-secondary`-style usage
  - move primary add action to `cf-btn-success`
  - move duplicate/delete to `cf-btn-primary` / `cf-btn-danger`
  - convert selects/inputs to `cf-input-shell`
- `ComposerLayoutControls.jsx`
  - replace local accent maps with shared segmented-tab and button styling
  - convert page-width select and advanced metric inputs to shared shells
  - convert the row-height toggle to shared toggle/button treatment
- `ComposerResponsiveControls.jsx`
  - convert wrapper, reset/show actions, checkbox row, and numeric fields to shared primitives
  - ensure light mode text and controls remain readable

Add any missing small helper classes to `src/index.css` only if the existing `cf-*` language cannot express the needed grouped control layout.

**Step 4: Run test to verify it passes**

Run:

```bash
node scripts/verify_composer_part_c.mjs
```

Expected: target failures for these three files are gone, though other Part C files should still fail.

**Step 5: Commit**

```bash
git add src/components/composer/ComposerActivityBuilderFooter.jsx src/components/composer/ComposerLayoutControls.jsx src/components/composer/ComposerResponsiveControls.jsx src/index.css scripts/verify_composer_part_c.mjs
git commit -m "feat: unify composer builder controls"
```

### Task 3: Normalize Sidebar Library, Audit, and Outline Panels

**Files:**
- Modify: `src/components/composer/ComposerSidebarTools.jsx`
- Modify: `src/index.css`
- Test: `scripts/verify_composer_part_c.mjs`

**Step 1: Write the failing test**

Use the Part C verifier from Task 1 as the failing test target for `ComposerSidebarTools.jsx`.

**Step 2: Run test to verify it fails**

Run:

```bash
node scripts/verify_composer_part_c.mjs
```

Expected: `FAIL` citing `ComposerSidebarTools.jsx`.

**Step 3: Write minimal implementation**

Refactor the sidebar tool modes:

- `templates`
  - convert the intro block, name field, local save, course save, linked-status box, component cards, and browser snippet cards
- `issues`
  - convert the validation summary, quick-fix actions, issue rows, and selected state
- `outline`
  - convert search input, activity list rows, and duplicate/delete footer

Use shared button hierarchy and `cf-alert` variants for status-driven blocks where appropriate. Preserve stronger contrast in selected items, but keep it inside the shared theme language.

**Step 4: Run test to verify it passes**

Run:

```bash
node scripts/verify_composer_part_c.mjs
```

Expected: sidebar-specific failures are gone.

**Step 5: Commit**

```bash
git add src/components/composer/ComposerSidebarTools.jsx src/index.css scripts/verify_composer_part_c.mjs
git commit -m "feat: normalize composer sidebar tools"
```

### Task 4: Normalize Preview, Workspace, and History Micro-Surfaces

**Files:**
- Modify: `src/components/composer/ComposerPreviewPane.jsx`
- Modify: `src/components/composer/ComposerUndoRedoControls.jsx`
- Modify: `src/components/composer/ComposerWorkspaceFrame.jsx`
- Modify: `src/index.css`
- Test: `scripts/verify_composer_part_c.mjs`

**Step 1: Write the failing test**

Use the Part C verifier from Task 1 as the failing test target for the preview/workspace/history files.

**Step 2: Run test to verify it fails**

Run:

```bash
node scripts/verify_composer_part_c.mjs
```

Expected: `FAIL` citing these files.

**Step 3: Write minimal implementation**

Refactor:

- `ComposerPreviewPane.jsx`
  - align outer shell and empty state with theme-aware preview surfaces
  - keep the inner preview intentionally darker only where needed for the actual preview frame
- `ComposerUndoRedoControls.jsx`
  - move onto the shared micro-control language already used in the preview toolbar
- `ComposerWorkspaceFrame.jsx`
  - convert title/header/empty state to shared panel and text treatment

Add only the smallest necessary CSS helpers in `src/index.css`.

**Step 4: Run test to verify it passes**

Run:

```bash
node scripts/verify_composer_part_c.mjs
```

Expected: failures for these files are gone.

**Step 5: Commit**

```bash
git add src/components/composer/ComposerPreviewPane.jsx src/components/composer/ComposerUndoRedoControls.jsx src/components/composer/ComposerWorkspaceFrame.jsx src/index.css scripts/verify_composer_part_c.mjs
git commit -m "feat: align composer preview and workspace chrome"
```

### Task 5: Normalize Hotspot Editor Surfaces

**Files:**
- Modify: `src/components/composer/HotspotEditor.jsx`
- Modify: `src/index.css`
- Test: `scripts/verify_composer_part_c.mjs`

**Step 1: Write the failing test**

Use the Part C verifier from Task 1 as the failing test target for `HotspotEditor.jsx`.

**Step 2: Run test to verify it fails**

Run:

```bash
node scripts/verify_composer_part_c.mjs
```

Expected: `FAIL` citing `HotspotEditor.jsx`.

**Step 3: Write minimal implementation**

Refactor `HotspotEditor.jsx` so:

- text inputs and textareas use `cf-input-shell`
- preview/image shell uses theme-aware panel styling
- hotspot list items use shared selected/unselected panel patterns
- add/remove actions use shared button hierarchy
- labels reduce unnecessary uppercase while keeping important section labeling
- drag marker styling remains functionally clear in both themes

Only keep custom marker styles where the hotspot interaction genuinely requires them.

**Step 4: Run test to verify it passes**

Run:

```bash
node scripts/verify_composer_part_c.mjs
```

Expected: hotspot-specific failures are gone.

**Step 5: Commit**

```bash
git add src/components/composer/HotspotEditor.jsx src/index.css scripts/verify_composer_part_c.mjs
git commit -m "feat: modernize hotspot editor surfaces"
```

### Task 6: Re-Run Full Composer Verification And Finalize Part C

**Files:**
- Modify: `docs/plans/2026-03-03-session-handoff.md`
- Modify: `docs/plans/2026-03-03-composer-part-c-implementation.md`
- Test: `scripts/verify_composer_part_c.mjs`
- Test: `scripts/verify_composer_light_mode_legibility.mjs`
- Test: `scripts/verify_composer_canvas_overlay_redesign.mjs`
- Test: `scripts/verify_builder_ui_final_polish.mjs`
- Test: `scripts/verify_builder_ui_theme_system.mjs`
- Test: `scripts/verify_ui_consistency.mjs`
- Test: `scripts/verify_phase1_micro_controls.mjs`

**Step 1: Write the failing test**

The failing test is the combined verification suite before the final adjustments are complete.

**Step 2: Run test to verify it fails or reveals remaining gaps**

Run:

```bash
node scripts/verify_composer_part_c.mjs
node scripts/verify_composer_light_mode_legibility.mjs
node scripts/verify_composer_canvas_overlay_redesign.mjs
node scripts/verify_builder_ui_final_polish.mjs
node scripts/verify_builder_ui_theme_system.mjs
node scripts/verify_ui_consistency.mjs
node scripts/verify_phase1_micro_controls.mjs
npm run build
```

Expected: if anything still fails, it should point to a concrete unfinished Part C fragment.

**Step 3: Write minimal implementation**

Patch only the remaining concrete issues surfaced by the verification suite. If a touched file in `Phase1.jsx` or `EditModal.jsx` needs a small consistency glue change, make the smallest possible adjustment.

Update `docs/plans/2026-03-03-session-handoff.md` with the completed Part C status and the final recommended next move.

**Step 4: Run test to verify it passes**

Run:

```bash
node scripts/verify_composer_part_c.mjs
node scripts/verify_composer_light_mode_legibility.mjs
node scripts/verify_composer_canvas_overlay_redesign.mjs
node scripts/verify_builder_ui_final_polish.mjs
node scripts/verify_builder_ui_theme_system.mjs
node scripts/verify_ui_consistency.mjs
node scripts/verify_phase1_micro_controls.mjs
npm run build
```

Expected: all listed verification scripts pass and the production build succeeds.

`npm run lint` remains informational only unless this pass directly introduces a new failure in a touched Part C file.

**Step 5: Commit**

```bash
git add scripts/verify_composer_part_c.mjs src/components/composer src/index.css src/components/Phase1.jsx src/components/modals/EditModal.jsx docs/plans/2026-03-03-session-handoff.md
git commit -m "feat: complete composer part c ui system"
```
