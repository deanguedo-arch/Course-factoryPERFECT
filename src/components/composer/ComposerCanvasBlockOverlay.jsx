import * as React from 'react';
import {
  GripVertical,
  Plus,
} from 'lucide-react';
import {
  moveComposerActivityToCell,
  validateComposerSimpleProposal,
  validateComposerCanvasProposal,
} from '../../composer/layout.js';

function escapeSelectorAttr(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

function parseCssPx(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampInteger(value, min, max) {
  const parsed = Math.round(Number(value) || 0);
  return Math.max(min, Math.min(max, parsed));
}

function isFrameClose(left, right, tolerance = 10) {
  if (!left || !right) return false;
  return (
    Math.abs((Number(left.left) || 0) - (Number(right.left) || 0)) <= tolerance &&
    Math.abs((Number(left.top) || 0) - (Number(right.top) || 0)) <= tolerance &&
    Math.abs((Number(left.width) || 0) - (Number(right.width) || 0)) <= tolerance &&
    Math.abs((Number(left.height) || 0) - (Number(right.height) || 0)) <= tolerance
  );
}

function resolveEdgeScrollDelta(pointerClientY, top, bottom, threshold = 72, maxStep = 36) {
  const safeTop = Number(top) || 0;
  const safeBottom = Number(bottom) || 0;
  const safeThreshold = Math.max(24, Number(threshold) || 72);
  const safeStep = Math.max(8, Number(maxStep) || 36);
  if (safeBottom <= safeTop) return 0;
  if (pointerClientY < safeTop + safeThreshold) {
    const ratio = Math.min(1, (safeTop + safeThreshold - pointerClientY) / safeThreshold);
    return -Math.max(6, Math.round(ratio * safeStep));
  }
  if (pointerClientY > safeBottom - safeThreshold) {
    const ratio = Math.min(1, (pointerClientY - (safeBottom - safeThreshold)) / safeThreshold);
    return Math.max(6, Math.round(ratio * safeStep));
  }
  return 0;
}

function scrollElementByDelta(element, deltaY) {
  if (!element || !Number.isFinite(deltaY) || deltaY === 0) return false;
  const before = Number(element.scrollTop) || 0;
  const maxScrollTop = Math.max(0, (Number(element.scrollHeight) || 0) - (Number(element.clientHeight) || 0));
  const next = Math.max(0, Math.min(maxScrollTop, before + deltaY));
  if (Math.abs(next - before) < 0.5) return false;
  element.scrollTop = next;
  return true;
}

function autoScrollDragSurface({ clientY, iframe, viewport }) {
  if (!Number.isFinite(clientY)) return false;
  const viewportRect = viewport?.getBoundingClientRect?.();
  if (!viewportRect) return false;
  const viewportDelta = resolveEdgeScrollDelta(clientY, viewportRect.top, viewportRect.bottom, 72, 34);
  if (!viewportDelta) return false;

  const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document || null;
  const iframeScrollRoot =
    iframeDoc?.scrollingElement ||
    iframeDoc?.documentElement ||
    iframeDoc?.body ||
    null;
  const scrolledIframe = scrollElementByDelta(iframeScrollRoot, viewportDelta);
  const scrolledViewport = scrolledIframe ? false : scrollElementByDelta(viewport, viewportDelta);
  return scrolledIframe || scrolledViewport;
}

function resolveSimpleNodeRow(node, win) {
  const attrRow = Number.parseInt(node?.getAttribute?.('data-composer-row'), 10);
  if (Number.isFinite(attrRow) && attrRow >= 1) return attrRow;

  const attrY = Number.parseInt(node?.getAttribute?.('data-composer-y'), 10);
  if (Number.isFinite(attrY) && attrY >= 0) return attrY + 1;

  const inlineRowStart = Number.parseInt(node?.style?.gridRowStart, 10);
  if (Number.isFinite(inlineRowStart) && inlineRowStart >= 1) return inlineRowStart;

  const inlineGridRowStart = Number.parseInt(String(node?.style?.gridRow || '').split('/')[0], 10);
  if (Number.isFinite(inlineGridRowStart) && inlineGridRowStart >= 1) return inlineGridRowStart;

  const computed = win?.getComputedStyle?.(node);
  const computedRowStart = Number.parseInt(computed?.gridRowStart, 10);
  if (Number.isFinite(computedRowStart) && computedRowStart >= 1) return computedRowStart;

  const computedGridRowStart = Number.parseInt(String(computed?.gridRow || '').split('/')[0], 10);
  if (Number.isFinite(computedGridRowStart) && computedGridRowStart >= 1) return computedGridRowStart;

  return 1;
}

function buildSimpleRowBands(root, iframeRect, viewportRect, win) {
  let nodes = Array.from(root?.children || []).filter((node) => node?.hasAttribute?.('data-activity-id'));
  if (!nodes.length) {
    nodes = Array.from(root?.querySelectorAll?.(':scope > [data-activity-id]') || []);
  }
  if (!nodes.length) {
    nodes = Array.from(root?.querySelectorAll?.('[data-activity-id]') || []);
  }
  const grouped = new Map();
  const positions = [];

  nodes.forEach((node) => {
    const row = resolveSimpleNodeRow(node, win);
    const rect = node.getBoundingClientRect();
    const topClient = iframeRect.top + rect.top;
    const bottomClient = iframeRect.top + rect.bottom;
    const top = topClient - viewportRect.top;
    const bottom = bottomClient - viewportRect.top;
    positions.push({ topClient, bottomClient });
    const existing = grouped.get(row) || {
      row,
      top,
      bottom,
      topClient,
      bottomClient,
    };
    existing.top = Math.min(existing.top, top);
    existing.bottom = Math.max(existing.bottom, bottom);
    existing.topClient = Math.min(existing.topClient, topClient);
    existing.bottomClient = Math.max(existing.bottomClient, bottomClient);
    grouped.set(row, existing);
  });

  if (grouped.size > 1 || positions.length <= 1) {
    return Array.from(grouped.values()).sort((left, right) => left.row - right.row);
  }

  // Fallback for imported/simple markup that does not carry row attributes.
  const sorted = positions
    .slice()
    .sort((left, right) => left.topClient - right.topClient);
  const inferred = [];
  const topTolerance = 14;

  sorted.forEach((entry) => {
    const match = inferred.find((band) => Math.abs(entry.topClient - band.topClient) <= topTolerance);
    if (match) {
      match.bottomClient = Math.max(match.bottomClient, entry.bottomClient);
      return;
    }
    inferred.push({
      topClient: entry.topClient,
      bottomClient: entry.bottomClient,
    });
  });

  return inferred.map((band, index) => ({
    row: index + 1,
    top: band.topClient - viewportRect.top,
    bottom: band.bottomClient - viewportRect.top,
    topClient: band.topClient,
    bottomClient: band.bottomClient,
  }));
}

function computeGridMetrics({ doc, iframe, maxColumns = 1, viewport }) {
  const win = iframe?.contentWindow;
  const root = doc?.querySelector?.('[data-composer-root]');
  if (!win || !root || !viewport) return null;

  const styles = win.getComputedStyle(root);
  const iframeRect = iframe.getBoundingClientRect();
  const viewportRect = viewport.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const cols = Math.max(1, Number.parseInt(root.getAttribute('data-composer-columns'), 10) || maxColumns || 1);
  const scaleX = root.offsetWidth > 0 ? rootRect.width / root.offsetWidth : 1;
  const scaleY = root.offsetHeight > 0 ? rootRect.height / root.offsetHeight : scaleX;
  const gapX = parseCssPx(styles.columnGap || styles.gap, 0) * scaleX;
  const gapY = parseCssPx(styles.rowGap || styles.gap, 0) * scaleY;
  const paddingLeft = parseCssPx(styles.paddingLeft, 0) * scaleX;
  const paddingRight = parseCssPx(styles.paddingRight, 0) * scaleX;
  const paddingTop = parseCssPx(styles.paddingTop, 0) * scaleY;
  const paddingBottom = parseCssPx(styles.paddingBottom, 0) * scaleY;
  const rowHeight = Math.max(1, parseCssPx(styles.gridAutoRows, 24) * scaleY);
  const rootClientLeft = iframeRect.left + rootRect.left;
  const rootClientTop = iframeRect.top + rootRect.top;
  const rootOverlayLeft = rootClientLeft - viewportRect.left;
  const rootOverlayTop = rootClientTop - viewportRect.top;
  const contentWidth = Math.max(1, rootRect.width - paddingLeft - paddingRight);
  const columnWidth = Math.max(1, (contentWidth - gapX * Math.max(0, cols - 1)) / cols);

  return {
    cols,
    columnWidth,
    contentWidth,
    doc,
    gapX,
    gapY,
    iframeRect,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingTop,
    root,
    rootClientLeft,
    rootClientTop,
    rootOverlayLeft,
    rootOverlayTop,
    rowBands: buildSimpleRowBands(root, iframeRect, viewportRect, win),
    rowHeight,
    scaleX,
    scaleY,
    viewportRect,
  };
}

function frameFromCanvasLayout(layout, metrics) {
  if (!layout || !metrics) return null;
  const x = Number.parseInt(layout.x, 10) || 0;
  const y = Number.parseInt(layout.y, 10) || 0;
  const w = Math.max(1, Number.parseInt(layout.w, 10) || 1);
  const h = Math.max(1, Number.parseInt(layout.h, 10) || 1);
  return {
    left: metrics.rootOverlayLeft + metrics.paddingLeft + x * (metrics.columnWidth + metrics.gapX),
    top: metrics.rootOverlayTop + metrics.paddingTop + y * (metrics.rowHeight + metrics.gapY),
    width: w * metrics.columnWidth + Math.max(0, w - 1) * metrics.gapX,
    height: h * metrics.rowHeight + Math.max(0, h - 1) * metrics.gapY,
  };
}

function resolveSimpleRowTop(row, metrics, fallbackHeight) {
  const bands = Array.isArray(metrics?.rowBands) ? metrics.rowBands : [];
  const targetRow = Math.max(1, Number.parseInt(row, 10) || 1);
  const direct = bands.find((band) => band.row === targetRow);
  if (direct) return direct.top;
  if (!bands.length) return metrics.rootOverlayTop + metrics.paddingTop;
  const last = bands[bands.length - 1];
  const step = Math.max(32, fallbackHeight + metrics.gapY);
  if (targetRow > last.row) {
    return last.bottom + metrics.gapY + (targetRow - last.row - 1) * step;
  }
  return bands[0].top;
}

function frameFromSimpleLayout(layout, metrics, fallbackHeight) {
  if (!layout || !metrics) return null;
  const row = Math.max(1, Number.parseInt(layout.row, 10) || 1);
  const colSpan = clampInteger(layout.colSpan, 1, metrics.cols);
  const col = clampInteger(layout.col, 1, Math.max(1, metrics.cols - colSpan + 1));
  const height = Math.max(64, Number.parseFloat(fallbackHeight) || 160);
  return {
    left: metrics.rootOverlayLeft + metrics.paddingLeft + (col - 1) * (metrics.columnWidth + metrics.gapX),
    top: resolveSimpleRowTop(row, metrics, height),
    width: colSpan * metrics.columnWidth + Math.max(0, colSpan - 1) * metrics.gapX,
    height,
  };
}

function resolveSimpleRowFromClientY(clientY, metrics, fallbackRow, fallbackHeight) {
  const targetY = Number(clientY) || 0;
  const bands = Array.isArray(metrics?.rowBands) ? metrics.rowBands : [];
  if (!bands.length) return Math.max(1, Number.parseInt(fallbackRow, 10) || 1);

  const first = bands[0];
  if (targetY <= first.topClient) {
    return first.row;
  }

  for (let index = 0; index < bands.length - 1; index += 1) {
    const current = bands[index];
    const next = bands[index + 1];
    const midpoint = current.bottomClient + (next.topClient - current.bottomClient) / 2;
    if (targetY <= midpoint) return current.row;
  }

  const last = bands[bands.length - 1];
  if (targetY <= last.bottomClient) {
    return last.row;
  }
  const step = Math.max(32, Number(fallbackHeight) || (last.bottomClient - last.topClient) || 120);
  return last.row + Math.max(1, Math.round((targetY - last.bottomClient) / step));
}

function buildSimpleRowCandidates(targetRow, targetY, metrics) {
  const parsedTargetRow = Math.max(1, Number.parseInt(targetRow, 10) || 1);
  const parsedTargetY = Number(targetY) || 0;
  const bands = Array.isArray(metrics?.rowBands) ? metrics.rowBands : [];
  const maxBandRow = bands.reduce((largest, band) => Math.max(largest, Math.max(1, Number.parseInt(band?.row, 10) || 1)), 1);
  const upperBound = Math.max(maxBandRow + 2, parsedTargetRow + 6, 6);
  const ranked = [];

  for (let row = 1; row <= upperBound; row += 1) {
    const rowCenter = estimateSimpleRowCenterClient(row, metrics);
    ranked.push({
      row,
      distance: Math.abs(parsedTargetY - rowCenter),
      rowDelta: Math.abs(row - parsedTargetRow),
    });
  }

  ranked.sort((left, right) => {
    if (left.distance !== right.distance) return left.distance - right.distance;
    if (left.rowDelta !== right.rowDelta) return left.rowDelta - right.rowDelta;
    return left.row - right.row;
  });

  return ranked.map((entry) => entry.row);
}

function buildSimpleColCandidates(targetCol, maxColumns) {
  const cols = Math.max(1, Number.parseInt(maxColumns, 10) || 1);
  const parsedTargetCol = clampInteger(targetCol, 1, cols);
  const candidates = [];
  const seen = new Set();
  const pushCandidate = (value) => {
    const col = clampInteger(value, 1, cols);
    if (seen.has(col)) return;
    seen.add(col);
    candidates.push(col);
  };

  pushCandidate(parsedTargetCol);
  for (let offset = 1; offset < cols; offset += 1) {
    pushCandidate(parsedTargetCol - offset);
    pushCandidate(parsedTargetCol + offset);
  }

  return candidates;
}

function estimateSimpleRowCenterClient(row, metrics) {
  const targetRow = Math.max(1, Number.parseInt(row, 10) || 1);
  const bands = Array.isArray(metrics?.rowBands) ? metrics.rowBands : [];
  const defaultStep = Math.max(
    32,
    Number(metrics?.rowHeight) || 0,
    (Number(metrics?.rowHeight) || 0) + (Number(metrics?.gapY) || 0),
  );

  if (!bands.length) {
    const baseTop = Number(metrics?.rootClientTop) + Number(metrics?.paddingTop);
    return baseTop + (targetRow - 0.5) * defaultStep;
  }

  const normalized = bands
    .map((band) => ({
      row: Math.max(1, Number.parseInt(band?.row, 10) || 1),
      topClient: Number(band?.topClient) || 0,
      bottomClient: Number(band?.bottomClient) || 0,
    }))
    .sort((left, right) => left.row - right.row);

  const direct = normalized.find((band) => band.row === targetRow);
  if (direct) return (direct.topClient + direct.bottomClient) / 2;

  const first = normalized[0];
  const last = normalized[normalized.length - 1];
  const inferredStep = Math.max(
    defaultStep,
    (Number(last.bottomClient) - Number(last.topClient)) || 0,
  );

  if (targetRow < first.row) {
    return first.topClient - (first.row - targetRow - 0.5) * inferredStep;
  }

  if (targetRow > last.row) {
    return last.bottomClient + (targetRow - last.row - 0.5) * inferredStep;
  }

  for (let index = 0; index < normalized.length - 1; index += 1) {
    const current = normalized[index];
    const next = normalized[index + 1];
    if (targetRow <= current.row || targetRow >= next.row) continue;
    const fraction = (targetRow - current.row) / Math.max(1, next.row - current.row);
    const currentCenter = (current.topClient + current.bottomClient) / 2;
    const nextCenter = (next.topClient + next.bottomClient) / 2;
    return currentCenter + (nextCenter - currentCenter) * fraction;
  }

  return (first.topClient + first.bottomClient) / 2;
}

function evaluateSimpleDragPlacements(activities, selectedIndex, proposal, metrics, targetY) {
  const initial = validateComposerSimpleProposal(activities, selectedIndex, proposal, { maxColumns: metrics.cols });
  const rowCandidates = buildSimpleRowCandidates(proposal?.row, targetY, metrics);
  const colCandidates = buildSimpleColCandidates(proposal?.col, metrics?.cols);
  const targetYClient = Number(targetY) || 0;
  const colStep = Math.max(1, Number(metrics?.columnWidth) + Number(metrics?.gapX));
  const proposalCol = clampInteger(proposal?.col, 1, Math.max(1, Number(metrics?.cols) || 1));
  const proposalRow = Math.max(1, Number.parseInt(proposal?.row, 10) || 1);
  const proposalSpan = clampInteger(proposal?.colSpan, 1, Math.max(1, Number(metrics?.cols) || 1));
  const sameRowRanked = [];
  const strictRanked = [];
  const fittedRanked = [];
  const ranked = [];
  const seen = new Set();
  const baseActivities = Array.isArray(activities)
    ? activities.map((activity, index) =>
        index === selectedIndex
          ? {
              ...activity,
              layout: {
                ...(activity?.layout || {}),
                colSpan: proposalSpan,
              },
            }
          : activity,
      )
    : [];

  for (const candidateRow of rowCandidates) {
    for (const candidateCol of colCandidates) {
      const moved = moveComposerActivityToCell(
        baseActivities,
        selectedIndex,
        candidateRow,
        candidateCol,
        { maxColumns: metrics.cols },
      );
      const layout = moved?.activities?.[selectedIndex]?.layout || null;
      if (!layout) continue;
      const key = `${Math.max(1, Number.parseInt(layout.row, 10) || 1)}-${Math.max(1, Number.parseInt(layout.col, 10) || 1)}-${Math.max(1, Number.parseInt(layout.colSpan, 10) || 1)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const rowCenter = estimateSimpleRowCenterClient(layout.row, metrics);
      const rowDistance = Math.abs(targetYClient - rowCenter);
      const colDistance = Math.abs((Number.parseInt(layout.col, 10) || 1) - proposalCol) * colStep;
      const fitted = Math.max(1, Number.parseInt(layout.colSpan, 10) || 1) < proposalSpan;
      const fittedPenalty = fitted ? colStep * 0.8 : 0;
      const score = rowDistance + colDistance + fittedPenalty;
      const validation = {
        valid: true,
        reason: fitted ? 'autofit' : null,
        fitted,
        layout: {
          row: Math.max(1, Number.parseInt(layout.row, 10) || 1),
          col: Math.max(1, Number.parseInt(layout.col, 10) || 1),
          colSpan: Math.max(1, Number.parseInt(layout.colSpan, 10) || 1),
        },
      };
      const entry = { score, validation };
      if ((validation.layout?.row || 1) === proposalRow) {
        sameRowRanked.push(entry);
      }
      if (fitted) {
        fittedRanked.push(entry);
      } else {
        strictRanked.push(entry);
      }
      ranked.push(entry);
    }
  }

  sameRowRanked.sort((left, right) => left.score - right.score);
  strictRanked.sort((left, right) => left.score - right.score);
  fittedRanked.sort((left, right) => left.score - right.score);
  ranked.sort((left, right) => left.score - right.score);
  return {
    initial,
    sameRowRanked,
    strictRanked,
    fittedRanked,
    ranked,
  };
}

function resolveSimpleDragValidation(activities, selectedIndex, proposal, metrics, targetY) {
  const evaluation = evaluateSimpleDragPlacements(activities, selectedIndex, proposal, metrics, targetY);
  const bestOverall = evaluation.ranked[0];
  const bestSameRow = evaluation.sameRowRanked[0];

  if (!bestOverall) {
    return bestSameRow?.validation || evaluation.initial;
  }
  if (!bestSameRow) {
    return bestOverall.validation || evaluation.initial;
  }

  const tieAllowance = Math.max(16, Number(metrics?.rowHeight || 0) * 0.45);
  if ((bestSameRow.score || 0) <= (bestOverall.score || 0) + tieAllowance) {
    return bestSameRow.validation || evaluation.initial;
  }
  return bestOverall.validation || evaluation.initial;
}

function buildSimpleDropHintFrames(evaluation, metrics, fallbackHeight, limit = 8) {
  if (!evaluation || !Array.isArray(evaluation.ranked) || evaluation.ranked.length === 0) return [];
  const maxHints = Math.max(1, Number.parseInt(limit, 10) || 8);
  const frames = [];
  for (let index = 0; index < evaluation.ranked.length && frames.length < maxHints; index += 1) {
    const candidate = evaluation.ranked[index];
    const layout = candidate?.validation?.layout;
    if (!layout) continue;
    const frame = frameFromSimpleLayout(layout, metrics, fallbackHeight);
    if (!frame) continue;
    frames.push({
      key: `${layout.row}-${layout.col}-${layout.colSpan}-${index}`,
      left: frame.left,
      top: frame.top,
      width: frame.width,
      height: frame.height,
      isPrimary: index === 0,
    });
  }
  return frames;
}

function formatLayoutChip(layout, isCanvasMode) {
  if (!layout || typeof layout !== 'object') return '';
  if (isCanvasMode) {
    const x = Math.max(0, Number.parseInt(layout.x, 10) || 0);
    const y = Math.max(0, Number.parseInt(layout.y, 10) || 0);
    return `X${x} Y${y}`;
  }
  const row = Math.max(1, Number.parseInt(layout.row, 10) || 1);
  const col = Math.max(1, Number.parseInt(layout.col, 10) || 1);
  return `R${row} C${col}`;
}

export default function ComposerCanvasBlockOverlay({
  activities = [],
  hidden = false,
  iframeRef,
  isCanvasMode = false,
  maxColumns = 1,
  onCanvasLayoutChange,
  onOpenAddPanel,
  onSimpleLayoutChange,
  selectedActivity = null,
  selectedActivityId = '',
  selectedIndex = -1,
  selectedLabel = 'Section',
  syncKey = '',
  viewportRef,
}) {
  const [frame, setFrame] = React.useState(null);
  const [draftFrame, setDraftFrame] = React.useState(null);
  const [draftChip, setDraftChip] = React.useState('');
  const [previewKind, setPreviewKind] = React.useState('idle');
  const [simpleDropHints, setSimpleDropHints] = React.useState([]);
  const metricsRef = React.useRef(null);
  const interactionCleanupRef = React.useRef(null);
  const commitSettleUntilRef = React.useRef(0);
  const commitExpectedFrameRef = React.useRef(null);

  const clearInteraction = React.useCallback(() => {
    commitSettleUntilRef.current = 0;
    commitExpectedFrameRef.current = null;
    interactionCleanupRef.current?.();
    interactionCleanupRef.current = null;
    setPreviewKind('idle');
    setDraftChip('');
    setSimpleDropHints([]);
  }, []);

  const updateFrame = React.useCallback(() => {
    const isSettlingCommit = commitSettleUntilRef.current > Date.now();
    if (hidden) {
      metricsRef.current = null;
      setFrame(null);
      setSimpleDropHints([]);
      return;
    }
    const targetId = String(selectedActivityId || '').trim();
    const iframe = iframeRef?.current;
    const viewport = viewportRef?.current;
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (!targetId || !iframe || !viewport || !doc) {
      metricsRef.current = null;
      if (!isSettlingCommit) {
        setFrame(null);
      }
      setSimpleDropHints([]);
      return;
    }

    const target = doc.querySelector(`[data-activity-id="${escapeSelectorAttr(targetId)}"]`);
    if (!target) {
      metricsRef.current = null;
      if (!isSettlingCommit) {
        setFrame(null);
      }
      setSimpleDropHints([]);
      return;
    }

    const targetRect = target.getBoundingClientRect();
    const iframeRect = iframe.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const metrics = computeGridMetrics({ doc, iframe, maxColumns, viewport });
    metricsRef.current = metrics;

    const nextFrame = {
      left: targetRect.left + iframeRect.left - viewportRect.left,
      top: targetRect.top + iframeRect.top - viewportRect.top,
      width: targetRect.width,
      height: targetRect.height,
    };
    const expectedCommittedFrame = commitExpectedFrameRef.current;
    if (isSettlingCommit && expectedCommittedFrame && !isFrameClose(nextFrame, expectedCommittedFrame)) {
      return;
    }
    if (!isSettlingCommit) {
      commitExpectedFrameRef.current = null;
    }
    setFrame(nextFrame);
  }, [hidden, iframeRef, maxColumns, selectedActivityId, viewportRef]);

  React.useEffect(() => {
    updateFrame();
    if (hidden) return undefined;

    const iframe = iframeRef?.current;
    const viewport = viewportRef?.current;
    const win = iframe?.contentWindow;
    const doc = iframe?.contentDocument || win?.document;
    if (!iframe || !viewport || !win || !doc) return undefined;

    let rafId = 0;
    const pollId = window.setInterval(updateFrame, 120);
    const queueUpdate = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateFrame();
      });
    };

    const MutationObserverCtor = win.MutationObserver || window.MutationObserver;
    const mutationObserver = MutationObserverCtor ? new MutationObserverCtor(queueUpdate) : null;
    const resizeObserver = new ResizeObserver(queueUpdate);
    const mutationTarget = doc.body || doc.documentElement || null;
    const canObserveMutations = Boolean(
      mutationObserver &&
      mutationTarget &&
      typeof mutationTarget === 'object' &&
      'nodeType' in mutationTarget &&
      Number(mutationTarget.nodeType) > 0
    );

    win.addEventListener('scroll', queueUpdate, { passive: true });
    iframe.addEventListener('load', queueUpdate);
    viewport.addEventListener('scroll', queueUpdate, { passive: true });
    doc.addEventListener('scroll', queueUpdate, true);
    doc.addEventListener('wheel', queueUpdate, { passive: true, capture: true });
    window.addEventListener('scroll', queueUpdate, true);
    window.addEventListener('wheel', queueUpdate, { passive: true, capture: true });
    window.addEventListener('resize', queueUpdate);
    if (canObserveMutations) {
      mutationObserver.observe(mutationTarget, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }
    resizeObserver.observe(viewport);
    resizeObserver.observe(iframe);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.clearInterval(pollId);
      win.removeEventListener('scroll', queueUpdate);
      iframe.removeEventListener('load', queueUpdate);
      viewport.removeEventListener('scroll', queueUpdate);
      doc.removeEventListener('scroll', queueUpdate, true);
      doc.removeEventListener('wheel', queueUpdate, true);
      window.removeEventListener('scroll', queueUpdate, true);
      window.removeEventListener('wheel', queueUpdate, true);
      window.removeEventListener('resize', queueUpdate);
      mutationObserver?.disconnect();
      resizeObserver.disconnect();
    };
  }, [hidden, iframeRef, selectedActivityId, syncKey, updateFrame, viewportRef]);

  React.useEffect(() => {
    setDraftFrame(null);
    setSimpleDropHints([]);
    clearInteraction();
  }, [clearInteraction, selectedActivityId, syncKey]);

  React.useEffect(
    () => () => {
      clearInteraction();
    },
    [clearInteraction],
  );

  if (hidden || !frame || !selectedActivity) return null;

  const layout = selectedActivity.layout || {};
  const colSpan = Math.max(1, Number.parseInt(layout.colSpan, 10) || 1);
  const x = Math.max(0, Number.parseInt(layout.x, 10) || 0);
  const y = Math.max(0, Number.parseInt(layout.y, 10) || 0);
  const w = Math.max(1, Number.parseInt(layout.w, 10) || 1);
  const h = Math.max(1, Number.parseInt(layout.h, 10) || 1);
  const row = Math.max(1, Number.parseInt(layout.row, 10) || y + 1);
  const col = Math.max(1, Number.parseInt(layout.col, 10) || x + 1);
  const activeFrame = draftFrame || frame;
  const positionChip = draftChip || formatLayoutChip(isCanvasMode ? { x, y } : { row, col }, isCanvasMode);
  const isInvalidPreview = previewKind === 'canvas-invalid' || previewKind === 'simple-invalid';

  const beginPointerInteraction = (operation) => (event) => {
    if (!selectedActivity) return;
    const readMetrics = () =>
      computeGridMetrics({
        doc: iframeRef?.current?.contentDocument || iframeRef?.current?.contentWindow?.document,
        iframe: iframeRef?.current,
        maxColumns,
        viewport: viewportRef?.current,
      });
    const metrics = metricsRef.current || readMetrics();
    if (!metrics || !viewportRef?.current) return;
    metricsRef.current = metrics;

    clearInteraction();
    event.preventDefault();
    event.stopPropagation();

    const handleElement = event.currentTarget;
    const startFrame = draftFrame || frame;
    const startFrameClientLeft = startFrame.left + metrics.viewportRect.left;
    const startFrameClientTop = startFrame.top + metrics.viewportRect.top;
    const startLayout = isCanvasMode
      ? { x, y, w, h, colSpan: w }
      : { row, col, colSpan };
    const startOffsetX = event.clientX - startFrameClientLeft;
    const startOffsetY = event.clientY - startFrameClientTop;
    let lastProposal = null;
    let lastProposalValid = false;
    let lastPreviewFrame = startFrame;
    const iframeElement = iframeRef?.current;
    const previousPointerEvents = iframeElement?.style?.pointerEvents ?? '';
    if (iframeElement?.style) {
      iframeElement.style.pointerEvents = 'none';
    }
    const restoreIframePointerEvents = () => {
      if (!iframeElement?.style) return;
      iframeElement.style.pointerEvents = previousPointerEvents;
    };

    const handleMove = (moveEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      autoScrollDragSurface({
        clientY: moveEvent.clientY,
        iframe: iframeRef?.current,
        viewport: viewportRef?.current,
      });
      const activeMetrics = readMetrics() || metricsRef.current || metrics;
      if (!activeMetrics) return;
      metricsRef.current = activeMetrics;
      const stepX = Math.max(1, activeMetrics.columnWidth + activeMetrics.gapX);
      const stepY = Math.max(1, activeMetrics.rowHeight + activeMetrics.gapY);
      const baselineCols = Math.max(1, metrics.cols);

      let proposal = null;
      let nextFrame = null;

      if (isCanvasMode) {
        setSimpleDropHints([]);
        if (operation === 'drag') {
          const proposedLeft = moveEvent.clientX - startOffsetX;
          const proposedTop = moveEvent.clientY - startOffsetY;
          proposal = {
            ...startLayout,
            x: Math.round((proposedLeft - (activeMetrics.rootClientLeft + activeMetrics.paddingLeft)) / stepX),
            y: Math.round((proposedTop - (activeMetrics.rootClientTop + activeMetrics.paddingTop)) / stepY),
          };
        } else if (operation === 'resize-x') {
          const nextW = Math.max(1, startLayout.w + Math.round((moveEvent.clientX - event.clientX) / stepX));
          proposal = {
            ...startLayout,
            w: nextW,
            colSpan: nextW,
            x: startLayout.x,
          };
        } else {
          const nextW = Math.max(1, startLayout.w + Math.round((moveEvent.clientX - event.clientX) / stepX));
          const nextH = Math.max(1, Math.round(startLayout.h + (moveEvent.clientY - event.clientY) / stepY));
          proposal = {
            ...startLayout,
            w: nextW,
            h: nextH,
            colSpan: nextW,
            x: startLayout.x,
          };
        }
        const validation = validateComposerCanvasProposal(activities, selectedIndex, proposal, { maxColumns: activeMetrics.cols });
        const collisionCanResolve = validation.reason === 'collision';
        const canApply = validation.valid || collisionCanResolve;
        lastProposal = validation.rect;
        lastProposalValid = canApply;
        nextFrame = frameFromCanvasLayout(validation.rect, activeMetrics);
        setPreviewKind(canApply ? 'canvas-valid' : 'canvas-invalid');
        if (!nextFrame) return;
        lastPreviewFrame = nextFrame;
        setDraftFrame(nextFrame);
        setDraftChip(canApply ? formatLayoutChip(validation.rect, true) : 'Blocked');
        return;
      } else if (operation === 'drag') {
        const proposedLeft = moveEvent.clientX - startOffsetX;
        const nextSpan = clampInteger(startLayout.colSpan, 1, activeMetrics.cols);
        proposal = {
          row: resolveSimpleRowFromClientY(
            moveEvent.clientY,
            activeMetrics,
            startLayout.row,
            startFrame.height + activeMetrics.gapY,
          ),
          col: clampInteger(
            Math.round((proposedLeft - (activeMetrics.rootClientLeft + activeMetrics.paddingLeft)) / stepX) + 1,
            1,
            Math.max(1, activeMetrics.cols || baselineCols),
          ),
          colSpan: nextSpan,
        };
        const simpleEvaluation = evaluateSimpleDragPlacements(
          activities,
          selectedIndex,
          proposal,
          activeMetrics,
          moveEvent.clientY,
        );
        const validation = resolveSimpleDragValidation(activities, selectedIndex, proposal, activeMetrics, moveEvent.clientY);
        lastProposal = validation.layout;
        lastProposalValid = validation.valid;
        nextFrame = frameFromSimpleLayout(validation.layout, activeMetrics, startFrame.height);
        setSimpleDropHints(buildSimpleDropHintFrames(simpleEvaluation, activeMetrics, startFrame.height));
        setPreviewKind(validation.valid ? 'simple-valid' : 'simple-invalid');
        if (!nextFrame) return;
        lastPreviewFrame = nextFrame;
        setDraftFrame(nextFrame);
        setDraftChip(validation.valid ? formatLayoutChip(validation.layout, false) : 'Blocked');
        return;
      } else {
        setSimpleDropHints([]);
        const nextSpan = clampInteger(
          startLayout.colSpan + Math.round((moveEvent.clientX - event.clientX) / stepX),
          1,
          activeMetrics.cols,
        );
        proposal = {
          row: startLayout.row,
          col: clampInteger(startLayout.col, 1, Math.max(1, activeMetrics.cols - nextSpan + 1)),
          colSpan: nextSpan,
        };
        const validation = validateComposerSimpleProposal(activities, selectedIndex, proposal, { maxColumns: activeMetrics.cols });
        lastProposal = validation.layout;
        lastProposalValid = validation.valid;
        nextFrame = frameFromSimpleLayout(validation.layout, activeMetrics, startFrame.height);
        setPreviewKind(validation.valid ? 'simple-valid' : 'simple-invalid');
        if (!nextFrame) return;
        lastPreviewFrame = nextFrame;
        setDraftFrame(nextFrame);
        setDraftChip(validation.valid ? formatLayoutChip(validation.layout, false) : 'Blocked');
        return;
      }

    };

    const finishInteraction = (endEvent, { commit = true } = {}) => {
      endEvent?.preventDefault?.();
      endEvent?.stopPropagation?.();
      try {
        handleElement.releasePointerCapture?.(event.pointerId);
      } catch {
        // Ignore release failures.
      }
      restoreIframePointerEvents();
      handleElement.removeEventListener('pointermove', handleMove);
      handleElement.removeEventListener('pointerup', handleUp);
      handleElement.removeEventListener('pointercancel', handleCancel);
      window.removeEventListener('blur', handleCancel);
      interactionCleanupRef.current = null;

      const shouldCommitCanvas = Boolean(commit && isCanvasMode && lastProposal && lastProposalValid);
      const shouldCommitSimpleLayout = Boolean(commit && !isCanvasMode && lastProposal && lastProposalValid);

      if (shouldCommitCanvas) {
        onCanvasLayoutChange?.(lastProposal, {
          interaction: operation === 'drag' ? 'drag' : 'resize',
        });
      } else if (shouldCommitSimpleLayout) {
        onSimpleLayoutChange?.(lastProposal);
      }

      if (shouldCommitCanvas || shouldCommitSimpleLayout) {
        commitExpectedFrameRef.current = lastPreviewFrame;
        commitSettleUntilRef.current = Date.now() + 320;
        window.setTimeout(() => {
          setFrame(lastPreviewFrame);
          setDraftFrame(null);
          setPreviewKind('idle');
          setDraftChip('');
          setSimpleDropHints([]);
          updateFrame();
        }, 120);
        return;
      }
      setDraftFrame(null);
      setPreviewKind('idle');
      setDraftChip('');
      setSimpleDropHints([]);
      updateFrame();
    };

    const handleUp = (upEvent) => finishInteraction(upEvent, { commit: true });
    const handleCancel = (cancelEvent) => finishInteraction(cancelEvent, { commit: false });

    handleElement.addEventListener('pointermove', handleMove);
    handleElement.addEventListener('pointerup', handleUp);
    handleElement.addEventListener('pointercancel', handleCancel);
    window.addEventListener('blur', handleCancel);
    handleElement.setPointerCapture?.(event.pointerId);
    interactionCleanupRef.current = () => {
      try {
        handleElement.releasePointerCapture?.(event.pointerId);
      } catch {
        // Ignore release failures.
      }
      restoreIframePointerEvents();
      handleElement.removeEventListener('pointermove', handleMove);
      handleElement.removeEventListener('pointerup', handleUp);
      handleElement.removeEventListener('pointercancel', handleCancel);
      window.removeEventListener('blur', handleCancel);
      setDraftFrame(null);
      setPreviewKind('idle');
      setDraftChip('');
      setSimpleDropHints([]);
    };
  };

  const toolbarTop = activeFrame.top > 44 ? activeFrame.top - 36 : Math.max(8, Math.min(activeFrame.top + 8, activeFrame.top + activeFrame.height - 40));
  const toolbarLeft = Math.max(8, Math.min(activeFrame.left + 8, activeFrame.left + Math.max(8, activeFrame.width - 220)));
  const addTop = Math.max(8, Math.min(activeFrame.top + activeFrame.height - 42, activeFrame.top + activeFrame.height - 42));
  const addLeft = Math.max(8, Math.min(activeFrame.left + 8, activeFrame.left + Math.max(8, activeFrame.width - 120)));
  const rightHandleLeft = Math.max(6, activeFrame.left + activeFrame.width - 10);
  const rightHandleTop = Math.max(6, activeFrame.top + activeFrame.height / 2 - 14);
  const cornerHandleLeft = Math.max(6, activeFrame.left + activeFrame.width - 12);
  const cornerHandleTop = Math.max(6, activeFrame.top + activeFrame.height - 12);

  return (
    <>
      {!isCanvasMode && simpleDropHints.length > 0
        ? simpleDropHints.map((hint) => (
            <div
              key={hint.key}
              className={`cf-composer-drop-slot absolute z-[18] ${hint.isPrimary ? 'is-primary' : ''}`}
              style={{
                left: `${hint.left}px`,
                top: `${hint.top}px`,
                width: `${hint.width}px`,
                height: `${hint.height}px`,
              }}
            />
          ))
        : null}

      <div
        className={`cf-composer-block-outline absolute z-20 ${draftFrame ? 'is-draft' : ''} ${isInvalidPreview ? 'is-invalid' : ''}`}
        style={{
          left: `${activeFrame.left}px`,
          top: `${activeFrame.top}px`,
          width: `${activeFrame.width}px`,
          height: `${activeFrame.height}px`,
        }}
      />

      <div
        className={`cf-composer-block-overlay pointer-events-auto absolute z-30 inline-flex max-w-[calc(100%-16px)] items-center gap-1.5 ${isInvalidPreview ? 'is-invalid' : ''}`}
        style={{
          left: `${toolbarLeft}px`,
          top: `${toolbarTop}px`,
        }}
      >
        <span className="cf-composer-block-overlay-label">{selectedLabel}</span>
        <span className={`cf-composer-block-overlay-chip ${isInvalidPreview ? 'is-invalid' : ''}`}>{positionChip}</span>
        <button
          type="button"
          onPointerDown={beginPointerInteraction('drag')}
          className={`cf-composer-block-overlay-grip cf-canvas-handle ${isInvalidPreview ? 'is-invalid' : ''}`}
          style={{ touchAction: 'none' }}
          title="Drag section"
          aria-label="Drag section"
        >
          <GripVertical size={13} />
        </button>
      </div>

      <button
        type="button"
        onPointerDown={beginPointerInteraction('resize-x')}
        className={`cf-composer-block-handle pointer-events-auto absolute z-30 ${isInvalidPreview ? 'is-invalid' : ''}`}
        style={{
          left: `${rightHandleLeft}px`,
          top: `${rightHandleTop}px`,
          width: '18px',
          height: '28px',
          cursor: 'ew-resize',
          touchAction: 'none',
        }}
        title={isCanvasMode ? 'Drag to resize width' : 'Drag to change section width'}
      />

      {isCanvasMode ? (
        <button
          type="button"
          onPointerDown={beginPointerInteraction('resize-both')}
          className={`cf-composer-block-handle cf-composer-block-handle-corner pointer-events-auto absolute z-30 ${isInvalidPreview ? 'is-invalid' : ''}`}
          style={{
            left: `${cornerHandleLeft}px`,
            top: `${cornerHandleTop}px`,
            width: '20px',
            height: '20px',
            cursor: 'nwse-resize',
            touchAction: 'none',
          }}
          title="Drag to resize width and height"
        />
      ) : null}

      <button
        type="button"
        onClick={() => onOpenAddPanel?.()}
        className="cf-btn cf-btn-secondary pointer-events-auto absolute z-30 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{
          left: `${addLeft}px`,
          top: `${addTop}px`,
        }}
        title="Open add section drawer"
      >
        <Plus size={12} />
        Add Section
      </button>
    </>
  );
}
