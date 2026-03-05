import test from 'node:test';
import assert from 'node:assert/strict';
import { canParseExtractedImport, canPublish } from '../../src/assessment/index.js';

test('cannot publish when validation has blocking errors', () => {
  const state = { step: 'publish', blockingErrors: 1, hasGeneratedAssessment: true };
  assert.equal(canPublish(state), false);
});

test('can publish only on publish step with zero blocking errors and generated assessment', () => {
  assert.equal(canPublish({ step: 'review', blockingErrors: 0, hasGeneratedAssessment: true }), false);
  assert.equal(canPublish({ step: 'publish', blockingErrors: 0, hasGeneratedAssessment: false }), false);
  assert.equal(canPublish({ step: 'publish', blockingErrors: 0, hasGeneratedAssessment: true }), true);
});

test('cannot parse extracted text while extraction is pending', () => {
  assert.equal(canParseExtractedImport({ extractionStatus: 'extracting', extractedText: 'Question 1' }), false);
});

test('can parse extracted text only when extraction is ready and text is present', () => {
  assert.equal(canParseExtractedImport({ extractionStatus: 'ready', extractedText: '' }), false);
  assert.equal(canParseExtractedImport({ extractionStatus: 'ready', extractedText: 'Question 1' }), true);
});
