"use client";

import * as React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Activity,
  AlertTriangle,
  RotateCcw,
  Zap,
  Users,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SecurityDashboardDto } from "@/lib/types/security.types";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface Props {
  summary: SecurityDashboardDto | null;
  isLoading: boolean;
}

export function SecurityMonitoringCard({ summary, isLoading }: Props) {
  if (isLoading || !summary) {
    return (
      <Card className="rounded-2xl border-border/70 bg-card/70 backdrop-blur-xs shadow-xs">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-48 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <span className="text-xs text-muted-foreground animate-pulse">
            Fetching real-time SOC security telemetry...
          </span>
        </CardContent>
      </Card>
    );
  }

  // Health Score calculation (heuristic)
  const failedLoginImpact = Math.min((summary.failedLogins24Hours || 0) * 2, 40);
  const replayImpact = Math.min((summary.refreshTokenReplayEvents24Hours || 0) * 10, 50);
  const lockedAccountImpact = Math.min((summary.lockedUsers || 0) * 5, 30);

  const healthScore = Math.max(
    100 - failedLoginImpact - replayImpact - lockedAccountImpact,
    0
  );

  let healthColor = "#10b981"; // Emerald
  let healthText = "Optimum Hardened";
  let healthBadge = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";

  if (healthScore < 70) {
    healthColor = "#ef4444"; // Red
    healthText = "Critical Degradation";
    healthBadge = "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30";
  } else if (healthScore < 90) {
    healthColor = "#f59e0b"; // Amber
    healthText = "Elevated Caution";
    healthBadge = "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
  }

  const gaugeData = [
    { name: "Score", value: healthScore, fill: healthColor },
    { name: "Empty", value: 100 - healthScore, fill: "transparent" },
  ];

  return (
    <Card className="rounded-2xl border-border/70 bg-card/70 backdrop-blur-xs shadow-xs">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold font-display">
                Real-Time Security Posture & Health
              </CardTitle>
              <CardDescription className="text-xs">
                Continuous telemetry analysis and anomaly penalty scoring.
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-[10px] font-semibold", healthBadge)}>
            {healthText}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Gauge & Deductions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center rounded-xl border border-border/70 bg-background/50 p-6 shadow-2xs">
          {/* Radial Semi-Circle Gauge */}
          <div className="flex flex-col items-center justify-center relative h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={65}
                  outerRadius={88}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell key="cell-0" fill={healthColor} />
                  <Cell
                    key="cell-1"
                    fill="currentColor"
                    className="text-muted/20 dark:text-muted/40"
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center bottom-2">
              <span className="text-4xl font-bold font-mono tracking-tight" style={{ color: healthColor }}>
                {healthScore}%
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                Security Index
              </span>
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Dynamic Security Deductions
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-background/80 border border-border/40 text-xs">
                <span className="text-muted-foreground">Failed Logins Impact ({summary.failedLogins24Hours || 0})</span>
                <span className={cn("font-mono font-bold", failedLoginImpact > 0 ? "text-red-500" : "text-emerald-500")}>
                  {failedLoginImpact > 0 ? `-${failedLoginImpact} pts` : "0 pts"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-background/80 border border-border/40 text-xs">
                <span className="text-muted-foreground">Replay Violations Impact ({summary.refreshTokenReplayEvents24Hours || 0})</span>
                <span className={cn("font-mono font-bold", replayImpact > 0 ? "text-red-500" : "text-emerald-500")}>
                  {replayImpact > 0 ? `-${replayImpact} pts` : "0 pts"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-background/80 border border-border/40 text-xs">
                <span className="text-muted-foreground">Locked Users Impact ({summary.lockedUsers || 0})</span>
                <span className={cn("font-mono font-bold", lockedAccountImpact > 0 ? "text-red-500" : "text-emerald-500")}>
                  {lockedAccountImpact > 0 ? `-${lockedAccountImpact} pts` : "0 pts"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Headline Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl border border-border/70 bg-background/60 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Active Sessions</span>
              <Users className="size-3.5 text-blue-500" />
            </div>
            <span className="text-xl font-bold font-mono text-foreground block">
              {summary.activeSessions || 0}
            </span>
            <span className="text-[10px] text-muted-foreground">Live connections</span>
          </div>

          <div className="p-3.5 rounded-xl border border-border/70 bg-background/60 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Locked Users</span>
              <Lock className="size-3.5 text-orange-500" />
            </div>
            <span className="text-xl font-bold font-mono text-foreground block">
              {summary.lockedUsers || 0}
            </span>
            <span className="text-[10px] text-muted-foreground">Admin unlock req</span>
          </div>

          <div className="p-3.5 rounded-xl border border-border/70 bg-background/60 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Failed Logins</span>
              <ShieldAlert className="size-3.5 text-red-500" />
            </div>
            <span className="text-xl font-bold font-mono text-foreground block">
              {summary.failedLogins24Hours || 0}
            </span>
            <span className="text-[10px] text-muted-foreground">Last 24 hours</span>
          </div>

          <div className="p-3.5 rounded-xl border border-border/70 bg-background/60 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Security Events</span>
              <Activity className="size-3.5 text-purple-500" />
            </div>
            <span className="text-xl font-bold font-mono text-foreground block">
              {summary.securityEvents24Hours || 0}
            </span>
            <span className="text-[10px] text-muted-foreground">Audit logs</span>
          </div>

          <div className="p-3.5 rounded-xl border border-border/70 bg-background/60 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Replay Attacks</span>
              <Zap className="size-3.5 text-amber-500" />
            </div>
            <span className="text-xl font-bold font-mono text-foreground block">
              {summary.refreshTokenReplayEvents24Hours || 0}
            </span>
            <span className="text-[10px] text-muted-foreground">Blocked instances</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
