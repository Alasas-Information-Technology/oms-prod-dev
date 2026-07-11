"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "./theme-provider";
import { ConfirmProvider } from "@/hooks/use-confirm"
import { TooltipProvider } from "./ui/tooltip";

import { ReactLenis } from 'lenis/react';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ReactLenis root>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
            >
                <TooltipProvider>
                    <AuthProvider>
                        <ConfirmProvider>
                            {children}
                        </ConfirmProvider>
                    </AuthProvider>
                </TooltipProvider>
            </ThemeProvider>
        </ReactLenis>
    )
}