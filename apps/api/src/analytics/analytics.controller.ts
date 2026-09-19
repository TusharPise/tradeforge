import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('metrics')
  async getMetrics(@Request() req: any) {
    return this.analyticsService.getMetrics(req.user.id);
  }

  @Get('equity-curve')
  async getEquityCurve(@Request() req: any) {
    return this.analyticsService.getEquityCurve(req.user.id);
  }
}
