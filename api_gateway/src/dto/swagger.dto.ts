import { ApiProperty } from "@nestjs/swagger";
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class SaveProductDto{
    @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } , description: "Danh sách ảnh"
    })                image: any; //key
    @ApiProperty({ name: "name", type: String, default: "", description: "Tên sản phẩm"})    name: string;
    @ApiProperty({ name: "title", type: String, default: "", description: "Tiêu đề"})    title: string;
    @ApiProperty({ name: "price", type: String, default: "", description: "Giá"})    price: string;
    @ApiProperty({ name: "star", type: String, default: "", description: "Đánh giá"})    star: string;
    @ApiProperty({ name: "isTopDeal", type: String, default: "", description: "Nổi bật"})    isTopDeal: string;
    @ApiProperty({ name: "isAuthentic", type: String, default: "", description: "Chính hãng"})    isAuthentic: string;
    @ApiProperty({ name: "sale_percent", type: String, default: "", description: "Giảm giá"})    sale_percent: string;
    @ApiProperty({ name: "shipping_type", type: String, default: "", description: "Normal | Fast | Option"})    shipping_type: string;
    @ApiProperty({ name: "shipping_date", type: String, default: "", description: "Ngày nhận"})    shipping_date: string;
    @ApiProperty({ name: "isGlobal", type: String, default: "", description: "Hàng Quốc tế"})    isGlobal: string;
    @ApiProperty({ name: "madeIn", type: String, default: "", description: "Sản xuất bởi"})    madeIn: string;
    @ApiProperty({ name: "shop_id", type: String, default: "", description: "Mã định danh của shop"})    shop_id: string;
    @ApiProperty({ name: "category_id", type: String, default: "", description: "Danh mục sản phẩm"})    category_id: string;
    @ApiProperty({ name: "inventory", type: String, default: "", description: "Tồn kho"})    inventory: string;
}
export class SaveShopDto{
    @ApiProperty({ name: "shop_name", type: String, default: "", description: "Tên cửa hàng"})    shop_name: string;
    @ApiProperty({ type: 'string', format: 'binary', description:'Ảnh đại diện' })
                      logo: any;
    @ApiProperty({ name: "star", type: String, default: "", description: "Đánh giá"})    star: string;
    @ApiProperty({ name: "official", type: String, default: "", description: "Chính hãng"})    official: string;
    @ApiProperty({ name: "email", type: String, default: "", description: "Địa chỉ email"})    email: string;
    @ApiProperty({ name: "phone", type: String, default: "", description: "Số điện thoại"})    phone: string;
}
export class SaveCustomerDto{
  @ApiProperty({name: "accountName", type: String, default: "", description: "Tên đăng nhập"})    accountName: string;
  @ApiProperty({name: "name", type: String, default: "", description: "Tên người dùng", example:"Hào"})    name: string;
  @ApiProperty({name: "surname", type: String, default: "", description: "Họ + họ đệm người dùng", example:"Nguyễn Văn"})    surname: string;
  @ApiProperty({name: "email", type: String, default: "", description: "Email", example:"abc@gmail.com"})    email: string;
  @ApiProperty({name: "password", type: String, default: "", description: "password", format: "password"})    password: string;
  @ApiProperty({name: "phone", type: String, default: "", description: "phone"})    phone: string;
  @ApiProperty({name: "address", type: String, default: "", description: "address"})    address: string;
}
export class GetProductQueryDto{
  @ApiPropertyOptional({ default: '1', description: 'Page number' })
  page?: string;

  @ApiPropertyOptional({ default: '5', description: 'Limit per page' })
  limit?: string;

  @ApiPropertyOptional({ default: 'true', description: 'Filter top deal products' })
  isTopDeal?: string;

  @ApiPropertyOptional({ description: 'Filter products by category_id' })
  category_id?: string;
}
export class GetProductTitleQueryDto{
    @ApiProperty({ default: '', description: 'Tiêu đề sản phẩm đầy đủ' }) //name: "title", type: String, 
    title: string;

  @ApiPropertyOptional({ default: 'true', description: 'Filter top deal products' })
  isTopDeal?: string;
}
export class LoginCustomerDto{
  @ApiProperty({name: "username", type: String, default: "", description: "Tên đăng nhập/Sđt/Email"})    username: string;
  @ApiProperty({name: "password", type: String, default: "", description: "password", format: "password"})    password: string;
}
export class LoginShopDto{
  @ApiProperty({name: "email", type: String, default: "", description: "Email"})    username: string;
  @ApiProperty({name: "password", type: String, default: "", description: "password", format: "password"})    password: string;
}
export class OrderItemDto {
  @ApiProperty({ description: 'ID sản phẩm' })
  @IsNumber()
  product_id: number;

  @ApiProperty({ description: 'Số lượng' })
  @IsNumber()
  qty: number;

  @ApiProperty({ description: 'Giá sản phẩm' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Phần trăm giảm giá' })
  @IsNumber()
  sale_percent: number;
}

export class OrderInfoDto {
  @ApiProperty({ description: 'ID customer' })
  @IsNumber()
  customer_id: number;

  @ApiProperty({ type: [OrderItemDto], description: 'Danh sách sản phẩm đặt hàng' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  order_items: OrderItemDto[];
}