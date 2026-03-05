# Assignment Center Rebuild Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild Phase 1 Assessment Center into a low-friction pipeline that imports outside tests (PDF/DOCX/Text/JSON), normalizes them into a canonical assessment model, and publishes to both Hub Assignments and selected module exports.

**Architecture:** Move assessment logic out of `Phase1.jsx`/`App.jsx` into a dedicated assessment domain (`schema`, `import`, `compiler`, `placement`). Keep one source of truth (structured assessment definition), then compile HTML/script from that model. Replace fragmented modes with one flow: `Import -> Review -> Compose -> Publish -> Manage`.

**Tech Stack:** React 19, Vite, plain JS modules, Node built-in test runner (`node --test`), ESLint.

---

### Task 1: Baseline Test Harness For Assessment Domain

**Files:**
- Modify: `package.json`
- Create: `tests/assessment/smoke.test.mjs`
- Create: `src/assessment/index.js`

**Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAssessment } from '../../src/assessment/index.js';

test('assessment domain is wired', () => {
  assert.equal(typeof normalizeAssessment, 'function');
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:assessment`
Expected: FAIL with module/script missing error.

**Step 3: Write minimal implementation**

```js
export const normalizeAssessment = (input) => input;
```

**Step 4: Run test to verify it passes**

Run: `npm run test:assessment`
Expected: PASS (1 passing test).

**Step 5: Commit**

```bash
git add package.json tests/assessment/smoke.test.mjs src/assessment/index.js
git commit -m "test: add assessment domain test harness"
```

---

### Task 2: Canonical Assessment Schema + Validation

**Files:**
- Create: `src/assessment/schema.js`
- Modify: `src/assessment/index.js`
- Create: `tests/assessment/schema.test.mjs`

**Step 1: Write the failing test**

```js
test('normalizes mixed questions and clamps invalid correct index', () => {
  const out = normalizeAssessment({
    title: 'Sample',
    questions: [
      { type: 'multiple-choice', question: 'Q1', options: ['A', 'B'], correct: 9 },
      { question: 'Q2', options: [] }
    ]
  });
  assert.equal(out.questions[0].correct, 0);
  assert.equal(out.questions[1].type, 'long-answer');
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:assessment -- tests/assessment/schema.test.mjs`
Expected: FAIL with missing fields/behavior.

**Step 3: Write minimal implementation**

Implement:
- `normalizeQuestion(raw, idx)`
- `normalizeAssessment(raw)`
- `validateAssessment(definition)` returning `{ errors, warnings }`

**Step 4: Run test to verify it passes**

Run: `npm run test:assessment -- tests/assessment/schema.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/assessment/schema.js src/assessment/index.js tests/assessment/schema.test.mjs
git commit -m "feat: add canonical assessment schema and validation"
```

---

### Task 3: Import Pipeline (JSON + Plain Text + AI Output)

**Files:**
- Create: `src/assessment/import/parseJsonImport.js`
- Create: `src/assessment/import/parseTextImport.js`
- Create: `src/assessment/import/index.js`
- Modify: `src/assessment/index.js`
- Create: `tests/assessment/import.test.mjs`

**Step 1: Write the failing test**

```js
test('parses numbered MC + answer key text into canonical questions', () => {
  const raw = '1. What?\na. One\nb. Two\nAnswer: B';
  const out = parseAssessmentImport({ kind: 'text', content: raw });
  assert.equal(out.questions.length, 1);
  assert.equal(out.questions[0].correct, 1);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:assessment -- tests/assessment/import.test.mjs`
Expected: FAIL.

**Step 3: Write minimal implementation**

Implement parsers with output:
- canonical questions
- `issues[]` (ambiguity/format warnings)
- `confidence` score per question

**Step 4: Run test to verify it passes**

Run: `npm run test:assessment -- tests/assessment/import.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/assessment/import src/assessment/index.js tests/assessment/import.test.mjs
git commit -m "feat: add assessment import parsers with confidence metadata"
```

---

### Task 4: Placement Model (Hub + Module Targets)

**Files:**
- Create: `src/assessment/placement.js`
- Create: `tests/assessment/placement.test.mjs`
- Modify: `src/App.jsx`

**Step 1: Write the failing test**

```js
test('normalizes placement targets and deduplicates same target', () => {
  const placements = normalizePlacements([
    { targetType: 'hub' },
    { targetType: 'module', moduleId: 'view-1' },
    { targetType: 'module', moduleId: 'view-1' }
  ]);
  assert.equal(placements.length, 2);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:assessment -- tests/assessment/placement.test.mjs`
Expected: FAIL.

**Step 3: Write minimal implementation**

Implement:
- `normalizePlacements()`
- `isPublishedToHub()`
- `isPublishedToModule(moduleId)`

Then update `addAssessment`, `editAssessment`, `deleteAssessment` in `App.jsx`:
- ensure `order` is reindexed after delete
- store placements on save/update

**Step 4: Run test to verify it passes**

Run: `npm run test:assessment -- tests/assessment/placement.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/assessment/placement.js tests/assessment/placement.test.mjs src/App.jsx
git commit -m "feat: add assessment placement model and stable ordering"
```

---

### Task 5: Compiler Extraction + Script Safety

**Files:**
- Create: `src/assessment/compiler/renderAssessment.js`
- Create: `tests/assessment/compiler.test.mjs`
- Modify: `src/App.jsx`
- Modify: `src/components/Phase1.jsx`

**Step 1: Write the failing test**

```js
test('escapes unsafe title characters in generated print script', () => {
  const out = renderAssessment({ title: "Dean's Quiz", type: 'quiz', questions: [] });
  assert.equal(out.script.includes("Dean's Quiz"), false);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:assessment -- tests/assessment/compiler.test.mjs`
Expected: FAIL.

**Step 3: Write minimal implementation**

Move generation logic into compiler and ensure:
- safe JS string escaping
- deterministic IDs
- shared template helpers (no duplicate code paths)

Wire `generateMixedAssessment` and Phase1 “generate assessment” to compiler.

**Step 4: Run test to verify it passes**

Run: `npm run test:assessment -- tests/assessment/compiler.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/assessment/compiler/renderAssessment.js tests/assessment/compiler.test.mjs src/App.jsx src/components/Phase1.jsx
git commit -m "refactor: centralize assessment compiler with safe escaping"
```

---

### Task 6: Phase 1 Flow Rebuild (Import -> Review -> Compose -> Publish -> Manage)

**Files:**
- Modify: `src/components/Phase1.jsx`
- Create: `src/components/phase1/AssessmentFlowTabs.jsx`
- Create: `src/components/phase1/AssessmentImportPanel.jsx`
- Create: `src/components/phase1/AssessmentReviewPanel.jsx`
- Create: `src/components/phase1/AssessmentComposePanel.jsx`
- Create: `src/components/phase1/AssessmentPublishPanel.jsx`
- Create: `src/components/phase1/AssessmentBankPanel.jsx`

**Step 1: Write the failing test**

Create a behavior test for mode transitions in a pure reducer file:

```js
test('cannot publish when validation has blocking errors', () => {
  const state = { step: 'publish', blockingErrors: 1 };
  assert.equal(canPublish(state), false);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:assessment -- tests/assessment/flow.test.mjs`
Expected: FAIL.

**Step 3: Write minimal implementation**

Implement flow reducer/helpers first, then wire UI panels. Remove legacy unreachable `CREATE` path and merge `MIGRATE` into Import sources.

**Step 4: Run test to verify it passes**

Run: `npm run test:assessment -- tests/assessment/flow.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/Phase1.jsx src/components/phase1 tests/assessment/flow.test.mjs
git commit -m "feat: rebuild phase1 assessment center into unified pipeline"
```

---

### Task 7: Publish Integration With Single Module Export

**Files:**
- Modify: `src/components/Phase4.jsx`
- Modify: `src/utils/generators.js`
- Create: `tests/assessment/publish.test.mjs`

**Step 1: Write the failing test**

```js
test('single module export includes assessments explicitly selected for that export', () => {
  const html = buildSingleModuleExportFixture(/* selected assessments */);
  assert.equal(html.includes('Assessment A'), true);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:assessment -- tests/assessment/publish.test.mjs`
Expected: FAIL.

**Step 3: Write minimal implementation**

Use selected assessment/material/tool arrays in `generateModulePageHTML` and pass explicit include lists to frame generation.

**Step 4: Run test to verify it passes**

Run: `npm run test:assessment -- tests/assessment/publish.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/Phase4.jsx src/utils/generators.js tests/assessment/publish.test.mjs
git commit -m "feat: wire assessment publish targets into single-module export"
```

---

### Task 8: Final QA, Migration, And Cleanup

**Files:**
- Modify: `src/utils/migrations.js`
- Create: `docs/plans/2026-03-05-assignment-center-rebuild-qa.md`
- Modify: `src/components/Phase1.jsx` (final cleanup)

**Step 1: Write the failing test**

```js
test('legacy assessment records migrate to canonical schema with placements', () => {
  const migrated = migrateProjectData(legacyFixture);
  assert.equal(Array.isArray(migrated['Current Course'].modules), true);
  assert.equal(Boolean(findAssessment(migrated).placements), true);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:assessment -- tests/assessment/migration.test.mjs`
Expected: FAIL.

**Step 3: Write minimal implementation**

Add migration transform for existing assessment records and default placements. Add QA checklist doc for side-by-side verification (`5181` vs `5180`).

**Step 4: Run full verification**

Run:
- `npm run test:assessment`
- `npm run lint`
- `npm run build`

Expected: all PASS.

**Step 5: Commit**

```bash
git add src/utils/migrations.js src/components/Phase1.jsx docs/plans/2026-03-05-assignment-center-rebuild-qa.md tests/assessment
git commit -m "chore: migrate legacy assessments and finalize assignment center rebuild"
```

---

## Manual QA Matrix (Required)

1. Import text MC + LA mix -> validate warnings -> publish.
2. Import AI JSON with malformed `correct` -> verify clamp + warning.
3. Compose assessment manually -> add to bank -> publish to Hub only.
4. Publish assessment to one module only -> verify module export includes it.
5. Duplicate/edit/delete/reorder in bank -> verify order remains stable.
6. Title with quotes/apostrophes -> verify print/report still works.
7. Legacy project load -> verify migration keeps existing assessments visible/editable.

---

## Rollout Notes

1. Keep feature flag during first pass: `assessmentCenterV2` local constant in `Phase1.jsx`.
2. Ship V2 side-by-side for one cycle; remove V1 after QA signoff.
3. Do not delete legacy fields until migration test is green and manual QA passes.
