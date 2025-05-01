/**
 * Create Event Form Component
 * Form for admins to create new events
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createEvent, EventParams } from '@/lib/events';

/**
 * Form field interface for form state typing
 */
interface FormFields {
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_time: string;
}

/**
 * Props for the CreateEventForm component
 */
interface CreateEventFormProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Create Event Form component
 * @param props Component props
 * @returns Form for creating events
 */
export function CreateEventForm({ userId, onSuccess, onCancel }: CreateEventFormProps) {
  // State for form fields
  const [formData, setFormData] = useState<FormFields>({
    title: '',
    description: '',
    location: '',
    event_date: formatTodayDate(),
    event_time: getCurrentTime()
  });
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  // Clear error when form data changes
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [formData, error]);
  
  /**
   * Format today's date as YYYY-MM-DD for date input
   */
  function formatTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  
  /**
   * Get current time as HH:MM for time input
   */
  function getCurrentTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  
  /**
   * Handle form field changes
   * @param e Change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  /**
   * Handle form submission
   * @param e Submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDebugInfo(null);
    setIsLoading(true);
    
    // Validate form fields
    if (!formData.title || !formData.location || !formData.event_date || !formData.event_time) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }
    
    try {
      // Create event data object
      const eventData: EventParams = {
        ...formData,
        created_by: userId
      };
      
      // Call API to create event
      const result = await createEvent(eventData);
      
      // Store debug info for potential troubleshooting
      setDebugInfo(JSON.stringify(result, null, 2));
      
      if (result.error) {
        console.error('Error from createEvent:', result.error);
        throw new Error(result.error.message || 'Failed to create event');
      }
      
      if (!result.data) {
        throw new Error('No data returned from create operation');
      }
      
      // Call success handler
      onSuccess();
    } catch (err: unknown) {
      console.error('Error creating event:', err);
      
      // Show user-friendly error message
      setError(
        err instanceof Error 
          ? err.message 
          : 'An error occurred while creating the event. Please try again or contact support if the problem persists.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="text-sm text-red-700 whitespace-pre-line">{error}</div>
          {debugInfo && (
            <details className="mt-2">
              <summary className="text-xs text-red-600 cursor-pointer">Technical Details</summary>
              <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">{debugInfo}</pre>
            </details>
          )}
        </div>
      )}
      
      {/* Event title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          name="title"
          type="text"
          required
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter event title"
        />
      </div>
      
      {/* Event description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter event description"
        />
      </div>
      
      {/* Event location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location <span className="text-red-500">*</span>
        </label>
        <Input
          id="location"
          name="location"
          type="text"
          required
          value={formData.location}
          onChange={handleChange}
          placeholder="Enter event location"
        />
      </div>
      
      {/* Event date and time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <Input
            id="event_date"
            name="event_date"
            type="date"
            required
            value={formData.event_date}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="event_time" className="block text-sm font-medium text-gray-700 mb-1">
            Time <span className="text-red-500">*</span>
          </label>
          <Input
            id="event_time"
            name="event_time"
            type="time"
            required
            value={formData.event_time}
            onChange={handleChange}
          />
        </div>
      </div>
      
      {/* Form actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          Create Event
        </Button>
      </div>
    </form>
  );
} 