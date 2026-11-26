import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { restaurantSchema } from '@/schemas/restaurant.schema';

export const useCreateRestaurantMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      apiRequest('/restaurants', {
        method: 'POST',
        body: payload,
        schema: restaurantSchema,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};

export const useUpdateRestaurantMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) =>
      apiRequest(`/restaurants/${id}`, {
        method: 'PATCH',
        body: payload,
        schema: restaurantSchema,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};