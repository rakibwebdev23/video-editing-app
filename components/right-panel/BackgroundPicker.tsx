'use client';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { updatePageBackground } from '../../store/slices/pagesSlice';

export default function BackgroundPicker({ pageId }: { pageId: string }) {
  const dispatch = useAppDispatch();
  const page = useAppSelector(s => s.pages.pages.find(p => p.id === pageId));
  const [hexInput, setHexInput] = useState(page?.backgroundColor || '#FCFAFF');

  if (!page) return null;

  const PRESETS = ['#FCFAFF', '#0f1117', '#1e2535', '#ffffff', '#000000', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  const handleHexChange = (val: string) => {
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      dispatch(updatePageBackground({ pageId, color: val }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Color presets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {PRESETS.map(color => (
          <button
            key={color}
            onClick={() => { setHexInput(color); dispatch(updatePageBackground({ pageId, color })); }}
            style={{
              width: 18, height: 18,
              borderRadius: 3,
              background: color,
              border: page.backgroundColor === color ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
              cursor: 'pointer',
              padding: 0,
              transition: 'transform 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ))}
      </div>

      {/* Hex input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="color"
          value={page.backgroundColor}
          onChange={e => { setHexInput(e.target.value); dispatch(updatePageBackground({ pageId, color: e.target.value })); }}
          style={{ width: 28, height: 26, border: 'none', cursor: 'pointer', borderRadius: 3, padding: 1, background: 'transparent' }}
        />
        <input
          className="input-field"
          value={hexInput}
          onChange={e => handleHexChange(e.target.value)}
          placeholder="#FCFAFF"
          style={{ fontFamily: 'monospace', fontSize: 12 }}
        />
      </div>
    </div>
  );
}
