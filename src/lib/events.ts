/**
 * Events Service
 * Handles event management functionality
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
 * Create a new event with better error handling for permission issues
 * @param eventData Event parameters
 * @returns Created event data or error
 */
export async function createEvent(eventData: EventParams) {
  try {
    // Log the event data for debugging
    console.log('Creating event with data:', eventData);
    
    // Attempt direct query first to test permissions
    const { error: testError } = await supabase
      .from('events')
      .select('id')
      .limit(1);
      
    if (testError) {
      console.error('Permission test error:', testError);
      return { 
        data: null, 
        error: { 
          message: `Database access error: ${testError.message || 'Permission denied. The database user does not have sufficient privileges.'}`
        } 
      };
    }
    
    // Now try to insert the event
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select();

    // Handle different error scenarios
    if (error) {
      console.error('Supabase error creating event:', error);
      
      // Check error code if available
      if (error.code === '42501' || error.message?.includes('permission denied')) {
        return { 
          data: null, 
          error: { 
            message: 'Permission denied. The database user does not have sufficient privileges. Please contact your administrator.' 
          } 
        };
      }
      
      if (error.code === '23505') {
        return { 
          data: null, 
          error: { 
            message: 'An event with similar details already exists.' 
          } 
        };
      }
      
      return { 
        data: null, 
        error: { 
          message: error.message || 'Database error creating event. Please try again.'
        } 
      };
    }
    
    // Check if data is undefined or null - this can happen with permission issues
    if (!data || data.length === 0) {
      console.error('No data returned from insert operation');
      return { 
        data: null, 
        error: { 
          message: 'Failed to create event. The operation completed but no data was returned.'
        } 
      };
    }

    console.log('Event created successfully:', data[0]);
    return { data: data[0] as Event, error: null };
  } catch (err: any) {
    console.error('Exception creating event:', err);
    return { 
      data: null, 
      error: { message: `An error occurred while creating the event: ${err.message || 'Unknown error'}` } 
    };
  }
}

/**
 * Get all events
 * @returns List of events
 */
export async function getAllEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return { data: null, error };
    }

    return { data: data as Event[], error: null };
  } catch (err: any) {
    console.error('Exception fetching events:', err);
    return { 
      data: null, 
      error: { message: `An error occurred while fetching events: ${err.message || 'Unknown error'}` } 
    };
  }
}

/**
 * Get event by ID
 * @param eventId Event ID
 * @returns Event data
 */
export async function getEventById(eventId: string) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as Event, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: { message: 'An error occurred while fetching the event' } 
    };
  }
}

/**
 * Update an event
 * @param eventId Event ID
 * @param eventData Updated event data
 * @returns Updated event
 */
export async function updateEvent(eventId: string, eventData: Partial<EventParams>) {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', eventId)
      .select();

    if (error) {
      return { data: null, error };
    }

    return { data: data[0] as Event, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: { message: 'An error occurred while updating the event' } 
    };
  }
}

/**
 * Delete an event
 * @param eventId Event ID
 * @returns Success status
 */
export async function deleteEvent(eventId: string) {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    return { 
      success: false, 
      error: { message: 'An error occurred while deleting the event' } 
    };
  }
}

/**
 * Register a user for an event
 * @param eventId Event ID
 * @param eventTitle Event title (used to construct the table name)
 * @param userData User data to register
 * @returns Success status or error
 */
export async function registerForEvent(
  eventId: string,
  eventTitle: string,
  userData: { name: string; email: string; qrdata?: string }
) {
  try {
    // Sanitize event title to create a valid table name
    const sanitizedTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const tableName = `event_${sanitizedTitle}_${eventId}`;
    
    // Check if userData already contains qrdata
    let encodedMetadata = userData.qrdata;
    
    // If qrdata is not provided, generate it
    if (!encodedMetadata) {
      // Create metadata JSON object
      const metadata = {
        name: userData.name,
        email: userData.email,
        event: eventTitle,
        eventId: eventId,
        timestamp: new Date().toISOString()
      };
      
      // Encode metadata to base64
      encodedMetadata = Buffer.from(JSON.stringify(metadata)).toString('base64');
    }
    
    // Insert registration data with encoded metadata
    const { error } = await supabase
      .from(tableName)
      .insert([
        {
          event_id: eventId,
          name: userData.name,
          email: userData.email,
          qrdata: encodedMetadata // Store the base64 encoded metadata
        }
      ]);

    if (error) {
      console.error('Error registering for event:', error);
      
      // Check if this is a duplicate registration
      if (error.code === '23505') {
        return { 
          success: false, 
          error: { message: 'You are already registered for this event.' } 
        };
      }
      
      return { 
        success: false, 
        error: { message: error.message || 'Failed to register for event.' } 
      };
    }

    // Return the encoded metadata for use in QR code generation
    return { 
      success: true, 
      error: null,
      encodedMetadata 
    };
  } catch (err) {
    console.error('Exception registering for event:', err);
    return { 
      success: false, 
      error: { message: 'An unexpected error occurred during registration.' } 
    };
  }
}

/**
 * Check if a user is already registered for an event
 * @param eventId Event ID
 * @param eventTitle Event title (used to construct table name)
 * @param email User email to check
 * @returns Object indicating if user is registered and any error
 */
export async function isUserRegistered(
  eventId: string,
  eventTitle: string,
  email: string
) {
  try {
    // Create the table name
    const sanitizedTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const tableName = `event_${sanitizedTitle}_${eventId}`;
    
    // Check for existing registration
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .eq('email', email)
      .limit(1);
      
    if (error) {
      console.error('Error checking registration status:', error);
      return { 
        isRegistered: false, 
        error: { message: error.message || 'Failed to check registration status.' } 
      };
    }
    
    return { 
      isRegistered: data && data.length > 0, 
      error: null 
    };
  } catch (err) {
    console.error('Exception checking registration status:', err);
    return { 
      isRegistered: false, 
      error: { message: 'An unexpected error occurred while checking registration status.' } 
    };
  }
} 