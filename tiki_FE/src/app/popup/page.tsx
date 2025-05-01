// src/popup/page.tsx
'use client'; // Đánh dấu là Client Component vì sử dụng useState

import { useState } from 'react';
import Popup from '@/components/Popup';

export default function Home() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={openPopup}
      >
        Mở Popup
      </button>
      <Popup isOpen={isPopupOpen} onClose={closePopup}>
        <h2 className="text-xl font-bold mb-4">Chào mừng đến với Tiki!</h2>
        <p className="mb-4">Đây là nội dung mẫu của popup. Bạn có thể thêm bất kỳ nội dung nào vào đây.</p>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={closePopup}
        >
          Đóng
        </button>
      </Popup>
    </div>
  );
}