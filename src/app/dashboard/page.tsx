'use client';

/**
 * Dashboard Page
 * Main application dashboard for authenticated users
 */

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut, type UserProfile } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { getAllEvents, type Event } from '@/lib/events';
import { format } from 'date-fns';
import Cookies from 'js-cookie';
import { EventCard } from '@/components/ui/event-card';
import { EventRegistration } from '@/components/ui/event-registration';
import { LogOut } from 'lucide-react';

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
    <>
      {/* Flowing, animated gradient background - always behind content */}
      <div style={gradientStyle} aria-hidden="true" />
      {/* Main dashboard content */}
      <div className="min-h-screen bg-transparent p-8">
        <div className="max-w-4xl mx-auto">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-8">
            {/* Dashboard Title: light grey, soft shadow, Xanh Mono font */}
            <h1 className="text-4xl font-bold tracking-wider text-gray-200 drop-shadow-md font-mono">Dashboard</h1>
            {/* Sign out button: muted accent, soft shadow, rounded, Xanh Mono font */}
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-6 py-2 text-base font-semibold rounded-lg shadow-md border border-blue-600 bg-blue-800/80 text-blue-100 hover:bg-blue-700/80 hover:text-white transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 font-mono"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Sign out
            </Button>
          </div>

          {/* User Welcome */}
          {profile && (
            <div className="bg-black/60 backdrop-blur-md border border-gray-700 p-6 rounded-lg shadow-lg mb-8 font-mono">
              <h2 className="text-2xl font-bold tracking-wider mb-2 text-gray-100 drop-shadow-sm">Welcome, {profile.full_name}</h2>
              <p className="text-gray-400">Email: {profile.email}</p>
            </div>
          )}

          {/* Events List */}
          <div className="bg-black/60 backdrop-blur-md border border-gray-700 p-6 rounded-lg shadow-lg mb-8 font-mono">
            <h3 className="text-xl font-semibold text-gray-200 tracking-wider mb-4 drop-shadow-sm">Upcoming Events</h3>

            {events.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
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
            <div className="space-y-4 font-mono">
              {/* Event Details */}
              <div>
                <h4 className="text-xl font-bold text-gray-300 tracking-wider">Location</h4>
                <p className="text-gray-100 text-xl">{selectedEvent.location}</p>
              </div>

              <div>
                <h4 className="text-xl font-bold text-gray-300 tracking-wider">Date & Time</h4>
                <p className="text-gray-100 text-xl">
                  {format(new Date(selectedEvent.event_date), 'MMMM d, yyyy')} at {selectedEvent.event_time}
                </p>
              </div>

              {selectedEvent.description && (
                <div>
                  <h4 className="text-xl font-bold text-gray-300 tracking-wider">Description</h4>
                  <p className="text-gray-100 text-xl">{selectedEvent.description}</p>
                </div>
              )}

              {/* Registration Section */}
              <EventRegistration event={selectedEvent} profile={profile} />
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}
