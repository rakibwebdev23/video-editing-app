'use client';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface NumberInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export default function NumberInput({ value, onChange, min = 0, max = 9999, step = 0.1, suffix }: NumberInputProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
      <input
        type="number"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: 12,
          padding: '4px 6px',
          width: '60px',
          outline: 'none',
          textAlign: 'center',
        }}
      />
      {suffix && <span style={{ fontSize: 11, color: 'var(--text-muted)', paddingRight: 4 }}>{suffix}</span>}
      <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-color)' }}>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: '1px 4px', lineHeight: 1 }}
        >
          <ChevronUp size={10} />
        </button>
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: '1px 4px', lineHeight: 1 }}
        >
          <ChevronDown size={10} />
        </button>
      </div>
    </div>
  );
}
