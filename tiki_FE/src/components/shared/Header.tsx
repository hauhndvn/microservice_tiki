'use client';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import { Input } from './Input';
import {
  MagnifyingGlassIcon,
  HomeIcon,
  ShoppingCartIcon,
  CheckBadgeIcon,
  CubeIcon,
  TruckIcon,
  TagIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/20/solid';
import { MapPinIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useSelector, useDispatch } from 'react-redux';
import { loggedIn } from '@/lib/reducers/auth';
import { RootState } from '@/lib/store';
import { loginCustomer } from '@/services/Api';
import { CustomerLogin } from '@/dto/tikiDto';
import AccountMenu from './AccountMenu';
import LoginModal from '@/components/shared/LoginModal';

export const Header = () => {
  const router = useRouter();
  const refSearch = useRef<any>();

  const [isModalOpen, setIsModalOpen] = useState(false);

//---- Tìm kiếm theo tên sản phẩm hoặc tên shop ----
  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(refSearch);

    if (refSearch.current) refSearch.current.value = e.target.value;
  };

  const handleSearch = () => {
    console.log(refSearch.current.value);
    router.push(`/search?title=${refSearch.current.value}`);
  };
//----- Đăng nhập / Đăng ký-----
    const [formInputs, setFormInputs] = useState<CustomerLogin>({
      username: '',
      password: '',
    });
    const [errorLogin, setErrorLogin] = useState("");
    const changeFormInputs = (e: React.ChangeEvent<HTMLInputElement>)=>{
      const { name, value }= e.target;
      // return setFormInputs({ ...formInputs, [name]: value});
      setFormInputs(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    const clickLogin = ()=>{
      loginCustomer(formInputs)
      .then(({data})=>{
        dispatch(loggedIn({...data.customer, accessToken: data.Authorization?.split(" ")[1]}))
      })
      .catch((error)=>{
        if (error.response && error.response.data && error.response.data.message){
          const errorMessage = error.response.data.message;
          console.log("errorMessage");
          console.log(errorMessage);
          
          if (errorMessage === "Mật khẩu không đúng"){
            return setErrorLogin("Mật khẩu không đúng");
          }
          if (errorMessage === "Email/Phone/Username không tồn tại"){
            return setErrorLogin("Email/Phone/Username không tồn tại");
          }
        }
        return setErrorLogin("Có lỗi xảy ra, vui lòng thử lại");
        // return console.log(error);
      })
    }
    const handleClose = () => {
      setIsModalOpen(false);
    };
    const dispatch = useDispatch();
    const login = useSelector((state: RootState)=> state.Auth.login);

    const totalCart = useSelector((state: RootState)=> {
      return state.Cart.items.reduce((total, item)=> total + item.qty, 0);
    });

  return (
    <div className='bg-white border-b border-gray-200'>
      <nav className='flex flex-row items-center h-fit gap-1 justify-center pt-3 border-b pb-2.5'>
        <Link
          href='/'
          className='w-fit flex items-center justify-center flex-col mr-10'
        >
          <Image
            src='/logo.png'
            alt='Tiki'
            width={96}
            height={40}
            className=''
            unoptimized
          />
          <span className='text-[#053B8E] font-semibold text-sm mt-1'>
            Tốt & Nhanh
          </span>
        </Link>
        <div className='flex flex-col'>
          <div className='flex flex-row'>
            <Input
              ref={refSearch}
              onKeyUp={(event) => {
                if (event.key === 'Enter') {
                  handleSearch();
                }
              }}
              button={
                <button
                  onClick={() => {
                    handleSearch();
                  }}
                >
                  Tìm kiếm
                </button>
              }
              className='w-[58rem]'
              icon={<MagnifyingGlassIcon className='size-5 text-gray-500' />}
              placeholder='Bạn tìm kiếm gì hôm nay?'
            />

            <div className='flex flex-row gap-2 self-start ml-20'>
              <Link
                href='/'
                className='flex flex-row gap-1 cursor-pointer hover:bg-[#0a68ff33] font-medium w-fit p-2 rounded text-sm items-center justify-center'
              >
                <HomeIcon className='size-6 text-[#0560D9]' />
                <span className='text-blue-500'>Trang chủ</span>
              </Link>
              {/* START on/off menu */}
              {
                login?.logged ? (
                  <div className='relative flex flex-row gap-1 cursor-pointer hover:bg-[#0a68ff33]  w-fit p-2 rounded text-sm items-center justify-center '>
                    <FaceSmileIcon className='size-6 text-gray-500' />
                    <AccountMenu />
                  </div>
                ):(
                  <div
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                  className='relative flex flex-row gap-1 cursor-pointer hover:bg-[#0a68ff33]  w-fit p-2 rounded text-sm items-center justify-center '
                >
                  <FaceSmileIcon className='size-6 text-gray-500' />
                  <span className='text-gray-500'>Tài khoản</span>
                </div>
                )
              }
              {/* END on/off menu */}
              {/* Giỏ hàng */}
              {
                login?.logged 
                ? (<Link
                  href='/cart'
                  className='ml-10 relative flex flex-row gap-1 cursor-pointer hover:bg-[#0a68ff33] w-fit p-2 rounded text-sm items-center justify-center before:w-[1px] before:h-3/6 before:absolute before:bg-[#BFC4CC] before:-left-5'
                >
                  <ShoppingCartIcon className='size-6 text-[#0560D9]' />
                  <span className="text-white bg-[#ff424f] h-4 right-0 top-[-4px] rounded-full inline-block text-center font-bold text-[10px] leading-[150%] absolute px-1 py-[0.5px] cursor-pointer">
                    {totalCart}
                  </span>
                </Link>)
                :(<div onClick={() => {
                    setIsModalOpen(true);
                  }}>
                    <Link
                      href='/cart'
                      className='ml-10 relative flex flex-row gap-1 cursor-pointer hover:bg-[#0a68ff33] w-fit p-2 rounded text-sm items-center justify-center before:w-[1px] before:h-3/6 before:absolute before:bg-[#BFC4CC] before:-left-5'
                    >
                      <ShoppingCartIcon className='size-6 text-[#0560D9]' />
                      <span className="text-white bg-[#ff424f] h-4 right-0 top-[-4px] rounded-full inline-block text-center font-bold text-[10px] leading-[150%] absolute px-1 py-[0.5px] cursor-pointer">
                        {totalCart}
                      </span>
                    </Link>
                  </div>
                )
              }
              
              {/* END Giỏ hàng */}
            </div>
          </div>

          <div className='flex flex-row justify-between mt-2.5'>
            <div className='flex gap-3'>
              <a className='text-gray-500 lowercase cursor-pointer text-sm'>
                Điện gia dụng
              </a>
              <a className='text-gray-500 lowercase cursor-pointer text-sm'>
                xe cộ
              </a>
              <a className='text-gray-500 lowercase cursor-pointer text-sm'>
                khỏe đẹp
              </a>
              <a className='text-gray-500 lowercase cursor-pointer text-sm'>
                nhà cửa
              </a>
              <a className='text-gray-500 lowercase cursor-pointer text-sm'>
                sách
              </a>
              <a className='text-gray-500 lowercase cursor-pointer text-sm'>
                thể thao
              </a>
            </div>
            <div className='text-sm flex '>
              <MapPinIcon className='size-5 text-gray-500' />
              <span className='text-gray-500 mr-1'>Giao đến:</span>
              <span className='color-black underline'>
                {login.currentCustomer?.address}
              </span>
            </div>
          </div>
          <div></div>
        </div>
      </nav>
      <div className='relative flex flex-row gap-5 mt-2.5 items-center justify-start ml-56 mb-2.5'>
        <span className='font-semibold text-sm text-[#033A8C]'>Cam kết</span>
        <div className='flex flex-row gap-1  items-center cursor-pointer'>
          <CheckBadgeIcon className='size-5 text-[#0560D9]' />
          <span className='text-xs'>100% hàng thật</span>
        </div>
        <div className='text-gray-200'>|</div>
        <div className='flex flex-row gap-1 items-center cursor-pointer'>
          <CurrencyDollarIcon className='size-5 text-[#0560D9]' />
          <span className='text-xs'>Hoàn 200% nếu hàng giả</span>
        </div>

        <div className='text-gray-200'>|</div>
        <div className='flex flex-row gap-1 items-center cursor-pointer'>
          <CubeIcon className='size-5 text-[#0560D9]' />
          <span className='text-xs'>30 ngày đổi trả</span>
        </div>

        <div className='text-gray-200'>|</div>
        <div className='flex flex-row gap-1 items-center cursor-pointer'>
          <TruckIcon className='size-5 text-[#0560D9]' />
          <span className='text-xs'>Giao nhanh 2h</span>
        </div>

        <div className='text-gray-200'>|</div>
        <div className='flex flex-row gap-1 items-center cursor-pointer'>
          <TagIcon className='size-5 text-[#0560D9]' />
          <span className='text-xs'>Giá siêu rẻ</span>
        </div>
        {!login?.logged && (
            <LoginModal
            isOpen={isModalOpen}
            onClose={handleClose}
            onChangeInput={changeFormInputs}
            onLoginClick={clickLogin}
            errorLogin={errorLogin}
            login={login}
            />
          )}

      </div>
    </div>
  );
};
