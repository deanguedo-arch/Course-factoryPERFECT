import * as React from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Maximize2,
  Minimize2,
  Move,
  Plus,
  Trash2,
} from 'lucide-react';

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

function buildSimpleRowBands(doc, iframeRect, viewportRect) {
  const nodes = Array.from(doc?.querySelectorAll?.('[data-activity-id]') || []);
  const grouped = new Map();

  nodes.forEach((node) => {
    const row = Math.max(1, Number.parseInt(node.getAttribute('data-composer-row'), 10) || 1);
    const rect = node.getBoundingClientRect();
    const topClient = iframeRect.top + rect.top;
    const bottomClient = iframeRect.top + rect.bottom;
    const top = topClient - viewportRect.top;
    const bottom = bottomClient - viewportRect.top;
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

  return Array.from(grouped.values()).sort((left, right) => left.row - right.row);
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
    rowBands: buildSimpleRowBands(doc, iframeRect, viewportRect),
    rowHeight,
    scaleX,
    scaleY,
    viewportRect,
  };
}

function frameFromCanvasLayout(layout, metrics) {
  if (!layout || !metrics) return null;
  const x = Math.max(0, Number.parseInt(layout.x, 10) || 0);
  const y = Math.max(0, Number.parseInt(layout.y, 10) || 0);
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

export default function ComposerCanvasBlockOverlay({
  hidden = false,
  iframeRef,
  isCanvasMode = false,
  maxColumns = 1,
  onCanvasLayoutChange,
  onDelete,
  onDuplicate,
  onMove,
  onOpenAddPanel,
  onSimpleLayoutChange,
  onSpanChange,
  selectedActivity = null,
  selectedActivityId = '',
  selectedLabel = 'Section',
  syncKey = '',
  viewportRef,
}) {
  const [frame, setFrame] = React.useState(null);
  const [draftFrame, setDraftFrame] = React.useState(null);
  const metricsRef = React.useRef(null);
  const interactionCleanupRef = React.useRef(null);

  const clearInteraction = React.useCallback(() => {
    interactionCleanupRef.current?.();
    interactionCleanupRef.current = null;
  }, []);

  const updateFrame = React.useCallback(() => {
    if (hidden) {
      metricsRef.current = null;
      setFrame(null);
      return;
    }
    const targetId = String(selectedActivityId || '').trim();
    const iframe = iframeRef?.current;
    const viewport = viewportRef?.current;
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (!targetId || !iframe || !viewport || !doc) {
      metricsRef.current = null;
      setFrame(null);
      return;
    }

    const target = doc.querySelector(`[data-activity-id="${escapeSelectorAttr(targetId)}"]`);
    if (!target) {
      metricsRef.current = null;
      setFrame(null);
      return;
    }

    const targetRect = target.getBoundingClientRect();
    const iframeRect = iframe.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const metrics = computeGridMetrics({ doc, iframe, maxColumns, viewport });
    metricsRef.current = metrics;

    setFrame({
      left: targetRect.left + iframeRect.left - viewportRect.left,
      top: targetRect.top + iframeRect.top - viewportRect.top,
      width: targetRect.width,
      height: targetRect.height,
    });
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

  const beginPointerInteraction = (operation) => (event) => {
    if (!selectedActivity) return;
    const metrics = metricsRef.current || computeGridMetrics({
      doc: iframeRef?.current?.contentDocument || iframeRef?.current?.contentWindow?.document,
      iframe: iframeRef?.current,
      maxColumns,
      viewport: viewportRef?.current,
    });
    if (!metrics || !viewportRef?.current) return;

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
    const stepX = Math.max(1, metrics.columnWidth + metrics.gapX);
    const stepY = Math.max(1, metrics.rowHeight + metrics.gapY);
    let lastProposal = null;

    const handleMove = (moveEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();

      let proposal = null;
      let nextFrame = null;

      if (isCanvasMode) {
        if (operation === 'drag') {
          const proposedLeft = moveEvent.clientX - startOffsetX;
          const proposedTop = moveEvent.clientY - startOffsetY;
          proposal = {
            ...startLayout,
            x: clampInteger(Math.round((proposedLeft - (metrics.rootClientLeft + metrics.paddingLeft)) / stepX), 0, Math.max(0, metrics.cols - startLayout.w)),
            y: Math.max(0, Math.round((proposedTop - (metrics.rootClientTop + metrics.paddingTop)) / stepY)),
          };
        } else if (operation === 'resize-x') {
          const nextW = clampInteger(startLayout.w + Math.round((moveEvent.clientX - event.clientX) / stepX), 1, metrics.cols);
          proposal = {
            ...startLayout,
            w: nextW,
            colSpan: nextW,
            x: clampInteger(startLayout.x, 0, Math.max(0, metrics.cols - nextW)),
          };
        } else {
          const nextW = clampInteger(startLayout.w + Math.round((moveEvent.clientX - event.clientX) / stepX), 1, metrics.cols);
          const nextH = Math.max(1, Math.round(startLayout.h + (moveEvent.clientY - event.clientY) / stepY));
          proposal = {
            ...startLayout,
            w: nextW,
            h: nextH,
            colSpan: nextW,
            x: clampInteger(startLayout.x, 0, Math.max(0, metrics.cols - nextW)),
          };
        }
        nextFrame = frameFromCanvasLayout(proposal, metrics);
      } else if (operation === 'drag') {
        const proposedLeft = moveEvent.clientX - startOffsetX;
        const proposedTop = moveEvent.clientY - startOffsetY;
        const nextSpan = clampInteger(startLayout.colSpan, 1, metrics.cols);
        proposal = {
          row: resolveSimpleRowFromClientY(
            proposedTop + startFrame.height / 2,
            metrics,
            startLayout.row,
            startFrame.height + metrics.gapY,
          ),
          col: clampInteger(
            Math.round((proposedLeft - (metrics.rootClientLeft + metrics.paddingLeft)) / stepX) + 1,
            1,
            Math.max(1, metrics.cols - nextSpan + 1),
          ),
          colSpan: nextSpan,
        };
        nextFrame = frameFromSimpleLayout(proposal, metrics, startFrame.height);
      } else {
        const nextSpan = clampInteger(
          startLayout.colSpan + Math.round((moveEvent.clientX - event.clientX) / stepX),
          1,
          metrics.cols,
        );
        proposal = {
          row: startLayout.row,
          col: clampInteger(startLayout.col, 1, Math.max(1, metrics.cols - nextSpan + 1)),
          colSpan: nextSpan,
        };
        nextFrame = frameFromSimpleLayout(proposal, metrics, startFrame.height);
      }

      if (!proposal || !nextFrame) return;
      lastProposal = proposal;
      setDraftFrame(nextFrame);
    };

    const finishInteraction = (endEvent, { commit = true } = {}) => {
      endEvent?.preventDefault?.();
      endEvent?.stopPropagation?.();
      try {
        handleElement.releasePointerCapture?.(event.pointerId);
      } catch {
        // Ignore release failures.
      }
      handleElement.removeEventListener('pointermove', handleMove);
      handleElement.removeEventListener('pointerup', handleUp);
      handleElement.removeEventListener('pointercancel', handleCancel);
      window.removeEventListener('blur', handleCancel);
      interactionCleanupRef.current = null;

      if (commit && lastProposal) {
        if (isCanvasMode) {
          onCanvasLayoutChange?.(lastProposal);
        } else {
          onSimpleLayoutChange?.(lastProposal);
        }
        window.setTimeout(() => {
          setDraftFrame(null);
          updateFrame();
        }, 120);
        return;
      }
      setDraftFrame(null);
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
      handleElement.removeEventListener('pointermove', handleMove);
      handleElement.removeEventListener('pointerup', handleUp);
      handleElement.removeEventListener('pointercancel', handleCancel);
      window.removeEventListener('blur', handleCancel);
      setDraftFrame(null);
    };
  };

  const toolbarTop = activeFrame.top > 44 ? activeFrame.top - 36 : Math.max(8, Math.min(activeFrame.top + 8, activeFrame.top + activeFrame.height - 40));
  const toolbarLeft = Math.max(8, Math.min(activeFrame.left + 8, activeFrame.left + Math.max(8, activeFrame.width - 392)));
  const addTop = Math.max(8, Math.min(activeFrame.top + activeFrame.height - 42, activeFrame.top + activeFrame.height - 42));
  const addLeft = Math.max(8, Math.min(activeFrame.left + 8, activeFrame.left + Math.max(8, activeFrame.width - 120)));
  const rightHandleLeft = Math.max(6, activeFrame.left + activeFrame.width - 10);
  const rightHandleTop = Math.max(6, activeFrame.top + activeFrame.height / 2 - 14);
  const cornerHandleLeft = Math.max(6, activeFrame.left + activeFrame.width - 12);
  const cornerHandleTop = Math.max(6, activeFrame.top + activeFrame.height - 12);

  return (
    <>
      <div
        className={`absolute z-20 rounded-xl border shadow-[0_0_0_3px_rgba(99,102,241,0.24)] ${
          draftFrame ? 'border-dashed border-emerald-400/90' : 'border-indigo-300/80'
        }`}
        style={{
          left: `${activeFrame.left}px`,
          top: `${activeFrame.top}px`,
          width: `${activeFrame.width}px`,
          height: `${activeFrame.height}px`,
        }}
      />

      <div
        className="pointer-events-auto absolute z-30 flex max-w-[calc(100%-16px)] flex-wrap items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-950/88 p-1.5 shadow-[0_14px_36px_rgba(2,6,23,0.32)] backdrop-blur-sm"
        style={{
          left: `${toolbarLeft}px`,
          top: `${toolbarTop}px`,
        }}
      >
        <span className="rounded-lg bg-slate-900/80 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200">
          {selectedLabel}
        </span>
        <span className="rounded-lg bg-indigo-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-100">
          {isCanvasMode ? 'Freeform' : 'Arrange'}
        </span>
        <button
          type="button"
          onPointerDown={beginPointerInteraction('drag')}
          className="cursor-grab rounded-lg bg-slate-800/90 p-1 text-slate-200 hover:bg-slate-700 active:cursor-grabbing"
          title="Drag section"
        >
          <Move size={13} />
        </button>

        {!isCanvasMode ? (
          <>
            <button
              type="button"
              onClick={() => onMove?.('up')}
              className="rounded-lg bg-slate-800/90 p-1 text-slate-200 hover:bg-slate-700"
              title="Move up"
            >
              <ChevronUp size={13} />
            </button>
            <button
              type="button"
              onClick={() => onMove?.('down')}
              className="rounded-lg bg-slate-800/90 p-1 text-slate-200 hover:bg-slate-700"
              title="Move down"
            >
              <ChevronDown size={13} />
            </button>
            <button
              type="button"
              onClick={() => onMove?.('left')}
              className="rounded-lg bg-slate-800/90 p-1 text-slate-200 hover:bg-slate-700"
              title="Move left"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              onClick={() => onMove?.('right')}
              className="rounded-lg bg-slate-800/90 p-1 text-slate-200 hover:bg-slate-700"
              title="Move right"
            >
              <ChevronRight size={13} />
            </button>
            <button
              type="button"
              onClick={() => onSpanChange?.(Math.max(1, colSpan - 1))}
              className="rounded bg-slate-800 p-1 text-slate-200 hover:bg-slate-700"
              title="Narrower"
            >
              <Minimize2 size={13} />
            </button>
            <button
              type="button"
              onClick={() => onSpanChange?.(Math.min(maxColumns, colSpan + 1))}
              className="rounded bg-slate-800 p-1 text-slate-200 hover:bg-slate-700"
              title="Wider"
            >
              <Maximize2 size={13} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onCanvasLayoutChange?.({ x: Math.max(0, x - 1) })}
              className="rounded bg-slate-800 p-1 text-slate-200 hover:bg-slate-700"
              title="Move left"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              onClick={() => onCanvasLayoutChange?.({ x: Math.min(Math.max(0, maxColumns - w), x + 1) })}
              className="rounded bg-slate-800 p-1 text-slate-200 hover:bg-slate-700"
              title="Move right"
            >
              <ChevronRight size={13} />
            </button>
            <button
              type="button"
              onClick={() => onCanvasLayoutChange?.({ y: Math.max(0, y - 1) })}
              className="rounded bg-slate-800 p-1 text-slate-200 hover:bg-slate-700"
              title="Move up"
            >
              <ChevronUp size={13} />
            </button>
            <button
              type="button"
              onClick={() => onCanvasLayoutChange?.({ y: y + 1 })}
              className="rounded bg-slate-800 p-1 text-slate-200 hover:bg-slate-700"
              title="Move down"
            >
              <ChevronDown size={13} />
            </button>
            <button
              type="button"
              onClick={() => onCanvasLayoutChange?.({ w: Math.max(1, w - 1), colSpan: Math.max(1, w - 1) })}
              className="rounded bg-slate-800 p-1 text-slate-200 hover:bg-slate-700"
              title="Narrower"
            >
              <Minimize2 size={13} />
            </button>
            <button
              type="button"
              onClick={() => onCanvasLayoutChange?.({ w: Math.min(maxColumns, w + 1), colSpan: Math.min(maxColumns, w + 1) })}
              className="rounded bg-slate-800 p-1 text-slate-200 hover:bg-slate-700"
              title="Wider"
            >
              <Maximize2 size={13} />
            </button>
            <button
              type="button"
              onClick={() => onCanvasLayoutChange?.({ h: Math.max(1, h - 1) })}
              className="rounded bg-slate-800 px-1.5 py-1 text-[10px] font-bold text-slate-200 hover:bg-slate-700"
              title="Shorter"
            >
              -H
            </button>
            <button
              type="button"
              onClick={() => onCanvasLayoutChange?.({ h: h + 1 })}
              className="rounded bg-slate-800 px-1.5 py-1 text-[10px] font-bold text-slate-200 hover:bg-slate-700"
              title="Taller"
            >
              +H
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onDuplicate?.()}
          className="rounded bg-slate-800 p-1 text-slate-200 hover:bg-slate-700"
          title="Duplicate"
        >
          <Copy size={13} />
        </button>
        <button
          type="button"
          onClick={() => onDelete?.()}
          className="rounded bg-rose-600/90 p-1 text-white hover:bg-rose-500"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <button
        type="button"
        onPointerDown={beginPointerInteraction('resize-x')}
        className="pointer-events-auto absolute z-30 rounded-full border border-white/60 bg-slate-950/90 shadow-lg hover:bg-slate-900"
        style={{
          left: `${rightHandleLeft}px`,
          top: `${rightHandleTop}px`,
          width: '18px',
          height: '28px',
          cursor: 'ew-resize',
        }}
        title={isCanvasMode ? 'Drag to resize width' : 'Drag to change section width'}
      />

      {isCanvasMode ? (
        <button
          type="button"
          onPointerDown={beginPointerInteraction('resize-both')}
          className="pointer-events-auto absolute z-30 rounded border border-white/60 bg-slate-950/90 shadow-lg hover:bg-slate-900"
          style={{
            left: `${cornerHandleLeft}px`,
            top: `${cornerHandleTop}px`,
            width: '20px',
            height: '20px',
            cursor: 'nwse-resize',
          }}
          title="Drag to resize width and height"
        />
      ) : null}

      <button
        type="button"
        onClick={() => onOpenAddPanel?.()}
        className="pointer-events-auto absolute z-30 inline-flex items-center gap-1 rounded-full border border-emerald-500/50 bg-emerald-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg hover:bg-emerald-500"
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
