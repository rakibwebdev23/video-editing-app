'use client';
import { useState } from 'react';
import {
  ArrowLeft, ZoomIn, ZoomOut, Undo2, Redo2, Moon, Sun, Upload
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { setCanvasZoom, setExportModalOpen } from '../../store/slices/uiSlice';
import { undo, redo } from '../../store/slices/historySlice';

export default function TopNavbar() {
  const dispatch = useAppDispatch();
  const canvasZoom = useAppSelector(s => s.ui.canvasZoom);
  const canUndo = useAppSelector(s => s.history.canUndo);
  const canRedo = useAppSelector(s => s.history.canRedo);
  const [darkMode, setDarkMode] = useState(true);
  const [templateName] = useState('Template 2025-08-29');

  const zoomPct = isNaN(canvasZoom) ? 100 : Math.round(canvasZoom * 100);

  return (
    <header style={{
      height: 48,
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      gap: 8,
      flexShrink: 0,
      zIndex: 50,
    }}>
      {/* Left: back + name */}
      <button style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'transparent', border: 'none', color: 'var(--text-primary)',
        cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: '4px 6px',
        borderRadius: 'var(--radius-sm)', transition: 'background 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <ArrowLeft size={16} />
        <span>Editor</span>
      </button>

      <div style={{ width: 1, height: 20, background: 'var(--border-color)', margin: '0 4px' }} />

      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, minWidth: 160 }}>
        {templateName}
      </span>

      {/* Center: zoom */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <button
          className="btn-icon"
          onClick={() => dispatch(setCanvasZoom(canvasZoom - 0.1))}
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <span style={{
          fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
          minWidth: 44, textAlign: 'center',
        }}>
          {zoomPct}%
        </span>
        <button
          className="btn-icon"
          onClick={() => dispatch(setCanvasZoom(canvasZoom + 0.1))}
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
      </div>

      {/* Right: undo/redo, dark mode, update */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          className="btn-icon"
          disabled={!canUndo}
          onClick={() => dispatch(undo())}
          title="Undo"
        >
          <Undo2 size={16} />
        </button>
        <button
          className="btn-icon"
          disabled={!canRedo}
          onClick={() => dispatch(redo())}
          title="Redo"
        >
          <Redo2 size={16} />
        </button>

        <div style={{ width: 1, height: 20, background: 'var(--border-color)', margin: '0 4px' }} />

        <button
          className="btn-icon"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button className="btn-primary" style={{ marginLeft: 4 }}>
          <Upload size={14} />
          Update
        </button>

        <button 
          className="btn-primary" 
          style={{ marginLeft: 4, background: 'var(--accent-green)' }}
          onClick={() => dispatch(setExportModalOpen(true))}
        >
          <Upload size={14} style={{ transform: 'rotate(180deg)' }} />
          Export
        </button>
      </div>
    </header>
  );
}
