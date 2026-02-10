import { create } from 'zustand';

export interface User {
  id: number;
  email: string;
  name: string;
  roles: string[];
  departmentId?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setToken: (token) =>
    set({
      token,
      isAuthenticated: !!token,
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    }),

  hasRole: (role: string) => {
    const { user } = get();
    return user?.roles.includes(role) ?? false;
  },

  hasAnyRole: (roles: string[]) => {
    const { user } = get();
    return user?.roles.some((role) => roles.includes(role)) ?? false;
  },

  hasAllRoles: (roles: string[]) => {
    const { user } = get();
    return roles.every((role) => user?.roles.includes(role)) ?? false;
  },
}));

// Persist to localStorage
if (typeof window !== 'undefined') {
  const storedAuth = localStorage.getItem('auth');
  if (storedAuth) {
    const { user, token } = JSON.parse(storedAuth);
    useAuthStore.setState({ user, token, isAuthenticated: !!token });
  }
}

// Watch for changes and persist
useAuthStore.subscribe((state) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      'auth',
      JSON.stringify({
        user: state.user,
        token: state.token,
      })
    );
  }
});
