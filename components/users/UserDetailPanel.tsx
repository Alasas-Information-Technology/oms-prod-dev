"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Shield,
  Building2,
  Key,
  Clock,
  ExternalLink,
  X,
  Lock,
  Unlock,
  Mail,
  Send,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn } from "@/components/ui/utils";
import {
  useUserDetail,
  useUserRoles,
  useUserScopes,
  useEffectivePermissions,
  useDeactivateUser,
  useReactivateUser,
  useUnlockUser,
  useInviteUser,
} from "@/hooks/useAuthorization";
import { usePermission } from "@/hooks/usePermission";
import { getPlainErrorMessage } from "@/lib/constants/user-admin.constants";
import {
  IUserRoleAssignmentDto,
  IUserScopeAssignmentDto,
} from "@/lib/types/authorization.types";
import { UserAvatar } from "@/components/users/UserAvatar";
import { RoleChip } from "@/components/users/RoleChip";
import { UserStatusBadge, computeUserStatus } from "@/components/users/UserStatusBadge";
import { SummaryCard } from "@/components/users/SummaryCard";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export interface UserDetailPanelProps {
  userId?: string | null;
  isOpen?: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export function UserDetailPanel({
  userId,
  isOpen = true,
  onClose,
  children,
  className,
}: UserDetailPanelProps) {
  const { can } = usePermission();

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Confirmation Dialog States
  const [showDeactivateConfirm, setShowDeactivateConfirm] = React.useState(false);

  // Queries
  const {
    data: user,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useUserDetail(userId || undefined, {
    enabled: Boolean(userId) && isOpen !== false,
  });

  const { data: serverRolesData = [] } = useUserRoles(userId || undefined, {
    enabled: Boolean(userId) && isOpen !== false,
  });
  const serverRoles: IUserRoleAssignmentDto[] = Array.isArray(serverRolesData)
    ? serverRolesData
    : Array.isArray((serverRolesData as any)?.data)
      ? (serverRolesData as any).data
      : [];

  const { data: serverScopesData = [] } = useUserScopes(userId || undefined, {
    enabled: Boolean(userId),
  });
  const serverScopes: IUserScopeAssignmentDto[] = Array.isArray(serverScopesData)
    ? serverScopesData
    : Array.isArray((serverScopesData as any)?.data)
      ? (serverScopesData as any).data
      : [];

  const { data: effectivePerms } = useEffectivePermissions(userId || undefined, {
    enabled: Boolean(userId),
  });

  // Lifecycle Mutations
  const deactivateMutation = useDeactivateUser();
  const reactivateMutation = useReactivateUser();
  const unlockMutation = useUnlockUser();
  const inviteMutation = useInviteUser();

  if (!userId) return null;

  const displayName = user
    ? user.profile?.displayName ||
      `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() ||
      user.username
    : "User Profile";

  const userStatus = user ? computeUserStatus(user) : "ACTIVE";
  const isLocked = userStatus === "LOCKED";
  const isInvited = userStatus === "INVITED";
  const isActive = Boolean(user?.isActive);

  // Metric Computations
  const activeRolesCount = serverRoles.filter((r) => r.isActive !== false).length;
  const rolesValue =
    activeRolesCount === 0
      ? "No roles assigned"
      : `${activeRolesCount} ${activeRolesCount === 1 ? "role" : "roles"}`;

  const activeScopes = serverScopes.filter((s) => s.isActive !== false);
  const scopeValue =
    activeScopes.length === 0
      ? "Only themselves"
      : activeScopes[0].scopeName || activeScopes[0].scopeCode || "Assigned access";

  const permissionsList = Array.isArray(effectivePerms?.permissions)
    ? effectivePerms.permissions
    : Array.isArray(effectivePerms)
    ? effectivePerms
    : [];
  const permissionsCount = permissionsList.length;
  const permissionsValue = `${permissionsCount} ${permissionsCount === 1 ? "action" : "actions"}`;

  const lastSignedInValue = user?.updatedAt
    ? formatDistanceToNow(new Date(user.updatedAt), { addSuffix: true })
    : "Never";

  const canManageActive = can("USER.DEACTIVATE") || can("USER.REACTIVATE");
  const canUnlock = can("USER.UNLOCK");
  const canInvite = can("USER.INVITE");

  const invitationSentDate = user?.createdAt
    ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })
    : null;

  // Immediate mutation handlers
  const handleToggleActive = async (checked: boolean) => {
    if (!userId || !user) return;
    if (!checked) {
      setShowDeactivateConfirm(true);
    } else {
      try {
        await reactivateMutation.mutateAsync(userId);
        toast.success(`Access turned on for ${displayName}.`);
        refetchUser();
      } catch (err: any) {
        const errorCode = err?.response?.data?.code || err?.code;
        toast.error(getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message));
      }
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!userId || !user) return;
    try {
      setShowDeactivateConfirm(false);
      await deactivateMutation.mutateAsync(userId);
      toast.success(`Access turned off for ${displayName}.`);
      refetchUser();
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      toast.error(getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message));
    }
  };

  const handleUnlock = async () => {
    if (!userId || !user) return;
    try {
      await unlockMutation.mutateAsync(userId);
      toast.success(`Account unlocked for ${displayName}.`);
      refetchUser();
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      toast.error(getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message));
    }
  };

  const handleResendInvite = async () => {
    if (!userId || !user) return;
    try {
      await inviteMutation.mutateAsync({ id: userId, resend: true });
      toast.success(`Onboarding invitation re-sent to ${user.email}.`);
      refetchUser();
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      toast.error(getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`User Details: ${displayName}`}
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex flex-col w-full sm:w-[520px] bg-background border-l border-border/80 shadow-2xl animate-in slide-in-from-right duration-200 focus:outline-hidden",
        className
      )}
    >
      {/* Header Block (§Part 4) */}
      <div className="p-6 border-b border-border/60 bg-card/60 flex items-start justify-between gap-4">
        {isUserLoading || !user ? (
          <div className="flex items-center gap-4 w-full">
            <Skeleton className="size-14 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 min-w-0">
            <UserAvatar
              name={displayName}
              email={user.email}
              size={56}
              className="border-2 border-primary/20 shadow-xs shrink-0"
            />
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground tracking-tight truncate">
                  {displayName}
                </h2>
                {user.roles?.[0] && <RoleChip roleCode={user.roles[0]} />}
                <UserStatusBadge user={user} />
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="size-8 text-muted-foreground hover:text-foreground shrink-0 rounded-full"
          aria-label="Close peek drawer"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isUserLoading || !user ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-14 w-full rounded-md" />
            <Skeleton className="h-14 w-full rounded-md" />
            <Skeleton className="h-14 w-full rounded-md" />
            <Skeleton className="h-14 w-full rounded-md" />
          </div>
        ) : (
          <>
            {/* Immediate Actions Group */}
            <div className="space-y-3">
              {/* Account active Toggle */}
              {canManageActive && (
                <div className="flex items-center justify-between p-3.5 rounded-md border border-border/80 bg-card shadow-2xs">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="drawer-account-active"
                      className="font-medium text-xs text-foreground cursor-pointer"
                    >
                      Account active
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      {isActive
                        ? "This person can sign in and use their assigned permissions."
                        : "Access is turned off. This person cannot sign in."}
                    </p>
                  </div>
                  <Switch
                    id="drawer-account-active"
                    checked={isActive}
                    onCheckedChange={handleToggleActive}
                    disabled={deactivateMutation.isPending || reactivateMutation.isPending}
                  />
                </div>
              )}

              {/* Locked out Alert Row */}
              {isLocked && canUnlock && (
                <div className="p-3.5 rounded-md border border-rose-200 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/30 flex items-center justify-between gap-3 text-xs animate-in fade-in-50 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <Lock className="size-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-rose-900 dark:text-rose-300">
                        Locked out
                      </p>
                      <p className="text-rose-800/90 dark:text-rose-400 text-[11px]">
                        Locked after {user.failedLoginCount || 5} failed sign-in attempts.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnlock}
                    disabled={unlockMutation.isPending}
                    className="border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/50 text-xs h-7 shrink-0 gap-1.5"
                  >
                    <Unlock className="size-3" />
                    {unlockMutation.isPending ? "Unlocking..." : "Unlock"}
                  </Button>
                </div>
              )}

              {/* Hasn't signed in yet Alert Row */}
              {isInvited && canInvite && (
                <div className="p-3.5 rounded-md border border-sky-200 bg-sky-50/80 dark:border-sky-900/60 dark:bg-sky-950/30 flex items-center justify-between gap-3 text-xs animate-in fade-in-50 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <Mail className="size-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sky-900 dark:text-sky-300">
                        Hasn&apos;t signed in yet
                      </p>
                      <p className="text-sky-800/90 dark:text-sky-400 text-[11px]">
                        {invitationSentDate
                          ? `Invitation sent ${invitationSentDate}.`
                          : "Invitation dispatched to corporate email."}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendInvite}
                    disabled={inviteMutation.isPending}
                    className="border-sky-300 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-900/50 text-xs h-7 shrink-0 gap-1.5"
                  >
                    <Send className="size-3" />
                    {inviteMutation.isPending ? "Sending..." : "Resend invitation"}
                  </Button>
                </div>
              )}
            </div>

            {/* Read-Only Summary Cards Navigation Group (§Part 1, 2, 4) */}
            <div className="space-y-2.5 pt-2">
              <SummaryCard
                label="Roles"
                value={rolesValue}
                icon={Shield}
                href={`/app/administration/users/${userId}?tab=roles`}
              />

              <SummaryCard
                label="Access Scope"
                value={scopeValue}
                icon={Building2}
                href={`/app/administration/users/${userId}?tab=access`}
              />

              <SummaryCard
                label="Permissions"
                value={permissionsValue}
                icon={Key}
                href={`/app/administration/users/${userId}?tab=permissions`}
              />

              <SummaryCard
                label="Last signed in"
                value={lastSignedInValue}
                icon={Clock}
                href={`/app/administration/users/${userId}?tab=activity`}
              />
            </div>

            {/* Open Full Profile Button (§Part 1 & 4) */}
            <div className="pt-4">
              <Button asChild className="w-full h-10 text-xs gap-2 font-medium shadow-xs">
                <Link href={`/app/administration/users/${userId}?tab=overview`}>
                  <span>Open full profile</span>
                  <ExternalLink className="size-3.5" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog: Turn off access */}
      <AlertDialog open={showDeactivateConfirm} onOpenChange={setShowDeactivateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="size-5 text-rose-600" />
              Turn off access for {displayName}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground leading-relaxed">
              They&apos;ll be signed out immediately and won&apos;t be able to sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeactivate}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            >
              Turn off access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
