CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'user_role', ''),
    NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', ''),
    'customer'
  );
$$;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.restaurants, public.menu_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.profiles,
  public.restaurants,
  public.menu_items,
  public.carts,
  public.cart_items,
  public.orders,
  public.order_items,
  public.payments,
  public.deliveries,
  public.outbox_events,
  public.audit_logs
TO authenticated;

-- Enable RLS on EVERY table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_select_self_or_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.current_user_role() = 'admin');

CREATE POLICY "profiles_update_self_or_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.current_user_role() = 'admin')
  WITH CHECK (id = auth.uid() OR public.current_user_role() = 'admin');

-- RESTAURANTS
CREATE POLICY "restaurants_public_read" ON public.restaurants
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY "restaurants_owner_or_admin_insert" ON public.restaurants
  FOR INSERT TO authenticated
  WITH CHECK (
    (owner_id = auth.uid() AND public.current_user_role() = 'restaurant_owner')
    OR public.current_user_role() = 'admin'
  );

CREATE POLICY "restaurants_owner_or_admin_update" ON public.restaurants
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.current_user_role() = 'admin')
  WITH CHECK (owner_id = auth.uid() OR public.current_user_role() = 'admin');

CREATE POLICY "restaurants_owner_or_admin_delete" ON public.restaurants
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.current_user_role() = 'admin');

-- MENU ITEMS
CREATE POLICY "menu_items_public_read" ON public.menu_items
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY "menu_items_owner_manage" ON public.menu_items
  FOR ALL TO authenticated
  USING (
    public.current_user_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = menu_items.restaurant_id AND r.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    public.current_user_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = menu_items.restaurant_id AND r.owner_id = auth.uid()
    )
  );

-- CARTS & CART ITEMS
CREATE POLICY "carts_owner_only" ON public.carts
  FOR ALL TO authenticated
  USING (customer_id = auth.uid() OR public.current_user_role() = 'admin')
  WITH CHECK (customer_id = auth.uid() OR public.current_user_role() = 'admin');

CREATE POLICY "cart_items_owner_only" ON public.cart_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_items.cart_id
        AND (c.customer_id = auth.uid() OR public.current_user_role() = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_items.cart_id
        AND (c.customer_id = auth.uid() OR public.current_user_role() = 'admin')
    )
  );

-- ORDERS & ORDER ITEMS
CREATE POLICY "orders_select_participants" ON public.orders
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid()
    OR public.current_user_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = orders.restaurant_id AND r.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.deliveries d
      WHERE d.order_id = orders.id AND d.rider_id = auth.uid()
    )
  );

CREATE POLICY "orders_customer_insert" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid() OR public.current_user_role() = 'admin');

CREATE POLICY "orders_update_owner_or_admin" ON public.orders
  FOR UPDATE TO authenticated
  USING (
    public.current_user_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = orders.restaurant_id AND r.owner_id = auth.uid()
    )
  );

CREATE POLICY "order_items_select_via_order" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id
    )
  );

CREATE POLICY "order_items_insert_customer" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.customer_id = auth.uid() OR public.current_user_role() = 'admin')
    )
  );

-- PAYMENTS
CREATE POLICY "payments_select_owner_or_admin" ON public.payments
  FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id AND o.customer_id = auth.uid()
    )
  );

-- DELIVERIES
CREATE POLICY "deliveries_select_participants" ON public.deliveries
  FOR SELECT TO authenticated
  USING (
    rider_id = auth.uid()
    OR public.current_user_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = deliveries.order_id AND o.customer_id = auth.uid()
    )
  );

CREATE POLICY "deliveries_rider_update" ON public.deliveries
  FOR UPDATE TO authenticated
  USING (rider_id = auth.uid() OR public.current_user_role() = 'admin');

-- OUTBOX & AUDIT LOGS
CREATE POLICY "outbox_admin_only" ON public.outbox_events
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "audit_logs_admin_read" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.current_user_role() = 'admin');