import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';

dotenv.config(); // Load .env trước khi dùng biến môi trường

async function bootstrap() {
  const app = await
  NestFactory.createMicroservice<MicroserviceOptions> (AppModule, {
    transport: Transport.RMQ,
    options: {
    urls: [
      // 'amqp://admin:1234@localhost:5672'
      `amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASS}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`
    ],
    queue: 'notify_queue',
    queueOptions: {
      durable: true
         }
    }
  })
  await app.listen();
  }
  bootstrap();
