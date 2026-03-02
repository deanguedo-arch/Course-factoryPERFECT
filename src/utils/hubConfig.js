const LIGHT_BACKGROUND_TOKENS = new Set([
  'slate-50',
  'zinc-50',
  'neutral-50',
  'stone-50',
  'gray-50',
  'white',
]);

const LEGACY_ACCENT_HEX = {
  sky: '#0ea5e9',
  rose: '#f43f5e',
  emerald: '#10b981',
  amber: '#f59e0b',
  purple: '#a855f7',
  indigo: '#6366f1',
  pink: '#ec4899',
  teal: '#14b8a6',
};

export const HUB_ACCENT_FALLBACK = '#38bdf8';

export const HUB_TEMPLATE_OPTIONS = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'cards', label: 'Cards' },
];

export const HUB_SKIN_OPTIONS = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];

export const HUB_TEMPLATE_PRESETS = {
  minimal: {
    navPosition: 'top',
    showSidebar: false,
    maxWidthClass: 'max-w-5xl',
    framePaddingClass: 'px-6 py-10',
    heroAlign: 'center',
    cardLayout: 'stack',
    cardGapClass: 'space-y-4',
    cardRadiusClass: 'rounded-2xl',
    cardPaddingClass: 'p-5',
  },
  sidebar: {
    navPosition: 'side',
    showSidebar: true,
    maxWidthClass: 'max-w-6xl',
    framePaddingClass: 'px-6 py-8',
    heroAlign: 'left',
    cardLayout: 'stack',
    cardGapClass: 'space-y-3',
    cardRadiusClass: 'rounded-2xl',
    cardPaddingClass: 'p-5',
  },
  cards: {
    navPosition: 'top',
    showSidebar: false,
    maxWidthClass: 'max-w-6xl',
    framePaddingClass: 'px-6 py-12',
    heroAlign: 'left',
    cardLayout: 'grid',
    cardGapClass: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    cardRadiusClass: 'rounded-3xl',
    cardPaddingClass: 'p-6',
  },
};

export const DEFAULT_HUB_CONFIG = Object.freeze({
  template: 'minimal',
  skin: 'dark',
  brand: {
    title: 'Mental Fitness',
    logoUrl: '',
    accent: HUB_ACCENT_FALLBACK,
  },
});

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeTemplate(value, fallback = DEFAULT_HUB_CONFIG.template) {
  const raw = normalizeText(value).toLowerCase();
  return HUB_TEMPLATE_PRESETS[raw] ? raw : fallback;
}

function normalizeSkin(value, fallback = DEFAULT_HUB_CONFIG.skin) {
  const raw = normalizeText(value).toLowerCase();
  return raw === 'light' || raw === 'dark' ? raw : fallback;
}

function normalizeLegacyAccent(value) {
  const raw = normalizeText(value).toLowerCase();
  return LEGACY_ACCENT_HEX[raw] || HUB_ACCENT_FALLBACK;
}

export function normalizeHubAccent(value, fallback = HUB_ACCENT_FALLBACK) {
  const raw = normalizeText(value);
  if (!raw) return fallback;
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(raw)) {
    const short = raw.slice(1).toLowerCase();
    return `#${short.split('').map((char) => `${char}${char}`).join('')}`;
  }
  return fallback;
}

function buildLegacyHubConfig({ settings = {}, courseName = '' } = {}) {
  const backgroundColor = normalizeText(settings.backgroundColor).toLowerCase();
  const navPosition = normalizeText(settings?.layoutSettings?.navPosition).toLowerCase();
  return {
    template: navPosition === 'side' ? 'sidebar' : DEFAULT_HUB_CONFIG.template,
    skin: LIGHT_BACKGROUND_TOKENS.has(backgroundColor) ? 'light' : DEFAULT_HUB_CONFIG.skin,
    brand: {
      title: normalizeText(settings.courseName || courseName || DEFAULT_HUB_CONFIG.brand.title),
      logoUrl: '',
      accent: normalizeLegacyAccent(settings.accentColor),
    },
  };
}

