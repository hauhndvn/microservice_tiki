import { BadRequestException, Inject, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { SaveProductDto } from './dto/swagger.dto';

@Injectable()
export class AppService {
  constructor(
      @Inject("PRODUCT_NAME") private productService: ClientProxy,
      @Inject("USER_NAME") private userService: ClientProxy,
      @Inject("ORDER_NAME") private orderService: ClientProxy,
    ) {}
    
    //upload multi file
    async saveProduct(
      files,
      body
    ){
      
      const MAX_SIZE = 20 * 1024 * 1024; // 20MB, gồm video, ảnh
  
      // Kiểm tra file size và rollback nếu có file vượt quá giới hạn
      const oversizedFiles = files.filter(file => file.size > MAX_SIZE);
  
      if (oversizedFiles.length > 0) {
        // Xoá tất cả các ảnh đã upload
        for (const file of files) {
          const imagePath = path.join(process.cwd(), '/public/images/products', file.filename);
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error(`❌ Lỗi khi xóa ảnh (quá dung lượng) ${file.filename}:`, err.message);
            } else {
              console.log(`🧹 Đã rollback ảnh vượt size: ${file.filename}`);
            }
          });
        }
  
        throw new BadRequestException('Ảnh/video không được vượt quá 20MB');
      }
  
  
      const fileNames = files.map(file => file.filename);
      const newBody = {
        ...body,
        image: fileNames, // Gán mảng các filename vào image
        star: parseFloat(body.star),
        isTopDeal: body.isTopDeal === 'true',
        isAuthentic: body.isAuthentic === 'true',
        isGlobal: body.isGlobal === 'true',
        price: parseInt(body.price, 10),                  // ép int
        sale_percent: parseInt(body.sale_percent, 10),    // ép int
        shop_id: parseInt(body.shop_id, 10),              // ép int
        category_id: parseInt(body.category_id, 10),       // ép int
        inventory: parseInt(body.inventory, 10)
      };
      try {
        const productData = await lastValueFrom(
          this.productService.send('save_product', newBody ),
        );  
        return productData;
  
      } catch (error) {
        // Nếu có lỗi → xóa toàn bộ ảnh
        for (const file of fileNames) {
          const imagePath = path.join(process.cwd(), '/public/images/products', file);
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error(`❌ Lỗi khi xóa ảnh ${file}:`, err.message);
            } else {
              console.log(`🧹 Đã rollback ảnh: ${file}`);
            }
          });
        }
    
        // Trả lỗi về client
        throw error;
      }
    }
    //upload 1 file
    async saveShop(
        file,
        body
      ){
        // ✅ Kiểm tra kích thước file (<= 200KB)
        const MAX_SIZE = 200 * 1024; // 200KB
        if (file.size > MAX_SIZE) {
          const imagePath = path.join(
            process.cwd(),
            'public/images/shops',
            file.filename,
          );
    
          // Xoá file vừa upload nếu vượt quá dung lượng
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error('❌ Lỗi khi xóa file ảnh vượt size:', err.message);
            } else {
              console.log('🧹 File quá lớn đã được xóa');
            }
          });
    
          throw new BadRequestException('Ảnh không được vượt quá 200KB');
        }
    
        // ✅ Nếu hợp lệ, tiếp tục xử lý
        //lưu file tĩnh vào public/images/shops
        const newBody = {
          ...body,
          logo: file.filename, // filename sau khi lưu
          official: body.official === 'true', // bắt buộc ép kiểu
          star: parseFloat(body.star),        // bắt buộc ép kiểu float
        };
        // console.log(file.filename);
        try {
          const shopData = await lastValueFrom(
            this.productService.send('save_shop', newBody),
          );
      
          return shopData;
        } catch (error) {
          // Nếu có lỗi → xóa file ảnh vừa upload
          const imagePath = path.join(
            process.cwd(),
            '/public/images/shops',
            file.filename,
          );
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error('❌ Lỗi khi xóa file ảnh:', err.message);
            } else {
              console.log('🧹 Ảnh đã được rollback do lỗi insert_shop');
            }
          });
      
          // Trả lỗi về client
          throw error;
        }
    }
    async getAllProduct(
        page: string,
        limit: string,
        isTopDeal?: string,
    ){
      let productAllData = await lastValueFrom(this.productService.send("get_all_product", {page, limit, isTopDeal}));
      return productAllData;
    }
    async getAllNameProduct(
        isTopDeal?: string,
        title?: string,
      ){    
        let productAllNameProduct = await lastValueFrom(this.productService.send("get_all_name_product", {isTopDeal, title}));
        return productAllNameProduct;
      }
     async getProduct(title: string) {
        //gọi đến service product để lấy data
        let productData = await lastValueFrom(this.productService.send("get_product_title", title));
        return productData;
      }
    async findShop(
      shop_id: number, 
      official: string)
    {
      let shopData = await lastValueFrom(this.productService.send("get_shop", {shop_id, official}));
      return shopData;
    }
    async findCategory(
        category_id: number
    ) 
    {
      let categoryData = await lastValueFrom(this.productService.send("get_category", {category_id}));
      return categoryData;
    }
    async signUp(body){
      //body chứa họ tên, sđt, email, password, address
        let newUserData = await lastValueFrom(this.userService.send("post_new_user", body));
        return newUserData;
    }
    async login(body){
      //body chứa userName/sđt/email, password    
      let userData = await lastValueFrom(this.userService.send("post_user", body));
      return userData;
    }
    async order(info){
      let dataOrder = await lastValueFrom(this.orderService.send("save-order", info));
      return dataOrder;
    }
}
