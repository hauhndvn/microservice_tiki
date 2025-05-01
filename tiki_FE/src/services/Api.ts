import { AxiosRequestConfig, AxiosResponse } from 'axios';
import Http from './Http';
import { ProductItems, ProductData, ShopData, CustomerLogin, CustomerRegister, OrderItems, GetProductOrShop, ProductOrShopResponse} from '@/dto/tikiDto';

//lấy danh sách sản phẩm
export const getProduct = (config: AxiosRequestConfig): Promise<AxiosResponse<ProductData>> => Http.get("/product", config);
export const getProductByID = (id:number): Promise<AxiosResponse<ProductItems>> => Http.get(`/product/id/${id}`);
export const getShopByID = (id:number): Promise<AxiosResponse<ShopData>> => Http.get(`/shop/${id}`);

export const registerCustomer = (data: CustomerRegister): Promise<AxiosResponse<any>> => Http.post("/auth/signUp-customer", data);
export const loginCustomer = (data: CustomerLogin): Promise<AxiosResponse<any>> => Http.post("/auth/login-customer", data);
export const createOrder = (data: OrderItems, config: AxiosRequestConfig): Promise<AxiosResponse<any>> => Http.post("/order/save-order", data, config);
export const getProductOrShop = (config: AxiosRequestConfig<GetProductOrShop>): Promise<AxiosResponse<ProductOrShopResponse>> => Http.get("/product-shop-title", config);
