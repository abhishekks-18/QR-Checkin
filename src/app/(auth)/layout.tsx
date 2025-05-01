/**
 * Authentication Layout
 * Common layout for login and signup pages
 */

import React from 'react';

/**
 * Authentication layout component
 * @param props Component props with children
 * @returns Layout wrapper for auth pages
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Auth pages will be rendered here */}
      {children}
    </div>
  );
} 