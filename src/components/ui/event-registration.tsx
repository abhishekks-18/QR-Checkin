/**
 * EventRegistration Component
 * Handles the registration UI and logic for events
 */

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Event, isUserRegistered } from '@/lib/events';
import { UserProfile } from '@/lib/auth';
import { RegistrationData, RegistrationResponse } from '@/lib/types';

interface EventRegistrationProps {
  event: Event;
  profile: UserProfile;
}

/**
 * EventRegistration component
 * @param props Component props
 * @returns Event registration component
 */
export function EventRegistration({ event, profile }: EventRegistrationProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  /**
   * Check if user is already registered when component mounts
   */
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const { isRegistered, error } = await isUserRegistered(
          event.id,
          event.title,
          profile.email
        );
        
        if (error) {
          console.error('Error checking registration status:', error);
        } else if (isRegistered) {
          setRegistrationSuccess(true);
        }
      } catch (error) {
        console.error('Exception checking registration:', error);
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkRegistrationStatus();
  }, [event, profile]);

  /**
   * Register the current user for the selected event
   * Uses the new API endpoint for registration with QR code generation and email sending
   */
  const handleRegister = async () => {
    setIsRegistering(true);
    setRegistrationError('');
    
    try {
      // Prepare registration data
      const registrationData: RegistrationData = {
        eventId: event.id,
        userData: {
          name: profile.full_name,
          email: profile.email
        }
      };
      
      // Call our new API endpoint for registration
      const response = await fetch('/api/register-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
      
      const result = await response.json() as RegistrationResponse;
      
      if (!response.ok) {
        setRegistrationError(result.error || 'Failed to register for event');
        return;
      }
      
      // Registration successful
      setRegistrationSuccess(true);
    } catch (error) {
      console.error('Exception registering for event:', error);
      setRegistrationError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      {checkingRegistration ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : registrationSuccess ? (
        <div className="bg-green-50 p-4 rounded-md text-green-700">
          <p className="font-medium">Registration Successful!</p>
          <p className="text-sm mt-1">You are registered for this event. A confirmation email with a QR code has been sent to your email address.</p>
        </div>
      ) : (
        <>
          {registrationError && (
            <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
              <p>{registrationError}</p>
            </div>
          )}
          <Button 
            onClick={handleRegister} 
            isLoading={isRegistering}
            className="w-full"
          >
            Register for this Event
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            By registering, you will receive a confirmation email with a QR code for check-in.
          </p>
        </>
      )}
    </div>
  );
} 