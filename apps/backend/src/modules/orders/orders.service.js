import { ordersQueries } from '../../db/queries/orders.queries.js';

export const ordersService = {
  async placeOrder(payload, user) {
    return ordersQueries.createWithOutbox(user, payload);
  },

  async listOrders(user) {
    return ordersQueries.listForUser(user);
  },
};