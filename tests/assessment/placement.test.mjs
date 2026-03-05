import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePlacements } from '../../src/assessment/index.js';

test('normalizes placement targets and deduplicates same target', () => {
  const placements = normalizePlacements([
    { targetType: 'hub' },
    { targetType: 'module', moduleId: 'view-1' },
    { targetType: 'module', moduleId: 'view-1' }
  ]);

  assert.equal(placements.length, 2);
  assert.deepEqual(placements[0], { targetType: 'hub' });
  assert.deepEqual(placements[1], { targetType: 'module', moduleId: 'view-1' });
});
