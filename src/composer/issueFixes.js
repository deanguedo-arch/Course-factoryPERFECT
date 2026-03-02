function slugify(value, fallback = 'activity') {
  const raw = String(value || '').trim().toLowerCase();
  const slug = raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug || fallback;
}

function cloneActivity(activity) {
  return activity && typeof activity === 'object' ? { ...activity } : activity;
}

function buildActivityId(type, index) {
  return `${slugify(type, 'activity')}-${Date.now()}-${index + 1}-${Math.random().toString(36).slice(2, 6)}`;
}

function inferImageAltText(data = {}, index = 0) {
  const title = String(data.title || data.caption || data.label || '').trim();
  if (title) return title;
  const url = String(data.url || '').trim();
  const filename = url.split('/').pop()?.split('?')[0]?.split('#')[0] || '';
  const withoutExtension = filename.replace(/\.[a-z0-9]{2,8}$/i, '');
  const cleaned = withoutExtension.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned || `Image ${index + 1}`;
}

export function fixComposerDuplicateActivityIds(activities) {
  const list = Array.isArray(activities) ? activities : [];
  const seen = new Set();
  let changed = false;
  let fixedCount = 0;

  const nextActivities = list.map((activity, index) => {
    const next = cloneActivity(activity);
    const currentId = String(activity?.id || '').trim();
    if (!currentId || seen.has(currentId)) {
      next.id = buildActivityId(activity?.type, index);
      changed = true;
      fixedCount += 1;
      seen.add(next.id);
      return next;
    }
    seen.add(currentId);
    return next;
  });

  return { activities: nextActivities, changed, fixedCount };
}

export function fixComposerImageAltText(activities) {
  const list = Array.isArray(activities) ? activities : [];
  let changed = false;
  let fixedCount = 0;

  const nextActivities = list.map((activity, index) => {
    if (activity?.type !== 'image_block') return activity;
    const data = activity?.data && typeof activity.data === 'object' ? activity.data : {};
    if (String(data.alt || '').trim()) return activity;
    changed = true;
    fixedCount += 1;
    return {
      ...activity,
      data: {
        ...data,
        alt: inferImageAltText(data, index),
      },
    };
  });

  return { activities: nextActivities, changed, fixedCount };
}

export function fixComposerMobileStacking(activities, { breakpoint = 'mobile' } = {}) {
  const list = Array.isArray(activities) ? activities : [];
  let changed = false;
  let fixedCount = 0;

  const nextActivities = list.map((activity) => {
    const layout = activity?.layout && typeof activity.layout === 'object' ? activity.layout : null;
    if (!layout) return activity;
    const breakpoints = layout.breakpoints && typeof layout.breakpoints === 'object' ? layout.breakpoints : {};
    const currentOverride = breakpoints[breakpoint] && typeof breakpoints[breakpoint] === 'object' ? breakpoints[breakpoint] : null;
    if (currentOverride && Object.keys(currentOverride).length > 0) return activity;

    const isCanvas = Number.isInteger(layout?.x) || Number.isInteger(layout?.w) || Number.isInteger(layout?.h);
    const baseSpan = Number.isInteger(layout?.colSpan) ? layout.colSpan : (Number.isInteger(layout?.w) ? layout.w : 1);
    if (baseSpan <= 1) return activity;

    changed = true;
    fixedCount += 1;
    return {
      ...activity,
      layout: {
        ...layout,
        breakpoints: {
          ...breakpoints,
          [breakpoint]: isCanvas
            ? {
                ...(currentOverride || {}),
                x: 0,
                w: 1,
              }
            : {
                ...(currentOverride || {}),
                col: 1,
                colSpan: 1,
              },
        },
      },
    };
  });

  return { activities: nextActivities, changed, fixedCount };
}
