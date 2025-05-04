/**
 * Admin layout component
 * Provides consistent layout structure for all admin pages
 */

import React from 'react';

/**
 * Admin layout component
 * @param props Layout props including children components
 * @returns Layout wrapper for all admin pages
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Set background to transparent so the animated gradient in the page is visible
    <div className="min-h-screen bg-transparent">
      {/* Admin content will be rendered here */}
      {children}
    </div>
  );
} 