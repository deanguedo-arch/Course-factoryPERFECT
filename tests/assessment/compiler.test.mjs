import test from 'node:test';
import assert from 'node:assert/strict';
import { renderAssessment } from '../../src/assessment/index.js';

test('escapes unsafe title characters in generated print script', () => {
  const out = renderAssessment({
    title: "Dean's Quiz",
    type: 'quiz',
    questions: [{ question: 'Q1', options: ['One', 'Two'], correct: 0 }],
  });

  assert.equal(typeof out.script, 'string');
  assert.equal(out.script.includes("Dean's Quiz"), false);
  assert.equal(out.script.includes("Dean\\'s Quiz"), true);
});

test('generates deterministic id when seed is provided', () => {
  const one = renderAssessment({
    title: 'Seeded',
    type: 'quiz',
    questions: [{ question: 'Q1', options: ['One', 'Two'], correct: 0 }],
  }, { idSeed: 42 });
  const two = renderAssessment({
    title: 'Seeded',
    type: 'quiz',
    questions: [{ question: 'Q1', options: ['One', 'Two'], correct: 0 }],
  }, { idSeed: 42 });

  assert.equal(one.id, two.id);
});
