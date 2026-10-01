"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "./theme-provider";
import { ConfirmProvider } from "@/hooks/use-confirm";
import { TooltipProvider } from "./ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
    );
}