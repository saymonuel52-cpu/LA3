import * as React from 'react';
import { cn } from '../../../lib/utils';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      required = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || React.useId();
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    
    const hasError = !!error;
    
    const baseStyles = 'flex h-11 w-full rounded-lg border bg-[var(--bg-surface)] px-4 py-3 text-base transition-colors placeholder:text-[var(--text-tertiary)] placeholder:italic focus:outline-none focus:border-2 disabled:cursor-not-allowed disabled:bg-[var(--bg-primary)] disabled:text-[var(--text-tertiary)]';
    
    const borderStyle = hasError 
      ? 'border-2 border-[var(--border-error)] focus:border-[var(--border-error)]' 
      : 'border border-[var(--border-default)] focus:border-[var(--border-focus)]';
    
    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <div className={cn('space-y-2', widthStyle)}>
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-1"
          >
            {label}
            {required && <span className="text-[var(--text-error)]" aria-hidden="true">*</span>}
            {required && (
              <span className="sr-only">(обязательное поле)</span>
            )}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)]">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            id={inputId}
            className={cn(
              baseStyles,
              borderStyle,
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              className
            )}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={cn(helperId, errorId)}
            aria-required={required}
            {...props}
          />
          
          {isPassword ? (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2 rounded"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              aria-pressed={showPassword}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)]">
              {rightIcon}
            </div>
          ) : null}
          
          {hasError && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-error)]">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
            </div>
          )}
        </div>
        
        {(helperText || error) && (
          <p 
            id={error ? errorId : helperId}
            className={cn(
              'text-xs',
              error ? 'text-[var(--text-error)]' : 'text-[var(--text-tertiary)]'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  required?: boolean;
  rows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      fullWidth = false,
      required = false,
      rows = 4,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || React.useId();
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    
    const hasError = !!error;
    
    const baseStyles = 'flex min-h-[80px] w-full rounded-lg border bg-[var(--bg-surface)] px-4 py-3 text-base transition-colors placeholder:text-[var(--text-tertiary)] placeholder:italic focus:outline-none focus:border-2 disabled:cursor-not-allowed disabled:bg-[var(--bg-primary)] disabled:text-[var(--text-tertiary)] resize-y';
    
    const borderStyle = hasError 
      ? 'border-2 border-[var(--border-error)] focus:border-[var(--border-error)]' 
      : 'border border-[var(--border-default)] focus:border-[var(--border-focus)]';
    
    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <div className={cn('space-y-2', widthStyle)}>
        {label && (
          <label 
            htmlFor={textareaId}
            className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-1"
          >
            {label}
            {required && <span className="text-[var(--text-error)]" aria-hidden="true">*</span>}
            {required && (
              <span className="sr-only">(обязательное поле)</span>
            )}
          </label>
        )}
        
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            className={cn(
              baseStyles,
              borderStyle,
              className
            )}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={cn(helperId, errorId)}
            aria-required={required}
            {...props}
          />
          
          {hasError && (
            <div className="absolute right-3 top-3 text-[var(--text-error)]">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
            </div>
          )}
        </div>
        
        {(helperText || error) && (
          <p 
            id={error ? errorId : helperId}
            className={cn(
              'text-xs',
              error ? 'text-[var(--text-error)]' : 'text-[var(--text-tertiary)]'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };