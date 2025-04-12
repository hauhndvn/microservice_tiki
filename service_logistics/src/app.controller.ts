import { Controller} from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
  ) {}

  @EventPattern("save_logistic")
 async saveLogistics(@Payload() data) {
    await this.appService.saveLogistics(data);
  }
}
