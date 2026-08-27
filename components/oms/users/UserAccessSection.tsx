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
  CheckCircle2,
  ShieldAlert,
  Power,
  Clock,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { resolveUserStatus } from "@/components/oms/users/UserStatusBadge";
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
  const userId = user.userId;
  const status = resolveUserStatus(undefined, user);
  const isLocked = status === "LOCKED";
  const isInvited = status === "INVITED";
  const isActive = user.isActive;

  // Confirmations
  const [showDeactivateConfirm, setShowDeactivateConfirm] = React.useState(false);
  const [showSignOutAllConfirm, setShowSignOutAllConfirm] = React.useState(false);
  const [showResetPasswordConfirm, setShowResetPasswordConfirm] = React.useState(false);

  // Mutations & Queries
  const deactivateMutation = useDeactivateUser();
  const reactivateMutation = useReactivateUser();
  const unlockMutation = useUnlockUser();
  const inviteMutation = useInviteUser();
  const resetPasswordMutation = useResetPassword();
  const revokeSessionsMutation = useRevokeUserSessions();

  const { data: sessionsData = [] } = useUserSessions(userId, {
    enabled: Boolean(userId) && (can("USER.UPDATE") || can("USER.DEACTIVATE")),
  });
  const sessions = Array.isArray(sessionsData) ? sessionsData : (sessionsData as any)?.data || [];
  const activeSessionCount = sessions.length;

  // Handlers
  const handleToggleActive = async (checked: boolean) => {
    if (!checked) {
      // Turning off -> Prompt warning first
      setShowDeactivateConfirm(true);
    } else {
      // Turning on
      try {
        await reactivateMutation.mutateAsync(userId);
        toast.success(`Access turned on for ${user.profile?.displayName || user.username}.`);
        onUserMutated?.();
      } catch (err: any) {
        const errorCode = err?.response?.data?.code || err?.code;
        const msg = getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message);
        toast.error(msg);
      }
    }
  };

  const handleConfirmDeactivate = async () => {
    try {
      setShowDeactivateConfirm(false);
      await deactivateMutation.mutateAsync(userId);
      toast.success(`Access turned off for ${user.profile?.displayName || user.username}.`);
      onUserMutated?.();
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      const msg = getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message);
      toast.error(msg);
    }
  };

  const handleUnlock = async () => {
    try {
      await unlockMutation.mutateAsync(userId);
      toast.success(`Account unlocked for ${user.profile?.displayName || user.username}.`);
      onUserMutated?.();
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      const msg = getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message);
      toast.error(msg);
    }
  };

  const handleResendInvitation = async () => {
    try {
      await inviteMutation.mutateAsync({ id: userId, resend: true });
      toast.success(`Onboarding invitation re-sent to ${user.email}.`);
      onUserMutated?.();
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      const msg = getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message);
      toast.error(msg);
    }
  };

  const handleConfirmResetPassword = async () => {
    try {
      setShowResetPasswordConfirm(false);
      await resetPasswordMutation.mutateAsync(userId);
      toast.success(`Password reset invitation sent to ${user.email}.`);
      onUserMutated?.();
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      const msg = getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message);
      toast.error(msg);
    }
  };

  const handleConfirmSignOutAll = async () => {
    try {
      setShowSignOutAllConfirm(false);
      await revokeSessionsMutation.mutateAsync(userId);
      toast.success(`Signed out everywhere for ${user.profile?.displayName || user.username}.`);
      onUserMutated?.();
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      const msg = getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message);
      toast.error(msg);
    }
  };

  const canManageActive = can("USER.DEACTIVATE") || can("USER.REACTIVATE");
  const canUnlock = can("USER.UNLOCK");
  const canInvite = can("USER.INVITE");
  const canResetPassword = can("USER.RESET_PASSWORD");
  const canRevokeSessions = can("USER.UPDATE") || can("USER.DEACTIVATE");

  // Relative invitation sent date
  const invitationSentDate = user.createdAt
    ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })
    : null;

  return (
    <div id="access-section" className={cn("space-y-4 pt-2", className)}>
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider text-xs">
          Access & Credentials
        </h3>
      </div>

      <div className="space-y-3">
        {/* 1. Account Active Toggle (§Part 3.4) */}
        {canManageActive && (
          <div className="p-4 rounded-xl border border-border/80 bg-card flex items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-0.5">
              <Label
                htmlFor="account-active-toggle"
                className="font-medium text-sm text-foreground cursor-pointer"
              >
                Account active
              </Label>
              <p className="text-xs text-muted-foreground">
                {isActive
                  ? "This person can sign in and use their assigned permissions."
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

        {/* 2. Locked Out Row (Shown ONLY when locked §Part 3.4) */}
        {isLocked && canUnlock && (
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/30 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in-50">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                <Lock className="size-4" />
              </div>
              <div className="space-y-0.5">
                <div className="font-semibold text-xs text-rose-800 dark:text-rose-300">
                  Locked out
                </div>
                <p className="text-xs text-rose-700/90 dark:text-rose-400">
                  Locked after {user.failedLoginCount || 5} failed sign-in attempts.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleUnlock}
              disabled={unlockMutation.isPending}
              className="border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/50 text-xs h-8 shrink-0 gap-1.5"
            >
              <Unlock className="size-3.5" />
              {unlockMutation.isPending ? "Unlocking..." : "Unlock"}
            </Button>
          </div>
        )}

        {/* 3. Hasn't Signed in Yet Row (Shown ONLY when invited §Part 3.4) */}
        {isInvited && canInvite && (
          <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/80 dark:border-sky-900/60 dark:bg-sky-950/30 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in-50">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-lg bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center shrink-0 text-sky-600 dark:text-sky-400">
                <Mail className="size-4" />
              </div>
              <div className="space-y-0.5">
                <div className="font-semibold text-xs text-sky-800 dark:text-sky-300">
                  Hasn&apos;t signed in yet
                </div>
                <p className="text-xs text-sky-700/90 dark:text-sky-400">
                  {invitationSentDate
                    ? `Invitation sent ${invitationSentDate}.`
                    : "Invitation has been dispatched to email."}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResendInvitation}
              disabled={inviteMutation.isPending}
              className="border-sky-300 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-900/50 text-xs h-8 shrink-0 gap-1.5"
            >
              <Send className="size-3.5" />
              {inviteMutation.isPending ? "Sending..." : "Resend invitation"}
            </Button>
          </div>
        )}

        {/* 4. Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {/* Ask them to set a new password (NEVER a password input!) */}
          {canResetPassword && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowResetPasswordConfirm(true)}
              disabled={resetPasswordMutation.isPending}
              className="w-full justify-start text-xs h-9 gap-2 text-foreground font-normal hover:bg-muted/80"
            >
              <RotateCcw className="size-3.5 text-muted-foreground shrink-0" />
              <span>Ask them to set a new password</span>
            </Button>
          )}

          {/* Sign them out everywhere with session count */}
          {canRevokeSessions && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSignOutAllConfirm(true)}
              disabled={revokeSessionsMutation.isPending}
              className="w-full justify-start text-xs h-9 gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-border/80 font-normal"
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

      {/* Confirmation 1: Turn off access warning dialog */}
      <AlertDialog open={showDeactivateConfirm} onOpenChange={setShowDeactivateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="size-5 text-rose-600" />
              Turn off access for {user.profile?.displayName || user.username}?
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

      {/* Confirmation 2: Ask to set new password dialog */}
      <AlertDialog
        open={showResetPasswordConfirm}
        onOpenChange={setShowResetPasswordConfirm}
      >
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

      {/* Confirmation 3: Sign out everywhere dialog */}
      <AlertDialog
        open={showSignOutAllConfirm}
        onOpenChange={setShowSignOutAllConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
              <LogOut className="size-5 text-rose-600" />
              Sign them out everywhere?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately invalidate all active sessions across browsers and devices for <strong>{user.profile?.displayName || user.username}</strong>. They will need to sign in again.
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
