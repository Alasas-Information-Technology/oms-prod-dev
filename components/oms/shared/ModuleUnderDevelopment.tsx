"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Construction,
  ArrowLeft,
  LayoutDashboard,
  FileText,
  Bell,
  CheckCircle2,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ModuleFeature {
  title: string;
  description: string;
}

export interface ModuleUnderDevelopmentProps {
  moduleName: string;
  category?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  targetRelease?: string;
  features?: ModuleFeature[];
  className?: string;
}

export function ModuleUnderDevelopment({
  moduleName,
  category = "Operations",
  description = "This module is actively being engineered as part of the DIEZ Enterprise Outsource Management System rollout.",
  icon: Icon = Construction,
  targetRelease = "Target Release: Q4 2026",
  features = [
    {
      title: "Automated Governance & Validation",
      description: "End-to-end policy enforcement aligned with UAE government procurement standards.",
    },
    {
      title: "Real-Time Enterprise Integrations",
      description: "Live synchronization with ERP, Active Directory, and Financial Ledgers.",
    },
    {
      title: "Digital Workflow Orchestration",
      description: "Automated authority delegation, multi-tier approvals, and immutable audit trails.",
    },
  ],
  className,
}: ModuleUnderDevelopmentProps) {
  const router = useRouter();
  const [subscribed, setSubscribed] = React.useState(false);

  const handleNotify = () => {
    setSubscribed(true);
    toast.success("Notification Preference Saved", {
      description: `You will be notified when ${moduleName} is released for your organization.`,
    });
  };

  return (
    <div className={cn("p-6 sm:p-8 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in-50 duration-300", className)}>
      {/* Top Banner Card */}
      <div className="relative rounded-2xl border border-border/80 bg-card p-6 sm:p-8 md:p-10 shadow-sm overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="size-14 sm:size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xs">
              <Icon className="size-7 sm:size-8" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {category}
                </span>
                <span className="size-1 rounded-full bg-muted-foreground/40" />
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  In Active Development
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {moduleName}
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-muted/40 border border-border/60 text-xs font-medium text-muted-foreground">
              <Calendar className="size-4 text-primary" />
              <span>{targetRelease}</span>
            </div>

            <Button
              variant={subscribed ? "outline" : "default"}
              size="sm"
              onClick={handleNotify}
              disabled={subscribed}
              className="gap-2 h-9 text-xs rounded-xl shadow-xs"
            >
              {subscribed ? (
                <>
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>Subscribed to Updates</span>
                </>
              ) : (
                <>
                  <Bell className="size-3.5" />
                  <span>Notify on Release</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Planned Capabilities Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="text-base font-bold text-foreground tracking-tight">
            Planned Capabilities & Specifications
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feat, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-border/70 bg-card/80 hover:bg-card hover:border-primary/30 transition-all duration-200 shadow-2xs space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  0{i + 1}
                </div>
                <h3 className="text-sm font-bold text-foreground leading-snug">
                  {feat.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                <span>In Scope</span>
                <CheckCircle2 className="size-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access Redirect Strip */}
      <div className="p-6 rounded-2xl border border-border/70 bg-muted/25 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 text-center sm:text-left">
          <p className="text-sm font-bold text-foreground">
            Looking for active operational workspaces?
          </p>
          <p className="text-xs text-muted-foreground">
            You can continue managing requisitions, budgets, and workforce requests in the active modules.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="h-9 px-3.5 text-xs rounded-xl shadow-2xs gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>Go Back</span>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 px-3.5 text-xs rounded-xl shadow-2xs gap-1.5"
          >
            <Link href="/app/requests">
              <FileText className="size-3.5" />
              <span>OMS Requests</span>
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="h-9 px-4 text-xs rounded-xl shadow-xs gap-1.5 font-semibold"
          >
            <Link href="/app">
              <LayoutDashboard className="size-3.5" />
              <span>Dashboard</span>
              <ArrowUpRight className="size-3" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
