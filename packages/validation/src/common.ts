import { z } from 'zod';

/**
 * Validates a positive decimal string (e.g., "100.50", "0.00000001")
 * Guarantees no negative values and up to 8 decimal places.
 */
export const positiveDecimalStringSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,8})?$/, 'Must be a valid positive decimal value with up to 8 decimal places')
  .refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, 'Value must be greater than zero');

/**
 * Validates any monetary decimal string (can be positive, negative, or zero)
 */
export const monetaryDecimalStringSchema = z
  .string()
  .trim()
  .regex(/^-?\d+(\.\d{1,4})?$/, 'Must be a valid monetary value with up to 4 decimal places');

/**
 * Standard 3-character ISO 4217 Currency Code
 */
export const currencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(3, 'Currency must be a 3-character ISO code (e.g. USD, EUR, INR)');

/**
 * Common pagination query schema
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationQueryDto = z.infer<typeof paginationQuerySchema>;

/**
 * Standard entity ID validator
 */
export const entityIdSchema = z.string().trim().min(1, 'ID cannot be empty');
