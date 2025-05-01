'use client';

/**
 * Admin Dashboard Page
 * Main application dashboard for admin users with event management
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut, type UserProfile } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { CreateEventForm } from '@/components/admin/CreateEventForm';
import { EventList } from '@/components/admin/EventList';
import { getAllEvents, deleteEvent, type Event } from '@/lib/events';
import Cookies from 'js-cookie';

/**
 * Admin dashboard page component
 * Includes event management functionality
 * @returns Admin dashboard page
 */
export default function AdminDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Check if user is authenticated and is an admin
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await getCurrentUser();
        
        if (error || !data.user) {
          // User is not authenticated, redirect to login
          router.push('/login');
          return;
        }

        // Check if user is an admin
        if (data.user.role !== 'admin') {
          // Not an admin, redirect to student dashboard
          router.push('/dashboard');
          return;
        }

        // Set profile from user data
        setProfile(data.user as UserProfile);
        
        // Load events
        await loadEvents();
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);
  
  /**
   * Load all events from the database
   */
  const loadEvents = async () => {
    try {
      const { data, error } = await getAllEvents();
      
      if (error) {
        console.error('Error loading events:', error);
        setErrorMessage('Failed to load events');
        return;
      }
      
      setEvents(data || []);
    } catch (err) {
      console.error('Error in loadEvents:', err);
      setErrorMessage('An error occurred while loading events');
    }
  };

  /**
   * Handle successful event creation
   */
  const handleEventCreated = async () => {
    setIsCreateModalOpen(false);
    setErrorMessage('Event created successfully! Refreshing the list...');
    
    try {
      await loadEvents();
      // After loading events successfully, clear the message
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to refresh events:', err);
      setErrorMessage('Event was created but failed to refresh the list. Please try again.');
    }
  };
  
  /**
   * Handle event deletion
   * @param event Event to delete
   */
  const handleDeleteEvent = async (event: Event) => {
    if (window.confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
      try {
        const { success, error } = await deleteEvent(event.id);
        
        if (!success) {
          throw new Error(error?.message || 'Failed to delete event');
        }
        
        await loadEvents();
      } catch (err: unknown) {
        console.error('Delete error:', err);
        setErrorMessage(err instanceof Error ? err.message : 'An error occurred while deleting the event');
      }
    }
  };

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    await signOut();
    // Remove cookie
    Cookies.remove('user');
    router.push('/login');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Admin Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
          >
            Sign out
          </Button>
        </div>

        {/* Admin Welcome */}
        {profile && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-2xl font-semibold mb-2">Welcome, {profile.full_name}</h2>
            <p className="text-gray-600">Email: {profile.email}</p>
            <p className="text-blue-600 font-medium mt-1">Role: Administrator</p>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {errorMessage}
          </div>
        )}

        {/* Events Management Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Events Management</h3>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Create New Event
            </Button>
          </div>
          
          {/* Events list */}
          <EventList 
            events={events}
            onDelete={handleDeleteEvent}
          />
        </div>
      </div>
      
      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Event"
      >
        {profile && (
          <CreateEventForm
            userId={profile.id}
            onSuccess={handleEventCreated}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
} 