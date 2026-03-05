# Assessment Question Types Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add first-class support for `true-false`, `short-answer`, `multi-select`, and `matching` to the Assessment Center while preserving existing `multiple-choice` and `long-answer` behavior and legacy assessment compatibility.

**Architecture:** Move the assessment domain from an implicit two-type model to a typed canonical schema in `src/assessment/`. Add a small grading module, extend the compiler/runtime to render and report the new response controls, and make Phase 1 Review/Edit operate on typed question drafts instead of assuming `options + correct` everywhere. Keep import conservative: detect obvious structures, assign confidence, and rely on Review for correction when parsing is uncertain.

**Tech Stack:** React 19, Vite, plain JS modules, `node --test`, ESLint, existing `src/assessment/*` domain modules, existing `Phase1.jsx` orchestration UI.

---

### Task 1: Add Typed Question Metadata And Canonical Normalization

**Files:**
- Create: `src/assessment/questionTypes.js`
- Modify: `src/assessment/schema.js`
- Modify: `src/assessment/index.js`
- Modify: `tests/assessment/schema.test.mjs`
- Modify: `tests/assessment/smoke.test.mjs`

**Step 1: Write the failing test**

Add schema tests that assert normalization for:
- `true-false`
- `short-answer`
- `multi-select`
- `matching`
- legacy `options + correct` records

```js
test('normalizeQuestion supports matching payloads', () => {
  const out = normalizeQuestion({
    type: 'matching',
    prompt: 'Match the terms',
    pairs: [
      { left: 'A', right: '1' },
      { left: 'B', right: '2' },
    ],
  }, 0);

  assert.equal(out.type, 'matching');
  assert.deepEqual(out.pairs, [
    { left: 'A', right: '1' },
    { left: 'B', right: '2' },
  ]);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/assessment/schema.test.mjs tests/assessment/smoke.test.mjs`

Expected:
- FAIL because the schema only understands `multiple-choice` and `long-answer`
- FAIL because the new metadata exports do not exist

**Step 3: Write minimal implementation**

Create `src/assessment/questionTypes.js` with:
- `QUESTION_TYPE_OPTIONS`
- `isGradableQuestionType(type)`
- `isAutoGradedQuestionType(type)`
- `normalizeQuestionType(type, fallback)`

Update `src/assessment/schema.js` to:
- normalize all six types
- map legacy `question` -> `prompt`
- preserve legacy compatibility by producing normalized typed payloads
- validate type-specific fields:
  - `multiple-choice` requires `choices.length >= 2`
  - `true-false` constrains to `['True', 'False']`
  - `multi-select` requires `choices.length >= 2` and at least one `correctIndex`
  - `short-answer` accepts `acceptedAnswers`
  - `matching` requires at least 2 non-empty pairs

Update `src/assessment/index.js` to export the new helpers.

**Step 4: Run test to verify it passes**

Run: `node --test tests/assessment/schema.test.mjs tests/assessment/smoke.test.mjs`

Expected: PASS

**Step 5: Commit**

```bash
git add src/assessment/questionTypes.js src/assessment/schema.js src/assessment/index.js tests/assessment/schema.test.mjs tests/assessment/smoke.test.mjs
git commit -m "feat: add typed assessment schema normalization"
```

---

### Task 2: Add Grading Helpers For Auto-Graded Types

**Files:**
- Create: `src/assessment/grading.js`
- Modify: `src/assessment/index.js`
- Create: `tests/assessment/grading.test.mjs`

**Step 1: Write the failing test**

Create tests for:
- MC exact grading
- true/false exact grading
- multi-select positive-only scoring
- matching partial credit

```js
test('gradeQuestion gives partial credit for matching by correct pairs', () => {
  const score = gradeQuestion({
    type: 'matching',
    pairs: [
      { left: 'A', right: '1' },
      { left: 'B', right: '2' },
    ],
  }, {
    matches: [0, 0],
  });

  assert.equal(score.earned, 0.5);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/assessment/grading.test.mjs`

Expected: FAIL with missing module/export error

**Step 3: Write minimal implementation**

Create `src/assessment/grading.js` with:
- `gradeQuestion(question, response)`
- `gradeAssessment(questions, responses)`
- normalization helpers for response shape

Rules:
- MC and true/false: full or zero
- multi-select: `correctSelectionsChosen / totalCorrectSelections`, capped at `1`
- matching: `correctPairs / totalPairs`
- short-answer and long-answer return `isManual: true`

Export these helpers from `src/assessment/index.js`.

**Step 4: Run test to verify it passes**

Run: `node --test tests/assessment/grading.test.mjs`

Expected: PASS

**Step 5: Commit**

```bash
git add src/assessment/grading.js src/assessment/index.js tests/assessment/grading.test.mjs
git commit -m "feat: add grading helpers for typed assessments"
```

---

