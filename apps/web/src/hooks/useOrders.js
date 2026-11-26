import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { restaurantSchema } from '@/schemas/restaurant.schema';
import { menuListSchema, orderListSchema, orderSchema } from '@/schemas/order.schema';

export const useRestaurantDetailQuery = (restaurantId) =>
  useQuery({
    queryKey: ['restaurant', restaurantId],
    enabled: Boolean(restaurantId),
    queryFn: () => apiRequest(`/restaurants/${restaurantId}`, { schema: restaurantSchema }),
  });

export const useRestaurantMenuQuery = (restaurantId) =>
  useQuery({
    queryKey: ['restaurant-menu', restaurantId],
    enabled: Boolean(restaurantId),
    queryFn: () => apiRequest(`/restaurants/${restaurantId}/menu`, { schema: menuListSchema }),
  });

export const useOrdersQuery = () =>
  useQuery({
    queryKey: ['orders'],
    queryFn: () => apiRequest('/orders', { schema: orderListSchema }),
  });

export const usePlaceOrderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      apiRequest('/orders', {
        method: 'POST',
        body: payload,
        schema: orderSchema,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};