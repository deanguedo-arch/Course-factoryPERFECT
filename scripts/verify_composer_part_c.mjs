import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

const targets = [
  {
    label: 'ComposerActivityBuilderFooter',
    path: 'src/components/composer/ComposerActivityBuilderFooter.jsx',
    forbidden: [
      /bg-slate-900\/60/,
      /bg-slate-950/,
      /border-slate-700/,
      /bg-emerald-600/,
      /bg-indigo-600/,
      /bg-rose-600/,
    ],
  },
  {
    label: 'ComposerLayoutControls',
    path: 'src/components/composer/ComposerLayoutControls.jsx',
    forbidden: [
      /bg-slate-900\/60/,
      /bg-slate-900/,
      /bg-slate-950\/60/,
      /border-slate-700/,
      /bg-blue-600/,
      /bg-indigo-600/,
    ],
  },
  {
    label: 'ComposerResponsiveControls',
    path: 'src/components/composer/ComposerResponsiveControls.jsx',
    forbidden: [
      /bg-slate-900\/60/,
      /bg-slate-950/,
      /border-slate-700/,
      /text-white/,
      /text-indigo-500/,
    ],
  },
  {
    label: 'ComposerSidebarTools',
    path: 'src/components/composer/ComposerSidebarTools.jsx',
    forbidden: [
      /bg-slate-900\/60/,
      /bg-slate-950/,
      /border-slate-700/,
      /bg-indigo-600/,
      /bg-emerald-600/,
      /bg-rose-600/,
      /text-white/,
      /text-indigo-100/,
      /text-emerald-100/,
      /text-rose-100/,
      /text-amber-100/,
      /text-sky-100/,
    ],
  },
  {
    label: 'ComposerPreviewPane',
    path: 'src/components/composer/ComposerPreviewPane.jsx',
    forbidden: [
      /bg-slate-950\/88/,
      /border-slate-800\/80/,
      /bg-black\/90/,
      /text-slate-500/,
    ],
  },
  {
    label: 'ComposerUndoRedoControls',
    path: 'src/components/composer/ComposerUndoRedoControls.jsx',
    forbidden: [
      /bg-slate-950\/70/,
      /border-slate-800\/80/,
      /text-slate-200/,
    ],
  },
  {
    label: 'ComposerWorkspaceFrame',
    path: 'src/components/composer/ComposerWorkspaceFrame.jsx',
    forbidden: [
      /text-white/,
      /border-slate-700/,
      /bg-slate-950/,
      /text-slate-400/,
    ],
  },
  {
    label: 'HotspotEditor',
    path: 'src/components/composer/HotspotEditor.jsx',
    forbidden: [
      /bg-slate-950/,
      /bg-slate-900/,
      /border-slate-700/,
      /bg-rose-600/,
      /bg-slate-700/,
      /text-white/,
      /text-slate-300/,
    ],
  },
];

const failures = [];

targets.forEach((target) => {
  const source = read(target.path);
  target.forbidden.forEach((pattern) => {
    if (pattern.test(source)) {
      failures.push(`${target.label} still contains legacy pattern ${pattern}`);
    }
  });
});

if (failures.length > 0) {
  console.error('Composer Part C verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Composer Part C verification passed.');
