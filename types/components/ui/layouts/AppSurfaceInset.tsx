"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarInset } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export type SurfaceMode = "dashboard" | "operational";

/**
 * Resolves the surface mode per docs/RASIKH-PALETTE-MIGRATION.md Part 3 table:
 * - Dashboard mode (indigo accent, lavender wash): /app/dashboard, /app/reports
 *   (and root /app which renders DashboardPage)
 * - Operational mode (navy accent, sand base): every other /app/* route:
 *   /app/requests, /app/hr-review, /app/budget (and all budget sub-routes),
 *   /app/candidates, /app/workforce, /app/onboarding, /app/administration/*,
 *   /app/approvals, /app/procurement, /app/vendors.
 */
export function resolveSurfaceMode(pathname: string | null): SurfaceMode {
  if (!pathname) return "operational";

  // Normalize path (strip query parameters and trailing slashes)
  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  // Dashboard mode routes per Part 3 table
  if (
    cleanPath === "/app" ||
    cleanPath === "/app/dashboard" ||
    cleanPath.startsWith("/app/dashboard/") ||
    cleanPath === "/app/reports" ||
    cleanPath.startsWith("/app/reports/")
  ) {
    return "dashboard";
  }

  // Every other /app/* route gets operational mode
  return "operational";
}

export interface AppSurfaceInsetProps extends React.ComponentProps<typeof SidebarInset> {
  modeOverride?: SurfaceMode;
}

/**
 * AppSurfaceInset
 *
 * The layout ancestor for internal application routes within (app).
 * Mounts `data-surface-mode="dashboard" | "operational"` dynamically based
 * on the active pathname, resolving `--page-bg` and `--accent-interactive`.
 */
export function AppSurfaceInset({
  children,
  className,
  modeOverride,
  ...props
}: AppSurfaceInsetProps) {
  const pathname = usePathname();
  const surfaceMode = modeOverride || resolveSurfaceMode(pathname);

  return (
    <SidebarInset
      data-surface-mode={surfaceMode}
      className={cn(
        "flex flex-1 min-h-0 flex-col overflow-hidden min-w-0 bg-page-bg transition-colors duration-150 print:overflow-visible",
        className
      )}
      {...props}
    >
      {children}
    </SidebarInset>
  );
}
