import * as React from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  Edit,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import {
  createKnowledgeCheckBuilderQuestion,
  createWorksheetBuilderBlock,
  getActivityDefinition,
  listActivityTypeGroups,
  listActivityTypes,
  normalizeKnowledgeCheckBuilderQuestions,
  normalizeWorksheetBuilderBlocks,
} from '../../composer/activityRegistry.js';
import {
  buildComposerGridModel,
  clampComposerColSpan,
  moveComposerActivityToCell,
  normalizeComposerActivities,
  normalizeComposerLayout,
} from '../../composer/layout.js';
import { isComposerEnabled } from '../../utils/composer.js';
import { buildModuleFrameHTML } from '../../utils/generators.js';
import GenericDataEditor from '../GenericDataEditor.jsx';
import HotspotEditor from '../composer/HotspotEditor.jsx';

const { useEffect, useMemo, useRef, useState } = React;

function createActivity(type) {
  const def = getActivityDefinition(type);
  if (!def) return null;
  return {
    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    data: def.createDefaultData ? def.createDefaultData() : {},
    layout: { colSpan: 1 },
  };
}

function escapeEditorHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const RICH_EDITOR_FONT_OPTIONS = [
  { value: 'Arial', label: 'Arial (System)' },
  { value: 'Helvetica', label: 'Helvetica (System)' },
  { value: 'Verdana', label: 'Verdana (System)' },
  { value: 'Tahoma', label: 'Tahoma (System)' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS (System)' },
  { value: 'Segoe UI', label: 'Segoe UI (System)' },
  { value: 'Georgia', label: 'Georgia (System)' },
  { value: 'Garamond', label: 'Garamond (System)' },
  { value: 'Palatino Linotype', label: 'Palatino Linotype (System)' },
  { value: 'Times New Roman', label: 'Times New Roman (System)' },
  { value: 'Courier New', label: 'Courier New (System)' },
  { value: 'Lucida Console', label: 'Lucida Console (System)' },
  { value: 'Impact', label: 'Impact (System)' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS (System)' },
  { value: 'Inter', label: 'Inter (Web Font)' },
  { value: 'Roboto', label: 'Roboto (Web Font)' },
  { value: 'Open Sans', label: 'Open Sans (Web Font)' },
  { value: 'Lato', label: 'Lato (Web Font)' },
  { value: 'Montserrat', label: 'Montserrat (Web Font)' },
  { value: 'Poppins', label: 'Poppins (Web Font)' },
  { value: 'Raleway', label: 'Raleway (Web Font)' },
  { value: 'Nunito', label: 'Nunito (Web Font)' },
  { value: 'Playfair Display', label: 'Playfair Display (Web Font)' },
  { value: 'Merriweather', label: 'Merriweather (Web Font)' },
  { value: 'Oswald', label: 'Oswald (Web Font)' },
  { value: 'Bebas Neue', label: 'Bebas Neue (Web Font)' },
];

const BLOCK_THEME_OPTIONS = [
  { value: 'default', label: 'Default (Current Colors)' },
  { value: 'slate', label: 'Slate' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'forest', label: 'Forest' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'mono', label: 'Monochrome' },
];

const BLOCK_THEME_PREVIEW_COLORS = {
  default: { textColor: '#e2e8f0', containerBg: '#0f172a' },
  slate: { textColor: '#dbe3ee', containerBg: '#0f172a' },
  ocean: { textColor: '#dbeafe', containerBg: '#1e3a8a' },
  forest: { textColor: '#dcfce7', containerBg: '#14532d' },
  sunset: { textColor: '#ffedd5', containerBg: '#9a3412' },
  mono: { textColor: '#f8fafc', containerBg: '#111827' },
};

function normalizeThemeValue(value) {
  const raw = String(value || '').trim().toLowerCase();
  return BLOCK_THEME_OPTIONS.some((theme) => theme.value === raw) ? raw : 'default';
}

function getThemePreviewColors(themeValue) {
  return BLOCK_THEME_PREVIEW_COLORS[normalizeThemeValue(themeValue)] || BLOCK_THEME_PREVIEW_COLORS.default;
}

function normalizeColorInputValue(value, fallback = '#0f172a') {
  const raw = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(raw) ? raw : fallback;
}

function extractRichEditorText(html) {
  const input = String(html || '');
  if (!input) return '';
  if (typeof document === 'undefined') {
    return input
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6|blockquote)>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\u00a0/g, ' ')
      .trim();
  }
  const container = document.createElement('div');
  container.innerHTML = input;
  return (container.innerText || container.textContent || '').replace(/\u00a0/g, ' ').trim();
}

