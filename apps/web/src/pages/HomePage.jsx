import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Clock, Search, MapPin, ArrowRight } from 'lucide-react';
import { useRestaurantsQuery } from '@/hooks/useRestaurants';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const INDORE_CENTER = { lat: 22.7196, lng: 75.8577 };

export function HomePage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState(''); // '' | '5' | '10'
  const [coords, setCoords] = useState(INDORE_CENTER);
  const [geoLabel, setGeoLabel] = useState('Indore Center (22.7196, 75.8577)');

  const queryFilters = {
    search,
    ...(radiusKm ? { lat: coords.lat, lng: coords.lng, radiusKm: Number(radiusKm) } : {}),
  };

  const { data: restaurants = [], isLoading, isError } = useRestaurantsQuery(queryFilters);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setGeoLabel(`GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
      if (!radiusKm) setRadiusKm('10');
    });
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('home.title')}</h1>
        <p className="text-sm text-ink-muted">{t('home.subtitle')}</p>
      </div>

      {/* Search + PostGIS Geo-Radius Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted"
            aria-hidden="true"
          />
          <label htmlFor="restaurant-search" className="sr-only">
            {t('home.searchPlaceholder')}
          </label>
          <input
            id="restaurant-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('home.searchPlaceholder')}
            className="w-full rounded-lg border border-border bg-surface-card py-2 pr-3 pl-9 text-sm text-ink placeholder:text-ink-muted"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MapPin className="h-4 w-4 text-brand" aria-hidden="true" />
          <label htmlFor="radius-filter" className="sr-only">
            PostGIS Radius Filter
          </label>
          <select
            id="radius-filter"
            value={radiusKm}
            onChange={(e) => setRadiusKm(e.target.value)}
            className="rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-ink"
          >
            <option value="">All Restaurants (No Geo Filter)</option>
            <option value="5">Within 5 km (PostGIS)</option>
            <option value="10">Within 10 km (PostGIS)</option>
            <option value="25">Within 25 km (PostGIS)</option>
          </select>

          <Button variant="secondary" onClick={handleUseMyLocation} className="py-2">
            Use GPS
          </Button>
        </div>
      </div>

      {radiusKm && (
        <p className="text-xs text-ink-muted">
          PostGIS active: showing restaurants within <strong>{radiusKm} km</strong> of {geoLabel} (
          {restaurants.length} found)
        </p>
      )}

      {isLoading && (
        <p role="status" aria-live="polite" className="text-sm text-ink-muted">
          {t('home.loading')}
        </p>
      )}

      {isError && (
        <p
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {t('home.error')}
        </p>
      )}

      {!isLoading && !isError && restaurants.length === 0 && (
        <p className="text-sm text-ink-muted">{t('home.empty')}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((rest) => (
          <Card key={rest.id} className="flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold">{rest.name}</h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    rest.is_open
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {rest.is_open ? t('home.open') : t('home.closed')}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">{rest.cuisine.join(', ')}</p>
              <p className="mt-1 font-mono text-[11px] text-ink-muted">ID: {rest.id}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-ink-muted">
                <span className="inline-flex items-center gap-1 font-medium text-ink">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  {rest.rating.toFixed(1)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('home.mins', { mins: rest.delivery_time_mins })}
                </span>
                <span>{t('home.costForTwo', { amount: rest.avg_cost_for_two })}</span>
              </div>

              <Link to={`/restaurants/${rest.id}`} className="block">
                <Button variant="primary" className="w-full">
                  View Menu & Order
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}