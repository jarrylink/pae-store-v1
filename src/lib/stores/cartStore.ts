import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';
import { Accessory } from '@/types/auth';

interface CartStore {
  items: CartItem[];
  accessories: CartItem[];
  editingOrderId: number | null;
  editingOrderNumber: string | null;
  editingOrderBackup: { items: CartItem[]; accessories: CartItem[] } | null;
  editingShippingAddress: any | null;
  editingPaymentMethod: string | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number, type?: 'product' | 'service') => void;
  updateQuantity: (productId: number, quantity: number, type?: 'product' | 'service') => void;
  addAccessory: (accessory: any, quantity?: number) => void;
  removeAccessory: (accessoryId: number) => void;
  updateAccessoryQuantity: (accessoryId: number, quantity: number) => void;
  setService: (service: any | null, quantity?: number) => void;
  clearCart: () => void;
  startEditingOrder: (order: any) => void;
  cancelEditingOrder: () => void;
  finishEditingOrder: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getProductTotal: () => number;
  getServiceTotal: () => number;
  getAccessoriesTotal: () => number;
  getGrandTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      accessories: [],
      editingOrderId: null,
      editingOrderNumber: null,
      editingOrderBackup: null,
      editingShippingAddress: null,
      editingPaymentMethod: null,

      addItem: (product: Product, quantity: number = 1) => {
        const { items } = get();
        const itemType = (product as any).type || 'product';
        const existingItem = items.find(
          item => item.id === product.id && (item.type || 'product') === itemType
        );

        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id && (item.type || 'product') === itemType
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          const newItem: CartItem = {
            id: product.id,
            productId: itemType === 'service' ? undefined : ((product as any).productId || product.id),
            serviceId: itemType === 'service' ? ((product as any).serviceId || product.id) : undefined,
            title: product.title || (product as any).name || '',
            brand: product.brand || '',
            spec: product.spec || '',
            capacity: product.capacity || '',
            price: Number(product.price || 0),
            purchasePrice: product.purchasePrice || 0,
            vendorPrice: product.vendorPrice || 0,
            quantity: quantity,
            image: product.image || '',
            warranty: product.warranty || '',
            category: product.category || '',
            inStock: product.inStock ?? true,
            inventory: product.inventory ?? 999,
            type: itemType
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (productId: number, type?: 'product' | 'service') => {
        set({
          items: get().items.filter(item => {
            if (type) {
              return !(item.id === productId && (item.type || 'product') === type);
            }
            return item.id !== productId;
          })
        });
      },

      updateQuantity: (productId: number, quantity: number, type?: 'product' | 'service') => {
        if (quantity <= 0) {
          get().removeItem(productId, type);
          return;
        }
        set({
          items: get().items.map(item => {
            const matches = type
              ? (item.id === productId && (item.type || 'product') === type)
              : (item.id === productId);
            return matches ? { ...item, quantity } : item;
          })
        });
      },

      addAccessory: (accessory: any, quantity: number = 1) => {
        const currentAccessories = get().accessories;
        const existingItem = currentAccessories.find(item => item.id === accessory.id);

        if (existingItem) {
          set({
            accessories: currentAccessories.map(item =>
              item.id === accessory.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          const newItem: CartItem = {
            id: accessory.id,
            title: accessory.name || accessory.title || '',
            brand: '',
            spec: '',
            capacity: '',
            price: accessory.price || 0,
            purchasePrice: 0,
            vendorPrice: 0,
            quantity: quantity,
            image: accessory.image || '',
            warranty: '',
            category: 'Accessory',
            inStock: (accessory.stock || 0) > 0,
            inventory: accessory.stock || 0
          };
          set({ accessories: [...currentAccessories, newItem] });
        }
      },

      removeAccessory: (accessoryId: number) => {
        set({ accessories: get().accessories.filter(item => item.id !== accessoryId) });
      },

      updateAccessoryQuantity: (accessoryId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeAccessory(accessoryId);
          return;
        }
        set({
          accessories: get().accessories.map(item =>
            item.id === accessoryId ? { ...item, quantity } : item
          )
        });
      },

      setService: (service: any | null, quantity: number = 1) => {
        const currentItems = get().items.filter(
          i => i.type !== 'service' && i.serviceId == null
        );

        if (service && quantity > 0) {
          const serviceItem: CartItem = {
            id: Number(service.id),
            serviceId: Number(service.id),
            title: service.name || service.title || 'Installation Service',
            brand: '',
            spec: '',
            capacity: '',
            price: Number(service.price || 0),
            purchasePrice: 0,
            vendorPrice: 0,
            quantity: quantity,
            image: service.image || '',
            warranty: '',
            category: 'Service',
            inStock: true,
            inventory: 999,
            type: 'service'
          };
          set({ items: [...currentItems, serviceItem] });
        } else {
          set({ items: currentItems });
        }
      },

      clearCart: () => set({
        items: [],
        accessories: [],
        editingOrderId: null,
        editingOrderNumber: null,
        editingOrderBackup: null,
        editingShippingAddress: null,
        editingPaymentMethod: null
      }),

      startEditingOrder: (order: any) => {
        // Backup existing cart if not already in edit mode
        const currentEditingId = get().editingOrderId;
        const backup = currentEditingId
          ? get().editingOrderBackup
          : {
              items: [...get().items],
              accessories: [...get().accessories]
            };

        // Extract products cleanly without merging
        const orderProducts = (
          Array.isArray(order.products) && order.products.length > 0
            ? order.products
            : (order.items || []).filter(
                (item: any) =>
                  item.type === 'product' ||
                  (!item.type && !item.serviceId && !item.accessoryId)
              )
        );

        const loadedProducts: CartItem[] = orderProducts.map((p: any) => ({
          id: Number(p.productId || p.id),
          productId: Number(p.productId || p.id),
          title: p.title || p.name || 'Product',
          brand: p.brand || '',
          spec: p.spec || '',
          capacity: p.capacity || '',
          price: Number(p.price || 0),
          purchasePrice: p.purchasePrice || 0,
          vendorPrice: p.vendorPrice || 0,
          quantity: Number(p.quantity || 1),
          image: p.image || '',
          warranty: p.warranty || '',
          category: p.category || 'Product',
          inStock: true,
          inventory: 999,
          type: 'product' as const
        }));

        // Extract services cleanly
        const orderServices = (
          Array.isArray(order.services) && order.services.length > 0
            ? order.services
            : (order.items || []).filter(
                (item: any) => item.type === 'service' || item.serviceId != null
              )
        );

        const loadedServices: CartItem[] = orderServices.map((s: any) => ({
          id: Number(s.serviceId || s.productId || s.id),
          serviceId: Number(s.serviceId || s.productId || s.id),
          title: s.title || s.name || 'Service',
          brand: '',
          spec: '',
          capacity: '',
          price: Number(s.price || 0),
          purchasePrice: 0,
          vendorPrice: 0,
          quantity: Number(s.quantity || 1),
          image: s.image || '',
          warranty: '',
          category: 'Service',
          inStock: true,
          inventory: 999,
          type: 'service' as const
        }));

        // Backward compatibility fallback for legacy top-level service columns
        if (
          loadedServices.length === 0 &&
          (order.hasService || Number(order.servicePrice || 0) > 0) &&
          (order.serviceName || order.serviceId)
        ) {
          loadedServices.push({
            id: Number(order.serviceId || 0),
            serviceId: Number(order.serviceId || 0),
            title: order.serviceName || 'Installation Service',
            brand: '',
            spec: '',
            capacity: '',
            price: Number(order.servicePrice || 0),
            purchasePrice: 0,
            vendorPrice: 0,
            quantity: 1,
            image: '',
            warranty: '',
            category: 'Service',
            inStock: true,
            inventory: 999,
            type: 'service' as const
          });
        }

        // Extract accessories cleanly
        const orderAccessories = (order.accessories || []) as any[];
        const loadedAccessories: CartItem[] = orderAccessories.map((a: any) => {
          const accId = Number(a.accessoryId || a.productId || a.id);
          return {
            id: accId,
            accessoryId: accId,
            title: a.title || a.name || 'Accessory',
            brand: '',
            spec: '',
            capacity: '',
            price: Number(a.unit_price ?? a.price ?? 0),
            purchasePrice: 0,
            vendorPrice: 0,
            quantity: Number(a.quantity || 1),
            image: a.image || '',
            warranty: '',
            category: 'Accessory',
            inStock: true,
            inventory: 999,
            type: 'accessory' as const
          };
        });

        // Parse shipping address if string
        const parsedAddress =
          order.shippingAddress && typeof order.shippingAddress === 'string'
            ? JSON.parse(order.shippingAddress)
            : order.shippingAddress || null;

        // Replace current cart contents completely (DO NOT MERGE)
        set({
          items: [...loadedProducts, ...loadedServices],
          accessories: loadedAccessories,
          editingOrderId: Number(order.id),
          editingOrderNumber: order.orderNumber || `ORD-${order.id}`,
          editingOrderBackup: backup,
          editingShippingAddress: parsedAddress,
          editingPaymentMethod: order.paymentMethod || null
        });
      },

      cancelEditingOrder: () => {
        const backup = get().editingOrderBackup;
        set({
          items: backup ? backup.items : [],
          accessories: backup ? backup.accessories : [],
          editingOrderId: null,
          editingOrderNumber: null,
          editingOrderBackup: null,
          editingShippingAddress: null,
          editingPaymentMethod: null
        });
      },

      finishEditingOrder: () => {
        set({
          items: [],
          accessories: [],
          editingOrderId: null,
          editingOrderNumber: null,
          editingOrderBackup: null,
          editingShippingAddress: null,
          editingPaymentMethod: null
        });
      },

      getTotalItems: () => {
        const itemCount = get().items.reduce((total, item) => total + item.quantity, 0);
        const accessoryCount = get().accessories.reduce((total, item) => total + item.quantity, 0);
        return itemCount + accessoryCount;
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getProductTotal: () => {
        return get().items
          .filter(i => i.type !== 'service' && i.serviceId == null)
          .reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
      },

      getServiceTotal: () => {
        return get().items
          .filter(i => i.type === 'service' || i.serviceId != null)
          .reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
      },

      getAccessoriesTotal: () => {
        return get().accessories.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getGrandTotal: () => {
        const state = get();
        return state.getProductTotal() + state.getServiceTotal() + state.getAccessoriesTotal();
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);