import * as React from 'react';

export default function ComposerCommandPalette({
  actions = [],
  emptyMessage = 'No matching commands.',
  initialQuery = '',
  isOpen = false,
  onClose,
  placeholder = 'Search commands...',
  title = 'Command Palette',
}) {
  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef(null);

  const filteredActions = React.useMemo(() => {
    const needle = String(query || '').trim().toLowerCase();
    if (!needle) return actions;
    return actions.filter((action) => {
      const haystack = [action.label, action.subtitle, action.keywords]
        .flat()
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [actions, query]);

  React.useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveIndex(0);
      return;
    }
    setQuery(String(initialQuery || ''));
    setActiveIndex(0);
    const timer = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(timer);
  }, [initialQuery, isOpen]);

  React.useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) => Math.min(filteredActions.length - 1, index + 1));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => Math.max(0, index - 1));
        return;
      }
      if (event.key === 'Enter') {
        const action = filteredActions[activeIndex];
        if (!action) return;
        event.preventDefault();
        action.onSelect?.();
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [activeIndex, filteredActions, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-slate-950/70 p-4 pt-[12vh] backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
        <div className="border-b border-slate-800 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">{title}</p>
        </div>
        <div className="border-b border-slate-800 px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 px-4 py-10 text-center text-sm text-slate-500">
              {emptyMessage}
            </div>
          ) : (
            filteredActions.map((action, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={action.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    action.onSelect?.();
                    onClose?.();
                  }}
                  className={`mb-1 flex w-full items-start justify-between gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold">{action.label}</p>
                    {action.subtitle ? (
                      <p className={`mt-1 text-xs ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>{action.subtitle}</p>
                    ) : null}
                  </div>
                  {action.hint ? (
                    <span className={`text-[10px] uppercase tracking-wide ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {action.hint}
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
