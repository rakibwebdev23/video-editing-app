'use client';
import { useRef } from 'react';
import { CanvasElement } from '../../types/element.types';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { selectElement } from '../../store/slices/selectionSlice';
import { updateElementStartTime, updateElementDuration } from '../../store/slices/elementsSlice';

interface TimelineClipProps {
  element: CanvasElement;
  zoom: number;
}

const CLIP_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  image: { bg: '#ec489920', border: '#ec4899', text: '#ec4899' },
  video: { bg: '#8b5cf620', border: '#8b5cf6', text: '#8b5cf6' },
  audio: { bg: '#10b98120', border: '#10b981', text: '#10b981' },
  shape: { bg: '#3b82f620', border: '#3b82f6', text: '#3b82f6' },
};

export default function TimelineClip({ element, zoom }: TimelineClipProps) {
  const dispatch = useAppDispatch();
  const isSelected = useAppSelector(s => s.selection.selectedElementIds.includes(element.id));
  const colors = CLIP_COLORS[element.type] || CLIP_COLORS.image;

  const dragStartX = useRef<number | null>(null);
  const dragStartTime = useRef<number>(0);
  const resizeStartX = useRef<number | null>(null);
  const resizeStartDuration = useRef<number>(0);

  const left = element.startTime * zoom;
  const width = Math.max(20, element.duration * zoom);

  const handleDragMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(selectElement(element.id));
    dragStartX.current = e.clientX;
    dragStartTime.current = element.startTime;

    const onMove = (me: MouseEvent) => {
      if (dragStartX.current === null) return;
      const dx = me.clientX - dragStartX.current;
      const dt = dx / zoom;
      const newStart = Math.max(0, dragStartTime.current + dt);
      dispatch(updateElementStartTime({ id: element.id, startTime: newStart }));
    };
    const onUp = () => {
      dragStartX.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, dir: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    resizeStartX.current = e.clientX;
    resizeStartDuration.current = element.duration;
    const initialStartTime = element.startTime;
    const initialOffset = element.startTimeOffset || 0;

    const onMove = (me: MouseEvent) => {
      if (resizeStartX.current === null) return;
      const dx = me.clientX - resizeStartX.current;
      const dt = dx / zoom;

      if (dir === 'right') {
        const newDuration = Math.max(0.5, resizeStartDuration.current + dt);
        dispatch(updateElementDuration({ id: element.id, duration: newDuration }));
      } else {
        // Left trim
        const delta = Math.min(resizeStartDuration.current - 0.5, dt);
        const newStart = initialStartTime + delta;
        const newDuration = resizeStartDuration.current - delta;
        const newOffset = initialOffset + delta;
        dispatch(trimElement({
          id: element.id,
          startTime: Math.max(0, newStart),
          duration: newDuration,
          startTimeOffset: Math.max(0, newOffset),
        }));
      }
    };
    const onUp = () => {
      resizeStartX.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const getTypeLabel = () => {
    if (element.type === 'audio') return '🎵';
    if (element.type === 'video') return '🎬';
    if (element.type === 'image') return '🖼';
    if (element.type === 'shape') return '✦';
    return '';
  };

  return (
    <div
      onMouseDown={handleDragMouseDown}
      onClick={(e) => { e.stopPropagation(); dispatch(selectElement(element.id)); }}
      title={element.name}
      style={{
        position: 'absolute',
        left,
        top: 4,
        width,
        height: 24,
        background: colors.bg,
        borderRadius: 'var(--radius-sm)',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px',
        overflow: 'hidden',
        outline: isSelected ? `2px solid ${colors.border}` : 'none',
        outlineOffset: 1,
        transition: 'opacity 0.15s',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      {/* Left-edge resize handle */}
      <div
        onMouseDown={e => handleResizeMouseDown(e, 'left')}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          cursor: 'ew-resize',
          background: `linear-gradient(to left, transparent, ${colors.border}60)`,
          zIndex: 5,
        }}
      />

      {element.type === 'audio' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-around', opacity: 0.2, pointerEvents: 'none' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ width: 2, height: `${20 + Math.random() * 60}%`, background: colors.text, borderRadius: 1 }} />
          ))}
        </div>
      )}
      <span style={{ fontSize: 9, marginRight: 4, zIndex: 1 }}>{getTypeLabel()}</span>
      <span style={{ fontSize: 10, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, zIndex: 1 }}>
        {element.name}
      </span>

      {/* Right-edge resize handle */}
      <div
        onMouseDown={e => handleResizeMouseDown(e, 'right')}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 6,
          cursor: 'ew-resize',
          background: `linear-gradient(to right, transparent, ${colors.border}60)`,
          zIndex: 5,
        }}
      />
    </div>
  );
}
