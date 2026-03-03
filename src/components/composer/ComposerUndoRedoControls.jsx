import * as React from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';

export default function ComposerUndoRedoControls({
  canRedo = false,
  canUndo = false,
  onRedo,
  onUndo,
}) {
  return (
    <>
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="cf-composer-toolbar-action px-2.5 py-1.5"
        title="Undo last composer change"
      >
        <RotateCcw size={12} />
        Undo
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className="cf-composer-toolbar-action px-2.5 py-1.5"
        title="Redo composer change"
      >
        <RefreshCw size={12} />
        Redo
      </button>
    </>
  );
}
