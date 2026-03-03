import * as React from 'react';

export default function ComposerLayoutControls({
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
  const gapX = Array.isArray(margin) ? margin[0] : 12;
  const gapY = Array.isArray(margin) ? margin[1] : 12;
  const padX = Array.isArray(containerPadding) ? containerPadding[0] : 12;
  const padY = Array.isArray(containerPadding) ? containerPadding[1] : 12;
  const isCanvasMode = layoutMode === 'canvas';

  return (
    <div className="cf-composer-panel-soft mb-3 space-y-3 p-3">
      <div>
        <p className="cf-meta-label">Arrange</p>
        <p className="cf-meta-copy mt-1">Choose whether sections snap to the lesson flow or move freely on the canvas.</p>
      </div>
      <div className="cf-tab-rail grid grid-cols-2 gap-2 p-1">
        {[
          { value: 'simple', label: 'Stacked' },
          { value: 'canvas', label: 'Freeform' },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onLayoutModeChange?.(option.value)}
            className={`cf-tab-btn px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${
              layoutMode === option.value ? 'cf-tab-btn-active' : ''
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="space-y-2">
        <span className="cf-meta-label">Page Width</span>
      <select
        value={maxColumns}
        onChange={(event) => onMaxColumnsChange?.(event.target.value)}
        className="cf-input-shell px-3 py-2 text-xs"
      >
        {[1, 2, 3, 4].map((count) => (
          <option key={count} value={count}>
            {count} {count === 1 ? 'Column' : 'Columns'}
          </option>
        ))}
      </select>
      </label>

      {isCanvasMode ? (
        <div className="cf-panel-muted space-y-3 p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="cf-meta-label">Advanced Canvas Metrics</p>
              <p className="cf-meta-copy mt-1">Only adjust these if spacing feels wrong.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvancedCanvasMetrics((prev) => !prev)}
              className="cf-btn cf-btn-secondary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
            >
              {showAdvancedCanvasMetrics ? 'Hide' : 'Show'}
            </button>
          </div>
          {showAdvancedCanvasMetrics ? (
            <div className="mt-2 grid grid-cols-5 gap-2">
              <label className="space-y-1">
                <span className="cf-meta-label">Row H</span>
                <input
                  type="number"
                  min="8"
                  max="200"
                  value={rowHeight}
                  onChange={(event) => onCanvasMetricChange?.('rowHeight', event.target.value)}
                  className="cf-input-shell px-2 py-1.5 text-xs"
                />
              </label>
              <label className="space-y-1">
                <span className="cf-meta-label">Gap X</span>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={gapX}
                  onChange={(event) => onCanvasMetricChange?.('margin', [Number.parseInt(event.target.value, 10) || 0, gapY])}
                  className="cf-input-shell px-2 py-1.5 text-xs"
                />
              </label>
              <label className="space-y-1">
                <span className="cf-meta-label">Gap Y</span>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={gapY}
                  onChange={(event) => onCanvasMetricChange?.('margin', [gapX, Number.parseInt(event.target.value, 10) || 0])}
                  className="cf-input-shell px-2 py-1.5 text-xs"
                />
              </label>
              <label className="space-y-1">
                <span className="cf-meta-label">Pad X</span>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={padX}
                  onChange={(event) =>
                    onCanvasMetricChange?.('containerPadding', [Number.parseInt(event.target.value, 10) || 0, padY])
                  }
                  className="cf-input-shell px-2 py-1.5 text-xs"
                />
              </label>
              <label className="space-y-1">
                <span className="cf-meta-label">Pad Y</span>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={padY}
                  onChange={(event) =>
                    onCanvasMetricChange?.('containerPadding', [padX, Number.parseInt(event.target.value, 10) || 0])
                  }
                  className="cf-input-shell px-2 py-1.5 text-xs"
                />
              </label>
            </div>
          ) : null}
        </div>
      ) : (
        <label className="cf-panel-muted mt-2 flex items-center justify-between gap-3 px-3 py-3">
          <div>
            <p className="cf-meta-label">Equalize Row Heights</p>
            <p className="cf-meta-copy mt-1">Keep blocks in the same row visually aligned.</p>
          </div>
          <button
            type="button"
            onClick={() => onSimpleMatchTallestRowChange?.(!(simpleMatchTallestRow === true))}
            className={`cf-toggle-switch ${simpleMatchTallestRow === true ? 'is-on' : ''}`}
            aria-label="Toggle simple row height matching"
          >
            <span className="cf-toggle-knob" />
          </button>
        </label>
      )}
    </div>
  );
}
