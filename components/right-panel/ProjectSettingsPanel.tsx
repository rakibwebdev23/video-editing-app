'use client';
import React from 'react';
import { Clock, Info } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { setTotalDuration } from '../../store/slices/timelineSlice';

export default function ProjectSettingsPanel() {
  const dispatch = useAppDispatch();
  const { totalDuration } = useAppSelector(s => s.timeline);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      dispatch(setTotalDuration(val));
    }
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="panel-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Clock size={16} color="var(--accent-blue)" />
          <h4 style={{ fontSize: 13, fontWeight: 600 }}>Project Timeline</h4>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label className="label-sm">Total Video Duration (seconds)</label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              className="select-field"
              value={totalDuration}
              onChange={handleDurationChange}
              min={1}
              max={3600}
              style={{ width: '100%', paddingRight: 40 }}
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-muted)' }}>
              sec
            </span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Maximum duration: 60 minutes (3600s)
          </p>
        </div>
      </div>

      <div style={{ 
        background: 'rgba(59,130,246,0.05)', 
        padding: 12, 
        borderRadius: 8, 
        border: '1px solid rgba(59,130,246,0.1)',
        display: 'flex',
        gap: 10
      }}>
        <Info size={16} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Changing the total duration updates the timeline workspace. Elements beyond this time will still exist but won&apos;t be visible during playback.
        </p>
      </div>
    </div>
  );
}
