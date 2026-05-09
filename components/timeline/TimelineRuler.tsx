'use client';
import React from 'react';
import { formatTimeShort } from '../../utils/timeFormat';

interface TimelineRulerProps {
  zoom: number; // px per second
  totalDuration: number;
  width: number;
}

export default function TimelineRuler({ zoom, totalDuration, width }: TimelineRulerProps) {
  const totalWidth = totalDuration * zoom;
  const step = zoom >= 80 ? 30 : zoom >= 40 ? 60 : 120; // seconds between major ticks
  const ticks: number[] = [];

  for (let t = 0; t <= totalDuration; t += step) {
    ticks.push(t);
  }

  return (
    <div style={{
      position: 'relative',
      height: 24,
      background: 'var(--timeline-bg)',
      borderBottom: '1px solid var(--border-color)',
      overflow: 'hidden',
      flexShrink: 0,
      minWidth: width,
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: totalWidth, height: '100%' }}>
        {ticks.map(t => (
          <div key={t} style={{
            position: 'absolute',
            left: t * zoom,
            top: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}>
            <div style={{ width: 1, height: 10, background: 'var(--ruler-tick)' }} />
            <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 2, marginTop: 1, whiteSpace: 'nowrap' }}>
              {formatTimeShort(t)}
            </span>
          </div>
        ))}
        {/* Minor ticks */}
        {Array.from({ length: Math.floor(totalDuration / 10) }).map((_, i) => {
          const t = (i + 1) * 10;
          if (t % step === 0) return null;
          return (
            <div key={`minor-${t}`} style={{
              position: 'absolute',
              left: t * zoom,
              top: 0,
              width: 1,
              height: 6,
              background: 'var(--border-subtle)',
            }} />
          );
        })}
      </div>
    </div>
  );
}
