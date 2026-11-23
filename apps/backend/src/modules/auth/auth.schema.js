import { z } from 'zod';
import { ROLES } from '../../constants/roles.js';

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
    phone: z.string().trim().min(10, 'Valid phone with country code required (e.g. +919999999999)'),
  }),
});

export const phoneOtpVerifySchema = z.object({
  body: z.object({
    phone: z.string().trim().min(10),
    token: z.string().trim().length(6, 'OTP must be 6 digits'),
  }),
});