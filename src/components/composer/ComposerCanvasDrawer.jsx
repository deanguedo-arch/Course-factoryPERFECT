import * as React from 'react';
import {
  AlertTriangle,
  Copy,
  Link2,
  Plus,
  RefreshCw,
  Trash2,
  Unlink,
  Upload,
} from 'lucide-react';
import {
  buildComposerComponentEntry,
  normalizeComposerComponentLibrary,
} from '../../composer/componentLibrary.js';
import { getActivityDefinition } from '../../composer/activityRegistry.js';
import ComposerLayoutControls from './ComposerLayoutControls.jsx';

const QUICK_INSERT_TYPES = [
  'title_block',
  'content_block',
  'reflection_journal',
  'knowledge_check',
  'resource_list',
  'tabs_block',
];

function SectionCard({ title, description = '', children }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
      <div className="mb-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-200">{title}</p>
        {description ? <p className="mt-1 text-[11px] text-slate-500">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled = false,
  tone = 'default',
  title = '',
  className = '',
}) {
  const toneClass =
    tone === 'danger'
      ? 'bg-rose-600 text-white hover:bg-rose-500'
      : tone === 'primary'
        ? 'bg-emerald-600 text-white hover:bg-emerald-500'
        : tone === 'secondary'
          ? 'bg-indigo-600 text-white hover:bg-indigo-500'
          : 'bg-slate-800 text-slate-100 hover:bg-slate-700';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center justify-center gap-1 rounded px-3 py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${toneClass} ${className}`}
    >
      {children}
    </button>
  );
}

function getActivityLabelFallback(getActivityLabel, type) {
  return getActivityLabel ? getActivityLabel(type) : getActivityDefinition(type)?.label || type;
}

export default function ComposerCanvasDrawer({
  accent = 'indigo',
  activities = [],
  activityTypeGroups = [],
  containerPadding = [12, 12],
  courseComponents = [],
  getActivityLabel = null,
  isCanvasMode = false,
  layoutMode = 'simple',
  margin = [12, 12],
  maxColumns = 1,
  mode = 'grid',
  newActivityType = '',
  onAddActivity,
  onAddOpenRow,
  onCanvasLayoutChange,
  onCanvasMetricChange,
  onDeleteCourseComponent,
  onDeleteSelected,
  onDetachSelectedComponent,
  onDuplicateSelected,
  onFixDuplicateIds,
  onFixImageAltText,
  onFixMobileStacking,
  onInsertActivity,
  onInsertLinkedActivity,
  onLayoutModeChange,
  onMaxColumnsChange,
  onMove,
  onNewActivityTypeChange,
  onQuickAddActivityType,
  onSaveCourseComponent,
  onSelectIndex,
  onSimpleMatchTallestRowChange,
  onSpanChange,
  onUpdateSelectedCourseComponent,
  onUpdateSelectedCourseComponentInstances,
  rowHeight = 24,
  selectedActivity = null,
  selectedComponentStatus = null,
  selectedIndex = 0,
  simpleMatchTallestRow = false,
  validationResults = [],
  validationTotals = null,
}) {
  const [search, setSearch] = React.useState('');
  const [templateName, setTemplateName] = React.useState('');

  React.useEffect(() => {
    if (!selectedActivity) return;
    const def = getActivityDefinition(selectedActivity.type);
    setTemplateName(def?.label ? `${def.label}` : `${selectedActivity.type || 'Section'}`);
  }, [selectedActivity]);

  const normalizedCourseComponents = React.useMemo(
    () => normalizeComposerComponentLibrary(courseComponents, { fallbackPrefix: 'course-cmp' }),
    [courseComponents],
  );

  const filteredActivities = React.useMemo(() => {
    const term = String(search || '').trim().toLowerCase();
    const list = Array.isArray(activities) ? activities : [];
    if (!term) return list.map((activity, idx) => ({ activity, idx }));
    return list
      .map((activity, idx) => ({ activity, idx }))
      .filter(({ activity }) => {
        const def = getActivityDefinition(activity?.type);
        const label = String(def?.label || activity?.type || '').toLowerCase();
        const id = String(activity?.id || '').toLowerCase();
        return label.includes(term) || id.includes(term);
      });
  }, [activities, search]);

  const rowsWithIssues = React.useMemo(
    () => (Array.isArray(validationResults) ? validationResults.filter((row) => Array.isArray(row?.issues) && row.issues.length > 0) : []),
    [validationResults],
  );

  const totalIssues = Number(validationTotals?.error || 0) + Number(validationTotals?.warn || 0);
  const selectedLayout = selectedActivity?.layout || {};
  const selectedSpan = Math.max(1, Number.parseInt(selectedLayout.colSpan, 10) || 1);
  const selectedX = Math.max(0, Number.parseInt(selectedLayout.x, 10) || 0);
  const selectedY = Math.max(0, Number.parseInt(selectedLayout.y, 10) || 0);
  const selectedW = Math.max(1, Number.parseInt(selectedLayout.w, 10) || selectedSpan);
  const selectedH = Math.max(1, Number.parseInt(selectedLayout.h, 10) || 4);

  if (mode === 'outline') {
    return (
      <div className="space-y-3">
        <SectionCard title="Outline" description="Jump to a section without shrinking the canvas more than necessary.">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-xs text-white"
            placeholder="Search by name or id..."
          />
        </SectionCard>

        <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {filteredActivities.length === 0 ? (
            <p className="text-xs text-slate-500">No matching sections.</p>
          ) : (
            filteredActivities.map(({ activity, idx }) => {
              const def = getActivityDefinition(activity?.type);
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={activity?.id || `${activity?.type}-${idx}`}
                  type="button"
                  onClick={() => onSelectIndex?.(idx)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/30 text-white'
                      : 'border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <p className="text-xs font-bold">{idx + 1}. {def?.label || activity?.type || 'Section'}</p>
                  <p className="mt-1 truncate text-[10px] font-mono text-slate-500">{activity?.id || `activity-${idx + 1}`}</p>
                </button>
              );
            })
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ActionButton onClick={onDuplicateSelected} disabled={!selectedActivity} tone="secondary">
            <Copy size={12} /> Duplicate
          </ActionButton>
          <ActionButton onClick={onDeleteSelected} disabled={!selectedActivity} tone="danger">
            <Trash2 size={12} /> Delete
          </ActionButton>
        </div>
      </div>
    );
  }

  if (mode === 'issues') {
    return (
      <div className="space-y-3">
        <SectionCard
          title="Audit"
          description="Issues run in the background. Open this only when you need to jump to a problem."
        >
          <div className="flex items-center gap-4 text-[11px] font-bold">
            <span className={Number(validationTotals?.error || 0) > 0 ? 'text-rose-300' : 'text-slate-500'}>
              {Number(validationTotals?.error || 0)} errors
            </span>
            <span className={Number(validationTotals?.warn || 0) > 0 ? 'text-amber-200' : 'text-slate-500'}>
              {Number(validationTotals?.warn || 0)} warnings
            </span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {onFixDuplicateIds ? (
              <ActionButton onClick={onFixDuplicateIds} tone="default">Fix IDs</ActionButton>
            ) : null}
            {onFixImageAltText ? (
              <ActionButton onClick={onFixImageAltText} tone="default">Fill Alt Text</ActionButton>
            ) : null}
            {onFixMobileStacking ? (
              <ActionButton onClick={onFixMobileStacking} tone="default">Stack Mobile</ActionButton>
            ) : null}
          </div>
        </SectionCard>

        <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
          {rowsWithIssues.length === 0 ? (
            <p className="text-xs text-slate-500">No issues found.</p>
          ) : (
            rowsWithIssues.map((row) => {
              const def = getActivityDefinition(row.type);
              const isSelected = row.index === selectedIndex;
              return (
                <button
                  key={row.id || `issue-${row.index}`}
                  type="button"
                  onClick={() => onSelectIndex?.(row.index)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    isSelected
                      ? 'border-amber-500 bg-amber-950/20 text-white'
                      : 'border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold">{def?.label || row.type}</p>
                      <p className="mt-1 truncate text-[10px] font-mono text-slate-500">{row.id || `activity-${row.index + 1}`}</p>
                    </div>
                    <AlertTriangle
                      size={14}
                      className={row.issues.some((issue) => issue?.level === 'error') ? 'text-rose-400' : 'text-amber-300'}
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    {row.issues.slice(0, 3).map((issue, index) => (
                      <p
                        key={`${row.id || row.index}-issue-${index}`}
                        className={`text-[10px] ${issue.level === 'error' ? 'text-rose-300' : 'text-amber-200'}`}
                      >
                        {issue.level === 'error' ? 'Error' : 'Warn'}: {issue.message}
                      </p>
                    ))}
                    {row.issues.length > 3 ? (
                      <p className="text-[10px] text-slate-500">+{row.issues.length - 3} more</p>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  if (mode === 'templates') {
    return (
      <div className="space-y-3">
        <SectionCard title="Library" description="Shared components stay out of the main canvas until you need them.">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input
              type="text"
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
              className="rounded border border-slate-700 bg-slate-950 p-2 text-xs text-white"
              placeholder="Component name"
            />
            <ActionButton
              onClick={() =>
                selectedActivity &&
                onSaveCourseComponent?.(buildComposerComponentEntry(templateName, selectedActivity, { prefix: 'course-cmp' }))
              }
              disabled={!selectedActivity}
              tone="secondary"
            >
              <Copy size={12} /> Save Selected
            </ActionButton>
          </div>
        </SectionCard>

        {selectedComponentStatus?.linked ? (
          <SectionCard
            title="Selected Link"
            description={
              selectedComponentStatus?.missingSource
                ? 'This section points to a missing source.'
                : selectedComponentStatus?.stale
                  ? 'This section is out of sync with the library source.'
                  : 'This section is linked to the course library.'
            }
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {onUpdateSelectedCourseComponent ? (
                <ActionButton
                  onClick={onUpdateSelectedCourseComponent}
                  disabled={!selectedComponentStatus?.sourceEntry}
                  tone="default"
                >
                  <Upload size={12} /> Update Source
                </ActionButton>
              ) : null}
              {onUpdateSelectedCourseComponentInstances ? (
                <ActionButton
                  onClick={onUpdateSelectedCourseComponentInstances}
                  disabled={!selectedComponentStatus?.sourceEntry}
                  tone="default"
                >
                  <RefreshCw size={12} /> Update All
                </ActionButton>
              ) : null}
              {onDetachSelectedComponent ? (
                <ActionButton onClick={onDetachSelectedComponent} tone="danger">
                  <Unlink size={12} /> Detach
                </ActionButton>
              ) : null}
            </div>
          </SectionCard>
        ) : null}

        <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
          {normalizedCourseComponents.length === 0 ? (
            <p className="text-xs text-slate-500">No shared components yet.</p>
          ) : (
            normalizedCourseComponents.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-white">{entry.name}</p>
                    <p className="mt-1 truncate text-[10px] text-slate-500 font-mono">{entry.activity?.type || ''}</p>
                  </div>
                  <div className="flex gap-2">
                    {onInsertLinkedActivity ? (
                      <ActionButton
                        onClick={() => onInsertLinkedActivity(entry)}
                        tone="primary"
                        className="px-2 py-1 text-[10px]"
                        title="Insert linked component"
                      >
                        <Link2 size={11} /> Link
                      </ActionButton>
                    ) : null}
                    <ActionButton
                      onClick={() => onInsertActivity?.(entry.activity)}
                      tone="secondary"
                      className="px-2 py-1 text-[10px]"
                      title="Insert detached copy"
                    >
                      <Copy size={11} /> Copy
                    </ActionButton>
                    {onDeleteCourseComponent ? (
                      <ActionButton
                        onClick={() => onDeleteCourseComponent(entry.id)}
                        tone="danger"
                        className="px-2 py-1 text-[10px]"
                        title="Delete from library"
                      >
                        <Trash2 size={11} />
                      </ActionButton>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <SectionCard
        title="Arrange"
        description="Use the canvas for direct selection, and keep layout choices here so they stay out of the way."
      >
        <ComposerLayoutControls
          accent={accent}
          layoutMode={layoutMode}
          maxColumns={maxColumns}
          rowHeight={rowHeight}
          margin={margin}
          containerPadding={containerPadding}
          simpleMatchTallestRow={simpleMatchTallestRow === true}
          onLayoutModeChange={onLayoutModeChange}
          onMaxColumnsChange={onMaxColumnsChange}
          onCanvasMetricChange={onCanvasMetricChange}
          onSimpleMatchTallestRowChange={onSimpleMatchTallestRowChange}
        />
      </SectionCard>

      <SectionCard title="Add Section" description="Start from a strong section pattern, then tune it in the inspector.">
        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK_INSERT_TYPES.map((type) => (
            <ActionButton
              key={type}
              onClick={() => {
                onNewActivityTypeChange?.(type);
                onQuickAddActivityType?.(type);
              }}
              tone="default"
              className="px-2 py-1 text-[10px]"
            >
              {getActivityLabelFallback(getActivityLabel, type)}
            </ActionButton>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <select
            value={newActivityType}
            onChange={(event) => onNewActivityTypeChange?.(event.target.value)}
            className="rounded border border-slate-700 bg-slate-950 p-2 text-xs text-white"
          >
            {activityTypeGroups.map((group) => (
              <optgroup key={group.category} label={group.label}>
                {group.types.map((type) => (
                  <option key={type} value={type}>
                    {getActivityLabelFallback(getActivityLabel, type)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <ActionButton onClick={onAddActivity} tone="primary">
            <Plus size={12} /> Add Section
          </ActionButton>
        </div>
        {!isCanvasMode && onAddOpenRow ? (
          <ActionButton onClick={onAddOpenRow} className="mt-2 w-full">
            <Plus size={12} /> Add Open Row
          </ActionButton>
        ) : null}
      </SectionCard>

      {selectedActivity ? (
        <SectionCard
          title="Selected Section"
          description="You can move and size the selected block directly on the canvas. These controls are the precise fallback."
        >
          <div className="mb-3 rounded border border-slate-700 bg-slate-950/70 p-2">
            <p className="text-xs font-bold text-white">
              {getActivityDefinition(selectedActivity.type)?.label || selectedActivity.type || 'Section'}
            </p>
            <p className="mt-1 truncate text-[10px] font-mono text-slate-500">{selectedActivity.id || 'draft-section'}</p>
          </div>

          {!isCanvasMode ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <ActionButton onClick={() => onMove?.('up')}>Up</ActionButton>
                <ActionButton onClick={() => onMove?.('down')}>Down</ActionButton>
                <ActionButton onClick={() => onMove?.('left')}>Left</ActionButton>
                <ActionButton onClick={() => onMove?.('right')}>Right</ActionButton>
              </div>
              <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Width</label>
                <select
                  value={selectedSpan}
                  onChange={(event) => onSpanChange?.(event.target.value)}
                  className="rounded border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                >
                  {Array.from({ length: maxColumns }, (_, index) => index + 1).map((span) => (
                    <option key={span} value={span}>
                      Span {span}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-2">
                <label className="text-[10px] text-slate-400">
                  X
                  <input
                    type="number"
                    min="0"
                    value={selectedX}
                    onChange={(event) => onCanvasLayoutChange?.({ x: Math.max(0, Number.parseInt(event.target.value, 10) || 0) })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 p-1 text-xs text-white"
                  />
                </label>
                <label className="text-[10px] text-slate-400">
                  Y
                  <input
                    type="number"
                    min="0"
                    value={selectedY}
                    onChange={(event) => onCanvasLayoutChange?.({ y: Math.max(0, Number.parseInt(event.target.value, 10) || 0) })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 p-1 text-xs text-white"
                  />
                </label>
                <label className="text-[10px] text-slate-400">
                  W
                  <input
                    type="number"
                    min="1"
                    max={maxColumns}
                    value={selectedW}
                    onChange={(event) => {
                      const nextW = Math.max(1, Number.parseInt(event.target.value, 10) || 1);
                      onCanvasLayoutChange?.({ w: nextW, colSpan: nextW });
                    }}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 p-1 text-xs text-white"
                  />
                </label>
                <label className="text-[10px] text-slate-400">
                  H
                  <input
                    type="number"
                    min="1"
                    value={selectedH}
                    onChange={(event) => onCanvasLayoutChange?.({ h: Math.max(1, Number.parseInt(event.target.value, 10) || 1) })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 p-1 text-xs text-white"
                  />
                </label>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <ActionButton onClick={() => onCanvasLayoutChange?.({ y: Math.max(0, selectedY - 1) })}>Up</ActionButton>
                <ActionButton onClick={() => onCanvasLayoutChange?.({ y: selectedY + 1 })}>Down</ActionButton>
                <ActionButton onClick={() => onCanvasLayoutChange?.({ x: Math.max(0, selectedX - 1) })}>Left</ActionButton>
                <ActionButton
                  onClick={() => onCanvasLayoutChange?.({ x: Math.min(Math.max(0, maxColumns - selectedW), selectedX + 1) })}
                >
                  Right
                </ActionButton>
                <ActionButton
                  onClick={() => {
                    const nextW = Math.max(1, selectedW - 1);
                    onCanvasLayoutChange?.({ w: nextW, colSpan: nextW });
                  }}
                >
                  Narrower
                </ActionButton>
                <ActionButton
                  onClick={() => {
                    const nextW = Math.min(maxColumns, selectedW + 1);
                    onCanvasLayoutChange?.({ w: nextW, colSpan: nextW });
                  }}
                >
                  Wider
                </ActionButton>
              </div>
            </>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <ActionButton onClick={onDuplicateSelected} tone="secondary">
              <Copy size={12} /> Duplicate
            </ActionButton>
            <ActionButton onClick={onDeleteSelected} tone="danger">
              <Trash2 size={12} /> Delete
            </ActionButton>
          </div>
        </SectionCard>
      ) : null}

      {!selectedActivity && totalIssues > 0 ? (
        <SectionCard title="Audit Summary" description="There are issues in this lesson. Use the Audit button to jump directly to them.">
          <p className="text-xs text-slate-300">
            {Number(validationTotals?.error || 0)} errors, {Number(validationTotals?.warn || 0)} warnings
          </p>
        </SectionCard>
      ) : null}
    </div>
  );
}
