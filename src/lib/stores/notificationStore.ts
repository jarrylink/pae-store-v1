import { create } from 'zustand';
import { toast } from 'react-hot-toast';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (type, message, duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      notifications: [...state.notifications, { id, type, message, duration }]
    }));

    // Trigger toast for immediate and visible interactive feedback across screens
    if (typeof window !== 'undefined') {
      try {
        if (type === 'success') {
          toast.success(message, { id, duration });
        } else if (type === 'error') {
          toast.error(message, { id, duration });
        } else if (type === 'warning') {
          toast(message, { id, icon: '⚠️', duration });
        } else {
          toast(message, { id, icon: 'ℹ️', duration });
        }
      } catch (e) {
        // Safe fallback
      }
    }

    // Auto-remove after duration
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    }, duration);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  }
}));
