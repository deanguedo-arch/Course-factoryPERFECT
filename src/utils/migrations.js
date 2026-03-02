import { normalizeComposerModuleConfig } from '../composer/layout.js';
import {
  normalizeComposerThemeValue,
  normalizeComposerVisualQualityValue,
} from '../composer/themeCatalog.js';
import { normalizeHubConfig, resolveHubConfigFromProject } from './hubConfig.js';

export const CURRENT_PROJECT_SCHEMA_VERSION = 4;

const TEMPLATE_OPTIONS = ['deck', 'finlit', 'coursebook', 'toolkit_dashboard'];

function normalizeTemplateValue(value, fallback = null) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return fallback;
  return TEMPLATE_OPTIONS.includes(raw) ? raw : fallback;
}

function normalizeThemeValue(value, fallback = null) {
  return normalizeComposerThemeValue(value, fallback);
}

function deepClone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

function withModuleDefaults(module) {
  const next = { ...(module || {}) };
  if (next.mode !== 'custom_html' && next.mode !== 'composer') {
    next.mode = 'custom_html';
  }
  next.template = normalizeTemplateValue(next.template, null);
  next.theme = normalizeThemeValue(next.theme, null);
  const normalizedComposer = normalizeComposerModuleConfig(next);
  next.composerLayout = normalizedComposer.composerLayout;
  next.activities = normalizedComposer.activities;
  return next;
}

function withCourseSettingsDefaults(settings) {
  const next = { ...(settings || {}) };
  const compilationDefaults = { ...(next.compilationDefaults || {}) };
  if (typeof compilationDefaults.enableComposer !== 'boolean') {
    compilationDefaults.enableComposer = false;
  }
  next.compilationDefaults = compilationDefaults;
  next.templateDefault = normalizeTemplateValue(next.templateDefault, 'deck');
  next.themeDefault = normalizeThemeValue(next.themeDefault, 'dark_cards');
  next.composerVisualQuality = normalizeComposerVisualQualityValue(next.composerVisualQuality, 'premium_dribbble');
  return next;
}

function withHubConfigDefaults(hubConfig, projectData) {
  const legacy = resolveHubConfigFromProject({
    ...(projectData || {}),
    hubConfig: null,
  });
  return normalizeHubConfig(hubConfig, legacy);
}

function withCurrentCourseDefaults(course) {
  const next = { ...(course || {}) };
  next.modules = Array.isArray(next.modules) ? next.modules.map(withModuleDefaults) : [];
  next.composerComponents = Array.isArray(next.composerComponents) ? next.composerComponents : [];
  return next;
}

function migrateToV1(projectData) {
  const next = { ...(projectData || {}) };
  next['Current Course'] = withCurrentCourseDefaults(next['Current Course']);
  next['Course Settings'] = withCourseSettingsDefaults(next['Course Settings']);
  next.projectSchemaVersion = 1;
  return next;
}

function migrateToV2(projectData) {
  const next = { ...(projectData || {}) };
  next['Current Course'] = withCurrentCourseDefaults(next['Current Course']);
  next['Course Settings'] = withCourseSettingsDefaults(next['Course Settings']);
  next.projectSchemaVersion = 2;
  return next;
}

function migrateToV3(projectData) {
  const next = { ...(projectData || {}) };
  next['Current Course'] = withCurrentCourseDefaults(next['Current Course']);
  next['Course Settings'] = withCourseSettingsDefaults(next['Course Settings']);
  next.projectSchemaVersion = 3;
  return next;
}

function migrateToV4(projectData) {
  const next = { ...(projectData || {}) };
  next['Current Course'] = withCurrentCourseDefaults(next['Current Course']);
  next['Course Settings'] = withCourseSettingsDefaults(next['Course Settings']);
  next.hubConfig = withHubConfigDefaults(next.hubConfig, next);
  next.projectSchemaVersion = 4;
  return next;
}

function applyCurrentDefaults(projectData, targetVersion) {
  const next = { ...(projectData || {}) };
  next['Current Course'] = withCurrentCourseDefaults(next['Current Course']);
  next['Course Settings'] = withCourseSettingsDefaults(next['Course Settings']);
  next.hubConfig = withHubConfigDefaults(next.hubConfig, next);
  if (!Number.isInteger(next.projectSchemaVersion) || next.projectSchemaVersion < targetVersion) {
    next.projectSchemaVersion = targetVersion;
  }
  return next;
}

export function getProjectSchemaVersion(projectData) {
  return Number.isInteger(projectData?.projectSchemaVersion) ? projectData.projectSchemaVersion : 0;
}

export function migrateProjectData(projectData, { targetVersion = CURRENT_PROJECT_SCHEMA_VERSION } = {}) {
  if (!projectData || typeof projectData !== 'object') return null;
  let working = deepClone(projectData);
  if (!working) return null;

  let version = getProjectSchemaVersion(working);
  while (version < targetVersion) {
    const nextVersion = version + 1;
    if (nextVersion === 1) {
      working = migrateToV1(working);
    } else if (nextVersion === 2) {
      working = migrateToV2(working);
    } else if (nextVersion === 3) {
      working = migrateToV3(working);
    } else if (nextVersion === 4) {
      working = migrateToV4(working);
    } else {
      throw new Error(`No migration available for schema v${nextVersion}`);
    }
    version = getProjectSchemaVersion(working);
  }

  if (getProjectSchemaVersion(working) !== targetVersion) {
    working.projectSchemaVersion = targetVersion;
  }
  return applyCurrentDefaults(working, targetVersion);
}
