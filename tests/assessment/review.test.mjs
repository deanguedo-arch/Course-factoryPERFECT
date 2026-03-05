import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getQuestionDraftBlockingErrors,
  getQuestionDraftSummaryLines,
  getQuestionTypeMeta,
} from '../../src/assessment/index.js';

test('getQuestionTypeMeta returns stable labels for typed questions', () => {
  assert.deepEqual(getQuestionTypeMeta('matching'), {
    label: 'Matching',
    shortLabel: 'Match',
    tone: 'amber',
  });
});

test('getQuestionDraftBlockingErrors enforces multi-select answer selection', () => {
  const errors = getQuestionDraftBlockingErrors({
    type: 'multi-select',
    question: 'Select all prime numbers.',
    options: ['2', '3', '4', '5'],
    correctIndices: [],
  });

  assert.deepEqual(errors, ['Select at least one correct answer.']);
});

test('getQuestionDraftBlockingErrors requires complete matching pairs', () => {
  const errors = getQuestionDraftBlockingErrors({
    type: 'matching',
    question: 'Match the terms.',
    pairs: [
      { left: 'Atom', right: 'Smallest unit of matter' },
      { left: 'Cell', right: '' },
    ],
  });

  assert.deepEqual(errors, ['Complete every matching pair.']);
});

test('getQuestionDraftSummaryLines summarizes short-answer aliases', () => {
  const summary = getQuestionDraftSummaryLines({
    type: 'short-answer',
    question: 'Name one gas giant.',
    acceptedAnswers: ['Jupiter', 'Saturn', 'Neptune'],
  });

  assert.deepEqual(summary, ['Accepted: Jupiter, Saturn +1 more']);
});
