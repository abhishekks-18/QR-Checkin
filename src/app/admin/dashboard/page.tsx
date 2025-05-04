'use client';

/**
 * Admin Dashboard Page
 * Main application dashboard for admin users with event management
 */

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut, type UserProfile } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { CreateEventForm } from '@/components/admin/CreateEventForm';
import { EventList } from '@/components/admin/EventList';
import { getAllEvents, deleteEvent, type Event } from '@/lib/events';
import Cookies from 'js-cookie';
import { LogOut } from 'lucide-react';

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

  // ----------------------
  // Animated Gradient State and Logic (with mouse disruption)
  // ----------------------

  // State for gradient position and animation
  const [gradient, setGradient] = useState({
    x: 50, // percent
    y: 50, // percent
    angle: 45, // degrees
    time: 0, // for animation
  });
  // Ref to store animation frame id
  const animationRef = useRef<number | null>(null);

  // Mouse influence state
  const mouseInfluence = useRef(0); // 0 = no influence, 1 = full influence
  const mouseTarget = useRef({ x: 50, y: 50 }); // last mouse position in %

  // Mouse move handler to update mouse target and influence
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const x = (e.clientX / vw) * 100;
      const y = (e.clientY / vh) * 100;
      mouseTarget.current = { x, y };
      mouseInfluence.current = 1; // set influence to max on mouse move
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop: animate gradient center, blend with mouse influence
  useEffect(() => {
    const animate = () => {
      // Animate center in a smooth loop (circle)
      const t = gradient.time + 0.01;
      const animX = 50 + 20 * Math.cos(t * 0.5); // circle path
      const animY = 50 + 20 * Math.sin(t * 0.7);
      // Blend with mouse position
      const influence = mouseInfluence.current;
      const blendedX = animX * (1 - influence) + mouseTarget.current.x * influence;
      const blendedY = animY * (1 - influence) + mouseTarget.current.y * influence;
      // Decay mouse influence
      mouseInfluence.current = Math.max(0, influence - 0.03); // decay rate
      setGradient((prev) => ({
        ...prev,
        x: blendedX,
        y: blendedY,
        angle: (prev.angle + 0.1) % 360,
        time: t,
      }));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gradient.time]);

  // Compose the gradient CSS string
  const gradientStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: -1,
    pointerEvents: 'none',
    transition: 'background 0.2s',
    background: `radial-gradient(circle at ${gradient.x}% ${gradient.y}%, #222 0%, #444 40%, #111 100%)`,
    backgroundImage: `radial-gradient(circle at ${gradient.x}% ${gradient.y}%, #222 0%, #444 40%, #111 100%), linear-gradient(${gradient.angle}deg, rgba(30,30,30,0.7) 0%, rgba(80,80,80,0.2) 100%)`,
    backgroundBlendMode: 'overlay',
    willChange: 'background',
  };

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
          <h2 className="text-2xl font-semibold font-mono">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Flowing, animated gradient background - always behind content */}
      <div style={gradientStyle} aria-hidden="true" />
      {/* Main dashboard content */}
      <div className="min-h-screen bg-transparent p-8">
        <div className="max-w-6xl mx-auto">
          {/* Admin Dashboard Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold tracking-wider text-gray-200 drop-shadow-md font-mono">Admin Dashboard</h1>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-6 py-2 text-base font-semibold rounded-lg shadow-md border border-blue-600 bg-blue-800/80 text-blue-100 hover:bg-blue-700/80 hover:text-white transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 font-mono"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Sign out
            </Button>
          </div>

          {/* Admin Welcome */}
          {profile && (
            <div className="bg-black/60 backdrop-blur-md border border-gray-700 p-6 rounded-lg shadow-lg mb-8 font-mono">
              <h2 className="text-2xl font-bold tracking-wider mb-2 text-gray-100 drop-shadow-sm">Welcome, {profile.full_name}</h2>
              <p className="text-gray-400">Email: {profile.email}</p>
              <p className="text-blue-400 font-medium mt-1">Role: Administrator</p>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className="bg-black/60 backdrop-blur-md border border-red-700 text-red-400 px-4 py-3 rounded mb-6 font-mono">
              {errorMessage}
            </div>
          )}

          {/* Events Management Section */}
          <div className="bg-black/60 backdrop-blur-md border border-gray-700 p-6 rounded-lg shadow-lg mb-8 font-mono">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-200 tracking-wider drop-shadow-sm">Events Management</h3>
              <Button 
                className="bg-blue-800/80 text-blue-100 hover:bg-blue-700/80 hover:text-white border border-blue-600 shadow-md font-mono"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create New Event
              </Button>
            </div>
            
            {/* Events list - EventList component will need to be styled separately */}
            <EventList 
              events={events}
              onDelete={handleDeleteEvent}
            />
          </div>
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
    </>
  );
} 