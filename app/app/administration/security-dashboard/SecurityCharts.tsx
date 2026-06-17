"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FailedLoginsChartDto,
  LockedAccountsDto,
  LoginTrendDto,
  ReplayEventsDto,
  SecurityEventsByTypeDto,
  SessionsByDeviceDto,
  SessionsByRoleDto,
  SessionsCreatedPerDayDto
} from "@/lib/types/security.types";
import { format } from "date-fns";
import { Activity, KeyRound, ShieldAlert, ShieldBan, ShieldCheck, ShieldX } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis
} from "recharts";
import { RawSecurityEvent } from "./columns";

export interface ChartsDataProps {
  chartsData: {
    failedLogins?: FailedLoginsChartDto[];
    securityEventsByType?: SecurityEventsByTypeDto[];
    sessionsByDevice?: SessionsByDeviceDto[];
    sessionsByRole?: SessionsByRoleDto[];
    loginTrend?: LoginTrendDto[];
    replayEvents?: ReplayEventsDto[];
    lockedAccounts?: LockedAccountsDto[];
    sessionsCreatedPerDay?: SessionsCreatedPerDayDto[];
  } | null;
}

export interface SocPanelProps {
  recentEvents: RawSecurityEvent[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

const safeFormatDate = (dateStr: string | Date, formatStr: string) => {
  try {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return format(d, formatStr);
  } catch {
    return String(dateStr);
  }
};

export function SocPanel({ recentEvents }: SocPanelProps) {
  const socEvents = useMemo(() => {
    return recentEvents.slice(0, 20).map(event => {
      let badgeColor = "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-500/30";
      let dotColor = "bg-blue-500";
      let typeLabel = event.EventType;
      let Icon = KeyRound;

      if (event.EventType === "REFRESH_TOKEN_REPLAY") {
        badgeColor = "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border-red-200 dark:border-red-500/30 animate-pulse";
        dotColor = "bg-red-600";
        typeLabel = "REPLAY ATTEMPT";
        Icon = ShieldAlert;
      } else if (event.EventType === "ACCOUNT_LOCKED" || event.EventType === "FAILED_LOGIN_LIMIT_EXCEEDED" || event.EventType === "ACCOUNT_LOCKOUT") {
        badgeColor = "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 border-orange-200 dark:border-orange-500/30";
        dotColor = "bg-orange-500";
        typeLabel = "ACCOUNT LOCKED";
        Icon = ShieldBan;
      } else if (event.EventType === "SESSION_REVOKED" || event.EventType.includes("REVOK")) {
        badgeColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/30";
        dotColor = "bg-yellow-500";
        typeLabel = "SESSION REVOKED";
        Icon = ShieldX;
      } else if (event.EventType === "LOGIN_SUCCESS") {
        badgeColor = "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 border-green-200 dark:border-green-500/30";
        dotColor = "bg-green-500";
        typeLabel = "LOGIN SUCCESS";
        Icon = ShieldCheck;
      }

      return {
        ...event,
        badgeColor,
        dotColor,
        typeLabel,
        Icon
      };
    });
  }, [recentEvents]);

  return (
    <Card className="flex flex-col h-[550px] shadow-sm border-muted overflow-hidden w-full">
      <CardHeader className="pb-4 border-b bg-muted/20 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Enterprise SOC Panel</CardTitle>
          </div>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        </div>
        <CardDescription className="text-xs">Real-time security event feed (Top 20)</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0">
        <ScrollArea className="h-full w-full">
          {socEvents.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 text-sm">No recent security events</div>
          ) : (
            <div className="divide-y divide-border">
              {socEvents.map((event, idx) => (
                <div key={event.SecurityEventID || idx} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex gap-3 text-sm">
                    <div className="shrink-0 mt-0.5">
                      <div className={`p-1.5 rounded-md border ${event.badgeColor} bg-opacity-50`}>
                        <event.Icon className={`w-4 h-4 ${event.dotColor.replace('bg-', 'text-')}`} />
                      </div>
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${event.badgeColor}`}>
                          {event.typeLabel}
                        </span>
                        <span className="text-muted-foreground text-[11px] tabular-nums whitespace-nowrap">
                          {event.CreatedAt ? safeFormatDate(event.CreatedAt, "MMM d, HH:mm:ss") : "-"}
                        </span>
                      </div>
                      <p className="font-medium text-foreground text-xs leading-relaxed break-words">
                        {event.EventDescription}
                      </p>
                      <div className="flex gap-3 text-[11px] text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">IP:</span> {event.IPAddress || "Local"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function FailedLoginsChart({ chartsData }: ChartsDataProps) {
  const failedLogins7Days = useMemo(() => {
    const raw = chartsData?.failedLogins || [];
    
    // Generate the last 7 calendar days ending today
    const result = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        dateStr: format(d, "yyyy-MM-dd"),
        day: format(d, "do EEE"),
        count: 0
      };
    });

    // Map database records to the generated days
    raw.forEach(item => {
      const itemDate = new Date(item.date);
      if (!isNaN(itemDate.getTime())) {
        const itemDateStr = format(itemDate, "yyyy-MM-dd");
        const match = result.find(r => r.dateStr === itemDateStr);
        if (match) {
          match.count = item.count || 0;
        }
      }
    });

    return result.map(({ day, count }) => ({ day, count }));
  }, [chartsData?.failedLogins]);
  const failedLoginsConfig = { count: { label: "Failed Attempts", color: "#ef4444" } };

  return (
    <Card className="flex flex-col shadow-sm border-muted w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Failed Logins (7 Days)</CardTitle>
        <CardDescription className="text-xs">Authentication failures for brute force detection</CardDescription>
      </CardHeader>
      <CardContent className="h-[220px]">
        {failedLogins7Days.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">No failed logins recorded</div>
        ) : (
          <ChartContainer config={failedLoginsConfig} className="h-full w-full">
            <AreaChart data={failedLogins7Days} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFailedLogins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} className="fill-muted-foreground" />
              <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} className="fill-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-count)"
                fillOpacity={1}
                fill="url(#colorFailedLogins)"
                strokeWidth={2}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function EventsByTypeChart({ chartsData }: ChartsDataProps) {
  const eventsByType = useMemo(() => {
    return (chartsData?.securityEventsByType || []).map(item => {
      let typeLabel = item.eventType || "Unknown";
      if (typeLabel === "LOGIN_SUCCESS") typeLabel = "Login Success";
      else if (typeLabel === "LOGIN_FAILED") typeLabel = "Login Failed";
      else if (typeLabel === "ACCOUNT_LOCKED" || typeLabel === "ACCOUNT_LOCKOUT") typeLabel = "Account Locked";
      else if (typeLabel === "SESSION_REVOKED") typeLabel = "Session Revoked";
      else if (typeLabel === "REFRESH_TOKEN_REPLAY") typeLabel = "Replay Detect";
      else if (typeLabel === "REFRESH_TOKEN_ROTATED") typeLabel = "Token Rotated";
      else if (typeLabel === "SESSION_CREATED") typeLabel = "Session Created";
      else if (typeLabel === "REFRESH_TOKEN_REVOKED") typeLabel = "Token Revoked";
      else if (typeLabel === "LOGOUT") typeLabel = "Logout";
      else if (typeLabel === "LOGIN_FAILED") typeLabel = "Login Failed";
      else if (typeLabel === "ADMIN_LOGIN") typeLabel = "Admin Login";
      else if (typeLabel === "USER_UPDATED") typeLabel = "User Updated";
      else if (typeLabel === "USER_CREATED") typeLabel = "User Created";

      else typeLabel = typeLabel.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

      return {
        type: typeLabel,
        count: item.count || 0
      };
    });
  }, [chartsData?.securityEventsByType]);
  console.log("🚀 ~ EventsByTypeChart ~ eventsByType:", eventsByType)
  const eventsByTypeConfig = { count: { label: "Event Count", color: "#8b5cf6" } };

  return (
    <Card className="flex flex-col shadow-sm border-muted w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Events by Type</CardTitle>
        <CardDescription className="text-xs">Categorized security event distribution</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] pl-0">
        {eventsByType.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">No security events found</div>
        ) : (
          <ChartContainer config={eventsByTypeConfig} className="h-full w-full">
            <BarChart className="w-full" data={eventsByType} layout="vertical" margin={{ left: 5, right: 20, top: 10, bottom: 0 }}>

              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-muted" />
              <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} className="fill-muted-foreground" />
              <YAxis dataKey="type" type="category" tickLine={true} axisLine={false} width={130} interval={0} className="fill-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="count" position="right" fontSize={10} className="fill-muted-foreground" />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function SessionsByDeviceChart({ chartsData }: ChartsDataProps) {
  const sessionsByDevice = useMemo(() => {
    return (chartsData?.sessionsByDevice || []).map((item, i) => ({
      name: item.device || "Unknown",
      value: item.count || 0,
      fill: COLORS[i % COLORS.length]
    }));
  }, [chartsData?.sessionsByDevice]);
  const deviceConfig = useMemo(() => {
    const config: Record<string, any> = { value: { label: "Sessions" } };
    sessionsByDevice.forEach((item) => {
      config[item.name] = { label: item.name, color: item.fill };
    });
    return config;
  }, [sessionsByDevice]);

  return (
    <Card className="flex flex-col shadow-sm border-muted w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Sessions by Device</CardTitle>
        <CardDescription className="text-xs">Client type distribution</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {sessionsByDevice.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">No active sessions</div>
        ) : (
          <ChartContainer config={deviceConfig} className="h-full w-full">
            <PieChart>
              <Pie
                data={sessionsByDevice}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {sessionsByDevice.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
              <ChartLegend content={(props: any) => <ChartLegendContent {...props} />} className="-translate-y-2 flex-wrap gap-2 text-[10px]" />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function LoginTrendChart({ chartsData }: ChartsDataProps) {
  const loginTrend = useMemo(() => {
    return (chartsData?.loginTrend || []).map(item => ({
      ...item,
      formattedDate: safeFormatDate(item.date, "MMM d")
    }));
  }, [chartsData?.loginTrend]);
  const loginTrendConfig = {
    success: { label: "Success", color: "#10b981" },
    failure: { label: "Failure", color: "#ef4444" }
  };

  return (
    <Card className="flex flex-col shadow-sm border-muted w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Success vs Failures</CardTitle>
        <CardDescription className="text-xs">Authentication trend comparison</CardDescription>
      </CardHeader>
      <CardContent className="h-[220px]">
        {loginTrend.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">No authentication data</div>
        ) : (
          <ChartContainer config={loginTrendConfig} className="h-full w-full">
            <LineChart data={loginTrend} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis dataKey="formattedDate" tickLine={false} axisLine={false} fontSize={10} className="fill-muted-foreground" />
              <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} className="fill-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={(props: any) => <ChartLegendContent {...props} />} />
              <Line type="monotone" dataKey="success" stroke="var(--color-success)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="failure" stroke="var(--color-failure)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function ReplayEventsChart({ chartsData }: ChartsDataProps) {
  const replayEvents = useMemo(() => {
    return (chartsData?.replayEvents || []).map(item => ({
      ...item,
      formattedDate: safeFormatDate(item.date, "MMM d")
    }));
  }, [chartsData?.replayEvents]);
  const replayConfig = { count: { label: "Replay Events", color: "#dc2626" } };

  return (
    <Card className="flex flex-col shadow-sm border-muted w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <CardTitle className="text-base">Replay Detects</CardTitle>
        </div>
        <CardDescription className="text-xs">Token theft attempts</CardDescription>
      </CardHeader>
      <CardContent className="h-[220px]">
        {replayEvents.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">No replay events recorded</div>
        ) : (
          <ChartContainer config={replayConfig} className="h-full w-full">
            <AreaChart data={replayEvents} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReplay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis dataKey="formattedDate" tickLine={false} axisLine={false} fontSize={10} className="fill-muted-foreground" />
              <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} className="fill-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-count)"
                fillOpacity={1}
                fill="url(#colorReplay)"
                strokeWidth={3}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function LockedAccountsChart({ chartsData }: ChartsDataProps) {
  const lockedAccounts = useMemo(() => {
    return (chartsData?.lockedAccounts || []).map(item => ({
      username: item.username,
      lockouts: item.lockouts || 0
    }));
  }, [chartsData?.lockedAccounts]);
  const lockedAccountsConfig = { lockouts: { label: "Failed Attempts", color: "#f59e0b" } };

  return (
    <Card className="flex flex-col shadow-sm border-muted w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Locked Accounts</CardTitle>
        <CardDescription className="text-xs">Accounts targeted by brute force</CardDescription>
      </CardHeader>
      <CardContent className="h-[220px]">
        {lockedAccounts.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
            No locked accounts
          </div>
        ) : (
          <ChartContainer config={lockedAccountsConfig} className="h-full w-full">
            <BarChart data={lockedAccounts} layout="vertical" margin={{ left: 5, right: 20, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
              <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} className="fill-muted-foreground" />
              <YAxis dataKey="username" type="category" tickLine={false} axisLine={false} fontSize={10} width={80} className="fill-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="lockouts" fill="var(--color-lockouts)" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="lockouts" position="right" fontSize={10} className="fill-muted-foreground" />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function SessionsCreatedChart({ chartsData }: ChartsDataProps) {
  const sessionsCreated = useMemo(() => {
    return (chartsData?.sessionsCreatedPerDay || []).map(item => ({
      ...item,
      formattedDate: safeFormatDate(item.date, "MMM d")
    }));
  }, [chartsData?.sessionsCreatedPerDay]);
  const sessionsCreatedConfig = { count: { label: "Sessions Created", color: "#3b82f6" } };

  return (
    <Card className="flex flex-col shadow-sm border-muted w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Sessions Created</CardTitle>
        <CardDescription className="text-xs">Adoption and usage spikes</CardDescription>
      </CardHeader>
      <CardContent className="h-[220px]">
        {sessionsCreated.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">No sessions created recently</div>
        ) : (
          <ChartContainer config={sessionsCreatedConfig} className="h-full w-full">
            <AreaChart data={sessionsCreated} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSessionsCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis dataKey="formattedDate" tickLine={false} axisLine={false} fontSize={10} className="fill-muted-foreground" />
              <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} className="fill-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-count)"
                fillOpacity={1}
                fill="url(#colorSessionsCreated)"
                strokeWidth={2}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function SessionsByRoleChart({ chartsData }: ChartsDataProps) {
  const sessionsByRole = useMemo(() => {
    return (chartsData?.sessionsByRole || []).map(item => ({
      role: item.role || "Unknown",
      count: item.count || 0
    }));
  }, [chartsData?.sessionsByRole]);
  const sessionsRoleConfig = { count: { label: "Active Sessions", color: "#6366f1" } };

  return (
    <Card className="flex flex-col shadow-sm border-muted w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Sessions by Role</CardTitle>
        <CardDescription className="text-xs">Live sessions by authorization</CardDescription>
      </CardHeader>
      <CardContent className="h-[220px]">
        {sessionsByRole.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">No active sessions</div>
        ) : (
          <ChartContainer config={sessionsRoleConfig} className="h-full w-full">
            <BarChart data={sessionsByRole} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis dataKey="role" tickLine={false} axisLine={false} fontSize={10} className="fill-muted-foreground" />
              <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} className="fill-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="count" position="top" fontSize={10} className="fill-muted-foreground" offset={5} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
