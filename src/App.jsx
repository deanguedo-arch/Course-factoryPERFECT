import * as React from 'react';
import { Terminal, BookOpen, Layers, Copy, Check, FileJson, Settings, Scissors, Sparkles, RefreshCw, Search, Clipboard, Upload, Save, Database, Trash2, LayoutTemplate, PenTool, Plus, FolderOpen, Download, AlertTriangle, AlertOctagon, ShieldCheck, FileCode, Lock, Unlock, Wrench, Box, ArrowUpCircle, ArrowRight, Zap, CheckCircle, Package, Link as LinkIcon, ToggleLeft, ToggleRight, Eye, EyeOff, ChevronUp, ChevronDown, X, Edit, Clock, RotateCcw } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import {
  buildSiteHtml,
  generateMasterShell,
  buildModuleFrameHTML,
  validateProject,
  validateModule,
  cleanModuleHTML,
  cleanModuleScript,
  extractModuleContent,
  getModuleType,
  getFontFamilyGlobal,
  getAccentColor,
  escapeHtml,
  validateUrl,
  getMaterialBadgeLabel,
  buildBetaManifest as buildBetaManifestGen,
  generateHubPageBeta as generateHubPageBetaGen,
  generateModuleHtmlBeta as generateModuleHtmlBetaGen,
  buildStaticFilesBeta as buildStaticFilesBetaGen,
} from './utils/generators.js';
import { useToast, ToastContainer, CodeBlock, Toggle } from './components/Shared.jsx';
// Shared UI (useToast/ToastContainer/CodeBlock/Toggle) moved to src/components/Shared.jsx
import { PROJECT_DATA, MASTER_SHELL } from './data/constants.js';
import Phase5 from './components/Phase5.jsx';
import Phase4 from './components/Phase4.jsx';
import Phase3 from './components/Phase3.jsx';
import Phase2 from './components/Phase2.jsx';
import Phase1 from './components/Phase1.jsx';
import Phase0 from './components/Phase0.jsx';

const { useState, useEffect, useRef } = React;

// ==========================================
// Ã°Å¸Å¸Â¢ TOAST NOTIFICATION SYSTEM
// ==========================================
// (moved to src/components/Shared.jsx)

// ==========================================
// Ã°Å¸â€Â´ FIREBASE CONFIG & INIT (DISABLED LOCALLY)
// ==========================================
// const firebaseConfig = JSON.parse(__firebase_config);
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);
const appId = 'course-factory-v1';

// ==========================================
// Ã°Å¸Å¸Â¢ PROJECT DATA (THE LIVING LIBRARY)
// ==========================================


// PROJECT_DATA and MASTER_SHELL moved to src/data/constants.js

// Shared UI moved to src/components/Shared.jsx

