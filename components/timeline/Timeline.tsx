import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { setTotalDuration } from '../../store/slices/timelineSlice';
import { setActivePage } from '../../store/slices/pagesSlice';
import PageTabs from './PageTabs';
import PlaybackControls from './PlaybackControls';
import TimelineRuler from './TimelineRuler';
import TimelineTrack from './TimelineTrack';
import TimelineScrubber from './TimelineScrubber';

export default function Timeline() {
  const dispatch = useAppDispatch();
  const { totalDuration, currentTime, zoom } = useAppSelector(s => s.timeline);
  const { pages, activePageId } = useAppSelector(s => s.pages);
  const allElements = useAppSelector(s => s.elements.elements);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-sync project duration to the total duration of all pages
  useEffect(() => {
    const totalPagesDuration = pages.reduce((sum, p) => sum + p.duration, 0);
    const maxClipEndTime = allElements.reduce((max, el) => {
      const endTime = el.startTime + el.duration;
      return endTime > max ? endTime : max;
    }, 0);

    const finalDuration = Math.max(totalPagesDuration, maxClipEndTime, 10);

    if (Math.abs(totalDuration - finalDuration) > 0.1) {
      dispatch(setTotalDuration(finalDuration));
    }
  }, [allElements, pages, totalDuration, dispatch]);

  // Auto-switch pages based on currentTime
  useEffect(() => {
    let cumulativeTime = 0;
    for (const page of pages) {
      const pageEnd = cumulativeTime + page.duration;
      if (currentTime >= cumulativeTime && currentTime < pageEnd) {
        if (activePageId !== page.id) {
          dispatch(setActivePage(page.id));
        }
        break;
      }
      cumulativeTime = pageEnd;
    }
  }, [currentTime, pages, activePageId, dispatch]);

  const RULER_OFFSET = 48; // track label width

  return (
    <div style={{
      height: 240,
      minHeight: 240,
      maxHeight: 240,
      background: 'var(--timeline-bg)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      <PlaybackControls />
      <PageTabs />

      {/* Scrollable area for everything */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <div style={{ minWidth: (totalDuration * zoom) + RULER_OFFSET, position: 'relative' }}>
          {/* Ruler row (Sticky) */}
          <div style={{ 
            display: 'flex', 
            position: 'sticky', 
            top: 0, 
            zIndex: 110, 
            background: 'var(--timeline-bg)',
            height: 24,
          }}>
            <div style={{
              width: RULER_OFFSET,
              flexShrink: 0,
              background: 'var(--bg-secondary)',
              borderRight: '1px solid var(--border-color)',
              borderBottom: '1px solid var(--border-color)',
            }} />
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              <TimelineRuler zoom={zoom} totalDuration={totalDuration} width={totalDuration * zoom} />
              <TimelineScrubber containerRef={scrollRef} zoom={zoom} totalDuration={totalDuration} />
            </div>
          </div>

          {/* Tracks Area */}
          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <TimelineTrack
              trackType="video"
              elements={allElements}
              zoom={zoom}
              totalDuration={totalDuration}
            />
            <TimelineTrack
              trackType="audio"
              elements={allElements}
              zoom={zoom}
              totalDuration={totalDuration}
            />

            {/* Global Playhead Line */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: RULER_OFFSET + (currentTime * zoom),
              width: 2,
              background: 'var(--accent-blue)',
              zIndex: 100,
              pointerEvents: 'none',
              boxShadow: '0 0 8px rgba(59,130,246,0.6)',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
