import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extractDocxText } from '../../src/assessment/import/extractDocxText.js';

test('extractDocxText returns normalized text for a representative docx fixture', async () => {
  const fixture = new URL('../../public/materials/CALM/CALM Module 1 - Personal Choices.docx', import.meta.url);
  const buffer = await readFile(fixture);

  const result = await extractDocxText(buffer);

  assert.equal(typeof result.text, 'string');
  assert.ok(result.text.length > 100);
  assert.match(result.text, /\S/);
  assert.ok(Array.isArray(result.warnings));
});
