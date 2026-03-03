import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

const files = {
  app: read('src/App.jsx'),
  css: read('src/index.css'),
  phase0: read('src/components/Phase0.jsx'),
  phase2: read('src/components/Phase2.jsx'),
  phase3: read('src/components/Phase3.jsx'),
  phase4: read('src/components/Phase4.jsx'),
};

const checks = [
  {
    type: 'include',
    file: 'app',
    pattern: /BUILDER_THEME_KEY/,
    message: 'Missing builder theme storage key in src/App.jsx',
  },
  {
    type: 'include',
    file: 'app',
    pattern: /data-builder-theme|dataset\.builderTheme/,
    message: 'Missing document theme dataset wiring in src/App.jsx',
  },
  {
    type: 'include',
    file: 'app',
    pattern: /builderTheme/,
    message: 'Missing builder theme state in src/App.jsx',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /html\[data-builder-theme='dark'\]/,
    message: 'Missing dark builder theme selector in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /html\[data-builder-theme='light'\]/,
    message: 'Missing light builder theme selector in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-theme-toggle\b/,
    message: 'Missing shared builder theme toggle styles in src/index.css',
  },
  {
    type: 'exclude',
    file: 'phase0',
    pattern: /className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"/,
    message: 'Phase 0 still uses the old raw select shell',
  },
  {
    type: 'exclude',
    file: 'phase0',
    pattern: /className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg text-xs disabled:opacity-50"/,
    message: 'Phase 0 batch importer still uses the old solid indigo scan button',
  },
  {
    type: 'exclude',
    file: 'phase0',
    pattern: /px-3 py-1 rounded-full text-xs font-bold border transition-colors/,
    message: 'Phase 0 still uses the old pill toggle styling',
  },
  {
    type: 'exclude',
    file: 'phase3',
    pattern: /className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"/,
    message: 'Phase 3 backup action still uses the old solid blue button',
  },
  {
    type: 'exclude',
    file: 'phase3',
    pattern: /className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"/,
    message: 'Phase 3 restore action still uses the old solid green button',
  },
  {
    type: 'exclude',
    file: 'phase3',
    pattern: /className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-3 rounded border border-slate-700 flex items-center justify-center gap-2"/,
    message: 'Phase 3 reset safety panel still uses the old slate CTA',
  },
  {
    type: 'exclude',
    file: 'phase3',
    pattern: /className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-3 rounded shadow-lg shadow-rose-900\/20"/,
    message: 'Phase 3 reset confirm button still uses the old solid danger style',
  },
  {
    type: 'exclude',
    file: 'phase2',
    pattern: /className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm"/,
    message: 'Phase 2 material edit modal still has raw legacy input wrappers',
  },
  {
    type: 'exclude',
    file: 'phase2',
    pattern: /className="p-4 bg-black\/30 rounded-lg border border-slate-700"/,
    message: 'Phase 2 digital content panel still uses the old raw interior block',
  },
  {
    type: 'exclude',
    file: 'phase4',
    pattern: /className="rounded-lg border border-slate-800 bg-slate-950\/70 p-4 h-48 overflow-y-auto"/,
    message: 'Phase 4 export selectors still use the old raw selection columns',
  },
  {
    type: 'exclude',
    file: 'phase4',
    pattern: /className="border-b border-slate-800\/70 p-3 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900\/40"/,
    message: 'Phase 4 still uses the old compressed build configuration header shell',
  },
];

const failures = checks
  .filter(({ type, file, pattern }) => (type === 'include' ? !pattern.test(files[file]) : pattern.test(files[file])))
  .map(({ message }) => message);

if (failures.length > 0) {
  console.error('Builder UI theme verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Builder UI theme verification passed.');
