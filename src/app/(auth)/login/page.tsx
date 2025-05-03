'use client';

/**
 * Login Page
 * Handles user authentication using email and password
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { signIn, getCurrentUser } from '@/lib/auth';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';

/**
 * Login page component
 * @returns Login page with form
 */
export default function LoginPage() {
  // State for form inputs and status
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        // User is already logged in, redirect based on role
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    };

    checkAuth();
  }, [router]);

  /**
   * Handle login form submission
   * @param e Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Attempt to sign in the user
      const { data, error } = await signIn(email, password);

      if (error) {
        throw new Error(error.message || 'Failed to sign in');
      }

      if (data.user) {
        // Store user data in a cookie for server-side auth check
        Cookies.set('user', JSON.stringify(data.user), { expires: 7 });

        // Redirect based on user role
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Main container: two-column flex layout, responsive for mobile, increased size
    <div className="flex min-h-screen flex-col md:flex-row bg-white font-mono">
      {/* Left column: Login image, animated with Framer Motion */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gray-100">
        <motion.img
          src="/images/login-page.jpeg"
          alt="Login visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="object-cover w-full h-full max-h-screen rounded-r-2xl shadow-2xl"
          style={{ fontFamily: 'Xanh Mono, monospace' }}
        />
      </div>
      {/* Right column: Login form, larger paddings and max width */}
      <div className="flex flex-1 flex-col items-center justify-center py-20 px-8 sm:px-12 lg:px-24 font-mono">
        <div className="w-full max-w-2xl space-y-12">
          {/* Page header, larger text */}
          <div className="text-center">
            <h2 className="mt-8 text-6xl font-bold tracking-tight text-gray-900 font-mono">
              Sign in to your account
            </h2>
            <p className="mt-4 text-lg text-gray-600 font-mono">
              Or{' '}
              <Link href="/signup" className="font-semibold text-blue-600 underline hover:text-blue-500 font-mono text-xl">
                create a new account
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

          {/* Login form, larger spacing */}
          <form className="mt-12 space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="font-mono text-lg h-14 px-6 border-2 border-gray-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-150"
              />
            </div>

            {/* Submit button, larger, gradient, grey border, beautiful hover/click effects */}
            <Button
              type="submit"
              className="w-full border-2 border-gray-400 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-[0_12px_40px_rgb(0,0,0,0.18)] font-mono text-xl py-4 rounded-xl transition-all duration-200 hover:from-blue-700 hover:to-blue-900 hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,0,0,0.22)] active:scale-95 active:shadow-[0_6px_18px_rgba(0,0,0,0.18)] focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
