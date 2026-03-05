import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAssessmentImport } from '../../src/assessment/index.js';

test('parses numbered MC + answer key text into canonical questions', () => {
  const raw = '1. What?\na. One\nb. Two\nAnswer: B';
  const out = parseAssessmentImport({ kind: 'text', content: raw });

  assert.equal(out.questions.length, 1);
  assert.equal(out.questions[0].type, 'multiple-choice');
  assert.equal(out.questions[0].correct, 1);
  assert.equal(Array.isArray(out.issues), true);
  assert.equal(typeof out.questions[0].confidence, 'number');
});

test('parses JSON input with data.questions shape', () => {
  const out = parseAssessmentImport({
    kind: 'json',
    content: JSON.stringify({ data: [{ question: 'Q', options: ['A', 'B'], correct: 0 }] })
  });
  assert.equal(out.questions.length, 1);
  assert.equal(out.questions[0].question, 'Q');
});

test('parses true-false text when answer key is explicit', () => {
  const raw = '1. The Pacific Ocean is larger than the Atlantic Ocean.\nAnswer: True';
  const out = parseAssessmentImport({ kind: 'text', content: raw });

  assert.equal(out.questions.length, 1);
  assert.equal(out.questions[0].type, 'true-false');
  assert.deepEqual(out.questions[0].choices, ['True', 'False']);
  assert.equal(out.questions[0].correctIndex, 0);
});

test('parses multi-select text when prompt and answer key indicate multiple answers', () => {
  const raw = [
    '1. Select all that apply: Which animals are mammals?',
    'a. Whale',
    'b. Eagle',
    'c. Dog',
    'd. Trout',
    'Answer: A, C',
  ].join('\n');
  const out = parseAssessmentImport({ kind: 'text', content: raw });

  assert.equal(out.questions.length, 1);
  assert.equal(out.questions[0].type, 'multi-select');
  assert.deepEqual(out.questions[0].correctIndices, [0, 2]);
});

test('parses short-answer text with accepted answers', () => {
  const raw = [
    '1. Name one gas giant in our solar system.',
    'Accept: Jupiter; Saturn',
  ].join('\n');
  const out = parseAssessmentImport({ kind: 'text', content: raw });

  assert.equal(out.questions.length, 1);
  assert.equal(out.questions[0].type, 'short-answer');
  assert.deepEqual(out.questions[0].acceptedAnswers, ['Jupiter', 'Saturn']);
});

test('parses matching text when pair rows are explicit', () => {
  const raw = [
    '1. Match the terms to their definitions.',
    'A. Atom - Smallest unit of matter',
    'B. Cell - Smallest unit of life',
  ].join('\n');
  const out = parseAssessmentImport({ kind: 'text', content: raw });

  assert.equal(out.questions.length, 1);
  assert.equal(out.questions[0].type, 'matching');
  assert.deepEqual(out.questions[0].pairs, [
    { left: 'Atom', right: 'Smallest unit of matter' },
    { left: 'Cell', right: 'Smallest unit of life' },
  ]);
});
