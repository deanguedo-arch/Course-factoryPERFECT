import * as React from 'react';
import { ChevronDown, ChevronUp, Clock, Copy, Edit, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { getActivityDefinition, listActivityTypes } from '../../composer/activityRegistry.js';
import { isComposerEnabled } from '../../utils/composer.js';

const { useEffect, useMemo, useState } = React;

function createActivity(type) {
  const def = getActivityDefinition(type);
  if (!def) return null;
  return {
    id: `activity-${Date.now()}`,
    type,
    data: def.createDefaultData ? def.createDefaultData() : {},
  };
}

export default function EditModal({
  editingModule,
  editForm,
  setEditForm,
  setEditingModule,
  projectData,
  saveEditModule,
  moduleHistory,
  setModuleHistory,
  revertModuleVersion,
}) {
  const composerEnabled = isComposerEnabled(projectData);
  const standaloneMode = editForm.moduleMode || 'custom_html';
  const canUseComposer = composerEnabled || standaloneMode === 'composer';
  const activities = Array.isArray(editForm.activities) ? editForm.activities : [];
  const activityTypes = useMemo(() => listActivityTypes(), []);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState(0);
  const [newActivityType, setNewActivityType] = useState(activityTypes[0] || 'content_block');

  useEffect(() => {
    setSelectedActivityIndex(0);
  }, [editingModule, standaloneMode]);

  useEffect(() => {
    if (selectedActivityIndex > activities.length - 1) {
      setSelectedActivityIndex(Math.max(activities.length - 1, 0));
    }
  }, [activities.length, selectedActivityIndex]);

  const selectedActivity = activities[selectedActivityIndex] || null;

  const updateActivities = (nextActivities) => {
    setEditForm({
      ...editForm,
      moduleMode: 'composer',
      activities: nextActivities,
    });
  };

  const updateSelectedActivityData = (updates) => {
    if (!selectedActivity) return;
    const nextActivities = activities.map((activity, idx) =>
      idx === selectedActivityIndex
        ? {
            ...activity,
            data: {
              ...(activity.data || {}),
              ...updates,
            },
          }
        : activity,
    );
    updateActivities(nextActivities);
  };

  const addActivity = () => {
    const activity = createActivity(newActivityType);
    if (!activity) return;
    const nextActivities = [...activities, activity];
    updateActivities(nextActivities);
    setSelectedActivityIndex(nextActivities.length - 1);
  };

  const removeSelectedActivity = () => {
    if (!selectedActivity) return;
    const nextActivities = activities.filter((_, idx) => idx !== selectedActivityIndex);
    updateActivities(nextActivities);
  };

  const moveSelectedActivity = (direction) => {
    if (!selectedActivity) return;
    const targetIndex = selectedActivityIndex + direction;
    if (targetIndex < 0 || targetIndex >= activities.length) return;
    const nextActivities = [...activities];
    [nextActivities[selectedActivityIndex], nextActivities[targetIndex]] = [
      nextActivities[targetIndex],
      nextActivities[selectedActivityIndex],
    ];
    updateActivities(nextActivities);
    setSelectedActivityIndex(targetIndex);
  };

  const duplicateSelectedActivity = () => {
    if (!selectedActivity) return;
    const duplicate = {
      ...selectedActivity,
      id: `activity-${Date.now()}`,
      data: {
        ...(selectedActivity.data || {}),
      },
    };
    const nextActivities = [...activities];
    nextActivities.splice(selectedActivityIndex + 1, 0, duplicate);
    updateActivities(nextActivities);
    setSelectedActivityIndex(selectedActivityIndex + 1);
  };

  const setStandaloneMode = (mode) => {
    setEditForm({
      ...editForm,
      moduleMode: mode,
      activities: Array.isArray(editForm.activities) ? editForm.activities : [],
    });
  };

  const renderActivityEditor = () => {
    if (!selectedActivity) {
      return <p className="text-xs text-slate-500">Select an activity to edit.</p>;
    }

    const data = selectedActivity.data || {};
    if (selectedActivity.type === 'content_block') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Section Title</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateSelectedActivityData({ title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Body</label>
            <textarea
              value={data.body || ''}
              onChange={(e) => updateSelectedActivityData({ body: e.target.value })}
              className="w-full h-40 bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm"
            />
          </div>
        </div>
      );
    }

    if (selectedActivity.type === 'embed_block') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Embed URL</label>
            <input
              type="text"
              value={data.url || ''}
              onChange={(e) => updateSelectedActivityData({ url: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Caption</label>
            <input
              type="text"
              value={data.caption || ''}
              onChange={(e) => updateSelectedActivityData({ caption: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
        </div>
      );
    }

    if (selectedActivity.type === 'resource_list') {
      const items = Array.isArray(data.items) ? data.items : [];
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">List Title</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateSelectedActivityData({ title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={`resource-item-${idx}`} className="grid grid-cols-12 gap-2">
                <input
                  type="text"
                  value={item?.label || ''}
                  onChange={(e) => {
                    const nextItems = [...items];
                    nextItems[idx] = { ...(nextItems[idx] || {}), label: e.target.value };
                    updateSelectedActivityData({ items: nextItems });
                  }}
                  className="col-span-4 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={item?.url || ''}
                  onChange={(e) => {
                    const nextItems = [...items];
                    nextItems[idx] = { ...(nextItems[idx] || {}), url: e.target.value };
                    updateSelectedActivityData({ items: nextItems });
                  }}
                  className="col-span-7 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                  placeholder="https://..."
                />
                <button
                  onClick={() => {
                    const nextItems = items.filter((_, itemIdx) => itemIdx !== idx);
                    updateSelectedActivityData({ items: nextItems });
                  }}
                  className="col-span-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs"
                  type="button"
                  title="Remove resource"
                >
                  <Trash2 size={12} className="mx-auto" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateSelectedActivityData({ items: [...items, { label: '', url: '' }] })}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white font-bold inline-flex items-center gap-1"
            >
              <Plus size={12} /> Add Resource
            </button>
          </div>
        </div>
      );
    }

    if (selectedActivity.type === 'knowledge_check') {
      const options = Array.isArray(data.options) ? data.options : [];
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Prompt</label>
            <textarea
              value={data.prompt || ''}
              onChange={(e) => updateSelectedActivityData({ prompt: e.target.value })}
              className="w-full h-24 bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Options</label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={`kc-option-${idx}`} className="grid grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={opt || ''}
                    onChange={(e) => {
                      const nextOptions = [...options];
                      nextOptions[idx] = e.target.value;
                      updateSelectedActivityData({ options: nextOptions });
                    }}
                    className="col-span-10 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                  />
                  <input
                    type="radio"
                    name="kc-correct"
                    checked={(data.correctIndex || 0) === idx}
                    onChange={() => updateSelectedActivityData({ correctIndex: idx })}
                    className="col-span-1 self-center"
                    title="Correct answer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nextOptions = options.filter((_, optionIdx) => optionIdx !== idx);
                      updateSelectedActivityData({
                        options: nextOptions,
                        correctIndex: Math.max(0, Math.min(data.correctIndex || 0, nextOptions.length - 1)),
                      });
                    }}
                    className="col-span-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs"
                    title="Remove option"
                  >
                    <Trash2 size={12} className="mx-auto" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => updateSelectedActivityData({ options: [...options, ''] })}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white font-bold inline-flex items-center gap-1"
              >
                <Plus size={12} /> Add Option
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Short Answer Prompt</label>
            <input
              type="text"
              value={data.shortAnswerPrompt || ''}
              onChange={(e) => updateSelectedActivityData({ shortAnswerPrompt: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
        </div>
      );
    }

    if (selectedActivity.type === 'submission_builder') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Section Title</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateSelectedActivityData({ title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Button Label</label>
            <input
              type="text"
              value={data.buttonLabel || ''}
              onChange={(e) => updateSelectedActivityData({ buttonLabel: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
        </div>
      );
    }

    return <p className="text-xs text-slate-500">No editor for this activity type.</p>;
  };

  return (
    <>
      {editingModule && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-blue-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit size={20} className="text-blue-400" />
                Edit Module: {editForm.title || 'Untitled'}
              </h3>
              <button onClick={() => setEditingModule(null)} className="text-slate-400 hover:text-white" type="button">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-300 mb-2">Module Title</label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm"
                  placeholder="Module title"
                />
              </div>

              {editForm.moduleType === 'external' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">URL</label>
                    <input
                      type="text"
                      value={editForm.url || ''}
                      onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white font-mono text-sm"
                      placeholder="https://example.com/module"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Link Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="linkType"
                          value="iframe"
                          checked={editForm.linkType === 'iframe'}
                          onChange={(e) => setEditForm({ ...editForm, linkType: e.target.value })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-300">Embed in iframe</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="linkType"
                          value="newtab"
                          checked={editForm.linkType === 'newtab'}
                          onChange={(e) => setEditForm({ ...editForm, linkType: e.target.value })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-300">Open in new tab</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {editForm.moduleType === 'standalone' && (
                <div className="space-y-4">
                  {canUseComposer && (
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Module Mode</label>
                      <div className="grid grid-cols-2 bg-slate-950 border border-slate-700 rounded-lg p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => setStandaloneMode('custom_html')}
                          className={`py-2 rounded text-xs font-bold transition-colors ${
                            standaloneMode === 'custom_html'
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          Custom HTML
                        </button>
                        <button
                          type="button"
                          onClick={() => setStandaloneMode('composer')}
                          className={`py-2 rounded text-xs font-bold transition-colors ${
                            standaloneMode === 'composer'
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          Composer
                        </button>
                      </div>
                      {!composerEnabled && (
                        <p className="text-[11px] text-amber-400 mt-2">
                          Composer mode is currently locked by settings. Existing composer modules remain editable.
                        </p>
                      )}
                    </div>
                  )}

                  {standaloneMode === 'composer' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      <div className="lg:col-span-5 bg-slate-950 border border-slate-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold text-white">Activities</h4>
                          <span className="text-[11px] text-slate-500">{activities.length} total</span>
                        </div>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {activities.map((activity, idx) => {
                            const def = getActivityDefinition(activity.type);
                            return (
                              <button
                                key={activity.id || `${activity.type}-${idx}`}
                                type="button"
                                onClick={() => setSelectedActivityIndex(idx)}
                                className={`w-full text-left p-2 rounded border transition-colors ${
                                  idx === selectedActivityIndex
                                    ? 'bg-emerald-900/30 border-emerald-600 text-white'
                                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                <p className="text-xs font-bold">{def?.label || activity.type}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{activity.id || `activity-${idx + 1}`}</p>
                              </button>
                            );
                          })}
                          {activities.length === 0 && <p className="text-xs text-slate-500">No activities yet.</p>}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-700">
                          <div className="grid grid-cols-3 gap-2">
                            <select
                              value={newActivityType}
                              onChange={(e) => setNewActivityType(e.target.value)}
                              className="col-span-2 bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                            >
                              {activityTypes.map((type) => {
                                const def = getActivityDefinition(type);
                                return (
                                  <option key={type} value={type}>
                                    {def?.label || type}
                                  </option>
                                );
                              })}
                            </select>
                            <button
                              type="button"
                              onClick={addActivity}
                              className="bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-bold text-white inline-flex items-center justify-center gap-1"
                            >
                              <Plus size={12} /> Add
                            </button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => moveSelectedActivity(-1)}
                              disabled={!selectedActivity || selectedActivityIndex === 0}
                              className="flex-1 px-2 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs inline-flex items-center justify-center gap-1"
                            >
                              <ChevronUp size={12} /> Up
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSelectedActivity(1)}
                              disabled={!selectedActivity || selectedActivityIndex >= activities.length - 1}
                              className="flex-1 px-2 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs inline-flex items-center justify-center gap-1"
                            >
                              <ChevronDown size={12} /> Down
                            </button>
                            <button
                              type="button"
                              onClick={duplicateSelectedActivity}
                              disabled={!selectedActivity}
                              className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs inline-flex items-center justify-center"
                              title="Duplicate selected activity"
                            >
                              <Copy size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={removeSelectedActivity}
                              disabled={!selectedActivity}
                              className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs inline-flex items-center justify-center"
                              title="Delete selected activity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-7 bg-slate-950 border border-slate-700 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-white mb-3">
                          {selectedActivity ? (getActivityDefinition(selectedActivity.type)?.label || selectedActivity.type) : 'Activity Editor'}
                        </h4>
                        {renderActivityEditor()}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Full HTML Document</label>
                      <p className="text-xs text-emerald-400 mb-2 font-medium">
                        Edit the complete HTML document - your code runs as-is in an iframe
                      </p>
                      <textarea
                        value={editForm.fullDocument || ''}
                        onChange={(e) => setEditForm({ ...editForm, fullDocument: e.target.value })}
                        className="w-full h-96 bg-slate-950 border border-slate-700 rounded p-3 text-white font-mono text-xs"
                        placeholder="<!DOCTYPE html>..."
                      />
                    </div>
                  )}
                </div>
              )}

              {editForm.moduleType === 'legacy' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">HTML</label>
                    <textarea
                      value={editForm.html || ''}
                      onChange={(e) => setEditForm({ ...editForm, html: e.target.value })}
                      className="w-full h-64 bg-slate-950 border border-slate-700 rounded p-3 text-white font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Script</label>
                    <textarea
                      value={editForm.script || ''}
                      onChange={(e) => setEditForm({ ...editForm, script: e.target.value })}
                      className="w-full h-64 bg-slate-950 border border-slate-700 rounded p-3 text-white font-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800 border-t border-slate-700 p-4 flex gap-3">
              <button onClick={() => setEditingModule(null)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors" type="button">
                Cancel
              </button>
              <button
                onClick={() => {
                  const module = projectData['Current Course']?.modules?.find((m) => m.id === editingModule);
                  if (module?.history && module.history.length > 0) {
                    setModuleHistory({ moduleId: editingModule, history: module.history });
                  } else {
                    alert('No version history available for this module yet. History is created when you save changes.');
                  }
                }}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded flex items-center gap-2 transition-colors"
                title="View version history"
                type="button"
              >
                <Clock size={16} />
                History
              </button>
              <button onClick={saveEditModule} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold shadow-lg transition-colors" type="button">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {moduleHistory && (
        <div className="fixed inset-0 bg-black/80 z-[55] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setModuleHistory(null)}>
          <div
            className="bg-slate-900 border border-amber-900 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock size={20} className="text-amber-400" />
                Version History
              </h3>
              <button onClick={() => setModuleHistory(null)} className="text-slate-400 hover:text-white" type="button">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {moduleHistory.history.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No version history available yet.</p>
              ) : (
                <div className="space-y-3">
                  {moduleHistory.history.map((version, idx) => {
                    const date = new Date(version.timestamp);
                    const isLatest = idx === moduleHistory.history.length - 1;
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${
                          isLatest ? 'bg-amber-900/20 border-amber-700/50' : 'bg-slate-800/50 border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">Version {moduleHistory.history.length - idx}</span>
                              {isLatest && (
                                <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded uppercase font-bold">Current</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {date.toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          {!isLatest && (
                            <button
                              onClick={() => {
                                if (confirm('Revert to this version? This will replace the current version.')) {
                                  revertModuleVersion(moduleHistory.moduleId, idx);
                                }
                              }}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded flex items-center gap-1 transition-colors"
                              type="button"
                            >
                              <RotateCcw size={12} />
                              Revert
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 font-mono truncate" title={version.title}>
                          {version.title}
                        </p>
                        <div className="mt-2 text-[10px] text-slate-500">
                          {version.html && <span>HTML: {(version.html.length / 1024).toFixed(1)}KB</span>}
                          {version.css && <span className="ml-2">CSS: {(version.css.length / 1024).toFixed(1)}KB</span>}
                          {version.script && <span className="ml-2">Script: {(version.script.length / 1024).toFixed(1)}KB</span>}
                          {version.url && <span className="ml-2">External Link</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-slate-800 border-t border-slate-700 p-4">
              <p className="text-xs text-slate-400 text-center">History is automatically saved when you make changes. Last 10 versions are kept.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
