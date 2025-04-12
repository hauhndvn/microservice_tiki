import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({isGlobal:true}),
    ClientsModule.register([{
      name: "NOTIFY_NAME",
        transport: Transport.RMQ,
        options: {
          //url kết nối đến server RabbitMQ
          urls: ['amqp://admin:1234@localhost:5672'],
          //tên queue xử lý
          queue: 'notify_queue',
          queueOptions: {
            durable: true
          }
        }
      }])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
