'use client';

import { Modal } from 'antd';
import Image from "next/image";
import { ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrevious } from '@/lib/hooks';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeInput: (e: ChangeEvent<HTMLInputElement>) => void;
  onLoginClick: () => void;
  errorLogin?: string;
  login?: any;
}

export default function LoginModal({
  isOpen,
  onClose,
  onChangeInput,
  onLoginClick,
  errorLogin,
  login,
}: LoginModalProps) {

  const router = useRouter();
  const prevLogged = usePrevious(login.logged);
  
  useEffect(() => {
    console.log("Login status changed:", login.logged); // debug
    if (prevLogged === false && login.logged === true) {
      const timeout = setTimeout(() => {
        onClose(); // đóng modal nếu cần
        router.push("/cart"); // chuyển hướng
      }, 3000); // ví dụ chờ 3s rồi redirect
      return () => clearTimeout(timeout); // cleanup nếu bị unmount
    }
  }, [login.logged]);
  
  return (
    <Modal
      closable={false}
      title={null}
      open={isOpen}
      onOk={onClose}
      onCancel={onClose}
      footer={null}
      width={950}
      className=''
    >
      <div className='w-full flex flex-row relative'>
        <div
          onClick={onClose}
          className='w-10 h-10 bg-white rounded-full flex justify-center absolute items-center -top-3 -right-3 cursor-pointer font-bold'
        >
          X
        </div>

        <div className='p-16 flex flex-col mb-5 w-[70%]'>
          <div className='flex flex-col gap-5 mb-20'>
            <span className='text-3xl font-semibold'>Xin chào,</span>

            {errorLogin && (
              <span className="text-red-500 text-2xl">{errorLogin}</span>
            )}
            {!errorLogin && !login?.logged && (
              <span className="text-sm">Đăng nhập hoặc Tạo tài khoản</span>
            )}
            {!errorLogin && login?.logged && (
              <span className="text-green-700 text-2xl">
                Bạn đã đăng nhập thành công!
              </span>
            )}

            <input
              onChange={onChangeInput}
              name="username"
              type='text'
              className='outline-none border-b border-blue-500 py-2 text-2xl w-full'
              placeholder='Tên đăng nhập/Số điện thoại/Email'
            />
            <input
              onChange={onChangeInput}
              name="password"
              type='password'
              className='outline-none border-b border-blue-500 py-2 text-2xl w-full'
              placeholder='Password'
            />

            <div onClick={onLoginClick} className='cursor-pointer bg-red-500 p-2 text-white rounded-md flex items-center justify-center text-xl'>
              Tiếp Tục
            </div>

            <span className='text-blue-500 cursor-pointer justify-self-center self-center'>
              Đăng nhập bằng email
            </span>
          </div>

          <div className='self-center w-full flex flex-col gap-3'>
            <div className='flex flex-row gap-2 w-full items-center justify-center'>
              <div className='h-[1px] bg-gray-100 w-[20%]'></div>
              <div className='text-gray-500'>Hoặc tiếp tục bằng</div>
              <div className='h-[1px] bg-gray-100 w-[20%]'></div>
            </div>

            <div className='flex flex-row gap-3 justify-center'>
              <Image alt='gg' src='/gg.png' width={60} height={60} unoptimized />
              <Image alt='fb' src='/fb.png' width={60} height={60} unoptimized />
            </div>

            <span className='w-[85%] mt-5 text-xs text-gray-500'>
              Bằng việc tiếp tục, bạn đã đọc và đồng ý với điều khoản sử dụng và Chính sách bảo mật thông tin cá nhân của Tiki
            </span>
          </div>
        </div>

        <div className='bg-sky-100 w-[30%] rounded-lg'>
          <div className='flex flex-col justify-center items-center h-full'>
            <Image
              className='h-fit mb-7'
              src='/login.png'
              width={200}
              height={100}
              alt='login'
              unoptimized
            />
            <div className='text-blue-600 flex flex-col gap-2 justify-center items-center'>
              <span className='text-lg font-semibold'>
                Mua sắm tại Tiki
              </span>
              <span className='text-sm font-medium'>
                Siêu ưu đãi mỗi ngày
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
