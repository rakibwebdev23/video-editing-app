'use client';
import { Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { updatePageTransition } from '../../store/slices/pagesSlice';
import { TransitionName } from '../../types/editor.types';
import NumberInput from '../ui/NumberInput';
import Dropdown from '../ui/Dropdown';

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

export default function TransitionPanel({ pageId }: { pageId: string }) {
  const dispatch = useAppDispatch();
  const page = useAppSelector(s => s.pages.pages.find(p => p.id === pageId));

  if (!page) return null;

  const transition = page.transition || { name: 'none', duration: 1.5 };

  const handleClear = () => {
    dispatch(updatePageTransition({ pageId, transition: { name: 'none', duration: 1.5 } }));
  };

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {/* Header row with delete */}
      <div className="panel-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p className="label-sm">Transition</p>
        <button
          className="btn-icon"
          style={{ color: 'var(--accent-red)' }}
          onClick={handleClear}
          title="Remove Transition"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Transition type */}
      <div className="panel-section">
        <p className="label-sm" style={{ marginBottom: 8 }}>Transition</p>
        <Dropdown
          options={TRANSITION_OPTIONS}
          value={transition.name}
          onChange={val => dispatch(updatePageTransition({
            pageId,
            transition: { ...transition, name: val as TransitionName },
          }))}
        />
      </div>

      {/* Duration */}
      <div className="panel-section">
        <p className="label-sm" style={{ marginBottom: 8 }}>Duration</p>
        <NumberInput
          value={transition.duration}
          onChange={val => dispatch(updatePageTransition({
            pageId,
            transition: { ...transition, duration: val },
          }))}
          min={0.1}
          max={10}
          step={0.1}
          suffix="s"
        />
      </div>
    </div>
  );
}
