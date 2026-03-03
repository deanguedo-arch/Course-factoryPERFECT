import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const phase1 = fs.readFileSync(path.join(rootDir, 'src/components/Phase1.jsx'), 'utf8');

const requiredPatterns = [
  {
    pattern: /cf-input-shell/,
    message: 'Phase 1 should use shared input shells in the remaining micro-control areas',
  },
  {
    pattern: /cf-btn cf-btn-secondary/,
    message: 'Phase 1 should use shared secondary buttons in the remaining micro-control areas',
  },
  {
    pattern: /cf-panel-muted/,
    message: 'Phase 1 should use shared muted panels in the remaining micro-control areas',
  },
];

const forbiddenPatterns = [
  {
    pattern: /className="rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-\[10px\] font-bold text-slate-200"/,
    message: 'Style panel reset button still uses the old slate micro-button style',
  },
  {
    pattern: /className="px-3 py-1\.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white font-bold inline-flex items-center gap-1"/,
    message: 'Phase 1 still has legacy slate helper buttons',
  },
  {
    pattern: /className="px-3 py-1\.5 bg-indigo-700 hover:bg-indigo-600 rounded text-xs text-white font-bold inline-flex items-center gap-1"/,
    message: 'Worksheet helper still uses the old indigo add-block button',
  },
  {
    pattern: /className="col-span-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded text-xs font-bold text-white"/,
    message: 'Phase 1 still has legacy indigo micro CTAs',
  },
  {
    pattern: /className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"/,
    message: 'Phase 1 still has raw legacy input wrappers in micro-control areas',
  },
  {
    pattern: /className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold">B<\/button>/,
    message: 'Worksheet/rich text toolbar still uses old micro toolbar buttons',
  },
];

const failures = [];

for (const check of requiredPatterns) {
  if (!check.pattern.test(phase1)) failures.push(check.message);
}

for (const check of forbiddenPatterns) {
  if (check.pattern.test(phase1)) failures.push(check.message);
}

if (failures.length > 0) {
  console.error('Phase 1 micro-controls verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Phase 1 micro-controls verification passed.');
