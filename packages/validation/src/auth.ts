import { z } from 'zod';

export const passwordSchema = z
  .string()
  .trim()
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password is too long');

export const registerSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: passwordSchema,
  firstName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof loginSchema>;
