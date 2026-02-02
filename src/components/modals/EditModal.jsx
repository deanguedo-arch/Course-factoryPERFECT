import * as React from 'react';
import { Clock, Edit, RotateCcw, X } from 'lucide-react';

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
  return (
    <>
      {/* EDIT MODAL */}
      {editingModule && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-blue-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit size={20} className="text-blue-400" />
                Edit Module: {editForm.title || 'Untitled'}
              </h3>
              <button onClick={() => setEditingModule(null)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-300 mb-2">Module Title</label>
                  <input 
                    type="text"
                  value={editForm.title || ''} 
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm"
                  placeholder="Module title"
                  />
                </div>
                
              {/* External Link Module Form */}
              {editForm.moduleType === 'external' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">URL</label>
                    <input 
                      type="text"
                      value={editForm.url || ''} 
                      onChange={(e) => setEditForm({...editForm, url: e.target.value})}
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
                          onChange={(e) => setEditForm({...editForm, linkType: e.target.value})}
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
                          onChange={(e) => setEditForm({...editForm, linkType: e.target.value})}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-300">Open in new tab</span>
                      </label>
              </div>
                  </div>
                </div>
              )}

              {/* Standalone HTML Module Form - Full Document View */}
              {editForm.moduleType === 'standalone' && (
              <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Full HTML Document</label>
                  <p className="text-xs text-emerald-400 mb-2 font-medium">Edit the complete HTML document - your code runs as-is in an iframe</p>
                <textarea 
                    value={editForm.fullDocument || ''} 
                    onChange={(e) => setEditForm({...editForm, fullDocument: e.target.value})}
                    className="w-full h-96 bg-slate-950 border border-slate-700 rounded p-3 text-white font-mono text-xs"
                    placeholder="<!DOCTYPE html>..."
                  />
                </div>
              )}

              {/* Legacy Module Form */}
              {editForm.moduleType === 'legacy' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">HTML</label>
                    <textarea 
                      value={editForm.html || ''} 
                  onChange={(e) => setEditForm({...editForm, html: e.target.value})}
                      className="w-full h-64 bg-slate-950 border border-slate-700 rounded p-3 text-white font-mono text-sm"
                />
              </div>

              <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Script</label>
                <textarea 
                      value={editForm.script || ''} 
                  onChange={(e) => setEditForm({...editForm, script: e.target.value})}
                      className="w-full h-64 bg-slate-950 border border-slate-700 rounded p-3 text-white font-mono text-sm"
                />
              </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800 border-t border-slate-700 p-4 flex gap-3">
              <button onClick={() => setEditingModule(null)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors">Cancel</button>
              <button 
                onClick={() => {
                  const module = projectData["Current Course"]?.modules?.find(m => m.id === editingModule);
                  if (module?.history && module.history.length > 0) {
                    setModuleHistory({ moduleId: editingModule, history: module.history });
                  } else {
                    alert('No version history available for this module yet. History is created when you save changes.');
                  }
                }}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded flex items-center gap-2 transition-colors"
                title="View version history"
              >
                <Clock size={16} />
                History
              </button>
              <button onClick={saveEditModule} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold shadow-lg transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* VERSION HISTORY MODAL */}
      {moduleHistory && (
        <div className="fixed inset-0 bg-black/80 z-[55] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setModuleHistory(null)}>
          <div className="bg-slate-900 border border-amber-900 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock size={20} className="text-amber-400" />
                Version History
              </h3>
              <button onClick={() => setModuleHistory(null)} className="text-slate-400 hover:text-white">
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
                          isLatest 
                            ? 'bg-amber-900/20 border-amber-700/50' 
                            : 'bg-slate-800/50 border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">
                                Version {moduleHistory.history.length - idx}
                              </span>
                              {isLatest && (
                                <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded uppercase font-bold">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {date.toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          {!isLatest && (
                            <button
                              onClick={() => {
                                if (confirm(`Revert to this version? This will replace the current version.`)) {
                                  revertModuleVersion(moduleHistory.moduleId, idx);
                                }
                              }}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded flex items-center gap-1 transition-colors"
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
              <p className="text-xs text-slate-400 text-center">
                History is automatically saved when you make changes. Last 10 versions are kept.
              </p>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
