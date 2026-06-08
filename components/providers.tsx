"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "./theme-provider";
import { ConfirmProvider } from "@/hooks/use-confirm"
import { TooltipProvider } from "./ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <TooltipProvider>
                <AuthProvider>
                    <ConfirmProvider>
                        {children}
                    </ConfirmProvider>
                </AuthProvider>
            </TooltipProvider>
        </ThemeProvider>
    )
}