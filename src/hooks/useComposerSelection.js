import * as React from 'react';

function getActivityId(activity) {
  return String(activity?.id || '').trim();
}

export function getComposerSelectionIntent(event) {
  return {
    range: Boolean(event?.shiftKey),
    toggle: Boolean(event?.metaKey || event?.ctrlKey),
  };
}

export function useComposerSelection({
  activities = [],
  selectedIndex = 0,
  setSelectedIndex,
} = {}) {
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [anchorId, setAnchorId] = React.useState('');

  const activityIds = React.useMemo(() => activities.map((activity) => getActivityId(activity)).filter(Boolean), [activities]);

  React.useEffect(() => {
    if (!activityIds.length) {
      setSelectedIds([]);
      setAnchorId('');
      return;
    }

    const primaryId = getActivityId(activities[selectedIndex]);
    setSelectedIds((prev) => {
      const filtered = prev.filter((id) => activityIds.includes(id));
      if (filtered.length === 0) {
        return primaryId ? [primaryId] : [activityIds[0]];
      }
      if (primaryId && !filtered.includes(primaryId)) {
        return [primaryId, ...filtered];
      }
      return filtered;
    });
    setAnchorId((prev) => (prev && activityIds.includes(prev) ? prev : primaryId || activityIds[0]));
  }, [activities, activityIds, selectedIndex]);

  const selectedIndexes = React.useMemo(
    () =>
      selectedIds
        .map((id) => activities.findIndex((activity) => getActivityId(activity) === id))
        .filter((index) => index >= 0),
    [activities, selectedIds],
  );

  const isSelectedId = React.useCallback((activityId) => selectedIds.includes(String(activityId || '').trim()), [selectedIds]);
  const isSelectedIndex = React.useCallback(
    (index) => {
      if (!Number.isInteger(index) || index < 0 || index >= activities.length) return false;
      return isSelectedId(getActivityId(activities[index]));
    },
    [activities, isSelectedId],
  );

  const applySelection = React.useCallback(
    (nextIds, { primaryId = '', activityList = activities } = {}) => {
      const validIds = (Array.isArray(nextIds) ? nextIds : []).map((id) => String(id || '').trim()).filter(Boolean);
      const listIds = activityList.map((activity) => getActivityId(activity)).filter(Boolean);
      const filteredIds = validIds.filter((id) => listIds.includes(id));
      const requestedPrimaryId = String(primaryId || '').trim();
      const resolvedPrimaryId = filteredIds.includes(requestedPrimaryId)
        ? requestedPrimaryId
        : String(filteredIds[0] || requestedPrimaryId || listIds[0] || '').trim();
      const nextSelectedIds = filteredIds.length > 0 ? filteredIds : (resolvedPrimaryId ? [resolvedPrimaryId] : []);
      const nextPrimaryIndex = resolvedPrimaryId ? activityList.findIndex((activity) => getActivityId(activity) === resolvedPrimaryId) : -1;

      setSelectedIds(nextSelectedIds);
      setAnchorId(resolvedPrimaryId || '');
      if (nextPrimaryIndex >= 0) {
        setSelectedIndex?.(nextPrimaryIndex);
      }
    },
    [activities, setSelectedIndex],
  );

  const selectIndex = React.useCallback(
    (index, { range = false, toggle = false } = {}) => {
      if (!Number.isInteger(index) || index < 0 || index >= activities.length) return;
      const activityId = getActivityId(activities[index]);
      if (!activityId) return;

      if (range) {
        const anchorIndex = Math.max(
          0,
          activities.findIndex((activity) => getActivityId(activity) === anchorId),
        );
        const start = Math.min(anchorIndex, index);
        const end = Math.max(anchorIndex, index);
        const nextIds = activities.slice(start, end + 1).map((activity) => getActivityId(activity)).filter(Boolean);
        applySelection(nextIds, { primaryId: activityId });
        return;
      }

      if (toggle) {
        const nextIds = selectedIds.includes(activityId)
          ? selectedIds.filter((id) => id !== activityId)
          : [...selectedIds, activityId];
        applySelection(nextIds, { primaryId: activityId });
        return;
      }

      applySelection([activityId], { primaryId: activityId });
    },
    [activities, anchorId, applySelection, selectedIds],
  );

  const selectById = React.useCallback(
    (activityId, options = {}) => {
      const targetId = String(activityId || '').trim();
      if (!targetId) return;
      const index = activities.findIndex((activity) => getActivityId(activity) === targetId);
      if (index < 0) return;
      selectIndex(index, options);
    },
    [activities, selectIndex],
  );

  const selectOnly = React.useCallback((index) => selectIndex(index, { range: false, toggle: false }), [selectIndex]);

  const clearToPrimary = React.useCallback(() => {
    const primaryId = getActivityId(activities[selectedIndex]);
    applySelection(primaryId ? [primaryId] : [], { primaryId });
  }, [activities, applySelection, selectedIndex]);

  const selectAll = React.useCallback(() => {
    const primaryId = getActivityId(activities[selectedIndex]) || getActivityId(activities[0]);
    applySelection(activityIds, { primaryId });
  }, [activities, activityIds, applySelection, selectedIndex]);

  return {
    applySelection,
    clearToPrimary,
    isSelectedId,
    isSelectedIndex,
    selectAll,
    selectById,
    selectIndex,
    selectOnly,
    selectedCount: selectedIds.length,
    selectedIds,
    selectedIndexes,
  };
}
