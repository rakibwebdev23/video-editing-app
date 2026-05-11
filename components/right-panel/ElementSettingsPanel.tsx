'use client';
import { useState } from 'react';
import gsap from 'gsap';
import { Trash2, Lock, Unlock, ArrowUp, ArrowRight, ArrowDown, ArrowLeft, Move, Volume2, Scissors } from 'lucide-react';
import { ElementType } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import {
  updateElementFillMode,
  updateElementFreePosition, updateElementXY, updateElementWidthHeight,
  removeElement, updateElementVolume, updateElementFadeIn, updateElementFadeOut,
  updateElementDuration, splitElement,
} from '../../store/slices/elementsSlice';
import { removeElementFromPage } from '../../store/slices/pagesSlice';
import { clearSelection } from '../../store/slices/selectionSlice';
import { FillMode, AnimationCategory, AnimationName } from '../../types/editor.types';
import { ENTER_ANIMATIONS, EMPHASIS_ANIMATIONS, EXIT_ANIMATIONS, ALL_ANIMATIONS } from '../../constants/animations';
import { setElementAnimation, removeElementAnimation, updateElementAnimationDuration } from '../../store/slices/elementsSlice';
import Toggle from '../ui/Toggle';
import Dropdown from '../ui/Dropdown';
import NumberInput from '../ui/NumberInput';
import TabGroup from '../ui/TabGroup';
import { playEnterAnimation, playEmphasisAnimation, playExitAnimation } from '../../animations/gsapAnimations';

const FILL_OPTIONS: { value: FillMode; label: string }[] = [
  { value: 'fill', label: 'Fill' },
  { value: 'fit', label: 'Fit' },
  { value: 'stretch', label: 'Stretch' },
  { value: 'center', label: 'Center' },
];

