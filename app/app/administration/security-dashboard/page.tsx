"use client";

import * as React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import { format } from "date-fns";
import { SimpleKpiCard } from "@/components/budget";
import { securityApi } from "@/lib/api/security";
import { DataTable, RowAction } from "@/components/shared/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GlassBackground } from "@/components/ui/GlassBackground";
import { RefreshCcw, Shield, Radio, Activity } from "lucide-react";
import { Icon } from "@iconify/react";
import { useConfirm } from "@/hooks/use-confirm";
import { sessionsApi } from "@/lib/api/sessions";
import { PageBarActions } from "@/components/ui/layouts/page-bar-context";
import {
  DashboardSummary,
  RawDashboardResponse,
  RawActiveSession,
  failedLoginsColumns,
  eventsColumns,
  sessionsColumns
} from "./columns";
import {
  SocPanel,
  FailedLoginsChart,
  EventsByTypeChart,
  SessionsByDeviceChart,
  LoginTrendChart,
  ReplayEventsChart,
  LockedAccountsChart,
  SessionsCreatedChart,
  SessionsByRoleChart
} from "./SecurityCharts";
import {
  FailedLoginsChartDto,
  SecurityEventsByTypeDto,
  SessionsByDeviceDto,
  SessionsByRoleDto,
  LoginTrendDto,
  ReplayEventsDto,
  LockedAccountsDto,
  SessionsCreatedPerDayDto
} from "@/lib/types/security.types";

