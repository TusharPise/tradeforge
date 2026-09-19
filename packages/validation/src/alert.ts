import { z } from 'zod';
import { AlertCondition } from '@tradeforge/types';
import { positiveDecimalStringSchema, entityIdSchema } from './common';

export const createPriceAlertSchema = z.object({
  assetId: entityIdSchema,
  targetPrice: positiveDecimalStringSchema,
  condition: z.nativeEnum(AlertCondition),
});

export type CreatePriceAlertDto = z.infer<typeof createPriceAlertSchema>;
