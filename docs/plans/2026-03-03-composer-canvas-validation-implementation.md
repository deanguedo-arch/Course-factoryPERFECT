# Composer Canvas Validation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add validity-aware drag/resize preview for freeform canvas mode and insertion-target preview for stacked mode so composer movement is predictable.

**Architecture:** This pass extends the existing overlay movement system rather than replacing it. Pure layout helpers in `src/composer/layout.js` handle target validation and insertion targeting, while `ComposerCanvasBlockOverlay.jsx` renders preview states and only commits valid changes.

**Tech Stack:** React 19, JSX, Vite, shared builder CSS in `src/index.css`, Node verification scripts.

---

### Task 1: Add Interaction Verifier

**Files:**
- Create: `scripts/verify_composer_canvas_validation.mjs`
- Test: `scripts/verify_composer_canvas_validation.mjs`

**Step 1: Write the failing test**

Create `scripts/verify_composer_canvas_validation.mjs` so it fails until these conditions exist:

- `src/components/composer/ComposerCanvasBlockOverlay.jsx` includes preview hooks/classes for:
  - valid canvas draft state
  - invalid canvas blocked state
  - stacked insertion line / gap state
- `src/index.css` includes styles for those preview states
- overlay commit logic distinguishes valid vs invalid release behavior

**Step 2: Run test to verify it fails**

Run:

```bash
node scripts/verify_composer_canvas_validation.mjs
```

Expected: `FAIL` because the current overlay only shows a generic draft frame and does not expose invalid/insertion preview states yet.

**Step 3: Write minimal implementation**

Implement the verifier so it reports missing preview hooks precisely.

**Step 4: Run test to verify it still fails for the right reason**

Run:

```bash
node scripts/verify_composer_canvas_validation.mjs
```

Expected: still `FAIL`, but now because the feature is not implemented, not because the verifier is broken.

**Step 5: Commit**

Do not commit yet.

### Task 2: Add Pure Canvas Validation And Stacked Insertion Helpers

**Files:**
- Modify: `src/composer/layout.js`
- Test: `scripts/verify_composer_canvas_validation.mjs`

**Step 1: Write the failing test**

Use the new verifier as the failing test target, and add include expectations for exported helper names or hook markers from `layout.js`.

**Step 2: Run test to verify it fails**

Run:

```bash
node scripts/verify_composer_canvas_validation.mjs
```

Expected: `FAIL` because the helper functions do not exist yet.

**Step 3: Write minimal implementation**

Add pure helpers in `src/composer/layout.js`:

- canvas validation helper
  - takes activities, active index, proposed `x/y/w/h`, and `maxColumns`
  - returns `{ valid, reason }`
  - rejects bounds overflow and collisions with sibling blocks
- stacked insertion helper
  - takes ordered activities, active index, pointer target info, and max columns
  - returns insertion metadata that the overlay can preview and later commit

Keep them deterministic and side-effect free.

**Step 4: Run test to verify helper expectations pass**

Run:

```bash
node scripts/verify_composer_canvas_validation.mjs
```

Expected: helper-related failures are gone, but overlay/CSS failures remain.

**Step 5: Commit**

Do not commit yet.

### Task 3: Implement Validity-Aware Canvas Drag/Resize Preview

**Files:**
- Modify: `src/components/composer/ComposerCanvasBlockOverlay.jsx`
- Modify: `src/index.css`
- Test: `scripts/verify_composer_canvas_validation.mjs`

**Step 1: Write the failing test**

Use the interaction verifier from Task 1 as the failing test target for:

- invalid blocked preview state
- valid preview state
- invalid release rejection

**Step 2: Run test to verify it fails**

Run:

```bash
node scripts/verify_composer_canvas_validation.mjs
```

Expected: `FAIL` on canvas preview and commit path checks.

**Step 3: Write minimal implementation**

Update `ComposerCanvasBlockOverlay.jsx` so canvas mode:

