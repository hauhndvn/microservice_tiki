import { Body, Controller, Get, Param, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { GetProductQueryDto, GetProductTitleQueryDto, LoginCustomerDto, OrderInfoDto, SaveCustomerDto, SaveProductDto, SaveShopDto } from './dto/swagger.dto';
import { ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('Tiki')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService
  ) {}
//------------------------------------------------
@ApiTags('Sản phẩm')
@Get("/product")//OK
  async getAllProduct(
    // @Query('page') page: string,
    // @Query('limit') limit: string,
    // @Query('isTopDeal') isTopDeal?: string,
    @Query() query: GetProductQueryDto
  ){
    const { page, limit, isTopDeal } = query;
    return await this.appService.getAllProduct(page, limit, isTopDeal);
  }
@ApiTags('Sản phẩm')  
  @Get("/product-title")//OK
  async getAllNameProduct(
    @Query() query: GetProductTitleQueryDto
  ){
    const { title, isTopDeal } = query;
    return await this.appService.getAllNameProduct(isTopDeal, title);
  }
@ApiTags('Sản phẩm')
  @Get("/product/:title")//OK - có cache
  @ApiParam({
    name: "title",
    type: String,
    description: "Tên tiêu đề sản phẩm"
  })
 async getProduct(@Param('title') title: string) {
    return await this.appService.getProduct(title);
  }

@ApiTags('Sản phẩm')
  //upload multi file
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: SaveProductDto
  })
  @Post('/product/save-product')//OK
  @UseInterceptors(FilesInterceptor(
    "image",
    20,{
      storage: diskStorage({
        destination: process.cwd()+"/public/images/products",
        filename:(req, files, callback)=>callback(null,new Date().getTime()+"_"+files.originalname)
      })
    }
    ))
  async saveProduct(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: SaveProductDto
  ){ 
    return await this.appService.saveProduct(files, body)
  }
@ApiTags('Gian hàng')  
  //upload 1 file
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: SaveShopDto
  })
  @Post('/shop/save-shop')//OK
  @UseInterceptors(FileInterceptor('logo', {
    storage: diskStorage({
      destination: process.cwd() + '/public/images/shops',
      filename: (req, file, callback) => callback(null, Date.now() + "_" + file.originalname)
    })
  }))
  async saveShop(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: SaveShopDto
  ) {
    return await this.appService.saveShop(file, body);
  }
@ApiTags('Gian hàng')  
  @Get('/shop/:shop_id')
  @ApiParam({
    name: "shop_id",
    type: String,
    description: "ID shop"
  })
  @ApiQuery({
    name: "official",
    type: String,
    description: "Chính hãng hay không (true/false)",
    example: 'true'
  })
  async findShop( //Ok
    @Param('shop_id') shop_id: string,
    @Query('official') official: string
) {
    const shop_id_conver = parseInt(shop_id);
    return await this.appService.findShop(shop_id_conver, official);
  }
@ApiTags('Danh mục sản phẩm')
  @Get('/category/:category_id')
  @ApiParam({
    name: "category_id",
    type: String,
    description: "ID category"
  })
  async findCategory(//OK
    @Param('category_id') category_id: string,
  ) {
    const cat_id = parseInt(category_id);
    return await this.appService.findCategory(cat_id);
  }

@ApiTags('Đăng nhập/Đăng ký')
  @Post("/auth/sign-up")
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    type: SaveCustomerDto
  })
  async signUp(//OK
    @Body() body:SaveCustomerDto){
    return await this.appService.signUp(body);
    }
@ApiTags('Đăng nhập/Đăng ký')  
  @Post("/auth/login")
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    type: LoginCustomerDto
  })
  async login(@Body() body:LoginCustomerDto){
    //body chứa userName/sđt/email, password    
    return await this.appService.login(body);
    }
@ApiTags('Đặt hàng sản phẩm')
  @Post("/order/save-order")
  @ApiConsumes('application/json')
  @ApiBody({
    type: OrderInfoDto
  })
  async order(@Body() info: OrderInfoDto  ){
    return await this.appService.order(info);
  }
}
