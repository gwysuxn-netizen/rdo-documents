import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'invert';
  label?: string;
}

const sizeMap = {
  sm: 'w-4 h-4 border-[1.5px]',
  md: 'w-6 h-6 border-2',
  lg: 'w-9 h-9 border-[2.5px]',
};

export function Spinner({ size = 'md', variant = 'default', label }: SpinnerProps) {
  const base =
    'rounded-full animate-spin border-gray-200 ' +
    (variant === 'invert' ? 'border-t-white' : 'border-t-gray-900');

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`${sizeMap[size]} ${base} block`}
        role="status"
        aria-label={label ?? 'Loading'}
      />
      {label && (
        <span className="text-sm text-gray-500">{label}</span>
      )}
    </span>
  );
}
