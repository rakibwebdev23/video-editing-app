'use client';
import { useRef, useEffect, MouseEvent, CSSProperties } from 'react';
import gsap from 'gsap';
import { CanvasElement } from '../../types/element.types';
import { snapToGrid } from '../../utils/snapGrid';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/layouts';
import { useAppSelector } from '../../store/editorStore';
import { playEnterAnimation, playExitAnimation, playEmphasisAnimation } from '../../animations/gsapAnimations';

interface Props {
  element: CanvasElement;
  isSelected: boolean;
  pageStartTime: number; // Added to handle multi-page timing
  onSelect: (e: MouseEvent) => void;
  onPositionChange: (x: number, y: number) => void;
  onSizeChange: (w: number, h: number) => void;
}

function VideoElement({ element, objectFit, pageStartTime }: { element: CanvasElement; objectFit: string; pageStartTime: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { currentTime, isPlaying } = useAppSelector(s => s.timeline);

  const relativeTime = (currentTime - pageStartTime) - element.startTime + (element.startTimeOffset || 0);
  const isVisible = (currentTime - pageStartTime) >= element.startTime && (currentTime - pageStartTime) <= (element.startTime + element.duration);

  useEffect(() => {
    if (!videoRef.current || !isVisible) return;

    const videoTime = Math.max(0, relativeTime);
    if (Math.abs(videoRef.current.currentTime - videoTime) > 0.1) {
      videoRef.current.currentTime = videoTime;
    }

    if (isPlaying && videoRef.current.paused) {
      videoRef.current.play().catch(() => { });
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

function AudioElement({ element, pageStartTime }: { element: CanvasElement; pageStartTime: number }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentTime, isPlaying } = useAppSelector(s => s.timeline);

  const relativeTime = (currentTime - pageStartTime) - element.startTime + (element.startTimeOffset || 0);
  const isVisible = (currentTime - pageStartTime) >= element.startTime && (currentTime - pageStartTime) <= (element.startTime + element.duration);

  useEffect(() => {
    if (!audioRef.current || !isVisible) return;

    const audioTime = Math.max(0, relativeTime);
    if (Math.abs(audioRef.current.currentTime - audioTime) > 0.1) {
      audioRef.current.currentTime = audioTime;
    }

    if (isPlaying && audioRef.current.paused) {
      audioRef.current.play().catch(() => { });
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
            <rect x="5" y="5" width="28" height="28" rx="2" fill="#000" />
            <rect x="9" y="9" width="20" height="20" rx="1" fill="white" />
            <rect x="12" y="12" width="14" height="14" rx="1" fill="#000" />
            <rect x="67" y="5" width="28" height="28" rx="2" fill="#000" />
            <rect x="71" y="9" width="20" height="20" rx="1" fill="white" />
            <rect x="74" y="12" width="14" height="14" rx="1" fill="#000" />
            <rect x="5" y="67" width="28" height="28" rx="2" fill="#000" />
            <rect x="9" y="71" width="20" height="20" rx="1" fill="white" />
            <rect x="12" y="74" width="14" height="14" rx="1" fill="#000" />
            <rect x="40" y="40" width="4" height="4" fill="#000" />
            <rect x="50" y="40" width="4" height="4" fill="#000" />
            <rect x="44" y="44" width="4" height="4" fill="#000" />
            <rect x="56" y="44" width="4" height="4" fill="#000" />
            <rect x="40" y="50" width="4" height="4" fill="#000" />
            <rect x="60" y="50" width="4" height="4" fill="#000" />
            <rect x="48" y="54" width="4" height="4" fill="#000" />
            <rect x="56" y="60" width="4" height="4" fill="#000" />
            <rect x="40" y="64" width="4" height="4" fill="#000" />
            <rect x="48" y="64" width="4" height="4" fill="#000" />
            <rect x="60" y="56" width="4" height="4" fill="#000" />
            <rect x="44" y="60" width="4" height="4" fill="#000" />
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
        }} />
      );
    case 'ellipse':
      return (
        <div style={{
          width: '100%', height: '100%',
          background: bg,
          border: `2px solid ${color}`,
          borderRadius: '50%',
          boxSizing: 'border-box',
        }} />
      );
    case 'triangle':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <polygon points="50,5 95,95 5,95" fill={bg !== 'transparent' ? bg : 'none'} stroke={color} strokeWidth="3" />
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
            <div style={{ width: `${parseInt(text || '50')}%`, height: '100%', background: color, borderRadius: 2 }} />
            <div style={{
              position: 'absolute',
              top: '50%', left: `${parseInt(text || '50')}%`,
              transform: 'translate(-50%, -50%)',
              width: 16, height: 16,
              background: color,
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function CanvasElementComponent({
  element, isSelected, pageStartTime, onSelect, onPositionChange, onSizeChange,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ mouseX: number; mouseY: number; elX: number; elY: number } | null>(null);
  const resizeStart = useRef<{
    handle: string; mouseX: number; mouseY: number;
    origX: number; origY: number; origW: number; origH: number;
  } | null>(null);
  const { currentTime } = useAppSelector(s => s.timeline);
  const lastAnimatedTime = useRef<number>(-1);

  const localTime = currentTime - pageStartTime;
  const isVisible = localTime >= element.startTime && localTime <= (element.startTime + element.duration);

  useEffect(() => {
    const ctx = gsap.context(() => { });

    if (!elRef.current || !isVisible) {
      if (!isVisible) {
        lastAnimatedTime.current = -1;
      }
      return;
    }

    const enterAnim = element.animations.find(a => a.category === 'enter');
    const exitAnim = element.animations.find(a => a.category === 'exit');
    const emphasisAnim = element.animations.find(a => a.category === 'emphasis');

    const exitStartTime = element.startTime + element.duration - (exitAnim?.duration || 0);

    // Trigger Enter Animation
    const isAtStart = Math.abs(currentTime - element.startTime) < 0.05;
    if (isAtStart && enterAnim && lastAnimatedTime.current !== element.startTime) {
      ctx.add(() => playEnterAnimation(elRef.current!, enterAnim.name, enterAnim.duration));
      lastAnimatedTime.current = element.startTime;
      return;
    }

    // Trigger Exit Animation
    const isAtEnd = Math.abs(currentTime - exitStartTime) < 0.05;
    if (isAtEnd && exitAnim && lastAnimatedTime.current !== exitStartTime && currentTime > element.startTime) {
      ctx.add(() => playExitAnimation(elRef.current!, exitAnim.name, exitAnim.duration));
      lastAnimatedTime.current = exitStartTime;
      return;
    }

    // Trigger Emphasis Animation (Combo)
    if (emphasisAnim && lastAnimatedTime.current === -1) {
      ctx.add(() => {
        const tl = playEmphasisAnimation(elRef.current!, emphasisAnim.name, emphasisAnim.duration);
        tl.repeat(-1);
      });
      lastAnimatedTime.current = -2;
    }

    // Reset / Scrub logic
    const isDuringEnter = currentTime >= element.startTime && currentTime < element.startTime + (enterAnim?.duration || 0);
    const isDuringExit = currentTime > exitStartTime && currentTime <= element.startTime + element.duration;

    if (!isAtStart && !isAtEnd && !isDuringEnter && !isDuringExit && lastAnimatedTime.current !== -2) {
      // If we are in the middle and no combo animation is active, ensure properties are clean
      if (!emphasisAnim) {
        gsap.set(elRef.current, { clearProps: 'all' });
        lastAnimatedTime.current = -1;
      }
    }

    return () => ctx.revert(); // Cleanup GSAP animations
  }, [currentTime, isVisible, element.startTime, element.duration, element.animations]);

  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    onSelect(e);
    // Disable dragging if in a layout zone
    if (!element.freePosition || element.zone !== null) return;

    dragStart.current = {
      mouseX: e.clientX, mouseY: e.clientY,
      elX: element.x, elY: element.y,
    };
    e.preventDefault();
  };

  const handleResizeMouseDown = (e: MouseEvent, handle: string) => {
    // Disable resizing if in a layout zone
    if (element.zone !== null) return;

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
        if (handle.includes('e')) newW = Math.max(20, snapToGrid(origW + dx));
        if (handle.includes('s')) newH = Math.max(20, snapToGrid(origH + dy));
        if (handle.includes('w')) { newW = Math.max(20, snapToGrid(origW - dx)); newX = origX + origW - newW; }
        if (handle.includes('n')) { newH = Math.max(20, snapToGrid(origH - dy)); newY = origY + origH - newH; }
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
    const size = 12;
    const offset = -6;
    const base: CSSProperties = {
      position: 'absolute', width: size, height: size,
      background: 'white', border: '2px solid #3b82f6',
      borderRadius: '50%', zIndex: 100,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    };
    const pos: Record<string, CSSProperties> = {
      nw: { top: offset, left: offset, cursor: 'nw-resize' },
      n: { top: offset, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
      ne: { top: offset, right: offset, cursor: 'ne-resize' },
      e: { top: '50%', right: offset, transform: 'translateY(-50%)', cursor: 'e-resize' },
      se: { bottom: offset, right: offset, cursor: 'se-resize' },
      s: { bottom: offset, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
      sw: { bottom: offset, left: offset, cursor: 'sw-resize' },
      w: { top: '50%', left: offset, transform: 'translateY(-50%)', cursor: 'w-resize' },
    };
    return { ...base, ...pos[handle] };
  };

  const objectFit = element.fillMode === 'fill' ? 'cover'
    : element.fillMode === 'fit' ? 'contain'
      : element.fillMode === 'stretch' ? 'fill'
        : 'none';

  if (element.type === 'audio') return <AudioElement element={element} pageStartTime={pageStartTime} />;
  if (!isVisible) return null;

  return (
    <div
      ref={elRef}
      onMouseDown={handleMouseDown}
      className="canvas-element-hover"
      data-element-id={element.id}
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        cursor: element.freePosition ? 'move' : 'pointer', // Changed to pointer for better feedback
        outline: isSelected ? '3px solid #3b82f6' : 'none', // Thicker outline
        outlineOffset: isSelected ? 0 : 0,
        boxShadow: isSelected ? '0 0 0 4px rgba(59, 130, 246, 0.3)' : 'none', // Added glow
        userSelect: 'none',
        zIndex: isSelected ? 9999 : (element.zIndex || 1), // Force to top
        opacity: element.opacity,
        transition: 'outline 0.1s ease, box-shadow 0.1s ease', // Smooth selection
      }}
    >
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
        {element.type === 'shape' ? (
          <ShapeContent element={element} />
        ) : element.type === 'video' ? (
          <VideoElement element={element} objectFit={objectFit} pageStartTime={pageStartTime} />
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
            <p style={{ fontSize: 11, color: 'white' }}>{element.name}</p>
          </div>
        )}
      </div>

      {/* Edge resize bars */}
      {isSelected && (
        <>
          <div className="edge-handle edge-n" onMouseDown={e => handleResizeMouseDown(e, 'n')} />
          <div className="edge-handle edge-s" onMouseDown={e => handleResizeMouseDown(e, 's')} />
          <div className="edge-handle edge-e" onMouseDown={e => handleResizeMouseDown(e, 'e')} />
          <div className="edge-handle edge-w" onMouseDown={e => handleResizeMouseDown(e, 'w')} />
        </>
      )}

      {/* Resize handles */}
      {isSelected && HANDLES.map(handle => (
        <div
          key={handle}
          className="resize-handle"
          style={getHandleStyle(handle)}
          onMouseDown={e => handleResizeMouseDown(e, handle)}
        />
      ))}
    </div>
  );
}
