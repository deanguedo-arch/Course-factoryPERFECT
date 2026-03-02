import * as React from 'react';

const PREVIEW_ACTIVITY_SELECTOR = '[data-activity-id]';
const PREVIEW_STYLE_ID = 'cf-composer-preview-bridge-style';

function escapeSelectorAttr(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

function ensurePreviewBridgeStyles(doc) {
  if (!doc) return;
  if (doc.getElementById(PREVIEW_STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = PREVIEW_STYLE_ID;
  style.textContent = `
    ${PREVIEW_ACTIVITY_SELECTOR}[data-composer-preview-selectable="true"] {
      cursor: pointer;
      transition: box-shadow 140ms ease, transform 140ms ease;
      scroll-margin: 96px;
    }
    ${PREVIEW_ACTIVITY_SELECTOR}[data-composer-preview-selectable="true"]:hover {
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.38);
    }
    ${PREVIEW_ACTIVITY_SELECTOR}[data-composer-preview-multi-selected="true"] {
      box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.75);
    }
    ${PREVIEW_ACTIVITY_SELECTOR}[data-composer-preview-selected="true"] {
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.95), 0 0 0 8px rgba(99, 102, 241, 0.18);
      position: relative;
      z-index: 1;
    }
    ${PREVIEW_ACTIVITY_SELECTOR}[data-composer-preview-qa-level="warn"],
    ${PREVIEW_ACTIVITY_SELECTOR}[data-composer-preview-qa-level="error"] {
      position: relative;
      outline-offset: 3px;
    }
    ${PREVIEW_ACTIVITY_SELECTOR}[data-composer-preview-qa-level="warn"] {
      outline: 2px solid rgba(251, 191, 36, 0.82);
    }
    ${PREVIEW_ACTIVITY_SELECTOR}[data-composer-preview-qa-level="error"] {
      outline: 2px solid rgba(244, 63, 94, 0.88);
    }
    ${PREVIEW_ACTIVITY_SELECTOR}[data-composer-preview-qa-level][data-composer-preview-qa-count]::after {
      content: attr(data-composer-preview-qa-count);
      position: absolute;
      top: 8px;
      right: 8px;
      min-width: 18px;
      height: 18px;
      padding: 0 6px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font: 700 11px/1 system-ui, sans-serif;
      color: white;
      pointer-events: none;
      box-shadow: 0 2px 10px rgba(15, 23, 42, 0.28);
    }
    ${PREVIEW_ACTIVITY_SELECTOR}[data-composer-preview-qa-level="warn"][data-composer-preview-qa-count]::after {
      background: rgba(217, 119, 6, 0.96);
    }
    ${PREVIEW_ACTIVITY_SELECTOR}[data-composer-preview-qa-level="error"][data-composer-preview-qa-count]::after {
      background: rgba(225, 29, 72, 0.96);
    }
  `;
  (doc.head || doc.body || doc.documentElement)?.appendChild(style);
}

function updatePreviewSelectionState(doc, activityId, selectedIds = [], { activityIssues = {}, qaEnabled = false, selectionEnabled = true } = {}) {
  if (!doc) return false;
  ensurePreviewBridgeStyles(doc);
  const items = doc.querySelectorAll(PREVIEW_ACTIVITY_SELECTOR);
  items.forEach((node) => {
    if (selectionEnabled) {
      node.setAttribute('data-composer-preview-selectable', 'true');
    } else {
      node.removeAttribute('data-composer-preview-selectable');
    }
    node.removeAttribute('data-composer-preview-selected');
    node.removeAttribute('data-composer-preview-multi-selected');
    node.removeAttribute('data-composer-preview-qa-level');
    node.removeAttribute('data-composer-preview-qa-count');
  });

  if (qaEnabled) {
    items.forEach((node) => {
      const nodeId = String(node.getAttribute('data-activity-id') || '').trim();
      if (!nodeId) return;
      const issueMeta = activityIssues && typeof activityIssues === 'object' ? activityIssues[nodeId] : null;
      const level = issueMeta?.level === 'error' ? 'error' : issueMeta?.level === 'warn' ? 'warn' : '';
      if (!level) return;
      node.setAttribute('data-composer-preview-qa-level', level);
      node.setAttribute('data-composer-preview-qa-count', String(Math.max(1, Number(issueMeta?.count) || 1)));
    });
  }

  const selectedIdSet = new Set((Array.isArray(selectedIds) ? selectedIds : []).map((id) => String(id || '').trim()).filter(Boolean));
  items.forEach((node) => {
    const nodeId = String(node.getAttribute('data-activity-id') || '').trim();
    if (nodeId && selectedIdSet.has(nodeId)) {
      node.setAttribute('data-composer-preview-multi-selected', 'true');
    }
  });

  const targetId = String(activityId || '').trim();
  if (!targetId) return false;
  const escapedActivityId = escapeSelectorAttr(targetId);
  const target = doc.querySelector(`${PREVIEW_ACTIVITY_SELECTOR}[data-activity-id="${escapedActivityId}"]`);
  if (!target) return false;
  target.setAttribute('data-composer-preview-selected', 'true');
  return true;
}

export function scrollComposerPreviewIframeToActivity(iframe, activityId, activeFinlitTabId = '') {
  const targetId = String(activityId || '').trim();
  if (!targetId) return false;
  const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
  if (!doc) return false;

  const escapedActivityId = escapeSelectorAttr(targetId);
  const normalizedTabId = String(activeFinlitTabId || '').trim();
  let panelRoot = doc;

  if (normalizedTabId) {
    const escapedTabId = escapeSelectorAttr(normalizedTabId);
    const trigger = doc.querySelector(`[data-finlit-tab-trigger="${escapedTabId}"]`);
    if (trigger && typeof trigger.click === 'function') {
      trigger.click();
    }
    const panel = doc.querySelector(`[data-finlit-tab-panel="${escapedTabId}"]`);
    if (panel) {
      panelRoot = panel;
    }
  }

  const targetInPanel = panelRoot.querySelector?.(`[data-activity-id="${escapedActivityId}"]`) || null;
  if (targetInPanel && typeof targetInPanel.scrollIntoView === 'function') {
    targetInPanel.scrollIntoView({ block: 'center', inline: 'nearest' });
    return true;
  }

  const fallbackTarget = doc.querySelector(`[data-activity-id="${escapedActivityId}"]`);
  if (!fallbackTarget || typeof fallbackTarget.scrollIntoView !== 'function') return false;
  fallbackTarget.scrollIntoView({ block: 'center', inline: 'nearest' });
  return true;
}

export function useComposerPreviewBridge({
  enabled,
  previewDoc,
  selectedActivityId,
  selectedActivityIds = [],
  activityIssues = {},
  activeFinlitTabId = '',
  onActivitySelect,
  qaEnabled = false,
  selectionEnabled = true,
  resetKey = '',
} = {}) {
  const iframeRef = React.useRef(null);
  const targetActivityIdRef = React.useRef('');
  const selectedActivityIdsRef = React.useRef(selectedActivityIds);
  const activityIssuesRef = React.useRef(activityIssues);
  const shouldFollowRef = React.useRef(false);
  const activitySelectRef = React.useRef(onActivitySelect);
  const detachPreviewEventsRef = React.useRef(() => {});
  const [previewNonce, setPreviewNonce] = React.useState(0);

  const scrollToActivity = React.useCallback(
    (activityId) => scrollComposerPreviewIframeToActivity(iframeRef.current, activityId, activeFinlitTabId),
    [activeFinlitTabId],
  );

  const syncPreviewSelection = React.useCallback((activityId) => {
    const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
    return updatePreviewSelectionState(doc, activityId, selectedActivityIdsRef.current, {
      activityIssues: activityIssuesRef.current,
      qaEnabled,
      selectionEnabled,
    });
  }, [qaEnabled, selectionEnabled]);

  const bindPreviewInteractions = React.useCallback(() => {
    const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
    if (!doc) return;

    detachPreviewEventsRef.current?.();
    updatePreviewSelectionState(doc, targetActivityIdRef.current, selectedActivityIdsRef.current, {
      activityIssues: activityIssuesRef.current,
      qaEnabled,
      selectionEnabled,
    });
    if (!selectionEnabled) return;

    const handleClick = (event) => {
      const rawTarget = event?.target;
      if (!rawTarget || typeof rawTarget.closest !== 'function') return;
      const activityElement = rawTarget.closest(PREVIEW_ACTIVITY_SELECTOR);
      if (!activityElement) return;
      const activityId = String(activityElement.getAttribute('data-activity-id') || '').trim();
      if (!activityId) return;
      const issueMeta = activityIssuesRef.current && typeof activityIssuesRef.current === 'object' ? activityIssuesRef.current[activityId] : null;
      event.preventDefault?.();
      event.stopPropagation?.();
      activitySelectRef.current?.(activityId, {
        focusIssues: qaEnabled && Boolean(issueMeta),
        range: Boolean(event?.shiftKey),
        source: qaEnabled && issueMeta ? 'qa' : 'preview',
        toggle: Boolean(event?.metaKey || event?.ctrlKey),
      });
    };

    doc.addEventListener('click', handleClick, true);
    detachPreviewEventsRef.current = () => {
      doc.removeEventListener('click', handleClick, true);
    };
  }, [qaEnabled, selectionEnabled]);

  React.useEffect(() => {
    if (!enabled) return;
    setPreviewNonce((value) => value + 1);
  }, [enabled, resetKey]);

  React.useEffect(() => {
    targetActivityIdRef.current = String(selectedActivityId || '').trim();
  }, [selectedActivityId]);

  React.useEffect(() => {
    selectedActivityIdsRef.current = Array.isArray(selectedActivityIds) ? selectedActivityIds : [];
  }, [selectedActivityIds]);

  React.useEffect(() => {
    activityIssuesRef.current = activityIssues && typeof activityIssues === 'object' ? activityIssues : {};
  }, [activityIssues]);

  React.useEffect(() => {
    activitySelectRef.current = onActivitySelect;
  }, [onActivitySelect]);

  React.useEffect(() => {
    if (!enabled || !selectionEnabled) {
      detachPreviewEventsRef.current?.();
      shouldFollowRef.current = false;
      return;
    }
    shouldFollowRef.current = true;
  }, [enabled, selectedActivityId, selectionEnabled]);

  React.useEffect(() => {
    if (!enabled) return;
    syncPreviewSelection(selectedActivityId);
  }, [activityIssues, enabled, previewDoc, qaEnabled, selectedActivityId, selectedActivityIds, syncPreviewSelection]);

  React.useEffect(
    () => () => {
      detachPreviewEventsRef.current?.();
    },
    [],
  );

  React.useEffect(() => {
    if (!enabled || !shouldFollowRef.current) return undefined;
    const targetId = String(selectedActivityId || '').trim();
    if (!targetId) return undefined;
    const timer = setTimeout(() => {
      if (scrollToActivity(targetId)) {
        shouldFollowRef.current = false;
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [enabled, previewDoc, scrollToActivity, selectedActivityId]);

  const requestPreviewFollow = React.useCallback(() => {
    if (!enabled) return;
    shouldFollowRef.current = true;
  }, [enabled]);

  const suspendPreviewFollow = React.useCallback(() => {
    shouldFollowRef.current = false;
  }, []);

  const resetPreview = React.useCallback(() => {
    detachPreviewEventsRef.current?.();
    shouldFollowRef.current = false;
    setPreviewNonce((value) => value + 1);
  }, []);

  const handlePreviewLoad = React.useCallback(() => {
    bindPreviewInteractions();
    syncPreviewSelection(targetActivityIdRef.current);
    if (!shouldFollowRef.current) return;
    const targetId = targetActivityIdRef.current;
    if (!targetId) return;
    if (scrollToActivity(targetId)) {
      shouldFollowRef.current = false;
    }
  }, [bindPreviewInteractions, scrollToActivity, syncPreviewSelection]);

  return {
    iframeRef,
    previewNonce,
    handlePreviewLoad,
    requestPreviewFollow,
    resetPreview,
    scrollToActivity,
    suspendPreviewFollow,
  };
}
