'use client';
import TopNavbar from './TopNavbar';
import SidebarNav from '../sidebar/SidebarNav';
import ResourcePanel from '../sidebar/ResourcePanel';
import EditorCanvas from '../canvas/EditorCanvas';
import Timeline from '../timeline/Timeline';
import RightPanel from '../right-panel/RightPanel';
import ExportModal from '../ui/ExportModal';

export default function AppShell() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-primary)',
    }}>
      <TopNavbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar: icon nav + resource panel */}
        <div style={{
          display: 'flex',
          flexShrink: 0,
          borderRight: '1px solid var(--border-color)',
        }}>
          <SidebarNav />
          <ResourcePanel />
        </div>

        {/* Center: canvas + timeline */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg-primary)',
        }}>
          <EditorCanvas />
          <Timeline />
        </div>

        {/* Right panel */}
        <div style={{
          width: 240,
          flexShrink: 0,
          borderLeft: '1px solid var(--border-color)',
          background: 'var(--bg-panel)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <RightPanel />
        </div>
      </div>
      <ExportModal />
    </div>
  );
}
