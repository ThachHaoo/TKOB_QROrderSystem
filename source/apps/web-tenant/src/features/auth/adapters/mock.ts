/**
 * Auth Mock Adapter
 * Simulates API responses with fake delay and error scenarios
 */

import type { IAuthAdapter } from './types';
import type {
  LoginDto,
  AuthResponseDto,
  RegisterSubmitDto,
  RegisterSubmitResponseDto,
  RegisterConfirmDto,
  RefreshTokenDto,
  LogoutDto,
} from '@/services/generated/models';

/**
 * Simulate network delay (200-500ms)
 */
const fakeDelay = () => new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

/**
 * Mock user data factory
 */
const createMockUser = (email: string): AuthResponseDto => {
  const role = email.includes('admin') ? 'OWNER' : email.includes('kds') ? 'KITCHEN' : 'STAFF';
  
  return {
    accessToken: `mock_token_${Date.now()}`,
    refreshToken: `mock_refresh_${Date.now()}`,
    expiresIn: 3600,
    user: {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      email,
      fullName: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      role,
      tenantId: 'tenant-001',
    },
    tenant: {
      id: 'tenant-001',
      name: 'Restaurant Demo',
      slug: 'restaurant-demo',
      status: 'ACTIVE',
      onboardingStep: 4,
    },
  };
};

/**
 * Error simulation helper
 */
const simulateError = (email: string) => {
  // Deterministic error scenarios
  if (email === 'error@test.com') {
    throw new Error('Invalid credentials');
  }
  if (email === 'server@test.com') {
    throw new Error('Server error');
  }
  if (email === 'timeout@test.com') {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 5000));
  }
};

export class AuthMockAdapter implements IAuthAdapter {
  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    await fakeDelay();
    
    // Simulate error scenarios
    simulateError(credentials.email);
    
    // Success case
    return createMockUser(credentials.email);
  }

  async registerSubmit(data: RegisterSubmitDto): Promise<RegisterSubmitResponseDto> {
    await fakeDelay();
    
    // Simulate email exists error
    if (data.email === 'existing@test.com') {
      throw new Error('Email already exists');
    }
    
    // Simulate slug exists error
    if (data.slug === 'existing-slug') {
      throw new Error('Slug already exists');
    }
    
    return {
      message: 'Validation successful. OTP sent to email.',
      registrationToken: `reg_token_${Date.now()}`,
      expiresIn: 600,
    };
  }

  async registerConfirm(data: RegisterConfirmDto): Promise<AuthResponseDto> {
    await fakeDelay();
    
    // Simulate invalid OTP
    if (data.otp !== '123456') {
      throw new Error('Invalid OTP');
    }
    
    // Simulate token expired
    if (data.registrationToken === 'expired_token') {
      throw new Error('Registration token expired');
    }
    
    return createMockUser('newuser@restaurant.com');
  }

  async refreshToken(data: RefreshTokenDto): Promise<{ accessToken: string }> {
    await fakeDelay();
    
    // Simulate invalid refresh token
    if (data.refreshToken === 'invalid_token') {
      throw new Error('Invalid refresh token');
    }
    
    return {
      accessToken: `mock_token_${Date.now()}`,
    };
  }

  async logout(_data: LogoutDto): Promise<void> {
    await fakeDelay();
    // Mock logout always succeeds
  }

  async logoutAll(): Promise<void> {
    await fakeDelay();
    // Mock logout all always succeeds
  }

  async getCurrentUser(): Promise<{
    user: AuthResponseDto['user'];
    tenant: AuthResponseDto['tenant'];
  }> {
    await fakeDelay();
    
    // Simulate unauthorized (no token)
    if (typeof window !== 'undefined' && !localStorage.getItem('authToken')) {
      throw new Error('Unauthorized');
    }
    
    const mockData = createMockUser('admin@restaurant.com');
    return {
      user: mockData.user,
      tenant: mockData.tenant,
    };
  }
}
