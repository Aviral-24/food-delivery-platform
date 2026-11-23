INSERT INTO public.restaurants (id, name, cuisine, city, location, rating, avg_cost_for_two, delivery_time_mins, is_open)
VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    'Spice Route Kitchen',
    ARRAY['North Indian', 'Mughlai'],
    'Indore',
    ST_SetSRID(ST_MakePoint(75.8577, 22.7196), 4326)::geography,
    4.5, 600, 30, TRUE
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Dakshin Express',
    ARRAY['South Indian'],
    'Indore',
    ST_SetSRID(ST_MakePoint(75.8937, 22.7533), 4326)::geography,
    4.3, 350, 25, TRUE
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Wok & Bowl',
    ARRAY['Chinese', 'Asian'],
    'Indore',
    ST_SetSRID(ST_MakePoint(75.8842, 22.7244), 4326)::geography,
    4.2, 500, 35, FALSE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.menu_items (restaurant_id, name, description, price, is_veg)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Paneer Tikka Masala', 'Char-grilled cottage cheese in spiced gravy', 290.00, TRUE),
  ('11111111-1111-4111-8111-111111111111', 'Dal Makhani', 'Slow-cooked black lentils with butter', 240.00, TRUE),
  ('22222222-2222-4222-8222-222222222222', 'Mysore Masala Dosa', 'Crispy dosa with spicy chutney and potato', 160.00, TRUE),
  ('22222222-2222-4222-8222-222222222222', 'Filter Coffee', 'Traditional South Indian decoction coffee', 70.00, TRUE)
ON CONFLICT DO NOTHING;