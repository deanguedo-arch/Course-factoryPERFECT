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
  onSpanChange,
  responsiveControls = null,
  selectedActivity = null,
  selectedSpan = 1,
}) {
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <select
          value={newActivityType}
          onChange={(event) => onNewActivityTypeChange?.(event.target.value)}
          className="col-span-2 rounded border border-slate-700 bg-slate-900 p-2 text-xs text-white"
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
          className="inline-flex items-center justify-center gap-1 rounded bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {!isCanvasMode ? (
        <>
          <button
            type="button"
            onClick={onAddOpenRow}
            className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-white hover:bg-slate-700"
            title="Add one open row below the selected block (or at bottom if none selected)"
          >
            <Plus size={12} /> Add Open Row
          </button>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="self-center text-[11px] font-bold uppercase text-slate-400">Selected Span</label>
            <select
              value={selectedSpan}
              onChange={(event) => onSpanChange?.(event.target.value)}
              disabled={!selectedActivity}
              className="rounded border border-slate-700 bg-slate-900 p-2 text-xs text-white disabled:opacity-40"
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
              className="inline-flex items-center justify-center gap-1 rounded bg-slate-700 px-2 py-1.5 text-xs text-white hover:bg-slate-600 disabled:opacity-40"
              title="Move left"
            >
              <ChevronLeft size={12} /> Left
            </button>
            <button
              type="button"
              onClick={onMoveRight}
              disabled={moveRightDisabled}
              className="inline-flex items-center justify-center gap-1 rounded bg-slate-700 px-2 py-1.5 text-xs text-white hover:bg-slate-600 disabled:opacity-40"
              title="Move right"
            >
              <ChevronRight size={12} /> Right
            </button>
            <button
              type="button"
              onClick={onMoveUp}
              disabled={moveUpDisabled}
              className="inline-flex items-center justify-center gap-1 rounded bg-slate-700 px-2 py-1.5 text-xs text-white hover:bg-slate-600 disabled:opacity-40"
            >
              <ChevronUp size={12} /> Up
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={moveDownDisabled}
              className="inline-flex items-center justify-center gap-1 rounded bg-slate-700 px-2 py-1.5 text-xs text-white hover:bg-slate-600 disabled:opacity-40"
            >
              <ChevronDown size={12} /> Down
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mt-2 grid grid-cols-4 gap-2">
            <label className="text-[10px] text-slate-400">
              X
              <input
                type="number"
                min="0"
                value={canvasX}
                onChange={(event) => onCanvasXChange?.(event.target.value)}
                disabled={!selectedActivity}
                className="mt-1 w-full rounded border border-slate-700 bg-slate-900 p-1 text-xs text-white disabled:opacity-40"
              />
            </label>
            <label className="text-[10px] text-slate-400">
              Y
              <input
                type="number"
                min="0"
                value={canvasY}
                onChange={(event) => onCanvasYChange?.(event.target.value)}
                disabled={!selectedActivity}
                className="mt-1 w-full rounded border border-slate-700 bg-slate-900 p-1 text-xs text-white disabled:opacity-40"
              />
            </label>
            <label className="text-[10px] text-slate-400">
              W
              <input
                type="number"
                min="1"
                max={maxColumns}
                value={canvasW}
                onChange={(event) => onCanvasWChange?.(event.target.value)}
                disabled={!selectedActivity}
                className="mt-1 w-full rounded border border-slate-700 bg-slate-900 p-1 text-xs text-white disabled:opacity-40"
              />
            </label>
            <label className="text-[10px] text-slate-400">
              H
              <input
                type="number"
                min="1"
                value={canvasH}
                onChange={(event) => onCanvasHChange?.(event.target.value)}
                disabled={!selectedActivity}
                className="mt-1 w-full rounded border border-slate-700 bg-slate-900 p-1 text-xs text-white disabled:opacity-40"
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
          className="flex-1 inline-flex items-center justify-center gap-1 rounded bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-500 disabled:opacity-40"
          title="Duplicate selected activity"
        >
          <Copy size={12} /> Duplicate
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={!selectedActivity}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded bg-rose-600 px-3 py-1.5 text-xs text-white hover:bg-rose-500 disabled:opacity-40"
          title="Delete selected activity"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </>
  );
}
