import { normalizeQuestion } from '../schema.js';

const resolveQuestionArray = (parsed) => {
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.questions)) return parsed.questions;
  if (Array.isArray(parsed?.data)) return parsed.data;
  if (Array.isArray(parsed?.payload?.questions)) return parsed.payload.questions;
  return [];
};

const computeConfidence = (raw, normalized) => {
  if (normalized.type === 'long-answer') {
    return normalized.question ? 0.8 : 0.55;
  }
  const hasExplicitCorrect = raw && (raw.correct !== undefined && raw.correct !== null);
  if (hasExplicitCorrect && normalized.options.length >= 2) return 0.95;
  if (normalized.options.length >= 2) return 0.8;
  return 0.55;
};

export const parseJsonImport = (content) => {
  const issues = [];
  let parsed;

  try {
    parsed = typeof content === 'string' ? JSON.parse(content) : content;
  } catch {
    return {
      questions: [],
      issues: [{ type: 'error', message: 'Invalid JSON format.' }],
    };
  }

  const rawQuestions = resolveQuestionArray(parsed);
  if (!rawQuestions.length) {
    issues.push({ type: 'warning', message: 'No questions found in JSON payload.' });
  }

  const questions = rawQuestions.map((raw, index) => {
    const normalized = normalizeQuestion(raw, index);
    return {
      ...normalized,
      confidence: computeConfidence(raw, normalized),
      source: 'json',
    };
  });

  return { questions, issues };
};
