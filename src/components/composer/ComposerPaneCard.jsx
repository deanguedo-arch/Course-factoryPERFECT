import * as React from 'react';

export default function ComposerPaneCard({
  bodyClassName = '',
  children,
  className = 'rounded-2xl border border-slate-800/80 bg-slate-950/85 p-4 shadow-[0_12px_32px_rgba(2,6,23,0.22)] backdrop-blur-sm',
  header = null,
}) {
  return (
    <div className={className}>
      {header ? <div className="mb-4">{header}</div> : null}
      {bodyClassName ? <div className={bodyClassName}>{children}</div> : children}
    </div>
  );
}
