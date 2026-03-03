# Phase 1 Module Manager UI Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply targeted Phase 1 Module Manager visual polish to reduce clunk and align with Liquid Glass B.

**Architecture:** Style-only updates in `src/components/Phase1.jsx` using existing utility classes (`cf-glass-soft`, border+tint button states). No logic changes.

**Tech Stack:** React + Tailwind class utilities + existing custom glass utilities

---

### Task 1: Update high-level Phase 1 toggles

**Files:**
- Modify: `src/components/Phase1.jsx`

**Steps**

- Convert Harvest mode toggle container to glass surface.
- Replace solid active fills with subtle active borders/tints.

### Task 2: Update Module Manager control surfaces

**Files:**
- Modify: `src/components/Phase1.jsx`

**Steps**

- Convert top Module Manager mode strip to glass style.
- Tune status chips and side card wrappers for lower visual weight.

### Task 3: Normalize Session/Draft action hierarchy

**Files:**
- Modify: `src/components/Phase1.jsx`

**Steps**

- Replace loud primary button fills with balanced glass-style controls.
- Keep delete/reset semantic colors but reduce saturation.

### Task 4: Verify

**Files:**
- Verify: `src/components/Phase1.jsx`

**Steps**

- Run `npm run build`.
- Confirm no functional behavior changed in Module Manager controls.
