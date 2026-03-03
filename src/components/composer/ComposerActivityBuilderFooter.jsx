import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Copy,
  Plus,
  Trash2,
} from 'lucide-react';

export default function ComposerActivityBuilderFooter({
  activityTypeGroups = [],
  bulkControls = null,
  canvasExtraControls = null,
  canvasH = 4,
  canvasW = 1,
  canvasX = 0,
  canvasY = 0,
  getActivityLabel = null,
  isCanvasMode = false,
  maxColumns = 1,
  moveDownDisabled = false,
  moveLeftDisabled = false,
  moveRightDisabled = false,
  moveUpDisabled = false,
  newActivityType = '',
  onAddActivity,
  onAddOpenRow,
  onCanvasHChange,
  onCanvasWChange,
  onCanvasXChange,
  onCanvasYChange,
  onDelete,
  onDuplicate,
  onMoveDown,
  onMoveLeft,
  onMoveRight,
  onMoveUp,
  onNewActivityTypeChange,
  onQuickAddActivityType,
  onSpanChange,
  responsiveControls = null,
  selectedActivity = null,
  selectedSpan = 1,
}) {
  const quickInsertTypes = ['title_block', 'content_block', 'reflection_journal', 'knowledge_check', 'resource_list', 'tabs_block'];
  const controlButtonClass = 'cf-btn cf-btn-secondary px-3 py-2 text-[11px] font-semibold';

  return (
    <>
      <div className="cf-composer-panel-soft space-y-3 p-3">
        <div>
          <p className="cf-meta-label">Add Section</p>
          <p className="cf-meta-copy mt-1">Start from a strong section pattern, then tune it in the inspector.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickInsertTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onNewActivityTypeChange?.(type);
                onQuickAddActivityType?.(type);
              }}
              className={controlButtonClass}
            >
              {getActivityLabel ? getActivityLabel(type) : type}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={newActivityType}
            onChange={(event) => onNewActivityTypeChange?.(event.target.value)}
            className="cf-input-shell col-span-2 px-3 py-2 text-xs"
          >
            {activityTypeGroups.map((group) => (
              <optgroup key={group.category} label={group.label}>
                {group.types.map((type) => (
                  <option key={type} value={type}>
                    {getActivityLabel ? getActivityLabel(type) : type}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            type="button"
            onClick={onAddActivity}
            className="cf-btn cf-btn-success py-2 text-xs font-bold"
          >
            <Plus size={12} /> Add Section
          </button>
        </div>
      </div>

      {!isCanvasMode ? (
        <>
          <button
            type="button"
            onClick={onAddOpenRow}
            className="cf-btn cf-btn-secondary mt-2 w-full py-2 text-xs font-bold"
            title="Add one open row below the selected block (or at bottom if none selected)"
          >
            <Plus size={12} /> Add Open Row
          </button>
          <div className="cf-panel-muted mt-2 grid grid-cols-[auto,1fr] items-center gap-3 p-3">
            <label className="cf-meta-label">Section Width</label>
            <select
              value={selectedSpan}
              onChange={(event) => onSpanChange?.(event.target.value)}
              disabled={!selectedActivity}
              className="cf-input-shell px-3 py-2 text-xs disabled:opacity-40"
            >
              {Array.from({ length: maxColumns }, (_, idx) => idx + 1).map((span) => (
                <option key={span} value={span}>
                  Span {span}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={onMoveLeft}
              disabled={moveLeftDisabled}
              className="cf-btn cf-btn-secondary px-2 py-2 text-xs font-bold"
              title="Move left"
            >
              <ChevronLeft size={12} /> Left
            </button>
            <button
              type="button"
              onClick={onMoveRight}
              disabled={moveRightDisabled}
              className="cf-btn cf-btn-secondary px-2 py-2 text-xs font-bold"
              title="Move right"
            >
              <ChevronRight size={12} /> Right
            </button>
            <button
              type="button"
              onClick={onMoveUp}
              disabled={moveUpDisabled}
              className="cf-btn cf-btn-secondary px-2 py-2 text-xs font-bold"
            >
              <ChevronUp size={12} /> Up
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={moveDownDisabled}
              className="cf-btn cf-btn-secondary px-2 py-2 text-xs font-bold"
            >
              <ChevronDown size={12} /> Down
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="cf-panel-muted mt-2 grid grid-cols-4 gap-2 p-3">
            <label className="space-y-1">
              <span className="cf-meta-label">X</span>
              <input
                type="number"
                min="0"
                value={canvasX}
                onChange={(event) => onCanvasXChange?.(event.target.value)}
                disabled={!selectedActivity}
                className="cf-input-shell w-full px-2 py-1.5 text-xs disabled:opacity-40"
              />
            </label>
            <label className="space-y-1">
              <span className="cf-meta-label">Y</span>
              <input
                type="number"
                min="0"
                value={canvasY}
                onChange={(event) => onCanvasYChange?.(event.target.value)}
                disabled={!selectedActivity}
                className="cf-input-shell w-full px-2 py-1.5 text-xs disabled:opacity-40"
              />
            </label>
            <label className="space-y-1">
              <span className="cf-meta-label">W</span>
              <input
                type="number"
                min="1"
                max={maxColumns}
                value={canvasW}
                onChange={(event) => onCanvasWChange?.(event.target.value)}
                disabled={!selectedActivity}
                className="cf-input-shell w-full px-2 py-1.5 text-xs disabled:opacity-40"
              />
            </label>
            <label className="space-y-1">
              <span className="cf-meta-label">H</span>
              <input
                type="number"
                min="1"
                value={canvasH}
                onChange={(event) => onCanvasHChange?.(event.target.value)}
                disabled={!selectedActivity}
                className="cf-input-shell w-full px-2 py-1.5 text-xs disabled:opacity-40"
              />
            </label>
          </div>
          {canvasExtraControls}
        </>
      )}

      {responsiveControls}

      {bulkControls}

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onDuplicate}
          disabled={!selectedActivity}
          className="cf-btn cf-btn-primary flex-1 px-3 py-2 text-xs font-bold"
          title="Duplicate selected activity"
        >
          <Copy size={12} /> Duplicate
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={!selectedActivity}
          className="cf-btn cf-btn-danger flex-1 px-3 py-2 text-xs font-bold"
          title="Delete selected activity"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </>
  );
}
