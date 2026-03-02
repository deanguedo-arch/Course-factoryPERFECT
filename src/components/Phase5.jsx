import * as React from 'react';
import { AlertTriangle, Database, Download, Package, RefreshCw, Settings, Trash2, Upload } from 'lucide-react';
import { PROJECT_DATA } from '../data/constants.js';
import { migrateProjectData } from '../utils/migrations.js';
import { getHubTitle, hasLegacyHubThemeFields } from '../utils/hubConfig.js';

const { useMemo } = React;

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseModuleCode(module) {
  const rawCode = module?.code;
  if (!rawCode) return {};
  if (typeof rawCode === 'string') {
    try {
      return JSON.parse(rawCode);
    } catch {
      return {};
    }
  }
  return rawCode;
}

function isMaterialsModule(module) {
  return parseModuleCode(module).id === 'view-materials';
}

function isAssessmentsModule(module) {
  return module?.id === 'item-assessments' || module?.title === 'Assessments';
}

function buildBlankCoreModules(projectData) {
  const currentModules = projectData?.['Current Course']?.modules || [];
  const defaultModules = PROJECT_DATA?.['Current Course']?.modules || [];
  const sourceMaterials = currentModules.find(isMaterialsModule) || defaultModules.find(isMaterialsModule) || null;
  const sourceAssessments = currentModules.find(isAssessmentsModule) || defaultModules.find(isAssessmentsModule) || null;

  return [sourceMaterials, sourceAssessments]
    .filter(Boolean)
    .map((module) => {
      const next = cloneData(module);
      if (isMaterialsModule(next)) {
        next.materials = [];
        next.hidden = false;
      }
      if (isAssessmentsModule(next)) {
        next.assessments = [];
        next.hidden = false;
      }
      return next;
    });
}

