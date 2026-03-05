import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractDocxText,
  extractPdfText,
  normalizeAssessment,
  normalizeQuestionType,
  QUESTION_TYPE_OPTIONS,
} from '../../src/assessment/index.js';

test('assessment domain is wired', () => {
  assert.equal(typeof normalizeAssessment, 'function');
  assert.equal(typeof extractDocxText, 'function');
  assert.equal(typeof extractPdfText, 'function');
  assert.equal(typeof normalizeQuestionType, 'function');
  assert.equal(Array.isArray(QUESTION_TYPE_OPTIONS), true);
});
