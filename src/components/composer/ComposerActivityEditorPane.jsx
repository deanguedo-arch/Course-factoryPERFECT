import * as React from 'react';
import ComposerPaneCard from './ComposerPaneCard.jsx';

export default function ComposerActivityEditorPane({
  children,
  className = 'cf-composer-panel p-4',
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
