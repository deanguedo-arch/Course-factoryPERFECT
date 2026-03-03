import * as React from 'react';
import { AlertTriangle, ArrowRight, BookOpen, Download, Lock, Unlock, Upload } from 'lucide-react';
import { CodeBlock } from './Shared.jsx';

const { useState } = React;

// --- PHASE 3: MANAGE & RESET ---
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
        // alert("Project Restored Successfully!"); // Removed Alert
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
    <div className="cf-phase-shell space-y-6 animate-in fade-in duration-500">
      <div className="cf-glass-surface rounded-2xl border border-slate-700/70 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen className="text-blue-400" /> Phase 3: Manage & Reset
        </h2>
        
        <div className="space-y-4">
            <div className="cf-panel-muted rounded-2xl p-4">
                <h3 className="mb-2 text-sm font-bold text-blue-400">1. Backup & Restore</h3>
                <div className="space-y-2">
                    <button 
                        onClick={handleDownload}
                        className="cf-btn cf-btn-primary inline-flex w-full items-center justify-center py-3 text-sm font-bold"
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
                            className="cf-btn cf-btn-success inline-flex w-full cursor-pointer items-center justify-center py-3 text-sm font-bold"
                        >
                            <Upload size={16} /> Upload & Restore Backup
                        </label>
                    </div>
                </div>
            </div>

            <div className={`rounded-2xl border p-4 transition-all duration-300 ${unlocked ? 'cf-alert cf-alert-danger' : 'cf-panel-muted opacity-70'}`}>
                <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-bold ${unlocked ? 'text-rose-400' : 'text-slate-500'}`}>2. Reset Project</h3>
                    {unlocked ? <Unlock size={16} className="text-rose-400"/> : <Lock size={16} className="text-slate-500"/>}
                </div>
                
                {unlocked && !confirmed && (
                    <div className="cf-alert cf-alert-danger animate-in fade-in rounded-2xl p-4">
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
                                className="cf-btn cf-btn-secondary flex-1 items-center justify-center py-3 text-xs font-bold"
                            >
                                <ArrowRight size={14} className="rotate-180" /> No, Take me there
                            </button>
                            <button 
                                onClick={() => setConfirmed(true)} 
                                className="cf-btn cf-btn-danger flex-1 py-3 text-xs font-bold"
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

export default Phase3;

