'use client';

/**
 * Home Page
 * Serves as an entry point that redirects to the appropriate page based on auth status
 * The actual redirection is handled by middleware, but this page provides a fallback
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Home page component
 * Will redirect via middleware, but contains a client-side fallback
 * @returns Loading indicator while redirecting
 */
export default function Home() {
  const router = useRouter();

  /**
   * Fallback redirection if middleware doesn't handle it
   */
  useEffect(() => {
    // Redirect to login after a short delay
    // This is a fallback in case middleware doesn't handle it
    const redirectTimer = setTimeout(() => {
      router.push('/login');
    }, 1500);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">QR Check-in System</h1>
        <p className="text-lg text-gray-600 mb-8">Redirecting to login...</p>
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
      </div>
    </main>
  );
}
