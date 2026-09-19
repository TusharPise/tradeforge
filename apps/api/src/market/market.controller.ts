import { Controller, Get, UseGuards } from '@nestjs/common';
import { MarketService } from './market.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('market')
@UseGuards(JwtAuthGuard)
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('assets')
  async getAssets() {
    return this.marketService.getAssets();
  }

  @Get('prices')
  async getPrices() {
    return this.marketService.getPrices();
  }
}
