import { create } from 'zustand';
import { Service } from '@/types/auth';

interface ServiceStore {
  services: Service[];
  loading: boolean;
  error: string | null;
  fetchServices: () => Promise<void>;
  getServiceById: (id: number) => Service | undefined;
}

export const useServiceStore = create<ServiceStore>((set, get) => ({
  services: [],
  loading: false,
  error: null,

  fetchServices: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/services?active=true');
      const data = await response.json();
      set({ services: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch services', loading: false });
    }
  },

  getServiceById: (id: number) => {
    return get().services.find(s => s.id === id);
  }
}));
