import * as React from 'react';
import { Terminal, BookOpen, Layers, Copy, Check, FileJson, Settings, Scissors, Sparkles, RefreshCw, Search, Clipboard, Upload, Save, Database, Trash2, LayoutTemplate, PenTool, Plus, FolderOpen, Download, AlertTriangle, AlertOctagon, ShieldCheck, FileCode, Lock, Unlock, Box, ArrowUpCircle, ArrowRight, Zap, CheckCircle, Package, Link as LinkIcon, ToggleLeft, ToggleRight, Eye, EyeOff, ChevronUp, ChevronDown, X, Edit, Clock, RotateCcw, PanelLeftClose, PanelLeftOpen, Moon, Sun } from 'lucide-react';
import {
  buildModuleFrameHTML,
  buildPreviewStorageScope,
} from './utils/generators.js';
import { compileModuleToHtml } from './utils/compiler.js';
import { checkModuleDependencies } from './utils/dependencies.js';
import { normalizePlacements, renderAssessment } from './assessment/index.js';
import { useToast, ToastContainer, CodeBlock, Toggle } from './components/Shared.jsx';
// Shared UI (useToast/ToastContainer/CodeBlock/Toggle) moved to src/components/Shared.jsx
import { PROJECT_DATA, MASTER_SHELL } from './data/constants.js';
import { useProjectPersistence } from './hooks/useProjectPersistence.js';
import { useAppError } from './hooks/useAppError.js';
import { usePreviewState } from './hooks/usePreviewState.js';
import { useModuleEditor } from './hooks/useModuleEditor.js';
import { getHubTitle } from './utils/hubConfig.js';
import Phase5 from './components/Phase5.jsx';
import Phase4 from './components/Phase4.jsx';
import Phase3 from './components/Phase3.jsx';
import Phase2 from './components/Phase2.jsx';
import Phase1 from './components/Phase1.jsx';
import Phase0 from './components/Phase0.jsx';
import ErrorDisplay from './components/ErrorDisplay.jsx';
import ConfirmationModal from './components/ConfirmationModal.jsx';
import Section from './components/Section.jsx';
import PreviewModal from './components/modals/PreviewModal.jsx';
import EditModal from './components/modals/EditModal.jsx';

const { useState, useEffect } = React;

// ==========================================
// TOAST NOTIFICATION SYSTEM
// ==========================================
// (moved to src/components/Shared.jsx)

// ==========================================
// FIREBASE CONFIG & INIT (DISABLED LOCALLY)
// ==========================================

const SIDEBAR_COLLAPSED_KEY = 'course_factory_sidebar_collapsed_v1';
const BUILDER_THEME_KEY = 'course_factory_builder_theme_v1';

// ==========================================
// PROJECT DATA (THE LIVING LIBRARY)
// ==========================================


// PROJECT_DATA and MASTER_SHELL moved to src/data/constants.js

// Shared UI moved to src/components/Shared.jsx

// ==========================================
// MODULE UTILITY FUNCTIONS (Unified)
// ==========================================

/**
 * Get module type: 'standalone', 'external', or 'legacy'
 */

// --- Phases ---


// Phase 0 extracted to src/components/Phase0.jsx



// Phase 1 extracted to src/components/Phase1.jsx



// Phase 2 extracted to src/components/Phase2.jsx



// Phase 3 extracted to src/components/Phase3.jsx


// Pure function to build site HTML - used by both Phase 2 preview and Phase 4 compile


// Phase 4 extracted to src/components/Phase4.jsx



// Phase 5 extracted to src/components/Phase5.jsx


// --- UNIFIED ERROR DISPLAY COMPONENT ---

// ErrorDisplay extracted to src/components/ErrorDisplay.jsx


// --- DEPENDENCY TRACKING UTILITY ---
// checkModuleDependencies moved to src/utils/dependencies.js

// --- CONFIRMATION MODAL HELPER (Enhanced with Dependencies) ---

// ConfirmationModal extracted to src/components/ConfirmationModal.jsx


