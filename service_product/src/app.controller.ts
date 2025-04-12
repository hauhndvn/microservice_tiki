import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache 
  ) {}

  @MessagePattern("get_all_product")
  async findAll(@Payload() data) {
    let {page, limit, featured} = data;
    let dataCache = await this.cacheManager.get("get_all_product_tiki");
    //lần 2
    if (dataCache){
      return dataCache;
    }
    let dataGet = await this.appService.findAll(
      Number(page),
      Number(limit),
      featured,
    );
    //lần 1
    this.cacheManager.set("get_all_product_tiki", dataGet);
    return dataGet;
  }

  @MessagePattern("get_all_name_product")
  async findAllFood(@Payload() data) {
    let {page, limit, featured, name_food} = data
    let dataCache = await this.cacheManager.get("get_all_name_product_tiki");
    //lần 2
    if (dataCache){
      return dataCache;
    }
    let dataGet = await this.appService.findAll(
      Number(page),
      Number(limit),
      featured,
      name_food,
    );
    //lần 1
    this.cacheManager.set("get_all_name_product_tiki", dataGet);
    return dataGet;
  }
  @MessagePattern("save_product")
  async saveProduct(@Payload() data){
    return this.appService.saveProduct(data);
  }
  @MessagePattern("get_product")
  async findFood(@Payload() data:string) {
     return this.appService.findFood(data);
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
