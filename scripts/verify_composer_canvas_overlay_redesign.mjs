import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

const files = {
  css: read('src/index.css'),
  overlay: read('src/components/composer/ComposerCanvasBlockOverlay.jsx'),
  drawer: read('src/components/composer/ComposerCanvasDrawer.jsx'),
};

const checks = [
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-composer-block-overlay\b/,
    message: 'Missing compact composer block overlay styles in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-composer-block-overlay-grip\b/,
    message: 'Missing composer block overlay grip styles in src/index.css',
  },
  {
    type: 'include',
    file: 'css',
    pattern: /\.cf-composer-block-overlay-chip\b/,
    message: 'Missing composer block overlay position chip styles in src/index.css',
  },
  {
    type: 'exclude',
    file: 'overlay',
    pattern: /Arrange|Freeform|onMove\?\.\('up'\)|onMove\?\.\('down'\)|onMove\?\.\('left'\)|onMove\?\.\('right'\)|onDuplicate\?\.\(\)|onDelete\?\.\(\)|title="Move right"|title="Move left"|title="Move up"|title="Move down"/,
    message: 'ComposerCanvasBlockOverlay still contains the legacy action strip controls',
  },
  {
    type: 'include',
    file: 'overlay',
    pattern: /cf-composer-block-overlay/,
    message: 'ComposerCanvasBlockOverlay is not using the compact overlay shell class',
  },
  {
    type: 'include',
    file: 'drawer',
    pattern: /Duplicate/,
    message: 'ComposerCanvasDrawer must keep a duplicate action for the selected section',
  },
  {
    type: 'include',
    file: 'drawer',
    pattern: /Delete/,
    message: 'ComposerCanvasDrawer must keep a delete action for the selected section',
  },
  {
    type: 'include',
    file: 'drawer',
    pattern: />\s*X\s*<|>\s*Y\s*<|>\s*W\s*<|>\s*H\s*</,
    message: 'ComposerCanvasDrawer must keep exact X/Y/W/H controls in canvas mode',
  },
  {
    type: 'exclude',
    file: 'drawer',
    pattern: /ActionButton onClick=\{\(\) => onCanvasLayoutChange\?\.\(\{ y: Math\.max\(0, selectedY - 1\) \}\)\}>Up<\/ActionButton>|ActionButton onClick=\{\(\) => onCanvasLayoutChange\?\.\(\{ y: selectedY \+ 1 \}\)\}>Down<\/ActionButton>|ActionButton onClick=\{\(\) => onCanvasLayoutChange\?\.\(\{ x: Math\.max\(0, selectedX - 1\) \}\)\}>Left<\/ActionButton>|ActionButton[\s\S]*?selectedX \+ 1[\s\S]*?>\s*Right\s*<\/ActionButton>|ActionButton[\s\S]*?nextW = Math\.max\(1, selectedW - 1\)[\s\S]*?>\s*Narrower\s*<\/ActionButton>|ActionButton[\s\S]*?nextW = Math\.min\(maxColumns, selectedW \+ 1\)[\s\S]*?>\s*Wider\s*<\/ActionButton>/,
    message: 'ComposerCanvasDrawer still contains redundant canvas directional shortcut buttons',
  },
];

const failures = checks
  .filter(({ type, file, pattern }) => (type === 'include' ? !pattern.test(files[file]) : pattern.test(files[file])))
  .map(({ message }) => message);

if (failures.length > 0) {
  console.error('Composer canvas overlay redesign verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Composer canvas overlay redesign verification passed.');
