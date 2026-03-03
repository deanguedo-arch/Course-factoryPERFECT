import * as React from 'react';

export default function ComposerWorkspaceControls({
  builderCanvasWidth = 0,
  builderCellWidth = 220,
  builderHeight = 760,
  editorPaneWidth = 45,
  lockBuilderScale = true,
  maxColumns = 1,
  onBuilderCellWidthChange,
  onBuilderHeightChange,
  onLockBuilderScaleChange,
  onPreviewHeightChange,
  onPreviewWidthChange,
  previewHeight = 900,
  previewWidth = 55,
  showBuilderSizing = false,
  showPreviewHeight = false,
  showPreviewWidth = false,
}) {
  const showAnything = showPreviewWidth || showPreviewHeight || showBuilderSizing;
  if (!showAnything) return null;

  return (
    <div className="cf-composer-panel-soft space-y-3 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-slate-300">Workspace settings</p>
          <p className="text-[11px] text-slate-500">These controls only change the editor workspace. They do not affect the published lesson.</p>
        </div>
      </div>
      {showPreviewWidth ? (
        <div className="cf-composer-panel-soft p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <label className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Canvas split</label>
            <input
              type="range"
              min="30"
              max="75"
              value={previewWidth}
              onChange={(event) => onPreviewWidthChange?.(event.target.value)}
              className="flex-1 accent-indigo-500"
            />
            <p className="text-[11px] text-slate-400 whitespace-nowrap">
              {previewWidth}% preview / {editorPaneWidth}% left pane
            </p>
          </div>
        </div>
      ) : null}

      {showPreviewHeight ? (
        <div className="cf-composer-panel-soft p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <label className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Preview height</label>
            <input
              type="range"
              min="420"
              max="2000"
              step="20"
              value={previewHeight}
              onChange={(event) => onPreviewHeightChange?.(event.target.value)}
              className="flex-1 accent-indigo-500"
            />
            <p className="text-[11px] text-slate-400 whitespace-nowrap">{previewHeight}px tall</p>
          </div>
        </div>
      ) : null}

      {showBuilderSizing ? (
        <div className="cf-composer-panel-soft space-y-3 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <label className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Builder height</label>
            <input
              type="range"
              min="360"
              max="1800"
              step="20"
              value={builderHeight}
              onChange={(event) => onBuilderHeightChange?.(event.target.value)}
              className="flex-1 accent-indigo-500"
            />
            <p className="text-[11px] text-slate-400 whitespace-nowrap">{builderHeight}px tall</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <label className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Builder scale</label>
            <input
              type="range"
              min="140"
              max="360"
              step="10"
              value={builderCellWidth}
              onChange={(event) => onBuilderCellWidthChange?.(event.target.value)}
              className="flex-1 accent-indigo-500"
            />
            <p className="text-[11px] text-slate-400 whitespace-nowrap">{builderCellWidth}px per column</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 whitespace-nowrap text-[11px] text-slate-300">
              <input
                type="checkbox"
                checked={lockBuilderScale}
                onChange={(event) => onLockBuilderScaleChange?.(event.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500"
              />
              Lock Block Scale
            </label>
            <p className="text-[11px] text-slate-500">
              {maxColumns} cols x {builderCellWidth}px = {builderCanvasWidth}px canvas
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
