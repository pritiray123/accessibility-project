import React, { useEffect, useRef } from 'react';

interface AccessibleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export const AccessibleDialog: React.FC<AccessibleDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  triggerRef,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = `dialog-title-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const descId = description ? `dialog-desc-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined;

  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element if triggerRef not provided
    const previousActiveElement = (triggerRef?.current || document.activeElement) as HTMLElement | null;

    // Focus initial element inside modal
    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    // Prevent body scroll while modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Keydown handler for Trap and Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusableArray = Array.from(focusableElements).filter(
          (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
        );

        if (focusableArray.length === 0) return;

        const firstElement = focusableArray[0];
        const lastElement = focusableArray[focusableArray.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      // Restore focus to trigger
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      className="dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="dialog-window"
        tabIndex={-1}
      >
        <header className="dialog-header">
          <h2 id={titleId} className="dialog-title">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="btn-secondary"
            onClick={onClose}
            aria-label={`Close ${title} dialog`}
            style={{ minHeight: '36px', padding: '6px 12px' }}
          >
            Close
          </button>
        </header>

        <div id={descId} className="dialog-body">
          {children}
        </div>

        <footer className="dialog-footer">
          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
            aria-label={`Acknowledge and close ${title}`}
          >
            I have read and understand
          </button>
        </footer>
      </div>
    </div>
  );
};
