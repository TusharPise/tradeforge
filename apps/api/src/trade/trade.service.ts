import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketService } from '../market/market.service';
import { CreateOrderDto } from '@tradeforge/validation';
import { Decimal } from 'decimal.js';
import { NotificationType, OrderSide, OrderStatus, OrderType, TransactionType } from '@tradeforge/types';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TradeService {
  constructor(
    private prisma: PrismaService,
    private marketService: MarketService,
    private notificationService: NotificationService,
  ) {}

  // Helper to ensure user has a portfolio
  async getOrCreatePortfolio(userId: string) {
    const defaultBank = await this.prisma.linkedAccount.findFirst({
      where: { userId, isDefault: true },
    });

    if (!defaultBank) {
      throw new BadRequestException('You must set a default bank account first.');
    }

    let portfolio = await this.prisma.portfolio.findFirst({
      where: { userId, linkedAccountId: defaultBank.id },
    });

    if (!portfolio) {
      portfolio = await this.prisma.portfolio.create({
        data: {
          userId,
          linkedAccountId: defaultBank.id,
          name: `${defaultBank.bankName} Portfolio`,
        },
      });
    }

    return portfolio;
  }

  async getPositions(userId: string) {
    const portfolio = await this.getOrCreatePortfolio(userId);
    return this.prisma.position.findMany({
      where: { portfolioId: portfolio.id },
      include: { asset: true },
    });
  }

  async executeMarketOrder(userId: string, orderDto: CreateOrderDto) {
    if (orderDto.type !== OrderType.MARKET) {
      throw new BadRequestException('Only MARKET orders are supported in Phase 4');
    }

    const defaultBank = await this.prisma.linkedAccount.findFirst({
      where: { userId, isDefault: true },
    });
    if (!defaultBank) {
      throw new BadRequestException('No default bank account set');
    }

    const portfolio = await this.getOrCreatePortfolio(userId);
    const account = await this.prisma.account.findFirst({
      where: { userId, linkedAccountId: defaultBank.id },
    });

    if (!account) {
      throw new BadRequestException('No funding account found');
    }

    // 2. Verify Asset and get real-time price
    const asset = await this.prisma.asset.findUnique({
      where: { id: orderDto.assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const currentPrice = await this.marketService.getPrice(asset.symbol);
    if (!currentPrice) {
      throw new BadRequestException('Market price currently unavailable');
    }

    const qty = new Decimal(orderDto.quantity);
    const totalValue = currentPrice.times(qty);

    const executedOrder = await this.prisma.$transaction(async (tx) => {
      // Refresh account balance with lock
      const lockedAccount = await tx.account.findUniqueOrThrow({
        where: { id: account.id },
      });

      if (orderDto.side === OrderSide.BUY) {
        if (new Decimal(lockedAccount.balance).lt(totalValue)) {
          throw new BadRequestException('Insufficient funds');
        }

        // Deduct balance
        await tx.account.update({
          where: { id: account.id },
          data: { balance: new Decimal(lockedAccount.balance).minus(totalValue) },
        });

        // Log transaction
        await tx.transaction.create({
          data: {
            accountId: account.id,
            type: TransactionType.TRADE_BUY,
            amount: totalValue,
            description: `Bought ${qty.toFixed(4)} ${asset.symbol} @ ${currentPrice.toFixed(2)}`,
          },
        });
      } else {
        // SELL Logic
        const existingPosition = await tx.position.findUnique({
          where: {
            portfolioId_assetId: { portfolioId: portfolio.id, assetId: asset.id },
          },
        });

        if (!existingPosition || new Decimal(existingPosition.quantity).lt(qty)) {
          throw new BadRequestException('Insufficient asset quantity to sell');
        }

        // Add to balance
        await tx.account.update({
          where: { id: account.id },
          data: { balance: new Decimal(lockedAccount.balance).plus(totalValue) },
        });

        // Log transaction
        await tx.transaction.create({
          data: {
            accountId: account.id,
            type: TransactionType.TRADE_SELL,
            amount: totalValue,
            description: `Sold ${qty.toFixed(4)} ${asset.symbol} @ ${currentPrice.toFixed(2)}`,
          },
        });
      }

      // Create Order Record
      const order = await tx.order.create({
        data: {
          portfolioId: portfolio.id,
          assetId: asset.id,
          type: OrderType.MARKET,
          side: orderDto.side,
          status: OrderStatus.FILLED,
          quantity: qty,
          filledQuantity: qty,
          averageExecutionPrice: currentPrice,
        },
      });

      // Update Position
      const currentPos = await tx.position.findUnique({
        where: {
          portfolioId_assetId: { portfolioId: portfolio.id, assetId: asset.id },
        },
      });

      if (orderDto.side === OrderSide.BUY) {
        let newQty = qty;
        let newAvgCost = currentPrice;

        if (currentPos) {
          const oldQty = new Decimal(currentPos.quantity);
          const oldAvgCost = new Decimal(currentPos.averageCost);
          newQty = oldQty.plus(qty);
          
          // (oldQty * oldAvgCost + newQty * newPrice) / totalQty
          const oldTotalCost = oldQty.times(oldAvgCost);
          const newTotalCost = qty.times(currentPrice);
          newAvgCost = oldTotalCost.plus(newTotalCost).dividedBy(newQty);
        }

        await tx.position.upsert({
          where: {
            portfolioId_assetId: { portfolioId: portfolio.id, assetId: asset.id },
          },
          update: {
            quantity: newQty,
            averageCost: newAvgCost,
          },
          create: {
            portfolioId: portfolio.id,
            assetId: asset.id,
            quantity: newQty,
            averageCost: newAvgCost,
          },
        });
      } else {
        // SELL
        const newQty = new Decimal(currentPos!.quantity).minus(qty);
        if (newQty.isZero()) {
          // Can either delete or leave with 0 qty. Deleting is cleaner.
          await tx.position.delete({
            where: { id: currentPos!.id },
          });
        } else {
          // Average cost doesn't change on a sell
          await tx.position.update({
            where: { id: currentPos!.id },
            data: { quantity: newQty },
          });
        }
      }

      // Record immutable audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'EXECUTE_ORDER',
          entityType: 'Order',
          entityId: order.id,
          metadata: {
            symbol: asset.symbol,
            side: orderDto.side,
            quantity: qty.toString(),
            price: currentPrice.toString(),
            totalValue: totalValue.toString(),
          },
        },
      });

      return order;
    });

    // Fire in-app notification for order execution
    await this.notificationService.createNotification(userId, {
      title: `Order Filled: ${asset.symbol}`,
      message: `${orderDto.side === OrderSide.BUY ? 'Bought' : 'Sold'} ${qty.toFixed(4)} ${asset.symbol} @ $${currentPrice.toFixed(2)} for a total of $${totalValue.toFixed(2)}.`,
      type: NotificationType.ORDER_FILLED,
      metadata: {
        orderId: executedOrder.id,
        symbol: asset.symbol,
        side: orderDto.side,
        quantity: qty.toString(),
        price: currentPrice.toString(),
      },
    });

    return executedOrder;
  }
}
