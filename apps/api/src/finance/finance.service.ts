import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from '@tradeforge/validation';
import { Decimal } from 'decimal.js';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async createExpense(userId: string, dto: CreateExpenseDto) {
    const defaultBank = await this.prisma.linkedAccount.findFirst({
      where: { userId, isDefault: true },
    });

    if (!defaultBank) {
      throw new Error('You must set a default bank account to log expenses.');
    }

    return this.prisma.expense.create({
      data: {
        userId,
        linkedAccountId: defaultBank.id,
        category: dto.category as any,
        amount: new Decimal(dto.amount),
        currency: dto.currency,
        date: dto.date,
        description: dto.description,
      },
    });
  }

  async getExpenses(userId: string) {
    const defaultBank = await this.prisma.linkedAccount.findFirst({
      where: { userId, isDefault: true },
    });
    if (!defaultBank) return [];

    return this.prisma.expense.findMany({
      where: { userId, linkedAccountId: defaultBank.id },
      orderBy: { date: 'desc' },
      take: 100, // Limit to 100 recent for simplicity
    });
  }

  async getSummary(userId: string) {
    const defaultBank = await this.prisma.linkedAccount.findFirst({
      where: { userId, isDefault: true },
    });
    if (!defaultBank) {
      return { totalSpent: 0, categoryData: [], monthlyTrend: [] };
    }

    // 1. Get total spent this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const expensesThisMonth = await this.prisma.expense.findMany({
      where: {
        userId,
        linkedAccountId: defaultBank.id,
        date: { gte: startOfMonth },
      },
    });

    const totalSpent = expensesThisMonth.reduce(
      (acc, exp) => acc.plus(new Decimal(exp.amount)),
      new Decimal(0)
    );

    // 2. Aggregate by category for donut chart
    const byCategory = expensesThisMonth.reduce((acc, exp) => {
      const cat = exp.category;
      if (!acc[cat]) acc[cat] = new Decimal(0);
      acc[cat] = acc[cat].plus(new Decimal(exp.amount));
      return acc;
    }, {} as Record<string, Decimal>);

    const categoryData = Object.keys(byCategory).map(key => ({
      name: key,
      value: byCategory[key].toNumber(),
    }));

    // 3. Aggregate by month for last 6 months (bar chart)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const expenses6Months = await this.prisma.expense.findMany({
      where: {
        userId,
        linkedAccountId: defaultBank.id,
        date: { gte: sixMonthsAgo },
      },
    });

    // Initialize the last 6 months to 0
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        name: d.toLocaleString('default', { month: 'short' }),
        value: 0,
      };
    });

    expenses6Months.forEach(exp => {
      const key = `${exp.date.getFullYear()}-${exp.date.getMonth()}`;
      const monthObj = months.find(m => m.key === key);
      if (monthObj) {
        monthObj.value += parseFloat(exp.amount.toString());
      }
    });

    return {
      totalSpent: totalSpent.toNumber(),
      categoryData,
      monthlyTrend: months.map(m => ({ name: m.name, value: m.value })),
    };
  }

  async createLinkedAccount(userId: string, data: { bankName: string; last4: string }) {
    const count = await this.prisma.linkedAccount.count({ where: { userId } });
    const isDefault = count === 0;
    
    return this.prisma.$transaction(async (tx) => {
      const linkedAccount = await tx.linkedAccount.create({
        data: {
          userId,
          bankName: data.bankName,
          last4: data.last4,
          isDefault,
        },
      });

      // Automatically provision a trading account for this bank
      await tx.account.create({
        data: {
          userId,
          linkedAccountId: linkedAccount.id,
          name: `${data.bankName} Trading`,
          type: 'PAPER',
          currency: 'USD',
          balance: 0,
        },
      });

      // Automatically provision a portfolio for this bank
      await tx.portfolio.create({
        data: {
          userId,
          linkedAccountId: linkedAccount.id,
          name: `${data.bankName} Portfolio`,
          currency: 'USD',
        },
      });

      return linkedAccount;
    });
  }

  async getLinkedAccounts(userId: string) {
    return this.prisma.linkedAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setDefaultLinkedAccount(userId: string, accountId: string) {
    // Start a transaction to ensure atomicity
    return this.prisma.$transaction(async (tx) => {
      // Set all user accounts to false
      await tx.linkedAccount.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      // Set the specified one to true
      const updated = await tx.linkedAccount.updateMany({
        where: { id: accountId, userId },
        data: { isDefault: true },
      });

      if (updated.count === 0) {
        throw new Error('Account not found');
      }

      return { success: true };
    });
  }
}
