const asString = (value) => String(value ?? '').trim();

const clampCorrectIndex = (value, optionsLength) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 0;
  if (parsed < 0 || parsed >= optionsLength) return 0;
  return parsed;
};

export const normalizeQuestion = (rawQuestion, index = 0) => {
  const raw = rawQuestion && typeof rawQuestion === 'object' ? rawQuestion : {};
  const question = asString(raw.question || raw.prompt || `Question ${index + 1}`);
  const options = Array.isArray(raw.options) ? raw.options.map((opt) => asString(opt)) : [];
  const hasOptions = options.length > 0 && options.some((opt) => opt.length > 0);
  const type = raw.type === 'multiple-choice' || raw.type === 'long-answer'
    ? raw.type
    : hasOptions
      ? 'multiple-choice'
      : 'long-answer';

  if (type === 'long-answer') {
    return {
      id: raw.id || `q-${index + 1}`,
      order: typeof raw.order === 'number' ? raw.order : index,
      type: 'long-answer',
      question,
      options: [],
      correct: 0,
    };
  }

  const normalizedOptions = options.length ? options : ['', '', '', ''];
  return {
    id: raw.id || `q-${index + 1}`,
    order: typeof raw.order === 'number' ? raw.order : index,
    type: 'multiple-choice',
    question,
    options: normalizedOptions,
    correct: clampCorrectIndex(raw.correct, normalizedOptions.length),
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
    if (!question.question) {
      errors.push(`${label}: prompt is required.`);
    }
    if (question.type === 'multiple-choice') {
      if (question.options.length < 2) {
        errors.push(`${label}: multiple-choice requires at least 2 options.`);
      }
      const hasEmptyOption = question.options.some((opt) => !opt);
      if (hasEmptyOption) {
        warnings.push(`${label}: contains empty option text.`);
      }
      if (question.correct < 0 || question.correct >= question.options.length) {
        errors.push(`${label}: correct answer index is out of range.`);
      }
    }
  });

  return {
    normalized,
    errors,
    warnings,
  };
};
