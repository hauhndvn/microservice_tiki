'use client';
import { Suspense, useEffect, useState } from 'react';
import { CardProduct } from '@/components/shared/CardProduct';
import { getProductOrShop } from '@/services/Api';
import { HitItem, PropsType_CardProduct } from '@/dto/tikiDto';
import { BASE_URL } from '@/services/app';
import { useSearchParams } from 'next/navigation';

export default function Page(props: any) {
  const searchParams = useSearchParams();//chạy trên môi trường PRODUCT
  const title = searchParams.get('title');
  const isTopDeal = searchParams.get('isTopDeal');
  const [productOrShop, setproductOrShop]=useState<HitItem[]>([]);
  // const { isTopDeal, title } = props.searchParams || {};//chạy trên môi trường DEV
  useEffect(()=>{
    console.log("params:", { title, isTopDeal });
    getProductOrShop({
      params:{
        title,
        ...(isTopDeal ? { isTopDeal } : {})  // chỉ thêm nếu có
      }
    })
    .then(result=>{
        console.log("result.data.hits.hits");
        console.log(result.data.hits.hits);
        setproductOrShop(result.data.hits.hits);
    })
},[title,isTopDeal]);
const productProps: PropsType_CardProduct[] = productOrShop.map((item) => {
    const webpImg = item._source.image.find(itemImg => itemImg.endsWith('.webp'));
    const otherImgs = item._source.image.filter(itemImg => itemImg !== webpImg);
  
    const fullUrls = [
      ...(webpImg ? [`${BASE_URL}/public/images/products/${webpImg}`] : []),
      ...otherImgs.map(itemImg => `${BASE_URL}/public/images/products/${itemImg}`)
    ];
  
    return {
      data: {
        id: item._source.product_id.toString(),
        image: fullUrls[0],  // lấy ảnh đầu tiên
        name: item._source.name,
        title: item._source.title,
        price: item._source.price,
        star: item._source.star,
        isTopDeal: item._source.istopdeal,
        isAuthentic: item._source.isauthentic,
        sale: {
          percent: item._source.sale_percent,
        },
        shipping: {
          type: item._source.shipping_type.toLowerCase(),
          date: item._source.shipping_date,
        },
        isGlobal: item._source.isglobal,
        madeIn: item._source.madein,
      }
    };
  });

  return (
    <>
      <nav>
        <Suspense fallback={<>Loading</>}>
          <div className='flex flex-row flex-wrap gap-2 mb-5'>
            {productProps.map((product: any) => (
              <CardProduct
                className='w-[23%]'
                data={product.data} 
                key={product.data.id}
                // key={product.id}
                // data={product}
              />
            ))}
          </div>
        </Suspense>
      </nav>
    </>
  );
}
