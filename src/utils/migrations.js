export const CURRENT_PROJECT_SCHEMA_VERSION = 1;

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
  if (!Array.isArray(next.activities)) {
    next.activities = [];
  }
  return next;
}

function migrateToV1(projectData) {
  const next = { ...(projectData || {}) };
  const currentCourse = { ...(next['Current Course'] || {}) };
  const modules = Array.isArray(currentCourse.modules) ? currentCourse.modules.map(withModuleDefaults) : [];
  next['Current Course'] = { ...currentCourse, modules };
  next.projectSchemaVersion = 1;
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
    } else {
      throw new Error(`No migration available for schema v${nextVersion}`);
    }
    version = getProjectSchemaVersion(working);
  }

  if (getProjectSchemaVersion(working) !== targetVersion) {
    working.projectSchemaVersion = targetVersion;
  }
  return working;
}
