import { Test, TestingModule } from '@nestjs/testing';
import { TradeService } from './trade.service';
import { PrismaService } from '../prisma/prisma.service';
import { MarketService } from '../market/market.service';
import { NotificationService } from '../notification/notification.service';
import { BadRequestException } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { OrderSide, OrderType, TimeInForce } from '@tradeforge/types';

describe('TradeService', () => {
  let service: TradeService;
  let prismaService: any;
  let marketService: any;
  let notificationService: any;

  beforeEach(async () => {
    prismaService = {
      portfolio: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      account: {
        findFirst: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
      },
      asset: {
        findUnique: jest.fn(),
      },
      position: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      order: {
        create: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      linkedAccount: {
        findFirst: jest.fn().mockResolvedValue({ id: 'bank-1' }),
      },
      $transaction: jest.fn((callback) => callback(prismaService)),
    };

    marketService = {
      getPrice: jest.fn(),
    };

    notificationService = {
      createNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradeService,
        { provide: PrismaService, useValue: prismaService },
        { provide: MarketService, useValue: marketService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    service = module.get<TradeService>(TradeService);
  });

  describe('executeMarketOrder (Decimal Precision)', () => {
    const mockUser = 'user-1';
    const mockPortfolio = { id: 'port-1', userId: mockUser };
    const mockAccount = { id: 'acc-1', userId: mockUser, balance: new Decimal('1000.0000') };
    const mockAsset = { id: 'asset-1', symbol: 'TEST' };

    beforeEach(() => {
      prismaService.portfolio.findFirst.mockResolvedValue(mockPortfolio);
      prismaService.account.findFirst.mockResolvedValue(mockAccount);
      prismaService.asset.findUnique.mockResolvedValue(mockAsset);
      prismaService.account.findUniqueOrThrow.mockResolvedValue(mockAccount);
      prismaService.order.create.mockResolvedValue({ id: 'order-1' });
    });

    it('should calculate new average cost correctly using Decimal (no float drift)', async () => {
      // Setup current market price and position
      // Current pos: 10 shares @ 150.55 = 1505.50
      // Buy 5 shares @ 160.00 = 800.00
      // Total value: 2305.50 / 15 shares = 153.70 average cost
      marketService.getPrice.mockResolvedValue(new Decimal('160.0000'));
      prismaService.position.findUnique.mockResolvedValue({
        id: 'pos-1',
        quantity: new Decimal('10.0000'),
        averageCost: new Decimal('150.5500'),
      });

      await service.executeMarketOrder(mockUser, {
        assetId: mockAsset.id,
        side: OrderSide.BUY,
        type: OrderType.MARKET,
        timeInForce: TimeInForce.DAY,
        quantity: '5.0000',
      });

      // Verify Decimal calculations for position update
      expect(prismaService.position.upsert).toHaveBeenCalledWith({
        where: expect.any(Object),
        update: {
          quantity: expect.any(Decimal), // 15
          averageCost: expect.any(Decimal), // 153.7
        },
        create: expect.any(Object),
      });

      const upsertCall = prismaService.position.upsert.mock.calls[0][0];
      expect(upsertCall.update.quantity.toString()).toBe('15');
      expect(upsertCall.update.averageCost.toString()).toBe('153.7');
    });

    it('should prevent buying if balance is insufficient after Decimal conversion', async () => {
      // Account balance: 1000
      // Price: 300, Qty: 4 = 1200 -> should fail
      marketService.getPrice.mockResolvedValue(new Decimal('300.0000'));
      
      await expect(
        service.executeMarketOrder(mockUser, {
          assetId: mockAsset.id,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
          timeInForce: TimeInForce.DAY,
          quantity: '4',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
