'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CheckIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/20/solid';
import {
  TruckIcon,
  InformationCircleIcon,
  ArchiveBoxXMarkIcon,
  ReceiptRefundIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { Input, InputRef, Rate, Tooltip } from 'antd';
import { formatCurrency } from '@/utils';
import { SliderBanner } from '@/components/home';
import { ListProduct } from '@/components/shared';
// import products from '@/data/products.json';
import { CardProduct } from '@/components/shared/CardProduct';
import { ProductItems, ShopItems, PropsType_ListProduct, PropsType_CardProduct } from '@/dto/tikiDto';
import { getProduct, getProductByID, getShopByID } from '@/services/Api';
import { BASE_URL, BASE_PROD_IMG_URL, BASE_SHOP_IMG_URL } from '@/services/app';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { addToCart } from '@/lib/reducers/cart';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/shared/LoginModal';
import { loginCustomer } from '@/services/Api';
import { loggedIn } from '@/lib/reducers/auth';

export default function Page({ params }: { params: { id: number } }) {
  const [productByID, setProductByID] = useState<ProductItems | null>(null);
  const [productsCatIds, setProductsCatIds] = useState<ProductItems[]>([]);
  const othersGroup: PropsType_ListProduct = {
    cardStyle: "similar",
    label: "Sản phẩm tương tự",
    data: [],
  };

  const [shopByID, setShopByID] = useState<ShopItems | null>(null);
  const [media, setMedia] = useState<string>('/products/belt-1.png');
  const [mediaShop, setMediaShop] = useState<string>('/shops/belt-1.png');
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [scrollIndex, setScrollIndex] = useState<number>(0);
  const inputRef = useRef<InputRef>(null);

  const itemsPerSlide = 6;
  const maxScrollIndex = Math.ceil((productByID?.image?.length || 0) / itemsPerSlide) - 1;

  const handlePrice = (type: string) => {
    switch (type) {
      case '+': {
        if (inputRef.current?.input) {
          inputRef.current.input.value = (
            parseInt(inputRef.current.input.value) + 1
          ).toString();
        }
        break;
      }
      case '-': {
        if (inputRef.current?.input) {
          if (parseInt(inputRef.current.input.value) <= 1) return;
          inputRef.current.input.value = (
            parseInt(inputRef.current.input.value) - 1
          ).toString();
        }
        break;
      }
      default:
        console.log('default');
    }
  };

  const handleNext = () => {
    if (scrollIndex < maxScrollIndex) {
      setScrollIndex(scrollIndex + 1);
    }
  };

  const handlePrev = () => {
    if (scrollIndex > 0) {
      setScrollIndex(scrollIndex - 1);
    }
  };


  const login = useSelector((state: RootState)=> state.Auth.login);

  const router = useRouter();
  const { id } = params;
  const dispatch = useDispatch();
//----- Popup ------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formInputs, setFormInputs] = useState({ username: "", password: "" });
  const [errorLogin, setErrorLogin] = useState("");

  const changeFormInputs = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
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
//-----END Popup ------
  const clickAddToCart = (type:string)=>{
        //lấy ảnh đầu tiên làm đại diện
        let image01 = Array.isArray(productByID?.image)
          ? productByID.image.find(img => img.endsWith('.webp'))
          : undefined;
        image01 = `${BASE_URL}${BASE_PROD_IMG_URL}${image01}`;
        
        dispatch(addToCart({
          product_id: Number(id),
          qty: 1,
          price: Number(productByID?.price),
          sale_percent: Number(productByID?.sale_percent),
          image: image01 || '/tiki-trading.png',
          title: productByID?.title|| 'Sản phẩm mới',
          isAuthentic: productByID?.isAuthentic===true,
          shipping_type: productByID?.shipping_type|| 'Normal',
          shipping_date: productByID?.shipping_date|| '',
        }));
    if (type === "buy-now"){
      !login?.logged 
      ? setIsModalOpen(true)
      : router.push("/cart")
    }
  }
  useEffect(() => {
    getProductByID(id)
      .then((res) => {
        // console.log('res.data', res.data);
        setProductByID(res.data);
        if (res.data?.image?.length > 0) {
          const firstItem = res.data.image[0];
          const src = `${BASE_URL}${BASE_PROD_IMG_URL}${firstItem}`;
          setMedia(src);
          setIsVideo(firstItem.toLowerCase().endsWith('.mp4'));
        }
        
        if (res.data?.shop_id){
          getShopByID(res.data.shop_id)
          .then((res)=>{
            // console.log("res.data shop:",res.data.data);
            setShopByID(res.data.data);
            if (res.data.data?.logo){
              const srcShop = `${BASE_URL}${BASE_SHOP_IMG_URL}${res.data.data.logo}`
              setMediaShop(srcShop);
            }
          })
        }

        if (res.data?.category_id){
          getProduct({
            params:{
              page:1,
              limit:10,
              category_id:res.data?.category_id
            }
          }).then((res)=>{
            setProductsCatIds(res.data.data.docs);
          })}

      })
      .catch((err) => {
        console.error('Error fetching product:', err);
      });
      
  }, [id]);
  
//PropsType_CardProduct: tách ảnh để hiển thị ở trang chủ
  const productProps: PropsType_CardProduct[] = productsCatIds.map((item) => {
    const webpImg = item.image.find(itemImg => itemImg.endsWith('.webp'));
    const otherImgs = item.image.filter(itemImg => itemImg !== webpImg);
  
    const fullUrls = [
      ...(webpImg ? [`${BASE_URL}/public/images/products/${webpImg}`] : []),
      ...otherImgs.map(itemImg => `${BASE_URL}/public/images/products/${itemImg}`)
    ];
  
    return {
      data: {
        id: item.product_id.toString(),
        image: fullUrls[0],  // lấy ảnh đầu tiên
        name: item.name,
        title: item.title,
        price: item.price,
        star: item.star,
        isTopDeal: item.isTopDeal,
        isAuthentic: item.isAuthentic,
        sale: {
          percent: item.sale_percent,
        },
        shipping: {
          type: item.shipping_type.toLowerCase(),
          date: item.shipping_date,
        },
        isGlobal: item.isGlobal,
        madeIn: item.madeIn,
      }
    };
  });
//PropsType_ListProduct: tách ảnh để hiển thị ở trang chủ
othersGroup.data = [];
productsCatIds.forEach((item: ProductItems) => {
  // console.log(item);
  const webpImg = item.image.find((img) => img.endsWith(".webp"));
  const otherImgs = item.image.filter((img) => img !== webpImg);
  const fullUrls = [
    ...(webpImg ? [`${BASE_URL}/public/images/products/${webpImg}`] : []),
    ...otherImgs.map((img) => `${BASE_URL}/public/images/products/${img}`),
  ];

  const product = {
    image: fullUrls[0],
    title: item.title,
    price: item.price,
    star: item.star,
    isTopDeal: item.isTopDeal,
    isAuthentic: item.isAuthentic,
    sale: item.sale_percent > 0 ? { percent: item.sale_percent } : undefined,
    shipping: {
      type: item.shipping_type.toLowerCase(),
      date: item.shipping_date,
    },
    isGlobal: item.isGlobal,
    madeIn: item.madeIn,
  };
  if(item.isTopDeal && othersGroup.data.length < 4)
    {
      othersGroup.data.push(product);
    }
});


  return (
    <div className="flex flex-row mb-5 gap-6 w-[90%]">
      {/* image product */}
      <div className="flex flex-col w-[27%] bg-white p-4 rounded-md sticky h-fit top-5">
        {isVideo ? (
          <video
            className="rounded-lg w-full"
            src={media}
            width={368}
            height={368}
            controls
            autoPlay
            preload="metadata"
          />
        ) : (
          <Image
            className="rounded-lg w-full"
            src={media}
            width={368}
            height={368}
            alt="Product"
            unoptimized
          />
        )}
        <div className="relative flex items-center mt-2">
          {scrollIndex > 0 && (
            <button
              className="absolute left-0 z-10 bg-white p-1 rounded-full shadow-md"
              onClick={handlePrev}
            >
              <ChevronLeftIcon className="size-5 text-gray-600" />
            </button>
          )}
          <div className="overflow-x-hidden w-[330px]">
            <div
              className="flex flex-row gap-2 transition-transform duration-300"
              style={{ transform: `translateX(-${scrollIndex * 330}px)` }}
            >
              {productByID?.image?.map((item, index) => {
                const isItemVideo = item.toLowerCase().endsWith('.mp4');
                const src = `${BASE_URL}${BASE_PROD_IMG_URL}${item}`;

                return isItemVideo ? (
                  <video
                    key={index}
                    className="border-gray-100 border p-1 rounded-md w-[47px] h-[47px] object-cover flex-shrink-0"
                    src={src}
                    controls
                    preload="metadata"
                    onMouseEnter={() => {
                      setMedia(src);
                      setIsVideo(true);
                    }}
                  />
                ) : (
                  <Image
                    key={index}
                    className="border-gray-100 border p-1 rounded-md flex-shrink-0"
                    src={src}
                    width={47}
                    height={47}
                    alt="Product"
                    onMouseEnter={() => {
                      setMedia(src);
                      setIsVideo(false);
                    }}
                    unoptimized
                  />
                );
              })}
            </div>
          </div>
          {scrollIndex < maxScrollIndex && (
            <button
              className="absolute right-0 z-10 bg-white p-1 rounded-full shadow-md"
              onClick={handleNext}
            >
              <ChevronRightIcon className="size-5 text-gray-600" />
            </button>
          )}
        </div>
        <hr className="my-3" />
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center gap-2">
            <Image src="/ai.png" width={26} height={26} alt="Tiki" />
            <span className="text-gray-500 text-sm">Xem thêm</span>
            <span className="text-sm">Ưu điểm & lưu ý của sản phẩm</span>
          </div>
          <ChevronRightIcon className="size-5" />
        </div>
      </div>
      {/* detail product */}
      <div className="w-[40%] flex flex-col gap-4">
        <div className="bg-white p-3 rounded-lg h-fit">
          <div className="flex flex-row gap-2 items-center">
            {productByID?.isTopDeal && (
              <Image
              src="/top-deal-1.png"
              width={110}
              height={20}
              alt="Product"
              unoptimized
              />
            )}
            {
              productByID?.isAuthentic && (
                <Image
                src="/chinh-hang.png"
                width={120}
                height={20}
                alt="Product"
                unoptimized
                />
              )
            }
            
            <span className="text-sm">
              Thương hiệu: <span className="text-blue-500">{shopByID?.shop_name}</span>
            </span>
          </div>
          <span className="font-medium text-2xl mt-2 inline-block">
            {productByID?.title}
          </span>
          <div className="flex flex-row items-center gap-2 mt-2">
            <span className="text-md font-medium">{productByID?.star}</span>
            <Rate value={productByID?.star ? Number(productByID?.star) : 0} defaultValue={5} allowHalf disabled className="text-[16px]" />
            <span className="text-gray-500">(37)</span>
            <span className="text-gray-300 text-xs">|</span>
            <span className="text-gray-500">Đã bán {productByID?.sold}</span>
          </div>
          <div>
            <span className="font-semibold text-2xl mt-2 inline-block">
              {formatCurrency('vi-VN', 'VND', Number(productByID?.price))}
            </span>
            <sup>₫</sup>
          </div>
          <div className="border border-gray-200 rounded-lg p-2 mt-2 flex flex-col">
            <span>Giá sau khuyến mãi:</span>
            <span className="text-red-500 text-3xl font-semibold mb-2 inline-block">
              {formatCurrency('vi-VN', 'VND', 
                (productByID?.price ?? 0) * (1 - (productByID?.sale_percent ?? 0)/100)
                )}
              <sup>₫</sup>
            </span>
            <div className="flex flex-row items-center gap-2">
              <CheckIcon className="size-4 text-blue-500" />
              <span className="font-medium">
                Giảm {formatCurrency('vi-VN', 'VND', 
                  Number((productByID?.price ?? 0) * (productByID?.sale_percent ?? 0)) / 100
                  )}
                <sup>₫</sup>
                <span className="ml-1 text-gray-500 font-normal">
                  từ coupon của Tiki
                </span>
              </span>
            </div>
            <div className="text-sm my-2">Khuyến mãi có thể hết sớm</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg h-fit">
          <span className="text-lg font-semibold block mb-2">
            Thông tin vận chuyển
          </span>
          <span className="mb-4">
            Giao đến { (login?.logged && login.currentCustomer) ? login.currentCustomer.address : "Q. Bình Tân, P. An Lạc A, Hồ Chí Minh"}
            
          </span>
          <div className="flex flex-row items-center gap-2 mt-3">
            <TruckIcon className="size-6 text-gray-500" />
            <span className="text-md font-medium">

              Giao {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN', { weekday: 'long' })}
            </span>
          </div>
          <span className="mb-4 block">
            Trước 19h, {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}:{' '}
            <span className="mr-2">
              {formatCurrency('vi-VN', 'VND', 8000)}
              <sup>₫</sup>
            </span>
            <span className="text-gray-500 line-through">
              {formatCurrency('vi-VN', 'VND', 23000)}
              <sup>₫</sup>
            </span>
          </span>
        </div>
        <div className="bg-white p-4 rounded-lg h-fit">
          <span className="text-lg font-semibold block mb-2">Ưu đãi khác</span>
          <div className="flex flex-row justify-between">
            <span>10 Mã giảm giá</span>
            <div className="flex flex-row gap-3 items-center text-blue-600 font-medium">
              <span className="border rounded-lg border-gray-200 p-1 px-2">
                Giảm 70K
              </span>
              <span className="border rounded-lg border-gray-200 p-1 px-2">
                Giảm 65K
              </span>
              <ChevronRightIcon className="size-7 text-gray-500" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg h-fit">
          <span className="text-lg font-semibold block mb-2">Dịch vụ bổ sung</span>
          <div className="flex flex-row justify-between items-center">
            <div className="gap-2 flex flex-row items-center">
              <Image
                src="/tiki-card.png"
                width={44}
                height={44}
                alt="Tiki"
                unoptimized
              />
              <span className="text-md font-medium">
                Ưu đãi đến 600k với thẻ TikiCard
              </span>
            </div>
            <span className="text-blue-600 cursor-pointer">Đăng ký</span>
          </div>
          <div className="flex flex-row justify-between items-center mt-3">
            <div className="gap-2 flex flex-row items-center">
              <Image
                className="rounded-2xl"
                src="/paylater.png"
                width={44}
                height={44}
                alt="Tiki"
                unoptimized
              />
              <span className="text-md font-medium">Mua trước trả sau</span>
            </div>
            <span className="text-blue-600 cursor-pointer">Đăng ký</span>
          </div>
        </div>
        {/* Sản phẩm liên quan */}
        <div className="bg-white p-4 rounded-lg h-fit">
          <span className="text-lg font-semibold block mb-2">
            Sản phẩm liên quan
          </span>
          <div className="flex flex-row flex-wrap gap-3">
            {productProps.slice(0, 10).map((product: any, index) => 
            { 
              return(<CardProduct className="w-[23%]" 
                // key={index} 
                // data={product}
                data={product.data} key={product.data.id} />)
            }
            )}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg h-fit overflow-hidden">
          <span className="text-lg font-semibold block mb-2">Top deals</span>
          <ListProduct data={othersGroup.data.slice(0, 7)} label='Sản phẩm tương tự' cardStyle="w-[23%]" />
        </div>
        <div className="bg-white p-4 rounded-lg h-fit">
          <span className="text-lg font-semibold block mb-2">
            Thông tin bảo hành
          </span>
          <div>
            <div>
              <span>Thời gian bảo hành: </span>
              <span className="font-medium">12 Tháng</span>
              <hr className="mt-3" />
            </div>
            <div>
              <span>Hình thức bảo hành: </span>
              <span className="font-medium">Phiếu bảo hành</span>
              <hr className="mt-3" />
            </div>
            <div>
              <span>Nơi bảo hành: </span>
              <span className="font-medium">
                Bảo hành bởi nhà bán hàng thông qua Tiki
              </span>
              <hr className="mt-3" />
            </div>
            <div>
              <span>Hướng dẫn bảo hành: </span>
              <span className="font-medium text-blue-600">Xem chi tiết</span>
              <hr className="mt-3" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg h-fit">
          <span className="text-lg font-semibold block mb-2">
            An tâm mua sắm
          </span>
          <div>
            <div>
              <div className="flex flex-row items-center gap-2">
                <ArchiveBoxXMarkIcon className="size-6 text-blue-600 font-medium" />
                <span>Được đồng kiểm khi nhận hàng</span>
              </div>
              <hr className="mt-3" />
            </div>
            <div>
              <div className="flex flex-row items-center gap-2">
                <ReceiptRefundIcon className="size-6 text-blue-600 font-medium" />
                <span>Được hoàn tiền 200% nếu là hàng giả.</span>
              </div>
              <hr className="mt-3" />
            </div>
            <div>
              <div className="flex flex-row items-start gap-2">
                <CubeIcon className="size-6 text-blue-600 font-medium" />
                <div className="flex flex-col">
                  <div>Đổi trả miễn phí: </div>
                  <ul className="w-[90%] list-disc ml-5">
                    <li>
                      Đổi trả miễn phí trong 30 ngày khi bạn đổi ý hoặc sản phẩm
                      không đúng cam kết.
                    </li>
                    <li>Trong 365 ngày khi có lỗi từ nhà sản xuất.</li>
                  </ul>
                  <span className="text-black underline cursor-pointer">
                    Chi tiết
                  </span>
                </div>
              </div>
              <hr className="mt-3" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg h-fit">
          <span className="text-lg font-semibold block mb-2">
            Thông tin chi tiết
          </span>
          <div className="flex flex-col w-full">
            <div className="grid grid-cols-2">
              <span className="text-gray-500">
                Sản phẩm có được bảo hành không?
              </span>
              <span>Có</span>
            </div>
            <hr className="my-2" />
            <div className="grid grid-cols-2 w-full">
              <span className="text-gray-500">Hình thức bảo hành</span>
              <span>Phiếu bảo hành</span>
            </div>
            <hr className="my-2" />
            <div className="grid grid-cols-2">
              <span className="text-gray-500">Thời gian bảo hành</span>
              <span>12</span>
            </div>
          </div>
        </div>
      </div>
      {/* shop */}
      <div className="w-[23%] flex flex-col">
        <div className="p-4 bg-white flex flex-col rounded-lg">
          <div className="flex flex-row gap-2">
            <Image src={mediaShop}
            width={50} 
            height={50} 
            alt="Tiki" 
            unoptimized
            />
            <div>
              <span className="font-medium">{shopByID?.shop_name}</span>
              <div className="flex flex-row items-center gap-2">
                {
                  shopByID?.official && (
                    <Image
                      src="/official.png"
                      width={72}
                      height={20}
                      alt="Tiki"
                      unoptimized
                    />
                  )
                }
                <span className="text-xs text-gray-200 font-bold">|</span>
                <span>{shopByID?.star}</span>
                <Rate
                  count={1}
                  defaultValue={4.5}
                  allowHalf
                  disabled
                  className="text-[17px]"
                />
                <span className="text-gray-500">(3.3k+ đánh giá)</span>
              </div>
            </div>
          </div>
          <hr className="my-3 block" />
          <div>
            <span className="text-lg font-semibold mb-3 block">Số lượng</span>
            <div className="flex flex-row gap-1">
              <div
                className="w-10 cursor-pointer hover:bg-gray-100 text-gray-500 text-2xl font-semibold h-8 flex items-center justify-center border rounded-md border-gray-200"
                onClick={() => handlePrice('-')}
              >
                -
              </div>
              <Input
                ref={inputRef}
                className="w-10 h-8 text-center"
                type="number"
                defaultValue={1}
              />
              <div
                className="w-10 cursor-pointer hover:bg-gray-100 text-gray-500 text-2xl font-semibold h-8 flex items-center justify-center border rounded-md border-gray-200"
                onClick={() => handlePrice('+')}
              >
                +
              </div>
            </div>
            <span className="text-lg font-semibold mt-3 inline-block">
              Tạm tính
            </span>
            <div className="text-3xl mt-3 font-semibold flex flex-row items-center">
              <span>
                {formatCurrency('vi-VN', 'VND', 
                  (productByID?.price ?? 0) * (1 - (productByID?.sale_percent ?? 0)/100)
                  )}
                <sup>₫</sup>
              </span>
              <Tooltip
                color="white"
                placement="bottom"
                title={
                  <div className="p-3">
                    <div className="flex flex-row items-center gap-1 text-black">
                      <div className="flex flex-row gap-2 items-center text-lg">
                        <CheckIcon className="size-4 text-blue-500" />
                        <div className="text-md font-medium">
                          {formatCurrency('vi-VN', 'VND', 6400)}
                          <sup>₫</sup>
                        </div>
                      </div>
                      <span className="text-gray-500 text-md">
                        từ coupon của Tiki
                      </span>
                    </div>
                    <div className="text-xs text-black mt-3">
                      Khuyến mãi có thể hết sớm
                    </div>
                  </div>
                }
              >
                <InformationCircleIcon className="ml-3 size-6 text-gray-500" />
              </Tooltip>
            </div>
            {/* Add to Cart */}
            <div>
              <button onClick={()=>clickAddToCart("buy-now")} className="bg-red-500 text-white rounded-md w-full h-10 mt-3">
                Mua ngay
              </button>
              <button onClick={()=>clickAddToCart("add-to-cart")} className="bg-white text-blue-500 border border-blue-500 rounded-md w-full h-10 mt-3">
                Thêm vào giỏ
              </button>
              <button className="bg-white text-blue-500 border border-blue-500 rounded-md w-full h-10 mt-3">
                Mua trước trả sau
              </button>
            </div>
          </div>
        </div>
        <SliderBanner className="h-fit mt-5">
          <div className="w-full h-32 flex flex-row shrink-0 gap-3">
            <div className="w-full h-32 relative">
              <Image
                className="rounded-lg"
                src="/banner-d-1.png"
                fill
                unoptimized
                alt=""
              />
            </div>
          </div>
          <div className="w-full h-32 flex flex-row shrink-0 gap-3">
            <div className="w-full h-32 relative">
              <Image
                className="rounded-lg"
                src="/banner-d-2.png"
                fill
                unoptimized
                alt=""
              />
            </div>
          </div>
          <div className="w-full h-32 flex flex-row shrink-0 gap-3">
            <div className="w-full h-32 relative">
              <Image
                className="rounded-lg"
                src="/banner-d-1.png"
                fill
                unoptimized
                alt=""
              />
            </div>
          </div>
        </SliderBanner>
        {/* {!login?.logged && ( */}
          <LoginModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onChangeInput={changeFormInputs}
          onLoginClick={clickLogin}
          errorLogin={errorLogin}
          login={login}
          />
        {/* )} */}
        
      </div>
    </div>
  );
}