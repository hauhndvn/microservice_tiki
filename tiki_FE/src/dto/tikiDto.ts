export interface GetProductOrShop {
  title: string;
  isTopDeal?: string;
}
export interface ProductOrShop {
  inventory: number;
  "@timestamp": string;
  isauthentic: boolean;
  name: string;
  title: string;
  price: number;
  istopdeal: boolean;
  shop_name: string;
  type: string;
  sale_percent: number;
  product_id: number;
  isglobal: boolean;
  shipping_type: string;
  shop_id: number;
  image: string[];
  category_id: number;
  star: number;
  sold: number;
  "@version": string;
  shipping_date: string;
  madein: string;
}
export interface HitItem {
  _index: string;
  _id: string;
  _score: number;
  _source: ProductOrShop;
}

export interface Hits {
  total: {
    value: number;
    relation: string;
  };
  max_score: number;
  hits: HitItem[];
}

export interface ProductOrShopResponse {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: Hits;
}

export interface OrderItems {
    customer_id: number;
    order_items: {
        product_id: number;
        qty: number;
        price: number;
        sale_percent: number;
      }[]
}
export interface CartItem {
  product_id: number;
  qty: number;
  image: string;//chỉ lấy 1 ảnh đại diện
  title: string;
  price: number;
  isAuthentic: boolean;
  sale_percent: number;
  shipping_type: string;
  shipping_date: string;
}
export interface CartState {
  items: CartItem[];
}
export interface AuthState {
  login: {
    currentCustomer: Customer | null;
    logged: boolean;
    error: boolean;
  };
}

export interface Customer {
  customer_id: number;
  email: string;
  phone: string;
  address: string;
  accountName: string;
  surname: string;
  name: string;
  accessToken: string;
}
export interface CustomerRegister {
  customer_id: number;
  email: string;
  password: string;
  phone: string;
  address: string;
  accountName: string;
  surname: string;
  name: string;
}
export interface CustomerLogin {
  username: string;
  password: string;
}
export interface ProductItems {
  product_id: number;
  image: string[];
  name: string;
  title: string;
  price: number;
  star: number;
  isTopDeal: boolean;
  isAuthentic: boolean;
  sale_percent: number;
  shipping_type: string;
  shipping_date: string;
  isGlobal: boolean;
  madeIn: string;
  shop_id: number;
  category_id: number;
  inventory: number;
  sold: number;
}
export interface ShopItems {
  shop_id: number;
  logo: string;
  shop_name: string;
  star: number;
  official: boolean;
  email: string;
  phone: string;
}
export type ShopData = {
  data: ShopItems
}
export type ProductData = {
  data:{
    docs:[
      ProductItems
    ];
    pages:{
      totalRows: number,
      totalPages: number,
      currentPage: number,
      next: number,
      prev: number,
      hasNext: boolean,
      hasPrev: boolean
    }   
  }

};

export type PropsType_CardProduct = {
  data: {
    id: string;
    image: string;
    name: string;
    title: string;
    price: number;
    star?: number;
    isTopDeal?: boolean;
    isAuthentic?: boolean;

    sale?: {
      percent: number;
    };
    shipping: {
      type: 'fast' | 'normal' | string;
      date: string;
    };
    isGlobal?: boolean;
    madeIn?: string;
  };
};

export type PropsType_ListProduct = { //dành cho ListProduct.tsx
  cardStyle?: string;
  label: string;//thêm trường này
  data: {
    image: string;
    title: string;
    price: number;
    star?: number;
    isTopDeal?: boolean;
    isAuthentic?: boolean;
    sale?: {
      percent: number;
    };
    shipping: {
      type: 'fast' | 'normal' | string;
      date: string;
    };
    isGlobal?: boolean;
    madeIn?: string;
  }[];
};