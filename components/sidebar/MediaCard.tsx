import { Image as ImageIcon, FileVideo, Trash2 as TrashIcon } from 'lucide-react';
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

  const handleClick = () => {
    if (!pageId) return;

    // Smart Layout Detection: Find next available zone
    const elementsOnPage = allElements.filter(el => el.pageId === pageId);
    const usedZones = elementsOnPage.map(el => el.zone).filter(z => z !== null);
    
    // Find first zone that isn't taken (starting from 1)
    let nextZone = null;
    const layoutConfig = LAYOUTS.find(l => l.id === activePage?.layout);
    if (layoutConfig && layoutConfig.zones > 1) {
      for (let i = 1; i <= layoutConfig.zones; i++) {
        if (!usedZones.includes(i)) {
          nextZone = i;
          break;
        }
      }
    }

    // Add to canvas center or zone
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
      freePosition: nextZone === null, // If in a zone, don't use free position
      startTime: 0,
      duration: resource.duration || 10,
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
      onClick={handleClick}
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
      {/* 3-dot Delete Menu */}
      {showMenu && (
        <button
          onClick={handleDelete}
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            zIndex: 10,
            background: 'rgba(0,0,0,0.6)',
            border: 'none',
            borderRadius: 4,
            padding: 4,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Delete media"
        >
          <TrashIcon size={12} color="#ef4444" />
        </button>
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
                height: `${20 + Math.sin(i * 0.8) * 12}px`,
                background: 'var(--accent-blue)',
                borderRadius: 2,
                opacity: 0.8,
              }} />
            ))}
          </div>
        </div>
      ) : resource.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resource.thumbnail}
          alt={resource.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          loading="lazy"
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-tertiary)',
        }}>
          {isVideo ? <FileVideo size={28} color="var(--text-muted)" /> : <ImageIcon size={28} color="var(--text-muted)" />}
        </div>
      )}

      {/* Type badge */}
      {isVideo && (
        <div style={{
          position: 'absolute', top: 4, right: 4,
          background: 'rgba(0,0,0,0.7)', borderRadius: 3,
          padding: '1px 4px',
        }}>
          <FileVideo size={10} color="white" />
        </div>
      )}

      {/* Label */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        padding: '12px 4px 4px',
      }}>
        <p style={{
          fontSize: 9, color: 'white', whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
          textAlign: 'center',
        }}>
          {resource.name}
        </p>
      </div>
    </div>
  );
}