export default function ElementSettingsPanel({ elementId }: { elementId: string }) {
  const dispatch = useAppDispatch();
  const element = useAppSelector(s => s.elements.elements.find(e => e.id === elementId));
  const activePageId = useAppSelector(s => s.pages.activePageId);
  const currentTime = useAppSelector(s => s.timeline.currentTime);
  const [aspectLocked, setAspectLocked] = useState(false);
  const [activeAnimTab, setActiveAnimTab] = useState<AnimationCategory>('enter');

  if (!element) return null;

  const handleSplitAtPlayhead = () => {
    dispatch(splitElement({ id: elementId, splitTime: currentTime }));
  };

  const handlePreview = (name: AnimationName, category: AnimationCategory, duration: number) => {
    const el = document.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement;
    if (!el) return;
    
    // Clear previous animations
    gsap.killTweensOf(el);
    gsap.set(el, { clearProps: 'all' });

    if (category === 'enter') playEnterAnimation(el, name, duration);
    else if (category === 'exit') playExitAnimation(el, name, duration);
    else playEmphasisAnimation(el, name, duration);
  };

  const handleDelete = () => {
    dispatch(removeElement(elementId));
    dispatch(removeElementFromPage({ pageId: activePageId, elementId }));
    dispatch(clearSelection());
  };

  const isAudio = element.type === 'audio';
  const isShape = element.type === 'shape';

  const formatDurationDisplay = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>

      {/* Top action icons: copy, bring-forward, send-back, delete */}
      <div className="panel-section" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {/* Copy */}
        <button className="btn-icon" title="Duplicate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        {/* Bring forward */}
        <button className="btn-icon" title="Bring Forward">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="8" y="8" width="13" height="13" rx="2"/><rect x="3" y="3" width="13" height="13" rx="2" fill="var(--bg-secondary)"/>
          </svg>
        </button>
        {/* Send back */}
        <button className="btn-icon" title="Send Backward">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="13" height="13" rx="2"/><rect x="8" y="8" width="13" height="13" rx="2" fill="var(--bg-secondary)"/>
          </svg>
        </button>
        <button className="btn-icon" title="Delete" style={{ marginLeft: 'auto', color: 'var(--accent-red)' }} onClick={handleDelete}>
          <Trash2 size={14} />
        </button>
      </div>

      {/* Thumbnail (for images/video) */}
      {element.thumbnail && !isShape && (
        <div className="panel-section">
          <div style={{
            position: 'relative',
            width: '100%', height: 80,
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            background: 'var(--bg-card)',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={element.thumbnail} alt={element.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              style={{
                position: 'absolute', top: 4, right: 4,
                background: 'rgba(0,0,0,0.6)', border: 'none',
                borderRadius: 3, padding: '2px 5px', cursor: 'pointer', color: 'white', fontSize: 11,
              }}
              onClick={handleDelete}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Audio-specific: Volume */}
      {isAudio && (
        <div className="panel-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Volume2 size={13} color="var(--text-muted)" />
              <p className="label-sm">Volume</p>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 600 }}>
              {element.volume ?? 75}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={element.volume ?? 75}
            onChange={e => dispatch(updateElementVolume({ id: elementId, volume: parseInt(e.target.value) }))}
            style={{
              width: '100%',
              accentColor: 'var(--accent-blue)',
              cursor: 'pointer',
            }}
          />
        </div>
      )}

      {/* Audio: Fade In */}
      {isAudio && (
        <div className="panel-section">
          <p className="label-sm" style={{ marginBottom: 8 }}>Fade In</p>
          <NumberInput
            value={element.fadeIn ?? 1.5}
            onChange={val => dispatch(updateElementFadeIn({ id: elementId, fadeIn: val }))}
            min={0}
            max={30}
            step={0.1}
            suffix="s"
          />
        </div>
      )}

      {/* Audio: Fade Out */}
      {isAudio && (
        <div className="panel-section">
          <p className="label-sm" style={{ marginBottom: 8 }}>Fade Out</p>
          <NumberInput
            value={element.fadeOut ?? 1.5}
            onChange={val => dispatch(updateElementFadeOut({ id: elementId, fadeOut: val }))}
            min={0}
            max={30}
            step={0.1}
            suffix="s"
          />
        </div>
      )}

      {/* Fill mode (for images/video/shapes) */}
      {!isAudio && !isShape && (
        <div className="panel-section">
          <p className="label-sm" style={{ marginBottom: 8 }}>Fill</p>
          <Dropdown
            options={FILL_OPTIONS}
            value={element.fillMode}
            onChange={val => dispatch(updateElementFillMode({ id: elementId, fillMode: val as FillMode }))}
          />
        </div>
      )}

      {/* Duration & Timing */}
      <div className="panel-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p className="label-sm">Duration & Timing</p>
          {(element.type === 'video' || element.type === 'audio') && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              Total: {formatDurationDisplay(element.duration)}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>Duration (sec)</p>
            <input
              className="input-field"
              type="number"
              step={0.1}
              value={element.duration}
              onChange={e => dispatch(updateElementDuration({ id: elementId, duration: parseFloat(e.target.value) || 0.1 }))}
              style={{ textAlign: 'center', fontFamily: 'monospace' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>Start (sec)</p>
            <input
              className="input-field"
              type="number"
              step={0.1}
              value={element.startTime}
              readOnly
              style={{ textAlign: 'center', fontFamily: 'monospace', opacity: 0.7 }}
            />
          </div>
        </div>

        <button 
          className="btn-ghost" 
          style={{ 
            width: '100%', 
            fontSize: 11, 
            height: 32, 
            border: '1px solid var(--border-color)',
            justifyContent: 'center',
            gap: 6
          }}
          onClick={handleSplitAtPlayhead}
        >
          <Scissors size={12} />
          Split Clip at Playhead
        </button>
      </div>

      {/* Free Position — only for non-audio */}
      {!isAudio && (
        <div className="panel-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p className="label-sm">Free Position</p>
            <Toggle
              checked={element.freePosition}
              onChange={val => dispatch(updateElementFreePosition({ id: elementId, freePosition: val }))}
            />
          </div>
        </div>
      )}

      {/* Position */}
      {!isAudio && (
        <div className="panel-section">
          <p className="label-sm" style={{ marginBottom: 8 }}>Position</p>
          {/* Arrow grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginBottom: 8, width: 80, margin: '0 auto 8px' }}>
            {([
              null, ArrowUp, null,
              ArrowLeft, Move, ArrowRight,
              null, ArrowDown, null,
            ] as (ElementType | null)[]).map((Icon, i) => Icon ? (
              <button key={i} className="btn-icon" style={{ padding: 4 }}><Icon size={12} /></button>
            ) : <div key={i} />)}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>X-Axis</p>
              <input
                className="input-field"
                type="number"
                value={Math.round(element.x)}
                onChange={e => dispatch(updateElementXY({ id: elementId, x: parseInt(e.target.value) || 0 }))}
                style={{ textAlign: 'center', fontFamily: 'monospace' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>Y-Axis</p>
              <input
                className="input-field"
                type="number"
                value={Math.round(element.y)}
                onChange={e => dispatch(updateElementXY({ id: elementId, y: parseInt(e.target.value) || 0 }))}
                style={{ textAlign: 'center', fontFamily: 'monospace' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Size */}
      {!isAudio && (
        <div className="panel-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p className="label-sm">Size</p>
            <button
              className="btn-icon"
              onClick={() => setAspectLocked(!aspectLocked)}
              title={aspectLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
              style={{ color: aspectLocked ? 'var(--accent-blue)' : 'var(--text-muted)' }}
            >
              {aspectLocked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>Width</p>
              <input
                className="input-field"
                type="number"
                value={Math.round(element.width)}
                onChange={e => {
                  const w = parseInt(e.target.value) || 1;
                  const h = aspectLocked ? Math.round(w * (element.height / element.width)) : element.height;
                  dispatch(updateElementWidthHeight({ id: elementId, width: w, height: h }));
                }}
                style={{ textAlign: 'center', fontFamily: 'monospace' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>Height</p>
              <input
                className="input-field"
                type="number"
                value={Math.round(element.height)}
                onChange={e => {
                  const h = parseInt(e.target.value) || 1;
                  const w = aspectLocked ? Math.round(h * (element.width / element.height)) : element.width;
                  dispatch(updateElementWidthHeight({ id: elementId, width: w, height: h }));
                }}
                style={{ textAlign: 'center', fontFamily: 'monospace' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      {!isAudio && (
        <div className="panel-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p className="label-sm">Animations</p>
          </div>
          
          <TabGroup
            tabs={[
              { id: 'enter', label: 'In' },
              { id: 'exit', label: 'Out' },
              { id: 'emphasis', label: 'Combo' },
            ]}
            activeTab={activeAnimTab}
            onTabChange={id => setActiveAnimTab(id as AnimationCategory)}
          />

          <div style={{ marginTop: 12 }}>
            {/* Current category selection */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 8, 
              maxHeight: 200, 
              overflowY: 'auto',
              padding: '4px'
            }}>
              {(activeAnimTab === 'enter' ? ENTER_ANIMATIONS : 
                activeAnimTab === 'exit' ? EXIT_ANIMATIONS : 
                EMPHASIS_ANIMATIONS).map(anim => {
                  const isApplied = element.animations.some(a => a.category === activeAnimTab && a.name === anim.name);
                  return (
                    <button
                      key={anim.name}
                      onClick={() => {
                        dispatch(setElementAnimation({
                          elementId: element.id,
                          animation: {
                            id: `anim-${Date.now()}`,
                            name: anim.name as AnimationName,
                            category: activeAnimTab,
                            duration: anim.defaultDuration
                          }
                        }));
                        handlePreview(anim.name as AnimationName, activeAnimTab, anim.defaultDuration);
                      }}
                      className={isApplied ? 'btn-primary' : 'btn-ghost'}
                      style={{ 
                        flexDirection: 'column', 
                        height: 'auto', 
                        padding: '8px 4px', 
                        gap: 4,
                        border: isApplied ? 'none' : '1px solid var(--border-color)',
                        background: isApplied ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                        fontSize: 10,
                        borderRadius: 6
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{anim.icon}</span>
                      <span style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        width: '100%'
                      }}>
                        {anim.label}
                      </span>
                    </button>
                  );
                })}
            </div>

            {/* Applied animations settings */}
            <div style={{ marginTop: 16, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
                APPLIED {activeAnimTab.toUpperCase()}
              </p>
              {element.animations.filter(a => a.category === activeAnimTab).length === 0 ? (
                <p style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                  No {activeAnimTab} animation applied
                </p>
              ) : (
                element.animations.filter(a => a.category === activeAnimTab).map(anim => (
                  <div key={anim.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary)' }}>
                        {ALL_ANIMATIONS.find(a => a.name === anim.name)?.label || anim.name}
                      </span>
                      <button 
                        className="btn-icon" 
                        style={{ color: 'var(--accent-red)' }}
                        onClick={() => dispatch(removeElementAnimation({ elementId: element.id, animationId: anim.id }))}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Duration</span>
                      <div style={{ flex: 1 }}>
                        <NumberInput
                          value={anim.duration}
                          onChange={val => dispatch(updateElementAnimationDuration({ elementId: element.id, animationId: anim.id, duration: val }))}
                          min={0.1}
                          max={5}
                          step={0.1}
                          suffix="s"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
