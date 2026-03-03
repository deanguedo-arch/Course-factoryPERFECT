export const COMPOSER_MIN_COLUMNS = 1;
export const COMPOSER_MAX_COLUMNS = 4;
export const COMPOSER_DEFAULT_COLUMNS = 1;
export const COMPOSER_DEFAULT_COL_SPAN = 1;
export const COMPOSER_DEFAULT_MODE = 'simple';
export const COMPOSER_DEFAULT_ROW_HEIGHT = 24;
export const COMPOSER_DEFAULT_MARGIN = [12, 12];
export const COMPOSER_DEFAULT_CONTAINER_PADDING = [12, 12];
export const COMPOSER_DEFAULT_SIMPLE_MATCH_TALLEST_ROW = false;
export const COMPOSER_RESPONSIVE_BREAKPOINTS = ['tablet', 'mobile'];

const ACTIVITY_PADDING_VALUES = ['sm', 'md', 'lg'];
const ACTIVITY_VARIANT_VALUES = ['card', 'flat'];
const ACTIVITY_TITLE_VARIANT_VALUES = ['xs', 'sm', 'md', 'lg', 'xl'];

function toInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toPositiveInteger(value, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, parsed);
}

function toNonNegativeInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, parsed);
}

function clampInteger(value, min, max, fallback) {
  const parsed = toInteger(value, fallback);
  return Math.max(min, Math.min(max, parsed));
}

function isFiniteInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed);
}

function slotKey(row, col) {
  return `${row}:${col}`;
}

function normalizeSpacingPair(value, fallback = [12, 12]) {
  const source = Array.isArray(value) ? value : fallback;
  const first = clampInteger(source[0], 0, 200, fallback[0]);
  const second = clampInteger(source[1], 0, 200, fallback[1]);
  return [first, second];
}

function normalizeComposerLayoutMode(value) {
  const raw = String(value || '').trim().toLowerCase();
  return raw === 'canvas' ? 'canvas' : 'simple';
}

function normalizeActivityVariant(value) {
  const raw = String(value || '').trim().toLowerCase();
  return ACTIVITY_VARIANT_VALUES.includes(raw) ? raw : 'card';
}

function normalizeActivityPadding(value) {
  const raw = String(value || '').trim().toLowerCase();
  return ACTIVITY_PADDING_VALUES.includes(raw) ? raw : 'md';
}

function normalizeActivityTitleVariant(value) {
  const raw = String(value || '').trim().toLowerCase();
  return ACTIVITY_TITLE_VARIANT_VALUES.includes(raw) ? raw : 'md';
}

function hasOwnResponsiveValue(layout, keys) {
  if (!layout || typeof layout !== 'object') return false;
  return keys.some((key) => Object.prototype.hasOwnProperty.call(layout, key) && layout[key] !== '' && layout[key] !== null);
}

function normalizeActivityStyle(style) {
  const next = style && typeof style === 'object' ? { ...style } : {};
  next.border = next.border !== false;
  next.variant = normalizeActivityVariant(next.variant);
  next.padding = normalizeActivityPadding(next.padding);
  next.titleVariant = normalizeActivityTitleVariant(next.titleVariant);
  return next;
}

function normalizeActivityBehavior(behavior) {
  const next = behavior && typeof behavior === 'object' ? { ...behavior } : {};
  next.collapsible = next.collapsible === true;
  next.collapsedByDefault = next.collapsible ? next.collapsedByDefault === true : false;
  return next;
}

export function clampComposerColumns(value) {
  const next = toInteger(value, COMPOSER_DEFAULT_COLUMNS);
  return Math.max(COMPOSER_MIN_COLUMNS, Math.min(COMPOSER_MAX_COLUMNS, next));
}

export function clampComposerColSpan(value, maxColumns = COMPOSER_DEFAULT_COLUMNS) {
  const nextMax = clampComposerColumns(maxColumns);
  const next = toInteger(value, COMPOSER_DEFAULT_COL_SPAN);
  return Math.max(COMPOSER_DEFAULT_COL_SPAN, Math.min(nextMax, next));
}

export function clampComposerRow(value) {
  return toPositiveInteger(value, 1);
}

