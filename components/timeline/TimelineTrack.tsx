'use client';
import { Video, Music, Plus } from 'lucide-react';
import { CanvasElement } from '../../types/element.types';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { addElement } from '../../store/slices/elementsSlice';
import { addElementToPage } from '../../store/slices/pagesSlice';
import TimelineClip from './TimelineClip';

interface TimelineTrackProps {
  trackType: 'video' | 'audio';
  elements: CanvasElement[];
  zoom: number;
  totalDuration: number;
}

export default function TimelineTrack({ trackType, elements, zoom, totalDuration }: TimelineTrackProps) {
  const dispatch = useAppDispatch();
  const activePageId = useAppSelector(s => s.pages.activePageId);
  const resources = useAppSelector(s => s.ui.resources);

  // Show ALL non-audio elements in video track (images, video, shapes, text)
  // Show only audio elements in audio track
  const trackElements = elements.filter(el =>
    trackType === 'audio' ? el.type === 'audio' : el.type !== 'audio'
  );

  // Calculate the total track width needed (at least totalDuration * zoom)
  const lastEnd = trackElements.reduce((max, el) => Math.max(max, (el.startTime + el.duration) * zoom), 0);
  const trackWidth = Math.max(totalDuration * zoom, lastEnd + 40);

  const handleAddClip = () => {
    // Add a sample resource to this track
    const eligible = resources.filter(r =>
      trackType === 'audio' ? r.type === 'audio' : r.type !== 'audio'
    );
    if (eligible.length === 0) return;
    const resource = eligible[0];
    const elementId = `el-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    // Place after last clip
    const startTime = trackElements.reduce((max, el) => Math.max(max, el.startTime + el.duration), 0);
    dispatch(addElement({
      id: elementId,
      pageId: activePageId,
      resourceId: resource.id,
      type: resource.type === 'audio' ? 'audio' : resource.type === 'video' ? 'video' : 'image',
      url: resource.url,
      name: resource.name,
      thumbnail: resource.thumbnail,
      zone: null,
      x: 0, y: 0,
      width: 400, height: 300,
      fillMode: 'fill', opacity: 1, rotation: 0,
      freePosition: false,
      startTime,
      duration: resource.duration || 10,
      animations: [],
      zIndex: elements.length + 1,
    }));
    dispatch(addElementToPage({ pageId: activePageId, elementId }));
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'stretch',
      borderBottom: '1px solid var(--border-subtle)',
      height: 32,
      flexShrink: 0,
    }}>
      {/* Track label */}
      <div style={{
        width: 48,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        color: 'var(--text-muted)',
      }}>
        {trackType === 'video'
          ? <Video size={14} />
          : <Music size={14} />
        }
      </div>

      {/* Clips area */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: 'var(--timeline-bg)',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', width: trackWidth, height: '100%', display: 'flex', alignItems: 'center' }}>
          {trackElements.map(el => (
            <TimelineClip key={el.id} element={el} zoom={zoom} />
          ))}

          {/* Plus button to add clip */}
          {trackElements.length === 0 && (
            <button
              onClick={handleAddClip}
              title={`Add ${trackType} clip`}
              style={{
                position: 'absolute',
                left: 4,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget).style.background = 'var(--accent-blue)';
                (e.currentTarget).style.color = 'white';
                (e.currentTarget).style.borderColor = 'var(--accent-blue)';
              }}
              onMouseLeave={e => {
                (e.currentTarget).style.background = 'var(--bg-card)';
                (e.currentTarget).style.color = 'var(--text-muted)';
                (e.currentTarget).style.borderColor = 'var(--border-color)';
              }}
            >
              <Plus size={12} />
            </button>
          )}

          {/* Plus button after last clip if clips exist */}
          {trackElements.length > 0 && (
            <button
              onClick={handleAddClip}
              title={`Add ${trackType} clip`}
              style={{
                position: 'absolute',
                left: Math.max(...trackElements.map(el => (el.startTime + el.duration) * zoom)) + 4,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget).style.background = 'var(--accent-blue)';
                (e.currentTarget).style.color = 'white';
                (e.currentTarget).style.borderColor = 'var(--accent-blue)';
              }}
              onMouseLeave={e => {
                (e.currentTarget).style.background = 'var(--bg-card)';
                (e.currentTarget).style.color = 'var(--text-muted)';
                (e.currentTarget).style.borderColor = 'var(--border-color)';
              }}
            >
              <Plus size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
