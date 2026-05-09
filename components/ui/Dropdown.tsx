'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function Dropdown({ options, value, onChange, placeholder = 'Select...' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '5px 10px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: 12,
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {selected?.icon}
          {selected?.label || placeholder}
        </span>
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100,
          overflow: 'hidden',
          animation: 'slideInUp 0.15s ease',
        }}>
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => { onChange(option.value); setOpen(false); }}
              style={{
                width: '100%',
                padding: '7px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: option.value === value ? 'var(--accent-blue)' : 'transparent',
                border: 'none',
                color: option.value === value ? 'white' : 'var(--text-primary)',
                fontSize: 12,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => {
                if (option.value !== value) (e.target as HTMLButtonElement).style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={e => {
                if (option.value !== value) (e.target as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