export function clampComposerColStart(value, maxColumns = COMPOSER_DEFAULT_COLUMNS, colSpan = COMPOSER_DEFAULT_COL_SPAN) {
  const nextMax = clampComposerColumns(maxColumns);
  const nextSpan = clampComposerColSpan(colSpan, nextMax);
  const maxStartCol = Math.max(1, nextMax - nextSpan + 1);
  const parsed = toPositiveInteger(value, 1);
  return Math.min(parsed, maxStartCol);
}

export function clampCanvasW(value, maxColumns = COMPOSER_DEFAULT_COLUMNS) {
  return clampComposerColSpan(value, maxColumns);
}

export function clampCanvasX(value, maxColumns = COMPOSER_DEFAULT_COLUMNS, w = COMPOSER_DEFAULT_COL_SPAN) {
  const nextMax = clampComposerColumns(maxColumns);
  const nextW = clampCanvasW(w, nextMax);
  const maxStart = Math.max(0, nextMax - nextW);
  const parsed = toNonNegativeInteger(value, 0);
  return Math.min(parsed, maxStart);
}

export function clampCanvasY(value) {
  return toNonNegativeInteger(value, 0);
}

export function clampCanvasH(value) {
  return toPositiveInteger(value, 4);
}

export function normalizeComposerLayout(layout) {
  const next = layout && typeof layout === 'object' ? { ...layout } : {};
  next.mode = normalizeComposerLayoutMode(next.mode);
  next.maxColumns = clampComposerColumns(next.maxColumns);
  next.rowHeight = clampInteger(next.rowHeight, 8, 200, COMPOSER_DEFAULT_ROW_HEIGHT);
  next.margin = normalizeSpacingPair(next.margin, COMPOSER_DEFAULT_MARGIN);
  next.containerPadding = normalizeSpacingPair(next.containerPadding, COMPOSER_DEFAULT_CONTAINER_PADDING);
  next.simpleMatchTallestRow = next.simpleMatchTallestRow === true;
  return next;
}

function canPlace(occupied, row, col, colSpan, maxColumns) {
  if (row < 1 || col < 1) return false;
  if (col + colSpan - 1 > maxColumns) return false;
  for (let currentCol = col; currentCol < col + colSpan; currentCol += 1) {
    if (occupied.has(slotKey(row, currentCol))) return false;
  }
  return true;
}

function markOccupied(occupied, row, col, colSpan) {
  for (let currentCol = col; currentCol < col + colSpan; currentCol += 1) {
    occupied.add(slotKey(row, currentCol));
  }
}

function findNextAvailableCell(occupied, startRow, startCol, colSpan, maxColumns) {
  const maxStartCol = Math.max(1, maxColumns - colSpan + 1);
  let row = Math.max(1, startRow);
  let col = Math.max(1, startCol);
  if (col > maxStartCol) {
    row += 1;
    col = 1;
  }

  while (true) {
    if (col > maxStartCol) {
      row += 1;
      col = 1;
      continue;
    }
    if (canPlace(occupied, row, col, colSpan, maxColumns)) {
      return { row, col };
    }
    col += 1;
    if (col > maxColumns) {
      row += 1;
      col = 1;
    }
  }
}

function normalizeSimpleLayout(rawLayout, maxColumns) {
  const layout = rawLayout && typeof rawLayout === 'object' ? { ...rawLayout } : {};
  delete layout.breakpoints;
  delete layout.hidden;
  layout.colSpan = clampComposerColSpan(layout.colSpan, maxColumns);

  if (isFiniteInteger(layout.row)) {
    layout.row = toPositiveInteger(layout.row, 1);
  } else {
    delete layout.row;
  }

  if (isFiniteInteger(layout.col)) {
    layout.col = toPositiveInteger(layout.col, 1);
  } else {
    delete layout.col;
  }

  layout.w = clampCanvasW(layout.w ?? layout.colSpan, maxColumns);
  layout.x = clampCanvasX(layout.x ?? ((layout.col || 1) - 1), maxColumns, layout.w);
  layout.y = clampCanvasY(layout.y ?? ((layout.row || 1) - 1));
  layout.h = clampCanvasH(layout.h);
  return layout;
}

