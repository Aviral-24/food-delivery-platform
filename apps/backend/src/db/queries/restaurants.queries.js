import { withRls } from '../withRls.js';

export const restaurantsQueries = {
  async list(user, { search, cuisine, lat, lng, radiusKm } = {}) {
    return withRls(user, async (client) => {
      const conditions = [];
      const values = [];

      if (search) {
        values.push(`%${search}%`);
        conditions.push(`name ILIKE $${values.length}`);
      }

      if (cuisine) {
        values.push(cuisine);
        conditions.push(
          `EXISTS (SELECT 1 FROM unnest(cuisine) AS c WHERE c ILIKE '%' || $${values.length} || '%')`
        );
      }

      if (lat && lng) {
        const radiusMeters = (Number(radiusKm) || 10) * 1000;
        values.push(Number(lng), Number(lat), radiusMeters);
        const lngIdx = values.length - 2;
        const latIdx = values.length - 1;
        const radIdx = values.length;
        conditions.push(
          `location IS NOT NULL AND ST_DWithin(location, ST_SetSRID(ST_MakePoint($${lngIdx}, $${latIdx}), 4326)::geography, $${radIdx})`
        );
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const { rows } = await client.query(
        `SELECT
           id, owner_id, name, cuisine, city, rating,
           avg_cost_for_two, delivery_time_mins, is_open,
           ST_Y(location::geometry) AS lat,
           ST_X(location::geometry) AS lng,
           created_at
         FROM public.restaurants
         ${whereClause}
         ORDER BY rating DESC, created_at DESC`,
        values
      );
      return rows;
    });
  },

  async findById(user, id) {
    
    return withRls(user, async (client) => {
      const { rows } = await client.query(
        `SELECT
           id, owner_id, name, cuisine, city, rating,
           avg_cost_for_two, delivery_time_mins, is_open,
           ST_Y(location::geometry) AS lat,
           ST_X(location::geometry) AS lng,
           created_at
         FROM public.restaurants
         WHERE id = $1`,
        [id]
      );
      return rows[0] || null;
    });
  },

  async listMenu(user, restaurantId) {
  return withRls(user, async (client) => {
    const { rows } = await client.query(
      `SELECT id, restaurant_id, name, description, price, is_veg, is_available, created_at
       FROM public.menu_items
       WHERE restaurant_id = $1
       ORDER BY name ASC`,
      [restaurantId]
    );
    return rows;
  });
},
  async create(user, payload) {
    return withRls(user, async (client) => {
      const hasCoords = payload.lat !== undefined && payload.lng !== undefined;
      const { rows } = await client.query(
        `INSERT INTO public.restaurants
           (owner_id, name, cuisine, city, avg_cost_for_two, delivery_time_mins, location)
         VALUES (
           $1, $2, $3, $4, $5, $6,
           CASE WHEN $7::double precision IS NOT NULL AND $8::double precision IS NOT NULL
             THEN ST_SetSRID(ST_MakePoint($8, $7), 4326)::geography
             ELSE NULL
           END
         )
         RETURNING id, owner_id, name, cuisine, city, rating, avg_cost_for_two, delivery_time_mins, is_open, created_at`,
        [
          user.id,
          payload.name,
          payload.cuisine,
          payload.city || 'Indore',
          payload.avgCostForTwo || 400,
          payload.deliveryTimeMins || 30,
          hasCoords ? payload.lat : null,
          hasCoords ? payload.lng : null,
        ]
      );
      return rows[0];
    });
  },

  async update(user, id, payload) {
    return withRls(user, async (client) => {
      const { rows } = await client.query(
        `UPDATE public.restaurants
         SET
           name = COALESCE($2, name),
           is_open = COALESCE($3, is_open),
           updated_at = NOW()
         WHERE id = $1
         RETURNING id, owner_id, name, cuisine, city, is_open, updated_at`,
        [id, payload.name ?? null, payload.isOpen ?? null]
      );
      return rows[0] || null;
    });
  },
};