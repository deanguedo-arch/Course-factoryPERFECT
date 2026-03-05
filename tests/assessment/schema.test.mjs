import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAssessment, validateAssessment } from '../../src/assessment/index.js';

test('normalizes mixed questions and clamps invalid correct index', () => {
  const out = normalizeAssessment({
    title: 'Sample',
    questions: [
      { type: 'multiple-choice', question: 'Q1', options: ['A', 'B'], correct: 9 },
      { question: 'Q2', options: [] }
    ]
  });

  assert.equal(out.questions.length, 2);
  assert.equal(out.questions[0].type, 'multiple-choice');
  assert.equal(out.questions[0].correct, 0);
  assert.equal(out.questions[1].type, 'long-answer');
});

test('validateAssessment flags missing title and empty questions', () => {
  const report = validateAssessment({ title: '', questions: [] });
  assert.equal(Array.isArray(report.errors), true);
  assert.equal(report.errors.length > 0, true);
});
