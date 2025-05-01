/**
 * Authentication utilities for custom database authentication
 * Contains functions to handle user authentication and profile management
 * directly with the profiles table
 */

import { supabase } from './supabase';
import { createHash } from 'crypto';

/**
 * User profile type definition
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role?: 'student' | 'admin';
}

/**
 * Hash a password using SHA-256
 * @param password The password to hash
 * @returns Hashed password
 */
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

/**
 * Sign in with email and password
 * @param email User email
 * @param password User password
 * @returns Authentication result with user data including role
 */
export async function signIn(email: string, password: string) {
  try {
    // Hash the password
    const hashedPassword = hashPassword(password);
    
    // Check if user exists with matching email and password
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('password', hashedPassword)
      .single();
    
    if (error || !data) {
      return { 
        data: { user: null }, 
        error: { message: 'Invalid email or password' } 
      };
    }
    
    // Store user session in localStorage
    localStorage.setItem('user', JSON.stringify(data));
    
    return { 
      data: { user: data }, 
      error: null 
    };
  } catch (_err) {
    return { 
      data: { user: null }, 
      error: { message: 'An error occurred during sign in' } 
    };
  }
}

/**
 * Sign up a new user with email and password
 * @param email User email
 * @param password User password
 * @param fullName User's full name
 * @param role User's role (defaults to 'student')
 * @returns Registration result
 */
export async function signUp(email: string, password: string, fullName: string, role: 'student' | 'admin' = 'student') {
  try {
    // Hash the password before storing
    const hashedPassword = hashPassword(password);
    
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return { 
        data: null, 
        error: { message: 'Email already in use' } 
      };
    }
    
    // Create new user profile
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          full_name: fullName,
          email: email,
          password: hashedPassword,
          created_at: new Date().toISOString(),
          role: role
        },
      ])
      .select();
      
    if (error) {
      return { data: null, error };
    }
    
    return { 
      data: { user: data[0] }, 
      error: null 
    };
  } catch (_error) {
    return { 
      data: null, 
      error: { message: 'An error occurred during registration' } 
    };
  }
}

/**
 * Sign out the current user
 * @returns Sign out result
 */
export async function signOut() {
  // Clear user session from localStorage
  localStorage.removeItem('user');
  return { error: null };
}

/**
 * Get the current authenticated user
 * @returns Current user data
 */
export async function getCurrentUser() {
  try {
    // Get user from localStorage
    const userJson = localStorage.getItem('user');
    
    if (!userJson) {
      return { data: { user: null }, error: null };
    }
    
    const user = JSON.parse(userJson);
    return { data: { user }, error: null };
  } catch (_err) {
    return { data: { user: null }, error: null };
  }
}

/**
 * Get user profile from profiles table
 * @param userId User ID to fetch profile for
 * @returns User profile data
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
} 