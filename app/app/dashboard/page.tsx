"use client";

import * as React from "react";
import { RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/hooks/usePermission";
import {
  useDashboardLayout,
  useParallelDashboardWidgets,
} from "@/lib/dashboard/api";
import { DashboardGrid } from "@/components/oms/dashboard/DashboardGrid";
import {
  DashboardPersona,
  DashboardScope,
  WidgetId,
  WidgetPlacement,
} from "@/types/dashboard";
import { PageBarActions } from "@/components/ui/layouts/page-bar-context";
import { NewRequisitionDialog } from "@/components/oms/requests/NewRequisitionDialog";

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

export default function DashboardPage() {
  const { user } = useAuth();
  const { can } = usePermission();

  // Determine default persona based on current logged in user's profile
  const defaultPersona = React.useMemo(() => {
    return resolvePersonaFromRoles(user?.roles);
  }, [user?.roles]);

  // Allow developer/demo override if selected, otherwise defaults to logged-in user's persona
  const [selectedPersona, setSelectedPersona] = React.useState<DashboardPersona | null>(null);
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
  const widgetQueries = useParallelDashboardWidgets(allPlacements);

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
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 pb-20 w-full">
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
        <div className="p-8 bg-card border border-destructive/30 rounded-xl max-w-md w-full shadow-sm">
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

  return (
    <div className="flex flex-1 flex-col gap-3.5 p-3.5 sm:p-4 md:p-5 max-w-[1600px] mx-auto pb-16 w-full">
      {/* Inject Persona Switcher into the sticky Breadcrumb / Page Bar */}
      <PageBarActions>
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
      </PageBarActions>



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
