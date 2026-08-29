"use client";

import * as React from "react";
import {
  Mail,
  Copy,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleChip } from "@/components/users/RoleChip";
import { UserStatusBadge, computeUserStatus } from "@/components/users/UserStatusBadge";
import { UserDetailDto } from "@/lib/types/authorization.types";
import { cn } from "@/components/ui/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { usePermission } from "@/hooks/usePermission";

type TabKey = "overview" | "roles" | "access" | "permissions" | "delegations" | "activity";

export interface UserProfileCardProps {
  user: UserDetailDto;
  activeTab: TabKey;
  onTabChange: (tab: string) => void;
  counts: {
    roles: number;
    access: number;
    permissions: number;
    delegations: number;
    sessions: number;
  };
  primaryRoleCode?: string;
  onDeactivate: () => void;
  onResetPassword: () => void;
  onForceChangePassword?: () => void;
  onSignOutAll: () => void;
}

export function UserProfileCard({
  user,
  activeTab,
  onTabChange,
  counts,
  primaryRoleCode,
  onDeactivate,
  onResetPassword,
  onForceChangePassword,
  onSignOutAll,
}: UserProfileCardProps) {
  const { can } = usePermission();
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  // Confirm Modals state for destructive/significant actions
  const [showDeactivateConfirm, setShowDeactivateConfirm] = React.useState(false);
  const [showResetPasswordConfirm, setShowResetPasswordConfirm] = React.useState(false);
  const [showSignOutAllConfirm, setShowSignOutAllConfirm] = React.useState(false);

  const navRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const displayName =
    user.profile?.displayName ||
    `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() ||
    user.username;

  const initials =
    (user.profile?.firstName?.[0] || "") + (user.profile?.lastName?.[0] || "") ||
    user.username.substring(0, 2).toUpperCase();

  const userStatus = computeUserStatus(user);
  const isActive = Boolean(user.isActive);
  const isLocked = userStatus === "LOCKED";
  const isInvited = userStatus === "INVITED";
  const canManageActive = can("USER.DEACTIVATE") || can("USER.REACTIVATE");
  const canResetPassword = can("USER.RESET_PASSWORD");
  const canForceChangePassword = can("USER.FORCE_PASSWORD_CHANGE");
  const canRevokeSessions = can("USER.UPDATE") || can("USER.DEACTIVATE");

  const copyToClipboard = (text: string, fieldName: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  let bandGradient = "from-zinc-500/10 to-zinc-500/5";
  let statusDotClass = "bg-zinc-400 border-zinc-200 dark:border-zinc-800";
  if (userStatus === "ACTIVE") {
    bandGradient = "from-emerald-500/15 to-emerald-500/5";
    statusDotClass = "bg-emerald-500 border-emerald-100 dark:border-emerald-900";
  } else if (userStatus === "INVITED") {
    bandGradient = "from-sky-500/15 to-sky-500/5";
    statusDotClass = "bg-sky-500 border-sky-100 dark:border-sky-900";
  } else if (userStatus === "LOCKED") {
    bandGradient = "from-rose-500/15 to-rose-500/5";
    statusDotClass = "bg-rose-500 border-rose-100 dark:border-rose-900";
  }

  const navItems = [
    { key: "overview", label: "Overview", count: undefined },
    { key: "roles", label: "Roles", count: counts.roles },
    { key: "access", label: "Access", count: counts.access },
    { key: "permissions", label: "Permissions", count: counts.permissions },
    { key: "delegations", label: "Standing in", count: counts.delegations },
    { key: "activity", label: "Activity", count: undefined },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      nextIndex = (index + 1) % navItems.length;
      e.preventDefault();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      nextIndex = (index - 1 + navItems.length) % navItems.length;
      e.preventDefault();
    } else if (e.key === "Home") {
      nextIndex = 0;
      e.preventDefault();
    } else if (e.key === "End") {
      nextIndex = navItems.length - 1;
      e.preventDefault();
    }

    if (nextIndex !== index) {
      navRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <>
      <div className="rounded-md border border-border/70 bg-card shadow-sm flex flex-col sticky top-[64px] min-[1100px]:top-6 z-20 overflow-hidden max-h-[calc(100vh-64px)] min-[1100px]:max-h-none overflow-y-auto min-[1100px]:overflow-visible hide-scrollbar">
        {/* Responsive Wrap: Desktop is vertical, Mobile is horizontal */}
        <div className="flex flex-col min-[1100px]:block">

          {/* Top Section: Status Band & Avatar */}
          <div className="relative">
            {/* Status Band (120px) */}
            <div className={cn("h-[120px] bg-gradient-to-b w-full", bandGradient)} />

            {/* Avatar overlapping band */}
            <div className="absolute top-[72px] inset-x-0 flex justify-center">
              <div className="relative">
                <Avatar className="size-24 border-4 border-card bg-card shadow-sm">
                  <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary font-display">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn("absolute bottom-1 right-1 size-4 rounded-full border-2 shadow-xs", statusDotClass)}
                  title={userStatus}
                />
              </div>
            </div>
          </div>

          {/* Identity & Actions */}
          <div className="pt-[60px] pb-5 px-6 text-center border-b border-border/50">
            {/* Name */}
            <h1 className="text-[22px] font-semibold text-foreground tracking-tight" dir="auto">
              {displayName}
            </h1>

            {/* Title & Dept */}
            <div className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <span className="truncate max-w-[200px]">
                {user.profile?.jobTitle || "—"}
              </span>
              <span>·</span>
              <span className="truncate max-w-[140px]">
                {user.profile?.departmentName || "—"}
              </span>
            </div>

            {/* Status Badge */}
            <div className="mt-3 flex justify-center">
              <UserStatusBadge user={user} />
            </div>

          </div>

          {/* Navigation & Key Facts */}
          {/* Desktop: Vertical Nav. Mobile: Horizontal scrollable */}
          <div className="flex flex-col-reverse min-[1100px]:flex-col">

            {/* Vertical Nav */}
            <nav className="flex min-[1100px]:flex-col overflow-x-auto min-[1100px]:overflow-x-visible hide-scrollbar border-b border-border/50 min-[1100px]:border-b-0" role="tablist" aria-orientation="vertical">
              {navItems.map((item, index) => {
                const isActiveTab = activeTab === item.key;

                return (
                  <button
                    key={item.key}
                    ref={(el) => { navRefs.current[index] = el; }}
                    role="tab"
                    aria-selected={isActiveTab}
                    tabIndex={isActiveTab ? 0 : -1}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onClick={() => onTabChange(item.key)}
                    className={cn(
                      "group relative flex items-center justify-between min-[1100px]:w-full h-10 px-4 whitespace-nowrap text-sm transition-colors hover:bg-muted/50 cursor-pointer",
                      isActiveTab ? "text-primary bg-primary/5 font-semibold" : "text-muted-foreground font-medium"
                    )}
                  >
                    {/* Active Bar indicator (left on desktop, bottom on mobile) */}
                    {isActiveTab && (
                      <>
                        <span className="hidden min-[1100px]:block absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                        <span className="block min-[1100px]:hidden absolute left-0 right-0 bottom-0 h-0.5 bg-primary mx-4" />
                      </>
                    )}

                    <span>{item.label}</span>

                    {/* Count */}
                    {(item.count !== undefined && item.count > 0) && (
                      <span className="ml-3 tabular-nums text-xs text-muted-foreground group-aria-selected:text-primary">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="hidden min-[1100px]:block px-6 py-5 border-t border-border/50">
              {/* Key Facts */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[13px] text-muted-foreground font-medium">Email</div>
                  <div className="text-[13px] font-mono text-foreground font-medium truncate" title={user.email}>{user.email}</div>
                </div>

                {user.profile?.employeeId && (
                  <div className="space-y-1">
                    <div className="text-[13px] text-muted-foreground font-medium">Employee ID</div>
                    <div className="text-[13px] font-mono text-foreground font-medium">{user.profile.employeeId}</div>
                  </div>
                )}

                {user.profile?.departmentName && (
                  <div className="space-y-1">
                    <div className="text-[13px] text-muted-foreground font-medium">Department</div>
                    <div className="text-[13px] text-foreground font-medium">{user.profile.departmentName}</div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Role Chips - Desktop Only */}
          <div className="hidden min-[1100px]:block px-6 py-5 border-t border-border/50">
            <div className="text-[13px] text-muted-foreground font-medium mb-3">Roles</div>
            <div className="flex flex-wrap gap-1.5">
              {counts.roles > 0 && primaryRoleCode ? (
                <>
                  <RoleChip roleCode={primaryRoleCode} />
                  {counts.roles > 1 && (
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md flex items-center justify-center font-medium">
                      +{counts.roles - 1}
                    </span>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  <span>No roles yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions - Desktop Only */}
          {(canResetPassword || canForceChangePassword || canRevokeSessions) && (
            <div className="hidden min-[1100px]:flex flex-col gap-1 px-3 pb-3 pt-2 border-t border-border/50">
              {canResetPassword && (
                <Button
                  variant="ghost"
                  className="w-full text-[13px] font-medium text-foreground hover:bg-muted/80 justify-start h-8 rounded-lg"
                  onClick={() => setShowResetPasswordConfirm(true)}
                >
                  Reset password
                </Button>
              )}
              {canForceChangePassword && (
                <Button
                  variant="ghost"
                  className="w-full text-[13px] font-medium text-foreground hover:bg-muted/80 justify-start h-8 rounded-lg"
                  onClick={() => onForceChangePassword?.()}
                >
                  Force change password
                </Button>
              )}
              {canRevokeSessions && (
                <Button
                  variant="ghost"
                  className="w-full text-[13px] font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 justify-start flex items-center justify-between h-8 rounded-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSignOutAllConfirm(true);
                  }}
                >
                  <span>Sign out everywhere</span>
                  {counts.sessions > 0 && (
                    <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-1.5 rounded-sm">
                      {counts.sessions}
                    </span>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog open={showDeactivateConfirm} onOpenChange={setShowDeactivateConfirm}>
        <AlertDialogContent className="rounded-md border-border/70 shadow-xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-semibold tracking-tight text-xl">
              Turn off access?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-relaxed text-muted-foreground/80">
              This will immediately revoke all active sessions for{" "}
              <span className="font-semibold text-foreground/80">{displayName}</span>.
              They will not be able to sign in until reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 sm:space-x-3">
            <AlertDialogCancel className="rounded-md h-9 text-xs border-border/50 shadow-none font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-md h-9 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-none font-semibold cursor-pointer"
              onClick={() => onDeactivate()}
            >
              Turn off access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetPasswordConfirm} onOpenChange={setShowResetPasswordConfirm}>
        <AlertDialogContent className="rounded-md border-border/70 shadow-xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-semibold tracking-tight text-xl">
              Send password reset?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-relaxed text-muted-foreground/80">
              A password reset link will be sent to{" "}
              <span className="font-semibold text-foreground/80">{user.email}</span>.
              The link expires in 24 hours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 sm:space-x-3">
            <AlertDialogCancel className="rounded-md h-9 text-xs border-border/50 shadow-none font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-md h-9 text-xs font-semibold cursor-pointer"
              onClick={() => onResetPassword()}
            >
              Send link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSignOutAllConfirm} onOpenChange={setShowSignOutAllConfirm}>
        <AlertDialogContent className="rounded-md border-border/70 shadow-xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-semibold tracking-tight text-xl">
              Sign out everywhere?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-relaxed text-muted-foreground/80">
              This will immediately invalidate all {counts.sessions} active session(s) for{" "}
              <span className="font-semibold text-foreground/80">{displayName}</span>.
              They will need to sign in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 sm:space-x-3">
            <AlertDialogCancel className="rounded-md h-9 text-xs border-border/50 shadow-none font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-md h-9 text-xs font-semibold cursor-pointer shadow-xs"
              onClick={() => onSignOutAll()}
            >
              Sign out all sessions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
