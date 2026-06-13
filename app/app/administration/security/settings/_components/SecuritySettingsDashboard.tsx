"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Shield, Lock, Activity, Save, RotateCcw, AlertTriangle, FileText } from "lucide-react";

import { useSecuritySettings } from "@/hooks/useSecuritySettings";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { updateSecuritySettingsSchema, UpdateSecuritySettingsInput } from "@/lib/validations/security-settings.schema";

import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { AuthenticationPoliciesCard } from "./sections/AuthenticationPoliciesCard";
import { ConcurrentSessionPolicyCard } from "./sections/ConcurrentSessionPolicyCard";
import { AccountLockoutCard } from "./sections/AccountLockoutCard";
import { RateLimitingCard } from "./sections/RateLimitingCard";
import { ReplayDetectionCard } from "./sections/ReplayDetectionCard";
import { RetentionPolicyCard } from "./sections/RetentionPolicyCard";
import { SecurityMonitoringCard } from "./sections/SecurityMonitoringCard";
import { DangerZoneCard } from "./sections/DangerZoneCard";
import { AuditTrailGrid } from "./sections/AuditTrailGrid";

export function SecuritySettingsDashboard() {
    const { settings, isLoading: isSettingsLoading, isSaving, updateSettings } = useSecuritySettings();
    const { summary, isLoading: isSummaryLoading } = useSecurityMonitoring();

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
            form.reset(settings);
        }
    }, [settings, form]);

    const onSubmit = async (data: any) => {
        const success = await updateSettings(data);
        if (success) {
            toast.success("Security settings updated successfully.");
        }
    };

    if (isSettingsLoading) {
        return <SecuritySettingsSkeleton />;
    }

    const hasUnsavedChanges = form.formState.isDirty;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
                        <p className="text-muted-foreground mt-2 max-w-2xl">
                            Manage authentication policies, session controls, lockout protection, rate limiting, and security monitoring.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                            disabled={!hasUnsavedChanges || isSaving}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Restore Defaults
                        </Button>
                        <Button type="submit" disabled={isSaving || !hasUnsavedChanges}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="authentication" className="space-y-6">
                    <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto gap-2 bg-transparent p-0">
                        <TabsTrigger value="authentication" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card">
                            <Lock className="mr-2 h-4 w-4" />
                            Authentication
                        </TabsTrigger>
                        <TabsTrigger value="sessions" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card">
                            <Shield className="mr-2 h-4 w-4" />
                            Sessions
                        </TabsTrigger>
                        <TabsTrigger value="protection" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Protection
                        </TabsTrigger>
                        <TabsTrigger value="audit" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card">
                            <FileText className="mr-2 h-4 w-4" />
                            Audit & Logs
                        </TabsTrigger>
                        <TabsTrigger value="monitoring" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card">
                            <Activity className="mr-2 h-4 w-4" />
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
