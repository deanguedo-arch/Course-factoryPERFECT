import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

const files = {
  app: read('src/App.jsx'),
  shared: read('src/components/Shared.jsx'),
  phase2: read('src/components/Phase2.jsx'),
  phase4: read('src/components/Phase4.jsx'),
  phase5: read('src/components/Phase5.jsx'),
};

const checks = [
  {
    type: 'exclude',
    file: 'app',
    pattern: /text-\[10px\] font-bold uppercase tracking-wider text-slate-600">Factory Line/,
    message: 'Shell still uses the old uppercase Factory Line label',
  },
  {
    type: 'exclude',
    file: 'app',
    pattern: /text-\[10px\] font-bold uppercase tracking-\[0\.18em\] text-slate-500">Fast Lane/,
    message: 'Shell still uses the old uppercase Fast Lane label',
  },
  {
    type: 'exclude',
    file: 'shared',
    pattern: /bg-emerald-600 border-emerald-500 text-white|bg-rose-600 border-rose-500 text-white|bg-amber-600 border-amber-500 text-white|bg-sky-600 border-sky-500 text-white/,
    message: 'Shared toasts still use the old solid color blocks',
  },
  {
    type: 'exclude',
    file: 'shared',
    pattern: /border border-slate-700 rounded-lg overflow-hidden bg-slate-950/,
    message: 'Shared code block still uses the old raw slate shell',
  },
  {
    type: 'exclude',
    file: 'phase2',
    pattern: /border-purple-400\/25 bg-slate-950\/55 text-white|border-sky-400\/25 bg-slate-950\/55 text-white|border-cyan-400\/25 bg-slate-950\/55 text-white/,
    message: 'Phase 2 source toggle still uses the three-accent active state system',
  },
  {
    type: 'exclude',
    file: 'phase2',
    pattern: /text-xs font-bold text-slate-400 uppercase mb-2/,
    message: 'Phase 2 still overuses uppercase field labels in the edit flows',
  },
  {
    type: 'exclude',
    file: 'phase4',
    pattern: /text-sm font-bold text-emerald-400 mb-2 uppercase tracking-wider|text-sm font-bold text-sky-400 mb-2 uppercase tracking-wider/,
    message: 'Phase 4 builder sections still use noisy multi-accent uppercase headings',
  },
  {
    type: 'exclude',
    file: 'phase4',
    pattern: /text-xs font-bold text-slate-400 uppercase mb-2">Select Primary Module|text-xs font-bold text-slate-400 uppercase">Select Modules/,
    message: 'Phase 4 still uses the older uppercase form labels in the builder UI',
  },
  {
    type: 'exclude',
    file: 'phase5',
    pattern: /text-\[10px\] font-bold uppercase tracking-\[0\.18em\] text-slate-500">Modules|text-\[10px\] font-bold uppercase tracking-\[0\.18em\] text-slate-500">Materials|text-\[10px\] font-bold uppercase tracking-\[0\.18em\] text-slate-500">Assessments|text-\[10px\] font-bold uppercase tracking-\[0\.18em\] text-slate-500">Toolkit/,
    message: 'Phase 5 summary metrics still use the old cramped uppercase labels',
  },
];

const failures = checks
  .filter(({ type, file, pattern }) => (type === 'include' ? !pattern.test(files[file]) : pattern.test(files[file])))
  .map(({ message }) => message);

if (failures.length > 0) {
  console.error('Builder UI final polish verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Builder UI final polish verification passed.');
