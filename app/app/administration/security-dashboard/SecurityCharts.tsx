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
import {
  Activity,
  KeyRound,
  Shield,
  ShieldAlert,
  ShieldBan,
  ShieldCheck,
  ShieldX,
  Radio,
  Filter,
} from "lucide-react";
import { useMemo, useState, ReactNode } from "react";
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
  XAxis,
  YAxis
} from "recharts";
import { RawSecurityEvent, RawFailedLogin } from "./columns";

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
  threatSummary?: {
    failedLogins24Hours?: number;
    lockedUsers?: number;
    refreshTokenReplayEvents24Hours?: number;
    rateLimitEvents24Hours?: number;
    activeSessions?: number;
  };
  streamConnected?: boolean;
  lastUpdated?: Date | null;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#7C6BC4", "#06b6d4"];
const BAR_COLORS = ["#6366f1", "#7C6BC4", "#ec4899", "#B0432C", "#f59e0b", "#10b981"];

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

export function SocPanel({
  recentEvents,
  threatSummary,
  streamConnected = true,
  lastUpdated,
}: SocPanelProps) {
  const [filter, setFilter] = useState<"ALL" | "THREATS" | "AUTH">("ALL");

  const threatPosture = useMemo(() => {
    const replay = threatSummary?.refreshTokenReplayEvents24Hours || 0;
    const locked = threatSummary?.lockedUsers || 0;
    const failed = threatSummary?.failedLogins24Hours || 0;
    const rateLimit = threatSummary?.rateLimitEvents24Hours || 0;

    if (replay > 0 || locked > 0) {
      return {
        level: "HIGH ALERT",
        statusText: replay > 0 ? `${replay} Replay Attack(s) Detected` : `${locked} Account(s) Locked`,
        badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
        dotColor: "bg-rose-500",
        pingColor: "bg-rose-400",
      };
    }
    if (failed > 5 || rateLimit > 0) {
      return {
        level: "ELEVATED",
        statusText: `${failed} Failed Logins in 24h`,
        badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        dotColor: "bg-amber-500",
        pingColor: "bg-amber-400",
      };
    }
    return {
      level: "SECURE",
      statusText: "Telemetry within expected thresholds",
      badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      dotColor: "bg-emerald-500",
      pingColor: "bg-emerald-400",
    };
  }, [threatSummary]);

  const socEvents = useMemo(() => (recentEvents || []).map(event => {
    const type = event.EventType || (event as any).eventType || "UNKNOWN";
    let style = {
      badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      label: type.replace(/_/g, " "),
      Icon: KeyRound,
      isThreat: false
    };

    if (type === "REFRESH_TOKEN_REPLAY") {
      style = { badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20", iconBg: "bg-rose-500/10", iconColor: "text-rose-600 dark:text-rose-400", label: "REPLAY ATTEMPT", Icon: ShieldAlert, isThreat: true };
    } else if (["ACCOUNT_LOCKED", "FAILED_LOGIN_LIMIT_EXCEEDED", "ACCOUNT_LOCKOUT"].includes(type)) {
      style = { badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20", iconBg: "bg-amber-500/10", iconColor: "text-amber-600 dark:text-amber-400", label: "ACCOUNT LOCKED", Icon: ShieldBan, isThreat: true };
    } else if (type === "LOGIN_FAILURE" || type === "LOGIN_FAILED") {
      style = { badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20", iconBg: "bg-rose-500/10", iconColor: "text-rose-600 dark:text-rose-400", label: "LOGIN FAILED", Icon: ShieldAlert, isThreat: true };
    } else if (type === "SESSION_REVOKED" || type.includes("REVOK")) {
      style = { badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20", iconBg: "bg-amber-500/10", iconColor: "text-amber-600 dark:text-amber-400", label: "SESSION REVOKED", Icon: ShieldX, isThreat: true };
    } else if (type === "LOGIN_SUCCESS") {
      style = { badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-600 dark:text-emerald-400", label: "LOGIN SUCCESS", Icon: ShieldCheck, isThreat: false };
    }

    return { ...event, ...style };
  }), [recentEvents]);

  const threatCount = useMemo(() => socEvents.filter(e => e.isThreat).length, [socEvents]);
  const authCount = useMemo(() => socEvents.filter(e => !e.isThreat).length, [socEvents]);

  const filteredEvents = useMemo(() => {
    if (filter === "THREATS") return socEvents.filter(e => e.isThreat);
    if (filter === "AUTH") return socEvents.filter(e => !e.isThreat);
    return socEvents;
  }, [socEvents, filter]);

  return (
    <Card className="flex flex-col h-full shadow-none border border-border/70 bg-card rounded-xl overflow-hidden w-full select-none">
      {/* Top Header */}
      <CardHeader className="p-4 pb-3 border-b border-border/50 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground tracking-tight">
                Enterprise SOC
              </CardTitle>
              <CardDescription className="text-[11px] leading-tight">
                Live Security Operations
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              {streamConnected && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${threatPosture.pingColor} opacity-75`} />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${streamConnected ? threatPosture.dotColor : "bg-muted-foreground"}`} />
            </span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {streamConnected ? "Live" : "Polling"}
            </span>
          </div>
        </div>

        {/* Threat Level Banner */}
        <div className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${threatPosture.badgeColor}`}>
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            <span className="font-semibold tracking-wide text-[11px]">
              {threatPosture.level}
            </span>
          </div>
          <span className="text-[11px] opacity-90 truncate max-w-[170px]">
            {threatPosture.statusText}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all ${
              filter === "ALL"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({socEvents.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("THREATS")}
            className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all ${
              filter === "THREATS"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Threats ({threatCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("AUTH")}
            className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all ${
              filter === "AUTH"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Auth ({authCount})
          </button>
        </div>
      </CardHeader>

      {/* Live Event Stream List */}
      <CardContent className="flex-1 p-2 min-h-0">
        <ScrollArea className="h-full w-full pr-2">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16 px-4 space-y-2">
              <ShieldCheck className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-xs font-medium">No events matching this filter</p>
              <p className="text-[11px] text-muted-foreground/70">
                Incoming security events will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {filteredEvents.map((event, idx) => (
                <div
                  key={event.SecurityEventID || idx}
                  className={`group flex items-start justify-between p-2.5 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/40 transition-all select-none ${
                    idx === 0 ? "bg-muted/20 border-border/40" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1 pr-2">
                    <div className={`w-7 h-7 rounded-md ${event.iconBg} ${event.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
                      <event.Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${event.badge}`}>
                          {event.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                          {event.IPAddress || "Local"}
                        </span>
                      </div>
                      <p className="font-medium text-foreground text-xs leading-snug break-words">
                        {event.EventDescription || "No description provided"}
                      </p>
                    </div>
                  </div>
                  <span className="text-muted-foreground text-[10px] tabular-nums whitespace-nowrap shrink-0 pt-0.5">
                    {event.CreatedAt ? safeFormatDate(event.CreatedAt, "HH:mm:ss") : "-"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Footer Info */}
      <div className="p-2.5 px-4 border-t border-border/50 shrink-0 flex items-center justify-between text-[11px] text-muted-foreground bg-muted/20">
        <span>Displaying {filteredEvents.length} events</span>
        <span>
          {lastUpdated ? `Sync: ${format(lastUpdated, "HH:mm:ss")}` : "Connecting..."}
        </span>
      </div>
    </Card>
  );
}

export function FailedLoginsChart({
  chartsData,
  fallbackEvents
}: ChartsDataProps & { fallbackEvents?: RawFailedLogin[] }) {
  const data = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const targetDateStr = format(d, "yyyy-MM-dd");

      const match = chartsData?.failedLogins?.find(r => {
        if (!r.date) return false;
        const rStr = typeof r.date === "string" ? r.date.slice(0, 10) : format(new Date(r.date), "yyyy-MM-dd");
        return rStr === targetDateStr;
      });

      let count = match?.count;

      // Realtime fallback: if chartsData has 0 or is missing for today, check fallbackEvents
      if ((count === undefined || count === 0) && fallbackEvents && fallbackEvents.length > 0) {
        const localMatches = fallbackEvents.filter(f => {
          const attemptDate = f.AttemptedAt || (f as any).attemptedAt;
          if (!attemptDate) return false;
          try {
            const attemptDateStr = format(new Date(attemptDate), "yyyy-MM-dd");
            return attemptDateStr === targetDateStr;
          } catch {
            return false;
          }
        });
        if (localMatches.length > 0) {
          count = localMatches.length;
        }
      }

      return { day: format(d, "do EEE"), count: count || 0 };
    });
  }, [chartsData?.failedLogins, fallbackEvents]);

  return (
    <ChartCard
      title="Failed Logins (7 Days)"
      desc="Authentication failures for brute force detection"
      isEmpty={data.length === 0}
      emptyMsg="No failed logins recorded"
    >
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
    <ChartCard title="Events by Type" desc="Top security event distribution" h="h-[220px] pl-0" isEmpty={data.length === 0} emptyMsg="No security events found">
      <ChartContainer config={{ count: { label: "Event Count", color: "#7C6BC4" } }} className="h-full w-full">
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