function normalizeCanvasLayout(rawLayout, maxColumns) {
  const layout = rawLayout && typeof rawLayout === 'object' ? { ...rawLayout } : {};
  delete layout.breakpoints;
  delete layout.hidden;
  layout.w = clampCanvasW(layout.w ?? layout.colSpan, maxColumns);
  layout.h = clampCanvasH(layout.h);
  layout.x = clampCanvasX(layout.x ?? ((layout.col || 1) - 1), maxColumns, layout.w);
  layout.y = clampCanvasY(layout.y ?? ((layout.row || 1) - 1));
  layout.colSpan = clampComposerColSpan(layout.colSpan ?? layout.w, maxColumns);
  layout.col = clampComposerColStart((layout.col || layout.x + 1), maxColumns, layout.colSpan);
  layout.row = clampComposerRow(layout.row || layout.y + 1);
  return layout;
}

function normalizeResponsiveLayoutOverride(rawLayout, maxColumns, mode, baseLayout) {
  const raw = rawLayout && typeof rawLayout === 'object' ? { ...rawLayout } : null;
  if (!raw) return null;

  const hidden = raw.hidden === true;
  if (mode === 'canvas') {
    const hasLayoutValue = hasOwnResponsiveValue(raw, ['x', 'y', 'w', 'h', 'colSpan', 'col', 'row']);
    if (!hasLayoutValue && !hidden) return null;
    const normalized = normalizeCanvasLayout(
      {
        ...(baseLayout && typeof baseLayout === 'object' ? baseLayout : {}),
        ...raw,
      },
      maxColumns,
    );
    if (hidden) {
      normalized.hidden = true;
    }
    return normalized;
  }

  const hasLayoutValue = hasOwnResponsiveValue(raw, ['colSpan', 'row', 'col']);
  if (!hasLayoutValue && !hidden) return null;
  const normalized = normalizeSimpleLayout(
    {
      ...(baseLayout && typeof baseLayout === 'object' ? baseLayout : {}),
      ...raw,
    },
    maxColumns,
  );
  if (hidden) {
    normalized.hidden = true;
  }
  return normalized;
}

function normalizeResponsiveLayoutOverrides(rawBreakpoints, maxColumns, mode, baseLayout) {
  const source = rawBreakpoints && typeof rawBreakpoints === 'object' ? rawBreakpoints : null;
  if (!source) return null;
  const next = {};

  COMPOSER_RESPONSIVE_BREAKPOINTS.forEach((breakpoint) => {
    const normalized = normalizeResponsiveLayoutOverride(source[breakpoint], maxColumns, mode, baseLayout);
    if (normalized) {
      next[breakpoint] = normalized;
    }
  });

  return Object.keys(next).length > 0 ? next : null;
}

export function getComposerActivityBreakpointOverride(activity, breakpoint, { maxColumns = COMPOSER_DEFAULT_COLUMNS, mode = COMPOSER_DEFAULT_MODE } = {}) {
  const normalizedBreakpoint = String(breakpoint || '').trim().toLowerCase();
  if (!COMPOSER_RESPONSIVE_BREAKPOINTS.includes(normalizedBreakpoint)) return null;
  const normalizedActivity = normalizeComposerActivityShape(activity, 0, maxColumns, mode);
  const override = normalizedActivity?.layout?.breakpoints?.[normalizedBreakpoint];
  return override && typeof override === 'object' ? { ...override } : null;
}

export function resolveComposerActivityLayoutForBreakpoint(
  activity,
  breakpoint,
  { maxColumns = COMPOSER_DEFAULT_COLUMNS, mode = COMPOSER_DEFAULT_MODE } = {},
) {
  const normalizedActivity = normalizeComposerActivityShape(activity, 0, maxColumns, mode);
  const normalizedBreakpoint = String(breakpoint || 'desktop').trim().toLowerCase();
  const baseLayout = normalizedActivity?.layout && typeof normalizedActivity.layout === 'object' ? { ...normalizedActivity.layout } : {};
  const baseBreakpoints = baseLayout.breakpoints && typeof baseLayout.breakpoints === 'object' ? baseLayout.breakpoints : {};
  delete baseLayout.breakpoints;

  if (!COMPOSER_RESPONSIVE_BREAKPOINTS.includes(normalizedBreakpoint)) {
    return {
      ...baseLayout,
      hidden: false,
      hasOverride: false,
    };
  }

  const override = baseBreakpoints[normalizedBreakpoint];
  if (!override || typeof override !== 'object') {
    return {
      ...baseLayout,
      hidden: false,
      hasOverride: false,
    };
  }

  return {
    ...baseLayout,
    ...override,
    hidden: override.hidden === true,
    hasOverride: true,
  };
}

