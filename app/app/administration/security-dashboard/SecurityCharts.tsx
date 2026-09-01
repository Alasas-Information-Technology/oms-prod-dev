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
import { useMemo, ReactNode } from "react";
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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];
const BAR_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b", "#10b981"];

const safeFormatDate = (dateStr: string | Date, formatStr: string) => {
  try {
    if (!dateStr) return "-";
    let parseStr = String(dateStr);
    if (/^\d{4}-\d{2}-\d{2}$/.test(parseStr)) {
      parseStr += "T12:00:00Z";
    }
    const d = new Date(parseStr);
    return isNaN(d.getTime()) ? String(dateStr) : format(d, formatStr);
  } catch {
    return String(dateStr);
  }
};

const ChartCard = ({ title, desc, icon: Icon, h = "h-[220px]", isEmpty, emptyMsg, children }: { title: string, desc: string, icon?: any, h?: string, isEmpty: boolean, emptyMsg: string, children: ReactNode }) => (
  <Card className="flex flex-col shadow-sm border-muted w-full h-full">
    <CardHeader className="pb-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-red-500" />}
        <CardTitle className="text-base">{title}</CardTitle>
      </div>
      <CardDescription className="text-xs">{desc}</CardDescription>
    </CardHeader>
    <CardContent className={h}>
      {isEmpty ? (
        <div className="flex h-full items-center justify-center text-muted-foreground text-xs">{emptyMsg}</div>
      ) : children}
    </CardContent>
  </Card>
);

