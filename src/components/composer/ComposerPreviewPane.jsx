import * as React from 'react';
import { Monitor, RefreshCw, Smartphone, Tablet } from 'lucide-react';

const VIEWPORT_OPTIONS = [
  { value: 'desktop', label: 'Desktop', icon: Monitor, width: '100%' },
  { value: 'tablet', label: 'Tablet', icon: Tablet, width: '900px' },
  { value: 'mobile', label: 'Mobile', icon: Smartphone, width: '430px' },
];

export default function ComposerPreviewPane({
  description = 'Preview updates while you build this composer module.',
  emptyMessage = 'Composer preview unavailable.',
  iframeClassName = 'w-full border-0',
  iframeKey,
  iframeRef = null,
  iframeStyle = null,
  interactionMode = 'select',
  onLoad,
  onReset,
  onInteractionModeChange,
  onQaModeChange,
  onViewportModeChange,
  qaMode = 'off',
  qaSummary = null,
  sandbox = 'allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads allow-top-navigation-by-user-activation',
  showInteractionModeControls = false,
  showQaControls = false,
  showViewportControls = false,
  srcDoc = '',
  title = 'Live Module Preview',
  titleText = 'Composer live preview',
  viewportMode = 'desktop',
}) {
  const viewportOption = VIEWPORT_OPTIONS.find((option) => option.value === viewportMode) || VIEWPORT_OPTIONS[0];
  const viewportStyle =
    viewportOption.value === 'desktop'
      ? { width: '100%', maxWidth: '100%' }
      : { width: viewportOption.width, maxWidth: '100%' };

  return (
    <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 min-w-0">
      <div className="flex items-center justify-between mb-2 gap-2">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <div className="flex items-center gap-2">
          {showInteractionModeControls ? (
            <div className="flex items-center gap-1 rounded border border-slate-700 bg-slate-900 p-1">
              {[
                { value: 'select', label: 'Select' },
                { value: 'live', label: 'Live' },
              ].map((option) => {
                const isActive = interactionMode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onInteractionModeChange?.(option.value)}
                    className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    title={option.value === 'select' ? 'Click blocks to select them' : 'Run preview interactions normally'}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          ) : null}
          {showViewportControls ? (
            <div className="flex items-center gap-1 rounded border border-slate-700 bg-slate-900 p-1">
              {VIEWPORT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = option.value === viewportOption.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onViewportModeChange?.(option.value)}
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
          {showQaControls ? (
            <div className="flex items-center gap-1 rounded border border-slate-700 bg-slate-900 p-1">
              {[
                { value: 'off', label: 'QA Off' },
                { value: 'issues', label: 'Issues' },
              ].map((option) => {
                const isActive = qaMode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onQaModeChange?.(option.value)}
                    className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                      isActive
                        ? 'bg-amber-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    title={option.value === 'issues' ? 'Highlight blocks with validation issues' : 'Hide preview QA highlights'}
                  >
                    {option.label}
                  </button>
                );
              })}
              {qaSummary ? (
                <div className="ml-1 flex items-center gap-1 border-l border-slate-700 pl-2 text-[10px] font-bold uppercase tracking-wide">
                  <span className={qaSummary.error ? 'text-rose-400' : 'text-slate-500'}>{qaSummary.error || 0}E</span>
                  <span className={qaSummary.warn ? 'text-amber-300' : 'text-slate-500'}>{qaSummary.warn || 0}W</span>
                </div>
              ) : null}
            </div>
          ) : null}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-700"
            title="Remount preview iframe"
          >
            <RefreshCw size={12} />
            Reset
          </button>
        </div>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">{description}</p>
      <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
        <div className="mx-auto overflow-hidden rounded-lg border border-slate-800 bg-black shadow-2xl transition-all duration-200" style={viewportStyle}>
          {srcDoc ? (
            <iframe
              ref={iframeRef}
              key={iframeKey}
              srcDoc={srcDoc}
              className={iframeClassName}
              style={iframeStyle}
              sandbox={sandbox}
              title={titleText}
              onLoad={onLoad}
            />
          ) : (
            <div className="flex h-48 items-center justify-center text-xs text-slate-500">{emptyMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}
