import * as React from 'react';
import ComposerPaneCard from './ComposerPaneCard.jsx';

export default function ComposerActivityEditorPane({
  children,
  className = 'rounded-2xl border border-slate-800/80 bg-slate-950/85 p-4 shadow-[0_12px_32px_rgba(2,6,23,0.2)] backdrop-blur-sm',
  headerActions = null,
  title = 'Activity Editor',
}) {
  const header = (
    <div className="flex items-center justify-between gap-2">
      <h4 className="text-base font-semibold text-white">{title}</h4>
      {headerActions}
    </div>
  );

  return (
    <ComposerPaneCard className={className} header={header}>
      {children}
    </ComposerPaneCard>
  );
}
