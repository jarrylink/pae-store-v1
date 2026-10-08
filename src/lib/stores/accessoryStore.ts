import { create } from 'zustand';
import { Accessory } from '@/types/auth';

interface AccessoryStore {
  accessories: Accessory[];
  loading: boolean;
  error: string | null;
  fetchAccessories: () => Promise<void>;
  getAccessoryById: (id: number) => Accessory | undefined;
}

export const useAccessoryStore = create<AccessoryStore>((set, get) => ({
  accessories: [],
  loading: false,
  error: null,

  fetchAccessories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/accessories?active=true');
      const data = await response.json();
      set({ accessories: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch accessories', loading: false });
    }
  },

  getAccessoryById: (id: number) => {
    return get().accessories.find(a => a.id === id);
  }
}));