import * as React from 'react';

const BREAKPOINT_LABELS = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
};

export default function ComposerResponsiveControls({
  activeBreakpoint = 'desktop',
  canReset = false,
  col = 1,
  hidden = false,
  row = 1,
  isCanvasMode = false,
  maxColumns = 1,
  onCanvasHChange,
  onCanvasWChange,
  onCanvasXChange,
  onCanvasYChange,
  onColChange,
  onHiddenChange,
  onReset,
  onRowChange,
  onSpanChange,
  span = 1,
  x = 0,
  y = 0,
  width = 1,
  height = 4,
}) {
  const label = BREAKPOINT_LABELS[activeBreakpoint] || 'Desktop';
  const isDesktop = activeBreakpoint === 'desktop';

  return (
    <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-300">Responsive Override</p>
          <p className="text-[10px] text-slate-500">
            {isDesktop ? 'Desktop is the base layout.' : `Editing the ${label.toLowerCase()} override.`}
          </p>
        </div>
        {!isDesktop ? (
          <button
            type="button"
            onClick={onReset}
            disabled={!canReset}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-200 hover:bg-slate-800 disabled:opacity-40"
          >
            Use Desktop
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-[11px] text-slate-300">
          <input
            type="checkbox"
            checked={hidden}
            onChange={(event) => onHiddenChange?.(event.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-indigo-500"
            disabled={isDesktop}
          />
          Hide on {label}
        </label>

        {!hidden ? (
          isCanvasMode ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <label className="text-[10px] text-slate-400">
                X
                <input
                  type="number"
                  min="0"
                  value={x}
                  onChange={(event) => onCanvasXChange?.(event.target.value)}
                  disabled={isDesktop}
                  className="mt-1 w-16 rounded border border-slate-700 bg-slate-950 p-1 text-xs text-white disabled:opacity-40"
                />
              </label>
              <label className="text-[10px] text-slate-400">
                Y
                <input
                  type="number"
                  min="0"
                  value={y}
                  onChange={(event) => onCanvasYChange?.(event.target.value)}
                  disabled={isDesktop}
                  className="mt-1 w-16 rounded border border-slate-700 bg-slate-950 p-1 text-xs text-white disabled:opacity-40"
                />
              </label>
              <label className="text-[10px] text-slate-400">
                W
                <input
                  type="number"
                  min="1"
                  max={maxColumns}
                  value={width}
                  onChange={(event) => onCanvasWChange?.(event.target.value)}
                  disabled={isDesktop}
                  className="mt-1 w-16 rounded border border-slate-700 bg-slate-950 p-1 text-xs text-white disabled:opacity-40"
                />
              </label>
              <label className="text-[10px] text-slate-400">
                H
                <input
                  type="number"
                  min="1"
                  value={height}
                  onChange={(event) => onCanvasHChange?.(event.target.value)}
                  disabled={isDesktop}
                  className="mt-1 w-16 rounded border border-slate-700 bg-slate-950 p-1 text-xs text-white disabled:opacity-40"
                />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <label className="text-[10px] text-slate-400">
                {label} Row
                <input
                  type="number"
                  min="1"
                  value={row}
                  onChange={(event) => onRowChange?.(event.target.value)}
                  disabled={isDesktop}
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 p-1.5 text-xs text-white disabled:opacity-40"
                />
              </label>
              <label className="text-[10px] text-slate-400">
                {label} Col
                <input
                  type="number"
                  min="1"
                  max={maxColumns}
                  value={col}
                  onChange={(event) => onColChange?.(event.target.value)}
                  disabled={isDesktop}
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 p-1.5 text-xs text-white disabled:opacity-40"
                />
              </label>
              <label className="text-[10px] text-slate-400">
                {label} Span
                <select
                  value={span}
                  onChange={(event) => onSpanChange?.(event.target.value)}
                  disabled={isDesktop}
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 p-1.5 text-xs text-white disabled:opacity-40"
                >
                  {Array.from({ length: maxColumns }, (_, idx) => idx + 1).map((value) => (
                    <option key={value} value={value}>
                      Span {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )
        ) : null}
      </div>

      {isCanvasMode ? (
        <p className="mt-2 text-[10px] text-slate-500">
          Breakpoint overrides currently adjust canvas block size and visibility. Desktop coordinates stay authoritative in this pass.
        </p>
      ) : null}
    </div>
  );
}
