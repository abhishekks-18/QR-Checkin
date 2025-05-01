/**
 * Modal Component
 * Reusable modal dialog for displaying content over the main UI
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

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
  
  // Don't render if modal is not open
  if (!isOpen) return null;
  
  // Use createPortal to render modal at the end of the document body
  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleOverlayClick}
      ref={overlayRef}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl ${maxWidthClasses[maxWidth as keyof typeof maxWidthClasses]} w-full`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 id="modal-title" className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        
        {/* Modal content */}
        <div className="px-6 py-4">
          {children}
        </div>
        
        {/* Modal footer */}
        <div className="px-6 py-3 bg-gray-50 flex justify-end rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
} 