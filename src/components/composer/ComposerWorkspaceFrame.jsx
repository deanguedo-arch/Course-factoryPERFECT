import * as React from 'react';

export default function ComposerWorkspaceFrame({
  controls = null,
  emptyMessage = 'Both panes are collapsed.',
  headerActions = null,
  layout = 'split',
  mainContent = null,
  mainPaneClassName = 'min-w-0',
  mainPaneStyle = null,
  previewContent = null,
  previewPaneClassName = 'min-w-0',
  previewPaneStyle = null,
  showControls = true,
  showMainPane = true,
  showPreviewPane = true,
  title = '',
}) {
  const shouldShowHeader = Boolean(title) || Boolean(headerActions);
  const shouldShowEmptyState = !showMainPane && !showPreviewPane;
  const isSplitLayout = layout === 'split';

  return (
    <div className="space-y-4">
      {shouldShowHeader ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {title ? <h4 className="text-sm font-semibold" style={{ color: 'var(--cf-text-primary)' }}>{title}</h4> : <div />}
          {headerActions}
        </div>
      ) : null}

      {showControls && controls}

      {shouldShowEmptyState ? (
        <div className="cf-panel-muted p-4 text-xs" style={{ color: 'var(--cf-text-secondary)' }}>{emptyMessage}</div>
      ) : isSplitLayout ? (
        <div className="flex flex-col gap-4 lg:flex-row">
          {showMainPane ? (
            <div className={mainPaneClassName} style={mainPaneStyle}>
              {mainContent}
            </div>
          ) : null}
          {showPreviewPane ? (
            <div className={previewPaneClassName} style={previewPaneStyle}>
              {previewContent}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {showMainPane ? (
            <div className={mainPaneClassName} style={mainPaneStyle}>
              {mainContent}
            </div>
          ) : null}
          {showPreviewPane ? (
            <div className={previewPaneClassName} style={previewPaneStyle}>
              {previewContent}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
