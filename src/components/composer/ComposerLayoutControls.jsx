import * as React from 'react';

const ACCENT_CLASS_MAP = {
  blue: {
    activeButton: 'bg-blue-600 border-blue-400 text-white',
    toggleOn: 'border-blue-300 bg-blue-500',
  },
  indigo: {
    activeButton: 'bg-indigo-600 border-indigo-400 text-white',
    toggleOn: 'border-indigo-300 bg-indigo-500',
  },
};

export default function ComposerLayoutControls({
  accent = 'indigo',
  containerPadding = [12, 12],
  layoutMode = 'simple',
  margin = [12, 12],
  maxColumns = 1,
  rowHeight = 24,
  simpleMatchTallestRow = false,
  onCanvasMetricChange,
  onLayoutModeChange,
  onMaxColumnsChange,
  onSimpleMatchTallestRowChange,
}) {
  const [showAdvancedCanvasMetrics, setShowAdvancedCanvasMetrics] = React.useState(false);
  const accentClasses = ACCENT_CLASS_MAP[accent] || ACCENT_CLASS_MAP.indigo;
  const gapX = Array.isArray(margin) ? margin[0] : 12;
  const gapY = Array.isArray(margin) ? margin[1] : 12;
  const padX = Array.isArray(containerPadding) ? containerPadding[0] : 12;
  const padY = Array.isArray(containerPadding) ? containerPadding[1] : 12;
  const isCanvasMode = layoutMode === 'canvas';

  return (
    <div className="mb-3 p-2 rounded border border-slate-700 bg-slate-900/60">
      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Arrange</label>
      <div className="grid grid-cols-2 gap-2 mb-2">
        {[
          { value: 'simple', label: 'Stacked' },
          { value: 'canvas', label: 'Freeform' },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onLayoutModeChange?.(option.value)}
            className={`rounded px-2 py-1 text-[10px] font-black uppercase tracking-wide border ${
              layoutMode === option.value
                ? accentClasses.activeButton
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Page Width</label>
      <select
        value={maxColumns}
        onChange={(event) => onMaxColumnsChange?.(event.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
      >
        {[1, 2, 3, 4].map((count) => (
          <option key={count} value={count}>
            {count} {count === 1 ? 'Column' : 'Columns'}
          </option>
        ))}
      </select>

      {isCanvasMode ? (
        <div className="mt-2 rounded border border-slate-700 bg-slate-950/60 p-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-200">Advanced Canvas Metrics</p>
              <p className="text-[10px] text-slate-500">Only adjust these if spacing feels wrong.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvancedCanvasMetrics((prev) => !prev)}
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-200 hover:bg-slate-800"
            >
              {showAdvancedCanvasMetrics ? 'Hide' : 'Show'}
            </button>
          </div>
          {showAdvancedCanvasMetrics ? (
            <div className="mt-2 grid grid-cols-5 gap-2">
              <label className="text-[10px] text-slate-400">
                Row H
                <input
                  type="number"
                  min="8"
                  max="200"
                  value={rowHeight}
                  onChange={(event) => onCanvasMetricChange?.('rowHeight', event.target.value)}
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded p-1 text-white text-xs"
                />
              </label>
              <label className="text-[10px] text-slate-400">
                Gap X
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={gapX}
                  onChange={(event) => onCanvasMetricChange?.('margin', [Number.parseInt(event.target.value, 10) || 0, gapY])}
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded p-1 text-white text-xs"
                />
              </label>
              <label className="text-[10px] text-slate-400">
                Gap Y
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={gapY}
                  onChange={(event) => onCanvasMetricChange?.('margin', [gapX, Number.parseInt(event.target.value, 10) || 0])}
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded p-1 text-white text-xs"
                />
              </label>
              <label className="text-[10px] text-slate-400">
                Pad X
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={padX}
                  onChange={(event) =>
                    onCanvasMetricChange?.('containerPadding', [Number.parseInt(event.target.value, 10) || 0, padY])
                  }
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded p-1 text-white text-xs"
                />
              </label>
              <label className="text-[10px] text-slate-400">
                Pad Y
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={padY}
                  onChange={(event) =>
                    onCanvasMetricChange?.('containerPadding', [padX, Number.parseInt(event.target.value, 10) || 0])
                  }
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded p-1 text-white text-xs"
                />
              </label>
            </div>
          ) : null}
        </div>
      ) : (
        <label className="mt-2 flex items-center justify-between gap-3 rounded border border-slate-700 bg-slate-900/70 px-2 py-2 text-[10px] text-slate-300">
          <div>
            <p className="font-black uppercase tracking-wide text-slate-200">Equalize Row Heights</p>
            <p className="text-slate-500">Keep blocks in the same row visually aligned.</p>
          </div>
          <button
            type="button"
            onClick={() => onSimpleMatchTallestRowChange?.(!(simpleMatchTallestRow === true))}
            className={`inline-flex h-5 w-9 items-center rounded-full border transition-colors ${
              simpleMatchTallestRow === true ? accentClasses.toggleOn : 'border-slate-600 bg-slate-800'
            }`}
            aria-label="Toggle simple row height matching"
          >
            <span
              className={`mx-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                simpleMatchTallestRow === true ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </label>
      )}
    </div>
  );
}
