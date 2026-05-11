import * as React from 'react';
import { cn } from '../../../lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
  showCloseButton?: boolean;
  preventCloseOnOverlayClick?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'medium',
  showCloseButton = true,
  preventCloseOnOverlayClick = false,
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      // Trigger animation on next frame
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsMounted(false);
        document.body.style.overflow = '';
      }, 200); // Match animation duration
      
      return () => clearTimeout(timer);
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !preventCloseOnOverlayClick) {
      onClose();
    }
  };

  const sizeStyles = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    full: 'max-w-full mx-4',
  };

  if (!isMounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-[var(--bg-overlay)] transition-opacity duration-200',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      
      {/* Modal container */}
      <div
        ref={modalRef}
        className={cn(
          'relative z-10 w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--bg-surface)] shadow-xl transition-all duration-200',
          sizeStyles[size],
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-[var(--border-default)] p-6">
            <div className="flex-1">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-[var(--text-primary)]"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-1 text-sm text-[var(--text-secondary)]"
                >
                  {description}
                </p>
              )}
            </div>
            
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="ml-4 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2"
                aria-label="Закрыть модальное окно"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  className,
  title,
  description,
  showCloseButton = true,
  onClose,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-b border-[var(--border-default)] pb-4',
        className
      )}
      {...props}
    >
      <div className="flex-1">
        {title && (
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {description}
          </p>
        )}
        {children}
      </div>
      
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-4 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const ModalContent: React.FC<ModalContentProps> = ({ className, ...props }) => (
  <div className={cn('py-4', className)} {...props} />
);

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

const ModalFooter: React.FC<ModalFooterProps> = ({
  className,
  align = 'right',
  ...props
}) => {
  const alignStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 border-t border-[var(--border-default)] pt-4',
        alignStyles[align],
        className
      )}
      {...props}
    />
  );
};

export { Modal, ModalHeader, ModalContent, ModalFooter };