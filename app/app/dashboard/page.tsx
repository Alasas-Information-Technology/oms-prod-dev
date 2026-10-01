"use client";

import { DashboardGrid } from "@/components/oms/dashboard/DashboardGrid";
import { NewRequisitionDialog } from "@/components/oms/requests/NewRequisitionDialog";
import { Button } from "@/components/ui/button";
import { GlassBackground } from "@/components/ui/GlassBackground";
import { PageBarActions } from "@/components/ui/layouts/page-bar-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/hooks/usePermission";
import {
  useDashboardLayout,
  useParallelDashboardWidgets,
} from "@/lib/dashboard/api";
import {
  DashboardPersona,
  DashboardScope,
  WidgetId,
  WidgetPlacement,
} from "@/types/dashboard";
import { Layers, RefreshCw } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";


/**
 * Derives the active dashboard persona dynamically from the logged-in user's roles.
 */
function resolvePersonaFromRoles(roles?: string[]): DashboardPersona {
  if (!roles || !Array.isArray(roles) || roles.length === 0) return "requestor";
  const upper = roles.map((r) => r.toUpperCase());
  if (upper.some((r) => r.includes("ADMIN") || r.includes("SECURITY_ADMIN"))) {
    return "systemAdmin";
  }
  if (upper.some((r) => r.includes("FINANCE"))) {
    return "finance";
  }
  if (upper.some((r) => r.includes("HR") || r.includes("PEOPLE"))) {
    return "hr";
  }
  if (upper.some((r) => r.includes("HOD") || r.includes("DEPARTMENT_HEAD") || r.includes("HEAD"))) {
    return "hod";
  }
  return "requestor";
}

