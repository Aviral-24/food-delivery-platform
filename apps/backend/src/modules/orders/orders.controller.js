import { asyncHandler } from '../../utils/asyncHandler.js';
import { ordersService } from './orders.service.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await ordersService.placeOrder(req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Order placed and queued for dispatch',
    data: order,
  });
});

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await ordersService.listOrders(req.user);
  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});