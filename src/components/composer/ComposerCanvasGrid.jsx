import * as React from 'react';
import ReactGridLayout, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const GridLayout = WidthProvider(ReactGridLayout);

export default function ComposerCanvasGrid({
  allowOverlap = false,
  children,
  cols = 1,
  containerPadding = [12, 12],
  layoutItems = [],
  margin = [12, 12],
  onBeginInteraction,
  onFinishInteraction,
  onLiveResizeLayoutChange,
  rowHeight = 24,
  wrapperStyle = null,
}) {
  const grid = (
    <GridLayout
      className="layout"
      layout={Array.isArray(layoutItems) ? layoutItems : []}
      cols={cols}
      rowHeight={rowHeight}
      margin={Array.isArray(margin) ? margin : [12, 12]}
      containerPadding={Array.isArray(containerPadding) ? containerPadding : [12, 12]}
      autoSize
      isResizable
      isDraggable
      compactType={null}
      verticalCompact={false}
      allowOverlap={allowOverlap}
      preventCollision={false}
      draggableHandle=".cf-canvas-handle"
      onDragStart={(_layout, _oldItem, newItem) => onBeginInteraction?.('drag', newItem)}
      onResizeStart={(_layout, _oldItem, newItem) => onBeginInteraction?.('resize', newItem)}
      onDragStop={(nextLayoutItems) => onFinishInteraction?.(nextLayoutItems)}
      onResizeStop={(nextLayoutItems) => onFinishInteraction?.(nextLayoutItems)}
      onLayoutChange={(nextLayoutItems) => onLiveResizeLayoutChange?.(nextLayoutItems)}
    >
      {children}
    </GridLayout>
  );

  if (!wrapperStyle) return grid;
  return <div style={wrapperStyle}>{grid}</div>;
}
