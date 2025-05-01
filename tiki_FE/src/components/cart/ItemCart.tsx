import { CartItem } from '@/dto/tikiDto';
import { deleteItemCart, updateCart } from '@/lib/reducers/cart';
import { formatCurrency } from '@/utils';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Checkbox, InputNumber } from 'antd';
import Image from 'next/image';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

type PropsType = {
  product: CartItem;
};

export const ItemCart = ({ product } : PropsType) => {
  const dispatch = useDispatch();
  
  const [amount, setAmount] = useState<number>(product.qty);
  const handleChangeAmount = (type: string) => {
    let newAmount = amount;
    switch (type) {
      case '+':
        newAmount = amount + 1;
        break;
      case '-':
        if (amount === 1) return;
        newAmount = amount - 1;
        break;
      default:
        break;
    }
    setAmount(newAmount);
    dispatch(updateCart({
      product_id: product.product_id.toString(),
      qty: newAmount,
    }));
  };
  const clickDeleteItemCart = ()=>{
    //eslint-disable-next-line no-restricted-globals
    const isConfirm = confirm("Bạn có chắc chắn muốn xoá?");//yes=true
    return isConfirm
        ? dispatch(deleteItemCart({
          product_id: product.product_id.toString(),
        }))
        : false;
  }
  return (
    <div className='ml-2 flex mb-5'>
      <div className='flex w-[45%] w-max-[45%] flex-row items-center'>
        <Checkbox />
        <Image
          className='w-[80px] h-[80px] mx-3'
          src={product.image}
          alt='product'
          width={80}
          height={80}
          unoptimized
        />

        <div className='w-[51%]'>
          <div className='flex flex-row items-center gap-1'>
            {product.isAuthentic && (
              <Image
              src='/chinh-hang.png'
              alt='chinh-hang'
              width={89}
              height={20}
              unoptimized
            />
            )}
            

            <Image
              src='/doi-y.png'
              alt='doi-y'
              width={89}
              height={20}
              unoptimized
            />
          </div>
          <span className='text-sm'>
            {product.title}
          </span>
          <div className='flex flex-row items-center gap-1'>
            {product.shipping_type?.toLowerCase() === 'fast' ? (
              <>
                <Image
                  src='/now.png'
                  alt='now'
                  width={32}
                  height={16}
                  unoptimized
                />
                <span className='text-xs'>Giao siêu tốc 2h</span>
              </>
            ) : (
              <>
                <Image
                  src='/tiki.png'
                  alt='tiki'
                  width={32}
                  height={16}
                  unoptimized
                />
                <span className='text-xs'>{product.shipping_date}</span>
              </>
            )}
          </div>

        </div>
      </div>
      <span className='w-[15%] w-max-[15%]  font-semibold flex items-center'>
        {formatCurrency('vi-VN', 'VND', 
          (product?.price ?? 0) * (1 - (product?.sale_percent ?? 0)/100)
          )}
        <sup>₫</sup>
      </span>
      <div className='w-[15%] w-max-[15%] flex items-center'>
        <InputNumber
          className='w-[99%] flex justify-center items-center text-center'
          defaultValue={amount}
          value={amount}
          controls={false}
          keyboard={false}
          variant='filled'
          onChange={(value) => {//cho phép người dùng tự nhập số vào ô
            if (typeof value === 'number' && value >= 1) {
              setAmount(value);
              dispatch(updateCart({
                product_id: product.product_id.toString(),
                qty: value,
              }));
            }
          }}
          addonAfter={
            <div
              className='cursor-pointer'
              onClick={() => {
                handleChangeAmount('+');
              }}
            >
              +
            </div>
          }
          addonBefore={
            <div
              className='cursor-pointer'
              onClick={() => {
                handleChangeAmount('-');
              }}
            >
              -
            </div>
          }
        />
      </div>

      <span className='font-semibold text-red-500 w-[15%] w-max-[15%] flex items-center'>
        {formatCurrency('vi-VN', 'VND', (product?.price ?? 0) * (1 - (product?.sale_percent ?? 0)/100) * amount)}
        <sup>₫</sup>
      </span>
      <div onClick={clickDeleteItemCart} className='text-gray-500 w-[10%] pr-5 flex justify-end items-center'>
        <TrashIcon className='size-5' />
      </div>
    </div>
  );
};
