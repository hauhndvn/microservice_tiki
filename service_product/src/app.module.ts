import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PaginationLibsModule } from './pagination_libs/pagination_libs.module';
import { RedisCacheModule } from './redis_cache/redis_cache.module';
import { ElasticModule } from './elastic/elastic.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [PrismaModule, PaginationLibsModule, ConfigModule.forRoot({isGlobal:true}),
    RedisCacheModule,
    ElasticModule,
    ClientsModule.register([{
      name: "NOTIFY_NAME",
      transport: Transport.RMQ,
      options: {
      urls: ['amqp://admin:1234@localhost:5672'],
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
