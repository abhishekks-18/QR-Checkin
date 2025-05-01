/**
 * Dashboard Layout
 * Provides a common layout for dashboard pages
 */

import React from 'react';

/**
 * Dashboard layout component
 * @param props Component props with children
 * @returns Layout wrapper for dashboard
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard content will be rendered here */}
      {children}
    </div>
  );
} 