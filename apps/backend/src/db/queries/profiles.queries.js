import { withRls } from '../withRls.js';

export const profilesQueries = {
  async findById(user, profileId) {
    return withRls(user, async (client) => {
      const { rows } = await client.query(
        `SELECT id, name, email, phone, role, created_at
         FROM public.profiles
         WHERE id = $1`,
        [profileId]
      );
      return rows[0] || null;
    });
  },
};