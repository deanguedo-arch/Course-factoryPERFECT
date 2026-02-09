export const COMPOSER_MIN_COLUMNS = 1;
export const COMPOSER_MAX_COLUMNS = 4;
export const COMPOSER_DEFAULT_COLUMNS = 1;
export const COMPOSER_DEFAULT_COL_SPAN = 1;

function toInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toPositiveInteger(value, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, parsed);
}

function isFiniteInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed);
}

function slotKey(row, col) {
  return `${row}:${col}`;
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

function normalizeComposerActivityShape(activity, index, maxColumns = COMPOSER_DEFAULT_COLUMNS) {
  const next = activity && typeof activity === 'object' ? { ...activity } : {};
  const layout = next.layout && typeof next.layout === 'object' ? { ...next.layout } : {};

  next.type = next.type || 'content_block';
  next.id = next.id || `activity-${index + 1}`;
  next.data = next.data && typeof next.data === 'object' ? next.data : {};
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

  next.layout = layout;
  return next;
}

function packComposerActivities(activities, maxColumns = COMPOSER_DEFAULT_COLUMNS, { fixedPlacement } = {}) {
  const nextMax = clampComposerColumns(maxColumns);
  const nextActivities = Array.isArray(activities)
    ? activities.map((activity, idx) => normalizeComposerActivityShape(activity, idx, nextMax))
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

  return nextActivities.map((activity, index) => {
    const placement = placed.get(index) || {
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
      },
    };
  });
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

export function normalizeComposerLayout(layout) {
  const next = layout && typeof layout === 'object' ? { ...layout } : {};
  next.maxColumns = clampComposerColumns(next.maxColumns);
  return next;
}

export function normalizeComposerActivity(activity, index, maxColumns = COMPOSER_DEFAULT_COLUMNS) {
  return normalizeComposerActivityShape(activity, index, maxColumns);
}

export function normalizeComposerActivities(activities, { maxColumns = COMPOSER_DEFAULT_COLUMNS } = {}) {
  const nextMax = clampComposerColumns(maxColumns);
  if (!Array.isArray(activities)) return [];
  return packComposerActivities(activities, nextMax);
}

export function normalizeComposerModuleConfig(moduleLike) {
  const composerLayout = normalizeComposerLayout(moduleLike?.composerLayout);
  const activities = normalizeComposerActivities(moduleLike?.activities, {
    maxColumns: composerLayout.maxColumns,
  });
  return { composerLayout, activities };
}

export function buildComposerGridModel(
  activities,
  maxColumns = COMPOSER_DEFAULT_COLUMNS,
  { includeTrailingRow = true, trailingRows = 0 } = {},
) {
  const nextMax = clampComposerColumns(maxColumns);
  const normalized = normalizeComposerActivities(activities, { maxColumns: nextMax });
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
  const normalized = normalizeComposerActivities(activities, { maxColumns: nextMax });
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
    return { activities: normalizeComposerActivities(activities, { maxColumns }), toIndex: fromIndex, changed: false };
  }

  next.splice(targetIndex, 0, moved);
  const normalized = normalizeComposerActivities(next, { maxColumns });
  return {
    activities: normalized,
    toIndex: targetIndex,
    changed: true,
  };
}
