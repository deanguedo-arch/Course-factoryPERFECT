import { normalizeQuestion } from '../schema.js';

const QUESTION_PATTERN = /^(Q?\d+[.)]|Question\s+\d+)/i;
const OPTION_PATTERN = /^[a-d][.)]\s+/i;
const BULLET_PATTERN = /^-\s+/;
const ANSWER_PATTERN = /^(ans|answer|correct)\s*[:-]\s*([a-d]|\d+)/i;

const toCorrectIndex = (raw) => {
  const token = String(raw || '').trim();
  const numeric = Number.parseInt(token, 10);
  if (Number.isFinite(numeric)) return numeric;
  if (/^[a-z]$/i.test(token)) return token.toUpperCase().charCodeAt(0) - 65;
  return 0;
};

const computeConfidence = (question) => {
  if (question.type === 'long-answer') {
    return question.question ? 0.82 : 0.55;
  }
  if (question.__hasAnswerKey && question.options.length >= 2) return 0.92;
  if (question.options.length >= 2) return 0.75;
  return 0.55;
};

export const parseTextImport = (content) => {
  const issues = [];
  const lines = String(content || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const collected = [];
  let current = null;

  const commitCurrent = () => {
    if (!current) return;
    collected.push(current);
    current = null;
  };

  lines.forEach((line) => {
    if (QUESTION_PATTERN.test(line)) {
      commitCurrent();
      current = {
        type: 'long-answer',
        question: line.replace(QUESTION_PATTERN, '').trim(),
        options: [],
        correct: 0,
        __hasAnswerKey: false,
      };
      return;
    }

    if (!current) return;

    if (OPTION_PATTERN.test(line) || BULLET_PATTERN.test(line)) {
      if (!current.options.length) current.type = 'multiple-choice';
      current.options.push(
        line.replace(OPTION_PATTERN, '').replace(BULLET_PATTERN, '').trim(),
      );
      return;
    }

    const answerMatch = line.match(ANSWER_PATTERN);
    if (answerMatch) {
      current.correct = toCorrectIndex(answerMatch[2]);
      current.__hasAnswerKey = true;
      return;
    }

    if (!current.options.length) {
      current.question = `${current.question} ${line}`.trim();
    }
  });

  commitCurrent();

  if (!collected.length) {
    issues.push({ type: 'warning', message: 'No recognizable questions found in text input.' });
  }

  const questions = collected.map((raw, index) => {
    const normalized = normalizeQuestion(raw, index);
    return {
      ...normalized,
      confidence: computeConfidence(raw),
      source: 'text',
    };
  });

  return { questions, issues };
};