function normalizeComposerActivityShape(activity, index, maxColumns = COMPOSER_DEFAULT_COLUMNS, mode = COMPOSER_DEFAULT_MODE) {
  const next = activity && typeof activity === 'object' ? { ...activity } : {};
  next.type = next.type || 'content_block';
  next.id = next.id || `activity-${index + 1}`;
  next.data = next.data && typeof next.data === 'object' ? next.data : {};
  next.style = normalizeActivityStyle(next.style);
  next.behavior = normalizeActivityBehavior(next.behavior);
  const rawLayout = next.layout && typeof next.layout === 'object' ? { ...next.layout } : {};
  const rawBreakpointLayouts = rawLayout.breakpoints;

  if (mode === 'canvas') {
    next.layout = normalizeCanvasLayout(rawLayout, maxColumns);
  } else {
    next.layout = normalizeSimpleLayout(rawLayout, maxColumns);
  }

  const normalizedBreakpoints = normalizeResponsiveLayoutOverrides(rawBreakpointLayouts, maxColumns, mode, next.layout);
  if (normalizedBreakpoints) {
    next.layout.breakpoints = normalizedBreakpoints;
  }
  return next;
}

function compactSimplePlacementRows(placements) {
  if (!(placements instanceof Map) || placements.size === 0) return placements;

  const rows = Array.from(placements.values())
    .map((placement) => clampComposerRow(placement?.row || 1))
    .sort((a, b) => a - b)
    .filter((row, index, list) => index === 0 || row !== list[index - 1]);

  if (rows.length <= 1) return placements;

  const rowMap = new Map(rows.map((row, index) => [row, index + 1]));
  const compacted = new Map();
  placements.forEach((placement, index) => {
    const sourceRow = clampComposerRow(placement?.row || 1);
    compacted.set(index, {
      ...placement,
      row: rowMap.get(sourceRow) || sourceRow,
    });
  });
  return compacted;
}

function packComposerActivities(activities, maxColumns = COMPOSER_DEFAULT_COLUMNS, { fixedPlacement } = {}) {
  const nextMax = clampComposerColumns(maxColumns);
  const nextActivities = Array.isArray(activities)
    ? activities.map((activity, idx) => normalizeComposerActivityShape(activity, idx, nextMax, 'simple'))
    : [];

  if (nextActivities.length === 0) return [];

  const entries = nextActivities.map((activity, index) => {
    const colSpan = clampComposerColSpan(activity?.layout?.colSpan, nextMax);
    const anchorRow = clampComposerRow(activity?.layout?.row || 1);
    const anchorCol = clampComposerColStart(activity?.layout?.col || 1, nextMax, colSpan);
    return {
      index,
      colSpan,
      anchorRow,
      anchorCol,
    };
  });

  const fixedIndex = Number.isInteger(fixedPlacement?.index) ? fixedPlacement.index : null;
  const occupied = new Set();
  const placed = new Map();

  if (fixedIndex !== null && fixedIndex >= 0 && fixedIndex < entries.length) {
    const fixedEntry = entries[fixedIndex];
    const targetRow = clampComposerRow(fixedPlacement?.row || fixedEntry.anchorRow);
    const targetCol = clampComposerColStart(fixedPlacement?.col || fixedEntry.anchorCol, nextMax, fixedEntry.colSpan);
    const fixedCell = findNextAvailableCell(occupied, targetRow, targetCol, fixedEntry.colSpan, nextMax);
    placed.set(fixedEntry.index, { row: fixedCell.row, col: fixedCell.col, colSpan: fixedEntry.colSpan });
    markOccupied(occupied, fixedCell.row, fixedCell.col, fixedEntry.colSpan);
  }

  const sorted = entries
    .filter((entry) => entry.index !== fixedIndex)
    .sort((a, b) => {
      if (a.anchorRow !== b.anchorRow) return a.anchorRow - b.anchorRow;
      if (a.anchorCol !== b.anchorCol) return a.anchorCol - b.anchorCol;
      return a.index - b.index;
    });

  sorted.forEach((entry) => {
    const cell = findNextAvailableCell(occupied, entry.anchorRow, entry.anchorCol, entry.colSpan, nextMax);
    placed.set(entry.index, { row: cell.row, col: cell.col, colSpan: entry.colSpan });
    markOccupied(occupied, cell.row, cell.col, entry.colSpan);
  });

  const compactedPlacements = compactSimplePlacementRows(placed);

  return nextActivities.map((activity, index) => {
    const placement = compactedPlacements.get(index) || {
      row: clampComposerRow(activity?.layout?.row || 1),
      col: clampComposerColStart(activity?.layout?.col || 1, nextMax, activity?.layout?.colSpan || 1),
      colSpan: clampComposerColSpan(activity?.layout?.colSpan, nextMax),
    };
    return {
      ...activity,
      layout: {
        ...(activity.layout || {}),
        colSpan: placement.colSpan,
        row: placement.row,
        col: placement.col,
        w: clampCanvasW(activity?.layout?.w ?? placement.colSpan, nextMax),
        h: clampCanvasH(activity?.layout?.h),
        x: clampCanvasX(activity?.layout?.x ?? placement.col - 1, nextMax, activity?.layout?.w ?? placement.colSpan),
        y: clampCanvasY(activity?.layout?.y ?? placement.row - 1),
      },
    };
  });
}

