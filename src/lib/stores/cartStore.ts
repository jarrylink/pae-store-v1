import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '@/types';

// Define installation options
export const INSTALLATION_OPTIONS = {
  none: { id: 'none', name: 'No Installation', price: 0 },
  standard: { id: 'standard', name: 'Standard Installation', price: 50000 },
  professional: { id: 'professional', name: 'Professional Installation', price: 100000 },
} as const;

// Define CartState locally
interface CartState {
  items: CartItem[];
  installationType: keyof typeof INSTALLATION_OPTIONS;
  installationFee: number;
  installationService: boolean;
  total: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setInstallationType: (type: keyof typeof INSTALLATION_OPTIONS) => void;
  getTotal: () => number;
  getInstallationFee: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      installationType: 'none',
      installationFee: 0,
      installationService: false,
      total: 0,

      addItem: (product: Product) => {
        set((state) => {
          const existingItem = state.items.find(item => item.id === product.id);

          if (existingItem) {
            // Increase quantity if item exists
            const updatedItems = state.items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
            return { items: updatedItems };
          } else {
            // Add new item with quantity 1
            const newItem: CartItem = {
              ...product,
              quantity: 1,
            };
            return { items: [...state.items, newItem] };
          }
        });
      },

      removeItem: (productId: number) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== productId)
        }));
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      setInstallationType: (type: keyof typeof INSTALLATION_OPTIONS) => {
        const option = INSTALLATION_OPTIONS[type];
        set({ 
          installationType: type,
          installationFee: option.price,
          installationService: type !== 'none'
        });
      },

      getTotal: () => {
        const { items, installationFee } = get();
        const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return itemsTotal + installationFee;
      },

      getInstallationFee: () => {
        return get().installationFee;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
