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
import { motion } from 'framer-motion';

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
    // Main container: two-column flex layout, responsive for mobile, increased size
    <div className="flex min-h-screen flex-col md:flex-row bg-white font-mono">
      {/* Left column: Signup image, animated with Framer Motion */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gray-100">
        <motion.img
          src="/images/signup-page.jpeg"
          alt="Signup visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="object-cover w-full h-full max-h-screen rounded-r-2xl shadow-2xl"
          style={{ fontFamily: 'Xanh Mono, monospace' }}
        />
      </div>
      {/* Right column: Signup form, larger paddings and max width */}
      <div className="flex flex-1 flex-col items-center justify-center py-20 px-8 sm:px-12 lg:px-24 font-mono">
        <div className="w-full max-w-2xl space-y-12">
          {/* Page header, larger text */}
          <div className="text-center">
            <h2 className="mt-8 text-6xl font-bold tracking-tight text-gray-900 font-mono">
              Create a new account
            </h2>
            <p className="mt-4 text-lg text-gray-600 font-mono">
              Or{' '}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 font-mono underline text-xl">
                sign in to your existing account
              </Link>
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-md bg-red-50 p-6">
              <div className="flex">
                <div className="text-lg text-red-700 font-mono">{error}</div>
              </div>
            </div>
          )}

          {/* Signup form, larger spacing */}
          <form className="mt-12 space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Full name input, larger, grey border */}
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
                className="font-mono text-lg h-14 px-6 border-2 border-gray-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-150"
              />

              {/* Email input, larger, grey border */}
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
                className="font-mono text-lg h-14 px-6 border-2 border-gray-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-150"
              />

              {/* Password input, larger, grey border */}
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
                className="font-mono text-lg h-14 px-6 border-2 border-gray-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-150"
              />

              {/* Confirm password input, larger, grey border */}
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
                className="font-mono text-lg h-14 px-6 border-2 border-gray-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-150"
              />
            </div>

            {/* Submit button, larger, gradient, grey border, beautiful hover/click effects */}
            <Button
              type="submit"
              className="w-full border-4 border-gray-400 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-[0_12px_40px_rgb(0,0,0,0.18)] font-mono text-xl py-4 rounded-xl transition-all duration-500 hover:from-blue-700 hover:to-blue-900 hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,0,0,0.22)] active:scale-95 active:shadow-[0_6px_18px_rgba(0,0,0,0.18)] focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2"
              isLoading={isLoading}
            >
              Create account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
