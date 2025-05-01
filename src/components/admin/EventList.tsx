/**
 * Event List Component
 * Displays a list of events with management options for admins
 */

import React from 'react';
import { Event } from '@/lib/events';
import { Button } from '@/components/ui/button';

/**
 * Props for the EventList component
 */
interface EventListProps {
  events: Event[];
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
}

/**
 * Format date from ISO string to readable format
 * @param dateStr Date string in ISO format
 * @returns Formatted date string
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time string to readable format
 * @param timeStr Time string (HH:MM)
 * @returns Formatted time string
 */
function formatTime(timeStr: string): string {
  // Convert 24-hour format to 12-hour format
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Event List component
 * @param props Component props
 * @returns Component for displaying events
 */
export function EventList({ events, onEdit, onDelete }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No events found. Create your first event.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <div 
          key={event.id} 
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Date:</span> {formatDate(event.event_date)}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Time:</span> {formatTime(event.event_time)}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Location:</span> {event.location}
                </p>
              </div>
              {event.description && (
                <p className="mt-3 text-gray-600">{event.description}</p>
              )}
            </div>
            
            {/* Action buttons */}
            {(onEdit || onDelete) && (
              <div className="flex space-x-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(event)}
                  >
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(event)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 