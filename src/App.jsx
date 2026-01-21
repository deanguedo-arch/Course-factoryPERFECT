import * as React from 'react';
import { Terminal, BookOpen, Layers, Copy, Check, FileJson, Settings, Scissors, Sparkles, RefreshCw, Search, Clipboard, Upload, Save, Database, Trash2, LayoutTemplate, PenTool, Plus, FolderOpen, Download, AlertTriangle, AlertOctagon, ShieldCheck, FileCode, Lock, Unlock, Wrench, Box, ArrowUpCircle, ArrowRight, Zap, CheckCircle, Package, Link as LinkIcon, ToggleLeft, ToggleRight, Eye, EyeOff, ChevronUp, ChevronDown, X } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';

const { useState, useEffect, useRef } = React;

// ==========================================
// 🔴 FIREBASE CONFIG & INIT (DISABLED LOCALLY)
// ==========================================
// const firebaseConfig = JSON.parse(__firebase_config);
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);
const appId = 'course-factory-v1';

// ==========================================
// 🟢 PROJECT DATA (THE LIVING LIBRARY)
// ==========================================

const PROJECT_DATA = {
  "Current Course": {
    name: "Mental Fitness",
    modules: [
      {
        id: "item-1768749223001",
        title: "Course Materials",
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
        code: {
          id: "view-materials",
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
                            '<button onclick="openPDF(\'' + mat.viewUrl.replace(/'/g, "\\'") + '\', \'' + mat.title.replace(/'/g, "\\'") + '\')" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg border border-slate-600 transition-all">View Slides</button>' +
                            '<a href="' + mat.downloadUrl + '" target="_blank" class="flex-1 ' + buttonColorClass + ' text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all text-center flex items-center justify-center">Download</a>' +
                        '</div>' +
                    '</div>';
                }).join('');
            }
        }
        
        function openPDF(url, title) {
            const container = document.getElementById('pdf-viewer-container');
            document.getElementById('pdf-frame').src = url;
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
        }
      },
      {
        id: "item-assessments",
        title: "Assessments",
        assessments: [],
        code: {
          id: "view-assessments",
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
        }
      },
      {
        id: "item-1768750987350",
        title: "Phase 1: The Engine",
        code: {
          id: "view-phase1",
          html: `<div id="view-phase1" class="w-full h-full custom-scroll hidden p-4 md:p-8">
            <div class="max-w-6xl mx-auto">
                <header class="mb-8 text-center"><h1 class="text-3xl font-black italic tracking-tighter text-white uppercase mb-2 text-sky-500">Elite Operator Toolkit</h1><p class="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500 mb-6 font-bold underline decoration-sky-500/30 underline-offset-4">Regulation Engine: Tactical Assignment</p><div class="flex flex-wrap justify-center gap-3 mb-6 bg-slate-900/50 p-3 rounded-xl border border-slate-800 max-w-2xl mx-auto"><div class="flex items-center gap-2 px-3"><div id="p1-save-indicator" class="w-2 h-2 rounded-full bg-slate-600"></div><span id="p1-save-text" class="text-[9px] uppercase font-bold text-slate-500 tracking-widest">System Ready</span></div><div class="w-px h-6 bg-slate-800 mx-2 hidden sm:block"></div><button onclick="p1_downloadBackup()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors border border-slate-700">Save Backup File</button><button onclick="document.getElementById('p1-file-upload').click()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-sky-400 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors border border-slate-700">Load Backup</button><input type="file" id="p1-file-upload" accept=".json" style="display: none;" onchange="p1_loadBackup(this)"></div><div class="flex justify-center gap-2 overflow-x-auto pb-2 px-2"><button onclick="p1_showStep(0)" class="mod-nav-btn active px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">Briefing</button><button onclick="p1_showStep(1)" class="mod-nav-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">01 Stress Reset</button><button onclick="p1_showStep(2)" class="mod-nav-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">02 Arousal</button><button onclick="p1_showStep(3)" class="mod-nav-btn px-4 py-2 rounded-lg border border-slate-800 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">03 Targeting</button><button onclick="p1_showStep(4)" class="mod-nav-btn px-4 py-2 rounded-lg border border-slate-800 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">04 Confidence</button><button onclick="p1_showStep(5)" class="mod-nav-btn px-4 py-2 rounded-lg border border-slate-800 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">Review & Print</button></div></header>
                <div class="glass rounded-3xl shadow-2xl overflow-hidden min-h-[500px]">
                    <div id="p1-step0" class="step-content active"><div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-sky-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">System Briefing: The Regulation Engine</h2></div><div class="p-8 space-y-8 text-center"><div class="max-w-3xl mx-auto space-y-6 text-left"><p class="text-slate-400 text-sm italic leading-relaxed">Elite performance is defined by the ability to regulate your internal operating system under pressure. While physical skill sets the floor, your mental fitness sets the ceiling. This assignment uses four <strong>Manual Overrides</strong> to ensure you stay in your <strong>Ideal Performance State (IPS)</strong>.</p><div class="bg-sky-500/10 border border-sky-500/30 p-4 rounded-xl flex flex-col gap-4 mb-2"><h3 class="text-sky-400 font-bold uppercase text-[10px] tracking-widest">Dashboard Logic: Read then Regulate</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="p-3 bg-slate-900/50 rounded border border-slate-700"><span class="text-[9px] font-black text-rose-400 uppercase block mb-1">Somatic Indicators (Body)</span><p class="text-[10px] text-slate-400">Cold hands, butterflies, muscle tension, sweating.</p></div><div class="p-3 bg-slate-900/50 rounded border border-slate-700"><span class="text-[9px] font-black text-amber-400 uppercase block mb-1">Cognitive Indicators (Mind)</span><p class="text-[10px] text-slate-400">Negative self-talk, doubt, inability to concentrate.</p></div></div></div><div class="flex justify-center pt-6"><button onclick="p1_showStep(1)" class="bg-sky-600 px-12 py-4 rounded-xl text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-sky-500 transition-all shadow-lg active:scale-95">Initialize Stations</button></div></div></div></div>
                    <div id="p1-step1" class="step-content"><div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-rose-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Station 01: The Stress Loop Reset</h2></div><div class="p-8 space-y-8"><div class="grid grid-cols-1 md:grid-cols-2 gap-10"><div class="space-y-4"><h3 class="text-[10px] font-bold text-slate-500 uppercase mono italic underline tracking-widest">The Pivot Point</h3><p class="text-sm text-slate-300 leading-relaxed">Breathing is your manual override switch. It intercepts the Stress Process Loop at the moment a demand is perceived as a "threat." <strong class="text-rose-400">The goal is to identify a specific time you can execute this trigger and how the breath anchor will help you stay present in the moment.</strong></p><div class="bg-rose-500/10 p-3 rounded border border-rose-500/30"><span class="text-[9px] text-rose-300 font-bold uppercase">Warning:</span><p class="text-[10px] text-rose-200">Unchecked loop acceleration leads to performance crash.</p></div></div><div class="space-y-6"><div><label class="block text-[10px] font-bold uppercase text-sky-500 mb-2 mono">Deployment Scenario</label><input type="text" id="p1_breath_scenario" oninput="p1_saveData()" placeholder="When exactly will you use this? (e.g. Between points...)" class="w-full rounded-lg p-3 text-xs italic"><p class="helper-text">Identify a specific time you can execute this trigger.</p></div><div><label class="block text-[10px] font-bold uppercase text-sky-500 mb-2 mono">Centering Action Detail</label><textarea id="p1_breath_detail" oninput="p1_saveData()" placeholder="Describe your rhythmic diaphragmatic breathing habit..." class="w-full h-32 rounded-lg p-3 text-xs italic resize-none"></textarea><p class="helper-text">How will this breath anchor help you stay present in the moment?</p></div></div></div><div class="flex justify-between pt-4"><button onclick="p1_showStep(0)" class="text-slate-500 font-bold uppercase text-[10px] tracking-widest">← Back</button><button onclick="p1_showStep(2)" class="bg-sky-600 px-8 py-3 rounded-lg text-white font-bold uppercase text-[10px] tracking-widest">Next Station →</button></div></div></div>
                    <div id="p1-step2" class="step-content"><div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-amber-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Station 02: Arousal Volume Control</h2></div><div class="p-8 space-y-8"><div class="grid grid-cols-1 md:grid-cols-2 gap-10"><div class="space-y-4"><h3 class="text-[10px] font-bold text-slate-500 uppercase mono italic underline tracking-widest">The Inverted-U</h3><p class="text-sm text-slate-300 leading-relaxed">Performance peaks at moderate arousal. You must 'down-regulate' to discharge tension or 'up-regulate' to wake the nervous system.</p></div><div class="space-y-6"><div><label class="block text-[10px] font-bold uppercase text-amber-500 mb-2 mono">Down-Regulation (Relaxation)</label><p class="text-[10px] text-slate-400 italic mb-2"><strong>PMR (Progressive Muscle Relaxation)</strong> is a technique where you systematically tense and then relax specific muscle groups to release physical tension.</p><textarea id="p1_relax_plan" oninput="p1_saveData()" placeholder="List muscle groups for your PMR routine..." class="w-full h-24 rounded-lg p-3 text-xs italic resize-none"></textarea><p class="helper-text">Describe your routine to discharge somatic tension.</p></div><div><label class="block text-[10px] font-bold uppercase text-rose-500 mb-2 mono">Up-Regulation (Activation)</label><p class="text-[10px] text-slate-400 italic mb-2"><strong>Up-Regulation</strong> involves using physical actions or environmental triggers to increase heart rate and alertness when energy is too low.</p><textarea id="p1_active_plan" oninput="p1_saveData()" placeholder="List your 'Psych-Up' triggers (Music, Cues, Physical actions)..." class="w-full h-24 rounded-lg p-3 text-xs italic resize-none"></textarea><p class="helper-text">Triggers used to discharge apathy and enter the zone.</p></div></div></div><div class="flex justify-between pt-4"><button onclick="p1_showStep(1)" class="text-slate-500 font-bold uppercase text-[10px] tracking-widest">← Back</button><button onclick="p1_showStep(3)" class="bg-sky-600 px-8 py-3 rounded-lg text-white font-bold uppercase text-[10px] tracking-widest">Next Station →</button></div></div></div>
                    <div id="p1-step3" class="step-content"><div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Station 03: The Focus Filter</h2></div><div class="p-8 space-y-8"><div class="grid grid-cols-1 md:grid-cols-2 gap-10"><div class="space-y-4"><h3 class="text-[10px] font-bold text-slate-500 uppercase mono italic underline tracking-widest">Attentional Narrowing</h3><p class="text-sm text-slate-300 leading-relaxed">Under high stress, your peripheral vision and mental focus shrink—often called <strong>"Tunnel Vision."</strong> You lose the big picture. Cue words act as "Decoder Keys" that force the system to lock back onto task-relevant targets.</p><div class="bg-emerald-500/10 p-3 rounded border border-emerald-500/30"><span class="text-[9px] text-emerald-300 font-bold uppercase">The Goal:</span><p class="text-[10px] text-emerald-200">Shift from internal worry (Emotion) to external cues (Action).</p></div></div><div class="space-y-6"><div><label class="block text-[10px] font-bold uppercase text-sky-400 mb-2 mono">Instructional Decoder</label><input type="text" id="p1_cue_inst" oninput="p1_saveData()" placeholder="e.g., 'Elbows in', 'Smooth'..." class="w-full rounded-lg p-3 text-xs font-black italic"><p class="helper-text">Create a 1-2 word key specifically to FIX sloppy mechanics or technical errors.</p></div><div><label class="block text-[10px] font-bold uppercase text-amber-500 mb-2 mono">Motivational Decoder</label><input type="text" id="p1_cue_mot" oninput="p1_saveData()" placeholder="e.g., 'Power', 'Explode'..." class="w-full rounded-lg p-3 text-xs font-black italic"><p class="helper-text">Create a 1-2 word key specifically to FIX low energy or effort when drive is fading.</p></div><div><label class="block text-[10px] font-bold uppercase text-slate-400 mb-2 mono italic underline">Radar Jamming Scenario</label><textarea id="p1_jam_scenario" oninput="p1_saveData()" placeholder="Describe a specific high-pressure moment where you lose focus..." class="w-full h-24 rounded-lg p-3 text-xs italic resize-none"></textarea><p class="helper-text">Identify the exact moment panic sets in and which cue breaks the jam.</p></div></div></div><div class="flex justify-between pt-4"><button onclick="p1_showStep(2)" class="text-slate-500 font-bold uppercase text-[10px] tracking-widest">← Back</button><button onclick="p1_showStep(4)" class="bg-sky-600 px-8 py-3 rounded-lg text-white font-bold uppercase text-[10px] tracking-widest">Next Station →</button></div></div></div>
                    <div id="p1-step4" class="step-content"><div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-sky-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Station 04: Confidence Builder</h2></div><div class="p-8 space-y-8"><div class="grid grid-cols-1 md:grid-cols-2 gap-10"><div class="space-y-4"><h3 class="text-[10px] font-bold text-slate-500 uppercase mono italic underline tracking-widest">Certainty Logic</h3><p class="text-sm text-slate-300 leading-relaxed">Uncertainty generates anxiety; Certainty generates confidence. You cannot control the outcome (Winning), but you can control the process (Mechanics). By shifting your focus to what you control, you build a "High Confidence" state.</p><div class="bg-slate-900 p-4 border border-slate-700 rounded-xl space-y-2"><h4 class="text-[10px] font-black text-white uppercase">S.M.A.R.T. Definition</h4><ul class="text-[9px] text-slate-400 space-y-1 font-mono"><li><strong class="text-sky-400">S</strong>PECIFIC: Clear and defined.</li><li><strong class="text-sky-400">M</strong>EASURABLE: Can be tracked.</li><li><strong class="text-sky-400">A</strong>CHIEVABLE: Realistic to your skill.</li><li><strong class="text-sky-400">R</strong>ELEVANT: Matters to your sport.</li><li><strong class="text-sky-400">T</strong>IME-BOUND: Has a deadline.</li></ul></div></div><div class="space-y-6"><div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"><label class="block text-[10px] font-bold uppercase text-emerald-400 mb-2 mono underline italic">Process Goal (100% Control)</label><input type="text" id="p1_goal_proc" oninput="p1_saveData()" placeholder="Specific form or mechanics goal..." class="w-full rounded-lg p-3 text-xs font-black italic"><p class="helper-text">This goal builds high confidence because it is entirely under your power.</p></div><div class="grid grid-cols-2 gap-4"><div class="p-4 bg-slate-900 border border-slate-800 rounded-xl"><label class="block text-[10px] font-bold uppercase text-amber-500 mb-2 mono">Performance Goal</label><input type="text" id="p1_goal_perf" oninput="p1_saveData()" placeholder="e.g. 80% accuracy..." class="w-full rounded-lg p-2 text-xs italic"><p class="helper-text">Partial Control.</p></div><div class="p-4 bg-slate-900 border border-slate-800 rounded-xl"><label class="block text-[10px] font-bold uppercase text-rose-500 mb-2 mono">Outcome Goal</label><input type="text" id="p1_goal_out" oninput="p1_saveData()" placeholder="e.g. Winning..." class="w-full rounded-lg p-2 text-xs italic"><p class="helper-text">Low Control.</p></div></div><div><label class="block text-[10px] font-bold uppercase text-white mb-2 mono italic underline leading-none">Final S.M.A.R.T. Goal Statement</label><textarea id="p1_smart_final" oninput="p1_saveData()" placeholder="Write out your full goal statement here using the SMART criteria above..." class="w-full h-24 rounded-lg p-3 text-xs italic resize-none border-2 border-slate-700 focus:border-sky-500"></textarea><p class="helper-text">Combine your goals into one clear sentence.</p></div></div></div><div class="flex justify-between pt-4"><button onclick="p1_showStep(3)" class="text-slate-500 font-bold uppercase text-[10px] tracking-widest">← Back</button><button onclick="p1_showStep(5)" class="bg-sky-600 px-8 py-3 rounded-lg text-white font-bold uppercase text-[10px] tracking-widest">Review & Export →</button></div></div>
                    </div>
                    <div id="p1-step5" class="step-content"><div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Final Review & Rubric</h2></div><div class="p-8 space-y-12"><div class="grid grid-cols-1 lg:grid-cols-2 gap-8"><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-4 tracking-widest mono italic underline underline-offset-2">Mental Fitness Assessment</label><div id="sc-container" class="space-y-4"></div><div class="border-t border-slate-800 mt-6 pt-6 flex justify-between items-center"><span class="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Readiness Score</span><div class="text-4xl font-black italic text-emerald-500 leading-none"><span id="p1-total-score">00</span><span class="text-xl text-slate-700 font-normal not-italic">/25</span></div></div></div><div class="space-y-6"><label class="block text-[10px] font-bold uppercase text-sky-400 mb-2 tracking-widest mono italic underline leading-none underline-offset-4">Integration Narrative (Required)</label><textarea id="p1_final_narrative" oninput="p1_saveData()" placeholder="Explain how you will use these four stations to monitor your indicators and regulate your performance state..." class="w-full h-[240px] rounded-xl p-4 text-sm resize-none text-slate-200 border-2 border-sky-500/20 focus:border-sky-500 transition-all"></textarea><p class="helper-text">Prove your understanding: How do these tools prevent the "Crash"?</p></div></div><div class="border-t border-slate-800 pt-8"><label class="block text-[10px] font-bold uppercase text-emerald-500 mb-4 tracking-widest mono italic underline underline-offset-4">Tactical Rubric</label><div class="overflow-x-auto glass rounded-2xl border border-slate-800 shadow-xl"><table class="w-full text-left text-[10px] border-collapse min-w-[700px]"><thead><tr class="bg-slate-900 border-b border-slate-800"><th class="p-4 text-slate-500 uppercase font-black">Criteria</th><th class="p-4 text-emerald-400 uppercase font-black tracking-widest">Proficient (4-5)</th><th class="p-4 text-amber-400 uppercase font-black tracking-widest">Developing (2-3)</th><th class="p-4 text-rose-400 uppercase font-black tracking-widest">Emerging (0-1)</th></tr></thead><tbody class="text-[10px] leading-relaxed italic text-slate-400"><tr class="border-b border-slate-800/50"><td class="p-4 font-bold uppercase text-white mono">Stress Reset</td><td onclick="p1_setScore('reset', 5)" id="reset-5" class="rubric-cell p-4">Centering action is clearly defined (diaphragm) with a specific time trigger. Breath anchor logic is clear.</td><td onclick="p1_setScore('reset', 3)" id="reset-3" class="rubric-cell p-4">Breathing technique mentioned but lacks specific trigger or physiological detail.</td><td onclick="p1_setScore('reset', 1)" id="reset-1" class="rubric-cell p-4">Missing centering action or trigger.</td></tr><tr class="border-b border-slate-800/50"><td class="p-4 font-bold uppercase text-white mono">Arousal Tuning</td><td onclick="p1_setScore('tune', 5)" id="tune-5" class="rubric-cell p-4">Clear distinction between Up/Down regulation. PMR definition is accurate. Tools are actionable.</td><td onclick="p1_setScore('tune', 3)" id="tune-3" class="rubric-cell p-4">Tools identified but generic. Lacks personal specificity or clear definition of PMR.</td><td onclick="p1_setScore('tune', 1)" id="tune-1" class="rubric-cell p-4">Incomplete tuning strategies.</td></tr><tr class="border-b border-slate-800/50"><td class="p-4 font-bold uppercase text-white mono">Targeting (Cues)</td><td onclick="p1_setScore('focus', 5)" id="focus-5" class="rubric-cell p-4">Instructional (Technical) & Motivational (Energy) cues are distinct. Scenario breaks the 'jam'.</td><td onclick="p1_setScore('focus', 3)" id="focus-3" class="rubric-cell p-4">Cues are too long or vague. No distinction between instructional/motivational function.</td><td onclick="p1_setScore('focus', 1)" id="focus-1" class="rubric-cell p-4">Missing cues or scenario.</td></tr><tr class="border-b border-slate-800/50"><td class="p-4 font-bold uppercase text-white mono">Confidence</td><td onclick="p1_setScore('goals', 5)" id="goals-5" class="rubric-cell p-4">Full SMART statement is written. Process goal is 100% controllable.</td><td onclick="p1_setScore('goals', 3)" id="goals-3" class="rubric-cell p-4">Process goal relies on partial external factors. SMART statement missing or incomplete.</td><td onclick="p1_setScore('goals', 1)" id="goals-1" class="rubric-cell p-4">Goals are confused (e.g. Outcome listed as Process).</td></tr><tr><td class="p-4 font-bold uppercase text-white mono">Integration</td><td onclick="p1_setScore('intel', 5)" id="intel-5" class="rubric-cell p-4">Narrative demonstrates understanding of the Dashboard (Somatic/Cognitive) and Regulation.</td><td onclick="p1_setScore('intel', 3)" id="intel-3" class="rubric-cell p-4">Restates definitions without demonstrating personal application or logic.</td><td onclick="p1_setScore('intel', 1)" id="intel-1" class="rubric-cell p-4">Incomplete narrative.</td></tr></tbody></table></div></div><div class="flex flex-col md:flex-row gap-4 pt-8"><button onclick="p1_showStep(1)" class="flex-1 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors border border-slate-800 rounded-xl py-4">← Start Over</button><button onclick="p1_generatePDF()" class="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg active:scale-95">Generate Tactical Report</button></div></div></div>
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
        }`
        }
      },
      {
        id: "item-x",
        title: "Empty Module",
        code: {}
      }
    ]
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
              <button onclick="toggleTool('calculator')" class="text-slate-400 hover:text-white">✕</button>
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
              <button onclick="calcInput('*')" class="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white">×</button>
              <button onclick="calcInput('1')" class="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white">1</button>
              <button onclick="calcInput('2')" class="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white">2</button>
              <button onclick="calcInput('3')" class="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white">3</button>
              <button onclick="calcInput('-')" class="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white">−</button>
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
              <button onclick="toggleTool('timer')" class="text-slate-400 hover:text-white">✕</button>
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
          html: `<button onclick="window.print()" class="fixed top-4 right-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg z-50">🖨️ Print</button>`,
          script: ``
        }
      }
  ]
};