function collides(a, b) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

function canPlaceCanvas(rect, placed) {
  return !placed.some((candidate) => collides(rect, candidate));
}

export function validateComposerCanvasProposal(
  activities,
  activeIndex,
  proposal,
  { maxColumns = COMPOSER_DEFAULT_COLUMNS } = {},
) {
  const nextMax = clampComposerColumns(maxColumns);
  const rect = {
    x: toInteger(proposal?.x, 0),
    y: toInteger(proposal?.y, 0),
    w: toInteger(proposal?.w ?? proposal?.colSpan, 1),
    h: toInteger(proposal?.h, 1),
  };

  if (rect.w < 1 || rect.h < 1 || rect.x < 0 || rect.y < 0 || rect.x + rect.w > nextMax) {
    return { valid: false, reason: 'bounds', rect };
  }

  const siblings = Array.isArray(activities)
    ? activities
        .map((activity, index) => ({ activity, index }))
        .filter(({ index }) => index !== activeIndex)
        .map(({ activity, index }) => {
          const normalized = normalizeComposerActivityShape(activity, index, nextMax, 'canvas');
          return {
            index,
            x: toInteger(normalized?.layout?.x, 0),
            y: toInteger(normalized?.layout?.y, 0),
            w: toInteger(normalized?.layout?.w, 1),
            h: toInteger(normalized?.layout?.h, 1),
          };
        })
    : [];

  const collision = siblings.find((candidate) => collides(rect, candidate));
  if (collision) {
    return {
      valid: false,
      reason: 'collision',
      rect,
      collisionIndex: collision.index,
    };
  }

  return { valid: true, reason: null, rect };
}

function simpleRangesOverlap(aStart, aSpan, bStart, bSpan) {
  const aEnd = aStart + aSpan - 1;
  const bEnd = bStart + bSpan - 1;
  return !(aEnd < bStart || bEnd < aStart);
}

export function validateComposerSimpleProposal(
  activities,
  activeIndex,
  proposal,
  { maxColumns = COMPOSER_DEFAULT_COLUMNS } = {},
) {
  const nextMax = clampComposerColumns(maxColumns);
  const requestedRow = toInteger(proposal?.row, 1);
  const requestedCol = toInteger(proposal?.col, 1);
  const requestedSpan = toInteger(proposal?.colSpan, 1);

  const layout = {
    row: clampComposerRow(requestedRow),
    colSpan: clampComposerColSpan(requestedSpan, nextMax),
  };
  layout.col = clampComposerColStart(requestedCol, nextMax, 1);

  if (requestedRow < 1 || requestedCol < 1 || requestedSpan < 1) {
    return { valid: false, reason: 'bounds', layout };
  }

  const siblings = Array.isArray(activities)
    ? activities
        .map((activity, index) => ({ activity, index }))
        .filter(({ index }) => index !== activeIndex)
        .map(({ activity, index }) => {
          const normalized = normalizeComposerActivityShape(activity, index, nextMax, 'simple');
          return {
            index,
            row: clampComposerRow(normalized?.layout?.row || 1),
            col: clampComposerColStart(normalized?.layout?.col || 1, nextMax, normalized?.layout?.colSpan || 1),
            colSpan: clampComposerColSpan(normalized?.layout?.colSpan, nextMax),
          };
        })
    : [];

  const rowSiblings = siblings.filter((candidate) => candidate.row === layout.row);
  const occupied = new Set();
  rowSiblings.forEach((candidate) => {
    const end = candidate.col + candidate.colSpan - 1;
    for (let col = candidate.col; col <= end; col += 1) {
      occupied.add(col);
    }
  });

  let availableSpan = 0;
  for (let col = layout.col; col <= nextMax; col += 1) {
    if (occupied.has(col)) break;
    availableSpan += 1;
  }
  if (availableSpan < 1) {
    const collision = rowSiblings.find((candidate) =>
      simpleRangesOverlap(layout.col, 1, candidate.col, candidate.colSpan),
    );
    return {
      valid: false,
      reason: 'collision',
      layout: {
        ...layout,
        colSpan: 1,
      },
      collisionIndex: collision?.index,
    };
  }

  const fittedSpan = Math.max(1, Math.min(layout.colSpan, availableSpan));
  return {
    valid: true,
    reason: fittedSpan < layout.colSpan ? 'autofit' : null,
    layout: {
      ...layout,
      colSpan: fittedSpan,
    },
    fitted: fittedSpan < layout.colSpan,
  };
}

