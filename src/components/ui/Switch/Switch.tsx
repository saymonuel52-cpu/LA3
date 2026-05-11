'use client';

import * as React from 'react';
import { cn } from '../../../lib/utils';

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ 
    className, 
    checked, 
    onCheckedChange, 
    disabled = false,
    size = 'medium',
    ...props 
  }, ref) => {
    const handleClick = () => {
      if (!disabled) {
        onCheckedChange(!checked);
      }
    };

    const sizeClasses = {
      small: 'h-5 w-9',
      medium: 'h-6 w-11',
      large: 'h-7 w-14',
    };

    const knobSizeClasses = {
      small: 'h-4 w-4',
      medium: 'h-5 w-5',
      large: 'h-6 w-6',
    };

    const knobTranslateClasses = {
      small: checked ? 'translate-x-4' : 'translate-x-1',
      medium: checked ? 'translate-x-5' : 'translate-x-1',
      large: checked ? 'translate-x-7' : 'translate-x-1',
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={cn(
          'inline-flex items-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          checked 
            ? 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]' 
            : 'bg-gray-300 dark:bg-gray-600',
          sizeClasses[size],
          className
        )}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            'inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200',
            knobSizeClasses[size],
            knobTranslateClasses[size]
          )}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };