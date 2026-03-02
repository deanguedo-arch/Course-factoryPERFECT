import * as React from 'react';
import ComposerPaneCard from './ComposerPaneCard.jsx';

export default function ComposerActivityBuilderPane({
  body = null,
  className = 'rounded-lg border border-slate-700 bg-slate-950 p-3',
  controls = null,
  countLabel = '',
  footer = null,
  headerActions = null,
  title = 'Block Builder',
  toolbar = null,
}) {
  const header = (
    <div className="flex items-center justify-between gap-2">
      <h4 className="text-sm font-bold text-white">{title}</h4>
      <div className="flex items-center gap-2">
        {countLabel ? <span className="text-[11px] text-slate-500">{countLabel}</span> : null}
        {headerActions}
      </div>
    </div>
  );

  return (
    <ComposerPaneCard className={className} header={header}>
      <div className="space-y-3">
        {toolbar}
        {controls}
        {body}
      </div>
      {footer ? <div className="mt-4 border-t border-slate-700 pt-3">{footer}</div> : null}
    </ComposerPaneCard>
  );
}
