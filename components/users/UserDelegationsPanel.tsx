"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Users,
  Calendar,
  Clock,
  Trash2,
  Plus,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { UserPanelCard, UserPanelRow } from "./UserPanelCard";

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
    <div className="space-y-6">
      {/* Card 1: Standing in for colleagues */}
      <UserPanelCard title="Standing in for colleagues">
        {standingInForOthers.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-muted-foreground bg-muted/10">
            They are not currently standing in for any colleagues.
          </div>
        ) : (
          standingInForOthers.map((del) => (
            <DelegationRow
              key={del.delegationId}
              del={del}
              label={`Standing in for ${del.fromUserName || del.fromUserId}`}
              canManage={can("USER.DELEGATION.MANAGE")}
              onCancel={() => setDelegationToCancel(del)}
            />
          ))
        )}
      </UserPanelCard>

      {/* Card 2: Colleagues standing in for them */}
      <UserPanelCard
        title={`Colleagues standing in for ${userName}`}
        headerAction={
          can("USER.DELEGATION.MANAGE") && onOpenCreateDialog ? (
            <Button
              onClick={onOpenCreateDialog}
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary hover:bg-primary/10 -mr-3 h-8"
            >
              <Plus className="size-4 mr-1.5" />
              Add arrangement
            </Button>
          ) : undefined
        }
      >
        <div className="p-4 border-b border-border/50 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-start gap-3 text-xs">
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-900 dark:text-amber-300">
                All-or-nothing authority
              </p>
              <p className="text-amber-800/90 dark:text-amber-400 leading-relaxed">
                Colleagues listed below can do everything {userName} can do while standing in. Ensure dates are strictly managed.
              </p>
            </div>
          </div>
        </div>

        {othersStandingIn.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-muted-foreground bg-muted/10">
            No colleagues are currently standing in for them.
          </div>
        ) : (
          othersStandingIn.map((del) => (
            <DelegationRow
              key={del.delegationId}
              del={del}
              label={`${del.toUserName || del.toUserId} standing in`}
              canManage={can("USER.DELEGATION.MANAGE")}
              onCancel={() => setDelegationToCancel(del)}
            />
          ))
        )}
      </UserPanelCard>

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
    </div>
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
    <UserPanelRow className={!del.isActive ? "bg-muted/20 opacity-75" : ""}>
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-medium text-foreground text-sm truncate">{label}</span>
          {del.isActive ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider font-semibold"
            >
              Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider font-semibold">
              Ended
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
          <span title="Start date">{safeFormatDate(del.startDate)}</span>
          <ArrowRight className="size-3 text-border/80" />
          <span title="End date">{safeFormatDate(del.endDate)}</span>
        </div>
        {del.reason && (
          <p className="text-[13px] text-muted-foreground italic mt-2 truncate max-w-lg">
            "{del.reason}"
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
    </UserPanelRow>
  );
}
