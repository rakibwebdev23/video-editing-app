'use client';
import { useRef, useEffect, MouseEvent, CSSProperties } from 'react';
import { CanvasElement } from '../../types/element.types';
import { snapToGrid } from '../../utils/snapGrid';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/layouts';
import { useAppSelector } from '../../store/editorStore';

interface Props {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (e: MouseEvent) => void;
  onPositionChange: (x: number, y: number) => void;
  onSizeChange: (w: number, h: number) => void;
}

function VideoElement({ element, objectFit }: { element: CanvasElement; objectFit: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { currentTime, isPlaying } = useAppSelector(s => s.timeline);
  
  // Calculate the relative time within the video, accounting for trimming offset
  const relativeTime = currentTime - element.startTime + (element.startTimeOffset || 0);
  const isVisible = currentTime >= element.startTime && currentTime <= (element.startTime + element.duration);

  useEffect(() => {
    if (!videoRef.current || !isVisible) return;
    
    // Sync time
    const videoTime = Math.max(0, relativeTime); 
    if (Math.abs(videoRef.current.currentTime - videoTime) > 0.1) {
      videoRef.current.currentTime = videoTime;
    }

    // Sync playback
    if (isPlaying && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    } else if (!isPlaying && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, [relativeTime, isPlaying, isVisible, element.duration]);

  if (!isVisible) return null;

  return (
    <video
      ref={videoRef}
      src={element.url}
      muted
      playsInline
      style={{
        width: '100%', height: '100%',
        objectFit: objectFit as CSSProperties['objectFit'],
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
}

function AudioElement({ element }: { element: CanvasElement }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentTime, isPlaying } = useAppSelector(s => s.timeline);
  
  const relativeTime = currentTime - element.startTime + (element.startTimeOffset || 0);
  const isVisible = currentTime >= element.startTime && currentTime <= (element.startTime + element.duration);

  useEffect(() => {
    if (!audioRef.current || !isVisible) return;
    
    // Sync time
    const audioTime = Math.max(0, relativeTime);
    if (Math.abs(audioRef.current.currentTime - audioTime) > 0.1) {
      audioRef.current.currentTime = audioTime;
    }

    // Sync playback
    if (isPlaying && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    } else if (!isPlaying && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, [relativeTime, isPlaying, isVisible, element.duration]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (element.volume ?? 100) / 100;
    }
  }, [element.volume]);

  if (!isVisible) return null;

  return (
    <audio ref={audioRef} src={element.url} />
  );
}

const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const;

function ShapeContent({ element }: { element: CanvasElement }) {
  const color = element.color || '#3b82f6';
  const bg = element.backgroundColor || 'transparent';
  const text = element.content || '';

  switch (element.shapeType) {
    case 'text':
      return (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '8px 12px',
        }}>
          <span style={{
            fontSize: element.fontSize || 24,
            fontWeight: 700,
            color: color,
            textAlign: 'center',
            wordBreak: 'break-word',
            lineHeight: 1.3,
          }}>{text || 'Title Goes There'}</span>
        </div>
      );
    case 'qr':
      return (
        <div style={{
          width: '100%', height: '100%',
          background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 8,
        }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ display: 'block' }}>
            <rect x="5" y="5" width="28" height="28" rx="2" fill="#000"/>
            <rect x="9" y="9" width="20" height="20" rx="1" fill="white"/>
            <rect x="12" y="12" width="14" height="14" rx="1" fill="#000"/>
            <rect x="67" y="5" width="28" height="28" rx="2" fill="#000"/>
            <rect x="71" y="9" width="20" height="20" rx="1" fill="white"/>
            <rect x="74" y="12" width="14" height="14" rx="1" fill="#000"/>
            <rect x="5" y="67" width="28" height="28" rx="2" fill="#000"/>
            <rect x="9" y="71" width="20" height="20" rx="1" fill="white"/>
            <rect x="12" y="74" width="14" height="14" rx="1" fill="#000"/>
            <rect x="40" y="40" width="4" height="4" fill="#000"/>
            <rect x="50" y="40" width="4" height="4" fill="#000"/>
            <rect x="44" y="44" width="4" height="4" fill="#000"/>
            <rect x="56" y="44" width="4" height="4" fill="#000"/>
            <rect x="40" y="50" width="4" height="4" fill="#000"/>
            <rect x="60" y="50" width="4" height="4" fill="#000"/>
            <rect x="48" y="54" width="4" height="4" fill="#000"/>
            <rect x="56" y="60" width="4" height="4" fill="#000"/>
            <rect x="40" y="64" width="4" height="4" fill="#000"/>
            <rect x="48" y="64" width="4" height="4" fill="#000"/>
            <rect x="60" y="56" width="4" height="4" fill="#000"/>
            <rect x="44" y="60" width="4" height="4" fill="#000"/>
          </svg>
        </div>
      );
    case 'rectangle':
      return (
        <div style={{
          width: '100%', height: '100%',
          background: bg,
          border: `2px solid ${color}`,
          borderRadius: 4,
          boxSizing: 'border-box',
        }}/>
      );
    case 'ellipse':
      return (
        <div style={{
          width: '100%', height: '100%',
          background: bg,
          border: `2px solid ${color}`,
          borderRadius: '50%',
          boxSizing: 'border-box',
        }}/>
      );
    case 'triangle':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <polygon points="50,5 95,95 5,95" fill={bg !== 'transparent' ? bg : 'none'} stroke={color} strokeWidth="3"/>
          </svg>
        </div>
      );
    case 'slider':
      return (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center',
          padding: '0 12px',
        }}>
          <div style={{ flex: 1, position: 'relative', height: 4, background: '#e5e7eb', borderRadius: 2 }}>
            <div style={{ width: `${parseInt(text || '50')}%`, height: '100%', background: color, borderRadius: 2 }}/>
            <div style={{
              position: 'absolute',
              top: '50%', left: `${parseInt(text || '50')}%`,
              transform: 'translate(-50%, -50%)',
              width: 16, height: 16,
              background: color,
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}/>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function CanvasElementComponent({
  element, isSelected, onSelect, onPositionChange, onSizeChange,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ mouseX: number; mouseY: number; elX: number; elY: number } | null>(null);
  const resizeStart = useRef<{
    handle: string; mouseX: number; mouseY: number;
    origX: number; origY: number; origW: number; origH: number;
  } | null>(null);

  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    onSelect(e);
    if (!element.freePosition) return;
    dragStart.current = {
      mouseX: e.clientX, mouseY: e.clientY,
      elX: element.x, elY: element.y,
    };
    e.preventDefault();
  };

  const handleResizeMouseDown = (e: MouseEvent, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    resizeStart.current = {
      handle, mouseX: e.clientX, mouseY: e.clientY,
      origX: element.x, origY: element.y,
      origW: element.width, origH: element.height,
    };
  };

  useEffect(() => {
    const onMouseMove = (e: globalThis.MouseEvent) => {
      if (dragStart.current) {
        const dx = e.clientX - dragStart.current.mouseX;
        const dy = e.clientY - dragStart.current.mouseY;
        const newX = snapToGrid(Math.max(0, Math.min(CANVAS_WIDTH - element.width, dragStart.current.elX + dx)));
        const newY = snapToGrid(Math.max(0, Math.min(CANVAS_HEIGHT - element.height, dragStart.current.elY + dy)));
        onPositionChange(newX, newY);
      }
      if (resizeStart.current) {
        const { handle, mouseX, mouseY, origX, origY, origW, origH } = resizeStart.current;
        const dx = e.clientX - mouseX;
        const dy = e.clientY - mouseY;
        let newX = origX, newY = origY, newW = origW, newH = origH;
        if (handle.includes('e')) newW = Math.max(80, snapToGrid(origW + dx));
        if (handle.includes('s')) newH = Math.max(60, snapToGrid(origH + dy));
        if (handle.includes('w')) { newW = Math.max(80, snapToGrid(origW - dx)); newX = origX + origW - newW; }
        if (handle.includes('n')) { newH = Math.max(60, snapToGrid(origH - dy)); newY = origY + origH - newH; }
        onPositionChange(newX, newY);
        onSizeChange(newW, newH);
      }
    };
    const onMouseUp = () => {
      dragStart.current = null;
      resizeStart.current = null;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [element.x, element.y, element.width, element.height, onPositionChange, onSizeChange]);

  const getHandleStyle = (handle: string): CSSProperties => {
    const base: CSSProperties = {
      position: 'absolute', width: 8, height: 8,
      background: 'white', border: '2px solid #3b82f6',
      borderRadius: '50%', zIndex: 10,
    };
    const pos: Record<string, CSSProperties> = {
      nw: { top: -4, left: -4, cursor: 'nw-resize' },
      n: { top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
      ne: { top: -4, right: -4, cursor: 'ne-resize' },
      e: { top: '50%', right: -4, transform: 'translateY(-50%)', cursor: 'e-resize' },
      se: { bottom: -4, right: -4, cursor: 'se-resize' },
      s: { bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
      sw: { bottom: -4, left: -4, cursor: 'sw-resize' },
      w: { top: '50%', left: -4, transform: 'translateY(-50%)', cursor: 'w-resize' },
    };
    return { ...base, ...pos[handle] };
  };

  const objectFit = element.fillMode === 'fill' ? 'cover'
    : element.fillMode === 'fit' ? 'contain'
    : element.fillMode === 'stretch' ? 'fill'
    : 'none';

  if (element.type === 'audio') {
    return <AudioElement element={element} />;
  }

  return (
    <div
      ref={elRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        cursor: element.freePosition ? 'move' : 'default',
        outline: isSelected ? '2px solid #3b82f6' : 'none',
        outlineOffset: 0,
        userSelect: 'none',
        zIndex: element.zIndex,
        opacity: element.opacity,
        overflow: 'hidden',
      }}
    >
      {element.type === 'shape' ? (
        <ShapeContent element={element} />
      ) : element.type === 'video' ? (
        <VideoElement
          element={element}
          objectFit={objectFit}
        />
      ) : element.url && element.url !== '#' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={element.url}
          alt={element.name}
          draggable={false}
          style={{
            width: '100%', height: '100%',
            objectFit: objectFit as CSSProperties['objectFit'],
            display: 'block',
            pointerEvents: 'none',
          }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #1e2535, #2a3347)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{element.name}</p>
        </div>
      )}

      {/* Resize handles */}
      {isSelected && HANDLES.map(handle => (
        <div
          key={handle}
          style={getHandleStyle(handle)}
          onMouseDown={e => handleResizeMouseDown(e, handle)}
        />
      ))}
    </div>
  );
}
