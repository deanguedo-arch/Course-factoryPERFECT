function cloneLayout(activity) {
  return {
    ...(activity?.layout && typeof activity.layout === 'object' ? activity.layout : {}),
  };
}

function updateActivityLayout(activity, updates) {
  return {
    ...activity,
    layout: {
      ...cloneLayout(activity),
      ...updates,
    },
  };
}

function getCanvasRect(activity) {
  const layout = cloneLayout(activity);
  const w = Math.max(1, Number.isInteger(layout.w) ? layout.w : Number.isInteger(layout.colSpan) ? layout.colSpan : 1);
  const h = Math.max(1, Number.isInteger(layout.h) ? layout.h : 4);
  return {
    x: Math.max(0, Number.isInteger(layout.x) ? layout.x : 0),
    y: Math.max(0, Number.isInteger(layout.y) ? layout.y : 0),
    w,
    h,
  };
}

function getSimpleLayout(activity) {
  const layout = cloneLayout(activity);
  return {
    row: Math.max(1, Number.isInteger(layout.row) ? layout.row : 1),
    col: Math.max(1, Number.isInteger(layout.col) ? layout.col : 1),
    colSpan: Math.max(1, Number.isInteger(layout.colSpan) ? layout.colSpan : 1),
  };
}

function mapSelectedActivities(activities, selectedIndexes, transform) {
  const selectedSet = new Set((Array.isArray(selectedIndexes) ? selectedIndexes : []).filter((index) => Number.isInteger(index)));
  if (selectedSet.size <= 1) return activities;
  return (Array.isArray(activities) ? activities : []).map((activity, index) => (
    selectedSet.has(index) ? transform(activity, index) : activity
  ));
}

function buildOrderedSelection(selectedIndexes, primaryIndex, comparator) {
  const list = (Array.isArray(selectedIndexes) ? selectedIndexes : []).filter((index) => Number.isInteger(index));
  if (!list.length) return [];
  const primary = list.includes(primaryIndex) ? primaryIndex : list[0];
  const remainder = list.filter((index) => index !== primary).sort(comparator);
  return [primary, ...remainder];
}

export function alignSelectedCanvasActivities(activities, selectedIndexes, primaryIndex, edge = 'left') {
  const primary = activities?.[primaryIndex];
  if (!primary) return activities;
  const primaryRect = getCanvasRect(primary);
  return mapSelectedActivities(activities, selectedIndexes, (activity) => {
    const rect = getCanvasRect(activity);
    if (edge === 'left') return updateActivityLayout(activity, { x: primaryRect.x });
    if (edge === 'right') return updateActivityLayout(activity, { x: Math.max(0, primaryRect.x + primaryRect.w - rect.w) });
    if (edge === 'top') return updateActivityLayout(activity, { y: primaryRect.y });
    if (edge === 'bottom') return updateActivityLayout(activity, { y: Math.max(0, primaryRect.y + primaryRect.h - rect.h) });
    return activity;
  });
}

export function distributeSelectedCanvasActivities(activities, selectedIndexes, axis = 'horizontal') {
  const indexes = (Array.isArray(selectedIndexes) ? selectedIndexes : []).filter((index) => Number.isInteger(index));
  if (indexes.length <= 2) return activities;

  const ordered = [...indexes].sort((a, b) => {
    const rectA = getCanvasRect(activities[a]);
    const rectB = getCanvasRect(activities[b]);
    return axis === 'vertical' ? (rectA.y - rectB.y || rectA.x - rectB.x) : (rectA.x - rectB.x || rectA.y - rectB.y);
  });

  const firstRect = getCanvasRect(activities[ordered[0]]);
  const lastRect = getCanvasRect(activities[ordered[ordered.length - 1]]);
  const totalSize = ordered.reduce((sum, index) => {
    const rect = getCanvasRect(activities[index]);
    return sum + (axis === 'vertical' ? rect.h : rect.w);
  }, 0);
  const span = axis === 'vertical'
    ? Math.max(0, lastRect.y + lastRect.h - firstRect.y)
    : Math.max(0, lastRect.x + lastRect.w - firstRect.x);
  const gap = Math.max(0, (span - totalSize) / (ordered.length - 1));

  let cursor = axis === 'vertical' ? firstRect.y : firstRect.x;
  const layoutByIndex = new Map();
  ordered.forEach((index) => {
    const rect = getCanvasRect(activities[index]);
    if (axis === 'vertical') {
      layoutByIndex.set(index, { y: Math.round(cursor) });
      cursor += rect.h + gap;
    } else {
      layoutByIndex.set(index, { x: Math.round(cursor) });
      cursor += rect.w + gap;
    }
  });

  return mapSelectedActivities(activities, ordered, (activity, index) => updateActivityLayout(activity, layoutByIndex.get(index) || {}));
}

export function matchSelectedCanvasActivitySize(activities, selectedIndexes, primaryIndex, dimension = 'width') {
  const primary = activities?.[primaryIndex];
  if (!primary) return activities;
  const primaryRect = getCanvasRect(primary);
  return mapSelectedActivities(activities, selectedIndexes, (activity) => (
    dimension === 'height'
      ? updateActivityLayout(activity, { h: primaryRect.h })
      : updateActivityLayout(activity, { w: primaryRect.w, colSpan: primaryRect.w })
  ));
}

export function stackSelectedCanvasActivities(activities, selectedIndexes, primaryIndex) {
  const primary = activities?.[primaryIndex];
  if (!primary) return activities;
  const primaryRect = getCanvasRect(primary);
  const ordered = buildOrderedSelection(
    selectedIndexes,
    primaryIndex,
    (a, b) => {
      const rectA = getCanvasRect(activities[a]);
      const rectB = getCanvasRect(activities[b]);
      return rectA.y - rectB.y || rectA.x - rectB.x || a - b;
    },
  );
  const layoutByIndex = new Map();
  let cursorY = primaryRect.y;
  ordered.forEach((index) => {
    const rect = getCanvasRect(activities[index]);
    layoutByIndex.set(index, { x: primaryRect.x, y: cursorY });
    cursorY += rect.h;
  });
  return mapSelectedActivities(activities, ordered, (activity, index) => updateActivityLayout(activity, layoutByIndex.get(index) || {}));
}

export function matchSelectedSimpleActivitySpan(activities, selectedIndexes, primaryIndex) {
  const primary = activities?.[primaryIndex];
  if (!primary) return activities;
  const primaryLayout = getSimpleLayout(primary);
  return mapSelectedActivities(activities, selectedIndexes, (activity) =>
    updateActivityLayout(activity, { colSpan: primaryLayout.colSpan, w: primaryLayout.colSpan }),
  );
}

export function stackSelectedSimpleActivities(activities, selectedIndexes, primaryIndex) {
  const primary = activities?.[primaryIndex];
  if (!primary) return activities;
  const primaryLayout = getSimpleLayout(primary);
  const ordered = buildOrderedSelection(
    selectedIndexes,
    primaryIndex,
    (a, b) => {
      const layoutA = getSimpleLayout(activities[a]);
      const layoutB = getSimpleLayout(activities[b]);
      return layoutA.row - layoutB.row || layoutA.col - layoutB.col || a - b;
    },
  );
  const layoutByIndex = new Map();
  ordered.forEach((index, offset) => {
    layoutByIndex.set(index, {
      row: primaryLayout.row + offset,
      col: primaryLayout.col,
    });
  });
  return mapSelectedActivities(activities, ordered, (activity, index) => updateActivityLayout(activity, layoutByIndex.get(index) || {}));
}
