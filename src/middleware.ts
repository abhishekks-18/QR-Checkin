/**
 * Authentication Middleware
 * Protects routes and handles redirects based on authentication status
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware function to handle authentication
 * @param req Next.js request object
 * @returns Next.js response object
 */
export async function middleware(req: NextRequest) {
  // Get the requested URL path
  const path = req.nextUrl.pathname;
  
  // Check for user session in cookies
  const hasSession = req.cookies.has('user');
  
  // Get user data to check role if session exists
  let userRole = 'student'; // Default role
  if (hasSession) {
    const userCookie = req.cookies.get('user')?.value;
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        userRole = userData.role || 'student';
      } catch (e) {
        // If cookie parsing fails, treat as no session
        console.error('Error parsing user cookie:', e);
      }
    }
  }

  // Admin routes - redirect to login if no session or not admin
  if (path.startsWith('/admin') && (!hasSession || userRole !== 'admin')) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Student dashboard - redirect to login if no session
  if (path.startsWith('/dashboard') && !hasSession) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Login/signup routes - redirect to appropriate dashboard if session exists
  if ((path === '/login' || path === '/signup') && hasSession) {
    const redirectUrl = new URL(
      userRole === 'admin' ? '/admin/dashboard' : '/dashboard', 
      req.url
    );
    return NextResponse.redirect(redirectUrl);
  }

  // Root path - redirect based on session status and role
  if (path === '/') {
    if (hasSession) {
      const redirectUrl = new URL(
        userRole === 'admin' ? '/admin/dashboard' : '/dashboard',
        req.url
      );
      return NextResponse.redirect(redirectUrl);
    } else {
      const redirectUrl = new URL('/login', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

/**
 * Configure which routes should be processed by middleware
 */
export const config = {
  matcher: ['/', '/login', '/signup', '/dashboard/:path*', '/admin/:path*'],
}; 