/**
 * Admin layout component
 * Provides consistent layout structure for all admin pages
 */

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main content area */}
      <main className="flex-grow">{children}</main>
    </div>
  );
} 