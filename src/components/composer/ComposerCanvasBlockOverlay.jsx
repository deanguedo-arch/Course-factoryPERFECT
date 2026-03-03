import * as React from 'react';
import {
  GripVertical,
  Plus,
} from 'lucide-react';
import {
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
    rowBands: buildSimpleRowBands(doc, iframeRect, viewportRect),
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
  const metricsRef = React.useRef(null);
  const interactionCleanupRef = React.useRef(null);

  const clearInteraction = React.useCallback(() => {
    interactionCleanupRef.current?.();
    interactionCleanupRef.current = null;
    setPreviewKind('idle');
    setDraftChip('');
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
  const positionChip = draftChip || formatLayoutChip(isCanvasMode ? { x, y } : { row, col }, isCanvasMode);
  const isInvalidPreview = previewKind === 'canvas-invalid' || previewKind === 'simple-invalid';

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
    let lastProposalValid = false;

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
            x: Math.round((proposedLeft - (metrics.rootClientLeft + metrics.paddingLeft)) / stepX),
            y: Math.round((proposedTop - (metrics.rootClientTop + metrics.paddingTop)) / stepY),
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
        const validation = validateComposerCanvasProposal(activities, selectedIndex, proposal, { maxColumns: metrics.cols });
        lastProposal = validation.rect;
        lastProposalValid = validation.valid;
        nextFrame = frameFromCanvasLayout(validation.rect, metrics);
        setPreviewKind(validation.valid ? 'canvas-valid' : 'canvas-invalid');
        if (!nextFrame) return;
        setDraftFrame(nextFrame);
        setDraftChip(validation.valid ? formatLayoutChip(validation.rect, true) : 'Blocked');
        return;
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
        const validation = validateComposerSimpleProposal(activities, selectedIndex, proposal, { maxColumns: metrics.cols });
        lastProposal = validation.layout;
        lastProposalValid = validation.valid;
        nextFrame = frameFromSimpleLayout(validation.layout, metrics, startFrame.height);
        setPreviewKind(validation.valid ? 'simple-valid' : 'simple-invalid');
        if (!nextFrame) return;
        setDraftFrame(nextFrame);
        setDraftChip(validation.valid ? formatLayoutChip(validation.layout, false) : 'Blocked');
        return;
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
        const validation = validateComposerSimpleProposal(activities, selectedIndex, proposal, { maxColumns: metrics.cols });
        lastProposal = validation.layout;
        lastProposalValid = validation.valid;
        nextFrame = frameFromSimpleLayout(validation.layout, metrics, startFrame.height);
        setPreviewKind(validation.valid ? 'simple-valid' : 'simple-invalid');
        if (!nextFrame) return;
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
      handleElement.removeEventListener('pointermove', handleMove);
      handleElement.removeEventListener('pointerup', handleUp);
      handleElement.removeEventListener('pointercancel', handleCancel);
      window.removeEventListener('blur', handleCancel);
      interactionCleanupRef.current = null;

      const shouldCommitCanvas = Boolean(commit && isCanvasMode && lastProposal && lastProposalValid);
      const shouldCommitSimpleLayout = Boolean(commit && !isCanvasMode && lastProposal && lastProposalValid);

      if (shouldCommitCanvas) {
        onCanvasLayoutChange?.(lastProposal);
      } else if (shouldCommitSimpleLayout) {
        onSimpleLayoutChange?.(lastProposal);
      }

      if (shouldCommitCanvas || shouldCommitSimpleLayout) {
        window.setTimeout(() => {
          setDraftFrame(null);
          setPreviewKind('idle');
          setDraftChip('');
          updateFrame();
        }, 120);
        return;
      }
      setDraftFrame(null);
      setPreviewKind('idle');
      setDraftChip('');
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
      setPreviewKind('idle');
      setDraftChip('');
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
