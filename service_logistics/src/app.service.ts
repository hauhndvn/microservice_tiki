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
      newData.status1= true;
      newData.status2= true;
      newData.status3= true;
      newData.status4= true;
      newData.status5= true;
      newData.status6= true;
      await this.prismaService.status_Order.create({
        data: newData
      });
    //gọi service_notify lần nữa để thông báo thành công
    //sendMailSuccess(data){...}
    this.notifyService.emit("send_email_success",{email})
    }
}
