import { Controller, Post, Get, Body, UseGuards, Request, UsePipes } from '@nestjs/common';
import { TradeService } from './trade.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto, createOrderSchema } from '@tradeforge/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('trade')
@UseGuards(JwtAuthGuard)
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Get('positions')
  async getPositions(@Request() req: any) {
    return this.tradeService.getPositions(req.user.id);
  }

  @Post('order')
  @UsePipes(new ZodValidationPipe(createOrderSchema))
  async executeOrder(@Request() req: any, @Body() orderDto: CreateOrderDto) {
    return this.tradeService.executeMarketOrder(req.user.id, orderDto);
  }
}
