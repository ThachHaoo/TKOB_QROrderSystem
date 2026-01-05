"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Signup } from '@/features/auth';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email');

  return (
    <Signup 
      onNavigate={(path) => router.push(path)} 
      initialEmail={emailFromQuery || undefined}
    />
  );
}
