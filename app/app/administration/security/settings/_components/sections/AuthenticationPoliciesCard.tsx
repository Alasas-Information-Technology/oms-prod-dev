"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  KeyRound,
  Clock,
  Fingerprint,
  Users,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Lock,
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UpdateSecuritySettingsInput } from "@/lib/validations/security-settings.schema";
import { cn } from "@/lib/utils";

export function AuthenticationPoliciesCard() {
  const form = useFormContext<UpdateSecuritySettingsInput>();

  const attempts = form.watch("maxFailedLoginAttempts");
  const duration = form.watch("lockoutDuration");

  return (
    <div className="space-y-6">
      {/* ── 1. Token Lifecycles Card ── */}
      <Card className="rounded-md border-border/70 bg-card/70 backdrop-blur-xs shadow-xs">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <KeyRound className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold font-display">
                  Token Lifecycles & Encryption
                </CardTitle>
                <CardDescription className="text-xs">
                  Govern JWT token expiry windows and automated refresh behaviors.
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold bg-primary/5 text-primary border-primary/20">
              JWT HMAC-SHA256
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Access Token Lifetime */}
          <FormField
            control={form.control}
            name="accessTokenLifetime"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span>Access Token Lifetime (Minutes)</span>
                  </FormLabel>
                  <div className="flex items-center gap-1">
                    {[15, 30, 45, 60].map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant={field.value === preset ? "default" : "outline"}
                        size="sm"
                        onClick={() => field.onChange(preset)}
                        className="h-6 px-2 text-[11px] rounded-md"
                      >
                        {preset}m
                      </Button>
                    ))}
                  </div>
                </div>
                <FormControl>
                  <Input
                    type="number"
                    min={5}
                    max={60}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    className="font-mono text-sm h-10 rounded-md"
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Duration a short-lived access token remains valid before requiring a refresh token rotation (5 – 60 mins).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Refresh Token Lifetime */}
          <FormField
            control={form.control}
            name="refreshTokenLifetime"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span>Refresh Token Lifetime (Days)</span>
                  </FormLabel>
                  <div className="flex items-center gap-1">
                    {[7, 14, 30, 90].map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant={field.value === preset ? "default" : "outline"}
                        size="sm"
                        onClick={() => field.onChange(preset)}
                        className="h-6 px-2 text-[11px] rounded-md"
                      >
                        {preset}d
                      </Button>
                    ))}
                  </div>
                </div>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={90}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    className="font-mono text-sm h-10 rounded-md"
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Maximum inactivity window before the user must re-authenticate with primary credentials (1 – 90 days).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Device Fingerprinting Toggle */}
          <FormField
            control={form.control}
            name="requireSessionFingerprinting"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border border-border/70 bg-background/50 p-4 transition-all hover:bg-background/80">
                <div className="space-y-0.5 max-w-[80%]">
                  <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Fingerprint className="size-4 text-indigo-500" />
                    <span>Enforce Device & Client Fingerprinting</span>
                  </FormLabel>
                  <FormDescription className="text-[11px] leading-relaxed">
                    Binds session tokens to client user-agent and TLS signature. Rejects token requests from hijacked environments.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Multiple Concurrent Sessions Toggle */}
          <FormField
            control={form.control}
            name="allowMultipleSessions"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border border-border/70 bg-background/50 p-4 transition-all hover:bg-background/80">
                <div className="space-y-0.5 max-w-[80%]">
                  <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Users className="size-4 text-emerald-500" />
                    <span>Allow Simultaneous Multi-Device Sign-in</span>
                  </FormLabel>
                  <FormDescription className="text-[11px] leading-relaxed">
                    Permits concurrent authenticated logins across desktop, tablet, and mobile clients within policy limits.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* ── 2. Account Lockout Defenses Card ── */}
      <Card className="rounded-md border-border/70 bg-card/70 backdrop-blur-xs shadow-xs">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Lock className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold font-display">
                  Account Lockout & Brute-Force Defenses
                </CardTitle>
                <CardDescription className="text-xs">
                  Automated safeguards against credential stuffing and repetitive password guessing.
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">
              Active Defense
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="maxFailedLoginAttempts"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Max Failed Attempts
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      className="font-mono text-sm h-10 rounded-md"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    Failure threshold before temporary lockout.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lockoutDuration"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Lockout Duration (Minutes)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={1440}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      className="font-mono text-sm h-10 rounded-md"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    Cool-off period before retry is unlocked.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Live Simulator Preview Banner */}
          <div className="p-4 rounded-md border border-amber-300 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-2xs">
            <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">Live Enforcement Simulation:</span>
              <p className="leading-relaxed text-amber-800 dark:text-amber-300 text-[11px]">
                Upon recording <strong>{attempts} consecutive failed login attempts</strong>, the target
                account will be locked for <strong>{duration} minutes</strong>. Administrators can
                manually unlock accounts in the User Administration console.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
