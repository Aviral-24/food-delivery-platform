import crypto from "node:crypto";
import { restaurantsData } from "./restaurants.data.js";
import { ApiError } from "../../utils/ApiError.js";

export const restaurantsService = {
  getAll({ search, cuisine } = {}) {
    let list = [...restaurantsData];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }

    if (cuisine) {
      const c = cuisine.toLowerCase();
      list = list.filter((r) =>
        r.cuisine.some((item) => item.toLowerCase().includes(c)),
      );
    }

    return list;
  },

  getById(id) {
    const restaurant = restaurantsData.find((r) => r.id === id);
    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found");
    }
    return restaurant;
  },

  create(payload, ownerId) {
    const newRestaurant = {
      id: `rest-${crypto.randomUUID().slice(0, 8)}`,
      ownerId,
      name: payload.name,
      cuisine: payload.cuisine || [],
      city: payload.city || "Indore",
      rating: 0,
      avgCostForTwo: payload.avgCostForTwo || 400,
      deliveryTimeMins: payload.deliveryTimeMins || 30,
      isOpen: true,
    };

    restaurantsData.push(newRestaurant);
    return newRestaurant;
  },
};
