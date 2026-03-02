import * as React from 'react';
import { X } from 'lucide-react';
import ComposerPaneCard from './ComposerPaneCard.jsx';
import ComposerPreviewPane from './ComposerPreviewPane.jsx';

class DrawerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Composer canvas drawer crashed:', error);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-rose-500/40 bg-rose-950/20 p-4">
          <p className="text-sm font-bold text-white">Drawer unavailable</p>
          <p className="mt-1 text-xs text-rose-100/80">
            The secondary panel hit an error. Close it and keep working on the canvas.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ComposerCanvasShell({
  activePanel = null,
  drawerContent = null,
  drawerPlacement = 'stacked',
  drawerTitle = '',
  onPanelChange,
  previewProps = {},
  railItems = [],
  showRail = true,
}) {
  const hasDrawer = showRail && activePanel && drawerContent;
  const useSideDrawer = hasDrawer && drawerPlacement === 'side';

  return (
    <div
      className={`grid grid-cols-1 gap-3 ${
        showRail
          ? useSideDrawer
            ? 'xl:grid-cols-[52px_minmax(300px,340px)_minmax(0,1fr)]'
            : 'xl:grid-cols-[52px_minmax(0,1fr)]'
          : ''
      }`}
    >
      {showRail ? (
        <div className="flex flex-row gap-2 rounded-2xl border border-slate-800/70 bg-slate-950/55 p-1.5 xl:flex-col xl:self-start">
          {railItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.value === activePanel;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onPanelChange?.(isActive ? null : item.value)}
                className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                  isActive
                    ? 'border-indigo-400/80 bg-indigo-600 text-white shadow-[0_8px_24px_rgba(79,70,229,0.28)]'
                    : 'border-slate-800/80 bg-slate-950/80 text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
                title={item.label}
              >
                {Icon ? <Icon size={15} /> : <span className="text-xs font-bold">{item.label.slice(0, 1)}</span>}
                {item.badge ? (
                  <span className="absolute -right-1 -top-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-950">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {useSideDrawer ? (
        <ComposerPaneCard
          className="rounded-2xl border border-slate-800/80 bg-slate-950/85 p-4 shadow-[0_12px_32px_rgba(2,6,23,0.22)] backdrop-blur-sm xl:self-start"
          header={(
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{drawerTitle}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Canvas tools and workspace settings.</p>
              </div>
              <button
                type="button"
                onClick={() => onPanelChange?.(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
                title="Close drawer"
              >
                <X size={14} />
              </button>
            </div>
          )}
        >
          <DrawerErrorBoundary resetKey={activePanel}>
            {drawerContent}
          </DrawerErrorBoundary>
        </ComposerPaneCard>
      ) : null}

      <div className="space-y-4 min-w-0">
        {hasDrawer && !useSideDrawer ? (
          <ComposerPaneCard
            className="rounded-2xl border border-slate-800/80 bg-slate-950/85 p-4 shadow-[0_12px_32px_rgba(2,6,23,0.22)] backdrop-blur-sm"
            header={(
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{drawerTitle}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Secondary tools stay tucked away until needed.</p>
                </div>
                <button
                  type="button"
                  onClick={() => onPanelChange?.(null)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
                  title="Close drawer"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          >
            <DrawerErrorBoundary resetKey={activePanel}>
              {drawerContent}
            </DrawerErrorBoundary>
          </ComposerPaneCard>
        ) : null}

        <ComposerPreviewPane {...previewProps} />
      </div>
    </div>
  );
}
