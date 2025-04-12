import { Body, Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService
  ) {}

  @MessagePattern("post_new_user")
  async signUp(@Payload() data){
    return await this.appService.signUp(data);
  }

  @MessagePattern("post_user")
  async login(@Payload() data){
    // console.log("post_user");
    
    return await this.appService.login(data);
  }
  
}
