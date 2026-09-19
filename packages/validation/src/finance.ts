import { z } from 'zod';
import {
  OrderType,
  OrderSide,
  TimeInForce,
  TransactionType,
  ExpenseCategory,
} from '@tradeforge/types';
import {
  positiveDecimalStringSchema,
  currencyCodeSchema,
  entityIdSchema,
} from './common';

/**
 * Order placement schema
 */
export const createOrderSchema = z
  .object({
    portfolioId: entityIdSchema.optional(),
    assetId: entityIdSchema,
    type: z.nativeEnum(OrderType),
    side: z.nativeEnum(OrderSide),
    timeInForce: z.nativeEnum(TimeInForce).default(TimeInForce.DAY),
    quantity: positiveDecimalStringSchema,
    price: positiveDecimalStringSchema.optional(),
  })
  .refine(
    (data) => {
      // Limit & Stop orders must specify a target price
      if (
        (data.type === OrderType.LIMIT ||
          data.type === OrderType.STOP ||
          data.type === OrderType.STOP_LIMIT) &&
        !data.price
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Price is required for LIMIT and STOP orders',
      path: ['price'],
    },
  );

export type CreateOrderDto = z.infer<typeof createOrderSchema>;

/**
 * Account/Wallet creation schema
 */
export const createAccountSchema = z.object({
  name: z.string().trim().min(2).max(50),
  currency: currencyCodeSchema.default('USD'),
  initialDeposit: positiveDecimalStringSchema.optional(),
});

export type CreateAccountDto = z.infer<typeof createAccountSchema>;

/**
 * Transaction creation schema (Deposit / Withdrawal simulation)
 */
export const createTransactionSchema = z.object({
  accountId: entityIdSchema,
  type: z.nativeEnum(TransactionType),
  amount: positiveDecimalStringSchema,
  description: z.string().trim().max(255).optional(),
  linkedAccountId: entityIdSchema.optional(),
});

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;

/**
 * Expense log schema
 */
export const createExpenseSchema = z.object({
  category: z.nativeEnum(ExpenseCategory),
  amount: positiveDecimalStringSchema,
  currency: currencyCodeSchema.default('USD'),
  date: z.coerce.date().default(() => new Date()),
  description: z.string().trim().max(255).optional(),
});

export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;
