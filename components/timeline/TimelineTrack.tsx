'use client';
import { Video, Music, Plus } from 'lucide-react';
import { CanvasElement } from '../../types/element.types';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { addElement } from '../../store/slices/elementsSlice';
import { addElementToPage } from '../../store/slices/pagesSlice';
import { LAYOUTS } from '../../constants/layouts';
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
    const elementId = `el-${crypto.randomUUID()}`;
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

  const pages = useAppSelector(s => s.pages.pages);
  
  // Calculate max zones across the whole project for a stable timeline height
  const maxProjectZones = pages.reduce((max, p) => {
    const layout = LAYOUTS.find(l => l.id === p.layout);
    return Math.max(max, layout?.zones || 1);
  }, 1);

  const numZones = trackType === 'video' ? maxProjectZones : 1;
  const trackHeight = Math.max(40, numZones * 28 + 4);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'stretch',
      borderBottom: '1px solid var(--border-subtle)',
      height: trackHeight,
      flexShrink: 0,
    }}>
      {/* Track label */}
      <div style={{
        width: 48,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        borderRight: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        color: 'var(--text-muted)',
      }}>
        {trackType === 'video' ? (
          <>
            {Array.from({ length: numZones }).map((_, i) => (
              <div key={i} style={{ 
                height: 28, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 8,
                fontWeight: 600,
                borderBottom: i < numZones - 1 ? '1px solid var(--border-subtle)' : 'none',
                opacity: 0.6,
                paddingTop: i === 0 ? 4 : 0,
              }}>
                {numZones > 1 ? `Z${i + 1}` : <Video size={14} />}
              </div>
            ))}
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Music size={14} />
          </div>
        )}
      </div>

      {/* Clips area */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: 'var(--timeline-bg)',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', width: trackWidth, height: '100%' }}>
          {/* Lane Dividers */}
          {trackType === 'video' && numZones > 1 && Array.from({ length: numZones }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: i * 28,
              left: 0,
              right: 0,
              height: 28,
              borderBottom: i < numZones - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              pointerEvents: 'none',
            }} />
          ))}

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
