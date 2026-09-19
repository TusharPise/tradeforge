import { Controller, Post, Get, Body, UseGuards, Request, UsePipes, Param } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateExpenseDto, createExpenseSchema } from '@tradeforge/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('expense')
  @UsePipes(new ZodValidationPipe(createExpenseSchema))
  async createExpense(@Request() req: any, @Body() dto: CreateExpenseDto) {
    return this.financeService.createExpense(req.user.id, dto);
  }

  @Get('expenses')
  async getExpenses(@Request() req: any) {
    return this.financeService.getExpenses(req.user.id);
  }

  @Get('summary')
  async getSummary(@Request() req: any) {
    return this.financeService.getSummary(req.user.id);
  }

  @Post('linked-accounts')
  async createLinkedAccount(@Request() req: any, @Body() body: { bankName: string; last4: string }) {
    return this.financeService.createLinkedAccount(req.user.id, body);
  }

  @Get('linked-accounts')
  async getLinkedAccounts(@Request() req: any) {
    return this.financeService.getLinkedAccounts(req.user.id);
  }

  @Post('linked-accounts/:id/default')
  async setDefaultLinkedAccount(@Request() req: any, @Param('id') accountId: string) {
    return this.financeService.setDefaultLinkedAccount(req.user.id, accountId);
  }
}
