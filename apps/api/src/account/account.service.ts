import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto, CreateTransactionDto } from '@tradeforge/validation';
import { TransactionType, AccountType } from '@tradeforge/types';
import { Decimal } from 'decimal.js';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async getAccounts(userId: string) {
    const defaultBank = await this.prisma.linkedAccount.findFirst({
      where: { userId, isDefault: true },
    });
    
    if (!defaultBank) return [];

    let account = await this.prisma.account.findFirst({
      where: { userId, linkedAccountId: defaultBank.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!account) {
      // Auto-provision if it's missing (e.g., for existing linked accounts before migration)
      account = await this.prisma.account.create({
        data: {
          userId,
          linkedAccountId: defaultBank.id,
          name: `${defaultBank.bankName} Trading`,
          type: 'PAPER',
          currency: 'USD',
          balance: 0,
        },
        include: {
          transactions: true,
        },
      });
    }

    return [account];
  }

  async getAccountById(userId: string, accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async createAccount(userId: string, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        userId,
        name: dto.name,
        currency: dto.currency || 'USD',
        type: AccountType.PAPER,
        balance: dto.initialDeposit || 0,
      },
    });
  }

  async deposit(userId: string, dto: CreateTransactionDto) {
    // We must use a database transaction to ensure atomicity
    return this.prisma.$transaction(async (tx) => {
      // 1. Find and lock the account (using unique constraint to verify ownership)
      const account = await tx.account.findFirst({
        where: { id: dto.accountId, userId },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      const depositAmount = new Decimal(dto.amount);
      if (depositAmount.lte(0)) {
        throw new BadRequestException('Deposit amount must be strictly positive');
      }

      // 2. Update the balance securely
      const newBalance = new Decimal(account.balance).plus(depositAmount);

      const linkedAccount = await tx.linkedAccount.findFirst({
        where: { userId, isDefault: true },
      });

      if (!linkedAccount) {
        throw new BadRequestException('You must set a default bank account before depositing funds. Please go to your Profile to set one.');
      }

      const updatedAccount = await tx.account.update({
        where: { id: account.id },
        data: { balance: newBalance },
      });

      // 3. Create the ledger transaction record
      const transaction = await tx.transaction.create({
        data: {
          accountId: account.id,
          type: TransactionType.DEPOSIT,
          amount: depositAmount,
          currency: account.currency,
          description: dto.description || 'Simulated Cash Deposit',
        },
      });

      return { account: updatedAccount, transaction };
    });
  }

  async withdraw(userId: string, dto: CreateTransactionDto) {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.account.findFirst({
        where: { id: dto.accountId, userId },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      const withdrawAmount = new Decimal(dto.amount);
      if (withdrawAmount.lte(0)) {
        throw new BadRequestException('Withdrawal amount must be strictly positive');
      }

      const currentBalance = new Decimal(account.balance);
      if (currentBalance.lt(withdrawAmount)) {
        throw new BadRequestException('Insufficient funds');
      }

      const newBalance = currentBalance.minus(withdrawAmount);

      const updatedAccount = await tx.account.update({
        where: { id: account.id },
        data: { balance: newBalance },
      });

      const transaction = await tx.transaction.create({
        data: {
          accountId: account.id,
          type: TransactionType.WITHDRAWAL,
          amount: withdrawAmount,
          currency: account.currency,
          description: dto.description || 'Simulated Cash Withdrawal',
        },
      });

      return { account: updatedAccount, transaction };
    });
  }
}
