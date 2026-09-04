"use client";

import * as React from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  AlertOctagon,
  Download,
  LogOut,
  ShieldAlert,
  FileJson,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SecurityDashboardDto } from "@/lib/types/security.types";

interface Props {
  summary: SecurityDashboardDto | null;
}

export function DangerZoneCard({ summary }: Props) {
  const [isRevoking, setIsRevoking] = React.useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");

  const handleForceLogoutAll = async () => {
    if (confirmText !== "TERMINATE-ALL") {
      toast.error('Please type "TERMINATE-ALL" to confirm emergency revocation.');
      return;
    }

    try {
      setIsRevoking(true);
      await axios.post("/api/internal/security/sessions/revoke-all");
      toast.success("Emergency action complete: All active sessions have been terminated.");
      setIsConfirmOpen(false);
      setConfirmText("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to force logout all users.");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleGenerateSnapshot = () => {
    if (!summary) {
      toast.error("Security dashboard metrics are still initializing.");
      return;
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      governanceScope: "DIEZ Enterprise Security Administration",
      metrics: summary,
      systemStatus: "ONLINE",
    };

    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `diez-security-snapshot-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    toast.success("Security configuration and audit snapshot downloaded.");
  };

  return (
    <>
      <Card className="rounded-md border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10 shadow-xs">
        <CardHeader className="pb-4 border-b border-red-200/60 dark:border-red-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center">
                <AlertOctagon className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold font-display text-red-700 dark:text-red-400">
                  Emergency Security Operations Vault
                </CardTitle>
                <CardDescription className="text-xs text-red-600/80 dark:text-red-400/80">
                  High-impact administrative interventions that instantly terminate active user access.
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-semibold bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30"
            >
              Strict Isolation
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* Action 1: Mass Session Revocation */}
          <div className="p-4 rounded-md border border-red-200 dark:border-red-900/60 bg-background/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <LogOut className="size-3.5 text-red-600" />
                <span>Global Emergency Session Revocation</span>
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Immediately invalidates all active user and service sessions across the entire DIEZ
                network, forcing all users to re-authenticate with primary credentials.
              </p>
            </div>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmText("");
                setIsConfirmOpen(true);
              }}
              className="rounded-md text-xs h-9 font-semibold shrink-0 cursor-pointer"
            >
              <ShieldAlert className="size-3.5 mr-1.5" />
              <span>Force Logout All</span>
            </Button>
          </div>

          {/* Action 2: Audit Snapshot Generator */}
          <div className="p-4 rounded-md border border-border/70 bg-background/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileJson className="size-3.5 text-primary" />
                <span>Generate Cryptographic Audit Snapshot</span>
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Export current live security telemetry, active policy matrices, and threat counters to
                a timestamped JSON artifact for internal governance review.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateSnapshot}
              className="rounded-md text-xs h-9 font-semibold shrink-0 cursor-pointer"
            >
              <Download className="size-3.5 mr-1.5 text-muted-foreground" />
              <span>Export Snapshot</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Emergency Confirmation Modal ── */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-md p-6">
          <DialogHeader className="space-y-2">
            <div className="size-10 rounded-md bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertOctagon className="size-5" />
            </div>
            <DialogTitle className="text-lg font-bold font-display text-red-600 dark:text-red-400">
              Confirm Mass Session Revocation
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              This destructive command terminates all active sessions in the database immediately.
              All logged-in staff and vendors will be signed out at their next request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold text-foreground block">
              Type <span className="font-mono text-red-600 font-bold">TERMINATE-ALL</span> below to authorize:
            </label>
            <Input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="TERMINATE-ALL"
              className="font-mono text-xs h-10 rounded-md"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
              className="rounded-md text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={confirmText !== "TERMINATE-ALL" || isRevoking}
              onClick={handleForceLogoutAll}
              className="rounded-md text-xs h-9 font-semibold"
            >
              {isRevoking ? "Revoking Sessions..." : "Authorize Mass Revocation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
