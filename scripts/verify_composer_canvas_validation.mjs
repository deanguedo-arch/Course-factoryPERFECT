import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

const files = {
  css: read('src/index.css'),
  overlay: read('src/components/composer/ComposerCanvasBlockOverlay.jsx'),
  layout: read('src/composer/layout.js'),
};

const checks = [
  {
    type: 'include',
    file: 'layout',
    pattern: /export function validateComposerCanvasProposal/,
    message: 'Missing exported canvas proposal validator in src/composer/layout.js',
  },
  {
    type: 'include',
    file: 'layout',
    pattern: /export function validateComposerSimpleProposal/,
    message: 'Missing exported simple proposal validator in src/composer/layout.js',
  },
  {
    type: 'include',
    file: 'layout',
    pattern: /availableSpan|fittedSpan|autofit/i,
    message: 'Simple proposal validator is missing auto-fit span logic in src/composer/layout.js',
  },
  {
    type: 'include',
    file: 'overlay',
    pattern: /previewKind/,
    message: 'Missing preview-kind state in ComposerCanvasBlockOverlay.jsx',
  },
  {
    type: 'include',
    file: 'overlay',
    pattern: /is-invalid|invalid/i,
    message: 'Missing invalid canvas preview handling in ComposerCanvasBlockOverlay.jsx',
  },
  {
    type: 'include',
    file: 'overlay',
    pattern: /validateComposerSimpleProposal/,
    message: 'Missing simple proposal validation in ComposerCanvasBlockOverlay.jsx',
  },
  {
    type: 'include',
    file: 'overlay',
    pattern: /onSimpleLayoutChange/,
    message: 'Missing simple layout commit callback in ComposerCanvasBlockOverlay.jsx',
  },
  {
    type: 'include',
    file: 'overlay',
    pattern: /else if \(operation === 'drag'\)[\s\S]*?validateComposerSimpleProposal/,
    message: 'Simple drag path is not using proposal validation in ComposerCanvasBlockOverlay.jsx',
  },
  {
    type: 'include',
    file: 'overlay',
    pattern: /Math\.max\(1,\s*metrics\.cols\)/,
    message: 'Simple drag column targeting is still clamped by span instead of full-column targeting in ComposerCanvasBlockOverlay.jsx',
  },
  {
    type: 'exclude',
    file: 'overlay',
    pattern: /previewKind === 'simple-insert'|cf-composer-insertion-line|onSimpleInsertionChange/,
    message: 'Overlay still contains insertion-only simple mode behavior',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-composer-block-outline\.is-invalid/,
    message: 'Missing invalid canvas preview style in src/index.css',
  },
  {
    type: 'exclude',
    file: 'css',
    pattern: /\.cf-composer-insertion-line/,
    message: 'Legacy insertion line style should be removed from src/index.css',
  },
  {
    type: 'exclude',
    file: 'css',
    pattern: /\.cf-composer-insertion-gap/,
    message: 'Legacy insertion gap style should be removed from src/index.css',
  },
];

const failures = checks
  .filter(({ type, file, pattern }) => (type === 'include' ? !pattern.test(files[file]) : pattern.test(files[file])))
  .map(({ message }) => message);

if (failures.length > 0) {
  console.error('Composer canvas validation verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Composer canvas validation verification passed.');