function DashboardPageContent() {
  const { user } = useAuth();
  const { can } = usePermission();
  const searchParams = useSearchParams();

  // Determine default persona based on current logged in user's profile
  const defaultPersona = React.useMemo(() => {
    return resolvePersonaFromRoles(user?.roles);
  }, [user?.roles]);

  const queryPersona = searchParams?.get("persona") as DashboardPersona | null;
  const initialDegraded = searchParams?.get("degraded") === "true";
  const [isDegraded, setIsDegraded] = React.useState<boolean>(initialDegraded);

  // Allow developer/demo override if selected, otherwise defaults to logged-in user's persona
  const [selectedPersona, setSelectedPersona] = React.useState<DashboardPersona | null>(() => {
    if (queryPersona && ["requestor", "hod", "hr", "finance", "systemAdmin"].includes(queryPersona)) {
      return queryPersona;
    }
    return null;
  });
  const persona = selectedPersona ?? defaultPersona;

  // Resolve current logged-in user's preferred first name
  const loggedInFirstName = React.useMemo(() => {
    if (user?.fullName && user.fullName.trim()) {
      return user.fullName.trim().split(/\s+/)[0];
    }
    if (user?.username && user.username.trim()) {
      return user.username.charAt(0).toUpperCase() + user.username.slice(1);
    }
    if (user?.email && user.email.trim()) {
      const localPart = user.email.split("@")[0];
      const clean = localPart.split(/[\._\-]+/)[0];
      return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    }
    return undefined;
  }, [user]);

  const [newReqOpen, setNewReqOpen] = React.useState(false);

  // Fetch layout for active persona (cached 60s per contract)
  const {
    data: layout,
    isLoading: isLayoutLoading,
    error: layoutError,
    refetch: refetchLayout,
  } = useDashboardLayout(persona);

  // Extract all widget placements from bands for parallel fetching
  const allPlacements = React.useMemo(() => {
    if (!layout?.bands) return [];
    const list: WidgetPlacement[] = [];
    for (const band of layout.bands) {
      if (Array.isArray(band.widgets)) {
        list.push(...band.widgets);
      }
    }
    return list;
  }, [layout]);

  // Fetch all widget data concurrently in parallel
  const widgetQueries = useParallelDashboardWidgets(
    allPlacements,
    isDegraded ? { degraded: true } : undefined
  );

  // Build response map for DashboardGrid
  const widgetResponses = React.useMemo(() => {
    const map = new Map<
      WidgetId,
      {
        data?: unknown;
        isLoading?: boolean;
        error?: Error | string | null;
        onRetry?: () => void;
        scope?: DashboardScope;
        link?: string;
      }
    >();

    allPlacements.forEach((placement, index) => {
      const q = widgetQueries[index];
      if (q) {
        map.set(placement.id, {
          data: q.data?.data,
          isLoading: q.isLoading,
          error: q.error,
          onRetry: () => q.refetch(),
          scope: q.data?.scope,
          link: q.data?.link,
        });
      }
    });

    return map;
  }, [allPlacements, widgetQueries]);

  // Concise time-of-day greeting text using current logged-in user name
  const greetingText = React.useMemo(() => {
    const name = loggedInFirstName || layout?.greeting?.name || "there";
    const period = layout?.greeting?.period || "MORNING";
    const salute =
      period === "EVENING"
        ? "Good evening"
        : period === "AFTERNOON"
          ? "Good afternoon"
          : "Good morning";
    return `${salute}, ${name}`;
  }, [loggedInFirstName, layout]);

  // Resolved scope label reflecting logged in user's department when available
  const displayScopeLabel = React.useMemo(() => {
    if (user?.department && selectedPersona === null) {
      return user.department;
    }
    return layout?.scope?.label || "Digital Security";
  }, [user, selectedPersona, layout]);

  if (isLayoutLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 pb-20 w-full max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-6 w-48 rounded-md" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-7 w-28 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
        </div>
        {/* Band A Skeleton (4 KPI cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-md" />
          <Skeleton className="h-28 rounded-md" />
          <Skeleton className="h-28 rounded-md" />
          <Skeleton className="h-28 rounded-md" />
        </div>
        {/* Band B Skeleton (2 charts) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-56 rounded-md" />
          <Skeleton className="h-56 rounded-md" />
        </div>
      </div>
    );
  }

  if (layoutError || !layout) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center w-full">
        <div className="p-8 bg-card border border-destructive/30 rounded-lg max-w-md w-full shadow-sm">
          <h2 className="text-base font-semibold text-foreground">
            Unable to load dashboard layout
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {layoutError?.message || "Failed to retrieve layout configuration."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchLayout()}
            className="mt-4 gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Layout
          </Button>
        </div>
      </div>
    );
  }


  console.log(layout);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-[1600px] mx-auto pb-16 w-full relative z-0">
      <GlassBackground />

      {/* Inject Persona Switcher into the sticky Breadcrumb / Page Bar */}
      <div>
        <div className="flex items-center gap-2">
          {persona === "systemAdmin" && (
            <button
              type="button"
              id="degraded-fixture-toggle"
              onClick={() => setIsDegraded((prev) => !prev)}
              className={cn(
                "px-2 py-0.5 rounded-md border text-[11px] font-medium transition-colors cursor-pointer",
                isDegraded
                  ? "bg-[var(--danger-surface)] text-[var(--danger-text)] border-[var(--danger-border)] font-semibold"
                  : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted/60"
              )}
            >
              {isDegraded ? "Fixture: Degraded (Failures Active)" : "Fixture: Healthy"}
            </button>
          )}
          {/* U5 — Comparison Period Control */}
          <div className="flex items-center gap-1 bg-muted/40 hover:bg-muted/60 transition-colors px-2 py-0.5 rounded-md border border-border/40 text-[11px] shadow-2xs cursor-pointer">
            <span className="text-muted-foreground font-medium whitespace-nowrap hidden sm:inline">
              Last 90 days
            </span>
            <span className="text-muted-foreground/60 font-normal">vs</span>
            <span className="text-muted-foreground font-medium whitespace-nowrap hidden sm:inline">
              Previous 90 days
            </span>
            <svg className="size-3 text-muted-foreground/50 ml-0.5" viewBox="0 0 12 12" fill="none">
              <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex items-center gap-1 bg-muted/40 hover:bg-muted/60 transition-colors px-2 py-0.5 rounded-md border border-border/40 text-[11px] shadow-2xs">
            <Layers className="size-3 text-muted-foreground" />
            <span className="text-muted-foreground font-medium text-[11px] hidden sm:inline whitespace-nowrap">
              View as:
            </span>
            <Select
              value={persona}
              onValueChange={(val) => setSelectedPersona(val as DashboardPersona)}
            >
              <SelectTrigger size="xs" className="h-5 border-none bg-transparent shadow-none text-[11px] font-semibold focus:ring-0 px-1 py-0 text-foreground gap-1">
                <SelectValue placeholder="Persona" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="requestor">Requestor</SelectItem>
                <SelectItem value="hod">HOD</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="systemAdmin">System Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>



      {/* 12-Column Responsive Full-Width Dashboard Grid */}
      <DashboardGrid
        bands={layout.bands}
        scope={{
          ...layout.scope,
          label: displayScopeLabel,
        }}
        period={layout.fiscalPeriod.label}
        widgetResponses={widgetResponses}
      />

      {/* New Requisition Dialog */}
      <NewRequisitionDialog
        open={newReqOpen}
        onOpenChange={setNewReqOpen}
        onCreate={(draft) => {
          console.log("Draft created:", draft);
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-6 animate-pulse p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-lg" />
        </div>
      }
    >
      <DashboardPageContent />
    </React.Suspense>
  );
}
