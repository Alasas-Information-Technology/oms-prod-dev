import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora, Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Ubuntu_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
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
        "h-full antialiased overflow-hidden",
        fontSans.variable,
        fontSerif.variable,
        "font-sans",
        fontMono.variable
      )}
      suppressHydrationWarning
    >
      <body className="h-full overflow-hidden bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
