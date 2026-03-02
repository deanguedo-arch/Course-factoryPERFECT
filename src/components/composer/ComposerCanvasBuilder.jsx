import * as React from 'react';
import { getActivityDefinition } from '../../composer/activityRegistry.js';
import ComposerCanvasGrid from './ComposerCanvasGrid.jsx';

export default function ComposerCanvasBuilder({
  activities = [],
  allowOverlap = false,
  cols = 1,
  containerPadding = [12, 12],
  layoutItems = null,
  margin = [12, 12],
  onBeginInteraction,
  onFinishInteraction,
  onLiveResizeLayoutChange,
  onSelectActivity,
  rowHeight = 24,
  selectedIndex = 0,
  selectedIndexes = [],
  wrapperStyle = null,
}) {
  const resolvedLayoutItems = React.useMemo(
    () =>
      Array.isArray(layoutItems)
        ? layoutItems
        : activities.map((activity, idx) => ({
            i: String(idx),
            x: Number.isInteger(activity?.layout?.x) ? activity.layout.x : 0,
            y: Number.isInteger(activity?.layout?.y) ? activity.layout.y : 0,
            w: Math.max(
              1,
              Math.min(cols, Number.parseInt(activity?.layout?.w, 10) || Number.parseInt(activity?.layout?.colSpan, 10) || 1),
            ),
            h: Math.max(1, Number.parseInt(activity?.layout?.h, 10) || 4),
          })),
    [activities, cols, layoutItems],
  );

  return (
    <ComposerCanvasGrid
      allowOverlap={allowOverlap}
      wrapperStyle={wrapperStyle}
      layoutItems={resolvedLayoutItems}
      cols={cols}
      rowHeight={rowHeight}
      margin={margin}
      containerPadding={containerPadding}
      onBeginInteraction={onBeginInteraction}
      onFinishInteraction={onFinishInteraction}
      onLiveResizeLayoutChange={onLiveResizeLayoutChange}
    >
      {activities.map((activity, idx) => {
        const def = getActivityDefinition(activity.type);
        const isSelected = idx === selectedIndex;
        const isMultiSelected = Array.isArray(selectedIndexes) && selectedIndexes.includes(idx);
        return (
          <div key={String(idx)} className="overflow-hidden">
            <button
              type="button"
              onClick={(event) => onSelectActivity?.(idx, event)}
              className={`w-full h-full text-left p-2 rounded border transition-colors ${
                isSelected
                  ? 'bg-emerald-900/30 border-emerald-600 text-white'
                  : isMultiSelected
                    ? 'bg-sky-950/50 border-sky-500 text-sky-100'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold truncate">{def?.label || activity.type}</p>
                <span className="cf-canvas-handle inline-flex items-center justify-center w-5 h-5 rounded bg-slate-800 text-slate-300 text-[10px] font-black cursor-grab active:cursor-grabbing">
                  ::
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono truncate mt-1">{activity.id || `activity-${idx + 1}`}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">
                x:{activity?.layout?.x || 0} y:{activity?.layout?.y || 0} w:{activity?.layout?.w || 1} h:{activity?.layout?.h || 4}
              </p>
            </button>
          </div>
        );
      })}
    </ComposerCanvasGrid>
  );
}
