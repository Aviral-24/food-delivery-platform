import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import restaurantRoutes from '../modules/restaurants/restaurants.routes.js';
import orderRoutes from '../modules/orders/orders.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/orders', orderRoutes);

export default router;