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
    pattern: /export function resolveComposerSimpleInsertionTarget/,
    message: 'Missing exported stacked insertion target resolver in src/composer/layout.js',
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
    pattern: /onSimpleInsertionChange/,
    message: 'Missing stacked insertion commit callback in ComposerCanvasBlockOverlay.jsx',
  },
  {
    type: 'include',
    file: 'overlay',
    pattern: /cf-composer-insertion-line/,
    message: 'Missing stacked insertion line hook in ComposerCanvasBlockOverlay.jsx',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-composer-block-outline\.is-invalid/,
    message: 'Missing invalid canvas preview style in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-composer-insertion-line/,
    message: 'Missing insertion line style in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-composer-insertion-gap/,
    message: 'Missing insertion gap style in src/index.css',
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
