# Assessment Question Types Expansion Design

**Date:** 2026-03-05

**Goal:** Expand the Assessment Center beyond multiple choice and long answer so Phase 1 can support `true-false`, `short-answer`, `multi-select`, and `matching` while preserving compatibility with existing assessments and the current import -> review -> compose -> publish workflow.

## Scope

Included in this design:
- First-class support for six question types in the assessment domain:
  - `multiple-choice`
  - `long-answer`
  - `true-false`
  - `short-answer`
  - `multi-select`
  - `matching`
- Canonical schema updates
- Review/edit UI updates
- Compiler and renderer updates
- Import heuristics for the new types
- Auto-grading where it is defensible
- Legacy normalization for existing stored assessments

Excluded from this pass:
- `fill-in-the-blank`
- `ordering`
- `numeric-response`
- Drag-and-drop matching interactions
- OCR-specific import logic
- Rubric scoring or complex LMS-style grading workflows

## Current Constraints

The current implementation is built around only two types:
- `multiple-choice`
- `long-answer`

That assumption exists in:
- `src/assessment/schema.js`
- `src/assessment/import/parseTextImport.js`
- `src/assessment/compiler/renderAssessment.js`
- `src/components/Phase1.jsx`

Because the type model is embedded in schema, import, edit UI, and compiler output, this feature cannot be implemented safely as a cosmetic patch. The system needs a typed question model that can normalize both legacy data and new richer question structures.

## Recommended Architecture

Use a typed, canonical question model in `src/assessment/` and make all UI and output logic branch on `question.type`.

This avoids the current pattern where the existence of `options` determines behavior. That shortcut works for two types but does not scale to `multi-select` or `matching`.

The import path should remain conservative:
- infer type when structure is clear
- keep a confidence score
- let Review act as the correction step when import is uncertain

The renderer should auto-grade where possible, but publish should not depend on auto-grading availability.

## Canonical Schema

All questions should normalize into a shared base:

```js
{
  id: 'q-1',
  order: 0,
  type: 'multiple-choice',
  prompt: 'Question text',
  points: 1,
  meta: {},
}
```

Type-specific payloads:

### Multiple Choice

```js
{
  type: 'multiple-choice',
  prompt,
  choices: ['A', 'B', 'C', 'D'],
  correctIndex: 1,
}
```

### True / False

```js
{
  type: 'true-false',
  prompt,
  choices: ['True', 'False'],
  correctIndex: 0,
}
```

### Multi-Select

```js
{
  type: 'multi-select',
  prompt,
  choices: ['A', 'B', 'C', 'D'],
  correctIndices: [0, 2],
}
```

### Short Answer

```js
{
  type: 'short-answer',
  prompt,
  acceptedAnswers: ['mitochondria', 'the mitochondria'],
  caseSensitive: false,
}
```

### Long Answer

```js
{
  type: 'long-answer',
  prompt,
  rubric: '',
}
```

### Matching

```js
{
  type: 'matching',
  prompt,
  pairs: [
    { left: 'Term 1', right: 'Definition 1' },
    { left: 'Term 2', right: 'Definition 2' },
  ],
  shuffleRightSide: true,
}
```

## Grading Rules

### Multiple Choice
- exact match
- full credit or zero

### True / False
- exact match
- full credit or zero

### Multi-Select
- positive-only scoring
- score = correct selections made / total correct selections
- wrong extra selections do not subtract
- score is capped at full credit

### Matching
- partial credit by pair
- score = correct pairs / total pairs
- no extra penalty in v1

### Short Answer
- optional exact/alias matching against accepted answers
- case-insensitive by default
- still treated as reviewable/manual-first for workflow trust

### Long Answer
- no auto-grade
- manual review only

## Legacy Compatibility

Existing assessments must continue to normalize correctly.

Legacy records with:
- `question`
- `options`
- `correct`

should normalize automatically into the new canonical structure:
- `options + correct` -> `multiple-choice`
- no real options -> `long-answer`

This compatibility layer belongs in the assessment normalization code, not scattered throughout the UI.

## Import Strategy

The import layer should detect the new types only when the structure is obvious.

### True / False
Detect:
- `True/False`
- `T/F`
- explicit answer keys with `True` or `False`

### Multi-Select
Detect:
- phrases like `select all that apply`
- `choose all correct answers`
- answer keys like `A, C` or `1 and 3`

### Short Answer
Detect:
- no choices
- short answer key markers like `Answer:` or `Accept:`

### Matching
Detect:
- `Match the following`
- repeated left/right rows
- table-like or column-like structures in extracted text

### Fallback Rules
- do not guess aggressively when structure is weak
- assign low confidence if a complex type is only partially recognized
- route uncertain questions into Review for correction

## Review And Editing UX

Review should become the trust layer for imported questions.

Every question should expose:
- type selector
- confidence level
- parser issues
- type-specific editor fields

### Type-Specific Review Editors

#### True / False
- prompt
- correct true/false toggle

#### Multi-Select
- prompt
- choice list
- checkboxes for correct choices

#### Short Answer
- prompt
- accepted answers list
- case sensitivity toggle

#### Matching
- row editor with `left | right`
- add row
- remove row
- reorder rows
- shuffle-right-side toggle

### Quick Fix Actions
- convert to long answer
- convert to short answer
- convert to multi-select
- convert to matching
- add accepted answer
- add choice
- add matching row

## Renderer And Generated Output

### Multiple Choice
- keep current radio-button rendering

### True / False
- render as two-option radio question

### Multi-Select
- render as checkbox group
- include selected answers in print/report output

### Short Answer
- render as compact text input or short textarea
- store response like other typed responses

### Long Answer
- keep current textarea and backup behavior

### Matching
- render as row-based matching using dropdowns
- no drag-and-drop in v1
- submission report should show the selected match per row

## Compiler Requirements

Generated assessment payloads should carry typed question data so output is deterministic and report generation can evaluate responses consistently.

The compiler and generated script need to understand:
- radio responses
- checkbox responses
- short text input responses
- long text responses
- dropdown responses for matching

Print/submission output should summarize all response types coherently without requiring the user to understand the underlying schema.

## Testing Strategy

### Domain Tests
- normalize all six question types
- preserve legacy compatibility
- validate type-specific required fields

### Grading Tests
- multiple-choice exact grading
- true/false exact grading
- multi-select positive-only scoring
- matching partial credit scoring

### Import Tests
- detect obvious true/false
- detect obvious multi-select
- detect obvious short-answer
- detect obvious matching
- degrade confidence instead of guessing when structure is weak

### Compiler Tests
- render radios for MC and true/false
- render checkboxes for multi-select
- render text inputs/textareas for short and long answer
- render dropdown rows for matching

### UI QA
- create each type manually in Review
- import each obvious type from text/docx/pdf
- edit imported type and publish successfully
- open legacy assessments and confirm behavior remains stable

## Rollout Sequence

1. Upgrade the assessment domain model and normalization.
2. Update Review and Edit Question UI to support typed questions.
3. Update compiler and generated runtime for new response controls and grading.
4. Add import heuristics for the new types.
5. Run legacy compatibility QA and regression checks.

## Recommendation

Implement this in layered commits:
1. schema and normalization
2. review/edit UI
3. compiler/runtime output
4. import heuristics
5. final QA and cleanup

This keeps the branch reviewable and reduces the risk of breaking legacy assessments while the type system is expanding.
