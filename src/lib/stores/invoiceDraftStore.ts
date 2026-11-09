import { create } from 'zustand';

export interface InvoiceDraftCustomer {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface InvoiceDraftItem {
  id: string | number;
  productId?: number;
  serviceId?: number;
  accessoryId?: number;
  name: string;
  type: 'product' | 'service' | 'accessory';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  spec?: string;
  capacity?: string;
}

export interface InvoiceDraftTotals {
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
}

export interface InvoiceDraftState {
  invoiceNumber: string;
  customer: InvoiceDraftCustomer;
  items: InvoiceDraftItem[];
  discount: number;
  notes: string;
  issueDate: string;
  dueDate: string;

  // Actions
  addItem: (item: Omit<InvoiceDraftItem, 'totalPrice'>) => void;
  updateItem: (index: number, updates: Partial<Omit<InvoiceDraftItem, 'totalPrice'>>) => void;
  removeItem: (index: number) => void;
  setItems: (items: Array<Omit<InvoiceDraftItem, 'totalPrice'> & { totalPrice?: number }>) => void;
  setCustomer: (customer: Partial<InvoiceDraftCustomer>) => void;
  setDiscount: (discount: number) => void;
  setNotes: (notes: string) => void;
  setInvoiceNumber: (invoiceNumber: string) => void;
  setDates: (issueDate?: string, dueDate?: string) => void;
  clearDraft: () => void;
  calculateTotals: () => InvoiceDraftTotals;
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
  return `PA-INV-${dateStr}-${randomDigits}`;
}

const initialCustomer: InvoiceDraftCustomer = {
  name: '',
  phone: '',
  email: '',
  address: '',
};

export const useInvoiceDraftStore = create<InvoiceDraftState>((set, get) => ({
  invoiceNumber: generateInvoiceNumber(),
  customer: initialCustomer,
  items: [],
  discount: 0,
  notes: 'Thank you for your business. Payment is due within 7 days of invoice date.',
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),

  addItem: (newItem) => {
    set((state) => {
      // If item with exact same id and type already exists, increment its quantity
      const existingIndex = state.items.findIndex(
        (it) => String(it.id) === String(newItem.id) && it.type === newItem.type
      );

      if (existingIndex > -1) {
        const updated = [...state.items];
        const current = updated[existingIndex];
        const newQty = current.quantity + (newItem.quantity || 1);
        updated[existingIndex] = {
          ...current,
          quantity: newQty,
          totalPrice: newQty * current.unitPrice,
        };
        return { items: updated };
      }

      const qty = newItem.quantity > 0 ? newItem.quantity : 1;
      const unitPrice = newItem.unitPrice >= 0 ? newItem.unitPrice : 0;
      const itemWithTotal: InvoiceDraftItem = {
        ...newItem,
        quantity: qty,
        unitPrice,
        totalPrice: qty * unitPrice,
      };

      return { items: [...state.items, itemWithTotal] };
    });
  },

  updateItem: (index, updates) => {
    set((state) => {
      if (index < 0 || index >= state.items.length) return state;
      const updated = [...state.items];
      const current = updated[index];
      const quantity = updates.quantity !== undefined ? Math.max(1, updates.quantity) : current.quantity;
      const unitPrice = updates.unitPrice !== undefined ? Math.max(0, updates.unitPrice) : current.unitPrice;

      updated[index] = {
        ...current,
        ...updates,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
      };
      return { items: updated };
    });
  },

  removeItem: (index) => {
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    }));
  },

  setItems: (newItems) => {
    set(() => ({
      items: newItems.map((item) => {
        const qty = item.quantity > 0 ? item.quantity : 1;
        const price = item.unitPrice >= 0 ? item.unitPrice : 0;
        return {
          ...item,
          quantity: qty,
          unitPrice: price,
          totalPrice: qty * price,
        };
      }),
    }));
  },

  setCustomer: (custUpdates) => {
    set((state) => ({
      customer: { ...state.customer, ...custUpdates },
    }));
  },

  setDiscount: (discount) => {
    set(() => ({
      discount: Math.max(0, discount || 0),
    }));
  },

  setNotes: (notes) => {
    set(() => ({ notes }));
  },

  setInvoiceNumber: (invoiceNumber) => {
    set(() => ({ invoiceNumber }));
  },

  setDates: (issueDate, dueDate) => {
    set((state) => ({
      issueDate: issueDate || state.issueDate,
      dueDate: dueDate || state.dueDate,
    }));
  },

  clearDraft: () => {
    set(() => ({
      invoiceNumber: generateInvoiceNumber(),
      customer: { ...initialCustomer },
      items: [],
      discount: 0,
      notes: 'Thank you for your business. Payment is due within 7 days of invoice date.',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    }));
  },

  calculateTotals: () => {
    const { items, discount } = get();
    const subtotal = (items || []).reduce((acc, item) => acc + (item.totalPrice || 0), 0);
    const validDiscount = Math.min(subtotal, Math.max(0, discount || 0));
    // Zero-VAT rule across all invoices:
    const tax = 0;
    const grandTotal = Math.max(0, subtotal - validDiscount);

    return {
      subtotal,
      discount: validDiscount,
      tax,
      grandTotal,
    };
  },
}));
