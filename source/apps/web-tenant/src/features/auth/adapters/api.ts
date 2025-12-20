/**
 * Auth API Adapter
 * Real API implementation using Orval generated functions
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
import {
  authControllerLogin,
  authControllerRegisterSubmit,
  authControllerRegisterConfirm,
  authControllerRefresh,
  authControllerLogout,
  authControllerLogoutAll,
  authControllerGetMe,
} from '@/services/generated/authentication/authentication';

export class AuthApiAdapter implements IAuthAdapter {
  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    return authControllerLogin(credentials);
  }

  async registerSubmit(data: RegisterSubmitDto): Promise<RegisterSubmitResponseDto> {
    return authControllerRegisterSubmit(data);
  }

  async registerConfirm(data: RegisterConfirmDto): Promise<AuthResponseDto> {
    return authControllerRegisterConfirm(data);
  }

  async refreshToken(data: RefreshTokenDto): Promise<{ accessToken: string }> {
    return authControllerRefresh(data);
  }

  async logout(data: LogoutDto): Promise<void> {
    await authControllerLogout(data);
  }

  async logoutAll(): Promise<void> {
    await authControllerLogoutAll();
  }

  async getCurrentUser(): Promise<{
    user: AuthResponseDto['user'];
    tenant: AuthResponseDto['tenant'];
  }> {
    return authControllerGetMe();
  }
}
