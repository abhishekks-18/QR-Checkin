import type { Metadata } from "next";
import { Xanh_Mono } from "next/font/google";
import "./globals.css";

/**
 * Load Xanh Mono font as the ONLY font for the project
 */
const xanhMono = Xanh_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-xanh-mono",
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
        className={`${xanhMono.variable} font-mono antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
