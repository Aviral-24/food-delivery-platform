import { asyncHandler } from '../../utils/asyncHandler.js';
import { restaurantsService } from './restaurants.service.js';

export const getRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await restaurantsService.getAll(req.query, req.user || null);
  res.status(200).json({ success: true, count: restaurants.length, data: restaurants });
});

export const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await restaurantsService.getById(req.params.id, req.user || null);
  res.status(200).json({ success: true, data: restaurant });
});

export const createRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantsService.create(req.body, req.user);
  res.status(201).json({ success: true, message: 'Restaurant created', data: restaurant });
});

export const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantsService.update(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, message: 'Restaurant updated', data: restaurant });
});