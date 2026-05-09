'use client';

interface TabGroupProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function TabGroup({ tabs, activeTab, onTabChange }: TabGroupProps) {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-md)',
      padding: 2,
      gap: 2,
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            flex: 1,
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: activeTab === tab.id ? 600 : 400,
            background: activeTab === tab.id ? 'var(--accent-blue)' : 'transparent',
            color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
