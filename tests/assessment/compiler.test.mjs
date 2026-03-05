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

test('renders true-false questions as radio choices in mixed mode', () => {
  const out = renderAssessment({
    title: 'True False',
    type: 'mixed',
    questions: [{
      type: 'true-false',
      prompt: 'The sky is blue.',
      correctIndex: 0,
    }],
  }, { idSeed: 5 });

  assert.match(out.html, /type="radio"/);
  assert.match(out.html, />True</);
  assert.match(out.html, />False</);
});

test('renders multi-select questions as checkbox inputs', () => {
  const out = renderAssessment({
    title: 'Multi Select',
    type: 'mixed',
    questions: [{
      type: 'multi-select',
      prompt: 'Select all that apply.',
      choices: ['Red', 'Blue', 'Green'],
      correctIndices: [0, 2],
    }],
  }, { idSeed: 6 });

  assert.match(out.html, /type="checkbox"/);
});

test('renders short-answer questions as compact text inputs', () => {
  const out = renderAssessment({
    title: 'Short Answer',
    type: 'mixed',
    questions: [{
      type: 'short-answer',
      prompt: 'Name one gas giant.',
      acceptedAnswers: ['jupiter', 'saturn'],
    }],
  }, { idSeed: 7 });

  assert.match(out.html, /placeholder="Enter a short answer\.\.\."/);
  assert.doesNotMatch(out.html, /<textarea/);
});

test('renders matching questions as select controls', () => {
  const out = renderAssessment({
    title: 'Matching',
    type: 'mixed',
    questions: [{
      type: 'matching',
      prompt: 'Match the terms.',
      pairs: [
        { left: 'Atom', right: 'Smallest unit of matter' },
        { left: 'Cell', right: 'Smallest unit of life' },
      ],
    }],
  }, { idSeed: 8 });

  assert.match(out.html, /<select/);
  assert.match(out.html, /Atom/);
  assert.match(out.html, /Smallest unit of life/);
});
