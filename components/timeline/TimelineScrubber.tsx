'use client';
import React, { useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { setCurrentTime } from '../../store/slices/timelineSlice';

interface TimelineScrubberProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  totalDuration: number;
}

export default function TimelineScrubber({ containerRef, zoom, totalDuration }: TimelineScrubberProps) {
  const dispatch = useAppDispatch();
  const currentTime = useAppSelector(s => s.timeline.currentTime);
  const isDragging = useRef(false);

  const getTimeFromX = useCallback((clientX: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left + containerRef.current.scrollLeft;
    return Math.max(0, Math.min(totalDuration, x / zoom));
  }, [containerRef, zoom, totalDuration]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dispatch(setCurrentTime(getTimeFromX(e.clientX)));

    const onMove = (me: MouseEvent) => {
      if (isDragging.current) dispatch(setCurrentTime(getTimeFromX(me.clientX)));
    };
    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const x = currentTime * zoom;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        bottom: 0,
        width: 2,
        background: 'var(--playhead)',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      {/* Head */}
      <div
        style={{
          position: 'absolute',
          top: -1,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 14,
          height: 14,
          background: 'var(--playhead)',
          borderRadius: '50%',
          cursor: 'ew-resize',
          pointerEvents: 'all',
        }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
