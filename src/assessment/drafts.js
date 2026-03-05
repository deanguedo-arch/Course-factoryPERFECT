import { normalizeQuestion } from './schema.js';
import { normalizeQuestionType } from './questionTypes.js';

const asString = (value) => String(value ?? '');

const asPoints = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const asMeta = (value) => (
  value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {}
);

const toChoiceList = (payload, minimum = 4) => {
  const source = Array.isArray(payload?.choices) && payload.choices.length
    ? payload.choices
    : Array.isArray(payload?.options)
      ? payload.options
      : [];
  const choices = source.map((entry) => asString(entry));
  while (choices.length < minimum) {
    choices.push('');
  }
  return choices;
};

const toAcceptedAnswers = (payload, minimum = 1) => {
  const source = Array.isArray(payload?.acceptedAnswers)
    ? payload.acceptedAnswers.map((entry) => asString(entry))
    : [];
  if (source.length > 0) return source;
  return Array.from({ length: minimum }, () => '');
};

const toPairs = (payload, minimum = 2) => {
  const source = Array.isArray(payload?.pairs)
    ? payload.pairs.map((pair) => ({
      left: asString(pair?.left),
      right: asString(pair?.right),
    }))
    : [];
  while (source.length < minimum) {
    source.push({ left: '', right: '' });
  }
  return source;
};

const buildDraftBase = (payload = {}, type) => {
  const question = asString(payload.question ?? payload.prompt ?? '');
  return {
    id: payload.id || '',
    order: typeof payload.order === 'number' ? payload.order : 0,
    type,
    question,
    prompt: question,
    points: asPoints(payload.points),
    meta: asMeta(payload.meta),
  };
};

export const createQuestionDraft = (inputType = 'multiple-choice', seed = {}) => {
  const type = normalizeQuestionType(inputType, 'multiple-choice');
  const base = buildDraftBase(seed, type);

  if (type === 'true-false') {
    const choices = ['True', 'False'];
    const correctIndex = typeof seed.correctIndex === 'number'
      ? seed.correctIndex
      : (typeof seed.correct === 'number' ? seed.correct : 0);
    return {
      ...base,
      choices,
      options: [...choices],
      correctIndex,
      correct: correctIndex,
    };
  }

  if (type === 'multiple-choice') {
    const choices = toChoiceList(seed, 4);
    const correctIndex = typeof seed.correctIndex === 'number'
      ? seed.correctIndex
      : (typeof seed.correct === 'number' ? seed.correct : 0);
    return {
      ...base,
      choices,
      options: [...choices],
      correctIndex,
      correct: correctIndex,
    };
  }

  if (type === 'multi-select') {
    const choices = toChoiceList(seed, 4);
    const correctIndices = Array.isArray(seed.correctIndices)
      ? seed.correctIndices
          .map((entry) => Number.parseInt(entry, 10))
          .filter((entry) => Number.isFinite(entry) && entry >= 0)
      : [];
    return {
      ...base,
      choices,
      options: [...choices],
      correctIndices,
      correctIndex: correctIndices[0] ?? 0,
      correct: correctIndices[0] ?? 0,
    };
  }

  if (type === 'short-answer') {
    return {
      ...base,
      acceptedAnswers: toAcceptedAnswers(seed, 1),
      caseSensitive: Boolean(seed.caseSensitive),
      choices: [],
      options: [],
      correctIndex: 0,
      correct: 0,
    };
  }

  if (type === 'matching') {
    return {
      ...base,
      pairs: toPairs(seed, 2),
      shuffleRightSide: seed.shuffleRightSide !== false,
      choices: [],
      options: [],
      correctIndex: 0,
      correct: 0,
    };
  }

  return {
    ...base,
    rubric: asString(seed.rubric),
    acceptedAnswers: [],
    choices: [],
    options: [],
    correctIndex: 0,
    correct: 0,
  };
};

export const convertQuestionDraftType = (draft, nextType) => (
  createQuestionDraft(nextType, draft)
);

export const cloneQuestionRecord = (question = {}) => ({
  ...question,
  choices: Array.isArray(question.choices) ? [...question.choices] : [],
  options: Array.isArray(question.options) ? [...question.options] : [],
  correctIndices: Array.isArray(question.correctIndices) ? [...question.correctIndices] : [],
  acceptedAnswers: Array.isArray(question.acceptedAnswers) ? [...question.acceptedAnswers] : [],
  pairs: Array.isArray(question.pairs)
    ? question.pairs.map((pair) => ({
      left: asString(pair?.left),
      right: asString(pair?.right),
    }))
    : [],
  meta: asMeta(question.meta),
});

export const buildMasterQuestionRecord = (payload = {}, {
  fallbackType = 'multiple-choice',
  generateId,
  order,
} = {}) => {
  const resolvedType = normalizeQuestionType(payload.type, fallbackType);
  const resolvedOrder = typeof payload.order === 'number' ? payload.order : (typeof order === 'number' ? order : 0);
  const normalized = normalizeQuestion({ ...payload, type: resolvedType }, resolvedOrder);
  const id = payload.id || (typeof generateId === 'function' ? generateId() : normalized.id);

  return {
    ...payload,
    ...normalized,
    id,
    order: resolvedOrder,
  };
};
