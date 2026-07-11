"use client";

import { useEffect, useState } from "react";
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { securityApi } from "@/lib/api/security";
import { DataTable, RowAction } from "@/components/oms/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Icon } from "@iconify/react";
import { useConfirm } from "@/hooks/use-confirm";
import { sessionsApi } from "@/lib/api/sessions";
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
  const confirm = useConfirm();

  const handleTerminateSession = async (loginSessionId: string) => {
    // Optimistic update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        summary: prev.summary
          ? {
            ...prev.summary,
            activeSessions: Math.max(0, (prev.summary.activeSessions || 0) - 1),
          }
          : prev.summary,
        activeSessions: prev.activeSessions?.filter((s) => s.LoginSessionID !== loginSessionId)
      };
    });
    try {
      await sessionsApi.revokeSession(loginSessionId);
    } catch (error) {
      console.error("Failed to revoke session", error);
      // Rollback on failure by re-fetching
      loadData();
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const dashRes = await securityApi.getDashboard();
      setData(dashRes as unknown as RawDashboardResponse);
    } catch (error) {
      console.error("Failed to load security dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch for immediate loading
    loadData();

    if (typeof window === "undefined") return;

    // Establish Server-Sent Events stream for real-time updates
    const eventSource = new EventSource("/api/internal/security/stream");

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
        setLoading(false);
      } catch (err) {
        console.error("Error parsing security stream message:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Security stream EventSource error:", err);
      // Fallback to manual fetching if the stream connection has issues
      loadData();
    };

    return () => {
      eventSource.close();
    };
  }, []);

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
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground mt-1">Enterprise Security Monitoring</p>
        </div>
        <Button onClick={loadData} disabled={loading} variant="outline" className="gap-2">
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Reload Data
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
        <div className="grid grid-cols-3 col-span-4 gap-3">


          <SimpleKpiCard
            title="Active Sessions"
            value={summary.activeSessions || 0}
            icon="mdi:shield-account"
            description="Currently active"
            color="text-blue-600"
            bg="bg-blue-100"
          />
          <SimpleKpiCard
            title="Failed Logins"
            value={summary.failedLogins24Hours || 0}
            icon="mdi:alert-circle-outline"
            description="Last 24 hours"
            color="text-red-600"
            bg="bg-red-100"
          />

          <SimpleKpiCard
            title="Locked Accounts"
            value={summary.lockedUsers || 0}
            icon="mdi:lock-outline"
            description="Requires admin unlock"
            color="text-orange-600"
            bg="bg-orange-100"
          />
        </div>
        <div className="col-span-3 md:col-span-4 xl:col-span-2 xl:row-span-3">
          <SocPanel recentEvents={events} />
        </div>
        <div className="col-span-4 row-span-2">
          <FailedLoginsChart chartsData={chartsData} />
        </div>
        <div className="col-span-3 row-span-2">
          <LoginTrendChart chartsData={chartsData} />
        </div>
        <SimpleKpiCard
          title="Security Events"
          value={summary.securityEvents24Hours || 0}
          icon="mdi:shield-alert-outline"
          description="Last 24 hours"
          color="text-purple-600"
          bg="bg-purple-100"
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
          description="Last 24 hours"
          color="text-red-700"
          bg="bg-red-200 dark:bg-red-500/20"
        />

      </div>

      {/* Security Monitoring Charts & SOC Panel */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">


        <div className="col-span-2"><SessionsByDeviceChart chartsData={chartsData} /></div>
        <div className="col-span-4"><EventsByTypeChart chartsData={chartsData} /></div>



        <div className="col-span-2"><ReplayEventsChart chartsData={chartsData} /></div>
        <div className="col-span-2"><LockedAccountsChart chartsData={chartsData} /></div>
        <div className="col-span-2"><SessionsCreatedChart chartsData={chartsData} /></div>
        <div className="col-span-6"><SessionsByRoleChart chartsData={chartsData} /></div>

      </div>

      {/* Tables using Tabs */}
      <div className="rounded-xl border bg-background p-4 shadow-sm flex flex-col min-h-[500px]">
        <Tabs defaultValue="failedLogins" className="w-full flex flex-col flex-1">
          <TabsList className="mb-4 self-start">
            <TabsTrigger value="failedLogins">Failed Login Attempts</TabsTrigger>
            <TabsTrigger value="events">Recent Security Events</TabsTrigger>
            <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
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
  );
}