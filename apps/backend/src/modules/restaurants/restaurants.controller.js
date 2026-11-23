import { asyncHandler } from "../../utils/asyncHandler.js";
import { restaurantsService } from "./restaurants.service.js";

export const getRestaurants = asyncHandler(async (req, res) => {
  const restaurants = restaurantsService.getAll(req.query);
  res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants,
  });
});

export const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = restaurantsService.getById(req.params.id);
  res.status(200).json({
    success: true,
    data: restaurant,
  });
});

export const createRestaurant = asyncHandler(async (req, res) => {
  const restaurant = restaurantsService.create(req.body, req.user.id);
  res.status(201).json({
    success: true,
    message: "Restaurant created",
    data: restaurant,
  });
});
