// ========================================
// EXAMPLE: Using Generated LoginDto
// ========================================

// ❌ OLD WAY (Before Code Generation)
// import { LoginDto } from '@shared/dto'; // From packages

// ✅ NEW WAY (Code Generation Approach)
import type { 
  LoginDto,
  AuthResponseDto 
} from '@/services/generated/models';

// ========================================
// Example 1: Type-safe function parameter
// ========================================
async function authenticateUser(credentials: LoginDto): Promise<AuthResponseDto> {
  // credentials.email     ← Full autocomplete! ✅
  // credentials.password  ← Typed as string ✅
  // credentials.deviceInfo ← Optional, typed as string | undefined ✅
  
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  return response.json();
}

// ========================================
// Example 2: In React Component
// ========================================
import { useState } from 'react';
import { useAuthControllerLogin } from '@/services/generated/authentication';

function LoginForm() {
  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
    deviceInfo: navigator.userAgent, // Optional field
  });

  // Using auto-generated React Query hook
  const loginMutation = useAuthControllerLogin({
    onSuccess: (data: AuthResponseDto) => {
      console.log('✅ Login success!');
      console.log('Access Token:', data.accessToken);
      console.log('User:', data.user);
    },
    onError: (error) => {
      console.error('❌ Login failed:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Full TypeScript validation on formData! ✅
    loginMutation.mutate({ data: formData });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
        required
      />
      <button 
        type="submit" 
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

// ========================================
// Example 3: In Adapter Pattern
// ========================================
import type { IAuthAdapter } from './types';

export class RealApiAuthAdapter implements IAuthAdapter {
  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    // TypeScript validates:
    // - credentials.email must exist ✅
    // - credentials.password must exist ✅
    // - credentials.deviceInfo is optional ✅
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,        // ← Type-safe
        password: credentials.password,  // ← Type-safe
        deviceInfo: credentials.deviceInfo ?? 'Unknown Device',
      }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    // Response is typed as AuthResponseDto ✅
    return response.json();
  }
}

// ========================================
// Example 4: Mock Data with Generated Types
// ========================================
const mockLoginResponse: AuthResponseDto = {
  accessToken: 'mock-jwt-token-12345',
  refreshToken: 'mock-refresh-token-67890',
  expiresIn: 3600,
  user: {
    id: 'user-123',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'OWNER',
  },
  tenant: {
    id: 'tenant-456',
    name: 'My Restaurant',
    slug: 'my-restaurant',
  },
};

// ========================================
// Example 5: Form Validation with Generated Types
// ========================================
import { z } from 'zod';

// Create Zod schema from generated LoginDto shape
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  deviceInfo: z.string().optional(),
}) satisfies z.ZodType<LoginDto>; // ← Ensures schema matches LoginDto

function validateLogin(data: unknown): LoginDto {
  return loginSchema.parse(data); // ← Returns typed LoginDto
}

// ========================================
// KEY BENEFITS:
// ========================================
// 1. ✅ Single Source of Truth: Backend DTO
// 2. ✅ Auto-sync: Change backend → run `pnpm codegen` → types updated
// 3. ✅ Type Safety: Full TypeScript autocomplete & validation
// 4. ✅ No Manual Work: No need to manually sync types
// 5. ✅ React Query Ready: Hooks auto-generated
// 6. ✅ Scalable: Add new DTOs → auto-generated
