import { parseJsonImport } from './parseJsonImport.js';
import { parseTextImport } from './parseTextImport.js';
import { extractDocxText } from './extractDocxText.js';
import { configurePdfWorker, extractPdfText } from './extractPdfText.js';
import { detectScannedPdf } from './detectScannedPdf.js';

const looksLikeJson = (value) => {
  const input = String(value || '').trim();
  return input.startsWith('{') || input.startsWith('[');
};

export const parseAssessmentImport = ({ kind = 'auto', content = '' } = {}) => {
  const selectedKind = kind === 'auto'
    ? (looksLikeJson(content) ? 'json' : 'text')
    : kind;

  if (selectedKind === 'json') {
    return parseJsonImport(content);
  }

  return parseTextImport(content);
};

export {
  configurePdfWorker,
  detectScannedPdf,
  extractDocxText,
  extractPdfText,
  parseJsonImport,
  parseTextImport,
};
