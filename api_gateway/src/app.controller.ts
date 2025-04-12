import { BadRequestException, Body, Controller, Get, Inject, Param, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    @Inject("PRODUCT_NAME") private productService: ClientProxy,
    @Inject("USER_NAME") private userService: ClientProxy,
    @Inject("ORDER_NAME") private orderService: ClientProxy,

  ) {}

 
//------------------------------------------------
  @Get("/product")
  async getAllProduct(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('featured') featured?: string,
  ){
    let productAllData = await lastValueFrom(this.productService.send("get_all_product", {page, limit, featured}));
    return productAllData;
  }
  
  @Get("/product-name")
  async getAllNameProduct(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('featured') featured?: string,
    @Query('name_product') name_product?: string,
  ){
    let productAllNameProduct = await lastValueFrom(this.productService.send("get_all_name_product", {page, limit, featured, name_product}));
    return productAllNameProduct;
  }

  @Get("/product/:name")
 async getProduct(@Param('name') name: string) {
    //gọi đến service product để lấy data
    let productData = await lastValueFrom(this.productService.send("get_product", name));
    // console.log(productData);
    
    return productData;
  }

  @Post('/product/save-product')
  //upload multi file
  @UseInterceptors(FilesInterceptor(
    "image",
    20,{
      storage: diskStorage({
        destination: process.cwd()+"/public/images/products",
        filename:(req, file, callback)=>callback(null,new Date().getTime()+"_"+file.originalname)
      })
    }
    ))
  async saveProduct(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body
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
      category_id: parseInt(body.category_id, 10)       // ép int
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
  @Post('/shop/save-shop')
  //upload 1 file
  @UseInterceptors(FileInterceptor(
    "logo",{
      storage: diskStorage({
        destination: process.cwd()+"/public/images/shops",
        filename:(req, file, callback)=>callback(null,new Date().getTime()+"_"+file.originalname)
      })
    }
    ))
  async saveShop(
    @UploadedFile() file: Express.Multer.File,
    @Body() body){
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

  @Get('/shop/:shop_id')
  async findShop(
    @Param('shop_id') shop_id: number,
    @Query('official') official?: string
) {
    let shopData = await lastValueFrom(this.productService.send("get_shop", {shop_id, official}));
    // console.log(productData);
    return shopData;
  }

  @Get('/category/:category_id')
  async findCategory(
    @Param('category_id') category_id: number,
  ) {
    let categoryData = await lastValueFrom(this.productService.send("get_category", {category_id}));
    // console.log(productData);
    return categoryData;
  }

  @Post("/auth/sign-up")
  async signUp(@Body() body){
    //body chứa họ tên, sđt, email, password, address
    //qua service bóc tách sau
      let newUserData = await lastValueFrom(this.userService.send("post_new_user", body));
      return newUserData;
    }
  @Post("/auth/login")
  async login(@Body() body){
    //body chứa userName/sđt/email, password
    //qua service bóc tách sau
    // console.log(body);
    
    let userData = await lastValueFrom(this.userService.send("post_user", body));
    return userData;
    }
  @Post("/order/save-order")
  async order(@Body() info){
    //gọi service_order để lưu data --> saveOrder(data)
    let dataOrder = await lastValueFrom(this.orderService.send("save-order", info));
    //gọi service_notify để gửi email xác nhận đơn --> sendMailOrder(data)
    //gọi tiếp service_logistics --> saveLogistics() 
    //       thành công thì gọi service_notify để gửi email báo đã giao hàng --> sendMailSuccess(data)
    return dataOrder;
  }
}
