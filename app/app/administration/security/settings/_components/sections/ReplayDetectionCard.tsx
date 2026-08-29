"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  ShieldAlert,
  Zap,
  RotateCcw,
  FileText,
  UserX,
  AlertTriangle,
  CheckCircle2,
  Shield,
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
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { UpdateSecuritySettingsInput } from "@/lib/validations/security-settings.schema";
import { cn } from "@/lib/utils";

export function ReplayDetectionCard() {
  const form = useFormContext<UpdateSecuritySettingsInput>();
  const isDetectionEnabled = form.watch("enableReplayDetection");

  return (
    <Card className="rounded-md border-border/70 bg-card/70 backdrop-blur-xs shadow-xs">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <ShieldAlert className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold font-display">
                Refresh Token Replay Detection
              </CardTitle>
              <CardDescription className="text-xs">
                Mitigate token theft, replay injection, and session hijacking attacks.
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-semibold",
              isDetectionEnabled
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30"
            )}
          >
            {isDetectionEnabled ? "Active & Enforced" : "Disabled"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Main Master Switch */}
        <FormField
          control={form.control}
          name="enableReplayDetection"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md border border-border/70 bg-background/50 p-4 transition-all hover:bg-background/80">
              <div className="space-y-0.5 max-w-[80%]">
                <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Zap className="size-4 text-amber-500" />
                  <span>Enable Zero-Trust Replay Detection</span>
                </FormLabel>
                <FormDescription className="text-[11px] leading-relaxed">
                  Immediately flags attempts to redeem already-rotated refresh tokens, indicating a stolen token in transit.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Dynamic Multi-Layer Action Matrix */}
        {isDetectionEnabled ? (
          <div className="space-y-4 rounded-md border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-900 dark:text-red-200">
              <Shield className="size-4 text-red-600 dark:text-red-400" />
              <span>Automated Immediate Countermeasures</span>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-1">
              {/* Action 1: Revoke Session */}
              <FormField
                control={form.control}
                name="replayActionRevoke"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border/60 bg-background/80 p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <RotateCcw className="size-3.5 text-red-500" />
                        <span>Revoke Compromised Session Immediately</span>
                      </FormLabel>
                      <FormDescription className="text-[11px] leading-relaxed text-muted-foreground">
                        Invalidates the associated token lineage and rejects further requests from this session ID.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {/* Action 2: Log Security Event */}
              <FormField
                control={form.control}
                name="replayActionLog"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border/60 bg-background/80 p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <FileText className="size-3.5 text-blue-500" />
                        <span>Dispatch Critical Security Audit Event</span>
                      </FormLabel>
                      <FormDescription className="text-[11px] leading-relaxed text-muted-foreground">
                        Records an immutable `REFRESH_TOKEN_REPLAY` incident in the SOC event feed.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {/* Action 3: Force Logout User */}
              <FormField
                control={form.control}
                name="replayActionLogout"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border/60 bg-background/80 p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <UserX className="size-3.5 text-orange-500" />
                        <span>Force Complete User Sign-Out Across All Devices</span>
                      </FormLabel>
                      <FormDescription className="text-[11px] leading-relaxed text-muted-foreground">
                        Terminates every session for the affected user, requiring full multi-factor re-authentication.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-md border border-border/70 bg-muted/30 text-xs text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-500 shrink-0" />
            <span>Replay detection is disabled. Reused tokens will not be automatically blocked.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
