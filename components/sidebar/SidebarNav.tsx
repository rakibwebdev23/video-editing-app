'use client';
import React from 'react';
import { Upload, Layers, Radio } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { setSidebarTab } from '../../store/slices/uiSlice';
import { SidebarTab } from '../../types/editor.types';

const TABS: { id: SidebarTab; icon: React.ReactNode; label: string }[] = [
  { id: 'upload', icon: <Upload size={20} />, label: 'Upload' },
  { id: 'elements', icon: <Layers size={20} />, label: 'Elements' },
  { id: 'live', icon: <Radio size={20} />, label: 'Live' },
];

export default function SidebarNav() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(s => s.ui.sidebarTab);

  return (
    <div style={{
      width: 56,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 12,
      gap: 4,
    }}>
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => dispatch(setSidebarTab(tab.id))}
          title={tab.label}
          style={{
            width: 44,
            height: 44,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            background: activeTab === tab.id ? 'var(--accent-blue)' : 'transparent',
            color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
            fontSize: 9,
          }}
          onMouseEnter={e => {
            if (activeTab !== tab.id) (e.currentTarget.style.background = 'var(--bg-hover)');
          }}
          onMouseLeave={e => {
            if (activeTab !== tab.id) (e.currentTarget.style.background = 'transparent');
          }}
        >
          {tab.icon}
          <span style={{ fontSize: 9, fontWeight: 500 }}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
