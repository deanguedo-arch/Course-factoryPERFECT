const normalizePlacementEntry = (entry) => {
  if (!entry || typeof entry !== 'object') return null;

  if (entry.targetType === 'hub') {
    return { targetType: 'hub' };
  }

  if (entry.targetType === 'module') {
    const moduleId = String(entry.moduleId || '').trim();
    if (!moduleId) return null;
    return { targetType: 'module', moduleId };
  }

  return null;
};

export const normalizePlacements = (input) => {
  const raw = Array.isArray(input) ? input : (input ? [input] : []);
  const seen = new Set();
  const placements = [];

  raw.forEach((entry) => {
    const normalized = normalizePlacementEntry(entry);
    if (!normalized) return;
    const key = normalized.targetType === 'hub'
      ? 'hub'
      : `module:${normalized.moduleId}`;
    if (seen.has(key)) return;
    seen.add(key);
    placements.push(normalized);
  });

  return placements;
};

export const isPublishedToHub = (placements) =>
  normalizePlacements(placements).some((entry) => entry.targetType === 'hub');

export const isPublishedToModule = (placements, moduleId) => {
  const id = String(moduleId || '').trim();
  if (!id) return false;
  return normalizePlacements(placements).some(
    (entry) => entry.targetType === 'module' && entry.moduleId === id,
  );
};
