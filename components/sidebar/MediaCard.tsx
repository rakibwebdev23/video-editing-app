import { Image as ImageIcon, FileVideo, Trash2 as TrashIcon, Plus } from 'lucide-react';
import { MediaResource } from '../../types/editor.types';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { addElement } from '../../store/slices/elementsSlice';
import { addElementToPage } from '../../store/slices/pagesSlice';
import { removeResource } from '../../store/slices/uiSlice';
import { CANVAS_WIDTH, CANVAS_HEIGHT, LAYOUTS } from '../../constants/layouts';
import { useState } from 'react';

interface MediaCardProps {
  resource: MediaResource;
  pageId: string;
  index: number;
}

export default function MediaCard({ resource, pageId }: MediaCardProps) {
  const dispatch = useAppDispatch();
  const activePage = useAppSelector(s => s.pages.pages.find(p => p.id === pageId));
  const allElements = useAppSelector(s => s.elements.elements);
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${resource.name}"? This cannot be undone.`)) {
      dispatch(removeResource(resource.id));
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('resourceId', resource.id);
    e.dataTransfer.setData('resourceType', resource.type);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!pageId) return;

    // Smart Layout Detection: Find next available zone (0-indexed)
    const elementsOnPage = allElements.filter(el => el.pageId === pageId);
    const usedZones = elementsOnPage.map(el => el.zone).filter(z => z !== null) as number[];

    let nextZone: number | null = null;
    const layoutConfig = LAYOUTS.find(l => l.id === activePage?.layout);
    
    if (layoutConfig) {
      for (let i = 0; i < layoutConfig.zones; i++) {
        if (!usedZones.includes(i)) {
          nextZone = i;
          break;
        }
      }
    }

    const elementId = `el-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const elWidth = 400;
    const elHeight = 300;

    dispatch(addElement({
      id: elementId,
      pageId,
      resourceId: resource.id,
      type: resource.type === 'audio' ? 'audio' : resource.type === 'video' ? 'video' : 'image',
      url: resource.url,
      name: resource.name,
      thumbnail: resource.thumbnail,
      zone: nextZone,
      x: (CANVAS_WIDTH - elWidth) / 2,
      y: (CANVAS_HEIGHT - elHeight) / 2,
      width: elWidth,
      height: elHeight,
      fillMode: 'fill',
      opacity: 1,
      rotation: 0,
      freePosition: nextZone === null, 
      startTime: 0,
      duration: Math.min(resource.duration || 5, 5), 
      animations: [],
      zIndex: elementsOnPage.length + 1,
    }));
    dispatch(addElementToPage({ pageId, elementId }));
  };

  const isAudio = resource.type === 'audio';
  const isVideo = resource.type === 'video';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      title={resource.name}
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        cursor: 'pointer',
        aspectRatio: '1',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        transition: 'all 0.2s ease',
      }}
      className="media-card"
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent-blue)';
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
        setShowMenu(true);
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color)';
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
        setShowMenu(false);
      }}
    >
      {/* Action Buttons Overlay */}
      {showMenu && (
        <div style={{
          position: 'absolute', top: 4, left: 4, right: 4,
          display: 'flex', justifyContent: 'space-between', zIndex: 10,
        }}>
          <button
            onClick={handleDelete}
            style={{
              background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 4,
              padding: 4, color: 'white', display: 'flex', cursor: 'pointer'
            }}
            title="Delete media"
          >
            <TrashIcon size={12} color="#ef4444" />
          </button>

          <button
            onClick={handleAdd}
            style={{
              background: 'var(--accent-blue)', border: 'none', borderRadius: 4,
              padding: '4px 8px', color: 'white', display: 'flex', alignItems: 'center',
              gap: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
            title="Add to Canvas"
          >
            <Plus size={12} /> ADD
          </button>
        </div>
      )}

      {isAudio ? (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-tertiary)',
          gap: 4,
        }}>
          {/* Audio waveform visualization */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 36 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{
                width: 3,
                height: `${12 + Math.sin(i * 0.8) * 12}px`,
                background: 'var(--accent-blue)',
                borderRadius: 2,
                opacity: 0.8,
              }} />
            ))}
          </div>
        </div>
      ) : (resource.thumbnail && resource.thumbnail !== '') ? (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resource.thumbnail}
            alt={resource.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
          {isVideo && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.2)',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}>
                <div style={{
                  width: 0, height: 0,
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  borderLeft: '8px solid black',
                  marginLeft: 2,
                }} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #2a3347, #1e2535)',
          gap: 6,
        }}>
          {isVideo ? (
            <>
              <FileVideo size={32} color="rgba(255,255,255,0.4)" />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.05em' }}>VIDEO</span>
            </>
          ) : (
            <>
              <ImageIcon size={32} color="rgba(255,255,255,0.4)" />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.05em' }}>IMAGE</span>
            </>
          )}
        </div>
      )}

      {/* Label Overlay */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        padding: '6px 4px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        <p style={{
          fontSize: 10, color: 'white', whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
          textAlign: 'center', fontWeight: 500
        }}>
          {resource.name}
        </p>
      </div>
    </div>
  );
}
