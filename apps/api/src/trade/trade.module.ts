import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { MarketModule } from '../market/market.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [MarketModule, NotificationModule],
  providers: [TradeService],
  controllers: [TradeController],
})
export class TradeModule {}
