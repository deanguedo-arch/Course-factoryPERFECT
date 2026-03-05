const QUESTION_TYPES = [
  ['multiple-choice', 'Multiple Choice'],
  ['long-answer', 'Long Answer'],
  ['true-false', 'True / False'],
  ['short-answer', 'Short Answer'],
  ['multi-select', 'Multi-Select'],
  ['matching', 'Matching'],
];

const TYPE_LABELS = new Map(QUESTION_TYPES);

const TYPE_ALIASES = {
  multiple_choice: 'multiple-choice',
  multiplechoice: 'multiple-choice',
  longanswer: 'long-answer',
  long_answer: 'long-answer',
  truefalse: 'true-false',
  true_false: 'true-false',
  shortanswer: 'short-answer',
  short_answer: 'short-answer',
  multiselect: 'multi-select',
  multi_select: 'multi-select',
};

export const QUESTION_TYPE_OPTIONS = QUESTION_TYPES.map(([value, label]) => ({ value, label }));

export const normalizeQuestionType = (value, fallback = 'long-answer') => {
  const raw = String(value || '').trim().toLowerCase();
  const normalized = TYPE_ALIASES[raw] || raw;
  return TYPE_LABELS.has(normalized) ? normalized : fallback;
};

export const isGradableQuestionType = (type) => {
  const normalized = normalizeQuestionType(type, '');
  return ['multiple-choice', 'true-false', 'multi-select', 'matching', 'short-answer'].includes(normalized);
};

export const isAutoGradedQuestionType = (type) => {
  const normalized = normalizeQuestionType(type, '');
  return ['multiple-choice', 'true-false', 'multi-select', 'matching'].includes(normalized);
};
