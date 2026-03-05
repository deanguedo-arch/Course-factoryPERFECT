import { normalizeQuestionType } from './questionTypes.js';

const asString = (value) => String(value ?? '').trim();

const asPoints = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const asObject = (value) => (
  value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {}
);

const normalizeChoiceList = (value) => (
  Array.isArray(value)
    ? value.map((opt) => asString(opt))
    : []
);

const clampCorrectIndex = (value, optionsLength) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 0;
  if (parsed < 0 || parsed >= optionsLength) return 0;
  return parsed;
};

const normalizeCorrectIndices = (value, optionsLength) => {
  const source = Array.isArray(value) ? value : [];
  const parsed = source
    .map((entry) => Number.parseInt(entry, 10))
    .filter((entry) => Number.isFinite(entry) && entry >= 0 && entry < optionsLength);
  return [...new Set(parsed)];
};

const normalizeAcceptedAnswers = (value) => (
  Array.isArray(value)
    ? value.map((entry) => asString(entry)).filter(Boolean)
    : []
);

const normalizePairs = (value) => (
  Array.isArray(value)
    ? value.map((pair) => ({
      left: asString(pair?.left),
      right: asString(pair?.right),
    }))
    : []
);

const isTrueFalseChoiceList = (choices) => {
  if (choices.length !== 2) return false;
  const normalized = choices.map((choice) => choice.toLowerCase());
  return normalized[0] === 'true' && normalized[1] === 'false';
};

const inferQuestionType = (raw, choices) => {
  const explicitType = normalizeQuestionType(raw.type, '');
  if (explicitType) return explicitType;
  if (Array.isArray(raw.pairs) && raw.pairs.length > 0) return 'matching';
  if (Array.isArray(raw.correctIndices) && raw.correctIndices.length > 0) return 'multi-select';
  if (Array.isArray(raw.acceptedAnswers) && raw.acceptedAnswers.length > 0) return 'short-answer';
  if (isTrueFalseChoiceList(choices)) return 'true-false';
  if (choices.some(Boolean)) return 'multiple-choice';
  return 'long-answer';
};

const buildBaseQuestion = (raw, index, type, prompt) => ({
  id: raw.id || `q-${index + 1}`,
  order: typeof raw.order === 'number' ? raw.order : index,
  type,
  prompt,
  question: prompt,
  points: asPoints(raw.points),
  meta: asObject(raw.meta),
});

export const normalizeQuestion = (rawQuestion, index = 0) => {
  const raw = rawQuestion && typeof rawQuestion === 'object' ? rawQuestion : {};
  const prompt = asString(raw.prompt || raw.question || `Question ${index + 1}`);
  const primaryChoices = normalizeChoiceList(raw.choices);
  const legacyChoices = normalizeChoiceList(raw.options);
  const choices = primaryChoices.length ? primaryChoices : legacyChoices;
  const type = inferQuestionType(raw, choices);
  const base = buildBaseQuestion(raw, index, type, prompt);

  if (type === 'true-false') {
    const tfChoices = ['True', 'False'];
    const correctIndex = clampCorrectIndex(raw.correctIndex ?? raw.correct, tfChoices.length);
    return {
      ...base,
      choices: tfChoices,
      options: [...tfChoices],
      correctIndex,
      correct: correctIndex,
    };
  }

  if (type === 'multiple-choice') {
    const normalizedChoices = choices.length ? choices : ['', '', '', ''];
    const correctIndex = clampCorrectIndex(raw.correctIndex ?? raw.correct, normalizedChoices.length);
    return {
      ...base,
      choices: normalizedChoices,
      options: [...normalizedChoices],
      correctIndex,
      correct: correctIndex,
    };
  }

  if (type === 'multi-select') {
    const normalizedChoices = choices.length ? choices : ['', '', '', ''];
    const correctIndices = normalizeCorrectIndices(raw.correctIndices, normalizedChoices.length);
    const firstCorrect = correctIndices[0] ?? 0;
    return {
      ...base,
      choices: normalizedChoices,
      options: [...normalizedChoices],
      correctIndices,
      correctIndex: firstCorrect,
      correct: firstCorrect,
    };
  }

  if (type === 'short-answer') {
    return {
      ...base,
      acceptedAnswers: normalizeAcceptedAnswers(raw.acceptedAnswers),
      caseSensitive: Boolean(raw.caseSensitive),
      choices: [],
      options: [],
      correctIndex: 0,
      correct: 0,
    };
  }

  if (type === 'matching') {
    return {
      ...base,
      pairs: normalizePairs(raw.pairs),
      shuffleRightSide: raw.shuffleRightSide !== false,
      choices: [],
      options: [],
      correctIndex: 0,
      correct: 0,
    };
  }

  return {
    ...base,
    rubric: asString(raw.rubric),
    acceptedAnswers: [],
    choices: [],
    options: [],
    correctIndex: 0,
    correct: 0,
  };
};

export const normalizeAssessment = (rawAssessment = {}) => {
  const raw = rawAssessment && typeof rawAssessment === 'object' ? rawAssessment : {};
  const rawQuestions = Array.isArray(raw.questions) ? raw.questions : [];
  const questions = rawQuestions.map((question, index) => normalizeQuestion(question, index));
  return {
    id: raw.id || '',
    title: asString(raw.title),
    description: asString(raw.description),
    questions,
    metadata: raw.metadata && typeof raw.metadata === 'object' ? { ...raw.metadata } : {},
  };
};

export const validateAssessment = (rawAssessment = {}) => {
  const normalized = normalizeAssessment(rawAssessment);
  const errors = [];
  const warnings = [];

  if (!normalized.title) {
    errors.push('Assessment title is required.');
  }

  if (!normalized.questions.length) {
    errors.push('At least one question is required.');
  }

  normalized.questions.forEach((question, index) => {
    const label = `Question ${index + 1}`;

    if (!question.prompt) {
      errors.push(`${label}: prompt is required.`);
    }

    if (question.type === 'multiple-choice' || question.type === 'true-false') {
      if (question.choices.length < 2) {
        errors.push(`${label}: multiple-choice requires at least 2 options.`);
      }
      if (question.choices.some((choice) => !choice)) {
        warnings.push(`${label}: contains empty option text.`);
      }
      if (question.correctIndex < 0 || question.correctIndex >= question.choices.length) {
        errors.push(`${label}: correct answer index is out of range.`);
      }
    }

    if (question.type === 'multi-select') {
      if (question.choices.length < 2) {
        errors.push(`${label}: multi-select requires at least 2 options.`);
      }
      if (!question.correctIndices.length) {
        errors.push(`${label}: multi-select requires at least one correct answer.`);
      }
    }

    if (question.type === 'matching') {
      if (question.pairs.length < 2) {
        errors.push(`${label}: matching requires at least 2 pairs.`);
      }
      if (question.pairs.some((pair) => !pair.left || !pair.right)) {
        errors.push(`${label}: matching pairs require both left and right values.`);
      }
    }

    if (question.type === 'short-answer' && !question.acceptedAnswers.length) {
      warnings.push(`${label}: short-answer has no accepted answers configured.`);
    }
  });

  return {
    normalized,
    errors,
    warnings,
  };
};