// ==========================================
// Ã°Å¸â€Â§ MODULE UTILITY FUNCTIONS (Unified)
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
const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;
  
  const getErrorIcon = () => {
    switch (error.type) {
      case 'compile': return <FileCode size={20} />;
      case 'preview': return <Eye size={20} />;
      case 'module': return <Box size={20} />;
      default: return <AlertTriangle size={20} />;
    }
  };
  
  const getErrorColor = () => {
    switch (error.type) {
      case 'compile': return 'rose';
      case 'preview': return 'amber';
      case 'module': return 'purple';
      default: return 'rose';
    }
  };
  
  const color = getErrorColor();
  const colorClasses = {
    rose: { bg: 'bg-rose-900/20', border: 'border-rose-500/50', text: 'text-rose-400', icon: 'text-rose-500' },
    amber: { bg: 'bg-amber-900/20', border: 'border-amber-500/50', text: 'text-amber-400', icon: 'text-amber-500' },
    purple: { bg: 'bg-purple-900/20', border: 'border-purple-500/50', text: 'text-purple-400', icon: 'text-purple-500' }
  };
  const colors = colorClasses[color];
  
  return (
    <div className={`fixed top-4 right-4 z-[100] max-w-md animate-in slide-in-from-top-4 fade-in duration-300 ${colors.bg} ${colors.border} border rounded-xl p-4 shadow-2xl backdrop-blur-sm`}>
      <div className="flex items-start gap-3">
        <div className={`${colors.icon} flex-shrink-0 mt-0.5`}>
          {getErrorIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`${colors.text} font-bold text-sm uppercase tracking-wider`}>
              {error.type === 'compile' ? 'Compilation Error' : 
               error.type === 'preview' ? 'Preview Error' : 
               error.type === 'module' ? 'Module Error' : 'Error'}
            </h3>
            <button
              onClick={onDismiss}
              className={`${colors.text} hover:text-white transition-colors flex-shrink-0`}
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-white text-sm mb-2">{error.message}</p>
          {error.details && (
            <details className="mt-2">
              <summary className={`${colors.text} text-xs cursor-pointer hover:text-white transition-colors`}>
                Technical Details
              </summary>
              <pre className="mt-2 text-xs text-slate-300 bg-slate-950/50 p-2 rounded border border-slate-700 overflow-auto max-h-32 font-mono">
                {error.details}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

// --- DEPENDENCY TRACKING UTILITY ---
const checkModuleDependencies = (moduleId, projectData) => {
  const dependencies = {
    modules: [],
    assessments: [],
    toolkit: [],
    materials: []
  };
  
  const moduleTitle = projectData["Current Course"]?.modules?.find(m => m.id === moduleId)?.title || moduleId;
  const shortId = moduleId.replace('view-', '').replace('item-', '');
  
  // Check all modules for references
  const allModules = projectData["Current Course"]?.modules || [];
  allModules.forEach(mod => {
    if (mod.id === moduleId) return; // Skip self
    
    // Check HTML content (including rawHtml for new format)
    const moduleContent = mod.rawHtml || mod.html || mod.code?.html || '';
    if (moduleContent.includes(moduleId) || moduleContent.includes(shortId)) {
      dependencies.modules.push({
        id: mod.id,
        title: mod.title,
        type: 'HTML reference'
      });
    }
    
    // Check script content
    const moduleScript = mod.script || mod.code?.script || '';
    if (moduleScript.includes(moduleId) || moduleScript.includes(shortId)) {
      const existing = dependencies.modules.find(d => d.id === mod.id);
      if (existing) {
        existing.type = 'HTML & Script reference';
      } else {
        dependencies.modules.push({
          id: mod.id,
          title: mod.title,
          type: 'Script reference'
        });
      }
    }
  });
  
  // Check assessments
  allModules.forEach(mod => {
    const assessments = mod.assessments || [];
    assessments.forEach(assess => {
      const assessHTML = assess.html || '';
      const assessScript = assess.script || '';
      const content = assessHTML + assessScript;
      
      if (content.includes(moduleId) || content.includes(shortId)) {
        dependencies.assessments.push({
          id: assess.id,
          title: assess.title,
          moduleTitle: mod.title
        });
      }
    });
  });
  
  // Check toolkit items
  const toolkit = projectData["Global Toolkit"] || [];
  toolkit.forEach(tool => {
    const toolCode = typeof tool.code === 'string' ? JSON.parse(tool.code || '{}') : (tool.code || {});
    const toolContent = (toolCode.html || '') + (toolCode.script || '');
    
    if (toolContent.includes(moduleId) || toolContent.includes(shortId)) {
      dependencies.toolkit.push({
        id: tool.id,
        title: tool.title
      });
    }
  });
  
  // Check materials (less common, but possible)
  const materials = projectData["Current Course"]?.materials || [];
  materials.forEach(mat => {
    const matContent = (mat.title || '') + (mat.description || '') + (mat.viewUrl || '');
    if (matContent.includes(moduleId) || matContent.includes(shortId)) {
      dependencies.materials.push({
        id: mat.id,
        title: mat.title
      });
    }
  });
  
  const totalDeps = dependencies.modules.length + dependencies.assessments.length + 
                    dependencies.toolkit.length + dependencies.materials.length;
  
  return {
    hasDependencies: totalDeps > 0,
    dependencies,
    totalCount: totalDeps,
    moduleTitle
  };
};

// --- CONFIRMATION MODAL HELPER (Enhanced with Dependencies) ---
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel, dependencies }) => {
    if (!isOpen) return null;
    
    const hasDeps = dependencies && dependencies.hasDependencies;
    
    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onCancel}>
            <div className={`bg-slate-900 border rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto ${hasDeps ? 'border-amber-900' : 'border-rose-900'}`} onClick={e => e.stopPropagation()}>
                <div className={`flex items-center gap-3 mb-4 ${hasDeps ? 'text-amber-500' : 'text-rose-500'}`}>
                    <AlertOctagon size={24} />
                    <h3 className="text-lg font-bold">{hasDeps ? 'Ã¢Å¡Â Ã¯Â¸Â Dependencies Found' : 'Delete Item?'}</h3>
                </div>
                
                {hasDeps ? (
                    <>
                        <div className="mb-4 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                            <p className="text-amber-200 text-sm mb-3">
                                <strong>"{dependencies.moduleTitle}"</strong> is referenced in {dependencies.totalCount} place{dependencies.totalCount !== 1 ? 's' : ''}:
                            </p>
                            
                            {dependencies.dependencies.modules.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs font-bold text-amber-400 uppercase mb-1">Modules ({dependencies.dependencies.modules.length}):</p>
                                    <ul className="text-xs text-amber-200 space-y-1 ml-4">
                                        {dependencies.dependencies.modules.map(dep => (
                                            <li key={dep.id}>Ã¢â‚¬Â¢ {dep.title} <span className="text-amber-500">({dep.type})</span></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {dependencies.dependencies.assessments.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs font-bold text-amber-400 uppercase mb-1">Assessments ({dependencies.dependencies.assessments.length}):</p>
                                    <ul className="text-xs text-amber-200 space-y-1 ml-4">
                                        {dependencies.dependencies.assessments.map(dep => (
                                            <li key={dep.id}>Ã¢â‚¬Â¢ {dep.title} <span className="text-amber-500">(in {dep.moduleTitle})</span></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {dependencies.dependencies.toolkit.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs font-bold text-amber-400 uppercase mb-1">Toolkit Items ({dependencies.dependencies.toolkit.length}):</p>
                                    <ul className="text-xs text-amber-200 space-y-1 ml-4">
                                        {dependencies.dependencies.toolkit.map(dep => (
                                            <li key={dep.id}>Ã¢â‚¬Â¢ {dep.title}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {dependencies.dependencies.materials.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs font-bold text-amber-400 uppercase mb-1">Materials ({dependencies.dependencies.materials.length}):</p>
                                    <ul className="text-xs text-amber-200 space-y-1 ml-4">
                                        {dependencies.dependencies.materials.map(dep => (
                                            <li key={dep.id}>Ã¢â‚¬Â¢ {dep.title}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            <p className="text-xs text-amber-300 mt-3 italic">
                                Deleting this module may break these items. Proceed with caution.
                            </p>
                        </div>
                    </>
                ) : (
                    <p className="text-slate-300 text-sm mb-6">{message}</p>
                )}
                
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors">Cancel</button>
                    <button onClick={onConfirm} className={`flex-1 py-2 rounded-lg text-sm font-bold shadow-lg transition-colors ${hasDeps ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20'}`}>
                        {hasDeps ? 'Ã¢Å¡Â Ã¯Â¸Â Delete Anyway' : 'Delete Forever'}
                    </button>
                </div>
      </div>
    </div>
  );
};

export function App() {
  const [activePhase, setActivePhase] = useState(0);
  const [scannerNotes, setScannerNotes] = useState("");
  // Initialize state with PROJECT_DATA constant
  const [projectData, setProjectData] = useState(PROJECT_DATA);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [vaultTargetField, setVaultTargetField] = useState(null); // 'view' or 'download'

  // CSS AUTO-SCOPING FUNCTION (moved here to be accessible to all App functions)
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
  // --- AUTO-SAVE STATE ---
  const STORAGE_KEY = 'course_factory_v2_data';
  const [isAutoLoaded, setIsAutoLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // --- TOAST NOTIFICATIONS ---
  const { toasts, showToast, removeToast } = useToast();
  
  // --- UNIFIED ERROR HANDLING STATE ---
  const [appError, setAppError] = useState(null); // { type: 'compile' | 'preview' | 'module' | 'general', message: string, details?: string }
  
  // --- ERROR HANDLING UTILITIES ---
  const handleError = (type, message, details = null) => {
    const error = { type, message, details };
    setAppError(error);
    console.error(`[${type.toUpperCase()}]`, message, details || '');
    // Auto-dismiss after 10 seconds
    setTimeout(() => setAppError(null), 10000);
  };
  
  const dismissError = () => setAppError(null);

  // Ã°Å¸â€™Â¾ AUTO-LOAD: Runs once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Safety check: ensure it has the correct structure
        if (parsed && parsed["Current Course"]) {
          setProjectData(parsed);
          showToast('Project restored from storage', 'success');
        }
      }
      setIsAutoLoaded(true); // Allow saving to start
    } catch (error) {
      showToast('Failed to load project data. Starting fresh.', 'error');
      console.error("Ã¢ÂÅ’ Load failed:", error);
      setIsAutoLoaded(true);
    }
  }, []);

  // Ã°Å¸â€™Â¾ AUTO-SAVE: Runs when projectData changes
  useEffect(() => {
    if (!isAutoLoaded) return; // Safety Lock: Don't save empty defaults

    const timer = setTimeout(() => {
      try {
        const dataSize = JSON.stringify(projectData).length;
        const sizeMB = (dataSize / 1024 / 1024).toFixed(2);
        
        // Warn if approaching storage limit (4MB warning threshold)
        if (dataSize > 4 * 1024 * 1024) {
          showToast(`Warning: Project is ${sizeMB}MB. Approaching storage limit.`, 'warning', 6000);
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projectData));
        setLastSaved(new Date());
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          showToast('Storage full! Project too large. Please export backup immediately.', 'error', 10000);
        } else {
          showToast('Failed to save project. Check console for details.', 'error');
        }
        console.error("Ã¢ÂÅ’ Save failed:", error);
      }
    }, 1000); // 1-second debounce

    return () => clearTimeout(timer);
  }, [projectData, isAutoLoaded, showToast]);

  const [excludedIds, setExcludedIds] = useState([]);
  const [editingModule, setEditingModule] = useState(null); 
  const [editForm, setEditForm] = useState({ title: '', html: '', script: '', id: '', section: '', moduleType: '', url: '', linkType: 'iframe', fullDocument: '' });
  const [previewModule, setPreviewModule] = useState(null);
  const [enablePreviewScripts, setEnablePreviewScripts] = useState(false);
  const [previewFrameNonce, setPreviewFrameNonce] = useState(0);
  const [moduleHistory, setModuleHistory] = useState(null); // { moduleId, history: [...] }
  
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
  
  // Assessment Migrator State
  const [migrateCode, setMigrateCode] = useState("");
  const [migratePrompt, setMigratePrompt] = useState("");
  const [migrateOutput, setMigrateOutput] = useState("");

  // Note: Preview scripts execute inside the iframe, not in the parent window
  // The iframe's srcDoc includes the script, so it runs in the iframe's scope
  const previewIdentity = previewModule?.id || previewModule?.title || '';
  useEffect(() => {
    if (!previewIdentity) return;
    setEnablePreviewScripts(false);
    setPreviewFrameNonce((n) => n + 1);
  }, [previewIdentity]);

  const currentCourse = projectData["Current Course"] || { name: "Error", modules: [] };
  const toolkit = projectData["Global Toolkit"] || [];

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

  const openEditModule = (item) => {
    // Handle external link modules
    if (item.type === 'external') {
      setEditForm({
        title: item.title,
        url: item.url || '',
        linkType: item.linkType || 'iframe',
        id: item.id,
        section: 'Current Course',
        moduleType: 'external'
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
          hasRawHtml: true  // Flag to indicate this uses rawHtml format
        });
        setEditingModule(item.id);
        return;
      }
      
      // FALLBACK: Reconstruct full document from parsed parts (legacy standalone)
      let fullDocument = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>' + (item.title || 'Module') + '</title>\n';
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
        hasRawHtml: false
      });
      setEditingModule(item.id);
      return;
    }
    
    // Legacy module format (old code structure)
    let itemCode = item.code || {};
    if (typeof itemCode === 'string') {
      try { itemCode = JSON.parse(itemCode); } catch(e) {}
    }
    setEditForm({
      title: item.title,
      html: itemCode.html || '',
      script: itemCode.script || '',
      id: item.id,
      section: 'Current Course',
      moduleType: 'legacy'
    });
    setEditingModule(item.id);
  };

  const saveEditModule = () => {
    const section = editForm.section;
    let items = projectData[section]?.modules || [];
    const idx = items.findIndex(m => m.id === editingModule);
    if (idx === -1) return;

    // Save current version to history before updating
    const currentModule = { ...items[idx] }; // Create a copy to avoid mutation issues
    const history = currentModule.history || [];
    
    // Create history snapshot (only save if content actually changed)
    const newSnapshot = {
      timestamp: new Date().toISOString(),
      title: currentModule.title,
      ...(currentModule.type === 'standalone' ? (
        // Use rawHtml if available (new format), otherwise use legacy fields
        currentModule.rawHtml ? { rawHtml: currentModule.rawHtml } : {
          html: currentModule.html,
          css: currentModule.css,
          script: currentModule.script
        }
      ) : currentModule.type === 'external' ? {
        url: currentModule.url,
        linkType: currentModule.linkType
      } : {
        code: currentModule.code
      })
    };
    
    // Only add to history if it's different from the last snapshot (avoid duplicates)
    const lastSnapshot = history[history.length - 1];
    const hasChanged = !lastSnapshot || 
      JSON.stringify(newSnapshot) !== JSON.stringify({...lastSnapshot, timestamp: newSnapshot.timestamp});
    
    // Calculate updated history
    let updatedHistory = history;
    if (hasChanged) {
      // Keep only last 10 versions to prevent storage bloat
      updatedHistory = [...history, newSnapshot].slice(-10);
    }

    // Handle external link modules
    if (editForm.moduleType === 'external') {
      items[idx] = {
        ...items[idx],
        title: editForm.title,
        url: editForm.url,
        linkType: editForm.linkType || 'iframe',
        type: 'external',
        history: updatedHistory
      };
    }
    // Handle standalone HTML modules - SIMPLIFIED: store rawHtml directly
    else if (editForm.moduleType === 'standalone') {
      // Store the complete HTML document as-is - NO PARSING
      // The iframe will handle everything
      items[idx] = {
        ...items[idx],
        title: editForm.title,
        rawHtml: editForm.fullDocument.trim(),  // Store complete document
        // Clear legacy fields (not needed with rawHtml)
        html: '',
        css: '',
        script: '',
        type: 'standalone',
        history: updatedHistory
      };
    }
    // Legacy module format
    else {
      items[idx] = {
        ...items[idx],
        title: editForm.title,
        code: {
          id: items[idx].code?.id || editForm.id,
          html: editForm.html,
          script: editForm.script
        },
        history: updatedHistory
      };
    }
    
    setProjectData({
      ...projectData,
      [section]: {
        ...projectData[section],
        modules: items
      }
    });
    setEditingModule(null);
  };

  // Revert module to a previous version
  const revertModuleVersion = (moduleId, versionIndex) => {
    const section = 'Current Course';
    let items = projectData[section]?.modules || [];
    const idx = items.findIndex(m => m.id === moduleId);
    if (idx === -1) return;
    
    const module = items[idx];
    const history = module.history || [];
    if (versionIndex < 0 || versionIndex >= history.length) return;
    
    const version = history[versionIndex];
    
    // Restore the version based on module type
    if (module.type === 'standalone') {
      // Check if version has rawHtml (new format) or legacy fields
      if (version.rawHtml) {
        items[idx] = {
          ...items[idx],
          title: version.title,
          rawHtml: version.rawHtml,
          html: '',
          css: '',
          script: ''
        };
      } else {
        items[idx] = {
          ...items[idx],
          title: version.title,
          rawHtml: '',  // Clear rawHtml if reverting to legacy format
          html: version.html || '',
          css: version.css || '',
          script: version.script || ''
        };
      }
    } else if (module.type === 'external') {
      items[idx] = {
        ...items[idx],
        title: version.title,
        url: version.url || '',
        linkType: version.linkType || 'iframe'
      };
    } else {
      items[idx] = {
        ...items[idx],
        title: version.title,
        code: version.code || {}
      };
    }
    
    setProjectData({
      ...projectData,
      [section]: {
        ...projectData[section],
        modules: items
      }
    });
    
    // Refresh edit form if module is currently being edited
    if (editingModule === moduleId) {
      const updatedModule = items[idx];
      openEditModule(updatedModule);
    }
    
    setModuleHistory(null);
  };

  const openPreview = (item) => {
    setPreviewModule(item);
  };

  // Check if module is protected (Course Materials or Assessments)
  const isProtectedModule = (item) => {
    let itemCode = item.code || {};
    if (typeof itemCode === 'string') {
      try { itemCode = JSON.parse(itemCode); } catch(e) {}
    }
    return itemCode.id === 'view-materials' || 
           item.id === 'item-assessments' || 
           item.title === 'Assessments';
  };

  const deleteModule = (item) => {
    // Prevent deletion of protected modules
    if (isProtectedModule(item)) {
      alert('Ã¢Å¡Â Ã¯Â¸Â Course Materials and Assessments are core modules and cannot be deleted.\n\nYou can hide them instead using the hide/show toggle in Phase 2.');
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
        alert('Ã¢Å¡Â Ã¯Â¸Â Course Materials and Assessments are core modules and cannot be deleted.');
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

  // MATERIALS MANAGEMENT FUNCTIONS
  const getMaterialsModule = () => {
    const currentCourse = projectData["Current Course"] || { modules: [] };
    return currentCourse.modules.find(m => {
      let itemCode = m.code || {};
      if (typeof itemCode === 'string') {
        try { itemCode = JSON.parse(itemCode); } catch(e) {}
      }
      return itemCode.id === "view-materials";
    });
  };

  // ASSESSMENTS MANAGEMENT FUNCTIONS
  const getAssessmentsModule = () => {
    return currentCourse.modules.find(m => m.id === "item-assessments" || m.title === "Assessments");
  };

  const updateMaterialsModule = (updatedMaterials) => {
    const moduleIndex = currentCourse.modules.findIndex(m => {
      let itemCode = m.code || {};
      if (typeof itemCode === 'string') {
        try { itemCode = JSON.parse(itemCode); } catch(e) {}
      }
      return itemCode.id === "view-materials";
    });
    if (moduleIndex === -1) return;
    
    const newModules = [...currentCourse.modules];
    newModules[moduleIndex] = {
      ...newModules[moduleIndex],
      materials: updatedMaterials
    };
    
    setProjectData({
      ...projectData,
      "Current Course": {
        ...projectData["Current Course"],
        modules: newModules
      }
    });
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

  const resetMaterialOverrides = () => {
    const currentMaterials = projectData["Current Course"]?.materials || [];
    const hasOverride = currentMaterials.some(mat => mat.themeOverride);
    if (!hasOverride) return false;
    const clearedMaterials = currentMaterials.map(mat => (
      mat.themeOverride ? { ...mat, themeOverride: null } : mat
    ));
    setProjectData(prev => ({
      ...prev,
      "Current Course": {
        ...prev["Current Course"],
        materials: clearedMaterials
      }
    }));
    return true;
  };

  const resetAssessmentOverrides = () => {
    const assessmentsModule = getAssessmentsModule();
    const assessments = assessmentsModule?.assessments || [];
    const hasOverride = assessments.some(a => a.textColorOverride || a.boxColorOverride);
    if (!hasOverride) return false;
    const clearedAssessments = assessments.map(a => ({
      ...a,
      textColorOverride: null,
      boxColorOverride: null
    }));
    updateAssessmentsModule(clearedAssessments);
    return true;
  };

  const applyVisualDefaults = () => {
    const materialsCleared = resetMaterialOverrides();
    const assessmentsCleared = resetAssessmentOverrides();
    if (materialsCleared || assessmentsCleared) {
      showToast('Per-material and assessment overrides were cleared, reverting to Phase 5 defaults.', 'success');
    } else {
      showToast('Materials and assessments already use the Phase 5 defaults.', 'info');
    }
  };

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

  const handleVaultSelect = (file) => {
    if (vaultTargetField === 'view') {
        setMaterialForm(prev => ({ ...prev, viewUrl: file.path }));
    } else if (vaultTargetField === 'download') {
        setMaterialForm(prev => ({ ...prev, downloadUrl: file.path }));
    }
    setIsVaultOpen(false);
    setVaultTargetField(null);
  };

  const addAssessment = (assessment) => {
    const assessmentsModule = getAssessmentsModule();
    const assessments = assessmentsModule?.assessments || [];
    const newAssessment = {
      ...assessment,
      id: `assess_${Date.now()}`,
      order: assessments.length,
      hidden: false
    };
    const updated = [...assessments, newAssessment];
    updateAssessmentsModule(updated);
  };

  const editAssessment = (assessmentId, updates) => {
    const assessmentsModule = getAssessmentsModule();
    const assessments = assessmentsModule?.assessments || [];
    const updated = assessments.map(a => 
      a.id === assessmentId ? { ...a, ...updates } : a
    );
    updateAssessmentsModule(updated);
  };

  const deleteAssessment = (assessmentId) => {
    const assessmentsModule = getAssessmentsModule();
    const assessments = assessmentsModule?.assessments || [];
    const updated = assessments.filter(a => a.id !== assessmentId);
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

    const assessmentId = `mixed_${Date.now()}`;
    
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
    
    // Helper function to determine question type consistently
    const getQuestionType = (q) => {
      if (q.type) return q.type;
      // Fallback: if options array has content, it's multiple-choice
      return (q.options && q.options.length > 0 && q.options.some(opt => opt && opt.trim())) 
        ? 'multiple-choice' 
        : 'long-answer';
    };
    
    const mcQuestions = masterQuestions.filter(q => getQuestionType(q) === 'multiple-choice');
    const laQuestions = masterQuestions.filter(q => getQuestionType(q) === 'long-answer');
    
    // Build HTML for all questions
    let questionsHtml = '';
    let questionIndex = 0;
    let mcIndex = 0;
    let laIndex = 0;

    masterQuestions.forEach((q, idx) => {
      const isMC = getQuestionType(q) === 'multiple-choice';
      const qNum = idx + 1;

      if (isMC && q.options && q.options.length > 0) {
        // Multiple Choice Question
        questionsHtml += `
          <div class="mb-8 p-6 ${cardBgClass} rounded-xl border ${cardBorderClass}">
            <h3 class="text-lg font-bold ${headingTextClass} mb-4">${qNum}. ${q.question || 'Untitled Question'}</h3>
            <div class="space-y-2">
              ${q.options.map((opt, optIdx) => `
                <label class="flex items-center gap-3 p-3 ${optionBgClass} rounded-lg cursor-pointer ${optionHoverClass} transition-colors">
                  <input type="radio" name="q${idx}" value="${optIdx}" class="w-4 h-4 assessment-input" />
                  <span class="${bodyTextClass}">${opt || ''}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `;
        mcIndex++;
      } else {
        // Long Answer Question
        questionsHtml += `
          <div class="mb-8 p-6 ${cardBgClass} rounded-xl border ${cardBorderClass} print-section">
            <h3 class="text-lg font-bold ${headingTextClass} mb-4 print-question">${qNum}. ${q.question || 'Untitled Question'}</h3>
            <textarea 
              id="${assessmentId}-answer-${laIndex}" 
              placeholder="Type your answer here..."
              class="w-full h-48 ${inputBgClass} border ${cardBorderClass} rounded-lg p-4 ${inputTextClass} resize-none focus:border-${accentColor}-500 focus:outline-none print-response assessment-input"
            ></textarea>
            <p class="text-xs ${secondaryTextClass} italic mt-2 no-print">Auto-saved to browser</p>
          </div>
        `;
        laIndex++;
      }
      questionIndex++;
    });

    const html = `<div id="${assessmentId}" class="w-full h-full custom-scroll p-8">
      <div class="max-w-4xl mx-auto">
        <header class="mb-8">
          <h1 class="text-3xl font-black ${headingTextClass} italic mb-2 print-title">${masterAssessmentTitle}</h1>
          <p class="text-sm ${secondaryTextClass} no-print">
            ${mcQuestions.length > 0 && laQuestions.length > 0 
              ? `Complete ${mcQuestions.length} multiple-choice and ${laQuestions.length} long-answer questions.`
              : mcQuestions.length > 0 
                ? `Select the best answer for each of ${mcQuestions.length} questions.`
                : `Complete all ${laQuestions.length} questions. Your responses are auto-saved.`
            }
          </p>
        </header>
        
        ${laQuestions.length > 0 ? `
          <!-- Student Info (only for long-answer assessments) -->
          <div class="grid grid-cols-2 gap-4 mb-8 p-6 ${cardBgClass} rounded-xl border ${cardBorderClass} print-header no-print">
            <div>
              <label class="block text-xs font-bold ${secondaryTextClass} uppercase mb-2">Student Name</label>
              <input 
                type="text" 
                id="${assessmentId}-student-name"
                placeholder="Enter your name..."
                class="w-full ${inputBgClass} border ${cardBorderClass} rounded p-3 ${inputTextClass} text-sm focus:border-${accentColor}-500 focus:outline-none assessment-input"
              />
            </div>
            <div>
              <label class="block text-xs font-bold ${secondaryTextClass} uppercase mb-2">Date</label>
              <input 
                type="date" 
                id="${assessmentId}-student-date"
                class="w-full ${inputBgClass} border ${cardBorderClass} rounded p-3 ${inputTextClass} text-sm focus:border-${accentColor}-500 focus:outline-none assessment-input"
              />
            </div>
          </div>
        ` : ''}

        <!-- Questions -->
        <form id="${assessmentId}-form" class="space-y-6">
          ${questionsHtml}
        </form>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-3 mt-8 no-print">
          <button type="button" onclick="${assessmentId}_reset()" class="${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold py-3 px-6 rounded-lg flex items-center gap-2">
            Reset
          </button>
          ${laQuestions.length > 0 ? `
          <button type="button" onclick="${assessmentId}_download()" class="${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold py-3 px-6 rounded-lg flex items-center gap-2">
            Download Backup
          </button>
          <button type="button" onclick="document.getElementById('${assessmentId}-upload').click()" class="${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold py-3 px-6 rounded-lg flex items-center gap-2">
            Upload Backup
          </button>
          ` : ''}
          <button type="button" onclick="${assessmentId}_generateReport()" class="${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold py-3 px-6 rounded-lg flex items-center gap-2">
            Print & Submit
          </button>
        </div>
        
        ${laQuestions.length > 0 ? `
        <input type="file" id="${assessmentId}-upload" accept=".json" style="display: none;" onchange="${assessmentId}_loadBackup(this)" />
        <div id="${assessmentId}-loaded" class="hidden mt-6 p-4 rounded-xl bg-blue-900/20 border border-blue-500">
          <p class="text-blue-400 font-bold">Backup loaded successfully!</p>
        </div>
        ` : ''}

        <!-- Reset Confirmation Modal -->
        <div id="${assessmentId}-reset-modal" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center hidden">
          <div class="${modalBgClass} border ${modalBorderClass} rounded-xl p-6 max-w-md mx-4">
            <h3 class="text-lg font-bold ${headingTextClass} mb-4">Reset Assessment?</h3>
            <p class="${bodyTextClass} mb-6">Are you sure you want to reset all your answers? This cannot be undone.</p>
            <div class="flex gap-3">
              <button onclick="document.getElementById('${assessmentId}-reset-modal').classList.add('hidden')" class="flex-1 ${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold py-2 rounded">Cancel</button>
              <button onclick="${assessmentId}_confirmReset()" class="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded">Reset</button>
            </div>
          </div>
        </div>

        <!-- Print Instructions -->
        <div class="mt-8 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg no-print">
          <p class="text-amber-300 text-sm">
            <strong>Instructions:</strong> Complete all questions, then click "Print & Submit" to generate a clean printable report.
          </p>
        </div>

        <!-- Print Styles -->
        <style>
          @media print {
            body { background: white !important; }
            .no-print { display: none !important; }
            .print-title { color: black !important; font-size: 24pt; text-align: center; border-bottom: 3px solid black; padding-bottom: 10px; margin-bottom: 20px; }
            .print-header { background: white !important; border: 2px solid black !important; margin-bottom: 20px; }
            .print-header label { color: black !important; }
            .print-header input { border: none !important; border-bottom: 1px solid black !important; background: white !important; color: black !important; }
            .print-section { page-break-inside: avoid; background: white !important; border: 1px solid #ccc !important; margin-bottom: 20px; }
            .print-question { color: black !important; border-bottom: 2px solid #666; padding-bottom: 5px; }
            .print-response { background: white !important; color: black !important; border: 1px solid #999 !important; min-height: 200px; font-family: Arial, sans-serif; }
          }
        </style>
      </div>
    </div>`;

    // Build script
    let script = '';
    
    // Core Assessment Functions
    script += `
      // Reset function - shows confirmation modal
      function ${assessmentId}_reset() {
        var modal = document.getElementById('${assessmentId}-reset-modal');
        if (modal) modal.classList.remove('hidden');
      }
      
      // Confirm Reset - actually performs the reset
      function ${assessmentId}_confirmReset() {
        document.getElementById('${assessmentId}-reset-modal').classList.add('hidden');
        var form = document.getElementById('${assessmentId}-form');
        if (form) form.reset();
        
        // Clear localStorage for this assessment
        try {
          localStorage.removeItem('${assessmentId}-student-name');
          localStorage.removeItem('${assessmentId}-student-date');
          var container = document.getElementById('${assessmentId}');
          if (container) {
            container.querySelectorAll('textarea, input').forEach(function(el) {
              if (el.id) localStorage.removeItem(el.id);
            });
          }
        } catch(e) {}
      }
      
      // Generate Report - creates a clean printable page in new window
      function ${assessmentId}_generateReport() {
        var container = document.getElementById('${assessmentId}');
        if (!container) { alert('Assessment not found'); return; }
        
        // Gather all data
        var studentName = document.getElementById('${assessmentId}-student-name')?.value || 'Not Provided';
        var studentDate = document.getElementById('${assessmentId}-student-date')?.value || new Date().toLocaleDateString();
        
        // Build questions HTML
        var questionsHTML = '';
        var questions = container.querySelectorAll('[class*="print-section"], [class*="mb-8 p-6"]');
        var qNum = 1;
        
        questions.forEach(function(q) {
          var questionText = q.querySelector('h3')?.textContent || 'Question ' + qNum;
          var textarea = q.querySelector('textarea');
          var answer = textarea ? textarea.value : '';
          
          // Check for radio buttons (MC questions)
          var selectedRadio = q.querySelector('input[type="radio"]:checked');
          if (selectedRadio) {
            var label = selectedRadio.closest('label');
            answer = label ? label.textContent.trim() : 'Selected: Option ' + (parseInt(selectedRadio.value) + 1);
          }
          
          if (questionText.trim()) {
            questionsHTML += '<div style="margin-bottom:25px; border-left:4px solid #333; padding-left:15px;">' +
              '<h3 style="font-size:14px; font-weight:bold; margin-bottom:10px; color:#333;">' + questionText + '</h3>' +
              '<div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #ddd; min-height:60px; white-space:pre-wrap; font-size:13px;">' + 
              (answer || '<em style="color:#999;">No answer provided</em>') + 
              '</div></div>';
            qNum++;
          }
        });
        
        // Build the print HTML
        var printHTML = '<!DOCTYPE html><html><head><title>${masterAssessmentTitle} - Submission</title>' +
          '<style>' +
          'body { font-family: Arial, sans-serif; padding: 40px; color: #333; background: white; line-height: 1.5; max-width: 800px; margin: 0 auto; }' +
          '.header { border-bottom: 4px solid #333; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }' +
          '.header h1 { font-size: 24px; font-weight: 900; text-transform: uppercase; font-style: italic; margin: 0; }' +
          '.student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px; }' +
          '.student-info div { font-size: 14px; }' +
          '.student-info strong { display: block; font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 4px; }' +
          '</style></head><body>' +
          '<div class="header">' +
          '<div><h1>${masterAssessmentTitle}</h1><p style="font-size:11px; text-transform:uppercase; letter-spacing:2px; color:#666; margin-top:5px;">Assessment Submission</p></div>' +
          '</div>' +
          '<div class="student-info">' +
          '<div><strong>Student Name</strong>' + studentName + '</div>' +
          '<div><strong>Date</strong>' + studentDate + '</div>' +
          '</div>' +
          '<div class="questions">' + questionsHTML + '</div>' +
          '<div style="margin-top:40px; border-top:2px solid #333; padding-top:20px; text-align:center;">' +
          '<p style="font-size:10px; text-transform:uppercase; letter-spacing:2px; color:#999;">End of Submission</p>' +
          '</div>' +
          '<script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }<\\/script>' +
          '</body></html>';
        
        var pw = window.open('', '_blank');
        if (pw) {
          pw.document.open();
          pw.document.write(printHTML);
          pw.document.close();
        } else {
          alert('Please allow popups to print.');
        }
      }
    `;

    // Long Answer Auto-Save (if applicable)
    if (laQuestions.length > 0) {
      script += `
      var ${assessmentId}_laCount = ${laQuestions.length};
      
      // Initialize: Load saved data on page load
      window.addEventListener('load', function() {
        ${assessmentId}_loadFromLocalStorage();
      });
      
      // Auto-save on input for all fields
      function ${assessmentId}_setupAutoSave() {
        var nameField = document.getElementById('${assessmentId}-student-name');
        var dateField = document.getElementById('${assessmentId}-student-date');
        if (nameField) {
          nameField.addEventListener('input', function() {
            localStorage.setItem('${assessmentId}-student-name', this.value);
          });
        }
        if (dateField) {
          dateField.addEventListener('input', function() {
            localStorage.setItem('${assessmentId}-student-date', this.value);
          });
        }
        
        for (var i = 0; i < ${assessmentId}_laCount; i++) {
          var textarea = document.getElementById('${assessmentId}-answer-' + i);
          if (textarea) {
            (function(idx) {
              textarea.addEventListener('input', function() {
                localStorage.setItem('${assessmentId}-answer-' + idx, this.value);
              });
            })(i);
          }
        }
      }
      
      // Load from localStorage
      function ${assessmentId}_loadFromLocalStorage() {
        var nameField = document.getElementById('${assessmentId}-student-name');
        var dateField = document.getElementById('${assessmentId}-student-date');
        
        if (nameField) {
          var savedName = localStorage.getItem('${assessmentId}-student-name');
          if (savedName) nameField.value = savedName;
        }
        if (dateField) {
          var savedDate = localStorage.getItem('${assessmentId}-student-date');
          if (savedDate) dateField.value = savedDate;
        }
        
        for (var i = 0; i < ${assessmentId}_laCount; i++) {
          var textarea = document.getElementById('${assessmentId}-answer-' + i);
          if (textarea) {
            var saved = localStorage.getItem('${assessmentId}-answer-' + i);
            if (saved) textarea.value = saved;
          }
        }
        
        ${assessmentId}_setupAutoSave();
      }
      
      // Download Backup
      function ${assessmentId}_download() {
        var data = {
          studentName: document.getElementById('${assessmentId}-student-name')?.value || '',
          studentDate: document.getElementById('${assessmentId}-student-date')?.value || '',
          answers: []
        };
        
        for (var i = 0; i < ${assessmentId}_laCount; i++) {
          var textarea = document.getElementById('${assessmentId}-answer-' + i);
          data.answers.push(textarea ? textarea.value : '');
        }
        
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = '${masterAssessmentTitle.replace(/[^a-z0-9]/gi, '_')}_backup.json';
        a.click();
        URL.revokeObjectURL(url);
      }
      
      // Load Backup
      function ${assessmentId}_loadBackup(input) {
        var file = input.files[0];
        if (!file) return;
        
        var reader = new FileReader();
        reader.onload = function(e) {
          try {
            var data = JSON.parse(e.target.result);
            
            var nameField = document.getElementById('${assessmentId}-student-name');
            var dateField = document.getElementById('${assessmentId}-student-date');
            
            if (nameField && data.studentName) {
              nameField.value = data.studentName;
              localStorage.setItem('${assessmentId}-student-name', data.studentName);
            }
            if (dateField && data.studentDate) {
              dateField.value = data.studentDate;
              localStorage.setItem('${assessmentId}-student-date', data.studentDate);
            }
            
            data.answers.forEach(function(answer, i) {
              var textarea = document.getElementById('${assessmentId}-answer-' + i);
              if (textarea) {
                textarea.value = answer;
                localStorage.setItem('${assessmentId}-answer-' + i, answer);
              }
            });
            
            var loadedDiv = document.getElementById('${assessmentId}-loaded');
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
      `;
    }

    const assessment = {
      id: assessmentId,
      title: masterAssessmentTitle,
      type: 'mixed',
      questionCount: masterQuestions.length,
      mcCount: mcQuestions.length,
      laCount: laQuestions.length,
      html: html,
      script: script
    };
    
    setGeneratedAssessment(JSON.stringify(assessment, null, 2));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
            <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Settings className="text-blue-400" size={20} />
              Course Factory Dashboard
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1 font-mono">
              LIVING DOC Ã¢â‚¬Â¢ SAVED {lastSaved ? lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toUpperCase() : '---'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
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
                  className="bg-slate-800 border border-blue-500 rounded px-3 py-1 text-sm"
                  placeholder="Course Name"
                  autoFocus
                />
                <button onClick={() => renameCourse(tempCourseName)} className="text-emerald-400 hover:text-emerald-300">
                  <Check size={18} />
                </button>
                <button onClick={() => setIsRenamingCourse(false)} className="text-slate-500 hover:text-slate-400">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempCourseName(currentCourse.name);
                  setIsRenamingCourse(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold flex items-center gap-2 transition-colors"
              >
                PROJECT: {currentCourse.name.toUpperCase()}
                <PenTool size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex max-w-[1800px] mx-auto">
        {/* Left Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 min-h-[calc(100vh-73px)] flex flex-col">
          <div className="flex-grow space-y-6">
            {/* FACTORY LINE */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Factory Line</h3>
              <div className="space-y-1">
            <Section 
              title="Phase 0: Master Shell" 
              icon={Layers} 
              isActive={activePhase === 0} 
              onClick={() => setActivePhase(0)}
            />
            <Section 
              title="Phase 1: Harvest" 
              icon={FileJson} 
              isActive={activePhase === 1} 
              onClick={() => setActivePhase(1)} 
            />
            <Section 
                  title="Phase 2: Preview & Test" 
                  icon={Eye} 
              isActive={activePhase === 2} 
              onClick={() => setActivePhase(2)}
                  badge={currentCourse.modules.length}
                  badgeColor="bg-purple-600"
            />
             <Section 
              title="Phase 3: Manage & Reset" 
              icon={BookOpen} 
              isActive={activePhase === 3} 
              onClick={() => setActivePhase(3)} 
            />
            <Section 
              title="Phase 4: Compile" 
              icon={Package} 
              isActive={activePhase === 4} 
              onClick={() => setActivePhase(4)} 
                />
                <Section 
                  title="Phase 5: Settings" 
                  icon={Settings} 
                  isActive={activePhase === 5} 
                  onClick={() => setActivePhase(5)} 
                />
              </div>
            </div>
            
            {/* IN: CURRENT COURSE */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">
                IN: {(projectData["Course Settings"]?.courseName || currentCourse.name).toUpperCase()}
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

            {/* GLOBAL TOOLKIT */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Global Toolkit</h3>
              {toolkit.length === 0 ? (
                <p className="text-xs text-slate-600">No features saved.</p>
              ) : (
                <div className="space-y-1">
                  {toolkit.map(tool => (
                    <div key={tool.id} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-slate-800 transition-colors">
                      <Wrench size={12} className="text-orange-500" />
                      <span className="text-slate-300 truncate flex-1">{tool.title}</span>
                            </div>
                    ))}
                </div>
                    )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow min-h-[600px]">
          {activePhase === 0 && <Phase0 projectData={projectData} setProjectData={setProjectData} />}
          {activePhase === 1 && <Phase1 
            projectData={projectData} 
            setProjectData={setProjectData} 
            scannerNotes={scannerNotes} 
            setScannerNotes={setScannerNotes} 
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
            migrateCode={migrateCode} 
            setMigrateCode={setMigrateCode} 
            migratePrompt={migratePrompt} 
            setMigratePrompt={setMigratePrompt} 
            migrateOutput={migrateOutput} 
            setMigrateOutput={setMigrateOutput} 
            isVaultOpen={isVaultOpen}
            setIsVaultOpen={setIsVaultOpen}
            setVaultTargetField={setVaultTargetField}
            vaultTargetField={vaultTargetField}
          />}
          {activePhase === 2 && <Phase2 projectData={projectData} setProjectData={setProjectData} editMaterial={editMaterial} onEdit={openEditModule} onPreview={openPreview} onDelete={deleteModule} onToggleHidden={toggleModuleHidden} deleteMaterial={deleteMaterial} deleteAssessment={deleteAssessment} toggleMaterialHidden={toggleMaterialHidden} toggleAssessmentHidden={toggleAssessmentHidden} />}
          {activePhase === 3 && <Phase3 onGoToMaster={() => setActivePhase(0)} projectData={projectData} setProjectData={setProjectData} />}
          {activePhase === 4 && <Phase4 projectData={projectData} setProjectData={setProjectData} excludedIds={excludedIds} toggleModule={toggleModuleExclusion} onToggleHidden={toggleModuleHidden} onError={handleError} />}
          {activePhase === 5 && (
            <Phase5
              projectData={projectData}
              setProjectData={setProjectData}
              applyVisualDefaults={applyVisualDefaults}
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

      {/* PREVIEW MODAL */}
      {previewModule && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-purple-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye size={20} className="text-purple-400" />
                Preview: {previewModule.title || 'Untitled Module'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewFrameNonce((n) => n + 1)}
                  className="bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  title="Forces the iframe to remount"
                >
                  Reset Preview
                </button>
                <button
                  onClick={() => {
                    setEnablePreviewScripts((v) => !v);
                    setPreviewFrameNonce((n) => n + 1);
                  }}
                  className={`border px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    enablePreviewScripts
                      ? 'bg-rose-600 hover:bg-rose-500 border-rose-500 text-white'
                      : 'bg-slate-900 hover:bg-slate-700 border-slate-700 text-amber-300'
                  }`}
                  title="Off by default. Enabling scripts can execute untrusted code."
                >
                  ⚠️ Enable Scripts (Unsafe): {enablePreviewScripts ? 'ON' : 'OFF'}
                </button>
                <button onClick={() => setPreviewModule(null)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-0 overflow-hidden max-h-[calc(90vh-80px)]">
              <iframe 
                srcDoc={buildModuleFrameHTML(previewModule, projectData["Course Settings"]) || ""}
                sandbox={enablePreviewScripts ? "allow-scripts allow-same-origin allow-forms" : "allow-same-origin allow-forms"}
                key={`${previewModule.id || previewModule.title || 'preview'}-${previewFrameNonce}-${enablePreviewScripts ? 'scripts' : 'noscripts'}`}
                className="w-full h-full border-0"
                style={{ minHeight: 'calc(90vh - 80px)' }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
    </div>
  );
}

// Helper Section Component
const Section = ({ title, icon: Icon, isActive, onClick, badge, badgeColor }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
    }`}
  >
    <div className="flex items-center gap-2">
      <Icon size={16} />
      <span>{title}</span>
    </div>
    {badge !== undefined && (
      <span className={`${badgeColor || 'bg-slate-700'} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
        {badge}
      </span>
    )}
  </button>
);
