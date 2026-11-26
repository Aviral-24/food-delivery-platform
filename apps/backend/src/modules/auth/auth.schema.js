import { z } from 'zod';
import { ROLES } from '../../constants/roles.js';

const phoneField = z
  .string()
  .trim()
  .transform((val) => val.replace(/[\s-]+/g, ''))
  .pipe(
    z.string().regex(/^\+?\d{10,15}$/, 'Enter a valid 10-digit or E.164 phone number')
  );

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().email('Invalid email address').toLowerCase(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z
      .enum([ROLES.CUSTOMER, ROLES.RESTAURANT_OWNER, ROLES.RIDER])
      .optional()
      .default(ROLES.CUSTOMER),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const phoneOtpSendSchema = z.object({
  body: z.object({
    phone: phoneField,
  }),
});

export const phoneOtpVerifySchema = z.object({
  body: z
    .object({
      phone: phoneField,
      token: z.string().trim().length(6, 'OTP must be 6 digits').optional(),
      otp: z.string().trim().length(6, 'OTP must be 6 digits').optional(),
    })
    .refine((data) => Boolean(data.token || data.otp), {
      message: '6-digit OTP is required',
      path: ['token'],
    }),
});