export const COMPOSER_THEME_OPTIONS = [
  { value: 'dark_cards', label: 'Dark Cards' },
  { value: 'finlit_clean', label: 'FinLit Clean' },
  { value: 'coursebook_light', label: 'Coursebook Light' },
  { value: 'toolkit_clean', label: 'Toolkit Clean' },
  { value: 'saas_clean', label: 'SaaS Clean' },
  { value: 'lms_pastel', label: 'LMS Pastel' },
  { value: 'crypto_neon', label: 'Crypto Neon' },
];

export const COMPOSER_THEME_VALUES = COMPOSER_THEME_OPTIONS.map((option) => option.value);

export const COMPOSER_VISUAL_QUALITY_OPTIONS = [
  { value: 'foundation', label: 'Foundation' },
  { value: 'premium_dribbble', label: 'Premium (Dribbble-grade)' },
];

export const COMPOSER_VISUAL_QUALITY_VALUES = COMPOSER_VISUAL_QUALITY_OPTIONS.map((option) => option.value);

export function normalizeComposerThemeValue(value, fallback = 'dark_cards') {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return fallback;
  return COMPOSER_THEME_VALUES.includes(raw) ? raw : fallback;
}

export function normalizeComposerVisualQualityValue(value, fallback = 'premium_dribbble') {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return fallback;
  return COMPOSER_VISUAL_QUALITY_VALUES.includes(raw) ? raw : fallback;
}
