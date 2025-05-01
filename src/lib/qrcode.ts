/**
 * QR Code Utility Functions
 * Provides reusable functions for QR code generation and validation
 */

import QRCode from 'qrcode';

/**
 * Generate a QR code data URL from event registration data
 * @param name Registrant name
 * @param email Registrant email
 * @param event Event name
 * @param eventId Event ID
 * @returns Base64 encoded metadata and QR code data URL
 */
export async function generateEventQRCode(
  name: string,
  email: string,
  event: string,
  eventId: string
) {
  try {
    // Create metadata object with all necessary information
    const metadata = {
      name,
      email,
      event,
      eventId,
      timestamp: new Date().toISOString()
    };
    
    // Encode to base64
    const encodedMetadata = Buffer.from(JSON.stringify(metadata)).toString('base64');
    
    // Generate QR code data URL with high quality settings for better email compatibility
    const qrCodeDataURL = await QRCode.toDataURL(encodedMetadata, {
      errorCorrectionLevel: 'H', // Highest error correction for better readability
      margin: 2,
      scale: 8, // Increased scale for better visibility in emails
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      type: 'image/png', // Explicitly set image type for better compatibility
      rendererOpts: {
        quality: 1.0 // Highest quality
      }
    });
    
    return {
      success: true,
      encodedMetadata,
      qrCodeDataURL,
      metadata
    };
  } catch (error: any) {
    console.error('Error generating QR code:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate QR code'
    };
  }
}

/**
 * Decode base64 encoded QR code data
 * @param encodedData Base64 encoded data from QR code
 * @returns Decoded metadata object
 */
export function decodeQRData(encodedData: string) {
  try {
    // Decode base64 data
    const decodedString = Buffer.from(encodedData, 'base64').toString('utf-8');
    const decodedData = JSON.parse(decodedString);
    
    return {
      success: true,
      data: decodedData
    };
  } catch (error: any) {
    console.error('Error decoding QR data:', error);
    return {
      success: false,
      error: error.message || 'Invalid QR code data format'
    };
  }
}

/**
 * Validate that the QR code data contains all required fields
 * @param data Decoded QR data
 * @returns Validation result
 */
export function validateQRData(data: any) {
  try {
    // Check for required fields
    const requiredFields = ['name', 'email', 'event', 'eventId'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return {
          success: false,
          error: `Missing required field: ${field}`
        };
      }
    }
    
    return {
      success: true,
      data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Invalid QR code data'
    };
  }
}

/**
 * Generate a QR code image as a PNG buffer
 * Used for serving QR codes as images from API endpoints
 * @param qrData The base64 encoded metadata string
 * @returns QR code as PNG buffer
 */
export async function generateQRCodeBuffer(qrData: string): Promise<Buffer> {
  try {
    // Generate QR code as PNG buffer with high quality settings
    return await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 8,
      type: 'png',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    // Return an empty 1x1 transparent PNG as fallback
    return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  }
}

/**
 * Generate a QR code when the API URL fails (fallback method)
 * @param qrData The base64 encoded metadata string
 * @returns QR code data URL
 */
export async function generateFallbackQRCode(qrData: string): Promise<string> {
  try {
    // Generate the QR code with high quality settings
    return await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 3,
      scale: 10, // Larger scale for better visibility
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      type: 'image/png',
      rendererOpts: {
        quality: 1.0
      }
    });
  } catch (error) {
    console.error('Error generating fallback QR code:', error);
    // Return a placeholder image if all else fails
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  }
} 