# Phase 1 Micro Controls Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the last legacy micro-controls inside Phase 1 so the editor internals match the shared liquid-glass control system.

**Architecture:** Add a dedicated verifier for the leftover Phase 1 patterns, then replace the repeated old button/input/panel classes in targeted editor fragments with the shared `cf-*` utilities already defined in `src/index.css`.

**Tech Stack:** React + Vite + Tailwind utilities + shared global CSS utilities (`cf-*`) + Node verification script

---

### Task 1: Write the failing verifier

**Files:**
- Create: `scripts/verify_phase1_micro_controls.mjs`

**Steps**

- Read `src/components/Phase1.jsx`.
- Assert that the targeted legacy micro-control class patterns are absent.
- Run the verifier and confirm it fails before implementation.

### Task 2: Refactor remaining editor micro-controls

**Files:**
- Modify: `src/components/Phase1.jsx`

**Steps**

- Convert remaining small legacy buttons to shared `cf-btn` variants.
- Convert remaining legacy text inputs, textareas, and selects to `cf-input-shell`.
- Convert leftover muted editor wrappers to `cf-panel-muted`.
- Keep all handlers and editor behaviors untouched.

### Task 3: Verify and build

**Files:**
- Verify: `scripts/verify_phase1_micro_controls.mjs`
- Verify: `src/components/Phase1.jsx`

**Steps**

- Run `node scripts/verify_phase1_micro_controls.mjs` and confirm it passes.
- Run `npm run build` and confirm the app still builds.
