import * as React from 'react';

const { useEffect, useState } = React;

export function useProjectPersistence({
  projectData,
  setProjectData,
  showToast,
  storageKey = 'course_factory_v2_data',
} = {}) {
  const [isAutoLoaded, setIsAutoLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Ã°Å¸â€™Â¾ AUTO-LOAD: Runs once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Safety check: ensure it has the correct structure
        if (parsed && parsed['Current Course']) {
          setProjectData(parsed);
          showToast('Project restored from storage', 'success');
        }
      }
      setIsAutoLoaded(true); // Allow saving to start
    } catch (error) {
      showToast('Failed to load project data. Starting fresh.', 'error');
      console.error('Ã¢ÂÅ’ Load failed:', error);
      setIsAutoLoaded(true);
    }
  }, []);

  // Ã°Å¸â€™Â¾ AUTO-SAVE: Runs when projectData changes
  useEffect(() => {
    if (!isAutoLoaded) return; // Safety Lock: Don't save empty defaults

    const timer = setTimeout(() => {
      try {
        const dataSize = JSON.stringify(projectData).length;
        const sizeMB = (dataSize / 1024 / 1024).toFixed(2);

        // Warn if approaching storage limit (4MB warning threshold)
        if (dataSize > 4 * 1024 * 1024) {
          showToast(`Warning: Project is ${sizeMB}MB. Approaching storage limit.`, 'warning', 6000);
        }

        localStorage.setItem(storageKey, JSON.stringify(projectData));
        setLastSaved(new Date());
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          showToast('Storage full! Project too large. Please export backup immediately.', 'error', 10000);
        } else {
          showToast('Failed to save project. Check console for details.', 'error');
        }
        console.error('Ã¢ÂÅ’ Save failed:', error);
      }
    }, 1000); // 1-second debounce

    return () => clearTimeout(timer);
  }, [projectData, isAutoLoaded, showToast, storageKey]);

  return { isAutoLoaded, lastSaved };
}

