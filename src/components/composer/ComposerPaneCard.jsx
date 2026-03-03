import * as React from 'react';

export default function ComposerPaneCard({
  bodyClassName = '',
  children,
  className = 'cf-composer-panel p-4',
  header = null,
}) {
  return (
    <div className={className}>
      {header ? <div className="mb-4">{header}</div> : null}
      {bodyClassName ? <div className={bodyClassName}>{children}</div> : children}
    </div>
  );
}
