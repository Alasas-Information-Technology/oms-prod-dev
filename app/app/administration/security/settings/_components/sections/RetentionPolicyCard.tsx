"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  FileText,
  Calendar,
  Database,
  Clock,
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

export function RetentionPolicyCard() {
  const form = useFormContext<UpdateSecuritySettingsInput>();

  const PRESETS = [
    { label: "90 Days", days: 90 },
    { label: "180 Days", days: 180 },
    { label: "1 Year", days: 365 },
    { label: "3 Years", days: 1095 },
    { label: "5 Years", days: 1825 },
  ];

  return (
    <Card className="rounded-md border-border/70 bg-card/70 backdrop-blur-xs shadow-xs">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Database className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold font-display">
                Audit Log Retention Policies
              </CardTitle>
              <CardDescription className="text-xs">
                Statutory retention windows for compliance and forensic investigations.
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30">
            UAE Data Compliance
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Security Events Retention */}
          <FormField
            control={form.control}
            name="securityEventsRetention"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-purple-500" />
                    <span>Security Events Retention (Days)</span>
                  </FormLabel>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    ~{(field.value / 365).toFixed(1)} yrs
                  </span>
                </div>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={3650}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    className="font-mono text-sm h-10 rounded-md"
                  />
                </FormControl>
                <div className="flex items-center gap-1 pt-1">
                  {PRESETS.map((p) => (
                    <Button
                      key={p.label}
                      type="button"
                      variant={field.value === p.days ? "default" : "outline"}
                      size="sm"
                      onClick={() => field.onChange(p.days)}
                      className="h-6 px-2 text-[10px] rounded-md"
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
                <FormDescription className="text-[11px]">
                  Retention for SOC incidents, token replays, and lockouts (1 – 3650 days).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 2. Login History Retention */}
          <FormField
            control={form.control}
            name="loginHistoryRetention"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5 text-blue-500" />
                    <span>Login History Retention (Days)</span>
                  </FormLabel>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    ~{(field.value / 365).toFixed(1)} yrs
                  </span>
                </div>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={3650}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    className="font-mono text-sm h-10 rounded-md"
                  />
                </FormControl>
                <div className="flex items-center gap-1 pt-1">
                  {PRESETS.map((p) => (
                    <Button
                      key={p.label}
                      type="button"
                      variant={field.value === p.days ? "default" : "outline"}
                      size="sm"
                      onClick={() => field.onChange(p.days)}
                      className="h-6 px-2 text-[10px] rounded-md"
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
                <FormDescription className="text-[11px]">
                  Historical records of successful user authentications.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 3. Logout History Retention */}
          <FormField
            control={form.control}
            name="logoutHistoryRetention"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5 text-zinc-500" />
                    <span>Logout History Retention (Days)</span>
                  </FormLabel>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    ~{(field.value / 365).toFixed(1)} yrs
                  </span>
                </div>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={3650}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    className="font-mono text-sm h-10 rounded-md"
                  />
                </FormControl>
                <div className="flex items-center gap-1 pt-1">
                  {PRESETS.map((p) => (
                    <Button
                      key={p.label}
                      type="button"
                      variant={field.value === p.days ? "default" : "outline"}
                      size="sm"
                      onClick={() => field.onChange(p.days)}
                      className="h-6 px-2 text-[10px] rounded-md"
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
                <FormDescription className="text-[11px]">
                  Archived session closure and revocation events.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 4. Failed Login Retention */}
          <FormField
            control={form.control}
            name="failedLoginRetention"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-red-500" />
                    <span>Failed Login Retention (Days)</span>
                  </FormLabel>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    ~{(field.value / 365).toFixed(1)} yrs
                  </span>
                </div>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={3650}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    className="font-mono text-sm h-10 rounded-md"
                  />
                </FormControl>
                <div className="flex items-center gap-1 pt-1">
                  {PRESETS.map((p) => (
                    <Button
                      key={p.label}
                      type="button"
                      variant={field.value === p.days ? "default" : "outline"}
                      size="sm"
                      onClick={() => field.onChange(p.days)}
                      className="h-6 px-2 text-[10px] rounded-md"
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
                <FormDescription className="text-[11px]">
                  Suspicious attempt history used for security anomaly models.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
