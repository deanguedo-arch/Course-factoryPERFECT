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
const ACTION_VARIANT_CLASS_MAP = {
  secondary: 'cf-btn-secondary',
  primary: 'cf-btn-primary',
  success: 'cf-btn-success',
  warning: 'cf-btn-warning',
  danger: 'cf-btn-danger',
};

function SidebarCard({ children, className = '' }) {
  return <div className={`cf-panel-muted p-3 ${className}`.trim()}>{children}</div>;
}

function SidebarActionButton({ children, className = '', title, variant = 'secondary', ...props }) {
  return (
    <button
      type="button"
      title={title}
      className={`cf-btn ${ACTION_VARIANT_CLASS_MAP[variant] || ACTION_VARIANT_CLASS_MAP.secondary} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

function StatusBadge({ children, tone = 'neutral' }) {
  const toneStyleMap = {
    neutral: {
      borderColor: 'var(--cf-pill-border)',
      background: 'var(--cf-pill-fill)',
      color: 'var(--cf-pill-text)',
    },
    success: {
      borderColor: 'var(--cf-success-border)',
      background: 'var(--cf-success-fill)',
      color: 'var(--cf-success-soft)',
    },
    warning: {
      borderColor: 'var(--cf-warning-border)',
      background: 'var(--cf-warning-fill)',
      color: 'var(--cf-warning-soft)',
    },
    danger: {
      borderColor: 'var(--cf-danger-border)',
      background: 'var(--cf-danger-fill)',
      color: 'var(--cf-danger-soft)',
    },
  };

  return (
    <span className="cf-pill" style={toneStyleMap[tone] || toneStyleMap.neutral}>
      {children}
    </span>
  );
}

function SelectableRow({ children, isSelected = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cf-panel-muted w-full p-3 text-left transition duration-150 hover:-translate-y-0.5"
      style={
        isSelected
          ? {
              borderColor: 'var(--cf-success-border)',
              background: 'linear-gradient(160deg, color-mix(in srgb, var(--cf-success) 14%, transparent), var(--cf-panel-fill))',
            }
          : undefined
      }
    >
      {children}
    </button>
  );
}

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
  }, [selectedActivity]);

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
        <SidebarCard className="space-y-2">
          <p className="cf-meta-label">Component Library</p>
          <p className="cf-meta-copy">
            Save an activity as a reusable component. Course components travel with project data. Browser snippets stay local.
          </p>
        </SidebarCard>

        <div className="grid grid-cols-12 gap-2">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="cf-input-shell col-span-9 px-3 py-2 text-xs"
            placeholder="Template name"
          />
          <SidebarActionButton
            onClick={saveTemplateFromSelected}
            disabled={!selectedActivity}
            variant="success"
            className="col-span-3 px-2 py-2 text-xs font-bold"
            title="Save the selected activity as a browser-local snippet"
          >
            <Copy size={12} /> Local
          </SidebarActionButton>
        </div>

        {onSaveCourseComponent ? (
          <SidebarActionButton
            onClick={() => selectedActivity && onSaveCourseComponent(buildComposerComponentEntry(templateName, selectedActivity, { prefix: 'course-cmp' }))}
            disabled={!selectedActivity}
            variant="primary"
            className="w-full px-3 py-2 text-xs font-bold"
            title="Save the selected activity into the shared course component library"
          >
            Save To Course Library
          </SidebarActionButton>
        ) : null}

        {selectedComponentStatus?.linked ? (
          <div
            className={`cf-alert p-3 space-y-2 ${
              selectedComponentStatus?.missingSource
                ? 'cf-alert-danger'
                : selectedComponentStatus?.stale
                  ? 'cf-alert-warning'
                  : 'cf-alert-success'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="cf-meta-label">Selected Link</p>
                <p className="truncate text-xs font-bold" style={{ color: 'var(--cf-text-primary)' }}>
                  {selectedComponentStatus?.sourceEntry?.name || selectedComponentStatus?.link?.sourceName || 'Course Component'}
                </p>
                <p className="truncate text-[11px]" style={{ color: 'var(--cf-text-secondary)' }}>
                  {selectedComponentStatus?.missingSource
                    ? 'Source component was removed from the course library.'
                    : selectedComponentStatus?.stale
                      ? 'Instance is out of sync with the library source.'
                      : 'Instance is linked to the course library source.'}
                </p>
              </div>
              <StatusBadge
                tone={
                  selectedComponentStatus?.missingSource
                    ? 'danger'
                    : selectedComponentStatus?.stale
                      ? 'warning'
                      : 'success'
                }
              >
                {selectedComponentStatus?.missingSource ? 'Missing' : selectedComponentStatus?.stale ? 'Out Of Sync' : 'Linked'}
              </StatusBadge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {onUpdateSelectedCourseComponent ? (
                <SidebarActionButton
                  onClick={onUpdateSelectedCourseComponent}
                  disabled={!selectedComponentStatus?.sourceEntry}
                  variant="primary"
                  className="px-2 py-2 text-[10px] font-bold uppercase tracking-[0.12em]"
                  title="Overwrite the course component source from the selected linked block"
                >
                  <Upload size={11} className="mx-auto mb-1" />
                  Source
                </SidebarActionButton>
              ) : null}
              {onUpdateSelectedCourseComponentInstances ? (
                <SidebarActionButton
                  onClick={onUpdateSelectedCourseComponentInstances}
                  disabled={!selectedComponentStatus?.sourceEntry}
                  variant="success"
                  className="px-2 py-2 text-[10px] font-bold uppercase tracking-[0.12em]"
                  title="Push the selected linked block to every linked instance in the course"
                >
                  <RefreshCw size={11} className="mx-auto mb-1" />
                  Update All
                </SidebarActionButton>
              ) : null}
              {onDetachSelectedComponent ? (
                <SidebarActionButton
                  onClick={onDetachSelectedComponent}
                  variant="danger"
                  className="px-2 py-2 text-[10px] font-bold uppercase tracking-[0.12em]"
                  title="Detach the selected block from the course component source"
                >
                  <Unlink size={11} className="mx-auto mb-1" />
                  Detach
                </SidebarActionButton>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="cf-meta-label">Course Components</p>
            <span className="text-[11px]" style={{ color: 'var(--cf-text-secondary)' }}>{normalizedCourseComponents.length} shared</span>
          </div>
          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {normalizedCourseComponents.length === 0 ? (
              <p className="cf-meta-copy">No shared course components yet.</p>
            ) : (
              normalizedCourseComponents.map((tpl) => (
                <SidebarCard key={tpl.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold" style={{ color: 'var(--cf-text-primary)' }}>{tpl.name}</p>
                      <p className="truncate text-[11px]" style={{ color: 'var(--cf-accent-primary)' }}>Course component</p>
                      <p className="truncate font-mono text-[11px]" style={{ color: 'var(--cf-text-muted)' }}>{tpl.activity?.type || ''}</p>
                    </div>
                    <div className="flex gap-2">
                      {onInsertLinkedActivity ? (
                        <SidebarActionButton
                          onClick={() => onInsertLinkedActivity(tpl)}
                          variant="success"
                          className="px-2 py-1.5 text-[10px] font-bold"
                          title="Insert as a linked course component"
                        >
                          <Link2 size={11} /> Link
                        </SidebarActionButton>
                      ) : null}
                      <SidebarActionButton
                        onClick={() => onInsertActivity && onInsertActivity(tpl.activity)}
                        variant="primary"
                        className="px-2 py-1.5 text-[10px] font-bold"
                        title="Insert a detached copy"
                      >
                        <Copy size={11} /> Copy
                      </SidebarActionButton>
                      {onDeleteCourseComponent ? (
                        <SidebarActionButton
                          onClick={() => onDeleteCourseComponent(tpl.id)}
                          variant="danger"
                          className="px-2 py-1.5 text-[10px] font-bold"
                          title="Delete course component"
                        >
                          <Trash2 size={12} />
                        </SidebarActionButton>
                      ) : null}
                    </div>
                  </div>
                </SidebarCard>
              ))
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="cf-meta-label">Browser Snippets</p>
            <span className="text-[11px]" style={{ color: 'var(--cf-text-secondary)' }}>{(templates || []).length} local</span>
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {(templates || []).length === 0 ? (
              <p className="cf-meta-copy">No browser snippets saved yet.</p>
            ) : (
              (templates || []).map((tpl) => (
                <SidebarCard key={tpl.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold" style={{ color: 'var(--cf-text-primary)' }}>{tpl.name}</p>
                      <p className="truncate font-mono text-[11px]" style={{ color: 'var(--cf-text-muted)' }}>{tpl.activity?.type || ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <SidebarActionButton
                        onClick={() => onInsertActivity && onInsertActivity(tpl.activity)}
                        variant="primary"
                        className="px-2 py-1.5 text-[10px] font-bold"
                      >
                        Insert
                      </SidebarActionButton>
                      <SidebarActionButton
                        onClick={() => deleteTemplate(tpl.id)}
                        variant="danger"
                        className="px-2 py-1.5 text-[10px] font-bold"
                        title="Delete template"
                      >
                        <Trash2 size={12} />
                      </SidebarActionButton>
                    </div>
                  </div>
                </SidebarCard>
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
        <SidebarCard className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="cf-meta-label">Validation</p>
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <span style={{ color: validationTotals.error ? 'var(--cf-danger-soft)' : 'var(--cf-text-muted)' }}>
                {validationTotals.error} errors
              </span>
              <span style={{ color: validationTotals.warn ? 'var(--cf-warning-soft)' : 'var(--cf-text-muted)' }}>
                {validationTotals.warn} warnings
              </span>
            </div>
          </div>
          <p className="cf-meta-copy">Click an activity to jump to it.</p>
          {onFixDuplicateIds || onFixImageAltText || onFixMobileStacking ? (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {onFixDuplicateIds ? (
                <SidebarActionButton
                  onClick={onFixDuplicateIds}
                  variant="danger"
                  className="px-2 py-2 text-[10px] font-bold uppercase tracking-[0.12em]"
                >
                  Fix IDs
                </SidebarActionButton>
              ) : null}
              {onFixImageAltText ? (
                <SidebarActionButton
                  onClick={onFixImageAltText}
                  variant="warning"
                  className="px-2 py-2 text-[10px] font-bold uppercase tracking-[0.12em]"
                >
                  Fill Alt Text
                </SidebarActionButton>
              ) : null}
              {onFixMobileStacking ? (
                <SidebarActionButton
                  onClick={onFixMobileStacking}
                  variant="primary"
                  className="px-2 py-2 text-[10px] font-bold uppercase tracking-[0.12em]"
                >
                  Stack Mobile
                </SidebarActionButton>
              ) : null}
            </div>
          ) : null}
        </SidebarCard>

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {rowsWithIssues.length === 0 ? (
            <p className="cf-meta-copy">No issues found.</p>
          ) : (
            rowsWithIssues.map((row) => {
              const def = getActivityDefinition(row.type);
              const isSelected = row.index === selectedIndex;
              return (
                <SelectableRow
                  key={`${row.id || row.index}`}
                  isSelected={isSelected}
                  onClick={() => onSelectIndex && onSelectIndex(row.index)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold" style={{ color: 'var(--cf-text-primary)' }}>{def?.label || row.type}</p>
                      <p className="truncate font-mono text-[11px]" style={{ color: 'var(--cf-text-muted)' }}>
                        {row.id || `activity-${row.index + 1}`}
                      </p>
                    </div>
                    <AlertTriangle
                      size={14}
                      style={{ color: row.issues.some((i) => i.level === 'error') ? 'var(--cf-danger-soft)' : 'var(--cf-warning-soft)' }}
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    {row.issues.slice(0, 3).map((issue, idx) => (
                      <p
                        key={`${row.index}-issue-${idx}`}
                        className="text-[11px]"
                        style={{ color: issue.level === 'error' ? 'var(--cf-danger-soft)' : 'var(--cf-warning-soft)' }}
                      >
                        {issue.level === 'error' ? 'Error' : 'Warn'}: {issue.message}
                      </p>
                    ))}
                    {row.issues.length > 3 ? (
                      <p className="text-[11px]" style={{ color: 'var(--cf-text-muted)' }}>+{row.issues.length - 3} more...</p>
                    ) : null}
                  </div>
                </SelectableRow>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-3" size={16} style={{ color: 'var(--cf-text-muted)' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="cf-input-shell w-full py-2 pl-9 pr-3 text-xs"
          placeholder="Search by type or id..."
        />
      </div>

      <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
        {filteredActivities.length === 0 ? (
          <p className="cf-meta-copy">No matching activities.</p>
        ) : (
          filteredActivities.map(({ activity, idx }) => {
            const def = getActivityDefinition(activity?.type);
            const isSelected = idx === selectedIndex;
            return (
              <SelectableRow
                key={activity?.id || `${activity?.type}-${idx}`}
                isSelected={isSelected}
                onClick={() => onSelectIndex && onSelectIndex(idx)}
              >
                <p className="truncate text-xs font-bold" style={{ color: 'var(--cf-text-primary)' }}>
                  {idx + 1}. {def?.label || activity?.type || 'Unknown'}
                </p>
                <p className="truncate font-mono text-[11px]" style={{ color: 'var(--cf-text-muted)' }}>
                  {activity?.id || `activity-${idx + 1}`}
                </p>
              </SelectableRow>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t pt-3" style={{ borderColor: 'var(--cf-panel-border)' }}>
        <SidebarActionButton
          onClick={onDuplicateSelected}
          disabled={!selectedActivity}
          variant="primary"
          className="py-2 text-xs font-bold"
        >
          <Copy size={12} /> Duplicate
        </SidebarActionButton>
        <SidebarActionButton
          onClick={onDeleteSelected}
          disabled={!selectedActivity}
          variant="danger"
          className="py-2 text-xs font-bold"
        >
          <Trash2 size={12} /> Delete
        </SidebarActionButton>
      </div>
    </div>
  );
};

export default ComposerSidebarTools;
