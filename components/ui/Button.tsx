'use client';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'icon' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', size = 'md', children, className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        variant === 'primary' && 'btn-primary',
        variant === 'ghost' && 'btn-ghost',
        variant === 'icon' && 'btn-icon',
        variant === 'danger' && 'btn-icon !text-red-400 hover:!bg-red-400/10 hover:!text-red-300',
        size === 'sm' && 'text-xs',
        size === 'lg' && 'text-sm px-5 py-2',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
