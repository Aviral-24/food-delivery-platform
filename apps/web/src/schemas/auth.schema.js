import { z } from 'zod';
import { ROLES } from '@food-delivery/shared';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} [name]
 * @property {string} email
 * @property {string|null} [phone]
 * @property {'customer'|'restaurant_owner'|'rider'|'admin'} role
 */

/**
 * @typedef {Object} AuthResponseData
 * @property {User} user
 * @property {string} token
 * @property {string} [refreshToken]
 */

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional().default('User'),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  role: z.enum([ROLES.CUSTOMER, ROLES.RESTAURANT_OWNER, ROLES.RIDER, ROLES.ADMIN]),
});

export const authDataSchema = z.object({
  user: userSchema,
  token: z.string().min(10),
  refreshToken: z.string().optional(),
});

export const loginFormSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([ROLES.CUSTOMER, ROLES.RESTAURANT_OWNER, ROLES.RIDER]).default(ROLES.CUSTOMER),
});