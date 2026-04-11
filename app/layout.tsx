import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DEIZ OMS — Outsource Management System',
  description: 'Centralized outsourced manpower lifecycle governance platform for Dubai Integrated Economic Zones, built by Al Asas Information Technology.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                fontFamily: 'DM Sans, system-ui, sans-serif',
                fontSize: '14px',
              },
              duration: 3500,
            }}
          />
        </AuthProvider>

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fdeizoms7210back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" />
      </body>
    </html>
  );
}