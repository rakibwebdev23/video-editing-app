'use client';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { updatePageLayout } from '../../store/slices/pagesSlice';
import { reassignZones } from '../../store/slices/elementsSlice';
import { LayoutType } from '../../types/editor.types';
import { LAYOUTS } from '../../constants/layouts';
import Dropdown from '../ui/Dropdown';

const LAYOUT_OPTIONS = LAYOUTS.map(l => ({ value: l.id, label: l.label }));

// Visual grid thumbnails
function LayoutThumbnail({ id, active, onClick }: { id: LayoutType; active: boolean; onClick: () => void }) {
  const render = () => {
    const base = { background: active ? 'var(--accent-blue)' : 'var(--text-muted)', borderRadius: 1, opacity: active ? 1 : 0.6 };
    switch (id) {
      case 'single':
        return <div style={{ ...base, width: '100%', height: '100%' }} />;
      case 'horizontal-1-1':
        return <div style={{ display: 'flex', gap: 1, width: '100%', height: '100%' }}>
          <div style={{ ...base, flex: 1 }} /><div style={{ ...base, flex: 1 }} />
        </div>;
      case 'horizontal-2-1':
        return <div style={{ display: 'flex', gap: 1, width: '100%', height: '100%' }}>
          <div style={{ ...base, flex: 2 }} /><div style={{ ...base, flex: 1 }} />
        </div>;
      case 'horizontal-1-2':
        return <div style={{ display: 'flex', gap: 1, width: '100%', height: '100%' }}>
          <div style={{ ...base, flex: 1 }} /><div style={{ ...base, flex: 2 }} />
        </div>;
      case 'vertical-1-2':
        return <div style={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', height: '100%' }}>
          <div style={{ ...base, flex: 1 }} /><div style={{ ...base, flex: 1 }} />
        </div>;
      case 'grid-2-2':
        return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, width: '100%', height: '100%' }}>
          {[0,1,2,3].map(i => <div key={i} style={{ ...base }} />)}
        </div>;
    }
  };
  return (
    <button
      onClick={onClick}
      title={id}
      style={{
        width: 44, height: 32,
        padding: 4,
        background: active ? 'rgba(59,130,246,0.15)' : 'var(--bg-card)',
        border: active ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {render()}
    </button>
  );
}

export default function LayoutSelector({ pageId }: { pageId: string }) {
  const dispatch = useAppDispatch();
  const page = useAppSelector(s => s.pages.pages.find(p => p.id === pageId));
  if (!page) return null;

  const onLayoutChange = (layoutId: LayoutType) => {
    dispatch(updatePageLayout({ pageId, layout: layoutId }));
    const zonesCount = LAYOUTS.find(l => l.id === layoutId)?.zones || 1;
    dispatch(reassignZones({ pageId, zonesCount }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Dropdown
        options={LAYOUT_OPTIONS}
        value={page.layout}
        onChange={val => onLayoutChange(val as LayoutType)}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {LAYOUTS.map(l => (
          <LayoutThumbnail
            key={l.id}
            id={l.id}
            active={page.layout === l.id}
            onClick={() => onLayoutChange(l.id)}
          />
        ))}
      </div>
    </div>
  );
}
