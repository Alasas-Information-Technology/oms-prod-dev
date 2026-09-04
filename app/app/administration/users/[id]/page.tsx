"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageBarActions, usePageBarDispatch } from "@/components/ui/layouts/page-bar-context";
import { AddOverrideDialog } from "@/components/users/AddOverrideDialog";
import { CreateDelegationDialog } from "@/components/users/CreateDelegationDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { ForceChangePasswordDialog } from "@/components/users/ForceChangePasswordDialog";
import { UserActivityTimeline } from "@/components/users/UserActivityTimeline";
import { UserDelegationsPanel } from "@/components/users/UserDelegationsPanel";
import { UserPanelCard, UserPanelRow } from "@/components/users/UserPanelCard";
import { UserPermissionsList } from "@/components/users/UserPermissionsList";
import { UserProfileCard } from "@/components/users/UserProfileCard";
import { StagedRoleState, UserRolesSection } from "@/components/users/UserRolesSection";
import { StagedScopeState, UserScopeSection } from "@/components/users/UserScopeSection";
import { computeUserStatus } from "@/components/users/UserStatusBadge";
import {
  useAssignRole,
  useAssignScope,
  useDeactivateUser,
  useEffectivePermissions,
  useInviteUser,
  useReactivateUser,
  useResetPassword,
  useRevokeRole,
  useRevokeScope,
  useRevokeUserSessions,
  useUnlockUser,
  useUserDelegations,
  useUserDetail,
  useUserRoles,
  useUserScopes,
  useUserSessions,
} from "@/hooks/useAuthorization";
import { usePermission } from "@/hooks/usePermission";
import {
  getPlainErrorMessage,
  SCOPE_LEVEL_DEFINITIONS
} from "@/lib/constants/user-admin.constants";
import {
  IDelegationDto,
  IUserRoleAssignmentDto,
  IUserScopeAssignmentDto,
} from "@/lib/types/authorization.types";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Edit,
  Lock,
  RotateCcw,
  Save,
  Users
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

const EMPTY_ROLES: IUserRoleAssignmentDto[] = [];
const EMPTY_SCOPES: IUserScopeAssignmentDto[] = [];
const EMPTY_ARRAY: any[] = [];

type TabKey = "overview" | "roles" | "access" | "permissions" | "delegations" | "activity";

