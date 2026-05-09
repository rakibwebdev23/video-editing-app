'use client';
import { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, Scissors } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { togglePlayback, tickTime, setCurrentTime, setPlaying } from '../../store/slices/timelineSlice';
import { splitElement } from '../../store/slices/elementsSlice';
import { formatTimeShort } from '../../utils/timeFormat';

export default function PlaybackControls() {
  const dispatch = useAppDispatch();
  const { isPlaying, currentTime, totalDuration } = useAppSelector(s => s.timeline);
  const selectedIds = useAppSelector(s => s.selection.selectedElementIds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        // Double check boundary inside the interval to prevent "over-running"
        if (currentTime >= totalDuration) {
          dispatch(setPlaying(false));
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
        dispatch(tickTime(0.033)); // 33ms for smooth 30fps
      }, 33);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentTime, totalDuration, dispatch]);

  const handleSplit = () => {
    selectedIds.forEach(id => {
      dispatch(splitElement({ id, splitTime: currentTime }));
    });
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: '5px 0',
      background: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-color)',
      flexShrink: 0,
    }}>
      {/* Skip to start */}
      <button
        className="btn-icon"
        onClick={() => dispatch(setCurrentTime(0))}
        title="Go to start"
        style={{ color: 'var(--text-muted)' }}
      >
        <SkipBack size={14} />
      </button>

      {/* Split button */}
      <button
        className="btn-icon"
        onClick={handleSplit}
        disabled={selectedIds.length === 0}
        title="Split Selected"
        style={{ color: selectedIds.length > 0 ? 'var(--accent-orange)' : 'var(--text-muted)' }}
      >
        <Scissors size={14} />
      </button>

      {/* Play/Pause button */}
      <button
        onClick={() => dispatch(togglePlayback())}
        style={{
          width: 30, height: 30,
          borderRadius: '50%',
          background: 'var(--accent-blue)',
          border: 'none',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s',
          boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
          flexShrink: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 2 }} />}
      </button>

      {/* Time display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
          {formatTimeShort(currentTime)}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>|</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          {formatTimeShort(totalDuration)}
        </span>
      </div>
    </div>
  );
}
