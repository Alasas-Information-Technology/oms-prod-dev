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
  userName,
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
      toast.success("Delegation cancelled successfully.");
      setDelegationToCancel(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to cancel delegation");
    }
  };

  const activeDelegations = delegations.filter((d) => d.isActive);

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Authority Delegations
          </CardTitle>
          <CardDescription>
            Temporary delegation of operational authority. When active, actions taken record both acting user and delegator.
          </CardDescription>
        </div>
        {can("USER.DELEGATION.MANAGE") && onOpenCreateDialog && (
          <Button onClick={onOpenCreateDialog} size="sm" className="gap-1.5 shadow-xs">
            <Plus className="size-4" />
            Delegate Authority
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {delegations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border rounded-xl border-dashed bg-muted/20">
            <Users className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-foreground">No active delegations</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              This user currently operates solely under their own assigned permissions.
            </p>
            {can("USER.DELEGATION.MANAGE") && onOpenCreateDialog && (
              <Button onClick={onOpenCreateDialog} variant="outline" size="sm" className="mt-4 gap-1.5">
                <Plus className="size-4" />
                Create Delegation
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {delegations.map((del) => {
              const startDate = new Date(del.startDate);
              const endDate = new Date(del.endDate);
              const isGrantedByThisUser = del.fromUserId === userId;

              return (
                <div
                  key={del.delegationId}
                  className={`p-4 rounded-xl border transition-all ${
                    del.isActive
                      ? "bg-card border-border/80 shadow-xs"
                      : "bg-muted/30 border-border/40 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {isGrantedByThisUser ? "Delegated To:" : "Delegated From:"}
                        </span>
                        <Badge variant="outline" className="font-medium text-xs">
                          {isGrantedByThisUser
                            ? del.toUserName || del.toUserId
                            : del.fromUserName || del.fromUserId}
                        </Badge>
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
                      <p className="text-xs text-muted-foreground italic">
                        &quot;{del.reason}&quot;
                      </p>
                    </div>

                    {del.isActive && can("USER.DELEGATION.MANAGE") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDelegationToCancel(del)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 size-8 p-0"
                        title="Cancel Delegation"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      <span>Start:</span>
                      <span className="font-medium text-foreground">
                        {format(startDate, "dd MMM yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      <span>End:</span>
                      <span className="font-medium text-foreground">
                        {format(endDate, "dd MMM yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog
          open={Boolean(delegationToCancel)}
          onOpenChange={(o) => !o && setDelegationToCancel(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End Delegation of Authority?</AlertDialogTitle>
              <AlertDialogDescription>
                Ending this delegation will immediately revoke delegated permissions. All actions performed during the active window remain preserved in the audit log.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                End Delegation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
