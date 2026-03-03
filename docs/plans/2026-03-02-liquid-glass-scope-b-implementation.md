# Liquid Glass Scope B Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Liquid Glass scope B across the dashboard shell, sidebar, and phase surfaces while keeping workflow and behavior unchanged.

**Architecture:** Add reusable glass utility classes in global CSS, then apply those classes to existing top-level JSX surfaces in `App.jsx` and phase components. Use progressive enhancement for `backdrop-filter` with safe fallback styles.

**Tech Stack:** React 19, Vite, Tailwind utility classes, custom global CSS (`src/index.css`)

---

### Task 1: Define acceptance checks before implementation

**Files:**
- Modify: `src/index.css`
- Verify: `src/App.jsx`, `src/components/Phase0.jsx`, `src/components/Phase1.jsx`, `src/components/Phase2.jsx`, `src/components/Phase3.jsx`, `src/components/Phase4.jsx`, `src/components/Phase5.jsx`

**Step 1: Write failing checks**

- Verify classes do not yet exist: `cf-app-shell`, `cf-glass-surface`, `cf-glass-nav`.

**Step 2: Run checks to confirm fail**

Run: `rg -n "cf-app-shell|cf-glass-surface|cf-glass-nav" src`
Expected: no matches.

**Step 3: Prepare implementation target list**

- Add glass utility classes in `src/index.css`.
- Apply classes to shell wrappers in `App.jsx`.
- Apply classes to primary phase surfaces in Phase 0-5 files.

**Step 4: Re-run checks after implementation**

Run: `rg -n "cf-app-shell|cf-glass-surface|cf-glass-nav" src`
Expected: matches in CSS and JSX files.

### Task 2: Implement global Liquid Glass tokens and utilities

**Files:**
- Modify: `src/index.css`

**Step 1: Add app background layers**

- Add `:root` color tokens for glass surfaces and highlights.
- Add body background gradient + noise texture.

**Step 2: Add reusable glass classes**

- Create `cf-app-shell`, `cf-glass-surface`, `cf-glass-nav`, `cf-glass-soft`, `cf-glass-strong`.
- Include shared border, shadow, blur, and highlight behavior.

**Step 3: Add fallback/enhancement split**

- Baseline class styles work without blur.
- Add `@supports` block for `backdrop-filter` and `-webkit-backdrop-filter`.

**Step 4: Commit**

```bash
git add src/index.css
git commit -m "style: add liquid glass scope b utility classes"
```

### Task 3: Apply glass classes to app shell and sidebar

**Files:**
- Modify: `src/App.jsx`

**Step 1: Wrap top-level surfaces**

- Add app shell class to root.
- Add glass class to header, sidebar, and main content container.

**Step 2: Update Fast Lane and nav containers**

- Convert Fast Lane card and collapsed module summary to glass variants.
- Keep button readability and existing behavior.

**Step 3: Verify no behavior regressions**

- Confirm phase switching and sidebar collapse still work.

**Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "style: apply liquid glass shell styles to app navigation"
```

### Task 4: Apply glass classes to phase primary surfaces

**Files:**
- Modify: `src/components/Phase0.jsx`
- Modify: `src/components/Phase1.jsx`
- Modify: `src/components/Phase2.jsx`
- Modify: `src/components/Phase3.jsx`
- Modify: `src/components/Phase4.jsx`
- Modify: `src/components/Phase5.jsx`

**Step 1: Update top-level phase wrappers**

- Add consistent shell spacing class and glass surface class.

**Step 2: Update each phase primary panel**

- Replace flat slate background wrappers with glass surface variants.
- Preserve form field classes for readability.

**Step 3: Verify layout integrity**

- Ensure no overflow and mobile responsiveness remain intact.

**Step 4: Commit**

```bash
git add src/components/Phase0.jsx src/components/Phase1.jsx src/components/Phase2.jsx src/components/Phase3.jsx src/components/Phase4.jsx src/components/Phase5.jsx
git commit -m "style: apply liquid glass scope b to phase surfaces"
```

### Task 5: Validate build and summarize

**Files:**
- Verify: `src/index.css`, `src/App.jsx`, `src/components/Phase0.jsx`, `src/components/Phase1.jsx`, `src/components/Phase2.jsx`, `src/components/Phase3.jsx`, `src/components/Phase4.jsx`, `src/components/Phase5.jsx`

**Step 1: Run build**

Run: `npm run build`
Expected: successful Vite production build.

**Step 2: Spot-check visual coverage**

- Sidebar, Fast Lane, and phase shells use glass classes.
- Inputs remain readable and mostly unchanged.

**Step 3: Commit**

```bash
git add .
git commit -m "style: implement liquid glass scope b"
```
