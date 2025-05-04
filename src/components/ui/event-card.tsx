/**
 * EventCard Component
 * Displays an event in a card format for the dashboard
 */

import React from 'react';
import { format } from 'date-fns';
import { Event } from '@/lib/events';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
}

/**
 * Format the date for display
 * @param dateStr ISO date string
 * @param timeStr Time string
 * @returns Formatted date and time string
 */
const formatEventDate = (dateStr: string, timeStr: string) => {
  const date = new Date(dateStr);
  return `${format(date, 'MMMM d, yyyy')} at ${timeStr}`;
};

/**
 * EventCard component
 * @param props Component props
 * @returns Event card component
 */
export function EventCard({ event, onClick }: EventCardProps) {
  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
      onClick={() => onClick(event)}
    >
      {/* Event Title */}
      <h4 className="text-2xl font-bold mb-2 tracking-wider text-gray-100">{event.title}</h4>

      {/* Event Location */}
      <p className="text-sm text-gray-100 mb-2 tracking-wider">
        <span className="inline-block mr-2">📍</span>
        {event.location}
      </p>

      {/* Event Date and Time */}
      <p className="text-sm text-gray-100 tracking-wider">
        <span className="inline-block mr-2">🗓️</span>
        {formatEventDate(event.event_date, event.event_time)}
      </p>
    </div>
  );
}
