'use client';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { addElement } from '../../store/slices/elementsSlice';
import { addElementToPage } from '../../store/slices/pagesSlice';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/layouts';
import { ShapeType } from '../../types/element.types';

interface ShapeDef {
  type: ShapeType;
  label: string;
  icon: React.ReactNode;
}

const SHAPES: ShapeDef[] = [
  {
    type: 'text',
    label: 'Text',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="6" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <text x="14" y="18" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="600">T</text>
      </svg>
    ),
  },
  {
    type: 'qr',
    label: 'QR',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="3" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <rect x="5" y="5" width="5" height="5" rx="0.5" fill="currentColor"/>
        <rect x="16" y="3" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <rect x="18" y="5" width="5" height="5" rx="0.5" fill="currentColor"/>
        <rect x="3" y="16" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <rect x="5" y="18" width="5" height="5" rx="0.5" fill="currentColor"/>
        <rect x="16" y="16" width="4" height="4" rx="0.5" fill="currentColor"/>
        <rect x="22" y="16" width="4" height="4" rx="0.5" fill="currentColor"/>
        <rect x="16" y="22" width="4" height="4" rx="0.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    type: 'slider',
    label: 'Slider',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="9" width="20" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <rect x="4" y="16" width="20" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="10" cy="10.5" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="18" cy="17.5" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
  },
  {
    type: 'rectangle',
    label: 'Rectangle',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="8" width="20" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
  },
  {
    type: 'ellipse',
    label: 'Ellipsis',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <ellipse cx="14" cy="14" rx="10" ry="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
  },
  {
    type: 'triangle',
    label: 'Triangle',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <polygon points="14,4 26,24 2,24" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
  },
];

const SHAPE_DEFAULTS: Record<ShapeType, { width: number; height: number; content: string; backgroundColor: string; color: string; fontSize: number }> = {
  text:      { width: 300, height: 60,  content: 'Title Goes There', backgroundColor: 'transparent', color: '#1a1a1a', fontSize: 24 },
  qr:        { width: 200, height: 200, content: 'https://example.com', backgroundColor: 'white', color: '#000000', fontSize: 14 },
  slider:    { width: 300, height: 40,  content: '50', backgroundColor: 'transparent', color: '#3b82f6', fontSize: 14 },
  rectangle: { width: 300, height: 200, content: '', backgroundColor: '#e0e7ff', color: '#3b82f6', fontSize: 14 },
  ellipse:   { width: 200, height: 200, content: '', backgroundColor: '#fde8e8', color: '#ef4444', fontSize: 14 },
  triangle:  { width: 200, height: 200, content: '', backgroundColor: 'transparent', color: '#10b981', fontSize: 14 },
};

export default function ElementsPanel() {
  const dispatch = useAppDispatch();
  const activePageId = useAppSelector(s => s.pages.activePageId);

  const handleAddShape = (shape: ShapeDef) => {
    const elementId = `el-${crypto.randomUUID()}`;
    const defaults = SHAPE_DEFAULTS[shape.type];
    dispatch(addElement({
      id: elementId,
      pageId: activePageId,
      resourceId: `shape-${shape.type}`,
      type: 'shape',
      shapeType: shape.type,
      url: '',
      name: shape.label,
      thumbnail: undefined,
      content: defaults.content,
      zone: null,
      x: (CANVAS_WIDTH - defaults.width) / 2,
      y: (CANVAS_HEIGHT - defaults.height) / 2,
      width: defaults.width,
      height: defaults.height,
      fillMode: 'fill',
      opacity: 1,
      rotation: 0,
      freePosition: true,
      backgroundColor: defaults.backgroundColor,
      color: defaults.color,
      fontSize: defaults.fontSize,
      startTime: 0,
      duration: 10,
      animations: [
        { id: `anim-${crypto.randomUUID()}`, name: 'fadeIn', category: 'enter', duration: 0.6 }
      ],
      zIndex: 10,
    }));
    dispatch(addElementToPage({ pageId: activePageId, elementId }));
  };

  const handleDragStart = (e: React.DragEvent, shape: ShapeDef) => {
    e.dataTransfer.setData('shapeType', shape.type);
    e.dataTransfer.setData('shapeLabel', shape.label);
  };

  return (
    <div style={{ width: 200, background: 'var(--bg-panel)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 12px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Elements</h2>
      </div>

      {/* Grid */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 12,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8,
        alignContent: 'start',
      }}>
        {SHAPES.map(shape => (
          <div
            key={shape.type}
            draggable
            onDragStart={e => handleDragStart(e, shape)}
            onClick={() => handleAddShape(shape)}
            title={`Add ${shape.label}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '10px 4px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 0.15s',
              userSelect: 'none',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent-blue)';
              (e.currentTarget as HTMLDivElement).style.color = 'var(--accent-blue)';
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(59,130,246,0.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color)';
              (e.currentTarget as HTMLDivElement).style.color = 'var(--text-secondary)';
              (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card)';
            }}
          >
            {shape.icon}
            <span style={{ fontSize: 10, fontWeight: 500, textAlign: 'center' }}>{shape.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
