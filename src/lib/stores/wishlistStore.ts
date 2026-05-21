import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistItem {
  id: string;
  productId: number;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  initialized: boolean;
  lastUserId: string | null;
  initializeWishlist: (userId: string) => Promise<void>;
  addToWishlist: (userId: string, productId: number) => Promise<boolean>;
  removeFromWishlist: (userId: string, productId: number) => Promise<boolean>;
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
        if (get().initialized && get().lastUserId === userId) {
          return;
        }
        
        set({ loading: true });
        try {
          const response = await fetch(`/api/wishlist?userId=${userId}`);
          const data = await response.json();
          
          set({
            items: data.items || [],
            initialized: true,
            lastUserId: userId
          });
        } catch (error) {
          console.error('Failed to initialize wishlist:', error);
        } finally {
          set({ loading: false });
        }
      },

      addToWishlist: async (userId: string, productId: number) => {
        const { items } = get();
        
        if (items.some(item => item.productId === productId)) {
          return false;
        }
        
        try {
          const response = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, productId })
          });
          
          const data = await response.json();
          
          if (data.success) {
            set((state) => ({
              items: [...state.items, { id: `local_${productId}`, productId, addedAt: new Date().toISOString() }]
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Add to wishlist error:', error);
          return false;
        }
      },

      removeFromWishlist: async (userId: string, productId: number) => {
        try {
          const response = await fetch(`/api/wishlist?userId=${userId}&productId=${productId}`, {
            method: 'DELETE'
          });
          
          const data = await response.json();
          
          if (data.success) {
            set((state) => ({
              items: state.items.filter(item => item.productId !== productId)
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Remove from wishlist error:', error);
          return false;
        }
      },

      isInWishlist: (productId: number) => {
        return get().items.some(item => item.productId === productId);
      },

      clearWishlist: () => {
        set({ items: [], initialized: false, lastUserId: null });
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        items: state.items,
        initialized: state.initialized,
        lastUserId: state.lastUserId 
      }),
    }
  )
);