function stripInlineRichFormatting(html) {
  const input = String(html || '');
  if (!input.trim()) return '';
  if (typeof document === 'undefined') {
    return input
      .replace(/<font\b[^>]*>/gi, '')
      .replace(/<\/font>/gi, '')
      .replace(/\sstyle\s*=\s*(['"]).*?\1/gi, '')
      .replace(/\s(?:bgcolor|color|face|size)\s*=\s*(['"]).*?\1/gi, '');
  }
  const template = document.createElement('template');
  template.innerHTML = input;
  const fontNodes = Array.from(template.content.querySelectorAll('font'));
  fontNodes.forEach((fontNode) => {
    const parent = fontNode.parentNode;
    if (!parent) return;
    while (fontNode.firstChild) {
      parent.insertBefore(fontNode.firstChild, fontNode);
    }
    parent.removeChild(fontNode);
  });
  Array.from(template.content.querySelectorAll('*')).forEach((node) => {
    node.removeAttribute('style');
    node.removeAttribute('bgcolor');
    node.removeAttribute('color');
    node.removeAttribute('face');
    node.removeAttribute('size');
  });
  return template.innerHTML;
}

function extractMaterialImageAsset(material) {
  if (!material || typeof material !== 'object') return null;
  const imagePattern = /\.(avif|bmp|gif|ico|jpe?g|png|svg|webp)(\?.*)?$/i;
  const candidates = [material.viewUrl, material.downloadUrl].map((value) => String(value || '').trim()).filter(Boolean);
  const url = candidates.find((value) => imagePattern.test(value) || /^data:image\//i.test(value));
  if (!url) return null;
  return {
    id: material.id,
    url,
    label: material.title || material.number || material.id || 'Image asset',
    alt: material.title || material.number || '',
  };
}

function getActivityRichEditorConfig(activity) {
  const type = activity?.type || '';
  if (type === 'content_block') {
    return {
      modeKey: 'bodyMode',
      htmlKey: 'bodyHtml',
      textKey: 'body',
      plainLabel: 'Body',
      titleInputLabel: 'Section Title',
      titleInputKey: 'title',
      plainRowsClass: 'h-40',
    };
  }
  if (type === 'title_block') {
    return {
      modeKey: 'textMode',
      htmlKey: 'textHtml',
      textKey: 'text',
      plainLabel: 'Title Text',
      titleInputLabel: null,
      titleInputKey: null,
      plainRowsClass: 'h-28',
    };
  }
  return null;
}

const RUBRIC_MIN_SIZE = 2;
const RUBRIC_MAX_SIZE = 5;

function clampRubricDimension(value, fallback = 3) {
  const parsed = Number.parseInt(value, 10);
  const base = Number.isFinite(parsed) ? parsed : Number.parseInt(fallback, 10);
  const normalized = Number.isFinite(base) ? base : 3;
  return Math.max(RUBRIC_MIN_SIZE, Math.min(RUBRIC_MAX_SIZE, normalized));
}

function getDefaultRubricColumns(count) {
  const safeCount = clampRubricDimension(count, 3);
  const presets = {
    2: [
      { label: 'Strong', score: 2 },
      { label: 'Needs Work', score: 1 },
    ],
    3: [
      { label: 'Exceeds', score: 3 },
      { label: 'Meets', score: 2 },
      { label: 'Developing', score: 1 },
    ],
    4: [
      { label: 'Exemplary', score: 4 },
      { label: 'Proficient', score: 3 },
      { label: 'Developing', score: 2 },
      { label: 'Beginning', score: 1 },
    ],
    5: [
      { label: 'Mastery', score: 5 },
      { label: 'Advanced', score: 4 },
      { label: 'Proficient', score: 3 },
      { label: 'Developing', score: 2 },
      { label: 'Beginning', score: 1 },
    ],
  };
  return (presets[safeCount] || presets[3]).map((column) => ({ ...column }));
}

function normalizeRubricData(data, rowValue, colValue) {
  const rowCount = clampRubricDimension(rowValue ?? data?.rowCount ?? data?.rows?.length ?? 3, 3);
  const colCount = clampRubricDimension(colValue ?? data?.colCount ?? data?.columns?.length ?? 3, 3);
  const fallbackColumns = getDefaultRubricColumns(colCount);
  const rows = Array.from({ length: rowCount }, (_, rowIdx) => {
    const raw = Array.isArray(data?.rows) ? data.rows[rowIdx] : null;
    const fallback = `Criterion ${rowIdx + 1}`;
    return {
      label: String(raw?.label || fallback).trim() || fallback,
    };
  });
  const columns = Array.from({ length: colCount }, (_, colIdx) => {
    const raw = Array.isArray(data?.columns) ? data.columns[colIdx] : null;
    const fallback = fallbackColumns[colIdx] || { label: `Level ${colIdx + 1}`, score: colCount - colIdx };
    const parsedScore = Number.parseFloat(raw?.score);
    return {
      label: String(raw?.label || fallback.label).trim() || fallback.label,
      score: Number.isFinite(parsedScore) ? parsedScore : fallback.score,
    };
  });
  const cells = rows.map((row, rowIdx) =>
    columns.map((column, colIdx) => {
      const raw = Array.isArray(data?.cells) && Array.isArray(data.cells[rowIdx]) ? data.cells[rowIdx][colIdx] : '';
      const fallback = `Describe "${column.label}" for ${row.label.toLowerCase()}.`;
      return String(raw || fallback);
    }),
  );
  return {
    rowCount,
    colCount,
    rows,
    columns,
    cells,
    selfScoringEnabled: data?.selfScoringEnabled !== false,
  };
}

function reorderByIndex(items, fromIndex, toIndex) {
  if (!Array.isArray(items)) return [];
  if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) return [...items];
  if (fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) return [...items];
  if (fromIndex === toIndex) return [...items];
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
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
  const composerLayout = useMemo(() => normalizeComposerLayout(editForm.composerLayout), [editForm.composerLayout]);
  const composerMaxColumns = composerLayout.maxColumns;
  const activities = useMemo(
    () => normalizeComposerActivities(editForm.activities, { maxColumns: composerMaxColumns }),
    [editForm.activities, composerMaxColumns],
  );
  const activityTypes = useMemo(() => listActivityTypes(), []);
  const activityTypeGroups = useMemo(() => listActivityTypeGroups(), []);
  const moduleBankMaterials = useMemo(
    () =>
      ((projectData?.['Current Course']?.materials || [])
        .filter((mat) => !mat.hidden)
        .sort((a, b) => (a.order || 0) - (b.order || 0))),
    [projectData],
  );
  const moduleBankImageAssets = useMemo(
    () => moduleBankMaterials.map(extractMaterialImageAsset).filter(Boolean),
    [moduleBankMaterials],
  );
  const availableAssessments = useMemo(() => {
    const modules = projectData?.['Current Course']?.modules || [];
    return modules
      .flatMap((mod) => (mod.assessments || []).map((assessment) => ({ ...assessment, moduleId: mod.id, moduleTitle: mod.title })))
      .filter((assessment) => !assessment.hidden);
  }, [projectData]);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState(0);
  const [draggingActivityIndex, setDraggingActivityIndex] = useState(null);
  const [dragOverActivityIndex, setDragOverActivityIndex] = useState(null);
  const [dragOverSlotKey, setDragOverSlotKey] = useState(null);
  const [composerExtraRows, setComposerExtraRows] = useState(0);
  const [newActivityType, setNewActivityType] = useState(activityTypes[0] || 'content_block');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedImageMaterialId, setSelectedImageMaterialId] = useState('');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [draggingKnowledgeQuestionIndex, setDraggingKnowledgeQuestionIndex] = useState(null);
  const [dragOverKnowledgeQuestionIndex, setDragOverKnowledgeQuestionIndex] = useState(null);
  const [draggingWorksheetBlockIndex, setDraggingWorksheetBlockIndex] = useState(null);
  const [dragOverWorksheetBlockIndex, setDragOverWorksheetBlockIndex] = useState(null);
  const [composerPreviewNonce, setComposerPreviewNonce] = useState(0);
  const richEditorRef = useRef(null);
  const richEditorSelectionRef = useRef(null);
  const richEditorUpdateTimerRef = useRef(null);
  const composerGridModel = useMemo(
    () =>
      buildComposerGridModel(activities, composerMaxColumns, {
        includeTrailingRow: true,
        trailingRows: composerExtraRows,
      }),
    [activities, composerExtraRows, composerMaxColumns],
  );
  const composerPlacementsByIndex = useMemo(
    () => new Map(composerGridModel.placements.map((placement) => [placement.index, placement])),
    [composerGridModel],
  );

  useEffect(() => {
    setSelectedActivityIndex(0);
    setComposerExtraRows(0);
  }, [editingModule, standaloneMode]);

  useEffect(() => {
    setDraggingActivityIndex(null);
    setDragOverActivityIndex(null);
    setDragOverSlotKey(null);
    setDraggingKnowledgeQuestionIndex(null);
    setDragOverKnowledgeQuestionIndex(null);
    setDraggingWorksheetBlockIndex(null);
    setDragOverWorksheetBlockIndex(null);
  }, [editingModule, standaloneMode, activities.length]);

  useEffect(() => {
    if (selectedActivityIndex > activities.length - 1) {
      setSelectedActivityIndex(Math.max(activities.length - 1, 0));
    }
  }, [activities.length, selectedActivityIndex]);

  useEffect(
    () => () => {
      if (richEditorUpdateTimerRef.current) {
        clearTimeout(richEditorUpdateTimerRef.current);
        richEditorUpdateTimerRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    if (!selectedMaterialId && moduleBankMaterials.length > 0) {
      setSelectedMaterialId(moduleBankMaterials[0].id);
    }
  }, [moduleBankMaterials, selectedMaterialId]);

  useEffect(() => {
    if (moduleBankImageAssets.length === 0) {
      if (selectedImageMaterialId) setSelectedImageMaterialId('');
      return;
    }
    if (!selectedImageMaterialId || !moduleBankImageAssets.some((asset) => asset.id === selectedImageMaterialId)) {
      setSelectedImageMaterialId(moduleBankImageAssets[0].id);
    }
  }, [moduleBankImageAssets, selectedImageMaterialId]);

  useEffect(() => {
    if (!selectedAssessmentId && availableAssessments.length > 0) {
      setSelectedAssessmentId(availableAssessments[0].id);
    }
  }, [availableAssessments, selectedAssessmentId]);

  useEffect(() => {
    if (standaloneMode !== 'composer') return;
    setComposerPreviewNonce((n) => n + 1);
  }, [editingModule, standaloneMode]);

  const selectedActivity = activities[selectedActivityIndex] || null;
  const selectedPlacement = selectedActivity ? composerPlacementsByIndex.get(selectedActivityIndex) || null : null;

  useEffect(() => {
    if (richEditorUpdateTimerRef.current) {
      clearTimeout(richEditorUpdateTimerRef.current);
      richEditorUpdateTimerRef.current = null;
    }
  }, [selectedActivityIndex, standaloneMode]);

  useEffect(() => {
    const editor = richEditorRef.current;
    const richConfig = getActivityRichEditorConfig(selectedActivity);
    if (!editor || !selectedActivity || !richConfig) return;
    const data = selectedActivity.data || {};
    const bodyMode = data[richConfig.modeKey] === 'plain' ? 'plain' : 'rich';
    if (bodyMode !== 'rich') return;
    const nextHtml = data[richConfig.htmlKey] || escapeEditorHtml(data[richConfig.textKey] || '').replace(/\n/g, '<br>');
    if (document.activeElement !== editor && editor.innerHTML !== nextHtml) {
      editor.innerHTML = nextHtml;
    }
  }, [
    selectedActivity?.id,
    selectedActivity?.type,
    selectedActivity?.data?.bodyMode,
    selectedActivity?.data?.bodyHtml,
    selectedActivity?.data?.body,
    selectedActivity?.data?.textMode,
    selectedActivity?.data?.textHtml,
    selectedActivity?.data?.text,
  ]);

  const composerPreviewSrcDoc = useMemo(() => {
    if (standaloneMode !== 'composer') return '';
    const courseSettings = projectData?.['Course Settings'] || {};
    const previewModule = {
      id: editForm.id || 'view-composer-preview',
      title: editForm.title || 'Composer Preview',
      type: 'standalone',
      mode: 'composer',
      composerLayout,
      activities,
      rawHtml: '',
      html: '',
      css: '',
      script: '',
    };
    return (
      buildModuleFrameHTML(previewModule, {
        ...courseSettings,
        __courseName: courseSettings.courseName || projectData?.['Current Course']?.name || 'Course',
        __toolkit: projectData?.['Global Toolkit'] || [],
        __materials: projectData?.['Current Course']?.materials || [],
      }) || ''
    );
  }, [activities, composerLayout, editForm.id, editForm.title, projectData, standaloneMode]);

  const updateActivities = (nextActivities, nextComposerLayout = composerLayout) => {
    const normalizedLayout = normalizeComposerLayout(nextComposerLayout);
    const normalizedActivities = normalizeComposerActivities(nextActivities, {
      maxColumns: normalizedLayout.maxColumns,
    });
    setEditForm({
      ...editForm,
      moduleMode: 'composer',
      composerLayout: normalizedLayout,
      activities: normalizedActivities,
    });
  };

  const updateComposerMaxColumns = (nextColumns) => {
    const normalizedLayout = normalizeComposerLayout({
      ...(editForm.composerLayout || {}),
      maxColumns: nextColumns,
    });
    const normalizedActivities = normalizeComposerActivities(activities, {
      maxColumns: normalizedLayout.maxColumns,
    });
    updateActivities(normalizedActivities, normalizedLayout);
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

  const clearPendingRichEditorUpdate = () => {
    if (!richEditorUpdateTimerRef.current) return;
    clearTimeout(richEditorUpdateTimerRef.current);
    richEditorUpdateTimerRef.current = null;
  };

  const getSelectedRichStyleResetPayload = () => {
    if (!selectedActivity) return null;
    const richConfig = getActivityRichEditorConfig(selectedActivity);
    if (!richConfig) return null;
    const data = selectedActivity.data || {};
    const bodyMode = data[richConfig.modeKey] === 'plain' ? 'plain' : 'rich';
    if (bodyMode !== 'rich') return null;
    const sourceHtml = data[richConfig.htmlKey] || escapeEditorHtml(data[richConfig.textKey] || '').replace(/\n/g, '<br>');
    const cleanedHtml = stripInlineRichFormatting(sourceHtml);
    const cleanedText = extractRichEditorText(cleanedHtml);
    return { richConfig, cleanedHtml, cleanedText };
  };

  const resetSelectedActivityBodyStyle = () => {
    if (!selectedActivity) return;
    const payload = getSelectedRichStyleResetPayload();
    const updates = { bodyContainerBg: '' };
    if (payload) {
      clearPendingRichEditorUpdate();
      if (richEditorRef.current) {
        richEditorRef.current.innerHTML = payload.cleanedHtml;
      }
      updates[payload.richConfig.modeKey] = 'rich';
      updates[payload.richConfig.htmlKey] = payload.cleanedHtml;
      updates[payload.richConfig.textKey] = payload.cleanedText;
    }
    updateSelectedActivityData(updates);
  };

  const resetSelectedActivityStyle = () => {
    if (!selectedActivity) return;
    const payload = getSelectedRichStyleResetPayload();
    const updates = {
      blockTheme: 'default',
      blockFontFamily: '',
      blockTextColor: '',
      blockContainerBg: '',
      bodyContainerBg: '',
    };
    if (payload) {
      clearPendingRichEditorUpdate();
      if (richEditorRef.current) {
        richEditorRef.current.innerHTML = payload.cleanedHtml;
      }
      updates[payload.richConfig.modeKey] = 'rich';
      updates[payload.richConfig.htmlKey] = payload.cleanedHtml;
      updates[payload.richConfig.textKey] = payload.cleanedText;
    }
    updateSelectedActivityData(updates);
  };

  const replaceSelectedActivityData = (nextData) => {
    if (!selectedActivity) return;
    const nextActivities = activities.map((activity, idx) =>
      idx === selectedActivityIndex
        ? {
            ...activity,
            data: nextData && typeof nextData === 'object' ? nextData : {},
          }
        : activity,
    );
    updateActivities(nextActivities);
  };

  const addActivity = () => {
    const activity = createActivity(newActivityType);
    if (!activity) return;
    const maxRow = composerGridModel.placements.reduce((largest, placement) => Math.max(largest, placement.row), 0);
    activity.layout = {
      ...(activity.layout || {}),
      colSpan: clampComposerColSpan(activity?.layout?.colSpan, composerMaxColumns),
      row: Math.max(1, maxRow + 1),
      col: 1,
    };
    const nextActivities = [...activities, activity];
    updateActivities(nextActivities);
    setSelectedActivityIndex(nextActivities.length - 1);
  };

  const addEmptyRow = () => {
    setComposerExtraRows((count) => Math.min(50, count + 1));
  };

  const removeSelectedActivity = () => {
    if (!selectedActivity) return;
    const nextActivities = activities.filter((_, idx) => idx !== selectedActivityIndex);
    updateActivities(nextActivities);
  };

  const moveSelectedActivity = (direction) => {
    if (!selectedActivity || !selectedPlacement) return;
    const colSpan = clampComposerColSpan(selectedActivity?.layout?.colSpan, composerMaxColumns);
    const maxStartCol = Math.max(1, composerMaxColumns - colSpan + 1);
    let targetRow = selectedPlacement.row;
    let targetCol = selectedPlacement.col;

    if (direction === 'left') targetCol = Math.max(1, targetCol - 1);
    if (direction === 'right') targetCol = Math.min(maxStartCol, targetCol + 1);
    if (direction === 'up') targetRow = Math.max(1, targetRow - 1);
    if (direction === 'down') targetRow += 1;

    const result = moveComposerActivityToCell(activities, selectedActivityIndex, targetRow, targetCol, {
      maxColumns: composerMaxColumns,
    });
    if (!result.changed) return;
    updateActivities(result.activities);
    setSelectedActivityIndex(selectedActivityIndex);
  };

  const moveActivityToCell = (fromIndex, targetRow, targetCol) => {
    if (!Number.isInteger(fromIndex) || !Number.isInteger(targetRow) || !Number.isInteger(targetCol)) return;
    const result = moveComposerActivityToCell(activities, fromIndex, targetRow, targetCol, {
      maxColumns: composerMaxColumns,
    });
    if (!result.changed) return;
    updateActivities(result.activities);
    setSelectedActivityIndex(fromIndex);
  };

  const duplicateSelectedActivity = () => {
    if (!selectedActivity) return;
    const basePlacement = selectedPlacement || { row: 1, col: 1 };
    const duplicate = {
      ...selectedActivity,
      id: `activity-${Date.now()}`,
      data: {
        ...(selectedActivity.data || {}),
      },
      layout: {
        ...(selectedActivity.layout || {}),
        row: basePlacement.row + 1,
        col: basePlacement.col,
      },
    };
    const nextActivities = [...activities];
    nextActivities.push(duplicate);
    updateActivities(nextActivities);
    setSelectedActivityIndex(nextActivities.length - 1);
  };

  const updateSelectedActivitySpan = (nextSpan) => {
    if (!selectedActivity) return;
    const clamped = clampComposerColSpan(nextSpan, composerMaxColumns);
    const nextActivities = activities.map((activity, idx) =>
      idx === selectedActivityIndex
        ? {
            ...activity,
            layout: {
              ...(activity.layout || {}),
              colSpan: clamped,
            },
          }
        : activity,
    );
    updateActivities(nextActivities);
  };

  const setStandaloneMode = (mode) => {
    const normalizedLayout = normalizeComposerLayout(editForm.composerLayout);
    const normalizedActivities = normalizeComposerActivities(editForm.activities, {
      maxColumns: normalizedLayout.maxColumns,
    });
    setEditForm({
      ...editForm,
      moduleMode: mode,
      composerLayout: normalizedLayout,
      activities: normalizedActivities,
    });
  };

  const queueRichEditorUpdate = (html, text, immediate = false) => {
    const richConfig = getActivityRichEditorConfig(selectedActivity);
    if (!richConfig) return;
    if (richEditorUpdateTimerRef.current) {
      clearTimeout(richEditorUpdateTimerRef.current);
      richEditorUpdateTimerRef.current = null;
    }
    const applyUpdate = () => {
      updateSelectedActivityData({
        [richConfig.modeKey]: 'rich',
        [richConfig.htmlKey]: html,
        [richConfig.textKey]: text,
      });
    };
    if (immediate) {
      applyUpdate();
      return;
    }
    richEditorUpdateTimerRef.current = setTimeout(() => {
      richEditorUpdateTimerRef.current = null;
      applyUpdate();
    }, 140);
  };

  const captureRichSelection = () => {
    const editor = richEditorRef.current;
    const selection = typeof window !== 'undefined' && window.getSelection ? window.getSelection() : null;
    if (!editor || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    richEditorSelectionRef.current = range.cloneRange();
  };

  const restoreRichSelection = () => {
    const range = richEditorSelectionRef.current;
    const selection = typeof window !== 'undefined' && window.getSelection ? window.getSelection() : null;
    if (!range || !selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const runRichEditorCommand = (command, value = null) => {
    if (!richEditorRef.current) return;
    richEditorRef.current.focus();
    restoreRichSelection();
    if (command === 'fontSize' || command === 'fontName' || command === 'foreColor' || command === 'hiliteColor' || command === 'backColor') {
      try {
        document.execCommand('styleWithCSS', false, true);
      } catch {
        // Ignore browser differences in execCommand support.
      }
    }
    const normalizedValue =
      command === 'formatBlock' && typeof value === 'string'
        ? value.replace(/[<>]/g, '').toUpperCase()
        : value;
    const didExecute = document.execCommand(command, false, normalizedValue);
    if (!didExecute && command === 'hiliteColor') {
      document.execCommand('backColor', false, normalizedValue);
    }
    if (!didExecute && command === 'insertUnorderedList') {
      document.execCommand('insertHTML', false, '<ul><li>List item</li></ul>');
    }
    if (!didExecute && command === 'insertOrderedList') {
      document.execCommand('insertHTML', false, '<ol><li>List item</li></ol>');
    }
    const html = richEditorRef.current.innerHTML || '';
    const text = richEditorRef.current.innerText || '';
    captureRichSelection();
    queueRichEditorUpdate(html, text, true);
  };

  const preserveRichSelection = (event) => {
    event.preventDefault();
  };

  const renderSelectedActivityStylePanel = () => {
    if (!selectedActivity) return null;
    const data = selectedActivity.data || {};
    const themeValue = normalizeThemeValue(data.blockTheme);
    const themePreview = getThemePreviewColors(themeValue);
    const effectiveFill =
      data.blockContainerBg ||
      data.containerBg ||
      (selectedActivity.type === 'title_block' ? '#1e1b4b' : themePreview.containerBg || '#0f172a');
    const effectiveTextColor = data.blockTextColor || themePreview.textColor || '#e2e8f0';
    return (
      <div className="mb-3 rounded-lg border border-slate-700 bg-slate-900/60 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-300">Block Style</p>
          <button
            type="button"
            onClick={resetSelectedActivityStyle}
            className="rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-200"
            title="Reset block and body styles to defaults"
          >
            Reset Style
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Theme</label>
            <select
              value={themeValue}
              onChange={(e) => updateSelectedActivityData({ blockTheme: e.target.value })}
              className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-white"
            >
              {BLOCK_THEME_OPTIONS.map((themeOption) => (
                <option key={`modal-block-theme-${themeOption.value}`} value={themeOption.value}>
                  {themeOption.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Font Family</label>
            <select
              value={data.blockFontFamily || ''}
              onChange={(e) => updateSelectedActivityData({ blockFontFamily: e.target.value })}
              className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-white"
            >
              <option value="">Default</option>
              {RICH_EDITOR_FONT_OPTIONS.map((fontOption) => (
                <option key={`modal-block-font-${fontOption.value}`} value={fontOption.value} style={{ fontFamily: fontOption.value }}>
                  {fontOption.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center justify-between rounded bg-slate-950 border border-slate-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-300">
            <span>Text Color</span>
            <input
              type="color"
              value={normalizeColorInputValue(effectiveTextColor, '#e2e8f0')}
              onChange={(e) => updateSelectedActivityData({ blockTextColor: e.target.value })}
              className="h-6 w-10 cursor-pointer border border-slate-600 rounded bg-transparent"
              title="Block text color"
              aria-label="Block text color"
            />
          </label>
          <label className="flex items-center justify-between rounded bg-slate-950 border border-slate-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-300">
            <span>Container Fill</span>
            <input
              type="color"
              value={normalizeColorInputValue(effectiveFill, '#0f172a')}
              onChange={(e) => updateSelectedActivityData({ blockContainerBg: e.target.value })}
              className="h-6 w-10 cursor-pointer border border-slate-600 rounded bg-transparent"
              title="Block container background color"
              aria-label="Block container background color"
            />
          </label>
        </div>
        <p className="text-[10px] text-slate-500">
          Theme sets block defaults. Rich text inline formatting still overrides theme styles.
        </p>
      </div>
    );
  };

  const renderActivityEditor = () => {
    if (!selectedActivity) {
      return <p className="text-xs text-slate-500">Select an activity to edit.</p>;
    }

    const data = selectedActivity.data || {};
    if (selectedActivity.type === 'content_block' || selectedActivity.type === 'title_block') {
      const richConfig = getActivityRichEditorConfig(selectedActivity);
      if (!richConfig) return null;
      const bodyMode = data[richConfig.modeKey] === 'plain' ? 'plain' : 'rich';
      return (
        <div className="space-y-3">
          {richConfig.titleInputKey ? (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{richConfig.titleInputLabel}</label>
              <input
                type="text"
                value={data[richConfig.titleInputKey] || ''}
                onChange={(e) => updateSelectedActivityData({ [richConfig.titleInputKey]: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
              />
            </div>
          ) : null}
          {selectedActivity.type === 'title_block' ? (
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <label className="block text-xs font-bold text-slate-300 mb-1">Alignment</label>
                <select
                  value={data.align || 'left'}
                  onChange={(e) => updateSelectedActivityData({ align: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div className="col-span-6 text-[11px] text-slate-500 self-end pb-1">
                Use heading styles + font, text color, and container fill controls for strong hero text.
              </div>
            </div>
          ) : null}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-300">{richConfig.plainLabel}</label>
              <div className="inline-flex bg-slate-950 border border-slate-700 rounded p-0.5">
                <button
                  type="button"
                  onClick={() => updateSelectedActivityData({ [richConfig.modeKey]: 'rich' })}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${bodyMode === 'rich' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Rich
                </button>
                <button
                  type="button"
                  onClick={() => updateSelectedActivityData({ [richConfig.modeKey]: 'plain' })}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${bodyMode === 'plain' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Plain
                </button>
              </div>
            </div>
            {bodyMode === 'plain' ? (
              <textarea
                value={data[richConfig.textKey] || ''}
                onChange={(e) =>
                  updateSelectedActivityData({
                    [richConfig.modeKey]: 'plain',
                    [richConfig.textKey]: e.target.value,
                  })
                }
                className={`w-full ${richConfig.plainRowsClass} bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm`}
              />
            ) : (
              <div className="rounded border border-slate-700 bg-slate-950 overflow-hidden">
                <div className="flex flex-wrap gap-1 p-2 border-b border-slate-700 bg-slate-900/80">
                  <button type="button" onMouseDown={preserveRichSelection} onClick={() => runRichEditorCommand('bold')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold">B</button>
                  <button type="button" onMouseDown={preserveRichSelection} onClick={() => runRichEditorCommand('italic')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs italic">I</button>
                  <button type="button" onMouseDown={preserveRichSelection} onClick={() => runRichEditorCommand('underline')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs underline">U</button>
                  <button type="button" onMouseDown={preserveRichSelection} onClick={() => runRichEditorCommand('formatBlock', 'P')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs">P</button>
                  <button type="button" onMouseDown={preserveRichSelection} onClick={() => runRichEditorCommand('formatBlock', 'H2')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold">H2</button>
                  <button type="button" onMouseDown={preserveRichSelection} onClick={() => runRichEditorCommand('formatBlock', 'H3')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold">H3</button>
                  <button type="button" onMouseDown={preserveRichSelection} onClick={() => runRichEditorCommand('fontSize', '2')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs">A-</button>
                  <button type="button" onMouseDown={preserveRichSelection} onClick={() => runRichEditorCommand('fontSize', '3')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs">A</button>
                  <button type="button" onMouseDown={preserveRichSelection} onClick={() => runRichEditorCommand('fontSize', '5')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs">A+</button>
                  <button type="button" onMouseDown={preserveRichSelection} onClick={() => runRichEditorCommand('insertUnorderedList')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs">• List</button>
                  <button type="button" onMouseDown={preserveRichSelection} onClick={() => runRichEditorCommand('insertOrderedList')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs">1. List</button>
                  <button
                    type="button"
                    onMouseDown={preserveRichSelection}
                    onClick={() => {
                      const url = window.prompt('Enter URL');
                      if (!url) return;
                      runRichEditorCommand('createLink', url);
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs"
                  >
                    Link
                  </button>
                  <button type="button" onMouseDown={preserveRichSelection} onClick={() => runRichEditorCommand('removeFormat')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs">Clear</button>
                </div>
                <div className="px-2 pb-2 bg-slate-900/80 border-b border-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        const font = e.target.value;
                        if (!font) return;
                        runRichEditorCommand('fontName', font);
                      }}
                      className="w-full rounded bg-slate-800 border border-slate-700 px-2 py-1 text-[11px] text-white"
                      aria-label="Font family"
                    >
                      <option value="">Font Family</option>
                      {RICH_EDITOR_FONT_OPTIONS.map((fontOption) => (
                        <option key={`editor-font-${fontOption.value}`} value={fontOption.value} style={{ fontFamily: fontOption.value }}>
                          {fontOption.label}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center justify-between rounded bg-slate-800 border border-slate-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                      <span>Text Color</span>
                      <input
                        type="color"
                        defaultValue="#e2e8f0"
                        onChange={(e) => runRichEditorCommand('foreColor', e.target.value)}
                        className="h-6 w-10 cursor-pointer border border-slate-600 rounded bg-transparent"
                        title="Set text color"
                        aria-label="Set text color"
                      />
                    </label>
                    <label className="flex items-center justify-between rounded bg-slate-800 border border-slate-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                      <span>Container Fill</span>
                      <input
                        type="color"
                        value={normalizeColorInputValue(
                          data.bodyContainerBg || data.blockContainerBg || data.containerBg,
                          selectedActivity.type === 'title_block' ? '#1e1b4b' : '#0f172a',
                        )}
                        onChange={(e) => updateSelectedActivityData({ bodyContainerBg: e.target.value })}
                        className="h-6 w-10 cursor-pointer border border-slate-600 rounded bg-transparent"
                        title="Set body container background color override"
                        aria-label="Set body container background color override"
                      />
                    </label>
                    <button
                      type="button"
                      onMouseDown={preserveRichSelection}
                      onClick={resetSelectedActivityBodyStyle}
                      className="rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-200"
                      title="Reset body style overrides"
                    >
                      Reset Body Style
                    </button>
                  </div>
                </div>
                <div
                  ref={richEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(event) => {
                    const html = event.currentTarget.innerHTML || '';
                    const text = event.currentTarget.innerText || '';
                    captureRichSelection();
                    queueRichEditorUpdate(html, text);
                  }}
                  onMouseUp={captureRichSelection}
                  onKeyUp={captureRichSelection}
                  onBlur={(event) => {
                    const html = event.currentTarget.innerHTML || '';
                    const text = event.currentTarget.innerText || '';
                    captureRichSelection();
                    queueRichEditorUpdate(html, text, true);
                  }}
                  className="cf-rich-editor min-h-[180px] p-3 text-sm text-white outline-none"
                />
              </div>
            )}
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
                  className="col-span-3 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={item?.viewUrl || item?.url || ''}
                  onChange={(e) => {
                    const nextItems = [...items];
                    nextItems[idx] = { ...(nextItems[idx] || {}), viewUrl: e.target.value };
                    updateSelectedActivityData({ items: nextItems });
                  }}
                  className="col-span-4 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                  placeholder="View URL"
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
                <input
                  type="text"
                  value={item?.downloadUrl || item?.url || ''}
                  onChange={(e) => {
                    const nextItems = [...items];
                    nextItems[idx] = { ...(nextItems[idx] || {}), downloadUrl: e.target.value };
                    updateSelectedActivityData({ items: nextItems });
                  }}
                  className="col-span-6 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                  placeholder="Download URL"
                />
                <input
                  type="text"
                  value={item?.description || ''}
                  onChange={(e) => {
                    const nextItems = [...items];
                    nextItems[idx] = { ...(nextItems[idx] || {}), description: e.target.value };
                    updateSelectedActivityData({ items: nextItems });
                  }}
                  className="col-span-6 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                  placeholder="Optional description"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateSelectedActivityData({ items: [...items, { label: '', viewUrl: '', downloadUrl: '', description: '' }] })}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white font-bold inline-flex items-center gap-1"
            >
              <Plus size={12} /> Add Resource
            </button>
            <div className="pt-3 border-t border-slate-700">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Add From Module Bank</label>
              <div className="grid grid-cols-12 gap-2">
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="col-span-9 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                >
                  {moduleBankMaterials.length === 0 && <option value="">No stored materials</option>}
                  {moduleBankMaterials.map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.title || mat.number || mat.id}
                    </option>
                  ))}
                </select>
            <button
              type="button"
              onClick={() => {
                const selected = moduleBankMaterials.find((mat) => mat.id === selectedMaterialId);
                if (!selected) return;
                const viewUrl = selected.viewUrl || selected.downloadUrl || '';
                const downloadUrl = selected.downloadUrl || selected.viewUrl || '';
                const nextItems = [
                  ...items,
                  {
                    label: selected.title || selected.number || selected.id,
                    viewUrl,
                    downloadUrl,
                    description: selected.description || '',
                    digitalContent: selected.digitalContent || null,
                  },
                ];
                updateSelectedActivityData({ items: nextItems });
              }}
                  disabled={!selectedMaterialId || moduleBankMaterials.length === 0}
                  className="col-span-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded text-xs font-bold text-white"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedActivity.type === 'knowledge_check') {
      const questions = normalizeKnowledgeCheckBuilderQuestions(data);
      const moveKnowledgeQuestion = (fromIndex, toIndex) => {
        const nextQuestions = reorderByIndex(questions, fromIndex, toIndex);
        updateSelectedActivityData({ questions: nextQuestions });
      };
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Block Title</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateSelectedActivityData({ title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
              placeholder="Knowledge Check"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Questions</label>
            <div className="space-y-2">
              {questions.map((question, qIdx) => {
                const isDropTarget = dragOverKnowledgeQuestionIndex === qIdx && draggingKnowledgeQuestionIndex !== null && qIdx !== draggingKnowledgeQuestionIndex;
                const options = Array.isArray(question.options) ? question.options : [];
                const isShortAnswer = question.type === 'short_answer';
                return (
                  <div
                    key={`kc-question-${qIdx}`}
                    draggable
                    onDragStart={(event) => {
                      setDraggingKnowledgeQuestionIndex(qIdx);
                      if (event.dataTransfer) {
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', String(qIdx));
                      }
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
                      if (dragOverKnowledgeQuestionIndex !== qIdx) setDragOverKnowledgeQuestionIndex(qIdx);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const fallback = Number.parseInt(event.dataTransfer?.getData('text/plain') || '', 10);
                      const fromIndex = Number.isInteger(draggingKnowledgeQuestionIndex) ? draggingKnowledgeQuestionIndex : fallback;
                      moveKnowledgeQuestion(fromIndex, qIdx);
                      setDraggingKnowledgeQuestionIndex(null);
                      setDragOverKnowledgeQuestionIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggingKnowledgeQuestionIndex(null);
                      setDragOverKnowledgeQuestionIndex(null);
                    }}
                    className={`space-y-2 rounded border p-3 ${isDropTarget ? 'border-indigo-500 bg-indigo-500/15' : 'border-slate-700 bg-slate-900/70'}`}
                  >
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <p className="col-span-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">Question {qIdx + 1}</p>
                      <select
                        value={isShortAnswer ? 'short_answer' : 'multiple_choice'}
                        onChange={(e) => {
                          const nextType = e.target.value === 'short_answer' ? 'short_answer' : 'multiple_choice';
                          const nextQuestions = questions.map((item, idx) => {
                            if (idx !== qIdx) return item;
                            if (nextType === 'short_answer') {
                              return {
                                type: 'short_answer',
                                prompt: item.prompt == null ? '' : String(item.prompt),
                                placeholder: item.placeholder == null ? '' : String(item.placeholder),
                              };
                            }
                            return {
                              type: 'multiple_choice',
                              prompt: item.prompt == null ? '' : String(item.prompt),
                              options: ['Option A', 'Option B', 'Option C'],
                              correctIndex: 0,
                            };
                          });
                          updateSelectedActivityData({ questions: nextQuestions });
                        }}
                        className="col-span-4 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => moveKnowledgeQuestion(qIdx, Math.max(0, qIdx - 1))}
                        disabled={qIdx === 0}
                        className="col-span-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded p-2 flex items-center justify-center"
                        title="Move up"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveKnowledgeQuestion(qIdx, Math.min(questions.length - 1, qIdx + 1))}
                        disabled={qIdx >= questions.length - 1}
                        className="col-span-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded p-2 flex items-center justify-center"
                        title="Move down"
                      >
                        <ChevronDown size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSelectedActivityData({ questions: questions.filter((_, idx) => idx !== qIdx) })}
                        className="col-span-2 bg-rose-600 hover:bg-rose-500 text-white rounded p-2 text-xs"
                        title="Delete question"
                      >
                        Delete
                      </button>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Prompt</label>
                      <textarea
                        value={question.prompt || ''}
                        onChange={(e) => {
                          const nextQuestions = questions.map((item, idx) => (idx === qIdx ? { ...item, prompt: e.target.value } : item));
                          updateSelectedActivityData({ questions: nextQuestions });
                        }}
                        className="w-full h-20 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                      />
                    </div>
                    {isShortAnswer ? (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Placeholder</label>
                        <input
                          type="text"
                          value={question.placeholder || ''}
                          onChange={(e) => {
                            const nextQuestions = questions.map((item, idx) => (idx === qIdx ? { ...item, placeholder: e.target.value } : item));
                            updateSelectedActivityData({ questions: nextQuestions });
                          }}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                          placeholder="Write your response..."
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Options</label>
                        {options.map((option, optionIdx) => (
                          <div key={`kc-question-${qIdx}-option-${optionIdx}`} className="grid grid-cols-12 gap-2">
                            <input
                              type="text"
                              value={option || ''}
                              onChange={(e) => {
                                const nextQuestions = questions.map((item, idx) => {
                                  if (idx !== qIdx) return item;
                                  const nextOptions = [...(Array.isArray(item.options) ? item.options : [])];
                                  nextOptions[optionIdx] = e.target.value;
                                  return { ...item, options: nextOptions };
                                });
                                updateSelectedActivityData({ questions: nextQuestions });
                              }}
                              className="col-span-10 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                            />
                            <input
                              type="radio"
                              name={`kc-correct-${qIdx}`}
                              checked={(question.correctIndex || 0) === optionIdx}
                              onChange={() => {
                                const nextQuestions = questions.map((item, idx) =>
                                  idx === qIdx ? { ...item, correctIndex: optionIdx } : item,
                                );
                                updateSelectedActivityData({ questions: nextQuestions });
                              }}
                              className="col-span-1 self-center"
                              title="Correct answer"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const nextQuestions = questions.map((item, idx) => {
                                  if (idx !== qIdx) return item;
                                  const nextOptions = (Array.isArray(item.options) ? item.options : []).filter((_, itemIdx) => itemIdx !== optionIdx);
                                  return {
                                    ...item,
                                    options: nextOptions,
                                    correctIndex: Math.max(0, Math.min(item.correctIndex || 0, Math.max(nextOptions.length - 1, 0))),
                                  };
                                });
                                updateSelectedActivityData({ questions: nextQuestions });
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
                          onClick={() => {
                            const nextQuestions = questions.map((item, idx) =>
                              idx === qIdx ? { ...item, options: [...(Array.isArray(item.options) ? item.options : []), ''] } : item,
                            );
                            updateSelectedActivityData({ questions: nextQuestions });
                          }}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white font-bold inline-flex items-center gap-1"
                        >
                          <Plus size={12} /> Add Option
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {questions.length === 0 && <p className="text-xs text-slate-500">No questions yet. Add one below.</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateSelectedActivityData({ questions: [...questions, createKnowledgeCheckBuilderQuestion('multiple_choice')] })}
              className="px-3 py-1.5 bg-sky-700 hover:bg-sky-600 rounded text-xs text-white font-bold inline-flex items-center gap-1"
            >
              <Plus size={12} /> Add Multiple Choice
            </button>
            <button
              type="button"
              onClick={() => updateSelectedActivityData({ questions: [...questions, createKnowledgeCheckBuilderQuestion('short_answer')] })}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-xs text-white font-bold inline-flex items-center gap-1"
            >
              <Plus size={12} /> Add Short Answer
            </button>
          </div>
        </div>
      );
    }

    if (selectedActivity.type === 'worksheet_form') {
      const blocks = normalizeWorksheetBuilderBlocks(data);
      const moveWorksheetBlock = (fromIndex, toIndex) => {
        const nextBlocks = reorderByIndex(blocks, fromIndex, toIndex);
        updateSelectedActivityData({ blocks: nextBlocks });
      };
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Worksheet Header (Optional)</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateSelectedActivityData({ title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
              placeholder="Worksheet"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Worksheet Blocks</label>
            <div className="space-y-2">
              {blocks.map((block, blockIdx) => {
                const isDropTarget = dragOverWorksheetBlockIndex === blockIdx && draggingWorksheetBlockIndex !== null && blockIdx !== draggingWorksheetBlockIndex;
                const isTitle = block.kind === 'title';
                return (
                  <div
                    key={`worksheet-block-${blockIdx}`}
                    draggable
                    onDragStart={(event) => {
                      setDraggingWorksheetBlockIndex(blockIdx);
                      if (event.dataTransfer) {
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', String(blockIdx));
                      }
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
                      if (dragOverWorksheetBlockIndex !== blockIdx) setDragOverWorksheetBlockIndex(blockIdx);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const fallback = Number.parseInt(event.dataTransfer?.getData('text/plain') || '', 10);
                      const fromIndex = Number.isInteger(draggingWorksheetBlockIndex) ? draggingWorksheetBlockIndex : fallback;
                      moveWorksheetBlock(fromIndex, blockIdx);
                      setDraggingWorksheetBlockIndex(null);
                      setDragOverWorksheetBlockIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggingWorksheetBlockIndex(null);
                      setDragOverWorksheetBlockIndex(null);
                    }}
                    className={`space-y-2 rounded border p-3 ${isDropTarget ? 'border-indigo-500 bg-indigo-500/15' : 'border-slate-700 bg-slate-900/70'}`}
                  >
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <p className="col-span-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">Block {blockIdx + 1}</p>
                      <select
                        value={isTitle ? 'title' : 'field'}
                        onChange={(e) => {
                          const nextKind = e.target.value === 'title' ? 'title' : 'field';
                          const nextBlocks = blocks.map((item, idx) => {
                            if (idx !== blockIdx) return item;
                            if (nextKind === 'title') {
                              return {
                                ...createWorksheetBuilderBlock('title'),
                                title: item.kind === 'title' ? item.title : item.label || 'Section Title',
                              };
                            }
                            return {
                              ...createWorksheetBuilderBlock('field'),
                              label: item.kind === 'field' ? item.label : item.title || 'Field Label',
                            };
                          });
                          updateSelectedActivityData({ blocks: nextBlocks });
                        }}
                        className="col-span-4 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                      >
                        <option value="field">Field</option>
                        <option value="title">Title + Instructions</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => moveWorksheetBlock(blockIdx, Math.max(0, blockIdx - 1))}
                        disabled={blockIdx === 0}
                        className="col-span-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded p-2 flex items-center justify-center"
                        title="Move up"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveWorksheetBlock(blockIdx, Math.min(blocks.length - 1, blockIdx + 1))}
                        disabled={blockIdx >= blocks.length - 1}
                        className="col-span-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded p-2 flex items-center justify-center"
                        title="Move down"
                      >
                        <ChevronDown size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSelectedActivityData({ blocks: blocks.filter((_, idx) => idx !== blockIdx) })}
                        className="col-span-2 bg-rose-600 hover:bg-rose-500 text-white rounded p-2 text-xs"
                        title="Delete block"
                      >
                        Delete
                      </button>
                    </div>
                    {isTitle ? (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Title Text</label>
                          <input
                            type="text"
                            value={block.title || ''}
                            onChange={(e) => {
                              const nextBlocks = blocks.map((item, idx) => (idx === blockIdx ? { ...item, title: e.target.value } : item));
                              updateSelectedActivityData({ blocks: nextBlocks });
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                            placeholder="Section title"
                          />
                        </div>
                        <label className="inline-flex items-center gap-2 text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={Boolean(block.showContent)}
                            onChange={(e) => {
                              const nextBlocks = blocks.map((item, idx) => (idx === blockIdx ? { ...item, showContent: e.target.checked } : item));
                              updateSelectedActivityData({ blocks: nextBlocks });
                            }}
                            className="w-4 h-4"
                          />
                          Show instructions under title
                        </label>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Instruction Content</label>
                          <textarea
                            value={block.content || ''}
                            onChange={(e) => {
                              const nextBlocks = blocks.map((item, idx) => (idx === blockIdx ? { ...item, content: e.target.value } : item));
                              updateSelectedActivityData({ blocks: nextBlocks });
                            }}
                            className="w-full h-20 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs disabled:opacity-50"
                            placeholder="Add instructions or context for this section."
                            disabled={!block.showContent}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-5">
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Field Label</label>
                          <input
                            type="text"
                            value={block.label || ''}
                            onChange={(e) => {
                              const nextBlocks = blocks.map((item, idx) => (idx === blockIdx ? { ...item, label: e.target.value } : item));
                              updateSelectedActivityData({ blocks: nextBlocks });
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                            placeholder="Field label"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Input Type</label>
                          <select
                            value={block.fieldType || 'text'}
                            onChange={(e) => {
                              const nextBlocks = blocks.map((item, idx) =>
                                idx === blockIdx ? { ...item, fieldType: e.target.value || 'text' } : item,
                              );
                              updateSelectedActivityData({ blocks: nextBlocks });
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                          >
                            <option value="text">Text</option>
                            <option value="textarea">Textarea</option>
                            <option value="number">Number</option>
                          </select>
                        </div>
                        <div className="col-span-4">
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Placeholder</label>
                          <input
                            type="text"
                            value={block.placeholder || ''}
                            onChange={(e) => {
                              const nextBlocks = blocks.map((item, idx) => (idx === blockIdx ? { ...item, placeholder: e.target.value } : item));
                              updateSelectedActivityData({ blocks: nextBlocks });
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                            placeholder="Optional placeholder"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {blocks.length === 0 && <p className="text-xs text-slate-500">No blocks yet. Add a title or field below.</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateSelectedActivityData({ blocks: [...blocks, createWorksheetBuilderBlock('title')] })}
              className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 rounded text-xs text-white font-bold inline-flex items-center gap-1"
            >
              <Plus size={12} /> Add Title Block
            </button>
            <button
              type="button"
              onClick={() => updateSelectedActivityData({ blocks: [...blocks, createWorksheetBuilderBlock('field')] })}
              className="px-3 py-1.5 bg-sky-700 hover:bg-sky-600 rounded text-xs text-white font-bold inline-flex items-center gap-1"
            >
              <Plus size={12} /> Add Field
            </button>
          </div>
        </div>
      );
    }

    if (selectedActivity.type === 'image_block') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Image URL</label>
            <input
              type="text"
              value={data.url || ''}
              onChange={(e) => updateSelectedActivityData({ url: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
              placeholder="https://... or /assets/image.jpg"
            />
            <div className="grid grid-cols-12 gap-2 mt-2">
              <select
                value={selectedImageMaterialId}
                onChange={(e) => setSelectedImageMaterialId(e.target.value)}
                className="col-span-10 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
              >
                {moduleBankImageAssets.length === 0 && <option value="">No image materials found</option>}
                {moduleBankImageAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const selected = moduleBankImageAssets.find((asset) => asset.id === selectedImageMaterialId);
                  if (!selected) return;
                  updateSelectedActivityData({
                    url: selected.url,
                    alt: data.alt || selected.alt || '',
                  });
                }}
                disabled={!selectedImageMaterialId || moduleBankImageAssets.length === 0}
                className="col-span-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-bold text-white"
              >
                Use
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Use local `/materials/...` image paths for offline-ready modules.
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Alt Text</label>
            <input
              type="text"
              value={data.alt || ''}
              onChange={(e) => updateSelectedActivityData({ alt: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
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
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Display Width</label>
            <select
              value={data.width || 'full'}
              onChange={(e) => updateSelectedActivityData({ width: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            >
              <option value="full">Full width</option>
              <option value="wide">Wide</option>
              <option value="medium">Medium</option>
              <option value="small">Small</option>
            </select>
          </div>
        </div>
      );
    }

    if (selectedActivity.type === 'hotspot_image') {
      return <HotspotEditor data={data} onChange={updateSelectedActivityData} />;
    }

    if (selectedActivity.type === 'assessment_embed') {
      const items = Array.isArray(data.items) ? data.items : [];
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Block Title</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateSelectedActivityData({ title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={`assessment-item-${item.id || idx}`} className="flex items-center justify-between gap-2 rounded border border-slate-700 bg-slate-900 p-2">
                <div>
                  <p className="text-xs font-bold text-white">{item.title || item.id || `Assessment ${idx + 1}`}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{item.id || 'no-id'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateSelectedActivityData({ items: items.filter((_, itemIdx) => itemIdx !== idx) })}
                  className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs"
                  title="Remove assessment"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {items.length === 0 && <p className="text-xs text-slate-500">No assessments linked yet.</p>}
          </div>
          <div className="grid grid-cols-12 gap-2">
            <select
              value={selectedAssessmentId}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
              className="col-span-9 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
            >
              {availableAssessments.length === 0 && <option value="">No saved assessments</option>}
              {availableAssessments.map((assessment) => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.title || assessment.id}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                const selected = availableAssessments.find((assessment) => assessment.id === selectedAssessmentId);
                if (!selected) return;
                if (items.some((item) => item.id === selected.id)) return;
                const nextItems = [
                  ...items,
                  {
                    id: selected.id,
                    title: selected.title || selected.id,
                    html: selected.html || '',
                    script: selected.script || '',
                  },
                ];
                updateSelectedActivityData({ items: nextItems });
              }}
              disabled={!selectedAssessmentId || availableAssessments.length === 0}
              className="col-span-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded text-xs font-bold text-white"
            >
              Add
            </button>
          </div>
        </div>
      );
    }

    if (selectedActivity.type === 'rubric_creator') {
      const rubric = normalizeRubricData(data);
      const rows = rubric.rows;
      const columns = rubric.columns;
      const cells = rubric.cells;
      const rowCount = rubric.rowCount;
      const colCount = rubric.colCount;

      const applyRubricShape = (nextRowCount, nextColCount) => {
        const normalized = normalizeRubricData(data, nextRowCount, nextColCount);
        updateSelectedActivityData({
          rowCount: normalized.rowCount,
          colCount: normalized.colCount,
          rows: normalized.rows,
          columns: normalized.columns,
          cells: normalized.cells,
        });
      };

      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Rubric Title</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateSelectedActivityData({ title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Instructions</label>
            <textarea
              value={data.instructions || ''}
              onChange={(e) => updateSelectedActivityData({ instructions: e.target.value })}
              className="w-full h-20 bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3">
              <label className="block text-xs font-bold text-slate-300 mb-1">Rows</label>
              <select
                value={rowCount}
                onChange={(e) => applyRubricShape(Number.parseInt(e.target.value, 10), colCount)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
              >
                {[2, 3, 4, 5].map((count) => (
                  <option key={`rubric-row-count-${count}`} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-bold text-slate-300 mb-1">Columns</label>
              <select
                value={colCount}
                onChange={(e) => applyRubricShape(rowCount, Number.parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
              >
                {[2, 3, 4, 5].map((count) => (
                  <option key={`rubric-col-count-${count}`} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-6 flex items-end">
              <label className="inline-flex items-center gap-2 rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={rubric.selfScoringEnabled}
                  onChange={(e) => updateSelectedActivityData({ selfScoringEnabled: e.target.checked })}
                  className="w-4 h-4"
                />
                Enable self scoring
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Total Label</label>
            <input
              type="text"
              value={data.totalLabel || 'Self Score Total'}
              onChange={(e) => updateSelectedActivityData({ totalLabel: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
              disabled={!rubric.selfScoringEnabled}
            />
          </div>
          <div className="space-y-2 rounded border border-slate-700 bg-slate-950/50 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Columns (Label + Score)</p>
            {columns.map((column, colIdx) => (
              <div key={`rubric-column-${colIdx}`} className="grid grid-cols-12 gap-2">
                <input
                  type="text"
                  value={column.label}
                  onChange={(e) => {
                    const nextColumns = columns.map((item, idx) => (idx === colIdx ? { ...item, label: e.target.value } : item));
                    updateSelectedActivityData({ rowCount, colCount, rows, columns: nextColumns, cells });
                  }}
                  className="col-span-8 bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                  placeholder={`Column ${colIdx + 1} label`}
                />
                <input
                  type="number"
                  step="0.5"
                  value={Number.isFinite(Number(column.score)) ? column.score : 0}
                  onChange={(e) => {
                    const parsed = Number.parseFloat(e.target.value);
                    const nextColumns = columns.map((item, idx) =>
                      idx === colIdx ? { ...item, score: Number.isFinite(parsed) ? parsed : 0 } : item,
                    );
                    updateSelectedActivityData({ rowCount, colCount, rows, columns: nextColumns, cells });
                  }}
                  className="col-span-4 bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                  placeholder="Score"
                  title="Column score value"
                />
              </div>
            ))}
          </div>
          <div className="space-y-2 rounded border border-slate-700 bg-slate-950/50 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Row Labels</p>
            {rows.map((row, rowIdx) => (
              <input
                key={`rubric-row-${rowIdx}`}
                type="text"
                value={row.label}
                onChange={(e) => {
                  const nextRows = rows.map((item, idx) => (idx === rowIdx ? { ...item, label: e.target.value } : item));
                  updateSelectedActivityData({ rowCount, colCount, rows: nextRows, columns, cells });
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                placeholder={`Criterion ${rowIdx + 1}`}
              />
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Cell Descriptions</p>
            <div className="overflow-x-auto rounded border border-slate-700">
              <table className="min-w-[720px] w-full border-collapse text-xs">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="p-2 border-b border-slate-700 text-left text-slate-300 uppercase tracking-wide">Criteria</th>
                    {columns.map((column, colIdx) => (
                      <th key={`rubric-head-${colIdx}`} className="p-2 border-b border-slate-700 text-left text-slate-300 uppercase tracking-wide">
                        {column.label || `Column ${colIdx + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr key={`rubric-grid-row-${rowIdx}`} className="align-top">
                      <td className="p-2 border-b border-slate-800 text-slate-200 font-semibold">
                        {row.label || `Criterion ${rowIdx + 1}`}
                      </td>
                      {columns.map((column, colIdx) => (
                        <td key={`rubric-grid-cell-${rowIdx}-${colIdx}`} className="p-2 border-b border-slate-800">
                          <textarea
                            value={cells[rowIdx]?.[colIdx] || ''}
                            onChange={(e) => {
                              const nextCells = cells.map((cellRow, cellRowIdx) =>
                                cellRowIdx === rowIdx
                                  ? cellRow.map((cellValue, cellColIdx) => (cellColIdx === colIdx ? e.target.value : cellValue))
                                  : cellRow,
                              );
                              updateSelectedActivityData({ rowCount, colCount, rows, columns, cells: nextCells });
                            }}
                            className="w-full h-20 bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                            placeholder={`Describe "${column.label || `Column ${colIdx + 1}`}"`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (selectedActivity.type === 'spacer_block') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Spacer Height (px)</label>
            <input
              type="number"
              min="0"
              max="600"
              value={Number.isFinite(Number(data.height)) ? data.height : 48}
              onChange={(e) => updateSelectedActivityData({ height: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Optional utility block. You can also leave rows open and move blocks directly into empty grid cells.
          </p>
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

    if (selectedActivity.type === 'save_load_block') {
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
            <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
            <textarea
              value={data.description || ''}
              onChange={(e) => updateSelectedActivityData({ description: e.target.value })}
              className="w-full h-20 bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Download Filename</label>
            <input
              type="text"
              value={data.fileName || ''}
              onChange={(e) => updateSelectedActivityData({ fileName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
              placeholder="module-progress"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            This block downloads learner responses as JSON and restores them from uploaded backup files.
          </p>
        </div>
      );
    }

    const fallbackTemplate = (() => {
      const def = getActivityDefinition(selectedActivity.type);
      if (def && typeof def.createDefaultData === 'function') {
        return def.createDefaultData();
      }
      return data;
    })();

    return <GenericDataEditor data={data} onChange={replaceSelectedActivityData} schemaTemplate={fallbackTemplate} />;
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
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-5 bg-slate-950 border border-slate-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-white">Activities</h4>
                            <span className="text-[11px] text-slate-500">{activities.length} total</span>
                          </div>
                          <div className="mb-3 p-2 rounded border border-slate-700 bg-slate-900/60">
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Grid Columns</label>
                            <select
                              value={composerMaxColumns}
                              onChange={(e) => updateComposerMaxColumns(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                            >
                              {[1, 2, 3, 4].map((count) => (
                                <option key={count} value={count}>
                                  {count} {count === 1 ? 'Column' : 'Columns'}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="max-h-72 overflow-y-auto pr-1">
                            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${composerMaxColumns}, minmax(0, 1fr))` }}>
                              {composerGridModel.emptySlots.map((slot) => {
                                const isSlotTarget =
                                  draggingActivityIndex !== null &&
                                  dragOverSlotKey === slot.key &&
                                  dragOverActivityIndex === null;
                                return (
                                  <div
                                    key={slot.key}
                                    style={{ gridColumn: `${slot.col}`, gridRow: `${slot.row}`, minHeight: '58px' }}
                                    onDragOver={(event) => {
                                      if (!Number.isInteger(draggingActivityIndex)) return;
                                      event.preventDefault();
                                      if (event.dataTransfer) {
                                        event.dataTransfer.dropEffect = 'move';
                                      }
                                      if (dragOverSlotKey !== slot.key) setDragOverSlotKey(slot.key);
                                      if (dragOverActivityIndex !== null) setDragOverActivityIndex(null);
                                    }}
                                    onDragLeave={() => {
                                      if (dragOverSlotKey === slot.key) setDragOverSlotKey(null);
                                    }}
                                    onDrop={(event) => {
                                      event.preventDefault();
                                      const fallback = Number.parseInt(event.dataTransfer?.getData('text/plain') || '', 10);
                                      const fromIndex = Number.isInteger(draggingActivityIndex) ? draggingActivityIndex : fallback;
                                      moveActivityToCell(fromIndex, slot.row, slot.col);
                                      setDraggingActivityIndex(null);
                                      setDragOverActivityIndex(null);
                                      setDragOverSlotKey(null);
                                    }}
                                    className={`rounded border border-dashed transition-colors ${
                                      isSlotTarget
                                        ? 'border-indigo-400 bg-indigo-500/20'
                                        : 'border-slate-700/80 bg-slate-900/35'
                                    }`}
                                  />
                                );
                              })}
                              {activities.map((activity, idx) => {
                                const def = getActivityDefinition(activity.type);
                                const colSpan = Math.min(activity?.layout?.colSpan || 1, composerMaxColumns);
                                const placement = composerPlacementsByIndex.get(idx);
                                const isSelected = idx === selectedActivityIndex;
                                const isDropTarget = idx === dragOverActivityIndex && draggingActivityIndex !== null && idx !== draggingActivityIndex;
                                return (
                                  <div
                                    key={activity.id || `${activity.type}-${idx}`}
                                    style={{
                                      gridColumn: placement
                                        ? `${placement.col} / span ${placement.colSpan}`
                                        : `span ${colSpan} / span ${colSpan}`,
                                      gridRow: placement ? `${placement.row}` : undefined,
                                    }}
                                    draggable
                                    onDragStart={(event) => {
                                      setDraggingActivityIndex(idx);
                                      setSelectedActivityIndex(idx);
                                      setDragOverSlotKey(null);
                                      if (event.dataTransfer) {
                                        event.dataTransfer.effectAllowed = 'move';
                                        event.dataTransfer.setData('text/plain', String(idx));
                                      }
                                    }}
                                    onDragOver={(event) => {
                                      event.preventDefault();
                                      if (event.dataTransfer) {
                                        event.dataTransfer.dropEffect = 'move';
                                      }
                                      if (dragOverActivityIndex !== idx) setDragOverActivityIndex(idx);
                                      if (dragOverSlotKey !== null) setDragOverSlotKey(null);
                                    }}
                                    onDrop={(event) => {
                                      event.preventDefault();
                                      const fallback = Number.parseInt(event.dataTransfer?.getData('text/plain') || '', 10);
                                      const fromIndex = Number.isInteger(draggingActivityIndex) ? draggingActivityIndex : fallback;
                                      moveActivityToCell(fromIndex, placement?.row || 1, placement?.col || 1);
                                      setDraggingActivityIndex(null);
                                      setDragOverActivityIndex(null);
                                      setDragOverSlotKey(null);
                                    }}
                                    onDragEnd={() => {
                                      setDraggingActivityIndex(null);
                                      setDragOverActivityIndex(null);
                                      setDragOverSlotKey(null);
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => setSelectedActivityIndex(idx)}
                                      className={`w-full text-left p-2 rounded border transition-colors ${
                                        isSelected
                                          ? 'bg-emerald-900/30 border-emerald-600 text-white'
                                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                                      } ${isDropTarget ? 'ring-1 ring-indigo-400 border-indigo-500' : ''}`}
                                    >
                                      <p className="text-xs font-bold">{def?.label || activity.type}</p>
                                      <p className="text-[10px] text-slate-500 font-mono">{activity.id || `activity-${idx + 1}`}</p>
                                      <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Span {colSpan}</p>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                            {activities.length === 0 && <p className="text-xs text-slate-500 mt-1">No activities yet.</p>}
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-700">
                            <div className="grid grid-cols-3 gap-2">
                              <select
                                value={newActivityType}
                                onChange={(e) => setNewActivityType(e.target.value)}
                                className="col-span-2 bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                              >
                                {activityTypeGroups.map((group) => (
                                  <optgroup key={`modal-group-${group.category}`} label={group.label}>
                                    {group.types.map((type) => {
                                      const def = getActivityDefinition(type);
                                      return (
                                        <option key={type} value={type}>
                                          {def?.label || type}
                                        </option>
                                      );
                                    })}
                                  </optgroup>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={addActivity}
                                className="bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-bold text-white inline-flex items-center justify-center gap-1"
                              >
                                <Plus size={12} /> Add
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={addEmptyRow}
                              className="w-full mt-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1.5 text-white text-xs inline-flex items-center justify-center gap-1"
                              title="Add one open row of empty drop targets"
                            >
                              <Plus size={12} /> Add Open Row
                            </button>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <label className="text-[11px] font-bold text-slate-400 uppercase self-center">Selected Span</label>
                              <select
                                value={selectedActivity?.layout?.colSpan || 1}
                                onChange={(e) => updateSelectedActivitySpan(e.target.value)}
                                disabled={!selectedActivity}
                                className="bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs disabled:opacity-40"
                              >
                                {Array.from({ length: composerMaxColumns }, (_, idx) => idx + 1).map((span) => (
                                  <option key={span} value={span}>
                                    Span {span}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="grid grid-cols-4 gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => moveSelectedActivity('left')}
                                disabled={!selectedActivity || !selectedPlacement || selectedPlacement.col <= 1}
                                className="px-2 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs inline-flex items-center justify-center gap-1"
                                title="Move left"
                              >
                                <ChevronLeft size={12} /> Left
                              </button>
                              <button
                                type="button"
                                onClick={() => moveSelectedActivity('right')}
                                disabled={
                                  !selectedActivity ||
                                  !selectedPlacement ||
                                  selectedPlacement.col >= Math.max(1, composerMaxColumns - (selectedActivity?.layout?.colSpan || 1) + 1)
                                }
                                className="px-2 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs inline-flex items-center justify-center gap-1"
                                title="Move right"
                              >
                                <ChevronRight size={12} /> Right
                              </button>
                              <button
                                type="button"
                                onClick={() => moveSelectedActivity('up')}
                                disabled={!selectedActivity || !selectedPlacement || selectedPlacement.row <= 1}
                                className="px-2 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs inline-flex items-center justify-center gap-1"
                              >
                                <ChevronUp size={12} /> Up
                              </button>
                              <button
                                type="button"
                                onClick={() => moveSelectedActivity('down')}
                                disabled={!selectedActivity}
                                className="px-2 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs inline-flex items-center justify-center gap-1"
                              >
                                <ChevronDown size={12} /> Down
                              </button>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                type="button"
                                onClick={duplicateSelectedActivity}
                                disabled={!selectedActivity}
                                className="flex-1 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs inline-flex items-center justify-center gap-1"
                                title="Duplicate selected activity"
                              >
                                <Copy size={12} /> Duplicate
                              </button>
                              <button
                                type="button"
                                onClick={removeSelectedActivity}
                                disabled={!selectedActivity}
                                className="flex-1 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs inline-flex items-center justify-center gap-1"
                                title="Delete selected activity"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-7 bg-slate-950 border border-slate-700 rounded-lg p-4">
                          <h4 className="text-sm font-bold text-white mb-3">
                            {selectedActivity ? (getActivityDefinition(selectedActivity.type)?.label || selectedActivity.type) : 'Activity Editor'}
                          </h4>
                          {renderSelectedActivityStylePanel()}
                          {renderActivityEditor()}
                        </div>
                      </div>

                      <div className="bg-slate-950 border border-slate-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-bold text-white">Live Module Preview</h4>
                          <button
                            type="button"
                            onClick={() => setComposerPreviewNonce((n) => n + 1)}
                            className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-700"
                            title="Remount preview iframe"
                          >
                            <RefreshCw size={12} />
                            Reset
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-3">Preview updates while you edit activities.</p>
                        <div className="rounded-lg overflow-hidden border border-slate-800 bg-black">
                          {composerPreviewSrcDoc ? (
                            <iframe
                              key={`composer-edit-preview-${editForm.id || 'draft'}-${composerPreviewNonce}`}
                              srcDoc={composerPreviewSrcDoc}
                              className="w-full border-0"
                              style={{ minHeight: '420px' }}
                              sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads allow-top-navigation-by-user-activation"
                              title="Composer live preview"
                            />
                          ) : (
                            <div className="h-48 flex items-center justify-center text-xs text-slate-500">
                              Composer preview unavailable.
                            </div>
                          )}
                        </div>
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
