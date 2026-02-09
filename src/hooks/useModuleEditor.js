import * as React from 'react';
import {
  normalizeComposerActivities,
  normalizeComposerLayout,
  normalizeComposerModuleConfig,
} from '../composer/layout.js';

const { useCallback, useState } = React;

const DEFAULT_EDIT_FORM = {
  title: '',
  html: '',
  script: '',
  id: '',
  section: '',
  moduleType: '',
  moduleMode: 'custom_html',
  activities: [],
  composerLayout: { maxColumns: 1 },
  url: '',
  linkType: 'iframe',
  fullDocument: '',
};

function ensureComposerActivities(activities, maxColumns = 1) {
  const normalized = normalizeComposerActivities(activities, { maxColumns });
  if (normalized.length > 0) return normalized;
  return [
    {
      id: `activity-${Date.now()}`,
      type: 'content_block',
      data: {
        title: 'New Section',
        body: 'Add your lesson content here.',
      },
      layout: {
        colSpan: 1,
      },
    },
  ];
}

export function useModuleEditor({ projectData, setProjectData } = {}) {
  const [editingModule, setEditingModule] = useState(null);
  const [editForm, setEditForm] = useState(DEFAULT_EDIT_FORM);
  const [moduleHistory, setModuleHistory] = useState(null); // { moduleId, history: [...] }

  const openEditModule = useCallback((item) => {
    const composerState = normalizeComposerModuleConfig(item);

    // Handle external link modules
    if (item.type === 'external') {
      setEditForm({
        title: item.title,
        url: item.url || '',
        linkType: item.linkType || 'iframe',
        id: item.id,
        section: 'Current Course',
        moduleType: 'external',
        moduleMode: item.mode || 'custom_html',
        activities: composerState.activities,
        composerLayout: composerState.composerLayout,
      });
      setEditingModule(item.id);
      return;
    }

    // Handle standalone HTML modules
    if (item.type === 'standalone') {
      // PRIORITY 1: Use rawHtml if available (new simplified format)
      if (item.rawHtml) {
        setEditForm({
          title: item.title,
          fullDocument: item.rawHtml,
          id: item.id,
          section: 'Current Course',
          moduleType: 'standalone',
          moduleMode: item.mode || 'custom_html',
          activities: composerState.activities,
          composerLayout: composerState.composerLayout,
          hasRawHtml: true, // Flag to indicate this uses rawHtml format
        });
        setEditingModule(item.id);
        return;
      }

      // FALLBACK: Reconstruct full document from parsed parts (legacy standalone)
      let fullDocument =
        '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>' +
        (item.title || 'Module') +
        '</title>\n';
      fullDocument += '<script src="https://cdn.tailwindcss.com"><\/script>\n';

      if (item.css) {
        fullDocument += '<style>\n' + item.css + '\n</style>\n';
      }

      fullDocument += '</head>\n<body>\n';

      if (item.html) {
        fullDocument += item.html + '\n';
      }

      if (item.script) {
        fullDocument += '<script>\n' + item.script + '\n</script>\n';
      }

      fullDocument += '</body>\n</html>';

      setEditForm({
        title: item.title,
        fullDocument: fullDocument,
        id: item.id,
        section: 'Current Course',
        moduleType: 'standalone',
        moduleMode: item.mode || 'custom_html',
        activities: composerState.activities,
        composerLayout: composerState.composerLayout,
        hasRawHtml: false,
      });
      setEditingModule(item.id);
      return;
    }

    // Legacy module format (old code structure)
    let itemCode = item.code || {};
    if (typeof itemCode === 'string') {
      try {
        itemCode = JSON.parse(itemCode);
      } catch (e) {}
    }
    setEditForm({
      title: item.title,
      html: itemCode.html || '',
      script: itemCode.script || '',
      id: item.id,
      section: 'Current Course',
      moduleType: 'legacy',
      moduleMode: item.mode || 'custom_html',
      activities: composerState.activities,
      composerLayout: composerState.composerLayout,
    });
    setEditingModule(item.id);
  }, []);

  const saveEditModule = useCallback(() => {
    const section = editForm.section;
    let items = projectData?.[section]?.modules || [];
    const idx = items.findIndex((m) => m.id === editingModule);
    if (idx === -1) return;

    // Save current version to history before updating
    const currentModule = { ...items[idx] }; // Create a copy to avoid mutation issues
    const history = currentModule.history || [];
    const currentComposerState = normalizeComposerModuleConfig(currentModule);

    // Create history snapshot (only save if content actually changed)
    const newSnapshot = {
      timestamp: new Date().toISOString(),
      title: currentModule.title,
      mode: currentModule.mode || 'custom_html',
      activities: currentComposerState.activities,
      composerLayout: currentComposerState.composerLayout,
      ...(currentModule.type === 'standalone'
        ? // Use rawHtml if available (new format), otherwise use legacy fields
          currentModule.rawHtml
          ? { rawHtml: currentModule.rawHtml }
          : {
              html: currentModule.html,
              css: currentModule.css,
              script: currentModule.script,
            }
        : currentModule.type === 'external'
          ? { url: currentModule.url, linkType: currentModule.linkType }
          : { code: currentModule.code }),
    };

    // Only add to history if it's different from the last snapshot (avoid duplicates)
    const lastSnapshot = history[history.length - 1];
    const hasChanged =
      !lastSnapshot ||
      JSON.stringify(newSnapshot) !== JSON.stringify({ ...lastSnapshot, timestamp: newSnapshot.timestamp });

    // Calculate updated history
    let updatedHistory = history;
    if (hasChanged) {
      // Keep only last 10 versions to prevent storage bloat
      updatedHistory = [...history, newSnapshot].slice(-10);
    }

    const nextMode = editForm.moduleMode === 'composer' ? 'composer' : 'custom_html';
    const nextComposerLayout = normalizeComposerLayout(editForm.composerLayout);
    const nextActivities =
      nextMode === 'composer'
        ? ensureComposerActivities(editForm.activities, nextComposerLayout.maxColumns)
        : normalizeComposerActivities(editForm.activities, { maxColumns: nextComposerLayout.maxColumns });

    // Handle external link modules
    if (editForm.moduleType === 'external') {
      items[idx] = {
        ...items[idx],
        title: editForm.title,
        mode: nextMode,
        activities: nextActivities,
        composerLayout: nextComposerLayout,
        url: editForm.url,
        linkType: editForm.linkType || 'iframe',
        type: 'external',
        history: updatedHistory,
      };
    }
    // Handle standalone HTML modules
    else if (editForm.moduleType === 'standalone') {
      if (nextMode === 'composer') {
        // Composer modules must compile from structured activities.
        // Keep rawHtml empty so export paths don't bypass composer compilation.
        items[idx] = {
          ...items[idx],
          title: editForm.title,
          mode: 'composer',
          activities: nextActivities,
          composerLayout: nextComposerLayout,
          rawHtml: '',
          html: '',
          css: '',
          script: '',
          type: 'standalone',
          history: updatedHistory,
        };
      } else {
        // Store complete custom HTML document as-is.
        items[idx] = {
          ...items[idx],
          title: editForm.title,
          mode: 'custom_html',
          activities: nextActivities,
          composerLayout: nextComposerLayout,
          rawHtml: editForm.fullDocument.trim(),
          html: '',
          css: '',
          script: '',
          type: 'standalone',
          history: updatedHistory,
        };
      }
    }
    // Legacy module format
    else {
      items[idx] = {
        ...items[idx],
        title: editForm.title,
        mode: nextMode,
        activities: nextActivities,
        composerLayout: nextComposerLayout,
        code: {
          id: items[idx].code?.id || editForm.id,
          html: editForm.html,
          script: editForm.script,
        },
        history: updatedHistory,
      };
    }

    setProjectData({
      ...projectData,
      [section]: {
        ...projectData[section],
        modules: items,
      },
    });
    setEditingModule(null);
  }, [editForm, editingModule, projectData, setProjectData]);

  // Revert module to a previous version
  const revertModuleVersion = useCallback(
    (moduleId, versionIndex) => {
      const section = 'Current Course';
      let items = projectData?.[section]?.modules || [];
      const idx = items.findIndex((m) => m.id === moduleId);
      if (idx === -1) return;

      const module = items[idx];
      const history = module.history || [];
      if (versionIndex < 0 || versionIndex >= history.length) return;

      const version = history[versionIndex];
      const fallbackComposer = normalizeComposerModuleConfig(items[idx]);
      const restoredComposer = normalizeComposerModuleConfig({
        composerLayout: version.composerLayout || fallbackComposer.composerLayout,
        activities: Array.isArray(version.activities) ? version.activities : fallbackComposer.activities,
      });

      // Restore the version based on module type
      if (module.type === 'standalone') {
        // Check if version has rawHtml (new format) or legacy fields
        if (version.rawHtml) {
          items[idx] = {
            ...items[idx],
            title: version.title,
            mode: version.mode || items[idx].mode || 'custom_html',
            activities: restoredComposer.activities,
            composerLayout: restoredComposer.composerLayout,
            rawHtml: version.rawHtml,
            html: '',
            css: '',
            script: '',
          };
        } else {
          items[idx] = {
            ...items[idx],
            title: version.title,
            mode: version.mode || items[idx].mode || 'custom_html',
            activities: restoredComposer.activities,
            composerLayout: restoredComposer.composerLayout,
            rawHtml: '', // Clear rawHtml if reverting to legacy format
            html: version.html || '',
            css: version.css || '',
            script: version.script || '',
          };
        }
      } else if (module.type === 'external') {
        items[idx] = {
          ...items[idx],
          title: version.title,
          mode: version.mode || items[idx].mode || 'custom_html',
          activities: restoredComposer.activities,
          composerLayout: restoredComposer.composerLayout,
          url: version.url || '',
          linkType: version.linkType || 'iframe',
        };
      } else {
        items[idx] = {
          ...items[idx],
          title: version.title,
          mode: version.mode || items[idx].mode || 'custom_html',
          activities: restoredComposer.activities,
          composerLayout: restoredComposer.composerLayout,
          code: version.code || {},
        };
      }

      setProjectData({
        ...projectData,
        [section]: {
          ...projectData[section],
          modules: items,
        },
      });

      // Refresh edit form if module is currently being edited
      if (editingModule === moduleId) {
        const updatedModule = items[idx];
        openEditModule(updatedModule);
      }

      setModuleHistory(null);
    },
    [editingModule, openEditModule, projectData, setProjectData],
  );

  return {
    editingModule,
    setEditingModule,
    editForm,
    setEditForm,
    moduleHistory,
    setModuleHistory,
    openEditModule,
    saveEditModule,
    revertModuleVersion,
  };
}
