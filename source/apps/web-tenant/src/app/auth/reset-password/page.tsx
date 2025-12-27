'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import ResetPassword from '@/features/auth/ResetPassword';

/**
 * Reset Password Page
 * 
 * Route: /auth/reset-password
 * 
 * Expected query parameters:
 * - token: The password reset token from the email link
 * - email: (optional) The user's email for display
 * 
 * Example URL: /auth/reset-password?token=abc123&email=user@example.com
 */
function ResetPasswordContent() {
  const router = useRouter();

  return (
    <ResetPassword 
      onNavigate={(path) => router.push(path)}
    />
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
