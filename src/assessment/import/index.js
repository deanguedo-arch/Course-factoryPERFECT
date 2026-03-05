import { parseJsonImport } from './parseJsonImport.js';
import { parseTextImport } from './parseTextImport.js';

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

export { parseJsonImport, parseTextImport };
