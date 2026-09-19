import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriceAlertDto } from '@tradeforge/validation';
import { AlertCondition, NotificationType } from '@tradeforge/types';
import { Decimal } from 'decimal.js';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create an in-app notification
   */
  async createNotification(
    userId: string,
    data: {
      title: string;
      message: string;
      type: NotificationType;
      metadata?: Record<string, unknown>;
    },
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        title: data.title,
        message: data.message,
        type: data.type,
        metadata: (data.metadata as any) ?? undefined,
      },
    });
  }

  /**
   * Retrieve notifications and unread count for a user
   */
  async getUserNotifications(userId: string, limit = 30) {
    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Create a price alert rule
   */
  async createPriceAlert(userId: string, dto: CreatePriceAlertDto) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return this.prisma.priceAlert.create({
      data: {
        userId,
        assetId: dto.assetId,
        targetPrice: new Decimal(dto.targetPrice),
        condition: dto.condition,
      },
      include: {
        asset: true,
      },
    });
  }

  /**
   * List all price alerts configured by a user
   */
  async getUserAlerts(userId: string) {
    return this.prisma.priceAlert.findMany({
      where: { userId },
      include: { asset: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete a price alert
   */
  async deleteAlert(userId: string, alertId: string) {
    const alert = await this.prisma.priceAlert.findFirst({
      where: { id: alertId, userId },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    return this.prisma.priceAlert.delete({
      where: { id: alertId },
    });
  }

  /**
   * Evaluate active alerts when an asset's market price changes
   */
  async evaluatePriceAlerts(symbol: string, currentPrice: Decimal) {
    const asset = await this.prisma.asset.findUnique({
      where: { symbol },
    });

    if (!asset) return;

    const activeAlerts = await this.prisma.priceAlert.findMany({
      where: {
        assetId: asset.id,
        isActive: true,
        isTriggered: false,
      },
    });

    for (const alert of activeAlerts) {
      const target = new Decimal(alert.targetPrice);
      const shouldTrigger =
        (alert.condition === AlertCondition.ABOVE && currentPrice.gte(target)) ||
        (alert.condition === AlertCondition.BELOW && currentPrice.lte(target));

      if (shouldTrigger) {
        await this.prisma.$transaction([
          this.prisma.priceAlert.update({
            where: { id: alert.id },
            data: { isTriggered: true },
          }),
          this.prisma.notification.create({
            data: {
              userId: alert.userId,
              title: `Price Alert: ${symbol}`,
              message: `${symbol} reached $${currentPrice.toFixed(2)}, crossing your ${
                alert.condition === AlertCondition.ABOVE ? 'upper' : 'lower'
              } target of $${target.toFixed(2)}.`,
              type: NotificationType.PRICE_ALERT,
              metadata: {
                symbol,
                condition: alert.condition,
                targetPrice: target.toString(),
                triggeredPrice: currentPrice.toString(),
              },
            },
          }),
        ]);
      }
    }
  }
}
