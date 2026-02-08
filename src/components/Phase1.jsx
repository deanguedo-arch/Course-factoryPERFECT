import * as React from 'react';
import { AlertTriangle, ArrowUpCircle, Box, CheckCircle, Clipboard, Copy, Database, Edit, Eye, EyeOff, FileJson, FolderOpen, Layers, PenTool, Plus, RefreshCw, RotateCcw, Save, Scissors, Search, Sparkles, Trash2, Wrench, X, Zap } from 'lucide-react';
import VaultBrowser from './VaultBrowser';
import { CodeBlock, Toggle } from './Shared.jsx';
import { getMaterialBadgeLabel } from '../utils/generators.js';
import { getActivityDefinition, listActivityTypes } from '../composer/activityRegistry.js';

const { useState } = React;

// --- PHASE 1: HARVEST ---
const Phase1 = ({ projectData, setProjectData, scannerNotes, setScannerNotes, addMaterial, editMaterial, deleteMaterial, moveMaterial, toggleMaterialHidden, addAssessment, editAssessment, deleteAssessment, moveAssessment, toggleAssessmentHidden, addQuestionToMaster, moveQuestion, deleteQuestion, updateQuestion, clearMasterAssessment, masterQuestions, setMasterQuestions, masterAssessmentTitle, setMasterAssessmentTitle, currentQuestionType, setCurrentQuestionType, currentQuestion, setCurrentQuestion, editingQuestion, setEditingQuestion, generateMixedAssessment, generatedAssessment, setGeneratedAssessment, assessmentType, setAssessmentType, assessmentTitle, setAssessmentTitle, quizQuestions, setQuizQuestions, printInstructions, setPrintInstructions, editingAssessment, setEditingAssessment, migrateCode, setMigrateCode, migratePrompt, setMigratePrompt, migrateOutput, setMigrateOutput, isVaultOpen, setIsVaultOpen, setVaultTargetField, vaultTargetField }) => {
  const [harvestType, setHarvestType] = useState('MODULE_MANAGER'); // 'FEATURE', 'ASSET', 'ASSESSMENT', 'AI_MODULE', 'MODULE_MANAGER'
  const [mode, setMode] = useState('B');
  const [importInput, setImportInput] = useState("");
  const [importPreview, setImportPreview] = useState([]); 
  
  // MODULE MANAGER STATE
  const [moduleManagerType, setModuleManagerType] = useState('standalone'); // 'standalone' | 'composer' | 'external'
  const [moduleManagerComposerStarterType, setModuleManagerComposerStarterType] = useState('content_block');
  const [moduleManagerHTML, setModuleManagerHTML] = useState('');
  const [moduleManagerURL, setModuleManagerURL] = useState('');
  const [moduleManagerID, setModuleManagerID] = useState('');
  const [moduleManagerTitle, setModuleManagerTitle] = useState('');
  const [moduleManagerLinkType, setModuleManagerLinkType] = useState('iframe'); // 'iframe' | 'newtab'
  const [moduleManagerStatus, setModuleManagerStatus] = useState(null);
  const [moduleManagerMessage, setModuleManagerMessage] = useState('');
  const [testingLink, setTestingLink] = useState(false);
  const [linkTestResult, setLinkTestResult] = useState(null); 
  const [divId, setDivId] = useState("");
  const [jsPrefix, setJsPrefix] = useState("");
  const [stagingJson, setStagingJson] = useState("");
  const [stagingTitle, setStagingTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState(null); // 'success'

  // NEW: Error State for manual imports
  const [importError, setImportError] = useState(null);

  // NEW: Batch Mode State
  const [isBatchMode, setIsBatchMode] = useState(false);

  // NEW: AI Studio Module Creator State
  const [aiDescription, setAiDescription] = useState("");

  // Assessment override colors (Phase 1 Edit modal) â€” "Use course default" + common colors
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

  // NEW: Handler for Batch Imports
  const handleBatchImport = (items) => {
     const newModules = items.map(item => {
       const moduleCode = { id: item.id, html: item.html, script: item.script };
       return {
         id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
         title: item.title,
         code: moduleCode,
         // Initialize history with version 1 (original state)
         history: [{
           timestamp: new Date().toISOString(),
           title: item.title,
           code: moduleCode
         }]
       };
     });
     
     setProjectData(prev => ({
         ...prev,
         "Current Course": { ...prev["Current Course"], modules: [...prev["Current Course"].modules, ...newModules] }
     }));
     setSaveStatus('success');
     setTimeout(() => setSaveStatus(null), 3000);
     setIsBatchMode(false);
  };

  // Assessment Generator Functions
  const handleVaultSelect = (file) => {
    if (vaultTargetField === 'view') {
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
            Ã°Å¸â€â€ž Reset
          </button>
          <button type="button" onclick="${quizId}_generateReport()" class="${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold py-3 px-6 rounded-lg flex items-center gap-2">
            Ã°Å¸â€“Â¨Ã¯Â¸Â Print & Submit
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
      setImportError(null);
      const jsonToUse = overrideJson || stagingJson;
      const titleToUse = stagingTitle;

      if (!jsonToUse || !titleToUse) {
          setImportError("Missing Title or Code content.");
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
          setImportError("Invalid JSON format. Please check your syntax.");
          return; 
      }

      const newItem = { 
          id: divId || (parsedCode.id ? parsedCode.id : `item-${Date.now()}`), 
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
        setImportError('Validation failed: ' + validation.errors.join(', '));
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
          const isModule = harvestType === 'MODULE' || harvestType === 'ASSESSMENT' || 
                          (harvestType === 'AI_MODULE' && aiTargetType === 'MODULE');
          
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
      setDivId("");
      setJsPrefix("");
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
      id: `activity-${Date.now()}`,
      type: resolvedType,
      data: defaultData,
    };
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
      setModuleManagerMessage(`Ã¢Å“â€¦ Module "${title}" added successfully! It will run in an isolated iframe.`);
      
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
      const starterActivity = buildComposerStarterActivity(moduleManagerComposerStarterType);

      const newModule = {
        id: moduleId,
        title,
        type: 'standalone',
        mode: 'composer',
        activities: [starterActivity],
        rawHtml: '',
        html: '',
        css: '',
        script: '',
        history: [{
          timestamp: new Date().toISOString(),
          title,
          mode: 'composer',
          activities: [starterActivity],
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
      setModuleManagerStatus('success');
      setModuleManagerMessage(`✅ Composer module "${title}" added with starter activity.`);

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
        url: moduleManagerURL,
        linkType: moduleManagerLinkType,
        // Initialize history with version 1 (original state)
        history: [{
          timestamp: new Date().toISOString(),
          title: moduleManagerTitle || moduleId.replace('view-', '').replace(/-/g, ' '),
          mode: 'custom_html',
          activities: [],
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
      setModuleManagerMessage(`Ã¢Å“â€¦ External link module "${newModule.title}" added successfully!`);
      
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

  // Prompts for the standard harvester
  const analysisPrompt = `I have a large HTML file I am pasting below. I am not a coder.
Please scan the file and list out every "${harvestType === 'MODULE' ? 'Module View' : 'Functional Feature'}" inside it.
For each one, tell me:
1. The HTML ID of the container div (e.g., id="view-something").
2. The specific Javascript Function Prefix used (e.g., function p1_saveData -> prefix is "p1_").

Format the output as a simple list I can copy.`;

  const jsInstruction = jsPrefix.trim() 
    ? `2. Extract all JavaScript functions that start with the prefix: "${jsPrefix}".`
    : `2. Extract the specific JavaScript functions that control the logic for element "${divId}".`;

  const deconstructPrompt = `I have a large "Monolith" HTML file (which I will paste below). 
I need to extract ONE specific ${harvestType.toLowerCase()} from it to create a standalone component file.

**Task:**
1. Extract the HTML Element with ID: "${divId}".
2. Extract ALL JavaScript logic required for this element to function.
3. **CRITICAL RE-FACTORING STEPS:**
   - **Change Variables to VAR:** You MUST change any top-level state variables (like scores, category lists, settings) from \`const\` or \`let\` to \`var\`. (e.g., change \`const p1_scores = ...\` to \`var p1_scores = ...\`). This ensures the HTML buttons can see them.
   - **Attach Functions to Window:** After EACH function definition, add \`window.functionName = functionName;\` to make it accessible in Google Sites' sandboxed iframes. Example:
     \`\`\`javascript
     function ${jsPrefix || 'prefix_'}calculate() { ... }
     window.${jsPrefix || 'prefix_'}calculate = ${jsPrefix || 'prefix_'}calculate;
     \`\`\`
   - **Verify Selectors:** Check that the JS selectors (e.g., \`getElementById\`) actually match the IDs in the HTML you extracted. If the JS looks for a button but the HTML is a table cell, update the JS to match the HTML.
   - **Add Initialization Block:** At the END of the script, add an initialization block to force immediate execution in sandboxed environments. If the original code has initialization (DOMContentLoaded listeners, function calls at the bottom), preserve it. If not, add this:
     \`\`\`javascript
     // Force script execution in sandboxed environments
     if (document.readyState === 'loading') {
         document.addEventListener('DOMContentLoaded', function() {
             console.log('Ã¢Å“â€¦ ${divId} module loaded');
         });
     } else {
         console.log('Ã¢Å“â€¦ ${divId} module loaded');
     }
     \`\`\`

**Output Format:**
{
  "id": "${divId}",
  "html": "<div>... (The full inner HTML) ...</div>",
  "script": "// State Variables (Must be var)\\nvar ${jsPrefix || 'prefix_'}scores = { ... };\\n\\n// Functions (with window attachment)\\nfunction ${jsPrefix || 'prefix_'}update() { ... }\\nwindow.${jsPrefix || 'prefix_'}update = ${jsPrefix || 'prefix_'}update;\\n\\n// Initialization (REQUIRED)\\nif (document.readyState === 'loading') {...}"
}`;

  const targetCollection = harvestType === 'MODULE' ? 'Current Course' : 'Global Toolkit';
  
  const saveToDocPrompt = `I need to update the "CourseFactoryDashboard.tsx" file.
Please add the following data to the \`PROJECT_DATA\` object.

**Target:** ${targetCollection} (${harvestType})
**Data:**
\`\`\`javascript
{
  id: "${divId || 'item-x'}",
  title: "${stagingTitle}",
  code: ${stagingJson} 
}
\`\`\`

**Instructions:**
1. Locate \`PROJECT_DATA\` at the top.
2. Insert this object into the correct array (modules or Global Toolkit).
3. Ensure the 'code' property is inserted as a raw Object (not a string).
4. Do NOT modify the rest of the file.`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileJson className="text-yellow-400" /> Phase 1: Harvest
        </h2>
        
        {/* HARVEST TYPE TOGGLE */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
             <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700 w-full md:w-auto overflow-x-auto">
                 <button onClick={() => { setIsBatchMode(false); setHarvestType('FEATURE'); }} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all whitespace-nowrap ${!isBatchMode && harvestType === 'FEATURE' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <Wrench size={14} /> Feature
            </button>
                <button onClick={() => { setIsBatchMode(false); setHarvestType('ASSESSMENT'); }} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all whitespace-nowrap ${!isBatchMode && harvestType === 'ASSESSMENT' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <CheckCircle size={14} /> Assessment
                </button>
                <button onClick={() => { setIsBatchMode(false); setHarvestType('MATERIALS'); }} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all whitespace-nowrap ${!isBatchMode && harvestType === 'MATERIALS' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                   <FolderOpen size={14} /> Materials
                </button>
                 <button onClick={() => { setIsBatchMode(false); setHarvestType('AI_MODULE'); }} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all whitespace-nowrap ${!isBatchMode && harvestType === 'AI_MODULE' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                     <Sparkles size={14} /> AI Studio
                 </button>
                 <button onClick={() => { setIsBatchMode(false); setHarvestType('MODULE_MANAGER'); }} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all whitespace-nowrap ${!isBatchMode && harvestType === 'MODULE_MANAGER' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                     <Box size={14} /> Module Manager
                 </button>
             </div>
             <button 
                 onClick={() => setIsBatchMode(!isBatchMode)} 
                 className={`w-full md:w-auto flex items-center justify-center gap-2 py-2 px-4 rounded-lg border text-xs font-bold transition-all ${isBatchMode ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
             >
                 <Layers size={14} /> BATCH MODE
            </button>
        </div>

        {/* CONDITIONAL RENDER: BATCH VS STANDARD */}
        {isBatchMode ? (
             <BatchHarvester onImport={handleBatchImport} />
        ) : (
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
                                                alert("Ã¢Å“â€¦ Question added to Master Assessment!");
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
                                                alert("Ã¢Å“â€¦ Question added to Master Assessment!");
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
                                        Ã°Å¸â€™Â¡ <strong>Tip:</strong> Add all your questions here, then go to the "Master Assessment" tab to organize them and generate the final assessment.
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
                                                    alert("Ã¢ÂÅ’ Error adding assessment. Please try again.");
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
                                                    alert("Ã¢ÂÅ’ Error adding assessment. Please try again.");
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
                                                if (window.confirm('Ã¢Å¡Â Ã¯Â¸Â WARNING: This will permanently delete ALL your course data including:\n\nÃ¢â‚¬Â¢ Course settings\nÃ¢â‚¬Â¢ All modules\nÃ¢â‚¬Â¢ All assessments\nÃ¢â‚¬Â¢ All materials\n\nAre you sure you want to continue?')) {
                                                    if (window.confirm('Ã°Å¸Å¡Â¨ FINAL CONFIRMATION: Type "DELETE" in the next prompt to confirm.\n\nClick OK to proceed with deletion.')) {
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
                                                            alert('Ã¢Å“â€¦ All data cleared! The page will now reload.');
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
                                            <p className="text-xs font-bold text-amber-300 mb-1">Ã¢Â­Â For Mixed Types (Recommended):</p>
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
                                                                                {q.correct === oIdx && <span className="text-[10px] text-emerald-400">Ã¢Å“â€œ</span>}
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
                                            alert(`Ã¢Å“â€¦ Imported ${formattedQuestions.length} questions! (${mcCount} multiple-choice, ${laCount} long-answer)`);
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
                                            Ã¢Å“â€œ Your code runs AS-IS in an isolated iframe - no modifications needed!
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
                                    <div>
                                        <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                                            Starter Activity Type
                                        </label>
                                        <select
                                            value={moduleManagerComposerStarterType}
                                            onChange={(e) => setModuleManagerComposerStarterType(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-indigo-500 outline-none"
                                        >
                                            {listActivityTypes().map((activityType) => {
                                                const def = getActivityDefinition(activityType);
                                                return (
                                                    <option key={activityType} value={activityType}>
                                                        {def?.label || activityType}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        <p className="text-[10px] text-slate-500 mt-1 italic">
                                            Creates a new module pre-seeded with this activity.
                                        </p>
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
                                                    <span className="font-bold">{linkTestResult.success ? 'Ã¢Å“â€œ' : 'Ã¢Å“â€”'}</span>
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
                                <h4 className="text-xs font-bold text-sky-400 uppercase mb-2">Ã°Å¸â€™Â¡ Module Types</h4>
                                <ul className="text-[10px] text-slate-400 space-y-1 leading-relaxed">
                                    <li><strong className="text-sky-300">Standalone HTML:</strong> Complete HTML file (like HSS3020). CSS auto-scoped, wrapped in view container.</li>
                                    <li><strong className="text-sky-300">Composer Module:</strong> Activity-based module using built-in blocks (content, embeds, resources, checks, submission).</li>
                                    <li><strong className="text-sky-300">External Link:</strong> Link to hosted module. Choose iframe (embedded) or new tab (external).</li>
                                    <li>Ã¢Å“â€¦ Modules appear in sidebar navigation</li>
                                    <li>Ã¢Å“â€¦ Can be hidden/shown in Phase 2</li>
                                    <li>Ã¢Å“â€¦ Included in compiled site</li>
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
           console.log('Ã¢Å“â€¦ [feature-name] loaded');
       });
   } else {
       console.log('Ã¢Å“â€¦ [feature-name] loaded');
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

            {harvestType !== 'ASSET' && harvestType !== 'ASSESSMENT' && harvestType !== 'AI_MODULE' && (
         <>
            <Toggle active={mode} onToggle={setMode} labelA="New Content (PDF)" labelB="Migrate Code" iconA={Sparkles} iconB={Scissors} />
            {mode === 'B' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                    
                    {/* STEP 1: SCANNER */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-blue-900/50">
                        <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-2"><Search size={16} /> Step 1: The Scanner</h3>
                        <CodeBlock label="Analysis Prompt" code={analysisPrompt} height="h-24" />
                        <div className="mt-4 pt-4 border-t border-slate-800"><textarea value={scannerNotes} onChange={(e) => setScannerNotes(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 font-mono h-24 focus:border-blue-500 outline-none resize-y" placeholder="Paste results here..." /></div>
                    </div>

                    {/* STEP 2: EXTRACTOR */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-pink-900/50">
                        <h3 className="text-sm font-bold text-pink-400 flex items-center gap-2 mb-2"><Scissors size={16} /> Step 2: The Extractor</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input type="text" value={divId} onChange={(e) => setDivId(e.target.value)} placeholder="Target ID..." className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-pink-400 font-mono text-xs" />
                            <input type="text" value={jsPrefix} onChange={(e) => setJsPrefix(e.target.value)} placeholder="JS Prefix..." className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-pink-400 font-mono text-xs" />
                        </div>
                        <CodeBlock label="Deconstruction Prompt" code={deconstructPrompt} height="h-32" />
                    </div>

                    {/* STEP 3: STORAGE */}
                    <div className="bg-emerald-900/20 border border-emerald-700/50 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2"><Database size={16} /> Step 3: Commit to {targetCollection}</h3>{saveStatus === 'success' && (<span className="flex items-center gap-1 text-xs text-emerald-300 animate-in fade-in zoom-in"><CheckCircle size={14} /> Saved to Session!</span>)}</div>
                            
                            {/* ERROR MESSAGE DISPLAY */}
                            {importError && (
                                <div className="mb-2 p-2 bg-rose-900/30 border border-rose-600 rounded text-xs text-rose-200">
                                    {importError}
                                </div>
                            )}

                        <input type="text" value={stagingTitle} onChange={(e) => setStagingTitle(e.target.value)} placeholder="Title (e.g. Save System)" className="w-full mb-2 bg-slate-950 border border-emerald-900 rounded p-2 text-white text-sm"/>
                        <textarea value={stagingJson} onChange={(e) => setStagingJson(e.target.value)} className="w-full bg-slate-950 border border-emerald-900 rounded-lg p-3 text-xs text-emerald-100 font-mono h-24 focus:border-emerald-500 outline-none resize-y mb-2" placeholder='Paste output JSON here...' />
                            <div className="flex gap-2 mb-6"><button onClick={() => handleSessionSave()} disabled={!stagingJson || !stagingTitle} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs shadow-lg"><Zap size={14} /> Ã¢Å¡Â¡ Add to Session (Instant)</button></div>
                        <div className="pt-4 border-t border-emerald-800/50"><div className="flex items-center justify-between mb-2"><p className="text-[10px] text-emerald-400/60 uppercase font-bold">Optional: Hard Save</p><span className="text-[9px] text-emerald-600 bg-emerald-950/50 px-2 py-0.5 rounded">Only do this once at the end</span></div><CodeBlock label="Permanent Save Prompt (Use Sparingly)" code={saveToDocPrompt} height="h-24" /></div>
                    </div>
                </div>
                )}
             </>
            )}
        </>
        )}
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
