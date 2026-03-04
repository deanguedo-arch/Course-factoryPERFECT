import * as React from 'react';

const HISTORY_LIMIT = 120;

function defaultGetSignature(snapshot) {
  return JSON.stringify(snapshot ?? null);
}

export function useComposerHistory({
  buildSnapshot,
  applySnapshot,
  getSnapshotSignature = defaultGetSignature,
} = {}) {
  const historyRef = React.useRef({ past: [], future: [] });
  const [historyState, setHistoryState] = React.useState({ canUndo: false, canRedo: false });

  const syncHistoryState = React.useCallback(() => {
    const history = historyRef.current;
    setHistoryState({
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
    });
  }, []);

  const resetHistory = React.useCallback(() => {
    historyRef.current = { past: [], future: [] };
    syncHistoryState();
  }, [syncHistoryState]);

  const pushHistorySnapshot = React.useCallback(
    (snapshot) => {
      if (typeof buildSnapshot !== 'function') return;
      const nextSnapshot = snapshot ?? buildSnapshot();
      if (!nextSnapshot) return;
      const history = historyRef.current;
      const last = history.past[history.past.length - 1];
      if (last && getSnapshotSignature(last) === getSnapshotSignature(nextSnapshot)) return;
      history.past.push(nextSnapshot);
      if (history.past.length > HISTORY_LIMIT) {
        history.past = history.past.slice(history.past.length - HISTORY_LIMIT);
      }
      history.future = [];
      syncHistoryState();
    },
    [buildSnapshot, getSnapshotSignature, syncHistoryState],
  );

  const undoHistory = React.useCallback(() => {
    if (typeof buildSnapshot !== 'function' || typeof applySnapshot !== 'function') return false;
    const history = historyRef.current;
    if (!history.past.length) return false;
    const currentSnapshot = buildSnapshot();
    const previousSnapshot = history.past.pop();
    history.future.unshift(currentSnapshot);
    if (history.future.length > HISTORY_LIMIT) {
      history.future = history.future.slice(0, HISTORY_LIMIT);
    }
    applySnapshot(previousSnapshot);
    syncHistoryState();
    return true;
  }, [applySnapshot, buildSnapshot, syncHistoryState]);

  const redoHistory = React.useCallback(() => {
    if (typeof buildSnapshot !== 'function' || typeof applySnapshot !== 'function') return false;
    const history = historyRef.current;
    if (!history.future.length) return false;
    const currentSnapshot = buildSnapshot();
    const nextSnapshot = history.future.shift();
    history.past.push(currentSnapshot);
    if (history.past.length > HISTORY_LIMIT) {
      history.past = history.past.slice(history.past.length - HISTORY_LIMIT);
    }
    applySnapshot(nextSnapshot);
    syncHistoryState();
    return true;
  }, [applySnapshot, buildSnapshot, syncHistoryState]);

  return {
    canUndo: historyState.canUndo,
    canRedo: historyState.canRedo,
    historyRef,
    pushHistorySnapshot,
    redoHistory,
    resetHistory,
    undoHistory,
  };
}