function UserDetailPageContent() {
  const params = useParams();
  const userId = params?.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can } = usePermission();
  const { setCustomCrumbs } = usePageBarDispatch();

  // Tab State & Deep Linking (§Part 3 & Part 5)
  const tabParam = searchParams.get("tab");
  const activeTab: TabKey = React.useMemo(() => {
    if (!tabParam) return "overview";
    if (tabParam === "scope" || tabParam === "access") return "access";
    if (tabParam === "roles") return "roles";
    if (tabParam === "permissions") return "permissions";
    if (tabParam === "delegations") return "delegations";
    if (tabParam === "activity") return "activity";
    return "overview";
  }, [tabParam]);

  // Modal Dialog States
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isAddOverrideOpen, setIsAddOverrideOpen] = React.useState(false);
  const [isCreateDelegationOpen, setIsCreateDelegationOpen] = React.useState(false);
  const [isForceChangePasswordOpen, setIsForceChangePasswordOpen] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  // Immediate Action Dialogs (Moved into UserProfileCard, only keeping unused state references to not break existing callbacks for now, will clean up)
  const [showDeactivateConfirm, setShowDeactivateConfirm] = React.useState(false);
  const [showResetPasswordConfirm, setShowResetPasswordConfirm] = React.useState(false);

  // Tab Transition Guard State (§Part 5)
  const [pendingTabTransition, setPendingTabTransition] = React.useState<TabKey | null>(null);
  const [showTabUnsavedModal, setShowTabUnsavedModal] = React.useState(false);
  const [showDangerousRoleModal, setShowDangerousRoleModal] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Queries
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    refetch: refetchUser,
  } = useUserDetail(userId);

  const { data: serverRolesData, refetch: refetchRoles } = useUserRoles(userId);
  const serverRoles: IUserRoleAssignmentDto[] = Array.isArray(serverRolesData)
    ? serverRolesData
    : Array.isArray((serverRolesData as any)?.data)
      ? (serverRolesData as any).data
      : EMPTY_ROLES;

  const { data: serverScopesData, refetch: refetchScopes } = useUserScopes(userId);
  const serverScopes: IUserScopeAssignmentDto[] = Array.isArray(serverScopesData)
    ? serverScopesData
    : Array.isArray((serverScopesData as any)?.data)
      ? (serverScopesData as any).data
      : EMPTY_SCOPES;

  const { data: effectivePerms, isLoading: isPermsLoading, refetch: refetchPerms } =
    useEffectivePermissions(userId);
  const { data: delegationsData, refetch: refetchDelegations } = useUserDelegations(userId);
  const delegations: IDelegationDto[] = Array.isArray(delegationsData)
    ? delegationsData
    : Array.isArray((delegationsData as any)?.data)
      ? (delegationsData as any).data
      : EMPTY_ARRAY;

  const { data: sessionsData } = useUserSessions(userId, {
    enabled: Boolean(userId) && (can("USER.UPDATE") || can("USER.DEACTIVATE")),
  });
  const sessions = Array.isArray(sessionsData)
    ? sessionsData
    : Array.isArray((sessionsData as any)?.data)
      ? (sessionsData as any).data
      : EMPTY_ARRAY;
  const activeSessionCount = sessions.length;

  const displayName = user
    ? user.profile?.displayName ||
    `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() ||
    user.username
    : "User Details";

  // Sync breadcrumb with application shell PageBar (§Part 2, 4, 5 of APP-SHELL-SPEC)
  React.useEffect(() => {
    if (user) {
      setCustomCrumbs([
        { label: "Administration", href: "/app/administration/users" },
        { label: "Users", href: `/app/administration/users?selected=${userId}` },
        { label: displayName, isCurrent: true },
      ]);
    }
    return () => setCustomCrumbs(null);
  }, [user?.userId, userId, displayName, setCustomCrumbs]);

  // Staged Roles State (§Part 3.5 & Part 5)
  const [stagedRoles, setStagedRoles] = React.useState<Map<string, StagedRoleState>>(new Map());

  // Staged Scope State (§Part 3.6 & Part 5)
  const [stagedScope, setStagedScope] = React.useState<StagedScopeState>({
    levelCode: "SELF_ONLY",
    scopeDefinitionId: "",
    orgUnitId: null,
    orgUnitName: null,
  });

  // Sync server data to staged state
  React.useEffect(() => {
    if (!serverRolesData) return;
    const rolesList: IUserRoleAssignmentDto[] = Array.isArray(serverRolesData)
      ? serverRolesData
      : Array.isArray((serverRolesData as any)?.data)
        ? (serverRolesData as any).data
        : [];

    const map = new Map<string, StagedRoleState>();
    rolesList.forEach((r) => {
      if (r.isActive !== false) {
        map.set(r.roleCode, {
          roleCode: r.roleCode,
          roleId: r.roleId,
          isAssigned: true,
          effectiveFrom: r.effectiveFrom,
          effectiveTo: r.effectiveTo || undefined,
        });
      }
    });
    setStagedRoles(map);
  }, [serverRolesData]);

  React.useEffect(() => {
    if (!serverScopesData) return;
    const scopesList: IUserScopeAssignmentDto[] = Array.isArray(serverScopesData)
      ? serverScopesData
      : Array.isArray((serverScopesData as any)?.data)
        ? (serverScopesData as any).data
        : [];

    const activeScope = scopesList.find((s) => s.isActive !== false);
    if (activeScope) {
      const code = (activeScope.scopeCode || "").toUpperCase();
      let levelCode: StagedScopeState["levelCode"] = "SELF_ONLY";
      if (code === "GLOBAL" || code === "ORGANIZATION") levelCode = "GLOBAL";
      else if (code === "BUSINESS_UNIT") levelCode = "BUSINESS_UNIT";
      else if (code === "DEPARTMENT") levelCode = "DEPARTMENT";
      else if (code === "SECTION") levelCode = "SECTION";

      const def = SCOPE_LEVEL_DEFINITIONS.find((l) => l.code === levelCode);

      setStagedScope({
        levelCode,
        scopeDefinitionId: activeScope.scopeDefinitionId || def?.scopeDefinitionId || "",
        orgUnitId:
          activeScope.orgUnitId ||
          activeScope.departmentId ||
          activeScope.businessUnitId ||
          activeScope.sectionId ||
          null,
        orgUnitName: activeScope.orgUnitName || null,
      });
    } else {
      setStagedScope({
        levelCode: "SELF_ONLY",
        scopeDefinitionId: "",
        orgUnitId: null,
        orgUnitName: null,
      });
    }
  }, [serverScopesData]);

  // Dirty State Computations (§Part 5)
  const isRolesDirty = React.useMemo(() => {
    const serverActive = serverRoles.filter((r) => r.isActive !== false);
    const stagedActive = Array.from(stagedRoles.values()).filter((r) => r.isAssigned);

    if (serverActive.length !== stagedActive.length) return true;

    for (const staged of stagedActive) {
      const found = serverActive.find((s) => s.roleCode === staged.roleCode);
      if (!found) return true;
      if (staged.effectiveFrom !== found.effectiveFrom) return true;
      if (staged.effectiveTo !== (found.effectiveTo || undefined)) return true;
    }
    return false;
  }, [serverRoles, stagedRoles]);

  const isScopeDirty = React.useMemo(() => {
    const activeServerScope = serverScopes.find((s) => s.isActive !== false);
    if (!activeServerScope && stagedScope.levelCode === "SELF_ONLY") return false;
    if (!activeServerScope && stagedScope.levelCode !== "SELF_ONLY") return true;
    if (activeServerScope && stagedScope.levelCode === "SELF_ONLY") return true;

    if (activeServerScope) {
      const serverCode = activeServerScope.scopeCode.toUpperCase();
      let serverLevel: StagedScopeState["levelCode"] = "SELF_ONLY";
      if (serverCode === "GLOBAL" || serverCode === "ORGANIZATION") serverLevel = "GLOBAL";
      else if (serverCode === "BUSINESS_UNIT") serverLevel = "BUSINESS_UNIT";
      else if (serverCode === "DEPARTMENT") serverLevel = "DEPARTMENT";
      else if (serverCode === "SECTION") serverLevel = "SECTION";

      if (serverLevel !== stagedScope.levelCode) return true;
      const serverOrgUnitId =
        activeServerScope.orgUnitId ||
        activeServerScope.departmentId ||
        activeServerScope.businessUnitId ||
        activeServerScope.sectionId ||
        null;
      if (serverOrgUnitId !== (stagedScope.orgUnitId || null)) return true;
    }
    return false;
  }, [serverScopes, stagedScope]);

  // Current Active Tab Dirty Status
  const isCurrentTabDirty = (activeTab === "roles" && isRolesDirty) || (activeTab === "access" && isScopeDirty);

  // Derived metrics with hooks (must be unconditionally called before early returns)
  const permissionsCount = React.useMemo(() => {
    if (!effectivePerms) return 0;
    if (Array.isArray((effectivePerms as any).permissions)) return (effectivePerms as any).permissions.length;
    if (Array.isArray(effectivePerms)) return (effectivePerms as any).length;
    if (Array.isArray((effectivePerms as any).data)) return (effectivePerms as any).data.length;
    return 0;
  }, [effectivePerms]);

  const invitationSentDate = React.useMemo(() => {
    if (!user?.createdAt) return null;
    try {
      const parsed = new Date(user.createdAt);
      return !isNaN(parsed.getTime())
        ? formatDistanceToNow(parsed, { addSuffix: true })
        : null;
    } catch {
      return null;
    }
  }, [user?.createdAt]);

  // Mutations
  const deactivateMutation = useDeactivateUser();
  const reactivateMutation = useReactivateUser();
  const unlockMutation = useUnlockUser();
  const inviteMutation = useInviteUser();
  const resetPasswordMutation = useResetPassword();
  const revokeSessionsMutation = useRevokeUserSessions();
  const assignRoleMutation = useAssignRole();
  const revokeRoleMutation = useRevokeRole();
  const assignScopeMutation = useAssignScope();
  const revokeScopeMutation = useRevokeScope();

  // Tab switching with unsaved changes guard (§Part 5)
  const navigateToTab = (newTab: TabKey) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("tab", newTab);
    router.replace(`/app/administration/users/${userId}?${nextParams.toString()}`, { scroll: false });
  };

  const handleTabChange = (targetTab: string) => {
    const newTab = (targetTab === "scope" ? "access" : targetTab) as TabKey;
    if (newTab === activeTab) return;

    if (isCurrentTabDirty) {
      setPendingTabTransition(newTab);
      setShowTabUnsavedModal(true);
    } else {
      navigateToTab(newTab);
    }
  };

  // Revert / Discard current tab changes
  const handleDiscardCurrentTab = () => {
    if (activeTab === "roles") {
      const map = new Map<string, StagedRoleState>();
      serverRoles.forEach((r) => {
        if (r.isActive !== false) {
          map.set(r.roleCode, {
            roleCode: r.roleCode,
            roleId: r.roleId,
            isAssigned: true,
            effectiveFrom: r.effectiveFrom,
            effectiveTo: r.effectiveTo || undefined,
          });
        }
      });
      setStagedRoles(map);
    } else if (activeTab === "access") {
      const activeScope = serverScopes.find((s) => s.isActive !== false);
      if (activeScope) {
        const code = activeScope.scopeCode.toUpperCase();
        let levelCode: StagedScopeState["levelCode"] = "SELF_ONLY";
        if (code === "GLOBAL" || code === "ORGANIZATION") levelCode = "GLOBAL";
        else if (code === "BUSINESS_UNIT") levelCode = "BUSINESS_UNIT";
        else if (code === "DEPARTMENT") levelCode = "DEPARTMENT";
        else if (code === "SECTION") levelCode = "SECTION";

        const def = SCOPE_LEVEL_DEFINITIONS.find((l) => l.code === levelCode);

        setStagedScope({
          levelCode,
          scopeDefinitionId: activeScope.scopeDefinitionId || def?.scopeDefinitionId || "",
          orgUnitId:
            activeScope.orgUnitId ||
            activeScope.departmentId ||
            activeScope.businessUnitId ||
            activeScope.sectionId ||
            null,
          orgUnitName: activeScope.orgUnitName || null,
        });
      } else {
        setStagedScope({
          levelCode: "SELF_ONLY",
          scopeDefinitionId: "",
          orgUnitId: null,
          orgUnitName: null,
        });
      }
    }
  };

  // Staged Role Updates
  const handleToggleRole = (roleCode: string, roleId: string) => {
    setStagedRoles((prev) => {
      const next = new Map(prev);
      const existing = next.get(roleCode);
      if (existing && existing.isAssigned) {
        next.set(roleCode, { ...existing, isAssigned: false });
      } else {
        next.set(roleCode, {
          roleCode,
          roleId,
          isAssigned: true,
          effectiveFrom: existing?.effectiveFrom,
          effectiveTo: existing?.effectiveTo,
        });
      }
      return next;
    });
  };

  const handleUpdateRoleDates = (
    roleCode: string,
    roleId: string,
    effectiveFrom?: string,
    effectiveTo?: string
  ) => {
    setStagedRoles((prev) => {
      const next = new Map(prev);
      const existing = next.get(roleCode);
      next.set(roleCode, {
        roleCode,
        roleId,
        isAssigned: existing ? existing.isAssigned : true,
        effectiveFrom,
        effectiveTo,
      });
      return next;
    });
  };

  // Save current tab modifications (§Part 5)
  const handleSaveCurrentTab = async () => {
    if (!userId) return;

    if (activeTab === "roles") {
      const activeCount = Array.from(stagedRoles.values()).filter((r) => r.isAssigned).length;
      if (activeCount === 0 && serverRoles.filter((r) => r.isActive !== false).length > 0) {
        setShowDangerousRoleModal(true);
        return;
      }
    }

    await executeSave();
  };

  const executeSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === "roles") {
        const serverMap = new Map(serverRoles.map((r) => [r.roleCode, r]));

        for (const [code, staged] of Array.from(stagedRoles.entries())) {
          const serverRole = serverMap.get(code);

          if (staged.isAssigned) {
            const needsUpdate =
              !serverRole ||
              serverRole.isActive === false ||
              serverRole.effectiveFrom !== staged.effectiveFrom ||
              (serverRole.effectiveTo || undefined) !== staged.effectiveTo;

            if (needsUpdate) {
              await assignRoleMutation.mutateAsync({
                userId,
                dto: {
                  roleId: staged.roleId,
                  effectiveFrom: staged.effectiveFrom,
                  effectiveTo: staged.effectiveTo,
                },
              });
            }
          } else if (serverRole && serverRole.isActive !== false) {
            await revokeRoleMutation.mutateAsync({
              userId,
              roleId: serverRole.roleId,
            });
          }
        }

        toast.success("Roles updated successfully.");
        await Promise.all([refetchRoles(), refetchPerms(), refetchUser()]);
      } else if (activeTab === "access") {
        if (stagedScope.levelCode === "SELF_ONLY") {
          for (const s of serverScopes.filter((s) => s.isActive !== false)) {
            await revokeScopeMutation.mutateAsync({
              userId,
              scopeId: s.userOrganizationScopeId,
            });
          }
        } else {
          await assignScopeMutation.mutateAsync({
            userId,
            dto: {
              scopeDefinitionId: stagedScope.scopeDefinitionId,
              orgUnitId: stagedScope.orgUnitId || undefined,
            },
          });

          for (const s of serverScopes.filter((s) => s.isActive !== false)) {
            if (
              s.scopeDefinitionId !== stagedScope.scopeDefinitionId ||
              s.orgUnitId !== stagedScope.orgUnitId
            ) {
              await revokeScopeMutation.mutateAsync({
                userId,
                scopeId: s.userOrganizationScopeId,
              });
            }
          }
        }

        toast.success("Organizational visibility updated successfully.");
        await Promise.all([refetchScopes(), refetchPerms(), refetchUser()]);
      }
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      const msg = getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Immediate Action Handlers (Overview Tab)
  const handleToggleActive = async (checked: boolean) => {
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
    try {
      await inviteMutation.mutateAsync({ id: userId, resend: true });
      toast.success(`Onboarding invitation re-sent to ${user?.email}.`);
      refetchUser();
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      toast.error(getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message));
    }
  };

  const handleConfirmResetPassword = async () => {
    try {
      setShowResetPasswordConfirm(false);
      await resetPasswordMutation.mutateAsync(userId);
      toast.success(`Password reset invitation sent to ${user?.email}.`);
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      toast.error(getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message));
    }
  };

  const handleConfirmSignOutAll = async () => {
    try {
      await revokeSessionsMutation.mutateAsync(userId);
      toast.success(`Signed out everywhere for ${displayName}.`);
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      toast.error(getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message));
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`Copied ${fieldName} to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Loading and Error states
  if (isUserLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-44 rounded-md bg-card/60 border border-border/60 animate-pulse" />
        <div className="h-12 w-96 rounded-md bg-card/60 border border-border/60 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 rounded-md bg-card/60 border border-border/60 animate-pulse" />
          <div className="h-64 rounded-md bg-card/60 border border-border/60 animate-pulse" />
        </div>
      </div>
    );
  }

  // Out-of-scope / Not Found: Renders genuine not-found per Requirement 8
  if (isUserError || !user) {
    return (
      <div className="p-16 max-w-md mx-auto text-center space-y-5">
        <div className="size-16 rounded-md bg-muted/60 border border-border/80 flex items-center justify-center text-muted-foreground mx-auto shadow-xs">
          <Users className="size-8 text-muted-foreground/70" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold font-display text-foreground">Person not found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The requested account could not be found or is no longer available in the organizational directory.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2 text-xs rounded-md h-9">
          <Link href="/app/administration/users">
            <ArrowLeft className="size-3.5" />
            Back to people list
          </Link>
        </Button>
      </div>
    );
  }

  const initials =
    (user.profile?.firstName?.[0] || "") + (user.profile?.lastName?.[0] || "") ||
    user.username.substring(0, 2).toUpperCase();

  const userStatus = computeUserStatus(user);
  const isLocked = userStatus === "LOCKED";
  const isInvited = userStatus === "INVITED";
  const isActive = Boolean(user.isActive);

  const activeRoleList = serverRoles.filter((r) => r.isActive !== false);
  const primaryRoleCode = activeRoleList[0]?.roleCode || user.roles?.[0];
  const activeRolesCount = activeRoleList.length;

  const activeScopeList = serverScopes.filter((s) => s.isActive !== false);
  const primaryScope = activeScopeList[0];
  const activeScopesCount = activeScopeList.length;

  const activeDelegationsList = delegations.filter((d: IDelegationDto) => d.isActive);
  const delegationsCount = activeDelegationsList.length;

  const canManageActive = can("USER.DEACTIVATE") || can("USER.REACTIVATE");
  const canUnlock = can("USER.UNLOCK");
  const canInvite = can("USER.INVITE");
  const canResetPassword = can("USER.RESET_PASSWORD");
  const canRevokeSessions = can("USER.UPDATE") || can("USER.DEACTIVATE");

  return (
    <div className="p-6 space-y-6 animate-in fade-in-50 duration-200">
      {/* Action Injection into Shell Page Bar */}
      <PageBarActions>
        <div className="flex items-center gap-2">
          {/* Staged Tab Dirty Actions */}
          {isCurrentTabDirty && (
            <div className="flex items-center gap-2 animate-in fade-in-50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDiscardCurrentTab}
                disabled={isSaving}
                className="h-9 text-xs rounded-md cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveCurrentTab}
                disabled={isSaving}
                className="h-9 text-xs rounded-md shadow-xs gap-1.5 font-semibold cursor-pointer"
              >
                <Save className="size-3.5" />
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          )}

          {can("USER.UPDATE") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="h-9 text-xs rounded-md gap-1.5 cursor-pointer font-medium"
            >
              <Edit className="size-3.5 text-muted-foreground" />
              Edit profile
            </Button>
          )}
        </div>
      </PageBarActions>

      {/* Main Grid Layout (Part 1) */}
      <div className="grid grid-cols-1 min-[1100px]:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Left Column: Profile Card */}
        <UserProfileCard
          user={user}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={{
            roles: activeRolesCount,
            access: activeScopesCount,
            permissions: permissionsCount,
            delegations: delegationsCount,
            sessions: activeSessionCount,
          }}
          primaryRoleCode={primaryRoleCode}
          onDeactivate={handleConfirmDeactivate}
          onResetPassword={handleConfirmResetPassword}
          onForceChangePassword={() => setIsForceChangePasswordOpen(true)}
          onSignOutAll={handleConfirmSignOutAll}
        />

        {/* Right Column: Tab Content */}
        <div className="min-w-0">
          <div className="space-y-6">


            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in-30">

                {/* Recent Activity */}
                <UserPanelCard
                  title="Recent activity"
                  headerAction={
                    <button
                      type="button"
                      className="text-primary hover:underline text-[13px] font-medium flex items-center gap-1"
                      onClick={() => handleTabChange("activity")}
                    >
                      See all <ChevronRight className="size-3" />
                    </button>
                  }
                >
                  <UserPanelRow>
                    <div className="flex items-center gap-3">
                      <span className="w-[120px] text-muted-foreground font-medium shrink-0">
                        {user.createdAt ? format(new Date(user.createdAt), "d MMM yyyy") : "—"}
                      </span>
                      <span className="text-foreground">Account created</span>
                    </div>
                  </UserPanelRow>
                  {user.updatedAt && user.updatedAt !== user.createdAt && (
                    <UserPanelRow>
                      <div className="flex items-center gap-3">
                        <span className="w-[120px] text-muted-foreground font-medium shrink-0">
                          {format(new Date(user.updatedAt), "d MMM yyyy")}
                        </span>
                        <span className="text-foreground">Profile or security settings updated</span>
                      </div>
                    </UserPanelRow>
                  )}
                  {!!user.failedLoginCount && user.failedLoginCount > 0 && (
                    <UserPanelRow>
                      <div className="flex items-center gap-3 text-rose-600">
                        <span className="w-[120px] text-rose-600/70 font-medium shrink-0">
                          Recent
                        </span>
                        <span className="font-medium">Failed sign-in attempt</span>
                      </div>
                    </UserPanelRow>
                  )}
                </UserPanelCard>

                {/* Account */}
                <UserPanelCard title="Account">
                  <UserPanelRow>
                    <span className="text-muted-foreground w-1/3">Status</span>
                    <div className="w-2/3 flex items-center gap-2">
                      {computeUserStatus(user) === "ACTIVE" && <span className="flex items-center gap-2 font-medium"><span className="size-2 rounded-full bg-emerald-500" />Active</span>}
                      {computeUserStatus(user) === "LOCKED" && <span className="flex items-center gap-2 font-medium text-rose-600"><span className="size-2 rounded-full bg-rose-500" />Locked out</span>}
                      {computeUserStatus(user) === "INVITED" && <span className="flex items-center gap-2 font-medium text-sky-600"><span className="size-2 rounded-full bg-sky-500" />Hasn&apos;t signed in yet</span>}
                      {computeUserStatus(user) === "INACTIVE" && <span className="flex items-center gap-2 font-medium text-muted-foreground"><span className="size-2 rounded-full bg-muted-foreground" />Access turned off</span>}
                    </div>
                  </UserPanelRow>
                  <UserPanelRow>
                    <span className="text-muted-foreground w-1/3">Last signed in</span>
                    <span className="w-2/3 text-foreground font-medium">
                      Never
                    </span>
                  </UserPanelRow>
                  <UserPanelRow>
                    <span className="text-muted-foreground w-1/3">Invitation</span>
                    <span className="w-2/3 text-foreground font-medium">
                      {user.createdAt ? `Sent ${format(new Date(user.createdAt), "d MMM yyyy")}` : "—"}
                    </span>
                  </UserPanelRow>
                  {computeUserStatus(user) === "LOCKED" && (
                    <UserPanelRow className="bg-rose-50/50 dark:bg-rose-950/20 border-t-0 shadow-[inset_0_1px_0_theme(colors.rose.200)] dark:shadow-[inset_0_1px_0_theme(colors.rose.900/60)]">
                      <span className="text-rose-700 dark:text-rose-400 w-1/3 font-medium">Lockout state</span>
                      <span className="w-2/3 font-medium flex items-center gap-2 text-rose-700 dark:text-rose-400">
                        <Lock className="size-3.5" />
                        Locked after {user.failedLoginCount || 5} failed sign-in attempts
                        {canManageActive && (
                          <button
                            type="button"
                            onClick={handleUnlock}
                            disabled={unlockMutation.isPending}
                            className="ml-auto underline hover:no-underline text-rose-600 dark:text-rose-400 cursor-pointer disabled:opacity-50"
                          >
                            {unlockMutation.isPending ? "Unlocking..." : "Unlock account"}
                          </button>
                        )}
                      </span>
                    </UserPanelRow>
                  )}
                </UserPanelCard>

                {/* Details */}
                <UserPanelCard
                  title="Details"
                  headerAction={
                    can("USER.UPDATE") ? (
                      <button
                        type="button"
                        className="text-primary hover:underline text-[13px] font-medium flex items-center gap-1 cursor-pointer"
                        onClick={() => setIsEditOpen(true)}
                      >
                        <Edit className="size-3" /> Edit
                      </button>
                    ) : null
                  }
                >
                  <UserPanelRow>
                    <span className="text-muted-foreground w-1/3">Full Name</span>
                    <span className="w-2/3 text-foreground font-medium">{displayName}</span>
                  </UserPanelRow>
                  <UserPanelRow>
                    <span className="text-muted-foreground w-1/3">Username</span>
                    <span className="w-2/3 text-foreground font-medium font-mono">@{user.username}</span>
                  </UserPanelRow>
                  <UserPanelRow>
                    <span className="text-muted-foreground w-1/3">Email</span>
                    <span className="w-2/3 text-foreground font-medium font-mono">{user.email}</span>
                  </UserPanelRow>
                  <UserPanelRow>
                    <span className="text-muted-foreground w-1/3">Job Title</span>
                    <span className="w-2/3 text-foreground font-medium">{user.profile?.jobTitle || "—"}</span>
                  </UserPanelRow>
                  <UserPanelRow>
                    <span className="text-muted-foreground w-1/3">Department</span>
                    <span className="w-2/3 text-foreground font-medium">{user.profile?.departmentName || "—"}</span>
                  </UserPanelRow>
                  <UserPanelRow>
                    <span className="text-muted-foreground w-1/3">User Type</span>
                    <span className="w-2/3 text-foreground font-medium flex items-center gap-2">
                      {user.userType === "VENDOR" ? (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Vendor</Badge>
                      ) : (
                        "Staff"
                      )}
                    </span>
                  </UserPanelRow>
                </UserPanelCard>
              </div>
            )}

            {/* Tab 2: Roles (§Part 3.5) */}
            {user.userType !== "VENDOR" && activeTab === "roles" && (
              <div className="space-y-6 animate-in fade-in-30">
                <Card className="border-border/70 shadow-xs bg-card/80 backdrop-blur-sm rounded-md">
                  <CardContent className="pt-6">
                    <UserRolesSection
                      user={user}
                      serverRoles={serverRoles}
                      stagedRoles={stagedRoles}
                      onToggleRole={handleToggleRole}
                      onUpdateRoleDates={handleUpdateRoleDates}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab 3: Access (§Part 3.6 — "What they can see") */}
            {user.userType !== "VENDOR" && activeTab === "access" && (
              <div className="space-y-6 animate-in fade-in-30">
                <Card className="border-border/70 shadow-xs bg-card/80 backdrop-blur-sm rounded-md">
                  <CardContent className="pt-6">
                    <UserScopeSection
                      user={user}
                      serverScopes={serverScopes}
                      stagedScope={stagedScope}
                      onChangeScope={setStagedScope}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab 4: Permissions (§Part 3.7 — Full Audit View) */}
            {activeTab === "permissions" && (
              <div className="space-y-6 animate-in fade-in-30">
                <UserPermissionsList
                  userId={userId}
                  effectiveData={effectivePerms}
                  isLoading={isPermsLoading}
                  onOpenOverrideDialog={() => setIsAddOverrideOpen(true)}
                />
              </div>
            )}

            {/* Tab 5: Standing in (§Part 3.8) */}
            {activeTab === "delegations" && (
              <div className="space-y-6 animate-in fade-in-30">
                <UserDelegationsPanel
                  userId={userId}
                  userName={displayName}
                  delegations={delegations}
                  onOpenCreateDialog={() => setIsCreateDelegationOpen(true)}
                />
              </div>
            )}

            {/* Tab 6: Activity */}
            {activeTab === "activity" && (
              <div className="space-y-6 animate-in fade-in-30">
                <UserActivityTimeline
                  userId={userId}
                  createdAt={user.createdAt}
                  updatedAt={user.updatedAt}
                  failedLoginCount={user.failedLoginCount}
                  lockedUntil={user.lockedUntil}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation & Modal Dialogs */}
      {user && (
        <>
          <EditUserDialog open={isEditOpen} onOpenChange={setIsEditOpen} user={user} />
          <ForceChangePasswordDialog
            open={isForceChangePasswordOpen}
            onOpenChange={setIsForceChangePasswordOpen}
            user={user}
          />
        </>
      )}

      {/* Special Access Override Dialog */}
      <AddOverrideDialog
        open={isAddOverrideOpen}
        onOpenChange={setIsAddOverrideOpen}
        userId={userId}
        userName={displayName}
      />

      {/* Create Standing-in Arrangement Dialog */}
      <CreateDelegationDialog
        open={isCreateDelegationOpen}
        onOpenChange={setIsCreateDelegationOpen}
        fromUserId={userId}
        fromUserName={displayName}
      />

      {/* Confirmation Dialog: Turn off access */}
      <AlertDialog open={showDeactivateConfirm} onOpenChange={setShowDeactivateConfirm}>
        <AlertDialogContent className="rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600 font-display">
              <AlertTriangle className="size-5 text-rose-600" />
              Turn off access for {displayName}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground leading-relaxed">
              They&apos;ll be signed out immediately and won&apos;t be able to sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeactivate}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs rounded-md"
            >
              Turn off access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog: Ask to set new password */}
      <AlertDialog open={showResetPasswordConfirm} onOpenChange={setShowResetPasswordConfirm}>
        <AlertDialogContent className="rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-display">
              <RotateCcw className="size-5 text-primary" />
              Ask them to set a new password?
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              We&apos;ll send an email to <strong className="text-foreground">{user.email}</strong> with a secure link to establish a new password. Administrators never set or see user passwords.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmResetPassword} className="shadow-xs rounded-md">
              Send password link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>



      {/* Unsaved Tab Transition Modal (§Part 5) */}
      <AlertDialog open={showTabUnsavedModal} onOpenChange={setShowTabUnsavedModal}>
        <AlertDialogContent className="rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Save your changes to {activeTab === "roles" ? "roles" : "access"} first?
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              You have unsaved changes on the current tab. If you leave without saving, your changes will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowTabUnsavedModal(false);
                setPendingTabTransition(null);
              }}
              className="rounded-md"
            >
              Stay
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                handleDiscardCurrentTab();
                setShowTabUnsavedModal(false);
                if (pendingTabTransition) {
                  navigateToTab(pendingTabTransition);
                  setPendingTabTransition(null);
                }
              }}
              className="text-rose-600 hover:text-rose-700 rounded-md"
            >
              Discard changes
            </Button>
            <Button
              onClick={async () => {
                setShowTabUnsavedModal(false);
                await executeSave();
                if (pendingTabTransition) {
                  navigateToTab(pendingTabTransition);
                  setPendingTabTransition(null);
                }
              }}
              className="shadow-xs rounded-md"
            >
              Save changes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dangerous Changes Confirmation Modal (§Part 4 & 5) */}
      <AlertDialog open={showDangerousRoleModal} onOpenChange={setShowDangerousRoleModal}>
        <AlertDialogContent className="rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600 font-display">
              <AlertTriangle className="size-5 text-rose-600" />
              Remove all roles for {displayName}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground leading-relaxed">
              You are removing all assigned roles from <strong className="text-foreground">{displayName}</strong>. They will be able to sign in but will have no operational capabilities until a role is granted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setShowDangerousRoleModal(false);
                await executeSave();
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs rounded-md"
            >
              Confirm and remove roles
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function UserDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-6 space-y-6 animate-pulse">
          <div className="h-44 rounded-md bg-card/60 border border-border/60" />
          <div className="h-12 w-96 rounded-md bg-card/60 border border-border/60" />
        </div>
      }
    >
      <UserDetailPageContent />
    </React.Suspense>
  );
}