export default function SecurityDashboard() {
  const [data, setData] = useState<RawDashboardResponse | null>(null);
  const [chartsData, setChartsData] = useState<{
    failedLogins?: FailedLoginsChartDto[];
    securityEventsByType?: SecurityEventsByTypeDto[];
    sessionsByDevice?: SessionsByDeviceDto[];
    sessionsByRole?: SessionsByRoleDto[];
    loginTrend?: LoginTrendDto[];
    replayEvents?: ReplayEventsDto[];
    lockedAccounts?: LockedAccountsDto[];
    sessionsCreatedPerDay?: SessionsCreatedPerDayDto[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [streamConnected, setStreamConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const confirm = useConfirm();
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleTerminateSession = async (loginSessionId: string) => {
    // Optimistic update
    setData((prev: RawDashboardResponse | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        summary: prev.summary
          ? {
            ...prev.summary,
            activeSessions: Math.max(0, (prev.summary.activeSessions || 0) - 1),
          }
          : prev.summary,
        activeSessions: prev.activeSessions?.filter((s: RawActiveSession) => s.LoginSessionID !== loginSessionId)
      };
    });
    try {
      await sessionsApi.revokeSession(loginSessionId);
    } catch (error) {
      console.error("Failed to revoke session", error);
      // Rollback on failure by re-fetching
      loadData(false);
    }
  };

  // Explicit or initial load
  const loadData = useCallback(async (showLoadingSpinner: boolean = true) => {
    if (showLoadingSpinner) {
      setLoading(true);
    }
    try {
      const dashRes = await securityApi.getDashboard();
      setData(dashRes as unknown as RawDashboardResponse);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Failed to load security dashboard data", error);
    } finally {
      if (showLoadingSpinner) {
        setLoading(false);
      }
    }
  }, []);

  // Silent background fetch that never trips full-screen loading state
  const silentFetch = useCallback(async () => {
    try {
      const dashRes = await securityApi.getDashboard();
      setData(dashRes as unknown as RawDashboardResponse);
      setLastSyncTime(new Date());
    } catch (error) {
      // Non-critical background sync error
      console.debug("Silent security sync error:", error);
    }
  }, []);

  useEffect(() => {
    // Initial fetch for immediate loading
    loadData(true);

    if (typeof window === "undefined") return;

    // Establish Server-Sent Events stream for real-time updates
    const connectStream = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource("/api/internal/security/stream");
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setStreamConnected(true);
        setLastSyncTime(new Date());
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.dashboard) {
            setData(payload.dashboard);
          }
          setChartsData({
            failedLogins: payload.failedLogins,
            securityEventsByType: payload.securityEventsByType,
            sessionsByDevice: payload.sessionsByDevice,
            sessionsByRole: payload.sessionsByRole,
            loginTrend: payload.loginTrend,
            replayEvents: payload.replayEvents,
            lockedAccounts: payload.lockedAccounts,
            sessionsCreatedPerDay: payload.sessionsCreatedPerDay,
          });
          setStreamConnected(true);
          setLastSyncTime(new Date());
          setLoading(false);
        } catch (err) {
          console.error("Error parsing security stream message:", err);
        }
      };

      eventSource.onerror = (err) => {
        setStreamConnected(false);
        // Silently refresh without showing disruptive full-page loading indicators
        silentFetch();
      };
    };

    connectStream();

    // Fallback silent auto-sync every 10 seconds to guarantee real-time updates even if SSE buffers
    const pollInterval = setInterval(() => {
      silentFetch();
    }, 10000);

    // Refresh telemetry immediately when user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        silentFetch();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadData, silentFetch]);

  const summary = data?.summary || ({} as DashboardSummary);
  const events = data?.events || [];
  const failedLogins = data?.failedLogins || [];
  const sessions = data?.activeSessions || [];

  const sessionRowActions: RowAction<RawActiveSession>[] = [
    {
      label: "Terminate",
      icon: <Icon icon="mdi:trash-can-outline" width={14} height={14} />,
      variant: "destructive",
      onClick: (row) => {
        confirm(
          {
            title: "Terminate Session",
            description: `Sign out session ${row.LoginSessionID}? This cannot be undone.`,
            confirmLabel: "Terminate",
            cancelLabel: "Cancel",
            variant: "destructive",
          },
          () => handleTerminateSession(row.LoginSessionID)
        )();
      },
    },
  ];

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 pb-20">
      <GlassBackground />
      <PageBarActions>
        <Button
          type="button"
          onClick={() => loadData(true)}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2 h-9 text-xs rounded-lg cursor-pointer"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Reload Data
        </Button>
      </PageBarActions>

      {/* Main Responsive Layout: Left content area + Right Fixed/Sticky Enterprise SOC Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-6 items-start">
        
        {/* Left / Main Dashboard Column */}
        <div className="flex flex-col gap-6 min-w-0">

          {/* Telemetry Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted/70 text-xs">
                <span className="flex h-2 w-2 relative">
                  {streamConnected && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${streamConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
                </span>
                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                  {streamConnected ? "Realtime SSE Active" : "Auto-Sync Active"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {lastSyncTime ? `Last telemetry sync: ${format(lastSyncTime, "HH:mm:ss")}` : "Connecting to security stream..."}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => loadData(false)}
                disabled={loading}
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs rounded-lg cursor-pointer"
              >
                <RefreshCcw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                Sync Telemetry
              </Button>
            </div>
          </div>

          {/* 9 KPI Cards in Balanced 3x3 Grid */}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <SimpleKpiCard
              title="Active Sessions"
              value={summary.activeSessions || 0}
              icon="mdi:shield-account"
              description="Currently active"
              color="text-blue-600"
              bg="bg-blue-100 dark:bg-blue-500/20"
            />
            <SimpleKpiCard
              title="Failed Logins"
              value={summary.failedLogins24Hours || 0}
              icon="mdi:alert-circle-outline"
              description="Last 24 hours"
              color="text-red-600"
              bg="bg-red-100 dark:bg-red-500/20"
            />
            <SimpleKpiCard
              title="Locked Accounts"
              value={summary.lockedUsers || 0}
              icon="mdi:lock-outline"
              description="Requires admin unlock"
              color="text-orange-600"
              bg="bg-orange-100 dark:bg-orange-500/20"
            />
            <SimpleKpiCard
              title="Security Events"
              value={summary.securityEvents24Hours || 0}
              icon="mdi:shield-alert-outline"
              description="Last 24 hours"
              color="text-purple-600"
              bg="bg-purple-100 dark:bg-purple-500/20"
            />
            <SimpleKpiCard
              title="Successful Logins"
              value={summary.successfulLogins24Hours || 0}
              icon="mdi:check-circle-outline"
              description="Last 24 hours"
              color="text-emerald-600"
              bg="bg-emerald-100 dark:bg-emerald-500/20"
            />
            <SimpleKpiCard
              title="Rate Limit Events"
              value={summary.rateLimitEvents24Hours || 0}
              icon="mdi:speedometer-slow"
              description="Last 24 hours"
              color="text-amber-600"
              bg="bg-amber-100 dark:bg-amber-500/20"
            />
            <SimpleKpiCard
              title="Active Users"
              value={summary.activeUsersToday || 0}
              icon="mdi:account-group-outline"
              description="Today"
              color="text-indigo-600"
              bg="bg-indigo-100 dark:bg-indigo-500/20"
            />
            <SimpleKpiCard
              title="Revoked Sessions"
              value={summary.revokedSessions24Hours || 0}
              icon="mdi:account-cancel-outline"
              description="Last 24 hours"
              color="text-rose-600"
              bg="bg-rose-100 dark:bg-rose-500/20"
            />
            <SimpleKpiCard
              title="RTR Events"
              value={summary.refreshTokenReplayEvents24Hours || 0}
              icon="mdi:shield-alert"
              description="Token replay detects (24h)"
              color="text-red-700"
              bg="bg-red-200 dark:bg-red-500/20"
            />
          </div>

          {/* 8 Threat Telemetry Charts in Structured 2-Column Pairs */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <FailedLoginsChart chartsData={chartsData} fallbackEvents={failedLogins} />
            </div>
            <div>
              <LoginTrendChart chartsData={chartsData} />
            </div>
            <div>
              <EventsByTypeChart chartsData={chartsData} />
            </div>
            <div>
              <SessionsByDeviceChart chartsData={chartsData} />
            </div>
            <div>
              <ReplayEventsChart chartsData={chartsData} />
            </div>
            <div>
              <LockedAccountsChart chartsData={chartsData} />
            </div>
            <div>
              <SessionsCreatedChart chartsData={chartsData} />
            </div>
            <div>
              <SessionsByRoleChart chartsData={chartsData} />
            </div>
          </div>

          {/* Enterprise Data Tables (Tabs) */}
          <div className="flex flex-col min-h-[500px]">
            <Tabs defaultValue="failedLogins" className="w-full flex flex-col flex-1">
              <TabsList className="mb-4 self-start">
                <TabsTrigger value="failedLogins">
                  Failed Login Attempts ({failedLogins.length})
                </TabsTrigger>
                <TabsTrigger value="events">
                  Recent Security Events ({events.length})
                </TabsTrigger>
                <TabsTrigger value="sessions">
                  Active Sessions ({sessions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="failedLogins" className="flex-1 mt-0">
                <div className="overflow-auto">
                  <DataTable
                    columns={failedLoginsColumns}
                    data={failedLogins}
                    keyField="FailedLoginAttemptID"
                    loading={loading}
                    emptyMessage="No failed logins recorded"
                    compact={true}
                    enableSearch={true}
                    pageSize={20}
                    pageSizeOptions={[20, 50, 80]}
                  />
                </div>
              </TabsContent>

              <TabsContent value="events" className="flex-1 mt-0">
                <div className="overflow-auto">
                  <DataTable
                    columns={eventsColumns}
                    data={events}
                    keyField="SecurityEventID"
                    loading={loading}
                    emptyMessage="No security events recorded"
                    compact={true}
                    enableSearch={true}
                    pageSize={20}
                    pageSizeOptions={[20, 50, 80]}
                  />
                </div>
              </TabsContent>

              <TabsContent value="sessions" className="flex-1 mt-0">
                <div className="overflow-auto">
                  <DataTable
                    columns={sessionsColumns}
                    data={sessions}
                    keyField="LoginSessionID"
                    loading={loading}
                    groupBy={["Username"]}
                    emptyMessage="No active sessions found"
                    compact={true}
                    enableSearch={true}
                    rowActions={sessionRowActions}
                    pageSize={20}
                    pageSizeOptions={[20, 50, 80]}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

        </div>

        {/* Right / Fixed-on-desktop SOC Panel Column */}
        <div className="w-full xl:sticky xl:top-6 h-[650px] xl:h-[calc(100vh-5.5rem)] shrink-0">
          <SocPanel
            recentEvents={events}
            threatSummary={summary}
            streamConnected={streamConnected}
            lastUpdated={lastSyncTime}
          />
        </div>

      </div>

    </div>
  );
}