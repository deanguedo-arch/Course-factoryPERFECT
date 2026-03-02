import * as React from 'react';

function createCanvasInteractionState() {
  return { snapshot: null, changed: false, activeId: null, mode: null };
}

export function useComposerCanvasInteractions({
  enabled = true,
  buildSnapshot,
  applyLayoutChange,
  pushHistorySnapshot,
} = {}) {
  const interactionRef = React.useRef(createCanvasInteractionState());

  const resetInteraction = React.useCallback(() => {
    interactionRef.current = createCanvasInteractionState();
  }, []);

  const beginInteraction = React.useCallback(
    (mode, item) => {
      if (!enabled) return false;
      interactionRef.current = {
        snapshot: typeof buildSnapshot === 'function' ? buildSnapshot() : null,
        changed: false,
        activeId: String(item?.i ?? ''),
        mode: mode === 'resize' ? 'resize' : 'drag',
      };
      return true;
    },
    [buildSnapshot, enabled],
  );

  const applyTransientLayout = React.useCallback(
    (layoutItems, { mode = null } = {}) => {
      const interaction = interactionRef.current;
      if (mode && interaction.mode !== mode) return false;
      const didUpdate =
        typeof applyLayoutChange === 'function'
          ? applyLayoutChange(layoutItems, {
              historySnapshot: interaction.snapshot,
              recordHistory: false,
            })
          : false;
      if (didUpdate && interaction.snapshot) {
        interactionRef.current.changed = true;
      }
      return didUpdate;
    },
    [applyLayoutChange],
  );

  const finishInteraction = React.useCallback(
    (layoutItems) => {
      const interaction = interactionRef.current;
      if (!interaction.snapshot) return false;
      const didUpdate =
        typeof applyLayoutChange === 'function'
          ? applyLayoutChange(layoutItems, {
              historySnapshot: interaction.snapshot,
              recordHistory: false,
            })
          : false;
      const shouldPush = interaction.changed || (didUpdate && Boolean(interaction.snapshot));
      if (shouldPush && typeof pushHistorySnapshot === 'function') {
        pushHistorySnapshot(interaction.snapshot);
      }
      resetInteraction();
      return shouldPush;
    },
    [applyLayoutChange, pushHistorySnapshot, resetInteraction],
  );

  return {
    applyTransientLayout,
    beginInteraction,
    finishInteraction,
    interactionRef,
    resetInteraction,
  };
}
