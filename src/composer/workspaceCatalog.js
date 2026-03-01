export const COMPOSER_WORKSPACE_MODE_OPTIONS = [
  { value: 'simple', label: 'Simple' },
  { value: 'advanced', label: 'Advanced' },
];

export const COMPOSER_WORKSPACE_MODE_VALUES = COMPOSER_WORKSPACE_MODE_OPTIONS.map((option) => option.value);

export const COMPOSER_WORKSPACE_PRESETS = [
  {
    value: 'focus',
    label: 'Focus',
    settings: {
      previewWidth: 62,
      previewHeight: 900,
      builderHeight: 720,
      builderCellWidth: 220,
      lockBuilderScale: true,
    },
  },
  {
    value: 'balanced',
    label: 'Balanced',
    settings: {
      previewWidth: 55,
      previewHeight: 900,
      builderHeight: 760,
      builderCellWidth: 220,
      lockBuilderScale: true,
    },
  },
  {
    value: 'canvas',
    label: 'Canvas',
    settings: {
      previewWidth: 45,
      previewHeight: 1000,
      builderHeight: 860,
      builderCellWidth: 240,
      lockBuilderScale: false,
    },
  },
];

export function normalizeComposerWorkspaceMode(value, fallback = 'simple') {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return fallback;
  return COMPOSER_WORKSPACE_MODE_VALUES.includes(raw) ? raw : fallback;
}