const Phase5 = ({ projectData, setProjectData, showToast }) => {
  const settings = projectData['Course Settings'] || {};
  const compilationDefaults = {
    ...(PROJECT_DATA['Course Settings']?.compilationDefaults || {}),
    ...(settings.compilationDefaults || {}),
  };

  const metrics = useMemo(() => {
    const modules = projectData['Current Course']?.modules || [];
    const assessmentsModule = modules.find(isAssessmentsModule);
    const materials = projectData['Current Course']?.materials || [];
    return {
      modules: modules.length,
      materials: materials.length,
      assessments: (assessmentsModule?.assessments || []).length,
      toolkit: (projectData['Global Toolkit'] || []).length,
    };
  }, [projectData]);

  const notify = (message, tone = 'success') => {
    if (showToast) showToast(message, tone);
  };

  const updateCompilationDefaults = (updates) => {
    setProjectData((prev) => ({
      ...prev,
      'Course Settings': {
        ...(prev['Course Settings'] || {}),
        compilationDefaults: {
          ...(PROJECT_DATA['Course Settings']?.compilationDefaults || {}),
          ...(prev['Course Settings']?.compilationDefaults || {}),
          ...updates,
        },
      },
    }));
  };

  const exportProject = () => {
    const title = getHubTitle(projectData) || 'course';
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-zA-Z0-9]+/g, '_')}_project_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify('Project JSON exported.', 'success');
  };

  const importProject = (event) => {
    const file = event.target.files?.[0];
    const input = event.target;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const parsed = JSON.parse(loadEvent.target?.result);
        if (!parsed || !parsed['Current Course']) {
          throw new Error('Invalid project file.');
        }

        const hadLegacyHubSettings = hasLegacyHubThemeFields(parsed);
        const migrated = migrateProjectData(parsed) || parsed;
        setProjectData(migrated);
        notify('Project JSON imported.', 'success');
        if (hadLegacyHubSettings) {
          notify('Legacy theme settings ignored (migrated to Module Composer).', 'warning');
        }
      } catch (error) {
        notify(`Import failed: ${error.message}`, 'error');
      } finally {
        if (input) input.value = '';
      }
    };
    reader.readAsText(file);
  };

  const resetCourseContent = () => {
    const confirmed = window.confirm(
      'Reset course content?\n\nThis clears modules, materials, assessments, and composer components while keeping Hub Settings, compile defaults, and toolkit data.',
    );
    if (!confirmed) return;

    setProjectData((prev) => {
      const next = migrateProjectData({
        ...prev,
        'Current Course': {
          ...(prev['Current Course'] || {}),
          modules: buildBlankCoreModules(prev),
          materials: [],
          composerComponents: [],
        },
      });
      return next || prev;
    });

    notify('Course content reset. Hub settings and toolkit data were preserved.', 'warning');
  };

  const resetEverything = () => {
    const confirmed = window.confirm(
      'Reset everything?\n\nThis clears course content, toolkit items, and resets Hub Settings and compile defaults.',
    );
    if (!confirmed) return;

    const preservedTitle = getHubTitle(projectData) || PROJECT_DATA.hubConfig?.brand?.title || 'Course';
    const blankModules = buildBlankCoreModules(projectData);
    const nextProject = migrateProjectData({
      projectSchemaVersion: PROJECT_DATA.projectSchemaVersion,
      'Current Course': {
        ...(PROJECT_DATA['Current Course'] || {}),
        name: preservedTitle,
        modules: blankModules,
        materials: [],
        composerComponents: [],
      },
      'Course Settings': {
        ...(PROJECT_DATA['Course Settings'] || {}),
        courseName: preservedTitle,
      },
      hubConfig: {
        ...(cloneData(PROJECT_DATA.hubConfig) || {}),
        brand: {
          ...(cloneData(PROJECT_DATA.hubConfig?.brand) || {}),
          title: preservedTitle,
        },
      },
      'Global Toolkit': [],
    });

    if (nextProject) {
      setProjectData(nextProject);
      notify('Project reset to blank course defaults.', 'warning');
    }
  };

  const clearCache = () => {
    const confirmed = window.confirm('Clear browser cache for this builder? Project data will be preserved.');
    if (!confirmed) return;

    const projectBackup = localStorage.getItem('course_factory_v2_data');
    localStorage.clear();
    if (projectBackup) {
      localStorage.setItem('course_factory_v2_data', projectBackup);
    }
    notify('Builder cache cleared.', 'success');
  };

  const forceRefresh = async () => {
    const confirmed = window.confirm(
      'Force refresh?\n\nThis clears browser caches and reloads the builder with the latest local code. Project data will be preserved.',
    );
    if (!confirmed) return;

    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
    } catch {
      // Ignore cache cleanup failures and reload anyway.
    }

    window.location.reload();
  };

  const getStorageSize = () => {
    try {
      const data = localStorage.getItem('course_factory_v2_data');
      if (!data) return '0 KB';
      const bytes = new Blob([data]).size;
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
          <Settings className="text-sky-400" /> Phase 5: Ops
        </h2>

        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-950/70 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white">{getHubTitle(projectData)}</p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Operations Panel</p>
            </div>
            <div className="rounded-full border border-slate-700 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Storage {getStorageSize()}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Modules</p>
              <p className="mt-1 text-lg font-semibold text-white">{metrics.modules}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Materials</p>
              <p className="mt-1 text-lg font-semibold text-white">{metrics.materials}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Assessments</p>
              <p className="mt-1 text-lg font-semibold text-white">{metrics.assessments}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Toolkit</p>
              <p className="mt-1 text-lg font-semibold text-white">{metrics.toolkit}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-emerald-500/25 bg-slate-900/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <Database size={20} className="text-emerald-400" /> Project JSON
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={exportProject}
              className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-500"
            >
              <Download size={16} /> Export Project JSON
            </button>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-sky-500">
              <Upload size={16} /> Import Project JSON
              <input type="file" accept=".json" onChange={importProject} className="hidden" />
            </label>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-amber-500/25 bg-slate-900/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <Package size={20} className="text-amber-400" /> Compile Defaults
          </h3>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-950 p-3 transition-colors hover:bg-slate-900">
              <input
                type="checkbox"
                checked={Boolean(compilationDefaults.includeMaterials)}
                onChange={(e) => updateCompilationDefaults({ includeMaterials: e.target.checked })}
                className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-sky-600"
              />
              <div>
                <div className="text-sm font-bold text-white">Include Materials</div>
                <div className="text-xs text-slate-500">Keep the materials shell in compiled outputs.</div>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-950 p-3 transition-colors hover:bg-slate-900">
              <input
                type="checkbox"
                checked={Boolean(compilationDefaults.includeAssessments)}
                onChange={(e) => updateCompilationDefaults({ includeAssessments: e.target.checked })}
                className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-sky-600"
              />
              <div>
                <div className="text-sm font-bold text-white">Include Assessments</div>
                <div className="text-xs text-slate-500">Keep the assessments shell in compiled outputs.</div>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-950 p-3 transition-colors hover:bg-slate-900">
              <input
                type="checkbox"
                checked={Boolean(compilationDefaults.includeToolkit)}
                onChange={(e) => updateCompilationDefaults({ includeToolkit: e.target.checked })}
                className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-sky-600"
              />
              <div>
                <div className="text-sm font-bold text-white">Include Toolkit</div>
                <div className="text-xs text-slate-500">Keep global toolkit items in compiled outputs.</div>
              </div>
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-rose-500/20 bg-slate-900/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <RefreshCw size={20} className="text-rose-300" /> Maintenance
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={resetCourseContent}
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-900"
            >
              Reset Course Content
            </button>

            <button
              type="button"
              onClick={resetEverything}
              className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-sm font-bold text-rose-100 transition-colors hover:bg-rose-900/50"
            >
              Reset Everything
            </button>

            <button
              type="button"
              onClick={clearCache}
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-900"
            >
              Clear Cache
            </button>

            <button
              type="button"
              onClick={forceRefresh}
              className="rounded-lg bg-amber-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-amber-500"
            >
              Force Refresh
            </button>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-900/40 bg-rose-950/20 px-4 py-3 text-xs text-rose-100">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-300" />
            <p>Reset actions are immediate after confirmation. Export a JSON backup first if you may need to roll back.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase5;