### Task 3: Extend Compiler And Runtime Rendering For New Controls

**Files:**
- Modify: `src/assessment/compiler/renderAssessment.js`
- Modify: `tests/assessment/compiler.test.mjs`

**Step 1: Write the failing test**

Add compiler tests that assert rendered output contains:
- radio controls for true/false
- checkbox controls for multi-select
- text input or compact textarea for short-answer
- dropdown rows for matching

```js
test('renderAssessment renders checkbox inputs for multi-select questions', () => {
  const out = renderAssessment({
    title: 'Multi',
    type: 'mixed',
    questions: [{
      type: 'multi-select',
      prompt: 'Select all that apply',
      choices: ['A', 'B', 'C'],
      correctIndices: [0, 2],
    }],
  }, { idSeed: 7 });

  assert.match(out.html, /type="checkbox"/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/assessment/compiler.test.mjs`

Expected: FAIL because the renderer only emits radios and textareas

**Step 3: Write minimal implementation**

Refactor `renderAssessment.js` to:
- normalize typed questions using the updated schema
- render per-type blocks:
  - MC -> radios
  - true/false -> radios with fixed labels
  - multi-select -> checkboxes
  - short-answer -> short text input or compact textarea
  - long-answer -> existing textarea
  - matching -> dropdown per left-side prompt
- extend generated report logic to summarize:
  - selected radios
  - selected checkboxes
  - short text answers
  - long text answers
  - matching selections

Do not try to add drag interactions in this task.

**Step 4: Run test to verify it passes**

Run: `node --test tests/assessment/compiler.test.mjs`

Expected: PASS

**Step 5: Commit**

```bash
git add src/assessment/compiler/renderAssessment.js tests/assessment/compiler.test.mjs
git commit -m "feat: render typed assessment question controls"
```

---

### Task 4: Add Conservative Import Heuristics For New Types

**Files:**
- Modify: `src/assessment/import/parseTextImport.js`
- Modify: `src/assessment/import/parseJsonImport.js`
- Modify: `tests/assessment/import.test.mjs`

**Step 1: Write the failing test**

Add import tests for obvious cases:
- true/false with answer key
- multi-select with `select all that apply`
- short-answer with `Accept:` line
- matching with explicit pair rows

```js
test('parses select-all-that-apply text into multi-select', () => {
  const out = parseAssessmentImport({
    kind: 'text',
    content: `
1. Select all that apply.
A. Red
B. Blue
C. Green
Answer: A, C
    `,
  });

  assert.equal(out.questions[0].type, 'multi-select');
  assert.deepEqual(out.questions[0].correctIndices, [0, 2]);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/assessment/import.test.mjs`

Expected: FAIL because new type detection does not exist yet

**Step 3: Write minimal implementation**

Update text import to:
- detect true/false markers
- detect multi-select wording and multi-answer keys
- detect short-answer answer aliases
- detect explicit matching rows when structure is clear

Update JSON import to:
- accept the new canonical question types directly
- still normalize legacy JSON payloads

When detection is weak:
- assign low confidence
- add warning issues instead of guessing aggressively

**Step 4: Run test to verify it passes**

Run: `node --test tests/assessment/import.test.mjs`

Expected: PASS

**Step 5: Commit**

```bash
git add src/assessment/import/parseTextImport.js src/assessment/import/parseJsonImport.js tests/assessment/import.test.mjs
git commit -m "feat: detect typed questions during assessment import"
```

---

### Task 5: Add Typed Question Draft Helpers For Phase 1 Review And Editing

**Files:**
- Create: `src/assessment/questionDrafts.js`
- Modify: `src/assessment/index.js`
- Create: `tests/assessment/questionDrafts.test.mjs`

**Step 1: Write the failing test**

Create tests for:
- creating a default draft per type
- converting an existing question between types
- preserving prompt text while reshaping type-specific fields

```js
test('convertQuestionDraft reshapes multiple-choice into matching rows', () => {
  const out = convertQuestionDraft({
    type: 'multiple-choice',
    prompt: 'Match terms',
    choices: ['A', 'B'],
    correctIndex: 0,
  }, 'matching');

  assert.equal(out.type, 'matching');
  assert.equal(out.prompt, 'Match terms');
  assert.ok(Array.isArray(out.pairs));
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/assessment/questionDrafts.test.mjs`

Expected: FAIL because the helper module does not exist

**Step 3: Write minimal implementation**

Create `src/assessment/questionDrafts.js` with:
- `createEmptyQuestionDraft(type)`
- `convertQuestionDraft(question, nextType)`
- `summarizeQuestionForList(question)`

Export these helpers from `src/assessment/index.js`.

These helpers should absorb most type-conversion logic so `Phase1.jsx` stays thinner.

**Step 4: Run test to verify it passes**

Run: `node --test tests/assessment/questionDrafts.test.mjs`

Expected: PASS

