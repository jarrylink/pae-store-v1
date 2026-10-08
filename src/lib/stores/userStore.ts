import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, WishlistItem, Order, Address } from '@/types/auth';

interface UserState {
  profile: UserProfile | null;
  wishlist: WishlistItem[];
  orders: Order[];
  addresses: Address[];
  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  setWishlist: (items: WishlistItem[]) => void;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: number) => Promise<void>;
  setOrders: (orders: Order[]) => void;
  updateOrder: (updatedOrder: any) => void;
  setAddresses: (addresses: Address[]) => void;
  // Address actions with API
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (addressId: string, address: Partial<Address>) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  // Loading states
  isLoading: boolean;
  error: string | null;
}

export const useUserProfileStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      wishlist: [],
      orders: [],
      addresses: [],
      isLoading: false,
      error: null,

      setProfile: (profile) => set({ profile }),
      
      updateProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (response.ok) {
            const updatedProfile = await response.json();
            set({ profile: updatedProfile, isLoading: false });
          } else {
            throw new Error('Failed to update profile');
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Update failed', isLoading: false });
        }
      },

      setWishlist: (items) => set({ wishlist: items }),
      
      addToWishlist: (item) => set((state) => ({ 
        wishlist: [...state.wishlist, item] 
      })),
      
      removeFromWishlist: async (productId) => {
        try {
          const response = await fetch(`/api/wishlist?productId=${productId}`, {
            method: 'DELETE'
          });
          if (response.ok) {
            set((state) => ({
              wishlist: state.wishlist.filter(item => item.productId !== Number(productId))
            }));
          }
        } catch (error) {
          console.error('Failed to remove from wishlist:', error);
        }
      },
      
      setOrders: (orders) => set({ orders }),
      updateOrder: (updatedOrder: any) => set((state) => ({
        orders: state.orders.map(o => o.id === Number(updatedOrder.id) ? { ...o, ...updatedOrder } : o)
      })),
      setAddresses: (addresses) => set({ addresses }),
      
      // Address CRUD operations with API
      addAddress: async (address) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch('/api/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(address)
          });
          
          if (response.ok) {
            const newAddress = await response.json();
            set((state) => ({
              addresses: [...state.addresses, newAddress],
              isLoading: false
            }));
          } else {
            throw new Error('Failed to add address');
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Add address failed', isLoading: false });
        }
      },
      
      updateAddress: async (addressId, address) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`/api/addresses/${addressId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(address)
          });
          
          if (response.ok) {
            const updatedAddress = await response.json();
            set((state) => ({
              addresses: state.addresses.map(addr => 
                addr.id === addressId ? updatedAddress : addr
              ),
              isLoading: false
            }));
          } else {
            throw new Error('Failed to update address');
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Update address failed', isLoading: false });
        }
      },
      
      removeAddress: async (addressId) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`/api/addresses/${addressId}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            set((state) => ({
              addresses: state.addresses.filter(addr => addr.id !== addressId),
              isLoading: false
            }));
          } else {
            throw new Error('Failed to delete address');
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Delete address failed', isLoading: false });
          throw error;
        }
      },
      
      setDefaultAddress: async (addressId) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`/api/addresses/${addressId}/default`, {
            method: 'PUT'
          });
          
          if (response.ok) {
            set((state) => ({
              addresses: state.addresses.map(addr => ({
                ...addr,
                isDefault: addr.id === addressId
              })),
              isLoading: false
            }));
          } else {
            throw new Error('Failed to set default address');
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Set default failed', isLoading: false });
        }
      },
    }),
    {
      name: 'user-profile-storage',
      partialize: (state) => ({ 
        profile: state.profile,
        wishlist: state.wishlist,
        orders: state.orders,
        addresses: state.addresses 
      }),
    }
  )
);

