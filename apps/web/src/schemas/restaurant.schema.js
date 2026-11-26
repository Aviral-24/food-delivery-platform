import { z } from 'zod';

/**
 * @typedef {Object} Restaurant
 * @property {string} id
 * @property {string} name
 * @property {string[]} cuisine
 * @property {string} city
 * @property {number} rating
 * @property {number} avg_cost_for_two
 * @property {number} delivery_time_mins
 * @property {boolean} is_open
 * @property {number|null} [lat]
 * @property {number|null} [lng]
 */

export const restaurantSchema = z.object({
  id: z.string().uuid(),
  owner_id: z.string().uuid().nullable().optional(),
  name: z.string(),
  cuisine: z.array(z.string()).default([]),
  city: z.string().default('Indore'),
  rating: z.coerce.number().default(0),
  avg_cost_for_two: z.coerce.number().default(400),
  delivery_time_mins: z.coerce.number().default(30),
  is_open: z.boolean().default(true),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
});

export const restaurantListSchema = z.array(restaurantSchema);