export function normalizeHubConfig(hubConfig, legacyConfig = null) {
  const source = hubConfig && typeof hubConfig === 'object' ? hubConfig : {};
  const legacy = legacyConfig && typeof legacyConfig === 'object' ? legacyConfig : DEFAULT_HUB_CONFIG;
  const sourceBrand = source.brand && typeof source.brand === 'object' ? source.brand : {};
  const legacyBrand = legacy.brand && typeof legacy.brand === 'object' ? legacy.brand : DEFAULT_HUB_CONFIG.brand;

  return {
    template: normalizeTemplate(source.template, legacy.template || DEFAULT_HUB_CONFIG.template),
    skin: normalizeSkin(source.skin, legacy.skin || DEFAULT_HUB_CONFIG.skin),
    brand: {
      title: normalizeText(sourceBrand.title || legacyBrand.title || DEFAULT_HUB_CONFIG.brand.title),
      logoUrl: normalizeText(sourceBrand.logoUrl || legacyBrand.logoUrl || ''),
      accent: normalizeHubAccent(sourceBrand.accent || legacyBrand.accent || DEFAULT_HUB_CONFIG.brand.accent),
    },
  };
}

export function resolveHubConfigFromProject(projectData) {
  const settings = projectData?.['Course Settings'] || {};
  const courseName = projectData?.['Current Course']?.name || '';
  const legacy = buildLegacyHubConfig({ settings, courseName });
  return normalizeHubConfig(projectData?.hubConfig, legacy);
}

export function resolveHubConfigFromSettings(settings = {}) {
  const legacy = buildLegacyHubConfig({
    settings,
    courseName: settings.__courseName || settings.courseName || '',
  });
  return normalizeHubConfig(settings.__hubConfig || settings.hubConfig, legacy);
}

export function getHubTitle(projectData) {
  const hubConfig = resolveHubConfigFromProject(projectData);
  return normalizeText(
    hubConfig.brand.title ||
      projectData?.['Course Settings']?.courseName ||
      projectData?.['Current Course']?.name ||
      'Course',
  );
}

export function hasLegacyHubThemeFields(projectData) {
  const settings = projectData?.['Course Settings'];
  if (!settings || typeof settings !== 'object') return false;
  const legacyKeys = [
    'accentColor',
    'backgroundColor',
    'fontFamily',
    'customCSS',
    'headingTextColor',
    'secondaryTextColor',
    'buttonColor',
    'containerColor',
    'visualThemePack',
  ];
  return legacyKeys.some((key) => Object.prototype.hasOwnProperty.call(settings, key));
}

function hexToRgbParts(hex) {
  const normalized = normalizeHubAccent(hex);
  const clean = normalized.replace('#', '');
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  };
}

export function toRgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgbParts(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function resolveHubPresentation(hubConfigInput) {
  const hubConfig = normalizeHubConfig(hubConfigInput);
  const preset = HUB_TEMPLATE_PRESETS[hubConfig.template] || HUB_TEMPLATE_PRESETS.minimal;
  const isLight = hubConfig.skin === 'light';
  const accent = hubConfig.brand.accent || HUB_ACCENT_FALLBACK;

  return {
    hubConfig,
    preset,
    palette: {
      accent,
      accentSoft: toRgba(accent, isLight ? 0.12 : 0.18),
      accentOutline: toRgba(accent, isLight ? 0.24 : 0.32),
      background: isLight ? '#f4f7fb' : '#09111f',
      backgroundAlt: isLight ? '#ffffff' : '#0f172a',
      panel: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(9, 17, 31, 0.82)',
      panelStrong: isLight ? '#ffffff' : '#132033',
      panelHover: isLight ? '#eef3f9' : '#172338',
      border: isLight ? 'rgba(15, 23, 42, 0.10)' : 'rgba(148, 163, 184, 0.16)',
      text: isLight ? '#0f172a' : '#f8fafc',
      muted: isLight ? '#475569' : '#94a3b8',
      subtle: isLight ? '#64748b' : '#64748b',
      shadow: isLight ? '0 24px 70px rgba(15, 23, 42, 0.08)' : '0 28px 90px rgba(2, 6, 23, 0.45)',
      isLight,
    },
  };
}

export function resolveHubPresentationFromProject(projectData) {
  return resolveHubPresentation(resolveHubConfigFromProject(projectData));
}
