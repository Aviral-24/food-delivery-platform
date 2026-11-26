import { z } from 'zod';

export const menuItemSchema = z.object({
  id: z.string().uuid(),
  restaurant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.coerce.number(),
  is_veg: z.boolean().default(true),
  is_available: z.boolean().default(true),
});

export const menuListSchema = z.array(menuItemSchema);

export const orderSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  restaurant_id: z.string().uuid(),
  status: z.string(),
  total_amount: z.coerce.number(),
  delivery_address: z.any().optional(),
  created_at: z.string(),
  outboxEventId: z.string().uuid().optional(),
});

export const orderListSchema = z.array(orderSchema);

export const checkoutAddressSchema = z.object({
  street: z.string().trim().min(3, 'Street address is required'),
  city: z.string().trim().min(2).default('Indore'),
  pincode: z.string().trim().min(4, 'Valid pincode is required').max(10),
});