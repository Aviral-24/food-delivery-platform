import { pool } from './client.js';

export const withRls = async (user, callback) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL search_path = public, extensions');

    if (user?.id) {
      const claims = {
        sub: user.id,
        email: user.email || '',
        role: 'authenticated',
        user_role: user.role || 'customer',
        app_metadata: { role: user.role || 'customer' },
      };

      await client.query('SET LOCAL ROLE authenticated');
      await client.query(
        `SELECT
          set_config('request.jwt.claims', $1, true),
          set_config('request.jwt.claim.sub', $2, true),
          set_config('request.jwt.claim.role', 'authenticated', true)`,
        [JSON.stringify(claims), user.id]
      );
    } else {
      await client.query('SET LOCAL ROLE anon');
      await client.query(
        `SELECT
          set_config('request.jwt.claims', '{}', true),
          set_config('request.jwt.claim.sub', '', true),
          set_config('request.jwt.claim.role', 'anon', true)`
      );
    }

    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};