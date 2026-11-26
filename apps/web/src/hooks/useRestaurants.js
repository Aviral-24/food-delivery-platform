import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { restaurantListSchema } from '@/schemas/restaurant.schema';

/**
 * Fetches live restaurants from backend (supports search + PostGIS radius).
 * @param {{ search?: string, cuisine?: string, lat?: number, lng?: number, radiusKm?: number }} [filters]
 */
export const useRestaurantsQuery = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.cuisine) params.set('cuisine', filters.cuisine);
  if (filters.lat && filters.lng) {
    params.set('lat', String(filters.lat));
    params.set('lng', String(filters.lng));
    if (filters.radiusKm) params.set('radiusKm', String(filters.radiusKm));
  }

  const qs = params.toString();

  return useQuery({
    queryKey: ['restaurants', filters],
    queryFn: () =>
      apiRequest(`/restaurants${qs ? `?${qs}` : ''}`, {
        schema: restaurantListSchema,
      }),
  });
};