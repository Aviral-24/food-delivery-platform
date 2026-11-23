import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabaseAdmin } from '../../src/config/supabase.js';
import { withRls } from '../../src/db/withRls.js';
import { restaurantsQueries } from '../../src/db/queries/restaurants.queries.js';
import { profilesQueries } from '../../src/db/queries/profiles.queries.js';
import { closePool } from '../../src/db/client.js';

const hasLiveDb =
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder');

describe.runIf(hasLiveDb)('Supabase RLS Isolation Tests (Day 2)', () => {
  const createdUserIds = [];
  let customerA;
  let ownerA;
  let ownerB;
  let adminUser;
  let ownerARestaurantId;

  const createTestUser = async (prefix, role) => {
    const email = `${prefix}.${Date.now()}@test.local`;
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: { name: prefix },
      app_metadata: { role },
    });
    if (error) throw error;
    createdUserIds.push(data.user.id);
    return { id: data.user.id, email, role };
  };

  beforeAll(async () => {
    customerA = await createTestUser('custA', 'customer');
    ownerA = await createTestUser('ownerA', 'restaurant_owner');
    ownerB = await createTestUser('ownerB', 'restaurant_owner');
    adminUser = await createTestUser('admin', 'admin');
  });

  afterAll(async () => {
    for (const id of createdUserIds) {
      await supabaseAdmin.auth.admin.deleteUser(id);
    }
    await closePool();
  });

  it('prevents a customer from reading another user profile (RLS SELECT)', async () => {
    const ownProfile = await profilesQueries.findById(customerA, customerA.id);
    expect(ownProfile?.id).toBe(customerA.id);

    const otherProfile = await profilesQueries.findById(customerA, ownerA.id);
    expect(otherProfile).toBeNull();
  });

  it('blocks a customer from inserting a restaurant at DB RLS level', async () => {
    await expect(
      restaurantsQueries.create(customerA, {
        name: 'Unauthorized Cafe',
        cuisine: ['Cafe'],
      })
    ).rejects.toThrow(/row-level security/i);
  });

  it('allows restaurant_owner A to create their own restaurant', async () => {
    const rest = await restaurantsQueries.create(ownerA, {
      name: 'Owner A Kitchen',
      cuisine: ['North Indian'],
      lat: 22.7196,
      lng: 75.8577,
    });
    expect(rest.owner_id).toBe(ownerA.id);
    ownerARestaurantId = rest.id;
  });

  it('blocks restaurant_owner B from updating Owner A restaurant (cross-tenant RLS)', async () => {
    const result = await restaurantsQueries.update(ownerB, ownerARestaurantId, {
      name: 'Hacked Kitchen',
    });
    expect(result).toBeNull();
  });

  it('allows admin to read all profiles and update any restaurant', async () => {
    const targetProfile = await profilesQueries.findById(adminUser, customerA.id);
    expect(targetProfile?.id).toBe(customerA.id);

    const updated = await restaurantsQueries.update(adminUser, ownerARestaurantId, {
      isOpen: false,
    });
    expect(updated?.is_open).toBe(false);
  });

  it('blocks non-admin from inserting into outbox_events via user JWT', async () => {
    await expect(
      withRls(customerA, (client) =>
        client.query(
          `INSERT INTO public.outbox_events (aggregate_type, aggregate_id, event_type, payload)
           VALUES ('order', gen_random_uuid(), 'order.placed', '{}'::jsonb)`
        )
      )
    ).rejects.toThrow(/row-level security/i);
  });
});