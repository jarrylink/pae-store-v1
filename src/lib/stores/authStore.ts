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
      isLoading: true,
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
    console.log('🔐 Auth store - Setting user:', user?.email, 'Role:', user?.role, 'ID:', user?.id);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem('pa_user', JSON.stringify(user));

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
    console.log('🔐 Auth store - Setting user:', user?.email, 'Role:', user?.role, 'ID:', user?.id);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem('pa_user', JSON.stringify(user));

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
    console.log('🔐 Auth store - Setting user:', user?.email, 'Role:', user?.role, 'ID:', user?.id);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem('pa_user', JSON.stringify(user));

          return { success: true, user };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Google login failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      logout: () => {
        useWishlistStore.getState().clearWishlist();
        localStorage.removeItem('wishlist-storage');

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        localStorage.removeItem('pa_user');
        localStorage.removeItem('auth-storage');

        // Clear cookies
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

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
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      }
    }
  )
);

// Initialize - check for existing user
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem('pa_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      useAuthStore.setState({ user, isAuthenticated: true, isLoading: false });
    } catch (e) {
      console.error('Error parsing stored user:', e);
      useAuthStore.setState({ isLoading: false });
    }
  } else {
    useAuthStore.setState({ isLoading: false });
  }
}

