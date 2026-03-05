import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAssessment } from '../../src/assessment/index.js';

test('assessment domain is wired', () => {
  assert.equal(typeof normalizeAssessment, 'function');
});
