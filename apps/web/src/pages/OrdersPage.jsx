
import { Link } from 'react-router-dom';
import { useOrdersQuery } from '@/hooks/useOrders';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';

export function OrdersPage() {
  const { user } = useAuthStore();
  const { data: orders = [], isLoading, isError, error } = useOrdersQuery();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Orders (Postgres RLS Enforced)</h1>
          <p className="text-xs text-ink-muted">
            Logged in as <strong>{user?.email}</strong> ({user?.role}) — only your authorized orders
            are returned by DB.
          </p>
        </div>
        <Link to="/" className="text-sm font-medium text-brand hover:underline">
          + Order Food
        </Link>
      </div>

      {isLoading && <p className="text-sm text-ink-muted">Loading orders...</p>}
      {isError && (
        <p role="alert" className="text-sm text-red-600">
          {error?.message}
        </p>
      )}

      {!isLoading && orders.length === 0 && (
        <Card>
          <p className="text-sm text-ink-muted">
            No orders visible for this account. (Great for verifying cross-user RLS!)
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id} className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-mono text-xs text-ink-muted">Order #{order.id}</p>
              <p className="text-sm font-semibold">Total: ₹{order.total_amount.toFixed(2)}</p>
              <p className="text-xs text-ink-muted">
                Placed: {new Date(order.created_at).toLocaleString('en-IN')}
              </p>
            </div>
            <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold uppercase text-brand">
              {order.status}
            </span>
          </Card>
        ))}
      </div>
    </section>
  );
}