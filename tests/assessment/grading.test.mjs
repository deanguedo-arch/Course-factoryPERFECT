import test from 'node:test';
import assert from 'node:assert/strict';
import { gradeAssessment, gradeQuestion } from '../../src/assessment/index.js';

test('gradeQuestion scores multiple-choice by exact selected index', () => {
  const result = gradeQuestion({
    type: 'multiple-choice',
    prompt: 'Pick one',
    choices: ['A', 'B', 'C'],
    correctIndex: 1,
  }, {
    selectedIndex: 1,
  });

  assert.equal(result.isManual, false);
  assert.equal(result.earned, 1);
  assert.equal(result.possible, 1);
});

test('gradeQuestion scores true-false by exact selected index', () => {
  const result = gradeQuestion({
    type: 'true-false',
    prompt: 'The sky is blue.',
    correctIndex: 0,
  }, {
    selectedIndex: 1,
  });

  assert.equal(result.isManual, false);
  assert.equal(result.earned, 0);
  assert.equal(result.possible, 1);
});

test('gradeQuestion gives positive-only partial credit for multi-select', () => {
  const result = gradeQuestion({
    type: 'multi-select',
    prompt: 'Select all that apply',
    choices: ['Red', 'Blue', 'Green'],
    correctIndices: [0, 2],
  }, {
    selectedIndices: [0, 1],
  });

  assert.equal(result.isManual, false);
  assert.equal(result.earned, 0.5);
  assert.equal(result.possible, 1);
});

test('gradeQuestion gives partial credit for matching by correct pairs', () => {
  const result = gradeQuestion({
    type: 'matching',
    prompt: 'Match the terms',
    pairs: [
      { left: 'A', right: '1' },
      { left: 'B', right: '2' },
    ],
  }, {
    matches: [0, 0],
  });

  assert.equal(result.isManual, false);
  assert.equal(result.earned, 0.5);
  assert.equal(result.possible, 1);
});

test('gradeQuestion leaves short-answer as manual in v1', () => {
  const result = gradeQuestion({
    type: 'short-answer',
    prompt: 'Name one gas giant.',
    acceptedAnswers: ['jupiter', 'saturn'],
  }, {
    value: 'Jupiter',
  });

  assert.equal(result.isManual, true);
  assert.equal(result.earned, null);
  assert.equal(result.possible, 1);
});

test('gradeAssessment summarizes auto-graded and manual questions', () => {
  const result = gradeAssessment([
    {
      type: 'multiple-choice',
      prompt: 'Pick one',
      choices: ['A', 'B'],
      correctIndex: 1,
      points: 2,
    },
    {
      type: 'matching',
      prompt: 'Match',
      pairs: [
        { left: 'A', right: '1' },
        { left: 'B', right: '2' },
      ],
      points: 4,
    },
    {
      type: 'long-answer',
      prompt: 'Explain why.',
      points: 3,
    },
  ], [
    { selectedIndex: 1 },
    { matches: [0, 0] },
    { value: 'Because...' },
  ]);

  assert.equal(result.autoGradedCount, 2);
  assert.equal(result.manualCount, 1);
  assert.equal(result.earnedPoints, 4);
  assert.equal(result.possiblePoints, 6);
});
