# In-House Assessment Import Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add direct local `docx` and text-PDF upload to Phase 1 Assessment Import so extracted text can be reviewed and parsed in-house without relying on external AI for the normal path.

**Architecture:** Build a thin extraction layer in `src/assessment/import/` that turns uploaded files into raw text, then feed that text into the existing `parseAssessmentImport` pipeline already used by Smart Import. Keep file handling temporary and keep `Migrate` as a visible fallback for weak/scanned PDFs.

**Tech Stack:** React 19, Vite, plain JS modules, browser file APIs, Node built-in test runner (`node --test`), ESLint.

---

### Task 1: Add Browser Extraction Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Write the failing test**

Add an import smoke test that attempts to import the planned extraction modules and expects them to export functions.

**Step 2: Run test to verify it fails**

Run: `npm run test:assessment`
Expected: FAIL with missing module/export error.

**Step 3: Write minimal implementation**

Add the browser extraction dependencies needed for:
- `docx` raw text extraction
- text-based `pdf` extraction

**Step 4: Run test to verify it passes**

Run: `npm run test:assessment`
Expected: PASS for module wiring.

**Step 5: Commit**

```bash
git add package.json
git commit -m "build: add local document extraction dependencies"
```

---

### Task 2: Add DOCX Text Extraction Helper

**Files:**
- Create: `src/assessment/import/extractDocxText.js`
- Create: `tests/assessment/extractDocx.test.mjs`

**Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { extractDocxText } from '../../src/assessment/import/extractDocxText.js';

test('extractDocxText is exported', () => {
  assert.equal(typeof extractDocxText, 'function');
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:assessment -- tests/assessment/extractDocx.test.mjs`
Expected: FAIL because the helper does not exist.

**Step 3: Write minimal implementation**

Implement:
- `extractDocxText(fileOrBuffer)` returning `{ text, warnings }`
- trim and normalize whitespace/newlines
- throw a clear error on unsupported input

**Step 4: Run test to verify it passes**

Run: `npm run test:assessment -- tests/assessment/extractDocx.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/assessment/import/extractDocxText.js tests/assessment/extractDocx.test.mjs
git commit -m "feat: add local docx text extraction"
```

---

### Task 3: Add PDF Text Extraction + Weak-PDF Detection

**Files:**
- Create: `src/assessment/import/extractPdfText.js`
- Create: `src/assessment/import/detectScannedPdf.js`
- Create: `tests/assessment/extractPdf.test.mjs`

**Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { detectScannedPdf } from '../../src/assessment/import/detectScannedPdf.js';

test('detectScannedPdf flags empty extraction as weak', () => {
  assert.equal(detectScannedPdf({ text: '', pageCount: 2 }).isLikelyScanned, true);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:assessment -- tests/assessment/extractPdf.test.mjs`
Expected: FAIL because helpers do not exist.

**Step 3: Write minimal implementation**

Implement:
- `extractPdfText(fileOrBuffer)` returning `{ text, pageCount, warnings }`
- `detectScannedPdf({ text, pageCount })` returning `{ isLikelyScanned, reason }`
- heuristics based on extremely low extracted text relative to page count

**Step 4: Run test to verify it passes**

Run: `npm run test:assessment -- tests/assessment/extractPdf.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/assessment/import/extractPdfText.js src/assessment/import/detectScannedPdf.js tests/assessment/extractPdf.test.mjs
git commit -m "feat: add local pdf extraction with weak-scan detection"
```

---

### Task 4: Export Extraction Helpers From Assessment Import Domain

**Files:**
- Modify: `src/assessment/import/index.js`
- Modify: `src/assessment/index.js`
- Create: `tests/assessment/importDomain.test.mjs`

**Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { extractDocxText, extractPdfText } from '../../src/assessment/index.js';

test('assessment domain exports extraction helpers', () => {
  assert.equal(typeof extractDocxText, 'function');
  assert.equal(typeof extractPdfText, 'function');
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:assessment -- tests/assessment/importDomain.test.mjs`
Expected: FAIL with missing exports.

**Step 3: Write minimal implementation**

Export:
- `extractDocxText`
- `extractPdfText`
- `detectScannedPdf`

**Step 4: Run test to verify it passes**

Run: `npm run test:assessment -- tests/assessment/importDomain.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/assessment/import/index.js src/assessment/index.js tests/assessment/importDomain.test.mjs
git commit -m "refactor: expose document extraction from assessment domain"
```

---

### Task 5: Add Upload + Intermediate Extraction Screen To Phase 1

**Files:**
- Modify: `src/components/Phase1.jsx`

**Step 1: Write the failing test**

Add a small pure helper test first for upload-state gating, for example:

```js
test('cannot parse extracted text while extraction is pending', () => {
  assert.equal(canParseExtractedImport({ extractionStatus: 'extracting', extractedText: 'Q1' }), false);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:assessment -- tests/assessment/uploadFlow.test.mjs`
Expected: FAIL.

**Step 3: Write minimal implementation**

Implement:
- upload intake UI inside Import
- temporary extraction state
- file picker for `.docx,.pdf`
- intermediate extracted-text editor
- `Parse Into Review` button
- scanned/weak PDF warning
- keep `Paste` and `Migrate` intact

**Step 4: Run test to verify it passes**

Run: `npm run test:assessment -- tests/assessment/uploadFlow.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/Phase1.jsx tests/assessment/uploadFlow.test.mjs
git commit -m "feat: add local upload extraction flow to phase1 import"
```

---

### Task 6: Feed Extracted Text Into Existing Review Pipeline

**Files:**
- Modify: `src/components/Phase1.jsx`
- Modify: `tests/assessment/flow.test.mjs`

**Step 1: Write the failing test**

Add a test that upload-derived text can transition into Review and still respect publish gating.

**Step 2: Run test to verify it fails**

Run: `npm run test:assessment -- tests/assessment/flow.test.mjs`
Expected: FAIL.

**Step 3: Write minimal implementation**

Implement:
- parse extracted text via `parseAssessmentImport`
- populate review/master question state from parsed output
- preserve parser issues and confidence data in Import/Review

**Step 4: Run test to verify it passes**

Run: `npm run test:assessment -- tests/assessment/flow.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/Phase1.jsx tests/assessment/flow.test.mjs
git commit -m "feat: route extracted upload text into review flow"
```

---

### Task 7: Final Verification And Cleanup

**Files:**
- Modify: `src/components/Phase1.jsx` (cleanup only)
- Update docs if needed

**Step 1: Run full verification**

Run:
- `npm run test:assessment`
- `npx eslint src/components/Phase1.jsx src/assessment`
- `npm run build`

Expected: all PASS.

**Step 2: Manual QA**

Verify:
- upload `.docx` -> extracted text visible
- upload text-based `.pdf` -> extracted text visible
- weak/scanned-like PDF -> warning visible
- edit extracted text -> parse into Review
- continue `Compose -> Publish -> Manage`
- Migrate fallback still accessible

**Step 3: Commit**

```bash
git add src/components/Phase1.jsx src/assessment docs/plans
git commit -m "feat: complete in-house assessment document import flow"
```

---

## Manual QA Notes

Use sample files that represent:
- clean `.docx` test/quiz
- clean text-based `.pdf`
- low-text or scanned-like `.pdf`

Expected outcomes:
- no file persistence in project data
- extraction stays temporary
- user can edit extracted text before parsing
- normal path no longer depends on external AI