function normalizeCanvasActivities(activities, maxColumns = COMPOSER_DEFAULT_COLUMNS) {
  const nextMax = clampComposerColumns(maxColumns);
  const normalized = Array.isArray(activities)
    ? activities.map((activity, idx) => normalizeComposerActivityShape(activity, idx, nextMax, 'canvas'))
    : [];

  if (!normalized.length) return [];

  const sorted = normalized
    .map((activity, index) => ({
      index,
      x: clampCanvasX(activity.layout?.x, nextMax, activity.layout?.w),
      y: clampCanvasY(activity.layout?.y),
      w: clampCanvasW(activity.layout?.w, nextMax),
      h: clampCanvasH(activity.layout?.h),
    }))
    .sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      if (a.x !== b.x) return a.x - b.x;
      return a.index - b.index;
    });

  const placed = [];
  sorted.forEach((item) => {
    let y = item.y;
    let x = item.x;
    const rect = { ...item };

    while (true) {
      rect.x = clampCanvasX(x, nextMax, rect.w);
      rect.y = clampCanvasY(y);
      if (canPlaceCanvas(rect, placed)) {
        placed.push({ ...rect });
        break;
      }
      y += 1;
    }
  });

  // Keep intentional gaps in canvas mode so authors can create breathing room between blocks.
  const placementByIndex = new Map(placed.map((item) => [item.index, item]));

  return normalized.map((activity, index) => {
    const placement = placementByIndex.get(index) || {
      x: 0,
      y: 0,
      w: 1,
      h: 4,
    };
    const colSpan = clampComposerColSpan(activity?.layout?.colSpan ?? placement.w, nextMax);
    return {
      ...activity,
      layout: {
        ...(activity.layout || {}),
        x: placement.x,
        y: placement.y,
        w: placement.w,
        h: placement.h,
        colSpan,
        col: clampComposerColStart(activity?.layout?.col || placement.x + 1, nextMax, colSpan),
        row: clampComposerRow(activity?.layout?.row || placement.y + 1),
      },
    };
  });
}

export function normalizeComposerActivity(activity, index, maxColumns = COMPOSER_DEFAULT_COLUMNS, mode = COMPOSER_DEFAULT_MODE) {
  return normalizeComposerActivityShape(activity, index, maxColumns, mode);
}

export function normalizeComposerActivities(activities, { maxColumns = COMPOSER_DEFAULT_COLUMNS, mode = COMPOSER_DEFAULT_MODE } = {}) {
  const nextMax = clampComposerColumns(maxColumns);
  const nextMode = normalizeComposerLayoutMode(mode);
  if (!Array.isArray(activities)) return [];
  return nextMode === 'canvas' ? normalizeCanvasActivities(activities, nextMax) : packComposerActivities(activities, nextMax);
}

export function normalizeComposerModuleConfig(moduleLike) {
  const composerLayout = normalizeComposerLayout(moduleLike?.composerLayout);
  const activities = normalizeComposerActivities(moduleLike?.activities, {
    maxColumns: composerLayout.maxColumns,
    mode: composerLayout.mode,
  });
  return { composerLayout, activities };
}