export function App() {
  const [activePhase, setActivePhase] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [builderTheme, setBuilderTheme] = useState(() => {
    try {
      return localStorage.getItem(BUILDER_THEME_KEY) === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });
  // Initialize state with PROJECT_DATA constant
  const [projectData, setProjectData] = useState(PROJECT_DATA);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [vaultTargetField, setVaultTargetField] = useState(null); // 'view' or 'download'

  // --- AUTO-SAVE STATE ---
  const STORAGE_KEY = 'course_factory_v2_data';
  
  // --- TOAST NOTIFICATIONS ---
  const { toasts, showToast, removeToast } = useToast();

  // --- AUTO-LOAD / AUTO-SAVE ---
  const { lastSaved } = useProjectPersistence({
    projectData,
    setProjectData,
    showToast,
    storageKey: STORAGE_KEY,
  });

  // --- UNIFIED ERROR HANDLING ---
  const { appError, handleError, dismissError } = useAppError({ autoDismissMs: 10000 });

  // (auto-load/auto-save moved to src/hooks/useProjectPersistence.js)

  const [excludedIds, setExcludedIds] = useState([]);
  const {
    previewModule,
    enablePreviewScripts,
    openPreview,
    closePreview,
    resetPreview,
    togglePreviewScripts,
    sandbox: previewSandbox,
    iframeKey: previewIframeKey,
  } = usePreviewState();

  const {
    editingModule,
    setEditingModule,
    editForm,
    setEditForm,
    moduleHistory,
    setModuleHistory,
    openEditModule,
    saveEditModule,
    revertModuleVersion,
  } = useModuleEditor({ projectData, setProjectData });
  
  // Custom Confirmation State to replace window.confirm
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); // { id, type: 'module' | 'tool', dependencies?: {...} }
  
  // Course Name Rename State
  const [isRenamingCourse, setIsRenamingCourse] = useState(false);
  const [tempCourseName, setTempCourseName] = useState("");

  // Assessment Builder State
  const [assessmentType, setAssessmentType] = useState('quiz');
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([{ question: '', options: ['', '', '', ''], correct: 0 }]);
  const [generatedAssessment, setGeneratedAssessment] = useState("");
  const [printInstructions, setPrintInstructions] = useState("");
  const [editingAssessment, setEditingAssessment] = useState(null);
  
  // Master Assessment System
  const [masterQuestions, setMasterQuestions] = useState([]);
  const [masterAssessmentTitle, setMasterAssessmentTitle] = useState("");
  const [currentQuestionType, setCurrentQuestionType] = useState('multiple-choice');
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correct: 0
  });
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
    } catch {
      // Ignore localStorage write failures.
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-builder-theme', builderTheme);
    document.documentElement.style.colorScheme = builderTheme === 'light' ? 'light' : 'dark';
    try {
      localStorage.setItem(BUILDER_THEME_KEY, builderTheme);
    } catch {
      // Ignore localStorage write failures.
    }
  }, [builderTheme]);
  
  // Note: Preview scripts execute inside the iframe, not in the parent window
  // The iframe's srcDoc includes the script, so it runs in the iframe's scope

  const currentCourse = projectData["Current Course"] || { name: "Error", modules: [] };
  const previewStorageScope = React.useMemo(
    () => buildPreviewStorageScope('phase2-preview', previewModule?.id || previewModule?.title || 'module'),
    [previewModule?.id, previewModule?.title],
  );
  const previewSrcDoc = React.useMemo(() => {
    if (!previewModule) return '';
    const courseModules = projectData["Current Course"]?.modules || [];
    const isCourseModule = courseModules.some((m) => m.id === previewModule.id);
    if (isCourseModule) {
      return (
        compileModuleToHtml({
          projectData,
          moduleId: previewModule.id,
          renderSettings: { __storageScope: previewStorageScope },
        }) || ''
      );
    }
    // Keep fallback behavior for non-course items like toolkit previews.
      return (
        buildModuleFrameHTML(previewModule, {
          ...(projectData['Course Settings'] || {}),
          hubConfig: projectData.hubConfig,
          __storageScope: previewStorageScope,
        }) || ''
      );
  }, [previewModule, previewStorageScope, projectData]);

  // Rename Course Function
  const renameCourse = (newName) => {
    if (!newName || newName.trim() === "") {
      alert("Course name cannot be empty");
      return;
    }
    setProjectData({
      ...projectData,
      "Current Course": {
        ...projectData["Current Course"],
        name: newName
      }
    });
    setIsRenamingCourse(false);
  };

  const toggleModuleExclusion = (moduleId) => {
    setExcludedIds(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Toggle module hidden state
  const toggleModuleHidden = (moduleId) => {
    const modules = projectData["Current Course"]?.modules || [];
    const module = modules.find(m => m.id === moduleId);
    const newHiddenState = !(module?.hidden || false);
    
    const updated = modules.map(m => 
      m.id === moduleId ? { ...m, hidden: newHiddenState } : m
    );
    
    setProjectData({
      ...projectData,
      "Current Course": {
        ...projectData["Current Course"],
        modules: updated
      }
    });
    
    // Sync with Phase 4 excludedIds
    if (newHiddenState) {
      setExcludedIds(prev => prev.includes(moduleId) ? prev : [...prev, moduleId]);
    } else {
      setExcludedIds(prev => prev.filter(id => id !== moduleId));
    }
  };

  // Check if module is protected (Course Materials or Assessments)
  const isProtectedModule = (item) => {
    let itemCode = item.code || {};
    if (typeof itemCode === 'string') {
      try {
        itemCode = JSON.parse(itemCode);
      } catch {
        itemCode = {};
      }
    }
    return itemCode.id === 'view-materials' || 
           item.id === 'item-assessments' || 
           item.title === 'Assessments';
  };

  const deleteModule = (item) => {
    // Prevent deletion of protected modules
    if (isProtectedModule(item)) {
      alert('Warning: Course Materials and Assessments are core modules and cannot be deleted.\n\nYou can hide them instead using the hide/show toggle in Phase 2.');
      return;
    }
    
    // Determine if this is a module or a toolkit feature
    const isToolkitItem = projectData["Global Toolkit"]?.some(t => t.id === item.id);
    
    // Check dependencies for modules
    let dependencies = null;
    if (!isToolkitItem) {
      dependencies = checkModuleDependencies(item.id, projectData);
    }
    
    setDeleteConfirmation({ 
      id: item.id, 
      type: isToolkitItem ? 'tool' : 'module',
      dependencies: dependencies
    });
  };

  const confirmDelete = () => {
    if (!deleteConfirmation) return;
    
    if (deleteConfirmation.type === 'module') {
      // Safety check: prevent deletion of protected modules
      const moduleToDelete = projectData["Current Course"]?.modules?.find(m => m.id === deleteConfirmation.id);
      if (moduleToDelete && isProtectedModule(moduleToDelete)) {
        alert('Warning: Course Materials and Assessments are core modules and cannot be deleted.');
        setDeleteConfirmation(null);
        return;
      }
      
      let items = projectData["Current Course"]?.modules || [];
      items = items.filter(m => m.id !== deleteConfirmation.id);
    setProjectData({
      ...projectData,
        "Current Course": {
          ...projectData["Current Course"],
          modules: items
        }
      });
    } else if (deleteConfirmation.type === 'tool') {
      let tools = projectData["Global Toolkit"] || [];
      tools = tools.filter(t => t.id !== deleteConfirmation.id);
      setProjectData({
        ...projectData,
        "Global Toolkit": tools
      });
    }
    
    setDeleteConfirmation(null);
  };

  // ASSESSMENTS MANAGEMENT FUNCTIONS
  const getAssessmentsModule = () => {
    return currentCourse.modules.find(m => m.id === "item-assessments" || m.title === "Assessments");
  };

  function updateAssessmentsModule(updatedAssessments) {
    const moduleIndex = currentCourse.modules.findIndex(m => m.id === "item-assessments" || m.title === "Assessments");
    if (moduleIndex === -1) return;
    
    const newModules = [...currentCourse.modules];
    newModules[moduleIndex] = {
      ...newModules[moduleIndex],
      assessments: updatedAssessments
    };
    
    setProjectData({
      ...projectData,
      "Current Course": {
        ...projectData["Current Course"],
        modules: newModules
      }
    });
  }

  const addMaterial = (materialData) => {
    const currentMaterials = projectData["Current Course"]?.materials || [];
    const newMaterial = {
      id: `mat-${Date.now()}`,
      number: materialData.number,
      mediaType: materialData.mediaType || 'number',
      title: materialData.title,
      description: materialData.description,
      viewUrl: materialData.viewUrl,
      downloadUrl: materialData.downloadUrl,
      color: materialData.color || 'slate',
      themeOverride: materialData.themeOverride || null,
      hidden: false,
      order: currentMaterials.length,
      assignedModules: materialData.assignedModules || [],
      digitalContent: materialData.digitalContent || null
    };
    
      setProjectData({
        ...projectData,
      "Current Course": {
        ...projectData["Current Course"],
        materials: [...currentMaterials, newMaterial]
      }
    });
  };

  const editMaterial = (materialId, updates) => {
    const currentMaterials = projectData["Current Course"]?.materials || [];
    const updated = currentMaterials.map(m => 
      m.id === materialId ? { ...m, ...updates } : m
    );
    setProjectData({
      ...projectData,
      "Current Course": {
        ...projectData["Current Course"],
        materials: updated
      }
    });
  };

  const deleteMaterial = (materialId) => {
    const currentMaterials = projectData["Current Course"]?.materials || [];
    const updated = currentMaterials.filter(m => m.id !== materialId);
    setProjectData({
      ...projectData,
      "Current Course": {
        ...projectData["Current Course"],
        materials: updated
      }
    });
  };

  const moveMaterial = (materialId, direction) => {
    const currentMaterials = projectData["Current Course"]?.materials || [];
    const index = currentMaterials.findIndex(m => m.id === materialId);
    if (index === -1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentMaterials.length) return;
    
    const reordered = [...currentMaterials];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    
    // Update order values
    reordered.forEach((mat, idx) => {
      mat.order = idx;
    });
    
    setProjectData({
      ...projectData,
      "Current Course": {
        ...projectData["Current Course"],
        materials: reordered
      }
    });
  };

  const toggleMaterialHidden = (materialId) => {
    const currentMaterials = projectData["Current Course"]?.materials || [];
    const updated = currentMaterials.map(m => 
      m.id === materialId ? { ...m, hidden: !m.hidden } : m
    );
    setProjectData({
      ...projectData,
      "Current Course": {
        ...projectData["Current Course"],
        materials: updated
      }
    });
  };

  const addAssessment = (assessment) => {
    const assessmentsModule = getAssessmentsModule();
    const assessments = assessmentsModule?.assessments || [];
    const newAssessment = {
      ...assessment,
      id: `assess_${Date.now()}`,
      order: assessments.length,
      hidden: false,
      placements: normalizePlacements(assessment?.placements || [{ targetType: 'hub' }]),
    };
    const updated = [...assessments, newAssessment];
    updateAssessmentsModule(updated);
  };

  const editAssessment = (assessmentId, updates) => {
    const assessmentsModule = getAssessmentsModule();
    const assessments = assessmentsModule?.assessments || [];
    const normalizedUpdates = { ...updates };
    if (Object.prototype.hasOwnProperty.call(normalizedUpdates, 'placements')) {
      normalizedUpdates.placements = normalizePlacements(normalizedUpdates.placements);
    }
    const updated = assessments.map(a => 
      a.id === assessmentId ? { ...a, ...normalizedUpdates } : a
    );
    updateAssessmentsModule(updated);
  };

  const deleteAssessment = (assessmentId) => {
    const assessmentsModule = getAssessmentsModule();
    const assessments = assessmentsModule?.assessments || [];
    const updated = assessments
      .filter(a => a.id !== assessmentId)
      .map((assessment, index) => ({ ...assessment, order: index }));
    updateAssessmentsModule(updated);
  };

  const moveAssessment = (assessmentId, direction) => {
    const assessmentsModule = getAssessmentsModule();
    const assessments = assessmentsModule?.assessments || [];
    const index = assessments.findIndex(a => a.id === assessmentId);
    if (index === -1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= assessments.length) return;
    
    const reordered = [...assessments];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    
    // Update order values
    reordered.forEach((assess, idx) => {
      assess.order = idx;
    });
    
    updateAssessmentsModule(reordered);
  };

  const toggleAssessmentHidden = (assessmentId) => {
    const assessmentsModule = getAssessmentsModule();
    const assessments = assessmentsModule?.assessments || [];
    const updated = assessments.map(a => 
      a.id === assessmentId ? { ...a, hidden: !a.hidden } : a
    );
    updateAssessmentsModule(updated);
  };

  // MASTER ASSESSMENT FUNCTIONS
  const generateQuestionId = () => `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const buildMasterQuestion = (payload, fallbackType = 'multiple-choice') => {
    const questionType = payload.type || fallbackType;
    return {
      id: payload.id || generateQuestionId(),
      question: payload.question || '',
      options: payload.options?.slice() || ['', '', '', ''],
      correct: typeof payload.correct === 'number' ? payload.correct : 0,
      type: questionType,
      order: typeof payload.order === 'number' ? payload.order : 0
    };
  };

  const addQuestionToMaster = (questionData = null) => {
    const payload = questionData || { ...currentQuestion, type: currentQuestionType };
    setMasterQuestions(prev => {
      const existingIndex = prev.findIndex(q => q.id === payload.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        const preservedOrder = updated[existingIndex]?.order ?? existingIndex;
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...buildMasterQuestion(payload, currentQuestionType),
          order: preservedOrder
        };
        return updated;
      }
      const newQuestion = {
        ...buildMasterQuestion(payload, currentQuestionType),
        order: prev.length
      };
      return [...prev, newQuestion];
    });

    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correct: 0
    });
  };

  const moveQuestion = (questionId, direction) => {
    setMasterQuestions(prev => {
      const index = prev.findIndex(q => q.id === questionId);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const reordered = [...prev];
      [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
      return reordered.map((q, idx) => ({ ...q, order: idx }));
    });
  };

  const deleteQuestion = (questionId) => {
    setMasterQuestions(prev => {
      const filtered = prev.filter(q => q.id !== questionId);
      return filtered.map((q, idx) => ({ ...q, order: idx }));
    });
  };

  const updateQuestion = (questionId, updates) => {
    setMasterQuestions(prev => prev.map(q => q.id === questionId ? { ...q, ...updates } : q));
  };

  const clearMasterAssessment = () => {
    setMasterQuestions([]);
    setMasterAssessmentTitle("");
    setCurrentQuestion({ question: '', options: ['', '', '', ''], correct: 0 });
    setEditingQuestion(null);
  };

  const generateMixedAssessment = () => {
    if (!masterAssessmentTitle || masterQuestions.length === 0) {
      alert('Please add a title and at least one question to the Master Assessment.');
      return;
    }
    const assessment = renderAssessment({
      title: masterAssessmentTitle,
      type: 'mixed',
      questions: masterQuestions,
    }, {
      courseSettings: projectData["Course Settings"] || {},
      idSeed: Date.now(),
    });

    setGeneratedAssessment(JSON.stringify(assessment, null, 2));
  };

  return (
    <div className="cf-app-shell min-h-screen text-white">
      {/* Top Header */}
      <header className="cf-glass-nav border-b border-slate-800/70 p-4">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
            <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Settings className="text-blue-400" size={20} />
              Course Factory Dashboard
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1 font-mono">
              LIVING DOC - SAVED {lastSaved ? lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toUpperCase() : '---'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="cf-theme-toggle" role="group" aria-label="Builder theme">
              <button
                type="button"
                onClick={() => setBuilderTheme('dark')}
                className={`cf-theme-toggle-btn ${builderTheme === 'dark' ? 'is-active' : ''}`}
                aria-pressed={builderTheme === 'dark'}
                title="Use dark builder theme"
              >
                <Moon size={14} />
                Dark
              </button>
              <button
                type="button"
                onClick={() => setBuilderTheme('light')}
                className={`cf-theme-toggle-btn ${builderTheme === 'light' ? 'is-active' : ''}`}
                aria-pressed={builderTheme === 'light'}
                title="Use light builder theme"
              >
                <Sun size={14} />
                Light
              </button>
            </div>
            {isRenamingCourse ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempCourseName}
                  onChange={(e) => setTempCourseName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') renameCourse(tempCourseName);
                    if (e.key === 'Escape') setIsRenamingCourse(false);
                  }}
                  className="cf-input-shell min-w-[16rem] px-3 py-2 text-sm"
                  placeholder="Course Name"
                  autoFocus
                />
                <button
                  onClick={() => renameCourse(tempCourseName)}
                  className="cf-btn cf-btn-success inline-flex h-10 w-10 items-center justify-center rounded-xl p-0"
                  title="Save project name"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => setIsRenamingCourse(false)}
                  className="cf-btn cf-btn-secondary inline-flex h-10 w-10 items-center justify-center rounded-xl p-0"
                  title="Cancel rename"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempCourseName(currentCourse.name);
                  setIsRenamingCourse(true);
                }}
                className="cf-btn cf-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold"
              >
                PROJECT: {currentCourse.name.toUpperCase()}
                <PenTool size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex max-w-[1800px] mx-auto w-full min-w-0">
        {/* Left Sidebar */}
        <aside
          className={`${sidebarCollapsed ? 'w-[78px] p-3' : 'w-64 p-4'} cf-glass-nav border-r border-slate-800/70 min-h-[calc(100vh-73px)] flex flex-col transition-[width,padding] duration-200 ease-out`}
        >
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed ? (
              <h3 className="text-[11px] font-semibold text-slate-500">Factory line</h3>
            ) : (
              <span className="sr-only">Factory navigation</span>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="cf-btn cf-btn-secondary inline-flex h-9 w-9 items-center justify-center rounded-xl p-0 text-slate-300"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>

          <div className={`flex-grow ${sidebarCollapsed ? 'space-y-4' : 'space-y-6'}`}>
            <div>
              {!sidebarCollapsed ? (
                <div className="cf-glass-soft mb-4 rounded-2xl border border-slate-800/80 p-3">
                  <p className="text-[11px] font-semibold text-slate-500">Fast lane</p>
                  <div className="mt-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => setActivePhase(1)}
                      className="cf-btn cf-btn-primary inline-flex w-full items-center justify-center px-3 py-2.5 text-xs font-bold"
                      title="Resume Composer"
                    >
                      <Zap size={14} /> Resume Composer
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setActivePhase(2)}
                        className="cf-btn cf-btn-secondary inline-flex items-center justify-center px-3 py-2.5 text-[11px] font-bold"
                        title="Jump to Preview"
                      >
                        <Eye size={13} /> Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePhase(4)}
                        className="cf-btn cf-btn-secondary inline-flex items-center justify-center px-3 py-2.5 text-[11px] font-bold"
                        title="Jump to Compile"
                      >
                        <Package size={13} /> Compile
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePhase(1)}
                    className="cf-btn cf-btn-primary inline-flex h-11 w-full items-center justify-center rounded-2xl p-0"
                    title="Resume Composer"
                    aria-label="Resume Composer"
                  >
                    <Zap size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePhase(2)}
                    className="cf-btn cf-btn-secondary inline-flex h-11 w-full items-center justify-center rounded-2xl p-0"
                    title="Jump to Preview"
                    aria-label="Jump to Preview"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePhase(4)}
                    className="cf-btn cf-btn-secondary inline-flex h-11 w-full items-center justify-center rounded-2xl p-0"
                    title="Jump to Compile"
                    aria-label="Jump to Compile"
                  >
                    <Package size={16} />
                  </button>
                </div>
              )}

              {!sidebarCollapsed ? (
                <p className="mb-2 text-[11px] font-semibold text-slate-500">Destinations</p>
              ) : null}
              <div className="space-y-1">
                <Section
                  title="Phase 0: Master Shell"
                  icon={Layers}
                  isActive={activePhase === 0}
                  onClick={() => setActivePhase(0)}
                  collapsed={sidebarCollapsed}
                />
                <Section
                  title="Phase 1: Harvest"
                  icon={FileJson}
                  isActive={activePhase === 1}
                  onClick={() => setActivePhase(1)}
                  collapsed={sidebarCollapsed}
                />
                <Section
                  title="Phase 2: Preview & Test"
                  icon={Eye}
                  isActive={activePhase === 2}
                  onClick={() => setActivePhase(2)}
                  badge={currentCourse.modules.length}
                  badgeColor="cf-nav-badge-accent"
                  collapsed={sidebarCollapsed}
                />
                <Section
                  title="Phase 3: Manage & Reset"
                  icon={BookOpen}
                  isActive={activePhase === 3}
                  onClick={() => setActivePhase(3)}
                  collapsed={sidebarCollapsed}
                />
                <Section
                  title="Phase 4: Compile"
                  icon={Package}
                  isActive={activePhase === 4}
                  onClick={() => setActivePhase(4)}
                  collapsed={sidebarCollapsed}
                />
                <Section
                  title="Phase 5: Ops"
                  icon={Settings}
                  isActive={activePhase === 5}
                  onClick={() => setActivePhase(5)}
                  collapsed={sidebarCollapsed}
                />
              </div>
            </div>

            {!sidebarCollapsed ? (
              <div>
                <h3 className="mb-3 text-[11px] font-semibold text-slate-500">
                  In {getHubTitle(projectData)}
                </h3>
                <div className="space-y-1">
                  {currentCourse.modules.map((mod, idx) => (
                    <div key={mod.id} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-slate-800 transition-colors group">
                      <button
                        onClick={() => toggleModuleHidden(mod.id)}
                        className="p-0.5 hover:text-emerald-400 transition-colors"
                        title={mod.hidden ? "Show module" : "Hide module"}
                      >
                        {mod.hidden ? <EyeOff size={12} className="text-slate-600" /> : <Eye size={12} className="text-emerald-500" />}
                      </button>
                      <span className="text-slate-300 truncate flex-1">{mod.title}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            if (idx === 0) return;
                            const newModules = [...currentCourse.modules];
                            [newModules[idx], newModules[idx - 1]] = [newModules[idx - 1], newModules[idx]];
                            setProjectData({
                              ...projectData,
                              "Current Course": { ...projectData["Current Course"], modules: newModules }
                            });
                          }}
                          disabled={idx === 0}
                          className="p-0.5 hover:text-sky-400 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Up"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          onClick={() => {
                            if (idx === currentCourse.modules.length - 1) return;
                            const newModules = [...currentCourse.modules];
                            [newModules[idx], newModules[idx + 1]] = [newModules[idx + 1], newModules[idx]];
                            setProjectData({
                              ...projectData,
                              "Current Course": { ...projectData["Current Course"], modules: newModules }
                            });
                          }}
                          disabled={idx === currentCourse.modules.length - 1}
                          className="p-0.5 hover:text-sky-400 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Down"
                        >
                          <ChevronDown size={12} />
                        </button>
                        <button
                          onClick={() => deleteModule(mod)}
                          disabled={isProtectedModule(mod)}
                          className={`p-0.5 ${isProtectedModule(mod) ? 'opacity-30 cursor-not-allowed' : 'hover:text-rose-400'}`}
                          title={isProtectedModule(mod) ? 'Core module (cannot be deleted)' : 'Delete'}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="cf-glass-soft rounded-2xl border border-slate-800/80 px-2 py-3 text-center">
                <p className="text-[10px] font-semibold text-slate-500">Modules</p>
                <p className="mt-1 text-sm font-semibold text-white">{currentCourse.modules.length}</p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow min-h-[600px] min-w-0 overflow-x-hidden p-4">
          {activePhase === 0 && <Phase0 projectData={projectData} setProjectData={setProjectData} />}
          {activePhase === 1 && <Phase1 
            projectData={projectData} 
            setProjectData={setProjectData} 
            addMaterial={addMaterial} 
            editMaterial={editMaterial} 
            deleteMaterial={deleteMaterial} 
            moveMaterial={moveMaterial} 
            toggleMaterialHidden={toggleMaterialHidden} 
            addAssessment={addAssessment} 
            editAssessment={editAssessment} 
            deleteAssessment={deleteAssessment} 
            moveAssessment={moveAssessment} 
            toggleAssessmentHidden={toggleAssessmentHidden} 
            addQuestionToMaster={addQuestionToMaster} 
            moveQuestion={moveQuestion} 
            deleteQuestion={deleteQuestion} 
            updateQuestion={updateQuestion} 
            clearMasterAssessment={clearMasterAssessment} 
            masterQuestions={masterQuestions} 
            setMasterQuestions={setMasterQuestions} 
            masterAssessmentTitle={masterAssessmentTitle} 
            setMasterAssessmentTitle={setMasterAssessmentTitle} 
            currentQuestionType={currentQuestionType} 
            setCurrentQuestionType={setCurrentQuestionType} 
            currentQuestion={currentQuestion} 
            setCurrentQuestion={setCurrentQuestion} 
            editingQuestion={editingQuestion} 
            setEditingQuestion={setEditingQuestion} 
            generateMixedAssessment={generateMixedAssessment} 
            generatedAssessment={generatedAssessment} 
            setGeneratedAssessment={setGeneratedAssessment} 
            assessmentType={assessmentType} 
            setAssessmentType={setAssessmentType} 
            assessmentTitle={assessmentTitle} 
            setAssessmentTitle={setAssessmentTitle} 
            quizQuestions={quizQuestions} 
            setQuizQuestions={setQuizQuestions} 
            printInstructions={printInstructions} 
            setPrintInstructions={setPrintInstructions} 
            editingAssessment={editingAssessment} 
            setEditingAssessment={setEditingAssessment} 
            isVaultOpen={isVaultOpen}
            setIsVaultOpen={setIsVaultOpen}
            setVaultTargetField={setVaultTargetField}
            vaultTargetField={vaultTargetField}
          />}
          {activePhase === 2 && <Phase2 projectData={projectData} setProjectData={setProjectData} editMaterial={editMaterial} onEdit={openEditModule} onPreview={openPreview} onDelete={deleteModule} deleteMaterial={deleteMaterial} deleteAssessment={deleteAssessment} />}
          {activePhase === 3 && <Phase3 onGoToMaster={() => setActivePhase(0)} projectData={projectData} setProjectData={setProjectData} />}
          {activePhase === 4 && <Phase4 projectData={projectData} setProjectData={setProjectData} excludedIds={excludedIds} toggleModule={toggleModuleExclusion} onToggleHidden={toggleModuleHidden} onError={handleError} />}
          {activePhase === 5 && (
            <Phase5
              projectData={projectData}
              setProjectData={setProjectData}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* UNIFIED ERROR DISPLAY */}
      <ErrorDisplay error={appError} onDismiss={dismissError} />

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={!!deleteConfirmation}
        message={deleteConfirmation?.type === 'module' ? "This will permanently delete this module and all its content." : "This will permanently delete this toolkit item."}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmation(null)}
        dependencies={deleteConfirmation?.dependencies || null}
      />
      
      {/* EDIT MODAL */}
      <EditModal
        editingModule={editingModule}
        editForm={editForm}
        setEditForm={setEditForm}
        setEditingModule={setEditingModule}
        projectData={projectData}
        setProjectData={setProjectData}
        saveEditModule={saveEditModule}
        moduleHistory={moduleHistory}
        setModuleHistory={setModuleHistory}
        revertModuleVersion={revertModuleVersion}
      />
      {/* PREVIEW MODAL */}
      <PreviewModal
        previewModule={previewModule}
        enablePreviewScripts={enablePreviewScripts}
        onReset={resetPreview}
        onToggleScripts={togglePreviewScripts}
        onClose={closePreview}
        srcDoc={previewSrcDoc}
        sandbox={previewSandbox}
        iframeKey={previewIframeKey}
      />
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
    </div>
  );
}

// Helper Section Component

// Section extracted to src/components/Section.jsx
