import createClient from 'openapi-fetch';

/**
 * Auto-typed API client backed by generated OpenAPI types (src/generated/api.types.ts).
 * Usage in React (apps/web):
 *   const api = createFoodDeliveryClient({ baseUrl: 'http://localhost:5000/api/v1', getToken: () => token });
 *   const { data, error } = await api.POST('/orders', { body: { ... } });
 */
export const createFoodDeliveryClient = ({ baseUrl, getToken }) => {
  const client = createClient({ baseUrl });

  client.use({
    async onRequest({ request }) {
      const token = typeof getToken === 'function' ? await getToken() : null;
      if (token) {
        request.headers.set('Authorization', `Bearer ${token}`);
      }
      return request;
    },
  });

  return client;
};