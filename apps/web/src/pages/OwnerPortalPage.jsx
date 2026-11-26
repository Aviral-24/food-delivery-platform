import { useState } from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
} from '@/hooks/useOwnerRestaurants';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function OwnerPortalPage() {
  const { user } = useAuthStore();
  const createRest = useCreateRestaurantMutation();
  const updateRest = useUpdateRestaurantMutation();

  // Create form state
  const [name, setName] = useState('Indore Spice Hub');
  const [cuisine, setCuisine] = useState('North Indian, Street Food');
  const [city, setCity] = useState('Indore');
  const [avgCost, setAvgCost] = useState('450');
  const [lat, setLat] = useState('22.7250');
  const [lng, setLng] = useState('75.8650');

  // Update / RLS test form state
  const [targetId, setTargetId] = useState('');
  const [newName, setNewName] = useState('Indore Spice Hub (Updated)');

  const handleCreate = (e) => {
    e.preventDefault();
    createRest.mutate(
      {
        name,
        cuisine: cuisine.split(',').map((c) => c.trim()).filter(Boolean),
        city,
        avgCostForTwo: Number(avgCost),
        deliveryTimeMins: 30,
        lat: Number(lat),
        lng: Number(lng),
      },
      {
        onSuccess: (created) => {
          setTargetId(created.id);
        },
      }
    );
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!targetId.trim()) return;
    updateRest.mutate({
      id: targetId.trim(),
      payload: { name: newName },
    });
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Owner Studio (RBAC & Cross-Tenant RLS Tester)</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Current user: <strong>{user?.email}</strong> | Role:{' '}
          <span className="rounded bg-brand/15 px-2 py-0.5 font-semibold text-brand">
            {user?.role}
          </span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. Create Restaurant -> Tests RBAC (Customer gets 403, Owner gets 201) */}
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">1. Create Restaurant (POST /restaurants)</h2>
          <p className="text-xs text-ink-muted">
            Customer role se try karein → <strong>403 Forbidden</strong> aayega. Restaurant Owner se
            try karein → <strong>201 Created</strong>.
          </p>

          <form onSubmit={handleCreate} className="space-y-3">
            <Input label="Restaurant Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              label="Cuisines (comma separated)"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input
                label="Avg Cost For Two (₹)"
                type="number"
                value={avgCost}
                onChange={(e) => setAvgCost(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input label="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
              <Input label="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
            </div>

            <Button type="submit" className="w-full" disabled={createRest.isPending}>
              {createRest.isPending ? 'Creating...' : 'Create Restaurant'}
            </Button>
          </form>

          {createRest.isError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
            >
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>
                HTTP {createRest.error?.status}: {createRest.error?.message}
              </span>
            </div>
          )}

          {createRest.isSuccess && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-400 bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Created! ID copied below: <strong className="font-mono">{createRest.data.id}</strong>
              </span>
            </div>
          )}
        </Card>

        {/* 2. Update Restaurant -> Tests Cross-Tenant RLS (Owner A: 200, Owner B: 404) */}
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">2. Update Restaurant (PATCH /restaurants/:id)</h2>
          <p className="text-xs text-ink-muted">
            Owner A ka banaya hua UUID paste karke Owner A se update karein (<strong>200 OK</strong>
            ), phir Owner B se login karke same UUID update karein → RLS{' '}
            <strong>404 Not Found</strong> block karega.
          </p>

          <form onSubmit={handleUpdate} className="space-y-3">
            <Input
              label="Target Restaurant UUID"
              placeholder="Paste restaurant UUID from Home or Step 1"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            />
            <Input
              label="New Restaurant Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button type="submit" variant="secondary" className="w-full" disabled={updateRest.isPending}>
              {updateRest.isPending ? 'Updating...' : 'Update Restaurant'}
            </Button>
          </form>

          {updateRest.isError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
            >
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>
                HTTP {updateRest.error?.status}: {updateRest.error?.message}
              </span>
            </div>
          )}

          {updateRest.isSuccess && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-400 bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Updated successfully to: {updateRest.data.name}</span>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}