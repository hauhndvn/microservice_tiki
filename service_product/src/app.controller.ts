import { Controller, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService 
  ) {}

  @MessagePattern("get_all_product")
  async findAll(@Payload() data) {
    // dùng phân trang
    return await this.appService.findAll(data);
  }

  @MessagePattern("get_all_name_product_shop")
  async findAllProduct(@Payload() data) {
    // dùng Elasticsearch 
    return await this.appService.findAllNameProductShop(data);
  }

  @MessagePattern("save_product")
  async saveProduct(@Payload() data){
    return this.appService.saveProduct(data);
  }
  @MessagePattern("get_product_title")
  async getProduct(@Payload() data:string) {
     return this.appService.getProduct(data);
   }
  @MessagePattern("get_product_id")
  async getProductByID(@Payload() data){
    // console.log("data");
    // console.log(data);
    
    return this.appService.getProductByID(data);
  }
  @MessagePattern("save_shop")
  async saveShop(@Payload() data) {
    return this.appService.saveShop(data);
  }
   @MessagePattern("get_shop")
  async findShop(@Payload() data) {
    return this.appService.findShop(data);
  }

  @MessagePattern("get_category")
  async findCategory(@Payload() data
  ) {
    return this.appService.findCategory(data);
  }


}
