import * as React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

const VIEWPORT_OPTIONS = [
  { value: 'desktop', icon: Monitor, width: '100%' },
  { value: 'tablet', icon: Tablet, width: '900px' },
  { value: 'mobile', icon: Smartphone, width: '430px' },
];

export default function ComposerPreviewPane({
  desktopWidthMode = 'fit',
  emptyMessage = 'Composer preview unavailable.',
  frameOverlay = null,
  iframeClassName = 'w-full border-0',
  iframeKey,
  iframeRef = null,
  iframeStyle = null,
  onLoad,
  previewScale = 1,
  sandbox = 'allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads allow-top-navigation-by-user-activation',
  srcDoc = '',
  titleText = 'Composer live preview',
  viewportRef = null,
  viewportMode = 'desktop',
}) {
  const [windowWidth, setWindowWidth] = React.useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1440));
  const viewportOption = VIEWPORT_OPTIONS.find((option) => option.value === viewportMode) || VIEWPORT_OPTIONS[0];
  const isDesktopViewport = viewportOption.value === 'desktop';
  const zoomValue = Math.max(0.5, Number(previewScale) || 1);

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

  React.useEffect(() => {
    applyPreviewScaleToIframe();
  }, [applyPreviewScaleToIframe, iframeKey, srcDoc]);

  const handleIframeLoad = React.useCallback(
    (event) => {
      applyPreviewScaleToIframe();
      onLoad?.(event);
    },
    [applyPreviewScaleToIframe, onLoad],
  );

  return (
    <div className="min-w-0 rounded-[26px] border border-slate-800/80 bg-slate-950/88 p-2 shadow-[0_16px_40px_rgba(2,6,23,0.24)] backdrop-blur-sm">
      <div
        ref={viewportRef}
        className="relative mx-auto overflow-auto rounded-[20px] border border-slate-800/80 bg-black/90 shadow-[0_20px_48px_rgba(2,6,23,0.42)] transition-all duration-200"
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
  );
}
