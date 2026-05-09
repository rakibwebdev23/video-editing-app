'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
}

export default function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      {label && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>}
      <div
        className="toggle-track"
        style={{ background: checked ? 'var(--accent-blue)' : 'var(--border-color)' }}
        onClick={() => onChange(!checked)}
      >
        <div
          className="toggle-thumb"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </div>
    </label>
  );
}
