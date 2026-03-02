import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, RegisterData, LoginData, GoogleUser } from '@/types/auth';
import { useWishlistStore } from './wishlistStore';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; user?: User; error?: string }>;
  loginWithGoogle: (googleUser: GoogleUser) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data: LoginData) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!response.ok) {
            const errorMsg = result.error || 'Login failed';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
          }

          const user = result.user;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem('pa_user', JSON.stringify(user));
          localStorage.setItem('pa_token', 'auth-token-' + Date.now());

          return { success: true, user };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!response.ok) {
            const errorMsg = result.error || 'Registration failed';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
          }

          const user = result.user;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem('pa_user', JSON.stringify(user));
          localStorage.setItem('pa_token', 'reg-token-' + Date.now());

          return { success: true, user };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      loginWithGoogle: async (googleUser: GoogleUser) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(googleUser),
          });

          const result = await response.json();

          if (!response.ok) {
            const errorMsg = result.error || 'Google login failed';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
          }

          const user = result.user;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem('pa_user', JSON.stringify(user));
          localStorage.setItem('pa_token', 'google-token-' + Date.now());

          return { success: true, user };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Google login failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      logout: () => {
        // Clear wishlist store and remove its persisted data
        useWishlistStore.getState().clearWishlist();
        localStorage.removeItem('wishlist-storage');

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        localStorage.removeItem('pa_user');
        localStorage.removeItem('pa_token');
        localStorage.removeItem('auth-storage');

        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

