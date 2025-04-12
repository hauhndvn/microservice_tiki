import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(private prismaService:PrismaService,
    @Inject("NOTIFY_NAME") private notifyService:ClientProxy
  ){}
  
  async saveLogistics(model) {
    
    const { email, ...newData } = model;
    
      await this.prismaService.status_Order.create({
        data: newData
      });
    //gọi service_notify lần nữa để thông báo thành công
    //sendMailSuccess(data){...}
    this.notifyService.emit("send_email_success",{email})
    }
}
