'use client';
import React, { useState, useRef, useCallback } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { addPageAnimation, removePageAnimation, updatePageAnimationDuration } from '../../store/slices/pagesSlice';
import { AnimationCategory, AnimationName } from '../../types/editor.types';
import { ENTER_ANIMATIONS, EMPHASIS_ANIMATIONS, EXIT_ANIMATIONS } from '../../constants/animations';
import { playEnterAnimation, playEmphasisAnimation, playExitAnimation } from '../../animations/gsapAnimations';
import TabGroup from '../ui/TabGroup';
import NumberInput from '../ui/NumberInput';

const ANIM_TABS = [
  { id: 'enter', label: 'Enter' },
  { id: 'emphasis', label: 'Emphasis' },
  { id: 'exit', label: 'Exit' },
];

export default function AnimationPanel({ pageId }: { pageId: string }) {
  const dispatch = useAppDispatch();
  const page = useAppSelector(s => s.pages.pages.find(p => p.id === pageId));
  const [activeTab, setActiveTab] = useState<AnimationCategory>('enter');
  const previewRef = useRef<HTMLDivElement>(null);

  // ✅ All hooks must be declared before any early return
  const handleAddAnimation = useCallback((name: AnimationName, duration: number) => {
    dispatch(addPageAnimation({
      pageId,
      animation: {
        id: crypto.randomUUID(),
        name,
        category: activeTab,
        duration,
      },
    }));
  }, [dispatch, pageId, activeTab]);

  // Guard after all hooks
  if (!page) return null;

  const animations = activeTab === 'enter' ? ENTER_ANIMATIONS
    : activeTab === 'emphasis' ? EMPHASIS_ANIMATIONS
    : EXIT_ANIMATIONS;

  const handlePreview = (name: AnimationName, duration: number) => {
    if (!previewRef.current) return;
    if (activeTab === 'enter') playEnterAnimation(previewRef.current, name, duration);
    else if (activeTab === 'emphasis') playEmphasisAnimation(previewRef.current, name, duration);
    else playExitAnimation(previewRef.current, name, duration);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <TabGroup
        tabs={ANIM_TABS}
        activeTab={activeTab}
        onTabChange={id => setActiveTab(id as AnimationCategory)}
      />

      {/* Preview box */}
      <div
        ref={previewRef}
        style={{
          width: '100%', height: 50,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: 'var(--text-muted)',
          overflow: 'hidden',
        }}
      >
        Click animation to preview
      </div>

      {/* Animation list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {animations.map(anim => (
          <div
            key={anim.name}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '5px 6px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={() => handlePreview(anim.name, anim.defaultDuration)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>{anim.icon}</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{anim.label}</span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); handleAddAnimation(anim.name, anim.defaultDuration); }}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 2,
                borderRadius: 'var(--radius-sm)',
                transition: 'all 0.15s',
              }}
              title="Add animation"
              onMouseEnter={e => { (e.currentTarget.style.background = 'var(--accent-blue)'); (e.currentTarget.style.color = 'white'); }}
              onMouseLeave={e => { (e.currentTarget.style.background = 'transparent'); (e.currentTarget.style.color = 'var(--text-muted)'); }}
            >
              <Plus size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Applied animations */}
      {page.animations.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>APPLIED</p>
          {page.animations.map(anim => (
            <div key={anim.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '4px 0', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ChevronDown size={12} color="var(--text-muted)" />
                <span style={{ fontSize: 11, color: 'var(--text-primary)' }}>
                  {ENTER_ANIMATIONS.find(a => a.name === anim.name)?.label ||
                   EMPHASIS_ANIMATIONS.find(a => a.name === anim.name)?.label ||
                   EXIT_ANIMATIONS.find(a => a.name === anim.name)?.label || anim.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Duration</span>
                <NumberInput
                  value={anim.duration}
                  onChange={val => dispatch(updatePageAnimationDuration({ pageId, animationId: anim.id, duration: val }))}
                  min={0.1}
                  max={10}
                  step={0.1}
                />
                <button
                  onClick={() => dispatch(removePageAnimation({ pageId, animationId: anim.id }))}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
