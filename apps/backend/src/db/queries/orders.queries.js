import { withRls } from '../withRls.js';
import { ApiError } from '../../utils/ApiError.js';

export const ordersQueries = {
  async createWithOutbox(user, { restaurantId, items, deliveryAddress }) {
    return withRls(user, async (client) => {
      const restRes = await client.query(
        `SELECT id, name, is_open FROM public.restaurants WHERE id = $1`,
        [restaurantId]
      );
      const restaurant = restRes.rows[0];
      if (!restaurant) {
        throw new ApiError(404, 'Restaurant not found');
      }
      if (!restaurant.is_open) {
        throw new ApiError(400, 'Restaurant is currently closed');
      }

      const itemIds = items.map((i) => i.menuItemId);
      const menuRes = await client.query(
        `SELECT id, name, price, is_available
         FROM public.menu_items
         WHERE restaurant_id = $1 AND id = ANY($2::uuid[])`,
        [restaurantId, itemIds]
      );

      const menuMap = new Map(menuRes.rows.map((m) => [m.id, m]));
      let totalAmount = 0;
      const lineItems = [];

      for (const reqItem of items) {
        const dbItem = menuMap.get(reqItem.menuItemId);
        if (!dbItem) {
          throw new ApiError(400, `Menu item ${reqItem.menuItemId} does not belong to this restaurant`);
        }
        if (!dbItem.is_available) {
          throw new ApiError(400, `Menu item "${dbItem.name}" is currently unavailable`);
        }
        const unitPrice = Number(dbItem.price);
        totalAmount += unitPrice * reqItem.quantity;
        lineItems.push({
          menuItemId: dbItem.id,
          name: dbItem.name,
          quantity: reqItem.quantity,
          unitPrice,
        });
      }

      totalAmount = Number(totalAmount.toFixed(2));

      const orderRes = await client.query(
        `INSERT INTO public.orders (customer_id, restaurant_id, status, total_amount, delivery_address)
         VALUES ($1, $2, 'pending', $3, $4::jsonb)
         RETURNING id, customer_id, restaurant_id, status, total_amount, delivery_address, created_at`,
        [user.id, restaurantId, totalAmount, JSON.stringify(deliveryAddress)]
      );
      const order = orderRes.rows[0];

      for (const line of lineItems) {
        await client.query(
          `INSERT INTO public.order_items (order_id, menu_item_id, item_name_snapshot, quantity, unit_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [order.id, line.menuItemId, line.name, line.quantity, line.unitPrice]
        );
      }

      // Same DB transaction: enqueue `order.placed` into outbox_events
      const eventPayload = {
        orderId: order.id,
        customerId: user.id,
        restaurantId: order.restaurant_id,
        restaurantName: restaurant.name,
        totalAmount,
        items: lineItems,
        deliveryAddress,
      };

      const outboxRes = await client.query(
        `SELECT public.enqueue_outbox_event('order', $1, 'order.placed', $2::jsonb) AS event_id`,
        [order.id, JSON.stringify(eventPayload)]
      );

      return {
        ...order,
        items: lineItems,
        outboxEventId: outboxRes.rows[0].event_id,
      };
    });
  },

  async listForUser(user) {
    return withRls(user, async (client) => {
      const { rows } = await client.query(
        `SELECT id, customer_id, restaurant_id, status, total_amount, delivery_address, created_at
         FROM public.orders
         ORDER BY created_at DESC`
      );
      return rows;
    });
  },
};