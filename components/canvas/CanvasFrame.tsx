'use client';
import { useRef, useCallback, MouseEvent, DragEvent, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { selectElement, clearSelection, multiSelectElement } from '../../store/slices/selectionSlice';
import { updateElementPosition, updateElementSize, addElement } from '../../store/slices/elementsSlice';
import { addElementToPage } from '../../store/slices/pagesSlice';
import { snapToGrid } from '../../utils/snapGrid';
import { CANVAS_WIDTH, CANVAS_HEIGHT, LAYOUTS } from '../../constants/layouts';
import { CanvasElement as CanvasElementType } from '../../types/element.types';
import { playTransitionAnimation } from '../../animations/gsapAnimations';
import LayoutRenderer, { getZones } from './layouts/LayoutRenderer';
import CanvasElementComponent from './CanvasElement';

export default function CanvasFrame() {
  const dispatch = useAppDispatch();
  const { pages, activePageId } = useAppSelector(s => s.pages);
  const activePage = pages.find(p => p.id === activePageId);
  const allElements = useAppSelector(s => s.elements.elements);
  const selectedIds = useAppSelector(s => s.selection.selectedElementIds);
  const { isPlaying, currentTime } = useAppSelector(s => s.timeline);
  const resources = useAppSelector(s => s.ui.resources);
  const frameRef = useRef<HTMLDivElement>(null);

  // Trigger transition when page changes
  const lastPageId = useRef(activePageId);
  useEffect(() => {
    if (activePageId !== lastPageId.current) {
      if (frameRef.current && activePage?.transition) {
        playTransitionAnimation(
          frameRef.current,
          activePage.transition.name,
          activePage.transition.duration
        );
      }
      lastPageId.current = activePageId;
    }
  }, [activePageId, activePage]);

  // Get active page elements
  const allPageElements = allElements.filter(el => el.pageId === activePage?.id);
  
  // Calculate page start time to get relative current time
  let pageStartTime = 0;
  if (activePageId) {
    for (const p of pages) {
      if (p.id === activePageId) break;
      pageStartTime += p.duration;
    }
  }
  const relativeTime = currentTime - pageStartTime;

  // Filter elements to only show those active at the current relative time
  const pageElements = allPageElements.filter(el => {
    if (el.type === 'audio') return false;
    // Using a tiny epsilon (0.001) to handle floating point issues at boundaries
    const isVisible = relativeTime >= (el.startTime - 0.001) && relativeTime < (el.startTime + el.duration - 0.001);
    return isVisible;
  });

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

    // Smart zone detection for background drops
    let targetZone = zone !== undefined ? zone : null;
    const layoutConfig = activePage.layout ? LAYOUTS.find(l => l.id === activePage.layout) : null;

    if (targetZone === null && layoutConfig) {
      const usedZones = pageElements.map(el => el.zone).filter(z => z !== null) as number[];
      for (let i = 0; i < layoutConfig.zones; i++) {
        if (!usedZones.includes(i)) {
          targetZone = i;
          break;
        }
      }
    }

    if (shapeType) {
      // ... (shape logic remains, but using targetZone)
      const SHAPE_DEFAULTS: Record<string, { width: number; height: number; content: string; backgroundColor: string; color: string; fontSize: number }> = {
        text: { width: 300, height: 60, content: 'Title Goes There', backgroundColor: 'transparent', color: '#1a1a1a', fontSize: 24 },
        qr: { width: 200, height: 200, content: 'https://example.com', backgroundColor: 'white', color: '#000000', fontSize: 14 },
        slider: { width: 300, height: 40, content: '50', backgroundColor: 'transparent', color: '#3b82f6', fontSize: 14 },
        rectangle: { width: 300, height: 200, content: '', backgroundColor: '#e0e7ff', color: '#3b82f6', fontSize: 14 },
        ellipse: { width: 200, height: 200, content: '', backgroundColor: '#fde8e8', color: '#ef4444', fontSize: 14 },
        triangle: { width: 200, height: 200, content: '', backgroundColor: 'transparent', color: '#10b981', fontSize: 14 },
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
        zone: targetZone, x, y,
        width: defaults.width, height: defaults.height,
        fillMode: 'fill', opacity: 1, rotation: 0,
        freePosition: targetZone === null,
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
      zone: targetZone,
      x,
      y,
      width: elWidth,
      height: elHeight,
      fillMode: 'fill',
      opacity: 1,
      rotation: 0,
      freePosition: targetZone === null,
      startTime: 0,
      duration: Math.min(resource.duration || 5, 5),
      animations: [],
      zIndex: pageElements.length + 1,
    };

    dispatch(addElement(newEl));
    dispatch(addElementToPage({ pageId: activePage.id, elementId }));
    dispatch(selectElement(elementId));
  }, [activePage, resources, pageElements, dispatch]);

  if (!activePage) return null;

  return (
    <div
      id="canvas-frame-container"
      ref={frameRef}
      style={{
        position: 'absolute',
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        top: 0,
        left: 0,
        background: 'black',
        overflow: 'hidden',
        userSelect: 'none',
      }}
      onClick={handleCanvasClick}
      onDragOver={e => e.preventDefault()}
      onDrop={e => handleDrop(e)}
    >
      {/* Page Background Color Layer */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: activePage.backgroundColor || 'transparent',
        pointerEvents: 'none',
      }} />

      {/* Layout zones (Dashed outlines) */}
      <LayoutRenderer
        layout={activePage.layout}
        canvasWidth={CANVAS_WIDTH}
        canvasHeight={CANVAS_HEIGHT}
        usedZones={pageElements.map(el => el.zone).filter(z => z !== null) as number[]}
        onDrop={(zone, e) => handleDrop(e, zone)}
      />

      {/* Canvas elements */}
      {(() => {
        const zones = getZones(activePage.layout, CANVAS_WIDTH, CANVAS_HEIGHT);

        return pageElements
          .sort((a, b) => a.zIndex - b.zIndex)
          .map(el => {
            const visualElement = { ...el };

            // If element is assigned to a zone, override its bounds
            if (el.zone !== null && zones[el.zone]) {
              const zone = zones[el.zone];
              visualElement.x = zone.x;
              visualElement.y = zone.y;
              visualElement.width = zone.width;
              visualElement.height = zone.height;
            }

            return (
              <CanvasElementComponent
                key={el.id}
                element={visualElement}
                isSelected={selectedIds.includes(el.id)}
                pageStartTime={pageStartTime}
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
            );
          });
      })()}

      {/* Empty state (only show when not playing and no elements) */}
      {!isPlaying && pageElements.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          {/* ... */}
          <p style={{ color: 'rgba(107,114,128,0.8)', fontSize: 13 }}>Drag media here to start</p>
        </div>
      )}
    </div>
  );
}
