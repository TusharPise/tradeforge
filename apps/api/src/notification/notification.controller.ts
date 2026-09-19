import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UsePipes,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePriceAlertDto, createPriceAlertSchema } from '@tradeforge/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@Request() req: any) {
    return this.notificationService.getUserNotifications(req.user.id);
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  @Patch(':id/read')
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationService.markAsRead(req.user.id, id);
  }

  @Get('alerts')
  async getAlerts(@Request() req: any) {
    return this.notificationService.getUserAlerts(req.user.id);
  }

  @Post('alerts')
  @UsePipes(new ZodValidationPipe(createPriceAlertSchema))
  async createAlert(@Request() req: any, @Body() dto: CreatePriceAlertDto) {
    return this.notificationService.createPriceAlert(req.user.id, dto);
  }

  @Delete('alerts/:id')
  async deleteAlert(@Request() req: any, @Param('id') id: string) {
    return this.notificationService.deleteAlert(req.user.id, id);
  }
}
