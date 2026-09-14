import type { Metadata } from "next";
import { Urbanist, Google_Sans_Flex } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const fontDisplay = Urbanist({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const fontUI = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-ui",
  axes: ["wdth", "ROND", "GRAD"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | DIEZ OMS",
    default: "DIEZ OMS - Enterprise Outsource Management",
  },
  description: "A unified enterprise platform to govern workforce engagement, accredit service providers, and automate the complete procurement lifecycle with government-grade security.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "min-h-full antialiased",
        fontDisplay.variable,
        fontUI.variable,
        "font-sans"
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
