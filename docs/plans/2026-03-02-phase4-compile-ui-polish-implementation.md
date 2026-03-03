# Phase 4 Compile UI Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply a style-only polish pass to `Phase 4: Compile & Export` so it matches the refined glass hierarchy used in the shell, Phase 1, and Phase 2.

**Architecture:** Update surface wrappers and action/button classes in `src/components/Phase4.jsx` using existing glass utility classes. Preserve all compile, export, and beta publish logic.

**Tech Stack:** React + Tailwind utilities + existing `cf-glass-*` CSS utilities

---

### Task 1: Update top-level control surfaces

**Files:**
- Modify: `src/components/Phase4.jsx`

**Steps**

- Convert Asset Base URL and Publishing Mode blocks to glass surfaces.
- Replace solid active tabs with border+tint active states.

### Task 2: Update beta publish surfaces and actions

**Files:**
- Modify: `src/components/Phase4.jsx`

**Steps**

- Convert beta publish sections and file-preview blocks to lighter glass containers.
- Replace loud solid publish buttons with consistent bordered action buttons.

### Task 3: Update export and legacy compile hierarchy

**Files:**
- Modify: `src/components/Phase4.jsx`

**Steps**

- Soften export panel surfaces and action buttons.
- Reduce visual weight of the main compile CTA and generated-output controls.

### Task 4: Verify

**Files:**
- Verify: `src/components/Phase4.jsx`

**Steps**

- Run `npm run build`.
- Confirm compile/export behavior remains unchanged.
