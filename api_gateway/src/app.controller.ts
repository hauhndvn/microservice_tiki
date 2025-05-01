import { Body, Controller, Get, Headers, Param, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { GetProductQueryDto, GetProductTitleQueryDto, LoginCustomerDto, LoginShopDto, OrderInfoDto, SaveCustomerDto, SaveProductDto, SaveShopDto } from './dto/swagger.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Tiki')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService,

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
    const { page, limit, isTopDeal, category_id } = query;
    return await this.appService.getAllProduct(page, limit, isTopDeal, category_id);
  }
@ApiTags('Sản phẩm')  
  @Get("/product-shop-title")//OK
  async getAllNameProductShop(
    @Query() query: GetProductTitleQueryDto
  ){
    const { title, isTopDeal } = query;
    return await this.appService.getAllNameProductShop(isTopDeal, title);
  }
@ApiTags('Sản phẩm')
  @Get("/product/title/:title")//OK - có cache
  @ApiParam({
    name: "title",
    type: String,
    description: "Tên tiêu đề sản phẩm"
  })
 async getProduct(@Param('title') title: string) {
    return await this.appService.getProduct(title);
  }
@ApiTags('Sản phẩm')
  @Get("/product/id/:id")//
  @ApiParam({
    name: "id",
    type: String,
    description: "ID sản phẩm"
  })
 async getProductByID(@Param('id') id: string) {
    return await this.appService.getProductByID(id);
  }

@ApiTags('Sản phẩm')
  @Post('/product/save-product')//OK
  @UseGuards(AuthGuard("jwt1"))
  @ApiBearerAuth()//để Swagger hiểu
  //upload multi file
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: SaveProductDto
  })
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
    @Body() body: SaveProductDto,
    @Headers('Authorization') token: string,
  ){ 
    return await this.appService.saveProduct(files, body)
  }
@ApiTags('Gian hàng')  
  //upload 1 file
  @Post('/shop/save-shop')//OK
  @UseGuards(AuthGuard("jwt1"))
  @ApiBearerAuth()//để Swagger hiểu
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: SaveShopDto
  })
  @UseInterceptors(FileInterceptor('logo', {
    storage: diskStorage({
      destination: process.cwd() + '/public/images/shops',
      filename: (req, file, callback) => callback(null, Date.now() + "_" + file.originalname)
    })
  }))
  async saveShop(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: SaveShopDto,
    @Headers('Authorization') token: string,
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
    example: 'true',
    required: false, // Đánh dấu official là tùy chọn
  })
  async findShop( //Ok
    @Param('shop_id') shop_id: string,
    @Query('official') official?: string
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
//---------------------------------------------------
@ApiTags('Shops >> Đăng nhập/Đăng ký/Đăng xuất')  
  @Post("/auth/login-shop")
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    type: LoginShopDto
  })
  async loginShop(@Body() body:LoginShopDto){
    //body chứa userName/sđt/email, password    
    return await this.appService.loginShop(body);
    }
//---------------------------------------------------
@ApiTags('Customers >> Đăng nhập/Đăng ký/Đăng xuất')
  @Post("/auth/signUp-customer")
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    type: SaveCustomerDto
  })
  async signUp(//OK
    @Body() body:SaveCustomerDto){
    return await this.appService.signUp(body);
    }
  @ApiTags('Customers >> Đăng nhập/Đăng ký/Đăng xuất')  
    @Post("/auth/login-customer")
    @ApiConsumes('application/x-www-form-urlencoded')
    @ApiBody({
      type: LoginCustomerDto
    })
    async login(@Body() body:LoginCustomerDto){
      //body chứa userName/sđt/email, password    
      return await this.appService.login(body);
      }
@ApiTags('Customers >> Đăng nhập/Đăng ký/Đăng xuất')
  @UseGuards(AuthGuard("jwt1"))
  @ApiBearerAuth()//để Swagger hiểu
  @Get("/auth/:customer_id/logout")
  @ApiParam({
    name: "customer_id",
    type: String,
    description: "ID customer"
  })
  async logout(
    @Headers('Authorization') token: string,
    @Param('customer_id') customer_id: string,
  ){
    //body chứa userName/sđt/email, password    
    return await this.appService.logout(customer_id);
    }    
@ApiTags('Đặt hàng sản phẩm')
  @Post("/order/save-order")
  @UseGuards(AuthGuard("jwt1"))
  @ApiBearerAuth()//để Swagger hiểu
  @ApiConsumes('application/json')
  @ApiBody({
    type: OrderInfoDto
  })
  async order(
    @Body() info: OrderInfoDto,
    @Headers('Authorization') token: string  ){
    return await this.appService.order(info);
  }
}
