import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    ClientsModule.registerAsync([
      {
        name: 'PRODUCT_NAME',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${configService.get('RABBIT_USER')}:${configService.get('RABBIT_PASS')}@${configService.get('RABBIT_HOST')}:${configService.get('RABBIT_PORT')}`
            ],
            queue: 'product_queue',
            queueOptions: { durable: true },
          }
        })
      },
      {
        name: 'USER_NAME',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${configService.get('RABBIT_USER')}:${configService.get('RABBIT_PASS')}@${configService.get('RABBIT_HOST')}:${configService.get('RABBIT_PORT')}`
            ],
            queue: 'user_queue',
            queueOptions: { durable: true },
          }
        })
      },
      {
        name: 'ORDER_NAME',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${configService.get('RABBIT_USER')}:${configService.get('RABBIT_PASS')}@${configService.get('RABBIT_HOST')}:${configService.get('RABBIT_PORT')}`
            ],
            queue: 'order_queue',
            queueOptions: { durable: true },
          }
        })
      }
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // trỏ đến thư mục public
      serveRoot: '/public', // URL prefix: /public/images/xyz
    }),
  ],    
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