- computes snapped proposals live
- validates each proposal with the new layout helper
- renders:
  - valid draft preview
  - invalid blocked red preview
- commits only if the release target is valid
- reverts immediately on invalid release

Add the smallest necessary CSS in `src/index.css` for:

- `.cf-composer-block-outline.is-invalid`
- blocked red chip/handle states if needed

**Step 4: Run test to verify it passes canvas checks**

Run:

```bash
node scripts/verify_composer_canvas_validation.mjs
```

Expected: canvas validation checks pass, stacked insertion checks may still fail.

**Step 5: Commit**

Do not commit yet.

### Task 4: Implement Stacked Insertion Preview

**Files:**
- Modify: `src/components/composer/ComposerCanvasBlockOverlay.jsx`
- Modify: `src/index.css`
- Test: `scripts/verify_composer_canvas_validation.mjs`

**Step 1: Write the failing test**

Use the interaction verifier as the failing test target for:

- stacked insertion line hooks
- stacked insertion gap preview hooks
- stacked commit path

**Step 2: Run test to verify it fails**

Run:

```bash
node scripts/verify_composer_canvas_validation.mjs
```

Expected: `FAIL` on stacked insertion checks.

**Step 3: Write minimal implementation**

Update `ComposerCanvasBlockOverlay.jsx` so stacked mode:

- resolves insertion target from pointer movement
- shows a thin insertion line and small gap cue
- commits reorder into the resolved insertion slot on release

Add only minimal CSS for:

- insertion line
- insertion gap

**Step 4: Run test to verify it passes**

Run:

```bash
node scripts/verify_composer_canvas_validation.mjs
```

Expected: interaction verifier passes.

**Step 5: Commit**

Do not commit yet.

### Task 5: Wire Final Glue And Re-Run Verification

**Files:**
- Modify: `src/components/Phase1.jsx`
- Modify: `src/components/modals/EditModal.jsx`
- Modify: `docs/plans/2026-03-03-session-handoff.md`
- Test: `scripts/verify_composer_canvas_validation.mjs`
- Test: `scripts/verify_composer_part_c.mjs`
- Test: `scripts/verify_composer_light_mode_legibility.mjs`
- Test: `scripts/verify_composer_canvas_overlay_redesign.mjs`

**Step 1: Write the failing test**

The failing test is the combined verification suite before glue and final cleanup are complete.

**Step 2: Run test to verify it fails or exposes gaps**

Run:

```bash
node scripts/verify_composer_canvas_validation.mjs
node scripts/verify_composer_part_c.mjs
node scripts/verify_composer_light_mode_legibility.mjs
node scripts/verify_composer_canvas_overlay_redesign.mjs
npm run build
```

Expected: any remaining failure points to a real unfinished integration detail.

**Step 3: Write minimal implementation**

Make only the smallest necessary glue changes in `Phase1.jsx` and `EditModal.jsx` if the new overlay preview model needs extra props or commit wiring.

Update `docs/plans/2026-03-03-session-handoff.md` with the completed interaction pass and final audit status.

**Step 4: Run test to verify it passes**

Run:

```bash
node scripts/verify_composer_canvas_validation.mjs
node scripts/verify_composer_part_c.mjs
node scripts/verify_composer_light_mode_legibility.mjs
node scripts/verify_composer_canvas_overlay_redesign.mjs
node scripts/verify_builder_ui_final_polish.mjs
node scripts/verify_builder_ui_theme_system.mjs
node scripts/verify_ui_consistency.mjs
node scripts/verify_phase1_micro_controls.mjs
npm run build
```

Expected: all listed checks pass and the build succeeds.

**Step 5: Commit**

```bash
git add src/composer/layout.js src/components/composer/ComposerCanvasBlockOverlay.jsx src/components/Phase1.jsx src/components/modals/EditModal.jsx src/index.css scripts/verify_composer_canvas_validation.mjs docs/plans/2026-03-03-session-handoff.md
git commit -m "feat: validate composer canvas interactions"
```
