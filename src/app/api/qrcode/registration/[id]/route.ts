/**
 * Registration QR Code API Route
 * Generates and serves QR codes for specific registrations
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import QRCode from 'qrcode';

/**
 * Set the appropriate CORS headers for the QR code response
 * @param response The response object to add headers to
 * @returns The modified response
 */
function setCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
}

/**
 * Handle GET requests to retrieve registration QR codes
 * @param request The request object
 * @param params Route parameters, containing the registration ID
 * @returns Response with QR code image
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Properly extract the ID parameter
    const registrationId = params.id;
    
    if (!registrationId) {
      return setCorsHeaders(new NextResponse('Missing registration ID', { status: 400 }));
    }
    
    // Need to query all event tables to find this registration
    // First get all events to determine potential table names
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title');
      
    if (eventsError || !events?.length) {
      console.error('Error retrieving events:', eventsError);
      return setCorsHeaders(new NextResponse('Error retrieving events', { status: 500 }));
    }
    
    // Try to find the registration in each event table
    let qrData = null;
    
    // Loop through all events to check their registration tables
    for (const event of events) {
      const sanitizedTitle = event.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const tableName = `event_${sanitizedTitle}_${event.id}`;
      
      try {
        // Check if this registration exists in this table
        const { data, error } = await supabase
          .from(tableName)
          .select('name, email, qrdata')
          .eq('id', registrationId)
          .single();
          
        if (!error && data?.qrdata) {
          qrData = data.qrdata;
          break; // Found the registration, exit loop
        }
      } catch (_error) {
        // Skip any errors (table might not exist or other issues)
        continue;
      }
    }
    
    if (!qrData) {
      return setCorsHeaders(new NextResponse('Registration not found', { status: 404 }));
    }
    
    // Generate QR code as PNG
    const qrBuffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 2,
      scale: 8,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    // Return the QR code image with proper headers
    return setCorsHeaders(new NextResponse(qrBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      }
    }));
  } catch (error) {
    console.error('Error generating QR code:', error);
    return setCorsHeaders(NextResponse.json({
      error: 'Error scanning registration',
    }, { status: 500 }));
  }
} 