import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

const files = {
  overlay: read('src/components/composer/ComposerCanvasBlockOverlay.jsx'),
  phase1: read('src/components/Phase1.jsx'),
};

const checks = [
  {
    type: 'include',
    file: 'overlay',
    pattern: /window\.setTimeout\(\s*\(\)\s*=>\s*\{[\s\S]*?setFrame\(lastPreviewFrame\)[\s\S]*?setDraftFrame\(null\)[\s\S]*?\},\s*120\s*\);/,
    message: 'Overlay commit flow must preserve the 120ms reset while syncing frame from lastPreviewFrame to avoid flash/reset',
  },
  {
    type: 'include',
    file: 'overlay',
    pattern: /commitSettleUntilRef\s*=\s*React\.useRef\(0\)/,
    message: 'Missing short post-commit settle timer ref in ComposerCanvasBlockOverlay.jsx',
  },
  {
    type: 'include',
    file: 'overlay',
    pattern: /commitExpectedFrameRef\s*=\s*React\.useRef\(null\)/,
    message: 'Missing post-commit expected-frame ref in ComposerCanvasBlockOverlay.jsx',
  },
  {
    type: 'include',
    file: 'overlay',
    pattern: /const isSettlingCommit = commitSettleUntilRef\.current > Date\.now\(\)/,
    message: 'Overlay updateFrame path must detect post-commit settle window to avoid stale-frame flashes',
  },
  {
    type: 'include',
    file: 'overlay',
    pattern: /style\.pointerEvents\s*=\s*'none'/,
    message: 'Missing iframe pointer-events lock during drag/resize interaction in ComposerCanvasBlockOverlay.jsx',
  },
  {
    type: 'include',
    file: 'overlay',
    pattern: /touchAction:\s*'none'/,
    message: 'Missing touch-action suppression on overlay drag/resize handles in ComposerCanvasBlockOverlay.jsx',
  },
  {
    type: 'include',
    file: 'overlay',
    pattern: /function autoScrollDragSurface\(/,
    message: 'Missing drag-edge autoscroll helper in ComposerCanvasBlockOverlay.jsx',
  },
  {
    type: 'include',
    file: 'overlay',
    pattern: /autoScrollDragSurface\(\{\s*clientY:\s*moveEvent\.clientY,/,
    message: 'Pointer move path must invoke drag-edge autoscroll in ComposerCanvasBlockOverlay.jsx',
  },
  {
    type: 'include',
    file: 'overlay',
    pattern: /window\.setTimeout\([\s\S]*?120\s*\)/,
    message: 'Overlay should keep a short 120ms commit settle timeout for stable drag/drop completion',
  },
  {
    type: 'exclude',
    file: 'overlay',
    pattern: /pendingCommitRef|framesRoughlyMatch/,
    message: 'Overlay should not use pending-commit hold/reconciliation refs for this interaction path',
  },
  {
    type: 'include',
    file: 'phase1',
    pattern: /const updateSelectedComposerActivityCanvasLayout = \(updates, options = \{\}\) => {[\s\S]*?updateComposerActivities\([\s\S]*?followPreview:\s*false[\s\S]*?\);/,
    message: 'Canvas drag/resize commits should disable preview follow in Phase1 updateSelectedComposerActivityCanvasLayout',
  },
  {
    type: 'include',
    file: 'phase1',
    pattern: /const commitSelectedComposerSimpleLayout = React\.useCallback\([\s\S]*?updateComposerActivities\([\s\S]*?followPreview:\s*false[\s\S]*?\);/,
    message: 'Simple drag/resize commits should disable preview follow in Phase1 commitSelectedComposerSimpleLayout',
  },
];

const failures = checks
  .filter(({ type, file, pattern }) => (type === 'include' ? !pattern.test(files[file]) : pattern.test(files[file])))
  .map(({ message }) => message);

if (failures.length > 0) {
  console.error('Composer canvas interaction stability verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Composer canvas interaction stability verification passed.');
