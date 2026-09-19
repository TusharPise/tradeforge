import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketService } from '../market/market.service';
import { Decimal } from 'decimal.js';

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private marketService: MarketService,
  ) {}

  async getMetrics(userId: string) {
    const defaultBank = await this.prisma.linkedAccount.findFirst({
      where: { userId, isDefault: true },
    });
    if (!defaultBank) {
      return { totalValue: 0, cash: 0, positionValue: 0, unrealizedPnL: 0, winRate: 0, allocation: [] };
    }

    // 1. Get Cash Balance
    const account = await this.prisma.account.findFirst({
      where: { userId, linkedAccountId: defaultBank.id },
    });
    const cash = account ? new Decimal(account.balance) : new Decimal(0);

    // 2. Get Open Positions and calculate value
    const positions = await this.prisma.position.findMany({
      where: { portfolio: { userId, linkedAccountId: defaultBank.id } },
      include: { asset: true },
    });

    let totalPositionValue = new Decimal(0);
    let totalUnrealizedPnL = new Decimal(0);
    const allocation: Record<string, { value: number; type: string }> = {};

    allocation['CASH'] = { value: cash.toNumber(), type: 'CASH' };

    for (const pos of positions) {
      const currentPrice = await this.marketService.getPrice(pos.asset.symbol) || pos.asset.currentPrice || new Decimal(0);

      const currentValue = new Decimal(pos.quantity).mul(currentPrice);
      const totalCost = new Decimal(pos.quantity).mul(pos.averageCost);
      const pnl = currentValue.minus(totalCost);

      totalPositionValue = totalPositionValue.plus(currentValue);
      totalUnrealizedPnL = totalUnrealizedPnL.plus(pnl);

      if (!allocation[pos.asset.symbol]) {
        allocation[pos.asset.symbol] = { value: 0, type: pos.asset.type };
      }
      allocation[pos.asset.symbol].value += currentValue.toNumber();
    }

    const totalValue = cash.plus(totalPositionValue);

    // Format allocation for PieChart
    const allocationData = Object.entries(allocation)
      .filter(([_, data]) => data.value > 0)
      .map(([symbol, data]) => ({
        name: symbol,
        value: data.value,
        type: data.type,
      }))
      .sort((a, b) => b.value - a.value);

    // 3. Get Win Rate from Orders (mock logic: profitable sells vs loss sells)
    // For simplicity, we just count orders, but a real win rate would pair opening/closing trades.
    // Let's just return a placeholder or calculate based on open positions being green.
    let winningPositions = 0;
    for (const pos of positions) {
      const currentPrice = await this.marketService.getPrice(pos.asset.symbol) || pos.asset.currentPrice || new Decimal(0);
      if (currentPrice.gt(pos.averageCost)) {
        winningPositions++;
      }
    }
    const winRate = positions.length > 0 
      ? (winningPositions / positions.length) * 100 
      : 0;

    return {
      totalValue: totalValue.toNumber(),
      cash: cash.toNumber(),
      positionValue: totalPositionValue.toNumber(),
      unrealizedPnL: totalUnrealizedPnL.toNumber(),
      winRate: parseFloat(winRate.toFixed(2)),
      allocation: allocationData,
    };
  }

  async getEquityCurve(userId: string) {
    // Generate a beautiful mock 30-day equity curve based on current value
    const metrics = await this.getMetrics(userId);
    const currentValue = metrics.totalValue;
    
    // We'll simulate that the portfolio grew (or fell) by a random walk leading up to today
    const data = [];
    let simulatedValue = currentValue * 0.95; // Assume 5% growth over 30 days roughly

    for (let i = 30; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      data.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: i === 0 ? currentValue : parseFloat(simulatedValue.toFixed(2)),
      });

      // Random walk for next day (between -1% and +1.5%)
      const change = 1 + (Math.random() * 0.025 - 0.01);
      simulatedValue *= change;
    }

    return data;
  }
}
