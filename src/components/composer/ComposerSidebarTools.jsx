import * as React from 'react';
import { AlertTriangle, Copy, Link2, RefreshCw, Search, Trash2, Unlink, Upload } from 'lucide-react';
import {
  buildComposerComponentEntry,
  normalizeComposerComponentLibrary,
} from '../../composer/componentLibrary.js';
import {
  countComposerValidationIssues,
  getActivityDefinition,
  validateComposerActivities,
} from '../../composer/activityRegistry.js';

const { useEffect, useMemo, useState } = React;

const TEMPLATES_STORAGE_KEY = 'course_factory_composer_activity_templates_v1';
const MAX_TEMPLATES = 50;

function safeJsonParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function loadTemplates() {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
  return normalizeComposerComponentLibrary(
    Array.isArray(safeJsonParse(raw || '[]', [])) ? safeJsonParse(raw || '[]', []) : [],
    { fallbackPrefix: 'tpl' },
  ).slice(0, MAX_TEMPLATES);
}

function persistTemplates(nextTemplates) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify((nextTemplates || []).slice(0, MAX_TEMPLATES)));
  } catch (err) {
    console.error('Failed to persist composer templates:', err);
  }
}

const ComposerSidebarTools = ({
  courseComponents = [],
  mode,
  activities,
  onDeleteCourseComponent,
  onDetachSelectedComponent,
  selectedIndex,
  selectedActivity,
  onFixDuplicateIds,
  onFixImageAltText,
  onFixMobileStacking,
  onInsertLinkedActivity,
  onSelectIndex,
  onSaveCourseComponent,
  onUpdateSelectedCourseComponent,
  onUpdateSelectedCourseComponentInstances,
  onDuplicateSelected,
  onDeleteSelected,
  onInsertActivity,
  selectedComponentStatus = null,
}) => {
  const [search, setSearch] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templates, setTemplates] = useState(() => loadTemplates());
  const normalizedCourseComponents = useMemo(
    () => normalizeComposerComponentLibrary(courseComponents, { fallbackPrefix: 'course-cmp' }),
    [courseComponents],
  );

  useEffect(() => {
    if (!selectedActivity) return;
    const def = getActivityDefinition(selectedActivity.type);
    setTemplateName(def?.label ? `${def.label} Template` : `${selectedActivity.type} Template`);
  }, [selectedActivity?.id, selectedActivity?.type]);

  const filteredActivities = useMemo(() => {
    const term = String(search || '').trim().toLowerCase();
    const list = Array.isArray(activities) ? activities : [];
    if (!term) return list.map((a, idx) => ({ activity: a, idx }));
    return list
      .map((activity, idx) => ({ activity, idx }))
      .filter(({ activity }) => {
        const def = getActivityDefinition(activity?.type);
        const label = String(def?.label || activity?.type || '').toLowerCase();
        const id = String(activity?.id || '').toLowerCase();
        return label.includes(term) || id.includes(term);
      });
  }, [activities, search]);

  const validationResults = useMemo(() => validateComposerActivities(activities), [activities]);
  const validationTotals = useMemo(() => countComposerValidationIssues(validationResults), [validationResults]);
  const rowsWithIssues = useMemo(
    () => validationResults.filter((row) => Array.isArray(row.issues) && row.issues.length > 0),
    [validationResults],
  );

  const saveTemplateFromSelected = () => {
    if (!selectedActivity) return;
    const template = buildComposerComponentEntry(templateName, selectedActivity, { prefix: 'tpl' });
    const nextTemplates = [template, ...(templates || [])].slice(0, MAX_TEMPLATES);
    setTemplates(nextTemplates);
    persistTemplates(nextTemplates);
  };

  const deleteTemplate = (templateId) => {
    const nextTemplates = (templates || []).filter((t) => t?.id !== templateId);
    setTemplates(nextTemplates);
    persistTemplates(nextTemplates);
  };

  if (mode === 'templates') {
    return (
      <div className="space-y-3">
        <div className="p-2 rounded border border-slate-700 bg-slate-900/60">
          <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Component Library</p>
          <p className="text-[10px] text-slate-500">
            Save an activity as a reusable component. Course components travel with project data. Browser snippets stay local.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-2">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="col-span-9 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
            placeholder="Template name"
          />
          <button
            type="button"
            onClick={saveTemplateFromSelected}
            disabled={!selectedActivity}
            className="col-span-3 rounded bg-emerald-600 text-xs font-bold text-white inline-flex items-center justify-center gap-1 hover:bg-emerald-500 disabled:opacity-40"
            title="Save the selected activity as a browser-local snippet"
          >
            <Copy size={12} /> Local
          </button>
        </div>

        {onSaveCourseComponent ? (
          <button
            type="button"
            onClick={() => selectedActivity && onSaveCourseComponent(buildComposerComponentEntry(templateName, selectedActivity, { prefix: 'course-cmp' }))}
            disabled={!selectedActivity}
            className="w-full rounded border border-indigo-500/40 bg-indigo-600/15 px-3 py-2 text-xs font-bold text-indigo-100 hover:bg-indigo-600/25 disabled:opacity-40"
            title="Save the selected activity into the shared course component library"
          >
            Save To Course Library
          </button>
        ) : null}

        {selectedComponentStatus?.linked ? (
          <div className="rounded border border-indigo-500/30 bg-indigo-950/20 p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-200">Selected Link</p>
                <p className="text-xs font-bold text-white truncate">
                  {selectedComponentStatus?.sourceEntry?.name || selectedComponentStatus?.link?.sourceName || 'Course Component'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {selectedComponentStatus?.missingSource
                    ? 'Source component was removed from the course library.'
                    : selectedComponentStatus?.stale
                      ? 'Instance is out of sync with the library source.'
                      : 'Instance is linked to the course library source.'}
                </p>
              </div>
              <span
                className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  selectedComponentStatus?.missingSource
                    ? 'bg-rose-500/15 text-rose-100'
                    : selectedComponentStatus?.stale
                      ? 'bg-amber-500/15 text-amber-100'
                      : 'bg-emerald-500/15 text-emerald-100'
                }`}
              >
                {selectedComponentStatus?.missingSource ? 'Missing' : selectedComponentStatus?.stale ? 'Out Of Sync' : 'Linked'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {onUpdateSelectedCourseComponent ? (
                <button
                  type="button"
                  onClick={onUpdateSelectedCourseComponent}
                  disabled={!selectedComponentStatus?.sourceEntry}
                  className="rounded bg-indigo-600/20 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-indigo-100 hover:bg-indigo-600/30 disabled:opacity-40"
                  title="Overwrite the course component source from the selected linked block"
                >
                  <Upload size={11} className="mx-auto mb-1" />
                  Source
                </button>
              ) : null}
              {onUpdateSelectedCourseComponentInstances ? (
                <button
                  type="button"
                  onClick={onUpdateSelectedCourseComponentInstances}
                  disabled={!selectedComponentStatus?.sourceEntry}
                  className="rounded bg-emerald-600/20 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-100 hover:bg-emerald-600/30 disabled:opacity-40"
                  title="Push the selected linked block to every linked instance in the course"
                >
                  <RefreshCw size={11} className="mx-auto mb-1" />
                  Update All
                </button>
              ) : null}
              {onDetachSelectedComponent ? (
                <button
                  type="button"
                  onClick={onDetachSelectedComponent}
                  className="rounded bg-rose-600/20 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-rose-100 hover:bg-rose-600/30"
                  title="Detach the selected block from the course component source"
                >
                  <Unlink size={11} className="mx-auto mb-1" />
                  Detach
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Course Components</p>
            <span className="text-[10px] text-slate-500">{normalizedCourseComponents.length} shared</span>
          </div>
          <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
            {normalizedCourseComponents.length === 0 ? (
              <p className="text-xs text-slate-500">No shared course components yet.</p>
            ) : (
              normalizedCourseComponents.map((tpl) => (
                <div key={tpl.id} className="p-2 rounded border border-indigo-500/20 bg-slate-950">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{tpl.name}</p>
                      <p className="text-[10px] text-indigo-300 truncate">Course component</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{tpl.activity?.type || ''}</p>
                    </div>
                    <div className="flex gap-2">
                      {onInsertLinkedActivity ? (
                        <button
                          type="button"
                          onClick={() => onInsertLinkedActivity(tpl)}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-white inline-flex items-center gap-1"
                          title="Insert as a linked course component"
                        >
                          <Link2 size={11} /> Link
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onInsertActivity && onInsertActivity(tpl.activity)}
                        className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white inline-flex items-center gap-1"
                        title="Insert a detached copy"
                      >
                        <Copy size={11} /> Copy
                      </button>
                      {onDeleteCourseComponent ? (
                        <button
                          type="button"
                          onClick={() => onDeleteCourseComponent(tpl.id)}
                          className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-[10px] font-bold text-white"
                          title="Delete course component"
                        >
                          <Trash2 size={12} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Browser Snippets</p>
            <span className="text-[10px] text-slate-500">{(templates || []).length} local</span>
          </div>
          <div className="max-h-72 overflow-y-auto pr-1 space-y-2">
            {(templates || []).length === 0 ? (
              <p className="text-xs text-slate-500">No browser snippets saved yet.</p>
            ) : (
              (templates || []).map((tpl) => (
                <div key={tpl.id} className="p-2 rounded border border-slate-700 bg-slate-950">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{tpl.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{tpl.activity?.type || ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onInsertActivity && onInsertActivity(tpl.activity)}
                        className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white"
                      >
                        Insert
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTemplate(tpl.id)}
                        className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-[10px] font-bold text-white"
                        title="Delete template"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'issues') {
    return (
      <div className="space-y-3">
        <div className="p-2 rounded border border-slate-700 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Validation</p>
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className={validationTotals.error ? 'text-rose-400' : 'text-slate-500'}>
                {validationTotals.error} errors
              </span>
              <span className={validationTotals.warn ? 'text-amber-300' : 'text-slate-500'}>
                {validationTotals.warn} warnings
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500">Click an activity to jump to it.</p>
          {onFixDuplicateIds || onFixImageAltText || onFixMobileStacking ? (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {onFixDuplicateIds ? (
                <button
                  type="button"
                  onClick={onFixDuplicateIds}
                  className="rounded bg-rose-600/15 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-rose-100 hover:bg-rose-600/25"
                >
                  Fix IDs
                </button>
              ) : null}
              {onFixImageAltText ? (
                <button
                  type="button"
                  onClick={onFixImageAltText}
                  className="rounded bg-amber-500/15 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-100 hover:bg-amber-500/25"
                >
                  Fill Alt Text
                </button>
              ) : null}
              {onFixMobileStacking ? (
                <button
                  type="button"
                  onClick={onFixMobileStacking}
                  className="rounded bg-sky-500/15 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-sky-100 hover:bg-sky-500/25"
                >
                  Stack Mobile
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="max-h-72 overflow-y-auto pr-1 space-y-2">
          {rowsWithIssues.length === 0 ? (
            <p className="text-xs text-slate-500">No issues found.</p>
          ) : (
            rowsWithIssues.map((row) => {
              const def = getActivityDefinition(row.type);
              const isSelected = row.index === selectedIndex;
              return (
                <button
                  key={`${row.id || row.index}`}
                  type="button"
                  onClick={() => onSelectIndex && onSelectIndex(row.index)}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    isSelected
                      ? 'bg-emerald-900/30 border-emerald-600 text-white'
                      : 'bg-slate-950 border-slate-700 text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{def?.label || row.type}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{row.id || `activity-${row.index + 1}`}</p>
                    </div>
                    <AlertTriangle
                      size={14}
                      className={row.issues.some((i) => i.level === 'error') ? 'text-rose-400' : 'text-amber-300'}
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    {row.issues.slice(0, 3).map((issue, idx) => (
                      <p
                        key={`${row.index}-issue-${idx}`}
                        className={`text-[10px] ${
                          issue.level === 'error' ? 'text-rose-300' : 'text-amber-200'
                        }`}
                      >
                        {issue.level === 'error' ? 'Error' : 'Warn'}: {issue.message}
                      </p>
                    ))}
                    {row.issues.length > 3 ? (
                      <p className="text-[10px] text-slate-500">+{row.issues.length - 3} more…</p>
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

  // Outline view
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-500" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-9 text-white text-xs"
          placeholder="Search by type or id..."
        />
      </div>

      <div className="max-h-72 overflow-y-auto pr-1 space-y-1">
        {filteredActivities.length === 0 ? (
          <p className="text-xs text-slate-500">No matching activities.</p>
        ) : (
          filteredActivities.map(({ activity, idx }) => {
            const def = getActivityDefinition(activity?.type);
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={activity?.id || `${activity?.type}-${idx}`}
                type="button"
                onClick={() => onSelectIndex && onSelectIndex(idx)}
                className={`w-full text-left p-2 rounded border transition-colors ${
                  isSelected
                    ? 'bg-emerald-900/30 border-emerald-600 text-white'
                    : 'bg-slate-950 border-slate-700 text-slate-200 hover:bg-slate-900'
                }`}
              >
                <p className="text-xs font-bold truncate">
                  {idx + 1}. {def?.label || activity?.type || 'Unknown'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono truncate">{activity?.id || `activity-${idx + 1}`}</p>
              </button>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={onDuplicateSelected}
          disabled={!selectedActivity}
          className="rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold py-2 inline-flex items-center justify-center gap-1"
        >
          <Copy size={12} /> Duplicate
        </button>
        <button
          type="button"
          onClick={onDeleteSelected}
          disabled={!selectedActivity}
          className="rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold py-2 inline-flex items-center justify-center gap-1"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
};

export default ComposerSidebarTools;
