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
    // Stagger animation whenever filter, search or resources change
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.media-card');
      if (cards.length > 0) staggerMediaCards(cards);
    }
  }, [mediaFilter, mediaSearch, resources.length]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

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
      width: 280, // Increased width for better visibility
      background: 'var(--bg-panel)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      borderRight: '1px solid var(--border-color)',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>My Resources</h2>
          <UploadButton />
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-field"
            placeholder="Search assets..."
            value={mediaSearch}
            onChange={e => dispatch(setMediaSearch(e.target.value))}
            style={{ paddingLeft: 32, height: 36, fontSize: 13 }}
          />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--bg-secondary)', padding: 2, borderRadius: 8 }}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => dispatch(setMediaFilter(tab.id))}
              style={{
                flex: 1,
                padding: '6px 0',
                border: 'none',
                borderRadius: 6,
                background: mediaFilter === tab.id ? 'var(--bg-panel)' : 'transparent',
                fontSize: 11,
                fontWeight: mediaFilter === tab.id ? 600 : 500,
                color: mediaFilter === tab.id ? 'var(--accent-blue)' : 'var(--text-muted)',
                cursor: 'pointer',
                boxShadow: mediaFilter === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Container */}
      <div 
        ref={gridRef} 
        className="custom-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 12,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
          alignContent: 'start',
        }}
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: 12 }} />
            ))
          : filtered.map((resource, idx) => (
              <MediaCard key={resource.id} resource={resource} pageId={activePageId} index={idx} />
            ))
        }
        {!isLoading && filtered.length === 0 && (
          <div style={{
            gridColumn: '1/-1', textAlign: 'center', padding: '40px 20px',
            color: 'var(--text-muted)', fontSize: 12,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
          }}>
            <Search size={24} opacity={0.2} />
            <p>No results found</p>
          </div>
        )}
      </div>
    </div>
  );
}
