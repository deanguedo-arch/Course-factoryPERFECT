import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { configurePdfWorker, extractPdfText } from '../../src/assessment/import/extractPdfText.js';
import { detectScannedPdf } from '../../src/assessment/import/detectScannedPdf.js';

test('extractPdfText returns text and page count for a representative text pdf', async () => {
  const fixture = new URL('../../public/materials/CALM/CALM Module 1 - Personal Choices.pdf', import.meta.url);
  const buffer = await readFile(fixture);

  const result = await extractPdfText(buffer);

  assert.equal(typeof result.text, 'string');
  assert.ok(result.text.length > 1000);
  assert.ok(result.pageCount > 0);
  assert.ok(Array.isArray(result.warnings));
});

test('detectScannedPdf flags near-empty extraction across multiple pages', () => {
  const result = detectScannedPdf({ text: '', pageCount: 2 });

  assert.equal(result.isLikelyScanned, true);
  assert.match(result.reason, /scan|text/i);
});

test('detectScannedPdf does not flag healthy extracted text', () => {
  const result = detectScannedPdf({
    text: 'Question 1\nA. One\nB. Two\nQuestion 2\nA. Three\nB. Four',
    pageCount: 1,
  });

  assert.equal(result.isLikelyScanned, false);
});

test('configurePdfWorker sets workerSrc when a browser worker url is provided', () => {
  const options = { workerSrc: '' };

  configurePdfWorker({
    workerSrc: '/assets/pdf.worker.mjs',
    globalWorkerOptions: options,
  });

  assert.equal(options.workerSrc, '/assets/pdf.worker.mjs');
});
