'use client';
import { useRef, useCallback, MouseEvent, DragEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { selectElement, clearSelection, multiSelectElement } from '../../store/slices/selectionSlice';
import { updateElementPosition, updateElementSize, addElement } from '../../store/slices/elementsSlice';
import { addElementToPage } from '../../store/slices/pagesSlice';
import { snapToGrid } from '../../utils/snapGrid';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/layouts';
import { CanvasElement as CanvasElementType } from '../../types/element.types';
import LayoutRenderer from './layouts/LayoutRenderer';
import CanvasElementComponent from './CanvasElement';

export default function CanvasFrame() {
  const dispatch = useAppDispatch();
  const activePage = useAppSelector(s => s.pages.pages.find(p => p.id === s.pages.activePageId));
  const allElements = useAppSelector(s => s.elements.elements);
  const selectedIds = useAppSelector(s => s.selection.selectedElementIds);
  const resources = useAppSelector(s => s.ui.resources);
  const frameRef = useRef<HTMLDivElement>(null);

  const pageElements = allElements.filter(el => el.pageId === activePage?.id);

  const handleCanvasClick = (e: MouseEvent) => {
    if (e.target === frameRef.current) {
      dispatch(clearSelection());
    }
  };

  const handleDrop = useCallback((e: DragEvent, zone?: number) => {
    e.preventDefault();
    const resourceId = e.dataTransfer.getData('resourceId');
    const shapeType = e.dataTransfer.getData('shapeType');
    const shapeLabel = e.dataTransfer.getData('shapeLabel');

    if (!activePage) return;

    const rect = frameRef.current!.getBoundingClientRect();
    const elementId = `el-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    if (shapeType) {
      // Shape element dropped from ElementsPanel
      const SHAPE_DEFAULTS: Record<string, { width: number; height: number; content: string; backgroundColor: string; color: string; fontSize: number }> = {
        text:      { width: 300, height: 60,  content: 'Title Goes There', backgroundColor: 'transparent', color: '#1a1a1a', fontSize: 24 },
        qr:        { width: 200, height: 200, content: 'https://example.com', backgroundColor: 'white', color: '#000000', fontSize: 14 },
        slider:    { width: 300, height: 40,  content: '50', backgroundColor: 'transparent', color: '#3b82f6', fontSize: 14 },
        rectangle: { width: 300, height: 200, content: '', backgroundColor: '#e0e7ff', color: '#3b82f6', fontSize: 14 },
        ellipse:   { width: 200, height: 200, content: '', backgroundColor: '#fde8e8', color: '#ef4444', fontSize: 14 },
        triangle:  { width: 200, height: 200, content: '', backgroundColor: 'transparent', color: '#10b981', fontSize: 14 },
      };
      const defaults = SHAPE_DEFAULTS[shapeType] || SHAPE_DEFAULTS.rectangle;
      const rawX = (e.clientX - rect.left);
      const rawY = (e.clientY - rect.top);
      const x = snapToGrid(Math.max(0, Math.min(CANVAS_WIDTH - defaults.width, rawX - defaults.width / 2)));
      const y = snapToGrid(Math.max(0, Math.min(CANVAS_HEIGHT - defaults.height, rawY - defaults.height / 2)));

      dispatch(addElement({
        id: elementId, pageId: activePage.id,
        resourceId: `shape-${shapeType}`,
        type: 'shape', shapeType: shapeType as import('../../types/element.types').ShapeType,
        url: '', name: shapeLabel || shapeType,
        content: defaults.content,
        zone: zone ?? null, x, y,
        width: defaults.width, height: defaults.height,
        fillMode: 'fill', opacity: 1, rotation: 0,
        freePosition: true,
        backgroundColor: defaults.backgroundColor,
        color: defaults.color, fontSize: defaults.fontSize,
        startTime: 0, duration: 10, animations: [],
        zIndex: pageElements.length + 1,
      }));
      dispatch(addElementToPage({ pageId: activePage.id, elementId }));
      dispatch(selectElement(elementId));
      return;
    }

    if (!resourceId) return;
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    const rawX = (e.clientX - rect.left) / (CANVAS_WIDTH * 1);
    const rawY = (e.clientY - rect.top) / (CANVAS_HEIGHT * 1);

    const elWidth = 400;
    const elHeight = 300;

    const x = snapToGrid(Math.max(0, Math.min(CANVAS_WIDTH - elWidth, rawX * CANVAS_WIDTH - elWidth / 2)));
    const y = snapToGrid(Math.max(0, Math.min(CANVAS_HEIGHT - elHeight, rawY * CANVAS_HEIGHT - elHeight / 2)));

    const newEl: CanvasElementType = {
      id: elementId,
      pageId: activePage.id,
      resourceId: resource.id,
      type: resource.type === 'audio' ? 'audio' : resource.type === 'video' ? 'video' : 'image',
      url: resource.url,
      name: resource.name,
      thumbnail: resource.thumbnail,
      zone: zone ?? null,
      x,
      y,
      width: elWidth,
      height: elHeight,
      fillMode: 'fill',
      opacity: 1,
      rotation: 0,
      freePosition: true,
      startTime: 0,
      duration: resource.duration || 10,
      animations: [],
      zIndex: pageElements.length + 1,
    };

    dispatch(addElement(newEl));
    dispatch(addElementToPage({ pageId: activePage.id, elementId }));
    dispatch(selectElement(elementId));
  }, [activePage, resources, pageElements.length, dispatch]);

  if (!activePage) return null;

  return (
    <div
      id="canvas-frame-container"
      ref={frameRef}
      style={{
        position: 'absolute',
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        background: activePage.backgroundColor,
        boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        userSelect: 'none',
      }}
      onClick={handleCanvasClick}
      onDragOver={e => e.preventDefault()}
      onDrop={e => handleDrop(e)}
    >
      {/* Layout zones */}
      <LayoutRenderer
        layout={activePage.layout}
        canvasWidth={CANVAS_WIDTH}
        canvasHeight={CANVAS_HEIGHT}
        onDrop={(zone, e) => handleDrop(e, zone)}
      />

      {/* Canvas elements */}
      {pageElements
        .sort((a, b) => a.zIndex - b.zIndex)
        .map(el => (
          <CanvasElementComponent
            key={el.id}
            element={el}
            isSelected={selectedIds.includes(el.id)}
            onSelect={(e) => {
              if (e.shiftKey) {
                dispatch(multiSelectElement(el.id));
              } else {
                dispatch(selectElement(el.id));
              }
            }}
            onPositionChange={(x, y) => dispatch(updateElementPosition({ id: el.id, x, y }))}
            onSizeChange={(w, h) => dispatch(updateElementSize({ id: el.id, width: w, height: h }))}
          />
        ))}

      {/* Empty state */}
      {pageElements.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(59,130,246,0.1)',
            border: '2px dashed rgba(59,130,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(59,130,246,0.6)" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <p style={{ color: 'rgba(107,114,128,0.8)', fontSize: 13 }}>Drag media here to start</p>
        </div>
      )}
    </div>
  );
}
