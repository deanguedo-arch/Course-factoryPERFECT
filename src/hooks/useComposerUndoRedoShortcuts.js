import * as React from 'react';

export function useComposerUndoRedoShortcuts({ enabled = true, onUndo, onRedo } = {}) {
  React.useEffect(() => {
    if (!enabled) return undefined;

    const handleComposerUndoRedo = (event) => {
      const target = event.target;
      const tagName = String(target?.tagName || '').toLowerCase();
      const isEditableField =
        Boolean(target?.isContentEditable) || tagName === 'input' || tagName === 'textarea' || tagName === 'select';
      if (isEditableField) return;

      const key = String(event.key || '').toLowerCase();
      const withCmd = event.ctrlKey || event.metaKey;
      if (!withCmd) return;

      const isUndo = key === 'z' && !event.shiftKey;
      const isRedo = key === 'y' || (key === 'z' && event.shiftKey);
      if (!isUndo && !isRedo) return;

      event.preventDefault();
      if (isUndo) {
        onUndo?.();
      } else {
        onRedo?.();
      }
    };

    window.addEventListener('keydown', handleComposerUndoRedo);
    return () => window.removeEventListener('keydown', handleComposerUndoRedo);
  }, [enabled, onRedo, onUndo]);
}
