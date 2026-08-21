"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { useSecuritySettings } from "@/hooks/useSecuritySettings";
import { updateSecuritySettingsSchema } from "@/lib/validations/security-settings.schema";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageBarActions } from "@/components/ui/layouts/page-bar-context";

import { AccountLockoutCard } from "./sections/AccountLockoutCard";
import { AuditTrailGrid } from "./sections/AuditTrailGrid";
import { AuthenticationPoliciesCard } from "./sections/AuthenticationPoliciesCard";
import { ConcurrentSessionPolicyCard } from "./sections/ConcurrentSessionPolicyCard";
import { DangerZoneCard } from "./sections/DangerZoneCard";
import { RateLimitingCard } from "./sections/RateLimitingCard";
import { ReplayDetectionCard } from "./sections/ReplayDetectionCard";
import { RetentionPolicyCard } from "./sections/RetentionPolicyCard";
import { SecurityMonitoringCard } from "./sections/SecurityMonitoringCard";

export function SecuritySettingsDashboard() {
    const { settings, isLoading: isSettingsLoading, isSaving, updateSettings } = useSecuritySettings();
    const { summary, isLoading: isSummaryLoading } = useSecurityMonitoring();
    const [activeTab, setActiveTab] = useState("authentication");

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

    useEffect(() => {
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
            });
        }
    }, [settings, form]);

    const onSubmit = async (values: any) => {
        try {
            await updateSettings(values);
            toast.success("Security settings successfully updated");
            form.reset(values);
        } catch (error) {
            toast.error("Failed to update security settings");
        }
    };

    const hasUnsavedChanges = form.formState.isDirty;

    if (isSettingsLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <PageBarActions>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => form.reset()}
                            disabled={!hasUnsavedChanges || isSaving}
                            className="gap-1.5 h-9 text-xs rounded-lg cursor-pointer"
                        >
                            <Icon icon="mdi:restore" className="w-3.5 h-3.5" />
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSaving || !hasUnsavedChanges}
                            className="gap-1.5 h-9 text-xs font-semibold rounded-lg cursor-pointer"
                        >
                            <Icon icon="mdi:content-save-outline" className="w-3.5 h-3.5" />
                            {isSaving ? "Saving..." : "Save Settings"}
                        </Button>
                    </div>
                </PageBarActions>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 overflow-x-auto overflow-y-hidden flex-nowrap">
                        <TabsTrigger
                            value="authentication"
                            className="relative flex items-center gap-2 h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            <Icon icon="mdi:lock-outline" className="h-4 w-4" />
                            Authentication
                        </TabsTrigger>
                        <TabsTrigger
                            value="sessions"
                            className="relative flex items-center gap-2 h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            <Icon icon="mdi:shield-account-outline" className="h-4 w-4" />
                            Sessions
                        </TabsTrigger>
                        <TabsTrigger
                            value="protection"
                            className="relative flex items-center gap-2 h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            <Icon icon="mdi:alert-shield-outline" className="h-4 w-4" />
                            Protection
                        </TabsTrigger>
                        <TabsTrigger
                            value="audit"
                            className="relative flex items-center gap-2 h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            <Icon icon="mdi:text-box-search-outline" className="h-4 w-4" />
                            Audit & Logs
                        </TabsTrigger>
                        <TabsTrigger
                            value="monitoring"
                            className="relative flex items-center gap-2 h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            <Icon icon="mdi:monitor-dashboard" className="h-4 w-4" />
                            Monitoring
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="authentication" className="space-y-6 outline-none">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-6">
                                <AuthenticationPoliciesCard />
                            </div>
                            <div className="space-y-6">
                                <AccountLockoutCard />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="sessions" className="space-y-6 outline-none">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-6">
                                <ConcurrentSessionPolicyCard summary={summary} />
                            </div>
                            <div className="space-y-6">
                                <DangerZoneCard summary={summary} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="protection" className="space-y-6 outline-none">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-6">
                                <ReplayDetectionCard />
                            </div>
                            <div className="space-y-6">
                                <RateLimitingCard />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="audit" className="space-y-6 outline-none">
                        <RetentionPolicyCard />
                        <AuditTrailGrid />
                    </TabsContent>

                    <TabsContent value="monitoring" className="space-y-6 outline-none">
                        <SecurityMonitoringCard summary={summary} isLoading={isSummaryLoading} />
                    </TabsContent>
                </Tabs>
            </form>
        </Form>
    );
}

function SecuritySettingsSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-[400px] w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        </div>
    );
}
