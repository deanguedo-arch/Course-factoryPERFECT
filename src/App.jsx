import * as React from 'react';
import { Terminal, BookOpen, Layers, Copy, Check, FileJson, Settings, Scissors, Sparkles, RefreshCw, Search, Clipboard, Upload, Save, Database, Trash2, LayoutTemplate, PenTool, Plus, FolderOpen, Download, AlertTriangle, AlertOctagon, ShieldCheck, FileCode, Lock, Unlock, Wrench, Box, ArrowUpCircle, ArrowRight, Zap, CheckCircle, Package, Link as LinkIcon, ToggleLeft, ToggleRight, Eye, EyeOff, ChevronUp, ChevronDown, X, Edit, Clock, RotateCcw } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';

const { useState, useEffect, useRef } = React;

// ==========================================
// ðŸŸ¢ TOAST NOTIFICATION SYSTEM
// ==========================================
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, showToast, removeToast };
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-md">
      {toasts.map(toast => {
        const colors = {
          success: 'bg-emerald-600 border-emerald-500 text-white',
          error: 'bg-rose-600 border-rose-500 text-white',
          warning: 'bg-amber-600 border-amber-500 text-white',
          info: 'bg-sky-600 border-sky-500 text-white'
        };
        const icons = {
          success: CheckCircle,
          error: AlertOctagon,
          warning: AlertTriangle,
          info: ShieldCheck
        };
        const Icon = icons[toast.type] || ShieldCheck;

        return (
          <div
            key={toast.id}
            className={`${colors[toast.type] || colors.info} border-2 rounded-lg p-4 shadow-2xl flex items-start gap-3 animate-in slide-in-from-right fade-in duration-300`}
          >
            <Icon size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// ðŸ”´ FIREBASE CONFIG & INIT (DISABLED LOCALLY)
// ==========================================
// const firebaseConfig = JSON.parse(__firebase_config);
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);
const appId = 'course-factory-v1';

// ==========================================
// ðŸŸ¢ PROJECT DATA (THE LIVING LIBRARY)
// ==========================================

const PROJECT_DATA = {
  "Current Course": {
    name: "Mental Fitness",
    modules: [
      {
        id: "item-1768749223001",
        title: "Course Materials",
        type: "standalone",
        code: { id: "view-materials" },
        materials: [
          {
            id: "mat-00",
            number: "00",
            title: "What is Sports Psychology?",
            description: "The Diagnostic & Baseline Protocol.",
            viewUrl: "https://drive.google.com/file/d/1my_sOJYdOLcvvQi4TQdkDJNUz6P7MvYY/preview",
            downloadUrl: "https://drive.google.com/file/d/1my_sOJYdOLcvvQi4TQdkDJNUz6P7MvYY/view?usp=sharing",
            color: "slate",
            hidden: false,
            order: 0
          },
          {
            id: "mat-01",
            number: "01",
            title: "The Engine",
            description: "Values, Identity & Foundation.",
            viewUrl: "https://drive.google.com/file/d/1DQvItijEudKroqUieRBKaJAqJJnzEa2x/preview",
            downloadUrl: "https://drive.google.com/file/d/1DQvItijEudKroqUieRBKaJAqJJnzEa2x/view?usp=sharing",
            color: "rose",
            hidden: false,
            order: 1
          },
          {
            id: "mat-02",
            number: "02",
            title: "The Drive",
            description: "Motivation, 7/10 Task & Maintenance.",
            viewUrl: "https://drive.google.com/file/d/1XWwy8F27_0jupo8xdXO3oi2E4l9R4Rot/preview",
            downloadUrl: "https://drive.google.com/file/d/1XWwy8F27_0jupo8xdXO3oi2E4l9R4Rot/view?usp=sharing",
            color: "amber",
            hidden: false,
            order: 2
          },
          {
            id: "mat-03",
            number: "03",
            title: "The Focus",
            description: "Spotlight, Cues & The Fortress.",
            viewUrl: "https://drive.google.com/file/d/1kUq790zE4VP73THdysuNKVR3cE6EG3X2/preview",
            downloadUrl: "https://drive.google.com/file/d/1kUq790zE4VP73THdysuNKVR3cE6EG3X2/view?usp=sharing",
            color: "emerald",
            hidden: false,
            order: 3
          },
          {
            id: "mat-04",
            number: "04",
            title: "The Toolkit",
            description: "Confidence & Visualization Protocols.",
            viewUrl: "https://drive.google.com/file/d/1GueN1ikd982jYVZVf7GkEDG18NHQ9YpW/preview",
            downloadUrl: "https://drive.google.com/file/d/1GueN1ikd982jYVZVf7GkEDG18NHQ9YpW/view?usp=sharing",
            color: "sky",
            hidden: false,
            order: 4
          }
        ],
          html: `<div id="view-materials" class="w-full h-full custom-scroll p-8 md:p-12">
            <div class="max-w-5xl mx-auto space-y-8">
                <div class="mb-12">
                    <h2 class="text-3xl font-black text-white italic uppercase tracking-tighter">Course <span class="text-sky-500">Materials</span></h2>
                    <p class="text-xs text-slate-400 font-mono uppercase tracking-widest mt-2">Access lectures, presentations, and briefing documents.</p>
                </div>
                <div id="pdf-viewer-container" class="hidden mb-12 bg-black rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
                    <div class="flex justify-between items-center p-3 bg-slate-800 border-b border-slate-700">
                        <span id="viewer-title" class="text-xs font-bold text-white uppercase tracking-widest px-2">Document Viewer</span>
                        <button onclick="closeViewer()" class="text-xs text-rose-400 hover:text-white font-bold uppercase tracking-widest px-2">Close X</button>
                    </div>
                    <iframe id="pdf-frame" src="" width="100%" height="600" style="border:none;"></iframe>
                </div>
                <div class="grid grid-cols-1 gap-4" id="materials-container">
                    <p class="text-center text-slate-500 italic py-8">Materials will be generated dynamically when you compile the site.</p>
                </div>
            </div>
        </div>`,
        css: "",
        script: `
        // Dynamic Materials Renderer (runs in builder and compiled site)
        function renderMaterials() {
            // This will be populated by the compile process
            // For now, shows placeholder in builder
            const container = document.getElementById('materials-container');
            if (!container) return;
            
            // Check if we're in the compiled site with materials data
            if (window.courseMaterials && window.courseMaterials.length > 0) {
                container.innerHTML = window.courseMaterials.map(mat => {
                    const colorClass = mat.color || 'slate';
                    const borderClass = colorClass !== 'slate' ? 'border-l-4 border-l-' + colorClass + '-500' : '';
                    const bgClass = colorClass !== 'slate' ? 'bg-' + colorClass + '-500/10' : 'bg-slate-800';
                    const borderColorClass = colorClass !== 'slate' ? 'border-' + colorClass + '-500/20' : 'border-slate-700';
                    const textColorClass = colorClass !== 'slate' ? 'text-' + colorClass + '-500' : 'text-slate-500';
                    const buttonColorClass = colorClass !== 'slate' ? 'bg-' + colorClass + '-600 hover:bg-' + colorClass + '-500' : 'bg-sky-600 hover:bg-sky-500';
                    
                    return '<div class="material-card flex flex-col md:flex-row items-center justify-between gap-6 ' + borderClass + '">' +
                        '<div class="flex items-center gap-6">' +
                            '<div class="w-12 h-12 rounded-lg ' + bgClass + ' flex items-center justify-center ' + textColorClass + ' font-black italic text-xl border ' + borderColorClass + '">' + mat.number + '</div>' +
                            '<div>' +
                                '<h3 class="text-lg font-bold text-white uppercase italic">' + mat.title + '</h3>' +
                                '<p class="text-xs text-slate-400 font-mono">' + mat.description + '</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="flex gap-3 w-full md:w-auto">' +
                            '<button data-pdf-url="' + (mat.viewUrl || '').replace(/"/g, '&quot;') + '" data-pdf-title="' + (mat.title || '').replace(/"/g, '&quot;') + '" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg border border-slate-600 transition-all">View Slides</button>' +
                            '<a href="' + mat.downloadUrl + '" target="_blank" class="flex-1 ' + buttonColorClass + ' text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all text-center flex items-center justify-center">Download</a>' +
                        '</div>' +
                    '</div>';
                }).join('');
            }
        }
        
        function openPDF(url, title) {
            const container = document.getElementById('pdf-viewer-container');
            // Convert /view to /preview for iframe embedding
            const previewUrl = url.replace('/view', '/preview');
            document.getElementById('pdf-frame').src = previewUrl;
            document.getElementById('viewer-title').innerText = "VIEWING: " + title;
            container.classList.remove('hidden');
            container.scrollIntoView({ behavior: 'smooth' });
        }

        function closeViewer() {
            document.getElementById('pdf-viewer-container').classList.add('hidden');
            document.getElementById('pdf-frame').src = "";
        }
        
        // Try to render materials on load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', renderMaterials);
        } else {
            renderMaterials();
        }`
      },
      {
        id: "item-assessments",
        title: "Assessments",
        type: "standalone",
        assessments: [],
        html: `<div id="view-assessments" class="w-full h-full custom-scroll p-8 md:p-12">
            <div class="max-w-5xl mx-auto space-y-8">
                <div class="mb-12">
                    <h2 class="text-3xl font-black text-white italic uppercase tracking-tighter">Assessment <span class="text-purple-500">Center</span></h2>
                    <p class="text-xs text-slate-400 font-mono uppercase tracking-widest mt-2">Quizzes, tests, and reflection exercises.</p>
                </div>
                <div id="assessments-container" class="space-y-6">
                    <p class="text-center text-slate-500 italic py-8">Assessments will be generated dynamically when you compile the site.</p>
                </div>
            </div>
        </div>`,
        css: "",
        script: `
        // Dynamic Assessments Renderer
        function renderAssessments() {
            const container = document.getElementById('assessments-container');
            if (!container) return;
            
            if (window.courseAssessments && window.courseAssessments.length > 0) {
                container.innerHTML = window.courseAssessments.map(assessment => {
                    return '<div class="assessment-wrapper mb-8">' + assessment.html + '</div>';
                }).join('');
                
                // Execute assessment scripts
                window.courseAssessments.forEach((assessment, idx) => {
                    if (assessment.script) {
                        try {
                            eval(assessment.script);
                        } catch(e) {
                            console.error('Assessment script error:', e);
                        }
                    }
                });
            }
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', renderAssessments);
        } else {
            renderAssessments();
        }`
      },
      {
        id: "item-1768750987350",
        title: "Phase 1: The Engine",
        type: "standalone",
          html: `<div id="view-phase1" class="w-full h-full custom-scroll hidden p-4 md:p-8">
            <div class="max-w-6xl mx-auto">
                <header class="mb-8 text-center"><h1 class="text-3xl font-black italic tracking-tighter text-white uppercase mb-2 text-sky-500">Elite Operator Toolkit</h1><p class="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500 mb-6 font-bold underline decoration-sky-500/30 underline-offset-4">Regulation Engine: Tactical Assignment</p><div class="flex flex-wrap justify-center gap-3 mb-6 bg-slate-900/50 p-3 rounded-xl border border-slate-800 max-w-2xl mx-auto"><div class="flex items-center gap-2 px-3"><div id="p1-save-indicator" class="w-2 h-2 rounded-full bg-slate-600"></div><span id="p1-save-text" class="text-[9px] uppercase font-bold text-slate-500 tracking-widest">System Ready</span></div><div class="w-px h-6 bg-slate-800 mx-2 hidden sm:block"></div><button onclick="p1_downloadBackup()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors border border-slate-700">Save Backup File</button><button onclick="document.getElementById('p1-file-upload').click()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-sky-400 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors border border-slate-700">Load Backup</button><input type="file" id="p1-file-upload" accept=".json" style="display: none;" onchange="p1_loadBackup(this)"></div><div class="flex justify-center gap-2 overflow-x-auto pb-2 px-2"><button onclick="p1_showStep(0)" class="mod-nav-btn active px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">Briefing</button><button onclick="p1_showStep(1)" class="mod-nav-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">01 Stress Reset</button><button onclick="p1_showStep(2)" class="mod-nav-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">02 Arousal</button><button onclick="p1_showStep(3)" class="mod-nav-btn px-4 py-2 rounded-lg border border-slate-800 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">03 Targeting</button><button onclick="p1_showStep(4)" class="mod-nav-btn px-4 py-2 rounded-lg border border-slate-800 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">04 Confidence</button><button onclick="p1_showStep(5)" class="mod-nav-btn px-4 py-2 rounded-lg border border-slate-800 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">Review & Print</button></div></header>
                <div class="glass rounded-3xl shadow-2xl overflow-hidden min-h-[500px]">
                    <div id="p1-step0" class="step-content active"><div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-sky-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">System Briefing: The Regulation Engine</h2></div><div class="p-8 space-y-8 text-center"><div class="max-w-3xl mx-auto space-y-6 text-left"><p class="text-slate-400 text-sm italic leading-relaxed">Elite performance is defined by the ability to regulate your internal operating system under pressure. While physical skill sets the floor, your mental fitness sets the ceiling. This assignment uses four <strong>Manual Overrides</strong> to ensure you stay in your <strong>Ideal Performance State (IPS)</strong>.</p><div class="bg-sky-500/10 border border-sky-500/30 p-4 rounded-xl flex flex-col gap-4 mb-2"><h3 class="text-sky-400 font-bold uppercase text-[10px] tracking-widest">Dashboard Logic: Read then Regulate</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="p-3 bg-slate-900/50 rounded border border-slate-700"><span class="text-[9px] font-black text-rose-400 uppercase block mb-1">Somatic Indicators (Body)</span><p class="text-[10px] text-slate-400">Cold hands, butterflies, muscle tension, sweating.</p></div><div class="p-3 bg-slate-900/50 rounded border border-slate-700"><span class="text-[9px] font-black text-amber-400 uppercase block mb-1">Cognitive Indicators (Mind)</span><p class="text-[10px] text-slate-400">Negative self-talk, doubt, inability to concentrate.</p></div></div></div><div class="flex justify-center pt-6"><button onclick="p1_showStep(1)" class="bg-sky-600 px-12 py-4 rounded-xl text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-sky-500 transition-all shadow-lg active:scale-95">Initialize Stations</button></div></div></div></div>
<div id="p1-step1" class="step-content"><div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-rose-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Station 01: The Stress Loop Reset</h2></div><div class="p-8 space-y-8"><div class="grid grid-cols-1 md:grid-cols-2 gap-10"><div class="space-y-4"><h3 class="text-[10px] font-bold text-slate-500 uppercase mono italic underline tracking-widest">The Pivot Point</h3><p class="text-sm text-slate-300 leading-relaxed">Breathing is your manual override switch. It intercepts the Stress Process Loop at the moment a demand is perceived as a "threat." <strong class="text-rose-400">The goal is to identify a specific time you can execute this trigger and how the breath anchor will help you stay present in the moment.</strong></p><div class="bg-rose-500/10 p-3 rounded border border-rose-500/30"><span class="text-[9px] text-rose-300 font-bold uppercase">Warning:</span><p class="text-[10px] text-rose-200">Unchecked loop acceleration leads to performance crash.</p></div></div><div class="space-y-6"><div><label class="block text-[10px] font-bold uppercase text-sky-500 mb-2 mono">Deployment Scenario</label><input type="text" id="p1_breath_scenario" oninput="p1_saveData()" placeholder="When exactly will you use this? (e.g. Between points...)" class="w-full rounded-lg p-3 text-xs italic"><p class="helper-text">Identify a specific time you can execute this trigger.</p></div><div><label class="block text-[10px] font-bold uppercase text-sky-500 mb-2 mono">Centering Action Detail</label><textarea id="p1_breath_detail" oninput="p1_saveData()" placeholder="Describe your rhythmic diaphragmatic breathing habit..." class="w-full h-32 rounded-lg p-3 text-xs italic resize-none"></textarea><p class="helper-text">How will this breath anchor help you stay present in the moment?</p></div></div></div><div class="flex justify-between pt-4"><button onclick="p1_showStep(0)" class="text-slate-500 font-bold uppercase text-[10px] tracking-widest">&larr; Back</button><button onclick="p1_showStep(2)" class="bg-sky-600 px-8 py-3 rounded-lg text-white font-bold uppercase text-[10px] tracking-widest">Next Station &rarr;</button></div></div></div>
                    <div id="p1-step2" class="step-content"><div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-amber-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Station 02: Arousal Volume Control</h2></div><div class="p-8 space-y-8"><div class="grid grid-cols-1 md:grid-cols-2 gap-10"><div class="space-y-4"><h3 class="text-[10px] font-bold text-slate-500 uppercase mono italic underline tracking-widest">The Inverted-U</h3><p class="text-sm text-slate-300 leading-relaxed">Performance peaks at moderate arousal. You must 'down-regulate' to discharge tension or 'up-regulate' to wake the nervous system.</p></div><div class="space-y-6"><div><label class="block text-[10px] font-bold uppercase text-amber-500 mb-2 mono">Down-Regulation (Relaxation)</label><p class="text-[10px] text-slate-400 italic mb-2"><strong>PMR (Progressive Muscle Relaxation)</strong> is a technique where you systematically tense and then relax specific muscle groups to release physical tension.</p><textarea id="p1_relax_plan" oninput="p1_saveData()" placeholder="List muscle groups for your PMR routine..." class="w-full h-24 rounded-lg p-3 text-xs italic resize-none"></textarea><p class="helper-text">Describe your routine to discharge somatic tension.</p></div><div><label class="block text-[10px] font-bold uppercase text-rose-500 mb-2 mono">Up-Regulation (Activation)</label><p class="text-[10px] text-slate-400 italic mb-2"><strong>Up-Regulation</strong> involves using physical actions or environmental triggers to increase heart rate and alertness when energy is too low.</p><textarea id="p1_active_plan" oninput="p1_saveData()" placeholder="List your 'Psych-Up' triggers (Music, Cues, Physical actions)..." class="w-full h-24 rounded-lg p-3 text-xs italic resize-none"></textarea><p class="helper-text">Triggers used to discharge apathy and enter the zone.</p></div></div></div><div class="flex justify-between pt-4"><button onclick="p1_showStep(1)" class="text-slate-500 font-bold uppercase text-[10px] tracking-widest">â† Back</button><button onclick="p1_showStep(3)" class="bg-sky-600 px-8 py-3 rounded-lg text-white font-bold uppercase text-[10px] tracking-widest">Next Station â†’</button></div></div></div>
                    <div id="p1-step3" class="step-content"><div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Station 03: The Focus Filter</h2></div><div class="p-8 space-y-8"><div class="grid grid-cols-1 md:grid-cols-2 gap-10"><div class="space-y-4"><h3 class="text-[10px] font-bold text-slate-500 uppercase mono italic underline tracking-widest">Attentional Narrowing</h3><p class="text-sm text-slate-300 leading-relaxed">Under high stress, your peripheral vision and mental focus shrinkâ€”often called <strong>"Tunnel Vision."</strong> You lose the big picture. Cue words act as "Decoder Keys" that force the system to lock back onto task-relevant targets.</p><div class="bg-emerald-500/10 p-3 rounded border border-emerald-500/30"><span class="text-[9px] text-emerald-300 font-bold uppercase">The Goal:</span><p class="text-[10px] text-emerald-200">Shift from internal worry (Emotion) to external cues (Action).</p></div></div><div class="space-y-6"><div><label class="block text-[10px] font-bold uppercase text-sky-400 mb-2 mono">Instructional Decoder</label><input type="text" id="p1_cue_inst" oninput="p1_saveData()" placeholder="e.g., 'Elbows in', 'Smooth'..." class="w-full rounded-lg p-3 text-xs font-black italic"><p class="helper-text">Create a 1-2 word key specifically to FIX sloppy mechanics or technical errors.</p></div><div><label class="block text-[10px] font-bold uppercase text-amber-500 mb-2 mono">Motivational Decoder</label><input type="text" id="p1_cue_mot" oninput="p1_saveData()" placeholder="e.g., 'Power', 'Explode'..." class="w-full rounded-lg p-3 text-xs font-black italic"><p class="helper-text">Create a 1-2 word key specifically to FIX low energy or effort when drive is fading.</p></div><div><label class="block text-[10px] font-bold uppercase text-slate-400 mb-2 mono italic underline">Radar Jamming Scenario</label><textarea id="p1_jam_scenario" oninput="p1_saveData()" placeholder="Describe a specific high-pressure moment where you lose focus..." class="w-full h-24 rounded-lg p-3 text-xs italic resize-none"></textarea><p class="helper-text">Identify the exact moment panic sets in and which cue breaks the jam.</p></div></div></div><div class="flex justify-between pt-4"><button onclick="p1_showStep(2)" class="text-slate-500 font-bold uppercase text-[10px] tracking-widest">â† Back</button><button onclick="p1_showStep(4)" class="bg-sky-600 px-8 py-3 rounded-lg text-white font-bold uppercase text-[10px] tracking-widest">Next Station â†’</button></div></div></div>
                    <div id="p1-step4" class="step-content"><div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-sky-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Station 04: Confidence Builder</h2></div><div class="p-8 space-y-8"><div class="grid grid-cols-1 md:grid-cols-2 gap-10"><div class="space-y-4"><h3 class="text-[10px] font-bold text-slate-500 uppercase mono italic underline tracking-widest">Certainty Logic</h3><p class="text-sm text-slate-300 leading-relaxed">Uncertainty generates anxiety; Certainty generates confidence. You cannot control the outcome (Winning), but you can control the process (Mechanics). By shifting your focus to what you control, you build a "High Confidence" state.</p><div class="bg-slate-900 p-4 border border-slate-700 rounded-xl space-y-2"><h4 class="text-[10px] font-black text-white uppercase">S.M.A.R.T. Definition</h4><ul class="text-[9px] text-slate-400 space-y-1 font-mono"><li><strong class="text-sky-400">S</strong>PECIFIC: Clear and defined.</li><li><strong class="text-sky-400">M</strong>EASURABLE: Can be tracked.</li><li><strong class="text-sky-400">A</strong>CHIEVABLE: Realistic to your skill.</li><li><strong class="text-sky-400">R</strong>ELEVANT: Matters to your sport.</li><li><strong class="text-sky-400">T</strong>IME-BOUND: Has a deadline.</li></ul></div></div><div class="space-y-6"><div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"><label class="block text-[10px] font-bold uppercase text-emerald-400 mb-2 mono underline italic">Process Goal (100% Control)</label><input type="text" id="p1_goal_proc" oninput="p1_saveData()" placeholder="Specific form or mechanics goal..." class="w-full rounded-lg p-3 text-xs font-black italic"><p class="helper-text">This goal builds high confidence because it is entirely under your power.</p></div><div class="grid grid-cols-2 gap-4"><div class="p-4 bg-slate-900 border border-slate-800 rounded-xl"><label class="block text-[10px] font-bold uppercase text-amber-500 mb-2 mono">Performance Goal</label><input type="text" id="p1_goal_perf" oninput="p1_saveData()" placeholder="e.g. 80% accuracy..." class="w-full rounded-lg p-2 text-xs italic"><p class="helper-text">Partial Control.</p></div><div class="p-4 bg-slate-900 border border-slate-800 rounded-xl"><label class="block text-[10px] font-bold uppercase text-rose-500 mb-2 mono">Outcome Goal</label><input type="text" id="p1_goal_out" oninput="p1_saveData()" placeholder="e.g. Winning..." class="w-full rounded-lg p-2 text-xs italic"><p class="helper-text">Low Control.</p></div></div><div><label class="block text-[10px] font-bold uppercase text-white mb-2 mono italic underline leading-none">Final S.M.A.R.T. Goal Statement</label><textarea id="p1_smart_final" oninput="p1_saveData()" placeholder="Write out your full goal statement here using the SMART criteria above..." class="w-full h-24 rounded-lg p-3 text-xs italic resize-none border-2 border-slate-700 focus:border-sky-500"></textarea><p class="helper-text">Combine your goals into one clear sentence.</p></div></div></div><div class="flex justify-between pt-4"><button onclick="p1_showStep(3)" class="text-slate-500 font-bold uppercase text-[10px] tracking-widest">â† Back</button><button onclick="p1_showStep(5)" class="bg-sky-600 px-8 py-3 rounded-lg text-white font-bold uppercase text-[10px] tracking-widest">Review & Export â†’</button></div></div>
                    </div>
                    <div id="p1-step5" class="step-content"><div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Final Review & Rubric</h2></div><div class="p-8 space-y-12"><div class="grid grid-cols-1 lg:grid-cols-2 gap-8"><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-4 tracking-widest mono italic underline underline-offset-2">Mental Fitness Assessment</label><div id="sc-container" class="space-y-4"></div><div class="border-t border-slate-800 mt-6 pt-6 flex justify-between items-center"><span class="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Readiness Score</span><div class="text-4xl font-black italic text-emerald-500 leading-none"><span id="p1-total-score">00</span><span class="text-xl text-slate-700 font-normal not-italic">/25</span></div></div></div><div class="space-y-6"><label class="block text-[10px] font-bold uppercase text-sky-400 mb-2 tracking-widest mono italic underline leading-none underline-offset-4">Integration Narrative (Required)</label><textarea id="p1_final_narrative" oninput="p1_saveData()" placeholder="Explain how you will use these four stations to monitor your indicators and regulate your performance state..." class="w-full h-[240px] rounded-xl p-4 text-sm resize-none text-slate-200 border-2 border-sky-500/20 focus:border-sky-500 transition-all"></textarea><p class="helper-text">Prove your understanding: How do these tools prevent the "Crash"?</p></div></div><div class="border-t border-slate-800 pt-8"><label class="block text-[10px] font-bold uppercase text-emerald-500 mb-4 tracking-widest mono italic underline underline-offset-4">Tactical Rubric</label><div class="overflow-x-auto glass rounded-2xl border border-slate-800 shadow-xl"><table class="w-full text-left text-[10px] border-collapse min-w-[700px]"><thead><tr class="bg-slate-900 border-b border-slate-800"><th class="p-4 text-slate-500 uppercase font-black">Criteria</th><th class="p-4 text-emerald-400 uppercase font-black tracking-widest">Proficient (4-5)</th><th class="p-4 text-amber-400 uppercase font-black tracking-widest">Developing (2-3)</th><th class="p-4 text-rose-400 uppercase font-black tracking-widest">Emerging (0-1)</th></tr></thead><tbody class="text-[10px] leading-relaxed italic text-slate-400"><tr class="border-b border-slate-800/50"><td class="p-4 font-bold uppercase text-white mono">Stress Reset</td><td onclick="p1_setScore('reset', 5)" id="reset-5" class="rubric-cell p-4">Centering action is clearly defined (diaphragm) with a specific time trigger. Breath anchor logic is clear.</td><td onclick="p1_setScore('reset', 3)" id="reset-3" class="rubric-cell p-4">Breathing technique mentioned but lacks specific trigger or physiological detail.</td><td onclick="p1_setScore('reset', 1)" id="reset-1" class="rubric-cell p-4">Missing centering action or trigger.</td></tr><tr class="border-b border-slate-800/50"><td class="p-4 font-bold uppercase text-white mono">Arousal Tuning</td><td onclick="p1_setScore('tune', 5)" id="tune-5" class="rubric-cell p-4">Clear distinction between Up/Down regulation. PMR definition is accurate. Tools are actionable.</td><td onclick="p1_setScore('tune', 3)" id="tune-3" class="rubric-cell p-4">Tools identified but generic. Lacks personal specificity or clear definition of PMR.</td><td onclick="p1_setScore('tune', 1)" id="tune-1" class="rubric-cell p-4">Incomplete tuning strategies.</td></tr><tr class="border-b border-slate-800/50"><td class="p-4 font-bold uppercase text-white mono">Targeting (Cues)</td><td onclick="p1_setScore('focus', 5)" id="focus-5" class="rubric-cell p-4">Instructional (Technical) & Motivational (Energy) cues are distinct. Scenario breaks the 'jam'.</td><td onclick="p1_setScore('focus', 3)" id="focus-3" class="rubric-cell p-4">Cues are too long or vague. No distinction between instructional/motivational function.</td><td onclick="p1_setScore('focus', 1)" id="focus-1" class="rubric-cell p-4">Missing cues or scenario.</td></tr><tr class="border-b border-slate-800/50"><td class="p-4 font-bold uppercase text-white mono">Confidence</td><td onclick="p1_setScore('goals', 5)" id="goals-5" class="rubric-cell p-4">Full SMART statement is written. Process goal is 100% controllable.</td><td onclick="p1_setScore('goals', 3)" id="goals-3" class="rubric-cell p-4">Process goal relies on partial external factors. SMART statement missing or incomplete.</td><td onclick="p1_setScore('goals', 1)" id="goals-1" class="rubric-cell p-4">Goals are confused (e.g. Outcome listed as Process).</td></tr><tr><td class="p-4 font-bold uppercase text-white mono">Integration</td><td onclick="p1_setScore('intel', 5)" id="intel-5" class="rubric-cell p-4">Narrative demonstrates understanding of the Dashboard (Somatic/Cognitive) and Regulation.</td><td onclick="p1_setScore('intel', 3)" id="intel-3" class="rubric-cell p-4">Restates definitions without demonstrating personal application or logic.</td><td onclick="p1_setScore('intel', 1)" id="intel-1" class="rubric-cell p-4">Incomplete narrative.</td></tr></tbody></table></div></div><div class="flex flex-col md:flex-row gap-4 pt-8"><button onclick="p1_showStep(1)" class="flex-1 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors border border-slate-800 rounded-xl py-4">â† Start Over</button><button onclick="p1_generatePDF()" class="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg active:scale-95">Generate Tactical Report</button></div></div></div>
                </div>
            </div>
        </div>`,
          script: `const p1_cats = [ { id: 'reset', label: 'Stress Reset' }, { id: 'tune', label: 'Arousal' }, { id: 'focus', label: 'Targeting' }, { id: 'goals', label: 'Confidence' }, { id: 'intel', label: 'Integration' } ];
        let p1_scores = { reset: 0, tune: 0, focus: 0, goals: 0, intel: 0 };
        function p1_showStep(n) {
            document.querySelectorAll('#view-phase1 .step-content').forEach(s => s.classList.remove('active'));
            document.getElementById('p1-step' + n).classList.add('active');
            document.querySelectorAll('#view-phase1 .mod-nav-btn').forEach((b, i) => b.classList.toggle('active', i === n));
        }
        function p1_setScore(cat, val) {
            p1_scores[cat] = val;
            const group = document.getElementById(\`group-\${cat}\`);
            if(group) { group.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', (i+1) === val)); }
            const total = Object.values(p1_scores).reduce((a, b) => a + b, 0);
            document.getElementById('p1-total-score').innerText = total.toString().padStart(2, '0');
            p1_saveData();
        }
        function p1_getFormData() {
             return { b_scenario: document.getElementById('p1_breath_scenario').value, b_detail: document.getElementById('p1_breath_detail').value, relax: document.getElementById('p1_relax_plan').value, active: document.getElementById('p1_active_plan').value, inst: document.getElementById('p1_cue_inst').value, mot: document.getElementById('p1_cue_mot').value, jam: document.getElementById('p1_jam_scenario').value, proc: document.getElementById('p1_goal_proc').value, perf: document.getElementById('p1_goal_perf').value, out: document.getElementById('p1_goal_out').value, smart_final: document.getElementById('p1_smart_final').value, narr: document.getElementById('p1_final_narrative').value, scores: p1_scores };
        }
        function p1_saveData() { localStorage.setItem('elite_operator_v3_p1', JSON.stringify(p1_getFormData())); document.getElementById('p1-save-text').innerText = "Saved"; setTimeout(() => document.getElementById('p1-save-text').innerText = "System Ready", 1000); }
        function p1_populate(data) { if(!data) return; if(data.b_scenario) document.getElementById('p1_breath_scenario').value = data.b_scenario; if(data.b_detail) document.getElementById('p1_breath_detail').value = data.b_detail; if(data.relax) document.getElementById('p1_relax_plan').value = data.relax; if(data.active) document.getElementById('p1_active_plan').value = data.active; if(data.inst) document.getElementById('p1_cue_inst').value = data.inst; if(data.mot) document.getElementById('p1_cue_mot').value = data.mot; if(data.jam) document.getElementById('p1_jam_scenario').value = data.jam; if(data.proc) document.getElementById('p1_goal_proc').value = data.proc; if(data.perf) document.getElementById('p1_goal_perf').value = data.perf; if(data.out) document.getElementById('p1_goal_out').value = data.out; if(data.smart_final) document.getElementById('p1_smart_final').value = data.smart_final; if(data.narr) document.getElementById('p1_final_narrative').value = data.narr; if(data.scores) { p1_scores = data.scores; Object.keys(p1_scores).forEach(c => { if(p1_scores[c]>0) p1_setScore(c, p1_scores[c]); }); } }
        function p1_downloadBackup() { const data = p1_getFormData(); const blob = new Blob([JSON.stringify(data)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = "phase1-backup.json"; a.click(); }
        function p1_loadBackup(input) { const file = input.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (e) => { p1_populate(JSON.parse(e.target.result)); alert("Phase 1 Data Loaded"); }; reader.readAsText(file); }
        function p1_generatePDF() { 
            const data = p1_getFormData(); 
            const total = Object.values(p1_scores).reduce((a, b) => a + b, 0);
            const scoreDetails = p1_cats.map(c => \`<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:6px 0;"><span style="font-size:10px; font-weight:bold; color:#666; text-transform:uppercase;">\${c.label}</span><span style="font-weight:900; font-style:italic;">\${p1_scores[c.id] || 0}/5</span></div>\`).join('');
            const html = \`<!DOCTYPE html><html><head><title>Elite Operator Report</title><link href="https://cdn.tailwindcss.com" rel="stylesheet"><style>body{font-family:sans-serif;padding:40px;color:black;background:white;line-height:1.3}.header{border-bottom:5px solid black;padding-bottom:10px;margin-bottom:25px}.section{margin-bottom:20px;border-left:4px solid black;padding-left:15px}.label{font-size:8px;font-weight:bold;text-transform:uppercase;color:#888}.val{font-size:13px;font-weight:900;font-style:italic;border-bottom:1px solid #ddd;margin-bottom:8px;min-height:18px;color:#111}.narr-val{font-size:11px;line-height:1.4;padding:12px;background:#f9f9f9;border-radius:8px;border:1px solid #eee;margin-top:5px}</style></head><body><div style="max-width:800px;margin:auto"><div class="header flex justify-between items-end"><div><h1 class="text-3xl font-black italic uppercase">Operator Report</h1><p style="font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:bold">Regulation Engine Tactical Assessment</p></div><div style="text-align:right"><p style="font-size:10px;text-transform:uppercase;font-weight:bold">Mental Fitness Score</p><p style="font-size:40px;font-weight:900;font-style:italic;line-height:1">\${total}/25</p></div></div><div class="grid grid-cols-2 gap-8"><div class="section" style="border-left-color:#f43f5e"><h2 style="font-size:12px;font-weight:900;text-transform:uppercase;margin-bottom:10px;color:#f43f5e">01 Stress Loop Reset</h2><div class="label">Deployment Scenario</div><div class="val">\${data.b_scenario||'...'}</div><div class="label">Centering Action</div><div class="val">\${data.b_detail||'...'}</div></div><div class="section" style="border-left-color:#f59e0b"><h2 style="font-size:12px;font-weight:900;text-transform:uppercase;margin-bottom:10px;color:#f59e0b">02 Arousal Tuning</h2><div class="label">Down-Regulation (PMR)</div><div class="val">\${data.relax||'...'}</div><div class="label">Up-Regulation (Active)</div><div class="val">\${data.active||'...'}</div></div></div><div class="grid grid-cols-2 gap-8"><div class="section" style="border-left-color:#10b981"><h2 style="font-size:12px;font-weight:900;text-transform:uppercase;margin-bottom:10px;color:#10b981">03 Targeting (Cues)</h2><div class="label">Instructional Cue</div><div class="val">\${data.inst||'...'}</div><div class="label">Motivational Cue</div><div class="val">\${data.mot||'...'}</div><div class="label">Jamming Scenario</div><div class="val" style="font-size:11px">\${data.jam||'...'}</div></div><div class="section" style="border-left-color:#0ea5e9"><h2 style="font-size:12px;font-weight:900;text-transform:uppercase;margin-bottom:10px;color:#0ea5e9">04 Confidence (SMART)</h2><div class="label">Process Goal (100% Control)</div><div class="val">\${data.proc||'...'}</div><div class="label">Full SMART Statement</div><div class="val" style="font-size:11px">\${data.smart_final||'...'}</div></div></div><div class="section"><h2 style="font-size:12px;font-weight:900;text-transform:uppercase;margin-bottom:5px">Integration Narrative</h2><div class="narr-val">\${data.narr||'---'}</div></div><div style="margin-top:20px;border-top:2px solid black;padding-top:15px"><h2 style="font-size:10px;font-weight:900;text-transform:uppercase;margin-bottom:8px">Evaluation Breakdown</h2>\${scoreDetails}</div></div><script>window.onload=function(){setTimeout(function(){window.print()},500)};<\\/script></body></html>\`; 
            const win = window.open('','_blank'); win.document.write(html); win.document.close(); 
        }`,
        css: ""
      },
      {
        id: "item-x",
        title: "Empty Module",
        type: "standalone",
        html: "",
        css: "",
        script: ""
      }
    ],
    materials: []
  },
  "Course Settings": {
    courseName: "Mental Fitness",
    courseCode: "",
    instructor: "",
    academicYear: "",
    accentColor: "sky",
    backgroundColor: "slate-900",
    headingTextColor: "white",
    secondaryTextColor: "slate-400",
    assessmentTextColor: "white",
    assessmentBoxColor: "slate-900",
    defaultMaterialTheme: "dark",
    buttonColor: "sky-600",
    containerColor: "slate-900/80",
    fontFamily: "inter",
    customCSS: "",
    compilationDefaults: {
      includeMaterials: true,
      includeAssessments: true,
      includeToolkit: true,
      enableProgressTracking: true
    },
    exportSettings: {
      filenamePattern: "{courseName}_compiled",
      includeTimestamp: true
    }
  },
  "Global Toolkit": [
      {
        id: "feat-darkmode",
        title: "Dark Mode",
        enabled: true,
        hiddenFromUser: true,
        userToggleable: false,
        includeUi: false,
        category: "theme",
        description: "Sets site theme to dark mode by default",
        code: {
          id: "tool-darkmode",
          html: "",
          script: `(function(){
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.style.background = '#020617';
          })();`
        }
      },
      {
        id: "feat-calculator",
        title: "Calculator",
        enabled: true,
        hiddenFromUser: false,
        userToggleable: true,
        includeUi: true,
        category: "utility",
        description: "Simple calculator widget",
        code: {
          id: "tool-calculator",
          html: `<div id="tool-calculator" class="hidden fixed bottom-4 right-4 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-2xl z-50">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-white">Calculator</h3>
              <button onclick="toggleTool('calculator')" class="text-slate-400 hover:text-white">&times;</button>
            </div>
            <input id="calc-display" type="text" readonly class="w-full mb-2 p-2 bg-slate-900 border border-slate-700 rounded text-right text-white" value="0">
            <div class="grid grid-cols-4 gap-2">
              <button onclick="calcInput('7')" class="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white">7</button>
              <button onclick="calcInput('8')" class="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white">8</button>
              <button onclick="calcInput('9')" class="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white">9</button>
              <button onclick="calcInput('/')" class="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white">/</button>
              <button onclick="calcInput('4')" class="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white">4</button>
              <button onclick="calcInput('5')" class="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white">5</button>
              <button onclick="calcInput('6')" class="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white">6</button>
              <button onclick="calcInput('*')" class="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white">Ã—</button>
              <button onclick="calcInput('1')" class="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white">1</button>
              <button onclick="calcInput('2')" class="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white">2</button>
              <button onclick="calcInput('3')" class="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white">3</button>
              <button onclick="calcInput('-')" class="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white">âˆ’</button>
              <button onclick="calcInput('0')" class="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white">0</button>
              <button onclick="calcInput('.')" class="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white">.</button>
              <button onclick="calcEquals()" class="p-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white">=</button>
              <button onclick="calcInput('+')" class="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white">+</button>
              <button onclick="calcClear()" class="col-span-4 p-2 bg-rose-600 hover:bg-rose-500 rounded text-white">Clear</button>
            </div>
          </div>`,
          script: `let calcValue = '0';
          function calcInput(val) {
            if (calcValue === '0') calcValue = val;
            else calcValue += val;
            document.getElementById('calc-display').value = calcValue;
          }
          function calcEquals() {
            try {
              calcValue = eval(calcValue).toString();
              document.getElementById('calc-display').value = calcValue;
            } catch(e) { calcValue = 'Error'; }
          }
          function calcClear() {
            calcValue = '0';
            document.getElementById('calc-display').value = calcValue;
          }`
        }
      },
      {
        id: "feat-timer",
        title: "Timer",
        enabled: true,
        hiddenFromUser: false,
        userToggleable: true,
        includeUi: true,
        category: "utility",
        description: "Simple countdown timer",
        code: {
          id: "tool-timer",
          html: `<div id="tool-timer" class="hidden fixed bottom-4 left-4 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-2xl z-50 w-64">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-white">Timer</h3>
              <button onclick="toggleTool('timer')" class="text-slate-400 hover:text-white">&times;</button>
            </div>
            <div id="timer-display" class="text-4xl font-bold text-center text-white mb-3">05:00</div>
            <div class="flex gap-2">
              <button onclick="startTimer()" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded">Start</button>
              <button onclick="pauseTimer()" class="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2 rounded">Pause</button>
              <button onclick="resetTimer()" class="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2 rounded">Reset</button>
            </div>
          </div>`,
          script: `let timerSeconds = 300;
          let timerInterval = null;
          function startTimer() {
            if (timerInterval) return;
            timerInterval = setInterval(() => {
              if (timerSeconds > 0) {
                timerSeconds--;
                const mins = Math.floor(timerSeconds / 60);
                const secs = timerSeconds % 60;
                document.getElementById('timer-display').textContent = mins.toString().padStart(2,'0') + ':' + secs.toString().padStart(2,'0');
              } else {
                clearInterval(timerInterval);
                timerInterval = null;
                alert('Timer finished!');
              }
            }, 1000);
          }
          function pauseTimer() {
            clearInterval(timerInterval);
            timerInterval = null;
          }
          function resetTimer() {
            clearInterval(timerInterval);
            timerInterval = null;
            timerSeconds = 300;
            document.getElementById('timer-display').textContent = '05:00';
          }`
        }
      },
      {
        id: "feat-print",
        title: "Print Page",
        enabled: true,
        hiddenFromUser: false,
        userToggleable: false,
        includeUi: false,
        category: "utility",
        description: "Adds print button to toolbar",
        code: {
          id: "tool-print",
          html: `<button onclick="window.print()" class="fixed top-4 right-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg z-50">ðŸ–¨ï¸ Print</button>`,
          script: ``
        }
      }
  ]
};

// ==========================================
// ðŸŸ¡ MASTER SHELL TEMPLATE
// ==========================================
// Canvas Instructions: To update the default template, replace the string below.
// ==========================================

// Helper function to get accent color values
const getAccentColor = (accentColor) => {
  const colorMap = {
    sky: { hex: '#0ea5e9', dark: '#0284c7', light: '#38bdf8' },
    rose: { hex: '#f43f5e', dark: '#e11d48', light: '#fb7185' },
    emerald: { hex: '#10b981', dark: '#059669', light: '#34d399' },
    amber: { hex: '#f59e0b', dark: '#d97706', light: '#fbbf24' },
    purple: { hex: '#a855f7', dark: '#9333ea', light: '#c084fc' },
    indigo: { hex: '#6366f1', dark: '#4f46e5', light: '#818cf8' },
    pink: { hex: '#ec4899', dark: '#db2777', light: '#f472b6' },
    teal: { hex: '#14b8a6', dark: '#0d9488', light: '#2dd4bf' }
  };
  return colorMap[accentColor] || colorMap.sky;
};

// Helper function to get font family CSS and URL
const getFontFamilyGlobal = (fontFamily) => {
  const fonts = {
    inter: {
      url: 'https://fonts.googleapis.com/css?family=Inter:ital,wght@0,400;0,700;1,400;1,900&display=swap',
      css: "font-family: 'Inter', sans-serif;"
    },
    roboto: {
      url: 'https://fonts.googleapis.com/css?family=Roboto:ital,wght@0,400;0,700;1,400;1,900&display=swap',
      css: "font-family: 'Roboto', sans-serif;"
    },
    opensans: {
      url: 'https://fonts.googleapis.com/css?family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap',
      css: "font-family: 'Open Sans', sans-serif;"
    },
    lato: {
      url: 'https://fonts.googleapis.com/css?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap',
      css: "font-family: 'Lato', sans-serif;"
    },
    montserrat: {
      url: 'https://fonts.googleapis.com/css?family=Montserrat:ital,wght@0,400;0,700;1,400;1,700&display=swap',
      css: "font-family: 'Montserrat', sans-serif;"
    },
    poppins: {
      url: 'https://fonts.googleapis.com/css?family=Poppins:ital,wght@0,400;0,700;1,400;1,700&display=swap',
      css: "font-family: 'Poppins', sans-serif;"
    },
    raleway: {
      url: 'https://fonts.googleapis.com/css?family=Raleway:ital,wght@0,400;0,700;1,400;1,700&display=swap',
      css: "font-family: 'Raleway', sans-serif;"
    },
    nunito: {
      url: 'https://fonts.googleapis.com/css?family=Nunito:ital,wght@0,400;0,700;1,400;1,700&display=swap',
      css: "font-family: 'Nunito', sans-serif;"
    }
  };
  return fonts[fontFamily] || fonts.inter;
};

// Template function to generate master shell HTML
const generateMasterShell = (data) => {
  const {
    courseName = "Course Factory",
    courseNameUpper = "COURSE FACTORY",
    accentColor = "sky",
    backgroundColor = "slate-900",
    fontFamily = "inter",
    customCSS = "",
    courseInfo = "",
    navItems = "",
    content = "",
    scripts = "",
    progressTracking = "",
    containerBgRgba = null
  } = data;
  
  const colors = getAccentColor(accentColor);
  const font = getFontFamilyGlobal(fontFamily);
  
  // Map Tailwind color names to hex values for background
  const bgColorMap = {
    'slate-900': '#0f172a',
    'slate-950': '#020617',
    'zinc-900': '#18181b',
    'neutral-900': '#171717',
    'stone-900': '#1c1917',
    'gray-900': '#111827',
    'slate-50': '#f8fafc',
    'zinc-50': '#fafafa',
    'neutral-50': '#fafafa',
    'stone-50': '#fafaf9',
    'gray-50': '#f9fafb',
    'white': '#ffffff'
  };
  const bgHex = bgColorMap[backgroundColor] || bgColorMap['slate-900'];
  const isLightBg = ['slate-50', 'zinc-50', 'neutral-50', 'stone-50', 'gray-50', 'white'].includes(backgroundColor);
  const textColor = isLightBg ? '#0f172a' : '#e2e8f0';
  const hexToRgba = (hex, alpha = 1) => {
    if (!hex) return `rgba(15, 23, 42, ${alpha})`;
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return `rgba(15, 23, 42, ${alpha})`;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  const sidebarBg = hexToRgba(bgHex, isLightBg ? 0.92 : 0.95);
  const sidebarBorder = isLightBg ? 'rgba(15, 23, 42, 0.12)' : 'rgba(51, 65, 85, 0.5)';
  const sidebarHoverBg = isLightBg ? hexToRgba(bgHex, 0.98) : 'rgba(30, 41, 59, 0.95)';
  const containerBgVar = containerBgRgba || hexToRgba(isLightBg ? '#ffffff' : '#0f172a', 0.8);
  
  // Build styles with accent color applied
  const baseStyles = `        /* --- GLOBAL & SHARED STYLES --- */
        html, body { background-color: ${bgHex} !important; }
        body { ${font.css} color: ${textColor}; margin: 0; height: 100vh; overflow: hidden; }
        :root { --cf-container-bg: ${containerBgVar}; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .glass-panel { background: ${sidebarBg}; border-right: 1px solid ${sidebarBorder}; }
        .custom-scroll { overflow-y: auto; }
        .glass { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(51, 65, 85, 0.5); }
        input:not(.assessment-input), textarea:not(.assessment-input), select:not(.assessment-input) { background: #0f172a !important; border: 1px solid #1e293b !important; transition: all 0.2s; color: #e2e8f0; }
        input:not(.assessment-input):focus, textarea:not(.assessment-input):focus, select:not(.assessment-input):focus { border-color: ${colors.hex} !important; outline: none; box-shadow: 0 0 0 1px ${colors.hex}; }
        
        /* Navigation */
        .nav-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 16px; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; transition: all 0.2s; border-left: 2px solid transparent; }
        .nav-item:hover { background: rgba(30, 41, 59, 0.5); color: #e2e8f0; }
        .nav-item.active { background: rgba(14, 165, 233, 0.1); color: ${colors.light}; border-left: 2px solid ${colors.light}; }

        /* Module Buttons & Tabs */
        .score-btn, .mod-nav-btn, .nav-btn { background: #0f172a; border: 1px solid #1e293b; color: #64748b; transition: all 0.2s; }
        .score-btn:hover, .mod-nav-btn:hover, .nav-btn:hover { border-color: ${colors.hex}; color: white; }
        .score-btn.active, .mod-nav-btn.active, .nav-btn.active { background: ${colors.hex}; color: #000; font-weight: 900; border-color: ${colors.hex}; }
        
        /* Layout Helpers */
        .phase-header { border-left: 4px solid #334155; padding-left: 1rem; margin-bottom: 1rem; }
        .phase-header.active { border-color: ${colors.hex}; }
        .step-content { display: none; }
        .step-content.active { display: block; }
        .rubric-cell { cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
        .rubric-cell:hover { background: rgba(255,255,255,0.05); }
        .active-proficient { background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #10b981; }
        .active-developing { background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #f59e0b; }
        .active-emerging { background: rgba(244, 63, 94, 0.2); border: 1px solid #f43f5e; color: #f43f5e; }
        .helper-text { font-size: 8px; color: #64748b; font-style: italic; margin-top: 4px; line-height: 1.2; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
        .info-card { background: rgba(30, 41, 59, 0.4); border-left: 3px solid ${colors.hex}; padding: 1.5rem; border-radius: 0.75rem; }
        .top-ten-input { font-size: 0.75rem; padding: 0.5rem !important; border-radius: 0.375rem !important; }
        
        /* Animations */
        @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        .status-saved { animation: pulse-green 2s infinite; }
        .scan-line { height: 2px; width: 100%; background: rgba(0, 255, 65, 0.2); position: absolute; animation: scan 3s linear infinite; pointer-events: none; }
        @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
        
        /* Sidebar Toggle - Works on ALL screen sizes */
        .sidebar-toggle { 
            position: fixed; 
            top: 1rem; 
            left: 1rem; 
            z-index: 100; 
            background: ${sidebarBg}; 
            border: 1px solid ${sidebarBorder}; 
            color: ${textColor}; 
            padding: 0.75rem; 
            border-radius: 0.5rem; 
            cursor: pointer; 
            font-size: 1.25rem; 
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
        }
        .sidebar-toggle:hover { background: ${sidebarHoverBg}; border-color: ${colors.hex}; }

        /* Materials & Assessments Container Colors */
        /* Material cards use per-material theme (Phase 1 card theme); do NOT override. */
        #view-assessments .assessment-card {
            background: var(--cf-container-bg) !important;
        }
        #view-assessments .assessment-container [class*="bg-slate-9"],
        #view-assessments .assessment-container [class*="bg-slate-8"],
        #view-assessments .assessment-container [class*="bg-slate-7"],
        #view-assessments .assessment-container [class*="bg-slate-6"],
        #view-assessments .assessment-container [class*="bg-gray-9"],
        #view-assessments .assessment-container [class*="bg-gray-8"],
        #view-assessments .assessment-container [class*="bg-gray-7"] {
            background: var(--cf-container-bg) !important;
        }
        
        /* Overlay for mobile */
        .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); z-index: 60; backdrop-filter: blur(4px); pointer-events: none; }
        .sidebar-overlay.active { display: block; pointer-events: auto; }
        
        /* Sidebar - Collapsible on all sizes */
        #sidebar-nav {
            transition: width 0.3s ease, min-width 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
            min-width: 16rem;
            overflow: hidden;
        }
        #sidebar-nav.collapsed {
            width: 0 !important;
            min-width: 0 !important;
            opacity: 0;
            pointer-events: none;
            transform: translateX(-100%);
        }
        
        /* Content fills available space */
        #content-container {
            flex: 1;
            transition: all 0.3s ease;
            width: 100%;
            background: ${bgHex} !important;
            background-color: ${bgHex} !important;
        }
        
        /* Toggle button position */
        .sidebar-toggle {
            transition: left 0.3s ease;
        }
        body:not(.sidebar-collapsed) .sidebar-toggle {
            left: calc(16rem + 1rem); /* 16rem = w-64 sidebar width + margin */
        }
        body.sidebar-collapsed .sidebar-toggle {
            left: 1rem;
        }
        
        @media (max-width: 768px) {
            /* On mobile, sidebar overlays content */
            #sidebar-nav { 
                position: fixed; 
                left: 0;
                top: 0; 
                bottom: 0; 
                z-index: 80; 
                width: 80% !important;
                max-width: 280px;
                min-width: 0;
            }
            #sidebar-nav:not(.collapsed) {
                opacity: 1;
                transform: translateX(0);
            }
            #sidebar-nav.collapsed {
                transform: translateX(-100%);
                width: 80% !important;
            }
            /* Toggle always on left on mobile */
            .sidebar-toggle,
            body:not(.sidebar-collapsed) .sidebar-toggle,
            body.sidebar-collapsed .sidebar-toggle {
                left: 1rem !important;
            }
            #content-container {
                width: 100% !important;
            }
        }`;
  
  return `<!DOCTYPE html>
<html lang="en" style="background: ${bgHex} !important; background-color: ${bgHex} !important;">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${courseNameUpper} | MASTER CONSOLE</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="${font.url}" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
    <style>
        ${baseStyles}${customCSS ? `\n        /* Custom CSS from Settings */\n        ${customCSS}` : ''}
    </style>
    <script>
        // Force background color after Tailwind loads
        (function() {
            function setBackground() {
                document.documentElement.style.backgroundColor = '${bgHex}';
                document.documentElement.style.background = '${bgHex}';
                document.body.style.backgroundColor = '${bgHex}';
                document.body.style.background = '${bgHex}';
            }
            setBackground();
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', setBackground);
            }
            setTimeout(setBackground, 100);
            setTimeout(setBackground, 500);
        })();
    </script>
</head>
<body class="flex" style="background: ${bgHex} !important; background-color: ${bgHex} !important;">
    <!-- Sidebar Toggle Button (Works on ALL screen sizes) -->
    <button class="sidebar-toggle" onclick="toggleSidebar()" aria-label="Toggle navigation" title="Toggle Menu">&#9776;</button>
    <div class="sidebar-overlay" id="sidebar-overlay" onclick="toggleSidebar()"></div>

    <div id="sidebar-nav" class="w-64 glass-panel flex flex-col h-full z-50">
        <div class="p-8 border-b border-slate-800">
            <h1 class="text-xl font-black italic text-white tracking-tighter uppercase leading-none"><span class="text-${accentColor}-500">${courseName}</span></h1>
            <p class="text-[10px] text-slate-500 mt-2 mono uppercase tracking-widest">Master Console v2.0</p>${courseInfo}
        </div>
        <nav class="flex-1 overflow-y-auto py-4 space-y-1" id="main-nav">
            <div class="px-4 py-2 mt-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest mono">System Modules</div>
            ${navItems}
        </nav>
        <div class="p-6 border-t border-slate-800 text-center"><p class="text-[9px] text-slate-600 italic">"Recognition is the trigger for regulation."</p></div>
    </div>

    <div class="flex-1 relative h-full overflow-hidden" id="content-container">
        ${content}
        <iframe id="view-external" class="w-full h-full hidden" src=""></iframe>
    </div>

    <!-- MODULE SCRIPTS CONTAINER -->
    <script id="module-scripts">
        ${scripts}${progressTracking ? '\n        ' + progressTracking : ''}
    </script>

    <script>
        // --- SIDEBAR TOGGLE (Works on ALL screen sizes) ---
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar-nav');
            const overlay = document.getElementById('sidebar-overlay');
            const body = document.body;
            
            if (sidebar) {
                const isCollapsed = sidebar.classList.toggle('collapsed');
                body.classList.toggle('sidebar-collapsed', isCollapsed);
                
                // Show overlay on mobile when sidebar is open
                if (overlay && window.innerWidth <= 768) {
                    overlay.classList.toggle('active', !isCollapsed);
                }
                
                // Save preference
                try {
                    localStorage.setItem('sidebarCollapsed', isCollapsed ? 'true' : 'false');
                } catch(e) {}
            }
        }
        
        // Initialize sidebar state from localStorage
        document.addEventListener('DOMContentLoaded', function() {
            const sidebar = document.getElementById('sidebar-nav');
            const body = document.body;
            
            try {
                const savedState = localStorage.getItem('sidebarCollapsed');
                // On mobile, default to collapsed. On desktop, respect saved preference
                if (window.innerWidth <= 768) {
                    sidebar.classList.add('collapsed');
                    body.classList.add('sidebar-collapsed');
                } else if (savedState === 'true') {
                    sidebar.classList.add('collapsed');
                    body.classList.add('sidebar-collapsed');
                }
            } catch(e) {}
            
            // Prevent overlay clicks from propagating to sidebar
            if (sidebar) {
                sidebar.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }
        });
        
        // --- CORE NAVIGATION LOGIC ---
        function switchView(view) {
            console.log('ðŸ”„ [switchView] Switching to view:', view);
            
            // 1. Close sidebar on mobile after selecting a view
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar-nav');
                const overlay = document.getElementById('sidebar-overlay');
                if (sidebar && !sidebar.classList.contains('collapsed')) {
                    sidebar.classList.add('collapsed');
                    document.body.classList.add('sidebar-collapsed');
                    if (overlay) overlay.classList.remove('active');
                }
            }
            
            // 2. Update Nav Buttons
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            const navBtn = document.getElementById('nav-' + view);
            if(navBtn) navBtn.classList.add('active');
            
            // 3. Hide All Views (both native divs and iframe containers)
            const allViews = document.querySelectorAll('[id^="view-"]');
            console.log('ðŸ”„ [switchView] Hiding', allViews.length, 'views');
            allViews.forEach(v => v.classList.add('hidden'));

            // 4. Show Target View
            const target = document.getElementById('view-' + view);
            if(target) {
                target.classList.remove('hidden');
                console.log('âœ… [switchView] Showing view:', 'view-' + view);
            } else {
                console.error('âŒ [switchView] View not found:', 'view-' + view);
            }
            
            // Backward compatibility: Call module init if available
            if (window.COURSE_FACTORY_MODULES && window.COURSE_FACTORY_MODULES[view] && window.COURSE_FACTORY_MODULES[view].init) {
                try {
                    window.COURSE_FACTORY_MODULES[view].init();
                } catch(e) {
                    console.error('Module init error:', e);
                }
            }
        }

        function openPDF(url, title) {
            const container = document.getElementById('pdf-viewer-container');
            // Convert /view to /preview for iframe embedding
            const previewUrl = url.replace('/view', '/preview');
            document.getElementById('pdf-frame').src = previewUrl;
            document.getElementById('viewer-title').innerText = "VIEWING: " + title;
            container.classList.remove('hidden');
            container.scrollIntoView({ behavior: 'smooth' });
        }

        function closeViewer() {
            document.getElementById('pdf-viewer-container').classList.add('hidden');
            document.getElementById('pdf-frame').src = "";
        }
        
        // ========================================
        // GLOBAL AUTOSAVE SYSTEM
        // ========================================
        (function() {
            // Course-specific storage key (prevents collisions between courses)
            const COURSE_KEY = 'CF_' + '${courseName}'.replace(/[^a-zA-Z0-9]/g, '_') + '_v1';
            let hasExported = false;
            let saveTimeout = null;
            
            // Get all input state from the parent document (not iframes - they handle themselves)
            function getAllInputState() {
                const state = {};
                // Only target inputs NOT inside iframes
                document.querySelectorAll('#content-container input, #content-container textarea, #content-container select').forEach((el, i) => {
                    // Skip if inside an iframe (parent document only)
                    if (el.closest('iframe')) return;
                    
                    const key = el.id || el.name || ('field_' + i + '_' + (el.className || '').slice(0, 20));
                    if (el.type === 'checkbox' || el.type === 'radio') {
                        if (el.checked) state[key] = el.type === 'radio' ? el.value : true;
                    } else {
                        if (el.value) state[key] = el.value;
                    }
                });
                return state;
            }
            
            // Restore input state
            function restoreInputState(state) {
                if (!state || typeof state !== 'object') return;
                
                document.querySelectorAll('#content-container input, #content-container textarea, #content-container select').forEach((el, i) => {
                    if (el.closest('iframe')) return;
                    
                    const key = el.id || el.name || ('field_' + i + '_' + (el.className || '').slice(0, 20));
                    const savedValue = state[key];
                    
                    if (savedValue !== undefined) {
                        if (el.type === 'checkbox') {
                            el.checked = !!savedValue;
                        } else if (el.type === 'radio') {
                            el.checked = (el.value === savedValue);
                        } else {
                            el.value = savedValue;
                        }
                        // Trigger change event so any listeners update
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            }
            
            // Save to localStorage
            function saveNow() {
                try {
                    const state = getAllInputState();
                    if (Object.keys(state).length > 0) {
                        localStorage.setItem(COURSE_KEY, JSON.stringify({
                            timestamp: Date.now(),
                            course: '${courseName}',
                            state: state
                        }));
                        console.log('ðŸ’¾ [Autosave] Saved', Object.keys(state).length, 'fields');
                    }
                } catch(e) {
                    console.warn('Autosave failed:', e);
                }
            }
            
            // Debounced save (prevents saving on every keystroke)
            function debouncedSave() {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(saveNow, 1000); // Save 1 second after last change
            }
            
            // Load saved state
            function loadSaved() {
                try {
                    const raw = localStorage.getItem(COURSE_KEY);
                    if (raw) {
                        const { state, timestamp } = JSON.parse(raw);
                        if (state) {
                            restoreInputState(state);
                            const savedDate = new Date(timestamp);
                            console.log('ðŸ“‚ [Autosave] Restored from', savedDate.toLocaleString());
                        }
                    }
                } catch(e) {
                    console.warn('Load saved failed:', e);
                }
            }
            
            // Mark work as exported (disables unsaved warning)
            window.markWorkSaved = function() {
                hasExported = true;
                console.log('âœ… [Autosave] Work marked as saved/exported');
            };
            
            // Initialize on DOM ready
            function init() {
                // 1. Load saved state
                setTimeout(loadSaved, 100); // Small delay to let DOM settle
                
                // 2. Autosave on any input change
                document.addEventListener('input', debouncedSave);
                document.addEventListener('change', debouncedSave);
                
                // 3. Save before page unload
                window.addEventListener('pagehide', saveNow);
                window.addEventListener('beforeunload', function(e) {
                    saveNow(); // Always save
                    
                    // Warn if not exported and has content
                    if (!hasExported) {
                        const state = getAllInputState();
                        if (Object.keys(state).length > 0) {
                            e.preventDefault();
                            e.returnValue = 'You have unsaved work. Are you sure you want to leave?';
                            return e.returnValue;
                        }
                    }
                });
                
                console.log('ðŸ”§ [Autosave] Initialized for course: ${courseName}');
            }
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                init();
            }
        })();
    </script>
</body>
</html>`;
};

// Keep MASTER_SHELL for backward compatibility (Phase 0 display)
const MASTER_SHELL = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MENTAL FITNESS | MASTER CONSOLE</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css?family=Inter:ital,wght@0,400;0,700;1,400;1,900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
    <style>
        /* --- GLOBAL & SHARED STYLES --- */
        body { font-family: 'Inter', sans-serif; background-color: #020617; color: #e2e8f0; margin: 0; height: 100vh; overflow: hidden; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .glass-panel { background: rgba(15, 23, 42, 0.95); border-right: 1px solid rgba(51, 65, 85, 0.5); }
        .custom-scroll { overflow-y: auto; }
        .glass { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(51, 65, 85, 0.5); }
        input:not(.assessment-input), textarea:not(.assessment-input), select:not(.assessment-input) { background: #0f172a !important; border: 1px solid #1e293b !important; transition: all 0.2s; color: #e2e8f0; }
        input:not(.assessment-input):focus, textarea:not(.assessment-input):focus, select:not(.assessment-input):focus { border-color: #0ea5e9 !important; outline: none; box-shadow: 0 0 0 1px #0ea5e9; }
        
        /* Navigation */
        .nav-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 16px; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; transition: all 0.2s; border-left: 2px solid transparent; }
        .nav-item:hover { background: rgba(30, 41, 59, 0.5); color: #e2e8f0; }
        .nav-item.active { background: rgba(14, 165, 233, 0.1); color: #38bdf8; border-left: 2px solid #38bdf8; }

        /* Module Buttons & Tabs */
        .score-btn, .mod-nav-btn, .nav-btn { background: #0f172a; border: 1px solid #1e293b; color: #64748b; transition: all 0.2s; }
        .score-btn:hover, .mod-nav-btn:hover, .nav-btn:hover { border-color: #0ea5e9; color: white; }
        .score-btn.active, .mod-nav-btn.active, .nav-btn.active { background: #0ea5e9; color: #000; font-weight: 900; border-color: #0ea5e9; }
        
        /* Layout Helpers */
        .phase-header { border-left: 4px solid #334155; padding-left: 1rem; margin-bottom: 1rem; }
        .phase-header.active { border-color: #0ea5e9; }
        .step-content { display: none; }
        .step-content.active { display: block; }
        .rubric-cell { cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
        .rubric-cell:hover { background: rgba(255,255,255,0.05); }
        .active-proficient { background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #10b981; }
        .active-developing { background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #f59e0b; }
        .active-emerging { background: rgba(244, 63, 94, 0.2); border: 1px solid #f43f5e; color: #f43f5e; }
        .helper-text { font-size: 8px; color: #64748b; font-style: italic; margin-top: 4px; line-height: 1.2; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
        .info-card { background: rgba(30, 41, 59, 0.4); border-left: 3px solid #0ea5e9; padding: 1.5rem; border-radius: 0.75rem; }
        .top-ten-input { font-size: 0.75rem; padding: 0.5rem !important; border-radius: 0.375rem !important; }
        
        /* Animations */
        @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        .status-saved { animation: pulse-green 2s infinite; }
        .scan-line { height: 2px; width: 100%; background: rgba(0, 255, 65, 0.2); position: absolute; animation: scan 3s linear infinite; pointer-events: none; }
        @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
    </style>
</head>
<body class="flex">

    <div class="w-64 glass-panel flex-shrink-0 flex flex-col h-full z-50">
        <div class="p-8 border-b border-slate-800">
            <h1 class="text-xl font-black italic text-white tracking-tighter uppercase leading-none">Mental<br><span class="text-sky-500">Fitness</span></h1>
            <p class="text-[10px] text-slate-500 mt-2 mono uppercase tracking-widest">Master Console v2.0</p>
        </div>
        <nav class="flex-1 overflow-y-auto py-4 space-y-1" id="main-nav">
            <div class="px-4 py-2 mt-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest mono">System Modules</div>
            <!-- Dynamic Modules will be injected here -->
        </nav>
        <div class="p-6 border-t border-slate-800 text-center"><p class="text-[9px] text-slate-600 italic">"Recognition is the trigger for regulation."</p></div>
    </div>

    <div class="flex-1 relative bg-slate-900 h-full overflow-hidden" id="content-container">

        <!-- VIEW: MATERIALS -->
        <div id="view-materials" class="w-full h-full custom-scroll p-8 md:p-12">
            <div class="max-w-5xl mx-auto space-y-8">
                <div class="mb-12">
                    <h2 class="text-3xl font-black text-white italic uppercase tracking-tighter">Course <span class="text-sky-500">Materials</span></h2>
                </div>
                 <div id="pdf-viewer-container" class="hidden mb-12 bg-black rounded-xl border border-slate-700 overflow-hidden shadow-2xl"><div class="flex justify-between items-center p-3 bg-slate-800 border-b border-slate-700"><span id="viewer-title" class="text-xs font-bold text-white uppercase tracking-widest px-2">Document Viewer</span><button data-close-pdf-viewer class="text-xs text-rose-400 hover:text-white font-bold uppercase tracking-widest px-2">Close X</button></div><iframe id="pdf-frame" src="" width="100%" height="600" style="border:none;"></iframe></div>
                 <!-- Initial Materials Placeholder -->
                 <p class="text-slate-500 text-sm">Select a module to begin.</p>
            </div>
        </div>
        
        <!-- Dynamic Views will be injected here -->

        <iframe id="view-external" class="w-full h-full hidden" src=""></iframe>

    </div>

    <!-- MODULE SCRIPTS CONTAINER -->
    <script id="module-scripts">
        // New module logic will be appended here
    </script>

    <script>
        // --- MOBILE NAVIGATION ---
        function toggleMobileNav() {
            const sidebar = document.getElementById('sidebar-nav');
            const overlay = document.getElementById('mobile-overlay');
            if (sidebar && overlay) {
                sidebar.classList.toggle('mobile-open');
                overlay.classList.toggle('active');
            }
        }
        
        // Prevent overlay clicks from propagating to sidebar
        document.addEventListener('DOMContentLoaded', function() {
            const sidebar = document.getElementById('sidebar-nav');
            const overlay = document.getElementById('mobile-overlay');
            if (sidebar && overlay) {
                // Stop clicks on sidebar from bubbling to overlay
                sidebar.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }
        });
        
        // --- CORE NAVIGATION LOGIC ---
        function switchView(view) {
            console.log('ðŸ”„ [switchView] Switching to view:', view);
            
            // 1. Handle Mobile Nav
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar-nav');
                const overlay = document.getElementById('mobile-overlay');
                if (sidebar && overlay) {
                    sidebar.classList.remove('mobile-open');
                    overlay.classList.remove('active');
                }
            }
            
            // 2. Update Nav Buttons
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            const navBtn = document.getElementById('nav-' + view);
            if(navBtn) navBtn.classList.add('active');
            
            // 3. Hide All Views (both native divs and iframe containers)
            const allViews = document.querySelectorAll('[id^="view-"]');
            console.log('ðŸ”„ [switchView] Hiding', allViews.length, 'views');
            allViews.forEach(v => v.classList.add('hidden'));

            // 4. Show Target View
            const target = document.getElementById('view-' + view);
            if(target) {
                target.classList.remove('hidden');
                console.log('âœ… [switchView] Showing view:', 'view-' + view);
            } else {
                console.error('âŒ [switchView] View not found:', 'view-' + view);
            }
        }

        function openPDF(url, title) {
            const container = document.getElementById('pdf-viewer-container');
            // Convert /view to /preview for iframe embedding
            const previewUrl = url.replace('/view', '/preview');
            document.getElementById('pdf-frame').src = previewUrl;
            document.getElementById('viewer-title').innerText = "VIEWING: " + title;
            container.classList.remove('hidden');
            container.scrollIntoView({ behavior: 'smooth' });
        }

        function closeViewer() {
            document.getElementById('pdf-viewer-container').classList.add('hidden');
            document.getElementById('pdf-frame').src = "";
        }
    </script>
</body>
</html>`;

// ==========================================
const CodeBlock = ({ label, code, height = "h-32" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = typeof code === 'string' ? code : JSON.stringify(code, null, 2);
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if(successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Copy failed', err);
    }
    
    document.body.removeChild(textArea);
  };

  return (
    <div className="mt-4 border border-slate-700 rounded-lg overflow-hidden bg-slate-950">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-900 border-b border-slate-700">
        <span className="text-xs font-mono text-slate-400 uppercase">{label}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
      <pre className={`p-4 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed whitespace-pre-wrap ${height}`}>
        {typeof code === 'string' ? code : JSON.stringify(code, null, 2)}
      </pre>
    </div>
  );
};

const Toggle = ({ active, labelA, labelB, labelC, onToggle, iconA: IconA, iconB: IconB, iconC: IconC }) => (
    <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 mb-6">
        <button 
            onClick={() => onToggle('A')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-bold transition-all ${active === 'A' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
            <IconA size={14} /> {labelA}
        </button>
        <button 
            onClick={() => onToggle('B')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-bold transition-all ${active === 'B' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
            <IconB size={14} /> {labelB}
        </button>
        {labelC && (
             <button 
                onClick={() => onToggle('C')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-bold transition-all ${active === 'C' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <IconC size={14} /> {labelC}
            </button>
        )}
    </div>
);

// ==========================================
// ðŸ”§ MODULE UTILITY FUNCTIONS (Unified)
// ==========================================

/**
 * Get module type: 'standalone', 'external', or 'legacy'
 */
function getModuleType(module) {
  if (module.type === 'standalone' || module.type === 'external') {
    return module.type;
  }
  // Check if it has direct html/css/script (standalone without type)
  if (module.html && !module.code?.html) {
    return 'standalone';
  }
  // Check if it has code property (legacy)
  if (module.code) {
    return 'legacy';
  }
  // Default to legacy for backwards compatibility
  return 'legacy';
}

/**
 * Escape HTML entities to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Validate URL and reject dangerous protocols
 * Returns: { isValid: boolean, safeUrl: string, error?: string }
 */
function validateUrl(url) {
  if (!url || !url.trim()) {
    return { isValid: false, safeUrl: '#', error: 'Empty URL' };
  }
  
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  
  // Reject dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
  for (const protocol of dangerousProtocols) {
    if (lower.startsWith(protocol)) {
      return { isValid: false, safeUrl: '#', error: `Dangerous protocol: ${protocol}` };
    }
  }
  
  // Try to construct a URL object to validate format
  try {
    const urlObj = new URL(trimmed);
    // Only allow http, https, and relative URLs
    if (!['http:', 'https:', ''].includes(urlObj.protocol) && urlObj.protocol !== '') {
      return { isValid: false, safeUrl: '#', error: `Unsupported protocol: ${urlObj.protocol}` };
    }
    return { isValid: true, safeUrl: trimmed };
  } catch (e) {
    // If URL parsing fails, it might be a relative URL - allow it but escape it
    return { isValid: true, safeUrl: escapeHtml(trimmed) };
  }
}

/**
 * Material badge label (ASCII-only for reliable export)
 */
function getMaterialBadgeLabel(mat) {
  if (!mat) return '';
  const type = (mat.mediaType || '').toLowerCase();
  if (type === 'book') return 'BOOK';
  if (type === 'pdf') return 'PDF';
  if (type === 'video') return 'VID';
  if (type === 'slides') return 'SLD';
  if (type === 'number' || !type) return mat.number || '';
  return mat.number || '';
}

/**
 * Extract module content (HTML, CSS, Script) from any module type
 * Returns: { html, css, script, type }
 */
function extractModuleContent(module) {
  const type = getModuleType(module);
  
  if (type === 'standalone') {
    return {
      html: module.html || '',
      css: module.css || '',
      script: module.script || '',
      type: 'standalone'
    };
  }
  
  if (type === 'external') {
    // Generate HTML based on linkType
    let html = '';
    if (module.linkType === 'iframe') {
      html = `<div id="${module.id}" class="w-full h-full" style="min-height: 600px;">
        <iframe src="${module.url}" width="100%" height="100%" style="border:none;" frameborder="0"></iframe>
      </div>`;
    } else {
      html = `<div id="${module.id}" class="w-full h-full p-8 text-center">
        <h2 class="text-2xl font-bold text-white mb-4">${module.title || 'External Module'}</h2>
        <p class="text-slate-400 mb-6">This module opens in a new tab.</p>
        <a href="${module.url}" target="_blank" rel="noopener noreferrer" 
           class="inline-block bg-sky-600 hover:bg-sky-500 text-white px-8 py-4 rounded-lg text-sm font-bold uppercase transition-all">
          Open ${module.title || 'Module'}
        </a>
      </div>`;
    }
    return {
      html: html,
      css: '',
      script: '',
      type: 'external'
    };
  }
  
  // Legacy format
  let code = module.code || {};
  if (typeof code === 'string') {
    try {
      code = JSON.parse(code);
    } catch (e) {
      console.error('Failed to parse module code:', e);
      code = {};
    }
  }
  
  // Fallback: check if html/script are directly on module
  return {
    html: code.html || module.html || '',
    css: code.css || module.css || '',
    script: code.script || module.script || '',
    type: 'legacy'
  };
}

/**
 * Clean module HTML: remove hidden classes, fix sizing, remove comments
 */
function cleanModuleHTML(html) {
  if (!html) return '';
  
  let cleaned = html;
  
  // Remove HTML comments that break init checks
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove 'hidden' class
  cleaned = cleaned.replace(/class="([^"]*)\bhidden\b([^"]*)"/g, 'class="$1$2"');
  
  // Remove 'custom-scroll' class (not needed without navigation container)
  cleaned = cleaned.replace(/class="([^"]*)\bcustom-scroll\b([^"]*)"/g, 'class="$1$2"');
  
  // Remove 'h-full' and 'w-full' classes that cause overlap issues
  cleaned = cleaned.replace(/class="([^"]*)\bh-full\b([^"]*)"/g, 'class="$1$2"');
  cleaned = cleaned.replace(/class="([^"]*)\bw-full\b([^"]*)"/g, 'class="$1 w-auto max-w-full$2"');
  
  // Clean up any double spaces in class attributes
  cleaned = cleaned.replace(/class="([^"]*)"/g, (match) => {
    const cleanedClass = match.replace(/\s+/g, ' ').trim();
    return cleanedClass;
  });
  
  return cleaned;
}

/**
 * Clean module script: minimal processing since iframes handle scoping
 * With Iframe Isolation strategy, we no longer need to rewrite variables or IDs
 */
function cleanModuleScript(script) {
  return script ? script.trim() : '';
}

/**
 * Validate module before saving
 * Returns: { isValid, errors, warnings }
 */
function validateModule(module, isNew = false) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!module.id || !module.id.trim()) {
    errors.push('Module ID is required');
  } else {
    // ID format validation
    if (!module.id.startsWith('view-') && !module.id.startsWith('item-')) {
      warnings.push('Module ID should start with "view-" or "item-"');
    }
    
    // Check for invalid characters
    if (!/^[a-z0-9-_]+$/i.test(module.id)) {
      errors.push('Module ID can only contain letters, numbers, hyphens, and underscores');
    }
  }

  if (!module.title || !module.title.trim()) {
    errors.push('Module title is required');
  }

  // Type-specific validation
  if (module.type === 'standalone') {
    // Check for rawHtml (new format) OR html (legacy format)
    const hasContent = (module.rawHtml && module.rawHtml.trim()) || (module.html && module.html.trim());
    if (!hasContent) {
      errors.push('Standalone modules must have HTML content');
    }
    // Note: We no longer require a root element with matching ID since modules run in iframes
  } else if (module.type === 'external') {
    if (!module.url || !module.url.trim()) {
      errors.push('External modules must have a URL');
    } else {
      // URL validation
      try {
        new URL(module.url);
      } catch (e) {
        errors.push('Invalid URL format');
      }
    }
    if (!module.linkType || !['iframe', 'newtab'].includes(module.linkType)) {
      errors.push('External modules must specify linkType as "iframe" or "newtab"');
    }
  } else if (!module.type) {
    // Legacy module
    if (!module.code) {
      errors.push('Legacy modules must have a code property');
    } else {
      let code = module.code;
      if (typeof code === 'string') {
        try {
          code = JSON.parse(code);
        } catch (e) {
          errors.push('Invalid code JSON format');
          return { isValid: false, errors, warnings };
        }
      }
      if (!code.html || !code.html.trim()) {
        errors.push('Legacy modules must have code.html');
      }
    }
  }

  // Script validation (warnings only - scripts might be optional)
  if (module.script) {
    // Check for common issues
    // Allow document.write() when used on popup windows (pw.document.write, win.document.write)
    // This is safe and commonly used for print functionality
    if (module.script.includes('document.write') && 
        !module.script.includes('pw.document.write') && 
        !module.script.includes('win.document.write')) {
      warnings.push('Using document.write() in the main window can cause issues. Ensure this is used on a popup window only.');
    }
    if (module.script.includes('window.location') && !module.script.includes('preventDefault')) {
      warnings.push('Direct window.location changes may break navigation');
    }
  }

  // CSS validation (warnings only)
  if (module.css) {
    // Check for unscoped selectors that might conflict (basic check)
    const hasUnscopedSelectors = /^[^{}@]+{/gm.test(module.css);
    if (hasUnscopedSelectors && module.id && !module.css.includes('#' + module.id)) {
      warnings.push('Some CSS selectors may not be scoped to the module ID - may cause conflicts');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Run validation across all course modules and toolkit features.
 * Returns: { isValid, errors, warnings }
 * Each error/warning is { message, context } where context is e.g. "Module 'Intro'" or "Toolkit 'Save System'".
 */
function validateProject(projectData) {
  const errors = [];
  const warnings = [];
  const idsSeen = new Map(); // id -> { context, type: 'module'|'toolkit' }

  const modules = projectData["Current Course"]?.modules || [];
  const toolkit = projectData["Global Toolkit"] || [];

  const checkDuplicateId = (id, context, type) => {
    if (!id || !id.trim()) return;
    const existing = idsSeen.get(id);
    if (existing) {
      errors.push({
        message: `Duplicate ID "${id}" (also used in ${existing.context})`,
        context
      });
    } else {
      idsSeen.set(id, { context, type });
    }
  };

  modules.forEach((mod, idx) => {
    const ctx = `Module "${mod.title || mod.id || 'Untitled'}"`;
    checkDuplicateId(mod.id, ctx, 'module');
    const v = validateModule(mod, false);
    v.errors.forEach((e) => errors.push({ message: e, context: ctx }));
    v.warnings.forEach((w) => warnings.push({ message: w, context: ctx }));
  });

  toolkit.forEach((t, idx) => {
    const ctx = `Toolkit "${t.title || t.id || 'Untitled'}"`;
    checkDuplicateId(t.id, ctx, 'toolkit');
    const v = validateModule(t, false);
    v.errors.forEach((e) => errors.push({ message: e, context: ctx }));
    v.warnings.forEach((w) => warnings.push({ message: w, context: ctx }));
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// --- Phases ---

const Phase0 = () => {
  const [updateMode, setUpdateMode] = useState(false);
  const [newShell, setNewShell] = useState("");

  const updateShellPrompt = `I need to update the Master Shell Template in "CourseFactoryDashboard.tsx".

**New Shell Code:**
\`\`\`html
${newShell}
\`\`\`

**Task:**
1. Locate the \`const MASTER_SHELL\` variable at the top of the file.
2. Replace its entire content (the backticked string) with the new HTML code provided above.
3. Do not modify any other logic.`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="text-blue-400" /> Phase 0: Master Shell
            </h2>
            <button 
                onClick={() => setUpdateMode(!updateMode)}
                className={`text-xs px-3 py-1 rounded-full border transition-all flex items-center gap-2 ${updateMode ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
            >
                <ArrowUpCircle size={14} /> {updateMode ? "Cancel Update" : "Update Template"}
            </button>
        </div>

        {updateMode ? (
            <div className="animate-in fade-in slide-in-from-top-4 bg-amber-900/10 border border-amber-800/50 p-4 rounded-xl mb-4">
                <h3 className="text-sm font-bold text-amber-400 mb-2">Update Master Template</h3>
                <p className="text-xs text-slate-400 mb-4">
                    Paste your <strong>improved</strong> empty shell here (e.g. with new Global Features added). 
                    This will become the new "Factory Default" for all future projects.
                </p>
                <textarea 
                    value={newShell}
                    onChange={(e) => setNewShell(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-900 rounded-lg p-3 text-xs text-amber-100 font-mono h-48 focus:border-amber-500 outline-none resize-y mb-4"
                    placeholder='<!DOCTYPE html>...'
                />
                {newShell && (
                    <CodeBlock label="Canvas Update Prompt" code={updateShellPrompt} height="h-32" />
                )}
            </div>
        ) : (
            <div>
                <p className="text-slate-400 mb-4 text-sm">
                This is your <strong>Golden Master</strong>. Copy this to start any new project.
                </p>
                <CodeBlock label="Master Shell (index.html)" code={MASTER_SHELL} height="h-64"/>
            </div>
        )}
      </div>
    </div>
  );
};

// --- BATCH HARVESTER COMPONENT ---
const BatchHarvester = ({ onImport }) => {
  const [input, setInput] = useState("");
  const [scanned, setScanned] = useState([]);
  const [selected, setSelected] = useState({});

  // --- V7: GAP PARSER ---
  // Instead of counting braces, we capture lines between known function headers.
  // This is safer for "Monolith" files where formatting is consistent line-by-line.
  const extractScriptBlocks = (fullSource, prefix) => {
    if (!prefix) return "";
    
    const lines = fullSource.split('\n');
    const capturedLines = [];
    let capturing = false;
    let braceCount = 0;
    
    // We look for start of function/var definitions with the specific prefix
    const startRegex = new RegExp(`^(function|const|let|var)\\s+${prefix}`);
    // We look for the start of ANY function/var (to know when to stop if logic fails)
    const genericStartRegex = new RegExp(`^(function|const|let|var)\\s+`);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]; // Keep whitespace for safety
        const trimmed = line.trim();
        
        // Check if this line starts a relevant block
        if (startRegex.test(trimmed)) {
            capturing = true;
        }
        
        // If we hit a NEW function that DOESN'T match our prefix, 
        // and our braces are balanced (0), we stop.
        // If braces aren't balanced, it might be a nested function, so we keep going.
        if (capturing && genericStartRegex.test(trimmed) && !startRegex.test(trimmed) && braceCount === 0) {
            capturing = false;
        }

        if (capturing) {
            capturedLines.push(line);
            
            // Simple brace tracking to help know when we are "safe" to stop
            // We strip quotes to avoid counting braces inside strings
            const safeLine = trimmed.replace(/"[^"]*"/g, '').replace(/'[^']*'/g, '').replace(/`[^`]*`/g, '');
            const open = (safeLine.match(/{/g) || []).length;
            const close = (safeLine.match(/}/g) || []).length;
            braceCount += (open - close);
        }
    }
    
    return capturedLines.join('\n');
  };

  const scanMonolith = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, "text/html");
      
      // Grab script logic (usually at the end)
      const scripts = Array.from(doc.querySelectorAll("script"));
      // Combine all scripts just in case
      const fullScript = scripts.map(s => s.textContent).join('\n\n');
      
      // Find all views
      const views = Array.from(doc.querySelectorAll('[id^="view-"]'));
      const navItems = Array.from(doc.querySelectorAll('.nav-item'));

      const results = views.map((view) => {
        const id = view.id;
        const shortId = id.replace('view-', '');
        
        // 1. Find Title
        let title = shortId.toUpperCase();
        const navBtn = navItems.find(btn => {
            const onClick = btn.getAttribute('onclick') || "";
            return onClick.includes(`'${shortId}'`) || onClick.includes(`"${shortId}"`) || btn.id === `nav-${shortId}`;
        });
        if (navBtn) title = navBtn.innerText.trim();

        // 2. Identify Prefix
        const outerHtml = view.outerHTML;
        const prefixMatch = outerHtml.match(/onclick="([a-zA-Z0-9]+)_[a-zA-Z0-9]+\(/);
        const prefix = prefixMatch ? prefixMatch[1] + '_' : null;

        // 3. Extract Script
        let script = "";
        if (prefix) {
            script = extractScriptBlocks(fullScript, prefix);
        } else if (id === 'view-materials') {
            // Manual fallback for materials
            const match = fullScript.match(/function openPDF[\s\S]*?closeViewer[\s\S]*?}/);
            if(match) script = match[0];
        }

        return { 
            id: id, 
            title: title, 
            html: view.innerHTML.trim(), 
            script: script, 
            selected: true 
        };
      });

      setScanned(results);
      const selObj = {};
      results.forEach((_, i) => selObj[i] = true);
      setSelected(selObj);

    } catch (e) {
      alert("Error parsing HTML: " + e.message);
    }
  };

  const handleImport = () => {
    const toImport = scanned.filter((_, i) => selected[i]);
    onImport(toImport);
    setScanned([]);
    setInput("");
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 mb-8">
      <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-500/50">
        <h3 className="text-sm font-bold text-indigo-400 mb-2 flex items-center gap-2"><Database size={16}/> Batch Monolith Importer (V7-GapParser)</h3>
        <p className="text-xs text-slate-400 mb-4">Paste the full <code className="bg-slate-800 px-1 rounded">index.html</code> code below. This version uses line-by-line Gap Parsing to safely extract code blocks.</p>
        
        {scanned.length === 0 ? (
            <>
                <textarea 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 font-mono h-48 focus:border-indigo-500 outline-none resize-y mb-4" 
                    placeholder="<!DOCTYPE html>..."
                />
                <button onClick={scanMonolith} disabled={!input} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg text-xs disabled:opacity-50">Scan Code</button>
            </>
        ) : (
            <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-2 pr-2 custom-scroll bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                    {scanned.map((item, idx) => (
                        <label key={idx} className="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-800 cursor-pointer hover:border-indigo-500 transition-colors group">
                            <input 
                                type="checkbox" 
                                checked={!!selected[idx]} 
                                onChange={(e) => setSelected({...selected, [idx]: e.target.checked})}
                                className="mt-1"
                            />
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">{item.title}</div>
                                    <div className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${item.script.length > 50 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/30 text-rose-400'}`}>
                                        {item.script.length > 50 ? 'JS Found' : 'No JS / Global'}
                                    </div>
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono mt-1">{item.id}</div>
                                {item.script.length > 0 && (
                                    <div className="mt-2 p-2 bg-black/50 rounded text-[9px] font-mono text-slate-600 truncate border border-slate-800">
                                        {item.script.substring(0, 100).replace(/\n/g, ' ')}...
                                    </div>
                                )}
                            </div>
                        </label>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setScanned([])} className="flex-1 bg-slate-800 text-slate-400 py-3 rounded-lg text-xs font-bold hover:bg-slate-700 hover:text-white transition-colors">Cancel</button>
                    <button onClick={handleImport} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-colors">Import {Object.values(selected).filter(x=>x).length} Modules</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// ðŸ›¡ï¸ THE BULLETPROOF VEST: Cleans up messy AI output or raw text input
const sanitizeImportData = (input) => {
  let cleanData = [];
  try {
    // 1. Try to parse as JSON first (AI Path)
    let jsonString = input.trim().replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '');
    const parsed = JSON.parse(jsonString);
    const rawArray = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || []);

    cleanData = rawArray.map(q => {
      const questionText = String(q.question || q.q || "Untitled Question");
      const optionsArray = Array.isArray(q.options) ? q.options.map(opt => String(opt || '')) : [];
      const hasOptions = optionsArray.length > 0;
      
      return {
        type: hasOptions ? 'multiple-choice' : 'long-answer',
        question: questionText,
        options: optionsArray,
        // Fix Answer Index: Convert "A" to 0 (only for multiple-choice)
        correct: hasOptions 
          ? ((typeof q.correct === 'string') 
              ? (isNaN(q.correct) ? q.correct.toUpperCase().charCodeAt(0) - 65 : parseInt(q.correct)) 
              : (q.correct || 0))
          : 0
      };
    });
    return { data: cleanData, success: true };
  } catch (e) {
    // 2. Fall back to "Smart Text Parser" (Regex Path)
    const lines = input.split('\n').filter(l => l.trim());
    const questions = [];
    let current = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      // Match "1. " or "Q1."
      if (/^(Q?\d+[\.)]|Question\s+\d+)/i.test(trimmed)) {
        if(current) questions.push(current);
        current = { 
          type: 'long-answer', // Default to long-answer, will change if options found
          question: trimmed.replace(/^(Q?\d+[\.)]|Question\s+\d+)\s*/, ''), 
          options: [], 
          correct: 0 
        };
      } 
      // Match "a. " or "- " (multiple choice options)
      else if (/^[a-d][\.)\)]\s/i.test(trimmed) || trimmed.startsWith('- ')) {
        if(current) {
          if(current.options.length === 0) current.type = 'multiple-choice';
          current.options.push(trimmed.replace(/^[a-d][\.)\)]\s/i, '').replace(/^- \s/, ''));
        }
      }
      // Match "Answer: A"
      else if (/^(ans|answer|correct):\s*([a-d])/i.test(trimmed) && current) {
        current.correct = trimmed.match(/([a-d])/i)[1].toUpperCase().charCodeAt(0) - 65;
      }
      // Append loose text to question (if no options yet, it's part of the question)
      else if (current) {
        if (current.options.length === 0) {
          current.question += " " + trimmed;
        }
      }
    });
    if(current) questions.push(current);
    return { data: questions, success: questions.length > 0 };
  }
};

const Phase1 = ({ projectData, setProjectData, scannerNotes, setScannerNotes, addMaterial, editMaterial, deleteMaterial, moveMaterial, toggleMaterialHidden, addAssessment, editAssessment, deleteAssessment, moveAssessment, toggleAssessmentHidden, addQuestionToMaster, moveQuestion, deleteQuestion, updateQuestion, clearMasterAssessment, masterQuestions, setMasterQuestions, masterAssessmentTitle, setMasterAssessmentTitle, currentQuestionType, setCurrentQuestionType, currentQuestion, setCurrentQuestion, editingQuestion, setEditingQuestion, generateMixedAssessment, generatedAssessment, setGeneratedAssessment, assessmentType, setAssessmentType, assessmentTitle, setAssessmentTitle, quizQuestions, setQuizQuestions, printInstructions, setPrintInstructions, editingAssessment, setEditingAssessment, migrateCode, setMigrateCode, migratePrompt, setMigratePrompt, migrateOutput, setMigrateOutput }) => {
  const [harvestType, setHarvestType] = useState('MODULE_MANAGER'); // 'FEATURE', 'ASSET', 'ASSESSMENT', 'AI_MODULE', 'MODULE_MANAGER'
  const [mode, setMode] = useState('B');
  const [importInput, setImportInput] = useState("");
  const [importPreview, setImportPreview] = useState([]); 
  
  // MODULE MANAGER STATE
  const [moduleManagerType, setModuleManagerType] = useState('standalone'); // 'standalone' | 'external'
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

  // Assessment override colors (Phase 1 Edit modal) — "Use course default" + common colors
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
            ðŸ”„ Reset
          </button>
          <button type="button" onclick="${quizId}_generateReport()" class="${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold py-3 px-6 rounded-lg flex items-center gap-2">
            ðŸ–¨ï¸ Print & Submit
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
      setModuleManagerMessage(`âœ… Module "${title}" added successfully! It will run in an isolated iframe.`);
      
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
        url: moduleManagerURL,
        linkType: moduleManagerLinkType,
        // Initialize history with version 1 (original state)
        history: [{
          timestamp: new Date().toISOString(),
          title: moduleManagerTitle || moduleId.replace('view-', '').replace(/-/g, ' '),
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
      setModuleManagerMessage(`âœ… External link module "${newModule.title}" added successfully!`);
      
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
             console.log('âœ… ${divId} module loaded');
         });
     } else {
         console.log('âœ… ${divId} module loaded');
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
                                                alert("âœ… Question added to Master Assessment!");
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
                                                alert("âœ… Question added to Master Assessment!");
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
                                        ðŸ’¡ <strong>Tip:</strong> Add all your questions here, then go to the "Master Assessment" tab to organize them and generate the final assessment.
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
                                                    alert("âŒ Error adding assessment. Please try again.");
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
                                                        generatedId: parsed.id || null
                                                    });
                                                    alert("Assessment added successfully! Switching to Manage tab...");
                                                    setGeneratedAssessment("");
                                                    setMasterAssessmentTitle("");
                                                    setMasterQuestions([]);
                                                    setMode('MANAGE');
                                                } catch(e) {
                                                    alert("âŒ Error adding assessment. Please try again.");
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

                                        return assessments.sort((a, b) => a.order - b.order).map((assess) => (
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
                                        ));
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

                                {/* EDIT QUESTION MODAL */}
                                {editingQuestion && (
                                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingQuestion(null)}>
                                        <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                    <PenTool size={20} className="text-purple-400" />
                                                    Edit Question
                                                </h3>
                                                <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-white transition-colors">
                                                    <X size={24} />
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Question</label>
                                                    <textarea 
                                                        value={editingQuestion.question}
                                                        onChange={(e) => setEditingQuestion({...editingQuestion, question: e.target.value})}
                                                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm h-24 resize-none"
                                                    />
                                                </div>

                                                {editingQuestion.type === 'multiple-choice' && (
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Answer Options</label>
                                                        <div className="space-y-2">
                                                            {editingQuestion.options.map((opt, idx) => (
                                                                <div key={idx} className="flex items-center gap-2">
                                                                    <input 
                                                                        type="radio"
                                                                        name="edit-correct"
                                                                        checked={editingQuestion.correct === idx}
                                                                        onChange={() => setEditingQuestion({...editingQuestion, correct: idx})}
                                                                        className="w-4 h-4"
                                                                    />
                                                                    <input 
                                                                        type="text"
                                                                        value={opt}
                                                                        onChange={(e) => {
                                                                            const newOptions = [...editingQuestion.options];
                                                                            newOptions[idx] = e.target.value;
                                                                            setEditingQuestion({...editingQuestion, options: newOptions});
                                                                        }}
                                                                        placeholder={`Option ${idx + 1}`}
                                                                        className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex gap-3 pt-4">
                                                    <button 
                                                        onClick={() => setEditingQuestion(null)}
                                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            updateQuestion(editingQuestion.id, {
                                                                question: editingQuestion.question,
                                                                options: editingQuestion.options,
                                                                correct: editingQuestion.correct
                                                            });
                                                            setEditingQuestion(null);
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
                                                if (window.confirm('âš ï¸ WARNING: This will permanently delete ALL your course data including:\n\nâ€¢ Course settings\nâ€¢ All modules\nâ€¢ All assessments\nâ€¢ All materials\n\nAre you sure you want to continue?')) {
                                                    if (window.confirm('ðŸš¨ FINAL CONFIRMATION: Type "DELETE" in the next prompt to confirm.\n\nClick OK to proceed with deletion.')) {
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
                                                            alert('âœ… All data cleared! The page will now reload.');
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
                                            <p className="text-xs font-bold text-amber-300 mb-1">â­ For Mixed Types (Recommended):</p>
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
                                                                                {q.correct === oIdx && <span className="text-[10px] text-emerald-400">âœ“</span>}
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
                                                type: q.type || (q.options.length > 0 ? 'multiple-choice' : 'long-answer'),
                                                question: q.question,
                                                options: q.options || [],
                                                correct: q.correct || 0
                                            }));
                                            setMasterQuestions(prev => [...prev, ...formattedQuestions]);
                                            const mcCount = formattedQuestions.filter(q => q.type === 'multiple-choice').length;
                                            const laCount = formattedQuestions.filter(q => q.type === 'long-answer').length;
                                            alert(`âœ… Imported ${formattedQuestions.length} questions! (${mcCount} multiple-choice, ${laCount} long-answer)`);
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
                            <input 
                                type="text"
                                value={materialForm.viewUrl}
                                onChange={(e) => setMaterialForm({...materialForm, viewUrl: e.target.value})}
                                placeholder="View/Embed URL (Google Drive /preview link)"
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs mb-2"
                            />
                            <input 
                                type="text"
                                value={materialForm.downloadUrl}
                                onChange={(e) => setMaterialForm({...materialForm, downloadUrl: e.target.value})}
                                placeholder="Download URL (Google Drive /view link)"
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs mb-3"
                            />
                            
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
                                            âœ“ Your code runs AS-IS in an isolated iframe - no modifications needed!
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
                                                    <span className="font-bold">{linkTestResult.success ? 'âœ“' : 'âœ—'}</span>
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
                                <h4 className="text-xs font-bold text-sky-400 uppercase mb-2">ðŸ’¡ Module Types</h4>
                                <ul className="text-[10px] text-slate-400 space-y-1 leading-relaxed">
                                    <li><strong className="text-sky-300">Standalone HTML:</strong> Complete HTML file (like HSS3020). CSS auto-scoped, wrapped in view container.</li>
                                    <li><strong className="text-sky-300">External Link:</strong> Link to hosted module. Choose iframe (embedded) or new tab (external).</li>
                                    <li>âœ… Modules appear in sidebar navigation</li>
                                    <li>âœ… Can be hidden/shown in Phase 2</li>
                                    <li>âœ… Included in compiled site</li>
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
           console.log('âœ… [feature-name] loaded');
       });
   } else {
       console.log('âœ… [feature-name] loaded');
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
                            <div className="flex gap-2 mb-6"><button onClick={() => handleSessionSave()} disabled={!stagingJson || !stagingTitle} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs shadow-lg"><Zap size={14} /> âš¡ Add to Session (Instant)</button></div>
                        <div className="pt-4 border-t border-emerald-800/50"><div className="flex items-center justify-between mb-2"><p className="text-[10px] text-emerald-400/60 uppercase font-bold">Optional: Hard Save</p><span className="text-[9px] text-emerald-600 bg-emerald-950/50 px-2 py-0.5 rounded">Only do this once at the end</span></div><CodeBlock label="Permanent Save Prompt (Use Sparingly)" code={saveToDocPrompt} height="h-24" /></div>
                    </div>
                </div>
                )}
             </>
            )}
        </>
        )}
      </div>
    </div>
  );
};

const Phase2 = ({ projectData, setProjectData, editMaterial, onEdit, onPreview, onDelete, onToggleHidden, deleteMaterial, deleteAssessment, toggleMaterialHidden, toggleAssessmentHidden }) => {
  const [sourceType, setSourceType] = useState('MODULE'); // 'MODULE', 'ASSESSMENT', 'MATERIAL', or 'FEATURE'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [materialPreview, setMaterialPreview] = useState(null);
  const [materialEdit, setMaterialEdit] = useState(null);
  const [assessmentPreview, setAssessmentPreview] = useState(null);
  const [assessmentEdit, setAssessmentEdit] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]); // Array of item IDs for bulk operations
  
  const currentCourse = projectData["Current Course"]?.modules || [];
  const globalToolkit = projectData["Global Toolkit"] || [];
  const courseMaterials = projectData["Current Course"]?.materials || [];
  const allAssessments = currentCourse.flatMap(m => (m.assessments || []).map(a => ({...a, moduleName: m.title})));
  
  const items = sourceType === 'MODULE' ? currentCourse 
                : sourceType === 'FEATURE' ? globalToolkit 
                : sourceType === 'ASSESSMENT' ? allAssessments
                : sourceType === 'MATERIAL' ? courseMaterials
                : [];
  
  // Filter items based on search query
  const filteredItems = items.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreview = (index) => {
    const item = filteredItems[index];
    setSelectedItem(item);
    
    // Show material preview modal
    if (sourceType === 'MATERIAL') {
      setMaterialPreview(item);
      return;
    }
    if (sourceType === 'ASSESSMENT') {
      setAssessmentPreview(item);
      return;
    }
    
    if (onPreview) {
      onPreview(item);
    }
  };

  const handleEdit = (index) => {
    const item = filteredItems[index];
    
    // Show material edit modal
    if (sourceType === 'MATERIAL') {
      setMaterialEdit(item);
      return;
    }
    if (sourceType === 'ASSESSMENT') {
      setAssessmentEdit(item);
      return;
    }
    
    if (onEdit) {
      onEdit(item);
    }
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

  const handleDelete = (index) => {
    const item = filteredItems[index];
    
    // Prevent deletion of protected modules
    if (isProtectedModule(item)) {
      alert('âš ï¸ Course Materials and Assessments are core modules and cannot be deleted.\n\nYou can hide them instead using the hide/show toggle.');
      return;
    }
    
    if (onDelete) {
      onDelete(item);
    }
  };

  const getCodeStats = (item) => {
    try {
      // Materials and Assessments don't have code property
      if (!item.code) {
        return { htmlLength: 0, scriptLength: 0, total: 0 };
      }
      const code = typeof item.code === 'string' ? JSON.parse(item.code) : item.code;
      const htmlLength = code.html?.length || 0;
      const scriptLength = code.script?.length || 0;
      return { htmlLength, scriptLength, total: htmlLength + scriptLength };
    } catch (e) {
      return { htmlLength: 0, scriptLength: 0, total: 0 };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Eye className="text-purple-400" /> Phase 2: Preview & Test
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Browse, preview, and test your modules and features before compiling.
        </p>

        {/* SOURCE TOGGLE */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700 mb-4">
            <button 
                onClick={() => { setSourceType('MODULE'); setSearchQuery(""); setSelectedItem(null); }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all ${sourceType === 'MODULE' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Box size={14} /> Modules ({currentCourse.length})
            </button>
            <button 
                onClick={() => { setSourceType('ASSESSMENT'); setSearchQuery(""); setSelectedItem(null); }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all ${sourceType === 'ASSESSMENT' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <CheckCircle size={14} /> Assessments
            </button>
            <button 
                onClick={() => { setSourceType('MATERIAL'); setSearchQuery(""); setSelectedItem(null); }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all ${sourceType === 'MATERIAL' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <FolderOpen size={14} /> Materials
            </button>
            <button 
                onClick={() => { setSourceType('FEATURE'); setSearchQuery(""); setSelectedItem(null); }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all ${sourceType === 'FEATURE' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Wrench size={14} /> Toolkit ({globalToolkit.length})
            </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-6">
            <Search size={16} className="absolute left-3 top-3 text-slate-500" />
            <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or ID..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
            />
        </div>

        {/* BULK ACTIONS TOOLBAR */}
        {selectedItems.length > 0 && (
            <div className="mb-4 p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-amber-400">
                        {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                    </span>
                    <button
                        onClick={() => setSelectedItems([])}
                        className="text-xs text-slate-400 hover:text-white"
                    >
                        Clear Selection
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {(sourceType === 'MODULE' || sourceType === 'MATERIAL' || sourceType === 'ASSESSMENT') && (
                        <>
                            <button
                                onClick={() => {
                                    if (sourceType === 'MODULE') {
                                        // Batch update all modules at once
                                        setProjectData(prev => {
                                            const modules = prev["Current Course"]?.modules || [];
                                            const updated = modules.map(m => {
                                                if (selectedItems.includes(m.id) && !isProtectedModule(m) && !m.hidden) {
                                                    return { ...m, hidden: true };
                                                }
                                                return m;
                                            });
                                            return {
                                                ...prev,
                                                "Current Course": {
                                                    ...prev["Current Course"],
                                                    modules: updated
                                                }
                                            };
                                        });
                                    } else if (sourceType === 'MATERIAL') {
                                        // Batch update materials
                                        setProjectData(prev => {
                                            const materials = prev["Current Course"]?.materials || [];
                                            const updated = materials.map(m => {
                                                if (selectedItems.includes(m.id) && !(m.hidden === true)) {
                                                    return { ...m, hidden: true };
                                                }
                                                return m;
                                            });
                                            return {
                                                ...prev,
                                                "Current Course": {
                                                    ...prev["Current Course"],
                                                    materials: updated
                                                }
                                            };
                                        });
                                    } else if (sourceType === 'ASSESSMENT') {
                                        // Batch update assessments
                                        setProjectData(prev => {
                                            const modules = prev["Current Course"]?.modules || [];
                                            const assessmentsModule = modules.find(m => 
                                                m.id === 'item-assessments' || m.title === 'Assessments'
                                            );
                                            if (assessmentsModule) {
                                                const assessments = assessmentsModule.assessments || [];
                                                const updated = assessments.map(a => {
                                                    if (selectedItems.includes(a.id) && !(a.hidden === true)) {
                                                        return { ...a, hidden: true };
                                                    }
                                                    return a;
                                                });
                                                const updatedModules = modules.map(m => 
                                                    (m.id === 'item-assessments' || m.title === 'Assessments')
                                                        ? { ...m, assessments: updated }
                                                        : m
                                                );
                                                return {
                                                    ...prev,
                                                    "Current Course": {
                                                        ...prev["Current Course"],
                                                        modules: updatedModules
                                                    }
                                                };
                                            }
                                            return prev;
                                        });
                                    }
                                    setSelectedItems([]);
                                }}
                                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition-colors flex items-center gap-1"
                            >
                                <EyeOff size={12} /> Hide Selected
                            </button>
                            <button
                                onClick={() => {
                                    if (sourceType === 'MODULE') {
                                        // Batch update all modules at once
                                        setProjectData(prev => {
                                            const modules = prev["Current Course"]?.modules || [];
                                            const updated = modules.map(m => {
                                                if (selectedItems.includes(m.id) && m.hidden) {
                                                    return { ...m, hidden: false };
                                                }
                                                return m;
                                            });
                                            return {
                                                ...prev,
                                                "Current Course": {
                                                    ...prev["Current Course"],
                                                    modules: updated
                                                }
                                            };
                                        });
                                    } else if (sourceType === 'MATERIAL') {
                                        // Batch update materials
                                        setProjectData(prev => {
                                            const materials = prev["Current Course"]?.materials || [];
                                            const updated = materials.map(m => {
                                                if (selectedItems.includes(m.id) && m.hidden === true) {
                                                    return { ...m, hidden: false };
                                                }
                                                return m;
                                            });
                                            return {
                                                ...prev,
                                                "Current Course": {
                                                    ...prev["Current Course"],
                                                    materials: updated
                                                }
                                            };
                                        });
                                    } else if (sourceType === 'ASSESSMENT') {
                                        // Batch update assessments
                                        setProjectData(prev => {
                                            const modules = prev["Current Course"]?.modules || [];
                                            const assessmentsModule = modules.find(m => 
                                                m.id === 'item-assessments' || m.title === 'Assessments'
                                            );
                                            if (assessmentsModule) {
                                                const assessments = assessmentsModule.assessments || [];
                                                const updated = assessments.map(a => {
                                                    if (selectedItems.includes(a.id) && a.hidden === true) {
                                                        return { ...a, hidden: false };
                                                    }
                                                    return a;
                                                });
                                                const updatedModules = modules.map(m => 
                                                    (m.id === 'item-assessments' || m.title === 'Assessments')
                                                        ? { ...m, assessments: updated }
                                                        : m
                                                );
                                                return {
                                                    ...prev,
                                                    "Current Course": {
                                                        ...prev["Current Course"],
                                                        modules: updatedModules
                                                    }
                                                };
                                            }
                                            return prev;
                                        });
                                    }
                                    setSelectedItems([]);
                                }}
                                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition-colors flex items-center gap-1"
                            >
                                <Eye size={12} /> Show Selected
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => {
                            if (confirm(`Delete ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''}? This cannot be undone.`)) {
                                if (sourceType === 'MODULE') {
                                    // Batch delete modules directly
                                    setProjectData(prev => {
                                        const modules = prev["Current Course"]?.modules || [];
                                        const updated = modules.filter(m => 
                                            !selectedItems.includes(m.id) || isProtectedModule(m)
                                        );
                                        return {
                                            ...prev,
                                            "Current Course": {
                                                ...prev["Current Course"],
                                                modules: updated
                                            }
                                        };
                                    });
                                } else if (sourceType === 'MATERIAL' && deleteMaterial) {
                                    // Batch delete materials
                                    setProjectData(prev => {
                                        const materials = prev["Current Course"]?.materials || [];
                                        const updated = materials.filter(m => !selectedItems.includes(m.id));
                                        return {
                                            ...prev,
                                            "Current Course": {
                                                ...prev["Current Course"],
                                                materials: updated
                                            }
                                        };
                                    });
                                } else if (sourceType === 'ASSESSMENT' && deleteAssessment) {
                                    // Batch delete assessments
                                    const assessmentsModule = projectData["Current Course"]?.modules?.find(m => 
                                        m.id === 'item-assessments' || m.title === 'Assessments'
                                    );
                                    if (assessmentsModule) {
                                        const assessments = assessmentsModule.assessments || [];
                                        const updated = assessments.filter(a => !selectedItems.includes(a.id));
                                        setProjectData(prev => {
                                            const modules = prev["Current Course"]?.modules || [];
                                            const updatedModules = modules.map(m => 
                                                (m.id === 'item-assessments' || m.title === 'Assessments')
                                                    ? { ...m, assessments: updated }
                                                    : m
                                            );
                                            return {
                                                ...prev,
                                                "Current Course": {
                                                    ...prev["Current Course"],
                                                    modules: updatedModules
                                                }
                                            };
                                        });
                                    }
                                } else if (sourceType === 'FEATURE' && onDelete) {
                                    // Batch delete toolkit items
                                    setProjectData(prev => {
                                        const tools = prev["Global Toolkit"] || [];
                                        const updated = tools.filter(t => !selectedItems.includes(t.id));
                                        return {
                                            ...prev,
                                            "Global Toolkit": updated
                                        };
                                    });
                                }
                                
                                setSelectedItems([]);
                            }
                        }}
                        className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded transition-colors flex items-center gap-1"
                    >
                        <Trash2 size={12} /> Delete Selected
                    </button>
                </div>
            </div>
        )}

        {/* MODULE/FEATURE GRID */}
        {filteredItems.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 border border-slate-700 rounded-xl">
                <Box size={48} className="mx-auto text-slate-700 mb-4" />
                <p className="text-slate-400 text-sm mb-2">
                    {searchQuery ? 'No items match your search' : `No ${sourceType === 'MODULE' ? 'modules' : 'features'} yet`}
                </p>
                <p className="text-slate-600 text-xs">
                    {!searchQuery && 'Go to Phase 1: Harvest to create some!'}
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item, idx) => {
                    const stats = getCodeStats(item);
                    const originalIndex = items.findIndex(i => i.id === item.id);
                    
                    return (
                        <div 
                            key={item.id} 
                            className={`bg-slate-900 border rounded-lg p-4 hover:border-purple-500/50 transition-all group ${
                                selectedItems.includes(item.id) 
                                    ? 'border-amber-500 bg-amber-900/10' 
                                    : 'border-slate-700'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(item.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedItems([...selectedItems, item.id]);
                                            } else {
                                                setSelectedItems(selectedItems.filter(id => id !== item.id));
                                            }
                                        }}
                                        className="mt-1 w-4 h-4 text-amber-600 bg-slate-800 border-slate-600 rounded focus:ring-amber-500 focus:ring-2"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-bold text-sm truncate mb-1">{item.title}</h3>
                                        <p className="text-xs text-slate-500 font-mono truncate">{item.id}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${sourceType === 'MODULE' ? 'bg-purple-900/30 text-purple-400' : 'bg-orange-900/30 text-orange-400'}`}>
                                    {sourceType === 'MODULE' ? 'Module' : 'Feature'}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">
                                <FileCode size={12} />
                                <span>{(stats.total / 1024).toFixed(1)} KB</span>
                                <span className="text-slate-700">â€¢</span>
                                <span>{stats.htmlLength > 0 ? 'Has HTML' : 'No HTML'}</span>
                                <span className="text-slate-700">â€¢</span>
                                <span>{stats.scriptLength > 0 ? 'Has Script' : 'No Script'}</span>
                            </div>

                            {item.section && (
                                <div className="mb-3">
                                    <span className="text-xs bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-400">
                                        {item.section}
                                    </span>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handlePreview(idx)}
                                    className="flex-1 flex items-center justify-center gap-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 rounded transition-colors"
                                >
                                    <Eye size={12} /> Preview
                                </button>
                                <button 
                                    onClick={() => handleEdit(idx)}
                                    className="flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-2 rounded transition-colors"
                                    title="Edit"
                                >
                                    <PenTool size={12} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(idx)}
                                    disabled={isProtectedModule(item)}
                                    className={`flex items-center justify-center gap-1 text-white text-xs font-bold px-3 py-2 rounded transition-colors ${
                                        isProtectedModule(item) 
                                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50' 
                                            : 'bg-slate-700 hover:bg-rose-600'
                                    }`}
                                    title={isProtectedModule(item) ? 'Core modules cannot be deleted. Hide them instead.' : 'Delete'}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                            
                            {/* Protected Module Indicator */}
                            {isProtectedModule(item) && (
                                <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-400">
                                    <Lock size={10} />
                                    <span>Core module (cannot be deleted)</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        )}
      </div>
      
      {/* MATERIAL PREVIEW MODAL */}
      {materialPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setMaterialPreview(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Eye size={20} className="text-cyan-400" />
                  Material Preview: {materialPreview.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{materialPreview.description}</p>
              </div>
              <button onClick={() => setMaterialPreview(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {materialPreview.viewUrl && (
        <div className="mb-6">
                  <div className="bg-black rounded-lg border border-slate-700 overflow-hidden">
                    <iframe 
                      src={materialPreview.viewUrl.replace('/view', '/preview')} 
                      width="100%" 
                      height="600" 
                      style={{border: 'none'}}
                      title={materialPreview.title}
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Number</span>
                  <p className="text-white">{materialPreview.number || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Color</span>
                  <p className="text-white capitalize">{materialPreview.color || 'slate'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">View URL</span>
                  <p className="text-cyan-400 text-xs break-all">{materialPreview.viewUrl || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Download URL</span>
                  <p className="text-cyan-400 text-xs break-all">{materialPreview.downloadUrl || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Digital Content</span>
                  {materialPreview.digitalContent ? (
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-2 px-2 py-1 bg-emerald-900/50 text-emerald-400 text-xs rounded font-bold">
                        Enabled - {materialPreview.digitalContent.chapters?.length || 0} Chapters
                      </span>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs">Not configured</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => {
                    setMaterialPreview(null);
                    setMaterialEdit(materialPreview);
                  }}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <PenTool size={16} /> Edit Material
                </button>
                {materialPreview.downloadUrl && (
                  <a 
                    href={materialPreview.downloadUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Download size={16} /> Download
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* MATERIAL EDIT MODAL */}
      {materialEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setMaterialEdit(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PenTool size={20} className="text-cyan-400" />
                Edit Material
              </h3>
              <button onClick={() => setMaterialEdit(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Number</label>
                    <input 
                      type="text"
                      value={materialEdit.number || ''}
                      onChange={(e) => setMaterialEdit({...materialEdit, number: e.target.value})}
                      placeholder="e.g., 05"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Color</label>
            <select 
                      value={materialEdit.color || 'slate'}
                      onChange={(e) => setMaterialEdit({...materialEdit, color: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm"
                    >
                      <option value="slate">Gray</option>
                      <option value="rose">Red</option>
                      <option value="amber">Orange</option>
                      <option value="emerald">Green</option>
                      <option value="sky">Blue</option>
                      <option value="purple">Purple</option>
            </select>
                  </div>
        </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Title</label>
                  <input 
                    type="text"
                    value={materialEdit.title || ''}
                    onChange={(e) => setMaterialEdit({...materialEdit, title: e.target.value})}
                    placeholder="Material title"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
                  <input 
                    type="text"
                    value={materialEdit.description || ''}
                    onChange={(e) => setMaterialEdit({...materialEdit, description: e.target.value})}
                    placeholder="Brief description"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">View URL</label>
                  <input 
                    type="text"
                    value={materialEdit.viewUrl || ''}
                    onChange={(e) => setMaterialEdit({...materialEdit, viewUrl: e.target.value})}
                    placeholder="Google Drive /preview or /view link"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-xs font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Download URL</label>
                  <input 
                    type="text"
                    value={materialEdit.downloadUrl || ''}
                    onChange={(e) => setMaterialEdit({...materialEdit, downloadUrl: e.target.value})}
                    placeholder="Google Drive /view link"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-xs font-mono"
                  />
                </div>
                
                {/* Digital Content */}
                <div className="p-4 bg-black/30 rounded-lg border border-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input 
                      type="checkbox"
                      checked={!!materialEdit.digitalContent}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setMaterialEdit({...materialEdit, digitalContent: materialEdit.digitalContent || {}, digitalContentJson: materialEdit.digitalContentJson || ''});
                        } else {
                          setMaterialEdit({...materialEdit, digitalContent: null, digitalContentJson: ''});
                        }
                      }}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-600"
                    />
                    <span className="text-xs font-bold text-emerald-400 uppercase">Enable Digital Resource</span>
                  </label>
                  {materialEdit.digitalContent && (
                    <div>
                      <p className="text-[10px] text-slate-500 mb-2">Paste JSON content for a themed, readable digital version</p>
                      <textarea
                        value={materialEdit.digitalContentJson || (materialEdit.digitalContent ? JSON.stringify(materialEdit.digitalContent, null, 2) : '')}
                        onChange={(e) => {
                          const json = e.target.value;
                          try {
                            if (json.trim()) {
                              const parsed = JSON.parse(json);
                              setMaterialEdit({...materialEdit, digitalContent: parsed, digitalContentJson: json});
                            } else {
                              setMaterialEdit({...materialEdit, digitalContentJson: json});
                            }
                          } catch(err) {
                            setMaterialEdit({...materialEdit, digitalContentJson: json});
                          }
                        }}
                        placeholder='{"title": "My Resource", "chapters": [...]}'
                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-xs font-mono h-40 resize-none"
                      />
                      {materialEdit.digitalContentJson && (
                        <div className="mt-2">
                          {(() => {
                            try {
                              const parsed = JSON.parse(materialEdit.digitalContentJson);
                              const chapterCount = parsed.chapters?.length || 0;
                              const sectionCount = parsed.chapters?.reduce((acc, ch) => acc + (ch.sections?.length || 0), 0) || 0;
                              return <p className="text-[10px] text-emerald-400">Valid JSON: {chapterCount} chapter{chapterCount !== 1 ? 's' : ''}, {sectionCount} section{sectionCount !== 1 ? 's' : ''}</p>;
                            } catch(e) {
                              return <p className="text-[10px] text-rose-400">Invalid JSON: {e.message}</p>;
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setMaterialEdit(null)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (editMaterial) {
                        editMaterial(materialEdit.id, materialEdit);
                      }
                      setMaterialEdit(null);
                    }}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ASSESSMENT PREVIEW MODAL */}
      {assessmentPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setAssessmentPreview(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Eye size={20} className="text-blue-400" />
                  Assessment Preview: {assessmentPreview.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Interactive preview with full functionality</p>
              </div>
              <button onClick={() => setAssessmentPreview(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-0 max-h-[calc(90vh-80px)] overflow-y-auto">
              <iframe 
                srcDoc={(() => {
                  // Sanitize assessment content for preview
                  const safeHtml = assessmentPreview.html || '<p class="text-slate-500">No HTML content</p>';
                  const safeScript = cleanModuleScript(assessmentPreview.script || '');
                  return `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"><\/script><link href="https://fonts.googleapis.com/css?family=Inter:wght@400;700&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet"><style>body{background:#020617;color:#e2e8f0;font-family:'Inter',sans-serif;padding:20px;}.mono{font-family:'JetBrains Mono',monospace;}.score-btn{background:#0f172a;border:1px solid #1e293b;color:#64748b;transition:all 0.2s;}.score-btn:hover{border-color:#0ea5e9;color:white;}.score-btn.active{background:#0ea5e9;color:#000;font-weight:900;border-color:#0ea5e9;}.rubric-cell{cursor:pointer;transition:all 0.2s;border:1px solid transparent;}.rubric-cell:hover{background:rgba(255,255,255,0.05);}.active-proficient{background:rgba(16,185,129,0.2);border:1px solid #10b981;color:#10b981;}.active-developing{background:rgba(245,158,11,0.2);border:1px solid #f59e0b;color:#f59e0b;}.active-emerging{background:rgba(244,63,94,0.2);border:1px solid #f43f5e;color:#f43f5e;}</style></head><body>${safeHtml}<script>${safeScript}<\/script></body></html>`;
                })()}
                className="w-full border-0"
                style={{ minHeight: '600px' }}
                title={assessmentPreview.title || 'Assessment Preview'}
              />
            </div>
            
            <div className="bg-slate-800 border-t border-slate-700 p-4 flex justify-between items-center">
              <div className="text-xs text-slate-400">
                <strong className="text-white">Tip:</strong> This assessment will function exactly like this in your compiled site
              </div>
              <button 
                onClick={() => {
                  setAssessmentPreview(null);
                  setAssessmentEdit(assessmentPreview);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
              >
                <PenTool size={16} /> Edit Assessment
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ASSESSMENT EDIT MODAL */}
      {assessmentEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setAssessmentEdit(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PenTool size={20} className="text-blue-400" />
                Edit Assessment
              </h3>
              <button onClick={() => setAssessmentEdit(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 mb-4">
                <p className="text-xs text-amber-300">
                  <strong>Note:</strong> For complex edits, please use Phase 1's Assessment Builder. This editor is for quick title changes only.
                </p>
              </div>
              
              <div className="space-y-4">
                        <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Assessment Title</label>
                  <input 
                    type="text"
                    value={assessmentEdit.title || ''}
                    onChange={(e) => setAssessmentEdit({...assessmentEdit, title: e.target.value})}
                    placeholder="Assessment title"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm"
                  />
                        </div>
                
                <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Type</span>
                    <p className="text-white capitalize">{assessmentEdit.type || 'Quiz'}</p>
                        </div>
                        <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Question Count</span>
                    <p className="text-white">{assessmentEdit.questionCount || 'N/A'}</p>
                        </div>
                  <div className="col-span-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Assessment ID</span>
                    <p className="text-blue-400 text-xs font-mono">{assessmentEdit.id}</p>
                    </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setAssessmentEdit(null)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      // Update assessment in projectData
                      const assessmentsModule = projectData["Current Course"]?.modules?.find(m => m.id === "item-assessments" || m.title === "Assessments");
                      if (assessmentsModule) {
                        const updated = assessmentsModule.assessments.map(a => 
                          a.id === assessmentEdit.id ? { ...a, title: assessmentEdit.title } : a
                        );
                        const moduleIndex = projectData["Current Course"].modules.findIndex(m => m.id === assessmentsModule.id);
                        const newModules = [...projectData["Current Course"].modules];
                        newModules[moduleIndex] = { ...assessmentsModule, assessments: updated };
                        setProjectData({
                          ...projectData,
                          "Current Course": { ...projectData["Current Course"], modules: newModules }
                        });
                      }
                      setAssessmentEdit(null);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> Save Changes
                  </button>
                    </div>
            </div>
      </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Phase3 = ({ onGoToMaster, projectData, setProjectData }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "course_factory_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setUnlocked(true); // Unlock reset after download
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const restored = JSON.parse(e.target.result);
        setProjectData(restored);
        // alert("âœ… Project Restored Successfully!"); // Removed Alert
      } catch (error) {
        console.error("Invalid backup file", error);
      }
    };
    reader.readAsText(file);
  };

  const resetPrompt = `I need to reset the Course Factory for a new project.
Please modify the \`PROJECT_DATA\` variable at the top of the file.

**Task:**
1. Locate \`PROJECT_DATA\`.
2. Reset \`PROJECT_DATA["Current Course"].modules\` to empty \`[]\`.
3. Change \`name\` to "New Course".

**CRITICAL SAFETY INSTRUCTION:**
- Do NOT touch \`PROJECT_DATA["Global Toolkit"]\`. (Keep all saved features).
- Do NOT touch \`const MASTER_SHELL\`.
- Do NOT touch any React code.

**Expected Result:**
const PROJECT_DATA = {
  "Current Course": {
    name: "New Course",
    modules: [] // Cleared
  },
  "Global Toolkit": [
    ... // Kept intact
  ]
};`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen className="text-blue-400" /> Phase 3: Manage & Reset
        </h2>
        
        <div className="space-y-4">
            <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-700/50">
                <h3 className="text-sm font-bold text-blue-400 mb-2">1. Backup & Restore</h3>
                <div className="space-y-2">
                    <button 
                        onClick={handleDownload}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                    >
                        <Download size={16} /> Download Project Backup
                    </button>
                    <div className="relative">
                        <input 
                            type="file" 
                            accept=".json"
                            onChange={handleUpload}
                            id="restore-upload"
                            className="hidden"
                        />
                        <label 
                            htmlFor="restore-upload"
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                            <Upload size={16} /> Upload & Restore Backup
                        </label>
                    </div>
                </div>
            </div>

            <div className={`p-4 rounded-xl border transition-all duration-300 ${unlocked ? 'bg-rose-900/20 border-rose-700/50' : 'bg-slate-900 border-slate-800 opacity-50'}`}>
                <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-bold ${unlocked ? 'text-rose-400' : 'text-slate-500'}`}>2. Reset Project</h3>
                    {unlocked ? <Unlock size={16} className="text-rose-400"/> : <Lock size={16} className="text-slate-500"/>}
                </div>
                
                {unlocked && !confirmed && (
                    <div className="animate-in fade-in bg-rose-950/30 p-4 rounded-lg border border-rose-800">
                        <h4 className="text-rose-400 font-bold text-sm mb-2 flex items-center gap-2">
                            <AlertTriangle size={16}/> Final Safety Check
                        </h4>
                        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                            Did you update the <strong>Phase 0: Master Shell</strong> with any new features (like Dark Mode or Save Buttons) you built during this project?
                            <br/><br/>
                            If you Reset now without updating the Master Shell, those improvements will be lost.
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => onGoToMaster()} 
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-3 rounded border border-slate-700 flex items-center justify-center gap-2"
                            >
                                <ArrowRight size={14} className="rotate-180" /> No, Take me there
                            </button>
                            <button 
                                onClick={() => setConfirmed(true)} 
                                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-3 rounded shadow-lg shadow-rose-900/20"
                            >
                                Yes, I Updated It
                            </button>
                        </div>
                    </div>
                )}

                {unlocked && confirmed && (
                    <div className="animate-in fade-in">
                        <p className="text-xs text-rose-200/70 mb-4">
                            Copy this prompt to Canvas to wipe the Course Content.
                        </p>
                        <CodeBlock label="Canvas Safe Reset Prompt" code={resetPrompt} height="h-40" />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// Pure function to build site HTML - used by both Phase 2 preview and Phase 4 compile
const buildSiteHtml = ({ modules, toolkit, excludedIds = [], initialViewKey = null, projectData }) => {
  // ========================================
  // PHASE 5 SETTINGS APPLICATION
  // ========================================
  const courseSettings = projectData["Course Settings"] || {};
  const courseName = courseSettings.courseName || projectData["Current Course"]?.name || "Course Factory";
  const courseNameUpper = courseName.toUpperCase();
  const courseCode = courseSettings.courseCode || "";
  const instructor = courseSettings.instructor || "";
  const academicYear = courseSettings.academicYear || "";
  const accentColor = courseSettings.accentColor || "sky";
  const backgroundColor = courseSettings.backgroundColor || "slate-900";
  const fontFamily = courseSettings.fontFamily || "inter";
  const customCSS = courseSettings.customCSS || "";
  const compDefaults = courseSettings.compilationDefaults || {};
  const isLightBg = ['slate-50', 'zinc-50', 'neutral-50', 'stone-50', 'gray-50', 'white'].includes(backgroundColor);
  const headingTextColor = courseSettings.headingTextColor || (isLightBg ? 'slate-900' : 'white');
  const secondaryTextColor = courseSettings.secondaryTextColor || (isLightBg ? 'slate-600' : 'slate-400');
  const buttonColor = courseSettings.buttonColor || `${accentColor}-600`;
  const containerColor = courseSettings.containerColor || (isLightBg ? 'white/80' : 'slate-900/80');
  
  const toTextClass = (value) => value.startsWith('text-') ? value : `text-${value}`;
  const toBgBase = (value) => value.startsWith('bg-') ? value.slice(3) : value;
  const hexToRgba = (hex, alpha = 1) => {
    if (!hex) return `rgba(15, 23, 42, ${alpha})`;
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return `rgba(15, 23, 42, ${alpha})`;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  const parseColorToken = (value) => {
    const raw = (value || '').toString().trim();
    if (!raw) return { base: isLightBg ? 'white' : 'slate-900', alpha: 0.8, alphaRaw: '80' };
    let token = raw;
    if (token.startsWith('bg-')) token = token.slice(3);
    if (token.startsWith('text-')) token = token.slice(5);
    const parts = token.split('/');
    const base = parts[0] || (isLightBg ? 'white' : 'slate-900');
    const alphaRaw = parts[1] || null;
    const alpha = alphaRaw ? Math.max(0, Math.min(1, parseInt(alphaRaw, 10) / 100)) : 1;
    return { base, alpha, alphaRaw };
  };
  const colorHexMap = {
    'slate-900': '#0f172a',
    'slate-800': '#1e293b',
    'slate-700': '#334155',
    'slate-600': '#475569',
    'slate-500': '#64748b',
    'slate-950': '#020617',
    'gray-900': '#111827',
    'gray-800': '#1f2937',
    'gray-700': '#374151',
    'gray-600': '#4b5563',
    'zinc-900': '#18181b',
    'zinc-800': '#27272a',
    'neutral-900': '#171717',
    'stone-900': '#1c1917',
    'white': '#ffffff'
  };
  
  const headingTextClass = toTextClass(headingTextColor);
  const secondaryTextClass = toTextClass(secondaryTextColor);
  const buttonBgBase = toBgBase(buttonColor);
  const buttonBgClass = `bg-${buttonBgBase}`;
  const buttonHoverClass = buttonBgBase.endsWith('-600') ? `hover:bg-${buttonBgBase.replace(/-600$/, '-500')}` : `hover:bg-${buttonBgBase}`;
  const buttonTextClass = secondaryTextClass;
  const containerToken = parseColorToken(containerColor);
  const containerBgClass = containerToken.alphaRaw ? `bg-${containerToken.base}/${containerToken.alphaRaw}` : `bg-${containerToken.base}`;
  const containerHex = colorHexMap[containerToken.base] || (isLightBg ? '#ffffff' : '#0f172a');
  const containerBgRgba = hexToRgba(containerHex, containerToken.alpha);
  
  // Build course info HTML
  const courseInfoParts = [];
  if (courseCode) courseInfoParts.push(courseCode);
  if (instructor) courseInfoParts.push(instructor);
  if (academicYear) courseInfoParts.push(academicYear);
  const courseInfoHTML = courseInfoParts.length > 0 
    ? `\n            <p class="text-[9px] text-slate-600 uppercase tracking-widest mono mt-1">${courseInfoParts.join(' | ')}</p>`
    : "";
  
  // FILTER MODULES & TOOLKIT BASED ON COMPILATION DEFAULTS
  let activeModules = modules.filter(m => !excludedIds.includes(m.id) && !m.hidden);
  
  // Respect compilation defaults (only exclude if explicitly set to false)
  if (compDefaults.includeMaterials === false) {
    activeModules = activeModules.filter(m => {
      let itemCode = m.code || {};
      if (typeof itemCode === 'string') {
        try { itemCode = JSON.parse(itemCode); } catch(e) {}
      }
      return itemCode.id !== "view-materials";
    });
  }
  
  if (compDefaults.includeAssessments === false) {
    activeModules = activeModules.filter(m => 
      m.id !== 'item-assessments' && m.title !== 'Assessments'
    );
  }
  
  // Filter enabled toolkit items
  let enabledTools = toolkit.filter(t => t.enabled);
  if (compDefaults.includeToolkit === false) {
    enabledTools = [];
  }
  
  const hiddenTools = enabledTools.filter(t => t.hiddenFromUser);
  const visibleTools = enabledTools.filter(t => !t.hiddenFromUser);

  let navInjection = "";
  let contentInjection = "";
  let scriptInjection = "";

  // Build Injections for Modules
  activeModules.forEach(item => {
    let itemCode = item.code || {};
    if (typeof itemCode === 'string') {
        try { itemCode = JSON.parse(itemCode); } catch(e) {}
    }
    
    // Special handling for Course Materials module - detect by code.id
    if (itemCode.id === "view-materials") {
      // Use course-level materials instead of module-specific materials
      const courseMaterials = projectData["Current Course"]?.materials || [];
      const materials = courseMaterials.filter(m => !m.hidden).sort((a, b) => a.order - b.order);
      
      // Collect digital content for all materials
      const digitalMaterials = materials.filter(m => m.digitalContent);
      
      const defaultMaterialTheme = courseSettings.defaultMaterialTheme || 'dark';
      const materialThemeMap = {
        dark: { cardBg: 'bg-slate-900', cardBorder: 'border-slate-700', heading: 'text-white', body: 'text-slate-400', inner: 'bg-slate-800', proseClass: 'prose-invert', tocHover: 'hover:bg-slate-700' },
        light: { cardBg: 'bg-white', cardBorder: 'border-slate-300', heading: 'text-slate-900', body: 'text-slate-600', inner: 'bg-slate-100', proseClass: 'prose', tocHover: 'hover:bg-slate-200' },
        muted: { cardBg: 'bg-slate-800', cardBorder: 'border-slate-700', heading: 'text-slate-200', body: 'text-slate-500', inner: 'bg-slate-800', proseClass: 'prose-invert', tocHover: 'hover:bg-slate-700' },
        'high-contrast-light': { cardBg: 'bg-white', cardBorder: 'border-slate-300', heading: 'text-black', body: 'text-slate-800', inner: 'bg-slate-100', proseClass: 'prose', tocHover: 'hover:bg-slate-200' },
        'high-contrast-dark': { cardBg: 'bg-black', cardBorder: 'border-slate-600', heading: 'text-white', body: 'text-slate-300', inner: 'bg-slate-900', proseClass: 'prose-invert', tocHover: 'hover:bg-slate-800' }
      };
      const chromeTheme = materialThemeMap[defaultMaterialTheme] || materialThemeMap.dark;
      const tocActive = chromeTheme.inner + ' ' + chromeTheme.heading;
      
      // Generate material cards dynamically
      const materialCards = materials.map(mat => {
        const themeKey = (mat.themeOverride != null && mat.themeOverride !== '') ? mat.themeOverride : defaultMaterialTheme;
        const theme = materialThemeMap[themeKey] || materialThemeMap.dark;
        const colorClass = mat.color || 'slate';
        const borderClass = colorClass !== 'slate' ? `border-l-4 border-l-${colorClass}-500` : '';
        const bgClass = colorClass !== 'slate' ? `bg-${colorClass}-500/10` : 'bg-slate-800';
        const borderColorClass = colorClass !== 'slate' ? `border-${colorClass}-500/20` : 'border-slate-700';
        const textColorClass = colorClass !== 'slate' ? `text-${colorClass}-500` : theme.body;
        const buttonColorClass = `${buttonBgClass} ${buttonHoverClass}`;
        const badgeLabel = getMaterialBadgeLabel(mat) || '00';
        const badgeTextClass = mat.mediaType && mat.mediaType !== 'number'
          ? 'text-[9px] font-black uppercase tracking-widest'
          : 'font-black italic text-xl';
        const isCustomColor = colorClass !== 'slate';
        const actionBtnBase = isCustomColor
          ? `bg-${colorClass}-600 hover:bg-${colorClass}-500 text-white`
          : `${buttonBgClass} ${buttonHoverClass} ${buttonTextClass}`;
        const actionBtnBorder = isCustomColor
          ? `border border-${colorClass}-500/30`
          : 'border border-slate-600';
        
        const escapedViewUrl = (mat.viewUrl || '').replace(/'/g, "\\'");
        const escapedTitle = (mat.title || '').replace(/'/g, "\\'");
        const escapedDownloadUrl = (mat.downloadUrl || '').replace(/'/g, "\\'");
        const matId = mat.id || `mat-${Date.now()}`;
        
        let buttonsHTML = '';
        if (mat.viewUrl) {
          buttonsHTML += `<button data-pdf-url="${escapedViewUrl}" data-pdf-title="${escapedTitle}" class="pdf-viewer-btn flex-1 ${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg border border-slate-600 transition-all">View Slides</button>`;
        }
        if (mat.downloadUrl) {
          buttonsHTML += `<a href="${escapedDownloadUrl}" target="_blank" class="flex-1 ${buttonColorClass} ${buttonTextClass} text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all text-center flex items-center justify-center">Download</a>`;
        }
        if (mat.digitalContent) {
          buttonsHTML += `<button data-digital-reader="${matId}" class="digital-reader-btn flex-1 ${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2">Read</button>`;
        }
        
        return `<div class="material-card flex flex-col md:flex-row items-center justify-between gap-6 ${theme.cardBg} rounded-xl border ${theme.cardBorder} p-6 ${borderClass}">
    <div class="flex items-center gap-6">
        <div class="w-12 h-12 rounded-lg ${bgClass} flex items-center justify-center ${textColorClass} ${badgeTextClass} border ${borderColorClass}">${badgeLabel}</div>
        <div>
            <h3 class="text-lg font-bold ${theme.heading} uppercase italic">${mat.title}</h3>
            <p class="text-xs ${theme.body} font-mono">${mat.description}</p>
        </div>
    </div>
    <div class="flex gap-3 w-full md:w-auto">
        ${buttonsHTML}
    </div>
</div>`;
      }).join('\n                    ');
      
      // Generate digital content data for embedding
      const digitalContentData = {};
      digitalMaterials.forEach(dm => {
        digitalContentData[dm.id] = dm.digitalContent;
      });
      const digitalContentJSON = JSON.stringify(digitalContentData)
        .replace(/`/g, '\\`')             // Escape backticks for template literals
        .replace(/\$\{/g, '\\${')         // Escape template expressions
        .replace(/</g, '\\u003c')         // Escape < for HTML safety
        .replace(/>/g, '\\u003e');        // Escape > for HTML safety
      
      // Generate the full materials view HTML (chrome themed by defaultMaterialTheme)
      const materialsHTML = `<div id="view-materials" class="w-full h-full custom-scroll p-8 md:p-12">
            <div class="max-w-5xl mx-auto space-y-8">
                <div class="mb-12">
                    <h2 class="text-3xl font-black ${chromeTheme.heading} italic uppercase tracking-tighter">Course Materials</h2>
                    <p class="text-xs ${chromeTheme.body} font-mono uppercase tracking-widest mt-2">Access lectures, presentations, and briefing documents.</p>
                </div>
                <div id="pdf-viewer-container" class="hidden mb-12 ${chromeTheme.cardBg} rounded-xl border ${chromeTheme.cardBorder} overflow-hidden shadow-2xl">
                    <div class="flex justify-between items-center p-3 ${chromeTheme.inner} border-b ${chromeTheme.cardBorder}">
                        <span id="viewer-title" class="text-xs font-bold ${chromeTheme.heading} uppercase tracking-widest px-2">Document Viewer</span>
                        <button data-close-pdf-viewer class="text-xs ${chromeTheme.body} hover:opacity-80 font-bold uppercase tracking-widest px-2">Close X</button>
                    </div>
                    <iframe id="pdf-frame" src="" width="100%" height="600" style="border:none;"></iframe>
                </div>
                <div id="digital-reader-container" class="hidden mb-12 ${chromeTheme.cardBg} rounded-xl border ${chromeTheme.cardBorder} overflow-hidden shadow-2xl">
                    <div class="flex justify-between items-center p-3 ${chromeTheme.inner} border-b ${chromeTheme.cardBorder}">
                        <span id="reader-title" class="text-xs font-bold ${chromeTheme.heading} uppercase tracking-widest px-2 flex items-center gap-2">Digital Resource</span>
                        <button data-close-digital-reader class="text-xs ${chromeTheme.body} hover:opacity-80 font-bold uppercase tracking-widest px-2">Close X</button>
                    </div>
                    <div class="flex" style="height: 600px;">
                        <div id="reader-toc" class="w-64 ${chromeTheme.inner} border-r ${chromeTheme.cardBorder} p-4 overflow-y-auto hidden md:block">
                            <h4 class="text-xs font-bold ${chromeTheme.heading} uppercase tracking-wider mb-4">Contents</h4>
                            <div id="reader-toc-items" class="space-y-1"></div>
                        </div>
                        <div id="reader-content" class="flex-1 p-6 md:p-8 overflow-y-auto ${chromeTheme.cardBg}">
                            <div id="reader-body" class="prose ${chromeTheme.proseClass} max-w-none"></div>
                            <div class="flex justify-between items-center mt-8 pt-4 border-t ${chromeTheme.cardBorder}">
                                <button data-prev-chapter id="prev-btn" class="px-4 py-2 ${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} text-xs font-bold uppercase rounded-lg transition-all disabled:opacity-30">Previous</button>
                                <span id="reader-progress" class="text-xs ${chromeTheme.body}"></span>
                                <button data-next-chapter id="next-btn" class="px-4 py-2 ${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} text-xs font-bold uppercase rounded-lg transition-all disabled:opacity-30">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="materials-list" class="grid grid-cols-1 gap-4">
                    ${materialCards}
                </div>
            </div>
        </div>`;
      
      // Add nav button
      navInjection += `\n            <button onclick="switchView('materials')" id="nav-materials" class="nav-item">\n                <span class="w-2 h-2 rounded-full bg-slate-600"></span>${item.title}\n            </button>`;
      
      // Inject the dynamically generated HTML
      contentInjection += '\n        ' + materialsHTML + '\n';
      
      // Inject the scripts (use standalone format if available, fallback to legacy)
      const materialsScript = item.script || itemCode.script || '';
      if (materialsScript) scriptInjection += '\n        ' + materialsScript + '\n';
      
      // Add event delegation for PDF viewer buttons (always needed for materials)
      const pdfViewerEventScript = `
        // PDF Viewer Event Delegation
        document.addEventListener('click', function(e) {
            // PDF Viewer button
            var pdfBtn = e.target.closest('[data-pdf-url]');
            if (pdfBtn) {
                e.preventDefault();
                var url = pdfBtn.getAttribute('data-pdf-url');
                var title = pdfBtn.getAttribute('data-pdf-title');
                if (typeof openPDF === 'function') {
                    openPDF(url, title);
                } else {
                    // Fallback
                    var container = document.getElementById('pdf-viewer-container');
                    if (container) {
                        document.getElementById('pdf-frame').src = url.replace('/view', '/preview');
                        document.getElementById('viewer-title').innerText = 'VIEWING: ' + title;
                        container.classList.remove('hidden');
                        container.scrollIntoView({ behavior: 'smooth' });
                    }
                }
                return;
            }
            
            // Close PDF Viewer button
            var closePdfBtn = e.target.closest('[data-close-pdf-viewer]');
            if (closePdfBtn) {
                if (typeof closeViewer === 'function') {
                    closeViewer();
                } else {
                    // Fallback
                    var container = document.getElementById('pdf-viewer-container');
                    if (container) {
                        container.classList.add('hidden');
                        document.getElementById('pdf-frame').src = '';
                    }
                }
                return;
            }
        });
      `;
      scriptInjection += '\n        ' + pdfViewerEventScript + '\n';
      
      // Add digital reader script
      if (digitalMaterials.length > 0) {
        const cfMatTheme = { heading: chromeTheme.heading, body: chromeTheme.body, tocActive, tocInactive: chromeTheme.body, tocHover: chromeTheme.tocHover };
        const digitalReaderScript = `
        // Digital Reader System - Using Event Delegation for Google Sites compatibility
        var CF_MAT_THEME = ${JSON.stringify(cfMatTheme)};
        var DIGITAL_CONTENT = ${digitalContentJSON};
        var currentReader = { matId: null, chapterIdx: 0, data: null };
        
        function openDigitalReaderFn(matId) {
            var content = DIGITAL_CONTENT[matId];
            if (!content) { console.error('No digital content for', matId); return; }
            
            currentReader = { matId: matId, chapterIdx: 0, data: content };
            
            // Update title
            document.getElementById('reader-title').innerText = (content.title || 'Digital Resource');
            
            // Build table of contents (using data attributes, not onclick) - themed
            var tocHTML = '';
            (content.chapters || []).forEach(function(ch, idx) {
                var tocCls = 'toc-item w-full text-left px-3 py-2 rounded text-xs ' + CF_MAT_THEME.tocHover + ' transition-colors ' + (idx === 0 ? CF_MAT_THEME.tocActive : CF_MAT_THEME.tocInactive);
                tocHTML += '<button data-toc-chapter="' + idx + '" class="' + tocCls + '" data-chapter="' + idx + '">' +
                    '<span class="font-bold">' + (ch.number || (idx + 1)) + '.</span> ' + ch.title +
                '</button>';
            });
            document.getElementById('reader-toc-items').innerHTML = tocHTML;
            
            // Show first chapter
            renderChapterFn(0);
            
            // Show reader, hide materials list
            document.getElementById('digital-reader-container').classList.remove('hidden');
            document.getElementById('materials-list').classList.add('hidden');
            document.getElementById('pdf-viewer-container').classList.add('hidden');
        }
        
        function closeDigitalReaderFn() {
            document.getElementById('digital-reader-container').classList.add('hidden');
            document.getElementById('materials-list').classList.remove('hidden');
            currentReader = { matId: null, chapterIdx: 0, data: null };
        }
        
        function renderChapterFn(idx) {
            if (!currentReader.data || !currentReader.data.chapters) return;
            var chapters = currentReader.data.chapters;
            if (idx < 0 || idx >= chapters.length) return;
            
            currentReader.chapterIdx = idx;
            var chapter = chapters[idx];
            
            // Build chapter content - themed
            var html = '<h2 class="text-2xl font-bold ' + CF_MAT_THEME.heading + ' mb-2">' + (chapter.number || (idx + 1)) + '. ' + chapter.title + '</h2>';
            
            (chapter.sections || []).forEach(function(sec) {
                html += '<div class="mt-6">';
                if (sec.heading) {
                    html += '<h3 class="text-lg font-bold ' + CF_MAT_THEME.heading + ' mb-3">' + sec.heading + '</h3>';
                }
                // Simple markdown-like rendering
                var content = (sec.content || '').replace(/\\n/g, '<br>').replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>').replace(/\\*(.+?)\\*/g, '<em>$1</em>').replace(/^- /gm, '- ');
                html += '<div class="' + CF_MAT_THEME.body + ' leading-relaxed whitespace-pre-line">' + content + '</div>';
                html += '</div>';
            });
            
            document.getElementById('reader-body').innerHTML = html;
            
            // Update TOC highlighting - themed
            var tocActiveArr = CF_MAT_THEME.tocActive.split(' ').filter(Boolean);
            var tocInactiveArr = CF_MAT_THEME.tocInactive.split(' ').filter(Boolean);
            document.querySelectorAll('.toc-item').forEach(function(btn) {
                var chIdx = parseInt(btn.getAttribute('data-chapter'));
                if (chIdx === idx) {
                    tocInactiveArr.forEach(function(c) { btn.classList.remove(c); });
                    tocActiveArr.forEach(function(c) { btn.classList.add(c); });
                } else {
                    tocActiveArr.forEach(function(c) { btn.classList.remove(c); });
                    tocInactiveArr.forEach(function(c) { btn.classList.add(c); });
                }
            });
            
            // Update navigation buttons
            document.getElementById('prev-btn').disabled = idx === 0;
            document.getElementById('next-btn').disabled = idx === chapters.length - 1;
            document.getElementById('reader-progress').textContent = 'Chapter ' + (idx + 1) + ' of ' + chapters.length;
            
            // Scroll to top
            document.getElementById('reader-content').scrollTop = 0;
        }
        
        // EVENT DELEGATION for Digital Reader - More reliable in sandboxed environments like Google Sites
        document.addEventListener('click', function(e) {
            // Digital Reader button
            var readerBtn = e.target.closest('[data-digital-reader]');
            if (readerBtn) {
                e.preventDefault();
                openDigitalReaderFn(readerBtn.getAttribute('data-digital-reader'));
                return;
            }
            
            // Close Digital Reader button
            var closeReaderBtn = e.target.closest('[data-close-digital-reader]');
            if (closeReaderBtn) {
                closeDigitalReaderFn();
                return;
            }
            
            // TOC chapter buttons
            var tocBtn = e.target.closest('[data-toc-chapter]');
            if (tocBtn) {
                renderChapterFn(parseInt(tocBtn.getAttribute('data-toc-chapter')));
                return;
            }
            
            // Prev/Next buttons
            if (e.target.closest('#prev-btn') || e.target.closest('[data-prev-chapter]')) {
                renderChapterFn(currentReader.chapterIdx - 1);
                return;
            }
            if (e.target.closest('#next-btn') || e.target.closest('[data-next-chapter]')) {
                renderChapterFn(currentReader.chapterIdx + 1);
                return;
            }
        });
        
        console.log('ðŸ“– Digital Reader initialized with event delegation');
        `;
        scriptInjection += '\n        ' + digitalReaderScript + '\n';
      }
      
    }
    // Special handling for Assessments module
    else if (item.id === "item-assessments" || item.title === "Assessments") {
      const assessments = (item.assessments || []).filter(a => !a.hidden).sort((a, b) => a.order - b.order);
      
      // Generate assessment cards for selection page
      const assessmentCards = assessments.map((assess, idx) => {
        const typeLabel = assess.type === 'quiz' ? 'Multiple Choice' : assess.type === 'longanswer' ? 'Long Answer' : assess.type === 'print' ? 'Print & Submit' : 'Mixed Assessment';
        const typeBadge = assess.type === 'quiz' ? 'MC' : assess.type === 'longanswer' ? 'LA' : assess.type === 'print' ? 'PRINT' : 'MIX';
        const questionCount = assess.questionCount || (assess.type === 'mixed' ? 'Multiple' : 'Unknown');
        
        return `
            <div class="assessment-card p-6 ${containerBgClass} rounded-xl border border-slate-700 hover:border-${accentColor}-500 transition-all cursor-pointer group" onclick="showAssessment(${idx})">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-[10px] font-black uppercase tracking-widest ${secondaryTextClass}">${typeBadge}</span>
                  <div>
                    <h3 class="text-xl font-bold ${headingTextClass} group-hover:text-${accentColor}-400 transition-colors">${assess.title}</h3>
                    <p class="text-xs ${secondaryTextClass} uppercase tracking-wider">${typeLabel}${assess.questionCount ? ' | ' + questionCount + ' Questions' : ''}</p>
                  </div>
                </div>
              </div>
              <div class="text-${accentColor}-400 group-hover:translate-x-1 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>`;
      }).join('\n          ');
      
      // Generate individual assessment containers (hidden by default) WITH INLINE SCRIPTS
      const assessmentContainers = assessments.map((assess, idx) => {
        return '\n        <div id="assessment-' + idx + '" class="assessment-container hidden">\n' +
        '          <button onclick="backToAssessmentList()" class="mb-6 inline-flex items-center gap-2 ${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">\n' +
        '            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n' +
        '              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>\n' +
        '            </svg>\n' +
        '            Back to Assessments\n' +
        '          </button>\n' +
        '          ' + assess.html + '\n' +
        '          \n' +
        '          <!-- INLINE ASSESSMENT SCRIPT -->\n' +
        '          <script>\n' +
        '          ' + (assess.script || '') + '\n' +
        '          </script>\n' +
        '        </div>';
      }).join('\n        ');
      
      // Per-assessment text/box color overrides (Phase 1 Edit). Phase 5 defaults.
      const defaultTextColor = courseSettings.assessmentTextColor || 'white';
      const defaultBoxColor = courseSettings.assessmentBoxColor || 'slate-900';
      const overrideHexMap = {
        'white': '#ffffff', 'black': '#000000',
        'slate-950': '#020617', 'slate-900': '#0f172a', 'slate-800': '#1e293b', 'slate-700': '#334155',
        'slate-600': '#475569', 'slate-500': '#64748b', 'slate-400': '#94a3b8', 'slate-300': '#cbd5e1',
        'slate-200': '#e2e8f0', 'slate-100': '#f1f5f9', 'slate-50': '#f8fafc',
        'gray-900': '#111827', 'gray-800': '#1f2937', 'gray-700': '#374151', 'gray-600': '#4b5563',
        'gray-500': '#6b7280', 'gray-400': '#9ca3af', 'gray-300': '#d1d5db', 'gray-200': '#e5e7eb', 'gray-100': '#f3f4f6', 'gray-50': '#f9fafb'
      };
      const assessmentOverrideCSS = assessments.map((assess) => {
        const textColor = assess.textColorOverride != null && assess.textColorOverride !== '' ? assess.textColorOverride : defaultTextColor;
        const boxColor = assess.boxColorOverride != null && assess.boxColorOverride !== '' ? assess.boxColorOverride : defaultBoxColor;
        let genId = assess.generatedId;
        if (!genId && (assess.html || '').match(/id="(quiz_|mixed_)\d+"/)) {
          const m = (assess.html || '').match(/id="((?:quiz_|mixed_)\d+)"/);
          genId = m ? m[1] : null;
        }
        if (!genId) return '';
        const textHex = overrideHexMap[textColor] || overrideHexMap['white'];
        const boxHex = overrideHexMap[boxColor] || overrideHexMap['slate-900'];
        const isLightBox = ['white','slate-50','slate-100','slate-200','slate-300','slate-400','gray-50','gray-100','gray-200','gray-300','gray-400'].includes(boxColor);
        const borderHex = isLightBox ? '#cbd5e1' : '#334155';
        return `#${genId} .assessment-input,#${genId} textarea.assessment-input,#${genId} input.assessment-input{color:${textHex} !important;background-color:${boxHex} !important;border-color:${borderHex} !important;}`;
      }).filter(Boolean).join('\n');
      
      // Generate the full assessments view HTML with selection page (WITH INLINE SCRIPTS)
      const assessmentViewHTML = `<div id="view-assessments" class="w-full h-full custom-scroll p-8 md:p-12">
            ${assessmentOverrideCSS ? `<style>/* per-assessment overrides */\n${assessmentOverrideCSS}</style>` : ''}
            <div class="max-w-5xl mx-auto">
                <!-- Assessment Selection Page -->
                <div id="assessment-list">
                    <div class="mb-12">
                        <h2 class="text-3xl font-black ${headingTextClass} italic uppercase tracking-tighter">Assessment Center</h2>
                        <p class="text-xs ${secondaryTextClass} font-mono uppercase tracking-widest mt-2">Select an assessment to begin</p>
                    </div>
                    ${assessments.length > 0 ? `
                    <div class="grid grid-cols-1 gap-4">
                        ${assessmentCards}
                    </div>` : `<p class="text-center ${secondaryTextClass} italic py-12">No assessments available.</p>`}
                </div>
                
                <!-- Individual Assessments (hidden by default) -->
                ${assessmentContainers}
            </div>
            
            <!-- INLINE ASSESSMENT NAVIGATION SCRIPTS -->
            <script>
            (function() {
              console.log('ðŸ”§ [INLINE] Initializing assessment navigation functions...');
              
              window.showAssessment = function(index) {
                console.log('ðŸ“‹ [INLINE] Showing assessment:', index);
                var listEl = document.getElementById('assessment-list');
                var targetEl = document.getElementById('assessment-' + index);
                
                if (listEl) listEl.classList.add('hidden');
                document.querySelectorAll('.assessment-container').forEach(function(c) {
                  c.classList.add('hidden');
                });
                if (targetEl) {
                  targetEl.classList.remove('hidden');
                } else {
                  console.error('âŒ Assessment container not found:', 'assessment-' + index);
                }
                window.scrollTo(0, 0);
              };
              
              window.backToAssessmentList = function() {
                console.log('â¬…ï¸ [INLINE] Returning to assessment list');
                document.querySelectorAll('.assessment-container').forEach(function(c) {
                  c.classList.add('hidden');
                });
                var listEl = document.getElementById('assessment-list');
                if (listEl) listEl.classList.remove('hidden');
                window.scrollTo(0, 0);
              };
              
              // Global Toolkit Menu Toggle
              window.toggleToolkitMenu = function() {
                console.log('ðŸ”§ [INLINE] Toggling toolkit menu');
                var dropdown = document.getElementById('toolkit-dropdown');
                if (dropdown) {
                  dropdown.classList.toggle('hidden');
                }
              };
              
              // Global Toolkit Tool Toggle
              var toolkitState = JSON.parse(localStorage.getItem('mf_toolkit') || '{}');
              
              window.toggleTool = function(toolId) {
                console.log('ðŸ”§ [INLINE] Toggling tool:', toolId);
                console.log('ðŸ”§ [DEBUG] Looking for element ID:', 'feat-' + toolId);
                
                toolkitState[toolId] = !toolkitState[toolId];
                localStorage.setItem('mf_toolkit', JSON.stringify(toolkitState));
                
                var toolElement = document.getElementById('feat-' + toolId);
                var toggleButton = document.getElementById('toggle-' + toolId);
                
                console.log('ðŸ”§ [DEBUG] Tool element found:', !!toolElement);
                console.log('ðŸ”§ [DEBUG] Toggle button found:', !!toggleButton);
                console.log('ðŸ”§ [DEBUG] New state:', toolkitState[toolId]);
                
                if (toolElement) {
                  if (toolkitState[toolId]) {
                    toolElement.classList.remove('hidden');
                    console.log('ðŸ”§ [DEBUG] Showing tool');
                  } else {
                    toolElement.classList.add('hidden');
                    console.log('ðŸ”§ [DEBUG] Hiding tool');
                  }
                }
                
                if (toggleButton) {
                  if (toolkitState[toolId]) {
                    toggleButton.classList.remove('bg-slate-600');
                    toggleButton.classList.add('bg-emerald-600');
                    var dot = toggleButton.querySelector('div');
                    if (dot) dot.classList.add('translate-x-4');
                    console.log('ðŸ”§ [DEBUG] Toggle ON visual');
                  } else {
                    toggleButton.classList.remove('bg-emerald-600');
                    toggleButton.classList.add('bg-slate-600');
                    var dot = toggleButton.querySelector('div');
                    if (dot) dot.classList.remove('translate-x-4');
                    console.log('ðŸ”§ [DEBUG] Toggle OFF visual');
                  }
                }
              };
              
              // Initialize toolkit state on load
              window.initializeToolkit = function() {
                console.log('ðŸ”§ [INLINE] Initializing toolkit state');
                Object.keys(toolkitState).forEach(function(toolId) {
                  if (toolkitState[toolId]) {
                    var toolElement = document.getElementById('feat-' + toolId);
                    var toggleButton = document.getElementById('toggle-' + toolId);
                    if (toolElement) toolElement.classList.remove('hidden');
                    if (toggleButton) {
                      toggleButton.classList.remove('bg-slate-600');
                      toggleButton.classList.add('bg-emerald-600');
                      var dot = toggleButton.querySelector('div');
                      if (dot) dot.classList.add('translate-x-4');
                    }
                  }
                });
              };
              
              // Initialize on load
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', window.initializeToolkit);
              } else {
                window.initializeToolkit();
              }
              
              console.log('âœ… [INLINE] Assessment navigation + toolkit functions ready!');
            })();
            </script>
        </div>`;
      
      // Generate combined assessment scripts
      const assessmentScripts = assessments.map(assess => assess.script || '').join('\n        ');
      
      // Add navigation functions (attached to window for onclick access)
      const navScripts = `
        (function() {
          console.log('ðŸ”§ Initializing assessment navigation functions...');
          
          window.showAssessment = function(index) {
            console.log('ðŸ“‹ Showing assessment:', index);
            var listEl = document.getElementById('assessment-list');
            var targetEl = document.getElementById('assessment-' + index);
            
            if (listEl) listEl.classList.add('hidden');
            document.querySelectorAll('.assessment-container').forEach(function(c) {
              c.classList.add('hidden');
            });
            if (targetEl) {
              targetEl.classList.remove('hidden');
            } else {
              console.error('Assessment container not found:', 'assessment-' + index);
            }
            window.scrollTo(0, 0);
          };
          
          window.backToAssessmentList = function() {
            console.log('â¬…ï¸ Returning to assessment list');
            document.querySelectorAll('.assessment-container').forEach(function(c) {
              c.classList.add('hidden');
            });
            var listEl = document.getElementById('assessment-list');
            if (listEl) listEl.classList.remove('hidden');
            window.scrollTo(0, 0);
          };
          
          console.log('âœ… Assessment navigation functions ready!');
        })();
        `;
      
      // Add to navigation
      navInjection += `\n            <button onclick="switchView('assessments')" id="nav-assessments" class="nav-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Assessments
            </button>`;
      
      // Add HTML and scripts
      contentInjection += `\n        ${assessmentViewHTML}\n`;
      scriptInjection += `\n        ${navScripts}\n        ${assessmentScripts}\n`;
      
    } else {
      // ========================================
      // CUSTOM MODULES (Iframe Isolation Strategy)
      // ========================================
      // Each custom module runs in its own iframe - completely isolated
      // This prevents ID collisions, JS conflicts, and CSS pollution
      
      const moduleId = item.id || itemCode.id || '';
      const shortId = moduleId.replace('view-', '');
      
      // Add Navigation Button
      if (moduleId) {
        // External link modules with newtab open in new window - No iframe needed
        if (item.type === 'external' && item.linkType === 'newtab') {
          navInjection += `\n            <button onclick="window.open('${item.url}', '_blank', 'noopener,noreferrer')" id="nav-${shortId}" class="nav-item">\n                <span class="w-2 h-2 rounded-full bg-slate-600"></span>${item.title}\n            </button>`;
        } else {
          navInjection += `\n            <button onclick="switchView('${shortId}')" id="nav-${shortId}" class="nav-item">\n                <span class="w-2 h-2 rounded-full bg-slate-600"></span>${item.title}\n            </button>`;
        }
      }
      
      // Skip content injection for external links that open in new tab
      if (item.type === 'external' && item.linkType === 'newtab') {
        // No content injection needed - handled by nav button onclick
      } else {
        // Determine the iframe content
        let iframeDoc = '';
        
        // PRIORITY 1: Use rawHtml if available (new simplified format)
        // This is the complete HTML document as pasted by the user - no transformation
        if (item.rawHtml) {
          iframeDoc = item.rawHtml;
        } 
        // PRIORITY 2: Fallback for legacy modules (parsed html/css/script)
        else {
          const moduleContent = extractModuleContent(item);
          if (!moduleContent.html) {
            // No content to render
            return;
          }
          
          let rawHTML = moduleContent.html || '';
          let rawScript = moduleContent.script || '';
          let rawCSS = moduleContent.css || '';
          
          // Build a complete HTML document for legacy modules
          iframeDoc = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,700;1,400;1,900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
    <style>
        body { 
            background-color: #0f172a; 
            color: #e2e8f0; 
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #1e293b; }
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #64748b; }
        ${rawCSS}
    </style>
</head>
<body class="min-h-screen p-4 md:p-8">
    ${rawHTML}
    <script>
        (function() {
            ${rawScript}
        })();
    <\/script>
</body>
</html>`;
        }
        
        // Escape the HTML for use in srcdoc attribute
        const escapedDoc = iframeDoc
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
        
        // Create the Container DIV with iframe
        const containerHTML = `
        <div id="view-${shortId}" class="w-full h-full hidden module-container">
            <iframe 
                srcdoc="${escapedDoc}" 
                class="w-full h-full border-0" 
                style="min-height: 100vh;"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            ></iframe>
        </div>`;
        
        contentInjection += '\n' + containerHTML + '\n';
      }
    }
  });

  // Inject Hidden Tools (apply silently) WITH INLINE SCRIPTS
  hiddenTools.forEach(tool => {
    const toolCode = typeof tool.code === 'string' ? JSON.parse(tool.code) : tool.code;
    if (tool.includeUi && toolCode.html) {
      const htmlWithScript = toolCode.html + (toolCode.script ? '\n<script>\n' + toolCode.script + '\n</script>' : '');
      contentInjection += '\n        ' + htmlWithScript + '\n';
    }
  });

  // Inject Global Toolkit Dropdown (if there are visible tools)
  if (visibleTools.length > 0) {
    // Add Global Toolkit nav button
    navInjection += `\n            <button onclick="toggleToolkitMenu()" id="nav-toolkit" class="nav-item mt-4 border-t border-slate-800 pt-4">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Global Toolkit
            </button>`;
    
    // Build dropdown HTML
    let dropdownItems = '';
    visibleTools.forEach(tool => {
      const toolCode = typeof tool.code === 'string' ? JSON.parse(tool.code) : tool.code;
      const toolId = tool.id.replace('feat-', '');
      
      if (tool.userToggleable) {
        dropdownItems += `
                        <div class="flex items-center justify-between p-2 hover:bg-slate-700 rounded">
                            <span class="text-xs text-slate-300">${tool.title}</span>
                            <button onclick="toggleTool('${toolId}')" id="toggle-${toolId}" class="relative w-8 h-4 rounded-full transition-colors bg-slate-600 cursor-pointer">
                                <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform pointer-events-none"></div>
                            </button>
                        </div>`;
      } else {
        dropdownItems += `
                        <div class="p-2 hover:bg-slate-700 rounded">
                            <span class="text-xs text-slate-300">${tool.title}</span>
                        </div>`;
      }
      
      // Inject tool content WITH INLINE SCRIPT wrapped in container
      if (tool.includeUi && toolCode.html) {
        const htmlWithScript = toolCode.html + (toolCode.script ? '\n<script>\n' + toolCode.script + '\n</script>' : '');
        // Wrap in a container div with the correct ID for toggling
        contentInjection += '\n        <div id="feat-' + toolId + '" class="' + (tool.userToggleable ? 'hidden' : '') + '">\n' + htmlWithScript + '\n        </div>\n';
      }
    });

    // Add dropdown container
    contentInjection += `
        <div id="toolkit-dropdown" class="hidden fixed top-16 left-4 bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-2xl z-50 w-64">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-bold text-white">Global Toolkit</h3>
                <button onclick="toggleToolkitMenu()" class="text-slate-400 hover:text-white">âœ•</button>
            </div>
            <div class="space-y-1">
                ${dropdownItems}
            </div>
        </div>`;

    // Add toolkit toggle scripts
    const toolIds = visibleTools.filter(t => t.userToggleable).map(t => t.id.replace('feat-', ''));
    scriptInjection += `
        // Global Toolkit Menu Logic
        function toggleToolkitMenu() {
            const dropdown = document.getElementById('toolkit-dropdown');
            dropdown.classList.toggle('hidden');
        }

        // Tool Toggle State Management
        let toolkitState = JSON.parse(localStorage.getItem('mf_toolkit') || '{}');
        
        function toggleTool(toolId) {
            toolkitState[toolId] = !toolkitState[toolId];
            localStorage.setItem('mf_toolkit', JSON.stringify(toolkitState));
            applyToolState(toolId);
        }

        function applyToolState(toolId) {
            const isActive = toolkitState[toolId];
            const toolEl = document.getElementById('tool-' + toolId);
            const toggleBtn = document.getElementById('toggle-' + toolId);
            
            if (toolEl) {
                toolEl.classList.toggle('hidden', !isActive);
            }
            
            if (toggleBtn) {
                const slider = toggleBtn.querySelector('div');
                if (isActive) {
                    toggleBtn.classList.remove('bg-slate-600');
                    toggleBtn.classList.add('bg-emerald-600');
                    slider.classList.add('translate-x-4');
                } else {
                    toggleBtn.classList.add('bg-slate-600');
                    toggleBtn.classList.remove('bg-emerald-600');
                    slider.classList.remove('translate-x-4');
                }
            }
        }

        // Initialize tool states on load
        ${toolIds.map(id => `applyToolState('${id}');`).join('\n        ')}
      `;
  }

  // Build progress tracking script if enabled
  const progressTrackingScript = compDefaults.enableProgressTracking === true ? `
        
        // ========================================
        // PROGRESS TRACKING SYSTEM
        // ========================================
        let moduleProgress = JSON.parse(localStorage.getItem('courseProgress_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}') || '{}');
        
        // Track when a module is viewed
        function trackModuleView(moduleId) {
          if (!moduleProgress[moduleId]) {
            moduleProgress[moduleId] = {
              viewed: true,
              viewedAt: new Date().toISOString(),
              completed: false
            };
            localStorage.setItem('courseProgress_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}', JSON.stringify(moduleProgress));
            updateProgressIndicators();
          }
        }
        
        // Mark module as completed
        function markModuleComplete(moduleId) {
          if (!moduleProgress[moduleId]) {
            moduleProgress[moduleId] = { viewed: true, viewedAt: new Date().toISOString() };
          }
          moduleProgress[moduleId].completed = true;
          moduleProgress[moduleId].completedAt = new Date().toISOString();
          localStorage.setItem('courseProgress_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}', JSON.stringify(moduleProgress));
          updateProgressIndicators();
        }
        
        // Update visual progress indicators
        function updateProgressIndicators() {
          const allModules = document.querySelectorAll('nav button[onclick^="switchView"]');
          allModules.forEach(btn => {
            const moduleId = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
            if (moduleProgress[moduleId]) {
              // Add checkmark indicator
              if (moduleProgress[moduleId].completed && !btn.querySelector('.progress-check')) {
                btn.insertAdjacentHTML('beforeend', '<span class="progress-check ml-2 text-emerald-400">âœ“</span>');
              } else if (moduleProgress[moduleId].viewed && !moduleProgress[moduleId].completed && !btn.querySelector('.progress-dot')) {
                btn.insertAdjacentHTML('beforeend', '<span class="progress-dot ml-2 text-amber-400">â—</span>');
              }
            }
          });
        }
        
        // Hook into module switching to track views
        const originalSwitchView = window.switchView;
        window.switchView = function(viewId) {
          trackModuleView(viewId);
          return originalSwitchView(viewId);
        };
        
        // Initialize on load
        updateProgressIndicators();
      ` : '';

  // Add initialization script for initialViewKey if provided
  const initScript = initialViewKey ? `
        // Auto-open to initial view on load
        (function() {
          function initView() {
            const targetView = document.getElementById('view-${initialViewKey}');
            if (targetView) {
              // Hide all views first
              document.querySelectorAll('[id^="view-"]').forEach(v => v.classList.add('hidden'));
              // Show target view
              targetView.classList.remove('hidden');
              // Activate nav button
              const navBtn = document.getElementById('nav-${initialViewKey}');
              if (navBtn) {
                document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                navBtn.classList.add('active');
              }
              // Call module init if available (backward compatibility)
              if (window.COURSE_FACTORY_MODULES && window.COURSE_FACTORY_MODULES['${initialViewKey}'] && window.COURSE_FACTORY_MODULES['${initialViewKey}'].init) {
                try {
                  window.COURSE_FACTORY_MODULES['${initialViewKey}'].init();
                } catch(e) {
                  console.error('Module init error:', e);
                }
              }
            }
          }
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initView);
          } else {
            initView();
          }
        })();
      ` : '';

  // Generate final HTML using template function
  const finalCode = generateMasterShell({
    courseName,
    courseNameUpper,
    accentColor,
    backgroundColor,
    fontFamily,
    customCSS,
    courseInfo: courseInfoHTML,
    navItems: navInjection,
    content: contentInjection,
    scripts: scriptInjection + initScript,
    progressTracking: progressTrackingScript,
    containerBgRgba
  });

  return finalCode;
};

const Phase4 = ({ projectData, setProjectData, excludedIds, toggleModule, onToggleHidden, onError }) => {
  const [fullSiteCode, setFullSiteCode] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);
  const [compileValidation, setCompileValidation] = useState(null); // { isValid, errors, warnings }

  // --- EXPORT MODULE PAGE STATE ---
  const [exportModuleId, setExportModuleId] = useState('');
  const [exportAssessments, setExportAssessments] = useState([]);
  const [exportMaterials, setExportMaterials] = useState([]);
  const [exportTools, setExportTools] = useState([]);
  const [exportedHTML, setExportedHTML] = useState('');
  
  // --- HUB PAGE STATE ---
  const [hubPageHTML, setHubPageHTML] = useState('');
  const [hubCourseTitle, setHubCourseTitle] = useState('Mental Fitness Course');
  const [hubCourseDescription, setHubCourseDescription] = useState('Master your mental game and unlock peak performance.');

  // --- BETA STATIC PUBLISH STATE ---
  const [publishMode, setPublishMode] = useState('legacy'); // 'legacy' | 'beta'
  const [betaStructureMode, setBetaStructureMode] = useState('multi-file'); // 'multi-file' | 'single-page'
  const [betaSelectedModules, setBetaSelectedModules] = useState([]); // for delta publish
  const [betaIncludeManifest, setBetaIncludeManifest] = useState(true);
  const [betaPublishStatus, setBetaPublishStatus] = useState(''); // '', 'loading', 'success', 'error'
  const [betaPublishMessage, setBetaPublishMessage] = useState('');

  const modules = projectData["Current Course"]?.modules || [];

  // ========================================
  // BETA STATIC PUBLISH HELPER FUNCTIONS
  // ========================================

  // Load JSZip from CDN dynamically
  const loadJSZip = async () => {
    if (window.JSZip) return window.JSZip;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = () => resolve(window.JSZip);
      script.onerror = () => reject(new Error('Failed to load JSZip'));
      document.head.appendChild(script);
    });
  };

  // Build manifest.json for beta publish
  const buildBetaManifest = () => {
    const courseSettings = projectData["Course Settings"] || {};
    const courseName = courseSettings.courseName || projectData["Current Course"]?.name || "Course";
    const activeModules = modules.filter(m => !excludedIds.includes(m.id) && !m.hidden);
    
    return {
      courseTitle: courseName,
      updatedAt: new Date().toISOString(),
      modules: activeModules.map(m => ({
        id: m.id,
        title: m.title,
        path: `modules/${m.id}.html`
      }))
    };
  };

  // Use global font family helper
  const getFontFamily = getFontFamilyGlobal;

  // Generate hub page (index.html) for beta publish
  const generateHubPageBeta = (manifest) => {
    const courseSettings = projectData["Course Settings"] || {};
    const accentColor = courseSettings.accentColor || "sky";
    const backgroundColor = courseSettings.backgroundColor || "slate-900";
    const fontFamily = courseSettings.fontFamily || "inter";
    const customCSS = courseSettings.customCSS || "";
    const courseName = manifest.courseTitle;
    
    const font = getFontFamily(fontFamily);
    
    // Determine if background is light (for text color)
    const isLightBg = ['slate-50', 'zinc-50', 'neutral-50', 'stone-50', 'gray-50', 'white'].includes(backgroundColor);
    const headingTextColor = courseSettings.headingTextColor || (isLightBg ? 'slate-900' : 'white');
    const secondaryTextColor = courseSettings.secondaryTextColor || (isLightBg ? 'slate-600' : 'slate-400');
    const containerColor = courseSettings.containerColor || (isLightBg ? 'white/80' : 'slate-900/80');
    const toTextClass = (value) => value.startsWith('text-') ? value : `text-${value}`;
    const hexToRgba = (hex, alpha = 1) => {
      if (!hex) return `rgba(15, 23, 42, ${alpha})`;
      const clean = hex.replace('#', '');
      if (clean.length !== 6) return `rgba(15, 23, 42, ${alpha})`;
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    const parseColorToken = (value) => {
      const raw = (value || '').toString().trim();
      if (!raw) return { base: isLightBg ? 'white' : 'slate-900', alpha: 0.8, alphaRaw: '80' };
      let token = raw;
      if (token.startsWith('bg-')) token = token.slice(3);
      if (token.startsWith('text-')) token = token.slice(5);
      const parts = token.split('/');
      const base = parts[0] || (isLightBg ? 'white' : 'slate-900');
      const alphaRaw = parts[1] || null;
      const alpha = alphaRaw ? Math.max(0, Math.min(1, parseInt(alphaRaw, 10) / 100)) : 1;
      return { base, alpha, alphaRaw };
    };
    const colorHexMap = {
      'slate-900': '#0f172a',
      'slate-800': '#1e293b',
      'slate-700': '#334155',
      'slate-600': '#475569',
      'slate-500': '#64748b',
      'slate-950': '#020617',
      'gray-900': '#111827',
      'gray-800': '#1f2937',
      'gray-700': '#374151',
      'gray-600': '#4b5563',
      'zinc-900': '#18181b',
      'zinc-800': '#27272a',
      'neutral-900': '#171717',
      'stone-900': '#1c1917',
      'white': '#ffffff'
    };
    const headingTextClass = toTextClass(headingTextColor);
    const secondaryTextClass = toTextClass(secondaryTextColor);
    const tertiaryTextClass = toTextClass(isLightBg ? 'slate-500' : 'slate-500');
    const borderColor = isLightBg ? 'border-slate-300' : 'border-slate-700';
    const containerToken = parseColorToken(containerColor);
    const containerBgClass = containerToken.alphaRaw ? `bg-${containerToken.base}/${containerToken.alphaRaw}` : `bg-${containerToken.base}`;
    const containerHoverClass = `hover:bg-${containerToken.base}`;
    const containerHex = colorHexMap[containerToken.base] || (isLightBg ? '#ffffff' : '#0f172a');
    const containerBgRgba = hexToRgba(containerHex, containerToken.alpha);
    const arrowColor = secondaryTextClass;
    
    const moduleListHTML = manifest.modules.map((mod, idx) => `
      <a href="./${mod.path}" class="block p-6 ${containerBgClass} rounded-xl border ${borderColor} hover:border-${accentColor}-500 ${containerHoverClass} transition-all group">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-${accentColor}-500/20 flex items-center justify-center text-${accentColor}-400 font-bold">
              ${String(idx + 1).padStart(2, '0')}
            </div>
            <div>
              <h3 class="text-lg font-bold ${headingTextClass} group-hover:text-${accentColor}-400 transition-colors">${mod.title}</h3>
              <p class="text-xs ${tertiaryTextClass} font-mono">${mod.id}</p>
            </div>
          </div>
          <svg class="w-5 h-5 ${arrowColor} group-hover:text-${accentColor}-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </a>
    `).join('\n');

    // Map Tailwind color names to hex values for background
    const bgColorMap = {
      // Dark backgrounds
      'slate-900': '#0f172a',
      'slate-950': '#020617',
      'zinc-900': '#18181b',
      'neutral-900': '#171717',
      'stone-900': '#1c1917',
      'gray-900': '#111827',
      // Light backgrounds
      'slate-50': '#f8fafc',
      'zinc-50': '#fafafa',
      'neutral-50': '#fafafa',
      'stone-50': '#fafaf9',
      'gray-50': '#f9fafb',
      'white': '#ffffff'
    };
    const bgHex = bgColorMap[backgroundColor] || bgColorMap['slate-900'];
    const scrollbarTrack = isLightBg ? '#e2e8f0' : '#1e293b';
    const scrollbarThumb = isLightBg ? '#94a3b8' : '#475569';
    
    return `<!DOCTYPE html>
<html lang="en" style="background: ${bgHex} !important; background-color: ${bgHex} !important;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${courseName}</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link href="${font.url}" rel="stylesheet">
  <style>
    * { 
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body { 
      background: ${bgHex} !important;
      background-color: ${bgHex} !important;
      ${font.css}
    }
    body { 
      min-height: 100vh;
    }
    :root { --cf-container-bg: ${containerBgRgba}; }
    .custom-scroll::-webkit-scrollbar { width: 6px; }
    .custom-scroll::-webkit-scrollbar-track { background: ${scrollbarTrack}; }
    .custom-scroll::-webkit-scrollbar-thumb { background: ${scrollbarThumb}; border-radius: 3px; }
    ${customCSS ? `\n    /* Custom CSS from Settings */\n    ${customCSS}` : ''}
  </style>
  <script>
    // Force background color after Tailwind loads
    (function() {
      function setBackground() {
        document.documentElement.style.backgroundColor = '${bgHex}';
        document.documentElement.style.background = '${bgHex}';
        document.body.style.backgroundColor = '${bgHex}';
        document.body.style.background = '${bgHex}';
      }
      setBackground();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setBackground);
      }
      setTimeout(setBackground, 100);
      setTimeout(setBackground, 500);
    })();
  <\/script>
</head>
<body class="${secondaryTextClass} custom-scroll" style="background: ${bgHex} !important; background-color: ${bgHex} !important;">
  <div class="max-w-4xl mx-auto px-6 py-12">
    <header class="mb-12 text-center">
      <h1 class="text-4xl font-black ${headingTextClass} uppercase tracking-tight mb-2">${courseName}</h1>
      <p class="text-sm ${secondaryTextClass}">Select a module to begin</p>
      <p class="text-xs ${tertiaryTextClass} mt-2 font-mono">Last updated: ${new Date(manifest.updatedAt).toLocaleDateString()}</p>
    </header>
    
    <nav class="space-y-4">
      ${moduleListHTML}
    </nav>
    
    <footer class="mt-16 pt-8 border-t ${borderColor} text-center">
      <p class="text-xs ${tertiaryTextClass}">Built with Course Factory</p>
    </footer>
  </div>
</body>
</html>`;
  };

  // Generate individual module HTML page for beta publish
  const generateModuleHtmlBeta = (moduleId) => {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return null;

    const courseSettings = projectData["Course Settings"] || {};
    const courseName = courseSettings.courseName || projectData["Current Course"]?.name || "Course";
    const accentColor = courseSettings.accentColor || "sky";
    const backgroundColor = courseSettings.backgroundColor || "slate-900";
    const fontFamily = courseSettings.fontFamily || "inter";
    const customCSS = courseSettings.customCSS || "";
    const enabledTools = (projectData["Global Toolkit"] || []).filter(t => t.enabled);
    
    const font = getFontFamily(fontFamily);
    
    // Map Tailwind color names to hex values for background
    const bgColorMap = {
      'slate-900': '#0f172a',
      'slate-950': '#020617',
      'zinc-900': '#18181b',
      'neutral-900': '#171717',
      'stone-900': '#1c1917',
      'gray-900': '#111827',
      'slate-50': '#f8fafc',
      'zinc-50': '#fafafa',
      'neutral-50': '#fafafa',
      'stone-50': '#fafaf9',
      'gray-50': '#f9fafb',
      'white': '#ffffff'
    };
    const bgHex = bgColorMap[backgroundColor] || bgColorMap['slate-900'];
    
    // Determine if background is light (for text color)
    const isLightBg = ['slate-50', 'zinc-50', 'neutral-50', 'stone-50', 'gray-50', 'white'].includes(backgroundColor);
    const textColor = isLightBg ? 'text-slate-900' : 'text-white';
    const textColorSecondary = isLightBg ? 'text-slate-600' : 'text-slate-400';
    const textColorTertiary = isLightBg ? 'text-slate-500' : 'text-slate-500';
    const cardBorder = isLightBg ? 'border-slate-300' : 'border-slate-700';
    const headingTextColor = courseSettings.headingTextColor || (isLightBg ? 'slate-900' : 'white');
    const secondaryTextColor = courseSettings.secondaryTextColor || (isLightBg ? 'slate-600' : 'slate-400');
    const buttonColor = courseSettings.buttonColor || `${accentColor}-600`;
    const containerColor = courseSettings.containerColor || (isLightBg ? 'white/80' : 'slate-900/80');
    
    const toTextClass = (value) => value.startsWith('text-') ? value : `text-${value}`;
    const toBgBase = (value) => value.startsWith('bg-') ? value.slice(3) : value;
    const hexToRgba = (hex, alpha = 1) => {
      if (!hex) return `rgba(15, 23, 42, ${alpha})`;
      const clean = hex.replace('#', '');
      if (clean.length !== 6) return `rgba(15, 23, 42, ${alpha})`;
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    const parseColorToken = (value) => {
      const raw = (value || '').toString().trim();
      if (!raw) return { base: isLightBg ? 'white' : 'slate-900', alpha: 0.8, alphaRaw: '80' };
      let token = raw;
      if (token.startsWith('bg-')) token = token.slice(3);
      if (token.startsWith('text-')) token = token.slice(5);
      const parts = token.split('/');
      const base = parts[0] || (isLightBg ? 'white' : 'slate-900');
      const alphaRaw = parts[1] || null;
      const alpha = alphaRaw ? Math.max(0, Math.min(1, parseInt(alphaRaw, 10) / 100)) : 1;
      return { base, alpha, alphaRaw };
    };
    const colorHexMap = {
      ...bgColorMap,
      'slate-800': '#1e293b',
      'slate-700': '#334155',
      'slate-600': '#475569',
      'slate-500': '#64748b',
      'gray-800': '#1f2937',
      'gray-700': '#374151',
      'gray-600': '#4b5563',
      'zinc-800': '#27272a',
      'white': '#ffffff'
    };
    
    const headingTextClass = toTextClass(headingTextColor);
    const secondaryTextClass = toTextClass(secondaryTextColor);
    const buttonBgBase = toBgBase(buttonColor);
    const buttonBgClass = `bg-${buttonBgBase}`;
    const buttonHoverClass = buttonBgBase.endsWith('-600') ? `hover:bg-${buttonBgBase.replace(/-600$/, '-500')}` : `hover:bg-${buttonBgBase}`;
    const buttonTextClass = secondaryTextClass;
    const containerToken = parseColorToken(containerColor);
    const containerBgClass = containerToken.alphaRaw ? `bg-${containerToken.base}/${containerToken.alphaRaw}` : `bg-${containerToken.base}`;
    const containerHex = colorHexMap[containerToken.base] || (isLightBg ? '#ffffff' : '#0f172a');
    const containerBgRgba = hexToRgba(containerHex, containerToken.alpha);

    // Check module type
    let itemCode = mod.code || {};
    if (typeof itemCode === 'string') {
      try { itemCode = JSON.parse(itemCode); } catch(e) {}
    }
    const isMaterialsModule = itemCode.id === "view-materials";
    const isAssessmentsModule = mod.id === "item-assessments" || mod.title === "Assessments";

    // Extract module content
    let moduleContentHTML = '';
    let moduleCSS = '';
    let moduleScript = '';

    // Special handling for Course Materials module
    if (isMaterialsModule) {
      const courseMaterials = projectData["Current Course"]?.materials || [];
      const materials = courseMaterials.filter(m => !m.hidden).sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Collect digital content for materials that have it
      const digitalMaterials = materials.filter(m => m.digitalContent);
      const digitalContentData = {};
      digitalMaterials.forEach(dm => {
        digitalContentData[dm.id] = dm.digitalContent;
      });
      const digitalContentJSON = JSON.stringify(digitalContentData)
        .replace(/`/g, '\\`')
        .replace(/\$\{/g, '\\${')
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e');
      
      const defaultMaterialTheme = courseSettings.defaultMaterialTheme || 'dark';
      const materialThemeMap = {
        dark: { cardBg: 'bg-slate-900', cardBorder: 'border-slate-700', heading: 'text-white', body: 'text-slate-400' },
        light: { cardBg: 'bg-white', cardBorder: 'border-slate-300', heading: 'text-slate-900', body: 'text-slate-600' },
        muted: { cardBg: 'bg-slate-800', cardBorder: 'border-slate-700', heading: 'text-slate-200', body: 'text-slate-500' },
        'high-contrast-light': { cardBg: 'bg-white', cardBorder: 'border-slate-300', heading: 'text-black', body: 'text-slate-800' },
        'high-contrast-dark': { cardBg: 'bg-black', cardBorder: 'border-slate-600', heading: 'text-white', body: 'text-slate-300' }
      };
      
      const materialCards = materials.map(mat => {
        const themeKey = (mat.themeOverride != null && mat.themeOverride !== '') ? mat.themeOverride : defaultMaterialTheme;
        const theme = materialThemeMap[themeKey] || materialThemeMap.dark;
        const colorClass = mat.color || 'slate';
        const borderClass = colorClass !== 'slate' ? `border-l-4 border-l-${colorClass}-500` : '';
        const bgClass = colorClass !== 'slate' ? `bg-${colorClass}-500/10` : 'bg-slate-800';
        const borderColorClass = colorClass !== 'slate' ? `border-${colorClass}-500/20` : 'border-slate-700';
        const textColorClass = colorClass !== 'slate' ? `text-${colorClass}-500` : theme.body;
        const buttonColorClass = `${buttonBgClass} ${buttonHoverClass}`;
        const badgeLabel = getMaterialBadgeLabel(mat) || mat.number || '';
        const badgeTextClass = mat.mediaType && mat.mediaType !== 'number'
          ? 'text-[9px] font-black uppercase tracking-widest'
          : 'font-black italic text-xl';
        
        const escapedViewUrl = (mat.viewUrl || '').replace(/'/g, "\\'");
        const escapedTitle = (mat.title || '').replace(/'/g, "\\'");
        const matId = mat.id || `mat-${Date.now()}`;
        
        let buttonsHTML = '';
        if (mat.viewUrl) {
          buttonsHTML += `<button onclick="openPDF('${escapedViewUrl}', '${escapedTitle}')" class="flex-1 ${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg border border-slate-600 transition-all">View Slides</button>`;
        }
        if (mat.downloadUrl) {
          buttonsHTML += `<a href="${mat.downloadUrl}" target="_blank" class="flex-1 ${buttonColorClass} ${buttonTextClass} text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all text-center flex items-center justify-center">Download</a>`;
        }
        if (mat.digitalContent) {
          buttonsHTML += `<button data-digital-reader="${matId}" class="digital-reader-btn flex-1 ${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2">Read</button>`;
        }
        
        return `<div class="material-card flex flex-col md:flex-row items-center justify-between gap-6 p-6 ${theme.cardBg} rounded-xl border ${theme.cardBorder} ${borderClass}">
          <div class="flex items-center gap-6">
            <div class="w-12 h-12 rounded-lg ${bgClass} flex items-center justify-center ${textColorClass} ${badgeTextClass} border ${borderColorClass}">${badgeLabel}</div>
            <div>
              <h3 class="text-lg font-bold ${theme.heading} uppercase italic">${mat.title}</h3>
              <p class="text-xs ${theme.body} font-mono">${mat.description || ''}</p>
            </div>
          </div>
          <div class="flex gap-3 w-full md:w-auto">${buttonsHTML}</div>
        </div>`;
      }).join('\n');

      moduleContentHTML = `
        <div class="space-y-8">
          <div class="mb-8">
            <h2 class="text-3xl font-black ${headingTextClass} italic uppercase tracking-tighter">Course Materials</h2>
            <p class="text-xs ${secondaryTextClass} font-mono uppercase tracking-widest mt-2">Access lectures, presentations, and briefing documents.</p>
          </div>
          <div id="pdf-viewer-container" class="hidden mb-8 ${isLightBg ? 'bg-white' : 'bg-black'} rounded-xl border ${cardBorder} overflow-hidden shadow-2xl">
            <div class="flex justify-between items-center p-3 ${isLightBg ? 'bg-slate-100' : 'bg-slate-800'} border-b ${cardBorder}">
              <span id="viewer-title" class="text-xs font-bold text-white uppercase tracking-widest px-2">Document Viewer</span>
              <button onclick="closeViewer()" class="text-xs text-rose-400 hover:${isLightBg ? 'text-slate-900' : 'text-white'} font-bold uppercase tracking-widest px-2">Close X</button>
            </div>
            <iframe id="pdf-frame" src="" width="100%" height="600" style="border:none;"></iframe>
          </div>
          <div id="digital-reader-container" class="hidden mb-8 ${isLightBg ? 'bg-white' : 'bg-slate-900'} rounded-xl border border-emerald-500/30 overflow-hidden shadow-2xl">
            <div class="flex justify-between items-center p-3 ${isLightBg ? 'bg-slate-100' : 'bg-slate-800'} border-b border-emerald-500/30">
              <span id="reader-title" class="text-xs font-bold text-emerald-400 uppercase tracking-widest px-2 flex items-center gap-2">Digital Resource</span>
              <button onclick="closeDigitalReader()" class="text-xs text-rose-400 hover:${isLightBg ? 'text-slate-900' : 'text-white'} font-bold uppercase tracking-widest px-2">Close X</button>
            </div>
            <div class="flex" style="height: 600px;">
              <div id="reader-toc" class="w-64 ${isLightBg ? 'bg-slate-50' : 'bg-slate-950'} border-r ${cardBorder} p-4 overflow-y-auto hidden md:block">
                <h4 class="text-xs font-bold ${textColorSecondary} uppercase tracking-wider mb-4">Contents</h4>
                <div id="reader-toc-items" class="space-y-1"></div>
              </div>
              <div id="reader-content" class="flex-1 p-6 md:p-8 overflow-y-auto">
                <div id="reader-body" class="prose ${isLightBg ? 'prose-slate' : 'prose-invert'} max-w-none"></div>
                <div class="flex justify-between items-center mt-8 pt-4 border-t ${cardBorder}">
                  <button id="prev-btn" onclick="prevChapter()" class="px-4 py-2 ${isLightBg ? 'bg-slate-200 hover:bg-slate-300 text-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-white'} text-xs font-bold uppercase rounded-lg transition-all disabled:opacity-30">Previous</button>
                  <span id="reader-progress" class="text-xs ${textColorSecondary}"></span>
                  <button id="next-btn" onclick="nextChapter()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-lg transition-all disabled:opacity-30">Next</button>
                </div>
              </div>
            </div>
          </div>
          <div id="materials-list" class="grid grid-cols-1 gap-4">
            ${materials.length > 0 ? materialCards : `<p class="text-center ${secondaryTextClass} italic py-8">No materials available.</p>`}
          </div>
        </div>`;
      
      // Build digital reader script if there are digital materials
      let digitalReaderScript = '';
      if (digitalMaterials.length > 0) {
        digitalReaderScript = `
        var DIGITAL_CONTENT = ${digitalContentJSON};
        var currentReader = { matId: null, chapterIdx: 0, data: null };
        
        function openDigitalReader(matId) {
          var content = DIGITAL_CONTENT[matId];
          if (!content) { console.error('No digital content for', matId); return; }
          
          currentReader = { matId: matId, chapterIdx: 0, data: content };
          
          document.getElementById('reader-title').innerText = (content.title || 'Digital Resource');
          
          var tocHTML = '';
          (content.chapters || []).forEach(function(ch, idx) {
            tocHTML += '<button onclick="goToChapter(' + idx + ')" class="toc-item w-full text-left px-3 py-2 rounded text-xs hover:bg-slate-800 transition-colors ' + (idx === 0 ? 'bg-emerald-900/50 text-emerald-400' : 'text-slate-400') + '">' +
              '<span class="font-bold">' + (ch.number || (idx + 1)) + '.</span> ' + ch.title +
            '</button>';
          });
          document.getElementById('reader-toc-items').innerHTML = tocHTML;
          
          renderChapter(0);
          
          document.getElementById('digital-reader-container').classList.remove('hidden');
          document.getElementById('materials-list').classList.add('hidden');
          document.getElementById('pdf-viewer-container').classList.add('hidden');
        }
        
        function closeDigitalReader() {
          document.getElementById('digital-reader-container').classList.add('hidden');
          document.getElementById('materials-list').classList.remove('hidden');
          currentReader = { matId: null, chapterIdx: 0, data: null };
        }
        
        function renderChapter(idx) {
          if (!currentReader.data || !currentReader.data.chapters) return;
          var chapters = currentReader.data.chapters;
          if (idx < 0 || idx >= chapters.length) return;
          
          currentReader.chapterIdx = idx;
          var chapter = chapters[idx];
          
          var html = '<h2 class="text-2xl font-bold text-white mb-2">' + (chapter.number || (idx + 1)) + '. ' + chapter.title + '</h2>';
          
          (chapter.sections || []).forEach(function(sec) {
            html += '<div class="mt-6">';
            if (sec.heading) {
              html += '<h3 class="text-lg font-bold text-emerald-400 mb-3">' + sec.heading + '</h3>';
            }
            var content = (sec.content || '').replace(/\\n/g, '<br>').replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>').replace(/\\*(.+?)\\*/g, '<em>$1</em>').replace(/^- /gm, '- ');
            html += '<div class="text-slate-300 leading-relaxed whitespace-pre-line">' + content + '</div>';
            html += '</div>';
          });
          
          document.getElementById('reader-body').innerHTML = html;
          
          document.querySelectorAll('.toc-item').forEach(function(btn, i) {
            if (i === idx) {
              btn.classList.add('bg-emerald-900/50', 'text-emerald-400');
              btn.classList.remove('text-slate-400');
            } else {
              btn.classList.remove('bg-emerald-900/50', 'text-emerald-400');
              btn.classList.add('text-slate-400');
            }
          });
          
          document.getElementById('prev-btn').disabled = idx === 0;
          document.getElementById('next-btn').disabled = idx === chapters.length - 1;
          document.getElementById('reader-progress').textContent = 'Chapter ' + (idx + 1) + ' of ' + chapters.length;
          
          document.getElementById('reader-content').scrollTop = 0;
        }
        
        function goToChapter(idx) {
          renderChapter(idx);
        }
        
        function prevChapter() {
          if (currentReader.chapterIdx > 0) {
            renderChapter(currentReader.chapterIdx - 1);
          }
        }
        
        function nextChapter() {
          if (currentReader.data && currentReader.data.chapters && currentReader.chapterIdx < currentReader.data.chapters.length - 1) {
            renderChapter(currentReader.chapterIdx + 1);
          }
        }
        
        // Event delegation for digital reader buttons
        document.addEventListener('click', function(e) {
          var readerBtn = e.target.closest('[data-digital-reader]');
          if (readerBtn) {
            e.preventDefault();
            openDigitalReader(readerBtn.getAttribute('data-digital-reader'));
            return;
          }
        });`;
      }
      
      moduleScript = `
        function openPDF(url, title) {
          var container = document.getElementById('pdf-viewer-container');
          var previewUrl = url.replace('/view', '/preview');
          document.getElementById('pdf-frame').src = previewUrl;
          document.getElementById('viewer-title').innerText = "VIEWING: " + title;
          container.classList.remove('hidden');
          container.scrollIntoView({ behavior: 'smooth' });
        }
        function closeViewer() {
          document.getElementById('pdf-viewer-container').classList.add('hidden');
          document.getElementById('pdf-frame').src = "";
        }
        ${digitalReaderScript}`;
    }
    // Special handling for Assessments module
    else if (isAssessmentsModule) {
      const assessments = (mod.assessments || []).filter(a => !a.hidden).sort((a, b) => (a.order || 0) - (b.order || 0));
      
      const cardBg = containerBgClass;
      
      // Generate assessment list
      const assessmentListHTML = assessments.map((assess, idx) => {
        const typeLabel = assess.type === 'quiz' ? 'Multiple Choice' : assess.type === 'longanswer' ? 'Long Answer' : assess.type === 'print' ? 'Print & Submit' : 'Mixed Assessment';
        const typeBadge = assess.type === 'quiz' ? 'MC' : assess.type === 'longanswer' ? 'LA' : assess.type === 'print' ? 'PRINT' : 'MIX';
        
        return `<div class="assessment-card p-6 ${cardBg} rounded-xl border ${cardBorder} hover:border-${accentColor}-500 transition-all cursor-pointer group" onclick="showAssessment(${idx})">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-[10px] font-black uppercase tracking-widest ${secondaryTextClass}">${typeBadge}</span>
                <div>
                  <h3 class="text-xl font-bold ${headingTextClass} group-hover:text-${accentColor}-400 transition-colors">${assess.title}</h3>
                  <p class="text-xs ${secondaryTextClass} uppercase tracking-wider">${typeLabel}</p>
                </div>
              </div>
            </div>
            <div class="text-${accentColor}-400 group-hover:translate-x-1 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>`;
      }).join('\n');

      // Generate individual assessment containers
      const assessmentContainersHTML = assessments.map((assess, idx) => {
        return `<div id="assessment-${idx}" class="assessment-container hidden">
          <button onclick="backToAssessmentList()" class="mb-6 inline-flex items-center gap-2 ${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Assessments
          </button>
          ${assess.html || ''}
        </div>`;
      }).join('\n');

      // Collect assessment scripts
      const assessmentScripts = assessments.map(assess => assess.script || '').filter(s => s).join('\n');

      // Per-assessment text/box color overrides (Phase 1 Edit; Phase 5 defaults)
      const defaultTextColor = courseSettings.assessmentTextColor || 'white';
      const defaultBoxColor = courseSettings.assessmentBoxColor || 'slate-900';
      const overrideHexMap = {
        'white': '#ffffff', 'black': '#000000',
        'slate-950': '#020617', 'slate-900': '#0f172a', 'slate-800': '#1e293b', 'slate-700': '#334155',
        'slate-600': '#475569', 'slate-500': '#64748b', 'slate-400': '#94a3b8', 'slate-300': '#cbd5e1',
        'slate-200': '#e2e8f0', 'slate-100': '#f1f5f9', 'slate-50': '#f8fafc',
        'gray-900': '#111827', 'gray-800': '#1f2937', 'gray-700': '#374151', 'gray-600': '#4b5563',
        'gray-500': '#6b7280', 'gray-400': '#9ca3af', 'gray-300': '#d1d5db', 'gray-200': '#e5e7eb', 'gray-100': '#f3f4f6', 'gray-50': '#f9fafb'
      };
      const assessmentOverrideCSS = assessments.map((assess) => {
        const textColor = assess.textColorOverride != null && assess.textColorOverride !== '' ? assess.textColorOverride : defaultTextColor;
        const boxColor = assess.boxColorOverride != null && assess.boxColorOverride !== '' ? assess.boxColorOverride : defaultBoxColor;
        let genId = assess.generatedId;
        if (!genId && (assess.html || '').match(/id="(quiz_|mixed_)\d+"/)) {
          const m = (assess.html || '').match(/id="((?:quiz_|mixed_)\d+)"/);
          genId = m ? m[1] : null;
        }
        if (!genId) return '';
        const textHex = overrideHexMap[textColor] || overrideHexMap['white'];
        const boxHex = overrideHexMap[boxColor] || overrideHexMap['slate-900'];
        const isLightBox = ['white','slate-50','slate-100','slate-200','slate-300','slate-400','gray-50','gray-100','gray-200','gray-300','gray-400'].includes(boxColor);
        const borderHex = isLightBox ? '#cbd5e1' : '#334155';
        return `#${genId} .assessment-input,#${genId} textarea.assessment-input,#${genId} input.assessment-input{color:${textHex} !important;background-color:${boxHex} !important;border-color:${borderHex} !important;}`;
      }).filter(Boolean).join('\n');

      moduleContentHTML = `
        <div class="space-y-8">
          ${assessmentOverrideCSS ? `<style>/* per-assessment overrides */\n${assessmentOverrideCSS}</style>` : ''}
          <div class="mb-8">
            <h2 class="text-3xl font-black ${headingTextClass} italic uppercase tracking-tighter">Assessment Center</h2>
            <p class="text-xs ${secondaryTextClass} font-mono uppercase tracking-widest mt-2">Quizzes, tests, and reflection exercises.</p>
          </div>
          <div id="assessment-list" class="grid grid-cols-1 gap-4">
            ${assessments.length > 0 ? assessmentListHTML : `<p class="text-center ${secondaryTextClass} italic py-8">No assessments available.</p>`}
          </div>
          ${assessmentContainersHTML}
        </div>`;
      
      moduleScript = `
        function showAssessment(index) {
          document.getElementById('assessment-list').classList.add('hidden');
          document.querySelectorAll('.assessment-container').forEach(function(c) { c.classList.add('hidden'); });
          var target = document.getElementById('assessment-' + index);
          if (target) target.classList.remove('hidden');
          window.scrollTo(0, 0);
        }
        function backToAssessmentList() {
          document.querySelectorAll('.assessment-container').forEach(function(c) { c.classList.add('hidden'); });
          document.getElementById('assessment-list').classList.remove('hidden');
          window.scrollTo(0, 0);
        }
        ${assessmentScripts}`;
    }
    // Regular module handling
    else if (mod.rawHtml) {
      // New format: rawHtml - render in iframe
      const escapedRawHtml = mod.rawHtml
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      moduleContentHTML = `<div class="w-full rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
        <iframe srcdoc="${escapedRawHtml}" class="w-full border-0" style="min-height: 80vh; height: 100%;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"></iframe>
      </div>`;
    } else {
      // Legacy format
      const html = mod.html || (mod.code && mod.code.html) || '';
      const css = mod.css || (mod.code && mod.code.css) || '';
      const script = mod.script || (mod.code && mod.code.script) || '';
      
      moduleContentHTML = html;
      moduleCSS = css;
      moduleScript = script;
    }

    // Build toolkit scripts
    let toolkitScripts = '';
    let toolkitHTML = '';
    enabledTools.forEach(tool => {
      if (tool.code) {
        if (tool.code.script) toolkitScripts += tool.code.script + '\n';
        if (tool.code.html && tool.includeUi) toolkitHTML += tool.code.html + '\n';
      }
    });

    return `<!DOCTYPE html>
<html lang="en" style="background: ${bgHex} !important; background-color: ${bgHex} !important;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${mod.title} | ${courseName}</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link href="${font.url}" rel="stylesheet">
  <style>
    * { 
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body { 
      background: ${bgHex} !important;
      background-color: ${bgHex} !important;
      ${font.css}
    }
    body { 
      min-height: 100vh;
    }
    .custom-scroll::-webkit-scrollbar { width: 6px; }
    .custom-scroll::-webkit-scrollbar-track { background: ${isLightBg ? '#e2e8f0' : '#1e293b'}; }
    .custom-scroll::-webkit-scrollbar-thumb { background: ${isLightBg ? '#94a3b8' : '#475569'}; border-radius: 3px; }
    .glass { background: ${isLightBg ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)'}; backdrop-filter: blur(10px); }
    .material-card { transition: all 0.2s; }
    .material-card:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
    .assessment-container [class*="bg-slate-9"],
    .assessment-container [class*="bg-slate-8"],
    .assessment-container [class*="bg-slate-7"],
    .assessment-container [class*="bg-slate-6"],
    .assessment-container [class*="bg-gray-9"],
    .assessment-container [class*="bg-gray-8"],
    .assessment-container [class*="bg-gray-7"] {
      background: var(--cf-container-bg) !important;
    }
    ${moduleCSS}
    ${customCSS ? `\n    /* Custom CSS from Settings */\n    ${customCSS}` : ''}
  </style>
  <script>
    // Force background color after Tailwind loads
    (function() {
      function setBackground() {
        document.documentElement.style.backgroundColor = '${bgHex}';
        document.documentElement.style.background = '${bgHex}';
        document.body.style.backgroundColor = '${bgHex}';
        document.body.style.background = '${bgHex}';
      }
      setBackground();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setBackground);
      }
      setTimeout(setBackground, 100);
      setTimeout(setBackground, 500);
    })();
  <\/script>
</head>
<body class="${textColor} custom-scroll" style="background: ${bgHex} !important; background-color: ${bgHex} !important;">
  <header class="sticky top-0 z-50 ${isLightBg ? 'bg-white/95' : 'bg-slate-900/95'} backdrop-blur border-b ${cardBorder}">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <a href="../index.html" class="flex items-center gap-2 ${textColorSecondary} hover:text-${accentColor}-400 transition-colors text-sm font-bold">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Course
      </a>
      <h1 class="text-sm font-bold ${textColor} uppercase tracking-wider">${mod.title}</h1>
    </div>
  </header>
  
  <main class="max-w-6xl mx-auto px-6 py-8">
    ${moduleContentHTML}
  </main>

  ${toolkitHTML}
  
  <script>
    ${toolkitScripts}
    ${moduleScript}
  <\/script>
</body>
</html>`;
  };

  // Build single-page app (with sidebar) for beta publish
  const buildSinglePageAppBeta = () => {
    const manifest = buildBetaManifest();
    const filesMap = {};
    const toolkit = projectData["Global Toolkit"] || [];
    
    // Use buildSiteHtml to generate single-page app (same as legacy but for beta)
    const singlePageHtml = buildSiteHtml({
      modules,
      toolkit,
      excludedIds,
      initialViewKey: null,
      projectData
    });
    
    // Add index.html (single-page app)
    filesMap['index.html'] = singlePageHtml;
    
    // Add manifest.json
    filesMap['manifest.json'] = JSON.stringify(manifest, null, 2);
    
    return filesMap;
  };

  // Build all static files for full publish (multi-file mode)
  const buildStaticFilesBeta = () => {
    const manifest = buildBetaManifest();
    const filesMap = {};
    
    // Add index.html (hub page)
    filesMap['index.html'] = generateHubPageBeta(manifest);
    
    // Add manifest.json
    filesMap['manifest.json'] = JSON.stringify(manifest, null, 2);
    
    // Add individual module pages
    manifest.modules.forEach(mod => {
      const moduleHtml = generateModuleHtmlBeta(mod.id);
      if (moduleHtml) {
        filesMap[`modules/${mod.id}.html`] = moduleHtml;
      }
    });
    
    return filesMap;
  };

  // Build delta files for selective publish
  const buildDeltaFilesBeta = (selectedModuleIds, includeManifest) => {
    const filesMap = {};
    
    // Add manifest if requested
    if (includeManifest) {
      const manifest = buildBetaManifest();
      filesMap['manifest.json'] = JSON.stringify(manifest, null, 2);
    }
    
    // Add selected module pages only
    selectedModuleIds.forEach(modId => {
      const moduleHtml = generateModuleHtmlBeta(modId);
      if (moduleHtml) {
        filesMap[`modules/${modId}.html`] = moduleHtml;
      }
    });
    
    return filesMap;
  };

  // Download files as ZIP
  const downloadZipFromFilesMap = async (filesMap, zipName) => {
    try {
      setBetaPublishStatus('loading');
      setBetaPublishMessage('Loading ZIP library...');
      
      const JSZip = await loadJSZip();
      const zip = new JSZip();
      
      setBetaPublishMessage('Creating ZIP archive...');
      
      // Add files to ZIP
      Object.entries(filesMap).forEach(([path, content]) => {
        zip.file(path, content);
      });
      
      setBetaPublishMessage('Generating download...');
      
      // Generate ZIP blob
      const blob = await zip.generateAsync({ type: 'blob' });
      
      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setBetaPublishStatus('success');
      setBetaPublishMessage(`Downloaded ${zipName}`);
      setTimeout(() => {
        setBetaPublishStatus('');
        setBetaPublishMessage('');
      }, 3000);
    } catch (error) {
      setBetaPublishStatus('error');
      setBetaPublishMessage(`Failed: ${error.message}`);
    }
  };

  // Get safe filename from course name
  const getSafeFilename = (name) => {
    return name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  };

  // Full publish handler
  const handleFullPublishBeta = async () => {
    const courseSettings = projectData["Course Settings"] || {};
    const courseName = courseSettings.courseName || projectData["Current Course"]?.name || "course";
    const safeTitle = getSafeFilename(courseName);
    const dateStr = new Date().toISOString().split('T')[0];
    const zipName = `course_${safeTitle}_${dateStr}.zip`;
    
    // Use appropriate function based on structure mode
    const filesMap = betaStructureMode === 'single-page' 
      ? buildSinglePageAppBeta()
      : buildStaticFilesBeta();
    
    await downloadZipFromFilesMap(filesMap, zipName);
  };

  // Delta publish handler
  const handleDeltaPublishBeta = async () => {
    if (betaSelectedModules.length === 0) {
      setBetaPublishStatus('error');
      setBetaPublishMessage('Please select at least one module');
      return;
    }
    
    const courseSettings = projectData["Course Settings"] || {};
    const courseName = courseSettings.courseName || projectData["Current Course"]?.name || "course";
    const safeTitle = getSafeFilename(courseName);
    const dateStr = new Date().toISOString().split('T')[0];
    const zipName = `delta_${safeTitle}_${dateStr}.zip`;
    
    const filesMap = buildDeltaFilesBeta(betaSelectedModules, betaIncludeManifest);
    await downloadZipFromFilesMap(filesMap, zipName);
  };

  // Toggle module selection for delta publish
  const toggleBetaModuleSelection = (moduleId) => {
    setBetaSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Select/deselect all modules for delta
  const selectAllBetaModules = () => {
    const activeModules = modules.filter(m => !excludedIds.includes(m.id) && !m.hidden);
    setBetaSelectedModules(activeModules.map(m => m.id));
  };

  const deselectAllBetaModules = () => {
    setBetaSelectedModules([]);
  };
  const materials = projectData["Current Course"]?.materials || [];
  const toolkit = projectData["Global Toolkit"] || [];

  // Toolkit toggle functions
  const toggleToolkitField = (index, field) => {
    const newToolkit = [...toolkit];
    newToolkit[index] = { ...newToolkit[index], [field]: !newToolkit[index][field] };
    setProjectData({
      ...projectData,
      "Global Toolkit": newToolkit
    });
  };

  // Generate Single Module Page HTML
  const generateModulePageHTML = () => {
    try {
      const selectedMod = modules.find(m => m.id === exportModuleId);
      if (!selectedMod) {
        if (onError) onError('module', `Module "${exportModuleId}" not found. Please select a valid module.`);
        return;
      }

      const courseSettings = projectData["Course Settings"] || {};
      const accentColor = courseSettings.accentColor || "sky";
      const backgroundColor = courseSettings.backgroundColor || "slate-900";
      const fontFamily = courseSettings.fontFamily || "inter";
      const font = getFontFamilyGlobal(fontFamily);
      const fontNameMatch = font.css.match(/'([^']+)'/);
      const fontName = fontNameMatch ? fontNameMatch[1] : 'Inter';
      const isLightBg = ['slate-50', 'zinc-50', 'neutral-50', 'stone-50', 'gray-50', 'white'].includes(backgroundColor);
      const headingTextColor = courseSettings.headingTextColor || (isLightBg ? 'slate-900' : 'white');
      const secondaryTextColor = courseSettings.secondaryTextColor || (isLightBg ? 'slate-600' : 'slate-400');
      const buttonColor = courseSettings.buttonColor || `${accentColor}-600`;
      const containerColor = courseSettings.containerColor || (isLightBg ? 'white/80' : 'slate-900/80');
      const toTextClass = (value) => value.startsWith('text-') ? value : `text-${value}`;
      const toBgBase = (value) => value.startsWith('bg-') ? value.slice(3) : value;
      const hexToRgba = (hex, alpha = 1) => {
        if (!hex) return `rgba(15, 23, 42, ${alpha})`;
        const clean = hex.replace('#', '');
        if (clean.length !== 6) return `rgba(15, 23, 42, ${alpha})`;
        const r = parseInt(clean.slice(0, 2), 16);
        const g = parseInt(clean.slice(2, 4), 16);
        const b = parseInt(clean.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      const parseColorToken = (value) => {
        const raw = (value || '').toString().trim();
        if (!raw) return { base: isLightBg ? 'white' : 'slate-900', alpha: 0.8, alphaRaw: '80' };
        let token = raw;
        if (token.startsWith('bg-')) token = token.slice(3);
        if (token.startsWith('text-')) token = token.slice(5);
        const parts = token.split('/');
        const base = parts[0] || (isLightBg ? 'white' : 'slate-900');
        const alphaRaw = parts[1] || null;
        const alpha = alphaRaw ? Math.max(0, Math.min(1, parseInt(alphaRaw, 10) / 100)) : 1;
        return { base, alpha, alphaRaw };
      };
      const bgColorMap = {
        'slate-900': '#0f172a',
        'slate-950': '#020617',
        'zinc-900': '#18181b',
        'neutral-900': '#171717',
        'stone-900': '#1c1917',
        'gray-900': '#111827',
        'slate-50': '#f8fafc',
        'zinc-50': '#fafafa',
        'neutral-50': '#fafafa',
        'stone-50': '#fafaf9',
        'gray-50': '#f9fafb',
        'white': '#ffffff',
        'slate-800': '#1e293b',
        'slate-700': '#334155',
        'slate-600': '#475569',
        'slate-500': '#64748b',
        'gray-800': '#1f2937',
        'gray-700': '#374151',
        'gray-600': '#4b5563',
        'zinc-800': '#27272a'
      };
      const bgHex = bgColorMap[backgroundColor] || bgColorMap['slate-900'];
      const headingTextClass = toTextClass(headingTextColor);
      const secondaryTextClass = toTextClass(secondaryTextColor);
      const buttonBgBase = toBgBase(buttonColor);
      const buttonBgClass = `bg-${buttonBgBase}`;
      const buttonHoverClass = buttonBgBase.endsWith('-600') ? `hover:bg-${buttonBgBase.replace(/-600$/, '-500')}` : `hover:bg-${buttonBgBase}`;
      const buttonTextClass = secondaryTextClass;
      const containerToken = parseColorToken(containerColor);
      const containerBgClass = containerToken.alphaRaw ? `bg-${containerToken.base}/${containerToken.alphaRaw}` : `bg-${containerToken.base}`;
      const containerHex = bgColorMap[containerToken.base] || (isLightBg ? '#ffffff' : '#0f172a');
      const containerBgRgba = hexToRgba(containerHex, containerToken.alpha);

    const allAssessments = modules.flatMap(m => m.assessments || []);
    const selectedAssessments = allAssessments.filter(a => exportAssessments.includes(a.id));
    const selectedTools = toolkit.filter(t => exportTools.includes(t.id));

    let sectionsHTML = '';
    let combinedScripts = '';

    // Add navigation/viewer functions FIRST (before module scripts) to ensure they're available immediately
    // Wrap in IIFE to ensure they're always defined, not conditionally
    combinedScripts += '// --- NAVIGATION FUNCTIONS (Always Defined) ---\n' +
        '(function() {\n' +
        '  window.showAssessment = function(index) {\n' +
        '    var listEl = document.getElementById("assessment-list");\n' +
        '    if (listEl) listEl.classList.add("hidden");\n' +
        '    document.querySelectorAll(".assessment-container").forEach(function(c) { c.classList.add("hidden"); });\n' +
        '    var targetEl = document.getElementById("assessment-" + index);\n' +
        '    if (targetEl) targetEl.classList.remove("hidden");\n' +
        '    window.scrollTo(0, 0);\n' +
        '  };\n' +
        '  window.backToAssessmentList = function() {\n' +
        '    document.querySelectorAll(".assessment-container").forEach(function(c) { c.classList.add("hidden"); });\n' +
        '    var listEl = document.getElementById("assessment-list");\n' +
        '    if (listEl) listEl.classList.remove("hidden");\n' +
        '    window.scrollTo(0, 0);\n' +
        '  };\n' +
        '  window.openMaterialViewer = function(url, title) {\n' +
        '    var viewer = document.getElementById("material-viewer");\n' +
        '    var frame = document.getElementById("material-frame");\n' +
        '    var titleEl = document.getElementById("material-viewer-title");\n' +
        '    if (viewer && frame && titleEl) {\n' +
        '      frame.src = url;\n' +
        '      titleEl.textContent = title;\n' +
        '      viewer.classList.remove("hidden");\n' +
        '      viewer.scrollIntoView({ behavior: "smooth", block: "start" });\n' +
        '    }\n' +
        '  };\n' +
        '  window.closeMaterialViewer = function() {\n' +
        '    var viewer = document.getElementById("material-viewer");\n' +
        '    var frame = document.getElementById("material-frame");\n' +
        '    if (viewer && frame) {\n' +
        '      viewer.classList.add("hidden");\n' +
        '      frame.src = "";\n' +
        '    }\n' +
        '  };\n' +
        '})();\n\n';

    // Module Content - Check for rawHtml first (new format), then legacy format
    if (selectedMod.rawHtml) {
      // NEW FORMAT: rawHtml - embed in iframe for isolation
      // Escape for srcdoc attribute
      const escapedRawHtml = selectedMod.rawHtml
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      
      sectionsHTML += '<section id="module-content" class="mb-12">' +
        '<div class="w-full rounded-xl overflow-hidden border border-slate-700 shadow-2xl">' +
        '<iframe srcdoc="' + escapedRawHtml + '" ' +
        'class="w-full border-0" ' +
        'style="min-height: 80vh; height: 100%;" ' +
        'sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads">' +
        '</iframe>' +
        '</div>' +
        '</section>';
    } else {
      // LEGACY FORMAT: separate html/css/script
      const moduleContent = extractModuleContent(selectedMod);
      let moduleHTML = moduleContent.html;
      let moduleCSS = moduleContent.css;
      let moduleScript = moduleContent.script;

      // Process HTML if found
      if (moduleHTML) {
          const cleanHTML = cleanModuleHTML(moduleHTML);
          sectionsHTML += '<section id="module-content" class="mb-12">' + cleanHTML + '</section>';
      }

      // Inject CSS if found (standalone modules only)
      if (moduleCSS) {
          sectionsHTML = '<style id="module-styles">' + moduleCSS + '</style>' + sectionsHTML;
      }

      // Process script if found
      if (moduleScript) {
          const cleanScript = cleanModuleScript(moduleScript);
          combinedScripts += '// --- MODULE SCRIPT ---\n' + cleanScript + '\n\n';
      }
    }

    // Assessments with Selection UI
    if (selectedAssessments.length > 0) {
        sectionsHTML += '<section id="assessments" class="mb-12"><h2 class="text-2xl font-bold ' + headingTextClass + ' mb-6 border-b border-slate-700 pb-2">Assessments</h2>';
        
        // Assessment List (Selection Page)
        sectionsHTML += '<div id="assessment-list"><div class="grid grid-cols-1 gap-4">';
        selectedAssessments.forEach((assess, idx) => {
            const qCount = assess.questions ? assess.questions.length : 'Multiple';
            sectionsHTML += '<div class="assessment-card p-6 ' + containerBgClass + ' rounded-xl border border-slate-700 hover:border-' + accentColor + '-500 transition-all cursor-pointer group" onclick="showAssessment(' + idx + ')">' +
                '<div class="flex items-center justify-between">' +
                '<div class="flex-1"><div class="flex items-center gap-3 mb-2">' +
                '<span class="text-[10px] font-black uppercase tracking-widest ' + secondaryTextClass + '">MIX</span><div>' +
                '<h3 class="text-xl font-bold ' + headingTextClass + ' group-hover:text-' + accentColor + '-400 transition-colors">' + assess.title + '</h3>' +
                '<p class="text-xs ' + secondaryTextClass + ' uppercase tracking-wider">Mixed Assessment | ' + qCount + ' Questions</p>' +
                '</div></div></div>' +
                '<div class="text-' + accentColor + '-400 group-hover:translate-x-1 transition-transform">' +
                '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></div></div></div>';
        });
        sectionsHTML += '</div></div>';
        
        // Individual Assessment Containers
        selectedAssessments.forEach((assess, idx) => {
            sectionsHTML += '<div id="assessment-' + idx + '" class="assessment-container hidden">' +
                '<button onclick="backToAssessmentList()" class="mb-6 inline-flex items-center gap-2 ' + buttonBgClass + ' ' + buttonHoverClass + ' ' + buttonTextClass + ' font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">' +
                '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>' +
                'Back to Assessments</button>' +
                assess.html + '</div>';
            if (assess.script) combinedScripts += '// --- ASSESSMENT: ' + assess.title + ' ---\n' + assess.script + '\n\n';
        });
        
        sectionsHTML += '</section>';
    }

    // Materials (selected by user)
    const selectedMaterials = materials.filter(mat => exportMaterials.includes(mat.id));
    if (selectedMaterials.length > 0) {
        // Check for digital materials
        const digitalMats = selectedMaterials.filter(m => m.digitalContent);
        const digitalContentData = {};
        digitalMats.forEach(dm => { digitalContentData[dm.id] = dm.digitalContent; });
        const digitalContentJSON = JSON.stringify(digitalContentData)
            .replace(/`/g, '\\`')             // Escape backticks for template literals
            .replace(/\$\{/g, '\\${')         // Escape template expressions
            .replace(/</g, '\\u003c')         // Escape < for HTML safety
            .replace(/>/g, '\\u003e');        // Escape > for HTML safety
        
        sectionsHTML += '<section id="materials" class="mb-12"><h2 class="text-2xl font-bold ' + headingTextClass + ' mb-6 border-b border-slate-700 pb-2">Materials</h2>';
        
        // Material viewer container
        sectionsHTML += '<div id="material-viewer" class="hidden mb-8 bg-black rounded-xl border border-slate-700 overflow-hidden shadow-2xl">' +
            '<div class="flex justify-between items-center p-3 bg-slate-800 border-b border-slate-700">' +
            '<span id="material-viewer-title" class="text-xs font-bold text-white uppercase tracking-widest px-2">Material Viewer</span>' +
            '<button data-close-material-viewer class="text-xs text-rose-400 hover:text-white font-bold uppercase tracking-widest px-2">Close X</button>' +
            '</div>' +
            '<iframe id="material-frame" src="" width="100%" height="600" style="border:none;"></iframe>' +
            '</div>';
        
        // Digital reader container (for single module export)
        if (digitalMats.length > 0) {
            sectionsHTML += '<div id="digital-reader-container" class="hidden mb-8 bg-slate-900 rounded-xl border border-emerald-500/30 overflow-hidden shadow-2xl">' +
                '<div class="flex justify-between items-center p-3 bg-slate-800 border-b border-emerald-500/30">' +
                '<span id="reader-title" class="text-xs font-bold text-emerald-400 uppercase tracking-widest px-2 flex items-center gap-2">Digital Resource</span>' +
                '<button data-close-digital-reader class="text-xs text-rose-400 hover:text-white font-bold uppercase tracking-widest px-2">Close X</button>' +
                '</div>' +
                '<div class="flex" style="height: 600px;">' +
                '<div id="reader-toc" class="w-64 bg-slate-950 border-r border-slate-700 p-4 overflow-y-auto hidden md:block">' +
                '<h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Contents</h4>' +
                '<div id="reader-toc-items" class="space-y-1"></div>' +
                '</div>' +
                '<div id="reader-content" class="flex-1 p-6 md:p-8 overflow-y-auto">' +
                '<div id="reader-body" class="prose prose-invert max-w-none"></div>' +
                '<div class="flex justify-between items-center mt-8 pt-4 border-t border-slate-700">' +
                '<button data-prev-chapter id="prev-btn" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded-lg transition-all disabled:opacity-30">Previous</button>' +
                '<span id="reader-progress" class="text-xs text-slate-500"></span>' +
                '<button data-next-chapter id="next-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-lg transition-all disabled:opacity-30">Next</button>' +
                '</div></div></div></div>';
        }
        
        const defaultMaterialTheme = courseSettings.defaultMaterialTheme || 'dark';
        const materialThemeMap = {
            dark: { cardBg: 'bg-slate-900', cardBorder: 'border-slate-700', heading: 'text-white', body: 'text-slate-400' },
            light: { cardBg: 'bg-white', cardBorder: 'border-slate-300', heading: 'text-slate-900', body: 'text-slate-600' },
            muted: { cardBg: 'bg-slate-800', cardBorder: 'border-slate-700', heading: 'text-slate-200', body: 'text-slate-500' },
            'high-contrast-light': { cardBg: 'bg-white', cardBorder: 'border-slate-300', heading: 'text-black', body: 'text-slate-800' },
            'high-contrast-dark': { cardBg: 'bg-black', cardBorder: 'border-slate-600', heading: 'text-white', body: 'text-slate-300' }
        };
        
        sectionsHTML += '<div id="materials-list" class="space-y-4">';
        selectedMaterials.forEach((mat, idx) => {
            const themeKey = (mat.themeOverride != null && mat.themeOverride !== '') ? mat.themeOverride : defaultMaterialTheme;
            const theme = materialThemeMap[themeKey] || materialThemeMap.dark;
            const colorClass = mat.color || 'slate';
            const borderClass = colorClass !== 'slate' ? 'border-l-4 border-l-' + colorClass + '-500' : '';
            const textColorClass = colorClass !== 'slate' ? 'text-' + colorClass + '-500' : theme.body;
            const buttonColorClass = buttonBgClass + ' ' + buttonHoverClass;
            const badgeLabel = getMaterialBadgeLabel(mat) || mat.number || '';
            const badgeTextClass = mat.mediaType && mat.mediaType !== 'number'
              ? 'text-[9px] font-black uppercase tracking-widest'
              : 'font-black text-xl';
            
            const previewUrl = mat.viewUrl ? mat.viewUrl.replace('/view', '/preview') : '';
            let buttonsHTML = '';
            if (mat.viewUrl) {
                const escapedPreviewUrl = previewUrl.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                const escapedTitle = mat.title.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                buttonsHTML += '<button data-material-viewer-url="' + escapedPreviewUrl + '" data-material-viewer-title="' + escapedTitle + '" class="material-viewer-btn flex-1 ' + buttonColorClass + ' ' + buttonTextClass + ' text-xs font-bold uppercase px-6 py-3 rounded-lg border border-slate-600 transition-all text-center">View Inline</button>';
            }
            if (mat.downloadUrl) {
                buttonsHTML += '<a href="' + mat.downloadUrl + '" target="_blank" class="flex-1 ' + buttonColorClass + ' ' + buttonTextClass + ' text-xs font-bold uppercase px-6 py-3 rounded-lg transition-all text-center">Download</a>';
            }
            if (mat.digitalContent) {
                buttonsHTML += '<button data-digital-reader="' + mat.id + '" class="digital-reader-btn flex-1 ' + buttonColorClass + ' ' + buttonTextClass + ' text-xs font-bold uppercase px-6 py-3 rounded-lg transition-all text-center flex items-center justify-center gap-2">Read</button>';
            }
            
            sectionsHTML += '<div class="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-xl border ' + theme.cardBorder + ' ' + theme.cardBg + ' ' + borderClass + '">' +
                '<div class="flex items-center gap-4">' +
                '<div class="w-12 h-12 rounded-lg flex items-center justify-center ' + textColorClass + ' ' + badgeTextClass + ' border border-slate-700">' + badgeLabel + '</div>' +
                '<div>' +
                '<h3 class="text-lg font-bold ' + theme.heading + ' uppercase italic">' + mat.title + '</h3>' +
                '<p class="text-xs ' + theme.body + '">' + (mat.description || '') + '</p>' +
                '</div></div>' +
                '<div class="flex gap-3 w-full md:w-auto">' + buttonsHTML + '</div></div>';
        });
        sectionsHTML += '</div></section>';
        
        // Add event delegation for Material Viewer buttons (always needed for materials)
        combinedScripts += `
// Material Viewer Event Delegation
document.addEventListener('click', function(e) {
    // Material Viewer button
    var materialBtn = e.target.closest('[data-material-viewer-url]');
    if (materialBtn) {
        e.preventDefault();
        var url = materialBtn.getAttribute('data-material-viewer-url');
        var title = materialBtn.getAttribute('data-material-viewer-title');
        if (typeof window.openMaterialViewer === 'function') {
            window.openMaterialViewer(url, title);
        } else {
            // Fallback
            var viewer = document.getElementById('material-viewer');
            var frame = document.getElementById('material-frame');
            var titleEl = document.getElementById('material-viewer-title');
            if (viewer && frame && titleEl) {
                frame.src = url;
                titleEl.textContent = title;
                viewer.classList.remove('hidden');
                viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
    
    // Close Material Viewer button
    if (e.target.closest('#material-viewer') && e.target.hasAttribute('data-close-material-viewer')) {
        if (typeof window.closeMaterialViewer === 'function') {
            window.closeMaterialViewer();
        } else {
            // Fallback
            var viewer = document.getElementById('material-viewer');
            var frame = document.getElementById('material-frame');
            if (viewer && frame) {
                viewer.classList.add('hidden');
                frame.src = '';
            }
        }
    }
});
`;
        
        // Add digital reader scripts if needed
        if (digitalMats.length > 0) {
            combinedScripts += `
// Digital Reader System - Using Event Delegation for Google Sites compatibility
var DIGITAL_CONTENT = ${digitalContentJSON};
var currentReader = { matId: null, chapterIdx: 0, data: null };

function openDigitalReaderFn(matId) {
    var content = DIGITAL_CONTENT[matId];
    if (!content) { console.error('No digital content for', matId); return; }
    
    currentReader = { matId: matId, chapterIdx: 0, data: content };
    
document.getElementById('reader-title').innerText = (content.title || 'Digital Resource');
    
    // Build table of contents (using data attributes, not onclick)
    var tocHTML = '';
    (content.chapters || []).forEach(function(ch, idx) {
        tocHTML += '<button data-toc-chapter="' + idx + '" class="toc-item w-full text-left px-3 py-2 rounded text-xs hover:bg-slate-800 transition-colors ' + (idx === 0 ? 'bg-emerald-900/50 text-emerald-400' : 'text-slate-400') + '" data-chapter="' + idx + '">' +
            '<span class="font-bold">' + (ch.number || (idx + 1)) + '.</span> ' + ch.title +
        '</button>';
    });
    document.getElementById('reader-toc-items').innerHTML = tocHTML;
    
    renderChapterFn(0);
    
    document.getElementById('digital-reader-container').classList.remove('hidden');
    document.getElementById('materials-list').classList.add('hidden');
    document.getElementById('material-viewer').classList.add('hidden');
}

function closeDigitalReaderFn() {
    document.getElementById('digital-reader-container').classList.add('hidden');
    document.getElementById('materials-list').classList.remove('hidden');
    currentReader = { matId: null, chapterIdx: 0, data: null };
}

function renderChapterFn(idx) {
    if (!currentReader.data || !currentReader.data.chapters) return;
    var chapters = currentReader.data.chapters;
    if (idx < 0 || idx >= chapters.length) return;
    
    currentReader.chapterIdx = idx;
    var chapter = chapters[idx];
    
    var html = '<h2 class="text-2xl font-bold text-white mb-2">' + (chapter.number || (idx + 1)) + '. ' + chapter.title + '</h2>';
    
    (chapter.sections || []).forEach(function(sec) {
        html += '<div class="mt-6">';
        if (sec.heading) {
            html += '<h3 class="text-lg font-bold text-emerald-400 mb-3">' + sec.heading + '</h3>';
        }
        var content = (sec.content || '').replace(/\\n/g, '<br>').replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>').replace(/\\*(.+?)\\*/g, '<em>$1</em>').replace(/^- /gm, '- ');
        html += '<div class="text-slate-300 leading-relaxed whitespace-pre-line">' + content + '</div>';
        html += '</div>';
    });
    
    document.getElementById('reader-body').innerHTML = html;
    
    document.querySelectorAll('.toc-item').forEach(function(btn) {
        var chIdx = parseInt(btn.getAttribute('data-chapter'));
        if (chIdx === idx) {
            btn.classList.add('bg-emerald-900/50', 'text-emerald-400');
            btn.classList.remove('text-slate-400');
        } else {
            btn.classList.remove('bg-emerald-900/50', 'text-emerald-400');
            btn.classList.add('text-slate-400');
        }
    });
    
    document.getElementById('prev-btn').disabled = idx === 0;
    document.getElementById('next-btn').disabled = idx === chapters.length - 1;
    document.getElementById('reader-progress').textContent = 'Chapter ' + (idx + 1) + ' of ' + chapters.length;
    
    document.getElementById('reader-content').scrollTop = 0;
}

// EVENT DELEGATION for Digital Reader - More reliable in sandboxed environments like Google Sites
document.addEventListener('click', function(e) {
    // Digital Reader button
    var readerBtn = e.target.closest('[data-digital-reader]');
    if (readerBtn) {
        e.preventDefault();
        openDigitalReaderFn(readerBtn.getAttribute('data-digital-reader'));
        return;
    }
    
    // Close Digital Reader button
    if (e.target.closest('#digital-reader-container') && e.target.hasAttribute('data-close-digital-reader')) {
        closeDigitalReaderFn();
        return;
    }
    
    // TOC chapter buttons
    var tocBtn = e.target.closest('[data-toc-chapter]');
    if (tocBtn) {
        renderChapterFn(parseInt(tocBtn.getAttribute('data-toc-chapter')));
        return;
    }
    
    // Prev/Next buttons
    if (e.target.closest('#prev-btn') || e.target.closest('[data-prev-chapter]')) {
        renderChapterFn(currentReader.chapterIdx - 1);
        return;
    }
    if (e.target.closest('#next-btn') || e.target.closest('[data-next-chapter]')) {
        renderChapterFn(currentReader.chapterIdx + 1);
        return;
    }
});

console.log('ðŸ“– Digital Reader initialized with event delegation (Single Module)');
`;
        }
    }

    // Tools
    if (selectedTools.length > 0) {
        sectionsHTML += '<section id="toolkit" class="mb-12"><h2 class="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-2">ðŸ› ï¸ Tools</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
        selectedTools.forEach(tool => {
            let toolCode = tool.code;
            if (typeof toolCode === 'string') { try { toolCode = JSON.parse(toolCode); } catch(e){} }
            
            if (toolCode.html) {
                const visibleHTML = toolCode.html.replace(/hidden fixed/g, 'relative block bg-slate-800 p-4 rounded-xl border border-slate-700').replace(/fixed bottom-4/g, 'relative');
                sectionsHTML += '<div>' + visibleHTML + '</div>';
            }
            if (toolCode.script) combinedScripts += '// --- TOOL: ' + tool.title + ' ---\n' + toolCode.script + '\n\n';
        });
        sectionsHTML += '</div></section>';
    }

    // Build autosave script for single module export
    const moduleTitle = selectedMod.title.replace(/[^a-zA-Z0-9]/g, '_');
    const autosaveScript = `
// ========================================
// GLOBAL AUTOSAVE SYSTEM (Single Module)
// ========================================
(function() {
    var COURSE_KEY = 'CF_Module_' + '${moduleTitle}' + '_v1';
    var hasExported = false;
    var saveTimeout = null;
    
    function getAllInputState() {
        var state = {};
        document.querySelectorAll('input, textarea, select').forEach(function(el, i) {
            var key = el.id || el.name || ('field_' + i);
            if (el.type === 'checkbox' || el.type === 'radio') {
                if (el.checked) state[key] = el.type === 'radio' ? el.value : true;
            } else {
                if (el.value) state[key] = el.value;
            }
        });
        return state;
    }
    
    function restoreInputState(state) {
        if (!state) return;
        document.querySelectorAll('input, textarea, select').forEach(function(el, i) {
            var key = el.id || el.name || ('field_' + i);
            var savedValue = state[key];
            if (savedValue !== undefined) {
                if (el.type === 'checkbox') {
                    el.checked = !!savedValue;
                } else if (el.type === 'radio') {
                    el.checked = (el.value === savedValue);
                } else {
                    el.value = savedValue;
                }
            }
        });
    }
    
    function saveNow() {
        try {
            var state = getAllInputState();
            if (Object.keys(state).length > 0) {
                localStorage.setItem(COURSE_KEY, JSON.stringify({ t: Date.now(), state: state }));
            }
        } catch(e) {}
    }
    
    function debouncedSave() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveNow, 1000);
    }
    
    function loadSaved() {
        try {
            var raw = localStorage.getItem(COURSE_KEY);
            if (raw) {
                var data = JSON.parse(raw);
                if (data.state) restoreInputState(data.state);
            }
        } catch(e) {}
    }
    
    window.markWorkSaved = function() { hasExported = true; };
    
    setTimeout(loadSaved, 100);
    document.addEventListener('input', debouncedSave);
    document.addEventListener('change', debouncedSave);
    window.addEventListener('pagehide', saveNow);
    window.addEventListener('beforeunload', function(e) {
        saveNow();
        if (!hasExported) {
            var state = getAllInputState();
            if (Object.keys(state).length > 0) {
                e.preventDefault();
                e.returnValue = 'You have unsaved work. Are you sure you want to leave?';
            }
        }
    });
})();
`;

    const finalHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${selectedMod.title}</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link href="${font.url}" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
  <script>tailwind.config = { darkMode: "class", theme: { extend: { fontFamily: { sans: ["${fontName}", "sans-serif"], mono: ["JetBrains Mono", "monospace"] } } } }<\/script>
  <style>
    body { ${font.css} background-color: ${bgHex}; color: ${isLightBg ? '#0f172a' : '#e2e8f0'}; min-height: 100vh; overflow-x: hidden; }
    .mono { font-family: "JetBrains Mono", monospace; }
    .glass { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(51, 65, 85, 0.5); }
    input:not(.assessment-input), textarea:not(.assessment-input), select:not(.assessment-input) { background: #0f172a !important; border: 1px solid #1e293b !important; color: #e2e8f0; }
    input:not(.assessment-input):focus, textarea:not(.assessment-input):focus, select:not(.assessment-input):focus { border-color: #0ea5e9 !important; outline: none; box-shadow: 0 0 0 1px #0ea5e9; }
    .score-btn, .mod-nav-btn { background: #0f172a; border: 1px solid #1e293b; color: #64748b; transition: all 0.2s; }
    .score-btn:hover, .mod-nav-btn:hover { border-color: #0ea5e9; color: white; }
    .score-btn.active, .mod-nav-btn.active { background: #0ea5e9; color: #000; font-weight: 900; border-color: #0ea5e9; }
    .step-content { display: none; }
    .step-content.active { display: block; }
    .assessment-container.hidden { display: none; }
    #assessment-list.hidden { display: none; }
    .rubric-cell { cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
    .rubric-cell:hover { background: rgba(255,255,255,0.05); }
    .active-proficient { background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #10b981; }
    .active-developing { background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #f59e0b; }
    .active-emerging { background: rgba(244, 63, 94, 0.2); border: 1px solid #f43f5e; color: #f43f5e; }
    .helper-text { font-size: 8px; color: #64748b; font-style: italic; margin-top: 4px; }
    :root { --cf-container-bg: ${containerBgRgba}; }
    .assessment-container [class*="bg-slate-9"],
    .assessment-container [class*="bg-slate-8"],
    .assessment-container [class*="bg-slate-7"],
    .assessment-container [class*="bg-slate-6"],
    .assessment-container [class*="bg-gray-9"],
    .assessment-container [class*="bg-gray-8"],
    .assessment-container [class*="bg-gray-7"] {
      background: var(--cf-container-bg) !important;
    }
  </style>
</head>
<body class="p-4 md:p-8 max-w-6xl mx-auto">
  ${sectionsHTML}
  <script>${combinedScripts}${autosaveScript}<\/script>
</body>
</html>`;

      setExportedHTML(finalHTML);
    } catch (error) {
      if (onError) {
        onError('compile', `Failed to generate module page HTML: ${error.message}`, error.stack);
      }
      console.error('Module page generation error:', error);
    }
  };

  const generateHubPage = () => {
    const courseSettings = projectData["Course Settings"] || {};
    const accentColor = courseSettings.accentColor || "sky";
    const backgroundColor = courseSettings.backgroundColor || "slate-900";
    const fontFamily = courseSettings.fontFamily || "inter";
    const font = getFontFamilyGlobal(fontFamily);
    
    const bgColorMap = {
      'slate-900': '#0f172a',
      'slate-950': '#020617',
      'zinc-900': '#18181b',
      'neutral-900': '#171717',
      'stone-900': '#1c1917',
      'gray-900': '#111827',
      'slate-50': '#f8fafc',
      'zinc-50': '#fafafa',
      'neutral-50': '#fafafa',
      'stone-50': '#fafaf9',
      'gray-50': '#f9fafb',
      'white': '#ffffff'
    };
    const bgHex = bgColorMap[backgroundColor] || bgColorMap['slate-900'];
    const isLightBg = ['slate-50', 'zinc-50', 'neutral-50', 'stone-50', 'gray-50', 'white'].includes(backgroundColor);
    const headingTextColor = courseSettings.headingTextColor || (isLightBg ? 'slate-900' : 'white');
    const secondaryTextColor = courseSettings.secondaryTextColor || (isLightBg ? 'slate-600' : 'slate-400');
    const buttonColor = courseSettings.buttonColor || `${accentColor}-600`;
    const toTextClass = (value) => value.startsWith('text-') ? value : `text-${value}`;
    const toBgBase = (value) => value.startsWith('bg-') ? value.slice(3) : value;
    const headingTextClass = toTextClass(headingTextColor);
    const secondaryTextClass = toTextClass(secondaryTextColor);
    const buttonBgBase = toBgBase(buttonColor);
    const buttonBgClass = `bg-${buttonBgBase}`;
    const buttonHoverClass = buttonBgBase.endsWith('-600') ? `hover:bg-${buttonBgBase.replace(/-600$/, '-500')}` : `hover:bg-${buttonBgBase}`;
    const buttonTextClass = secondaryTextClass;
    const badgeBgClass = isLightBg ? 'bg-black/10' : 'bg-white/20';
    const containerColor = courseSettings.containerColor || (isLightBg ? 'white/80' : 'slate-900/80');
    const hexToRgba = (hex, alpha = 1) => {
      if (!hex) return `rgba(15, 23, 42, ${alpha})`;
      const clean = hex.replace('#', '');
      if (clean.length !== 6) return `rgba(15, 23, 42, ${alpha})`;
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    const parseColorToken = (value) => {
      const raw = (value || '').toString().trim();
      if (!raw) return { base: isLightBg ? 'white' : 'slate-900', alpha: 0.8, alphaRaw: '80' };
      let token = raw;
      if (token.startsWith('bg-')) token = token.slice(3);
      if (token.startsWith('text-')) token = token.slice(5);
      const parts = token.split('/');
      const base = parts[0] || (isLightBg ? 'white' : 'slate-900');
      const alphaRaw = parts[1] || null;
      const alpha = alphaRaw ? Math.max(0, Math.min(1, parseInt(alphaRaw, 10) / 100)) : 1;
      return { base, alpha, alphaRaw };
    };
    const colorHexMap = {
      'slate-900': '#0f172a',
      'slate-800': '#1e293b',
      'slate-700': '#334155',
      'slate-600': '#475569',
      'slate-500': '#64748b',
      'slate-950': '#020617',
      'gray-900': '#111827',
      'gray-800': '#1f2937',
      'gray-700': '#374151',
      'gray-600': '#4b5563',
      'zinc-900': '#18181b',
      'zinc-800': '#27272a',
      'neutral-900': '#171717',
      'stone-900': '#1c1917',
      'white': '#ffffff'
    };
    const containerToken = parseColorToken(containerColor);
    const containerBgClass = containerToken.alphaRaw ? `bg-${containerToken.base}/${containerToken.alphaRaw}` : `bg-${containerToken.base}`;
    const containerHex = colorHexMap[containerToken.base] || (isLightBg ? '#ffffff' : '#0f172a');
    const containerBgRgba = hexToRgba(containerHex, containerToken.alpha);
    const cardBorderClass = isLightBg ? 'border-slate-300' : 'border-slate-700';

    // Filter out special modules
    const regularModules = modules.filter(m => {
      let itemCode = m.code || {};
      if (typeof itemCode === 'string') {
        try { itemCode = JSON.parse(itemCode); } catch(e) {}
      }
      return itemCode.id !== 'view-materials' && 
             m.title !== 'Assessments' &&
             !m.title.includes('Empty');
    });
    
    const allAssessments = modules.flatMap(m => m.assessments || []);
    const assessmentCount = allAssessments.length;
    const materialCount = materials.length;
    
    // Generate module cards
    let moduleCardsHTML = '';
    regularModules.forEach((mod, idx) => {
      const modAssessments = mod.assessments || [];
      const colorClasses = [
        'from-rose-500 to-pink-500',
        'from-amber-500 to-orange-500',
        'from-emerald-500 to-teal-500',
        'from-sky-500 to-blue-500',
        'from-purple-500 to-violet-500',
        'from-indigo-500 to-purple-500'
      ];
      const gradientClass = colorClasses[idx % colorClasses.length];
      
      moduleCardsHTML += `
        <div class="group relative ${containerBgClass} rounded-2xl border ${cardBorderClass} overflow-hidden hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-${gradientClass.split(' ')[0].split('-')[1]}-500/20">
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClass}"></div>
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-black text-xl shadow-lg">
                ${idx + 1}
              </div>
              <div class="flex gap-2">
                ${modAssessments.length > 0 ? `<span class="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-purple-400 text-xs font-bold">${modAssessments.length} ${modAssessments.length === 1 ? 'Assessment' : 'Assessments'}</span>` : ''}
              </div>
            </div>
            <h3 class="text-xl font-black ${headingTextClass} mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:${gradientClass} transition-all">
              ${mod.title}
            </h3>
            <p class="text-sm ${secondaryTextClass} mb-4 line-clamp-2">
              ${mod.description || 'Click to explore this module'}
            </p>
            <div class="flex gap-3">
              <button 
                onclick="window.open('MODULE_${mod.id}_URL', '_blank')"
                class="flex-1 bg-gradient-to-r ${gradientClass} text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                Start Module
              </button>
            </div>
          </div>
        </div>
      `;
    });
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${hubCourseTitle}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="${font.url}" rel="stylesheet">
    <style>
        body {
            ${font.css}
            background: ${bgHex};
            background-color: ${bgHex};
            min-height: 100vh;
        }
        :root { --cf-container-bg: ${containerBgRgba}; }
        .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .hero-gradient {
            background: ${bgHex};
            background-color: ${bgHex};
        }
        .stat-card {
            background: var(--cf-container-bg);
            backdrop-filter: blur(10px);
        }
    </style>
</head>
<body class="antialiased">
    <!-- Hero Section -->
    <div class="hero-gradient">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="text-center">
                <h1 class="text-5xl md:text-6xl font-black ${headingTextClass} mb-4 tracking-tight">
                    ${hubCourseTitle}
                </h1>
                <p class="text-xl ${secondaryTextClass} mb-8 max-w-2xl mx-auto">
                    ${hubCourseDescription}
                </p>
                <div class="flex flex-wrap justify-center gap-4">
                    ${materialCount > 0 ? `
                    <a href="MATERIALS_PAGE_URL" target="_blank" class="${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
                        Course Materials
                        <span class="${badgeBgClass} px-2 py-1 rounded text-sm">${materialCount}</span>
                    </a>
                    ` : ''}
                    ${assessmentCount > 0 ? `
                    <a href="ASSESSMENTS_PAGE_URL" target="_blank" class="${buttonBgClass} ${buttonHoverClass} ${buttonTextClass} px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
                        All Assessments
                        <span class="${badgeBgClass} px-2 py-1 rounded text-sm">${assessmentCount}</span>
                    </a>
                    ` : ''}
                </div>
            </div>
        </div>
    </div>

    <!-- Stats Bar -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="stat-card border ${cardBorderClass} rounded-xl p-6 text-center">
                <div class="text-4xl font-black text-sky-400 mb-2">${regularModules.length}</div>
                <div class="text-sm ${secondaryTextClass} uppercase tracking-wider font-bold">Modules</div>
            </div>
            <div class="stat-card border ${cardBorderClass} rounded-xl p-6 text-center">
                <div class="text-4xl font-black text-purple-400 mb-2">${assessmentCount}</div>
                <div class="text-sm ${secondaryTextClass} uppercase tracking-wider font-bold">Assessments</div>
            </div>
            <div class="stat-card border ${cardBorderClass} rounded-xl p-6 text-center">
                <div class="text-4xl font-black text-emerald-400 mb-2">${materialCount}</div>
                <div class="text-sm ${secondaryTextClass} uppercase tracking-wider font-bold">Materials</div>
            </div>
        </div>
    </div>

    <!-- Modules Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="mb-12">
            <h2 class="text-3xl font-black ${headingTextClass} mb-2">Course Modules</h2>
            <p class="${secondaryTextClass}">Select a module to begin your journey</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${moduleCardsHTML}
        </div>
    </div>

    <!-- Footer -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-800">
    <div class="text-center ${secondaryTextClass} text-sm">
      <p class="font-bold">Built with Course Factory</p>
      <p class="mt-2">Ready to begin? Click any module above to start.</p>
    </div>
    </div>

    <script>
        // Progress tracking (localStorage based)
        const courseId = '${projectData["Current Course"]?.name || "course"}';
        const progressKey = courseId + '_progress';
        
        function getProgress() {
            try {
                return JSON.parse(localStorage.getItem(progressKey) || '{}');
            } catch(e) {
                return {};
            }
        }
        
        function saveProgress(moduleId, status) {
            const progress = getProgress();
            progress[moduleId] = status;
            localStorage.setItem(progressKey, JSON.stringify(progress));
        }
        
        console.log('Hub Page Loaded - Course: ${hubCourseTitle}');
    <\/script>
</body>
</html>`;
    
    setHubPageHTML(htmlContent);
  };

  const generateFullSite = () => {
    try {
      const finalCode = buildSiteHtml({
        modules,
        toolkit,
        excludedIds,
        initialViewKey: null,
        projectData
      });
      setFullSiteCode(finalCode);
      setIsGenerated(true);
    } catch (error) {
      if (onError) {
        onError('compile', `Failed to compile full site: ${error.message}`, error.stack);
      }
      console.error('Full site compilation error:', error);
      setIsGenerated(false);
    }
  };

  const handleCompileClick = () => {
    const v = validateProject(projectData);
    if (!v.isValid) {
      setCompileValidation(v);
      return;
    }
    setCompileValidation(v.warnings.length > 0 ? v : null);
    generateFullSite();
  };

  const downloadFile = () => {
    const blob = new Blob([fullSiteCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    // Apply export settings from Phase 5
    const exportSettings = projectData["Course Settings"]?.exportSettings || {};
    const courseName = projectData["Course Settings"]?.courseName || "course";
    let filename = exportSettings.filenamePattern || "{courseName}_compiled";
    
    // Replace placeholders
    filename = filename.replace(/{courseName}/g, courseName.replace(/[^a-zA-Z0-9]/g, '_'));
    
    // Add timestamp if enabled
    if (exportSettings.includeTimestamp) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      filename += `_${timestamp}`;
    }
    
    a.download = `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Package className="text-purple-400" /> Phase 4: Compile & Export
        </h2>

        {/* --- PUBLISHING MODE SELECTOR --- */}
        <div className="mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Publishing Mode</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPublishMode('legacy')}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                publishMode === 'legacy'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Legacy Compile (Single HTML)
            </button>
            <button
              onClick={() => setPublishMode('beta')}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                publishMode === 'beta'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Static Multi-File Publish
              <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-black">BETA</span>
            </button>
          </div>
        </div>

        {/* --- BETA STATIC PUBLISH UI --- */}
        {publishMode === 'beta' && (
          <div className="mb-8 bg-gradient-to-br from-emerald-900/20 to-slate-900/50 p-6 rounded-xl border border-emerald-500/30">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Zap size={20} className="text-emerald-400" /> Static Multi-File Publish
              <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-black">BETA</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Generate a proper static site structure with <code className="bg-slate-800 px-1 rounded">index.html</code>, <code className="bg-slate-800 px-1 rounded">manifest.json</code>, and individual module pages in <code className="bg-slate-800 px-1 rounded">modules/</code> folder.
            </p>

            {/* Structure Mode Selector */}
            <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Site Structure</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBetaStructureMode('multi-file')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs transition-all ${
                    betaStructureMode === 'multi-file'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Multi-File (Separate Pages)
                </button>
                <button
                  onClick={() => setBetaStructureMode('single-page')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs transition-all ${
                    betaStructureMode === 'single-page'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Single-Page App (With Sidebar)
                </button>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                {betaStructureMode === 'multi-file' ? (
                  <span>âœ… Separate HTML files per module â€¢ Bookmarkable URLs â€¢ Delta publish support</span>
                ) : (
                  <span>âœ… Single HTML file â€¢ Sidebar navigation â€¢ Instant switching â€¢ State preserved</span>
                )}
              </div>
            </div>

            {/* Status indicator */}
            {betaPublishStatus && (
              <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
                betaPublishStatus === 'loading' ? 'bg-sky-900/50 border border-sky-700 text-sky-300' :
                betaPublishStatus === 'success' ? 'bg-emerald-900/50 border border-emerald-700 text-emerald-300' :
                'bg-rose-900/50 border border-rose-700 text-rose-300'
              }`}>
                {betaPublishStatus === 'loading' && (
                  <RefreshCw size={14} className="animate-spin" />
                )}
                {betaPublishStatus === 'success' && <CheckCircle size={14} />}
                {betaPublishStatus === 'error' && <AlertTriangle size={14} />}
                {betaPublishMessage}
              </div>
            )}

            {/* Full Publish Section */}
            <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <h4 className="text-sm font-bold text-emerald-400 mb-2 uppercase tracking-wider">Full Publish</h4>
              <p className="text-xs text-slate-500 mb-4">Downloads a complete ZIP containing all active modules.</p>
              
              {/* Preview of files to be generated */}
              <div className="mb-4 p-3 bg-slate-950 rounded border border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Files to be generated:</div>
                <div className="text-xs font-mono text-slate-400 space-y-1">
                  {betaStructureMode === 'multi-file' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400"><FileCode size={14} /></span> index.html
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400"><FileJson size={14} /></span> manifest.json
                      </div>
                      {modules.filter(m => !excludedIds.includes(m.id) && !m.hidden).map(m => (
                        <div key={m.id} className="flex items-center gap-2 pl-2">
                          <span className="text-sky-400"><FolderOpen size={14} /></span> modules/{m.id}.html
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400"><FileCode size={14} /></span> index.html (single-page app with sidebar)
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400"><FileJson size={14} /></span> manifest.json
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handleFullPublishBeta}
                disabled={betaPublishStatus === 'loading' || modules.filter(m => !excludedIds.includes(m.id) && !m.hidden).length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Download size={16} /> Full Publish (ZIP)
              </button>
            </div>

            {/* Delta Publish Section (only for multi-file mode) */}
            {betaStructureMode === 'multi-file' && (
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <h4 className="text-sm font-bold text-sky-400 mb-2 uppercase tracking-wider">Delta Publish (Selected Modules Only)</h4>
              <p className="text-xs text-slate-500 mb-4">Select specific modules to include in a partial update ZIP.</p>

              {/* Include manifest checkbox */}
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={betaIncludeManifest}
                  onChange={(e) => setBetaIncludeManifest(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-900 text-sky-600"
                />
                <span className="text-sm text-slate-300">Include manifest.json</span>
              </label>

              {/* Module selection */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Select Modules</label>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllBetaModules}
                      className="text-[10px] text-sky-400 hover:text-sky-300 font-bold"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      onClick={deselectAllBetaModules}
                      className="text-[10px] text-slate-500 hover:text-slate-400 font-bold"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="bg-slate-950 rounded-lg border border-slate-800 max-h-48 overflow-y-auto p-2 space-y-1">
                  {modules.filter(m => !excludedIds.includes(m.id) && !m.hidden).map(m => (
                    <label key={m.id} className="flex items-center gap-2 p-2 rounded hover:bg-slate-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={betaSelectedModules.includes(m.id)}
                        onChange={() => toggleBetaModuleSelection(m.id)}
                        className="rounded border-slate-600 bg-slate-900 text-sky-600"
                      />
                      <span className="text-sm text-slate-300">{m.title}</span>
                      <span className="text-[10px] text-slate-600 font-mono ml-auto">{m.id}</span>
                    </label>
                  ))}
                  {modules.filter(m => !excludedIds.includes(m.id) && !m.hidden).length === 0 && (
                    <p className="text-xs text-slate-500 italic p-2 text-center">No active modules</p>
                  )}
                </div>
              </div>

              {/* Delta files preview */}
              {betaSelectedModules.length > 0 && (
                <div className="mb-4 p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Delta ZIP will contain:</div>
                  <div className="text-xs font-mono text-slate-400 space-y-1">
                    {betaIncludeManifest && (
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400"><FileJson size={14} /></span> manifest.json
                      </div>
                    )}
                    {betaSelectedModules.map(modId => {
                      const mod = modules.find(m => m.id === modId);
                      return (
                        <div key={modId} className="flex items-center gap-2 pl-2">
                          <span className="text-sky-400"><FolderOpen size={14} /></span> modules/{modId}.html
                          {mod && <span className="text-slate-600 text-[10px]">({mod.title})</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={handleDeltaPublishBeta}
                disabled={betaPublishStatus === 'loading' || betaSelectedModules.length === 0}
                className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Download size={16} /> Publish Selected (Delta ZIP)
                {betaSelectedModules.length > 0 && (
                  <span className="bg-sky-800 px-2 py-0.5 rounded text-xs">{betaSelectedModules.length} selected</span>
                )}
              </button>
            </div>
            )}
          </div>
        )}

        {/* --- EXPORT MODULE PAGE UI --- */}
        <div className="mb-8 bg-slate-900/50 p-6 rounded-xl border border-blue-500/30">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <LayoutTemplate size={20} className="text-blue-400" /> Export Single Module Page
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Primary Module</label>
                    <select 
                        value={exportModuleId} 
                        onChange={(e) => setExportModuleId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm"
                    >
                        <option value="">-- Choose a Module --</option>
                        {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                </div>

                {exportModuleId && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 h-48 overflow-y-auto">
                            <label className="block text-xs font-bold text-purple-400 uppercase mb-2 sticky top-0 bg-slate-950 pb-2">Include Assessments</label>
                            <div className="space-y-2">
                                {modules.flatMap(m => m.assessments || []).map(a => (
                                    <label key={a.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-900 p-1 rounded">
                                        <input 
                                            type="checkbox" 
                                            checked={exportAssessments.includes(a.id)}
                                            onChange={(e) => e.target.checked ? setExportAssessments([...exportAssessments, a.id]) : setExportAssessments(exportAssessments.filter(id => id !== a.id))}
                                            className="rounded border-slate-700 bg-slate-900 text-purple-600"
                                        />
                                        <span className="text-xs text-slate-300 truncate">{a.title}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 h-48 overflow-y-auto">
                            <label className="block text-xs font-bold text-cyan-400 uppercase mb-2 sticky top-0 bg-slate-950 pb-2">Include Materials</label>
                            <div className="space-y-2">
                                {materials.map(mat => (
                                    <label key={mat.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-900 p-1 rounded">
                                        <input 
                                            type="checkbox" 
                                            checked={exportMaterials.includes(mat.id)}
                                            onChange={(e) => e.target.checked ? setExportMaterials([...exportMaterials, mat.id]) : setExportMaterials(exportMaterials.filter(id => id !== mat.id))}
                                            className="rounded border-slate-700 bg-slate-900 text-cyan-600"
                                        />
                                        <span className="text-xs text-slate-300 truncate">{mat.title}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 h-48 overflow-y-auto">
                            <label className="block text-xs font-bold text-orange-400 uppercase mb-2 sticky top-0 bg-slate-950 pb-2">Include Tools</label>
                            <div className="space-y-2">
                                {toolkit.map(t => (
                                    <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-900 p-1 rounded">
                                        <input 
                                            type="checkbox" 
                                            checked={exportTools.includes(t.id)}
                                            onChange={(e) => e.target.checked ? setExportTools([...exportTools, t.id]) : setExportTools(exportTools.filter(id => id !== t.id))}
                                            className="rounded border-slate-700 bg-slate-900 text-orange-600"
                                        />
                                        <span className="text-xs text-slate-300 truncate">{t.title}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <button 
                    onClick={generateModulePageHTML} 
                    disabled={!exportModuleId}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FileCode size={16} /> Generate Module HTML
                </button>

                {exportedHTML && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-emerald-400">âœ… Successfully Generated!</span>
                            <button onClick={() => navigator.clipboard.writeText(exportedHTML)} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded flex items-center gap-1"><Copy size={12}/> Copy Code</button>
                        </div>
                        <textarea readOnly value={exportedHTML} className="w-full h-32 bg-black border border-emerald-900/50 rounded-lg p-3 text-[10px] font-mono text-emerald-500/80 focus:outline-none resize-y" />
                    </div>
                )}
            </div>
        </div>

        {/* --- LEGACY COMPILE UI (only shown in legacy mode) --- */}
        {publishMode === 'legacy' && (
        <>
        {!isGenerated ? (
            <div className="text-center py-6">
                <div className="mb-6 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden text-left">
                    <div className="p-3 bg-slate-800 border-b border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Build Configuration
                    </div>
                    <div className="divide-y divide-slate-800">
                        {modules.length === 0 && (
                             <div className="p-4 text-xs text-slate-500 italic text-center">No modules found. Go to Phase 1.</div>
                        )}
                        {modules.map((mod) => {
                            const isExcluded = excludedIds.includes(mod.id) || mod.hidden;
                            return (
                                <div key={mod.id} className="p-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${isExcluded ? 'bg-slate-600' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
                                        <span className={`text-sm ${isExcluded ? 'text-slate-500' : 'text-slate-200 font-medium'}`}>{mod.title}</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (mod.hidden && onToggleHidden) {
                                                // If hidden, show it first (which will also remove from excludedIds)
                                                onToggleHidden(mod.id);
                                            } else {
                                                // Otherwise toggle exclusion
                                                toggleModule(mod.id);
                                            }
                                        }}
                                        className={`relative w-10 h-5 rounded-full transition-colors ${!isExcluded ? 'bg-emerald-600' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${!isExcluded ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* GLOBAL TOOLKIT CONTROLS */}
                {toolkit.length > 0 && (
                    <div className="mb-6 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden text-left">
                        <div className="p-3 bg-slate-800 border-b border-slate-700 text-xs font-bold text-orange-500 uppercase tracking-wider">
                            Global Toolkit (Builder Controls)
                        </div>
                        <div className="divide-y divide-slate-800">
                            {toolkit.map((tool, idx) => (
                                <div key={tool.id || idx} className="p-4 hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${tool.enabled ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                            <div>
                                                <div className={`text-sm font-medium ${tool.enabled ? 'text-slate-200' : 'text-slate-500'}`}>{tool.title}</div>
                                                <div className="text-[10px] text-slate-500 italic">{tool.description}</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => toggleToolkitField(idx, 'enabled')}
                                            className={`relative w-10 h-5 rounded-full transition-colors ${tool.enabled ? 'bg-emerald-600' : 'bg-slate-700'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${tool.enabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                    {tool.enabled && (
                                        <div className="ml-5 mt-2 flex flex-wrap gap-3 text-[10px]">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox"
                                                    checked={!!tool.hiddenFromUser}
                                                    onChange={() => toggleToolkitField(idx, 'hiddenFromUser')}
                                                    className="w-3 h-3 rounded"
                                                />
                                                <span className="text-slate-400">Hidden from user</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox"
                                                    checked={!!tool.userToggleable}
                                                    onChange={() => toggleToolkitField(idx, 'userToggleable')}
                                                    disabled={!!tool.hiddenFromUser}
                                                    className="w-3 h-3 rounded disabled:opacity-30"
                                                />
                                                <span className={`${tool.hiddenFromUser ? 'text-slate-600' : 'text-slate-400'}`}>User can toggle</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox"
                                                    checked={!!tool.includeUi}
                                                    onChange={() => toggleToolkitField(idx, 'includeUi')}
                                                    className="w-3 h-3 rounded"
                                                />
                                                <span className="text-slate-400">Include UI</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Validation summary */}
                {compileValidation && (
                  <div className={`mb-6 rounded-xl border p-4 text-left ${compileValidation.errors.length > 0 ? 'bg-rose-950/40 border-rose-700' : 'bg-amber-950/40 border-amber-700'}`}>
                    {compileValidation.errors.length > 0 ? (
                      <>
                        <div className="flex items-center gap-2 text-rose-300 font-bold mb-2">
                          <AlertTriangle size={18} />
                          {compileValidation.errors.length} validation error{compileValidation.errors.length !== 1 ? 's' : ''} â€” fix before compiling
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-rose-200/90">
                          {compileValidation.errors.map((e, i) => (
                            <li key={i}>
                              <span className="text-rose-400/80">{typeof e === 'object' && e.context ? e.context + ': ' : ''}</span>
                              {typeof e === 'object' && e.message ? e.message : e}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : compileValidation.warnings.length > 0 ? (
                      <>
                        <div className="flex items-center gap-2 text-amber-300 font-bold mb-2">
                          <AlertTriangle size={18} />
                          {compileValidation.warnings.length} warning{compileValidation.warnings.length !== 1 ? 's' : ''}
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-amber-200/90">
                          {compileValidation.warnings.map((w, i) => (
                            <li key={i}>
                              <span className="text-amber-400/80">{typeof w === 'object' && w.context ? w.context + ': ' : ''}</span>
                              {typeof w === 'object' && w.message ? w.message : w}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                  </div>
                )}

                <button 
                    onClick={handleCompileClick}
                    disabled={modules.length === 0}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Package size={24} /> Compile Selected Modules
                </button>
            </div>
        ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-purple-400">Final Assembled Code (index.html)</h3>
                    <div className="flex gap-2">
                         <button 
                            onClick={downloadFile}
                            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded flex items-center gap-2"
                        >
                            <Download size={12} /> Download File
                        </button>
                        <button 
                            onClick={() => { setIsGenerated(false); setCompileValidation(null); }}
                            className="text-xs text-slate-500 hover:text-white px-2 py-1"
                        >
                            Reset
                        </button>
                    </div>
                </div>
                {compileValidation?.warnings?.length > 0 && (
                  <div className="mb-4 p-4 bg-amber-950/40 border border-amber-700 rounded-xl text-left">
                    <div className="flex items-center gap-2 text-amber-300 font-bold mb-2">
                      <AlertTriangle size={16} />
                      Compiled with {compileValidation.warnings.length} warning{compileValidation.warnings.length !== 1 ? 's' : ''}
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-amber-200/90">
                      {compileValidation.warnings.map((w, i) => (
                        <li key={i}>
                          <span className="text-amber-400/80">{typeof w === 'object' && w.context ? w.context + ': ' : ''}</span>
                          {typeof w === 'object' && w.message ? w.message : w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <CodeBlock label="Full Website Source" code={fullSiteCode} height="h-96" />
                <div className="mt-4 p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg text-sm text-purple-200">
                    <strong>Next Step:</strong> Download the file above, or copy the block and paste it into your Google Sites "Embed Code" widget.
                </div>
            </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

// --- PHASE 5: SETTINGS & PREFERENCES ---
const Phase5Settings = ({ projectData, setProjectData }) => {
  const settings = projectData["Course Settings"] || {
    courseName: "Mental Fitness",
    courseCode: "",
    instructor: "",
    academicYear: "",
    accentColor: "sky",
    backgroundColor: "slate-900", // Default dark background
    fontFamily: "inter", // Default font
    customCSS: "",
    compilationDefaults: {
      includeMaterials: true,
      includeAssessments: true,
      includeToolkit: true,
      enableProgressTracking: true
    },
    exportSettings: {
      filenamePattern: "{courseName}_compiled",
      includeTimestamp: true
    }
  };
  
  const modules = projectData["Current Course"]?.modules || [];
  const assessmentsModule = modules.find(m => m.id === "item-assessments" || m.title === "Assessments");
  const courseAssessments = (assessmentsModule?.assessments || []).filter(a => !a.hidden);
  const courseMaterials = projectData["Current Course"]?.materials || [];
  
  const updateSettings = (updates) => {
    setProjectData(prev => ({
      ...prev,
      "Course Settings": {
        ...prev["Course Settings"],
        ...updates
      }
    }));
  };
  
  const updateCompilationDefaults = (updates) => {
    updateSettings({
      compilationDefaults: {
        ...(settings.compilationDefaults || {}),
        ...updates
      }
    });
  };
  
  const exportProject = () => {
    const dataStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${settings.courseName.replace(/\s+/g, '_')}_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const importProject = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported && imported["Current Course"]) {
          setProjectData(imported);
          alert('âœ… Project imported successfully!');
        } else {
          alert('âŒ Invalid project file');
        }
      } catch (error) {
        alert('âŒ Failed to import: ' + error.message);
      }
    };
    reader.readAsText(file);
  };
  
  const resetProject = () => {
    if (window.confirm('âš ï¸ This will delete all your course data! Are you sure?')) {
      localStorage.removeItem('course_factory_v2_data');
      window.location.reload();
    }
  };
  
  const colorOptions = [
    { value: 'sky', label: 'Sky Blue', class: 'bg-sky-500' },
    { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
    { value: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
    { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
    { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
    { value: 'teal', label: 'Teal', class: 'bg-teal-500' }
  ];
  
  const textColorOptions = [
    { value: 'white', label: 'White', swatch: 'bg-white border-slate-300', text: 'text-slate-900' },
    { value: 'slate-900', label: 'Slate 900', swatch: 'bg-slate-900 border-slate-700', text: 'text-white' },
    { value: 'slate-700', label: 'Slate 700', swatch: 'bg-slate-700 border-slate-600', text: 'text-white' },
    { value: 'slate-600', label: 'Slate 600', swatch: 'bg-slate-600 border-slate-500', text: 'text-white' },
    { value: 'slate-500', label: 'Slate 500', swatch: 'bg-slate-500 border-slate-400', text: 'text-white' },
    { value: 'gray-900', label: 'Gray 900', swatch: 'bg-gray-900 border-gray-700', text: 'text-white' },
    { value: 'gray-700', label: 'Gray 700', swatch: 'bg-gray-700 border-gray-600', text: 'text-white' },
    { value: 'gray-600', label: 'Gray 600', swatch: 'bg-gray-600 border-gray-500', text: 'text-white' }
  ];
  
  const assessmentTextColorOptions = [
    { value: 'white', label: 'White', swatch: 'bg-white border-slate-300', text: 'text-slate-900' },
    { value: 'slate-900', label: 'Slate 900', swatch: 'bg-slate-900 border-slate-700', text: 'text-white' },
    { value: 'slate-800', label: 'Slate 800', swatch: 'bg-slate-800 border-slate-700', text: 'text-white' },
    { value: 'slate-700', label: 'Slate 700', swatch: 'bg-slate-700 border-slate-600', text: 'text-white' },
    { value: 'slate-600', label: 'Slate 600', swatch: 'bg-slate-600 border-slate-500', text: 'text-white' },
    { value: 'slate-500', label: 'Slate 500', swatch: 'bg-slate-500 border-slate-400', text: 'text-white' },
    { value: 'slate-400', label: 'Slate 400', swatch: 'bg-slate-400 border-slate-300', text: 'text-white' },
    { value: 'slate-300', label: 'Slate 300', swatch: 'bg-slate-300 border-slate-200', text: 'text-slate-900' },
    { value: 'slate-200', label: 'Slate 200', swatch: 'bg-slate-200 border-slate-100', text: 'text-slate-900' },
    { value: 'slate-100', label: 'Slate 100', swatch: 'bg-slate-100 border-slate-50', text: 'text-slate-900' },
    { value: 'gray-900', label: 'Gray 900', swatch: 'bg-gray-900 border-gray-700', text: 'text-white' },
    { value: 'gray-800', label: 'Gray 800', swatch: 'bg-gray-800 border-gray-700', text: 'text-white' },
    { value: 'gray-700', label: 'Gray 700', swatch: 'bg-gray-700 border-gray-600', text: 'text-white' },
    { value: 'gray-600', label: 'Gray 600', swatch: 'bg-gray-600 border-gray-500', text: 'text-white' },
    { value: 'gray-500', label: 'Gray 500', swatch: 'bg-gray-500 border-gray-400', text: 'text-white' },
    { value: 'gray-400', label: 'Gray 400', swatch: 'bg-gray-400 border-gray-300', text: 'text-white' },
    { value: 'gray-300', label: 'Gray 300', swatch: 'bg-gray-300 border-gray-200', text: 'text-slate-900' },
    { value: 'black', label: 'Black', swatch: 'bg-black border-slate-700', text: 'text-white' }
  ];
  
  const buttonColorOptions = [
    { value: 'sky-600', label: 'Sky', swatch: 'bg-sky-600 border-sky-500', text: 'text-white' },
    { value: 'emerald-600', label: 'Emerald', swatch: 'bg-emerald-600 border-emerald-500', text: 'text-white' },
    { value: 'rose-600', label: 'Rose', swatch: 'bg-rose-600 border-rose-500', text: 'text-white' },
    { value: 'amber-600', label: 'Amber', swatch: 'bg-amber-600 border-amber-500', text: 'text-white' },
    { value: 'purple-600', label: 'Purple', swatch: 'bg-purple-600 border-purple-500', text: 'text-white' },
    { value: 'slate-800', label: 'Slate 800', swatch: 'bg-slate-800 border-slate-700', text: 'text-white' },
    { value: 'gray-800', label: 'Gray 800', swatch: 'bg-gray-800 border-gray-700', text: 'text-white' },
    { value: 'black', label: 'Black', swatch: 'bg-black border-slate-700', text: 'text-white' }
  ];
  
  const containerColorOptions = [
    { value: 'slate-900/80', label: 'Slate 900', swatch: 'bg-slate-900 border-slate-700', text: 'text-white' },
    { value: 'slate-800/80', label: 'Slate 800', swatch: 'bg-slate-800 border-slate-700', text: 'text-white' },
    { value: 'slate-700/80', label: 'Slate 700', swatch: 'bg-slate-700 border-slate-600', text: 'text-white' },
    { value: 'gray-800/80', label: 'Gray 800', swatch: 'bg-gray-800 border-gray-700', text: 'text-white' },
    { value: 'gray-700/80', label: 'Gray 700', swatch: 'bg-gray-700 border-gray-600', text: 'text-white' },
    { value: 'white/90', label: 'White', swatch: 'bg-white border-slate-300', text: 'text-slate-900' }
  ];
  
  const getStorageSize = () => {
    try {
      const data = localStorage.getItem('course_factory_v2_data');
      if (!data) return '0 KB';
      const bytes = new Blob([data]).size;
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Settings className="text-sky-400" /> Phase 5: Settings & Preferences
        </h2>
        
        {/* COURSE CONFIGURATION */}
        <div className="mb-8 bg-slate-900/50 p-6 rounded-xl border border-sky-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Terminal size={20} className="text-sky-400" /> Course Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Course Name</label>
              <input 
                type="text"
                value={settings.courseName || ''}
                onChange={(e) => updateSettings({ courseName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm"
                placeholder="Mental Fitness"
              />
              <p className="text-[10px] text-slate-500 mt-1 italic">This appears in the sidebar as "IN: {(settings.courseName || 'COURSE NAME').toUpperCase()}"</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Course Code</label>
                <input 
                  type="text"
                  value={settings.courseCode || ''}
                  onChange={(e) => updateSettings({ courseCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm"
                  placeholder="PSY-101"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Academic Year</label>
                <input 
                  type="text"
                  value={settings.academicYear || ''}
                  onChange={(e) => updateSettings({ academicYear: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm"
                  placeholder="2025-2026"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Instructor Name</label>
              <input 
                type="text"
                value={settings.instructor || ''}
                onChange={(e) => updateSettings({ instructor: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm"
                placeholder="Dr. Smith"
              />
            </div>
          </div>
        </div>
        
        {/* VISUAL SETTINGS */}
        <div className="mb-8 bg-slate-900/50 p-6 rounded-xl border border-purple-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-purple-400" /> Visual Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Primary Accent Color</label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    onClick={() => updateSettings({ accentColor: color.value })}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      settings.accentColor === color.value
                        ? 'border-white bg-slate-700'
                        : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded ${color.class}`}></div>
                    <span className="text-xs text-white">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Background Color</label>
              <p className="text-[10px] text-slate-500 mb-2 italic">Applies to hub pages and compiled sites</p>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-slate-500 mb-2 font-bold">Dark Options</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'slate-900', label: 'Dark Slate', class: 'bg-slate-900 border-slate-700' },
                      { value: 'slate-950', label: 'Darker Slate', class: 'bg-slate-950 border-slate-800' },
                      { value: 'zinc-900', label: 'Dark Zinc', class: 'bg-zinc-900 border-zinc-700' },
                      { value: 'neutral-900', label: 'Dark Neutral', class: 'bg-neutral-900 border-neutral-700' },
                      { value: 'stone-900', label: 'Dark Stone', class: 'bg-stone-900 border-stone-700' },
                      { value: 'gray-900', label: 'Dark Gray', class: 'bg-gray-900 border-gray-700' }
                    ].map(bg => (
                      <button
                        key={bg.value}
                        onClick={() => updateSettings({ backgroundColor: bg.value })}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          (settings.backgroundColor || 'slate-900') === bg.value
                            ? 'border-white bg-slate-700'
                            : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded border ${bg.class}`}></div>
                        <span className="text-xs text-white">{bg.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-2 font-bold">Light Options</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'slate-50', label: 'Light Slate', class: 'bg-slate-50 border-slate-300', textClass: 'text-slate-900' },
                      { value: 'zinc-50', label: 'Light Zinc', class: 'bg-zinc-50 border-zinc-300', textClass: 'text-zinc-900' },
                      { value: 'neutral-50', label: 'Light Neutral', class: 'bg-neutral-50 border-neutral-300', textClass: 'text-neutral-900' },
                      { value: 'stone-50', label: 'Light Stone', class: 'bg-stone-50 border-stone-300', textClass: 'text-stone-900' },
                      { value: 'gray-50', label: 'Light Gray', class: 'bg-gray-50 border-gray-300', textClass: 'text-gray-900' },
                      { value: 'white', label: 'White', class: 'bg-white border-gray-200', textClass: 'text-gray-900' }
                    ].map(bg => (
                      <button
                        key={bg.value}
                        onClick={() => updateSettings({ backgroundColor: bg.value })}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          (settings.backgroundColor || 'slate-900') === bg.value
                            ? 'border-white bg-slate-700'
                            : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded border ${bg.class}`}></div>
                        <span className="text-xs text-white">{bg.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Heading Text Color</label>
              <p className="text-[10px] text-slate-500 mb-2 italic">Applies to Materials & Assessments titles</p>
              <div className="grid grid-cols-3 gap-2">
                {textColorOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateSettings({ headingTextColor: opt.value })}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      (settings.headingTextColor || 'white') === opt.value
                        ? 'border-white bg-slate-700'
                        : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded border ${opt.swatch}`}></div>
                    <span className={`text-xs ${opt.text}`}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Secondary Text Color</label>
              <p className="text-[10px] text-slate-500 mb-2 italic">Applies to subtext, descriptions, and button text</p>
              <div className="grid grid-cols-3 gap-2">
                {textColorOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateSettings({ secondaryTextColor: opt.value })}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      (settings.secondaryTextColor || 'slate-400') === opt.value
                        ? 'border-white bg-slate-700'
                        : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded border ${opt.swatch}`}></div>
                    <span className={`text-xs ${opt.text}`}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Assessment Text Color</label>
              <p className="text-[10px] text-slate-500 mb-2 italic">Text color for questions, answers, and input fields in assessments</p>
              <div className="grid grid-cols-3 gap-2">
                {assessmentTextColorOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateSettings({ assessmentTextColor: opt.value })}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      (settings.assessmentTextColor || 'white') === opt.value
                        ? 'border-white bg-slate-700'
                        : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded border ${opt.swatch}`}></div>
                    <span className={`text-xs ${opt.text}`}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Assessment Box Color</label>
              <p className="text-[10px] text-slate-500 mb-2 italic">Default background for assessment cards and input fields</p>
              <div className="grid grid-cols-3 gap-2">
                {assessmentTextColorOptions.map(opt => (
                  <button
                    key={'box-' + opt.value}
                    onClick={() => updateSettings({ assessmentBoxColor: opt.value })}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      (settings.assessmentBoxColor || 'slate-900') === opt.value
                        ? 'border-white bg-slate-700'
                        : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded border ${opt.swatch}`}></div>
                    <span className={`text-xs ${opt.text}`}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Default Material Card Theme</label>
              <p className="text-[10px] text-slate-500 mb-2 italic">Default card look for materials; overridable per material in Phase 1</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { value: 'dark', label: 'Dark' },
                  { value: 'light', label: 'Light' },
                  { value: 'muted', label: 'Muted' },
                  { value: 'high-contrast-light', label: 'High contrast (light)' },
                  { value: 'high-contrast-dark', label: 'High contrast (dark)' }
                ].map(t => (
                  <button
                    key={t.value}
                    onClick={() => updateSettings({ defaultMaterialTheme: t.value })}
                    className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
                      (settings.defaultMaterialTheme || 'dark') === t.value
                        ? 'border-white bg-slate-700'
                        : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs text-white">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Materials & Assessments Button Color</label>
              <p className="text-[10px] text-slate-500 mb-2 italic">Uniform button background for Materials & Assessments</p>
              <div className="grid grid-cols-3 gap-2">
                {buttonColorOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateSettings({ buttonColor: opt.value })}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      (settings.buttonColor || 'sky-600') === opt.value
                        ? 'border-white bg-slate-700'
                        : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded border ${opt.swatch}`}></div>
                    <span className={`text-xs ${opt.text}`}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Materials & Assessments Container Color</label>
              <p className="text-[10px] text-slate-500 mb-2 italic">Applies to material cards and assessment containers</p>
              <div className="grid grid-cols-3 gap-2">
                {containerColorOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateSettings({ containerColor: opt.value })}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      (settings.containerColor || 'slate-900/80') === opt.value
                        ? 'border-white bg-slate-700'
                        : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded border ${opt.swatch}`}></div>
                    <span className={`text-xs ${opt.text}`}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Font Family</label>
              <p className="text-[10px] text-slate-500 mb-2 italic">Primary font for hub pages and compiled sites</p>
              <select
                value={settings.fontFamily || 'inter'}
                onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm"
              >
                <option value="inter">Inter (Default)</option>
                <option value="roboto">Roboto</option>
                <option value="opensans">Open Sans</option>
                <option value="lato">Lato</option>
                <option value="montserrat">Montserrat</option>
                <option value="poppins">Poppins</option>
                <option value="raleway">Raleway</option>
                <option value="nunito">Nunito</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Custom CSS (Advanced)</label>
              <p className="text-[10px] text-slate-500 mb-2 italic">Applies to all compiled outputs (legacy, beta single-page, and beta multi-file hub)</p>
              <textarea 
                value={settings.customCSS || ''}
                onChange={(e) => updateSettings({ customCSS: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs font-mono h-32 resize-none"
                placeholder="/* Custom styles will be injected into compiled site */"
              />
            </div>
          </div>
        </div>
        
        {/* DATA MANAGEMENT */}
        <div className="mb-8 bg-slate-900/50 p-6 rounded-xl border border-emerald-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Database size={20} className="text-emerald-400" /> Data Management
          </h3>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                onClick={exportProject}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Download size={16} /> Export Project
              </button>
              <label className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer">
                <Upload size={16} /> Import Project
                <input
                  type="file"
                  accept=".json"
                  onChange={importProject}
                  className="hidden"
                />
              </label>
            </div>
            
            <button
              onClick={resetProject}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 size={16} /> Reset All Data
            </button>
          </div>
        </div>
        
        {/* COMPILATION DEFAULTS */}
        <div className="mb-8 bg-slate-900/50 p-6 rounded-xl border border-amber-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Package size={20} className="text-amber-400" /> Compilation Defaults
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={settings.compilationDefaults?.includeMaterials || false}
                onChange={(e) => updateCompilationDefaults({ includeMaterials: e.target.checked })}
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-sky-600"
              />
              <div>
                <div className="text-sm font-bold text-white">Auto-include Course Materials</div>
                <div className="text-xs text-slate-500">Automatically include materials in full site compile</div>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={settings.compilationDefaults?.includeAssessments || false}
                onChange={(e) => updateCompilationDefaults({ includeAssessments: e.target.checked })}
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-sky-600"
              />
              <div>
                <div className="text-sm font-bold text-white">Auto-include Assessments</div>
                <div className="text-xs text-slate-500">Automatically include assessments module in full site compile</div>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={settings.compilationDefaults?.includeToolkit || false}
                onChange={(e) => updateCompilationDefaults({ includeToolkit: e.target.checked })}
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-sky-600"
              />
              <div>
                <div className="text-sm font-bold text-white">Auto-include Global Toolkit</div>
                <div className="text-xs text-slate-500">Automatically include enabled toolkit items</div>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={settings.compilationDefaults?.enableProgressTracking || false}
                onChange={(e) => updateCompilationDefaults({ enableProgressTracking: e.target.checked })}
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-sky-600"
              />
              <div>
                <div className="text-sm font-bold text-white">Enable Progress Tracking</div>
                <div className="text-xs text-slate-500">Track student progress in localStorage</div>
              </div>
            </label>
          </div>
        </div>
        
        {/* DEVELOPER TOOLS */}
        <div className="mb-8 bg-slate-900/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Terminal size={20} className="text-slate-400" /> Developer Tools
          </h3>
          
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Storage Usage</span>
                <span className="text-sm font-mono text-white">{getStorageSize()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Modules</span>
                <span className="text-sm font-mono text-white">{modules.length}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Assessments</span>
                <span className="text-sm font-mono text-white">{courseAssessments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Materials</span>
                <span className="text-sm font-mono text-white">{courseMaterials.length}</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                const dataStr = JSON.stringify(projectData, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
                URL.revokeObjectURL(url);
              }}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <Eye size={16} /> View Raw Project Data
            </button>
            
            <button
              onClick={() => {
                if (window.confirm('Clear localStorage cache? This will not delete your project data.')) {
                  const projectBackup = localStorage.getItem('course_factory_v2_data');
                  localStorage.clear();
                  if (projectBackup) {
                    localStorage.setItem('course_factory_v2_data', projectBackup);
                  }
                  alert('âœ… Cache cleared');
                }
              }}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 size={16} /> Clear Cache
            </button>

            <button
              onClick={async () => {
                if (window.confirm('ðŸ”„ Force Refresh?\n\nThis will:\nâ€¢ Clear browser cache for this site\nâ€¢ Clear any service workers\nâ€¢ Reload with fresh code\n\nYour project data will be preserved.')) {
                  try {
                    // Clear service worker caches
                    if ('caches' in window) {
                      const cacheNames = await caches.keys();
                      await Promise.all(cacheNames.map(name => caches.delete(name)));
                    }
                    
                    // Unregister service workers
                    if ('serviceWorker' in navigator) {
                      const registrations = await navigator.serviceWorker.getRegistrations();
                      await Promise.all(registrations.map(reg => reg.unregister()));
                    }
                    
                    // Force hard reload bypassing cache
                    window.location.reload(true);
                  } catch (e) {
                    // Fallback: just do a hard reload
                    window.location.reload(true);
                  }
                }
              }}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw size={16} /> Force Refresh (Get Latest Code)
            </button>

            <div className="border-t border-rose-900/50 pt-4 mt-4">
              <p className="text-[10px] text-rose-400 uppercase font-bold mb-2 flex items-center gap-1">
                <AlertTriangle size={12} /> Danger Zone
              </p>
              <button
                onClick={() => {
                  if (window.confirm('âš ï¸ FULL RESET WARNING!\n\nThis will permanently delete:\nâ€¢ All your materials (but keep Materials module)\nâ€¢ All your assessments (but keep Assessments module)\nâ€¢ All other custom modules\nâ€¢ All toolkit items\n\nThe Course Materials and Assessments containers will remain empty.\n\nContinue?')) {
                    const userInput = window.prompt('Type RESET to confirm full data wipe:');
                    if (userInput === 'RESET') {
                      // Get the current Course Materials and Assessments modules from PROJECT_DATA defaults
                      // Keep their structure but clear their content arrays
                      const cleanProject = {
                        "Current Course": {
                          name: "New Course",
                          modules: [
                            // Course Materials module - KEEP but empty materials
                            {
                              id: "item-1768749223001",
                              title: "Course Materials",
                              type: "standalone",
                              code: { id: "view-materials" },
                              materials: [], // EMPTY
                              html: `<div id="view-materials" class="w-full h-full custom-scroll p-8 md:p-12">
                                <div class="max-w-5xl mx-auto space-y-8">
                                  <div class="mb-12">
                                    <h2 class="text-3xl font-black text-white italic uppercase tracking-tighter">Course <span class="text-sky-500">Materials</span></h2>
                                    <p class="text-xs text-slate-400 font-mono uppercase tracking-widest mt-2">Access lectures, presentations, and briefing documents.</p>
                                  </div>
                                  <div id="pdf-viewer-container" class="hidden mb-12 bg-black rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
                                    <div class="flex justify-between items-center p-3 bg-slate-800 border-b border-slate-700">
                                      <span id="viewer-title" class="text-xs font-bold text-white uppercase tracking-widest px-2">Document Viewer</span>
                                      <button onclick="closeViewer()" class="text-xs text-rose-400 hover:text-white font-bold uppercase tracking-widest px-2">Close X</button>
                                    </div>
                                    <iframe id="pdf-frame" src="" width="100%" height="600" style="border:none;"></iframe>
                                  </div>
                                  <div class="grid grid-cols-1 gap-4" id="materials-container">
                                    <p class="text-center text-slate-500 italic py-8">No materials yet. Add materials in the builder.</p>
                                  </div>
                                </div>
                              </div>`,
                              css: "",
                              script: `function renderMaterials() {
                                const container = document.getElementById('materials-container');
                                if (!container) return;
                                if (window.courseMaterials && window.courseMaterials.length > 0) {
                                  container.innerHTML = window.courseMaterials.map(mat => \`<div class="material-card">\${mat.title}</div>\`).join('');
                                }
                              }
                              if (document.readyState === 'loading') {
                                document.addEventListener('DOMContentLoaded', renderMaterials);
                              } else {
                                renderMaterials();
                              }`
                            },
                            // Assessments module - KEEP but empty assessments
                            {
                              id: "item-assessments",
                              title: "Assessments",
                              type: "standalone",
                              assessments: [], // EMPTY
                              html: `<div id="view-assessments" class="w-full h-full custom-scroll p-8 md:p-12">
                                <div class="max-w-5xl mx-auto space-y-8">
                                  <div class="mb-12">
                                    <h2 class="text-3xl font-black text-white italic uppercase tracking-tighter">Assessment <span class="text-purple-500">Center</span></h2>
                                    <p class="text-xs text-slate-400 font-mono uppercase tracking-widest mt-2">Quizzes, tests, and reflection exercises.</p>
                                  </div>
                                  <div id="assessments-container" class="space-y-6">
                                    <p class="text-center text-slate-500 italic py-8">No assessments yet. Create assessments in the builder.</p>
                                  </div>
                                </div>
                              </div>`,
                              css: "",
                              script: `function renderAssessments() {
                                const container = document.getElementById('assessments-container');
                                if (!container) return;
                                if (window.courseAssessments && window.courseAssessments.length > 0) {
                                  container.innerHTML = window.courseAssessments.map(assessment => '<div class="assessment-wrapper mb-8">' + assessment.html + '</div>').join('');
                                  window.courseAssessments.forEach((assessment) => {
                                    if (assessment.script) {
                                      try { eval(assessment.script); } catch(e) { console.error('Assessment script error:', e); }
                                    }
                                  });
                                }
                              }
                              if (document.readyState === 'loading') {
                                document.addEventListener('DOMContentLoaded', renderAssessments);
                              } else {
                                renderAssessments();
                              }`
                            }
                          ]
                        },
                        "Global Toolkit": []
                      };
                      
                      // IMMEDIATELY update React state (clears UI now)
                      setProjectData(cleanProject);
                      
                      // Save to localStorage (persists after reload)
                      localStorage.setItem('course_factory_v2_data', JSON.stringify(cleanProject));
                      
                      // Clear any other related keys
                      localStorage.removeItem('course_factory_backup');
                      Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('courseProgress_')) {
                          localStorage.removeItem(key);
                        }
                      });
                      
                      // Clear browser caches too
                      if ('caches' in window) {
                        caches.keys().then(names => {
                          names.forEach(name => caches.delete(name));
                        });
                      }
                      
                      alert('âœ… Reset complete! Course Materials and Assessments modules preserved (but emptied). All other content cleared.');
                    } else {
                      alert('Reset cancelled. Your data is safe.');
                    }
                  }
                }}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 size={16} /> Full Reset (Delete Everything)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
                    <h3 className="text-lg font-bold">{hasDeps ? 'âš ï¸ Dependencies Found' : 'Delete Item?'}</h3>
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
                                            <li key={dep.id}>â€¢ {dep.title} <span className="text-amber-500">({dep.type})</span></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {dependencies.dependencies.assessments.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs font-bold text-amber-400 uppercase mb-1">Assessments ({dependencies.dependencies.assessments.length}):</p>
                                    <ul className="text-xs text-amber-200 space-y-1 ml-4">
                                        {dependencies.dependencies.assessments.map(dep => (
                                            <li key={dep.id}>â€¢ {dep.title} <span className="text-amber-500">(in {dep.moduleTitle})</span></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {dependencies.dependencies.toolkit.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs font-bold text-amber-400 uppercase mb-1">Toolkit Items ({dependencies.dependencies.toolkit.length}):</p>
                                    <ul className="text-xs text-amber-200 space-y-1 ml-4">
                                        {dependencies.dependencies.toolkit.map(dep => (
                                            <li key={dep.id}>â€¢ {dep.title}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {dependencies.dependencies.materials.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs font-bold text-amber-400 uppercase mb-1">Materials ({dependencies.dependencies.materials.length}):</p>
                                    <ul className="text-xs text-amber-200 space-y-1 ml-4">
                                        {dependencies.dependencies.materials.map(dep => (
                                            <li key={dep.id}>â€¢ {dep.title}</li>
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
                        {hasDeps ? 'âš ï¸ Delete Anyway' : 'Delete Forever'}
                    </button>
                </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activePhase, setActivePhase] = useState(0);
  const [scannerNotes, setScannerNotes] = useState("");
  // Initialize state with PROJECT_DATA constant
  const [projectData, setProjectData] = useState(PROJECT_DATA);

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

  // ðŸ’¾ AUTO-LOAD: Runs once on mount
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
      console.error("âŒ Load failed:", error);
      setIsAutoLoaded(true);
    }
  }, []);

  // ðŸ’¾ AUTO-SAVE: Runs when projectData changes
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
        console.error("âŒ Save failed:", error);
      }
    }, 1000); // 1-second debounce

    return () => clearTimeout(timer);
  }, [projectData, isAutoLoaded, showToast]);

  const [excludedIds, setExcludedIds] = useState([]);
  const [editingModule, setEditingModule] = useState(null); 
  const [editForm, setEditForm] = useState({ title: '', html: '', script: '', id: '', section: '', moduleType: '', url: '', linkType: 'iframe', fullDocument: '' });
  const [previewModule, setPreviewModule] = useState(null);
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
      alert('âš ï¸ Course Materials and Assessments are core modules and cannot be deleted.\n\nYou can hide them instead using the hide/show toggle in Phase 2.');
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
        alert('âš ï¸ Course Materials and Assessments are core modules and cannot be deleted.');
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

  const updateAssessmentsModule = (updatedAssessments) => {
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
  const addQuestionToMaster = (questionData = null) => {
    // Use passed questionData if provided, otherwise use currentQuestion from state
    const questionToAdd = questionData || { ...currentQuestion };
    
    if (editingQuestion !== null) {
      // Update existing question
      const updated = [...masterQuestions];
      updated[editingQuestion] = questionToAdd;
      setMasterQuestions(updated);
      setEditingQuestion(null);
    } else {
      // Add new question
      setMasterQuestions([...masterQuestions, questionToAdd]);
    }
    
    // Reset form
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correct: 0
    });
  };

  const moveQuestion = (index, direction) => {
    const newQuestions = [...masterQuestions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    setMasterQuestions(newQuestions);
  };

  const deleteQuestion = (index) => {
    const newQuestions = master

Questions.filter((_, i) => i !== index);
    setMasterQuestions(newQuestions);
  };

  const updateQuestion = (index) => {
    const question = masterQuestions[index];
    setCurrentQuestion(question);
    setEditingQuestion(index);
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
              LIVING DOC â€¢ SAVED {lastSaved ? lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toUpperCase() : '---'}
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
          {activePhase === 0 && <Phase0 />}
          {activePhase === 1 && <Phase1 projectData={projectData} setProjectData={setProjectData} scannerNotes={scannerNotes} setScannerNotes={setScannerNotes} addMaterial={addMaterial} editMaterial={editMaterial} deleteMaterial={deleteMaterial} moveMaterial={moveMaterial} toggleMaterialHidden={toggleMaterialHidden} addAssessment={addAssessment} editAssessment={editAssessment} deleteAssessment={deleteAssessment} moveAssessment={moveAssessment} toggleAssessmentHidden={toggleAssessmentHidden} addQuestionToMaster={addQuestionToMaster} moveQuestion={moveQuestion} deleteQuestion={deleteQuestion} updateQuestion={updateQuestion} clearMasterAssessment={clearMasterAssessment} masterQuestions={masterQuestions} setMasterQuestions={setMasterQuestions} masterAssessmentTitle={masterAssessmentTitle} setMasterAssessmentTitle={setMasterAssessmentTitle} currentQuestionType={currentQuestionType} setCurrentQuestionType={setCurrentQuestionType} currentQuestion={currentQuestion} setCurrentQuestion={setCurrentQuestion} editingQuestion={editingQuestion} setEditingQuestion={setEditingQuestion} generateMixedAssessment={generateMixedAssessment} generatedAssessment={generatedAssessment} setGeneratedAssessment={setGeneratedAssessment} assessmentType={assessmentType} setAssessmentType={setAssessmentType} assessmentTitle={assessmentTitle} setAssessmentTitle={setAssessmentTitle} quizQuestions={quizQuestions} setQuizQuestions={setQuizQuestions} printInstructions={printInstructions} setPrintInstructions={setPrintInstructions} editingAssessment={editingAssessment} setEditingAssessment={setEditingAssessment} migrateCode={migrateCode} setMigrateCode={setMigrateCode} migratePrompt={migratePrompt} setMigratePrompt={setMigratePrompt} migrateOutput={migrateOutput} setMigrateOutput={setMigrateOutput} />}
          {activePhase === 2 && <Phase2 projectData={projectData} setProjectData={setProjectData} editMaterial={editMaterial} onEdit={openEditModule} onPreview={openPreview} onDelete={deleteModule} onToggleHidden={toggleModuleHidden} deleteMaterial={deleteMaterial} deleteAssessment={deleteAssessment} toggleMaterialHidden={toggleMaterialHidden} toggleAssessmentHidden={toggleAssessmentHidden} />}
          {activePhase === 3 && <Phase3 onGoToMaster={() => setActivePhase(0)} projectData={projectData} setProjectData={setProjectData} />}
          {activePhase === 4 && <Phase4 projectData={projectData} setProjectData={setProjectData} excludedIds={excludedIds} toggleModule={toggleModuleExclusion} onToggleHidden={toggleModuleHidden} onError={handleError} />}
          {activePhase === 5 && <Phase5Settings projectData={projectData} setProjectData={setProjectData} />}
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
              <button onClick={() => setPreviewModule(null)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-0 overflow-hidden max-h-[calc(90vh-80px)]">
              <iframe 
                srcDoc={(() => {
                  // ========================================
                  // SIMPLIFIED PREVIEW: Use rawHtml directly when available
                  // ========================================
                  
                  // PRIORITY 1: If module has rawHtml, use it directly (new simplified format)
                  // This shows the module EXACTLY as the user pasted it
                  if (previewModule.rawHtml) {
                    return previewModule.rawHtml;
                  }
                  
                  // PRIORITY 2: Handle external modules (links to other sites)
                  if (previewModule.type === 'external') {
                    const urlValidation = validateUrl(previewModule.url || '');
                    const safeUrl = urlValidation.safeUrl;
                    const safeTitle = escapeHtml(previewModule.title || 'External Module');
                    
                    if (previewModule.linkType === 'iframe') {
                      return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; background: #020617; }
    iframe { width: 100%; height: 100vh; border: none; }
  </style>
</head>
<body>
  <iframe src="${safeUrl}" width="100%" height="100%" style="border:none;"></iframe>
</body>
</html>`;
                    } else {
                      return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #020617; color: #e2e8f0; font-family: 'Inter', sans-serif; padding: 40px; text-align: center; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    a { color: #0ea5e9; text-decoration: underline; }
  </style>
</head>
<body>
  <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">${safeTitle}</h2>
  <p style="margin-bottom: 1.5rem; color: #94a3b8;">This module opens in a new tab.</p>
  <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">Open ${safeTitle} â†’</a>
</body>
</html>`;
                    }
                  }
                  
                  // PRIORITY 3: Fallback for legacy modules (parsed html/css/script)
                  // Build a complete HTML document for preview
                  const moduleContent = extractModuleContent(previewModule);
                  if (moduleContent.html) {
                    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,700;1,400;1,900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
  <style>
    body { background-color: #0f172a; color: #e2e8f0; font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
    ${moduleContent.css || ''}
  </style>
</head>
<body class="min-h-screen p-4 md:p-8">
  ${moduleContent.html}
  <script>
    (function() {
      ${moduleContent.script || ''}
    })();
  <\/script>
</body>
</html>`;
                  }
                  
                  // No content available
                  return `<!DOCTYPE html>
<html>
<head><style>body { background: #020617; color: #e2e8f0; font-family: sans-serif; padding: 40px; text-align: center; }</style></head>
<body><h2>No Preview Available</h2><p>This module has no content to preview.</p></body>
</html>`;
                })()}
                key={previewModule.id || previewModule.title}
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





