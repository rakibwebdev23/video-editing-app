'use client';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { updatePageDuration } from '../../store/slices/pagesSlice';
import { formatTime, parseTime } from '../../utils/timeFormat';

export default function DurationInput({ pageId }: { pageId: string }) {
  const dispatch = useAppDispatch();
  const page = useAppSelector(s => s.pages.pages.find(p => p.id === pageId));
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');

  if (!page) return null;

  const handleFocus = () => {
    setEditing(true);
    setInputVal(formatTime(page.duration));
  };

  const handleBlur = () => {
    setEditing(false);
    const parsed = parseTime(inputVal);
    if (!isNaN(parsed) && parsed > 0) {
      dispatch(updatePageDuration({ pageId, duration: parsed }));
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
    }}>
      <input
        type="text"
        value={editing ? inputVal : formatTime(page.duration)}
        onChange={e => setInputVal(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: 12,
          padding: '5px 8px',
          outline: 'none',
          fontFamily: 'monospace',
        }}
      />
      <span style={{
        fontSize: 10,
        color: 'var(--text-muted)',
        padding: '0 6px 0 0',
        whiteSpace: 'nowrap',
      }}>
        hr:min:sec
      </span>
    </div>
  );
}
