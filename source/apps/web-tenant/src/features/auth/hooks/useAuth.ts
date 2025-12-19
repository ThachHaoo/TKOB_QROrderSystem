/**
 * Auth React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import type {
  LoginDto,
  RegisterSubmitDto,
  RegisterConfirmDto,
} from '@/services/generated/models';

/**
 * Login mutation
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginDto) => authService.login(credentials),
    onSuccess: (data) => {
      // Store auth token
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.accessToken);
        document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${data.expiresIn}`;
      }
      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

/**
 * Registration step 1: Submit
 */
export const useRegisterSubmit = () => {
  return useMutation({
    mutationFn: (data: RegisterSubmitDto) => authService.registerSubmit(data),
  });
};

/**
 * Registration step 2: Confirm OTP
 */
export const useRegisterConfirm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterConfirmDto) => authService.registerConfirm(data),
    onSuccess: (data) => {
      // Store auth token
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.accessToken);
        document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${data.expiresIn}`;
      }
      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

/**
 * Refresh token mutation
 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (refreshToken: string) => authService.refreshToken(refreshToken),
    onSuccess: (data) => {
      // Update auth token
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.accessToken);
      }
    },
  });
};

/**
 * Logout mutation
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (refreshToken: string) => authService.logout(refreshToken),
    onSuccess: () => {
      // Clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        document.cookie = 'refreshToken=; path=/; max-age=0';
      }
      // Clear all queries
      queryClient.clear();
    },
  });
};

/**
 * Logout all devices mutation
 */
export const useLogoutAll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logoutAll(),
    onSuccess: () => {
      // Clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        document.cookie = 'refreshToken=; path=/; max-age=0';
      }
      // Clear all queries
      queryClient.clear();
    },
  });
};

/**
 * Get current user query
 */
export const useCurrentUser = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};
