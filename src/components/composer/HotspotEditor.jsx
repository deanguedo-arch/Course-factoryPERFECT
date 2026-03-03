import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';

function clampPercent(value) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, parsed));
}

function formatPercent(value) {
  return clampPercent(value).toFixed(1);
}

function buildDefaultHotspot(index) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const label = index < alphabet.length ? `Point ${alphabet[index]}` : `Point ${index + 1}`;
  return {
    label,
    x: 50,
    y: 50,
    content: 'Explain this area.',
  };
}

function normalizeHotspots(rawHotspots) {
  if (!Array.isArray(rawHotspots)) return [];
  return rawHotspots.map((spot, idx) => ({
    label: typeof spot?.label === 'string' ? spot.label : `Hotspot ${idx + 1}`,
    x: clampPercent(spot?.x),
    y: clampPercent(spot?.y),
    content: typeof spot?.content === 'string' ? spot.content : '',
  }));
}

function toRoundedPercent(value) {
  return Number(clampPercent(value).toFixed(2));
}

export default function HotspotEditor({ data, onChange }) {
  const normalizedHotspots = React.useMemo(() => normalizeHotspots(data?.hotspots), [data?.hotspots]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [draggingIndex, setDraggingIndex] = React.useState(null);
  const previewRef = React.useRef(null);
  const hotspotsRef = React.useRef(normalizedHotspots);
  const dragIndexRef = React.useRef(null);

  React.useEffect(() => {
    hotspotsRef.current = normalizedHotspots;
  }, [normalizedHotspots]);

  React.useEffect(() => {
    if (normalizedHotspots.length === 0) {
      if (selectedIndex !== 0) setSelectedIndex(0);
      return;
    }
    if (selectedIndex > normalizedHotspots.length - 1) {
      setSelectedIndex(normalizedHotspots.length - 1);
    }
  }, [normalizedHotspots.length, selectedIndex]);

  const updateHotspots = React.useCallback(
    (nextHotspots) => {
      onChange({ hotspots: nextHotspots });
    },
    [onChange],
  );

  const setHotspotField = React.useCallback(
    (index, key, value) => {
      const nextHotspots = hotspotsRef.current.map((spot, spotIndex) =>
        spotIndex === index
          ? {
              ...spot,
              [key]: key === 'x' || key === 'y' ? toRoundedPercent(value) : value,
            }
          : spot,
      );
      hotspotsRef.current = nextHotspots;
      updateHotspots(nextHotspots);
    },
    [updateHotspots],
  );

  const setHotspotPosition = React.useCallback(
    (index, nextX, nextY) => {
      const nextHotspots = hotspotsRef.current.map((spot, spotIndex) =>
        spotIndex === index
          ? {
              ...spot,
              x: toRoundedPercent(nextX),
              y: toRoundedPercent(nextY),
            }
          : spot,
      );
      hotspotsRef.current = nextHotspots;
      updateHotspots(nextHotspots);
    },
    [updateHotspots],
  );

  const removeHotspot = React.useCallback(
    (index) => {
      const nextHotspots = hotspotsRef.current.filter((_, spotIndex) => spotIndex !== index);
      hotspotsRef.current = nextHotspots;
      updateHotspots(nextHotspots);
      setSelectedIndex((current) => {
        if (nextHotspots.length === 0) return 0;
        if (current > nextHotspots.length - 1) return nextHotspots.length - 1;
        return current;
      });
      if (dragIndexRef.current === index) {
        dragIndexRef.current = null;
        setDraggingIndex(null);
      }
    },
    [updateHotspots],
  );

  const addHotspot = React.useCallback(() => {
    const nextHotspots = [...hotspotsRef.current, buildDefaultHotspot(hotspotsRef.current.length)];
    hotspotsRef.current = nextHotspots;
    updateHotspots(nextHotspots);
    setSelectedIndex(nextHotspots.length - 1);
  }, [updateHotspots]);

  const getPointerPercent = React.useCallback((event) => {
    const preview = previewRef.current;
    if (!preview) return null;
    const rect = preview.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    return { x: toRoundedPercent(x), y: toRoundedPercent(y) };
  }, []);

  const applyDraggedPosition = React.useCallback(
    (event) => {
      const index = dragIndexRef.current;
      if (!Number.isInteger(index)) return;
      const point = getPointerPercent(event);
      if (!point) return;
      setHotspotPosition(index, point.x, point.y);
    },
    [getPointerPercent, setHotspotPosition],
  );

  React.useEffect(() => {
    if (draggingIndex == null) return undefined;
    const handlePointerMove = (event) => {
      applyDraggedPosition(event);
    };
    const handlePointerUp = () => {
      dragIndexRef.current = null;
      setDraggingIndex(null);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [applyDraggedPosition, draggingIndex]);

  const startDragging = (event, index) => {
    event.preventDefault();
    event.stopPropagation();
    dragIndexRef.current = index;
    setDraggingIndex(index);
    setSelectedIndex(index);
    applyDraggedPosition(event);
  };

  const hasImage = Boolean(String(data?.url || '').trim());
  const hotspots = normalizedHotspots;

  return (
    <div className="space-y-4">
      <label className="space-y-2 block">
        <span className="cf-meta-label">Block Title</span>
        <input
          type="text"
          value={data?.title || ''}
          onChange={(event) => onChange({ title: event.target.value })}
          className="cf-input-shell px-3 py-2 text-sm"
        />
      </label>
      <label className="space-y-2 block">
        <span className="cf-meta-label">Image URL</span>
        <input
          type="text"
          value={data?.url || ''}
          onChange={(event) => onChange({ url: event.target.value })}
          className="cf-input-shell px-3 py-2 text-sm"
          placeholder="https://... or /materials/image.jpg"
        />
      </label>
      <label className="space-y-2 block">
        <span className="cf-meta-label">Alt Text</span>
        <input
          type="text"
          value={data?.alt || ''}
          onChange={(event) => onChange({ alt: event.target.value })}
          className="cf-input-shell px-3 py-2 text-sm"
        />
      </label>

      <div className="cf-panel-muted p-3">
        <div ref={previewRef} className="cf-hotspot-stage">
          {hasImage ? (
            <img
              src={data.url}
              alt={data?.alt || 'Hotspot preview'}
              className="block h-auto w-full"
              loading="lazy"
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
            />
          ) : (
            <div className="cf-hotspot-empty absolute inset-0 flex items-center justify-center p-4 text-center text-xs">
              Paste an image URL to preview and drag hotspot markers.
            </div>
          )}
          {hasImage
            ? hotspots.map((spot, idx) => {
                const isSelected = idx === selectedIndex;
                const isDragging = idx === draggingIndex;
                return (
                  <button
                    key={`hotspot-preview-marker-${idx}`}
                    type="button"
                    data-hotspot-editor-marker
                    onPointerDown={(event) => startDragging(event, idx)}
                    onClick={() => setSelectedIndex(idx)}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className={`cf-hotspot-marker -translate-x-1/2 -translate-y-1/2 text-[11px] font-black touch-none ${
                      isSelected || isDragging ? 'is-active cursor-grabbing' : 'cursor-grab'
                    }`}
                    title={spot.label || `Hotspot ${idx + 1}`}
                    aria-label={spot.label || `Hotspot ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })
            : null}
        </div>
        <p className="cf-meta-copy mt-2">Drag hotspot dots directly on the image to position them.</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="cf-meta-label">Hotspots</p>
          <button
            type="button"
            onClick={addHotspot}
            className="cf-btn cf-btn-secondary px-3 py-2 text-xs font-bold"
          >
            <Plus size={12} /> Add Hotspot
          </button>
        </div>
        {hotspots.length === 0 ? <p className="cf-meta-copy">No hotspots yet.</p> : null}
        {hotspots.map((spot, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <div
              key={`hotspot-editor-item-${idx}`}
              className={`cf-panel-muted cf-hotspot-item p-3 ${isSelected ? 'is-active' : ''}`}
            >
              <div className="grid grid-cols-12 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`col-span-1 h-8 w-8 rounded-full p-0 text-[11px] font-black ${
                    isSelected ? 'cf-btn cf-btn-primary' : 'cf-btn cf-btn-secondary'
                  }`}
                  title="Select hotspot"
                >
                  {idx + 1}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className="col-span-7 truncate text-left text-xs font-bold"
                  style={{ color: 'var(--cf-text-primary)' }}
                  title={spot.label || `Hotspot ${idx + 1}`}
                >
                  {spot.label || `Hotspot ${idx + 1}`}
                </button>
                <p className="cf-hotspot-coordinate col-span-3 text-right font-mono text-[11px]">
                  {formatPercent(spot.x)}%, {formatPercent(spot.y)}%
                </p>
                <button
                  type="button"
                  onClick={() => removeHotspot(idx)}
                  className="cf-btn cf-btn-danger col-span-1 h-8 px-0 text-xs"
                  title="Remove hotspot"
                >
                  <Trash2 size={12} className="mx-auto" />
                </button>
              </div>
              {isSelected ? (
                <div className="mt-3 space-y-3">
                  <label className="block space-y-2">
                    <span className="cf-meta-label">Label</span>
                    <input
                      type="text"
                      value={spot.label || ''}
                      onChange={(event) => setHotspotField(idx, 'label', event.target.value)}
                      className="cf-input-shell px-3 py-2 text-xs"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="cf-meta-label">Content</span>
                    <textarea
                      value={spot.content || ''}
                      onChange={(event) => setHotspotField(idx, 'content', event.target.value)}
                      className="cf-input-shell h-24 px-3 py-2 text-xs"
                    />
                  </label>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
