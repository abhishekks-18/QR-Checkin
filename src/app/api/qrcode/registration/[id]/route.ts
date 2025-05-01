/**
 * Registration QR Code API Route
 * Generates and serves QR codes for specific registrations
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import QRCode from 'qrcode';

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
    // Await params is not needed in Next.js App Router, but we need to use it correctly
    const { id } = params;
    const registrationId = id;
    
    if (!registrationId) {
      return new NextResponse('Missing registration ID', { status: 400 });
    }
    
    // Need to query all event tables to find this registration
    // First get all events to determine potential table names
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title');
      
    if (eventsError || !events?.length) {
      console.error('Error retrieving events:', eventsError);
      return new NextResponse('Error retrieving events', { status: 500 });
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
      } catch (e) {
        // Skip any errors (table might not exist or other issues)
        continue;
      }
    }
    
    if (!qrData) {
      return new NextResponse('Registration not found', { status: 404 });
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
    return new NextResponse(qrBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      }
    });
  } catch (error: any) {
    console.error('Error generating registration QR code:', error);
    return new NextResponse('Error generating QR code', { status: 500 });
  }
} 