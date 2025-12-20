/**
 * Auth Adapter Interface
 * Contract for both Mock and Real API implementations
 */

import type {
  LoginDto,
  AuthResponseDto,
  RegisterSubmitDto,
  RegisterSubmitResponseDto,
  RegisterConfirmDto,
  RefreshTokenDto,
  LogoutDto,
} from '@/services/generated/models';

export interface IAuthAdapter {
  /**
   * User login
   */
  login(credentials: LoginDto): Promise<AuthResponseDto>;

  /**
   * Step 1: Submit registration & receive OTP
   */
  registerSubmit(data: RegisterSubmitDto): Promise<RegisterSubmitResponseDto>;

  /**
   * Step 2: Confirm OTP & create account
   */
  registerConfirm(data: RegisterConfirmDto): Promise<AuthResponseDto>;

  /**
   * Refresh access token
   */
  refreshToken(data: RefreshTokenDto): Promise<{ accessToken: string }>;

  /**
   * Logout user (single device)
   */
  logout(data: LogoutDto): Promise<void>;

  /**
   * Logout from all devices
   */
  logoutAll(): Promise<void>;

  /**
   * Get current user profile
   */
  getCurrentUser(): Promise<{
    user: AuthResponseDto['user'];
    tenant: AuthResponseDto['tenant'];
  }>;
}
