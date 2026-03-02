import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { wishlistService } from '@/lib/services/wishlistService';
import { useAuthStore } from '@/lib/stores/authStore';

export interface WishlistState {
  items: Array<{
    id: string;
    productId: number;
    addedAt: string;
  }>;
  loading: boolean;
  initialized: boolean;
  lastUserId: string | null; // Track which user's data is loaded

  // Actions
  initializeWishlist: (userId: string) => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      initialized: false,
      lastUserId: null,

      initializeWishlist: async (userId: string) => {
        console.log('initializeWishlist called for user:', userId, 'current lastUserId:', get().lastUserId);
        // If already initialized for this user, skip
        if (get().initialized && get().lastUserId === userId) {
          console.log('Already initialized for this user, skipping');
          return;
        }
        set({ loading: true });
        try {
          console.log('Fetching wishlist from API for user:', userId);
          const response = await wishlistService.getWishlist(userId);
          console.log('Wishlist API response:', response);
          set({
            items: response.data?.items || [],
            initialized: true,
            lastUserId: userId
          });
          console.log('Wishlist initialized with items:', response.data?.items);
        } catch (error) {
          console.error('Failed to initialize wishlist:', error);
          set({ items: [], initialized: true, lastUserId: userId });
        } finally {
          set({ loading: false });
        }
      },

      addToWishlist: async (productId: number) => {
        console.log('addToWishlist called for product:', productId);
        const { user } = useAuthStore.getState();
        if (!user) {
          throw new Error('User must be authenticated to add to wishlist');
        }

        set({ loading: true });
        try {
          await wishlistService.addToWishlist(user.id, productId);
          // Re-fetch wishlist to ensure consistency
          const response = await wishlistService.getWishlist(user.id);
          set({
            items: response.data?.items || [],
            lastUserId: user.id,
            loading: false
          });
          console.log('After add, items now:', response.data?.items);
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      removeFromWishlist: async (productId: number) => {
        console.log('removeFromWishlist called for product:', productId);
        const { user } = useAuthStore.getState();
        if (!user) {
          throw new Error('User must be authenticated to remove from wishlist');
        }

        set({ loading: true });
        try {
          await wishlistService.removeFromWishlist(user.id, productId);
          const response = await wishlistService.getWishlist(user.id);
          set({
            items: response.data?.items || [],
            lastUserId: user.id,
            loading: false
          });
          console.log('After remove, items now:', response.data?.items);
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      isInWishlist: (productId: number) => {
        return get().items.some(item => item.productId === productId);
      },

      clearWishlist: () => {
        set({ items: [], initialized: false, lastUserId: null });
      }
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const { user } = useAuthStore.getState();
          if (!user) return null;
          const key = `${name}-${user.id}`;
          const value = localStorage.getItem(key);
          console.log('Storage getItem:', key, value);
          return value;
        },
        setItem: (name, value) => {
          const { user } = useAuthStore.getState();
          if (!user) return;
          const key = `${name}-${user.id}`;
          console.log('Storage setItem:', key, value);
          localStorage.setItem(key, value);
        },
        removeItem: (name) => {
          const { user } = useAuthStore.getState();
          if (!user) return;
          const key = `${name}-${user.id}`;
          console.log('Storage removeItem:', key);
          localStorage.removeItem(key);
        },
      })),
    }
  )
);
