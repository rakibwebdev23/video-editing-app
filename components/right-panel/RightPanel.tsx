'use client';
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useAppSelector } from '../../store/editorStore';
import PageSettingsPanel from './PageSettingsPanel';
import ElementSettingsPanel from './ElementSettingsPanel';
import TransitionPanel from './TransitionPanel';
import ProjectSettingsPanel from './ProjectSettingsPanel';

type RightTab = 'settings' | 'transition' | 'project';

export default function RightPanel() {
  const activePageId = useAppSelector(s => s.pages.activePageId);
  const activePage = useAppSelector(s => s.pages.pages.find(p => p.id === s.pages.activePageId));
  const selectedIds = useAppSelector(s => s.selection.selectedElementIds);
  const hasSelection = selectedIds.length > 0;
  const firstSelectedId = selectedIds[0];
  const selectedElement = useAppSelector(s =>
    s.elements.elements.find(e => e.id === firstSelectedId)
  );
  const [rightTab, setRightTab] = useState<RightTab>('settings');

  const headerName = hasSelection && selectedElement
    ? selectedElement.name
    : activePage?.name || 'Page';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {headerName}
        </span>
        <button className="btn-icon" title="Rename">
          <Pencil size={13} />
        </button>
      </div>

      {/* Tab switcher — only show for page (no element selected) */}
      {!hasSelection && (
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0,
        }}>
          {(['settings', 'transition', 'project'] as RightTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setRightTab(tab)}
              style={{
                flex: 1,
                padding: '7px 0',
                border: 'none',
                background: 'transparent',
                fontSize: 11,
                fontWeight: rightTab === tab ? 600 : 400,
                color: rightTab === tab ? 'var(--accent-blue)' : 'var(--text-muted)',
                cursor: 'pointer',
                borderBottom: rightTab === tab ? '2px solid var(--accent-blue)' : '2px solid transparent',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Panel content */}
      {hasSelection && firstSelectedId
        ? <ElementSettingsPanel elementId={firstSelectedId} />
        : rightTab === 'transition'
          ? <TransitionPanel pageId={activePageId} />
          : rightTab === 'project'
            ? <ProjectSettingsPanel />
            : <PageSettingsPanel pageId={activePageId} />
      }
    </div>
  );
}
