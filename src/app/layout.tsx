import type { Metadata } from "next";
import { Overpass_Mono } from "next/font/google";
import "./globals.css";

/**
 * Load Overpass Mono font as per requirements
 */
const overpassMono = Overpass_Mono({
  subsets: ["latin"],
  variable: "--font-overpass-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QR Check-in Application",
  description: "QR code-based check-in system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${overpassMono.variable} font-mono antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
