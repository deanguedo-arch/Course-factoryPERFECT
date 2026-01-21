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
        code: {
          id: "view-materials",
          html: `<div id="view-materials" class="w-full h-full custom-scroll p-8 md:p-12">
            <div class="max-w-5xl mx-auto space-y-8">
                <div class="mb-12">
                    <h2 class="text-3xl font-black text-white italic uppercase tracking-tighter">Course <span class="text-sky-500">Materials</span></h2>
                    <p class="text-xs text-slate-400 font-mono uppercase tracking-widest mt-2">Access lectures, presentations, and briefing documents.</p>
                </div>
                <div id="pdf-viewer-container" class="hidden mb-12 bg-black rounded-xl border border-slate-700 overflow-hidden shadow-2xl"><div class="flex justify-between items-center p-3 bg-slate-800 border-b border-slate-700"><span id="viewer-title" class="text-xs font-bold text-white uppercase tracking-widest px-2">Document Viewer</span><button onclick="closeViewer()" class="text-xs text-rose-400 hover:text-white font-bold uppercase tracking-widest px-2">Close X</button></div><iframe id="pdf-frame" src="" width="100%" height="600" style="border:none;"></iframe></div>
                <div class="grid grid-cols-1 gap-4">
                    <!-- PASTE NEW MATERIAL CARDS HERE -->
                    <div class="material-card flex flex-col md:flex-row items-center justify-between gap-6"><div class="flex items-center gap-6"><div class="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 font-black italic text-xl border border-slate-700">00</div><div><h3 class="text-lg font-bold text-white uppercase italic">What is Sports Psychology?</h3><p class="text-xs text-slate-400 font-mono">The Diagnostic & Baseline Protocol.</p></div></div><div class="flex gap-3 w-full md:w-auto"><button onclick="openPDF('https://drive.google.com/file/d/1my_sOJYdOLcvvQi4TQdkDJNUz6P7MvYY/preview', 'Intro Module')" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg border border-slate-600 transition-all">View Slides</button><a href="https://drive.google.com/file/d/1my_sOJYdOLcvvQi4TQdkDJNUz6P7MvYY/view?usp=sharing" target="_blank" class="flex-1 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all text-center flex items-center justify-center">Download</a></div></div>
                    <div class="material-card flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-rose-500"><div class="flex items-center gap-6"><div class="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 font-black italic text-xl border border-rose-500/20">01</div><div><h3 class="text-lg font-bold text-white uppercase italic">The Engine</h3><p class="text-xs text-slate-400 font-mono">Values, Identity & Foundation.</p></div></div><div class="flex gap-3 w-full md:w-auto"><button onclick="openPDF('https://drive.google.com/file/d/1DQvItijEudKroqUieRBKaJAqJJnzEa2x/preview', 'Phase 1: The Engine')" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg border border-slate-600 transition-all">View Slides</button><a href="https://drive.google.com/file/d/1DQvItijEudKroqUieRBKaJAqJJnzEa2x/view?usp=sharing" target="_blank" class="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all text-center flex items-center justify-center">Download</a></div></div>
                    <div class="material-card flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-amber-500"><div class="flex items-center gap-6"><div class="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 font-black italic text-xl border border-amber-500/20">02</div><div><h3 class="text-lg font-bold text-white uppercase italic">The Drive</h3><p class="text-xs text-slate-400 font-mono">Motivation, 7/10 Task & Maintenance.</p></div></div><div class="flex gap-3 w-full md:w-auto"><button onclick="openPDF('https://drive.google.com/file/d/1XWwy8F27_0jupo8xdXO3oi2E4l9R4Rot/preview', 'Phase 2: The Drive')" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg border border-slate-600 transition-all">View Slides</button><a href="https://drive.google.com/file/d/1XWwy8F27_0jupo8xdXO3oi2E4l9R4Rot/view?usp=sharing" target="_blank" class="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all text-center flex items-center justify-center">Download</a></div></div>
                    <div class="material-card flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-emerald-500"><div class="flex items-center gap-6"><div class="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black italic text-xl border border-emerald-500/20">03</div><div><h3 class="text-lg font-bold text-white uppercase italic">The Focus</h3><p class="text-xs text-slate-400 font-mono">Spotlight, Cues & The Fortress.</p></div></div><div class="flex gap-3 w-full md:w-auto"><button onclick="openPDF('https://drive.google.com/file/d/1kUq790zE4VP73THdysuNKVR3cE6EG3X2/preview', 'Phase 3: The Focus')" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg border border-slate-600 transition-all">View Slides</button><a href="https://drive.google.com/file/d/1kUq790zE4VP73THdysuNKVR3cE6EG3X2/view?usp=sharing" target="_blank" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all text-center flex items-center justify-center">Download</a></div></div>
                    <div class="material-card flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-sky-500"><div class="flex items-center gap-6"><div class="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 font-black italic text-xl border border-sky-500/20">04</div><div><h3 class="text-lg font-bold text-white uppercase italic">The Toolkit</h3><p class="text-xs text-slate-400 font-mono">Confidence & Visualization Protocols.</p></div></div><div class="flex gap-3 w-full md:w-auto"><button onclick="openPDF('https://drive.google.com/file/d/1GueN1ikd982jYVZVf7GkEDG18NHQ9YpW/preview', 'Phase 4: The Toolkit')" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg border border-slate-600 transition-all">View Slides</button><a href="https://drive.google.com/file/d/1GueN1ikd982jYVZVf7GkEDG18NHQ9YpW/view?usp=sharing" target="_blank" class="flex-1 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all text-center flex items-center justify-center">Download</a></div></div>
                </div>
            </div>
        </div>`,
          script: `function openPDF(url, title) {
            const container = document.getElementById('pdf-viewer-container');
            document.getElementById('pdf-frame').src = url;
            document.getElementById('viewer-title').innerText = "VIEWING: " + title;
            container.classList.remove('hidden');
            container.scrollIntoView({ behavior: 'smooth' });
        }

        function closeViewer() {
            document.getElementById('pdf-viewer-container').classList.add('hidden');
            document.getElementById('pdf-frame').src = "";
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
      // Reusable Features go here (e.g., Save Button, Sidebar)
      // { id: "feat-save", title: "Save System", code: "{...}" }
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
            <button onclick="switchView('materials')" id="nav-materials" class="nav-item active">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Course Materials
            </button>
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

const Phase1 = ({ projectData, setProjectData, scannerNotes, setScannerNotes }) => {
  const [harvestType, setHarvestType] = useState('MODULE'); // 'MODULE', 'FEATURE', 'ASSET', 'ASSESSMENT'
  const [mode, setMode] = useState('B'); 
  const [divId, setDivId] = useState("");
  const [jsPrefix, setJsPrefix] = useState("");
  const [stagingJson, setStagingJson] = useState("");
  const [stagingTitle, setStagingTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState(null); // 'success'
  
  // NEW: Error State for manual imports
  const [importError, setImportError] = useState(null);

  // New Material Card Generator State
  const [matTitle, setMatTitle] = useState("");
  const [matDesc, setMatDesc] = useState("");
  const [matViewUrl, setMatViewUrl] = useState("");
  const [matDlUrl, setMatDlUrl] = useState("");
  const [generatedCard, setGeneratedCard] = useState("");

  // Assessment Builder State
  const [assessmentType, setAssessmentType] = useState('quiz'); // 'quiz', 'fillblank', 'print', 'rubric'
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([{ question: '', options: ['', '', '', ''], correct: 0 }]);
  const [generatedAssessment, setGeneratedAssessment] = useState("");
  
  // NEW: Batch Mode State
  const [isBatchMode, setIsBatchMode] = useState(false);

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

  const generateMaterialCard = () => {
      const finalEmbedUrl = getEmbedUrl(matViewUrl);
      
      const card = `<div class="material-card flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-sky-500">
    <div class="flex items-center gap-6">
        <div class="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 font-black italic text-xl border border-sky-500/20">#</div>
        <div>
            <h3 class="text-lg font-bold text-white uppercase italic">${matTitle}</h3>
            <p class="text-xs text-slate-400 font-mono">${matDesc}</p>
        </div>
    </div>
    <div class="flex gap-3 w-full md:w-auto">
        <button onclick="openPDF('${finalEmbedUrl}', '${matTitle}')" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg border border-slate-600 transition-all">View Slides</button>
        <a href="${matDlUrl}" target="_blank" class="flex-1 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all text-center flex items-center justify-center">Download</a>
    </div>
</div>`;
      setGeneratedCard(card);
  };

  // Helper: Fix Google Drive links for iframes automatically
  const getEmbedUrl = (url) => {
    if (url && url.includes('drive.google.com') && url.includes('/view')) {
        return url.replace('/view', '/preview');
    }
    return url;
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
    const quizId = `quiz-${Date.now()}`;
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
            <button type="button" onclick="${quizId}_submit()" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg">Submit Quiz</button>
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

    setGeneratedAssessment(JSON.stringify({ id: quizId, html, script }, null, 2));
  };

  const handleAddToCourseMaterials = () => {
      // 1. Find the Course Materials Module
      const materialsModIndex = projectData["Current Course"].modules.findIndex(m => m.title === "Course Materials" || m.id === "item-materials" || m.id === "item-1768749223001");
      
      let newModules = [...projectData["Current Course"].modules];
      let updatedMod = null;

      // 2. Logic: If it exists, inject the card. If not, create the module first.
      if (materialsModIndex !== -1) {
          const existingMod = newModules[materialsModIndex];
          let newHtml = existingMod.code.html;
          
          // TARGETING: Look for the specific comment marker
          if (newHtml.includes('<!-- PASTE NEW MATERIAL CARDS HERE -->')) {
               newHtml = newHtml.replace('<!-- PASTE NEW MATERIAL CARDS HERE -->', `<!-- PASTE NEW MATERIAL CARDS HERE -->\n                    ${generatedCard}`);
          } else {
              // Fallback: Just put it in the grid container
              newHtml = newHtml.replace('<div class="grid grid-cols-1 gap-4">', `<div class="grid grid-cols-1 gap-4">\n                    ${generatedCard}`);
          }

          updatedMod = { ...existingMod, code: { ...existingMod.code, html: newHtml } };
          newModules[materialsModIndex] = updatedMod;
      } else {
          // Create new module if it doesn't exist (Backup plan)
          const baseHtml = `<div id="view-materials" class="w-full h-full custom-scroll p-8 md:p-12">
            <div class="max-w-5xl mx-auto space-y-8">
                <div class="mb-12">
                    <h2 class="text-3xl font-black text-white italic uppercase tracking-tighter">Course <span class="text-sky-500">Materials</span></h2>
                    <p class="text-xs text-slate-400 font-mono uppercase tracking-widest mt-2">Access lectures, presentations, and briefing documents.</p>
                </div>
                <div id="pdf-viewer-container" class="hidden mb-12 bg-black rounded-xl border border-slate-700 overflow-hidden shadow-2xl"><div class="flex justify-between items-center p-3 bg-slate-800 border-b border-slate-700"><span id="viewer-title" class="text-xs font-bold text-white uppercase tracking-widest px-2">Document Viewer</span><button onclick="closeViewer()" class="text-xs text-rose-400 hover:text-white font-bold uppercase tracking-widest px-2">Close X</button></div><iframe id="pdf-frame" src="" width="100%" height="600" style="border:none;"></iframe></div>
                <div class="grid grid-cols-1 gap-4">
                    <!-- PASTE NEW MATERIAL CARDS HERE -->
                    ${generatedCard}
                </div>
            </div>
        </div>`;
          
          const baseScript = `function openPDF(url, title) {
            const container = document.getElementById('pdf-viewer-container');
            document.getElementById('pdf-frame').src = url;
            document.getElementById('viewer-title').innerText = "VIEWING: " + title;
            container.classList.remove('hidden');
            container.scrollIntoView({ behavior: 'smooth' });
        }
        function closeViewer() {
            document.getElementById('pdf-viewer-container').classList.add('hidden');
            document.getElementById('pdf-frame').src = "";
        }`;

          updatedMod = {
              id: "item-materials",
              title: "Course Materials",
              code: { id: "view-materials", html: baseHtml, script: baseScript }
          };
          newModules.push(updatedMod);
      }

      setProjectData({
          ...projectData,
          "Current Course": {
              ...projectData["Current Course"],
              modules: newModules
          }
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
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
          if (harvestType === 'MODULE' || harvestType === 'ASSESSMENT') { 
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
DO NOT summarize the rest of the code. Only output the extracted parts for the requested ID.

**Task:**1. Extract the HTML Element with ID: "${divId}".2. Extract ALL JavaScript logic required for this element to function, including:
   - All functions starting with "${jsPrefix || 'prefix_'}".
   - **CRITICAL:** All global variables, arrays, or objects these functions rely on (e.g. 'var ${jsPrefix || 'prefix_'}scores = ...').
   - Any initialization logic.3. Output them as a single JSON object.

**Output Format:**
{
  "id": "${divId}",
  "html": "<div>... (The full inner HTML) ...</div>",
  "script": "// Variables\\nvar ${jsPrefix || 'prefix_'}scores = {};\\n\\n// Functions\\nfunction ${jsPrefix || 'prefix_'}saveData() { ... }"
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
                 <button onClick={() => { setIsBatchMode(false); setHarvestType('ASSET'); }} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all whitespace-nowrap ${!isBatchMode && harvestType === 'ASSET' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                     <LinkIcon size={14} /> Material
                 </button>
                 <button onClick={() => { setIsBatchMode(false); setHarvestType('ASSESSMENT'); }} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all whitespace-nowrap ${!isBatchMode && harvestType === 'ASSESSMENT' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                     <CheckCircle size={14} /> Assessment
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
            {harvestType === 'ASSET' && (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                     <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                        <h3 className="text-sm font-bold text-blue-400 mb-4">Material Card Generator</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input type="text" value={matTitle} onChange={(e) => setMatTitle(e.target.value)} placeholder="Title (e.g. Slide Deck)" className="bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"/>
                            <input type="text" value={matDesc} onChange={(e) => setMatDesc(e.target.value)} placeholder="Description" className="bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"/>
                            
                            {/* EMBED INPUT */}
                            <div className="relative">
                                 <input type="text" value={matViewUrl} onChange={(e) => setMatViewUrl(e.target.value)} placeholder="Embed Link (PDF/Drive)" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs pl-8"/>
                                 <Eye size={12} className="absolute left-2.5 top-2.5 text-slate-500" />
                            </div>

                            {/* DOWNLOAD INPUT */}
                            <div className="relative">
                                <input type="text" value={matDlUrl} onChange={(e) => setMatDlUrl(e.target.value)} placeholder="Download Button Link" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs pl-8"/>
                                <Download size={12} className="absolute left-2.5 top-2.5 text-slate-500" />
                            </div>
                        </div>
                        
                        <div className="flex gap-2 mb-4">
                            <button onClick={generateMaterialCard} className="flex-1 bg-blue-600 text-white font-bold py-2 rounded text-xs hover:bg-blue-500 transition-colors">1. Generate HTML</button>
                            <button onClick={handleAddToCourseMaterials} disabled={!generatedCard} className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded text-xs hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2">
                               <Zap size={14} /> 2. Add to "Course Materials" Module
                            </button>
                        </div>
                        
                        {saveStatus === 'success' && (
                             <div className="mb-4 text-xs text-emerald-400 font-bold animate-in fade-in zoom-in flex items-center gap-2 justify-center bg-emerald-900/20 p-2 rounded border border-emerald-800">
                                 <CheckCircle size={14} /> Added to Project Data! Check Phase 4.
                             </div>
                        )}

                        {generatedCard && (
                            <>
                            <CodeBlock label="Material Card HTML (For Manual Copy)" code={generatedCard} height="h-32" />
                            <p className="text-[10px] text-slate-500 mt-2 italic">
                                <strong>Note:</strong> Clicking "Add to Course Materials" automatically updates the module code in memory. You don't need to copy/paste this unless you are editing manually.
                            </p>
                            </>
                        )}
                     </div>
                 </div>
            )}

            {harvestType === 'ASSESSMENT' && (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                     <div className="p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                        <h3 className="text-sm font-bold text-purple-400 mb-4">Assessment Builder</h3>
                        
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
                                onClick={() => setAssessmentType('print')} 
                                className={`flex-1 py-2 px-3 rounded text-xs font-bold ${assessmentType === 'print' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                            >
                                Print & Submit
                            </button>
                        </div>

                        {assessmentType === 'quiz' && (
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

                        {assessmentType === 'print' && (
                            <div className="p-4 bg-slate-950 rounded border border-slate-700 text-center text-slate-400 text-sm">
                                <p>Print & Submit template will generate a simple assignment page with:</p>
                                <ul className="list-disc list-inside mt-2 text-left">
                                    <li>Instructions section</li>
                                    <li>Print button</li>
                                    <li>Submission reminder</li>
                                </ul>
                            </div>
                        )}

                        <div className="flex gap-2 mt-4">
                            <button 
                                onClick={generateQuizAssessment} 
                                disabled={!assessmentTitle || (assessmentType === 'quiz' && quizQuestions.some(q => !q.question))}
                                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Generate Assessment Code
                            </button>
                        </div>

                        {generatedAssessment && (
                            <div className="mt-4">
                                <CodeBlock label="Assessment Module JSON" code={generatedAssessment} height="h-64" />
                                <div className="mt-3 space-y-2">
                                    <input 
                                        type="text" 
                                        value={stagingTitle} 
                                        onChange={(e) => setStagingTitle(e.target.value)} 
                                        placeholder="Module title for sidebar..." 
                                        className="w-full bg-slate-950 border border-purple-700 rounded p-2 text-white text-sm"
                                    />
                                    <button 
                                        onClick={() => {
                                            setStagingJson(generatedAssessment);
                                            handleSessionSave(generatedAssessment); // PASS DATA DIRECTLY
                                        }}
                                        disabled={!stagingTitle}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Zap size={14} /> Add to Project
                                    </button>
                                </div>
                            </div>
                        )}
                     </div>
                 </div>
            )}

            {harvestType !== 'ASSET' && harvestType !== 'ASSESSMENT' && (
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

const Phase2 = ({ projectData }) => {
  const [assemblyMode, setAssemblyMode] = useState('A'); 
  const [sourceType, setSourceType] = useState('MODULE'); // 'MODULE' or 'FEATURE'
  const [selectedIndex, setSelectedIndex] = useState("");
  
  const currentCourse = projectData["Current Course"]?.modules || [];
  const globalToolkit = projectData["Global Toolkit"] || [];
  const items = sourceType === 'MODULE' ? currentCourse : globalToolkit;
  
  const selectedItem = items[selectedIndex];
  const btnTitle = selectedItem ? selectedItem.title : "Item";
  const viewId = selectedItem ? selectedItem.id : "view-x";
  const codeObj = selectedItem ? selectedItem.code : {};

  // Unpack JSON for Direct Mode
  let parsedHtml = "";
  let parsedScript = "";
  let isJsonValid = false;
  try {
      // Handle both stringified JSON and raw objects
      const content = typeof codeObj === 'string' ? JSON.parse(codeObj) : codeObj;
      parsedHtml = content.html || "";
      parsedScript = content.script || "";
      isJsonValid = true;
  } catch (e) { 
      isJsonValid = false; 
  }

  // 🟢 SMART PROMPT LOGIC
  const modulePrompt = `I am adding a CONTENT MODULE to my site.
I have a "Clean Shell" index.html open.

**DATA SOURCE:**
\`\`\`json
${typeof codeObj === 'string' ? codeObj : JSON.stringify(codeObj, null, 2)}
\`\`\`

**TASK:**
1. **Inject HTML:** Insert 'html' into '#content-container'. Wrap in div id="${viewId}" (hidden by default).
2. **Inject Script:** Append 'script' to '#module-scripts'.
3. **Update Nav:** Add button to Sidebar to switchView('${viewId?.replace('view-', '')}').`;

  const featurePrompt = `I am adding a FUNCTIONAL FEATURE to my site.
I have a "Clean Shell" index.html open.

**DATA SOURCE:**
\`\`\`json
${typeof codeObj === 'string' ? codeObj : JSON.stringify(codeObj, null, 2)}
\`\`\`

**TASK:**
1. **Determine Location:** This is a Utility/Feature (like a Save Button or Modal). It may NOT need a new "View".
   - If it's a Sidebar Button: Add to <nav>.
   - If it's a Modal (Hidden Div): Add to #content-container.
   - If it's just logic: Only add the Script.
2. **Inject HTML:** Insert the 'html' string where appropriate based on the feature type.
3. **Inject Script:** Append 'script' to '#module-scripts'.`;

  const finalPrompt = sourceType === 'MODULE' ? modulePrompt : featurePrompt;

  const navButtonCode = `<button onclick="switchView('${viewId?.replace('view-', '')}')" id="nav-${viewId?.replace('view-', '')}" class="nav-item">
    <span class="w-2 h-2 rounded-full bg-slate-600"></span>${btnTitle}
</button>`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Terminal className="text-purple-400" /> Phase 2: Assembly
        </h2>

        {/* SOURCE TOGGLE */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 mb-6">
            <button 
                onClick={() => { setSourceType('MODULE'); setSelectedIndex(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-bold transition-all ${sourceType === 'MODULE' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Box size={14} /> Course Modules ({currentCourse.length})
            </button>
            <button 
                onClick={() => { setSourceType('FEATURE'); setSelectedIndex(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-bold transition-all ${sourceType === 'FEATURE' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Wrench size={14} /> Global Toolkit ({globalToolkit.length})
            </button>
        </div>

        <div className="mb-6">
            <select 
                value={selectedIndex} 
                onChange={(e) => setSelectedIndex(e.target.value)}
                className="w-full bg-slate-900 border border-purple-500/50 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
            >
                <option value="" disabled>-- Select Item --</option>
                {items.map((item, idx) => (
                    <option key={idx} value={idx}>{item.title} (ID: {item.id})</option>
                ))}
            </select>
        </div>

        {selectedItem && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
                <Toggle 
                    active={assemblyMode} 
                    onToggle={setAssemblyMode} 
                    labelA="Canvas (Auto)" 
                    labelB="AI Studio Prompt" 
                    labelC="Direct Snippets"
                    iconA={LayoutTemplate} 
                    iconB={PenTool} 
                    iconC={FileCode}
                />
                
                {assemblyMode === 'A' && (
                    <CodeBlock label="Canvas Auto-Injection Prompt" code={finalPrompt} />
                )}

                {assemblyMode === 'B' && (
                    <>
                        <CodeBlock label="AI Studio Request Prompt" code={manualPrompt} />
                        <div className="mt-4 text-xs text-slate-500 italic">Paste into AI Studio to get snippets.</div>
                    </>
                )}

                {assemblyMode === 'C' && isJsonValid && (
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs text-pink-400 font-bold mb-2 uppercase">1. Add to Navigation</p>
                            <CodeBlock label="Nav Button HTML" code={navButtonCode} height="h-20" />
                        </div>
                        <div>
                            <p className="text-xs text-pink-400 font-bold mb-2 uppercase">2. Add to Content Container</p>
                            <CodeBlock label="HTML Content" code={`<div id="${viewId}" class="w-full h-full custom-scroll hidden p-4 md:p-8">\n${parsedHtml}\n</div>`} height="h-48" />
                        </div>
                        <div>
                            <p className="text-xs text-pink-400 font-bold mb-2 uppercase">3. Add to Module Scripts</p>
                            <CodeBlock label="Javascript Logic" code={parsedScript} height="h-48" />
                        </div>
                    </div>
                )}
                
                {assemblyMode === 'C' && !isJsonValid && (
                    <div className="p-4 bg-rose-900/20 border border-rose-800 text-rose-400 text-xs rounded-lg">
                        Error: The module data seems empty or invalid.
                    </div>
                )}
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

const Phase4 = ({ projectData, excludedIds, toggleModule }) => {
  const [fullSiteCode, setFullSiteCode] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);

  const modules = projectData["Current Course"]?.modules || [];
  const toolkit = projectData["Global Toolkit"] || [];

  const generateFullSite = () => {
    let finalCode = MASTER_SHELL;
    
    // Filter active modules
    const activeModules = modules.filter(m => !excludedIds.includes(m.id));
    const allItems = [...activeModules, ...toolkit];

    let navInjection = "";
    let contentInjection = "";
    let scriptInjection = "";

    // 1. Build Injections
    allItems.forEach(item => {
      let itemCode = item.code || {};
      if (typeof itemCode === 'string') {
          try { itemCode = JSON.parse(itemCode); } catch(e) {}
      }
      
      if (itemCode.id) {
          const shortId = itemCode.id.replace('view-', '');
          navInjection += `\n            <button onclick="switchView('${shortId}')" id="nav-${shortId}" class="nav-item">\n                <span class="w-2 h-2 rounded-full bg-slate-600"></span>${item.title}\n            </button>`;
      }
      if (itemCode.html) contentInjection += `\n        ${itemCode.html}\n`;
      if (itemCode.script) scriptInjection += `\n        ${itemCode.script}\n`;
    });

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
            `<!-- Dynamic Modules will be injected here -->${navInjection}`
        );
    } else {
        finalCode = finalCode.replace('</nav>', `${navInjection}\n        </nav>`);
    }

    // 4. Inject Content
    if (finalCode.includes('<iframe id="view-external"')) {
        finalCode = finalCode.replace(
            '<iframe id="view-external"', 
            `${contentInjection}\n        <iframe id="view-external"`
        );
    } else {
        finalCode = finalCode.replace('</div>\n\n    <!-- MODULE SCRIPTS CONTAINER -->', `${contentInjection}\n        </div>\n\n    <!-- MODULE SCRIPTS CONTAINER -->`);
    }

    // 5. Inject Script
    if (finalCode.includes('// New module logic will be appended here')) {
        finalCode = finalCode.replace(
            '// New module logic will be appended here', 
            `// New module logic will be appended here${scriptInjection}`
        );
    } else {
        finalCode = finalCode.replace('</script>\n</body>', `${scriptInjection}\n    </script>\n</body>`);
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
  const [excludedIds, setExcludedIds] = useState([]);
  const [editingModule, setEditingModule] = useState(null); 
  const [editForm, setEditForm] = useState({ title: '', html: '', script: '', id: '', section: '' });
  const [previewModule, setPreviewModule] = useState(null); 
  
  // Custom Confirmation State to replace window.confirm
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); // { id, type: 'module' | 'tool' }

  // FIX: Execute module scripts globally when Preview Modal opens
  useEffect(() => {
    if (previewModule && previewModule.script) {
      // 50ms delay ensures the HTML is rendered in the DOM first
      const timer = setTimeout(() => {
        try {
          // window.eval forces the script string to run in the global scope
          // This registers functions like 'openPDF()' so the HTML buttons can find them
          window.eval(previewModule.script);
          console.log("✅ Script loaded for:", previewModule.title);
        } catch (err) {
          console.error("❌ Script Execution Error:", err);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [previewModule]);

  const currentCourse = projectData["Current Course"] || { name: "Error", modules: [] };
  const toolkit = projectData["Global Toolkit"] || [];

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
              <p className="text-xs text-blue-400 font-mono">LIVING DOCUMENT MODE</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
             <span className="text-xs font-bold px-3 text-slate-400">PROJECT: {currentCourse.name}</span>
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
              title="Phase 2: Assembly" 
              icon={Terminal} 
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
          {activePhase === 1 && <Phase1 projectData={projectData} setProjectData={setProjectData} scannerNotes={scannerNotes} setScannerNotes={setScannerNotes} />}
          {activePhase === 2 && <Phase2 projectData={projectData} />}
          {activePhase === 3 && <Phase3 onGoToMaster={() => setActivePhase(0)} projectData={projectData} setProjectData={setProjectData} />}
          {activePhase === 4 && <Phase4 projectData={projectData} excludedIds={excludedIds} toggleModule={toggleModuleExclusion} />}
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
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye size={20} className="text-emerald-400" />
                Preview: {previewModule.title}
              </h3>
              <button onClick={closePreview} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 bg-slate-950 relative">
                <iframe 
                    key={previewModule.title} 
                    className="w-full h-full absolute inset-0"
                    title="Preview"
                    srcDoc={`
                        <!DOCTYPE html>
                        <html class="dark">
                        <head>
                            <script src="https://cdn.tailwindcss.com"></script>
                            <script>
                                tailwind.config = { darkMode: 'class' }
                            </script>
                            <style>
                                body { background-color: #020617; color: #e2e8f0; font-family: sans-serif; }
                                .custom-scroll::-webkit-scrollbar { width: 8px; }
                                .custom-scroll::-webkit-scrollbar-track { background: #0f172a; }
                                .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
                                
                                /* CRITICAL FIX: FORCE VISIBILITY */
                                /* This overrides the 'hidden' class found in harvested modules */
                                [id^="view-"] { display: block !important; }
                                .hidden { display: block !important; } 
                                #pdf-viewer-container.hidden { display: none !important; } /* Exception for PDF viewer logic */
                                
                                /* Reset some layout constraints for preview */
                                #content-container { height: auto; overflow: visible; }
                            </style>
                        </head>
                        <body class="h-screen overflow-hidden">
                            <div class="h-full overflow-y-auto custom-scroll p-8">
                                ${previewModule.html}
                            </div>
                            <script>
                                // INJECTED LOGIC
                                // Sanitized script injection to prevent premature closing of script tag
                                ${previewModule.script.replace(/<\/script/gi, '<\\/script')}
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