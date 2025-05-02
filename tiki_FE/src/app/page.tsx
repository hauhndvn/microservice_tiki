'use client';
import { SliderBanner } from '@/components/home';
import { Tabs, ListProduct } from '@/components/shared';
import Image from 'next/image';
import brands from '@/data/brands.json';
import { Countdown } from '@/components/shared/Countdown';
import { ListBrand } from '@/components/home/ListBrand';
import { useEffect, useRef, useState } from 'react';
import { CardProduct } from '@/components/shared/CardProduct';
import { getProduct } from '@/services/Api';
import { BASE_URL } from '@/services/app';
import { ProductItems, PropsType_ListProduct, PropsType_CardProduct } from '@/dto/tikiDto';

  const flashSaleGroup: PropsType_ListProduct = {
    cardStyle: "flash-sale",
    label: "Flash Sale",
    data: [],
  };

  const topDealGroup: PropsType_ListProduct = {
    cardStyle: "top-deal",
    label: "Top Deal",
    data: [],
  };

  const othersGroup: PropsType_ListProduct = {
    cardStyle: "other",
    label: "Sản phẩm khác",
    data: [],
  };

//----------------------------------------
export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<ProductItems[]>([]);
  
  useEffect(() => {
    console.log(isVisible);
  }, [isVisible]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null, // viewport
        rootMargin: '0px', // no margin
        threshold: 0.5, // 50% of target visible
      },
    );

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    // Clean up the observer
    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  },[]);
  useEffect(()=>{
    getProduct({
      params:{
        page: 1,
        limit: 18
      }
    })    
    .then((res)=>{
      // console.log("res.data.data");
      // console.log(res.data.data)
      setProducts(res.data.data.docs)});

    getProduct({
      params:{
        page: 1,
        limit: 30
      }
    })
    .then((res)=>{
      const fetchedProducts = res.data.data.docs;

      // Clear các group trước (phòng trường hợp gọi lại nhiều lần)
      flashSaleGroup.data = [];
      topDealGroup.data = [];
      othersGroup.data = [];

      fetchedProducts.forEach((item: ProductItems) => {
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
        if (item.sale_percent > 0 && flashSaleGroup.data.length < 6) {
          flashSaleGroup.data.push(product);
        } else if (item.isTopDeal && topDealGroup.data.length < 6) {
          topDealGroup.data.push(product);
        } else if (othersGroup.data.length < 6) {
          othersGroup.data.push(product);
        }
      });
      //---------------------------
    });
  },[]);
  const productProps: PropsType_CardProduct[] = products.map((item) => {
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
  
  type PropsTypeListBrand = {
    image: string;
  }[];
  
  const productProps_ListHotBrand: PropsTypeListBrand = [];
  const productProps_ListFlashSale: PropsTypeListBrand = [];
  
  products.forEach((item) => {
    const webpImg = item.image.find(itemImg => itemImg.endsWith('.webp'));
    const image = webpImg ? `${BASE_URL}/public/images/products/${webpImg}` : undefined;
  
    if (!image) return; // bỏ qua nếu không có ảnh
  
    if (item.star > 4) {
      productProps_ListHotBrand.push({ image });
    }
  
    if (item.sale_percent > 25) {
      productProps_ListFlashSale.push({ image });
    }
  });
  return (
    <>
      
      <SliderBanner >
        <div className='w-full h-full flex flex-row shrink-0 gap-3'>`
          <div className='w-1/2 h-full relative'>
            <Image
              className='rounded-lg'
              src='/banner-1-1.webp'
              fill
              unoptimized
              alt=''
            />
          </div>
          <div className='w-1/2 h-full relative'>
            <Image
              className='rounded-lg'
              src='/banner-1-2.webp'
              fill
              unoptimized
              alt=''
            />
          </div>
        </div>

        <div className='w-full h-full flex flex-row shrink-0 gap-3'>
          <div className='w-1/2 h-full relative'>
            <Image
              className='rounded-lg'
              src='/banner-2-1.webp'
              fill
              unoptimized
              alt=''
            />
          </div>
          <div className='w-1/2 h-full relative'>
            <Image
              className='rounded-lg'
              src='/banner-2-2.webp'
              fill
              unoptimized
              alt=''
            />
          </div>
        </div>

        <div className='w-full h-full flex flex-row shrink-0 gap-3'>
          <div className='w-1/2 h-full relative'>
            <Image
              className='rounded-lg'
              src='/banner-3-1.webp'
              fill
              unoptimized
              alt=''
            />
          </div>
          <div className='w-1/2 h-full relative'>
            <Image
              className='rounded-lg'
              src='/banner-3-2.webp'
              fill
              unoptimized
              alt=''
            />
          </div>
        </div>
      </SliderBanner>
      
      <div className='bg-white h-32 rounded-lg flex flex-row gap-5 justify-center pt-4 mt-3 mb-3'>
        <a className='flex flex-col items-center  text-sm font-medium gap-2 max-w-24'>
          <Image
            className='rounded-xl border border-gray-200'
            src='/top-deal.png'
            width={44}
            height={44}
            unoptimized
            alt='top-deal'
          />
          <span className='text-[#D93843]'>TOP DEAL</span>
        </a>

        <a className='flex flex-col items-center  text-sm font-medium gap-2 max-w-24'>
          <Image
            className='rounded-xl border border-gray-200'
            src='/tiki-trading.png'
            width={44}
            height={44}
            unoptimized
            alt='tiki-trading'
          />
          <span>Tiki Trading</span>
        </a>

        <a className='flex flex-col items-center text-sm font-medium gap-2 max-w-24'>
          <Image
            className='rounded-xl border border-gray-200'
            src='/coupon-sieu-hot.png'
            width={44}
            height={44}
            unoptimized
            alt='coupon-sieu-hot'
          />
          <span className='text-center'>Coupon siêu hot</span>
        </a>

        <a className='flex flex-col items-center  text-sm font-medium gap-2 max-w-24'>
          <Image
            className='rounded-xl border border-gray-200'
            src='/xa-kho-giam-nua-gia.png'
            width={44}
            unoptimized
            height={44}
            alt='xa-kho-giam-nua-gia'
          />
          <span className='text-center'>Xả kho giảm nửa giá</span>
        </a>

        <a className='flex flex-col items-center  text-sm font-medium gap-2 max-w-24'>
          <Image
            className='rounded-xl border border-gray-200'
            src='/hang-ngoai-gia-hot.png'
            width={44}
            height={44}
            unoptimized
            alt='hang-ngoai-gia-hot'
          />
          <span className='text-center'>Hàng ngoại giá hot</span>
        </a>

        <a className='flex flex-col items-center  text-sm font-medium gap-2 max-w-24'>
          <Image
            className='rounded-xl border border-gray-200'
            src='/cung-me-cham-be.webp'
            width={44}
            height={44}
            unoptimized
            alt='cuong-me-cham-be'
          />
          <span className='text-center'>Cùng mẹ chăm bé</span>
        </a>

        <a className='flex flex-col items-center  text-sm font-medium gap-2 max-w-24'>
          <Image
            className='rounded-xl border border-gray-200'
            src='/mot-sach-tiki.webp'
            width={44}
            height={44}
            unoptimized
            alt='mot-sach-tiki'
          />
          <span className='text-center'>Mọt sách Tiki</span>
        </a>
        <a className='flex flex-col items-center  text-sm font-medium gap-2 max-w-24'>
          <Image
            className='rounded-xl border border-gray-200'
            src='/the-gioi-cong-nghe.webp'
            width={44}
            height={44}
            unoptimized
            alt='the-gioi-cong-nghe'
          />
          <span className='text-center'>Thế giới công nghệ</span>
        </a>

        <a className='flex flex-col items-center  text-sm font-medium gap-2 max-w-24'>
          <Image
            className='rounded-xl border border-gray-200'
            src='/yeu-bep-nghien-nha.webp'
            width={44}
            height={44}
            unoptimized
            alt='yeu-bep-nghien-nha'
          />
          <span className='text-center'>Yêu bếp nghiện nhà</span>
        </a>

        <a className='flex flex-col items-center  text-sm font-medium gap-2 max-w-24'>
          <Image
            className='rounded-xl border border-gray-200'
            src='/khoe-dep-toan-dien.webp'
            width={44}
            height={44}
            unoptimized
            alt='khoe-dep-toan-dien'
          />
          <span className='text-center'>Khỏe đẹp toàn diện</span>
        </a>
      </div>
    
      <div className="mb-3 rounded-lg" style={{background: 'linear-gradient(rgba(255, 255, 255, 0) 22.49%, rgb(255, 255, 255) 73.49%), linear-gradient(264.03deg, rgb(220, 229, 251) -10.27%, rgb(234, 236, 255) 35.65%, rgb(213, 236, 253) 110.66%)'}}>
        <div className="mb-4 mt-4 self-start font-semibold text-left">Thương hiệu nổi bật</div>
        <ListBrand data={productProps_ListHotBrand}/>
      </div>
      <div className="mb-3 rounded-lg" style={{background: 'rgb(255, 255, 255)'}}>
        <div className="mb-4 mt-4 self-start font-semibold text-left flex items-center gap-2">
          <span>Flash Sale</span>
          <Countdown seconds={1000}/>
        </div>
        <ListBrand data={productProps_ListFlashSale}>
          
          </ListBrand>
      </div>

      

      <div className='relative rounded-lg mb-4 flex flex-col' ref={targetRef}>
        <div className='bg-white rounded-tl-xl rounded-tr-xl pr-1 pt-4 mb-2'>
          <span className='font-semibold text-md ml-3'>Gợi ý hôm nay</span>
          <div className='flex flex-row mt-5'>
            <div
              className={`w-36 h-16 hover:bg-gray-300 bg-blue-100 border-b border-blue-500 flex flex-col items-center justify-center cursor-pointer`}
            >
              <span className='text-blue-500 text-xs'>Dành cho bạn</span>
            </div>

            <div className='w-36 h-16 hover:bg-gray-300 flex flex-col items-center justify-center cursor-pointer'>
              <span className='text-gray-500 text-xs'>Top deal</span>
            </div>

            <div className='w-36 h-16 hover:bg-gray-300 flex flex-col items-center justify-center cursor-pointer'>
              <span className='text-gray-500 text-xs'>Sách Xả Kho - 60%</span>
            </div>

            <div className='w-36 h-16 hover:bg-gray-300 flex flex-col items-center justify-center cursor-pointer'>
              <span className='text-gray-500 text-xs'>Thể thao - 50%</span>
            </div>

            <div className='w-36 h-16 hover:bg-gray-300 flex flex-col items-center justify-center cursor-pointer'>
              <span className='text-gray-500 text-xs'>Gia dụng - 50%</span>
            </div>
          </div>
        </div>

        <div className='flex flex-row flex-wrap gap-2 mt-2'>
          {productProps.map((product: any) => {
            return <CardProduct data={product.data} key={product.data.id} />;
          })}
        </div>
        <div className='p-2 border mt-10 px-20 self-center rounded-md text-blue-500 border-blue-500'>
          Xem Thêm
        </div>       
        <Tabs
          defaultTab="tab1"
          items={[
            {
              key: "tab1",
              label: flashSaleGroup.label,
              children: <div className='flex flex-row flex-wrap gap-2 mt-2'>
                      <ListProduct key={flashSaleGroup.label} label={flashSaleGroup.label} data={flashSaleGroup.data} />
                    </div>,
            },
            {
              key: "tab2",
              label: topDealGroup.label,
              children: <div className='flex flex-row flex-wrap gap-2 mt-2'>
                      <ListProduct key={topDealGroup.label} label={flashSaleGroup.label} data={topDealGroup.data} />
                    </div>,
            },
            {
              key: "tab3",
              label: othersGroup.label,
              children: <div className='flex flex-row flex-wrap gap-2 mt-2'>
                      <ListProduct key={othersGroup.label} label={flashSaleGroup.label} data={othersGroup.data} />
                    </div>,
            },
          ]}
      />
      </div>
    </>
  );
}
