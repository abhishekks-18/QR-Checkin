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
    // Set background to transparent so the animated gradient in the page is visible
    <div className="min-h-screen bg-transparent">
      {/* Dashboard content will be rendered here */}
      {children}
    </div>
  );
}