export function SocPanel({ recentEvents }: { recentEvents: RawSecurityEvent[] }) {
  const socEvents = useMemo(() => recentEvents.slice(0, 20).map(event => {
    const type = event.EventType;
    let style = { badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20", iconBg: "bg-blue-500/10", iconColor: "text-blue-600 dark:text-blue-400", label: type, Icon: KeyRound };

    if (type === "REFRESH_TOKEN_REPLAY")
      style = { badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20", iconBg: "bg-rose-500/10", iconColor: "text-rose-600 dark:text-rose-400", label: "REPLAY ATTEMPT", Icon: ShieldAlert };
    else if (["ACCOUNT_LOCKED", "FAILED_LOGIN_LIMIT_EXCEEDED", "ACCOUNT_LOCKOUT"].includes(type))
      style = { badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20", iconBg: "bg-amber-500/10", iconColor: "text-amber-600 dark:text-amber-400", label: "ACCOUNT LOCKED", Icon: ShieldBan };
    else if (type === "LOGIN_FAILURE" || type === "LOGIN_FAILED")
      style = { badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20", iconBg: "bg-rose-500/10", iconColor: "text-rose-600 dark:text-rose-400", label: "LOGIN FAILED", Icon: ShieldAlert };
    else if (type === "SESSION_REVOKED" || type.includes("REVOK"))
      style = { badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20", iconBg: "bg-amber-500/10", iconColor: "text-amber-600 dark:text-amber-400", label: "SESSION REVOKED", Icon: ShieldX };
    else if (type === "LOGIN_SUCCESS")
      style = { badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-600 dark:text-emerald-400", label: "LOGIN SUCCESS", Icon: ShieldCheck };

    return { ...event, ...style };
  }), [recentEvents]);

  return (
    <Card className="flex flex-col h-[550px] shadow-none border border-border/60 bg-card rounded-xl overflow-hidden w-full">
      <CardHeader className="h-11 min-h-[44px] px-5 py-0 flex flex-row items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <CardTitle className="text-[14px] font-semibold text-foreground">Enterprise SOC Panel</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-medium">Real-time</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-2 min-h-0">
        <ScrollArea className="h-full w-full pr-2">
          {socEvents.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 text-xs">No recent security events</div>
          ) : (
            <div className="flex flex-col gap-1">
              {socEvents.map((event, idx) => (
                <div
                  key={event.SecurityEventID || idx}
                  className="group flex items-start justify-between p-2.5 rounded-[8px] hover:bg-foreground/[0.03] transition-colors select-none"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1 pr-2">
                    <div className={`w-7 h-7 rounded-md ${event.iconBg} ${event.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
                      <event.Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${event.badge}`}>
                          {event.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          IP: {event.IPAddress || "Local"}
                        </span>
                      </div>
                      <p className="font-medium text-foreground text-xs leading-snug break-words">
                        {event.EventDescription}
                      </p>
                    </div>
                  </div>
                  <span className="text-muted-foreground text-[11px] font-mono tabular-nums whitespace-nowrap shrink-0 pt-0.5">
                    {event.CreatedAt ? safeFormatDate(event.CreatedAt, "HH:mm:ss") : "-"}
                  </span>
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
  const data = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const match = chartsData?.failedLogins?.find(r => r.date === format(d, "yyyy-MM-dd"));
    return { day: format(d, "do EEE"), count: match?.count || 0 };
  }), [chartsData?.failedLogins]);

  return (
    <ChartCard title="Failed Logins (7 Days)" desc="Authentication failures for brute force detection" isEmpty={data.length === 0} emptyMsg="No failed logins recorded">
      <ChartContainer config={{ count: { label: "Failed Attempts", color: "#ef4444" } }} className="h-full w-full">
        <AreaChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
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
          <Area type="monotone" dataKey="count" stroke="var(--color-count)" fillOpacity={1} fill="url(#colorFailedLogins)" strokeWidth={2} activeDot={{ r: 6, strokeWidth: 0 }} />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
}

const EVENT_LABELS: Record<string, string> = {
  LOGIN_SUCCESS: "Login Success", LOGIN_FAILED: "Login Failed", LOGIN_FAILURE: "Login Failed", ACCOUNT_LOCKED: "Account Locked",
  ACCOUNT_LOCKOUT: "Account Locked", SESSION_REVOKED: "Session Revoked", REFRESH_TOKEN_REPLAY: "Replay Detect",
  REFRESH_TOKEN_ROTATED: "Token Rotated", SESSION_CREATED: "Session Created", REFRESH_TOKEN_REVOKED: "Token Revoked",
  LOGOUT: "Logout", ADMIN_LOGIN: "Admin Login", USER_UPDATED: "User Updated", USER_CREATED: "User Created",
  SESSION_AUTO_REVOKED: "Session Auto-Revoked", CONCURRENT_SESSION_LIMIT_EXCEEDED: "Concurrent Limit Exceeded",
  SECURITY_SETTING_UPDATED: "Setting Updated", SECURITY_SETTING_CHANGED: "Setting Changed", ADMIN_REVOKE_SESSION: "Admin Revoked Session"
};

export function EventsByTypeChart({ chartsData }: ChartsDataProps) {
  const data = useMemo(() => {
    const agg: Record<string, number> = {};
    (chartsData?.securityEventsByType || []).forEach(item => {
      const label = EVENT_LABELS[item.eventType || "Unknown"] || (item.eventType || "Unknown").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      agg[label] = (agg[label] || 0) + (item.count || 0);
    });
    return Object.entries(agg).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [chartsData?.securityEventsByType]);

  return (
    <ChartCard title="Events by Type" desc="Top security event distribution" h="h-[300px] pl-0" isEmpty={data.length === 0} emptyMsg="No security events found">
      <ChartContainer config={{ count: { label: "Event Count", color: "#8b5cf6" } }} className="h-full w-full">
        <BarChart className="w-full" data={data} layout="vertical" margin={{ left: 5, right: 25, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-muted" />
          <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} className="fill-muted-foreground" />
          <YAxis dataKey="type" type="category" tickLine={false} axisLine={false} width={155} interval={0} className="fill-muted-foreground font-medium text-xs" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
            <LabelList dataKey="count" position="right" fontSize={10} className="fill-muted-foreground font-medium" />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}

import { DistributionBar, DistributionSegment } from "@/components/oms/dashboard/DistributionBar";

export function SessionsByDeviceChart({ chartsData }: ChartsDataProps) {
  const devices = chartsData?.sessionsByDevice || [];
  const total = useMemo(() => devices.reduce((sum, item) => sum + (item.count || 0), 0) || 1, [devices]);

  const segments: DistributionSegment[] = useMemo(() => {
    return devices.map((item) => ({
      label: item.device || "Unknown",
      value: item.count || 0,
      formatted: `${item.count || 0}`,
      percent: ((item.count || 0) / total) * 100,
    }));
  }, [devices, total]);

  return (
    <Card className="flex flex-col shadow-sm border-muted w-full h-full p-5 justify-between select-none">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Sessions by Device</h3>
        <p className="text-xs text-muted-foreground">Client platform breakdown</p>
      </div>
      <div className="my-auto py-2 w-full">
        {devices.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs py-6">No active sessions</div>
        ) : (
          <DistributionBar segments={segments} />
        )}
      </div>
    </Card>
  );
}

export function LoginTrendChart({ chartsData }: ChartsDataProps) {
  const data = useMemo(() => (chartsData?.loginTrend || []).map(item => ({ ...item, formattedDate: safeFormatDate(item.date, "MMM d") })), [chartsData?.loginTrend]);

  return (
    <ChartCard title="Success vs Failures" desc="Authentication trend comparison" isEmpty={data.length === 0} emptyMsg="No authentication data">
      <ChartContainer config={{ success: { label: "Success", color: "#10b981" }, failure: { label: "Failure", color: "#ef4444" } }} className="h-full w-full">
        <LineChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
          <XAxis dataKey="formattedDate" tickLine={false} axisLine={false} fontSize={10} className="fill-muted-foreground" />
          <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} className="fill-muted-foreground" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={(props: any) => <ChartLegendContent {...props} />} />
          <Line type="monotone" dataKey="success" stroke="var(--color-success)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="failure" stroke="var(--color-failure)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  );
}

export function ReplayEventsChart({ chartsData }: ChartsDataProps) {
  const data = useMemo(() => (chartsData?.replayEvents || []).map(item => ({ ...item, formattedDate: safeFormatDate(item.date, "MMM d") })), [chartsData?.replayEvents]);

  return (
    <ChartCard title="Replay Detects" desc="Token theft attempts" icon={ShieldAlert} isEmpty={data.length === 0} emptyMsg="No replay events recorded">
      <ChartContainer config={{ count: { label: "Replay Events", color: "#dc2626" } }} className="h-full w-full">
        <AreaChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
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
          <Area type="monotone" dataKey="count" stroke="var(--color-count)" fillOpacity={1} fill="url(#colorReplay)" strokeWidth={3} activeDot={{ r: 6 }} />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
}

export function LockedAccountsChart({ chartsData }: ChartsDataProps) {
  const data = useMemo(() => (chartsData?.lockedAccounts || []).map(item => ({ username: item.username, lockouts: item.lockouts || 0 })), [chartsData?.lockedAccounts]);

  return (
    <ChartCard title="Locked Accounts" desc="Accounts targeted by brute force" isEmpty={data.length === 0} emptyMsg="No locked accounts">
      <ChartContainer config={{ lockouts: { label: "Failed Attempts", color: "#f59e0b" } }} className="h-full w-full">
        <BarChart data={data} layout="vertical" margin={{ left: 5, right: 20, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
          <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} className="fill-muted-foreground" />
          <YAxis dataKey="username" type="category" tickLine={false} axisLine={false} fontSize={10} width={80} className="fill-muted-foreground" />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="lockouts" fill="var(--color-lockouts)" radius={[0, 4, 4, 0]}>
            <LabelList dataKey="lockouts" position="right" fontSize={10} className="fill-muted-foreground" />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}

export function SessionsCreatedChart({ chartsData }: ChartsDataProps) {
  const data = useMemo(() => (chartsData?.sessionsCreatedPerDay || []).map(item => ({ ...item, formattedDate: safeFormatDate(item.date, "MMM d") })), [chartsData?.sessionsCreatedPerDay]);

  return (
    <ChartCard title="Sessions Created" desc="Adoption and usage spikes" isEmpty={data.length === 0} emptyMsg="No sessions created recently">
      <ChartContainer config={{ count: { label: "Sessions Created", color: "#3b82f6" } }} className="h-full w-full">
        <AreaChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
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
          <Area type="monotone" dataKey="count" stroke="var(--color-count)" fillOpacity={1} fill="url(#colorSessionsCreated)" strokeWidth={2} activeDot={{ r: 5 }} />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
}

export function SessionsByRoleChart({ chartsData }: ChartsDataProps) {
  const data = useMemo(() => (chartsData?.sessionsByRole || []).map(item => ({ role: item.role || "Unknown", count: item.count || 0 })), [chartsData?.sessionsByRole]);

  return (
    <ChartCard title="Sessions by Role" desc="Live sessions by authorization" isEmpty={data.length === 0} emptyMsg="No active sessions">
      <ChartContainer config={{ count: { label: "Active Sessions", color: "#6366f1" } }} className="h-full w-full">
        <BarChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
          <XAxis dataKey="role" tickLine={false} axisLine={false} fontSize={10} className="fill-muted-foreground" />
          <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} className="fill-muted-foreground" />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="count" position="top" fontSize={10} className="fill-muted-foreground" offset={5} />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
