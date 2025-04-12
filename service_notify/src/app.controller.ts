import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern("send_mail_signUp_success")
  sendMailRegister(@Payload() data) {
    return this.appService.sendMailRegister(data);
  }

  @EventPattern("send_email_order")
  sendMailOrder(@Payload() data) {
    return this.appService.sendMailOrder(data);
  }

  @EventPattern("send_email_success")
  sendMailSuccess(@Payload() data) {
    
    return this.appService.sendMailSuccess(data);
  }

  @EventPattern("send_mail_signUp_shop_success")
  sendMailShopSuccess(@Payload() data) {
    return this.appService.sendMailShopSuccess(data);
  }
}
