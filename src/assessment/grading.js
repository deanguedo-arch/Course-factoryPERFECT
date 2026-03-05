import { normalizeQuestion } from './schema.js';

const toInteger = (value, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeSelectedIndices = (value) => {
  const source = Array.isArray(value) ? value : [];
  return [...new Set(source.map((entry) => toInteger(entry)).filter((entry) => entry >= 0))];
};

const createManualResult = (question) => ({
  type: question.type,
  earned: null,
  possible: 1,
  isManual: true,
});

export const gradeQuestion = (rawQuestion, response = {}) => {
  const question = normalizeQuestion(rawQuestion, 0);

  if (question.type === 'multiple-choice' || question.type === 'true-false') {
    const selectedIndex = toInteger(response.selectedIndex, -1);
    return {
      type: question.type,
      earned: selectedIndex === question.correctIndex ? 1 : 0,
      possible: 1,
      isManual: false,
    };
  }

  if (question.type === 'multi-select') {
    const selectedIndices = normalizeSelectedIndices(response.selectedIndices);
    const correctSelectionsMade = question.correctIndices
      .filter((index) => selectedIndices.includes(index))
      .length;
    const earned = question.correctIndices.length
      ? correctSelectionsMade / question.correctIndices.length
      : 0;
    return {
      type: question.type,
      earned,
      possible: 1,
      isManual: false,
    };
  }

  if (question.type === 'matching') {
    const matches = Array.isArray(response.matches) ? response.matches : [];
    const correctCount = question.pairs.filter((_, leftIndex) => toInteger(matches[leftIndex], -1) === leftIndex).length;
    const earned = question.pairs.length ? correctCount / question.pairs.length : 0;
    return {
      type: question.type,
      earned,
      possible: 1,
      isManual: false,
    };
  }

  return createManualResult(question);
};

export const gradeAssessment = (questions = [], responses = []) => {
  const items = Array.isArray(questions)
    ? questions.map((question, index) => {
      const normalizedQuestion = normalizeQuestion(question, index);
      const score = gradeQuestion(normalizedQuestion, responses[index] || {});
      const points = Number(normalizedQuestion.points) || 1;
      return {
        question: normalizedQuestion,
        score,
        points,
      };
    })
    : [];

  const autoGradedItems = items.filter((item) => !item.score.isManual);
  const manualItems = items.filter((item) => item.score.isManual);

  const earnedPoints = autoGradedItems.reduce(
    (sum, item) => sum + (item.score.earned * item.points),
    0,
  );
  const possiblePoints = autoGradedItems.reduce(
    (sum, item) => sum + item.points,
    0,
  );

  return {
    items,
    autoGradedCount: autoGradedItems.length,
    manualCount: manualItems.length,
    earnedPoints,
    possiblePoints,
  };
};
