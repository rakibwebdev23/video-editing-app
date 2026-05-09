'use client';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { deletePage, updatePageTransition } from '../../store/slices/pagesSlice';
import { removePageElements } from '../../store/slices/elementsSlice';
import LayoutSelector from './LayoutSelector';
import BackgroundPicker from './BackgroundPicker';
import DurationInput from './DurationInput';
import AnimationPanel from './AnimationPanel';
import Dropdown from '../ui/Dropdown';
import { TransitionName } from '../../types/editor.types';

const TRANSITION_OPTIONS: { value: TransitionName; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'slideLeft', label: 'Slide left' },
  { value: 'slideRight', label: 'Slide right' },
  { value: 'slideUp', label: 'Slide up' },
  { value: 'slideDown', label: 'Slide down' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'flip', label: 'Flip' },
  { value: 'rotate', label: 'Rotate' },
  { value: 'wipe', label: 'Wipe' },
];

export default function PageSettingsPanel({ pageId }: { pageId: string }) {
  const dispatch = useAppDispatch();
  const page = useAppSelector(s => s.pages.pages.find(p => p.id === pageId));
  const totalPages = useAppSelector(s => s.pages.pages.length);
  const [showAnim, setShowAnim] = useState(true);

  if (!page) return null;

  const handleDeletePage = () => {
    if (totalPages <= 1) return;
    dispatch(removePageElements(pageId));
    dispatch(deletePage(pageId));
  };

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {/* Top icon actions: duplicate, bring-forward, send-back, delete */}
      <div className="panel-section" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {/* Duplicate */}
        <button className="btn-icon" title="Duplicate Page">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        {/* Bring to front */}
        <button className="btn-icon" title="Bring to Front">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 11 12 6 7 11"/><line x1="12" y1="18" x2="12" y2="6"/>
          </svg>
        </button>
        {/* Send to back */}
        <button className="btn-icon" title="Send to Back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="7 13 12 18 17 13"/><line x1="12" y1="6" x2="12" y2="18"/>
          </svg>
        </button>
        <button
          className="btn-icon"
          title="Delete Page"
          style={{ marginLeft: 'auto', color: 'var(--accent-red)' }}
          onClick={handleDeletePage}
          disabled={totalPages <= 1}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Layout */}
      <div className="panel-section">
        <p className="label-sm" style={{ marginBottom: 8 }}>Layout</p>
        <LayoutSelector pageId={pageId} />
      </div>

      {/* Background */}
      <div className="panel-section">
        <p className="label-sm" style={{ marginBottom: 8 }}>Background</p>
        <div style={{ marginBottom: 8 }}>
          <select className="select-field">
            <option>Color</option>
            <option>Gradient</option>
            <option>Image</option>
          </select>
        </div>
        <BackgroundPicker pageId={pageId} />
      </div>

      {/* Duration */}
      <div className="panel-section">
        <p className="label-sm" style={{ marginBottom: 8 }}>Duration</p>
        <DurationInput pageId={pageId} />
      </div>

      {/* Page Transition */}
      <div className="panel-section">
        <p className="label-sm" style={{ marginBottom: 8 }}>Page Transition</p>
        <Dropdown
          options={TRANSITION_OPTIONS}
          value={page.transition?.name || 'none'}
          onChange={val => dispatch(updatePageTransition({ 
            pageId, 
            transition: { name: val as TransitionName, duration: page.transition?.duration || 1.5 } 
          }))}
        />
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
          Animation that occurs when this scene appears.
        </p>
      </div>

      {/* Animation */}
      <div className="panel-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p className="label-sm">Animation</p>
          <button
            onClick={() => setShowAnim(!showAnim)}
            className="btn-icon"
            style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-blue)', color: 'white' }}
          >
            <Plus size={12} />
          </button>
        </div>
        {showAnim && <AnimationPanel pageId={pageId} />}
      </div>
    </div>
  );
}
