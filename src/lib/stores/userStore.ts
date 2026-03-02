import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, WishlistItem, Order, Address } from '@/types/auth';
import { Product } from '@/types';

interface UserProfileStore {
  profile: UserProfile | null;
  wishlist: WishlistItem[];
  orders: Order[];
  addresses: Address[];

  // Profile actions
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Wishlist actions
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: number) => boolean;

  // Order actions
  addOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Address actions
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (addressId: string, address: Partial<Address>) => void;
  removeAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
}

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set, get) => ({
      profile: null,
      wishlist: [],
      orders: [],
      addresses: [],

      updateProfile: (updatedProfile) => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, ...updatedProfile }
            : { userId: 'user-123', ...updatedProfile } as UserProfile
        }));
      },

      addToWishlist: (product) => {
        set((state) => {
          const existingIndex = state.wishlist.findIndex(item => item.productId === product.id);

          if (existingIndex >= 0) {
            // Remove from wishlist
            const updatedWishlist = [...state.wishlist];
            updatedWishlist.splice(existingIndex, 1);
            return { wishlist: updatedWishlist };
          } else {
            // Add to wishlist
            const newWishlistItem: WishlistItem = {
              id: `wish-${Date.now()}-${product.id}`,
              productId: product.id,
              addedAt: new Date().toISOString()
            };

            return { wishlist: [...state.wishlist, newWishlistItem] };
          }
        });
      },

      removeFromWishlist: (productId) => {
        set((state) => ({
          wishlist: state.wishlist.filter(item => item.productId !== productId)
        }));
      },

      clearWishlist: () => {
        set({ wishlist: [] });
      },

      isInWishlist: (productId) => {
        return get().wishlist.some(item => item.productId === productId);
      },

      addOrder: (order) => {
        set((state) => ({
          orders: [order, ...state.orders]
        }));
      },

      setOrders: (orders) => set({ orders }),

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map(order =>
            order.id === Number(orderId) ? { ...order, status, updatedAt: new Date().toISOString() } : order
          )
        }));
      },

      addAddress: (addressData) => {
        set((state) => {
          const newAddress: Address = {
            ...addressData,
            id: 'addr-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
          };

          // If this is the first address or explicitly set as default, make it default
          const shouldBeDefault = state.addresses.length === 0 || addressData.isDefault;

          const addresses = shouldBeDefault
            ? state.addresses.map(addr => ({ ...addr, isDefault: false }))
            : state.addresses;

          return {
            addresses: [...addresses, { ...newAddress, isDefault: shouldBeDefault }]
          };
        });
      },

      updateAddress: (addressId, updatedAddress) => {
        set((state) => ({
          addresses: state.addresses.map(address =>
            address.id === addressId ? { ...address, ...updatedAddress } : address
          )
        }));
      },

      removeAddress: (addressId) => {
        set((state) => ({
          addresses: state.addresses.filter(address => address.id !== addressId)
        }));
      },

      setDefaultAddress: (addressId) => {
        set((state) => ({
          addresses: state.addresses.map(address => ({
            ...address,
            isDefault: address.id === addressId
          }))
        }));
      }
    }),
    {
      name: 'powerafric-user-storage',
    }
  )
);




