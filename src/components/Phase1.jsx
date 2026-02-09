import * as React from 'react';
import {
  AlertTriangle,
  ArrowUpCircle,
  Box,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clipboard,
  Copy,
  Edit,
  Eye,
  EyeOff,
  FileJson,
  FolderOpen,
  PenTool,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import VaultBrowser from './VaultBrowser';
import { CodeBlock } from './Shared.jsx';
import GenericDataEditor from './GenericDataEditor.jsx';
import { buildModuleFrameHTML, cleanModuleScript, getMaterialBadgeLabel, validateModule } from '../utils/generators.js';
import { getActivityDefinition, listActivityTypeGroups } from '../composer/activityRegistry.js';
import {
  buildComposerGridModel,
  clampComposerColSpan,
  moveComposerActivityToCell,
  normalizeComposerActivities,
  normalizeComposerLayout,
} from '../composer/layout.js';

const { useEffect, useMemo, useRef, useState } = React;

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

function getComposerRichEditorConfig(activity) {
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

const MODULE_MANAGER_AUTOSAVE_KEY = 'course_factory_module_manager_autosave_v1';
const MODULE_MANAGER_SAVED_DRAFTS_KEY = 'course_factory_module_manager_saved_drafts_v1';
const MODULE_MANAGER_MAX_SAVED_DRAFTS = 30;

// --- PHASE 1: HARVEST ---
const Phase1 = ({ projectData, setProjectData, addMaterial, editMaterial, deleteMaterial, moveMaterial, toggleMaterialHidden, addAssessment, editAssessment, deleteAssessment, moveAssessment, toggleAssessmentHidden, addQuestionToMaster, moveQuestion, deleteQuestion, updateQuestion, clearMasterAssessment, masterQuestions, setMasterQuestions, masterAssessmentTitle, setMasterAssessmentTitle, currentQuestionType, setCurrentQuestionType, currentQuestion, setCurrentQuestion, editingQuestion, setEditingQuestion, generateMixedAssessment, generatedAssessment, setGeneratedAssessment, assessmentType, setAssessmentType, assessmentTitle, setAssessmentTitle, quizQuestions, setQuizQuestions, printInstructions, setPrintInstructions, editingAssessment, setEditingAssessment, isVaultOpen, setIsVaultOpen, setVaultTargetField, vaultTargetField }) => {
  const [harvestType, setHarvestType] = useState('MODULE_MANAGER'); // 'ASSESSMENT', 'MATERIALS', 'AI_MODULE', 'MODULE_MANAGER'
  const [mode, setMode] = useState('ADD');
  const [importInput, setImportInput] = useState("");
  const [importPreview, setImportPreview] = useState([]); 
  
  // MODULE MANAGER STATE
  const [moduleManagerType, setModuleManagerType] = useState('standalone'); // 'standalone' | 'composer' | 'external'
  const [moduleManagerComposerStarterType, setModuleManagerComposerStarterType] = useState('content_block');
  const moduleManagerActivityTypeGroups = useMemo(() => listActivityTypeGroups(), []);
  const [moduleManagerComposerLayout, setModuleManagerComposerLayout] = useState({ maxColumns: 1 });
  const [moduleManagerComposerActivities, setModuleManagerComposerActivities] = useState([]);
  const [moduleManagerComposerExtraRows, setModuleManagerComposerExtraRows] = useState(0);
  const [moduleManagerComposerSelectedIndex, setModuleManagerComposerSelectedIndex] = useState(0);
  const [moduleManagerComposerDraggingIndex, setModuleManagerComposerDraggingIndex] = useState(null);
  const [moduleManagerComposerDragOverIndex, setModuleManagerComposerDragOverIndex] = useState(null);
  const [moduleManagerComposerDragOverSlotKey, setModuleManagerComposerDragOverSlotKey] = useState(null);
  const [moduleManagerResourceMaterialId, setModuleManagerResourceMaterialId] = useState('');
  const [moduleManagerImageMaterialId, setModuleManagerImageMaterialId] = useState('');
  const [moduleManagerAssessmentId, setModuleManagerAssessmentId] = useState('');
  const [moduleManagerComposerPreviewNonce, setModuleManagerComposerPreviewNonce] = useState(0);
  const moduleManagerRichEditorRef = useRef(null);
  const moduleManagerRichEditorSelectionRef = useRef(null);
  const moduleManagerRichEditorUpdateTimerRef = useRef(null);
  const moduleManagerDraftImportRef = useRef(null);
  const [moduleManagerHTML, setModuleManagerHTML] = useState('');
  const [moduleManagerURL, setModuleManagerURL] = useState('');
  const [moduleManagerID, setModuleManagerID] = useState('');
  const [moduleManagerTitle, setModuleManagerTitle] = useState('');
  const [moduleManagerLinkType, setModuleManagerLinkType] = useState('iframe'); // 'iframe' | 'newtab'
  const [moduleManagerStatus, setModuleManagerStatus] = useState(null);
  const [moduleManagerMessage, setModuleManagerMessage] = useState('');
  const [testingLink, setTestingLink] = useState(false);
  const [linkTestResult, setLinkTestResult] = useState(null); 
  const [stagingJson, setStagingJson] = useState("");
  const [stagingTitle, setStagingTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState(null); // 'success'
  const [moduleManagerSavedDrafts, setModuleManagerSavedDrafts] = useState([]);
  const [moduleManagerSelectedDraftId, setModuleManagerSelectedDraftId] = useState('');
  const [moduleManagerDownloadDraftOnSave, setModuleManagerDownloadDraftOnSave] = useState(true);

  const moduleBankMaterials = useMemo(
    () =>
      ((projectData?.["Current Course"]?.materials || [])
        .filter((mat) => !mat.hidden)
        .sort((a, b) => (a.order || 0) - (b.order || 0))),
    [projectData],
  );
  const moduleBankImageAssets = useMemo(
    () => moduleBankMaterials.map(extractMaterialImageAsset).filter(Boolean),
    [moduleBankMaterials],
  );
  const moduleBankAssessments = useMemo(() => {
    const modules = projectData?.["Current Course"]?.modules || [];
    return modules
      .flatMap((mod) => (mod.assessments || []).map((assessment) => ({ ...assessment, moduleId: mod.id, moduleTitle: mod.title })))
      .filter((assessment) => !assessment.hidden);
  }, [projectData]);

  // NEW: AI Studio Module Creator State
  const [aiDescription, setAiDescription] = useState("");
  const [migrateCode, setMigrateCode] = useState("");
  const [migratePrompt, setMigratePrompt] = useState("");
  const [migrateOutput, setMigrateOutput] = useState("");

  // Assessment override colors (Phase 1 Edit modal) - "Use course default" + common colors
  const assessmentOverrideOptions = [
    { value: '', label: 'Use course default' },
    { value: 'white', label: 'White', swatch: 'bg-white border-slate-300', text: 'text-slate-900' },
    { value: 'slate-900', label: 'Slate 900', swatch: 'bg-slate-900 border-slate-700', text: 'text-white' },
    { value: 'slate-800', label: 'Slate 800', swatch: 'bg-slate-800 border-slate-700', text: 'text-white' },
    { value: 'slate-700', label: 'Slate 700', swatch: 'bg-slate-700 border-slate-600', text: 'text-white' },
    { value: 'slate-600', label: 'Slate 600', swatch: 'bg-slate-600 border-slate-500', text: 'text-white' },
    { value: 'slate-400', label: 'Slate 400', swatch: 'bg-slate-400 border-slate-300', text: 'text-white' },
    { value: 'slate-300', label: 'Slate 300', swatch: 'bg-slate-300 border-slate-200', text: 'text-slate-900' },
    { value: 'slate-200', label: 'Slate 200', swatch: 'bg-slate-200 border-slate-100', text: 'text-slate-900' },
    { value: 'gray-900', label: 'Gray 900', swatch: 'bg-gray-900 border-gray-700', text: 'text-white' },
    { value: 'gray-700', label: 'Gray 700', swatch: 'bg-gray-700 border-gray-600', text: 'text-white' },
    { value: 'black', label: 'Black', swatch: 'bg-black border-slate-700', text: 'text-white' }
  ];

  // Material card themes (Phase 1 Edit modal)
  const materialThemeOptions = [
    { value: '', label: 'Use course default' },
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'muted', label: 'Muted' },
    { value: 'high-contrast-light', label: 'High contrast (light)' },
    { value: 'high-contrast-dark', label: 'High contrast (dark)' }
  ];

  // Materials Manager State
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [phase1MaterialPreview, setPhase1MaterialPreview] = useState(null);
  const [phase1AssessmentPreview, setPhase1AssessmentPreview] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    number: '',
    title: '',
    description: '',
    viewUrl: '',
    downloadUrl: '',
    color: 'slate',
    mediaType: 'number',
    themeOverride: null,
    assignedModules: [],
    hasDigitalContent: false,
    digitalContent: null,
    digitalContentJson: '' // Raw JSON string for editing
  });
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [parsedAiModule, setParsedAiModule] = useState(null);
  const [aiParseError, setAiParseError] = useState(null);
  const [aiTargetType, setAiTargetType] = useState('MODULE'); // 'MODULE' or 'FEATURE'
  const moduleManagerComposerMaxColumns = normalizeComposerLayout(moduleManagerComposerLayout).maxColumns;
  const moduleManagerGridModel = useMemo(
    () =>
      buildComposerGridModel(moduleManagerComposerActivities, moduleManagerComposerMaxColumns, {
        includeTrailingRow: true,
        trailingRows: moduleManagerComposerExtraRows,
      }),
    [moduleManagerComposerActivities, moduleManagerComposerExtraRows, moduleManagerComposerMaxColumns],
  );
  const moduleManagerPlacementByIndex = useMemo(
    () => new Map(moduleManagerGridModel.placements.map((placement) => [placement.index, placement])),
    [moduleManagerGridModel],
  );

  // Assessment Generator Functions
  const handleVaultSelect = (file) => {
    if (vaultTargetField && typeof vaultTargetField === 'object' && vaultTargetField.target === 'composer-resource') {
      if (selectedComposerActivity?.type === 'resource_list') {
        const items = Array.isArray(selectedComposerActivity.data?.items) ? selectedComposerActivity.data.items : [];
        const itemIndex = Number(vaultTargetField.itemIndex);
        if (Number.isInteger(itemIndex) && itemIndex >= 0 && itemIndex < items.length) {
          const key = vaultTargetField.field === 'downloadUrl' ? 'downloadUrl' : 'viewUrl';
          const nextItems = [...items];
          nextItems[itemIndex] = { ...(nextItems[itemIndex] || {}), [key]: file.path };
          updateSelectedComposerActivityData({ items: nextItems });
        }
      }
    } else if (vaultTargetField && typeof vaultTargetField === 'object' && vaultTargetField.target === 'composer-image') {
      if (selectedComposerActivity?.type === 'image_block') {
        updateSelectedComposerActivityData({ url: file.path || '' });
      }
    } else if (vaultTargetField === 'view') {
      setMaterialForm(prev => ({ ...prev, viewUrl: file.path }));
    } else if (vaultTargetField === 'download') {
      setMaterialForm(prev => ({ ...prev, downloadUrl: file.path }));
    }
    setIsVaultOpen(false);
    setVaultTargetField(null);
  };

  const addQuizQuestion = () => {
    setQuizQuestions([...quizQuestions, { question: '', options: ['', '', '', ''], correct: 0 }]);
  };

  const updateQuizQuestion = (index, field, value) => {
    const newQuestions = [...quizQuestions];
    if (field === 'question' || field === 'correct') {
      newQuestions[index][field] = value;
    } else if (field.startsWith('option-')) {
      const optIndex = parseInt(field.split('-')[1]);
      newQuestions[index].options[optIndex] = value;
    }
    setQuizQuestions(newQuestions);
  };

  const generateQuizAssessment = () => {
    const quizId = `quiz_${Date.now()}`;
    
    // Get Course Settings for dynamic colors
    const courseSettings = projectData["Course Settings"] || {};
    const backgroundColor = courseSettings.backgroundColor || 'slate-950';
    const accentColor = courseSettings.accentColor || 'sky';
    const isLightBg = backgroundColor.includes('white') || backgroundColor.includes('slate-100') || backgroundColor.includes('slate-50');
    
    const headingTextColor = courseSettings.headingTextColor || (isLightBg ? 'slate-900' : 'white');
    const secondaryTextColor = courseSettings.secondaryTextColor || (isLightBg ? 'slate-600' : 'slate-400');
    const assessmentTextColor = courseSettings.assessmentTextColor || 'white';
    const buttonColor = courseSettings.buttonColor || `${accentColor}-600`;
    
    const toTextClass = (value) => value.startsWith('text-') ? value : `text-${value}`;
    const toBgBase = (value) => value.startsWith('bg-') ? value.slice(3) : value;
    
    const headingTextClass = toTextClass(headingTextColor);
    const secondaryTextClass = toTextClass(secondaryTextColor);
    const assessmentTextClass = toTextClass(assessmentTextColor);
    const bodyTextClass = assessmentTextClass;
    const buttonBgBase = toBgBase(buttonColor);
    const buttonBgClass = `bg-${buttonBgBase}`;
    const buttonHoverClass = buttonBgBase.endsWith('-600') ? `hover:bg-${buttonBgBase.replace(/-600$/, '-500')}` : `hover:bg-${buttonBgBase}`;
    const buttonTextClass = isLightBg ? 'text-slate-900' : 'text-white';
    
    const cardBgClass = isLightBg ? 'bg-white' : 'bg-slate-900';
    const cardBorderClass = isLightBg ? 'border-slate-300' : 'border-slate-700';
    const optionBgClass = isLightBg ? 'bg-slate-100' : 'bg-slate-800';
    const optionHoverClass = isLightBg ? 'hover:bg-slate-200' : 'hover:bg-slate-750';
    const inputBgClass = isLightBg ? 'bg-white' : 'bg-slate-950';
    const inputTextClass = assessmentTextClass;
    const modalBgClass = isLightBg ? 'bg-white' : 'bg-slate-900';
    const modalBorderClass = isLightBg ? 'border-slate-300' : 'border-slate-700';
    
    // MULTIPLE CHOICE QUIZ
    if (assessmentType === 'quiz') {
    const questionsHtml = quizQuestions.map((q, idx) => `
      <div class="mb-8 p-6 ${cardBgClass} rounded-xl border ${cardBorderClass}">
        <h3 class="text-lg font-bold ${headingTextClass} mb-4">${idx + 1}. ${q.question}</h3>
        <div class="space-y-2">
          ${q.options.map((opt, optIdx) => `
            <label class="flex items-center gap-3 p-3 ${optionBgClass} rounded-lg cursor-pointer ${optionHoverClass} transition-colors">
              <input type="radio" name="q${idx}" value="${optIdx}" class="w-4 h-4 assessment-input" />
              <span class="${bodyTextClass}">${opt}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');

    const answers = quizQuestions.map(q => q.correct);

    const html = `<div id="${quizId}" class="w-full h-full custom-scroll p-8">
      <div class="max-w-4xl mx-auto">
        <header class="mb-8">
          <h1 class="text-3xl font-black ${headingTextClass} italic mb-2">${assessmentTitle}</h1>
          <p class="text-sm ${secondaryTextClass}">Select the best answer for each question.</p>
        </header>
        <form id="${quizId}-form" class="space-y-6">
          ${questionsHtml}
        </form>
        
        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-3 mt-8 no-print">
          <button type="button" onclick="${quizId}_reset()" class="${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold py-3 px-6 rounded-lg flex items-center gap-2">
            Reset
          </button>
          <button type="button" onclick="${quizId}_generateReport()" class="${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold py-3 px-6 rounded-lg flex items-center gap-2">
            Print & Submit
          </button>
        </div>
        
        <!-- Reset Confirmation Modal -->
        <div id="${quizId}-reset-modal" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center hidden">
          <div class="${modalBgClass} border ${modalBorderClass} rounded-xl p-6 max-w-md mx-4">
            <h3 class="text-lg font-bold ${headingTextClass} mb-4">Reset Assessment?</h3>
            <p class="${bodyTextClass} mb-6">Are you sure you want to reset all your answers? This cannot be undone.</p>
            <div class="flex gap-3">
              <button onclick="document.getElementById('${quizId}-reset-modal').classList.add('hidden')" class="flex-1 ${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold py-2 rounded">Cancel</button>
              <button onclick="${quizId}_confirmReset()" class="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded">Reset</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;

    const script = `
    // Reset function - shows confirmation modal
    function ${quizId}_reset() {
      var modal = document.getElementById('${quizId}-reset-modal');
      if (modal) modal.classList.remove('hidden');
    }
    
    // Confirm Reset
    function ${quizId}_confirmReset() {
      document.getElementById('${quizId}-reset-modal').classList.add('hidden');
      var form = document.getElementById('${quizId}-form');
      if (form) form.reset();
    }
    
    // Generate Report - creates a clean printable page
    function ${quizId}_generateReport() {
      var container = document.getElementById('${quizId}');
      if (!container) { alert('Assessment not found'); return; }
      
      // Build questions HTML with selected answers
      var questionsHTML = '';
      var questions = container.querySelectorAll('[class*="mb-8 p-6"]');
      var qNum = 1;
      
      questions.forEach(function(q) {
        var questionText = q.querySelector('h3')?.textContent || 'Question ' + qNum;
        var selectedRadio = q.querySelector('input[type="radio"]:checked');
        var answer = '';
        
        if (selectedRadio) {
          var label = selectedRadio.closest('label');
          answer = label ? label.textContent.trim() : 'Selected Option';
        }
        
        if (questionText.trim()) {
          questionsHTML += '<div style="margin-bottom:25px; border-left:4px solid #333; padding-left:15px;">' +
            '<h3 style="font-size:14px; font-weight:bold; margin-bottom:10px; color:#333;">' + questionText + '</h3>' +
            '<div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #ddd; min-height:40px; font-size:13px;">' + 
            (answer || '<em style="color:#999;">No answer selected</em>') + 
            '</div></div>';
          qNum++;
        }
      });
      
      var printHTML = '<!DOCTYPE html><html><head><title>${assessmentTitle} - Submission</title>' +
        '<style>body { font-family: Arial, sans-serif; padding: 40px; color: #333; background: white; line-height: 1.5; max-width: 800px; margin: 0 auto; }' +
        '.header { border-bottom: 4px solid #333; padding-bottom: 15px; margin-bottom: 25px; }' +
        '.header h1 { font-size: 24px; font-weight: 900; text-transform: uppercase; font-style: italic; margin: 0; }' +
        '</style></head><body>' +
        '<div class="header"><h1>${assessmentTitle}</h1><p style="font-size:11px; text-transform:uppercase; letter-spacing:2px; color:#666; margin-top:5px;">Multiple Choice Assessment</p></div>' +
        '<div class="questions">' + questionsHTML + '</div>' +
        '<div style="margin-top:40px; border-top:2px solid #333; padding-top:20px; text-align:center;">' +
        '<p style="font-size:10px; text-transform:uppercase; letter-spacing:2px; color:#999;">End of Submission</p></div>' +
        '<script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }<\\/script></body></html>';
      
      var pw = window.open('', '_blank');
      if (pw) { pw.document.open(); pw.document.write(printHTML); pw.document.close(); }
      else { alert('Please allow popups to print.'); }
    }
    `;

      setGeneratedAssessment(JSON.stringify({ id: quizId, html, script, type: 'quiz', title: assessmentTitle }, null, 2));
    }
    
    // LONG ANSWER
    else if (assessmentType === 'longanswer') {
      const promptsHtml = quizQuestions.map((q, idx) => `
        <div class="mb-8 p-6 ${cardBgClass} rounded-xl border ${cardBorderClass} print-section">
          <h3 class="text-lg font-bold ${headingTextClass} mb-4 print-question">${idx + 1}. ${q.question}</h3>
          <textarea 
            id="${quizId}-answer-${idx}" 
            placeholder="Type your answer here..."
            class="w-full h-48 ${inputBgClass} border ${cardBorderClass} rounded-lg p-4 ${inputTextClass} resize-none focus:border-${accentColor}-500 focus:outline-none print-response assessment-input"
          ></textarea>
          <p class="text-xs ${secondaryTextClass} italic mt-2 no-print">Auto-saved to browser</p>
        </div>
      `).join('');

      const html = `<div id="${quizId}" class="w-full h-full custom-scroll p-8">
        <div class="max-w-4xl mx-auto">
          <header class="mb-8">
            <h1 class="text-3xl font-black ${headingTextClass} italic mb-2 print-title">${assessmentTitle}</h1>
            <p class="text-sm ${secondaryTextClass} no-print">Complete all questions. Your responses are auto-saved.</p>
          </header>
          
          <!-- Student Info -->
          <div class="grid grid-cols-2 gap-4 mb-8 p-6 ${cardBgClass} rounded-xl border ${cardBorderClass} print-header">
            <div>
              <label class="block text-xs font-bold ${secondaryTextClass} uppercase mb-2">Student Name</label>
              <input 
                type="text" 
                id="${quizId}-student-name"
                placeholder="Enter your name..."
                class="w-full ${inputBgClass} border ${cardBorderClass} rounded p-3 ${inputTextClass} text-sm focus:border-${accentColor}-500 focus:outline-none assessment-input"
              />
            </div>
            <div>
              <label class="block text-xs font-bold ${secondaryTextClass} uppercase mb-2">Date</label>
              <input 
                type="date" 
                id="${quizId}-student-date"
                class="w-full ${inputBgClass} border ${cardBorderClass} rounded p-3 ${inputTextClass} text-sm focus:border-${accentColor}-500 focus:outline-none assessment-input"
              />
            </div>
          </div>

          <!-- Questions -->
          <div class="space-y-6">
            ${promptsHtml}
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3 mt-8 no-print">
            <button type="button" onclick="${quizId}_reset()" class="${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold py-3 px-6 rounded-lg flex items-center gap-2">
              Reset
            </button>
            <button type="button" onclick="${quizId}_download()" class="${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold py-3 px-6 rounded-lg flex items-center gap-2">
              Download Backup
            </button>
            <button type="button" onclick="document.getElementById('${quizId}-upload').click()" class="${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold py-3 px-6 rounded-lg flex items-center gap-2">
              Upload Backup
            </button>
            <button type="button" onclick="${quizId}_generateReport()" class="${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold py-3 px-6 rounded-lg flex items-center gap-2">
              Print & Submit
            </button>
          </div>
          <input type="file" id="${quizId}-upload" accept=".json" style="display: none;" onchange="${quizId}_loadBackup(this)" />

          <!-- Status Messages -->
          <div id="${quizId}-loaded" class="hidden mt-6 p-4 rounded-xl bg-blue-900/20 border border-blue-500">
            <p class="text-blue-400 font-bold">Backup loaded successfully!</p>
          </div>

          <!-- Reset Confirmation Modal -->
          <div id="${quizId}-reset-modal" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center hidden">
            <div class="${modalBgClass} border ${modalBorderClass} rounded-xl p-6 max-w-md mx-4">
              <h3 class="text-lg font-bold ${headingTextClass} mb-4">Reset Assessment?</h3>
              <p class="${bodyTextClass} mb-6">Are you sure you want to reset all your answers? This cannot be undone.</p>
              <div class="flex gap-3">
                <button onclick="document.getElementById('${quizId}-reset-modal').classList.add('hidden')" class="flex-1 ${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold py-2 rounded">Cancel</button>
                <button onclick="${quizId}_confirmReset()" class="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded">Reset</button>
              </div>
            </div>
          </div>

          <!-- Print Instructions -->
          <div class="mt-8 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg no-print">
            <p class="text-amber-300 text-sm">
              <strong>Instructions:</strong> Complete all questions, then click "Print & Submit" to generate a clean printable report.
            </p>
          </div>
        </div>
      </div>`;

      const script = `
      var ${quizId}_count = ${quizQuestions.length};
      
      // Initialize: Load saved data on page load
      window.addEventListener('load', function() {
        ${quizId}_loadFromLocalStorage();
      });
      
      // Reset function - shows confirmation modal
      function ${quizId}_reset() {
        var modal = document.getElementById('${quizId}-reset-modal');
        if (modal) modal.classList.remove('hidden');
      }
      
      // Confirm Reset
      function ${quizId}_confirmReset() {
        document.getElementById('${quizId}-reset-modal').classList.add('hidden');
        var nameField = document.getElementById('${quizId}-student-name');
        var dateField = document.getElementById('${quizId}-student-date');
        if (nameField) { nameField.value = ''; localStorage.removeItem('${quizId}-student-name'); }
        if (dateField) { dateField.value = ''; localStorage.removeItem('${quizId}-student-date'); }
        for (var i = 0; i < ${quizId}_count; i++) {
          var textarea = document.getElementById('${quizId}-answer-' + i);
          if (textarea) { textarea.value = ''; localStorage.removeItem('${quizId}-answer-' + i); }
        }
      }
      
      // Auto-save on input for all fields
      function ${quizId}_setupAutoSave() {
        var nameField = document.getElementById('${quizId}-student-name');
        var dateField = document.getElementById('${quizId}-student-date');
        if (nameField) {
          nameField.addEventListener('input', function() {
            localStorage.setItem('${quizId}-student-name', this.value);
          });
        }
        if (dateField) {
          dateField.addEventListener('input', function() {
            localStorage.setItem('${quizId}-student-date', this.value);
          });
        }
        
        for (var i = 0; i < ${quizId}_count; i++) {
          (function(idx) {
            var textarea = document.getElementById('${quizId}-answer-' + idx);
            if (textarea) {
              textarea.addEventListener('input', function() {
                localStorage.setItem('${quizId}-answer-' + idx, this.value);
              });
            }
          })(i);
        }
      }
      
      // Load from localStorage
      function ${quizId}_loadFromLocalStorage() {
        var nameField = document.getElementById('${quizId}-student-name');
        var dateField = document.getElementById('${quizId}-student-date');
        
        if (nameField) {
          var savedName = localStorage.getItem('${quizId}-student-name');
          if (savedName) nameField.value = savedName;
        }
        if (dateField) {
          var savedDate = localStorage.getItem('${quizId}-student-date');
          if (savedDate) dateField.value = savedDate;
        }
        
        for (var i = 0; i < ${quizId}_count; i++) {
          var textarea = document.getElementById('${quizId}-answer-' + i);
          if (textarea) {
            var saved = localStorage.getItem('${quizId}-answer-' + i);
            if (saved) textarea.value = saved;
          }
        }
        
        ${quizId}_setupAutoSave();
      }
      
      // Download Backup
      function ${quizId}_download() {
        var data = {
          studentName: document.getElementById('${quizId}-student-name')?.value || '',
          studentDate: document.getElementById('${quizId}-student-date')?.value || '',
          answers: []
        };
        
        for (var i = 0; i < ${quizId}_count; i++) {
          var textarea = document.getElementById('${quizId}-answer-' + i);
          data.answers.push(textarea ? textarea.value : '');
        }
        
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = '${assessmentTitle.replace(/[^a-z0-9]/gi, '_')}_backup.json';
        a.click();
        URL.revokeObjectURL(url);
      }
      
      // Load Backup
      function ${quizId}_loadBackup(input) {
        var file = input.files[0];
        if (!file) return;
        
        var reader = new FileReader();
        reader.onload = function(e) {
          try {
            var data = JSON.parse(e.target.result);
            
            var nameField = document.getElementById('${quizId}-student-name');
            var dateField = document.getElementById('${quizId}-student-date');
            
            if (nameField && data.studentName) {
              nameField.value = data.studentName;
              localStorage.setItem('${quizId}-student-name', data.studentName);
            }
            if (dateField && data.studentDate) {
              dateField.value = data.studentDate;
              localStorage.setItem('${quizId}-student-date', data.studentDate);
            }
            
            data.answers.forEach(function(answer, i) {
              var textarea = document.getElementById('${quizId}-answer-' + i);
              if (textarea) {
                textarea.value = answer;
                localStorage.setItem('${quizId}-answer-' + i, answer);
              }
            });
            
            var loadedDiv = document.getElementById('${quizId}-loaded');
            if (loadedDiv) {
              loadedDiv.classList.remove('hidden');
              setTimeout(function() { loadedDiv.classList.add('hidden'); }, 3000);
            }
          } catch(err) {
            alert('Error loading backup file.');
          }
        };
        reader.readAsText(file);
      }
      
      // Generate Report - creates a clean printable page in new window
      function ${quizId}_generateReport() {
        var container = document.getElementById('${quizId}');
        if (!container) { alert('Assessment not found'); return; }
        
        var studentName = document.getElementById('${quizId}-student-name')?.value || 'Not Provided';
        var studentDate = document.getElementById('${quizId}-student-date')?.value || new Date().toLocaleDateString();
        
        var questionsHTML = '';
        var questions = container.querySelectorAll('.print-section');
        
        questions.forEach(function(q, idx) {
          var questionText = q.querySelector('.print-question')?.textContent || 'Question ' + (idx+1);
          var textarea = q.querySelector('textarea');
          var answer = textarea ? textarea.value : '';
          
          questionsHTML += '<div style="margin-bottom:25px; border-left:4px solid #333; padding-left:15px;">' +
            '<h3 style="font-size:14px; font-weight:bold; margin-bottom:10px; color:#333;">' + questionText + '</h3>' +
            '<div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #ddd; min-height:80px; white-space:pre-wrap; font-size:13px;">' + 
            (answer || '<em style="color:#999;">No answer provided</em>') + 
            '</div></div>';
        });
        
        var printHTML = '<!DOCTYPE html><html><head><title>${assessmentTitle} - Submission</title>' +
          '<style>body { font-family: Arial, sans-serif; padding: 40px; color: #333; background: white; line-height: 1.5; max-width: 800px; margin: 0 auto; }' +
          '.header { border-bottom: 4px solid #333; padding-bottom: 15px; margin-bottom: 25px; }' +
          '.header h1 { font-size: 24px; font-weight: 900; text-transform: uppercase; font-style: italic; margin: 0; }' +
          '.student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px; }' +
          '.student-info div { font-size: 14px; }' +
          '.student-info strong { display: block; font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 4px; }</style></head><body>' +
          '<div class="header"><h1>${assessmentTitle}</h1><p style="font-size:11px; text-transform:uppercase; letter-spacing:2px; color:#666; margin-top:5px;">Long Answer Assessment</p></div>' +
          '<div class="student-info"><div><strong>Student Name</strong>' + studentName + '</div><div><strong>Date</strong>' + studentDate + '</div></div>' +
          '<div class="questions">' + questionsHTML + '</div>' +
          '<div style="margin-top:40px; border-top:2px solid #333; padding-top:20px; text-align:center;">' +
          '<p style="font-size:10px; text-transform:uppercase; letter-spacing:2px; color:#999;">End of Submission</p></div>' +
          '<script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }<\\/script></body></html>';
        
        var pw = window.open('', '_blank');
        if (pw) { pw.document.open(); pw.document.write(printHTML); pw.document.close(); }
        else { alert('Please allow popups to print.'); }
      }
      `;

      setGeneratedAssessment(JSON.stringify({ id: quizId, html, script, type: 'longanswer', title: assessmentTitle }, null, 2));
    }
    
    // PRINT & SUBMIT
    else if (assessmentType === 'print') {
      const instructions = printInstructions || `<li>Complete all required work on a separate sheet</li>
              <li>Review your answers carefully</li>
              <li>Print this page as a cover sheet</li>
              <li>Attach your work and submit</li>`;
      
      const html = `<div id="${quizId}" class="w-full h-full custom-scroll p-8">
        <div class="max-w-4xl mx-auto">
          <header class="mb-8">
            <h1 class="text-3xl font-black ${headingTextClass} italic mb-2">${assessmentTitle}</h1>
            <p class="text-sm ${secondaryTextClass}">Complete this assignment and submit to your instructor.</p>
          </header>
          <div class="p-8 ${cardBgClass} rounded-xl border ${cardBorderClass}">
            <h3 class="text-lg font-bold ${headingTextClass} mb-4">Instructions:</h3>
            <ol class="list-decimal list-inside space-y-2 ${bodyTextClass} mb-8">
              ${instructions}
            </ol>
            <div class="border-t ${cardBorderClass} pt-6 space-y-4">
              <div><span class="font-bold ${headingTextClass}">Student Name:</span> <span class="inline-block border-b ${cardBorderClass} w-64 ml-2"></span></div>
              <div><span class="font-bold ${headingTextClass}">Date:</span> <span class="inline-block border-b ${cardBorderClass} w-48 ml-2"></span></div>
              <div><span class="font-bold ${headingTextClass}">Assignment:</span> <span class="text-${accentColor}-400">${assessmentTitle}</span></div>
                </div>
          </div>
          <div class="mt-6 flex gap-4">
            <button type="button" onclick="window.print()" class="${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold py-3 px-8 rounded-lg">Print & Submit</button>
          </div>
          <div class="mt-4 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
            <p class="text-amber-300 text-sm"><strong>Reminder:</strong> Print this page, complete the assignment, and submit to your instructor.</p>
                </div>
            </div>
        </div>`;
          
      const script = `console.log('Print & Submit assessment loaded: ${assessmentTitle}');`;

      setGeneratedAssessment(JSON.stringify({ id: quizId, html, script, type: 'print', title: assessmentTitle }, null, 2));
      setPrintInstructions(""); // Reset for next use
    }
  };

  const handleSessionSave = (overrideJson = null) => {
      setAiParseError(null);
      const jsonToUse = overrideJson || stagingJson;
      const titleToUse = stagingTitle;

      if (!jsonToUse || !titleToUse) {
          setAiParseError("Missing title or code content.");
          return;
      }

      let parsedCode = jsonToUse;
      try { 
          if (typeof jsonToUse === 'string') { 
              // Basic check to see if it's JSON
              if(jsonToUse.trim().startsWith('{') || jsonToUse.trim().startsWith('[')) {
                  parsedCode = JSON.parse(jsonToUse); 
              }
          } 
      } catch (e) { 
          setAiParseError("Invalid JSON format. Please check your syntax.");
          return; 
      }

      const newItem = { 
          id: parsedCode.id ? parsedCode.id : `item-${Date.now()}`,
          title: titleToUse, 
          code: parsedCode,
          // Initialize history with version 1 (original state)
          history: [{
            timestamp: new Date().toISOString(),
            title: titleToUse,
            code: parsedCode
          }]
      };

      // Validate module before saving
      const validation = validateModule(newItem, true);
      if (!validation.isValid) {
        setAiParseError('Validation failed: ' + validation.errors.join(', '));
        if (validation.warnings.length > 0) {
          console.warn('Module warnings:', validation.warnings);
        }
        return;
      }
      
      // Show warnings but allow save
      if (validation.warnings.length > 0) {
        console.warn('Module warnings:', validation.warnings);
      }

      // FUNCTIONAL UPDATE TO PREVENT STATE OVERWRITE
      setProjectData(prev => {
          const newData = { ...prev };
          // Determine destination: AI_MODULE uses aiTargetType, others use harvestType
          const isModule = harvestType === 'ASSESSMENT' || (harvestType === 'AI_MODULE' && aiTargetType === 'MODULE');
          
          if (isModule) { 
              const currentModules = newData["Current Course"].modules || [];
              newData["Current Course"] = {
                  ...newData["Current Course"],
                  modules: [...currentModules, newItem]
              };
          } else { 
              const currentTools = newData["Global Toolkit"] || [];
              newData["Global Toolkit"] = [...currentTools, newItem]; 
          }
          return newData;
      });

      setStagingJson("");
      setStagingTitle("");
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
  };

  // CSS AUTO-SCOPING FUNCTION
  const scopeCSS = (css, viewId) => {
    if (!css || !viewId) return css;
    
    // Add #view-{id} prefix to CSS selectors
    // Handle various CSS patterns
    let scoped = css;
    
    // Scope regular selectors (but not @rules)
    scoped = scoped.replace(/([^{}@]+)\{/g, (match, selector) => {
      // Skip if already scoped or is @rule
      if (selector.trim().startsWith('@') || selector.includes(`#${viewId}`)) {
        return match;
      }
      
      // Clean selector and add scope
      const cleanSelector = selector.trim();
      if (cleanSelector) {
        return `#${viewId} ${cleanSelector} {`;
      }
      return match;
    });
    
    return scoped;
  };

  // MODULE MANAGER FUNCTIONS
  // ========================================
  // SIMPLIFIED HARVESTING: Store raw HTML as-is
  // The module runs in an iframe so no parsing/transformation needed
  // ========================================
  const buildComposerStarterActivity = (type) => {
    const selectedType = type || 'content_block';
    const definition = getActivityDefinition(selectedType) || getActivityDefinition('content_block');
    const resolvedType = definition?.type || 'content_block';
    const defaultData = definition?.createDefaultData ? definition.createDefaultData() : {};
    return {
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: resolvedType,
      data: defaultData,
      layout: {
        colSpan: 1,
      },
    };
  };

  const buildModuleManagerDraftPayload = () => {
    const composerLayout = normalizeComposerLayout(moduleManagerComposerLayout);
    const composerActivities = normalizeComposerActivities(moduleManagerComposerActivities, {
      maxColumns: composerLayout.maxColumns,
    });
    return {
      version: 1,
      type: moduleManagerType,
      moduleId: moduleManagerID,
      title: moduleManagerTitle,
      html: moduleManagerHTML,
      url: moduleManagerURL,
      linkType: moduleManagerLinkType,
      composerStarterType: moduleManagerComposerStarterType,
      composerLayout,
      composerActivities,
      composerExtraRows: moduleManagerComposerExtraRows,
      composerSelectedIndex: moduleManagerComposerSelectedIndex,
    };
  };

  const applyModuleManagerDraftPayload = (payload) => {
    if (!payload || typeof payload !== 'object') return false;

    const nextType =
      payload.type === 'composer' || payload.type === 'external' || payload.type === 'standalone'
        ? payload.type
        : 'standalone';
    const nextStarterType =
      payload.composerStarterType && getActivityDefinition(payload.composerStarterType)
        ? payload.composerStarterType
        : 'content_block';
    const nextLayout = normalizeComposerLayout(payload.composerLayout);
    const hydratedActivities = normalizeComposerActivities(payload.composerActivities, {
      maxColumns: nextLayout.maxColumns,
    });
    const nextActivities =
      hydratedActivities.length > 0
        ? hydratedActivities
        : normalizeComposerActivities([buildComposerStarterActivity(nextStarterType)], {
            maxColumns: nextLayout.maxColumns,
          });
    const requestedIndex = Number.parseInt(payload.composerSelectedIndex, 10);
    const nextSelectedIndex = Number.isInteger(requestedIndex)
      ? Math.max(0, Math.min(nextActivities.length - 1, requestedIndex))
      : 0;
    const requestedExtraRows = Number.parseInt(payload.composerExtraRows, 10);
    const nextExtraRows = Number.isInteger(requestedExtraRows) ? Math.max(0, Math.min(requestedExtraRows, 50)) : 0;

    setModuleManagerType(nextType);
    setModuleManagerID(payload.moduleId || '');
    setModuleManagerTitle(payload.title || '');
    setModuleManagerHTML(payload.html || '');
    setModuleManagerURL(payload.url || '');
    setModuleManagerLinkType(payload.linkType === 'newtab' ? 'newtab' : 'iframe');
    setModuleManagerComposerStarterType(nextStarterType);
    setModuleManagerComposerLayout(nextLayout);
    setModuleManagerComposerActivities(nextActivities);
    setModuleManagerComposerExtraRows(nextExtraRows);
    setModuleManagerComposerSelectedIndex(nextSelectedIndex);
    return true;
  };

  const persistModuleManagerSavedDrafts = (nextDrafts) => {
    const trimmedDrafts = Array.isArray(nextDrafts) ? nextDrafts.slice(0, MODULE_MANAGER_MAX_SAVED_DRAFTS) : [];
    setModuleManagerSavedDrafts(trimmedDrafts);
    try {
      localStorage.setItem(MODULE_MANAGER_SAVED_DRAFTS_KEY, JSON.stringify(trimmedDrafts));
    } catch (err) {
      console.error('Failed to persist module manager drafts:', err);
    }
    return trimmedDrafts;
  };

  const showModuleManagerNotice = (status, message, durationMs = 2200) => {
    setModuleManagerStatus(status);
    setModuleManagerMessage(message);
    if (!durationMs) return;
    setTimeout(() => {
      setModuleManagerStatus(null);
      setModuleManagerMessage('');
    }, durationMs);
  };

  const buildModuleManagerDraftRecord = ({ id, payload, label, savedAt }) => ({
    id: id || `module-draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label:
      label ||
      moduleManagerTitle.trim() ||
      moduleManagerID.trim() ||
      `${payload?.type === 'composer' ? 'Composer' : payload?.type === 'external' ? 'External' : 'Standalone'} Draft`,
    savedAt: savedAt || new Date().toISOString(),
    payload,
  });

  const downloadModuleManagerDraftFile = (draft) => {
    if (!draft || !draft.payload) return false;
    try {
      const payload = {
        kind: 'course-factory-module-draft',
        version: 1,
        exportedAt: new Date().toISOString(),
        draft,
      };
      const filenameBase = (draft.label || draft.id || 'module-draft').replace(/[^a-z0-9._ -]/gi, '_').trim() || 'module-draft';
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filenameBase}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 500);
      return true;
    } catch (err) {
      console.error('Failed to download module manager draft:', err);
      return false;
    }
  };

  const saveModuleManagerDraft = ({ overwriteSelected = false } = {}) => {
    try {
      const payload = buildModuleManagerDraftPayload();
      const draftId =
        overwriteSelected && moduleManagerSelectedDraftId
          ? moduleManagerSelectedDraftId
          : `module-draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const existing = moduleManagerSavedDrafts.find((draft) => draft.id === draftId);
      const nextDraft = buildModuleManagerDraftRecord({
        id: draftId,
        payload,
        label: existing?.label || undefined,
      });
      const withoutCurrent = moduleManagerSavedDrafts.filter((draft) => draft.id !== draftId);
      persistModuleManagerSavedDrafts([nextDraft, ...withoutCurrent]);
      setModuleManagerSelectedDraftId(nextDraft.id);
      if (moduleManagerDownloadDraftOnSave) {
        downloadModuleManagerDraftFile(nextDraft);
      }
      const message = overwriteSelected && existing ? `Updated draft "${nextDraft.label}".` : `Saved draft "${nextDraft.label}".`;
      showModuleManagerNotice('success', message);
    } catch (err) {
      showModuleManagerNotice('error', `Failed to save draft: ${err.message}`, 2800);
    }
  };

  const updateModuleManagerSelectedDraft = () => {
    if (!moduleManagerSelectedDraftId) {
      showModuleManagerNotice('error', 'Select a draft to update.', 1800);
      return;
    }
    saveModuleManagerDraft({ overwriteSelected: true });
  };

  const loadModuleManagerDraft = () => {
    const draft = moduleManagerSavedDrafts.find((entry) => entry.id === moduleManagerSelectedDraftId);
    if (!draft) {
      showModuleManagerNotice('error', 'Select a saved draft to load.', 1800);
      return;
    }
    const loaded = applyModuleManagerDraftPayload(draft.payload);
    if (!loaded) {
      showModuleManagerNotice('error', 'Selected draft is invalid and could not be loaded.', 2400);
      return;
    }
    showModuleManagerNotice('success', `Loaded draft "${draft.label}".`);
  };

  const triggerModuleManagerDraftImport = () => {
    if (!moduleManagerDraftImportRef.current) return;
    moduleManagerDraftImportRef.current.value = '';
    moduleManagerDraftImportRef.current.click();
  };

  const exportModuleManagerSelectedDraft = () => {
    const draft = moduleManagerSavedDrafts.find((entry) => entry.id === moduleManagerSelectedDraftId);
    if (!draft) {
      showModuleManagerNotice('error', 'Select a saved draft to export.', 2000);
      return;
    }
    const downloaded = downloadModuleManagerDraftFile(draft);
    if (!downloaded) {
      showModuleManagerNotice('error', 'Could not export selected draft.', 2200);
      return;
    }
    showModuleManagerNotice('success', `Exported draft "${draft.label}".`, 1600);
  };

  const importModuleManagerDraftFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const rawText = await file.text();
      const parsed = JSON.parse(rawText);

      const mergeAndSelectDraft = (draftRecord) => {
        if (!draftRecord || typeof draftRecord !== 'object' || !draftRecord.payload) return false;
        const normalizedDraft = buildModuleManagerDraftRecord({
          id: draftRecord.id,
          payload: draftRecord.payload,
          label: draftRecord.label,
          savedAt: draftRecord.savedAt,
        });
        const nextDrafts = [normalizedDraft, ...moduleManagerSavedDrafts.filter((entry) => entry.id !== normalizedDraft.id)];
        persistModuleManagerSavedDrafts(nextDrafts);
        setModuleManagerSelectedDraftId(normalizedDraft.id);
        return true;
      };

      let importedPayload = null;
      let importedDraftRecord = null;

      if (parsed && typeof parsed === 'object' && parsed.kind === 'course-factory-module-draft' && parsed.draft?.payload) {
        importedDraftRecord = parsed.draft;
        importedPayload = parsed.draft.payload;
      } else if (parsed && typeof parsed === 'object' && parsed.payload && typeof parsed.payload === 'object') {
        importedDraftRecord = parsed;
        importedPayload = parsed.payload;
      } else if (Array.isArray(parsed)) {
        const candidates = parsed.filter((entry) => entry && typeof entry === 'object' && entry.payload);
        if (!candidates.length) {
          showModuleManagerNotice('error', 'No valid drafts found in file.', 2400);
          return;
        }
        const merged = [
          ...candidates.map((entry) =>
            buildModuleManagerDraftRecord({
              id: entry.id,
              payload: entry.payload,
              label: entry.label,
              savedAt: entry.savedAt,
            }),
          ),
          ...moduleManagerSavedDrafts,
        ];
        const uniqueById = [];
        const seen = new Set();
        merged.forEach((entry) => {
          if (!entry?.id || seen.has(entry.id)) return;
          seen.add(entry.id);
          uniqueById.push(entry);
        });
        const persisted = persistModuleManagerSavedDrafts(uniqueById);
        const firstImported = persisted[0];
        if (firstImported) {
          setModuleManagerSelectedDraftId(firstImported.id);
          applyModuleManagerDraftPayload(firstImported.payload);
          showModuleManagerNotice('success', `Imported ${candidates.length} drafts from file.`);
        }
        return;
      } else if (parsed && typeof parsed === 'object') {
        importedPayload = parsed;
        importedDraftRecord = {
          id: `module-draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          label: file.name.replace(/\.[^.]+$/, '') || 'Imported Draft',
          savedAt: new Date().toISOString(),
          payload: parsed,
        };
      }

      if (!importedPayload || !importedDraftRecord) {
        showModuleManagerNotice('error', 'File format not recognized for module drafts.', 2600);
        return;
      }

      const loaded = applyModuleManagerDraftPayload(importedPayload);
      if (!loaded) {
        showModuleManagerNotice('error', 'Imported draft is invalid and could not be loaded.', 2600);
        return;
      }

      mergeAndSelectDraft(importedDraftRecord);
      showModuleManagerNotice('success', `Imported and loaded "${importedDraftRecord.label || 'draft'}".`);
    } catch (err) {
      showModuleManagerNotice('error', `Failed to import draft file: ${err.message}`, 3000);
    }
  };

  const deleteModuleManagerDraft = () => {
    if (!moduleManagerSelectedDraftId) {
      showModuleManagerNotice('error', 'Select a draft to delete.', 1800);
      return;
    }
    const nextDrafts = moduleManagerSavedDrafts.filter((draft) => draft.id !== moduleManagerSelectedDraftId);
    persistModuleManagerSavedDrafts(nextDrafts);
    setModuleManagerSelectedDraftId(nextDrafts[0]?.id || '');
    showModuleManagerNotice('success', 'Draft deleted.', 1800);
  };

  const resetModuleManagerBuilder = () => {
    const confirmed = window.confirm(
      'Reset Module Manager builder?\n\nThis clears the current unsaved module setup.\n\nContinue?',
    );
    if (!confirmed) return;

    setModuleManagerType('standalone');
    setModuleManagerID('');
    setModuleManagerTitle('');
    setModuleManagerHTML('');
    setModuleManagerURL('');
    setModuleManagerLinkType('iframe');
    setModuleManagerComposerLayout({ maxColumns: 1 });
    setModuleManagerComposerActivities(
      normalizeComposerActivities([buildComposerStarterActivity(moduleManagerComposerStarterType)], {
        maxColumns: 1,
      }),
    );
    setModuleManagerComposerExtraRows(0);
    setModuleManagerComposerSelectedIndex(0);
    setModuleManagerComposerDraggingIndex(null);
    setModuleManagerComposerDragOverIndex(null);
    setModuleManagerComposerDragOverSlotKey(null);
    setModuleManagerStatus('success');
    setModuleManagerMessage('Builder reset.');
    setTimeout(() => {
      setModuleManagerStatus(null);
      setModuleManagerMessage('');
    }, 1800);
  };

  useEffect(() => {
    try {
      const rawDrafts = localStorage.getItem(MODULE_MANAGER_SAVED_DRAFTS_KEY);
      if (rawDrafts) {
        const parsed = JSON.parse(rawDrafts);
        if (Array.isArray(parsed)) {
          const sanitized = parsed
            .filter((draft) => draft && typeof draft === 'object' && draft.id && draft.payload)
            .slice(0, MODULE_MANAGER_MAX_SAVED_DRAFTS);
          setModuleManagerSavedDrafts(sanitized);
          if (sanitized.length > 0) {
            setModuleManagerSelectedDraftId(sanitized[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load module manager drafts:', err);
    }

    try {
      const rawAutosave = localStorage.getItem(MODULE_MANAGER_AUTOSAVE_KEY);
      if (!rawAutosave) return;
      const parsedAutosave = JSON.parse(rawAutosave);
      if (!parsedAutosave || typeof parsedAutosave !== 'object') return;
      const restored = applyModuleManagerDraftPayload(parsedAutosave.payload);
      if (restored) {
        setModuleManagerStatus('success');
        setModuleManagerMessage('Module manager autosave restored.');
        setTimeout(() => {
          setModuleManagerStatus(null);
          setModuleManagerMessage('');
        }, 2200);
      }
    } catch (err) {
      console.error('Failed to restore module manager autosave:', err);
    }
  }, []);

  useEffect(() => {
    const payload = buildModuleManagerDraftPayload();
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          MODULE_MANAGER_AUTOSAVE_KEY,
          JSON.stringify({
            savedAt: new Date().toISOString(),
            payload,
          }),
        );
      } catch (err) {
        console.error('Failed to write module manager autosave:', err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [
    moduleManagerType,
    moduleManagerID,
    moduleManagerTitle,
    moduleManagerHTML,
    moduleManagerURL,
    moduleManagerLinkType,
    moduleManagerComposerStarterType,
    moduleManagerComposerLayout,
    moduleManagerComposerActivities,
    moduleManagerComposerExtraRows,
    moduleManagerComposerSelectedIndex,
  ]);

  useEffect(() => {
    if (moduleManagerType !== 'composer') return;
    if (moduleManagerComposerActivities.length > 0) return;
    setModuleManagerComposerActivities(
      normalizeComposerActivities([buildComposerStarterActivity(moduleManagerComposerStarterType)], {
        maxColumns: moduleManagerComposerMaxColumns,
      }),
    );
    setModuleManagerComposerSelectedIndex(0);
  }, [moduleManagerType, moduleManagerComposerActivities.length, moduleManagerComposerStarterType, moduleManagerComposerMaxColumns]);

  useEffect(() => {
    if (moduleManagerComposerSelectedIndex > moduleManagerComposerActivities.length - 1) {
      setModuleManagerComposerSelectedIndex(Math.max(moduleManagerComposerActivities.length - 1, 0));
    }
  }, [moduleManagerComposerActivities.length, moduleManagerComposerSelectedIndex]);

  useEffect(() => {
    if (!moduleManagerResourceMaterialId && moduleBankMaterials.length > 0) {
      setModuleManagerResourceMaterialId(moduleBankMaterials[0].id);
    }
  }, [moduleBankMaterials, moduleManagerResourceMaterialId]);

  useEffect(() => {
    if (moduleBankImageAssets.length === 0) {
      if (moduleManagerImageMaterialId) setModuleManagerImageMaterialId('');
      return;
    }
    if (!moduleManagerImageMaterialId || !moduleBankImageAssets.some((asset) => asset.id === moduleManagerImageMaterialId)) {
      setModuleManagerImageMaterialId(moduleBankImageAssets[0].id);
    }
  }, [moduleBankImageAssets, moduleManagerImageMaterialId]);

  useEffect(() => {
    if (!moduleManagerAssessmentId && moduleBankAssessments.length > 0) {
      setModuleManagerAssessmentId(moduleBankAssessments[0].id);
    }
  }, [moduleBankAssessments, moduleManagerAssessmentId]);

  useEffect(() => {
    if (moduleManagerType !== 'composer') return;
    setModuleManagerComposerPreviewNonce((n) => n + 1);
  }, [moduleManagerType]);

  useEffect(() => {
    setModuleManagerComposerDraggingIndex(null);
    setModuleManagerComposerDragOverIndex(null);
    setModuleManagerComposerDragOverSlotKey(null);
  }, [moduleManagerType, moduleManagerComposerActivities.length]);

  useEffect(
    () => () => {
      if (moduleManagerRichEditorUpdateTimerRef.current) {
        clearTimeout(moduleManagerRichEditorUpdateTimerRef.current);
        moduleManagerRichEditorUpdateTimerRef.current = null;
      }
    },
    [],
  );

  const selectedComposerActivity = moduleManagerComposerActivities[moduleManagerComposerSelectedIndex] || null;
  const selectedComposerPlacement = selectedComposerActivity
    ? moduleManagerPlacementByIndex.get(moduleManagerComposerSelectedIndex) || null
    : null;

  useEffect(() => {
    if (moduleManagerRichEditorUpdateTimerRef.current) {
      clearTimeout(moduleManagerRichEditorUpdateTimerRef.current);
      moduleManagerRichEditorUpdateTimerRef.current = null;
    }
  }, [moduleManagerComposerSelectedIndex, moduleManagerType]);

  useEffect(() => {
    const editor = moduleManagerRichEditorRef.current;
    const richConfig = getComposerRichEditorConfig(selectedComposerActivity);
    if (!editor || !selectedComposerActivity || !richConfig) return;
    const data = selectedComposerActivity.data || {};
    const bodyMode = data[richConfig.modeKey] === 'plain' ? 'plain' : 'rich';
    if (bodyMode !== 'rich') return;
    const nextHtml = data[richConfig.htmlKey] || escapeEditorHtml(data[richConfig.textKey] || '').replace(/\n/g, '<br>');
    if (document.activeElement !== editor && editor.innerHTML !== nextHtml) {
      editor.innerHTML = nextHtml;
    }
  }, [
    selectedComposerActivity?.id,
    selectedComposerActivity?.type,
    selectedComposerActivity?.data?.bodyMode,
    selectedComposerActivity?.data?.bodyHtml,
    selectedComposerActivity?.data?.body,
    selectedComposerActivity?.data?.textMode,
    selectedComposerActivity?.data?.textHtml,
    selectedComposerActivity?.data?.text,
  ]);

  const moduleManagerComposerPreviewDoc = useMemo(() => {
    if (moduleManagerType !== 'composer') return '';
    const courseSettings = projectData?.['Course Settings'] || {};
    const rawId = moduleManagerID.trim();
    const moduleId = rawId ? (rawId.startsWith('view-') ? rawId : `view-${rawId}`) : 'view-composer-preview';
    const title = moduleManagerTitle.trim() || moduleId.replace('view-', '').replace(/-/g, ' ') || 'Composer Preview';
    const previewModule = {
      id: moduleId,
      title,
      type: 'standalone',
      mode: 'composer',
      composerLayout: { maxColumns: moduleManagerComposerMaxColumns },
      activities: moduleManagerComposerActivities,
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
  }, [moduleManagerComposerActivities, moduleManagerComposerMaxColumns, moduleManagerID, moduleManagerTitle, moduleManagerType, projectData]);

  const phase1MaterialCompiledPreviewDoc = useMemo(() => {
    if (!phase1MaterialPreview) return '';
    const courseSettings = projectData?.['Course Settings'] || {};
    const previewMaterial = {
      ...phase1MaterialPreview,
      hidden: false,
      order: 0,
    };
    const previewModule = {
      id: 'item-materials-preview',
      title: 'Course Materials',
      type: 'legacy',
      code: { id: 'view-materials', html: '', script: '' },
      materials: [previewMaterial],
    };
    return (
      buildModuleFrameHTML(previewModule, {
        ...courseSettings,
        __courseName: courseSettings.courseName || projectData?.['Current Course']?.name || 'Course',
        __toolkit: projectData?.['Global Toolkit'] || [],
        __materials: [previewMaterial],
        ignoreAssetBaseUrl: true,
      }) || ''
    );
  }, [phase1MaterialPreview, projectData]);

  const updateComposerActivities = (nextActivities, nextLayout = moduleManagerComposerLayout) => {
    const normalizedLayout = normalizeComposerLayout(nextLayout);
    const normalizedActivities = normalizeComposerActivities(nextActivities, {
      maxColumns: normalizedLayout.maxColumns,
    });
    setModuleManagerComposerLayout(normalizedLayout);
    setModuleManagerComposerActivities(normalizedActivities);
  };

  const updateComposerMaxColumns = (nextColumns) => {
    const normalizedLayout = normalizeComposerLayout({
      ...(moduleManagerComposerLayout || {}),
      maxColumns: nextColumns,
    });
    updateComposerActivities(moduleManagerComposerActivities, normalizedLayout);
  };

  const updateSelectedComposerActivityData = (updates) => {
    if (!selectedComposerActivity) return;
    const nextActivities = moduleManagerComposerActivities.map((activity, idx) =>
      idx === moduleManagerComposerSelectedIndex
        ? {
            ...activity,
            data: {
              ...(activity.data || {}),
              ...updates,
            },
          }
        : activity,
    );
    updateComposerActivities(nextActivities);
  };

  const replaceSelectedComposerActivityData = (nextData) => {
    if (!selectedComposerActivity) return;
    const nextActivities = moduleManagerComposerActivities.map((activity, idx) =>
      idx === moduleManagerComposerSelectedIndex
        ? {
            ...activity,
            data: nextData && typeof nextData === 'object' ? nextData : {},
          }
        : activity,
    );
    updateComposerActivities(nextActivities);
  };

  const addComposerActivityDraft = () => {
    const nextActivity = buildComposerStarterActivity(moduleManagerComposerStarterType);
    const maxRow = moduleManagerGridModel.placements.reduce((largest, placement) => Math.max(largest, placement.row), 0);
    nextActivity.layout = {
      ...(nextActivity.layout || {}),
      colSpan: clampComposerColSpan(nextActivity?.layout?.colSpan, moduleManagerComposerMaxColumns),
      row: Math.max(1, maxRow + 1),
      col: 1,
    };
    const nextActivities = [...moduleManagerComposerActivities, nextActivity];
    updateComposerActivities(nextActivities);
    setModuleManagerComposerSelectedIndex(nextActivities.length - 1);
  };

  const addComposerEmptyRowDraft = () => {
    setModuleManagerComposerExtraRows((count) => Math.min(50, count + 1));
  };

  const removeSelectedComposerActivityDraft = () => {
    if (!selectedComposerActivity) return;
    const nextActivities = moduleManagerComposerActivities.filter((_, idx) => idx !== moduleManagerComposerSelectedIndex);
    updateComposerActivities(nextActivities);
  };

  const moveSelectedComposerActivityDraft = (direction) => {
    if (!selectedComposerActivity || !selectedComposerPlacement) return;
    const colSpan = clampComposerColSpan(selectedComposerActivity?.layout?.colSpan, moduleManagerComposerMaxColumns);
    const maxStartCol = Math.max(1, moduleManagerComposerMaxColumns - colSpan + 1);
    let targetRow = selectedComposerPlacement.row;
    let targetCol = selectedComposerPlacement.col;

    if (direction === 'left') targetCol = Math.max(1, targetCol - 1);
    if (direction === 'right') targetCol = Math.min(maxStartCol, targetCol + 1);
    if (direction === 'up') targetRow = Math.max(1, targetRow - 1);
    if (direction === 'down') targetRow += 1;

    const result = moveComposerActivityToCell(
      moduleManagerComposerActivities,
      moduleManagerComposerSelectedIndex,
      targetRow,
      targetCol,
      { maxColumns: moduleManagerComposerMaxColumns },
    );
    if (!result.changed) return;
    updateComposerActivities(result.activities);
    setModuleManagerComposerSelectedIndex(moduleManagerComposerSelectedIndex);
  };

  const moveComposerActivityToGridCell = (fromIndex, targetRow, targetCol) => {
    if (!Number.isInteger(fromIndex) || !Number.isInteger(targetRow) || !Number.isInteger(targetCol)) return;
    const result = moveComposerActivityToCell(moduleManagerComposerActivities, fromIndex, targetRow, targetCol, {
      maxColumns: moduleManagerComposerMaxColumns,
    });
    if (!result.changed) return;
    updateComposerActivities(result.activities);
    setModuleManagerComposerSelectedIndex(fromIndex);
  };

  const duplicateSelectedComposerActivityDraft = () => {
    if (!selectedComposerActivity) return;
    const basePlacement = selectedComposerPlacement || { row: 1, col: 1 };
    const duplicate = {
      ...selectedComposerActivity,
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      data: {
        ...(selectedComposerActivity.data || {}),
      },
      layout: {
        ...(selectedComposerActivity.layout || {}),
        row: basePlacement.row + 1,
        col: basePlacement.col,
      },
    };
    const nextActivities = [...moduleManagerComposerActivities];
    nextActivities.push(duplicate);
    updateComposerActivities(nextActivities);
    setModuleManagerComposerSelectedIndex(nextActivities.length - 1);
  };

  const updateSelectedComposerActivitySpan = (nextSpan) => {
    if (!selectedComposerActivity) return;
    const clamped = clampComposerColSpan(nextSpan, moduleManagerComposerMaxColumns);
    const nextActivities = moduleManagerComposerActivities.map((activity, idx) =>
      idx === moduleManagerComposerSelectedIndex
        ? {
            ...activity,
            layout: {
              ...(activity.layout || {}),
              colSpan: clamped,
            },
          }
        : activity,
    );
    updateComposerActivities(nextActivities);
  };

  const queueModuleManagerRichEditorUpdate = (html, text, immediate = false) => {
    const richConfig = getComposerRichEditorConfig(selectedComposerActivity);
    if (!richConfig) return;
    if (moduleManagerRichEditorUpdateTimerRef.current) {
      clearTimeout(moduleManagerRichEditorUpdateTimerRef.current);
      moduleManagerRichEditorUpdateTimerRef.current = null;
    }
    const applyUpdate = () => {
      updateSelectedComposerActivityData({
        [richConfig.modeKey]: 'rich',
        [richConfig.htmlKey]: html,
        [richConfig.textKey]: text,
      });
    };
    if (immediate) {
      applyUpdate();
      return;
    }
    moduleManagerRichEditorUpdateTimerRef.current = setTimeout(() => {
      moduleManagerRichEditorUpdateTimerRef.current = null;
      applyUpdate();
    }, 140);
  };

  const captureModuleManagerRichSelection = () => {
    const editor = moduleManagerRichEditorRef.current;
    const selection = typeof window !== 'undefined' && window.getSelection ? window.getSelection() : null;
    if (!editor || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    moduleManagerRichEditorSelectionRef.current = range.cloneRange();
  };

  const restoreModuleManagerRichSelection = () => {
    const range = moduleManagerRichEditorSelectionRef.current;
    const selection = typeof window !== 'undefined' && window.getSelection ? window.getSelection() : null;
    if (!range || !selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const runModuleManagerRichEditorCommand = (command, value = null) => {
    if (!moduleManagerRichEditorRef.current) return;
    moduleManagerRichEditorRef.current.focus();
    restoreModuleManagerRichSelection();
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
    const html = moduleManagerRichEditorRef.current.innerHTML || '';
    const text = moduleManagerRichEditorRef.current.innerText || '';
    captureModuleManagerRichSelection();
    queueModuleManagerRichEditorUpdate(html, text, true);
  };

  const preserveModuleManagerRichSelection = (event) => {
    event.preventDefault();
  };

  const renderSelectedComposerActivityStylePanel = () => {
    if (!selectedComposerActivity) return null;
    const data = selectedComposerActivity.data || {};
    const themeValue = normalizeThemeValue(data.blockTheme);
    const themePreview = getThemePreviewColors(themeValue);
    const effectiveFill =
      data.blockContainerBg ||
      data.containerBg ||
      (selectedComposerActivity.type === 'title_block' ? '#1e1b4b' : themePreview.containerBg || '#0f172a');
    const effectiveTextColor = data.blockTextColor || themePreview.textColor || '#e2e8f0';
    return (
      <div className="mb-3 rounded-lg border border-slate-700 bg-slate-900/60 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-300">Block Style</p>
          <button
            type="button"
            onClick={() =>
              updateSelectedComposerActivityData({
                blockTheme: 'default',
                blockFontFamily: '',
                blockTextColor: '',
                blockContainerBg: '',
              })
            }
            className="rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-200"
            title="Reset this block to default style"
          >
            Reset Style
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Theme</label>
            <select
              value={themeValue}
              onChange={(e) => updateSelectedComposerActivityData({ blockTheme: e.target.value })}
              className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-white"
            >
              {BLOCK_THEME_OPTIONS.map((themeOption) => (
                <option key={`block-theme-${themeOption.value}`} value={themeOption.value}>
                  {themeOption.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Font Family</label>
            <select
              value={data.blockFontFamily || ''}
              onChange={(e) => updateSelectedComposerActivityData({ blockFontFamily: e.target.value })}
              className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-white"
            >
              <option value="">Default</option>
              {RICH_EDITOR_FONT_OPTIONS.map((fontOption) => (
                <option key={`block-font-${fontOption.value}`} value={fontOption.value} style={{ fontFamily: fontOption.value }}>
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
              onChange={(e) => updateSelectedComposerActivityData({ blockTextColor: e.target.value })}
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
              onChange={(e) => updateSelectedComposerActivityData({ blockContainerBg: e.target.value })}
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

  const renderModuleManagerComposerActivityEditor = () => {
    if (!selectedComposerActivity) {
      return <p className="text-xs text-slate-500">Select an activity to edit.</p>;
    }

    const data = selectedComposerActivity.data || {};
    if (selectedComposerActivity.type === 'content_block' || selectedComposerActivity.type === 'title_block') {
      const richConfig = getComposerRichEditorConfig(selectedComposerActivity);
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
                onChange={(e) => updateSelectedComposerActivityData({ [richConfig.titleInputKey]: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
              />
            </div>
          ) : null}
          {selectedComposerActivity.type === 'title_block' ? (
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <label className="block text-xs font-bold text-slate-300 mb-1">Alignment</label>
                <select
                  value={data.align || 'left'}
                  onChange={(e) => updateSelectedComposerActivityData({ align: e.target.value })}
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
                  onClick={() => updateSelectedComposerActivityData({ [richConfig.modeKey]: 'rich' })}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${bodyMode === 'rich' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Rich
                </button>
                <button
                  type="button"
                  onClick={() => updateSelectedComposerActivityData({ [richConfig.modeKey]: 'plain' })}
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
                  updateSelectedComposerActivityData({
                    [richConfig.modeKey]: 'plain',
                    [richConfig.textKey]: e.target.value,
                  })
                }
                className={`w-full ${richConfig.plainRowsClass} bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm`}
              />
            ) : (
              <div className="rounded border border-slate-700 bg-slate-950 overflow-hidden">
                <div className="flex flex-wrap gap-1 p-2 border-b border-slate-700 bg-slate-900/80">
                  <button type="button" onMouseDown={preserveModuleManagerRichSelection} onClick={() => runModuleManagerRichEditorCommand('bold')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold">B</button>
                  <button type="button" onMouseDown={preserveModuleManagerRichSelection} onClick={() => runModuleManagerRichEditorCommand('italic')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs italic">I</button>
                  <button type="button" onMouseDown={preserveModuleManagerRichSelection} onClick={() => runModuleManagerRichEditorCommand('underline')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs underline">U</button>
                  <button type="button" onMouseDown={preserveModuleManagerRichSelection} onClick={() => runModuleManagerRichEditorCommand('formatBlock', 'P')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs">P</button>
                  <button type="button" onMouseDown={preserveModuleManagerRichSelection} onClick={() => runModuleManagerRichEditorCommand('formatBlock', 'H2')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold">H2</button>
                  <button type="button" onMouseDown={preserveModuleManagerRichSelection} onClick={() => runModuleManagerRichEditorCommand('formatBlock', 'H3')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold">H3</button>
                  <button type="button" onMouseDown={preserveModuleManagerRichSelection} onClick={() => runModuleManagerRichEditorCommand('fontSize', '2')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs">A-</button>
                  <button type="button" onMouseDown={preserveModuleManagerRichSelection} onClick={() => runModuleManagerRichEditorCommand('fontSize', '3')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs">A</button>
                  <button type="button" onMouseDown={preserveModuleManagerRichSelection} onClick={() => runModuleManagerRichEditorCommand('fontSize', '5')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs">A+</button>
                  <button type="button" onMouseDown={preserveModuleManagerRichSelection} onClick={() => runModuleManagerRichEditorCommand('insertUnorderedList')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs">• List</button>
                  <button type="button" onMouseDown={preserveModuleManagerRichSelection} onClick={() => runModuleManagerRichEditorCommand('insertOrderedList')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs">1. List</button>
                  <button
                    type="button"
                    onMouseDown={preserveModuleManagerRichSelection}
                    onClick={() => {
                      const url = window.prompt('Enter URL');
                      if (!url) return;
                      runModuleManagerRichEditorCommand('createLink', url);
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs"
                  >
                    Link
                  </button>
                  <button type="button" onMouseDown={preserveModuleManagerRichSelection} onClick={() => runModuleManagerRichEditorCommand('removeFormat')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs">Clear</button>
                </div>
                <div className="px-2 pb-2 bg-slate-900/80 border-b border-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        const font = e.target.value;
                        if (!font) return;
                        runModuleManagerRichEditorCommand('fontName', font);
                      }}
                      className="w-full rounded bg-slate-800 border border-slate-700 px-2 py-1 text-[11px] text-white"
                      aria-label="Font family"
                    >
                      <option value="">Font Family</option>
                      {RICH_EDITOR_FONT_OPTIONS.map((fontOption) => (
                        <option key={`composer-font-${fontOption.value}`} value={fontOption.value} style={{ fontFamily: fontOption.value }}>
                          {fontOption.label}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center justify-between rounded bg-slate-800 border border-slate-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                      <span>Text Color</span>
                      <input
                        type="color"
                        defaultValue="#e2e8f0"
                        onChange={(e) => runModuleManagerRichEditorCommand('foreColor', e.target.value)}
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
                          data.blockContainerBg || data.containerBg,
                          selectedComposerActivity.type === 'title_block' ? '#1e1b4b' : '#0f172a',
                        )}
                        onChange={(e) => updateSelectedComposerActivityData({ blockContainerBg: e.target.value })}
                        className="h-6 w-10 cursor-pointer border border-slate-600 rounded bg-transparent"
                        title="Set block container background color"
                        aria-label="Set block container background color"
                      />
                    </label>
                  </div>
                </div>
                <div
                  ref={moduleManagerRichEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(event) => {
                    const html = event.currentTarget.innerHTML || '';
                    const text = event.currentTarget.innerText || '';
                    captureModuleManagerRichSelection();
                    queueModuleManagerRichEditorUpdate(html, text);
                  }}
                  onMouseUp={captureModuleManagerRichSelection}
                  onKeyUp={captureModuleManagerRichSelection}
                  onBlur={(event) => {
                    const html = event.currentTarget.innerHTML || '';
                    const text = event.currentTarget.innerText || '';
                    captureModuleManagerRichSelection();
                    queueModuleManagerRichEditorUpdate(html, text, true);
                  }}
                  className="cf-rich-editor min-h-[180px] p-3 text-sm text-white outline-none"
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    if (selectedComposerActivity.type === 'embed_block') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Embed URL</label>
            <input
              type="text"
              value={data.url || ''}
              onChange={(e) => updateSelectedComposerActivityData({ url: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Caption</label>
            <input
              type="text"
              value={data.caption || ''}
              onChange={(e) => updateSelectedComposerActivityData({ caption: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
        </div>
      );
    }

    if (selectedComposerActivity.type === 'resource_list') {
      const items = Array.isArray(data.items) ? data.items : [];
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">List Title</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateSelectedComposerActivityData({ title: e.target.value })}
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
                    updateSelectedComposerActivityData({ items: nextItems });
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
                    updateSelectedComposerActivityData({ items: nextItems });
                  }}
                  className="col-span-3 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                  placeholder="View URL"
                />
                <button
                  type="button"
                  onClick={() => {
                    setVaultTargetField({ target: 'composer-resource', itemIndex: idx, field: 'viewUrl' });
                    setIsVaultOpen(true);
                  }}
                  className="col-span-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded p-2 text-slate-200 flex items-center justify-center"
                  title="Select view URL from vault"
                >
                  <FolderOpen size={12} />
                </button>
                <input
                  type="text"
                  value={item?.downloadUrl || item?.url || ''}
                  onChange={(e) => {
                    const nextItems = [...items];
                    nextItems[idx] = { ...(nextItems[idx] || {}), downloadUrl: e.target.value };
                    updateSelectedComposerActivityData({ items: nextItems });
                  }}
                  className="col-span-3 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                  placeholder="Download URL"
                />
                <button
                  type="button"
                  onClick={() => {
                    setVaultTargetField({ target: 'composer-resource', itemIndex: idx, field: 'downloadUrl' });
                    setIsVaultOpen(true);
                  }}
                  className="col-span-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded p-2 text-slate-200 flex items-center justify-center"
                  title="Select download URL from vault"
                >
                  <FolderOpen size={12} />
                </button>
                <button
                  onClick={() => {
                    const nextItems = items.filter((_, itemIdx) => itemIdx !== idx);
                    updateSelectedComposerActivityData({ items: nextItems });
                  }}
                  className="col-span-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs"
                  type="button"
                  title="Remove resource"
                >
                  <Trash2 size={12} className="mx-auto" />
                </button>
                <input
                  type="text"
                  value={item?.description || ''}
                  onChange={(e) => {
                    const nextItems = [...items];
                    nextItems[idx] = { ...(nextItems[idx] || {}), description: e.target.value };
                    updateSelectedComposerActivityData({ items: nextItems });
                  }}
                  className="col-span-12 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                  placeholder="Optional description"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateSelectedComposerActivityData({ items: [...items, { label: '', viewUrl: '', downloadUrl: '', description: '' }] })}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white font-bold inline-flex items-center gap-1"
            >
              <Plus size={12} /> Add Resource
            </button>
            <div className="pt-3 border-t border-slate-700">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Add From Module Bank</label>
              <div className="grid grid-cols-12 gap-2">
                <select
                  value={moduleManagerResourceMaterialId}
                  onChange={(e) => setModuleManagerResourceMaterialId(e.target.value)}
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
                    const selected = moduleBankMaterials.find((mat) => mat.id === moduleManagerResourceMaterialId);
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
                    updateSelectedComposerActivityData({ items: nextItems });
                  }}
                  disabled={!moduleManagerResourceMaterialId || moduleBankMaterials.length === 0}
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

    if (selectedComposerActivity.type === 'knowledge_check') {
      const options = Array.isArray(data.options) ? data.options : [];
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Prompt</label>
            <textarea
              value={data.prompt || ''}
              onChange={(e) => updateSelectedComposerActivityData({ prompt: e.target.value })}
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
                      updateSelectedComposerActivityData({ options: nextOptions });
                    }}
                    className="col-span-10 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                  />
                  <input
                    type="radio"
                    name="builder-kc-correct"
                    checked={(data.correctIndex || 0) === idx}
                    onChange={() => updateSelectedComposerActivityData({ correctIndex: idx })}
                    className="col-span-1 self-center"
                    title="Correct answer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nextOptions = options.filter((_, optionIdx) => optionIdx !== idx);
                      updateSelectedComposerActivityData({
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
                onClick={() => updateSelectedComposerActivityData({ options: [...options, ''] })}
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
              onChange={(e) => updateSelectedComposerActivityData({ shortAnswerPrompt: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
        </div>
      );
    }

    if (selectedComposerActivity.type === 'image_block') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Image URL</label>
            <input
              type="text"
              value={data.url || ''}
              onChange={(e) => updateSelectedComposerActivityData({ url: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
              placeholder="https://... or /assets/image.jpg"
            />
            <div className="grid grid-cols-12 gap-2 mt-2">
              <select
                value={moduleManagerImageMaterialId}
                onChange={(e) => setModuleManagerImageMaterialId(e.target.value)}
                className="col-span-8 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
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
                  const selected = moduleBankImageAssets.find((asset) => asset.id === moduleManagerImageMaterialId);
                  if (!selected) return;
                  updateSelectedComposerActivityData({
                    url: selected.url,
                    alt: data.alt || selected.alt || '',
                  });
                }}
                disabled={!moduleManagerImageMaterialId || moduleBankImageAssets.length === 0}
                className="col-span-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-bold text-white"
              >
                Use
              </button>
              <button
                type="button"
                onClick={() => {
                  setVaultTargetField({ target: 'composer-image' });
                  setIsVaultOpen(true);
                }}
                className="col-span-2 rounded bg-slate-700 hover:bg-slate-600 border border-slate-600 text-xs font-bold text-white inline-flex items-center justify-center gap-1"
                title="Browse Local Vault"
              >
                <FolderOpen size={11} /> Vault
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              For offline modules, use local paths like `/materials/...` from your vault/material library.
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Alt Text</label>
            <input
              type="text"
              value={data.alt || ''}
              onChange={(e) => updateSelectedComposerActivityData({ alt: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Caption</label>
            <input
              type="text"
              value={data.caption || ''}
              onChange={(e) => updateSelectedComposerActivityData({ caption: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Display Width</label>
            <select
              value={data.width || 'full'}
              onChange={(e) => updateSelectedComposerActivityData({ width: e.target.value })}
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

    if (selectedComposerActivity.type === 'assessment_embed') {
      const items = Array.isArray(data.items) ? data.items : [];
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Block Title</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateSelectedComposerActivityData({ title: e.target.value })}
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
                  onClick={() => updateSelectedComposerActivityData({ items: items.filter((_, itemIdx) => itemIdx !== idx) })}
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
              value={moduleManagerAssessmentId}
              onChange={(e) => setModuleManagerAssessmentId(e.target.value)}
              className="col-span-9 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
            >
              {moduleBankAssessments.length === 0 && <option value="">No saved assessments</option>}
              {moduleBankAssessments.map((assessment) => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.title || assessment.id}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                const selected = moduleBankAssessments.find((assessment) => assessment.id === moduleManagerAssessmentId);
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
                updateSelectedComposerActivityData({ items: nextItems });
              }}
              disabled={!moduleManagerAssessmentId || moduleBankAssessments.length === 0}
              className="col-span-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded text-xs font-bold text-white"
            >
              Add
            </button>
          </div>
        </div>
      );
    }

    if (selectedComposerActivity.type === 'spacer_block') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Spacer Height (px)</label>
            <input
              type="number"
              min="0"
              max="600"
              value={Number.isFinite(Number(data.height)) ? data.height : 48}
              onChange={(e) => updateSelectedComposerActivityData({ height: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Optional utility block. You can also keep rows open and move blocks directly into empty grid cells.
          </p>
        </div>
      );
    }

    if (selectedComposerActivity.type === 'submission_builder') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Section Title</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateSelectedComposerActivityData({ title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Button Label</label>
            <input
              type="text"
              value={data.buttonLabel || ''}
              onChange={(e) => updateSelectedComposerActivityData({ buttonLabel: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
        </div>
      );
    }

    if (selectedComposerActivity.type === 'save_load_block') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Section Title</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateSelectedComposerActivityData({ title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
            <textarea
              value={data.description || ''}
              onChange={(e) => updateSelectedComposerActivityData({ description: e.target.value })}
              className="w-full h-20 bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Download Filename</label>
            <input
              type="text"
              value={data.fileName || ''}
              onChange={(e) => updateSelectedComposerActivityData({ fileName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
              placeholder="module-progress"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            This block downloads all learner inputs as JSON and can restore them from an uploaded backup file.
          </p>
        </div>
      );
    }

    const fallbackTemplate = (() => {
      const def = getActivityDefinition(selectedComposerActivity.type);
      if (def && typeof def.createDefaultData === 'function') {
        return def.createDefaultData();
      }
      return data;
    })();

    return <GenericDataEditor data={data} onChange={replaceSelectedComposerActivityData} schemaTemplate={fallbackTemplate} />;
  };

  const addStandaloneModule = () => {
    try {
      if (!moduleManagerID.trim()) {
        setModuleManagerStatus('error');
        setModuleManagerMessage('Please provide a Module ID (e.g., view-focus-phase3)');
        return;
      }
      
      if (!moduleManagerHTML.trim()) {
        setModuleManagerStatus('error');
        setModuleManagerMessage('Please paste your complete HTML file');
        return;
      }
      
      // Ensure ID starts with 'view-'
      const moduleId = moduleManagerID.startsWith('view-') ? moduleManagerID : `view-${moduleManagerID}`;
      
      // Check for duplicate module ID
      const existingModule = projectData["Current Course"].modules?.find(m => m.id === moduleId);
      if (existingModule) {
        setModuleManagerStatus('error');
        setModuleManagerMessage(`Module ID "${moduleId}" already exists! Use a different ID.`);
        return;
      }
      
      // Basic validation: Check if it looks like HTML
      const rawHtml = moduleManagerHTML.trim();
      if (!rawHtml.includes('<') || !rawHtml.includes('>')) {
        setModuleManagerStatus('error');
        setModuleManagerMessage('This does not appear to be valid HTML');
        return;
      }
      
      // Extract title from HTML if not provided
      let title = moduleManagerTitle.trim();
      if (!title) {
        const titleMatch = rawHtml.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
          title = titleMatch[1].trim();
        } else {
          title = moduleId.replace('view-', '').replace(/-/g, ' ');
        }
      }
      
      // Create module object with RAW HTML stored as-is
      // No parsing, no CSS extraction, no script extraction
      // The iframe will handle everything
      const newModule = {
        id: moduleId,
        title: title,
        type: 'standalone',
        mode: 'custom_html',
        activities: [],
        composerLayout: { maxColumns: 1 },
        // Store the COMPLETE raw HTML document - this is the key change
        rawHtml: rawHtml,
        // Keep these for backward compatibility (empty for new modules)
        html: '',
        css: '',
        script: '',
        // History for version tracking
        history: [{
          timestamp: new Date().toISOString(),
          title: title,
          mode: 'custom_html',
          activities: [],
          composerLayout: { maxColumns: 1 },
          rawHtml: rawHtml
        }]
      };
      
      // Add to project
      setProjectData(prev => {
        const newData = { ...prev };
        const currentModules = newData["Current Course"].modules || [];
        newData["Current Course"] = {
          ...newData["Current Course"],
          modules: [...currentModules, newModule]
        };
        return newData;
      });
      
      // Clear state
      setModuleManagerHTML('');
      setModuleManagerID('');
      setModuleManagerTitle('');
      setModuleManagerStatus('success');
      setModuleManagerMessage(`Module "${title}" added successfully. It will run in an isolated iframe.`);
      
      setTimeout(() => {
        setModuleManagerStatus(null);
        setModuleManagerMessage('');
      }, 3000);
      
    } catch (err) {
      setModuleManagerStatus('error');
      setModuleManagerMessage('Error: ' + err.message);
      console.error('Module manager error:', err);
    }
  };

  const addComposerModule = () => {
    try {
      if (!moduleManagerID.trim()) {
        setModuleManagerStatus('error');
        setModuleManagerMessage('Please provide a Module ID (e.g., view-focus-phase3)');
        return;
      }

      // Ensure ID starts with 'view-'
      const moduleId = moduleManagerID.startsWith('view-') ? moduleManagerID : `view-${moduleManagerID}`;

      // Check for duplicate module ID
      const existingModule = projectData["Current Course"].modules?.find(m => m.id === moduleId);
      if (existingModule) {
        setModuleManagerStatus('error');
        setModuleManagerMessage(`Module ID "${moduleId}" already exists! Use a different ID.`);
        return;
      }

      // Derive title from ID when omitted
      const title = moduleManagerTitle.trim() || moduleId.replace('view-', '').replace(/-/g, ' ');
      const composerLayout = normalizeComposerLayout(moduleManagerComposerLayout);
      const composerActivities =
        moduleManagerComposerActivities.length > 0
          ? normalizeComposerActivities(moduleManagerComposerActivities, { maxColumns: composerLayout.maxColumns })
          : normalizeComposerActivities([buildComposerStarterActivity(moduleManagerComposerStarterType)], {
              maxColumns: composerLayout.maxColumns,
            });

      const newModule = {
        id: moduleId,
        title,
        type: 'standalone',
        mode: 'composer',
        composerLayout,
        activities: composerActivities,
        rawHtml: '',
        html: '',
        css: '',
        script: '',
        history: [{
          timestamp: new Date().toISOString(),
          title,
          mode: 'composer',
          composerLayout,
          activities: composerActivities,
        }]
      };

      // Validate module before saving
      const validation = validateModule(newModule, true);
      if (!validation.isValid) {
        setModuleManagerStatus('error');
        setModuleManagerMessage('Validation failed: ' + validation.errors.join(', '));
        if (validation.warnings.length > 0) {
          console.warn('Module warnings:', validation.warnings);
        }
        return;
      }

      if (validation.warnings.length > 0) {
        console.warn('Module warnings:', validation.warnings);
      }

      setProjectData(prev => {
        const newData = { ...prev };
        const currentModules = newData["Current Course"].modules || [];
        newData["Current Course"] = {
          ...newData["Current Course"],
          modules: [...currentModules, newModule]
        };
        return newData;
      });

      setModuleManagerID('');
      setModuleManagerTitle('');
      setModuleManagerComposerLayout({ maxColumns: 1 });
      setModuleManagerComposerActivities(
        normalizeComposerActivities([buildComposerStarterActivity(moduleManagerComposerStarterType)], {
          maxColumns: 1,
        }),
      );
      setModuleManagerComposerExtraRows(0);
      setModuleManagerComposerSelectedIndex(0);
      setModuleManagerStatus('success');
      setModuleManagerMessage(`Composer module "${title}" added with ${composerActivities.length} activities.`);

      setTimeout(() => {
        setModuleManagerStatus(null);
        setModuleManagerMessage('');
      }, 3000);
    } catch (err) {
      setModuleManagerStatus('error');
      setModuleManagerMessage('Error: ' + err.message);
      console.error('Composer module manager error:', err);
    }
  };
  
  const addExternalLinkModule = () => {
    try {
      if (!moduleManagerID.trim()) {
        setModuleManagerStatus('error');
        setModuleManagerMessage('Please provide a Module ID (e.g., view-biology-ch1)');
        return;
      }
      
      if (!moduleManagerURL.trim()) {
        setModuleManagerStatus('error');
        setModuleManagerMessage('Please provide a URL');
        return;
      }
      
      // Validate URL
      try {
        new URL(moduleManagerURL);
      } catch {
        setModuleManagerStatus('error');
        setModuleManagerMessage('Invalid URL format. Please include http:// or https://');
        return;
      }
      
      // Ensure ID starts with 'view-'
      const moduleId = moduleManagerID.startsWith('view-') ? moduleManagerID : `view-${moduleManagerID}`;
      
      // Check for duplicate
      const existingModule = projectData["Current Course"].modules?.find(m => m.id === moduleId);
      if (existingModule) {
        setModuleManagerStatus('error');
        setModuleManagerMessage(`Module ID "${moduleId}" already exists! Use a different ID.`);
        return;
      }
      
      // Create module object
      const newModule = {
        id: moduleId,
        title: moduleManagerTitle || moduleId.replace('view-', '').replace(/-/g, ' '),
        type: 'external',
        mode: 'custom_html',
        activities: [],
        composerLayout: { maxColumns: 1 },
        url: moduleManagerURL,
        linkType: moduleManagerLinkType,
        // Initialize history with version 1 (original state)
        history: [{
          timestamp: new Date().toISOString(),
          title: moduleManagerTitle || moduleId.replace('view-', '').replace(/-/g, ' '),
          mode: 'custom_html',
          activities: [],
          composerLayout: { maxColumns: 1 },
          url: moduleManagerURL,
          linkType: moduleManagerLinkType
        }]
      };
      
      // Validate module before saving
      const validation = validateModule(newModule, true);
      if (!validation.isValid) {
        setModuleManagerStatus('error');
        setModuleManagerMessage('Validation failed: ' + validation.errors.join(', '));
        if (validation.warnings.length > 0) {
          console.warn('Module warnings:', validation.warnings);
        }
        return;
      }
      
      // Show warnings but allow save
      if (validation.warnings.length > 0) {
        console.warn('Module warnings:', validation.warnings);
      }
      
      // Add to project
      setProjectData(prev => {
        const newData = { ...prev };
        const currentModules = newData["Current Course"].modules || [];
        newData["Current Course"] = {
          ...newData["Current Course"],
          modules: [...currentModules, newModule]
        };
        return newData;
      });
      
      // Clear state
      setModuleManagerURL('');
      setModuleManagerID('');
      setModuleManagerTitle('');
      setModuleManagerStatus('success');
      setModuleManagerMessage(`External link module "${newModule.title}" added successfully.`);
      
      setTimeout(() => {
        setModuleManagerStatus(null);
        setModuleManagerMessage('');
      }, 3000);
      
    } catch (err) {
      setModuleManagerStatus('error');
      setModuleManagerMessage('Error: ' + err.message);
      console.error('Module manager error:', err);
    }
  };
  
  const testExternalLink = async (url) => {
    if (!url || !url.trim()) {
      setLinkTestResult({
        success: false,
        message: 'Please enter a URL first'
      });
      return;
    }
    
    setTestingLink(true);
    setLinkTestResult(null);
    
    try {
      // Validate URL format first
      let testUrl = url.trim();
      if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
        testUrl = 'https://' + testUrl;
      }
      
      new URL(testUrl); // Validate format
      
      // Try to fetch (with CORS check)
      // Note: This will fail for CORS-protected sites, but that's okay - we're just checking format
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch(testUrl, { 
          method: 'HEAD', 
          mode: 'no-cors', // This will always "succeed" but we can check if URL is valid
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Since we're using no-cors, we can't check the actual response
        // But if we got here, the URL format is valid
        setLinkTestResult({
          success: true,
          message: 'URL format is valid. Note: Cannot verify accessibility due to browser security (CORS).'
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          setLinkTestResult({
            success: false,
            message: 'Request timed out. URL may be unreachable or slow.'
          });
        } else {
          // URL format is valid, but we can't verify accessibility
          setLinkTestResult({
            success: true,
            message: 'URL format is valid. Cannot verify accessibility due to browser security.'
          });
        }
      }
    } catch (err) {
      setLinkTestResult({
        success: false,
        message: 'Invalid URL format: ' + err.message
      });
    } finally {
      setTestingLink(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileJson className="text-yellow-400" /> Phase 1: Harvest
        </h2>
        
        {/* HARVEST TYPE TOGGLE */}
        <div className="mb-6">
            <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700 w-full md:w-auto overflow-x-auto">
                <button onClick={() => setHarvestType('ASSESSMENT')} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all whitespace-nowrap ${harvestType === 'ASSESSMENT' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <CheckCircle size={14} /> Assessment
                </button>
                <button onClick={() => setHarvestType('MATERIALS')} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all whitespace-nowrap ${harvestType === 'MATERIALS' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                   <FolderOpen size={14} /> Materials
                </button>
                 <button onClick={() => setHarvestType('AI_MODULE')} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all whitespace-nowrap ${harvestType === 'AI_MODULE' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                     <Sparkles size={14} /> AI Studio
                 </button>
                 <button onClick={() => setHarvestType('MODULE_MANAGER')} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all whitespace-nowrap ${harvestType === 'MODULE_MANAGER' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                     <Box size={14} /> Module Manager
                 </button>
            </div>
        </div>

         <>
            {harvestType === 'ASSESSMENT' && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                     <div className="p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                        <h3 className="text-sm font-bold text-purple-400 mb-4">Assessment Center</h3>
                        
                        {/* Assessment Mode Tabs */}
                        <div className="flex gap-2 mb-6 border-b border-purple-800/50 pb-2 overflow-x-auto">
                            <button 
                                onClick={() => setMode('ADD')} 
                                className={`px-4 py-2 rounded-t text-xs font-bold transition-colors whitespace-nowrap ${mode === 'ADD' ? 'bg-purple-600 text-white' : 'bg-transparent text-slate-400 hover:text-white'}`}
                            >
                                <Plus size={14} /> Add Questions
                            </button>
                            <button 
                                onClick={() => setMode('MASTER')} 
                                className={`px-4 py-2 rounded-t text-xs font-bold transition-colors whitespace-nowrap ${mode === 'MASTER' ? 'bg-purple-600 text-white' : 'bg-transparent text-slate-400 hover:text-white'}`}
                            >
                                <Sparkles size={14} /> Master Assessment
                            </button>
                            <button 
                                onClick={() => setMode('MANAGE')} 
                                className={`px-4 py-2 rounded-t text-xs font-bold transition-colors whitespace-nowrap ${mode === 'MANAGE' ? 'bg-purple-600 text-white' : 'bg-transparent text-slate-400 hover:text-white'}`}
                            >
                                <Clipboard size={14} /> Manage
                            </button>
                            <button 
                                onClick={() => setMode('MIGRATE')} 
                                className={`px-4 py-2 rounded-t text-xs font-bold transition-colors whitespace-nowrap ${mode === 'MIGRATE' ? 'bg-purple-600 text-white' : 'bg-transparent text-slate-400 hover:text-white'}`}
                            >
                                <RefreshCw size={14} /> Migrate
                            </button>
                            <button 
                                onClick={() => setMode('IMPORT')} 
                                className={`px-4 py-2 rounded-t text-xs font-bold transition-colors whitespace-nowrap ${mode === 'IMPORT' ? 'bg-purple-600 text-white' : 'bg-transparent text-slate-400 hover:text-white'}`}
                            >
                                <FileJson size={14} /> Smart Import
                            </button>
                        </div>

                        {/* ADD QUESTIONS MODE */}
                        {mode === 'ADD' && (
                            <div className="space-y-4">
                                <p className="text-xs text-slate-400 italic">Build individual questions to add to your Master Assessment.</p>
                                
                                {/* Question Type Selector */}
                                <div className="flex gap-2 mb-4">
                                    <button 
                                        onClick={() => {
                                            setCurrentQuestionType('multiple-choice');
                                            setCurrentQuestion({ question: '', options: ['', '', '', ''], correct: 0 });
                                        }} 
                                        className={`flex-1 py-3 px-4 rounded text-xs font-bold transition-all ${currentQuestionType === 'multiple-choice' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        <CheckCircle size={14} /> Multiple Choice
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setCurrentQuestionType('long-answer');
                                            setCurrentQuestion({ question: '', options: ['', '', '', ''], correct: 0 });
                                        }} 
                                        className={`flex-1 py-3 px-4 rounded text-xs font-bold transition-all ${currentQuestionType === 'long-answer' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        <Edit size={14} /> Long Answer
                                    </button>
                        </div>

                                {/* Multiple Choice Question Builder */}
                                {currentQuestionType === 'multiple-choice' && (
                                    <div className="p-4 bg-blue-900/10 border border-blue-700/30 rounded-xl space-y-4">
                                        <h4 className="text-sm font-bold text-blue-400">Multiple Choice Question</h4>
                                        
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Question</label>
                                            <textarea 
                                                value={currentQuestion.question}
                                                onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                                                placeholder="Enter your question..."
                                                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm h-20 resize-none"
                                            />
                    </div>
                    
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Answer Options</label>
                                            <div className="space-y-2">
                                                {currentQuestion.options.map((opt, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <input 
                                                            type="radio"
                                                            name="correct-answer"
                                                            checked={currentQuestion.correct === idx}
                                                            onChange={() => setCurrentQuestion({...currentQuestion, correct: idx})}
                                                            className="w-4 h-4"
                                                        />
                                                        <input 
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => {
                                                                const newOptions = [...currentQuestion.options];
                                                                newOptions[idx] = e.target.value;
                                                                setCurrentQuestion({...currentQuestion, options: newOptions});
                                                            }}
                                                            placeholder={`Option ${idx + 1}`}
                                                            className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-[9px] text-slate-500 italic mt-2">Select the correct answer by clicking the radio button</p>
                                        </div>

                                        <button 
                                            onClick={() => {
                                                if (!currentQuestion.question.trim()) {
                                                    alert("Please enter a question");
                                                    return;
                                                }
                                                if (currentQuestion.options.some(opt => !opt.trim())) {
                                                    alert("Please fill in all answer options");
                                                    return;
                                                }
                                                addQuestionToMaster({
                                                    type: 'multiple-choice',
                                                    question: currentQuestion.question,
                                                    options: currentQuestion.options,
                                                    correct: currentQuestion.correct
                                                });
                                                alert("Question added to Master Assessment.");
                                            }}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded flex items-center justify-center gap-2"
                                        >
                                            <Plus size={16} /> Add to Master Assessment
                        </button>
                    </div>
                                )}

                                {/* Long Answer Question Builder */}
                                {currentQuestionType === 'long-answer' && (
                                    <div className="p-4 bg-emerald-900/10 border border-emerald-700/30 rounded-xl space-y-4">
                                        <h4 className="text-sm font-bold text-emerald-400">Long Answer Question</h4>
                                        
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Question / Prompt</label>
                                            <textarea 
                                                value={currentQuestion.question}
                                                onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                                                placeholder="Enter your question or prompt..."
                                                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm h-32 resize-none"
                                            />
                                            <p className="text-[9px] text-slate-500 italic mt-2">Students will see a large text area to respond</p>
                                        </div>

                                        <button 
                                            onClick={() => {
                                                if (!currentQuestion.question.trim()) {
                                                    alert("Please enter a question or prompt");
                                                    return;
                                                }
                                                addQuestionToMaster({
                                                    type: 'long-answer',
                                                    question: currentQuestion.question
                                                });
                                                alert("Question added to Master Assessment.");
                                            }}
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded flex items-center justify-center gap-2"
                                        >
                                            <Plus size={16} /> Add to Master Assessment
                                        </button>
                         </div>
                    )}

                                {/* Quick Info */}
                                <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                    <p className="text-purple-300 text-xs">
                                        <strong>Tip:</strong> Add all your questions here, then go to the "Master Assessment" tab to organize them and generate the final assessment.
                                    </p>
                 </div>
             </div>
        )}

                        {/* CREATE NEW MODE - OLD (KEEPING FOR BACKWARDS COMPAT) */}
                        {mode === 'CREATE' && (
                            <>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Assessment Title</label>
                        <input 
                            type="text" 
                            value={assessmentTitle} 
                            onChange={(e) => setAssessmentTitle(e.target.value)} 
                            placeholder="e.g., Mental Fitness Quiz 1" 
                            className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm"
                        />
                    </div>

                    <div className="flex gap-2 mb-4">
                        <button 
                            onClick={() => setAssessmentType('quiz')} 
                            className={`flex-1 py-2 px-3 rounded text-xs font-bold ${assessmentType === 'quiz' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                            Multiple Choice
                        </button>
                                    <button 
                                        onClick={() => setAssessmentType('longanswer')} 
                                        className={`flex-1 py-2 px-3 rounded text-xs font-bold ${assessmentType === 'longanswer' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                                    >
                                        Long Answer
                                    </button>
                        <button 
                            onClick={() => setAssessmentType('print')} 
                            className={`flex-1 py-2 px-3 rounded text-xs font-bold ${assessmentType === 'print' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                            Print & Submit
                        </button>
                    </div>
                            </>
                        )}

                        {mode === 'CREATE' && assessmentType === 'quiz' && (
                        <div className="space-y-4">
                            <div className="max-h-96 overflow-y-auto space-y-3 p-3 bg-slate-950 rounded border border-slate-700">
                                {quizQuestions.map((q, idx) => (
                                    <div key={idx} className="p-3 bg-slate-900 rounded border border-slate-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-purple-400">Question {idx + 1}</span>
                                            {quizQuestions.length > 1 && (
                                                <button 
                                                    onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== idx))}
                                                    className="text-rose-400 hover:text-rose-300"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <input 
                                            type="text" 
                                            value={q.question}
                                            onChange={(e) => updateQuizQuestion(idx, 'question', e.target.value)}
                                            placeholder="Enter question..."
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs mb-2"
                                        />
                                        <div className="space-y-1">
                                            {q.options.map((opt, optIdx) => (
                                                <div key={optIdx} className="flex items-center gap-2">
                                                    <input 
                                                        type="radio" 
                                                        name={`correct-${idx}`}
                                                        checked={q.correct === optIdx}
                                                        onChange={() => updateQuizQuestion(idx, 'correct', optIdx)}
                                                        className="w-3 h-3"
                                                    />
                                                    <input 
                                                        type="text"
                                                        value={opt}
                                                        onChange={(e) => updateQuizQuestion(idx, `option-${optIdx}`, e.target.value)}
                                                        placeholder={`Option ${optIdx + 1}`}
                                                        className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={addQuizQuestion}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-2"
                            >
                                <Plus size={14} /> Add Question
                            </button>
                        </div>
                    )}

                        {mode === 'CREATE' && assessmentType === 'longanswer' && (
                            <div className="space-y-4">
                                <div className="max-h-96 overflow-y-auto space-y-3 p-3 bg-slate-950 rounded border border-slate-700">
                                    {quizQuestions.map((q, idx) => (
                                        <div key={idx} className="p-3 bg-slate-900 rounded border border-slate-800">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-purple-400">Prompt {idx + 1}</span>
                                                {quizQuestions.length > 1 && (
                                                    <button 
                                                        onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== idx))}
                                                        className="text-rose-400 hover:text-rose-300"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                            <textarea 
                                                value={q.question}
                                                onChange={(e) => updateQuizQuestion(idx, 'question', e.target.value)}
                                                placeholder="Enter your question or prompt..."
                                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs h-20 resize-none"
                                            />
                                            <p className="text-[9px] text-slate-500 italic mt-1">Students will see a large text area to respond to this prompt.</p>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={addQuizQuestion}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} /> Add Prompt
                                </button>
                        </div>
                    )}

                        {mode === 'CREATE' && assessmentType === 'print' && (
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-400 uppercase">Custom Instructions (Optional)</label>
                                <textarea 
                                    value={printInstructions}
                                    onChange={(e) => setPrintInstructions(e.target.value)}
                                    placeholder="Enter custom instructions for students... (Leave blank for default)"
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-xs h-32 resize-none"
                                />
                                <p className="text-[9px] text-slate-500 italic">Default: Standard print & submit instructions with name/date fields</p>
                            </div>
                        )}

                        {mode === 'CREATE' && (
                            <>
                    <div className="flex gap-2 mt-4">
                        <button 
                            onClick={generateQuizAssessment} 
                                        disabled={!assessmentTitle || (assessmentType === 'quiz' && quizQuestions.some(q => !q.question)) || (assessmentType === 'longanswer' && quizQuestions.some(q => !q.question))}
                            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Generate Assessment Code
                        </button>
                    </div>

                    {generatedAssessment && (
                        <div className="mt-4">
                                        <CodeBlock label="Assessment JSON Preview" code={generatedAssessment} height="h-64" />
                                        <button 
                                            onClick={() => {
                                                try {
                                                    const parsed = JSON.parse(generatedAssessment);
                                                    addAssessment({
                                                        title: assessmentTitle,
                                                        type: assessmentType,
                                                        html: parsed.html,
                                                        script: parsed.script,
                                                        generatedId: parsed.id || null
                                                    });
                                                    alert("Assessment added successfully! Switching to Manage tab...");
                                                    setGeneratedAssessment("");
                                                    setAssessmentTitle("");
                                                    setQuizQuestions([{ question: '', options: ['', '', '', ''], correct: 0 }]);
                                                    setMode('MANAGE'); // Switch to Manage tab to see it
                                                } catch(e) {
                                                    alert("Error adding assessment. Please try again.");
                                                    console.error(e);
                                                }
                                            }}
                                            className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded text-xs flex items-center justify-center gap-2"
                                        >
                                            <Zap size={14} /> Add Assessment to Assessments Module
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* MASTER ASSESSMENT MODE */}
                        {mode === 'MASTER' && (
                            <div className="space-y-4">
                                <p className="text-xs text-slate-400 italic">Organize your questions and generate the final assessment.</p>
                                
                                {/* Assessment Title */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Assessment Title</label>
                                    <input 
                                        type="text"
                                        value={masterAssessmentTitle}
                                        onChange={(e) => setMasterAssessmentTitle(e.target.value)}
                                        placeholder="e.g., Mental Fitness Comprehensive Test"
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm"
                                    />
                                </div>

                                {/* Questions List */}
                                <div className="border-t border-slate-700 pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase">
                                            Questions ({masterQuestions.length})
                                        </h4>
                                        {masterQuestions.length > 0 && (
                                            <button 
                                                onClick={clearMasterAssessment}
                                                className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>

                                    {masterQuestions.length === 0 ? (
                                        <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-slate-800">
                                            <p className="text-sm text-slate-500 italic">No questions yet.</p>
                                            <p className="text-xs text-slate-600 mt-2">Go to "Add Questions" tab to add questions.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {masterQuestions.sort((a, b) => a.order - b.order).map((q, idx) => (
                                                <div key={q.id} className="p-4 bg-slate-900 rounded-lg border border-slate-800 hover:bg-slate-800/70 transition-colors">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded flex items-center justify-center bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-sm flex-shrink-0">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded ${q.type === 'multiple-choice' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                                    {q.type === 'multiple-choice' ? 'MC' : 'LA'}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-200 font-medium mb-1">{q.question}</p>
                                                            {q.type === 'multiple-choice' && (
                                                                <p className="text-[10px] text-slate-500">
                                                                    Correct: {q.options[q.correct]}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                            <button 
                                                                onClick={() => moveQuestion(q.id, 'up')}
                                                                disabled={idx === 0}
                                                                className="p-1.5 hover:bg-slate-700 rounded disabled:opacity-30"
                                                                title="Move up"
                                                            >
                                                                <ArrowUpCircle size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => moveQuestion(q.id, 'down')}
                                                                disabled={idx === masterQuestions.length - 1}
                                                                className="p-1.5 hover:bg-slate-700 rounded disabled:opacity-30 rotate-180"
                                                                title="Move down"
                                                            >
                                                                <ArrowUpCircle size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => setEditingQuestion(q)}
                                                                className="p-1.5 hover:bg-blue-900 hover:text-blue-400 rounded"
                                                                title="Edit"
                                                            >
                                                                <PenTool size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => deleteQuestion(q.id)}
                                                                className="p-1.5 hover:bg-rose-900 hover:text-rose-400 rounded"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Generate Button */}
                                {masterQuestions.length > 0 && (
                                    <button 
                                        onClick={() => {
                                            if (!masterAssessmentTitle.trim()) {
                                                alert("Please enter an assessment title");
                                                return;
                                            }
                                            // Generate assessment - will implement this function next
                                            generateMixedAssessment();
                                        }}
                                        disabled={!masterAssessmentTitle}
                                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Sparkles size={18} /> Generate Assessment Code
                                    </button>
                                )}

                                {/* Generated Assessment Preview */}
                                {generatedAssessment && (
                                    <div className="mt-4">
                                        <CodeBlock label="Assessment JSON Preview" code={generatedAssessment} height="h-64" />
                                        <button 
                                            onClick={() => {
                                                try {
                                                    const parsed = JSON.parse(generatedAssessment);
                                                    addAssessment({
                                                        title: masterAssessmentTitle,
                                                        type: 'mixed',
                                                        html: parsed.html,
                                                        script: parsed.script,
                                                        questionCount: masterQuestions.length,
                                                        generatedId: parsed.id || null,
                                                        source: 'master',
                                                        masterAssessmentTitle,
                                                        masterQuestionsSnapshot: masterQuestions.map((q) => ({
                                                            ...q,
                                                            options: q.options ? [...q.options] : []
                                                        }))
                                                    });
                                                    alert("Assessment added successfully! Switching to Manage tab...");
                                                    setGeneratedAssessment("");
                                                    setMasterAssessmentTitle("");
                                                    setMasterQuestions([]);
                                                    setMode('MANAGE');
                                                } catch(e) {
                                                    alert("Error adding assessment. Please try again.");
                                                    console.error(e);
                                                }
                                            }}
                                            className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded text-xs flex items-center justify-center gap-2"
                                        >
                                            <Zap size={14} /> Add Assessment to Module
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MANAGE MODE - Assessment Manager */}
                        {mode === 'MANAGE' && (
                            <div className="space-y-4">
                                <p className="text-xs text-slate-400 italic">Manage assessments stored in the Assessments module.</p>
                                
                                <div className="space-y-2">
                                    {(() => {
                                        const assessmentsModule = projectData["Current Course"].modules.find(m => m.id === "item-assessments");
                                        const assessments = assessmentsModule?.assessments || [];
                                        
                                        if (assessments.length === 0) {
                                            return <p className="text-xs text-slate-500 italic text-center py-4">No assessments yet. Create one using "Create New" tab.</p>;
                                        }

                                        return assessments.sort((a, b) => a.order - b.order).map((assess) => {
                                            const canSendToMaster = Array.isArray(assess.masterQuestionsSnapshot) && assess.masterQuestionsSnapshot.length > 0;
                                            return (
                                                <div key={assess.id} className="p-3 bg-slate-900 rounded-lg border border-slate-800 hover:bg-slate-800/70 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div className="w-8 h-8 rounded flex items-center justify-center text-purple-500 bg-purple-500/10 border border-purple-500/20 font-bold text-xs">
                                                                <CheckCircle size={16} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className={`text-sm font-medium ${assess.hidden ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                                    {assess.title} {assess.hidden && <span className="text-[9px] text-slate-600">(HIDDEN)</span>}
                                                                </div>
                                                                <div className="text-[10px] text-slate-500">
                                                                    Type: {assess.type === 'quiz' ? 'Multiple Choice' : assess.type === 'longanswer' ? 'Long Answer' : 'Print & Submit'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button 
                                                                onClick={() => toggleAssessmentHidden(assess.id)}
                                                                className={`p-1.5 rounded transition-colors ${assess.hidden ? 'bg-slate-700 text-slate-400' : 'bg-emerald-900 text-emerald-400'}`}
                                                                title={assess.hidden ? "Show" : "Hide"}
                                                            >
                                                                {assess.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                                                            </button>
                                                            <button
                                                                onClick={() => setPhase1AssessmentPreview(assess)}
                                                                className="p-1.5 hover:bg-indigo-900 hover:text-indigo-300 rounded"
                                                                title="Preview"
                                                            >
                                                                <Eye size={12} />
                                                            </button>
                                                            <button 
                                                                onClick={() => moveAssessment(assess.id, 'up')}
                                                                disabled={assess.order === 0}
                                                                className="p-1.5 hover:bg-slate-700 rounded disabled:opacity-30"
                                                                title="Move up"
                                                            >
                                                                <ArrowUpCircle size={12} />
                                                            </button>
                                                            <button 
                                                                onClick={() => moveAssessment(assess.id, 'down')}
                                                                disabled={assess.order === assessments.length - 1}
                                                                className="p-1.5 hover:bg-slate-700 rounded disabled:opacity-30 rotate-180"
                                                                title="Move down"
                                                            >
                                                                <ArrowUpCircle size={12} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (!canSendToMaster) return;
                                                                    const hasMasterDraft = masterQuestions.length > 0 || masterAssessmentTitle.trim();
                                                                    const warningMessage = hasMasterDraft
                                                                        ? 'This will replace your current Master Assessment questions and title. Continue?'
                                                                        : 'Send this assessment back to Master Assessment for editing?';
                                                                    if (!confirm(warningMessage)) return;
                                                                    const restoredQuestions = assess.masterQuestionsSnapshot.map((q) => ({
                                                                        ...q,
                                                                        options: q.options ? [...q.options] : []
                                                                    }));
                                                                    setMasterQuestions(restoredQuestions.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
                                                                    setMasterAssessmentTitle(assess.masterAssessmentTitle || assess.title || '');
                                                                    setGeneratedAssessment('');
                                                                    setEditingQuestion(null);
                                                                    setMode('MASTER');
                                                                }}
                                                                disabled={!canSendToMaster}
                                                                className={`p-1.5 rounded ${canSendToMaster ? 'hover:bg-slate-700' : 'opacity-30 cursor-not-allowed'}`}
                                                                title={canSendToMaster ? "Send back to Master Assessment" : "No Master snapshot available"}
                                                            >
                                                                <RotateCcw size={12} />
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setEditingAssessment(assess);
                                                                }}
                                                                className="p-1.5 hover:bg-blue-900 hover:text-blue-400 rounded"
                                                                title="Edit"
                                                            >
                                                                <PenTool size={12} />
                                                            </button>
                                                            <button 
                                                                onClick={() => deleteAssessment(assess.id)}
                                                                className="p-1.5 hover:bg-rose-900 hover:text-rose-400 rounded"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>

                                {phase1AssessmentPreview && (
                                    <div
                                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                        onClick={() => setPhase1AssessmentPreview(null)}
                                    >
                                        <div
                                            className="bg-slate-900 border border-slate-700 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                        <Eye size={20} className="text-indigo-300" />
                                                        Assessment Preview: {phase1AssessmentPreview.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 mt-1">Phase 1 live preview</p>
                                                </div>
                                                <button onClick={() => setPhase1AssessmentPreview(null)} className="text-slate-400 hover:text-white transition-colors">
                                                    <X size={24} />
                                                </button>
                                            </div>
                                            <div className="p-0 max-h-[calc(90vh-80px)] overflow-y-auto">
                                                <iframe
                                                    srcDoc={(() => {
                                                        const safeHtml = phase1AssessmentPreview.html || '<p class="text-slate-500">No HTML content</p>';
                                                        const safeScript = cleanModuleScript(phase1AssessmentPreview.script || '');
                                                        return `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"><\/script><style>body{background:#020617;color:#e2e8f0;padding:20px;}</style></head><body>${safeHtml}<script>${safeScript}<\/script></body></html>`;
                                                    })()}
                                                    className="w-full border-0"
                                                    style={{ minHeight: '600px' }}
                                                    title={phase1AssessmentPreview.title || 'Assessment Preview'}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* EDIT ASSESSMENT MODAL */}
                                {editingAssessment && (
                                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingAssessment(null)}>
                                        <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                    <PenTool size={20} className="text-purple-400" />
                                                    Edit Assessment
                                                </h3>
                                                <button onClick={() => setEditingAssessment(null)} className="text-slate-400 hover:text-white transition-colors">
                                                    <X size={24} />
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Assessment Title</label>
                                                    <input 
                                                        type="text"
                                                        value={editingAssessment.title}
                                                        onChange={(e) => setEditingAssessment({...editingAssessment, title: e.target.value})}
                                                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Assessment Type</label>
                                                    <div className="text-sm text-slate-300 bg-slate-950 border border-slate-700 rounded p-3">
                                                        {editingAssessment.type === 'quiz' ? 'Multiple Choice' : editingAssessment.type === 'longanswer' ? 'Long Answer' : 'Print & Submit'}
                                                        <span className="text-[10px] text-slate-500 block mt-1">Type cannot be changed after creation</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Text Color Override</label>
                                                    <p className="text-[10px] text-slate-500 mb-1 italic">Overrides Phase 5 Assessment Text Color for this assessment only</p>
                                                    <select
                                                        value={editingAssessment.textColorOverride ?? ''}
                                                        onChange={(e) => setEditingAssessment({ ...editingAssessment, textColorOverride: e.target.value || null })}
                                                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm"
                                                    >
                                                        {assessmentOverrideOptions.map((opt) => (
                                                            <option key={opt.value || 'default'} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Box Color Override</label>
                                                    <p className="text-[10px] text-slate-500 mb-1 italic">Overrides Phase 5 Assessment Box Color for this assessment only</p>
                                                    <select
                                                        value={editingAssessment.boxColorOverride ?? ''}
                                                        onChange={(e) => setEditingAssessment({ ...editingAssessment, boxColorOverride: e.target.value || null })}
                                                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm"
                                                    >
                                                        {assessmentOverrideOptions.map((opt) => (
                                                            <option key={'box-' + (opt.value || 'default')} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                                                    <p className="text-amber-300 text-xs">
                                                        <strong>Note:</strong> To edit questions/prompts, you'll need to recreate the assessment in the "Create New" tab with your changes.
                                                    </p>
                                                </div>

                                                <div className="flex gap-3 pt-4">
                                                    <button 
                                                        onClick={() => setEditingAssessment(null)}
                                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            editAssessment(editingAssessment.id, {
                                                                title: editingAssessment.title,
                                                                textColorOverride: editingAssessment.textColorOverride || null,
                                                                boxColorOverride: editingAssessment.boxColorOverride || null
                                                            });
                                                            setEditingAssessment(null);
                                                        }}
                                                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2"
                                                    >
                                                        <Save size={16} /> Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}
                        {/* EDIT QUESTION MODAL */}
                        {/* Rendered at the bottom so the same modal can be shown from any mode */}
                        {editingQuestion && (() => {
                            const isMC = editingQuestion.type === 'multiple-choice';
                            const optionsList = editingQuestion.options?.length ? editingQuestion.options : ['', '', '', ''];
                            const allOptionsFilled = optionsList.every(opt => opt && opt.trim());
                            const canSave = editingQuestion.question?.trim() && (!isMC || allOptionsFilled);

                            const setOptionValue = (idx, value) => {
                                setEditingQuestion(prev => {
                                    if (!prev) return prev;
                                    const updatedOptions = prev.options ? [...prev.options] : ['', '', '', ''];
                                    updatedOptions[idx] = value;
                                    return { ...prev, options: updatedOptions };
                                });
                            };

                            const switchQuestionType = (type) => {
                                setEditingQuestion(prev => {
                                    if (!prev) return prev;
                                    if (type === 'multiple-choice') {
                                        return {
                                            ...prev,
                                            type,
                                            options: prev.options?.length ? [...prev.options] : ['', '', '', ''],
                                            correct: typeof prev.correct === 'number' ? prev.correct : 0
                                        };
                                    }
                                    return { ...prev, type };
                                });
                            };

                            const saveChanges = () => {
                                updateQuestion(editingQuestion.id, {
                                    question: editingQuestion.question.trim(),
                                    type: editingQuestion.type,
                                    options: editingQuestion.type === 'multiple-choice'
                                        ? (editingQuestion.options || ['', '', '', '']).map(opt => opt.trim())
                                        : editingQuestion.options,
                                    correct: editingQuestion.type === 'multiple-choice' ? (typeof editingQuestion.correct === 'number' ? editingQuestion.correct : 0) : 0
                                });
                                setEditingQuestion(null);
                            };

                            return (
                                <div
                                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                    onClick={() => setEditingQuestion(null)}
                                >
                                    <div
                                        className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <PenTool size={20} className="text-purple-400" />
                                                Edit Question
                                            </h3>
                                            <button
                                                onClick={() => setEditingQuestion(null)}
                                                className="text-slate-400 hover:text-white transition-colors"
                                            >
                                                <X size={24} />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => switchQuestionType('multiple-choice')}
                                                    className={`flex-1 py-2 px-3 rounded text-xs font-bold transition-all ${isMC ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                                >
                                                    <CheckCircle size={14} /> Multiple Choice
                                                </button>
                                                <button
                                                    onClick={() => switchQuestionType('long-answer')}
                                                    className={`flex-1 py-2 px-3 rounded text-xs font-bold transition-all ${!isMC ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                                >
                                                    <Edit size={14} /> Long Answer
                                                </button>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                                                    Question
                                                </label>
                                                <textarea
                                                    value={editingQuestion.question}
                                                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                                                    placeholder="Enter your question or prompt..."
                                                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm h-24 resize-none"
                                                />
                                            </div>

                                            {isMC ? (
                                                <div className="p-4 bg-blue-900/10 border border-blue-700/30 rounded-xl space-y-3">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                                                            Answer Options
                                                        </label>
                                                        <div className="space-y-2">
                                                            {optionsList.map((opt, idx) => (
                                                                <div key={idx} className="flex items-center gap-2">
                                                                    <input
                                                                        type="radio"
                                                                        name="editing-correct-answer"
                                                                        checked={editingQuestion.correct === idx}
                                                                        onChange={() => setEditingQuestion({ ...editingQuestion, correct: idx })}
                                                                        className="w-4 h-4"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={opt}
                                                                        onChange={(e) => setOptionValue(idx, e.target.value)}
                                                                        placeholder={`Option ${idx + 1}`}
                                                                        className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-[9px] text-slate-500 italic">
                                                        Select the correct answer by clicking the radio button.
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-[9px] text-slate-500 italic">
                                                    Students will see a large text area to respond to this prompt.
                                                </p>
                                            )}

                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    onClick={() => setEditingQuestion(null)}
                                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={saveChanges}
                                                    disabled={!canSave}
                                                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <Save size={16} /> Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                        {/* MIGRATE MODE - Assessment Migrator */}
                        {mode === 'MIGRATE' && (
                            <div className="space-y-4">
                                <p className="text-xs text-slate-400">Convert existing assessment code to work with the Assessment Center using AI Studio.</p>
                                
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-slate-400 uppercase">Paste Existing Assessment Code</label>
                                    <textarea 
                                        value={migrateCode}
                                        onChange={(e) => setMigrateCode(e.target.value)}
                                        placeholder="Paste your existing assessment HTML and JavaScript here..."
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-xs font-mono h-48 resize-none"
                                    />
                                    
                                    <button 
                                        onClick={() => {
                                            const prompt = `I have an existing assessment that I need to adapt to work with my course builder system.

**ORIGINAL ASSESSMENT CODE:**
\`\`\`
${migrateCode}
\`\`\`

**REQUIREMENTS:**
1. Convert this to use our dark theme (slate-900 backgrounds, white text)
2. Use Tailwind CSS classes for all styling
3. Ensure it works with our assessment system structure
4. Return the code in this exact JSON format:
\`\`\`json
{
  "id": "assess-[unique-id]",
  "title": "[Assessment Title]",
  "type": "quiz", // or "longanswer" or "print"
  "html": "[Full HTML code here]",
  "script": "[Full JavaScript code here]"
}
\`\`\`

**STYLING GUIDELINES:**
- Use dark theme: bg-slate-900, bg-slate-950, text-white, text-slate-400
- Purple accents for assessment elements
- Rounded corners with rounded-lg, rounded-xl
- Borders with border-slate-700, border-slate-800
- Buttons: bg-purple-600 hover:bg-purple-500 text-white

Please convert the code following these guidelines and return ONLY the JSON.`;
                                            
                                            setMigratePrompt(prompt);
                                        }}
                                        disabled={!migrateCode.trim()}
                                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Sparkles size={14} /> Generate AI Studio Prompt
                                    </button>
                                    
                                    {migratePrompt && (
                                        <div className="space-y-2">
                                            <CodeBlock label="AI Studio Prompt (Copy & Use in Google AI Studio)" code={migratePrompt} height="h-48" />
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(migratePrompt);
                                                    alert("Prompt copied! Paste it into Google AI Studio.");
                                                }}
                                                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-2"
                                            >
                                                <Copy size={14} /> Copy Prompt to Clipboard
                                            </button>
                                            
                                            <div className="border-t border-slate-700 pt-3 mt-3">
                                                <label className="block text-xs font-bold text-emerald-400 uppercase mb-2">Paste AI Studio Output</label>
                                                <textarea 
                                                    value={migrateOutput}
                                                    onChange={(e) => setMigrateOutput(e.target.value)}
                                                    placeholder="Paste the JSON output from AI Studio here..."
                                                    className="w-full bg-slate-950 border border-emerald-700 rounded p-3 text-white text-xs font-mono h-32 resize-none"
                                                />
                                                <button 
                                                    onClick={() => {
                                                        try {
                                                            const parsed = JSON.parse(migrateOutput);
                                                            addAssessment({
                                                                title: parsed.title,
                                                                type: parsed.type,
                                                                html: parsed.html,
                                                                script: parsed.script,
                                                                generatedId: parsed.id || null
                                                            });
                                                            alert("Assessment added successfully!");
                                                            setMigrateCode('');
                                                            setMigratePrompt('');
                                                            setMigrateOutput('');
                                                            setMode('MANAGE');
                                                        } catch(e) {
                                                            alert("Invalid JSON. Please check the output and try again.");
                                                        }
                                                    }}
                                                    disabled={!migrateOutput.trim()}
                                                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <Zap size={14} /> Add Migrated Assessment
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* DANGER ZONE - Clear All Data */}
                                <div className="mt-8 pt-6 border-t border-rose-900/50">
                                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <AlertTriangle size={14} /> Danger Zone
                                    </h4>
                                    <div className="p-4 bg-rose-950/30 border border-rose-900/50 rounded-lg space-y-3">
                                        <p className="text-xs text-rose-300">
                                            Clear all saved data to start fresh. This will delete your current course, all modules, assessments, and settings. <strong>This cannot be undone.</strong>
                                        </p>
                                        <button 
                                            onClick={() => {
                                                if (window.confirm('WARNING: This will permanently delete ALL your course data including:\n\n- Course settings\n- All modules\n- All assessments\n- All materials\n\nAre you sure you want to continue?')) {
                                                    if (window.confirm('FINAL CONFIRMATION: Type "DELETE" in the next prompt to confirm.\n\nClick OK to proceed with deletion.')) {
                                                        const userInput = window.prompt('Type DELETE to confirm:');
                                                        if (userInput === 'DELETE') {
                                                            localStorage.removeItem('course_factory_v2_data');
                                                            localStorage.removeItem('course_factory_backup');
                                                            // Clear any other related keys
                                                            Object.keys(localStorage).forEach(key => {
                                                                if (key.startsWith('courseProgress_') || key.startsWith('course_factory')) {
                                                                    localStorage.removeItem(key);
                                                                }
                                                            });
                                                            alert('All data cleared. The page will now reload.');
                                                            window.location.reload();
                                                        } else {
                                                            alert('Deletion cancelled. Your data is safe.');
                                                        }
                                                    }
                                                }
                                            }}
                                            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded text-sm flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <Trash2 size={16} /> Clear All Data & Start Fresh
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* IMPORT MODE - Smart Import */}
                        {mode === 'IMPORT' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                                {/* LEFT COLUMN: Input & AI Instructions */}
                                <div className="space-y-4">
                                    <div className="bg-slate-900 border border-purple-500/30 p-4 rounded-xl space-y-3">
                                        <h3 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
                                            <Sparkles size={16}/> Option A: AI Super-Import
                                        </h3>
                                        <div>
                                            <p className="text-xs font-bold text-slate-300 mb-1">For Multiple-Choice Questions:</p>
                                            <div className="bg-black p-2 rounded border border-slate-700 relative group mb-2">
                                                <code className="text-[10px] text-emerald-400 font-mono block break-words">
                                                    Convert this quiz text into JSON. For multiple-choice: [{"{"} "question": "...", "options": ["A","B","C","D"], "correct": 0 {"}"}]. For long-answer: [{"{"} "question": "...", "options": [] {"}"}]. (Correct index: A=0, B=1, C=2, D=3). Output JSON ONLY.
                                                </code>
                                                <button 
                                                    className="absolute top-1 right-1 text-slate-500 hover:text-white"
                                                    onClick={() => navigator.clipboard.writeText('Convert this quiz text into JSON. For multiple-choice: [{ "question": "...", "options": ["A","B","C","D"], "correct": 0 }]. For long-answer/short-answer: [{ "question": "...", "options": [] }]. (Correct index: A=0, B=1, C=2, D=3). Output JSON ONLY.')}
                                                >
                                                    <Copy size={12}/>
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-300 mb-1">For Long-Answer/Short-Answer Questions:</p>
                                            <div className="bg-black p-2 rounded border border-slate-700 relative group mb-2">
                                                <code className="text-[10px] text-cyan-400 font-mono block break-words">
                                                    Convert these open-ended questions into JSON: [{"{"} "question": "What is...?", "options": [] {"}"}]. Include ALL questions, even if they have no answer choices. Output JSON ONLY.
                                                </code>
                                                <button 
                                                    className="absolute top-1 right-1 text-slate-500 hover:text-white"
                                                    onClick={() => navigator.clipboard.writeText('Convert these open-ended questions into JSON: [{ "question": "What is...?", "options": [] }]. Include ALL questions, even if they have no answer choices. Output JSON ONLY.')}
                                                >
                                                    <Copy size={12}/>
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-amber-300 mb-1">For Mixed Types (Recommended):</p>
                                            <div className="bg-black p-2 rounded border border-amber-700 relative group">
                                                <code className="text-[10px] text-amber-400 font-mono block break-words">
                                                    Convert this mixed assessment into JSON. Multiple-choice: [{"{"} "question": "...", "options": ["A","B","C","D"], "correct": 0 {"}"}]. Long-answer: [{"{"} "question": "...", "options": [] {"}"}]. Include ALL questions in order. Output JSON ONLY.
                                                </code>
                                                <button 
                                                    className="absolute top-1 right-1 text-slate-500 hover:text-white"
                                                    onClick={() => navigator.clipboard.writeText('Convert this mixed assessment into JSON. For multiple-choice questions: [{ "question": "...", "options": ["A","B","C","D"], "correct": 0 }]. For long-answer/short-answer questions: [{ "question": "...", "options": [] }]. Include ALL questions in the order they appear. (Correct index: A=0, B=1, C=2, D=3). Output JSON ONLY.')}
                                                >
                                                    <Copy size={12}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                        <h3 className="text-sm font-bold text-slate-300 mb-2">Paste Data (JSON or Text)</h3>
                                        <textarea
                                            value={importInput}
                                            onChange={(e) => {
                                                setImportInput(e.target.value);
                                                const result = sanitizeImportData(e.target.value);
                                                setImportPreview(result.data);
                                            }}
                                            className="w-full h-64 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-white focus:border-purple-500 outline-none resize-none"
                                            placeholder="Paste JSON here... OR Paste raw text like:&#10;Multiple-choice:&#10;1. Question?&#10;a. Yes&#10;b. No&#10;Answer: A&#10;&#10;Long-answer:&#10;2. Explain your answer."
                                        />
                                    </div>
                                </div>

                                {/* RIGHT COLUMN: Live Preview & Commit */}
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-bold text-white">Preview ({importPreview.length} Qs)</h3>
                                        {importPreview.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                {(() => {
                                                    const mcCount = importPreview.filter(q => (q.type || (q.options?.length > 0 ? 'multiple-choice' : 'long-answer')) === 'multiple-choice').length;
                                                    const laCount = importPreview.filter(q => (q.type || (q.options?.length > 0 ? 'multiple-choice' : 'long-answer')) === 'long-answer').length;
                                                    return (
                                                        <>
                                                            {mcCount > 0 && <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400 font-bold">{mcCount} MC</span>}
                                                            {laCount > 0 && <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 font-bold">{laCount} LA</span>}
                                                            <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold">Valid</span>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-3 custom-scroll pr-2 mb-4 bg-slate-950/50 rounded-lg p-2 border border-slate-800 h-64">
                                        {importPreview.length === 0 ? (
                                            <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">Paste content to preview...</div>
                                        ) : (
                                            importPreview.map((q, idx) => {
                                                const questionText = typeof q.question === 'string' ? q.question : (q.question || 'Untitled Question');
                                                const optionsArray = Array.isArray(q.options) ? q.options : [];
                                                const questionType = q.type || (optionsArray.length > 0 ? 'multiple-choice' : 'long-answer');
                                                const isLongAnswer = questionType === 'long-answer';
                                                
                                                return (
                                                    <div key={idx} className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="font-bold text-slate-200 flex gap-2 flex-1">
                                                                <span className="text-purple-400">{idx + 1}.</span> 
                                                                <span>{questionText}</span>
                                                            </div>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                                                isLongAnswer 
                                                                    ? 'bg-cyan-500/20 text-cyan-400' 
                                                                    : 'bg-purple-500/20 text-purple-400'
                                                            }`}>
                                                                {isLongAnswer ? 'Long Answer' : 'Multiple Choice'}
                                                            </span>
                                                        </div>
                                                        {isLongAnswer ? (
                                                            <div className="text-slate-500 italic text-[10px] pl-4">
                                                                Open-ended response
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-1 pl-4">
                                                                {optionsArray.length > 0 ? (
                                                                    optionsArray.map((opt, oIdx) => {
                                                                        const optionText = typeof opt === 'string' ? opt : String(opt || '');
                                                                        return (
                                                                            <div key={oIdx} className={`flex items-center gap-2 ${q.correct === oIdx ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                                                                                <span>{String.fromCharCode(65+oIdx)}.</span> <span>{optionText}</span>
                                                                                {q.correct === oIdx && <span className="text-[10px] text-emerald-400">(Correct)</span>}
                                                                            </div>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <div className="text-slate-500 italic text-[10px]">No options provided</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (importPreview.length === 0) return;
                                            // Convert to format expected by masterQuestions
                                            const formattedQuestions = importPreview.map(q => ({
                                                type: q.type || (q.options?.length > 0 ? 'multiple-choice' : 'long-answer'),
                                                question: q.question,
                                                options: q.options || [],
                                                correct: typeof q.correct === 'number' ? q.correct : 0
                                            }));
                                            formattedQuestions.forEach(q => addQuestionToMaster(q));
                                            const mcCount = formattedQuestions.filter(q => q.type === 'multiple-choice').length;
                                            const laCount = formattedQuestions.filter(q => q.type === 'long-answer').length;
                                            alert(`Imported ${formattedQuestions.length} questions. (${mcCount} multiple-choice, ${laCount} long-answer)`);
                                            setImportInput("");
                                            setImportPreview([]);
                                            setMode('MASTER');
                                        }}
                                        disabled={importPreview.length === 0}
                                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 transition-all"
                                    >
                                        Import to Master Assessment
                                    </button>
                                </div>
                            </div>
                        )}
                     </div>
                 </div>
            )}

            {harvestType === 'MATERIALS' && (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                     <div className="p-4 bg-pink-900/20 border border-pink-700/50 rounded-lg">
                        <h3 className="text-sm font-bold text-pink-400 mb-4">Materials Manager</h3>
                        
                        {/* ADD NEW MATERIAL FORM */}
                        <div className="p-4 bg-slate-950 rounded-xl border border-pink-800/50 mb-4">
                            <h4 className="text-xs font-bold text-pink-300 mb-3">Add New Material</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                <input 
                                    type="text"
                                    value={materialForm.number}
                                    onChange={(e) => setMaterialForm({...materialForm, number: e.target.value})}
                                    placeholder="Number (e.g., 05)"
                                    className="bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                                />
                                <select
                                    value={materialForm.color}
                                    onChange={(e) => setMaterialForm({...materialForm, color: e.target.value})}
                                    className="bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                                >
                                    <option value="slate">Gray</option>
                                    <option value="rose">Red</option>
                                    <option value="amber">Orange</option>
                                    <option value="emerald">Green</option>
                                    <option value="sky">Blue</option>
                                    <option value="purple">Purple</option>
                                </select>
                                <select
                                    value={materialForm.mediaType}
                                    onChange={(e) => setMaterialForm({...materialForm, mediaType: e.target.value})}
                                    className="bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                                >
                                    <option value="number">Badge: Number</option>
                                    <option value="book">Badge: Book</option>
                                    <option value="pdf">Badge: PDF</option>
                                    <option value="video">Badge: Video</option>
                                    <option value="slides">Badge: Slides</option>
                                </select>
                            </div>
                            <div className="mb-2">
                                <label className="block text-[10px] text-slate-500 mb-1">Card theme</label>
                                <select
                                    value={materialForm.themeOverride ?? ''}
                                    onChange={(e) => setMaterialForm({...materialForm, themeOverride: e.target.value || null})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                                >
                                    {materialThemeOptions.map((opt) => (
                                        <option key={opt.value || 'default'} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <input 
                                type="text"
                                value={materialForm.title}
                                onChange={(e) => setMaterialForm({...materialForm, title: e.target.value})}
                                placeholder="Title (e.g., The Engine)"
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm mb-2"
                            />
                            <input 
                                type="text"
                                value={materialForm.description}
                                onChange={(e) => setMaterialForm({...materialForm, description: e.target.value})}
                                placeholder="Description"
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs mb-2"
                            />
                            <div className="flex gap-2 mb-2">
                                <input 
                                    type="text"
                                    value={materialForm.viewUrl}
                                    onChange={(e) => setMaterialForm({...materialForm, viewUrl: e.target.value})}
                                    placeholder="View URL"
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                                />
                                {materialForm.mediaType !== 'video' && (
                                    <button 
                                        onClick={() => { setVaultTargetField('view'); setIsVaultOpen(true); }}
                                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded px-3"
                                        title="Browse Local Vault"
                                    >
                                        <FolderOpen size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2 mb-3">
                                <input 
                                    type="text"
                                    value={materialForm.downloadUrl}
                                    onChange={(e) => setMaterialForm({...materialForm, downloadUrl: e.target.value})}
                                    placeholder="Download URL (Google Drive /view link)"
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                                />
                                {materialForm.mediaType !== 'video' && (
                                    <button 
                                        onClick={() => { setVaultTargetField('download'); setIsVaultOpen(true); }}
                                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded px-3"
                                        title="Browse Local Vault"
                                    >
                                        <FolderOpen size={14} />
                                    </button>
                                )}
                            </div>
                            
                            {/* Digital Content Import */}
                            <div className="mb-3 p-3 bg-slate-900 rounded border border-slate-700">
                                <label className="flex items-center gap-2 cursor-pointer mb-2">
                                    <input 
                                        type="checkbox"
                                        checked={materialForm.hasDigitalContent}
                                        onChange={(e) => setMaterialForm({...materialForm, hasDigitalContent: e.target.checked})}
                                        className="rounded border-slate-700 bg-slate-900 text-emerald-600"
                                    />
                                    <span className="text-xs font-bold text-emerald-400 uppercase">Enable Digital Resource</span>
                                </label>
                                {materialForm.hasDigitalContent && (
                                    <div className="mt-2">
                                        <p className="text-[10px] text-slate-500 mb-2">Paste JSON content for a themed, readable digital version (chapters, sections, etc.)</p>
                                        <textarea
                                            value={materialForm.digitalContentJson}
                                            onChange={(e) => {
                                                const json = e.target.value;
                                                setMaterialForm({...materialForm, digitalContentJson: json});
                                                // Try to parse and validate
                                                try {
                                                    if (json.trim()) {
                                                        const parsed = JSON.parse(json);
                                                        if (parsed.chapters || parsed.title) {
                                                            setMaterialForm(prev => ({...prev, digitalContent: parsed, digitalContentJson: json}));
                                                        }
                                                    }
                                                } catch(e) {
                                                    // Invalid JSON, keep raw text
                                                }
                                            }}
                                            placeholder='{"title": "My Resource", "chapters": [{"number": 1, "title": "Chapter 1", "sections": [{"heading": "Section 1", "content": "Content here..."}]}]}'
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs font-mono h-24 resize-none"
                                        />
                                        {materialForm.digitalContentJson && (
                                            <div className="mt-2">
                                                {(() => {
                                                    try {
                                                        const parsed = JSON.parse(materialForm.digitalContentJson);
                                                        const chapterCount = parsed.chapters?.length || 0;
                                                        const sectionCount = parsed.chapters?.reduce((acc, ch) => acc + (ch.sections?.length || 0), 0) || 0;
                                                        return (
                                                            <p className="text-[10px] text-emerald-400">
                                                                Valid JSON: {chapterCount} chapter{chapterCount !== 1 ? 's' : ''}, {sectionCount} section{sectionCount !== 1 ? 's' : ''}
                                                            </p>
                                                        );
                                                    } catch(e) {
                                                        return <p className="text-[10px] text-rose-400">Invalid JSON: {e.message}</p>;
                                                    }
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Module Assignment */}
                            <div className="mb-3 p-3 bg-slate-900 rounded border border-slate-700">
                                <label className="block text-xs font-bold text-cyan-400 uppercase mb-2">Assign to Modules (Optional)</label>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {(() => {
                                        const allModules = projectData["Current Course"]?.modules || [];
                                        return allModules.map(m => (
                                            <label key={m.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 p-1.5 rounded">
                                                <input 
                                                    type="checkbox" 
                                                    checked={materialForm.assignedModules.includes(m.id)}
                                                    onChange={(e) => {
                                                        const updated = e.target.checked 
                                                            ? [...materialForm.assignedModules, m.id]
                                                            : materialForm.assignedModules.filter(id => id !== m.id);
                                                        setMaterialForm({...materialForm, assignedModules: updated});
                                                    }}
                                                    className="rounded border-slate-700 bg-slate-900 text-cyan-600"
                                                />
                                                <span className="text-xs text-slate-300">{m.title}</span>
                                            </label>
                                        ));
                                    })()}
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => {
                                    if (!materialForm.title) {
                                        alert("Title is required");
                                        return;
                                    }
                                    // Must have either viewUrl or digitalContent
                                    if (!materialForm.viewUrl && !materialForm.digitalContent) {
                                        alert("Please provide either a View URL or Digital Content");
                                        return;
                                    }
                                    addMaterial(materialForm);
                                    setMaterialForm({ number: '', title: '', description: '', viewUrl: '', downloadUrl: '', color: 'slate', mediaType: 'number', themeOverride: null, assignedModules: [], hasDigitalContent: false, digitalContent: null, digitalContentJson: '' });
                                }}
                                className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-2"
                            >
                                <Plus size={14} /> Add Material
                            </button>
                        </div>

                        {/* MATERIALS LIST */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-pink-300 mb-2">Current Materials</h4>
                            {(() => {
                                const courseMaterials = projectData["Current Course"]?.materials || [];
                                
                                if (courseMaterials.length === 0) {
                                    return <p className="text-xs text-slate-500 italic text-center py-4">No materials yet. Add one above.</p>;
                                }

                                return courseMaterials.sort((a, b) => a.order - b.order).map((mat) => {
                                    const badgeLabel = getMaterialBadgeLabel(mat);
                                    const badgeTextClass = mat.mediaType && mat.mediaType !== 'number'
                                        ? 'text-[9px] font-black uppercase tracking-widest'
                                        : 'text-xs font-bold';
                                    return (
                                        <div key={mat.id} className="p-3 bg-slate-900 rounded-lg border border-slate-800 hover:bg-slate-800/70 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className={`w-8 h-8 rounded flex items-center justify-center text-${mat.color}-500 bg-${mat.color}-500/10 border border-${mat.color}-500/20 ${badgeTextClass}`}>
                                                        {badgeLabel}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className={`text-sm font-medium ${mat.hidden ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                            {mat.title} {mat.hidden && <span className="text-[9px] text-slate-600">(HIDDEN)</span>}
                                                            {mat.digitalContent && <span className="ml-2 px-1.5 py-0.5 text-[9px] bg-emerald-900 text-emerald-400 rounded uppercase font-bold">Digital</span>}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500">{mat.description}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button 
                                                        onClick={() => toggleMaterialHidden(mat.id)}
                                                        className={`p-1.5 rounded transition-colors ${mat.hidden ? 'bg-slate-700 text-slate-400' : 'bg-emerald-900 text-emerald-400'}`}
                                                        title={mat.hidden ? "Show" : "Hide"}
                                                    >
                                                        {mat.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                                                    </button>
                                                    <button
                                                        onClick={() => setPhase1MaterialPreview(mat)}
                                                        className="p-1.5 hover:bg-cyan-900 hover:text-cyan-300 rounded"
                                                        title="Preview"
                                                    >
                                                        <Eye size={12} />
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setEditingMaterial(mat.id);
                                                            setMaterialForm({
                                                                ...mat,
                                                                mediaType: mat.mediaType || 'number',
                                                                themeOverride: mat.themeOverride ?? null,
                                                                hasDigitalContent: !!mat.digitalContent,
                                                                digitalContentJson: mat.digitalContent ? JSON.stringify(mat.digitalContent, null, 2) : ''
                                                            });
                                                        }}
                                                        className="p-1.5 hover:bg-blue-900 hover:text-blue-400 rounded"
                                                        title="Edit"
                                                    >
                                                        <PenTool size={12} />
                                                    </button>
                                                    <button 
                                                        onClick={() => moveMaterial(mat.id, 'up')}
                                                        disabled={mat.order === 0}
                                                        className="p-1.5 hover:bg-slate-700 rounded disabled:opacity-30"
                                                        title="Move up"
                                                    >
                                                        <ArrowUpCircle size={12} />
                                                    </button>
                                                    <button 
                                                        onClick={() => moveMaterial(mat.id, 'down')}
                                                        disabled={mat.order === courseMaterials.length - 1}
                                                        className="p-1.5 hover:bg-slate-700 rounded disabled:opacity-30 rotate-180"
                                                        title="Move down"
                                                    >
                                                        <ArrowUpCircle size={12} />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteMaterial(mat.id)}
                                                        className="p-1.5 hover:bg-rose-900 hover:text-rose-400 rounded"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>

                        {phase1MaterialPreview && (
                            <div
                                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                onClick={() => setPhase1MaterialPreview(null)}
                            >
                                <div
                                    className="bg-slate-900 border border-slate-700 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <Eye size={20} className="text-cyan-300" />
                                                Material Preview: {phase1MaterialPreview.title}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1">{phase1MaterialPreview.description || 'No description'}</p>
                                        </div>
                                        <button onClick={() => setPhase1MaterialPreview(null)} className="text-slate-400 hover:text-white transition-colors">
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                                        {phase1MaterialCompiledPreviewDoc && (
                                            <div className="mb-6">
                                                <p className="text-[11px] text-cyan-300 font-bold uppercase tracking-wide mb-2">
                                                    Compiled Materials Preview
                                                </p>
                                                <div className="rounded-lg overflow-hidden border border-slate-700 bg-black">
                                                    <iframe
                                                        srcDoc={phase1MaterialCompiledPreviewDoc}
                                                        className="w-full border-0"
                                                        style={{ minHeight: '620px' }}
                                                        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads allow-top-navigation-by-user-activation"
                                                        title={phase1MaterialPreview.title || 'Material Compiled Preview'}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-2">
                                                    This is the compiled module rendering. Use the in-frame <span className="text-emerald-300">Read</span> button to test JSON digital content.
                                                </p>
                                            </div>
                                        )}
                                        {phase1MaterialPreview.viewUrl && (
                                            <div className="mb-6 rounded-lg overflow-hidden border border-slate-700 bg-black">
                                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide px-3 pt-3">Direct Source Preview</p>
                                                <iframe
                                                    src={
                                                        phase1MaterialPreview.viewUrl.includes('/view')
                                                            ? phase1MaterialPreview.viewUrl.replace('/view', '/preview')
                                                            : phase1MaterialPreview.viewUrl
                                                    }
                                                    className="w-full border-0"
                                                    style={{ minHeight: '420px' }}
                                                    title={phase1MaterialPreview.title || 'Material Source Preview'}
                                                />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
                                            <div>
                                                <span className="text-xs font-bold text-slate-500 uppercase">Number</span>
                                                <p className="text-white">{phase1MaterialPreview.number || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-slate-500 uppercase">Badge</span>
                                                <p className="text-white">{getMaterialBadgeLabel(phase1MaterialPreview)}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <span className="text-xs font-bold text-slate-500 uppercase">View URL</span>
                                                <p className="text-cyan-300 text-xs break-all">{phase1MaterialPreview.viewUrl || 'N/A'}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Download URL</span>
                                                <p className="text-cyan-300 text-xs break-all">{phase1MaterialPreview.downloadUrl || 'N/A'}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Digital Content</span>
                                                <p className="text-white text-sm">
                                                    {phase1MaterialPreview.digitalContent
                                                        ? `Enabled (${phase1MaterialPreview.digitalContent?.chapters?.length || 0} chapters)`
                                                        : 'Not configured'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* EDIT MATERIAL MODAL */}
                        {editingMaterial && (
                            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                                <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Edit Material</h3>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <input 
                                                type="text"
                                                value={materialForm.number}
                                                onChange={(e) => setMaterialForm({...materialForm, number: e.target.value})}
                                                placeholder="Number"
                                                className="bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                                            />
                                            <select
                                                value={materialForm.color}
                                                onChange={(e) => setMaterialForm({...materialForm, color: e.target.value})}
                                                className="bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                                            >
                                                <option value="slate">Gray</option>
                                                <option value="rose">Red</option>
                                                <option value="amber">Orange</option>
                                                <option value="emerald">Green</option>
                                                <option value="sky">Blue</option>
                                                <option value="purple">Purple</option>
                                            </select>
                                            <select
                                                value={materialForm.mediaType}
                                                onChange={(e) => setMaterialForm({...materialForm, mediaType: e.target.value})}
                                                className="bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                                            >
                                                <option value="number">Badge: Number</option>
                                                <option value="book">Badge: Book</option>
                                                <option value="pdf">Badge: PDF</option>
                                                <option value="video">Badge: Video</option>
                                                <option value="slides">Badge: Slides</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Card theme</label>
                                            <p className="text-[10px] text-slate-500 mb-1 italic">Overrides Phase 5 default for this material</p>
                                            <select
                                                value={materialForm.themeOverride ?? ''}
                                                onChange={(e) => setMaterialForm({...materialForm, themeOverride: e.target.value || null})}
                                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                                            >
                                                {materialThemeOptions.map((opt) => (
                                                    <option key={opt.value || 'default'} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <input 
                                            type="text"
                                            value={materialForm.title}
                                            onChange={(e) => setMaterialForm({...materialForm, title: e.target.value})}
                                            placeholder="Title"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm"
                                        />
                                        <input 
                                            type="text"
                                            value={materialForm.description}
                                            onChange={(e) => setMaterialForm({...materialForm, description: e.target.value})}
                                            placeholder="Description"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                                        />
                                        <input 
                                            type="text"
                                            value={materialForm.viewUrl}
                                            onChange={(e) => setMaterialForm({...materialForm, viewUrl: e.target.value})}
                                            placeholder="View URL"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                                        />
                                        <input 
                                            type="text"
                                            value={materialForm.downloadUrl}
                                            onChange={(e) => setMaterialForm({...materialForm, downloadUrl: e.target.value})}
                                            placeholder="Download URL"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                                        />
                                        
                                        {/* Module Assignment */}
                                        <div className="p-3 bg-black/50 rounded border border-slate-700">
                                            <label className="block text-xs font-bold text-cyan-400 uppercase mb-2">Assign to Modules (Optional)</label>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {(() => {
                                                    const allModules = projectData["Current Course"]?.modules || [];
                                                    return allModules.map(m => (
                                                        <label key={m.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 p-1.5 rounded">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={(materialForm.assignedModules || []).includes(m.id)}
                                                                onChange={(e) => {
                                                                    const currentAssigned = materialForm.assignedModules || [];
                                                                    const updated = e.target.checked 
                                                                        ? [...currentAssigned, m.id]
                                                                        : currentAssigned.filter(id => id !== m.id);
                                                                    setMaterialForm({...materialForm, assignedModules: updated});
                                                                }}
                                                                className="rounded border-slate-700 bg-slate-900 text-cyan-600"
                                                            />
                                                            <span className="text-xs text-slate-300">{m.title}</span>
                                                        </label>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                        
                                        {/* Digital Content */}
                                        <div className="p-3 bg-black/50 rounded border border-slate-700">
                                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                                                <input 
                                                    type="checkbox"
                                                    checked={materialForm.hasDigitalContent}
                                                    onChange={(e) => setMaterialForm({...materialForm, hasDigitalContent: e.target.checked})}
                                                    className="rounded border-slate-700 bg-slate-900 text-emerald-600"
                                                />
                                                <span className="text-xs font-bold text-emerald-400 uppercase">Enable Digital Resource</span>
                                            </label>
                                            {materialForm.hasDigitalContent && (
                                                <div className="mt-2">
                                                    <p className="text-[10px] text-slate-500 mb-2">Paste JSON content for a themed, readable digital version</p>
                                                    <textarea
                                                        value={materialForm.digitalContentJson || ''}
                                                        onChange={(e) => {
                                                            const json = e.target.value;
                                                            setMaterialForm({...materialForm, digitalContentJson: json});
                                                            try {
                                                                if (json.trim()) {
                                                                    const parsed = JSON.parse(json);
                                                                    if (parsed.chapters || parsed.title) {
                                                                        setMaterialForm(prev => ({...prev, digitalContent: parsed, digitalContentJson: json}));
                                                                    }
                                                                }
                                                            } catch(e) {
                                                                // Invalid JSON
                                                            }
                                                        }}
                                                        placeholder='{"title": "My Resource", "chapters": [...]}'
                                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs font-mono h-32 resize-none"
                                                    />
                                                    {materialForm.digitalContentJson && (
                                                        <div className="mt-2">
                                                            {(() => {
                                                                try {
                                                                    const parsed = JSON.parse(materialForm.digitalContentJson);
                                                                    const chapterCount = parsed.chapters?.length || 0;
                                                                    const sectionCount = parsed.chapters?.reduce((acc, ch) => acc + (ch.sections?.length || 0), 0) || 0;
                                                                    return <p className="text-[10px] text-emerald-400">Valid: {chapterCount} chapters, {sectionCount} sections</p>;
                                                                } catch(e) {
                                                                    return <p className="text-[10px] text-rose-400">Invalid JSON: {e.message}</p>;
                                                                }
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button 
                                            onClick={() => {
                                                setEditingMaterial(null);
                                                setMaterialForm({ number: '', title: '', description: '', viewUrl: '', downloadUrl: '', color: 'slate', mediaType: 'number', themeOverride: null, assignedModules: [], hasDigitalContent: false, digitalContent: null, digitalContentJson: '' });
                                            }}
                                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={() => {
                                                editMaterial(editingMaterial, materialForm);
                                                setEditingMaterial(null);
                                                setMaterialForm({ number: '', title: '', description: '', viewUrl: '', downloadUrl: '', color: 'slate', mediaType: 'number', themeOverride: null, assignedModules: [], hasDigitalContent: false, digitalContent: null, digitalContentJson: '' });
                                            }}
                                            className="flex-1 bg-pink-600 hover:bg-pink-500 text-white py-2 rounded font-bold flex items-center justify-center gap-2"
                                        >
                                            <Save size={16} /> Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                     </div>
                 </div>
            )}

            {harvestType === 'MODULE_MANAGER' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                    <div className="p-6 bg-indigo-900/20 border border-indigo-700/50 rounded-xl">
                        <h3 className="text-lg font-bold text-indigo-400 mb-2 flex items-center gap-2">
                            <Box size={20} /> Module Manager
                        </h3>
                        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                            Add complete HTML pages as modules. Each module runs in its own <span className="text-emerald-400 font-bold">isolated iframe</span> - your code works exactly as you created it with no modifications.
                        </p>
                        
                        {/* Type Selector */}
                        <div className="flex gap-2 mb-6 bg-slate-900 p-1 rounded-lg border border-slate-700">
                            <button
                                onClick={() => {
                                    setModuleManagerType('standalone');
                                    setLinkTestResult(null);
                                }}
                                className={`flex-1 py-2 px-4 rounded text-xs font-bold transition-all ${moduleManagerType === 'standalone' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                Standalone HTML
                            </button>
                            <button
                                onClick={() => {
                                    setModuleManagerType('composer');
                                    setLinkTestResult(null);
                                }}
                                className={`flex-1 py-2 px-4 rounded text-xs font-bold transition-all ${moduleManagerType === 'composer' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                Composer Module
                            </button>
                            <button
                                onClick={() => {
                                    setModuleManagerType('external');
                                    setLinkTestResult(null);
                                }}
                                className={`flex-1 py-2 px-4 rounded text-xs font-bold transition-all ${moduleManagerType === 'external' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                External Link
                            </button>
                        </div>

                        <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900/70 p-3">
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-300">Draft Saves</p>
                                <span className="text-[10px] text-slate-500">{moduleManagerSavedDrafts.length} saved</span>
                            </div>
                            <input
                                ref={moduleManagerDraftImportRef}
                                type="file"
                                accept=".json,application/json"
                                className="hidden"
                                onChange={importModuleManagerDraftFile}
                            />
                            <div className="grid grid-cols-12 gap-2">
                                <button
                                    type="button"
                                    onClick={() => saveModuleManagerDraft({ overwriteSelected: false })}
                                    className="col-span-12 sm:col-span-3 rounded bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-xs font-bold text-white inline-flex items-center justify-center gap-1"
                                >
                                    <Save size={12} /> Save New
                                </button>
                                <button
                                    type="button"
                                    onClick={updateModuleManagerSelectedDraft}
                                    disabled={!moduleManagerSelectedDraftId}
                                    className="col-span-12 sm:col-span-3 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 px-3 py-2 text-xs font-bold text-white inline-flex items-center justify-center gap-1"
                                >
                                    <RefreshCw size={12} /> Update Selected
                                </button>
                                <select
                                    value={moduleManagerSelectedDraftId}
                                    onChange={(e) => setModuleManagerSelectedDraftId(e.target.value)}
                                    className="col-span-12 sm:col-span-6 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                                >
                                    {moduleManagerSavedDrafts.length === 0 && <option value="">No saved drafts</option>}
                                    {moduleManagerSavedDrafts.map((draft) => (
                                        <option key={draft.id} value={draft.id}>
                                            {draft.label} ({draft.savedAt ? new Date(draft.savedAt).toLocaleString() : 'no timestamp'})
                                        </option>
                                    ))}
                                </select>
                                <label className="col-span-12 sm:col-span-6 inline-flex items-center gap-2 rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={moduleManagerDownloadDraftOnSave}
                                        onChange={(event) => setModuleManagerDownloadDraftOnSave(event.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    Download .json when saving
                                </label>
                                <button
                                    type="button"
                                    onClick={loadModuleManagerDraft}
                                    disabled={!moduleManagerSelectedDraftId}
                                    className="col-span-6 sm:col-span-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 px-3 py-2 text-xs font-bold text-white inline-flex items-center justify-center gap-1"
                                >
                                    <FolderOpen size={12} /> Load
                                </button>
                                <button
                                    type="button"
                                    onClick={deleteModuleManagerDraft}
                                    disabled={!moduleManagerSelectedDraftId}
                                    className="col-span-6 sm:col-span-2 rounded bg-rose-700/80 hover:bg-rose-600 disabled:opacity-40 px-3 py-2 text-xs font-bold text-white inline-flex items-center justify-center gap-1"
                                >
                                    <Trash2 size={12} /> Delete
                                </button>
                                <button
                                    type="button"
                                    onClick={triggerModuleManagerDraftImport}
                                    className="col-span-6 sm:col-span-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 text-xs font-bold text-white inline-flex items-center justify-center gap-1"
                                >
                                    <FolderOpen size={12} /> Import File
                                </button>
                                <button
                                    type="button"
                                    onClick={exportModuleManagerSelectedDraft}
                                    disabled={!moduleManagerSelectedDraftId}
                                    className="col-span-6 sm:col-span-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 px-3 py-2 text-xs font-bold text-white inline-flex items-center justify-center gap-1"
                                >
                                    <FileJson size={12} /> Export File
                                </button>
                                <button
                                    type="button"
                                    onClick={resetModuleManagerBuilder}
                                    className="col-span-12 sm:col-span-4 rounded bg-amber-700/80 hover:bg-amber-600 px-3 py-2 text-xs font-bold text-white inline-flex items-center justify-center gap-1"
                                >
                                    <RotateCcw size={12} /> Reset Builder
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">
                                Builder state auto-saves locally. You can keep multiple drafts, import/export JSON draft files, and load any saved draft back into Module Manager.
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Module ID */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                                    Module ID <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={moduleManagerID}
                                    onChange={(e) => setModuleManagerID(e.target.value)}
                                    placeholder="hss3020 or view-hss3020"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm font-mono focus:border-indigo-500 outline-none"
                                />
                                <p className="text-[10px] text-slate-500 mt-1 italic">
                                    Unique identifier (will be prefixed with 'view-' if needed)
                                </p>
                            </div>
                            
                            {/* Module Title */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                                    Module Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={moduleManagerTitle}
                                    onChange={(e) => setModuleManagerTitle(e.target.value)}
                                    placeholder="HSS3020 Course"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-indigo-500 outline-none"
                                />
                                <p className="text-[10px] text-slate-500 mt-1 italic">
                                    Display name for the sidebar button
                                </p>
                            </div>
                            
                            {/* Standalone HTML Input */}
                            {moduleManagerType === 'standalone' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                                            Paste Complete HTML File <span className="text-rose-500">*</span>
                                        </label>
                                        <textarea
                                            value={moduleManagerHTML}
                                            onChange={(e) => setModuleManagerHTML(e.target.value)}
                                            placeholder="<!DOCTYPE html>&#10;<html>&#10;<head>...</head>&#10;<body>...</body>&#10;</html>"
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-indigo-100 text-xs font-mono h-64 resize-y focus:border-indigo-500 outline-none"
                                        />
                                        <p className="text-[10px] text-emerald-400 mt-1 font-bold">
                                            Your code runs AS-IS in an isolated iframe - no modifications needed.
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={addStandaloneModule}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                    >
                                        <Plus size={16} /> Add Standalone Module
                                    </button>
                                </>
                            )}

                            {/* Composer Module Input */}
                            {moduleManagerType === 'composer' && (
                                <>
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                        <div className="lg:col-span-5 bg-slate-950 border border-slate-700 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-bold text-white">Activities</h4>
                                                <span className="text-[11px] text-slate-500">{moduleManagerComposerActivities.length} total</span>
                                            </div>
                                            <div className="mb-3 p-2 rounded border border-slate-700 bg-slate-900/60">
                                                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Grid Columns</label>
                                                <select
                                                    value={moduleManagerComposerMaxColumns}
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
                                                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${moduleManagerComposerMaxColumns}, minmax(0, 1fr))` }}>
                                                    {moduleManagerGridModel.emptySlots.map((slot) => {
                                                        const isSlotTarget =
                                                            moduleManagerComposerDraggingIndex !== null &&
                                                            moduleManagerComposerDragOverSlotKey === slot.key &&
                                                            moduleManagerComposerDragOverIndex === null;
                                                        return (
                                                            <div
                                                                key={slot.key}
                                                                style={{ gridColumn: `${slot.col}`, gridRow: `${slot.row}`, minHeight: '58px' }}
                                                                onDragOver={(event) => {
                                                                    if (!Number.isInteger(moduleManagerComposerDraggingIndex)) return;
                                                                    event.preventDefault();
                                                                    if (event.dataTransfer) {
                                                                        event.dataTransfer.dropEffect = 'move';
                                                                    }
                                                                    if (moduleManagerComposerDragOverSlotKey !== slot.key) {
                                                                        setModuleManagerComposerDragOverSlotKey(slot.key);
                                                                    }
                                                                    if (moduleManagerComposerDragOverIndex !== null) {
                                                                        setModuleManagerComposerDragOverIndex(null);
                                                                    }
                                                                }}
                                                                onDragLeave={() => {
                                                                    if (moduleManagerComposerDragOverSlotKey === slot.key) {
                                                                        setModuleManagerComposerDragOverSlotKey(null);
                                                                    }
                                                                }}
                                                                onDrop={(event) => {
                                                                    event.preventDefault();
                                                                    const fallback = Number.parseInt(event.dataTransfer?.getData('text/plain') || '', 10);
                                                                    const fromIndex = Number.isInteger(moduleManagerComposerDraggingIndex) ? moduleManagerComposerDraggingIndex : fallback;
                                                                    moveComposerActivityToGridCell(fromIndex, slot.row, slot.col);
                                                                    setModuleManagerComposerDraggingIndex(null);
                                                                    setModuleManagerComposerDragOverIndex(null);
                                                                    setModuleManagerComposerDragOverSlotKey(null);
                                                                }}
                                                                onClick={() => {
                                                                    if (!selectedComposerActivity) return;
                                                                    moveComposerActivityToGridCell(moduleManagerComposerSelectedIndex, slot.row, slot.col);
                                                                }}
                                                                className={`rounded border border-dashed transition-colors ${
                                                                    isSlotTarget
                                                                        ? 'border-indigo-400 bg-indigo-500/20'
                                                                        : 'border-slate-700/80 bg-slate-900/35 hover:border-indigo-500/60 hover:bg-slate-900/60'
                                                                } cursor-pointer`}
                                                            />
                                                        );
                                                    })}
                                                    {moduleManagerComposerActivities.map((activity, idx) => {
                                                        const def = getActivityDefinition(activity.type);
                                                        const colSpan = Math.min(activity?.layout?.colSpan || 1, moduleManagerComposerMaxColumns);
                                                        const placement = moduleManagerPlacementByIndex.get(idx);
                                                        const isSelected = idx === moduleManagerComposerSelectedIndex;
                                                        const isDropTarget =
                                                          idx === moduleManagerComposerDragOverIndex &&
                                                          moduleManagerComposerDraggingIndex !== null &&
                                                          idx !== moduleManagerComposerDraggingIndex;
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
                                                                    setModuleManagerComposerDraggingIndex(idx);
                                                                    setModuleManagerComposerSelectedIndex(idx);
                                                                    setModuleManagerComposerDragOverSlotKey(null);
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
                                                                    if (moduleManagerComposerDragOverIndex !== idx) {
                                                                        setModuleManagerComposerDragOverIndex(idx);
                                                                    }
                                                                    if (moduleManagerComposerDragOverSlotKey !== null) {
                                                                        setModuleManagerComposerDragOverSlotKey(null);
                                                                    }
                                                                }}
                                                                onDrop={(event) => {
                                                                    event.preventDefault();
                                                                    const fallback = Number.parseInt(event.dataTransfer?.getData('text/plain') || '', 10);
                                                                    const fromIndex = Number.isInteger(moduleManagerComposerDraggingIndex) ? moduleManagerComposerDraggingIndex : fallback;
                                                                    const placedSpan = placement?.colSpan || colSpan || 1;
                                                                    const placedCol = placement?.col || 1;
                                                                    const rect = event.currentTarget.getBoundingClientRect();
                                                                    const relativeX = rect.width > 0 ? event.clientX - rect.left : 0;
                                                                    const boundedX = Math.max(0, Math.min(Math.max(0, rect.width - 1), relativeX));
                                                                    const offset = placedSpan > 1 && rect.width > 0 ? Math.floor((boundedX / rect.width) * placedSpan) : 0;
                                                                    const targetCol = placedCol + offset;
                                                                    moveComposerActivityToGridCell(fromIndex, placement?.row || 1, targetCol);
                                                                    setModuleManagerComposerDraggingIndex(null);
                                                                    setModuleManagerComposerDragOverIndex(null);
                                                                    setModuleManagerComposerDragOverSlotKey(null);
                                                                }}
                                                                onDragEnd={() => {
                                                                    setModuleManagerComposerDraggingIndex(null);
                                                                    setModuleManagerComposerDragOverIndex(null);
                                                                    setModuleManagerComposerDragOverSlotKey(null);
                                                                }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setModuleManagerComposerSelectedIndex(idx)}
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
                                                {moduleManagerComposerActivities.length === 0 && <p className="text-xs text-slate-500 mt-1">No activities yet.</p>}
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-slate-700">
                                                <div className="grid grid-cols-3 gap-2">
                                                    <select
                                                        value={moduleManagerComposerStarterType}
                                                        onChange={(e) => setModuleManagerComposerStarterType(e.target.value)}
                                                        className="col-span-2 bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                                                    >
                                                        {moduleManagerActivityTypeGroups.map((group) => (
                                                          <optgroup key={`composer-group-${group.category}`} label={group.label}>
                                                            {group.types.map((activityType) => {
                                                              const def = getActivityDefinition(activityType);
                                                              return (
                                                                <option key={activityType} value={activityType}>
                                                                  {def?.label || activityType}
                                                                </option>
                                                              );
                                                            })}
                                                          </optgroup>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={addComposerActivityDraft}
                                                        className="bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-bold text-white inline-flex items-center justify-center gap-1"
                                                    >
                                                        <Plus size={12} /> Add
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={addComposerEmptyRowDraft}
                                                    className="w-full mt-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1.5 text-white text-xs inline-flex items-center justify-center gap-1"
                                                    title="Add one open row of empty drop targets"
                                                >
                                                    <Plus size={12} /> Add Open Row
                                                </button>
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <label className="text-[11px] font-bold text-slate-400 uppercase self-center">Selected Span</label>
                                                    <select
                                                        value={selectedComposerActivity?.layout?.colSpan || 1}
                                                        onChange={(e) => updateSelectedComposerActivitySpan(e.target.value)}
                                                        disabled={!selectedComposerActivity}
                                                        className="bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs disabled:opacity-40"
                                                    >
                                                        {Array.from({ length: moduleManagerComposerMaxColumns }, (_, idx) => idx + 1).map((span) => (
                                                            <option key={span} value={span}>
                                                                Span {span}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2 mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveSelectedComposerActivityDraft('left')}
                                                        disabled={!selectedComposerActivity || !selectedComposerPlacement || selectedComposerPlacement.col <= 1}
                                                        className="px-2 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs inline-flex items-center justify-center gap-1"
                                                        title="Move left"
                                                    >
                                                        <ChevronLeft size={12} /> Left
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveSelectedComposerActivityDraft('right')}
                                                        disabled={
                                                          !selectedComposerActivity ||
                                                          !selectedComposerPlacement ||
                                                          selectedComposerPlacement.col >= Math.max(1, moduleManagerComposerMaxColumns - (selectedComposerActivity?.layout?.colSpan || 1) + 1)
                                                        }
                                                        className="px-2 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs inline-flex items-center justify-center gap-1"
                                                        title="Move right"
                                                    >
                                                        <ChevronRight size={12} /> Right
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveSelectedComposerActivityDraft('up')}
                                                        disabled={!selectedComposerActivity || !selectedComposerPlacement || selectedComposerPlacement.row <= 1}
                                                        className="px-2 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs inline-flex items-center justify-center gap-1"
                                                    >
                                                        <ChevronUp size={12} /> Up
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveSelectedComposerActivityDraft('down')}
                                                        disabled={!selectedComposerActivity}
                                                        className="px-2 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs inline-flex items-center justify-center gap-1"
                                                    >
                                                        <ChevronDown size={12} /> Down
                                                    </button>
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={duplicateSelectedComposerActivityDraft}
                                                        disabled={!selectedComposerActivity}
                                                        className="flex-1 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs inline-flex items-center justify-center gap-1"
                                                        title="Duplicate selected activity"
                                                    >
                                                        <Copy size={12} /> Duplicate
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={removeSelectedComposerActivityDraft}
                                                        disabled={!selectedComposerActivity}
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
                                                {selectedComposerActivity ? (getActivityDefinition(selectedComposerActivity.type)?.label || selectedComposerActivity.type) : 'Activity Editor'}
                                            </h4>
                                            {renderSelectedComposerActivityStylePanel()}
                                            {renderModuleManagerComposerActivityEditor()}
                                        </div>
                                    </div>

                                    <div className="bg-slate-950 border border-slate-700 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-bold text-white">Live Module Preview</h4>
                                            <button
                                                type="button"
                                                onClick={() => setModuleManagerComposerPreviewNonce((n) => n + 1)}
                                                className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-700"
                                                title="Remount preview iframe"
                                            >
                                                <RefreshCw size={12} />
                                                Reset
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mb-3">Preview updates while you build this composer module.</p>
                                        <div className="rounded-lg overflow-hidden border border-slate-800 bg-black">
                                            {moduleManagerComposerPreviewDoc ? (
                                                <iframe
                                                    key={`composer-create-preview-${moduleManagerComposerPreviewNonce}`}
                                                    srcDoc={moduleManagerComposerPreviewDoc}
                                                    className="w-full border-0"
                                                    style={{ minHeight: '420px' }}
                                                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads allow-top-navigation-by-user-activation"
                                                    title="Composer draft live preview"
                                                />
                                            ) : (
                                                <div className="h-48 flex items-center justify-center text-xs text-slate-500">
                                                    Composer preview unavailable.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={addComposerModule}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                    >
                                        <Plus size={16} /> Add Composer Module
                                    </button>
                                </>
                            )}
                            
                            {/* External Link Input */}
                            {moduleManagerType === 'external' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                                            External URL <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="url"
                                                value={moduleManagerURL}
                                                onChange={(e) => {
                                                    setModuleManagerURL(e.target.value);
                                                    setLinkTestResult(null); // Clear test result when URL changes
                                                }}
                                                placeholder="https://myhostedmodule.com"
                                                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm font-mono focus:border-indigo-500 outline-none"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !testingLink) {
                                                        testExternalLink(moduleManagerURL);
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={() => testExternalLink(moduleManagerURL)}
                                                disabled={!moduleManagerURL || testingLink}
                                                className="px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                title="Test if URL is accessible"
                                            >
                                                {testingLink ? 'Testing...' : 'Test'}
                                            </button>
                                        </div>
                                        
                                        {/* Test Result */}
                                        {linkTestResult && (
                                            <div className={`mt-2 p-3 rounded-lg text-xs border ${
                                                linkTestResult.success 
                                                    ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' 
                                                    : 'bg-rose-900/30 text-rose-400 border-rose-500/30'
                                            }`}>
                                                <div className="flex items-start gap-2">
                                                    <span className="font-bold">{linkTestResult.success ? 'OK' : 'Error'}</span>
                                                    <span>{linkTestResult.message}</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <p className="text-[10px] text-slate-500 mt-1 italic">
                                            Full URL to the hosted module page. Press Enter or click Test to verify.
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                                            Link Behavior
                                        </label>
                                        <div className="flex gap-3">
                                            <label className="flex items-center gap-2 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-indigo-500 transition flex-1">
                                                <input
                                                    type="radio"
                                                    name="linkType"
                                                    value="iframe"
                                                    checked={moduleManagerLinkType === 'iframe'}
                                                    onChange={(e) => setModuleManagerLinkType(e.target.value)}
                                                    className="w-4 h-4 text-indigo-600"
                                                />
                                                <span className="text-xs text-slate-300">Open in iframe</span>
                                            </label>
                                            <label className="flex items-center gap-2 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-indigo-500 transition flex-1">
                                                <input
                                                    type="radio"
                                                    name="linkType"
                                                    value="newtab"
                                                    checked={moduleManagerLinkType === 'newtab'}
                                                    onChange={(e) => setModuleManagerLinkType(e.target.value)}
                                                    className="w-4 h-4 text-indigo-600"
                                                />
                                                <span className="text-xs text-slate-300">Open in new tab</span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={addExternalLinkModule}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                    >
                                        <Plus size={16} /> Add External Link Module
                                    </button>
                                </>
                            )}
                            
                            {/* Status Messages */}
                            {moduleManagerStatus && (
                                <div className={`p-4 rounded-lg border ${moduleManagerStatus === 'success' ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-rose-900/20 border-rose-500/30'}`}>
                                    <p className={`text-sm ${moduleManagerStatus === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>
                                        {moduleManagerMessage}
                                    </p>
                                </div>
                            )}
                            
                            {/* Help Section */}
                            <div className="p-4 bg-sky-900/10 border border-sky-500/20 rounded-lg">
                                <h4 className="text-xs font-bold text-sky-400 uppercase mb-2">Module Types</h4>
                                <ul className="text-[10px] text-slate-400 space-y-1 leading-relaxed">
                                    <li><strong className="text-sky-300">Standalone HTML:</strong> Complete HTML file (like HSS3020). CSS auto-scoped, wrapped in view container.</li>
                                    <li><strong className="text-sky-300">Composer Module:</strong> Activity-based module using built-in blocks (content, embeds, resources, checks, submission).</li>
                                    <li><strong className="text-sky-300">External Link:</strong> Link to hosted module. Choose iframe (embedded) or new tab (external).</li>
                                    <li>Modules appear in sidebar navigation.</li>
                                    <li>Can be hidden or shown in Phase 2.</li>
                                    <li>Included in compiled site output.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {harvestType === 'AI_MODULE' && (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                     {/* MODULE/FEATURE TOGGLE */}
                     <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700 w-full max-w-md mx-auto">
                         <button 
                             onClick={() => setAiTargetType('MODULE')}
                             className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-xs font-bold transition-all ${aiTargetType === 'MODULE' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                         >
                             <Box size={14} /> Create Module
                         </button>
                         <button 
                             onClick={() => setAiTargetType('FEATURE')}
                             className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-xs font-bold transition-all ${aiTargetType === 'FEATURE' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                         >
                             <Wrench size={14} /> Create Feature
                         </button>
                     </div>

                     {/* STEP 1: PROMPT GENERATOR */}
                     <div className="p-4 bg-emerald-900/20 border border-emerald-700/50 rounded-lg">
                        <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
                            <Sparkles size={16} /> Step 1: Generate AI Prompt
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">
                            {aiTargetType === 'MODULE' 
                                ? 'Describe what course module you want to create. We\'ll generate an optimized prompt for Google AI Studio.'
                                : 'Describe what reusable feature you want to create. Features are saved to the Global Toolkit and can be used across courses.'
                            }
                        </p>
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-slate-400 uppercase">
                                {aiTargetType === 'MODULE' ? 'Describe Your Module' : 'Describe Your Feature'}
                            </label>
                            <textarea 
                                value={aiDescription}
                                onChange={(e) => setAiDescription(e.target.value)}
                                placeholder={aiTargetType === 'MODULE' 
                                    ? "Example: Create a drag-and-drop goal-setting activity with 3 categories (Personal, Professional, Health). Include a save button that stores goals to localStorage and a reset button."
                                    : "Example: Create a save/load system with 3 buttons: Save Progress, Load Progress, and Clear All. Use localStorage with a configurable storage key. Show success/error toasts."
                                }
                                className="w-full bg-slate-950 border border-emerald-900 rounded-lg p-3 text-sm text-white h-32 focus:border-emerald-500 outline-none resize-y"
                            />
                            <button 
                                onClick={() => {
                                    const safePrompt = `=== PROMPT FOR GOOGLE AI STUDIO ===

I am building a feature for the "Course Factory" Learning Platform. 
I need you to act as a Senior System Architect. 

**YOUR GOAL:** Analyze my feature request and generate robust, non-conflicting code that is safe for a Single Page Application (SPA).

**OUTPUT FORMAT:**
Return ONLY valid JSON. No markdown. Single-line strings.
\`\`\`json
{
  "id": "${aiTargetType === 'MODULE' ? 'view' : 'feat'}-[descriptive-name]",
  "html": "...",
  "script": "..."
}
\`\`\`

**SYSTEM CONTEXT:**
- **Framework:** HTML5 + Vanilla JS + Tailwind CSS (CDN).
- **Theme:** Dark Mode (Bg: \`bg-slate-950\`, Text: \`text-slate-200\`).
- **Wrapper Logic:** Your code is injected into a parent container that handles visibility. **NEVER use \`hidden\` or \`display:none\` on your root HTML element.**

**SAFETY PROTOCOLS (CRITICAL):**
1. **Namespace Security:** All variables and function names MUST use a unique prefix based on the feature name (e.g., \`featCalc_calculate\`, \`featTimer_start\`). Do not use generic names like \`count\` or \`calcValue\`.
2. **Variable Scope Safety:** Use \`var\` (NOT \`const\` or \`let\`) for any state variables that need to be accessed by inline onclick handlers. This ensures they are accessible from the global scope. Example: \`var featCalc_state = {};\` instead of \`const featCalc_state = {};\`.
3. **Window Attachment (CRITICAL):** After defining each function, you MUST explicitly attach it to the window object for Google Sites compatibility. Example:
   \`\`\`javascript
   function featCalc_calculate() { ... }
   window.featCalc_calculate = featCalc_calculate;
   \`\`\`
   This ensures inline onclick handlers can find the function in sandboxed environments.
4. **No Zombie Listeners:** Prefer inline attributes (e.g., \`onclick="featCalc_handle()"\`) over \`window.addEventListener\`.
5. **Visibility Safety:** The HTML string must be visible by default. Do not add \`hidden\` classes to the outer-most div.
6. **Close Logic:** If building a tool, the close button should trigger \`toggleTool('tool-id')\` (where 'tool-id' matches your div id, e.g. 'tool-calculator').
7. **Initialization Block (REQUIRED):** At the END of your script, you MUST add initialization code to force execution in sandboxed environments (like Google Sites). This ensures all functions are registered before user interaction. Minimum requirement:
   \`\`\`javascript
   // Force script execution
   if (document.readyState === 'loading') {
       document.addEventListener('DOMContentLoaded', function() {
           console.log('[feature-name] loaded');
       });
   } else {
       console.log('[feature-name] loaded');
   }
   \`\`\`
   If your code has state to restore from localStorage, call your populate/init function here instead.

**LOGIC ROUTER (How to build this):**

**CASE A: Standard Tool (Calculator, Timer, Notes)**
- Build a fixed position Card UI (\`fixed bottom-4 right-4 z-50 bg-slate-800\`).
- Ensure the UI is visible immediately (no \`hidden\` class).
- Use \`localStorage\` for saving data.

**CASE B: System Integrator (Theme Switcher, Progress Bar)**
- To read data, scan DOM via \`document.querySelectorAll\`.

**CASE C: Visual Overlay (Modal, Popup)**
- Use \`fixed inset-0 z-[100]\` to sit on top of the Sidebar.

**CASE D: External Libraries (Charts, PDF)**
- Inject the required CDN script tag inside the HTML string.

**MY REQUEST:**
${aiDescription}
`;

                                    setGeneratedPrompt(safePrompt);
                                }}
                                disabled={!aiDescription.trim()}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Sparkles size={14} /> Generate Full Prompt
                            </button>
                        </div>

                        {generatedPrompt && (
                            <div className="mt-4 pt-4 border-t border-emerald-800">
                                <CodeBlock label="Copy this prompt to Google AI Studio" code={generatedPrompt} height="h-64" />
                                <div className="mt-2 p-3 bg-sky-900/20 border border-sky-700/50 rounded text-xs text-sky-200">
                                    <strong>Next:</strong> Copy the prompt above, paste it into Google AI Studio, and copy the JSON response back to Step 2 below.
                                </div>
                            </div>
                        )}
                     </div>

                     {/* STEP 2: JSON PARSER */}
                     <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                        <h3 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2">
                            <FileJson size={16} /> Step 2: Import AI Studio Output
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">
                            Paste the JSON response from Google AI Studio here. We'll validate and parse it.
                        </p>
                        <div className="space-y-3">
                            <textarea 
                                value={aiOutput}
                                onChange={(e) => {
                                    setAiOutput(e.target.value);
                                    setAiParseError(null);
                                    setParsedAiModule(null);
                                }}
                                placeholder={aiTargetType === 'MODULE' 
                                    ? 'Paste JSON here: { "id": "view-example", "html": "...", "script": "..." }'
                                    : 'Paste JSON here: { "id": "feat-example", "html": "...", "script": "..." }'
                                }
                                className="w-full bg-slate-950 border border-blue-900 rounded-lg p-3 text-xs text-blue-100 font-mono h-48 focus:border-blue-500 outline-none resize-y"
                            />
                            
                            {aiParseError && (
                                <div className="p-3 bg-rose-900/30 border border-rose-600 rounded text-xs text-rose-200">
                                    <strong>Parse Error:</strong> {aiParseError}
                                </div>
                            )}

                            {parsedAiModule && (
                                <div className="space-y-2">
                                    <div className="p-3 bg-emerald-900/20 border border-emerald-700 rounded space-y-1">
                                        <div className="flex items-center gap-2 text-xs text-emerald-300">
                                            <CheckCircle size={14} /> <strong>Valid JSON detected</strong>
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            ID: <span className="font-mono text-emerald-400">{parsedAiModule.id}</span>
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            HTML length: <span className="text-white">{parsedAiModule.html?.length || 0}</span> chars
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            Script: <span className="text-white">{parsedAiModule.script ? 'Present' : 'None'}</span>
                                        </div>
                                    </div>
                                    
                                <input 
                                    type="text" 
                                    value={stagingTitle} 
                                    onChange={(e) => setStagingTitle(e.target.value)} 
                                        placeholder={aiTargetType === 'MODULE' 
                                            ? "Module title for sidebar (e.g., Goal Setting Activity)"
                                            : "Feature title for Global Toolkit (e.g., Save/Load System)"
                                        }
                                        className="w-full bg-slate-950 border border-blue-700 rounded-lg p-3 text-white text-sm"
                                    />
                                </div>
                            )}

                                <button 
                                    onClick={() => {
                                    try {
                                        const trimmed = aiOutput.trim();
                                        // Try to extract JSON from markdown code blocks if present
                                        let jsonStr = trimmed;
                                        if (trimmed.includes('```json')) {
                                            const match = trimmed.match(/```json\s*([\s\S]*?)\s*```/);
                                            if (match) jsonStr = match[1];
                                        } else if (trimmed.includes('```')) {
                                            const match = trimmed.match(/```\s*([\s\S]*?)\s*```/);
                                            if (match) jsonStr = match[1];
                                        }
                                        
                                        const parsed = JSON.parse(jsonStr);
                                        
                                        // Validate required fields
                                        if (!parsed.id) throw new Error('Missing "id" field');
                                        if (!parsed.html) throw new Error('Missing "html" field');
                                        
                                        setParsedAiModule(parsed);
                                        setAiParseError(null);
                                        setStagingJson(JSON.stringify(parsed, null, 2));
                                    } catch (e) {
                                        setAiParseError(e.message);
                                        setParsedAiModule(null);
                                    }
                                }}
                                disabled={!aiOutput.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <FileJson size={14} /> Parse & Validate JSON
                                </button>
                            </div>
                     </div>

                     {/* STEP 3: COMMIT */}
                     {parsedAiModule && stagingTitle && (
                         <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <CheckCircle size={16} /> Step 3: Preview & Commit
                            </h3>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => {
                                        handleSessionSave(stagingJson);
                                        // Reset AI Studio state after commit
                                        setAiDescription("");
                                        setGeneratedPrompt("");
                                        setAiOutput("");
                                        setParsedAiModule(null);
                                        setStagingTitle("");
                                    }}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-lg"
                                >
                                    <Zap size={16} /> Add to Project
                                </button>
                            </div>
                            {saveStatus === 'success' && (
                                <div className="mt-3 text-xs text-emerald-400 font-bold animate-in fade-in zoom-in flex items-center gap-2 justify-center bg-emerald-900/20 p-2 rounded border border-emerald-800">
                                    <CheckCircle size={14} /> 
                                    {aiTargetType === 'MODULE' 
                                        ? 'Module added! Check Phase 2 to preview or Phase 4 to compile.'
                                        : 'Feature added to Global Toolkit! Check Phase 2 to preview or Phase 4 to add to a course.'
                                    }
                        </div>
                    )}
                 </div>
                     )}
             </div>
        )}

        </>
      </div>
      
      {/* VAULT BROWSER MODAL */}
      {isVaultOpen && (
        <VaultBrowser 
            onSelect={handleVaultSelect} 
            onClose={() => { setIsVaultOpen(false); setVaultTargetField(null); }} 
        />
      )}
    </div>
  );
};

export default Phase1;