// ==========================================
// 🟡 MASTER SHELL TEMPLATE
// ==========================================
// Canvas Instructions: To update the default template, replace the string below.
// ==========================================

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
        input, textarea, select { background: #0f172a !important; border: 1px solid #1e293b !important; transition: all 0.2s; color: #e2e8f0; }
        input:focus, textarea:focus, select:focus { border-color: #0ea5e9 !important; outline: none; box-shadow: 0 0 0 1px #0ea5e9; }
        
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
                 <div id="pdf-viewer-container" class="hidden mb-12 bg-black rounded-xl border border-slate-700 overflow-hidden shadow-2xl"><div class="flex justify-between items-center p-3 bg-slate-800 border-b border-slate-700"><span id="viewer-title" class="text-xs font-bold text-white uppercase tracking-widest px-2">Document Viewer</span><button onclick="closeViewer()" class="text-xs text-rose-400 hover:text-white font-bold uppercase tracking-widest px-2">Close X</button></div><iframe id="pdf-frame" src="" width="100%" height="600" style="border:none;"></iframe></div>
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
        // --- CORE NAVIGATION LOGIC ---
        function switchView(view) {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            
            // Hide all views generically
            const allViews = document.querySelectorAll('[id^="view-"]');
            allViews.forEach(v => v.classList.add('hidden'));

            // Show specific view
            const target = document.getElementById('view-' + view);
            if(target) target.classList.remove('hidden');
            
            // Activate button
            const navBtn = document.getElementById('nav-' + view);
            if(navBtn) navBtn.classList.add('active');
        }

        function openPDF(url, title) {
            const container = document.getElementById('pdf-viewer-container');
            document.getElementById('pdf-frame').src = url;
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
// 🔵 CORE DASHBOARD LOGIC
// ==========================================

const Section = ({ title, icon: Icon, isActive, onClick, badge, badgeColor = "bg-blue-600" }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-4 mb-2 rounded-lg border transition-all duration-200 flex items-center justify-between gap-3 ${
      isActive
        ? 'bg-blue-900/20 border-blue-500 text-blue-100'
        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:border-slate-600'
    }`}
  >
    <div className="flex items-center gap-3">
        <div className={`p-2 rounded-md ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-500'}`}>
        <Icon size={20} />
        </div>
        <span className="font-semibold text-lg">{title}</span>
    </div>
    {badge > 0 && (
        <span className={`${badgeColor} text-white text-xs font-bold px-2 py-1 rounded-full`}>{badge}</span>
    )}
  </button>
);

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

const Phase1 = ({ projectData, setProjectData, scannerNotes, setScannerNotes, addMaterial, editMaterial, deleteMaterial, moveMaterial, toggleMaterialHidden, addAssessment, editAssessment, deleteAssessment, moveAssessment, toggleAssessmentHidden, addQuestionToMaster, moveQuestion, deleteQuestion, updateQuestion, clearMasterAssessment, masterQuestions, setMasterQuestions, masterAssessmentTitle, setMasterAssessmentTitle, currentQuestionType, setCurrentQuestionType, currentQuestion, setCurrentQuestion, editingQuestion, setEditingQuestion, generateMixedAssessment, generatedAssessment, setGeneratedAssessment, assessmentType, setAssessmentType, assessmentTitle, setAssessmentTitle, quizQuestions, setQuizQuestions, printInstructions, setPrintInstructions, editingAssessment, setEditingAssessment, migrateCode, setMigrateCode, migratePrompt, setMigratePrompt, migrateOutput, setMigrateOutput }) => {
  const [harvestType, setHarvestType] = useState('MODULE'); // 'MODULE', 'FEATURE', 'ASSET', 'ASSESSMENT', 'AI_MODULE'
  const [mode, setMode] = useState('B'); 
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

  // Materials Manager State
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    number: '',
    title: '',
    description: '',
    viewUrl: '',
    downloadUrl: '',
    color: 'slate'
  });
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [parsedAiModule, setParsedAiModule] = useState(null);
  const [aiParseError, setAiParseError] = useState(null);
  const [aiTargetType, setAiTargetType] = useState('MODULE'); // 'MODULE' or 'FEATURE'

  // NEW: Handler for Batch Imports
  const handleBatchImport = (items) => {
     const newModules = items.map(item => ({
         id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
         title: item.title,
         code: { id: item.id, html: item.html, script: item.script }
     }));
     
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
    
    // MULTIPLE CHOICE QUIZ
    if (assessmentType === 'quiz') {
      const questionsHtml = quizQuestions.map((q, idx) => `
        <div class="mb-8 p-6 bg-slate-900 rounded-xl border border-slate-700">
          <h3 class="text-lg font-bold text-white mb-4">${idx + 1}. ${q.question}</h3>
          <div class="space-y-2">
            ${q.options.map((opt, optIdx) => `
              <label class="flex items-center gap-3 p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-750 transition-colors">
                <input type="radio" name="q${idx}" value="${optIdx}" class="w-4 h-4" />
                <span class="text-slate-300">${opt}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `).join('');

      const answers = quizQuestions.map(q => q.correct);

      const html = `<div id="${quizId}" class="w-full h-full custom-scroll p-8">
        <div class="max-w-4xl mx-auto">
          <header class="mb-8">
            <h1 class="text-3xl font-black text-white italic mb-2">${assessmentTitle}</h1>
            <p class="text-sm text-slate-400">Select the best answer for each question.</p>
          </header>
          <form id="${quizId}-form" class="space-y-6">
            ${questionsHtml}
            <div class="flex gap-4">
              <button type="button" onclick="${quizId}_submit()" class="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-lg">Submit Quiz</button>
              <button type="button" onclick="${quizId}_reset()" class="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg">Reset</button>
            </div>
          </form>
          <div id="${quizId}-result" class="hidden mt-6 p-6 rounded-xl"></div>
        </div>
      </div>`;

      const script = `
      const ${quizId}_answers = ${JSON.stringify(answers)};
      function ${quizId}_submit() {
        const form = document.getElementById('${quizId}-form');
        let score = 0;
        let total = ${quizId}_answers.length;
        ${quizId}_answers.forEach((correctAnswer, idx) => {
          const selected = form.querySelector('input[name="q' + idx + '"]:checked');
          if (selected && parseInt(selected.value) === correctAnswer) {
            score++;
          }
        });
        const percentage = Math.round((score / total) * 100);
        const resultDiv = document.getElementById('${quizId}-result');
        resultDiv.className = percentage >= 70 ? 'mt-6 p-6 rounded-xl bg-emerald-900/20 border border-emerald-500' : 'mt-6 p-6 rounded-xl bg-rose-900/20 border border-rose-500';
        resultDiv.innerHTML = '<h3 class="text-2xl font-bold mb-2">' + (percentage >= 70 ? '✅ Passed!' : '❌ Keep Trying') + '</h3><p class="text-lg">Score: ' + score + '/' + total + ' (' + percentage + '%)</p>';
        resultDiv.classList.remove('hidden');
      }
      function ${quizId}_reset() {
        document.getElementById('${quizId}-form').reset();
        document.getElementById('${quizId}-result').classList.add('hidden');
      }
      `;

      setGeneratedAssessment(JSON.stringify({ id: quizId, html, script, type: 'quiz', title: assessmentTitle }, null, 2));
    }
    
    // LONG ANSWER
    else if (assessmentType === 'longanswer') {
      const promptsHtml = quizQuestions.map((q, idx) => `
        <div class="mb-8 p-6 bg-slate-900 rounded-xl border border-slate-700 print-section">
          <h3 class="text-lg font-bold text-white mb-4 print-question">${idx + 1}. ${q.question}</h3>
          <textarea 
            id="${quizId}-answer-${idx}" 
            placeholder="Type your answer here..."
            class="w-full h-48 bg-slate-950 border border-slate-700 rounded-lg p-4 text-white resize-none focus:border-purple-500 focus:outline-none print-response"
          ></textarea>
          <p class="text-xs text-slate-500 italic mt-2 no-print">Auto-saved to browser ✓</p>
        </div>
      `).join('');

      const html = `<div id="${quizId}" class="w-full h-full custom-scroll p-8">
        <div class="max-w-4xl mx-auto">
          <header class="mb-8">
            <h1 class="text-3xl font-black text-white italic mb-2 print-title">${assessmentTitle}</h1>
            <p class="text-sm text-slate-400 no-print">Complete all questions. Your responses are auto-saved.</p>
          </header>
          
          <!-- Student Info -->
          <div class="grid grid-cols-2 gap-4 mb-8 p-6 bg-slate-900 rounded-xl border border-slate-700 print-header">
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Student Name</label>
              <input 
                type="text" 
                id="${quizId}-student-name"
                placeholder="Enter your name..."
                class="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Date</label>
              <input 
                type="date" 
                id="${quizId}-student-date"
                class="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <!-- Questions -->
          <div class="space-y-6">
            ${promptsHtml}
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3 mt-8 no-print">
            <button type="button" onclick="${quizId}_save()" class="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2">
              💾 Save Progress
            </button>
            <button type="button" onclick="${quizId}_download()" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2">
              📥 Download Backup
            </button>
            <button type="button" onclick="document.getElementById('${quizId}-upload').click()" class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2">
              📤 Upload Backup
            </button>
            <button type="button" onclick="${quizId}_print()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2">
              🖨️ Print & Submit
            </button>
            <button type="button" onclick="${quizId}_clear()" class="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2">
              🗑️ Clear All
            </button>
          </div>
          <input type="file" id="${quizId}-upload" accept=".json" style="display: none;" onchange="${quizId}_loadBackup(this)" />

          <!-- Status Messages -->
          <div id="${quizId}-saved" class="hidden mt-6 p-4 rounded-xl bg-emerald-900/20 border border-emerald-500">
            <p class="text-emerald-400 font-bold">✅ Responses saved successfully!</p>
          </div>
          <div id="${quizId}-loaded" class="hidden mt-6 p-4 rounded-xl bg-blue-900/20 border border-blue-500">
            <p class="text-blue-400 font-bold">✅ Backup loaded successfully!</p>
          </div>

          <!-- Print Instructions -->
          <div class="mt-8 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg no-print">
            <p class="text-amber-300 text-sm">
              📋 <strong>Instructions:</strong> Complete all questions, then click "Print & Submit" to create a PDF or print for your instructor.
            </p>
          </div>
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
      </div>`;

      const script = `
      const ${quizId}_count = ${quizQuestions.length};
      
      // Initialize: Load saved data on page load
      window.addEventListener('load', function() {
        ${quizId}_loadFromLocalStorage();
      });
      
      // Auto-save on input for all fields
      function ${quizId}_setupAutoSave() {
        // Student info auto-save
        const nameField = document.getElementById('${quizId}-student-name');
        const dateField = document.getElementById('${quizId}-student-date');
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
        
        // Answer auto-save
        for (let i = 0; i < ${quizId}_count; i++) {
          const textarea = document.getElementById('${quizId}-answer-' + i);
          if (textarea) {
            textarea.addEventListener('input', function() {
              localStorage.setItem('${quizId}-answer-' + i, this.value);
            });
          }
        }
      }
      
      // Load from localStorage
      function ${quizId}_loadFromLocalStorage() {
        const nameField = document.getElementById('${quizId}-student-name');
        const dateField = document.getElementById('${quizId}-student-date');
        
        if (nameField) {
          const savedName = localStorage.getItem('${quizId}-student-name');
          if (savedName) nameField.value = savedName;
        }
        if (dateField) {
          const savedDate = localStorage.getItem('${quizId}-student-date');
          if (savedDate) dateField.value = savedDate;
        }
        
        for (let i = 0; i < ${quizId}_count; i++) {
          const textarea = document.getElementById('${quizId}-answer-' + i);
          if (textarea) {
            const saved = localStorage.getItem('${quizId}-answer-' + i);
            if (saved) textarea.value = saved;
          }
        }
        
        ${quizId}_setupAutoSave();
      }
      
      // Manual Save
      function ${quizId}_save() {
        const savedDiv = document.getElementById('${quizId}-saved');
        savedDiv.classList.remove('hidden');
        setTimeout(function() { savedDiv.classList.add('hidden'); }, 3000);
      }
      
      // Download Backup
      function ${quizId}_download() {
        const data = {
          studentName: document.getElementById('${quizId}-student-name')?.value || '',
          studentDate: document.getElementById('${quizId}-student-date')?.value || '',
          answers: []
        };
        
        for (let i = 0; i < ${quizId}_count; i++) {
          const textarea = document.getElementById('${quizId}-answer-' + i);
          data.answers.push(textarea ? textarea.value : '');
        }
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '${assessmentTitle.replace(/[^a-z0-9]/gi, '_')}_backup.json';
        a.click();
        URL.revokeObjectURL(url);
      }
      
      // Load Backup
      function ${quizId}_loadBackup(input) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const data = JSON.parse(e.target.result);
            
            const nameField = document.getElementById('${quizId}-student-name');
            const dateField = document.getElementById('${quizId}-student-date');
            
            if (nameField && data.studentName) {
              nameField.value = data.studentName;
              localStorage.setItem('${quizId}-student-name', data.studentName);
            }
            if (dateField && data.studentDate) {
              dateField.value = data.studentDate;
              localStorage.setItem('${quizId}-student-date', data.studentDate);
            }
            
            data.answers.forEach((answer, i) => {
              const textarea = document.getElementById('${quizId}-answer-' + i);
              if (textarea) {
                textarea.value = answer;
                localStorage.setItem('${quizId}-answer-' + i, answer);
              }
            });
            
            const loadedDiv = document.getElementById('${quizId}-loaded');
            loadedDiv.classList.remove('hidden');
            setTimeout(function() { loadedDiv.classList.add('hidden'); }, 3000);
          } catch(err) {
            alert('Error loading backup file. Please check the file and try again.');
          }
        };
        reader.readAsText(file);
      }
      
      // Print
      function ${quizId}_print() {
        window.print();
      }
      
      // Clear All
      function ${quizId}_clear() {
        if (!confirm('⚠️ Clear all responses? This cannot be undone.')) return;
        
        const nameField = document.getElementById('${quizId}-student-name');
        const dateField = document.getElementById('${quizId}-student-date');
        
        if (nameField) {
          nameField.value = '';
          localStorage.removeItem('${quizId}-student-name');
        }
        if (dateField) {
          dateField.value = '';
          localStorage.removeItem('${quizId}-student-date');
        }
        
        for (let i = 0; i < ${quizId}_count; i++) {
          const textarea = document.getElementById('${quizId}-answer-' + i);
          if (textarea) textarea.value = '';
          localStorage.removeItem('${quizId}-answer-' + i);
        }
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
            <h1 class="text-3xl font-black text-white italic mb-2">${assessmentTitle}</h1>
            <p class="text-sm text-slate-400">Complete this assignment and submit to your instructor.</p>
          </header>
          <div class="p-8 bg-slate-900 rounded-xl border border-slate-700">
            <h3 class="text-lg font-bold text-white mb-4">Instructions:</h3>
            <ol class="list-decimal list-inside space-y-2 text-slate-300 mb-8">
              ${instructions}
            </ol>
            <div class="border-t border-slate-700 pt-6 space-y-4">
              <div><span class="font-bold text-white">Student Name:</span> <span class="inline-block border-b border-slate-600 w-64 ml-2"></span></div>
              <div><span class="font-bold text-white">Date:</span> <span class="inline-block border-b border-slate-600 w-48 ml-2"></span></div>
              <div><span class="font-bold text-white">Assignment:</span> <span class="text-purple-400">${assessmentTitle}</span></div>
            </div>
          </div>
          <div class="mt-6 flex gap-4">
            <button type="button" onclick="window.print()" class="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-lg">Print & Submit</button>
          </div>
          <div class="mt-4 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
            <p class="text-amber-300 text-sm">📋 <strong>Reminder:</strong> Print this page, complete the assignment, and submit to your instructor.</p>
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
          code: parsedCode 
      };

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
             console.log('✅ ${divId} module loaded');
         });
     } else {
         console.log('✅ ${divId} module loaded');
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
                 <button onClick={() => { setIsBatchMode(false); setHarvestType('MODULE'); }} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all whitespace-nowrap ${!isBatchMode && harvestType === 'MODULE' ? 'bg-yellow-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                     <Box size={14} /> Module
                 </button>
                 <button onClick={() => { setIsBatchMode(false); setHarvestType('FEATURE'); }} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all whitespace-nowrap ${!isBatchMode && harvestType === 'FEATURE' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                     <Wrench size={14} /> Feature
                 </button>
                 <button onClick={() => { setIsBatchMode(false); setHarvestType('ASSESSMENT'); }} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all whitespace-nowrap ${!isBatchMode && harvestType === 'ASSESSMENT' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                     <CheckCircle size={14} /> Assessment
                 </button>
                 <button onClick={() => { setIsBatchMode(false); setHarvestType('MATERIALS'); }} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all whitespace-nowrap ${!isBatchMode && harvestType === 'MATERIALS' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                     <BookOpen size={14} /> Materials
                 </button>
                 <button onClick={() => { setIsBatchMode(false); setHarvestType('AI_MODULE'); }} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all whitespace-nowrap ${!isBatchMode && harvestType === 'AI_MODULE' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                     <Sparkles size={14} /> AI Studio
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
                                ➕ Add Questions
                            </button>
                            <button 
                                onClick={() => setMode('MASTER')} 
                                className={`px-4 py-2 rounded-t text-xs font-bold transition-colors whitespace-nowrap ${mode === 'MASTER' ? 'bg-purple-600 text-white' : 'bg-transparent text-slate-400 hover:text-white'}`}
                            >
                                ⭐ Master Assessment
                            </button>
                            <button 
                                onClick={() => setMode('MANAGE')} 
                                className={`px-4 py-2 rounded-t text-xs font-bold transition-colors whitespace-nowrap ${mode === 'MANAGE' ? 'bg-purple-600 text-white' : 'bg-transparent text-slate-400 hover:text-white'}`}
                            >
                                📋 Manage
                            </button>
                            <button 
                                onClick={() => setMode('MIGRATE')} 
                                className={`px-4 py-2 rounded-t text-xs font-bold transition-colors whitespace-nowrap ${mode === 'MIGRATE' ? 'bg-purple-600 text-white' : 'bg-transparent text-slate-400 hover:text-white'}`}
                            >
                                🔄 Migrate
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
                                        📝 Multiple Choice
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setCurrentQuestionType('long-answer');
                                            setCurrentQuestion({ question: '', options: ['', '', '', ''], correct: 0 });
                                        }} 
                                        className={`flex-1 py-3 px-4 rounded text-xs font-bold transition-all ${currentQuestionType === 'long-answer' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        ✍️ Long Answer
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
                                                alert("✅ Question added to Master Assessment!");
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
                                                alert("✅ Question added to Master Assessment!");
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
                                        💡 <strong>Tip:</strong> Add all your questions here, then go to the "Master Assessment" tab to organize them and generate the final assessment.
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
                                                        script: parsed.script
                                                    });
                                                    alert("✅ Assessment added successfully! Switching to Manage tab...");
                                                    setGeneratedAssessment("");
                                                    setAssessmentTitle("");
                                                    setQuizQuestions([{ question: '', options: ['', '', '', ''], correct: 0 }]);
                                                    setMode('MANAGE'); // Switch to Manage tab to see it
                                                } catch(e) {
                                                    alert("❌ Error adding assessment. Please try again.");
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
                                                                    {q.type === 'multiple-choice' ? '📝 MC' : '✍️ LA'}
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
                                                        questionCount: masterQuestions.length
                                                    });
                                                    alert("✅ Assessment added successfully! Switching to Manage tab...");
                                                    setGeneratedAssessment("");
                                                    setMasterAssessmentTitle("");
                                                    setMasterQuestions([]);
                                                    setMode('MANAGE');
                                                } catch(e) {
                                                    alert("❌ Error adding assessment. Please try again.");
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
                                                                title: editingAssessment.title
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
                                                                script: parsed.script
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
                            <div className="grid grid-cols-2 gap-3 mb-3">
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
                            <button 
                                onClick={() => {
                                    if (!materialForm.title || !materialForm.viewUrl) {
                                        alert("Title and View URL are required");
                                        return;
                                    }
                                    addMaterial(materialForm);
                                    setMaterialForm({ number: '', title: '', description: '', viewUrl: '', downloadUrl: '', color: 'slate' });
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
                                const materialsModule = projectData["Current Course"].modules.find(m => m.id === "item-1768749223001");
                                const materials = materialsModule?.materials || [];
                                
                                if (materials.length === 0) {
                                    return <p className="text-xs text-slate-500 italic text-center py-4">No materials yet. Add one above.</p>;
                                }

                                return materials.sort((a, b) => a.order - b.order).map((mat) => (
                                    <div key={mat.id} className="p-3 bg-slate-900 rounded-lg border border-slate-800 hover:bg-slate-800/70 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center text-${mat.color}-500 bg-${mat.color}-500/10 border border-${mat.color}-500/20 font-bold text-xs`}>
                                                    {mat.number}
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`text-sm font-medium ${mat.hidden ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                        {mat.title} {mat.hidden && <span className="text-[9px] text-slate-600">(HIDDEN)</span>}
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
                                                        setMaterialForm(mat);
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
                                                    disabled={mat.order === materials.length - 1}
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
                                ));
                            })()}
                        </div>

                        {/* EDIT MATERIAL MODAL */}
                        {editingMaterial && (
                            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                                <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Edit Material</h3>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
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
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button 
                                            onClick={() => {
                                                setEditingMaterial(null);
                                                setMaterialForm({ number: '', title: '', description: '', viewUrl: '', downloadUrl: '', color: 'slate' });
                                            }}
                                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={() => {
                                                editMaterial(editingMaterial, materialForm);
                                                setEditingMaterial(null);
                                                setMaterialForm({ number: '', title: '', description: '', viewUrl: '', downloadUrl: '', color: 'slate' });
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
           console.log('✅ [feature-name] loaded');
       });
   } else {
       console.log('✅ [feature-name] loaded');
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
                                        : 'Feature added to Global Toolkit! Check Phase 5 to view or Phase 4 to add to a course.'
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
                            <div className="flex gap-2 mb-6"><button onClick={() => handleSessionSave()} disabled={!stagingJson || !stagingTitle} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs shadow-lg"><Zap size={14} /> ⚡ Add to Session (Instant)</button></div>
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

const Phase2 = ({ projectData, onEdit, onPreview, onDelete }) => {
  const [sourceType, setSourceType] = useState('MODULE'); // 'MODULE' or 'FEATURE'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  
  const currentCourse = projectData["Current Course"]?.modules || [];
  const globalToolkit = projectData["Global Toolkit"] || [];
  const items = sourceType === 'MODULE' ? currentCourse : globalToolkit;
  
  // Filter items based on search query
  const filteredItems = items.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreview = (index) => {
    const item = filteredItems[index];
    setSelectedItem(item);
    console.log('Preview clicked:', { item, index, sourceType });
    if (onPreview) {
      // Find the original index in the unfiltered items array
      const originalIndex = items.findIndex(i => i.id === item.id);
      console.log('Original index found:', originalIndex);
      if (originalIndex !== -1) {
        const typeParam = sourceType === 'MODULE' ? 'module' : 'toolkit';
        console.log('Calling onPreview with:', originalIndex, typeParam);
        onPreview(originalIndex, typeParam);
      } else {
        console.error('Could not find original index for item:', item);
      }
    } else {
      console.error('onPreview prop is not defined');
    }
  };

  const handleEdit = (index) => {
    const item = filteredItems[index];
    if (onEdit) {
      const originalIndex = items.findIndex(i => i.id === item.id);
      onEdit(originalIndex, sourceType === 'MODULE' ? 'module' : 'toolkit');
    }
  };

  const handleDelete = (index) => {
    const item = filteredItems[index];
    if (onDelete) {
      onDelete(item.id, sourceType === 'MODULE' ? 'module' : 'toolkit');
    }
  };

  const getCodeStats = (item) => {
    try {
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
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 mb-4">
            <button 
                onClick={() => { setSourceType('MODULE'); setSearchQuery(""); setSelectedItem(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-bold transition-all ${sourceType === 'MODULE' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Box size={14} /> Course Modules ({currentCourse.length})
            </button>
            <button 
                onClick={() => { setSourceType('FEATURE'); setSearchQuery(""); setSelectedItem(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-bold transition-all ${sourceType === 'FEATURE' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Wrench size={14} /> Global Toolkit ({globalToolkit.length})
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
                            className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-purple-500/50 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold text-sm truncate mb-1">{item.title}</h3>
                                    <p className="text-xs text-slate-500 font-mono truncate">{item.id}</p>
                                </div>
                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${sourceType === 'MODULE' ? 'bg-purple-900/30 text-purple-400' : 'bg-orange-900/30 text-orange-400'}`}>
                                    {sourceType === 'MODULE' ? 'Module' : 'Feature'}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">
                                <FileCode size={12} />
                                <span>{(stats.total / 1024).toFixed(1)} KB</span>
                                <span className="text-slate-700">•</span>
                                <span>{stats.htmlLength > 0 ? 'Has HTML' : 'No HTML'}</span>
                                <span className="text-slate-700">•</span>
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
                                    className="flex items-center justify-center gap-1 bg-slate-700 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
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
        // alert("✅ Project Restored Successfully!"); // Removed Alert
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

const Phase4 = ({ projectData, setProjectData, excludedIds, toggleModule }) => {
  const [fullSiteCode, setFullSiteCode] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);

  const modules = projectData["Current Course"]?.modules || [];
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

  const generateFullSite = () => {
    let finalCode = MASTER_SHELL;
    
    // Filter active modules
    const activeModules = modules.filter(m => !excludedIds.includes(m.id));
    
    // Filter enabled toolkit items
    const enabledTools = toolkit.filter(t => t.enabled);
    const hiddenTools = enabledTools.filter(t => t.hiddenFromUser);
    const visibleTools = enabledTools.filter(t => !t.hiddenFromUser);

    let navInjection = "";
    let contentInjection = "";
    let scriptInjection = "";

    // 1. Build Injections for Modules
    activeModules.forEach(item => {
      let itemCode = item.code || {};
      if (typeof itemCode === 'string') {
          try { itemCode = JSON.parse(itemCode); } catch(e) {}
      }
      
      // Special handling for Course Materials module
      if (item.id === "item-1768749223001" || item.title === "Course Materials") {
        const materials = (item.materials || []).filter(m => !m.hidden).sort((a, b) => a.order - b.order);
        
        // Generate material cards dynamically
        const materialCards = materials.map(mat => {
          const colorClass = mat.color || 'slate';
          const borderClass = colorClass !== 'slate' ? `border-l-4 border-l-${colorClass}-500` : '';
          const bgClass = colorClass !== 'slate' ? `bg-${colorClass}-500/10` : 'bg-slate-800';
          const borderColorClass = colorClass !== 'slate' ? `border-${colorClass}-500/20` : 'border-slate-700';
          const textColorClass = colorClass !== 'slate' ? `text-${colorClass}-500` : 'text-slate-500';
          const buttonColorClass = colorClass !== 'slate' ? `bg-${colorClass}-600 hover:bg-${colorClass}-500` : 'bg-sky-600 hover:bg-sky-500';
          
          // Properly escape quotes in the onclick handlers
          const escapedViewUrl = mat.viewUrl.replace(/'/g, "\\'");
          const escapedTitle = (mat.title || '').replace(/'/g, "\\'");
          const escapedDownloadUrl = mat.downloadUrl.replace(/'/g, "\\'");
          
          return `<div class="material-card flex flex-col md:flex-row items-center justify-between gap-6 ${borderClass}">
    <div class="flex items-center gap-6">
        <div class="w-12 h-12 rounded-lg ${bgClass} flex items-center justify-center ${textColorClass} font-black italic text-xl border ${borderColorClass}">${mat.number}</div>
        <div>
            <h3 class="text-lg font-bold text-white uppercase italic">${mat.title}</h3>
            <p class="text-xs text-slate-400 font-mono">${mat.description}</p>
        </div>
    </div>
    <div class="flex gap-3 w-full md:w-auto">
        <button onclick="openPDF('${escapedViewUrl}', '${escapedTitle}')" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg border border-slate-600 transition-all">View Slides</button>
        <a href="${escapedDownloadUrl}" target="_blank" class="flex-1 ${buttonColorClass} text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all text-center flex items-center justify-center">Download</a>
    </div>
</div>`;
        }).join('\n                    ');
        
        // Generate the full materials view HTML
        const materialsHTML = `<div id="view-materials" class="w-full h-full custom-scroll p-8 md:p-12">
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
                <div class="grid grid-cols-1 gap-4">
                    ${materialCards}
                </div>
            </div>
        </div>`;
        
        // Add nav button
        navInjection += `\n            <button onclick="switchView('materials')" id="nav-materials" class="nav-item">\n                <span class="w-2 h-2 rounded-full bg-slate-600"></span>${item.title}\n            </button>`;
        
        // Inject the dynamically generated HTML
        contentInjection += '\n        ' + materialsHTML + '\n';
        
        // Inject the scripts
        if (itemCode.script) scriptInjection += '\n        ' + itemCode.script + '\n';
        
      }
      // Special handling for Assessments module
      else if (item.id === "item-assessments" || item.title === "Assessments") {
        const assessments = (item.assessments || []).filter(a => !a.hidden).sort((a, b) => a.order - b.order);
        
        // Generate assessment cards for selection page
        const assessmentCards = assessments.map((assess, idx) => {
          const typeLabel = assess.type === 'quiz' ? 'Multiple Choice' : assess.type === 'longanswer' ? 'Long Answer' : assess.type === 'print' ? 'Print & Submit' : 'Mixed Assessment';
          const typeIcon = assess.type === 'quiz' ? '📝' : assess.type === 'longanswer' ? '✍️' : assess.type === 'print' ? '🖨️' : '📋';
          const questionCount = assess.questionCount || (assess.type === 'mixed' ? 'Multiple' : 'Unknown');
          
          return `
          <div class="p-6 bg-slate-900/80 rounded-xl border border-slate-700 hover:border-purple-500 transition-all cursor-pointer group" onclick="showAssessment(${idx})">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-3xl">${typeIcon}</span>
                  <div>
                    <h3 class="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">${assess.title}</h3>
                    <p class="text-xs text-slate-400 uppercase tracking-wider">${typeLabel}${assess.questionCount ? ' • ' + questionCount + ' Questions' : ''}</p>
                  </div>
                </div>
              </div>
              <div class="text-purple-400 group-hover:translate-x-1 transition-transform">
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
          '          <button onclick="backToAssessmentList()" class="mb-6 flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold text-sm transition-colors">\n' +
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
        
        // Generate the full assessments view HTML with selection page (WITH INLINE SCRIPTS)
        const assessmentViewHTML = `<div id="view-assessments" class="w-full h-full custom-scroll p-8 md:p-12">
            <div class="max-w-5xl mx-auto">
                <!-- Assessment Selection Page -->
                <div id="assessment-list">
                    <div class="mb-12">
                        <h2 class="text-3xl font-black text-white italic uppercase tracking-tighter">Assessment <span class="text-purple-500">Center</span></h2>
                        <p class="text-xs text-slate-400 font-mono uppercase tracking-widest mt-2">Select an assessment to begin</p>
                    </div>
                    ${assessments.length > 0 ? `
                    <div class="grid grid-cols-1 gap-4">
                        ${assessmentCards}
                    </div>` : '<p class="text-center text-slate-500 italic py-12">No assessments available.</p>'}
                </div>
                
                <!-- Individual Assessments (hidden by default) -->
                ${assessmentContainers}
            </div>
            
            <!-- INLINE ASSESSMENT NAVIGATION SCRIPTS -->
            <script>
            (function() {
              console.log('🔧 [INLINE] Initializing assessment navigation functions...');
              
              window.showAssessment = function(index) {
                console.log('📋 [INLINE] Showing assessment:', index);
                var listEl = document.getElementById('assessment-list');
                var targetEl = document.getElementById('assessment-' + index);
                
                if (listEl) listEl.classList.add('hidden');
                document.querySelectorAll('.assessment-container').forEach(function(c) {
                  c.classList.add('hidden');
                });
                if (targetEl) {
                  targetEl.classList.remove('hidden');
                } else {
                  console.error('❌ Assessment container not found:', 'assessment-' + index);
                }
                window.scrollTo(0, 0);
              };
              
              window.backToAssessmentList = function() {
                console.log('⬅️ [INLINE] Returning to assessment list');
                document.querySelectorAll('.assessment-container').forEach(function(c) {
                  c.classList.add('hidden');
                });
                var listEl = document.getElementById('assessment-list');
                if (listEl) listEl.classList.remove('hidden');
                window.scrollTo(0, 0);
              };
              
              // Global Toolkit Menu Toggle
              window.toggleToolkitMenu = function() {
                console.log('🔧 [INLINE] Toggling toolkit menu');
                var dropdown = document.getElementById('toolkit-dropdown');
                if (dropdown) {
                  dropdown.classList.toggle('hidden');
                }
              };
              
              // Global Toolkit Tool Toggle
              var toolkitState = JSON.parse(localStorage.getItem('mf_toolkit') || '{}');
              
              window.toggleTool = function(toolId) {
                console.log('🔧 [INLINE] Toggling tool:', toolId);
                console.log('🔧 [DEBUG] Looking for element ID:', 'feat-' + toolId);
                
                toolkitState[toolId] = !toolkitState[toolId];
                localStorage.setItem('mf_toolkit', JSON.stringify(toolkitState));
                
                var toolElement = document.getElementById('feat-' + toolId);
                var toggleButton = document.getElementById('toggle-' + toolId);
                
                console.log('🔧 [DEBUG] Tool element found:', !!toolElement);
                console.log('🔧 [DEBUG] Toggle button found:', !!toggleButton);
                console.log('🔧 [DEBUG] New state:', toolkitState[toolId]);
                
                if (toolElement) {
                  if (toolkitState[toolId]) {
                    toolElement.classList.remove('hidden');
                    console.log('🔧 [DEBUG] Showing tool');
                  } else {
                    toolElement.classList.add('hidden');
                    console.log('🔧 [DEBUG] Hiding tool');
                  }
                }
                
                if (toggleButton) {
                  if (toolkitState[toolId]) {
                    toggleButton.classList.remove('bg-slate-600');
                    toggleButton.classList.add('bg-emerald-600');
                    var dot = toggleButton.querySelector('div');
                    if (dot) dot.classList.add('translate-x-4');
                    console.log('🔧 [DEBUG] Toggle ON visual');
                  } else {
                    toggleButton.classList.remove('bg-emerald-600');
                    toggleButton.classList.add('bg-slate-600');
                    var dot = toggleButton.querySelector('div');
                    if (dot) dot.classList.remove('translate-x-4');
                    console.log('🔧 [DEBUG] Toggle OFF visual');
                  }
                }
              };
              
              // Initialize toolkit state on load
              window.initializeToolkit = function() {
                console.log('🔧 [INLINE] Initializing toolkit state');
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
              
              console.log('✅ [INLINE] Assessment navigation + toolkit functions ready!');
            })();
            </script>
        </div>`;
        
        // Generate combined assessment scripts
        const assessmentScripts = assessments.map(assess => assess.script || '').join('\n        ');
        
        // Add navigation functions (attached to window for onclick access)
        const navScripts = `
        (function() {
          console.log('🔧 Initializing assessment navigation functions...');
          
          window.showAssessment = function(index) {
            console.log('📋 Showing assessment:', index);
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
            console.log('⬅️ Returning to assessment list');
            document.querySelectorAll('.assessment-container').forEach(function(c) {
              c.classList.add('hidden');
            });
            var listEl = document.getElementById('assessment-list');
            if (listEl) listEl.classList.remove('hidden');
            window.scrollTo(0, 0);
          };
          
          console.log('✅ Assessment navigation functions ready!');
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
        // Normal module handling (WITH INLINE SCRIPTS FOR GOOGLE SITES)
        if (itemCode.id) {
            const shortId = itemCode.id.replace('view-', '');
            navInjection += `\n            <button onclick="switchView('${shortId}')" id="nav-${shortId}" class="nav-item">\n                <span class="w-2 h-2 rounded-full bg-slate-600"></span>${item.title}\n            </button>`;
        }
        if (itemCode.html) {
          // Embed script INLINE with HTML for Google Sites compatibility
          const htmlWithInlineScript = itemCode.html + (itemCode.script ? '\n<script>\n' + itemCode.script + '\n</script>' : '');
          contentInjection += '\n        ' + htmlWithInlineScript + '\n';
        }
      }
    });

    // 2. Inject Hidden Tools (apply silently) WITH INLINE SCRIPTS
    hiddenTools.forEach(tool => {
      const toolCode = typeof tool.code === 'string' ? JSON.parse(tool.code) : tool.code;
      if (tool.includeUi && toolCode.html) {
        const htmlWithScript = toolCode.html + (toolCode.script ? '\n<script>\n' + toolCode.script + '\n</script>' : '');
        contentInjection += '\n        ' + htmlWithScript + '\n';
      }
    });

    // 3. Inject Global Toolkit Dropdown (if there are visible tools)
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
                <button onclick="toggleToolkitMenu()" class="text-slate-400 hover:text-white">✕</button>
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

    // 2. CLEANUP: Remove any existing hardcoded "view-" divs from MASTER_SHELL
    // This prevents the "Split Screen" bug where both the hardcoded and injected views exist.
    // We use a regex to strip out divs starting with id="view-" from the template
    finalCode = finalCode.replace(/<div id="view-.*?"[\s\S]*?<\/div>\s*<\/div>/g, (match) => {
        // Only remove if it looks like a module container (optional safety check)
        return ''; 
    });
    // Fallback: Specifically remove view-materials if regex misses
    if(finalCode.includes('id="view-materials"')) {
        finalCode = finalCode.replace(/<div id="view-materials"[\s\S]*?<\/div>/, '');
    }

    // 3. Inject Nav
    if (finalCode.includes('<!-- Dynamic Modules will be injected here -->')) {
        finalCode = finalCode.replace(
            '<!-- Dynamic Modules will be injected here -->', 
            '<!-- Dynamic Modules will be injected here -->' + navInjection
        );
    } else {
        finalCode = finalCode.replace('</nav>', navInjection + '\n        </nav>');
    }

    // 4. Inject Content
    if (finalCode.includes('<iframe id="view-external"')) {
        finalCode = finalCode.replace(
            '<iframe id="view-external"', 
            contentInjection + '\n        <iframe id="view-external"'
        );
    } else {
        finalCode = finalCode.replace('</div>\n\n    <!-- MODULE SCRIPTS CONTAINER -->', contentInjection + '\n        </div>\n\n    <!-- MODULE SCRIPTS CONTAINER -->');
    }

    // 5. Inject Script
    if (finalCode.includes('// New module logic will be appended here')) {
        finalCode = finalCode.replace(
            '// New module logic will be appended here', 
            '// New module logic will be appended here' + scriptInjection
        );
    } else {
        finalCode = finalCode.replace('</script>\n</body>', scriptInjection + '\n    </script>\n</body>');
    }

    setFullSiteCode(finalCode);
    setIsGenerated(true);
  };

  const downloadFile = () => {
    const blob = new Blob([fullSiteCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
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
                            const isExcluded = excludedIds.includes(mod.id);
                            return (
                                <div key={mod.id} className="p-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${isExcluded ? 'bg-slate-600' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
                                        <span className={`text-sm ${isExcluded ? 'text-slate-500' : 'text-slate-200 font-medium'}`}>{mod.title}</span>
                                    </div>
                                    <button 
                                        onClick={() => toggleModule(mod.id)}
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

                <button 
                    onClick={generateFullSite}
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
                            onClick={() => setIsGenerated(false)}
                            className="text-xs text-slate-500 hover:text-white px-2 py-1"
                        >
                            Reset
                        </button>
                    </div>
                </div>
                <CodeBlock label="Full Website Source" code={fullSiteCode} height="h-96" />
                <div className="mt-4 p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg text-sm text-purple-200">
                    <strong>Next Step:</strong> Download the file above, or copy the block and paste it into your Google Sites "Embed Code" widget.
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// --- NEW PHASE 5: TOOLKIT ---
const PhaseToolkit = ({ projectData }) => {
  const toolkitItems = projectData["Global Toolkit"] || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Wrench className="text-orange-400" /> Phase 5: Component Toolkit
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* STATIC EXAMPLE TOOL: DARK MODE */}
            <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl hover:border-blue-500 transition-colors group cursor-not-allowed opacity-75">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-blue-400 transition-colors">
                            <Eye size={20} />
                        </div>
                        <h3 className="font-bold text-slate-200">Dark Mode Toggle</h3>
                    </div>
                    <div className="h-4 w-8 bg-slate-700 rounded-full relative">
                        <div className="h-4 w-4 bg-slate-500 rounded-full absolute left-0"></div>
                    </div>
                </div>
                <p className="text-xs text-slate-500">Global preference setting (Coming Soon).</p>
            </div>

            {/* DYNAMIC TOOLS FROM HARVEST */}
            {toolkitItems.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-900 border border-slate-700 rounded-xl hover:border-orange-500 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-900/20 rounded-lg text-orange-400">
                                <Wrench size={20} />
                            </div>
                            <h3 className="font-bold text-slate-200">{item.title}</h3>
                        </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800 flex gap-2">
                         <div className="bg-black text-[10px] font-mono text-slate-400 p-1 rounded flex-1 truncate">
                             {item.id}
                         </div>
                    </div>
                </div>
            ))}

            {toolkitItems.length === 0 && (
                <div className="col-span-full p-8 border-2 border-dashed border-slate-700 rounded-xl text-center">
                    <p className="text-slate-500 text-sm mb-2 font-bold">No custom tools harvested yet.</p>
                    <p className="text-xs text-slate-600">Go to <strong>Phase 1: Harvest</strong>, select "Feature (Tool)", and scan your code to populate this list.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- CONFIRMATION MODAL HELPER ---
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onCancel}>
            <div className="bg-slate-900 border border-rose-900 rounded-xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 text-rose-500 mb-4">
                    <AlertOctagon size={24} />
                    <h3 className="text-lg font-bold">Delete Item?</h3>
                </div>
                <p className="text-slate-300 text-sm mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-rose-900/20 transition-colors">Delete Forever</button>
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
  // --- AUTO-SAVE STATE ---
  const STORAGE_KEY = 'course_factory_v2_data';
  const [isAutoLoaded, setIsAutoLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // 💾 AUTO-LOAD: Runs once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Safety check: ensure it has the correct structure
        if (parsed && parsed["Current Course"]) {
          setProjectData(parsed);
          console.log("✅ Project restored from storage");
        }
      }
      setIsAutoLoaded(true); // Allow saving to start
    } catch (error) {
      console.error("❌ Load failed:", error);
      setIsAutoLoaded(true);
    }
  }, []);

  // 💾 AUTO-SAVE: Runs when projectData changes
  useEffect(() => {
    if (!isAutoLoaded) return; // Safety Lock: Don't save empty defaults

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projectData));
        setLastSaved(new Date());
        console.log("💾 Auto-saved project");
      } catch (error) {
        console.error("❌ Save failed:", error);
      }
    }, 1000); // 1-second debounce

    return () => clearTimeout(timer);
  }, [projectData, isAutoLoaded]);

  const [excludedIds, setExcludedIds] = useState([]);
  const [editingModule, setEditingModule] = useState(null); 
  const [editForm, setEditForm] = useState({ title: '', html: '', script: '', id: '', section: '' });
  const [previewModule, setPreviewModule] = useState(null); 
  
  // Custom Confirmation State to replace window.confirm
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); // { id, type: 'module' | 'tool' }
  
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
        ...currentCourse,
        name: newName.trim()
      }
    });
    setIsRenamingCourse(false);
    setTempCourseName("");
  };

  const toggleModuleExclusion = (id) => {
    if (excludedIds.includes(id)) {
      setExcludedIds(excludedIds.filter(i => i !== id));
    } else {
      setExcludedIds([...excludedIds, id]);
    }
  };

  // --- SAFE DELETE LOGIC (Modal) ---
  const requestDelete = (id, type) => {
      setDeleteConfirmation({ id, type });
  };

  const confirmDelete = () => {
      if (!deleteConfirmation) return;
      const { id, type } = deleteConfirmation;

      if (type === 'module') {
          const newModules = currentCourse.modules.filter(m => m.id !== id);
          setProjectData({
              ...projectData,
              "Current Course": {
                  ...projectData["Current Course"],
                  modules: newModules
              }
          });
          if(excludedIds.includes(id)) {
              setExcludedIds(excludedIds.filter(i => i !== id));
          }
      } else if (type === 'toolkit') {
          const newToolkit = toolkit.filter(t => t.id !== id);
          setProjectData({
              ...projectData,
              "Global Toolkit": newToolkit
          });
      }
      setDeleteConfirmation(null);
  };

  // --- NEW: Delete Toolkit Item Logic ---
  const deleteToolkitItem = (id) => {
      requestDelete(id, 'toolkit');
  };
  
  // --- NEW: Delete Module Logic ---
  const deleteModule = (id) => {
      requestDelete(id, 'module');
  };

  const moveModule = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentCourse.modules.length) return;
    
    const newModules = [...currentCourse.modules];
    [newModules[index], newModules[newIndex]] = [newModules[newIndex], newModules[index]];
    
    setProjectData({
      ...projectData,
      "Current Course": {
        ...currentCourse,
        modules: newModules
      }
    });
  };

  const openPreview = (index, type = 'module') => {
    const item = type === 'module' ? currentCourse.modules[index] : toolkit[index];
    if (!item) {
      console.error('Item not found for preview:', index, type);
      return;
    }
    const code = typeof item.code === 'string' ? JSON.parse(item.code) : item.code;
    setPreviewModule({
      title: item.title,
      html: code.html || '',
      script: code.script || ''
    });
  };

  const closePreview = () => {
    setPreviewModule(null);
  };

  // MATERIALS MANAGEMENT FUNCTIONS
  const getMaterialsModule = () => {
    return currentCourse.modules.find(m => m.id === "item-1768749223001" || m.title === "Course Materials");
  };

  // ASSESSMENTS MANAGEMENT FUNCTIONS
  const getAssessmentsModule = () => {
    return currentCourse.modules.find(m => m.id === "item-assessments" || m.title === "Assessments");
  };

  const updateMaterialsModule = (updatedMaterials) => {
    const moduleIndex = currentCourse.modules.findIndex(m => m.id === "item-1768749223001" || m.title === "Course Materials");
    if (moduleIndex === -1) return;
    
    const newModules = [...currentCourse.modules];
    newModules[moduleIndex] = {
      ...newModules[moduleIndex],
      materials: updatedMaterials
    };
    
    setProjectData({
      ...projectData,
      "Current Course": {
        ...currentCourse,
        modules: newModules
      }
    });
  };

  const addMaterial = (materialData) => {
    const materialsModule = getMaterialsModule();
    const materials = materialsModule?.materials || [];
    const newMaterial = {
      id: `mat-${Date.now()}`,
      order: materials.length,
      hidden: false,
      ...materialData
    };
    updateMaterialsModule([...materials, newMaterial]);
  };

  const editMaterial = (materialId, updatedData) => {
    const materialsModule = getMaterialsModule();
    const materials = materialsModule?.materials || [];
    const updated = materials.map(m => m.id === materialId ? { ...m, ...updatedData } : m);
    updateMaterialsModule(updated);
  };

  const deleteMaterial = (materialId) => {
    if (!confirm("Delete this material? This cannot be undone.")) return;
    const materialsModule = getMaterialsModule();
    const materials = materialsModule?.materials || [];
    const updated = materials.filter(m => m.id !== materialId);
    updateMaterialsModule(updated);
  };

  const moveMaterial = (materialId, direction) => {
    const materialsModule = getMaterialsModule();
    const materials = materialsModule?.materials || [];
    const index = materials.findIndex(m => m.id === materialId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= materials.length) return;
    
    const newMaterials = [...materials];
    [newMaterials[index], newMaterials[newIndex]] = [newMaterials[newIndex], newMaterials[index]];
    
    // Update order values
    newMaterials.forEach((m, idx) => m.order = idx);
    updateMaterialsModule(newMaterials);
  };

  const toggleMaterialHidden = (materialId) => {
    const materialsModule = getMaterialsModule();
    const materials = materialsModule?.materials || [];
    const updated = materials.map(m => 
      m.id === materialId ? { ...m, hidden: !m.hidden } : m
    );
    updateMaterialsModule(updated);
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
        ...currentCourse,
        modules: newModules
      }
    });
  };

  const addAssessment = (assessmentData) => {
    const assessmentsModule = getAssessmentsModule();
    const assessments = assessmentsModule?.assessments || [];
    const newAssessment = {
      id: `assess-${Date.now()}`,
      order: assessments.length,
      hidden: false,
      ...assessmentData
    };
    updateAssessmentsModule([...assessments, newAssessment]);
  };

  const editAssessment = (assessmentId, updatedData) => {
    const assessmentsModule = getAssessmentsModule();
    const assessments = assessmentsModule?.assessments || [];
    const updated = assessments.map(a => a.id === assessmentId ? { ...a, ...updatedData } : a);
    updateAssessmentsModule(updated);
  };

  const deleteAssessment = (assessmentId) => {
    if (!confirm("Delete this assessment? This cannot be undone.")) return;
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
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= assessments.length) return;
    
    const newAssessments = [...assessments];
    [newAssessments[index], newAssessments[newIndex]] = [newAssessments[newIndex], newAssessments[index]];
    
    newAssessments.forEach((a, idx) => a.order = idx);
    updateAssessmentsModule(newAssessments);
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
  const addQuestionToMaster = (questionData) => {
    const newQuestion = {
      id: `q-${Date.now()}`,
      order: masterQuestions.length,
      ...questionData
    };
    setMasterQuestions([...masterQuestions, newQuestion]);
    // Reset current question form
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correct: 0
    });
  };

  const moveQuestion = (questionId, direction) => {
    const index = masterQuestions.findIndex(q => q.id === questionId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= masterQuestions.length) return;
    
    const newQuestions = [...masterQuestions];
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    
    // Update order values
    newQuestions.forEach((q, idx) => q.order = idx);
    setMasterQuestions(newQuestions);
  };

  const deleteQuestion = (questionId) => {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    const updated = masterQuestions.filter(q => q.id !== questionId);
    // Reorder remaining questions
    updated.forEach((q, idx) => q.order = idx);
    setMasterQuestions(updated);
  };

  const updateQuestion = (questionId, updatedData) => {
    const updated = masterQuestions.map(q => 
      q.id === questionId ? { ...q, ...updatedData } : q
    );
    setMasterQuestions(updated);
  };

  const clearMasterAssessment = () => {
    if (!confirm("Clear all questions from Master Assessment? This cannot be undone.")) return;
    setMasterQuestions([]);
    setMasterAssessmentTitle("");
  };

  // Generate Mixed Assessment (MC + LA)
  const generateMixedAssessment = () => {
    const assessId = `assess_${Date.now()}`;
    const mcQuestions = masterQuestions.filter(q => q.type === 'multiple-choice');
    const laQuestions = masterQuestions.filter(q => q.type === 'long-answer');
    
    // Generate HTML for all questions in order
    const questionsHtml = masterQuestions.sort((a, b) => a.order - b.order).map((q, idx) => {
      if (q.type === 'multiple-choice') {
        return `
        <div class="mb-8 p-6 bg-slate-900 rounded-xl border border-slate-700 print-section">
          <h3 class="text-lg font-bold text-white mb-4 print-question">${idx + 1}. ${q.question}</h3>
          <div class="space-y-2">
            ${q.options.map((opt, optIdx) => `
              <label class="flex items-center gap-3 p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-750 transition-colors print-option">
                <input type="radio" name="q${idx}" value="${optIdx}" class="w-4 h-4" />
                <span class="text-slate-300">${opt}</span>
              </label>
            `).join('')}
          </div>
        </div>`;
      } else {
        return `
        <div class="mb-8 p-6 bg-slate-900 rounded-xl border border-slate-700 print-section">
          <h3 class="text-lg font-bold text-white mb-4 print-question">${idx + 1}. ${q.question}</h3>
          <textarea 
            id="${assessId}-answer-${idx}" 
            placeholder="Type your answer here..."
            class="w-full h-48 bg-slate-950 border border-slate-700 rounded-lg p-4 text-white resize-none focus:border-purple-500 focus:outline-none print-response"
          ></textarea>
          <p class="text-xs text-slate-500 italic mt-2 no-print">Auto-saved ✓</p>
        </div>`;
      }
    }).join('');

    // Generate answers array for MC questions
    const answers = masterQuestions.map(q => q.type === 'multiple-choice' ? q.correct : null);

    const html = `<div id="${assessId}" class="w-full h-full custom-scroll p-8">
      <div class="max-w-4xl mx-auto">
        <header class="mb-8">
          <h1 class="text-3xl font-black text-white italic mb-2 print-title">${masterAssessmentTitle}</h1>
          <p class="text-sm text-slate-400 no-print">Complete all questions. Your responses are auto-saved.</p>
        </header>
        
        <!-- Student Info -->
        <div class="grid grid-cols-2 gap-4 mb-8 p-6 bg-slate-900 rounded-xl border border-slate-700 print-header">
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Student Name</label>
            <input 
              type="text" 
              id="${assessId}-student-name"
              placeholder="Enter your name..."
              class="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Date</label>
            <input 
              type="date" 
              id="${assessId}-student-date"
              class="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Questions -->
        <form id="${assessId}-form" class="space-y-6">
          ${questionsHtml}
        </form>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-3 mt-8 no-print">
          <button type="button" onclick="${assessId}_generatePDF()" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg">
            📄 Generate PDF
          </button>
        </div>

        <!-- Status Messages -->
        <div id="${assessId}-saved" class="hidden mt-6 p-4 rounded-xl bg-emerald-900/20 border border-emerald-500">
          <p class="text-emerald-400 font-bold">✅ Progress saved!</p>
        </div>
        <div id="${assessId}-result" class="hidden mt-6 p-6 rounded-xl"></div>
      </div>

      <!-- Print Styles -->
      <style>
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-title { color: black !important; font-size: 24pt; text-align: center; border-bottom: 3px solid black; padding-bottom: 10px; margin-bottom: 20px; }
          .print-header { background: white !important; border: 2px solid black !important; }
          .print-header label { color: black !important; }
          .print-header input { border: none !important; border-bottom: 1px solid black !important; background: white !important; color: black !important; }
          .print-section { page-break-inside: avoid; background: white !important; border: 1px solid #ccc !important; }
          .print-question { color: black !important; border-bottom: 2px solid #666; padding-bottom: 5px; }
          .print-option label { color: black !important; }
          .print-response { background: white !important; color: black !important; border: 1px solid #999 !important; min-height: 150px; }
        }
      </style>
    </div>`;

    const script = `
    const ${assessId}_totalQuestions = ${masterQuestions.length};
    const ${assessId}_answers = ${JSON.stringify(answers)};
    
    // Initialize
    window.addEventListener('load', function() {
      ${assessId}_loadAll();
    });
    
    function ${assessId}_setupAutoSave() {
      const nameField = document.getElementById('${assessId}-student-name');
      const dateField = document.getElementById('${assessId}-student-date');
      
      if (nameField) {
        nameField.addEventListener('input', function() {
          localStorage.setItem('${assessId}-student-name', this.value);
        });
      }
      if (dateField) {
        dateField.addEventListener('input', function() {
          localStorage.setItem('${assessId}-student-date', this.value);
        });
      }
      
      // Auto-save for all inputs
      for (let i = 0; i < ${assessId}_totalQuestions; i++) {
        // Multiple choice
        const radios = document.querySelectorAll('input[name="q' + i + '"]');
        radios.forEach(radio => {
          radio.addEventListener('change', function() {
            if (this.checked) {
              localStorage.setItem('${assessId}-q' + i, this.value);
            }
          });
        });
        
        // Long answer
        const textarea = document.getElementById('${assessId}-answer-' + i);
        if (textarea) {
          textarea.addEventListener('input', function() {
            localStorage.setItem('${assessId}-answer-' + i, this.value);
          });
        }
      }
    }
    
    function ${assessId}_loadAll() {
      const nameField = document.getElementById('${assessId}-student-name');
      const dateField = document.getElementById('${assessId}-student-date');
      
      if (nameField) {
        const savedName = localStorage.getItem('${assessId}-student-name');
        if (savedName) nameField.value = savedName;
      }
      if (dateField) {
        const savedDate = localStorage.getItem('${assessId}-student-date');
        if (savedDate) dateField.value = savedDate;
      }
      
      for (let i = 0; i < ${assessId}_totalQuestions; i++) {
        // Load MC answer
        const savedMC = localStorage.getItem('${assessId}-q' + i);
        if (savedMC !== null) {
          const radio = document.querySelector('input[name="q' + i + '"][value="' + savedMC + '"]');
          if (radio) radio.checked = true;
        }
        
        // Load LA answer
        const textarea = document.getElementById('${assessId}-answer-' + i);
        if (textarea) {
          const savedLA = localStorage.getItem('${assessId}-answer-' + i);
          if (savedLA) textarea.value = savedLA;
        }
      }
      
      ${assessId}_setupAutoSave();
    }
    
    function ${assessId}_save() {
      const savedDiv = document.getElementById('${assessId}-saved');
      savedDiv.classList.remove('hidden');
      setTimeout(function() { savedDiv.classList.add('hidden'); }, 3000);
    }
    
    function ${assessId}_loadManual() {
      ${assessId}_loadAll();
      var resultDiv = document.getElementById('${assessId}-result');
      resultDiv.className = 'mt-6 p-6 rounded-xl bg-blue-900/20 border border-blue-500';
      resultDiv.innerHTML = '<h3 class="text-xl font-bold mb-2 text-blue-400">✓ Progress Loaded!</h3><p class="text-white">Your saved responses have been restored.</p>';
      resultDiv.classList.remove('hidden');
      resultDiv.scrollIntoView({ behavior: 'smooth' });
      setTimeout(function() {
        resultDiv.classList.add('hidden');
      }, 2000);
    }
    
    function ${assessId}_generatePDF() {
      // Collect student info
      var studentName = document.getElementById('${assessId}-student-name').value || 'Not Provided';
      var studentDate = document.getElementById('${assessId}-student-date').value || 'Not Provided';
      
      // Build questions and answers HTML
      var questionsHtml = '';
      var mcScore = 0;
      var mcTotal = 0;
      
      for (var i = 0; i < ${assessId}_totalQuestions; i++) {
        var questionNum = i + 1;
        
        // Check if it's MC or LA
        if (${assessId}_answers[i] !== null) {
          // Multiple Choice
          mcTotal++;
          var selected = document.querySelector('input[name="q' + i + '"]:checked');
          var selectedValue = selected ? parseInt(selected.value) : -1;
          var isCorrect = selectedValue === ${assessId}_answers[i];
          if (isCorrect) mcScore++;
          
          var questionText = document.querySelector('input[name="q' + i + '"]').closest('.mb-8').querySelector('.text-lg').innerText;
          var options = Array.from(document.querySelectorAll('input[name="q' + i + '"]')).map(function(radio, idx) {
            var optionText = radio.nextElementSibling.innerText;
            var marker = '';
            if (idx === selectedValue) marker = '➤ ';
            if (idx === ${assessId}_answers[i]) marker += '[CORRECT]';
            return marker + optionText;
          }).join('<br>');
          
          questionsHtml += '<div style="page-break-inside:avoid; margin-bottom:20px; padding:15px; border:1px solid #ccc; border-radius:8px;">' +
            '<h3 style="font-size:16px; font-weight:bold; margin-bottom:10px; color:#333;">' + questionNum + '. ' + questionText + '</h3>' +
            '<div style="font-size:14px; line-height:1.6; color:#555;">' + options + '</div>' +
            '</div>';
        } else {
          // Long Answer
          var questionText = document.getElementById('${assessId}-answer-' + i).closest('.mb-8').querySelector('.text-lg').innerText;
          var answer = document.getElementById('${assessId}-answer-' + i).value || '[No answer provided]';
          
          questionsHtml += '<div style="page-break-inside:avoid; margin-bottom:20px; padding:15px; border:1px solid #ccc; border-radius:8px;">' +
            '<h3 style="font-size:16px; font-weight:bold; margin-bottom:10px; color:#333;">' + questionNum + '. ' + questionText + '</h3>' +
            '<div style="font-size:14px; padding:10px; background:#f9f9f9; border-radius:4px; white-space:pre-wrap; color:#333;">' + answer + '</div>' +
            '</div>';
        }
      }
      
      // Calculate score
      var scoreHtml = '';
      if (mcTotal > 0) {
        var percentage = Math.round((mcScore / mcTotal) * 100);
        var passed = percentage >= 70;
        scoreHtml = '<div style="padding:20px; background:' + (passed ? '#d1fae5' : '#fee2e2') + '; border:2px solid ' + (passed ? '#10b981' : '#ef4444') + '; border-radius:8px; margin-bottom:20px;">' +
          '<h3 style="font-size:20px; font-weight:bold; margin-bottom:10px;">' + (passed ? '✓ Passed' : '⚠ Review Needed') + '</h3>' +
          '<p style="font-size:16px;">Multiple Choice Score: ' + mcScore + '/' + mcTotal + ' (' + percentage + '%)</p>' +
          '<p style="font-size:14px; color:#666; margin-top:5px;">Long answer responses require instructor grading.</p>' +
          '</div>';
      }
      
      // Generate full PDF HTML
      var pdfHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${masterAssessmentTitle} - Completed</title>' +
        '<style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:auto;background:white;color:#333;}h1{text-align:center;border-bottom:3px solid #000;padding-bottom:10px;margin-bottom:20px;}' +
        '.student-info{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px;padding:15px;background:#f0f0f0;border-radius:8px;}' +
        '.student-info div{font-size:14px;}.student-info strong{display:block;margin-bottom:5px;text-transform:uppercase;font-size:12px;color:#666;}' +
        '@media print{body{padding:20px;}}</style></head><body>' +
        '<h1>${masterAssessmentTitle}</h1>' +
        '<div class="student-info"><div><strong>Student Name:</strong>' + studentName + '</div><div><strong>Date:</strong>' + studentDate + '</div></div>' +
        scoreHtml +
        '<div>' + questionsHtml + '</div>' +
        '<script>window.onload=function(){setTimeout(function(){window.print();},500)};<\\/script>' +
        '</body></html>';
      
      // Open in new window
      var pdfWindow = window.open('', '_blank');
      pdfWindow.document.write(pdfHtml);
      pdfWindow.document.close();
    }
    
    function ${assessId}_clear() {
      var resultDiv = document.getElementById('${assessId}-result');
      resultDiv.className = 'mt-6 p-6 rounded-xl bg-rose-900/20 border border-rose-500';
      resultDiv.innerHTML = '<h3 class="text-xl font-bold mb-2 text-rose-400">⚠ Clear All Responses?</h3>' +
        '<p class="mb-4 text-white">This will erase all your answers and cannot be undone.</p>' +
        '<div class="flex gap-3">' +
        '<button onclick="${assessId}_confirmClear()" class="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-6 rounded-lg">Yes, Clear All</button>' +
        '<button onclick="document.getElementById(\\'${assessId}-result\\').classList.add(\\'hidden\\')" class="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded-lg">Cancel</button>' +
        '</div>';
      resultDiv.classList.remove('hidden');
      resultDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    function ${assessId}_confirmClear() {
      const nameField = document.getElementById('${assessId}-student-name');
      const dateField = document.getElementById('${assessId}-student-date');
      
      if (nameField) {
        nameField.value = '';
        localStorage.removeItem('${assessId}-student-name');
      }
      if (dateField) {
        dateField.value = '';
        localStorage.removeItem('${assessId}-student-date');
      }
      
      document.getElementById('${assessId}-form').reset();
      
      for (let i = 0; i < ${assessId}_totalQuestions; i++) {
        localStorage.removeItem('${assessId}-q' + i);
        localStorage.removeItem('${assessId}-answer-' + i);
        
        const textarea = document.getElementById('${assessId}-answer-' + i);
        if (textarea) textarea.value = '';
      }
      
      var resultDiv = document.getElementById('${assessId}-result');
      resultDiv.className = 'mt-6 p-6 rounded-xl bg-emerald-900/20 border border-emerald-500';
      resultDiv.innerHTML = '<h3 class="text-xl font-bold mb-2 text-emerald-400">✓ Cleared!</h3><p class="text-white">All responses have been erased.</p>';
      setTimeout(function() {
        resultDiv.classList.add('hidden');
      }, 2000);
    }
    `;

    setGeneratedAssessment(JSON.stringify({ id: assessId, html, script, type: 'mixed', title: masterAssessmentTitle, questionCount: masterQuestions.length }, null, 2));
  };

  // EDIT MODULE FUNCTIONS
  const openEditModule = (index, type = 'module') => {
      const item = type === 'module' ? currentCourse.modules[index] : toolkit[index];
      const code = typeof item.code === 'string' ? JSON.parse(item.code) : item.code;
      setEditForm({
          title: item.title || '',
          html: code.html || '',
          script: code.script || '',
          id: code.id || item.id || '',
          section: item.section || ''
      });
      setEditingModule({ type, index });
  };
  
  const saveEditModule = () => {
      if (!editingModule) return;
      const updatedCode = {
          id: editForm.id,
          html: editForm.html,
          script: editForm.script
      };
      if (editingModule.type === 'module') {
          const newModules = [...currentCourse.modules];
          newModules[editingModule.index] = {
              ...newModules[editingModule.index],
              title: editForm.title,
              section: editForm.section,
              code: updatedCode
          };
          setProjectData({
              ...projectData,
              "Current Course": { ...currentCourse, modules: newModules }
          });
      } else {
          const newToolkit = [...toolkit];
          newToolkit[editingModule.index] = {
              ...newToolkit[editingModule.index],
              title: editForm.title,
              code: updatedCode
          };
          setProjectData({ ...projectData, "Global Toolkit": newToolkit });
      }
      setEditingModule(null);
      setEditForm({ title: '', html: '', script: '', id: '', section: '' });
  };
  
  const closeEditModule = () => {
      setEditingModule(null);
      setEditForm({ title: '', html: '', script: '', id: '', section: '' });
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Settings className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Course Factory Dashboard</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-blue-400 font-mono">LIVING DOC</p>
                {lastSaved && (
                  <span className="text-[10px] text-emerald-500 font-mono animate-pulse">
                    • SAVED {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
             {isRenamingCourse ? (
               <div className="flex items-center gap-2">
                 <input 
                   type="text"
                   value={tempCourseName}
                   onChange={(e) => setTempCourseName(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') renameCourse(tempCourseName);
                     if (e.key === 'Escape') { setIsRenamingCourse(false); setTempCourseName(""); }
                   }}
                   autoFocus
                   className="bg-slate-900 border border-sky-500 rounded px-2 py-1 text-white text-xs focus:outline-none"
                   placeholder="Course name..."
                 />
                 <button onClick={() => renameCourse(tempCourseName)} className="text-emerald-400 hover:text-emerald-300 p-1">
                   <Check size={14} />
                 </button>
                 <button onClick={() => { setIsRenamingCourse(false); setTempCourseName(""); }} className="text-slate-400 hover:text-white p-1">
                   <X size={14} />
                 </button>
               </div>
             ) : (
               <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setTempCourseName(currentCourse.name); setIsRenamingCourse(true); }}>
                 <span className="text-xs font-bold px-3 text-slate-400 group-hover:text-sky-400 transition-colors">
                   PROJECT: {currentCourse.name}
                 </span>
                 <PenTool size={12} className="text-slate-600 group-hover:text-sky-400 opacity-0 group-hover:opacity-100 transition-all" />
               </div>
             )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <nav className="w-full md:w-72 flex-shrink-0">
          <div className="sticky top-28 space-y-2">
             <div className="px-4 py-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
               Factory Line
             </div>
            <Section 
              title="Phase 0: Master Shell" 
              icon={Layers} 
              isActive={activePhase === 0} 
              onClick={() => setActivePhase(0)}
              badge={0}
            />
            <Section 
              title="Phase 1: Harvest" 
              icon={FileJson} 
              isActive={activePhase === 1} 
              onClick={() => setActivePhase(1)} 
              badge={0}
            />
            <Section 
              title="Phase 2: Preview & Test" 
              icon={Eye} 
              isActive={activePhase === 2} 
              onClick={() => setActivePhase(2)}
              badge={currentCourse.modules.length + toolkit.length}
            />
             <Section 
              title="Phase 3: Manage & Reset" 
              icon={BookOpen} 
              isActive={activePhase === 3} 
              onClick={() => setActivePhase(3)} 
              badge={0}
            />
            <Section 
              title="Phase 4: Compile" 
              icon={Package} 
              isActive={activePhase === 4} 
              onClick={() => setActivePhase(4)} 
              badge={0}
              badgeColor="bg-purple-600"
            />
            
            {/* TOOLKIT SECTION ADDED */}
            <Section 
              title="Phase 5: Toolkit" 
              icon={Wrench} 
              isActive={activePhase === 5} 
              onClick={() => setActivePhase(5)} 
              badge={projectData["Global Toolkit"]?.length || 0}
              badgeColor="bg-orange-600"
            />
            
            {/* CURRENT PROJECT MODULE LIST */}
            <div className="mt-8 pt-4 border-t border-slate-800">
                <h4 className="px-4 text-[10px] font-bold text-slate-500 uppercase mb-2 truncate">
                    IN: {currentCourse.name}
                </h4>
                <ul className="space-y-1 px-2">
                    {currentCourse.modules.map((item, idx) => {
                        const isExcluded = excludedIds.includes(item.id);
                        return (
                        <li key={idx} className={`flex items-center justify-between p-2 rounded border transition-colors group ${isExcluded ? 'bg-slate-900/30 border-slate-800 text-slate-600' : 'bg-slate-900/80 border-slate-700 text-slate-300'}`}>
                            <div className="flex flex-col gap-0.5 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); moveModule(idx, 'up'); }} className="text-slate-600 hover:text-blue-400 disabled:opacity-0" disabled={idx === 0}><ChevronUp size={12} /></button>
                                <button onClick={(e) => { e.stopPropagation(); moveModule(idx, 'down'); }} className="text-slate-600 hover:text-blue-400 disabled:opacity-0" disabled={idx === currentCourse.modules.length - 1}><ChevronDown size={12} /></button>
                            </div>
                            <div className="flex-1 min-w-0 mr-2 cursor-pointer" onClick={() => openPreview(idx, 'module')}>
                                <span className="truncate block text-xs font-medium hover:text-blue-400 transition-colors" title="Click to Preview">{item.title}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => openPreview(idx, 'module')}
                                    className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Preview"
                                >
                                    <Eye size={16} />
                                </button>
                                <button 
                                    onClick={() => toggleModuleExclusion(item.id)} 
                                    className={`p-1 rounded hover:bg-slate-800 ${isExcluded ? 'text-slate-600' : 'text-emerald-500'}`}
                                    title={isExcluded ? "Include in Build" : "Exclude from Build"}
                                >
                                    {isExcluded ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                                </button>
                                <button 
                                    onClick={() => deleteModule(item.id)} 
                                    className="p-1 rounded hover:bg-rose-900/30 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete Permanently"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </li>
                    )})}
                    {currentCourse.modules.length === 0 && (
                        <li className="px-2 text-[10px] text-slate-600 italic">No modules saved.</li>
                    )}
                </ul>
            </div>

            {/* GLOBAL TOOLKIT LIST */}
            <div className="mt-4 pt-4 border-t border-slate-800">
                <h4 className="px-4 text-[10px] font-bold text-orange-500 uppercase mb-2 truncate">
                    GLOBAL TOOLKIT
                </h4>
                <ul className="space-y-1 px-2">
                    {toolkit.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-orange-950/30 p-2 rounded border border-orange-900/50 text-xs text-orange-400 hover:bg-orange-900/50 transition-colors group">
                            <span className="truncate flex-1 cursor-pointer hover:text-orange-300" onClick={() => openPreview(idx, 'toolkit')}>{item.title}</span>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => openPreview(idx, 'toolkit')}
                                    className="p-1 rounded hover:bg-rose-900/30 text-orange-600/50 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Preview Tool"
                                >
                                    <Eye size={14} />
                                </button>
                                <button 
                                    onClick={() => deleteToolkitItem(item.id)} 
                                    className="p-1 rounded hover:bg-rose-900/30 text-orange-600/50 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete Tool"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </li>
                    ))}
                    {toolkit.length === 0 && (
                        <li className="px-2 text-[10px] text-slate-600 italic">No features saved.</li>
                    )}
                </ul>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow min-h-[600px]">
          {activePhase === 0 && <Phase0 />}
          {activePhase === 1 && <Phase1 projectData={projectData} setProjectData={setProjectData} scannerNotes={scannerNotes} setScannerNotes={setScannerNotes} addMaterial={addMaterial} editMaterial={editMaterial} deleteMaterial={deleteMaterial} moveMaterial={moveMaterial} toggleMaterialHidden={toggleMaterialHidden} addAssessment={addAssessment} editAssessment={editAssessment} deleteAssessment={deleteAssessment} moveAssessment={moveAssessment} toggleAssessmentHidden={toggleAssessmentHidden} addQuestionToMaster={addQuestionToMaster} moveQuestion={moveQuestion} deleteQuestion={deleteQuestion} updateQuestion={updateQuestion} clearMasterAssessment={clearMasterAssessment} masterQuestions={masterQuestions} setMasterQuestions={setMasterQuestions} masterAssessmentTitle={masterAssessmentTitle} setMasterAssessmentTitle={setMasterAssessmentTitle} currentQuestionType={currentQuestionType} setCurrentQuestionType={setCurrentQuestionType} currentQuestion={currentQuestion} setCurrentQuestion={setCurrentQuestion} editingQuestion={editingQuestion} setEditingQuestion={setEditingQuestion} generateMixedAssessment={generateMixedAssessment} generatedAssessment={generatedAssessment} setGeneratedAssessment={setGeneratedAssessment} assessmentType={assessmentType} setAssessmentType={setAssessmentType} assessmentTitle={assessmentTitle} setAssessmentTitle={setAssessmentTitle} quizQuestions={quizQuestions} setQuizQuestions={setQuizQuestions} printInstructions={printInstructions} setPrintInstructions={setPrintInstructions} editingAssessment={editingAssessment} setEditingAssessment={setEditingAssessment} migrateCode={migrateCode} setMigrateCode={setMigrateCode} migratePrompt={migratePrompt} setMigratePrompt={setMigratePrompt} migrateOutput={migrateOutput} setMigrateOutput={setMigrateOutput} />}
          {activePhase === 2 && <Phase2 projectData={projectData} onEdit={openEditModule} onPreview={openPreview} onDelete={deleteModule} />}
          {activePhase === 3 && <Phase3 onGoToMaster={() => setActivePhase(0)} projectData={projectData} setProjectData={setProjectData} />}
          {activePhase === 4 && <Phase4 projectData={projectData} setProjectData={setProjectData} excludedIds={excludedIds} toggleModule={toggleModuleExclusion} />}
          {activePhase === 5 && <PhaseToolkit projectData={projectData} />}
        </main>
      </div>

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal 
          isOpen={!!deleteConfirmation} 
          message="Are you sure you want to PERMANENTLY delete this item? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmation(null)}
      />

       {/* EDIT MODULE MODAL */}
      {editingModule && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeEditModule}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PenTool size={20} className="text-blue-400" />
                Edit {editingModule.type === 'module' ? 'Module' : 'Feature'}
              </h3>
              <button onClick={closeEditModule} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Title</label>
                  <input 
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                
                {editingModule?.type === 'module' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Section/Unit (Optional)</label>
                    <input 
                      type="text"
                      value={editForm.section}
                      onChange={(e) => setEditForm({...editForm, section: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                      placeholder="e.g., Unit 1"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">ID (for view)</label>
                <input 
                  type="text"
                  value={editForm.id}
                  onChange={(e) => setEditForm({...editForm, id: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono text-sm focus:border-blue-500 outline-none"
                  placeholder="view-example"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">HTML Content</label>
                <textarea 
                  value={editForm.html}
                  onChange={(e) => setEditForm({...editForm, html: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono text-sm h-64 focus:border-blue-500 outline-none resize-y"
                  placeholder="<div>...</div>"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">JavaScript</label>
                <textarea 
                  value={editForm.script}
                  onChange={(e) => setEditForm({...editForm, script: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono text-sm h-64 focus:border-blue-500 outline-none resize-y"
                  placeholder="function example() { ... }"
                />
              </div>
            </div>

            <div className="bg-slate-800 border-t border-slate-700 p-4 flex gap-3 justify-end">
              <button 
                onClick={closeEditModule}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveEditModule}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODULE MODAL */}
      {previewModule && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closePreview}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-6xl w-full h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye size={20} className="text-emerald-400" />
                Preview: {previewModule.title}
              </h3>
              <button onClick={closePreview} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 bg-slate-950 relative overflow-hidden">
                <iframe 
                    key={previewModule.title} 
                    className="w-full h-full"
                    title="Preview"
                    srcDoc={`
                        <!DOCTYPE html>
                        <html class="dark">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <script src="https://cdn.tailwindcss.com"></script>
                            <link href="https://fonts.googleapis.com/css?family=Inter:ital,wght@0,400;0,700;1,400;1,900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
                            <script>
                                tailwind.config = { darkMode: 'class' }
                            </script>
                            <style>
                                /* MASTER SHELL STYLES - Required for migrated modules */
                                body { 
                                    font-family: 'Inter', sans-serif; 
                                    background-color: #020617; 
                                    color: #e2e8f0; 
                                    margin: 0; 
                                }
                                .mono { font-family: 'JetBrains Mono', monospace; }
                                .glass { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(51, 65, 85, 0.5); }
                                
                                /* Form Elements */
                                input, textarea, select { 
                                    background: #0f172a !important; 
                                    border: 1px solid #1e293b !important; 
                                    transition: all 0.2s; 
                                    color: #e2e8f0; 
                                }
                                input:focus, textarea:focus, select:focus { 
                                    border-color: #0ea5e9 !important; 
                                    outline: none; 
                                    box-shadow: 0 0 0 1px #0ea5e9; 
                                }
                                
                                /* Module Buttons & Tabs */
                                .score-btn, .mod-nav-btn, .nav-btn { 
                                    background: #0f172a; 
                                    border: 1px solid #1e293b; 
                                    color: #64748b; 
                                    transition: all 0.2s; 
                                    cursor: pointer;
                                }
                                .score-btn:hover, .mod-nav-btn:hover, .nav-btn:hover { 
                                    border-color: #0ea5e9; 
                                    color: white; 
                                }
                                .score-btn.active, .mod-nav-btn.active, .nav-btn.active { 
                                    background: #0ea5e9; 
                                    color: #000; 
                                    font-weight: 900; 
                                    border-color: #0ea5e9; 
                                }
                                
                                /* Step Content Visibility */
                                .step-content { display: none; }
                                .step-content.active { display: block; }
                                
                                /* Rubric Cells */
                                .rubric-cell { 
                                    cursor: pointer; 
                                    transition: all 0.2s; 
                                    border: 1px solid transparent; 
                                }
                                .rubric-cell:hover { background: rgba(255,255,255,0.05); }
                                .active-proficient { 
                                    background: rgba(16, 185, 129, 0.2); 
                                    border: 1px solid #10b981; 
                                    color: #10b981; 
                                }
                                .active-developing { 
                                    background: rgba(245, 158, 11, 0.2); 
                                    border: 1px solid #f59e0b; 
                                    color: #f59e0b; 
                                }
                                .active-emerging { 
                                    background: rgba(244, 63, 94, 0.2); 
                                    border: 1px solid #f43f5e; 
                                    color: #f43f5e; 
                                }
                                
                                /* Helper Text */
                                .helper-text { 
                                    font-size: 8px; 
                                    color: #64748b; 
                                    font-style: italic; 
                                    margin-top: 4px; 
                                    line-height: 1.2; 
                                    text-transform: uppercase; 
                                    letter-spacing: 0.05em; 
                                    font-weight: 700; 
                                }
                                
                                /* Custom Scrollbars */
                                .custom-scroll::-webkit-scrollbar { width: 8px; }
                                .custom-scroll::-webkit-scrollbar-track { background: #0f172a; }
                                .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
                                
                                /* CRITICAL FIX: FORCE VISIBILITY */
                                [id^="view-"] { display: block !important; }
                                .hidden { display: block !important; } 
                                #pdf-viewer-container.hidden { display: none !important; }
                                
                                /* Reset layout constraints */
                                #content-container { height: auto; overflow: visible; }
                            </style>
                        </head>
                        <body class="h-screen overflow-hidden">
                            <div class="h-full overflow-y-auto custom-scroll p-8">
                                ${previewModule.html}
                            </div>
                            <script>
                                // INJECTED LOGIC - Execute module scripts in iframe scope
                                try {
                                    ${previewModule.script.replace(/<\/script/gi, '<\\/script')}
                                    console.log('✅ [iframe] Script loaded and functions registered');
                                    
                                    // Trigger load event if script has initialization listeners
                                    // Some migrated scripts use window.addEventListener('load', ...)
                                    // Since script runs after DOM, we need to manually trigger if already loaded
                                    if (document.readyState === 'complete') {
                                        console.log('[iframe] Document already loaded, triggering load event');
                                        window.dispatchEvent(new Event('load'));
                                    }
                                } catch (err) {
                                    console.error('❌ [iframe] Script error:', err);
                                    console.error('Error stack:', err.stack);
                                }
                            </script>
                        </body>
                        </html>
                    `}
                />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}