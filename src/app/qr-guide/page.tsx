/**
 * QR Guide Page
 * Explains how to use QR code links in production
 */

import React from 'react';
import { getProductionQRCodeUrl } from '@/lib/qrcode';

export default function QRGuidePage() {
  // Example registration ID
  const exampleId = 'd1279f62-86cc-41a1-b7c2-1cee82ce1a41';
  
  // Generate example production URL
  const exampleUrl = getProductionQRCodeUrl(exampleId);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">QR Code Production Guide</h1>
      
      <div className="bg-white rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">How QR Codes Work in Production</h2>
        
        <p className="mb-4">
          When deployed to production, QR codes will use the domain specified in your <code>.env</code> file
          under the <code>NEXT_PUBLIC_APP_URL</code> variable.
        </p>
        
        <div className="bg-gray-100 p-4 rounded-md mb-6">
          <p className="text-sm font-mono">NEXT_PUBLIC_APP_URL=https://your-production-domain.com</p>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Production QR Code URL Format</h3>
        
        <p className="mb-2">Your QR code URLs will look like this:</p>
        
        <div className="bg-gray-100 p-4 rounded-md font-mono text-sm break-all mb-6">
          {exampleUrl}
        </div>
        
        <h3 className="text-lg font-semibold mb-2">How to Use Production QR Codes</h3>
        
        <ol className="list-decimal pl-6 mb-6 space-y-2">
          <li>Set your <code>NEXT_PUBLIC_APP_URL</code> in your production environment</li>
          <li>Register for events as usual</li>
          <li>The system will automatically generate production-ready QR code URLs</li>
          <li>These URLs will be sent in confirmation emails</li>
          <li>They will also be available in the registration API response</li>
        </ol>
        
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Note for Development vs. Production</h4>
          <p className="text-blue-700">
            During development, URLs will use your localhost domain (e.g., http://localhost:3000).
            In production, they will use your configured production domain.
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Accessing QR Code URLs Programmatically</h2>
        
        <p className="mb-4">
          You can generate QR code URLs programmatically using the <code>getProductionQRCodeUrl</code> function:
        </p>
        
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto mb-6">
          {`import { getProductionQRCodeUrl } from '@/lib/qrcode';

// Generate a production-ready QR code URL
const qrCodeUrl = getProductionQRCodeUrl(registrationId);

// Example output: https://your-domain.com/api/qrcode/registration/d1279f62-86cc-41a1-b7c2-1cee82ce1a41`}
        </pre>
        
        <p>
          This URL can be used directly in your application, embedded in emails, or shared
          with students for event registration and check-in.
        </p>
      </div>
    </div>
  );
} 