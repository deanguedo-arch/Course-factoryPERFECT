import * as React from 'react';
import { ArrowUpRight, Maximize2, Monitor, MousePointerClick, RefreshCw, Smartphone, Tablet } from 'lucide-react';

const VIEWPORT_OPTIONS = [
  { value: 'desktop', label: 'Desktop', icon: Monitor },
  { value: 'tablet', label: 'Tablet', icon: Tablet },
  { value: 'mobile', label: 'Mobile', icon: Smartphone },
];

const DESKTOP_WIDTH_OPTIONS = [
  { value: 'fit', label: 'Fit' },
  { value: '1280', label: '1280' },
  { value: '1440', label: '1440' },
  { value: 'window', label: 'Full' },
];

const PREVIEW_SCALE_OPTIONS = [
  { value: 0.8, label: '80%' },
  { value: 1, label: '100%' },
  { value: 1.25, label: '125%' },
];

const PREVIEW_SCALE_MIN = 70;
const PREVIEW_SCALE_MAX = 130;
const PREVIEW_SCALE_STEP = 5;

export default function ComposerPreviewToolbar({
  desktopWidthMode = 'fit',
  focusMode = false,
  inspectorCollapsed = false,
  interactionMode = 'select',
  onDesktopWidthModeChange,
  onFocusModeChange,
  onInspectorCollapsedChange,
  onPopoutOpen,
  onPreviewScaleChange,
  onReset,
  onInteractionModeChange,
  onViewportModeChange,
  popoutTitle = 'Course Review',
  previewScale = 1,
  srcDoc = '',
  showDesktopWidthControls = false,
  showFocusModeControl = false,
  showInspectorToggle = false,
  showInteractionModeControls = false,
  showPopoutControl = false,
  showPreviewScaleControls = false,
  showViewportControls = false,
  titleText = 'Course Review',
  viewportMode = 'desktop',
}) {
  const reviewWindowRef = React.useRef(null);
  const viewportOption = VIEWPORT_OPTIONS.find((option) => option.value === viewportMode) || VIEWPORT_OPTIONS[0];
  const inspectMode = interactionMode === 'select';
  const isDesktopViewport = viewportOption.value === 'desktop';
  const zoomValue = Math.max(0.5, Number(previewScale) || 1);
  const zoomPercent = Math.round(zoomValue * 100);

  const writePopoutWindow = React.useCallback(
    (targetWindow) => {
      const win = targetWindow || reviewWindowRef.current;
      if (!win || win.closed) return false;
      const nextHtml =
        String(srcDoc || '').trim() ||
        '<!doctype html><html><head><title>Course Review</title></head><body style="font-family:system-ui;padding:24px;background:#0f172a;color:white;">Preview unavailable.</body></html>';
      win.document.open();
      win.document.write(nextHtml);
      win.document.close();
      win.document.title = popoutTitle || titleText || 'Course Review';
      return true;
    },
    [popoutTitle, srcDoc, titleText],
  );

  const openPopoutWindow = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    const reviewWindow = window.open('', 'cf-composer-review-window', 'popup=yes,width=1440,height=920,resizable=yes,scrollbars=yes');
    if (!reviewWindow) return;
    reviewWindowRef.current = reviewWindow;
    writePopoutWindow(reviewWindow);
    onPopoutOpen?.(reviewWindow);
  }, [onPopoutOpen, writePopoutWindow]);

  React.useEffect(() => {
    if (!reviewWindowRef.current || reviewWindowRef.current.closed) return;
    writePopoutWindow(reviewWindowRef.current);
  }, [srcDoc, writePopoutWindow]);

  React.useEffect(
    () => () => {
      if (reviewWindowRef.current && !reviewWindowRef.current.closed) {
        reviewWindowRef.current.close();
      }
    },
    [],
  );

  const handlePreviewScaleInput = React.useCallback(
    (event) => {
      const nextPercent = Number(event.target.value);
      if (!Number.isFinite(nextPercent)) return;
      onPreviewScaleChange?.(nextPercent / 100);
    },
    [onPreviewScaleChange],
  );

  const segmentedGroupClass = 'inline-flex max-w-full items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-950/70 p-1';
  const sectionLabelClass = 'shrink-0 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500';
  const compactButtonClass =
    'inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300 transition-colors hover:bg-slate-800 hover:text-white';
  const utilityButtonClass =
    'inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-950/70 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200 transition-colors hover:bg-slate-800';

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-[linear-gradient(180deg,rgba(8,15,34,0.92),rgba(9,14,28,0.74))] px-3 py-2 shadow-[0_16px_32px_rgba(2,6,23,0.18)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
          {showInteractionModeControls ? (
            <div className="inline-flex items-center gap-2">
              <span className={sectionLabelClass}>Mode</span>
              <button
                type="button"
                onClick={() => onInteractionModeChange?.(inspectMode ? 'live' : 'select')}
                className={`${utilityButtonClass} ${inspectMode ? 'border-emerald-500/60 bg-emerald-500/12 text-emerald-100' : 'text-slate-300'}`}
                title={inspectMode ? 'Select blocks directly in preview' : 'Preview interactions run normally'}
              >
                <MousePointerClick size={11} />
                {inspectMode ? 'Edit' : 'Live'}
              </button>
            </div>
          ) : null}

          {showViewportControls ? (
            <div className="inline-flex items-center gap-2">
              <span className={sectionLabelClass}>View</span>
              <div className={segmentedGroupClass}>
                {VIEWPORT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = option.value === viewportOption.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onViewportModeChange?.(option.value)}
                      className={`${compactButtonClass} ${
                        isActive ? 'bg-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.24)]' : ''
                      }`}
                      title={`Preview ${option.label.toLowerCase()} width`}
                    >
                      <Icon size={11} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {showDesktopWidthControls && isDesktopViewport ? (
            <div className="inline-flex items-center gap-2">
              <span className={sectionLabelClass}>Stage</span>
              <div className={segmentedGroupClass}>
                {DESKTOP_WIDTH_OPTIONS.map((option) => {
                  const isActive = option.value === desktopWidthMode;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onDesktopWidthModeChange?.(option.value)}
                      className={`${compactButtonClass} ${isActive ? 'bg-slate-100 text-slate-950' : ''}`}
                      title={`Preview a ${option.label.toLowerCase()} desktop stage`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {showPreviewScaleControls ? (
            <div className="flex min-w-[240px] flex-1 items-center gap-2 xl:max-w-[360px]">
              <span className={sectionLabelClass}>Zoom</span>
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/70 px-2 py-1.5">
                <input
                  type="range"
                  min={PREVIEW_SCALE_MIN}
                  max={PREVIEW_SCALE_MAX}
                  step={PREVIEW_SCALE_STEP}
                  value={zoomPercent}
                  onChange={handlePreviewScaleInput}
                  className="h-1 min-w-[72px] flex-1 cursor-pointer accent-indigo-500"
                  title="Adjust preview zoom"
                />
                <span className="min-w-[42px] text-right text-[10px] font-semibold tabular-nums text-white">{zoomPercent}%</span>
              </div>
              <div className={segmentedGroupClass}>
                {PREVIEW_SCALE_OPTIONS.map((option) => {
                  const isActive = Number(option.value) === Number(zoomValue);
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => onPreviewScaleChange?.(option.value)}
                      className={`${compactButtonClass} ${isActive ? 'bg-slate-100 text-slate-950' : ''}`}
                      title={`Set preview zoom to ${option.label}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {showInspectorToggle ? (
            <button
              type="button"
              onClick={() => onInspectorCollapsedChange?.(!inspectorCollapsed)}
              className={`${utilityButtonClass} ${!inspectorCollapsed ? 'border-sky-500/60 bg-sky-500/10 text-sky-100' : ''}`}
              title={inspectorCollapsed ? 'Show inspector' : 'Hide inspector'}
            >
              Inspector
            </button>
          ) : null}

          {showFocusModeControl ? (
            <button
              type="button"
              onClick={() => onFocusModeChange?.(!focusMode)}
              className={`${utilityButtonClass} ${focusMode ? 'border-emerald-500/60 bg-emerald-500/12 text-emerald-100' : ''}`}
              title={focusMode ? 'Exit focus mode' : 'Expand canvas and hide chrome'}
            >
              <Maximize2 size={11} />
              Focus
            </button>
          ) : null}

          {showPopoutControl ? (
            <button
              type="button"
              onClick={openPopoutWindow}
              disabled={!srcDoc}
              className={`${utilityButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
              title="Open a full review window"
            >
              <ArrowUpRight size={11} />
              Review
            </button>
          ) : null}

          <button
            type="button"
            onClick={onReset}
            className={utilityButtonClass}
            title="Remount preview iframe"
          >
            <RefreshCw size={11} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
