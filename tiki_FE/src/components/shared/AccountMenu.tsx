import { useState, useEffect, useRef } from "react";
import { useDispatch } from 'react-redux';
import { loggedOut } from '@/lib/reducers/auth';
import { useRouter } from 'next/navigation';

export default function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const clickLogout = ()=>{
    dispatch(loggedOut());
    router.push("/");
  };
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="font-medium text-sm"
        onClick={toggleMenu}
      >
        Tài khoản
      </button>

      {isOpen && (
        <ul className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg text-sm z-50">
          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Thông tin tài khoản</li>
          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Đơn hàng của tôi</li>
          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Trung tâm hỗ trợ</li>
          <li onClick={clickLogout} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500">Đăng xuất</li>
        </ul>
      )}
    </div>
  );
}
