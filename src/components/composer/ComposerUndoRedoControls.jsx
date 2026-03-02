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
        className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Undo last composer change"
      >
        <RotateCcw size={12} />
        Undo
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Redo composer change"
      >
        <RefreshCw size={12} />
        Redo
      </button>
    </>
  );
}
