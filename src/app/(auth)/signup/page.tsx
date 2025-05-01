'use client';

/**
 * Signup Page
 * Handles user registration with email, password, and name
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { signUp, getCurrentUser } from '@/lib/auth';

/**
 * Signup page component
 * @returns Signup page with form
 */
export default function SignupPage() {
  // State for form inputs and status
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  /**
   * Check if user is already logged in
   */
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await getCurrentUser();
      if (data.user) {
        // User is already logged in, redirect to dashboard
        router.push('/dashboard');
      }
    };

    checkAuth();
  }, [router]);

  /**
   * Handle signup form submission
   * @param e Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Attempt to create a new user account
      const { error } = await signUp(email, password, fullName);

      if (error) {
        throw new Error(error.message || 'Failed to create account');
      }

      // Redirect to login page on successful signup
      router.push('/login?registration=success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Page header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* Signup form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Full name input */}
            <Input
              label="Full name"
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />

            {/* Email input */}
            <Input
              label="Email address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />

            {/* Password input */}
            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
            />

            {/* Confirm password input */}
            <Input
              label="Confirm password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Create account
          </Button>
        </form>
      </div>
    </div>
  );
} 