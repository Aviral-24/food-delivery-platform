import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      /** @type {import('@/schemas/auth.schema').User | null} */
      user: null,
      /** @type {string | null} */
      token: null,
      /** @type {string | null} */
      refreshToken: null,

      /**
       * @param {{ user: import('@/schemas/auth.schema').User, token: string, refreshToken?: string }} session
       */
      setSession: ({ user, token, refreshToken = null }) =>
        set({ user, token, refreshToken }),

      /** @param {import('@/schemas/auth.schema').User} user */
      setUser: (user) => set({ user }),

      logout: () => set({ user: null, token: null, refreshToken: null }),
    }),
    {
      name: 'food-delivery-auth',
    }
  )
);