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
  const [isOpen, setIsOpen] = React.useState(false);
  const label = BREAKPOINT_LABELS[activeBreakpoint] || 'Desktop';
  const isDesktop = activeBreakpoint === 'desktop';
  const summaryLabel = isDesktop ? 'Desktop uses the base layout.' : `Adjust ${label.toLowerCase()} only when the page needs a device-specific fix.`;

  return (
    <div className="cf-composer-panel-soft mt-3 space-y-3 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="cf-meta-label">Device Overrides</p>
          <p className="cf-meta-copy mt-1">{summaryLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isDesktop ? (
            <button
              type="button"
              onClick={onReset}
              disabled={!canReset}
              className="cf-btn cf-btn-secondary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
            >
              Use Desktop
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="cf-btn cf-btn-secondary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
          >
            {isOpen ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="cf-panel-muted mt-3 space-y-3 p-3">
          <label className="inline-flex items-center gap-2 text-[11px]" style={{ color: 'var(--cf-text-secondary)' }}>
            <input
              type="checkbox"
              checked={hidden}
              onChange={(event) => onHiddenChange?.(event.target.checked)}
              className="cf-check"
              disabled={isDesktop}
            />
            Hide on {label}
          </label>

          {!hidden ? (
            isCanvasMode ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <label className="space-y-1">
                  <span className="cf-meta-label">X</span>
                  <input
                    type="number"
                    min="0"
                    value={x}
                    onChange={(event) => onCanvasXChange?.(event.target.value)}
                    disabled={isDesktop}
                    className="cf-input-shell w-16 px-2 py-1.5 text-xs disabled:opacity-40"
                  />
                </label>
                <label className="space-y-1">
                  <span className="cf-meta-label">Y</span>
                  <input
                    type="number"
                    min="0"
                    value={y}
                    onChange={(event) => onCanvasYChange?.(event.target.value)}
                    disabled={isDesktop}
                    className="cf-input-shell w-16 px-2 py-1.5 text-xs disabled:opacity-40"
                  />
                </label>
                <label className="space-y-1">
                  <span className="cf-meta-label">W</span>
                  <input
                    type="number"
                    min="1"
                    max={maxColumns}
                    value={width}
                    onChange={(event) => onCanvasWChange?.(event.target.value)}
                    disabled={isDesktop}
                    className="cf-input-shell w-16 px-2 py-1.5 text-xs disabled:opacity-40"
                  />
                </label>
                <label className="space-y-1">
                  <span className="cf-meta-label">H</span>
                  <input
                    type="number"
                    min="1"
                    value={height}
                    onChange={(event) => onCanvasHChange?.(event.target.value)}
                    disabled={isDesktop}
                    className="cf-input-shell w-16 px-2 py-1.5 text-xs disabled:opacity-40"
                  />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <label className="space-y-1">
                  <span className="cf-meta-label">{label} Row</span>
                  <input
                    type="number"
                    min="1"
                    value={row}
                    onChange={(event) => onRowChange?.(event.target.value)}
                    disabled={isDesktop}
                    className="cf-input-shell px-2 py-1.5 text-xs disabled:opacity-40"
                  />
                </label>
                <label className="space-y-1">
                  <span className="cf-meta-label">{label} Col</span>
                  <input
                    type="number"
                    min="1"
                    max={maxColumns}
                    value={col}
                    onChange={(event) => onColChange?.(event.target.value)}
                    disabled={isDesktop}
                    className="cf-input-shell px-2 py-1.5 text-xs disabled:opacity-40"
                  />
                </label>
                <label className="space-y-1">
                  <span className="cf-meta-label">{label} Span</span>
                  <select
                    value={span}
                    onChange={(event) => onSpanChange?.(event.target.value)}
                    disabled={isDesktop}
                    className="cf-input-shell px-2 py-1.5 text-xs disabled:opacity-40"
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
      ) : null}

      {isOpen && isCanvasMode ? (
        <p className="cf-meta-copy mt-2">
          Desktop positions remain the base in canvas mode. Use device overrides only when a specific screen needs a fix.
        </p>
      ) : null}
    </div>
  );
}
