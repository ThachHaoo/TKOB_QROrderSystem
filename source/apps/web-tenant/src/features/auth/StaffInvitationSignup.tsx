'use client';

import { useState } from 'react';
import { Shield, CheckCircle } from 'lucide-react';
import { Button, Input, Card } from '@/shared/components/ui';

interface StaffInvitationSignupProps {
  onNavigate: (path: string) => void;
}

export function StaffInvitationSignup({ onNavigate }: StaffInvitationSignupProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // Simple password strength calculation
    let strength = 0;
    if (value.length >= 8) strength++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
    if (/\d/.test(value)) strength++;
    if (/[^a-zA-Z0-9]/.test(value)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-amber-500';
    if (passwordStrength === 3) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword || password !== confirmPassword) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: API call to complete staff invitation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onNavigate('/admin/dashboard');
    } catch (error) {
      console.error('Failed to complete invitation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full p-8">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-xl font-semibold text-gray-900">Join TKOB Restaurant</h2>
              <p className="text-sm text-gray-600">
                You&apos;ve been invited to join as a <span className="font-semibold">Kitchen Staff</span>
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Email</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                mike@bistro.com
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Input
                label="Create Password"
                type="password"
                placeholder="Enter a strong password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
              />
              {password && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level <= passwordStrength ? getStrengthColor() : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">
                    Password strength: <span className="font-medium">{getStrengthText()}</span>
                  </span>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs text-blue-900 font-medium">
                Password requirements:
              </p>
              <ul className="mt-2 ml-4 text-xs text-blue-800 space-y-1">
                <li className="list-disc">At least 8 characters</li>
                <li className="list-disc">Mix of uppercase and lowercase</li>
                <li className="list-disc">Include numbers and symbols</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={!password || !confirmPassword || password !== confirmPassword || isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account & join restaurant'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
