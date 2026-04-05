import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  installationType: string;
  installationFee: number;
  installationService: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setInstallationType: (serviceId: string) => void;
  setInstallationFee: (fee: number) => void;
  getTotal: () => number;
  getItemsSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      installationType: 'none',
      installationFee: 0,
      installationService: false,

      addItem: (product: Product) => {
        set((state) => {
          const existingItem = state.items.find(item => item.id === product.id);
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.id === product.id
                  ? { ...item, quantity: Number(item.quantity) + 1 }
                  : item
              )
            };
          }

          const newItem: CartItem = {
            id: product.id,
            title: product.title,
            brand: product.brand,
            spec: product.spec,
            capacity: product.capacity,
            price: Number(product.price),
            quantity: 1,
            image: product.image,
            warranty: product.warranty,
            category: product.category || '',
            inStock: product.inStock || true,
            inventory: product.inventory || 0
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId: number) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== productId)
        }));
      },

      updateQuantity: (productId: number, quantity: number) => {
        set((state) => ({
          items: state.items.map(item =>
            item.id === productId ? { ...item, quantity: Number(quantity) } : item
          )
        }));
      },

      clearCart: () => {
        set({ items: [], installationType: 'none', installationFee: 0, installationService: false });
      },

      setInstallationType: (serviceId: string) => {
        set({ installationType: serviceId });
      },

      setInstallationFee: (fee: number) => {
        set({ installationFee: Number(fee) });
      },

      getItemsSubtotal: () => {
        const state = get();
        return state.items.reduce((sum, item) => {
          return sum + (Number(item.price) * Number(item.quantity));
        }, 0);
      },

      getTotal: () => {
        const state = get();
        const itemsTotal = state.items.reduce((sum, item) => {
          return sum + (Number(item.price) * Number(item.quantity));
        }, 0);
        return Number(itemsTotal) + Number(state.installationFee);
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);
