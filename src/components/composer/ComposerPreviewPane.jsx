import * as React from 'react';
import { ArrowUpRight, Maximize2, Monitor, RefreshCw, Search, Smartphone, Tablet } from 'lucide-react';

const VIEWPORT_OPTIONS = [
  { value: 'desktop', label: 'Desktop', icon: Monitor, width: '100%' },
  { value: 'tablet', label: 'Tablet', icon: Tablet, width: '900px' },
  { value: 'mobile', label: 'Mobile', icon: Smartphone, width: '430px' },
];

const DESKTOP_WIDTH_OPTIONS = [
  { value: 'fit', label: 'Fit' },
  { value: '1280', label: '1280' },
  { value: '1440', label: '1440' },
  { value: 'window', label: 'Window' },
];

const PREVIEW_SCALE_OPTIONS = [
  { value: 0.8, label: '80%' },
  { value: 1, label: '100%' },
  { value: 1.15, label: '115%' },
  { value: 1.25, label: '125%' },
];

const PREVIEW_SCALE_MIN = 70;
const PREVIEW_SCALE_MAX = 130;
const PREVIEW_SCALE_STEP = 5;

export default function ComposerPreviewPane({
  description = 'Preview updates while you build this composer module.',
  desktopWidthMode = 'fit',
  emptyMessage = 'Composer preview unavailable.',
  frameOverlay = null,
  focusMode = false,
  iframeClassName = 'w-full border-0',
  iframeKey,
  iframeRef = null,
  iframeStyle = null,
  inspectorCollapsed = false,
  interactionMode = 'select',
  onDesktopWidthModeChange,
  onFocusModeChange,
  onInspectorCollapsedChange,
  onLoad,
  onPopoutOpen,
  onPreviewScaleChange,
  onReset,
  onInteractionModeChange,
  onQaModeChange,
  onViewportModeChange,
  popoutTitle = 'Course Review',
  previewScale = 1,
  qaMode = 'off',
  qaSummary = null,
  sandbox = 'allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads allow-top-navigation-by-user-activation',
  showDesktopWidthControls = false,
  showFocusModeControl = false,
  showInspectorToggle = false,
  showInteractionModeControls = false,
  showPopoutControl = false,
  showPreviewScaleControls = false,
  showQaControls = false,
  showViewportControls = false,
  srcDoc = '',
  title = 'Live Module Preview',
  titleText = 'Composer live preview',
  viewportRef = null,
  viewportMode = 'desktop',
}) {
  const reviewWindowRef = React.useRef(null);
  const [windowWidth, setWindowWidth] = React.useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1440));
  const viewportOption = VIEWPORT_OPTIONS.find((option) => option.value === viewportMode) || VIEWPORT_OPTIONS[0];
  const inspectMode = interactionMode === 'select';
  const isDesktopViewport = viewportOption.value === 'desktop';
  const zoomValue = Math.max(0.5, Number(previewScale) || 1);
  const zoomPercent = Math.round(zoomValue * 100);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const resolvedDesktopStageWidth = React.useMemo(() => {
    if (!isDesktopViewport) return viewportOption.width;
    if (desktopWidthMode === '1280') return '1280px';
    if (desktopWidthMode === '1440') return '1440px';
    if (desktopWidthMode === 'window') return `${Math.max(1280, windowWidth - 96)}px`;
    return '100%';
  }, [desktopWidthMode, isDesktopViewport, viewportOption.width, windowWidth]);

  const stageStyle = React.useMemo(
    () => ({
      width: resolvedDesktopStageWidth,
      maxWidth: isDesktopViewport && desktopWidthMode === 'fit' ? '100%' : 'none',
    }),
    [desktopWidthMode, isDesktopViewport, resolvedDesktopStageWidth],
  );

  const applyPreviewScaleToIframe = React.useCallback(() => {
    const doc = iframeRef?.current?.contentDocument || iframeRef?.current?.contentWindow?.document;
    if (!doc?.documentElement) return;
    doc.documentElement.style.zoom = `${zoomValue}`;
  }, [iframeRef, zoomValue]);

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
    applyPreviewScaleToIframe();
  }, [applyPreviewScaleToIframe, iframeKey, srcDoc]);

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

  const handleIframeLoad = React.useCallback(
    (event) => {
      applyPreviewScaleToIframe();
      if (reviewWindowRef.current && !reviewWindowRef.current.closed) {
        writePopoutWindow(reviewWindowRef.current);
      }
      onLoad?.(event);
    },
    [applyPreviewScaleToIframe, onLoad, writePopoutWindow],
  );

  const handlePreviewScaleInput = React.useCallback(
    (event) => {
      const nextPercent = Number(event.target.value);
      if (!Number.isFinite(nextPercent)) return;
      onPreviewScaleChange?.(nextPercent / 100);
    },
    [onPreviewScaleChange],
  );

  const controlGroupClass = 'flex flex-wrap items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-1';
  const actionButtonClass = 'inline-flex items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-900/70 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200 transition-colors hover:bg-slate-800';
  const activeActionButtonClass = 'border-emerald-500/70 bg-emerald-600 text-white shadow-[0_8px_24px_rgba(5,150,105,0.22)]';

  return (
    <div className="min-w-0 rounded-2xl border border-slate-800/80 bg-slate-950/88 p-3 shadow-[0_16px_40px_rgba(2,6,23,0.24)] backdrop-blur-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          <span className="hidden rounded-full border border-slate-800/80 bg-slate-900/70 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500 xl:inline-flex">
            {inspectMode ? 'Canvas Editing' : description}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5">
            {showInteractionModeControls ? (
              <button
                type="button"
                onClick={() => onInteractionModeChange?.(inspectMode ? 'live' : 'select')}
                className={`${actionButtonClass} ${inspectMode ? activeActionButtonClass : ''}`}
                title={inspectMode ? 'Preview is in inspect mode' : 'Preview interactions run normally'}
              >
                <Search size={11} />
                {inspectMode ? 'Inspect' : 'Interact'}
              </button>
            ) : null}
            {showViewportControls ? (
              <div className={controlGroupClass}>
                {VIEWPORT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = option.value === viewportOption.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onViewportModeChange?.(option.value)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.24)]'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={`Preview ${option.label.toLowerCase()} width`}
                    >
                      <Icon size={11} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
            {showDesktopWidthControls && isDesktopViewport ? (
              <div className={controlGroupClass}>
                <span className="px-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Stage</span>
                {DESKTOP_WIDTH_OPTIONS.map((option) => {
                  const isActive = option.value === desktopWidthMode;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onDesktopWidthModeChange?.(option.value)}
                      className={`inline-flex items-center rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                        isActive
                          ? 'bg-slate-100 text-slate-950'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={`Preview a ${option.label.toLowerCase()} desktop stage`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
            {showPreviewScaleControls ? (
              <div className="flex min-w-[252px] max-w-full flex-wrap items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/70 px-2.5 py-1.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Zoom</span>
                <input
                  type="range"
                  min={PREVIEW_SCALE_MIN}
                  max={PREVIEW_SCALE_MAX}
                  step={PREVIEW_SCALE_STEP}
                  value={zoomPercent}
                  onChange={handlePreviewScaleInput}
                  className="h-1.5 w-24 cursor-pointer accent-indigo-500 xl:w-32"
                  title="Adjust preview zoom"
                />
                <span className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-semibold text-white">
                  {zoomPercent}%
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {PREVIEW_SCALE_OPTIONS.map((option) => {
                    const isActive = Number(option.value) === Number(zoomValue);
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => onPreviewScaleChange?.(option.value)}
                        className={`inline-flex items-center rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors ${
                          isActive
                            ? 'bg-slate-100 text-slate-950'
                            : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                        title={`Set preview zoom to ${option.label}`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
            {showInspectorToggle ? (
              <button
                type="button"
                onClick={() => onInspectorCollapsedChange?.(!inspectorCollapsed)}
                className={`${actionButtonClass} ${!inspectorCollapsed ? 'border-sky-500/60 bg-sky-500/10 text-sky-100' : ''}`}
                title={inspectorCollapsed ? 'Show inspector' : 'Hide inspector'}
              >
                {inspectorCollapsed ? 'Inspector' : 'Inspector On'}
              </button>
            ) : null}
            {showFocusModeControl ? (
              <button
                type="button"
                onClick={() => onFocusModeChange?.(!focusMode)}
                className={`${actionButtonClass} ${focusMode ? activeActionButtonClass : ''}`}
                title={focusMode ? 'Exit focus mode' : 'Expand canvas and hide chrome'}
              >
                <Maximize2 size={11} />
                {focusMode ? 'Exit' : 'Focus'}
              </button>
            ) : null}
            {showPopoutControl ? (
              <button
                type="button"
                onClick={openPopoutWindow}
                disabled={!srcDoc}
                className={`${actionButtonClass} disabled:opacity-40`}
                title="Open a full review window"
              >
                <ArrowUpRight size={11} />
                Review
              </button>
            ) : null}
            <button
              type="button"
              onClick={onReset}
              className={`${actionButtonClass} px-2`}
              title="Remount preview iframe"
            >
              <RefreshCw size={11} />
              Reset
            </button>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/55 p-3">
        <div
          ref={viewportRef}
          className="relative mx-auto overflow-auto rounded-xl border border-slate-800/80 bg-black/90 shadow-[0_20px_48px_rgba(2,6,23,0.42)] transition-all duration-200"
          style={{ width: '100%', maxWidth: '100%' }}
        >
          {srcDoc ? (
            <>
              <div className="relative mx-auto" style={stageStyle}>
                <iframe
                  ref={iframeRef}
                  key={iframeKey}
                  srcDoc={srcDoc}
                  className={iframeClassName}
                  style={{ ...(iframeStyle || {}), width: '100%' }}
                  sandbox={sandbox}
                  title={titleText}
                  onLoad={handleIframeLoad}
                />
              </div>
              {frameOverlay ? <div className="pointer-events-none absolute inset-0 z-10">{frameOverlay}</div> : null}
            </>
          ) : (
            <div className="flex h-48 items-center justify-center text-xs text-slate-500">{emptyMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}
