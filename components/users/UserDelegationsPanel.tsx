"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Users,
  Calendar,
  Clock,
  Trash2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IDelegationDto } from "@/lib/types/authorization.types";
import { usePermission } from "@/hooks/usePermission";
import { useCancelDelegation } from "@/hooks/useAuthorization";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserDelegationsPanelProps {
  userId: string;
  userName?: string;
  delegations: IDelegationDto[];
  onOpenCreateDialog?: () => void;
}

export function UserDelegationsPanel({
  userId,
  userName = "this user",
  delegations,
  onOpenCreateDialog,
}: UserDelegationsPanelProps) {
  const { can } = usePermission();
  const [delegationToCancel, setDelegationToCancel] = React.useState<IDelegationDto | null>(null);

  const cancelMutation = useCancelDelegation();

  const handleCancel = async () => {
    if (!delegationToCancel) return;
    try {
      await cancelMutation.mutateAsync(delegationToCancel.delegationId);
      toast.success("Standing-in arrangement cancelled successfully.");
      setDelegationToCancel(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to cancel delegation");
    }
  };

  const standingInForOthers = delegations.filter((d) => d.toUserId === userId);
  const othersStandingIn = delegations.filter((d) => d.fromUserId === userId);

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Delegations
          </CardTitle>
          <CardDescription>
            Temporary delegation arrangements. When acting on behalf of a colleague, actions record both the acting user and original authority.
          </CardDescription>
        </div>
        {can("USER.DELEGATION.MANAGE") && onOpenCreateDialog && (
          <Button onClick={onOpenCreateDialog} size="sm" className="gap-1.5 shadow-xs h-9 text-xs">
            <Plus className="size-3.5" />
            Add delegation arrangement
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Warning Banner (§Part 3.8) */}
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/30 flex items-start gap-3 text-xs">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-900 dark:text-amber-300">
              Authority notice
            </p>
            <p className="text-amber-800/90 dark:text-amber-400 leading-relaxed">
              They&apos;ll be able to do everything {userName} can do while standing in.
            </p>
          </div>
        </div>

        {delegations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border rounded-xl border-dashed bg-muted/20">
            <Users className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-foreground">No active standing-in arrangements</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              This person currently operates solely under their own assigned roles and permissions.
            </p>
            {can("USER.DELEGATION.MANAGE") && onOpenCreateDialog && (
              <Button onClick={onOpenCreateDialog} variant="outline" size="sm" className="mt-4 gap-1.5 text-xs">
                <Plus className="size-3.5" />
                Add standing-in arrangement
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Standing in for colleagues */}
            {standingInForOthers.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                  Standing in for colleagues ({standingInForOthers.length})
                </h4>
                <div className="space-y-3">
                  {standingInForOthers.map((del) => (
                    <DelegationRow
                      key={del.delegationId}
                      del={del}
                      label={`Standing in for ${del.fromUserName || del.fromUserId}`}
                      canManage={can("USER.DELEGATION.MANAGE")}
                      onCancel={() => setDelegationToCancel(del)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Colleagues standing in for this user */}
            {othersStandingIn.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                  Colleagues standing in for {userName} ({othersStandingIn.length})
                </h4>
                <div className="space-y-3">
                  {othersStandingIn.map((del) => (
                    <DelegationRow
                      key={del.delegationId}
                      del={del}
                      label={`${del.toUserName || del.toUserId} standing in`}
                      canManage={can("USER.DELEGATION.MANAGE")}
                      onCancel={() => setDelegationToCancel(del)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog
          open={Boolean(delegationToCancel)}
          onOpenChange={(o) => !o && setDelegationToCancel(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End standing-in arrangement?</AlertDialogTitle>
              <AlertDialogDescription>
                Ending this arrangement will immediately revoke delegated permissions. All actions performed during the active window remain preserved in the audit trail.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                End arrangement
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

function safeFormatDate(d?: string | Date | null): string {
  if (!d) return "—";
  try {
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? "—" : format(parsed, "d MMM yyyy");
  } catch {
    return "—";
  }
}

function DelegationRow({
  del,
  label,
  canManage,
  onCancel,
}: {
  del: IDelegationDto;
  label: string;
  canManage: boolean;
  onCancel: () => void;
}) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        del.isActive
          ? "bg-card border-border/80 shadow-2xs"
          : "bg-muted/30 border-border/40 opacity-75"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{label}</span>
            {del.isActive ? (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs"
              >
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Ended
              </Badge>
            )}
          </div>
          {del.reason && (
            <p className="text-xs text-muted-foreground italic truncate">
              &quot;{del.reason}&quot;
            </p>
          )}
        </div>

        {del.isActive && canManage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 size-8 p-0 shrink-0"
            title="End arrangement"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          <span>Starts:</span>
          <span className="font-medium text-foreground">
            {safeFormatDate(del.startDate)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5" />
          <span>Ends:</span>
          <span className="font-medium text-foreground">
            {safeFormatDate(del.endDate)}
          </span>
        </div>
      </div>
    </div>
  );
}
