import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { setTotalDuration } from '../../store/slices/timelineSlice';
import PageTabs from './PageTabs';
import PlaybackControls from './PlaybackControls';
import TimelineRuler from './TimelineRuler';
import TimelineTrack from './TimelineTrack';
import TimelineScrubber from './TimelineScrubber';
import { DEFAULTS } from '../../constants/defaults';

export default function Timeline() {
  const dispatch = useAppDispatch();
  const { totalDuration } = useAppSelector(s => s.timeline);
  const zoom = DEFAULTS.TIMELINE_PX_PER_SEC;
  const activePageId = useAppSelector(s => s.pages.activePageId);
  const allElements = useAppSelector(s => s.elements.elements);
  const pageElements = allElements.filter(el => el.pageId === activePageId);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-sync project duration to the end of the last clip
  useEffect(() => {
    const maxEndTime = allElements.reduce((max, el) => {
      const endTime = el.startTime + el.duration;
      return endTime > max ? endTime : max;
    }, 10); // Default minimum 10s

    if (Math.abs(totalDuration - maxEndTime) > 0.1) {
      dispatch(setTotalDuration(maxEndTime));
    }
  }, [allElements, totalDuration, dispatch]);

  const RULER_OFFSET = 48; // track label width

  return (
    <div style={{
      height: 168,
      background: 'var(--timeline-bg)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      <PlaybackControls />
      <PageTabs />

      {/* Scrollable tracks area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Ruler row */}
        <div style={{ display: 'flex', flexShrink: 0 }}>
          {/* Label spacer */}
          <div style={{
            width: RULER_OFFSET,
            flexShrink: 0,
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            height: 24,
          }} />
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: totalDuration * zoom }}>
            <TimelineRuler zoom={zoom} totalDuration={totalDuration} width={totalDuration * zoom} />
            {/* Scrubber positioned within ruler */}
            <TimelineScrubber containerRef={scrollRef} zoom={zoom} totalDuration={totalDuration} />
          </div>
        </div>

        {/* Tracks */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TimelineTrack
            trackType="video"
            elements={pageElements}
            zoom={zoom}
            totalDuration={totalDuration}
          />
          <TimelineTrack
            trackType="audio"
            elements={pageElements}
            zoom={zoom}
            totalDuration={totalDuration}
          />
        </div>
      </div>
    </div>
  );
}
