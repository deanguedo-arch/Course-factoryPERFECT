const STEP_SEQUENCE = ['import', 'review', 'compose', 'publish', 'manage'];

const normalizeStep = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  return STEP_SEQUENCE.includes(raw) ? raw : 'import';
};

const normalizeBlockingErrors = (value) => {
  const count = Number.parseInt(value, 10);
  if (!Number.isFinite(count) || count < 0) return 0;
  return count;
};

export const createAssessmentFlowState = (rawState = {}) => ({
  step: normalizeStep(rawState.step),
  blockingErrors: normalizeBlockingErrors(rawState.blockingErrors),
  hasGeneratedAssessment: Boolean(rawState.hasGeneratedAssessment),
});

export const canPublish = (rawState = {}) => {
  const state = createAssessmentFlowState(rawState);
  return state.step === 'publish' && state.blockingErrors === 0 && state.hasGeneratedAssessment;
};

export const getAssessmentFlowSteps = () => [...STEP_SEQUENCE];

export const toAssessmentFlowStep = (mode) => {
  const raw = String(mode || '').trim().toUpperCase();
  if (raw === 'IMPORT') return 'import';
  if (raw === 'ADD') return 'review';
  if (raw === 'MASTER') return 'compose';
  if (raw === 'PUBLISH') return 'publish';
  if (raw === 'MANAGE') return 'manage';
  return 'import';
};
