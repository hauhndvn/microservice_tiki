import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
  ) {}

  @MessagePattern("save-order")
  async saveOrder(@Payload() data) {
    return await this.appService.saveOrder(data);
  }
}
