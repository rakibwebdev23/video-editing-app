/* eslint-disable @typescript-eslint/no-explicit-any */
import { Image as ImageIcon, FileVideo, Trash2 as TrashIcon } from 'lucide-react';
import { MediaResource } from '../../types/editor.types';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { addElement } from '../../store/slices/elementsSlice';
import { addElementToPage, addPage, updatePageDuration, setActivePage } from '../../store/slices/pagesSlice';
import { removeResource } from '../../store/slices/uiSlice';
import { selectElement } from '../../store/slices/selectionSlice';
import { CANVAS_WIDTH, CANVAS_HEIGHT, LAYOUTS } from '../../constants/layouts';
import { useState } from 'react';

interface MediaCardProps {
  resource: MediaResource;
  pageId: string;
  index: number;
}

export default function MediaCard({ resource, pageId: activePageId }: MediaCardProps) {
  const dispatch = useAppDispatch();
  const allElements = useAppSelector(s => s.elements.elements);
  const { pages } = useAppSelector(s => s.pages);
  const [hover, setHover] = useState(false);

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

    const isAudio = resource.type === 'audio';
    const duration = resource.type === 'video' ? (resource.duration || 5) : (resource.type === 'audio' ? (resource.duration || 10) : 5);
    
    // Get all non-audio elements on the active page to check for empty zones
    const elementsOnActivePage = allElements.filter(el => el.pageId === activePageId && el.type !== 'audio');
    const currentPage = pages.find(p => p.id === activePageId);
    const layoutConfig = currentPage ? LAYOUTS.find(l => l.id === currentPage.layout) : null;
    const maxZones = layoutConfig?.zones || 1;

    let targetPageId = activePageId;
    let targetZone = 0;

    if (!isAudio) {
      if (elementsOnActivePage.length >= maxZones) {
        // Current page is FULL, move to a new page
        const newPageId = `page-${Date.now()}`;
        dispatch(addPage({ id: newPageId, duration }));
        targetPageId = newPageId;
        dispatch(setActivePage(targetPageId));
        targetZone = 0;
      } else {
        // Current page has ROOM, find next available zone
        const usedZones = elementsOnActivePage.map(el => el.zone).filter(z => z !== null) as number[];
        for (let i = 0; i < maxZones; i++) {
          if (!usedZones.includes(i)) {
            targetZone = i;
            break;
          }
        }
        
        // Update page duration: if first element, match exactly. Otherwise, take max.
        const newPageDuration = elementsOnActivePage.length === 0 ? duration : Math.max(currentPage?.duration || 0, duration);
        dispatch(updatePageDuration({ pageId: activePageId, duration: newPageDuration }));
        targetPageId = activePageId;
      }
    } else {
      targetPageId = 'global';
    }

    const elementId = `el-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const elWidth = 400;
    const elHeight = 300;

    const newEl = {
      id: elementId,
      pageId: targetPageId,
      resourceId: resource.id,
      type: (resource.type === 'audio' ? 'audio' : resource.type === 'video' ? 'video' : 'image') as any,
      url: resource.url,
      name: resource.name,
      thumbnail: resource.thumbnail,
      zone: targetZone,
      x: (CANVAS_WIDTH - elWidth) / 2,
      y: (CANVAS_HEIGHT - elHeight) / 2,
      width: elWidth,
      height: elHeight,
      fillMode: 'fill' as const,
      opacity: 1,
      rotation: 0,
      freePosition: false,
      startTime: 0,
      duration: duration,
      animations: [],
      zIndex: elementsOnActivePage.length + 1,
    };

    dispatch(addElement(newEl));
    dispatch(addElementToPage({ pageId: targetPageId, elementId }));
    dispatch(selectElement(elementId));
  };

  const isAudio = resource.type === 'audio';
  const isVideo = resource.type === 'video';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleAdd}
      title={resource.name}
      style={{
        width: '100%',
        aspectRatio: '1',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        border: `1px solid ${hover ? 'var(--accent-blue)' : 'var(--border-color)'}`,
        transition: 'all 0.2s ease',
        transform: hover ? 'scale(1.02)' : 'none',
        boxShadow: hover ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
      }}
    >
      {/* Action Overlay */}
      {hover && (
        <div style={{
          position: 'absolute', top: 4, right: 4, zIndex: 10,
          display: 'flex', gap: 4,
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(e); }}
            style={{
              background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 4,
              padding: 4, color: 'white', display: 'flex', cursor: 'pointer'
            }}
            title="Delete media"
          >
            <TrashIcon size={12} color="#ef4444" />
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
