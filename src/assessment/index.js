export {
  normalizeAssessment,
  normalizeQuestion,
  validateAssessment,
} from './schema.js';

export {
  isAutoGradedQuestionType,
  isGradableQuestionType,
  normalizeQuestionType,
  QUESTION_TYPE_OPTIONS,
} from './questionTypes.js';

export {
  configurePdfWorker,
  detectScannedPdf,
  extractDocxText,
  extractPdfText,
  parseAssessmentImport,
  parseJsonImport,
  parseTextImport,
} from './import/index.js';

export {
  isPublishedToHub,
  isPublishedToModule,
  normalizePlacements,
} from './placement.js';

export {
  renderAssessment,
} from './compiler/renderAssessment.js';

export {
  canParseExtractedImport,
  canPublish,
  createImportExtractionState,
  createAssessmentFlowState,
  getAssessmentFlowSteps,
  toAssessmentFlowStep,
} from './flow.js';
