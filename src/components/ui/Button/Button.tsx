import * as React from 'react';
import { cn } from '../../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'large' | 'medium' | 'small';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'medium',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
    
    const variantStyles = {
      primary: 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white hover:opacity-90 shadow-sm hover:shadow-md',
      secondary: 'bg-white text-[#8B5CF6] border border-[#8B5CF6] hover:bg-[#F8FAFC]',
      outline: 'bg-transparent text-[#8B5CF6] border border-[#E2E8F0] hover:border-[#8B5CF6] hover:bg-[#F8FAFC]',
      ghost: 'bg-transparent text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]',
      destructive: 'bg-[#EF4444] text-white hover:opacity-90',
    };

    const sizeStyles = {
      large: 'h-12 px-6 text-base',
      medium: 'h-10 px-5 text-base',
      small: 'h-8 px-4 text-sm',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          widthStyle,
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {!isLoading && leftIcon && (
          <span className="mr-2" aria-hidden="true">{leftIcon}</span>
        )}
        <span className="whitespace-nowrap">{children}</span>
        {!isLoading && rightIcon && (
          <span className="ml-2" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };