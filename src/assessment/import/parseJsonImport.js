import { normalizeQuestion } from '../schema.js';

const resolveQuestionArray = (parsed) => {
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.questions)) return parsed.questions;
  if (Array.isArray(parsed?.data)) return parsed.data;
  if (Array.isArray(parsed?.payload?.questions)) return parsed.payload.questions;
  return [];
};

const computeConfidence = (raw, normalized) => {
  const hasExplicitCorrect = raw && (raw.correct !== undefined && raw.correct !== null);
  const hasExplicitCorrectIndices = Array.isArray(raw?.correctIndices) && raw.correctIndices.length > 0;

  if (normalized.type === 'true-false') {
    return hasExplicitCorrect ? 0.95 : 0.84;
  }

  if (normalized.type === 'multi-select') {
    return hasExplicitCorrectIndices ? 0.94 : 0.8;
  }

  if (normalized.type === 'short-answer') {
    return normalized.acceptedAnswers.length > 0 ? 0.86 : 0.62;
  }

  if (normalized.type === 'matching') {
    return normalized.pairs.length >= 2 ? 0.9 : 0.62;
  }

  if (normalized.type === 'long-answer') {
    return normalized.question ? 0.8 : 0.55;
  }

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
