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
        className="inline-flex items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-950/70 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        title="Undo last composer change"
      >
        <RotateCcw size={12} />
        Undo
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className="inline-flex items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-950/70 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        title="Redo composer change"
      >
        <RefreshCw size={12} />
        Redo
      </button>
    </>
  );
}
