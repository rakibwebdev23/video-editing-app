'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { setMediaFilter, setMediaSearch } from '../../store/slices/uiSlice';
import { MediaFilter } from '../../types/editor.types';
import MediaCard from './MediaCard';
import UploadButton from './UploadButton';
import ElementsPanel from './ElementsPanel';
import { staggerMediaCards } from '../../animations/gsapAnimations';

const FILTER_TABS: { id: MediaFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Image' },
  { id: 'video', label: 'Video' },
  { id: 'audio', label: 'Audio' },
];

export default function ResourcePanel() {
  const dispatch = useAppDispatch();
  const { resources, mediaFilter, mediaSearch, sidebarTab } = useAppSelector(s => s.ui);
  const activePageId = useAppSelector(s => s.pages.activePageId);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const filtered = resources.filter(r => {
    if (mediaFilter !== 'all' && r.type !== mediaFilter) return false;
    if (mediaSearch && !r.name.toLowerCase().includes(mediaSearch.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    // Simulate load then stagger
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('.media-card');
        if (cards.length > 0) staggerMediaCards(cards);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [mediaFilter, mediaSearch]);

  if (sidebarTab === 'elements') {
    return <ElementsPanel />;
  }

  if (sidebarTab === 'live') {
    return (
      <div style={{ width: 200, padding: 16, background: 'var(--bg-panel)' }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>Live</h3>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Live source integration coming soon...</p>
      </div>
    );
  }

  return (
    <div style={{
      width: 242,
      background: 'var(--bg-panel)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>My Resource</h2>
          <UploadButton />
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-field"
            placeholder="Search Device"
            value={mediaSearch}
            onChange={e => dispatch(setMediaSearch(e.target.value))}
            style={{ paddingLeft: 26 }}
          />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => dispatch(setMediaFilter(tab.id))}
              style={{
                flex: 1,
                padding: '4px 0',
                border: 'none',
                background: 'transparent',
                fontSize: 11,
                fontWeight: mediaFilter === tab.id ? 600 : 400,
                color: mediaFilter === tab.id ? 'var(--accent-blue)' : 'var(--text-muted)',
                cursor: 'pointer',
                borderBottom: mediaFilter === tab.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div ref={gridRef} style={{
        flex: 1,
        overflowY: 'auto',
        padding: 10,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        alignContent: 'start',
      }}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-sm)' }} />
            ))
          : filtered.map((resource, idx) => (
              <MediaCard key={resource.id} resource={resource} pageId={activePageId} index={idx} />
            ))
        }
        {!isLoading && filtered.length === 0 && (
          <div style={{
            gridColumn: '1/-1', textAlign: 'center', padding: 24,
            color: 'var(--text-muted)', fontSize: 12,
          }}>
            No media found
          </div>
        )}
      </div>
    </div>
  );
}
