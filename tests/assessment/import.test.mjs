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
