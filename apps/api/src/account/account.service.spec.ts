import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { TransactionType } from '@tradeforge/types';

describe('AccountService', () => {
  let service: AccountService;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      account: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaService)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deposit', () => {
    it('should correctly add decimal amounts without floating point drift', async () => {
      const mockAccount = {
        id: 'acc-1',
        userId: 'user-1',
        balance: new Decimal('100.0000'), // Stored as Decimal
        currency: 'USD',
      };

      prismaService.account.findFirst.mockResolvedValue(mockAccount);
      prismaService.account.update.mockImplementation(({ data }: any) => ({
        ...mockAccount,
        balance: data.balance,
      }));
      prismaService.transaction.create.mockImplementation(({ data }: any) => data);

      const result = await service.deposit('user-1', {
        accountId: 'acc-1',
        type: TransactionType.DEPOSIT,
        amount: '0.1', // Simulate user input
        description: 'Test deposit',
      });

      // 100 + 0.1 in float might be 100.10000000000001, but with Decimal it should be exactly 100.1
      expect(result.account.balance.toString()).toBe('100.1');
      expect(result.transaction.amount.toString()).toBe('0.1');
      expect(prismaService.account.update).toHaveBeenCalledWith({
        where: { id: 'acc-1' },
        data: { balance: expect.any(Decimal) },
      });
    });

    it('should reject non-positive deposits', async () => {
      prismaService.account.findFirst.mockResolvedValue({ id: 'acc-1' });

      await expect(
        service.deposit('user-1', { accountId: 'acc-1', type: TransactionType.DEPOSIT, amount: '0' }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.deposit('user-1', { accountId: 'acc-1', type: TransactionType.DEPOSIT, amount: '-10' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('withdraw', () => {
    it('should subtract decimal amounts precisely and prevent negative balances', async () => {
      const mockAccount = {
        id: 'acc-1',
        userId: 'user-1',
        balance: new Decimal('100.1000'),
        currency: 'USD',
      };

      prismaService.account.findFirst.mockResolvedValue(mockAccount);
      prismaService.account.update.mockImplementation(({ data }: any) => ({
        ...mockAccount,
        balance: data.balance,
      }));
      prismaService.transaction.create.mockImplementation(({ data }: any) => data);

      const result = await service.withdraw('user-1', {
        accountId: 'acc-1',
        type: TransactionType.WITHDRAWAL,
        amount: '0.1',
      });

      // 100.1 - 0.1 = 100
      expect(result.account.balance.toString()).toBe('100');

      // Test insufficient funds
      await expect(
        service.withdraw('user-1', {
          accountId: 'acc-1',
          type: TransactionType.WITHDRAWAL,
          amount: '200',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
