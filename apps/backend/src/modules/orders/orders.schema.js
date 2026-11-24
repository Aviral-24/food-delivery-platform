import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    restaurantId: z.string().uuid('Valid restaurantId UUID is required'),
    items: z
      .array(
        z.object({
          menuItemId: z.string().uuid('Valid menuItemId UUID is required'),
          quantity: z.number().int().min(1).max(20),
        })
      )
      .min(1, 'Order must include at least one item'),
    deliveryAddress: z.object({
      street: z.string().trim().min(3),
      city: z.string().trim().min(2).default('Indore'),
      pincode: z.string().trim().min(4).max(10),
    }),
  }),
});