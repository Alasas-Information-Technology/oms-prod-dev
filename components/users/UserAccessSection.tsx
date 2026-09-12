"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";
import {
  Lock,
  Unlock,
  Mail,
  RotateCcw,
  LogOut,
  AlertTriangle,
  Power,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import {
  useDeactivateUser,
  useReactivateUser,
  useUnlockUser,
  useInviteUser,
  useResetPassword,
  useUserSessions,
  useRevokeUserSessions,
} from "@/hooks/useAuthorization";
import { usePermission } from "@/hooks/usePermission";
import { getPlainErrorMessage } from "@/lib/constants/user-admin.constants";
import { UserDetailDto } from "@/lib/types/authorization.types";
import { resolveUserStatus } from "@/components/users/UserStatusBadge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export interface UserAccessSectionProps {
  user: UserDetailDto;
  onUserMutated?: () => void;
  className?: string;
}

export function UserAccessSection({
  user,
  onUserMutated,
  className,
}: UserAccessSectionProps) {
  const { can } = usePermission();
  const [showDeactivateModal, setShowDeactivateModal] = React.useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = React.useState(false);
  const [showSignOutAllModal, setShowSignOutAllModal] = React.useState(false);

  const canDeactivate = can("USER.DEACTIVATE");
  const canReactivate = can("USER.REACTIVATE");
  const canUnlock = can("USER.UNLOCK");
  const canInvite = can("USER.INVITE");
  const canResetPassword = can("USER.RESET_PASSWORD");

  const deactivateMutation = useDeactivateUser();
  const reactivateMutation = useReactivateUser();
  const unlockMutation = useUnlockUser();
  const inviteMutation = useInviteUser();
  const resetPasswordMutation = useResetPassword();
  const revokeSessionsMutation = useRevokeUserSessions();

  const { data: sessionsData = [] } = useUserSessions(user.userId, {
    enabled: Boolean(user.userId) && (can("USER.UPDATE") || can("USER.DEACTIVATE")),
  });
  const sessions = Array.isArray(sessionsData) ? sessionsData : (sessionsData as any)?.data || [];
  const activeSessionCount = sessions.length;

  const resolvedStatus = resolveUserStatus(undefined, user);
  const isLocked = resolvedStatus === "LOCKED";
  const isInvited = resolvedStatus === "INVITED";
  const isActive = Boolean(user.isActive);

  const handleToggleActive = async (checked: boolean) => {
    if (!checked) {
      setShowDeactivateModal(true);
    } else {
      try {
        await reactivateMutation.mutateAsync(user.userId);
        toast.success(`Access turned on for ${user.username}.`);
        onUserMutated?.();
      } catch (err: any) {
        const errorCode = err?.response?.data?.code || err?.code;
        toast.error(getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message));
      }
    }
  };

  const handleConfirmDeactivate = async () => {
    try {
      setShowDeactivateModal(false);
      await deactivateMutation.mutateAsync(user.userId);
      toast.success(`Access turned off for ${user.username}.`);
      onUserMutated?.();
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      toast.error(getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message));
    }
  };

  const handleUnlock = async () => {
    try {
      await unlockMutation.mutateAsync(user.userId);
      toast.success(`Account unlocked for ${user.username}.`);
      onUserMutated?.();
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      toast.error(getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message));
    }
  };

  const handleResendInvite = async () => {
    try {
      await inviteMutation.mutateAsync({ id: user.userId, resend: true });
      toast.success(`Onboarding invitation re-sent to ${user.email}.`);
      onUserMutated?.();
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      toast.error(getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message));
    }
  };

  const handleConfirmResetPassword = async () => {
    try {
      setShowResetPasswordModal(false);
      await resetPasswordMutation.mutateAsync(user.userId);
      toast.success(`Password reset link sent to ${user.email}.`);
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      toast.error(getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message));
    }
  };

  const handleConfirmSignOutAll = async () => {
    try {
      setShowSignOutAllModal(false);
      await revokeSessionsMutation.mutateAsync(user.userId);
      toast.success(`Signed out everywhere for ${user.username}.`);
      onUserMutated?.();
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      toast.error(getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message));
    }
  };

  const invitationSentDate = user.createdAt
    ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })
    : null;

  return (
    <div id="credentials-section" className={cn("space-y-4 pt-2", className)}>
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider text-xs flex items-center gap-2">
          <Power className="size-4 text-primary" />
          Access & Credentials
        </h3>
      </div>

      <div className="space-y-3">
        {/* Account active Toggle */}
        {(canDeactivate || canReactivate) && (
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-card shadow-2xs">
            <div className="space-y-0.5">
              <Label
                htmlFor="account-active-toggle"
                className="font-medium text-xs text-foreground cursor-pointer"
              >
                Account active
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {isActive
                  ? "This person can sign in and use their assigned capabilities."
                  : "Access is turned off. This person cannot sign in."}
              </p>
            </div>
            <Switch
              id="account-active-toggle"
              checked={isActive}
              onCheckedChange={handleToggleActive}
              disabled={deactivateMutation.isPending || reactivateMutation.isPending}
            />
          </div>
        )}

        {/* Locked out Alert Row */}
        {isLocked && canUnlock && (
          <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/30 flex items-center justify-between gap-3 text-xs animate-in fade-in-50 shadow-2xs">
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
          <div className="p-3 rounded-lg border border-sky-200 bg-sky-50/80 dark:border-sky-900/60 dark:bg-sky-950/30 flex items-center justify-between gap-3 text-xs animate-in fade-in-50 shadow-2xs">
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

        {/* Secondary Credential Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {canResetPassword && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowResetPasswordModal(true)}
              disabled={resetPasswordMutation.isPending}
              className="w-full justify-start text-xs h-8 gap-2 text-foreground font-normal hover:bg-muted/80"
            >
              <RotateCcw className="size-3.5 text-muted-foreground shrink-0" />
              <span>Ask them to set a new password</span>
            </Button>
          )}

          {(canDeactivate || canReactivate) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSignOutAllModal(true)}
              disabled={revokeSessionsMutation.isPending}
              className="w-full justify-start text-xs h-8 gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-border/80 font-normal"
            >
              <LogOut className="size-3.5 shrink-0" />
              <span>
                Sign them out everywhere
                {activeSessionCount > 0 && ` (${activeSessionCount})`}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog: Turn off access */}
      <AlertDialog open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="size-5 text-rose-600" />
              Turn off access for {user.username}?
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

      {/* Confirmation Dialog: Reset Password */}
      <AlertDialog open={showResetPasswordModal} onOpenChange={setShowResetPasswordModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="size-5 text-primary" />
              Ask them to set a new password?
            </AlertDialogTitle>
            <AlertDialogDescription>
              We&apos;ll send an email to <strong>{user.email}</strong> with a secure link to establish a new password. Administrators never set or see user passwords.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmResetPassword} className="shadow-xs">
              Send password link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog: Sign Out Everywhere */}
      <AlertDialog open={showSignOutAllModal} onOpenChange={setShowSignOutAllModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
              <LogOut className="size-5 text-rose-600" />
              Sign them out everywhere?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately invalidate all active sessions across browsers and devices for <strong>{user.username}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSignOutAll}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            >
              Sign out everywhere
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
