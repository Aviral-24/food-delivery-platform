import { Router } from 'express';
import { z } from 'zod';
import {
  getRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  createRestaurant,
  updateRestaurant,
} from './restaurants.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { ROLES } from '../../constants/roles.js';

const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    cuisine: z.array(z.string()).min(1),
    city: z.string().trim().min(2).optional(),
    avgCostForTwo: z.number().positive().optional(),
    deliveryTimeMins: z.number().int().positive().optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  }),
});

const updateRestaurantSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    isOpen: z.boolean().optional(),
  }),
});

const router = Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);
router.get('/:id/menu', getRestaurantMenu);
router.post(
  '/',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  validate(createRestaurantSchema),
  createRestaurant
);
router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  validate(updateRestaurantSchema),
  updateRestaurant
);

export default router;