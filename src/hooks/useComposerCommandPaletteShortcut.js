import * as React from 'react';

export function useComposerCommandPaletteShortcut({ enabled = true, onInsert, onToggle } = {}) {
  React.useEffect(() => {
    if (!enabled) return undefined;

    const handleKeydown = (event) => {
      const target = event.target;
      const tagName = String(target?.tagName || '').toLowerCase();
      const isEditableField =
        Boolean(target?.isContentEditable) || tagName === 'input' || tagName === 'textarea' || tagName === 'select';
      if (isEditableField) return;
      if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key === '/') {
        event.preventDefault();
        onInsert?.();
        return;
      }
      const withCmd = event.ctrlKey || event.metaKey;
      if (!withCmd || String(event.key || '').toLowerCase() !== 'k') return;
      event.preventDefault();
      onToggle?.();
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [enabled, onInsert, onToggle]);
}
