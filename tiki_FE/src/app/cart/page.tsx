'use client';
import { Checkbox, InputNumber, Tooltip } from 'antd';
import Image from 'next/image';
import {
  TrashIcon,
  InformationCircleIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';

// import cart from '@/data/cart.json';
import { ItemCart } from '@/components/cart/ItemCart';
import { formatCurrency } from '@/utils';
import { Metadata } from 'next';
import Link from 'next/link';
import { RootState } from '@/lib/store';
import { useSelector, useDispatch } from 'react-redux';
import { createOrder } from '@/services/Api';
import { resetCart } from '@/lib/reducers/cart';
import { useRouter } from 'next/navigation';
import { CartItem } from '@/dto/tikiDto';

export default function Page() {
  const login = useSelector((state: RootState)=> state.Auth.login);
  const dispatch = useDispatch();
  const router = useRouter();

  const itemsCart = useSelector((state: RootState)=> state.Cart.items)
  const newItems = itemsCart.map((item)=>({
      product_id: item.product_id,
      qty: item.qty,
      price: item.price,
      sale_percent: item.sale_percent
  }));
  const totalPriceBefore = itemsCart.reduce((total, item)=> {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    const sale = Number(item.sale_percent) || 0;
    return total + qty * price;
    },0
  );
  const totalPriceAfter = itemsCart.reduce((total, item)=> {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    const sale = Number(item.sale_percent) || 0;
    return total + qty * price * (1 - sale / 100);
    },0
  );
  //giá sau khuyến mãi (item.price ?? 0) * (1 - (item.sale_percent ?? 0)/100)
  const clickOrder=()=>{//e: React.ChangeEvent<HTMLInputElement>
    if (login.logged && login.currentCustomer){
      const { customer_id, accessToken } = login.currentCustomer;
      createOrder({
        customer_id: customer_id,
        order_items: newItems,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then(()=>{
        console.log("Đặt hàng thành công");
        
        dispatch(resetCart());
        router.push('/order')
      }).catch((error)=>console.log(error))
    }
  }
  
  return (
    <div className='w-[75%] flex-row flex'>
      <div>
        <span className='uppercase font-medium text-xl'>Giỏ hàng</span>
        <div className='h-8 rounded-md flex flex-row  bg-white items-center text-sm'>
          <div className='ml-2 w-[45%] max-w-[45%] flex items-center gap-3'>
            <Checkbox />
            <span className='text-sm'>Tất cả sản phẩm </span>
          </div>
          <span className='text-gray-500 w-[15%]'> Đơn giá</span>
          <span className='text-gray-500 w-[15%]'>Số lượng</span>
          <span className='text-gray-500 w-[15%]'>Thành tiền</span>
          <span className='text-gray-500 w-[10%] pr-5 flex justify-end'>
            <TrashIcon className='size-5' />
          </span>
        </div>
        <div className='w-full flex flex-col bg-white mt-2 pt-5 rounded-md mb-5'>
          {itemsCart.map((product: CartItem) => (
            <ItemCart product={product} />
          ))}
        </div>
      </div>
      <div className='w-[25%] mt-7 ml-5'>
        <div className='bg-white rounded-md p-4'>
          <div className='flex justify-between'>
            <span className='text-gray-500'>Giao tới</span>
            <span className='text-blue-500 text-sm'>Thay đổi</span>
          </div>
          <span className='text-sm font-semibold'>
            {(login.logged && login.currentCustomer) ? `${login.currentCustomer.surname} ${login.currentCustomer.name}`:"No name"}
            <span className='text-gray-200 inline-block px-1'>|</span>{' '}
            {(login.logged && login.currentCustomer) ? `${login.currentCustomer.phone}`:"No phone"}
          </span>
          <div>
            <span className='bg-gray-50 p-1 rounded-sm text-xs font-semibold text-green-500 mr-2'>
              Nhà
            </span>
            <span className='text-gray-500 text-sm'>
            {(login.logged && login.currentCustomer) ? `${login.currentCustomer.address}`:"No address"}
            </span>
          </div>
        </div>
        <div className='bg-white mt-3 p-4 rounded-md'>
          <div className='flex flex-row justify-between items-center'>
            <span className='text-xs font-medium'>Tiki Khuyến Mãi </span>
            <div className='text-gray-500 flex flex-row items-center gap-1'>
              <span className='text-sm'>Có thể chọn 2</span>
              <Tooltip
                placement='bottom'
                title={
                  'Áp dụng tối đa 1 Mã giảm giá Sản Phẩm và 1 Mã Vận Chuyển'
                }
              >
                <InformationCircleIcon className='size-4 cursor-pointer' />
              </Tooltip>
            </div>
          </div>
          <div className='relative'>
            <Image
              src='/coupon.svg'
              unoptimized
              className='mt-3 relative'
              width={286}
              height={60}
              alt='coupon'
            />
            <div className='absolute top-1/2 -translate-y-1/2 flex flex-row items-center'>
              <Image
                src='/tiki.png'
                unoptimized
                className='ml-1.5 rounded-lg'
                width={44}
                height={44}
                alt='coupon'
              />
              <div className='text-xs font-medium ml-4 '>Giảm 3%</div>
              <div className='rounded-md text-white bg-blue-500 text-xs p-1 ml-16 px-4'>
                Bỏ Chọn
              </div>
            </div>
          </div>
          <div>
            <div className='text-blue-500 mt-5 flex flex-row items-center gap-2'>
              <TicketIcon className='size-5 font-semibold' />
              <span className='text-xs'>Chọn hoặc nhập khuyến mãi khác</span>
            </div>
          </div>
        </div>
        <div className='bg-white p-4'>
          <div className='flex flex-row justify-between'>
            <span className='text-gray-700 text-sm'>Tạm tính</span>
            <span className='text-sm'>
              {formatCurrency('vi-VN', 'VND', totalPriceBefore)}
              <sup>₫</sup>
            </span>
          </div>
          <div className='flex flex-row justify-between mt-2'>
            <span className='text-gray-700 text-sm'>Giảm giá</span>
            <span className='text-sm'>
              -{formatCurrency('vi-VN', 'VND', totalPriceBefore-totalPriceAfter)}
              <sup>₫</sup>
            </span>
          </div>
          <hr className='my-5' />
          <div className='flex flex-row justify-between mt-2'>
            <span className='text-gray-700 text-sm'>Tổng tiền</span>
            <div className='flex flex-col justify-start items-end'>
              <span className='text-red-600 text-2xl'>
                {formatCurrency('vi-VN', 'VND', totalPriceAfter)}
                <sup>₫</sup>
              </span>
              <span className='text-xs text-gray-500'>
                (Đã bao gồm VAT nếu có)
              </span>
            </div>
          </div>
        </div>
        <Link
          href='/order'
          className='bg-red-500 block mt-3 rounded-md text-white text-md py-3 text-center'
          onClick={(e) => {
            e.preventDefault(); // Ngăn điều hướng mặc định
            clickOrder();
          }}
        >
          Mua hàng
        </Link>
      </div>
    </div>
  );
}
