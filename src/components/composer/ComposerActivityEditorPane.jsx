import * as React from 'react';
import ComposerPaneCard from './ComposerPaneCard.jsx';

export default function ComposerActivityEditorPane({
  children,
  className = 'rounded-lg border border-slate-700 bg-slate-950 p-4',
  headerActions = null,
  title = 'Activity Editor',
}) {
  const header = (
    <div className="flex items-center justify-between gap-2">
      <h4 className="text-sm font-bold text-white">{title}</h4>
      {headerActions}
    </div>
  );

  return (
    <ComposerPaneCard className={className} header={header}>
      {children}
    </ComposerPaneCard>
  );
}
