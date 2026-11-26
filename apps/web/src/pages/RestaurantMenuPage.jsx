import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, Minus, ShoppingBag, CheckCircle2, ExternalLink } from 'lucide-react';
import {
  useRestaurantDetailQuery,
  useRestaurantMenuQuery,
  usePlaceOrderMutation,
} from '@/hooks/useOrders';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { checkoutAddressSchema } from '@/schemas/order.schema';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function RestaurantMenuPage() {
  const { id } = useParams();
  const { token } = useAuthStore();
  const { data: restaurant, isLoading: loadingRest } = useRestaurantDetailQuery(id);
  const { data: menu = [], isLoading: loadingMenu } = useRestaurantMenuQuery(id);
  const placeOrder = usePlaceOrderMutation();

  const { restaurantId, restaurantName, items, addItem, updateQty, clearCart } = useCartStore();

  const [street, setStreet] = useState('12 MG Road, Palasia');
  const [city, setCity] = useState('Indore');
  const [pincode, setPincode] = useState('452001');
  const [formError, setFormError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleCheckout = (e) => {
    e.preventDefault();
    setFormError('');
    setPlacedOrder(null);

    if (!token) {
      setFormError('Please login as a customer first to place an order.');
      return;
    }

    const parsedAddr = checkoutAddressSchema.safeParse({ street, city, pincode });
    if (!parsedAddr.success) {
      setFormError(Object.values(parsedAddr.error.flatten().fieldErrors).flat()[0]);
      return;
    }

    placeOrder.mutate(
      {
        restaurantId,
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        deliveryAddress: parsedAddr.data,
      },
      {
        onSuccess: (order) => {
          setPlacedOrder(order);
          clearCart();
        },
      }
    );
  };

  if (loadingRest || loadingMenu) {
    return <p className="text-sm text-ink-muted">Loading menu...</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: Restaurant Menu */}
      <div className="space-y-4 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/" className="text-xs font-medium text-brand hover:underline">
              ← Back to Restaurants
            </Link>
            <h1 className="mt-1 text-2xl font-bold">{restaurant?.name}</h1>
            <p className="text-xs text-ink-muted">
              {restaurant?.cuisine?.join(', ')} • {restaurant?.city}
            </p>
          </div>
        </div>

        {menu.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-muted">No menu items found for this restaurant.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {menu.map((item) => {
              const inCart =
                restaurantId === id ? items.find((c) => c.menuItemId === item.id) : null;

              return (
                <Card key={item.id} className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          item.is_veg ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                        title={item.is_veg ? 'Veg' : 'Non-Veg'}
                      />
                      <h2 className="font-semibold">{item.name}</h2>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-xs text-ink-muted">{item.description}</p>
                    )}
                    <p className="mt-2 text-sm font-bold">₹{item.price.toFixed(2)}</p>
                  </div>

                  {inCart ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        className="px-2.5 py-1.5"
                        aria-label={`Decrease ${item.name}`}
                        onClick={() => updateQty(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {inCart.quantity}
                      </span>
                      <Button
                        variant="secondary"
                        className="px-2.5 py-1.5"
                        aria-label={`Increase ${item.name}`}
                        onClick={() => updateQty(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      disabled={!item.is_available}
                      onClick={() => addItem(restaurant, item)}
                    >
                      {item.is_available ? 'Add' : 'Unavailable'}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Cart & Checkout (Triggers Transactional Outbox + Redpanda order.placed) */}
      <div className="space-y-4">
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand" aria-hidden="true" />
            <h2 className="text-lg font-bold">Your Cart</h2>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-ink-muted">Add menu items to test Order + Redpanda Outbox.</p>
          ) : (
            <>
              <p className="text-xs font-medium text-ink-muted">From: {restaurantName}</p>
              <ul className="divide-y divide-border text-sm">
                {items.map((i) => (
                  <li key={i.menuItemId} className="flex justify-between py-2">
                    <span>
                      {i.name} × {i.quantity}
                    </span>
                    <span className="font-medium">₹{(i.price * i.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between border-t border-border pt-2 font-bold">
                <span>Total (Server verified)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <form onSubmit={handleCheckout} className="space-y-3 pt-2">
                <Input
                  label="Delivery Street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
                  <Input
                    label="Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>

                {(formError || placeOrder.isError) && (
                  <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                    {formError || placeOrder.error?.message}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={placeOrder.isPending}>
                  {placeOrder.isPending ? 'Placing Order...' : 'Place Order (Trigger Outbox)'}
                </Button>
              </form>
            </>
          )}
        </Card>

        {placedOrder && (
          <Card className="space-y-2 border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/30">
            <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <span>Order Placed & Outbox Enqueued!</span>
            </div>
            <p className="text-xs">
              <strong>Order ID:</strong> <span className="font-mono">{placedOrder.id}</span>
            </p>
            <p className="text-xs">
              <strong>Server Total:</strong> ₹{placedOrder.total_amount.toFixed(2)}
            </p>
            {placedOrder.outboxEventId && (
              <p className="text-xs">
                <strong>Outbox Event ID:</strong>{' '}
                <span className="font-mono">{placedOrder.outboxEventId}</span>
              </p>
            )}
            <div className="flex flex-wrap gap-3 pt-2 text-xs font-medium">
              <Link to="/orders" className="text-brand hover:underline">
                View My Orders →
              </Link>
              <a
                href="http://localhost:8085"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-brand hover:underline"
              >
                Redpanda Console <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}