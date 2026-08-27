"use client";

import * as React from "react";
import { format, isFuture, isPast } from "date-fns";
import {
  Shield,
  Calendar,
  Clock,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IUserRoleAssignmentDto } from "@/lib/types/authorization.types";
import { usePermission } from "@/hooks/usePermission";
import { useRevokeRole } from "@/hooks/useAuthorization";
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

interface UserRolesTimelineProps {
  userId: string;
  roles: IUserRoleAssignmentDto[];
  onOpenAssignDialog?: () => void;
}

export function UserRolesTimeline({
  userId,
  roles,
  onOpenAssignDialog,
}: UserRolesTimelineProps) {
  const { can } = usePermission();
  const [roleToRevoke, setRoleToRevoke] = React.useState<IUserRoleAssignmentDto | null>(null);

  const revokeMutation = useRevokeRole();

  const handleRevoke = async () => {
    if (!roleToRevoke) return;
    try {
      await revokeMutation.mutateAsync({
        userId,
        roleId: roleToRevoke.roleId,
      });
      toast.success(`Role [${roleToRevoke.roleName || roleToRevoke.roleCode}] revoked successfully.`);
      setRoleToRevoke(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to revoke role");
    }
  };

  // Sort: active/future first, then past
  const sortedRoles = React.useMemo(() => {
    return [...roles].sort((a, b) => {
      const dateA = new Date(a.effectiveFrom).getTime();
      const dateB = new Date(b.effectiveFrom).getTime();
      return dateB - dateA;
    });
  }, [roles]);

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            Assigned Roles Timeline
          </CardTitle>
          <CardDescription>
            Roles grant system capabilities and are effective-dated. Changes take effect immediately.
          </CardDescription>
        </div>
        {can("USER.ROLE.ASSIGN") && onOpenAssignDialog && (
          <Button onClick={onOpenAssignDialog} size="sm" className="gap-1.5 shadow-xs">
            <Plus className="size-4" />
            Assign Role
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {sortedRoles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border rounded-xl border-dashed bg-muted/20">
            <Shield className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-foreground">No roles currently assigned</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              This user currently operates with baseline authenticated privileges only.
            </p>
            {can("USER.ROLE.ASSIGN") && onOpenAssignDialog && (
              <Button onClick={onOpenAssignDialog} variant="outline" size="sm" className="mt-4 gap-1.5">
                <Plus className="size-4" />
                Assign Initial Role
              </Button>
            )}
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
            {sortedRoles.map((role) => {
              const fromDate = new Date(role.effectiveFrom);
              const toDate = role.effectiveTo ? new Date(role.effectiveTo) : null;
              const isFutureDated = isFuture(fromDate);
              const isExpired = toDate ? isPast(toDate) : false;
              const isCurrentlyActive = !isFutureDated && !isExpired && role.isActive;

              return (
                <div key={role.userRoleId || role.roleId} className="relative group">
                  {/* Timeline Node Icon */}
                  <div
                    className={`absolute -left-6 top-1.5 size-5 rounded-full flex items-center justify-center border-2 bg-background ${
                      isFutureDated
                        ? "border-amber-500 text-amber-500 ring-4 ring-amber-500/10"
                        : isCurrentlyActive
                        ? "border-emerald-500 text-emerald-500 ring-4 ring-emerald-500/10"
                        : "border-muted-foreground/40 text-muted-foreground/40"
                    }`}
                  >
                    {isFutureDated ? (
                      <Clock className="size-2.5" />
                    ) : isCurrentlyActive ? (
                      <CheckCircle2 className="size-2.5" />
                    ) : (
                      <div className="size-1.5 rounded-full bg-muted-foreground/50" />
                    )}
                  </div>

                  {/* Card Content */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      isFutureDated
                        ? "bg-amber-500/5 border-amber-500/30 shadow-xs"
                        : isCurrentlyActive
                        ? "bg-card border-border/80 hover:border-border shadow-xs"
                        : "bg-muted/30 border-border/40 opacity-75"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base text-foreground">
                          {role.roleName || role.roleCode}
                        </span>
                        <code className="text-xs px-2 py-0.5 bg-muted rounded font-mono text-muted-foreground">
                          {role.roleCode}
                        </code>

                        {/* State Badges */}
                        {isFutureDated && (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-semibold gap-1"
                          >
                            <Calendar className="size-3" />
                            Scheduled (Future-Dated)
                          </Badge>
                        )}
                        {isCurrentlyActive && (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-semibold gap-1"
                          >
                            <CheckCircle2 className="size-3" />
                            Active Now
                          </Badge>
                        )}
                        {isExpired && (
                          <Badge variant="outline" className="text-muted-foreground text-xs">
                            Expired / Revoked
                          </Badge>
                        )}
                      </div>

                      {/* Revoke Action */}
                      {isCurrentlyActive && can("USER.ROLE.ASSIGN") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRoleToRevoke(role)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 size-8 p-0"
                          title="Revoke Role"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>

                    {/* Timeline Date Details */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        <span>Effective From:</span>
                        <span className="font-medium text-foreground">
                          {format(fromDate, "dd MMM yyyy, HH:mm")}
                        </span>
                      </div>
                      {toDate && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3.5" />
                          <span>Effective To:</span>
                          <span className="font-medium text-foreground">
                            {format(toDate, "dd MMM yyyy, HH:mm")}
                          </span>
                        </div>
                      )}
                    </div>

                    {role.assignedBy && (
                      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5 border-t border-border/40 pt-2">
                        <span>Assigned by administrator</span>
                        {role.assignedAt && (
                          <span>on {format(new Date(role.assignedAt), "dd MMM yyyy")}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog open={Boolean(roleToRevoke)} onOpenChange={(o) => !o && setRoleToRevoke(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke Role Assignment?</AlertDialogTitle>
              <AlertDialogDescription>
                Revoking <strong>{roleToRevoke?.roleName || roleToRevoke?.roleCode}</strong> will immediately remove all permissions granted by this role. This action is audited and takes effect instantly without requiring the user to re-login.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRevoke}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Revoke Role
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
