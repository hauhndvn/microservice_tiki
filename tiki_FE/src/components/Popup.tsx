// src/components/Popup.tsx
'use client'; // Đánh dấu là Client Component vì sử dụng useState và sự kiện client-side

import { useState, useEffect } from 'react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Popup({ isOpen, onClose, children }: PopupProps) {
  // Đóng popup khi nhấn phím Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click lan truyền
      >
        {/* Nút đóng */}
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          ✕
        </button>
        {/* Nội dung popup */}
        {children}
      </div>
    </div>
  );
}