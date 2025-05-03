/**
 * Modal Component
 * Reusable modal dialog for displaying content over the main UI
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
// Import Framer Motion for smooth transitions
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

/**
 * Modal component
 * @param props Modal properties including open state, title, and content
 * @returns Modal dialog component
 */
export function Modal({ isOpen, onClose, title, children, maxWidth = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Handle escape key press
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle overlay click (close when clicking outside modal)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Width classes based on maxWidth prop
  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full'
  };

  // Don't render if modal is not open (handled by AnimatePresence)
  if (!isOpen) return null;

  // Use createPortal to render modal at the end of the document body
  return createPortal(
    // AnimatePresence enables exit animations when the modal is removed
    <AnimatePresence>
      {isOpen && (
        // Overlay with glassmorphism and fade-in/out transition
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/30 backdrop-blur-md"
          onClick={handleOverlayClick}
          ref={overlayRef}
        >
          {/* Modal content with scale and fade transition */}
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className={`bg-white rounded-lg shadow-xl ${maxWidthClasses[maxWidth as keyof typeof maxWidthClasses]} w-full`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-200">
              {/* Modal title with increased letter spacing for better readability */}
              <h3 id="modal-title" className="text-3xl font-bold text-gray-900 tracking-wider">{title}</h3>
            </div>

            {/* Modal content */}
            <div className="px-6 py-4">
              {children}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-3 bg-gray-50 flex justify-end rounded-b-lg">
              {/* Use Shadcn UI Button for modal close */}
              <Button variant="outline" onClick={onClose} type="button">
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
