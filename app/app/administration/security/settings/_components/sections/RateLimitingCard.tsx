"use client";

import * as React from "react";
import {
  Gauge,
  Sliders,
  Shield,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface RateLimitPolicy {
  endpoint: string;
  category: string;
  limit: number;
  windowMinutes: number;
  burstAllowance: number;
  status: "ACTIVE" | "STRICT";
}

const DEFAULT_RATE_LIMITS: RateLimitPolicy[] = [
  { endpoint: "/api/auth/login", category: "Authentication", limit: 10, windowMinutes: 5, burstAllowance: 3, status: "STRICT" },
  { endpoint: "/api/auth/refresh", category: "Token Cycle", limit: 30, windowMinutes: 5, burstAllowance: 5, status: "ACTIVE" },
  { endpoint: "/api/auth/logout", category: "Session Term", limit: 60, windowMinutes: 5, burstAllowance: 10, status: "ACTIVE" },
  { endpoint: "/api/internal/security/*", category: "SOC & Security", limit: 100, windowMinutes: 5, burstAllowance: 20, status: "ACTIVE" },
  { endpoint: "/api/authorization/*", category: "IAM & Admin", limit: 50, windowMinutes: 5, burstAllowance: 10, status: "ACTIVE" },
  { endpoint: "/api/organization/*", category: "Master Data", limit: 80, windowMinutes: 5, burstAllowance: 15, status: "ACTIVE" },
];

export function RateLimitingCard() {
  const [limits, setLimits] = React.useState<RateLimitPolicy[]>(DEFAULT_RATE_LIMITS);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState<"strict" | "balanced" | "dev">("strict");

  const applyPreset = (preset: "strict" | "balanced" | "dev") => {
    setSelectedPreset(preset);
    if (preset === "strict") {
      setLimits([
        { endpoint: "/api/auth/login", category: "Authentication", limit: 5, windowMinutes: 5, burstAllowance: 2, status: "STRICT" },
        { endpoint: "/api/auth/refresh", category: "Token Cycle", limit: 20, windowMinutes: 5, burstAllowance: 4, status: "STRICT" },
        { endpoint: "/api/auth/logout", category: "Session Term", limit: 40, windowMinutes: 5, burstAllowance: 8, status: "ACTIVE" },
        { endpoint: "/api/internal/security/*", category: "SOC & Security", limit: 60, windowMinutes: 5, burstAllowance: 10, status: "ACTIVE" },
        { endpoint: "/api/authorization/*", category: "IAM & Admin", limit: 30, windowMinutes: 5, burstAllowance: 5, status: "ACTIVE" },
        { endpoint: "/api/organization/*", category: "Master Data", limit: 50, windowMinutes: 5, burstAllowance: 10, status: "ACTIVE" },
      ]);
    } else if (preset === "balanced") {
      setLimits(DEFAULT_RATE_LIMITS);
    } else {
      setLimits([
        { endpoint: "/api/auth/login", category: "Authentication", limit: 50, windowMinutes: 1, burstAllowance: 20, status: "ACTIVE" },
        { endpoint: "/api/auth/refresh", category: "Token Cycle", limit: 100, windowMinutes: 1, burstAllowance: 30, status: "ACTIVE" },
        { endpoint: "/api/auth/logout", category: "Session Term", limit: 120, windowMinutes: 1, burstAllowance: 40, status: "ACTIVE" },
        { endpoint: "/api/internal/security/*", category: "SOC & Security", limit: 200, windowMinutes: 1, burstAllowance: 50, status: "ACTIVE" },
        { endpoint: "/api/authorization/*", category: "IAM & Admin", limit: 150, windowMinutes: 1, burstAllowance: 30, status: "ACTIVE" },
        { endpoint: "/api/organization/*", category: "Master Data", limit: 200, windowMinutes: 1, burstAllowance: 50, status: "ACTIVE" },
      ]);
    }
  };

  const handleSaveThresholds = () => {
    setIsEditorOpen(false);
    toast.success("Rate limiting thresholds successfully updated and applied.");
  };

  return (
    <>
      <Card className="rounded-md border-border/70 bg-card/70 backdrop-blur-xs shadow-xs">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Gauge className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold font-display">
                  API Rate Limiting & Throttling
                </CardTitle>
                <CardDescription className="text-xs">
                  Guard edge endpoints against denial-of-service and brute-force traffic spikes.
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditorOpen(true)}
              className="h-8 px-3 text-xs gap-1.5 rounded-md font-semibold cursor-pointer"
            >
              <Sliders className="size-3.5 text-muted-foreground" />
              <span>Configure Thresholds</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <div className="rounded-md border border-border/70 overflow-hidden bg-background/50">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Protected Endpoint</TableHead>
                  <TableHead className="text-xs font-semibold">Category</TableHead>
                  <TableHead className="text-xs font-semibold">Rate Threshold</TableHead>
                  <TableHead className="text-xs font-semibold">Window</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Policy Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {limits.map((item) => (
                  <TableRow key={item.endpoint} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {item.endpoint}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.category}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      <span className="font-mono">{item.limit}</span> reqs (+{item.burstAllowance} burst)
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {item.windowMinutes} min
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          item.status === "STRICT"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                        }
                      >
                        {item.status === "STRICT" ? "Strict Filter" : "Active"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Interactive Rate Limit Editor Dialog ── */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-lg rounded-md p-6">
          <DialogHeader className="space-y-2">
            <div className="size-10 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sliders className="size-5" />
            </div>
            <DialogTitle className="text-lg font-bold font-display">
              Configure Rate Limiting Tiers
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Select an optimized defense profile or adjust burst tolerances for DIEZ gateway proxies.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={selectedPreset === "strict" ? "default" : "outline"}
                size="sm"
                onClick={() => applyPreset("strict")}
                className="h-14 flex-col gap-1 rounded-md text-xs"
              >
                <Shield className="size-4" />
                <span>Strict Gov Tier</span>
              </Button>

              <Button
                type="button"
                variant={selectedPreset === "balanced" ? "default" : "outline"}
                size="sm"
                onClick={() => applyPreset("balanced")}
                className="h-14 flex-col gap-1 rounded-md text-xs"
              >
                <CheckCircle2 className="size-4" />
                <span>Balanced Default</span>
              </Button>

              <Button
                type="button"
                variant={selectedPreset === "dev" ? "default" : "outline"}
                size="sm"
                onClick={() => applyPreset("dev")}
                className="h-14 flex-col gap-1 rounded-md text-xs"
              >
                <Gauge className="size-4" />
                <span>High-Throughput</span>
              </Button>
            </div>

            <div className="p-3.5 rounded-md bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Info className="size-3.5 text-primary" />
                <span>Selected Profile: {selectedPreset === "strict" ? "Strict Government Compliance" : selectedPreset === "balanced" ? "Standard Balanced Protection" : "High-Throughput Load"}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Applies edge sliding-window counters with Redis token buckets. Violations yield RFC 7807 `429 Too Many Requests` responses with `Retry-After` headers.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditorOpen(false)}
              className="rounded-md text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveThresholds}
              className="rounded-md text-xs h-9 font-semibold"
            >
              Apply Thresholds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
