import { Router } from 'express';
import { createOrder, getOrders } from './orders.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createOrderSchema } from './orders.schema.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);
router.get('/', getOrders);
router.post('/', authorize(ROLES.CUSTOMER, ROLES.ADMIN), validate(createOrderSchema), createOrder);

export default router;