**Step 5: Commit**

```bash
git add src/assessment/questionDrafts.js src/assessment/index.js tests/assessment/questionDrafts.test.mjs
git commit -m "refactor: add typed question draft helpers"
```

---

### Task 6: Integrate Typed Review/Edit UI Into Phase 1

**Files:**
- Modify: `src/components/Phase1.jsx`
- Modify: `tests/assessment/flow.test.mjs`

**Step 1: Write the failing test**

Add small pure flow tests for typed review safety, for example:

```js
test('createAssessmentFlowState still treats typed questions as publishable when generated output exists', () => {
  assert.equal(canPublish({
    step: 'publish',
    blockingErrors: 0,
    hasGeneratedAssessment: true,
  }), true);
});
```

Then add at least one new pure-state test for type conversion gating if needed, instead of trying to test JSX directly.

**Step 2: Run test to verify it fails**

Run: `node --test tests/assessment/flow.test.mjs`

Expected: FAIL only after adding the new helper expectations

**Step 3: Write minimal implementation**

Update `Phase1.jsx` to:
- allow creating these types in Review:
  - true/false
  - short-answer
  - multi-select
  - matching
- use `createEmptyQuestionDraft` for new question creation
- use `convertQuestionDraft` in the edit modal when switching types
- update list badges and summaries in Review/Compose/Manage
- update edit modal fields:
  - true/false toggle
  - multi-select checkboxes
  - short-answer accepted answers list
  - matching row editor

Keep UI structure incremental; do not rewrite unrelated module-manager surfaces in this task.

**Step 4: Run test to verify it passes**

Run: `node --test tests/assessment/flow.test.mjs`

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/Phase1.jsx tests/assessment/flow.test.mjs
git commit -m "feat: add typed review and edit controls to phase1"
```

---

### Task 7: Route Typed Questions Through Compose, Publish, And Legacy Manage Surfaces

**Files:**
- Modify: `src/components/Phase1.jsx`
- Modify: `tests/assessment/compiler.test.mjs`
- Modify: `tests/assessment/schema.test.mjs`

**Step 1: Write the failing test**

Add tests that assert:
- mixed assessments can include the new types
- normalization preserves typed questions from stored snapshots
- compiler output still builds with mixed type arrays

```js
test('renderAssessment handles mixed arrays with matching and short-answer', () => {
  const out = renderAssessment({
    title: 'Mixed',
    type: 'mixed',
    questions: [
      { type: 'matching', prompt: 'Match', pairs: [{ left: 'A', right: '1' }, { left: 'B', right: '2' }] },
      { type: 'short-answer', prompt: 'Name one', acceptedAnswers: ['one'] },
    ],
  }, { idSeed: 9 });

  assert.equal(out.questionCount, 2);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/assessment/compiler.test.mjs tests/assessment/schema.test.mjs`

Expected: FAIL if publish/manage serialization is still dropping fields

**Step 3: Write minimal implementation**

Update `Phase1.jsx` publish path to:
- preserve canonical typed question snapshots
- stop trimming new fields down to legacy `{ question, options, correct }`

Update any manage/reopen logic that assumes only MC vs LA badges.

**Step 4: Run test to verify it passes**

Run: `node --test tests/assessment/compiler.test.mjs tests/assessment/schema.test.mjs`

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/Phase1.jsx tests/assessment/compiler.test.mjs tests/assessment/schema.test.mjs
git commit -m "feat: preserve typed questions through compose and publish"
```

---

### Task 8: Final Regression, Manual QA, And Cleanup

**Files:**
- Modify: `docs/plans/2026-03-05-assessment-question-types-design.md` (only if implementation realities require a small note)
- Modify: `docs/plans/2026-03-05-assessment-question-types-implementation.md` (mark deltas only if needed)

**Step 1: Write the final regression checklist**

Create a short checklist in your working notes and run:
- create each new type manually
- import obvious text examples for each new type
- generate and preview a mixed assessment containing all supported types
- open a legacy assessment and confirm it still renders

**Step 2: Run automated verification**

Run:

```bash
npm run test:assessment
npx eslint src/components/Phase1.jsx src/assessment/**/*.js tests/assessment/*.test.mjs
npm run build
```

Expected:
- all tests PASS
- eslint PASS
- build PASS

**Step 3: Manual QA**

In the rebuild app:
- Review: add/edit `true-false`, `short-answer`, `multi-select`, `matching`
- Compose: generate mixed assessment
- Publish: publish to assessments module
- Manage: preview and confirm responses render correctly
- Import: paste obvious examples and verify confidence/issues

**Step 4: Commit**

```bash
git add src/components/Phase1.jsx src/assessment tests/assessment docs/plans/2026-03-05-assessment-question-types-design.md docs/plans/2026-03-05-assessment-question-types-implementation.md
git commit -m "feat: expand assessment center question types"
```
