/**
 * Auth Service
 * Public API for authentication operations
 * Uses adapter pattern to switch between Mock and Real API
 */

import { authAdapter } from '@/features/auth/adapters';
import type {
  LoginDto,
  AuthResponseDto,
  RegisterSubmitDto,
  RegisterSubmitResponseDto,
  RegisterConfirmDto,
} from '@/services/generated/models';

class AuthService {
  /**
   * User login
   */
  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    return authAdapter.login(credentials);
  }

  /**
   * Step 1: Submit registration & receive OTP
   */
  async registerSubmit(data: RegisterSubmitDto): Promise<RegisterSubmitResponseDto> {
    return authAdapter.registerSubmit(data);
  }

  /**
   * Step 2: Confirm OTP & create account
   */
  async registerConfirm(data: RegisterConfirmDto): Promise<AuthResponseDto> {
    return authAdapter.registerConfirm(data);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return authAdapter.refreshToken({ refreshToken });
  }

  /**
   * Logout user (single device)
   */
  async logout(refreshToken: string): Promise<void> {
    return authAdapter.logout({ refreshToken });
  }

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    return authAdapter.logoutAll();
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<{
    user: AuthResponseDto['user'];
    tenant: AuthResponseDto['tenant'];
  }> {
    return authAdapter.getCurrentUser();
  }
}

export const authService = new AuthService();
export default authService;
