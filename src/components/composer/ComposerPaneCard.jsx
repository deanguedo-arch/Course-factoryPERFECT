import * as React from 'react';

export default function ComposerPaneCard({
  bodyClassName = '',
  children,
  className = 'rounded-lg border border-slate-700 bg-slate-950 p-3',
  header = null,
}) {
  return (
    <div className={className}>
      {header ? <div className="mb-3">{header}</div> : null}
      {bodyClassName ? <div className={bodyClassName}>{children}</div> : children}
    </div>
  );
}
