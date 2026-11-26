import { restaurantsQueries } from '../../db/queries/restaurants.queries.js';
import { ApiError } from '../../utils/ApiError.js';

export const restaurantsService = {
  async getAll(query, user = null) {
    return restaurantsQueries.list(user, query);
  },

  async getMenu(restaurantId, user = null) {
  await this.getById(restaurantId, user);
  return restaurantsQueries.listMenu(user, restaurantId);
},

  async getById(id, user = null) {
    const restaurant = await restaurantsQueries.findById(user, id);
    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found');
    }
    return restaurant;
  },

  async create(payload, user) {
    return restaurantsQueries.create(user, payload);
  },

  async update(id, payload, user) {
    const updated = await restaurantsQueries.update(user, id, payload);
    if (!updated) {
      throw new ApiError(404, 'Restaurant not found or access denied');
    }
    return updated;
  },
};