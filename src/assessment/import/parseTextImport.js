import { normalizeQuestion } from '../schema.js';

const QUESTION_PATTERN = /^(Q?\d+[.)]|Question\s+\d+)/i;
const OPTION_PATTERN = /^[a-z][.)]\s+/i;
const BULLET_PATTERN = /^-\s+/;
const ANSWER_PATTERN = /^(ans|answer|correct|accept|accepted answers?)\s*[:-]\s*(.+)$/i;
const BARE_TRUE_FALSE_PATTERN = /^(true|false)$/i;
const TRUE_FALSE_HINT_PATTERN = /\btrue\s*(?:\/|or)\s*false\b/i;
const MULTI_SELECT_HINT_PATTERN = /\b(select|choose)\s+(all that apply|all correct answers?|two|three|multiple)\b/i;
const MATCHING_HINT_PATTERN = /\bmatch(?:ing)?\b/i;
const MATCHING_ROW_PATTERN = /^([a-z]|\d+)[.)]\s+(.+?)\s(?:->|=>|[-–—:])\s(.+)$/i;
const MULTI_ANSWER_SPLIT_PATTERN = /\s*(?:,|;|\/|&|\band\b)\s*/i;

const asString = (value) => String(value ?? '').trim();

const isTrueFalseToken = (value) => /^(true|false|t|f)$/i.test(asString(value));

const toCorrectIndex = (raw) => {
  const token = asString(raw);
  if (/^(true|t)$/i.test(token)) return 0;
  if (/^(false|f)$/i.test(token)) return 1;

  const numeric = Number.parseInt(token, 10);
  if (Number.isFinite(numeric)) return numeric;
  if (/^[a-z]$/i.test(token)) return token.toUpperCase().charCodeAt(0) - 65;
  return 0;
};

const splitAnswerTokens = (value) => (
  asString(value)
    .split(MULTI_ANSWER_SPLIT_PATTERN)
    .map((token) => token.trim())
    .filter(Boolean)
);

const splitAcceptedAnswers = (value) => {
  const raw = asString(value);
  if (!raw) return [];
  if (raw.includes(';')) {
    return raw.split(';').map((entry) => entry.trim()).filter(Boolean);
  }
  if (raw.includes('|')) {
    return raw.split('|').map((entry) => entry.trim()).filter(Boolean);
  }
  return [raw];
};

const isTrueFalseChoiceList = (choices) => {
  if (choices.length !== 2) return false;
  return choices[0].toLowerCase() === 'true' && choices[1].toLowerCase() === 'false';
};

const createDraftQuestion = (prompt) => ({
  type: 'long-answer',
  question: prompt,
  options: [],
  correct: 0,
  correctIndices: [],
  acceptedAnswers: [],
  pairs: [],
  __hasAnswerKey: false,
  __matchingHint: MATCHING_HINT_PATTERN.test(prompt),
  __multiSelectHint: MULTI_SELECT_HINT_PATTERN.test(prompt),
  __trueFalseHint: TRUE_FALSE_HINT_PATTERN.test(prompt),
});

const applyAnswerKey = (question, rawAnswer) => {
  const answer = asString(rawAnswer);
  const tokens = splitAnswerTokens(answer);
  const firstToken = tokens[0] || '';

  question.__hasAnswerKey = true;

  if (question.options.length > 0) {
    if (question.__multiSelectHint || tokens.length > 1) {
      question.type = 'multi-select';
      question.correctIndices = tokens.map((token) => toCorrectIndex(token));
      question.correct = question.correctIndices[0] ?? 0;
      return;
    }

    if (isTrueFalseToken(firstToken) || isTrueFalseChoiceList(question.options)) {
      question.type = 'true-false';
      question.correct = toCorrectIndex(firstToken);
      return;
    }

    question.type = 'multiple-choice';
    question.correct = toCorrectIndex(firstToken);
    return;
  }

  if (isTrueFalseToken(firstToken) || question.__trueFalseHint) {
    question.type = 'true-false';
    question.correct = toCorrectIndex(firstToken);
    return;
  }

  if (tokens.length === 1 && /^[a-z\d]$/i.test(firstToken)) {
    return;
  }

  question.type = 'short-answer';
  question.acceptedAnswers = splitAcceptedAnswers(answer);
};

const inferDraftType = (question) => {
  if (question.pairs.length >= 2) return 'matching';
  if (question.type === 'short-answer' || question.acceptedAnswers.length > 0) return 'short-answer';
  if (question.type === 'true-false' || isTrueFalseChoiceList(question.options)) return 'true-false';
  if (question.type === 'multi-select' || question.correctIndices.length > 1) return 'multi-select';
  if (question.options.length > 0) return 'multiple-choice';
  return 'long-answer';
};

const computeConfidence = (question) => {
  switch (question.type) {
    case 'true-false':
      return question.__hasAnswerKey ? 0.93 : 0.8;
    case 'multi-select':
      return question.correctIndices.length > 0 ? 0.91 : 0.74;
    case 'short-answer':
      return question.acceptedAnswers.length > 0 ? 0.83 : 0.58;
    case 'matching':
      return question.pairs.length >= 2 ? 0.87 : 0.6;
    case 'multiple-choice':
      if (question.__hasAnswerKey && question.options.length >= 2) return 0.92;
      if (question.options.length >= 2) return 0.75;
      return 0.55;
    default:
      return question.question ? 0.82 : 0.55;
  }
};

const finalizeDraftQuestion = (question, index) => {
  const raw = {
    ...question,
    type: inferDraftType(question),
  };

  const normalized = normalizeQuestion(raw, index);
  return {
    ...normalized,
    confidence: computeConfidence(raw),
    source: 'text',
  };
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
      current = createDraftQuestion(line.replace(QUESTION_PATTERN, '').trim());
      return;
    }

    if (!current) return;

    const answerMatch = line.match(ANSWER_PATTERN);
    if (answerMatch) {
      applyAnswerKey(current, answerMatch[2]);
      return;
    }

    const matchingRowMatch = current.__matchingHint ? line.match(MATCHING_ROW_PATTERN) : null;
    if (matchingRowMatch) {
      current.pairs.push({
        left: matchingRowMatch[2].trim(),
        right: matchingRowMatch[3].trim(),
      });
      return;
    }

    if (OPTION_PATTERN.test(line) || BULLET_PATTERN.test(line)) {
      if (!current.options.length) current.type = 'multiple-choice';
      current.options.push(
        line.replace(OPTION_PATTERN, '').replace(BULLET_PATTERN, '').trim(),
      );
      return;
    }

    if (BARE_TRUE_FALSE_PATTERN.test(line)) {
      current.options.push(line.charAt(0).toUpperCase() + line.slice(1).toLowerCase());
      return;
    }

    current.question = `${current.question} ${line}`.trim();
    current.__matchingHint = current.__matchingHint || MATCHING_HINT_PATTERN.test(current.question);
    current.__multiSelectHint = current.__multiSelectHint || MULTI_SELECT_HINT_PATTERN.test(current.question);
    current.__trueFalseHint = current.__trueFalseHint || TRUE_FALSE_HINT_PATTERN.test(current.question);
  });

  commitCurrent();

  if (!collected.length) {
    issues.push({ type: 'warning', message: 'No recognizable questions found in text input.' });
  }

  return {
    questions: collected.map((raw, index) => finalizeDraftQuestion(raw, index)),
    issues,
  };
};
