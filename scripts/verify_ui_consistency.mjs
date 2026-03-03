import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

const files = {
  css: read('src/index.css'),
  app: read('src/App.jsx'),
  section: read('src/components/Section.jsx'),
  phase1: read('src/components/Phase1.jsx'),
  phase5: read('src/components/Phase5.jsx'),
};

const checks = [
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-btn\b/,
    message: 'Missing shared `.cf-btn` utility in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-btn-primary\b/,
    message: 'Missing shared `.cf-btn-primary` utility in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-btn-secondary\b/,
    message: 'Missing shared `.cf-btn-secondary` utility in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-tab-rail\b/,
    message: 'Missing shared `.cf-tab-rail` utility in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-tab-btn\b/,
    message: 'Missing shared `.cf-tab-btn` utility in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-input-shell\b/,
    message: 'Missing shared `.cf-input-shell` utility in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-panel-muted\b/,
    message: 'Missing shared `.cf-panel-muted` utility in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-alert\b/,
    message: 'Missing shared `.cf-alert` utility in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-nav-item\b/,
    message: 'Missing shared `.cf-nav-item` utility in src/index.css',
  },
  {
    type: 'include',
    file: 'app',
    pattern: /cf-btn cf-btn-primary/,
    message: 'Fast Lane should use the shared primary button style',
  },
  {
    type: 'include',
    file: 'section',
    pattern: /cf-nav-item/,
    message: 'Section nav should use the shared nav item style',
  },
  {
    type: 'include',
    file: 'phase1',
    pattern: /cf-tab-rail/,
    message: 'Phase 1 should use the shared tab rail',
  },
  {
    type: 'include',
    file: 'phase1',
    pattern: /cf-input-shell/,
    message: 'Phase 1 should use the shared field shell',
  },
  {
    type: 'include',
    file: 'phase1',
    pattern: /cf-panel-muted/,
    message: 'Phase 1 should use the shared muted panel style',
  },
  {
    type: 'include',
    file: 'phase5',
    pattern: /cf-alert cf-alert-danger/,
    message: 'Phase 5 should use the shared danger alert pattern',
  },
  {
    type: 'exclude',
    file: 'app',
    pattern: /rounded-xl bg-indigo-600 px-3 py-2\.5 text-xs font-bold text-white/,
    message: 'Fast Lane still contains the old solid indigo primary button',
  },
  {
    type: 'exclude',
    file: 'phase1',
    pattern: /rounded-t text-xs font-bold transition-colors whitespace-nowrap \$\{mode === 'ADD' \? 'bg-purple-600 text-white'/,
    message: 'Phase 1 assessment mode tabs still use the old solid purple active tab',
  },
  {
    type: 'exclude',
    file: 'phase1',
    pattern: /currentQuestionType === 'multiple-choice' \? 'bg-blue-600 text-white shadow-lg'/,
    message: 'Phase 1 question type toggles still use the old solid blue state',
  },
  {
    type: 'exclude',
    file: 'phase5',
    pattern: /rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-white/,
    message: 'Phase 5 maintenance actions still contain the old solid warning button',
  },
];

const failures = checks
  .filter(({ type, file, pattern }) => (type === 'include' ? !pattern.test(files[file]) : pattern.test(files[file])))
  .map(({ message }) => message);

if (failures.length > 0) {
  console.error('UI consistency verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('UI consistency verification passed.');
