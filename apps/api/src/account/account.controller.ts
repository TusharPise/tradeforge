import { Controller, Get, Post, Body, UseGuards, Param, UsePipes } from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createAccountSchema, CreateAccountDto, createTransactionSchema, CreateTransactionDto } from '@tradeforge/validation';
import { User } from '@prisma/client';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  async getAccounts(@CurrentUser() user: User) {
    return this.accountService.getAccounts(user.id);
  }

  @Get(':id')
  async getAccountById(@CurrentUser() user: User, @Param('id') accountId: string) {
    return this.accountService.getAccountById(user.id, accountId);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createAccountSchema))
  async createAccount(@CurrentUser() user: User, @Body() dto: CreateAccountDto) {
    return this.accountService.createAccount(user.id, dto);
  }

  @Post(':id/deposit')
  async deposit(
    @CurrentUser() user: User,
    @Param('id') accountId: string,
    @Body() body: any,
  ) {
    // Manually pass accountId to DTO for validation
    const dto: CreateTransactionDto = {
      ...body,
      accountId,
      type: 'DEPOSIT', // Enforced by route
    };
    const pipe = new ZodValidationPipe(createTransactionSchema);
    const validDto = pipe.transform(dto, { type: 'body' });
    return this.accountService.deposit(user.id, validDto);
  }

  @Post(':id/withdraw')
  async withdraw(
    @CurrentUser() user: User,
    @Param('id') accountId: string,
    @Body() body: any,
  ) {
    const dto: CreateTransactionDto = {
      ...body,
      accountId,
      type: 'WITHDRAWAL', // Enforced by route
    };
    const pipe = new ZodValidationPipe(createTransactionSchema);
    const validDto = pipe.transform(dto, { type: 'body' });
    return this.accountService.withdraw(user.id, validDto);
  }
}
