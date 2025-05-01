/**
 * Alternative Events Service using public_events table
 * Handles event management functionality without using triggers
 * This is a fallback implementation if the trigger-based approach fails
 */

import { supabase } from './supabase';

/**
 * Event type definition
 */
export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  event_date: string;
  event_time: string;
  created_at: string;
  created_by: string;
}

/**
 * Event creation parameters
 */
export interface EventParams {
  title: string;
  description?: string;
  location: string;
  event_date: string;
  event_time: string;
  created_by: string;
}

/**
 * Create a new event in the public_events table (no triggers)
 * @param eventData Event parameters
 * @returns Created event data or error
 */
export async function createEventAlt(eventData: EventParams) {
  try {
    // Log the event data for debugging
    console.log('Creating event with data (alternative implementation):', eventData);
    
    // Insert into public_events table
    const { data, error } = await supabase
      .from('public_events')
      .insert([eventData])
      .select();

    if (error) {
      console.error('Supabase error creating event (alternative):', error);
      return { 
        data: null, 
        error: { 
          message: `Database error: ${error.message || 'Unknown error'}`
        } 
      };
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned from insert operation (alternative)');
      return { 
        data: null, 
        error: { 
          message: 'Failed to create event. The operation completed but no data was returned.'
        } 
      };
    }

    // Create attendance table manually
    const eventId = data[0].id;
    const sanitizedTitle = data[0].title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const tableName = `event_${sanitizedTitle}_${eventId}`;
    
    try {
      // Create attendance table manually (without trigger)
      const { error: tableError } = await supabase.rpc('create_attendance_table', { 
        table_name: tableName,
        event_id: eventId
      });
      
      if (tableError) {
        console.warn('Failed to create attendance table manually:', tableError);
        // Continue anyway since we at least created the event
      }
    } catch (tableErr) {
      console.warn('Exception creating attendance table:', tableErr);
      // Continue anyway since we at least created the event
    }

    console.log('Event created successfully (alternative):', data[0]);
    return { data: data[0] as Event, error: null };
  } catch (error: unknown) {
    console.error('Error creating event (alt):', error);
    return { data: null, error: error instanceof Error ? error.message : 'Failed to create event' };
  }
}

/**
 * Get all events from the public_events table
 * @returns List of events
 */
export async function getAllEventsAlt() {
  try {
    const { data, error } = await supabase
      .from('public_events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events (alternative):', error);
      return { data: null, error };
    }

    return { data: data as Event[], error: null };
  } catch (error: unknown) {
    console.error('Error getting all events (alt):', error);
    return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch events' };
  }
} 