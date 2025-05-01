'use client';

/**
 * Dashboard Page
 * Main application dashboard for authenticated users
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut, getUserProfile, type UserProfile } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { getAllEvents, type Event } from '@/lib/events';
import { format } from 'date-fns';
import Cookies from 'js-cookie';
import { EventCard } from '@/components/ui/event-card';
import { EventRegistration } from '@/components/ui/event-registration';

/**
 * Dashboard page component - Shows events and allows registration
 * @returns Dashboard page
 */
export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Check if user is authenticated and fetch profile
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

        // Set profile from user data
        setProfile(data.user as UserProfile);
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
   * Fetch all events when component mounts
   */
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await getAllEvents();
      if (error) {
        console.error('Error fetching events:', error);
        return;
      }
      
      if (data) {
        setEvents(data);
      }
    };

    if (!isLoading) {
      fetchEvents();
    }
  }, [isLoading]);

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    await signOut();
    // Remove cookie
    Cookies.remove('user');
    router.push('/login');
  };

  /**
   * Handle event click to open modal
   */
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
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
      <div className="max-w-4xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
          >
            Sign out
          </Button>
        </div>

        {/* User Welcome */}
        {profile && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-2xl font-semibold mb-2">Welcome, {profile.full_name}</h2>
            <p className="text-gray-600">Email: {profile.email}</p>
          </div>
        )}

        {/* Events List */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h3 className="text-xl font-medium text-gray-700 mb-4">Upcoming Events</h3>
          
          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No upcoming events at this time.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => (
                <EventCard 
                  key={event.id}
                  event={event}
                  onClick={handleEventClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && profile && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedEvent.title}
        >
          <div className="space-y-4">
            {/* Event Details */}
            <div>
              <h4 className="text-sm font-medium text-gray-500">Location</h4>
              <p className="text-gray-900">{selectedEvent.location}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
              <p className="text-gray-900">
                {format(new Date(selectedEvent.event_date), 'MMMM d, yyyy')} at {selectedEvent.event_time}
              </p>
            </div>
            
            {selectedEvent.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="text-gray-900">{selectedEvent.description}</p>
              </div>
            )}

            {/* Registration Section */}
            <EventRegistration event={selectedEvent} profile={profile} />
          </div>
        </Modal>
      )}
    </div>
  );
} 