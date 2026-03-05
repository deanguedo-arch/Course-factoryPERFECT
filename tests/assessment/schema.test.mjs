import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAssessment, validateAssessment } from '../../src/assessment/index.js';

test('normalizes mixed questions and clamps invalid correct index', () => {
  const out = normalizeAssessment({
    title: 'Sample',
    questions: [
      { type: 'multiple-choice', question: 'Q1', options: ['A', 'B'], correct: 9 },
      { question: 'Q2', options: [] },
    ],
  });

  assert.equal(out.questions.length, 2);
  assert.equal(out.questions[0].type, 'multiple-choice');
  assert.equal(out.questions[0].correct, 0);
  assert.equal(out.questions[1].type, 'long-answer');
});

test('normalizes true-false questions into typed prompt and choice fields', () => {
  const out = normalizeAssessment({
    title: 'Typed',
    questions: [
      { type: 'true-false', prompt: 'The sky is blue.', correctIndex: 1 },
    ],
  });

  assert.equal(out.questions[0].type, 'true-false');
  assert.equal(out.questions[0].prompt, 'The sky is blue.');
  assert.deepEqual(out.questions[0].choices, ['True', 'False']);
  assert.equal(out.questions[0].correctIndex, 1);
});

test('normalizes short-answer accepted answers and preserves case sensitivity flag', () => {
  const out = normalizeAssessment({
    title: 'Typed',
    questions: [
      {
        type: 'short-answer',
        prompt: 'Name one gas giant.',
        acceptedAnswers: ['jupiter', 'saturn'],
        caseSensitive: true,
      },
    ],
  });

  assert.equal(out.questions[0].type, 'short-answer');
  assert.deepEqual(out.questions[0].acceptedAnswers, ['jupiter', 'saturn']);
  assert.equal(out.questions[0].caseSensitive, true);
});

test('normalizes multi-select and matching question payloads', () => {
  const out = normalizeAssessment({
    title: 'Typed',
    questions: [
      {
        type: 'multi-select',
        prompt: 'Select all primary colors.',
        choices: ['Red', 'Green', 'Blue'],
        correctIndices: [0, 2],
      },
      {
        type: 'matching',
        prompt: 'Match the term to the definition.',
        pairs: [
          { left: 'Atom', right: 'Smallest unit of matter' },
          { left: 'Cell', right: 'Smallest unit of life' },
        ],
      },
    ],
  });

  assert.equal(out.questions[0].type, 'multi-select');
  assert.deepEqual(out.questions[0].choices, ['Red', 'Green', 'Blue']);
  assert.deepEqual(out.questions[0].correctIndices, [0, 2]);
  assert.equal(out.questions[1].type, 'matching');
  assert.deepEqual(out.questions[1].pairs, [
    { left: 'Atom', right: 'Smallest unit of matter' },
    { left: 'Cell', right: 'Smallest unit of life' },
  ]);
});

test('normalizes legacy options and correct fields into typed multiple-choice shape', () => {
  const out = normalizeAssessment({
    title: 'Legacy',
    questions: [
      { question: 'Legacy MC', options: ['A', 'B'], correct: 1 },
    ],
  });

  assert.equal(out.questions[0].type, 'multiple-choice');
  assert.equal(out.questions[0].prompt, 'Legacy MC');
  assert.deepEqual(out.questions[0].choices, ['A', 'B']);
  assert.equal(out.questions[0].correctIndex, 1);
});

test('validateAssessment flags missing title and empty questions', () => {
  const report = validateAssessment({ title: '', questions: [] });
  assert.equal(Array.isArray(report.errors), true);
  assert.equal(report.errors.length > 0, true);
});
