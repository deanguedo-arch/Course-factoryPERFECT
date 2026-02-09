import { normalizeComposerModuleConfig } from '../composer/layout.js';

export const CURRENT_PROJECT_SCHEMA_VERSION = 2;

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
  return next;
}

function migrateToV1(projectData) {
  const next = { ...(projectData || {}) };
  const currentCourse = { ...(next['Current Course'] || {}) };
  const modules = Array.isArray(currentCourse.modules) ? currentCourse.modules.map(withModuleDefaults) : [];
  next['Current Course'] = { ...currentCourse, modules };
  next['Course Settings'] = withCourseSettingsDefaults(next['Course Settings']);
  next.projectSchemaVersion = 1;
  return next;
}

function migrateToV2(projectData) {
  const next = { ...(projectData || {}) };
  const currentCourse = { ...(next['Current Course'] || {}) };
  const modules = Array.isArray(currentCourse.modules) ? currentCourse.modules.map(withModuleDefaults) : [];
  next['Current Course'] = { ...currentCourse, modules };
  next['Course Settings'] = withCourseSettingsDefaults(next['Course Settings']);
  next.projectSchemaVersion = 2;
  return next;
}

function applyCurrentDefaults(projectData, targetVersion) {
  const next = { ...(projectData || {}) };
  const currentCourse = { ...(next['Current Course'] || {}) };
  const modules = Array.isArray(currentCourse.modules) ? currentCourse.modules.map(withModuleDefaults) : [];
  next['Current Course'] = { ...currentCourse, modules };
  next['Course Settings'] = withCourseSettingsDefaults(next['Course Settings']);
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
