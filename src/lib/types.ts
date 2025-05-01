/**
 * Type definitions for the application
 */

/**
 * QR code data structure interface
 * This is the data that gets encoded in the QR code
 */
export interface QRCodeData {
  name: string;
  email: string;
  event: string;
  eventId: string;
  date: string;
  time: string;
  timestamp?: string; // When the QR code was generated
}

/**
 * Registration data interface
 * For registering a user for an event
 */
export interface RegistrationData {
  eventId: string;
  userData: {
    name: string;
    email: string;
  }
}

/**
 * Registration response interface
 * Response from registration API
 */
export interface RegistrationResponse {
  success: boolean;
  message?: string;
  warning?: string;
  error?: string;
} 