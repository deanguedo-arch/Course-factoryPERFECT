import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

const files = {
  css: read('src/index.css'),
  paneCard: read('src/components/composer/ComposerPaneCard.jsx'),
  activityPane: read('src/components/composer/ComposerActivityEditorPane.jsx'),
  inspector: read('src/components/composer/ComposerInspectorSection.jsx'),
  toolbar: read('src/components/composer/ComposerPreviewToolbar.jsx'),
  workspace: read('src/components/composer/ComposerWorkspaceControls.jsx'),
  canvasShell: read('src/components/composer/ComposerCanvasShell.jsx'),
  drawer: read('src/components/composer/ComposerCanvasDrawer.jsx'),
  phase1: read('src/components/Phase1.jsx'),
  editModal: read('src/components/modals/EditModal.jsx'),
};

const checks = [
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-composer-panel\b/,
    message: 'Missing composer panel styles in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-composer-toolbar\b/,
    message: 'Missing composer toolbar styles in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-composer-section\b/,
    message: 'Missing composer section styles in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /html\[data-builder-theme='light'\]\s+\.cf-composer-panel/,
    message: 'Missing light-theme composer panel override in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /text-emerald-100/,
    message: 'Missing light-theme override coverage for low-contrast emerald text states',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /text-amber-200/,
    message: 'Missing light-theme override coverage for low-contrast amber warning text states',
  },
  {
    type: 'exclude',
    file: 'paneCard',
    pattern: /bg-slate-950\/85|border-slate-800\/80/,
    message: 'ComposerPaneCard still uses raw dark panel classes',
  },
  {
    type: 'exclude',
    file: 'activityPane',
    pattern: /bg-slate-950\/85|border-slate-800\/80/,
    message: 'ComposerActivityEditorPane still uses raw dark panel classes',
  },
  {
    type: 'exclude',
    file: 'inspector',
    pattern: /bg-slate-950\/45|text-\[10px\] font-bold uppercase tracking-\[0\.18em\] text-slate-200/,
    message: 'ComposerInspectorSection still uses dark-only inspector styling',
  },
  {
    type: 'exclude',
    file: 'toolbar',
    pattern: /bg-\[linear-gradient\(180deg,rgba\(8,15,34,0\.92\),rgba\(9,14,28,0\.74\)\)\]|border-slate-800\/80 bg-slate-950\/70|bg-indigo-600 text-white|bg-slate-100 text-slate-950/,
    message: 'ComposerPreviewToolbar still uses raw dark/light hard-coded button states',
  },
  {
    type: 'exclude',
    file: 'workspace',
    pattern: /rounded-lg border border-slate-700 bg-slate-950\/60|rounded-lg border border-slate-700 bg-slate-950\/70/,
    message: 'ComposerWorkspaceControls still uses raw dark panels',
  },
  {
    type: 'exclude',
    file: 'canvasShell',
    pattern: /bg-slate-950\/55|bg-slate-950\/80|bg-slate-950\/85|bg-slate-900 text-slate-300|bg-indigo-600 text-white/,
    message: 'ComposerCanvasShell still uses raw dark rail or drawer classes',
  },
  {
    type: 'exclude',
    file: 'drawer',
    pattern: /bg-rose-600 text-white hover:bg-rose-500|bg-emerald-600 text-white hover:bg-emerald-500|bg-indigo-600 text-white hover:bg-indigo-500|bg-slate-800 text-slate-100 hover:bg-slate-700/,
    message: 'ComposerCanvasDrawer still uses raw action button tone classes that break in light mode',
  },
  {
    type: 'exclude',
    file: 'phase1',
    pattern: /bg-slate-900\/80 border-b border-slate-700|flex items-center justify-between rounded bg-slate-800 border border-slate-700 px-2 py-1 text-\[10px\] font-bold uppercase tracking-wide text-slate-300/,
    message: 'Phase 1 inspector body toolbar still uses dark-only local styling',
  },
  {
    type: 'exclude',
    file: 'editModal',
    pattern: /inline-flex bg-slate-950 border border-slate-700 rounded p-0\.5|px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs|w-full .*bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm/,
    message: 'EditModal inspector still uses dark-only local toolbar or field styling',
  },
];

const failures = checks
  .filter(({ type, file, pattern }) => (type === 'include' ? !pattern.test(files[file]) : pattern.test(files[file])))
  .map(({ message }) => message);

if (failures.length > 0) {
  console.error('Composer light-mode legibility verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Composer light-mode legibility verification passed.');
