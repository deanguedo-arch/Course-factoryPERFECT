# Composer Canvas Overlay Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the composer's long floating block action strip with a minimal canvas-first overlay and keep exact/block actions in the selected-section drawer.

**Architecture:** Keep the existing composer layout model and direct-manipulation foundation, but simplify the overlay component into a small label-plus-grip shell, remove redundant canvas action buttons, and rely on the shared drawer for exact controls and destructive actions. Verify with a dedicated script that the overlay no longer contains the legacy action strip patterns.

**Tech Stack:** React, Vite, shared `cf-*` CSS utilities, Node verifier scripts, existing composer layout helpers

---

### Task 1: Save The Approved Design And Plan

**Files:**
- Create: `docs/plans/2026-03-03-composer-canvas-overlay-redesign-design.md`
- Create: `docs/plans/2026-03-03-composer-canvas-overlay-redesign-implementation.md`

**Step 1: Save the approved design**

- Document the canvas-first interaction model, minimal overlay, and drawer-based fallback controls.

**Step 2: Save the implementation plan**

- Break the redesign into verifier-first tasks with exact files and validation commands.

### Task 2: Write The Failing Redesign Verifier

**Files:**
- Create: `scripts/verify_composer_canvas_overlay_redesign.mjs`
- Modify: `src/components/composer/ComposerCanvasBlockOverlay.jsx`
- Modify: `src/components/composer/ComposerCanvasDrawer.jsx`
- Modify: `src/index.css`

**Step 1: Write the failing verifier**

- Check that:
  - the overlay contains a compact composer overlay shell class
  - the legacy long floating strip classes and inline move/duplicate/delete buttons are removed from `ComposerCanvasBlockOverlay.jsx`
  - the selected drawer still contains duplicate/delete actions
  - canvas mode in `ComposerCanvasDrawer.jsx` keeps numeric `X`, `Y`, `W`, `H` controls

**Step 2: Run test to verify it fails**

Run: `node scripts/verify_composer_canvas_overlay_redesign.mjs`

Expected: FAIL before implementation.

### Task 3: Simplify The Canvas Overlay

**Files:**
- Modify: `src/components/composer/ComposerCanvasBlockOverlay.jsx`
- Modify: `src/index.css`

**Step 1: Replace the long floating toolbar**

- Remove:
  - arrange/freeform badge
  - directional move buttons
  - width/height buttons from the overlay
  - duplicate/delete buttons from the overlay
- Keep:
  - block label
  - drag grip
  - resize handles

**Step 2: Add compact overlay styles**

- Add shared classes for:
  - minimal overlay pill
  - drag grip button
  - drag/draft position chip
  - light/dark-safe handle styling

**Step 3: Preserve direct manipulation**

- Keep the existing drag/resize logic working.
- Do not change saved layout structure.

### Task 4: Make The Drawer The Fallback Control Surface

**Files:**
- Modify: `src/components/composer/ComposerCanvasDrawer.jsx`
- Modify: `src/index.css`

**Step 1: Keep exact controls in canvas mode**

- Preserve numeric `X`, `Y`, `W`, `H` inputs for precision edits.

**Step 2: Remove redundant canvas action clutter**

- In canvas mode, remove redundant directional move and width shortcut buttons if the numeric controls already cover the same job.

**Step 3: Keep block actions accessible**

- Retain duplicate/delete actions in the selected-section drawer.
- Make sure they remain visually prominent enough without recreating the old overlay clutter.

### Task 5: Adjust Wiring Only If Needed

**Files:**
- Modify: `src/components/composer/ComposerCanvasGrid.jsx` only if the drag handle selector must change
- Modify: `src/components/Phase1.jsx` only if shared props or labels must be updated
- Modify: `src/components/modals/EditModal.jsx` only if shared props or labels must be updated

**Step 1: Keep API changes minimal**

- Reuse current handlers where possible.
- Only touch callers if the shared overlay/drawer API changes.

**Step 2: Preserve behavior**

- Canvas drag still updates layout.
- Resize still updates width/height.
- Flow mode still retains its non-canvas arrangement controls in the drawer.

### Task 6: Verify Green

**Files:**
- Modify: any touched files above if follow-up fixes are needed

**Step 1: Run the redesign verifier**

Run: `node scripts/verify_composer_canvas_overlay_redesign.mjs`

Expected: PASS

**Step 2: Run existing verifier suite**

Run:
- `node scripts/verify_composer_light_mode_legibility.mjs`
- `node scripts/verify_builder_ui_final_polish.mjs`
- `node scripts/verify_builder_ui_theme_system.mjs`
- `node scripts/verify_ui_consistency.mjs`
- `node scripts/verify_phase1_micro_controls.mjs`

Expected: all PASS

**Step 3: Run build**

Run: `npm run build`

Expected: PASS

**Step 4: Commit**

```bash
git add src/components/composer/ComposerCanvasBlockOverlay.jsx src/components/composer/ComposerCanvasDrawer.jsx src/index.css scripts/verify_composer_canvas_overlay_redesign.mjs docs/plans/2026-03-03-composer-canvas-overlay-redesign-design.md docs/plans/2026-03-03-composer-canvas-overlay-redesign-implementation.md
git commit -m "feat: redesign composer canvas overlay"
```
