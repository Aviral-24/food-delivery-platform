import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: '',
      items: [], // [{ menuItemId, name, price, quantity }]

      addItem: (restaurant, menuItem) => {
        const current = get();
        // Agar user doosre restaurant ka item add kare to purana cart reset hoga
        const baseItems =
          current.restaurantId && current.restaurantId !== restaurant.id ? [] : current.items;

        const existing = baseItems.find((i) => i.menuItemId === menuItem.id);
        const nextItems = existing
          ? baseItems.map((i) =>
              i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
            )
          : [
              ...baseItems,
              {
                menuItemId: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: 1,
              },
            ];

        set({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          items: nextItems,
        });
      },

      updateQty: (menuItemId, delta) => {
        const nextItems = get()
          .items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + delta } : i
          )
          .filter((i) => i.quantity > 0);

        set(
          nextItems.length === 0
            ? { restaurantId: null, restaurantName: '', items: [] }
            : { items: nextItems }
        );
      },

      clearCart: () => set({ restaurantId: null, restaurantName: '', items: [] }),
    }),
    { name: 'food-delivery-cart' }
  )
);