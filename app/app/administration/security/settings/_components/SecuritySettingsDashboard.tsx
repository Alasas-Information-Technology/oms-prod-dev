"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ShieldCheck,
  KeyRound,
  Laptop,
  ShieldAlert,
  History,
  Activity,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { useSecuritySettings } from "@/hooks/useSecuritySettings";
import {
  updateSecuritySettingsSchema,
  UpdateSecuritySettingsInput,
} from "@/lib/validations/security-settings.schema";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageBarActions, usePageBar } from "@/components/ui/layouts/page-bar-context";

import { AuthenticationPoliciesCard } from "./sections/AuthenticationPoliciesCard";
import { ConcurrentSessionPolicyCard } from "./sections/ConcurrentSessionPolicyCard";
import { ReplayDetectionCard } from "./sections/ReplayDetectionCard";
import { RateLimitingCard } from "./sections/RateLimitingCard";
import { RetentionPolicyCard } from "./sections/RetentionPolicyCard";
import { AuditTrailGrid } from "./sections/AuditTrailGrid";
import { DangerZoneCard } from "./sections/DangerZoneCard";
import { SecurityMonitoringCard } from "./sections/SecurityMonitoringCard";

export function SecuritySettingsDashboard() {
  const { setCustomCrumbs } = usePageBar();
  const { settings, isLoading: isSettingsLoading, isSaving, updateSettings } = useSecuritySettings();
  const { summary, isLoading: isSummaryLoading } = useSecurityMonitoring();
  const [activeTab, setActiveTab] = React.useState("authentication");

  // Set explicit breadcrumb on mount
  React.useEffect(() => {
    setCustomCrumbs([
      { label: "Administration", href: "/app/administration" },
      { label: "Security", href: "/app/administration/security-dashboard" },
      { label: "Security Settings", isCurrent: true },
    ]);
    return () => setCustomCrumbs(null);
  }, [setCustomCrumbs]);

  const form = useForm({
    resolver: zodResolver(updateSecuritySettingsSchema),
    defaultValues: {
      maxConcurrentSessions: 3,
      allowMultipleSessions: false,
      autoRevokeOldestSession: false,
      accessTokenLifetime: 15,
      refreshTokenLifetime: 30,
      requireSessionFingerprinting: false,
      maxFailedLoginAttempts: 5,
      lockoutDuration: 30,
      enableReplayDetection: true,
      replayActionRevoke: true,
      replayActionLog: true,
      replayActionLogout: true,
      securityEventsRetention: 365,
      loginHistoryRetention: 365,
      logoutHistoryRetention: 365,
      failedLoginRetention: 180,
    },
  });

  React.useEffect(() => {
    if (settings) {
      form.reset({
        maxConcurrentSessions: settings.maxConcurrentSessions,
        allowMultipleSessions: settings.allowMultipleSessions,
        autoRevokeOldestSession: settings.autoRevokeOldestSession,
        accessTokenLifetime: settings.accessTokenLifetime,
        refreshTokenLifetime: settings.refreshTokenLifetime,
        requireSessionFingerprinting: settings.requireSessionFingerprinting,
        maxFailedLoginAttempts: settings.maxFailedLoginAttempts,
        lockoutDuration: settings.lockoutDuration,
        enableReplayDetection: settings.enableReplayDetection,
        replayActionRevoke: settings.replayActionRevoke,
        replayActionLog: settings.replayActionLog,
        replayActionLogout: settings.replayActionLogout,
        securityEventsRetention: settings.securityEventsRetention,
        loginHistoryRetention: settings.loginHistoryRetention,
        logoutHistoryRetention: settings.logoutHistoryRetention,
        failedLoginRetention: settings.failedLoginRetention ?? 180,
      });
    }
  }, [settings, form]);

  const onSubmit = async (values: any) => {
    try {
      await updateSettings(values as UpdateSecuritySettingsInput);
      toast.success("Security administration policies successfully updated.");
      form.reset(values);
    } catch (error) {
      toast.error("Failed to update security administration policies.");
    }
  };

  const hasUnsavedChanges = form.formState.isDirty;
  const dirtyFieldsCount = Object.keys(form.formState.dirtyFields).length;

  if (isSettingsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80 rounded-md" />
          <Skeleton className="h-80 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Page Bar Portal Actions ── */}
        <PageBarActions>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge
                variant="outline"
                className="h-7 px-2.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 animate-pulse hidden sm:inline-flex"
              >
                {dirtyFieldsCount} unsaved {dirtyFieldsCount === 1 ? "change" : "changes"}
              </Badge>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => form.reset()}
              disabled={!hasUnsavedChanges || isSaving}
              className="h-9 px-3 gap-1.5 text-xs font-semibold rounded-md bg-background/80 hover:bg-background border-border/70 shadow-2xs transition-all disabled:opacity-40 cursor-pointer"
            >
              <RotateCcw className="size-3.5 text-muted-foreground" />
              <span>Discard</span>
            </Button>

            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSaving || !hasUnsavedChanges}
              className="h-9 px-3.5 gap-1.5 text-xs font-semibold rounded-md shadow-xs transition-all cursor-pointer disabled:opacity-40"
            >
              <CheckCircle2 className="size-3.5" />
              <span>{isSaving ? "Saving..." : "Save Policies"}</span>
            </Button>
          </div>
        </PageBarActions>

        {/* ── Executive Hero Banner ── */}
        <div className="rounded-lg border border-primary/10 bg-linear-to-r from-primary/10 via-primary/5 to-background p-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-primary/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="size-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl md:text-2xl font-bold font-display text-foreground tracking-tight">
                    Security Administration & Access Governance
                  </h1>
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-semibold">
                    SOC Enforced
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                  Configure organization-wide token lifecycles, multi-device limits, brute-force
                  lockout heuristics, zero-trust token replay defenses, and audit log retention.
                </p>
              </div>
            </div>

            {/* Quick Status Badges */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right hidden lg:block bg-background/50 p-2.5 rounded-lg border border-border/50 backdrop-blur-md">
                <span className="text-[11px] font-bold text-foreground block">
                  UAE Cyber Compliance
                </span>
                <span className="text-[10px] text-muted-foreground">
                  ISO 27001 / NESA Aligned
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabbed Navigation ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden flex-nowrap">
            <TabsTrigger
              value="authentication"
              className="flex items-center gap-2"
            >
              <KeyRound className="size-3.5 text-primary" />
              <span>Authentication & Tokens</span>
            </TabsTrigger>

            <TabsTrigger
              value="sessions"
              className="flex items-center gap-2"
            >
              <Laptop className="size-3.5 text-blue-500" />
              <span>Session Controls</span>
            </TabsTrigger>

            <TabsTrigger
              value="protection"
              className="flex items-center gap-2"
            >
              <ShieldAlert className="size-3.5 text-red-500" />
              <span>Threat Defense & Rate Limits</span>
            </TabsTrigger>

            <TabsTrigger
              value="audit"
              className="flex items-center gap-2"
            >
              <History className="size-3.5 text-purple-500" />
              <span>Audit & Retention</span>
            </TabsTrigger>

            <TabsTrigger
              value="monitoring"
              className="flex items-center gap-2"
            >
              <Activity className="size-3.5 text-emerald-500" />
              <span>System Health & Danger Vault</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Authentication */}
          <TabsContent value="authentication" className="space-y-6 outline-none">
            <AuthenticationPoliciesCard />
          </TabsContent>

          {/* Tab 2: Sessions */}
          <TabsContent value="sessions" className="space-y-6 outline-none">
            <ConcurrentSessionPolicyCard summary={summary} />
          </TabsContent>

          {/* Tab 3: Threat Protection */}
          <TabsContent value="protection" className="space-y-6 outline-none">
            <ReplayDetectionCard />
            <RateLimitingCard />
          </TabsContent>

          {/* Tab 4: Audit & Retention */}
          <TabsContent value="audit" className="space-y-6 outline-none">
            <RetentionPolicyCard />
            <AuditTrailGrid />
          </TabsContent>

          {/* Tab 5: Monitoring & Danger Vault */}
          <TabsContent value="monitoring" className="space-y-6 outline-none">
            <SecurityMonitoringCard summary={summary} isLoading={isSummaryLoading} />
            <DangerZoneCard summary={summary} />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
