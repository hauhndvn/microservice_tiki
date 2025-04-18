import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({isGlobal:true}),
    ClientsModule.registerAsync([
      {
        name: 'NOTIFY_NAME',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${configService.get('RABBIT_USER')}:${configService.get('RABBIT_PASS')}@${configService.get('RABBIT_HOST')}:${configService.get('RABBIT_PORT')}`
            ],
            queue: 'notify_queue',
            queueOptions: { durable: true },
          }
        })
      }
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
