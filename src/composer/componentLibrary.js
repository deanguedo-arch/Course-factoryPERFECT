function deepClone(value) {
  if (value == null) return value;
  try {
    if (typeof structuredClone === 'function') return structuredClone(value);
  } catch {
    // Fall through to JSON clone.
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

function getSafeLayout(layout) {
  const source = layout && typeof layout === 'object' ? layout : {};
  const next = {};
  if (source.colSpan != null) next.colSpan = source.colSpan;
  if (source.breakpoints && typeof source.breakpoints === 'object') {
    next.breakpoints = deepClone(source.breakpoints);
  }
  return next;
}

export function cloneComposerComponentActivity(activity) {
  const source = activity && typeof activity === 'object' ? activity : {};
  return {
    type: String(source.type || '').trim() || 'content_block',
    data: deepClone(source.data || {}),
    style: deepClone(source.style || {}),
    behavior: deepClone(source.behavior || {}),
    layout: getSafeLayout(source.layout),
  };
}

export function buildComposerComponentEntry(name, activity, { prefix = 'cmp' } = {}) {
  const label = String(name || '').trim() || 'Untitled Component';
  const now = new Date().toISOString();
  return {
    id: `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: label,
    createdAt: now,
    updatedAt: now,
    activity: cloneComposerComponentActivity(activity),
  };
}

export function normalizeComposerComponentEntry(entry, { fallbackPrefix = 'cmp' } = {}) {
  if (!entry || typeof entry !== 'object') return null;
  const activity = cloneComposerComponentActivity(entry.activity);
  const type = String(activity.type || '').trim();
  if (!type) return null;
  return {
    id: String(entry.id || `${fallbackPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`).trim(),
    name: String(entry.name || '').trim() || 'Untitled Component',
    createdAt: String(entry.createdAt || entry.updatedAt || '').trim() || new Date().toISOString(),
    updatedAt: String(entry.updatedAt || entry.createdAt || '').trim() || new Date().toISOString(),
    activity,
  };
}

export function normalizeComposerComponentLibrary(entries, options = {}) {
  return (Array.isArray(entries) ? entries : [])
    .map((entry) => normalizeComposerComponentEntry(entry, options))
    .filter(Boolean);
}

export function getComposerComponentLink(activity) {
  if (!activity || typeof activity !== 'object' || !activity.component || typeof activity.component !== 'object') return null;
  const sourceId = String(activity.component.sourceId || '').trim();
  if (!sourceId) return null;
  return {
    sourceId,
    sourceName: String(activity.component.sourceName || '').trim() || 'Course Component',
    linked: activity.component.linked !== false,
    linkedAt: String(activity.component.linkedAt || '').trim() || '',
    sourceUpdatedAt: String(activity.component.sourceUpdatedAt || '').trim() || '',
  };
}

export function isComposerComponentLinked(activity) {
  const link = getComposerComponentLink(activity);
  return Boolean(link?.sourceId && link?.linked);
}

export function buildComposerComponentLink(entry) {
  const normalizedEntry = normalizeComposerComponentEntry(entry);
  if (!normalizedEntry) return null;
  return {
    sourceId: normalizedEntry.id,
    sourceName: normalizedEntry.name,
    linked: true,
    linkedAt: new Date().toISOString(),
    sourceUpdatedAt: normalizedEntry.updatedAt || normalizedEntry.createdAt || '',
  };
}

export function attachComposerComponentLink(activity, entry) {
  const source = activity && typeof activity === 'object' ? { ...activity } : {};
  const link = buildComposerComponentLink(entry);
  if (!link) return source;
  source.component = link;
  return source;
}

export function createLinkedComposerComponentActivity(entry) {
  const normalizedEntry = normalizeComposerComponentEntry(entry);
  if (!normalizedEntry) return null;
  return attachComposerComponentLink(cloneComposerComponentActivity(normalizedEntry.activity), normalizedEntry);
}

export function updateComposerComponentEntryFromActivity(entry, activity, { name } = {}) {
  const normalizedEntry = normalizeComposerComponentEntry(entry);
  if (!normalizedEntry) return null;
  const nextName = String(name || normalizedEntry.name || '').trim() || 'Untitled Component';
  return {
    ...normalizedEntry,
    name: nextName,
    updatedAt: new Date().toISOString(),
    activity: cloneComposerComponentActivity(activity),
  };
}

export function getComposerComponentSyncStatus(activity, entries) {
  const link = getComposerComponentLink(activity);
  if (!link) {
    return {
      linked: false,
      stale: false,
      missingSource: false,
      sourceEntry: null,
      link: null,
    };
  }
  const sourceEntry = normalizeComposerComponentLibrary(entries).find((entry) => entry.id === link.sourceId) || null;
  const sourceVersion = String(sourceEntry?.updatedAt || sourceEntry?.createdAt || '').trim();
  return {
    linked: Boolean(link.linked),
    stale: Boolean(sourceEntry && sourceVersion !== String(link.sourceUpdatedAt || '').trim()),
    missingSource: !sourceEntry,
    sourceEntry,
    link,
  };
}

export function detachComposerComponentLink(activity) {
  if (!activity || typeof activity !== 'object' || !activity.component) return activity;
  const next = { ...activity };
  delete next.component;
  return next;
}

function hasMatchingComponentSource(activity, entryId) {
  const link = getComposerComponentLink(activity);
  return Boolean(link?.sourceId && String(link.sourceId) === String(entryId || '').trim());
}

export function syncComposerActivityFromComponent(activity, entry, { preserveLayout = true } = {}) {
  const normalizedEntry = normalizeComposerComponentEntry(entry);
  if (!normalizedEntry || !hasMatchingComponentSource(activity, normalizedEntry.id)) {
    return { changed: false, activity };
  }
  const existing = activity && typeof activity === 'object' ? activity : {};
  const existingLink = getComposerComponentLink(existing);
  const sourceActivity = cloneComposerComponentActivity(normalizedEntry.activity);
  const nextLink = buildComposerComponentLink(normalizedEntry);
  const nextActivity = {
    ...existing,
    ...sourceActivity,
    id: existing.id || sourceActivity.id,
    layout:
      preserveLayout && existing.layout && typeof existing.layout === 'object'
        ? deepClone(existing.layout)
        : getSafeLayout(sourceActivity.layout),
    component: existingLink?.linkedAt ? { ...nextLink, linkedAt: existingLink.linkedAt } : nextLink,
  };
  const changed = JSON.stringify(existing) !== JSON.stringify(nextActivity);
  return {
    changed,
    activity: changed ? nextActivity : activity,
  };
}

export function syncComposerActivitiesFromComponent(activities, entry, options = {}) {
  let changed = false;
  let count = 0;
  const nextActivities = (Array.isArray(activities) ? activities : []).map((activity) => {
    const result = syncComposerActivityFromComponent(activity, entry, options);
    if (!result.changed) return activity;
    changed = true;
    count += 1;
    return result.activity;
  });
  return {
    changed,
    count,
    activities: changed ? nextActivities : Array.isArray(activities) ? activities : [],
  };
}

export function syncComposerModulesFromComponent(modules, entry, options = {}) {
  let changed = false;
  let count = 0;
  const nextModules = (Array.isArray(modules) ? modules : []).map((module) => {
    if (!Array.isArray(module?.activities) || module.activities.length === 0) return module;
    const result = syncComposerActivitiesFromComponent(module.activities, entry, options);
    if (!result.changed) return module;
    changed = true;
    count += result.count;
    return {
      ...module,
      activities: result.activities,
    };
  });
  return {
    changed,
    count,
    modules: changed ? nextModules : Array.isArray(modules) ? modules : [],
  };
}
