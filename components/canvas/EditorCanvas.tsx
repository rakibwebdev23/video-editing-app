'use client';
import { useRef, useState, useCallback, MouseEvent } from 'react';
import { useAppSelector } from '../../store/editorStore';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/layouts';
import CanvasFrame from './CanvasFrame';
import CanvasElementComponent from './CanvasElement';

export default function EditorCanvas() {
  const canvasZoom = useAppSelector(s => s.ui.canvasZoom);
  const allElements = useAppSelector(s => s.elements.elements);
  const selectedIds = useAppSelector(s => s.selection.selectedElementIds);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panStart = useRef<{ mouseX: number; mouseY: number; offsetX: number; offsetY: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const handleMiddleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = {
        mouseX: e.clientX, mouseY: e.clientY,
        offsetX: panOffset.x, offsetY: panOffset.y,
      };
    }
  }, [panOffset]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning || !panStart.current) return;
    setPanOffset({
      x: panStart.current.offsetX + (e.clientX - panStart.current.mouseX),
      y: panStart.current.offsetY + (e.clientY - panStart.current.mouseY),
    });
  }, [isPanning]);

  const handleMouseUp = () => {
    setIsPanning(false);
    panStart.current = null;
  };

  const scaledW = CANVAS_WIDTH * canvasZoom;
  const scaledH = CANVAS_HEIGHT * canvasZoom;

  return (
    <div
      ref={viewportRef}
      className={`canvas-viewport ${isPanning ? 'panning' : ''}`}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        minHeight: 0, // Prevent flex expansion
        overflow: 'hidden',
        background: 'var(--bg-primary)',
        backgroundImage: `
          radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
      }}
      onMouseDown={handleMiddleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Zoom indicator */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 12,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        padding: '3px 8px',
        fontSize: 11,
        color: 'var(--text-muted)',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        {Math.round(canvasZoom * 100)}%
      </div>

      {/* Canvas container with zoom transform */}
      <div
        style={{
          position: 'relative',
          width: scaledW,
          height: scaledH,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          flexShrink: 0,
        }}
      >
        {/* Scale the frame */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `scale(${canvasZoom})`,
            transformOrigin: 'top left',
          }}
        >
          <CanvasFrame />
          {/* Global elements (Background Audio) */}
          {allElements.filter(el => el.pageId === 'global').map(el => (
            <CanvasElementComponent
              key={el.id}
              element={el}
              isSelected={selectedIds.includes(el.id)}
              pageStartTime={0}
              onSelect={() => {}} // Selecting global audio from timeline is better
              onPositionChange={() => {}}
              onSizeChange={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}