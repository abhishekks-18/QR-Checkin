/**
 * QR Code Generation API Route
 * Generates QR codes for various purposes in the application
 */

import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { QRCodeData } from '@/lib/types';

/**
 * QR code generation response interface
 */
interface QRCodeResponse {
  success: boolean;
  qrCodeDataURL?: string;
  decodedData?: any;
  error?: string;
}

/**
 * Handle POST requests to generate QR codes
 * Accepts JSON data or base64 encoded data to encode in the QR code
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { data, isBase64 } = body;

    // Validate data
    if (!data) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing data for QR code generation' 
        } as QRCodeResponse,
        { status: 400 }
      );
    }

    // Handle different data types
    let qrData: string;
    let decodedData: any = null;
    
    if (isBase64) {
      // If it's already base64 encoded, use it directly
      qrData = data;
      try {
        // Try to decode for validation/response
        const decoded = Buffer.from(data, 'base64').toString('utf-8');
        decodedData = JSON.parse(decoded);
      } catch (e) {
        console.warn('Failed to decode base64 data:', e);
        // Continue with the provided base64 string anyway
      }
    } else if (typeof data === 'string') {
      // If it's a string but not base64, encode it to base64
      qrData = Buffer.from(data).toString('base64');
      decodedData = data;
    } else {
      // If it's an object, stringify, then encode to base64
      const dataWithTimestamp = {
        ...data,
        timestamp: data.timestamp || new Date().toISOString()
      };
      
      qrData = Buffer.from(JSON.stringify(dataWithTimestamp)).toString('base64');
      decodedData = dataWithTimestamp;
    }

    // Generate QR code as data URL with error correction level H (30%)
    // This ensures the QR code can still be read even if partially damaged
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 6,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Return the QR code data URL and decoded data for validation
    return NextResponse.json({ 
      success: true,
      qrCodeDataURL,
      decodedData
    } as QRCodeResponse);
  } catch (error: any) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { 
        success: false,
        error: `An unexpected error occurred: ${error.message}` 
      } as QRCodeResponse,
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests to validate QR codes
 * Takes a base64 encoded query parameter and decodes it
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const encodedData = searchParams.get('data');

    if (!encodedData) {
      return NextResponse.json(
        { success: false, error: 'Missing encoded data parameter' },
        { status: 400 }
      );
    }

    try {
      // Decode base64 data
      const decodedString = Buffer.from(encodedData, 'base64').toString('utf-8');
      const decodedData = JSON.parse(decodedString);

      return NextResponse.json({
        success: true,
        data: decodedData
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid encoded data format' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error decoding QR data:', error);
    return NextResponse.json(
      { success: false, error: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
} 