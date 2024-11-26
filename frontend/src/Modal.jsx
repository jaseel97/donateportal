// Modal.jsx
import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
      />
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 sm:mx-auto transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;