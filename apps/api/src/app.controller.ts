import { Controller, Get } from '@nestjs/common';
import { AppService, HealthStatus } from './app.service';
import { ApiResponse } from '@tradeforge/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): ApiResponse<HealthStatus> {
    return this.appService.getHealth();
  }
}