export function buildComposerGridModel(
  activities,
  maxColumns = COMPOSER_DEFAULT_COLUMNS,
  { includeTrailingRow = true, trailingRows = 0 } = {},
) {
  const nextMax = clampComposerColumns(maxColumns);
  const normalized = normalizeComposerActivities(activities, { maxColumns: nextMax, mode: 'simple' });
  const placements = normalized.map((activity, index) => ({
    index,
    row: clampComposerRow(activity?.layout?.row || 1),
    col: clampComposerColStart(activity?.layout?.col || 1, nextMax, activity?.layout?.colSpan || 1),
    colSpan: clampComposerColSpan(activity?.layout?.colSpan, nextMax),
  }));

  const occupied = new Set();
  placements.forEach((placement) => {
    markOccupied(occupied, placement.row, placement.col, placement.colSpan);
  });

  const highestRow = placements.reduce((maxRow, placement) => Math.max(maxRow, placement.row), 1);
  const normalizedTrailingRows = Number.isInteger(trailingRows) ? Math.max(0, trailingRows) : 0;
  const effectiveTrailingRows = includeTrailingRow ? normalizedTrailingRows : 0;
  const baseRows = placements.length > 0 ? highestRow : 1;
  const rowCount = Math.max(1, baseRows + effectiveTrailingRows);

  const emptySlots = [];
  for (let row = 1; row <= rowCount; row += 1) {
    for (let col = 1; col <= nextMax; col += 1) {
      if (occupied.has(slotKey(row, col))) continue;
      emptySlots.push({
        key: `slot-${row}-${col}`,
        row,
        col,
      });
    }
  }

  return {
    maxColumns: nextMax,
    rowCount,
    placements,
    emptySlots,
  };
}

export function moveComposerActivityToCell(
  activities,
  fromIndex,
  row,
  col,
  { maxColumns = COMPOSER_DEFAULT_COLUMNS } = {},
) {
  const nextMax = clampComposerColumns(maxColumns);
  const normalized = normalizeComposerActivities(activities, { maxColumns: nextMax, mode: 'simple' });
  if (!Number.isInteger(fromIndex) || fromIndex < 0 || fromIndex >= normalized.length) {
    return { activities: normalized, toIndex: fromIndex, changed: false };
  }

  const selected = normalized[fromIndex];
  const selectedSpan = clampComposerColSpan(selected?.layout?.colSpan, nextMax);
  const targetRow = clampComposerRow(row || selected?.layout?.row || 1);
  const targetCol = clampComposerColStart(col || selected?.layout?.col || 1, nextMax, selectedSpan);

  const moved = packComposerActivities(normalized, nextMax, {
    fixedPlacement: {
      index: fromIndex,
      row: targetRow,
      col: targetCol,
    },
  });

  const changed = moved.some((activity, index) => {
    const prev = normalized[index];
    const prevLayout = prev?.layout || {};
    const nextLayout = activity?.layout || {};
    return (
      prevLayout.row !== nextLayout.row ||
      prevLayout.col !== nextLayout.col ||
      prevLayout.colSpan !== nextLayout.colSpan
    );
  });

  return {
    activities: moved,
    toIndex: fromIndex,
    changed,
  };
}

export function moveComposerActivityToInsertion(
  activities,
  fromIndex,
  insertionIndex,
  { maxColumns = COMPOSER_DEFAULT_COLUMNS } = {},
) {
  if (!Array.isArray(activities)) return { activities: [], toIndex: 0, changed: false };
  if (!Number.isInteger(fromIndex) || !Number.isInteger(insertionIndex)) {
    return { activities, toIndex: fromIndex, changed: false };
  }
  if (fromIndex < 0 || fromIndex >= activities.length) {
    return { activities, toIndex: fromIndex, changed: false };
  }

  const boundedInsertion = Math.max(0, Math.min(activities.length, insertionIndex));
  const next = [...activities];
  const [moved] = next.splice(fromIndex, 1);

  let targetIndex = boundedInsertion;
  if (targetIndex > fromIndex) targetIndex -= 1;
  targetIndex = Math.max(0, Math.min(next.length, targetIndex));

  if (targetIndex === fromIndex) {
    return { activities: normalizeComposerActivities(activities, { maxColumns, mode: 'simple' }), toIndex: fromIndex, changed: false };
  }

  next.splice(targetIndex, 0, moved);
  const normalized = normalizeComposerActivities(next, { maxColumns, mode: 'simple' });
  return {
    activities: normalized,
    toIndex: targetIndex,
    changed: true,
  };
}
