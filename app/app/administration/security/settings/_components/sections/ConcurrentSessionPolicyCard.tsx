"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import Link from "next/link";
import {
  Users,
  RotateCcw,
  Ban,
  Activity,
  ArrowUpRight,
  Laptop,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UpdateSecuritySettingsInput } from "@/lib/validations/security-settings.schema";
import { SecurityDashboardDto } from "@/lib/types/security.types";
import { cn } from "@/lib/utils";

interface Props {
  summary: SecurityDashboardDto | null;
}

export function ConcurrentSessionPolicyCard({ summary }: Props) {
  const form = useFormContext<UpdateSecuritySettingsInput>();
  const autoRevoke = form.watch("autoRevokeOldestSession");

  return (
    <Card className="rounded-md border-border/70 bg-card/70 backdrop-blur-xs shadow-xs">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Laptop className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold font-display">
                Concurrent Session Governance
              </CardTitle>
              <CardDescription className="text-xs">
                Regulate active login slots per user and overflow arbitration rules.
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30">
            Session Policy
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Real-time System Load Pill */}
        <div className="p-4 rounded-md border border-border/70 bg-background/60 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Activity className="size-4.5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Live Active User Sessions
              </span>
              <span className="text-[11px] text-muted-foreground">
                Currently authenticated across DIEZ OMS services
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-foreground">
              {summary?.activeSessions ?? "0"}
            </span>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs text-primary gap-1"
            >
              <Link href="/app/administration/security-dashboard">
                <span>View All</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Max Concurrent Sessions Stepper */}
        <FormField
          control={form.control}
          name="maxConcurrentSessions"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Users className="size-3.5 text-muted-foreground" />
                  <span>Maximum Allowed Sessions per User</span>
                </FormLabel>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 5, 10].map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant={field.value === preset ? "default" : "outline"}
                      size="sm"
                      onClick={() => field.onChange(preset)}
                      className="h-6 px-2 text-[11px] rounded-md"
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                  className="font-mono text-sm h-10 rounded-md"
                />
              </FormControl>
              <FormDescription className="text-xs">
                Threshold for concurrent valid refresh tokens allowed per individual employee (1 – 20).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Limit Overflow Strategy Selector */}
        <FormField
          control={form.control}
          name="autoRevokeOldestSession"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-xs font-semibold text-foreground">
                Limit Overflow Arbitration Action
              </FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Auto Revoke Oldest */}
                <div
                  onClick={() => field.onChange(true)}
                  className={cn(
                    "p-4 rounded-md border cursor-pointer transition-all duration-150 space-y-2",
                    field.value === true
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-2xs"
                      : "border-border/70 hover:border-border hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="size-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <RotateCcw className="size-3.5" />
                    </div>
                    <span
                      className={cn(
                        "size-3 rounded-full border",
                        field.value === true
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/40"
                      )}
                    />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Auto-Revoke Oldest Session
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      New login succeeds seamlessly by terminating the least recently active session.
                    </p>
                  </div>
                </div>

                {/* Option 2: Deny New Login */}
                <div
                  onClick={() => field.onChange(false)}
                  className={cn(
                    "p-4 rounded-md border cursor-pointer transition-all duration-150 space-y-2",
                    field.value === false
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-2xs"
                      : "border-border/70 hover:border-border hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Ban className="size-3.5" />
                    </div>
                    <span
                      className={cn(
                        "size-3 rounded-full border",
                        field.value === false
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/40"
                      )}
                    />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Deny New Sign-In Attempt
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      Rejects new login until the user explicitly signs out from an existing device.
                    </p>
                  </div>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
