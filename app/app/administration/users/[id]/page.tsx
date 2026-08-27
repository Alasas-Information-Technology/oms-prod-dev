"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  ArrowLeft,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Mail,
  RotateCcw,
  Edit,
  Building2,
  Shield,
  Key,
  Calendar,
  Activity,
  Layers,
  Sparkles,
  Phone,
  Briefcase,
  Hash,
  Clock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useUserDetail,
  useEffectivePermissions,
  useUserRoles,
  useUserScopes,
  useUserDelegations,
  useDeactivateUser,
  useReactivateUser,
  useUnlockUser,
  useInviteUser,
  useResetPassword,
} from "@/hooks/useAuthorization";
import { usePermission } from "@/hooks/usePermission";
import { UserStatusBadge, computeUserStatus } from "@/components/users/UserStatusBadge";
import { UserRolesTimeline } from "@/components/users/UserRolesTimeline";
import { UserScopeCoverageCard } from "@/components/users/UserScopeCoverageCard";
import { UserPermissionsList } from "@/components/users/UserPermissionsList";
import { UserDelegationsPanel } from "@/components/users/UserDelegationsPanel";
import { UserActivityTimeline } from "@/components/users/UserActivityTimeline";
import { AssignRoleDialog } from "@/components/users/AssignRoleDialog";
import { AssignScopeDialog } from "@/components/users/AssignScopeDialog";
import { AddOverrideDialog } from "@/components/users/AddOverrideDialog";
import { CreateDelegationDialog } from "@/components/users/CreateDelegationDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { toast } from "sonner";
import { format } from "date-fns";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params?.id as string;
  const router = useRouter();
  const { can } = usePermission();

  const [activeTab, setActiveTab] = React.useState<string>("overview");

  // Modal Dialog States
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = React.useState(false);
  const [isAssignScopeOpen, setIsAssignScopeOpen] = React.useState(false);
  const [isAddOverrideOpen, setIsAddOverrideOpen] = React.useState(false);
  const [isCreateDelegationOpen, setIsCreateDelegationOpen] = React.useState(false);

  // Queries
  const { data: user, isLoading: isUserLoading } = useUserDetail(userId);
  const { data: effectivePerms, isLoading: isPermsLoading } = useEffectivePermissions(userId);
  const { data: rolesData = [] } = useUserRoles(userId);
  const { data: scopesData = [] } = useUserScopes(userId);
  const { data: delegationsData = [] } = useUserDelegations(userId);

  const roles = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];
  const scopes = Array.isArray(scopesData) ? scopesData : (scopesData as any)?.data || [];
  const delegations = Array.isArray(delegationsData) ? delegationsData : (delegationsData as any)?.data || [];

  // Lifecycle Mutations
  const deactivateMutation = useDeactivateUser();
  const reactivateMutation = useReactivateUser();
  const unlockMutation = useUnlockUser();
  const inviteMutation = useInviteUser();
  const resetPasswordMutation = useResetPassword();

  const status = user ? computeUserStatus(user) : "ACTIVE";

  const handleDeactivate = async () => {
    if (!user) return;
    try {
      await deactivateMutation.mutateAsync(userId);
      toast.success(`User [${user.username}] deactivated.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to deactivate");
    }
  };

  const handleReactivate = async () => {
    if (!user) return;
    try {
      await reactivateMutation.mutateAsync(userId);
      toast.success(`User [${user.username}] reactivated.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to reactivate");
    }
  };

  const handleUnlock = async () => {
    if (!user) return;
    try {
      await unlockMutation.mutateAsync(userId);
      toast.success(`Account for [${user.username}] unlocked.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to unlock");
    }
  };

  const handleResendInvite = async () => {
    if (!user) return;
    try {
      await inviteMutation.mutateAsync({ id: userId, resend: true });
      toast.success(`Onboarding invitation re-sent for [${user.username}].`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to resend invite");
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    try {
      await resetPasswordMutation.mutateAsync(userId);
      toast.success(`Password reset link dispatched to [${user.email}].`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to dispatch reset link");
    }
  };

  if (isUserLoading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Loading user account details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">User Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested user account does not exist or has been deleted.
        </p>
        <Button onClick={() => router.push("/app/administration/users")}>
          Back to Users List
        </Button>
      </div>
    );
  }

  const initials =
    (user.profile?.firstName?.[0] || "") +
    (user.profile?.lastName?.[0] || "") ||
    user.username.substring(0, 2).toUpperCase();

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Navigation Breadcrumb & Back */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button
          onClick={() => router.push("/app/administration/users")}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Users</span>
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">{user.username}</span>
      </div>

      {/* User Header Profile Card */}
      <div className="p-6 rounded-2xl border bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 border-2 border-primary/20 shadow-xs">
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {user.profile?.displayName || user.username}
              </h1>
              <UserStatusBadge user={user} />
              <Badge
                variant="outline"
                className={
                  user.userType === "VENDOR"
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-xs font-semibold"
                    : "bg-muted text-foreground text-xs font-medium"
                }
              >
                {user.userType}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="font-mono">@{user.username}</span>
              <span>•</span>
              <span className="font-mono">{user.email}</span>
              {user.profile?.employeeId && (
                <>
                  <span>•</span>
                  <span>ID: {user.profile.employeeId}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Edit Profile */}
          {can("USER.UPDATE") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="gap-1.5"
            >
              <Edit className="size-4" />
              Edit Profile
            </Button>
          )}

          {/* Unlock Action if Locked */}
          {status === "LOCKED" && can("USER.UNLOCK") && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnlock}
              className="gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <Unlock className="size-4" />
              Unlock Account
            </Button>
          )}

          {/* Resend Invitation if Invited */}
          {status === "INVITED" && can("USER.INVITE") && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendInvite}
              className="gap-1.5 text-sky-600 border-sky-200 hover:bg-sky-50"
            >
              <Mail className="size-4" />
              Resend Invitation
            </Button>
          )}

          {/* Reset Password */}
          {can("USER.RESET_PASSWORD") && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetPassword}
              className="gap-1.5"
            >
              <RotateCcw className="size-4" />
              Reset Password
            </Button>
          )}

          {/* Deactivate / Reactivate */}
          {user.isActive && can("USER.DEACTIVATE") && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeactivate}
              className="gap-1.5 text-rose-600 hover:bg-rose-50"
            >
              <UserX className="size-4" />
              Deactivate
            </Button>
          )}

          {!user.isActive && can("USER.REACTIVATE") && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReactivate}
              className="gap-1.5 text-emerald-600 hover:bg-emerald-50"
            >
              <UserCheck className="size-4" />
              Reactivate
            </Button>
          )}
        </div>
      </div>

      {/* 6 Detail Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl border flex flex-wrap gap-1">
          <TabsTrigger value="overview" className="text-xs gap-1.5 rounded-lg font-medium">
            <Users className="size-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="roles" className="text-xs gap-1.5 rounded-lg font-medium">
            <Shield className="size-3.5" />
            Roles ({roles.length})
          </TabsTrigger>
          <TabsTrigger value="scope" className="text-xs gap-1.5 rounded-lg font-medium">
            <Building2 className="size-3.5" />
            Scope ({scopes.length})
          </TabsTrigger>
          <TabsTrigger value="permissions" className="text-xs gap-1.5 rounded-lg font-medium">
            <Key className="size-3.5" />
            What They Can Do ({effectivePerms?.permissions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="delegations" className="text-xs gap-1.5 rounded-lg font-medium">
            <Calendar className="size-3.5" />
            Delegations ({delegations.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs gap-1.5 rounded-lg font-medium">
            <Activity className="size-3.5" />
            Activity Trail
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal & Profile Info */}
            <Card className="border-border/60 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-semibold">User Details</CardTitle>
                <CardDescription>Primary profile and contact attributes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Full Name:</span>
                  <span className="font-semibold text-foreground">
                    {user.profile?.displayName || `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Username:</span>
                  <span className="font-mono text-foreground font-medium">@{user.username}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-mono text-foreground font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Job Title:</span>
                  <span className="text-foreground font-medium">{user.profile?.jobTitle || "—"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Phone Number:</span>
                  <span className="text-foreground font-medium">{user.profile?.phoneNumber || "—"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Employee ID:</span>
                  <span className="font-mono text-foreground font-medium">{user.profile?.employeeId || "—"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Organization Placement */}
            <Card className="border-border/60 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Organizational Placement</CardTitle>
                <CardDescription>Department and business unit hierarchy.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Organization:</span>
                  <span className="text-foreground font-medium">{user.profile?.organizationName || "Dubai Integrated Economic Zones"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Business Unit:</span>
                  <span className="text-foreground font-medium">{user.profile?.businessUnitName || "—"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="text-foreground font-semibold">{user.profile?.departmentName || "—"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Section / Sub-team:</span>
                  <span className="text-foreground font-medium">{user.profile?.sectionName || "—"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Roles (Timeline) */}
        <TabsContent value="roles">
          <UserRolesTimeline
            userId={userId}
            roles={roles}
            onOpenAssignDialog={() => setIsAssignRoleOpen(true)}
          />
        </TabsContent>

        {/* Tab 3: Scope (OrgUnitPicker + Feedback) */}
        <TabsContent value="scope">
          <UserScopeCoverageCard
            userId={userId}
            scopes={scopes}
            onOpenAssignDialog={() => setIsAssignScopeOpen(true)}
          />
        </TabsContent>

        {/* Tab 4: Permissions ("What they can do") */}
        <TabsContent value="permissions">
          <UserPermissionsList
            userId={userId}
            effectiveData={effectivePerms}
            isLoading={isPermsLoading}
            onOpenOverrideDialog={() => setIsAddOverrideOpen(true)}
          />
        </TabsContent>

        {/* Tab 5: Delegations */}
        <TabsContent value="delegations">
          <UserDelegationsPanel
            userId={userId}
            userName={user.profile?.displayName || user.username}
            delegations={delegations}
            onOpenCreateDialog={() => setIsCreateDelegationOpen(true)}
          />
        </TabsContent>

        {/* Tab 6: Activity Trail */}
        <TabsContent value="activity">
          <UserActivityTimeline
            userId={userId}
            createdAt={user.createdAt}
            updatedAt={user.updatedAt}
            failedLoginCount={user.failedLoginCount}
            lockedUntil={user.lockedUntil}
          />
        </TabsContent>
      </Tabs>

      {/* Modals & Dialogs */}
      <EditUserDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={user}
      />

      <AssignRoleDialog
        open={isAssignRoleOpen}
        onOpenChange={setIsAssignRoleOpen}
        userId={userId}
        userName={user.profile?.displayName || user.username}
      />

      <AssignScopeDialog
        open={isAssignScopeOpen}
        onOpenChange={setIsAssignScopeOpen}
        userId={userId}
        userName={user.profile?.displayName || user.username}
      />

      <AddOverrideDialog
        open={isAddOverrideOpen}
        onOpenChange={setIsAddOverrideOpen}
        userId={userId}
        userName={user.profile?.displayName || user.username}
      />

      <CreateDelegationDialog
        open={isCreateDelegationOpen}
        onOpenChange={setIsCreateDelegationOpen}
        fromUserId={userId}
        fromUserName={user.profile?.displayName || user.username}
      />
    </div>
  );
}
