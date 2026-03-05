import { normalizeQuestionType } from './questionTypes.js';

const TYPE_META = {
  'multiple-choice': { label: 'Multiple Choice', shortLabel: 'MC', tone: 'blue' },
  'true-false': { label: 'True / False', shortLabel: 'T/F', tone: 'indigo' },
  'multi-select': { label: 'Multi-Select', shortLabel: 'Multi', tone: 'violet' },
  'short-answer': { label: 'Short Answer', shortLabel: 'Short', tone: 'cyan' },
  'long-answer': { label: 'Long Answer', shortLabel: 'Long', tone: 'emerald' },
  matching: { label: 'Matching', shortLabel: 'Match', tone: 'amber' },
};

const toPrompt = (question) => String(question?.question ?? question?.prompt ?? '').trim();

const toChoiceList = (question) => {
  const source = Array.isArray(question?.choices) && question.choices.length
    ? question.choices
    : Array.isArray(question?.options)
      ? question.options
      : [];
  return source.map((entry) => String(entry ?? '').trim());
};

const toCorrectIndex = (question) => {
  const value = question?.correctIndex ?? question?.correct;
  return Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : -1;
};

const toCorrectIndices = (question) => (
  Array.isArray(question?.correctIndices)
    ? question.correctIndices
        .map((entry) => Number.parseInt(entry, 10))
        .filter((entry) => Number.isFinite(entry) && entry >= 0)
    : []
);

const toAcceptedAnswers = (question) => (
  Array.isArray(question?.acceptedAnswers)
    ? question.acceptedAnswers.map((entry) => String(entry ?? '').trim()).filter(Boolean)
    : []
);

const toPairs = (question) => (
  Array.isArray(question?.pairs)
    ? question.pairs.map((pair) => ({
      left: String(pair?.left ?? '').trim(),
      right: String(pair?.right ?? '').trim(),
    }))
    : []
);

export const getQuestionTypeMeta = (type) => {
  const normalized = normalizeQuestionType(type, 'long-answer');
  return TYPE_META[normalized] || TYPE_META['long-answer'];
};

export const getQuestionDraftBlockingErrors = (question) => {
  const type = normalizeQuestionType(question?.type, 'multiple-choice');
  const prompt = toPrompt(question);
  const errors = [];

  if (!prompt) {
    errors.push('Question prompt is required.');
  }

  if (type === 'multiple-choice' || type === 'multi-select') {
    const choices = toChoiceList(question);
    if (choices.length < 2) {
      errors.push('Add at least two answer options.');
    } else if (choices.some((choice) => !choice)) {
      errors.push('Fill in every answer option.');
    }

    if (type === 'multiple-choice') {
      const correctIndex = toCorrectIndex(question);
      if (correctIndex < 0 || correctIndex >= choices.length) {
        errors.push('Select one correct answer.');
      }
    }

    if (type === 'multi-select' && toCorrectIndices(question).length === 0) {
      errors.push('Select at least one correct answer.');
    }
  }

  if (type === 'true-false') {
    const correctIndex = toCorrectIndex(question);
    if (![0, 1].includes(correctIndex)) {
      errors.push('Choose whether the correct answer is True or False.');
    }
  }

  if (type === 'matching') {
    const pairs = toPairs(question);
    if (pairs.length < 2) {
      errors.push('Add at least two matching pairs.');
    } else if (pairs.some((pair) => !pair.left || !pair.right)) {
      errors.push('Complete every matching pair.');
    }
  }

  return errors;
};

export const getQuestionDraftSummaryLines = (question) => {
  const type = normalizeQuestionType(question?.type, 'long-answer');
  const choices = toChoiceList(question);
  const correctIndex = toCorrectIndex(question);
  const correctIndices = toCorrectIndices(question);
  const acceptedAnswers = toAcceptedAnswers(question);
  const pairs = toPairs(question);

  if (type === 'multiple-choice') {
    return choices[correctIndex] ? [`Correct: ${choices[correctIndex]}`] : ['Correct answer not set'];
  }

  if (type === 'true-false') {
    return [`Correct: ${correctIndex === 1 ? 'False' : 'True'}`];
  }

  if (type === 'multi-select') {
    const selected = correctIndices.map((index) => choices[index]).filter(Boolean);
    return selected.length > 0 ? [`Correct: ${selected.join(', ')}`] : ['Correct answers pending'];
  }

  if (type === 'short-answer') {
    if (acceptedAnswers.length === 0) return ['Manual review answer'];
    const preview = acceptedAnswers.slice(0, 2).join(', ');
    const extraCount = acceptedAnswers.length - 2;
    return [`Accepted: ${preview}${extraCount > 0 ? ` +${extraCount} more` : ''}`];
  }

  if (type === 'matching') {
    const completedPairs = pairs.filter((pair) => pair.left && pair.right);
    if (completedPairs.length === 0) return ['Pairs pending'];
    const firstPair = completedPairs[0];
    const suffix = completedPairs.length > 1 ? `, +${completedPairs.length - 1} more` : '';
    return [`Pairs: ${firstPair.left} -> ${firstPair.right}${suffix}`];
  }

  return ['Manual response'];
};
