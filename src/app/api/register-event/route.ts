/**
 * Event Registration API Route
 * Handles user registration for events, QR code generation, and email notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerForEvent, getEventById } from '@/lib/events';
import { sendQRCodeEmail, sendQRCodeEmailWithUrl } from '@/lib/email';
import { RegistrationData, RegistrationResponse } from '@/lib/types';
import { generateEventQRCode, getProductionQRCodeUrl } from '@/lib/qrcode';
import { supabase } from '@/lib/supabase';

/**
 * Handle POST requests to register users for events
 * Generate QR code and send email confirmation
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json() as RegistrationData;
    const { eventId, userData } = body;

    // Validate required fields
    if (!eventId || !userData?.name || !userData?.email) {
      return NextResponse.json(
        { error: 'Missing required fields' } as RegistrationResponse,
        { status: 400 }
      );
    }

    // Get event details
    const { data: eventData, error: eventError } = await getEventById(eventId);
    if (eventError || !eventData) {
      return NextResponse.json(
        { error: 'Failed to retrieve event details' } as RegistrationResponse,
        { status: 500 }
      );
    }

    // Generate QR code data before registration to prepare encoded metadata
    const qrResult = await generateEventQRCode(
      userData.name,
      userData.email,
      eventData.title,
      eventId
    );
    
    if (!qrResult.success) {
      return NextResponse.json(
        { error: 'Failed to generate QR code' } as RegistrationResponse,
        { status: 500 }
      );
    }

    // Register the user for the event, providing the encoded metadata to store in qrdata column
    const { success, error } = await registerForEvent(
      eventId,
      eventData.title,
      {
        ...userData,
        qrdata: qrResult.encodedMetadata // Pass the encoded metadata for storage
      }
    );

    if (!success && error) {
      return NextResponse.json(
        { error: error.message } as RegistrationResponse,
        { status: 400 }
      );
    }

    // Get the registration ID to use in the QR code URL
    const sanitizedTitle = eventData.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const tableName = `event_${sanitizedTitle}_${eventId}`;
    
    const { data: registrationData } = await supabase
      .from(tableName)
      .select('id')
      .eq('email', userData.email)
      .single();
      
    const registrationId = registrationData?.id;
    
    // Create email parameters
    const emailParams = {
      to: userData.email,
      subject: `Registration Confirmation: ${eventData.title}`,
      eventDetails: {
        title: eventData.title,
        date: eventData.event_date, 
        time: eventData.event_time,
        location: eventData.location,
        description: eventData.description || undefined
      },
      userData: {
        name: userData.name,
        email: userData.email
      }
    };
    
    // Generate the production QR code URL
    const productionQrUrl = registrationId ? getProductionQRCodeUrl(registrationId) : '';
    
    // Try to send email with URL-based QR code first (more reliable)
    // Fall back to data URL-based QR code if registration ID is not available
    let emailResult;
    
    if (registrationId) {
      // Use URL-based approach (more reliable across email clients)
      const baseUrl = request.nextUrl.origin;
      emailResult = await sendQRCodeEmailWithUrl(
        emailParams.to,
        emailParams.subject,
        emailParams.eventDetails,
        emailParams.userData,
        registrationId,
        qrResult.encodedMetadata,
        baseUrl
      );
    } else {
      // Fall back to direct embedding of QR code
      emailResult = await sendQRCodeEmail(
        emailParams.to,
        emailParams.subject,
        emailParams.eventDetails,
        emailParams.userData,
        qrResult.encodedMetadata
      );
    }

    if (!emailResult.success) {
      console.error('Failed to send confirmation email:', emailResult.error);
      return NextResponse.json({ 
        success: true,
        warning: 'Registration successful, but failed to send confirmation email.',
        message: 'Registration successful.'
      } as RegistrationResponse);
    }

    // Return success response with registration data
    return NextResponse.json({
      success: true,
      message: 'Registration successful!',
      qrCodeUrl: productionQrUrl, // Include the production URL in the response
      registrationId
    } as RegistrationResponse);
  } catch (error: unknown) {
    console.error('Error in registration API:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred during registration' } as RegistrationResponse,
      { status: 500 }
    );
  }
} 