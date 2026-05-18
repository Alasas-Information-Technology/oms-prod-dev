import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import { Manrope } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
import { cn } from "@/lib/utils";
import { CommandProvider } from '@/contexts/CommandContext';
import CommandPalette from '@/components/ui/CommandPalette';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Enterprise OMS — Outsource Management System',
  description: 'Centralized outsourced manpower lifecycle governance platform for Enterprise environments, built by Al Asas Information Technology.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(manrope.variable)}>
      <body className={cn(manrope.className, "antialiased")}>
        <AuthProvider>
          <CommandProvider>
            {children}
            <CommandPalette />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  fontFamily: 'var(--font-manrope), system-ui, sans-serif',
                  fontSize: '14px',
                },
                duration: 3500,
              }}
            />
          </CommandProvider>
        </AuthProvider>

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fdeizoms7210back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" />
      </body>
    </html>
  );
}