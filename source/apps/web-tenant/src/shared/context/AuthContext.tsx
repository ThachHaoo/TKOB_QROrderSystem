'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { getHomeRouteForRole, canAccessRoute } from '@/lib/navigation';
import type { UserRole as NavigationUserRole } from '@/lib/navigation';
import { useLogin, useLogout, useCurrentUser } from '@/features/auth/hooks/useAuth';
import { config } from '@/lib/config';

// User role type matching RBAC requirements (3 roles only)
export type UserRole = 'admin' | 'kds' | 'waiter';

// TODO: Import from @packages/dto when available
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  devLogin: (role: UserRole) => void; // For dev mode quick login - ONLY in mock mode
  switchRole: (role: UserRole) => void; // Dev mode role switching - ONLY in mock mode
  getDefaultRoute: () => string; // Get home route for current user role
  canAccess: (path: string) => boolean; // Check if current user can access path
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  
  // Use React Query hooks
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const { data: currentUserData, isLoading, refetch } = useCurrentUser({
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('authToken'),
  });

  // Sync user state with React Query data
  useEffect(() => {
    if (currentUserData?.user && 
        currentUserData.user.id && 
        currentUserData.user.email && 
        currentUserData.user.fullName &&
        currentUserData.user.role &&
        currentUserData.user.tenantId) {
      const mappedUser: User = {
        id: currentUserData.user.id,
        email: currentUserData.user.email,
        name: currentUserData.user.fullName,
        role: (currentUserData.user.role.toLowerCase() === 'owner' 
          ? 'admin' 
          : currentUserData.user.role.toLowerCase() === 'kitchen' 
            ? 'kds' 
            : 'waiter') as UserRole,
        tenantId: currentUserData.user.tenantId,
      };
      setUser(mappedUser);
    } else if (!isLoading) {
      setUser(null);
    }
  }, [currentUserData, isLoading]);

  const login = async (email: string, password: string) => {
    try {
      const deviceInfo = typeof window !== 'undefined' 
        ? `${navigator.userAgent} | ${navigator.platform}`
        : 'Unknown device';
      
      console.log('[AuthContext] Starting login for:', email);
      
      await loginMutation.mutateAsync({ 
        email, 
        password,
        deviceInfo,
      });
      
      console.log('[AuthContext] Login mutation successful, refetching user...');
      
      // Refetch current user after successful login
      await refetch();
      
      console.log('[AuthContext] Login complete');
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    const refreshToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('refreshToken='))
      ?.split('=')[1];
    
    if (refreshToken) {
      logoutMutation.mutate(refreshToken);
    } else {
      // Fallback: clear local state
      localStorage.removeItem('authToken');
      localStorage.removeItem('devRole');
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setUser(null);
      
      if (typeof window !== 'undefined') {
        window.location.href = ROUTES.login;
      }
    }
  };

  // Dev mode quick login - bypasses API (ONLY available in mock data mode)
  const devLogin = (role: UserRole) => {
    if (!config.useMockData) {
      console.warn('❌ devLogin is DISABLED in production mode (NEXT_PUBLIC_USE_MOCK_DATA=false)');
      console.warn('ℹ️  To enable dev mode, set NEXT_PUBLIC_USE_MOCK_DATA=true in .env');
      return;
    }

    if (process.env.NODE_ENV !== 'development') {
      console.warn('devLogin only available in development environment');
      return;
    }

    const roleNames = {
      admin: 'Admin Display User',
      kds: 'Kitchen Display User',
      waiter: 'Waiter User',
    };

    const mockToken = `mock-jwt-${role}`;
    const mockUser: User = {
      id: role === 'admin' ? '1' : role === 'kds' ? '2' : '3',
      email: `${role}@restaurant.com`,
      name: roleNames[role],
      role,
      tenantId: 'tenant-001',
    };

    // Set token in both localStorage and cookie
    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('devRole', role); // Store role for persistence
    
    // Set cookie for middleware authentication check
    document.cookie = `authToken=${mockToken}; path=/; max-age=86400; SameSite=Lax`;
    
    setUser(mockUser);
    
    // Check for redirect parameter in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      
      if (redirect) {
        console.log('[AuthContext] devLogin redirecting to:', redirect);
        console.log('[AuthContext] Using window.location.href for hard redirect');
        window.location.href = redirect;
      } else {
        const homeRoute = getHomeRouteForRole(role as NavigationUserRole);
        console.log('[AuthContext] devLogin - role:', role, 'homeRoute:', homeRoute);
        console.log('[AuthContext] About to set window.location.href to:', homeRoute);
        console.log('[AuthContext] Current window.location.href:', window.location.href);
        
        // Use replace instead of assignment to prevent history entry
        window.location.replace(homeRoute);
        
        console.log('[AuthContext] After replace, window.location.href:', window.location.href);
      }
    }
  };

  // Dev mode: Switch role on the fly (ONLY available in mock data mode)
  const switchRole = useCallback(
    (role: UserRole) => {
      if (!config.useMockData) {
        console.warn('❌ switchRole is DISABLED in production mode (NEXT_PUBLIC_USE_MOCK_DATA=false)');
        console.warn('ℹ️  To enable dev mode, set NEXT_PUBLIC_USE_MOCK_DATA=true in .env');
        return;
      }

      if (process.env.NODE_ENV !== 'development') {
        console.warn('Role switching only available in development');
        return;
      }

      const roleNames = {
        admin: 'Admin User',
        kds: 'Kitchen Display User',
        waiter: 'Waiter User',
      };

      const mockUser: User = {
        id: role === 'admin' ? '1' : role === 'kds' ? '2' : '3',
        email: `${role}@restaurant.com`,
        name: roleNames[role],
        role,
        tenantId: 'tenant-001',
      };

      setUser(mockUser);
      localStorage.setItem('devRole', role);
      
      // Set cookie for middleware authentication check
      document.cookie = `authToken=mock-jwt-${role}; path=/; max-age=86400; SameSite=Lax`;
      
      const homeRoute = getHomeRouteForRole(role as NavigationUserRole);
      router.push(homeRoute);
    },
    [router]
  );

  // Get the default home route for current user
  const getDefaultRoute = useCallback(() => {
    return user ? getHomeRouteForRole(user.role as NavigationUserRole) : ROUTES.login;
  }, [user]);

  // Check if current user can access a specific path
  const canAccess = useCallback(
    (path: string) => {
      if (!user) return false;
      return canAccessRoute(user.role as NavigationUserRole, path);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        devLogin,
        switchRole,
        getDefaultRoute,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
