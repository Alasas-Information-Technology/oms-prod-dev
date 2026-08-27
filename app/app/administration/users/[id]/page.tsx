"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  LogOut,
  Save,
  AlertTriangle,
  ExternalLink,
  Plus,
  Clock,
  Sparkles,
  Copy,
  Check,
  Phone,
  Briefcase,
  Hash,
  Layers,
  ChevronRight,
  ShieldCheck,
  UserCog,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { PageBarActions, usePageBarDispatch } from "@/components/ui/layouts/page-bar-context";
import {
  useUserDetail,
  useEffectivePermissions,
  useUserRoles,
  useUserScopes,
  useUserDelegations,
  useUserSessions,
  useDeactivateUser,
  useReactivateUser,
  useUnlockUser,
  useInviteUser,
  useResetPassword,
  useRevokeUserSessions,
  useAssignRole,
  useRevokeRole,
  useAssignScope,
  useRevokeScope,
} from "@/hooks/useAuthorization";
import { usePermission } from "@/hooks/usePermission";
import { UserStatusBadge, computeUserStatus } from "@/components/users/UserStatusBadge";
import { RoleChip } from "@/components/users/RoleChip";
import { UserRolesSection, StagedRoleState } from "@/components/users/UserRolesSection";
import { UserScopeSection, StagedScopeState } from "@/components/users/UserScopeSection";
import { UserPermissionsList } from "@/components/users/UserPermissionsList";
import { UserDelegationsPanel } from "@/components/users/UserDelegationsPanel";
import { UserActivityTimeline } from "@/components/users/UserActivityTimeline";
import { AddOverrideDialog } from "@/components/users/AddOverrideDialog";
import { CreateDelegationDialog } from "@/components/users/CreateDelegationDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import {
  getPlainErrorMessage,
  getRoleDisplayName,
  getRoleExplanation,
  getScopeLevelDisplayName,
  SCOPE_LEVEL_DEFINITIONS,
} from "@/lib/constants/user-admin.constants";
import {
  IUserRoleAssignmentDto,
  IUserScopeAssignmentDto,
  IDelegationDto,
} from "@/lib/types/authorization.types";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

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
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  // Immediate Action Dialogs
  const [showDeactivateConfirm, setShowDeactivateConfirm] = React.useState(false);
  const [showResetPasswordConfirm, setShowResetPasswordConfirm] = React.useState(false);
  const [showSignOutAllConfirm, setShowSignOutAllConfirm] = React.useState(false);

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
      setShowSignOutAllConfirm(false);
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
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="h-44 rounded-2xl bg-card/60 border border-border/60 animate-pulse" />
        <div className="h-12 w-96 rounded-xl bg-card/60 border border-border/60 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-card/60 border border-border/60 animate-pulse" />
          <div className="h-64 rounded-2xl bg-card/60 border border-border/60 animate-pulse" />
        </div>
      </div>
    );
  }

  // Out-of-scope / Not Found: Renders genuine not-found per Requirement 8
  if (isUserError || !user) {
    return (
      <div className="p-16 max-w-md mx-auto text-center space-y-5">
        <div className="size-16 rounded-2xl bg-muted/60 border border-border/80 flex items-center justify-center text-muted-foreground mx-auto shadow-xs">
          <Users className="size-8 text-muted-foreground/70" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold font-display text-foreground">Person not found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The requested account could not be found or is no longer available in the organizational directory.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2 text-xs rounded-xl h-9">
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
    <div className="p-6 md:p-8 max-w-6xl w-full mx-auto space-y-6 animate-in fade-in-50 duration-200">
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
                className="h-9 text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveCurrentTab}
                disabled={isSaving}
                className="h-9 text-xs rounded-xl shadow-xs gap-1.5 font-semibold cursor-pointer"
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
              className="h-9 text-xs rounded-xl gap-1.5 cursor-pointer font-medium"
            >
              <Edit className="size-3.5 text-muted-foreground" />
              Edit profile
            </Button>
          )}
        </div>
      </PageBarActions>

      {/* Hero Identity Banner Block */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-card/90 via-card/60 to-background/80 p-6 md:p-7 shadow-xs backdrop-blur-sm">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-5 min-w-0">
            {/* Avatar with status beacon */}
            <div className="relative shrink-0">
              <Avatar className="size-16 border-2 border-primary/20 shadow-sm ring-4 ring-primary/5">
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary font-display">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-card shadow-xs ${
                  isActive
                    ? "bg-emerald-500"
                    : isLocked
                    ? "bg-rose-500"
                    : isInvited
                    ? "bg-sky-500"
                    : "bg-zinc-400"
                }`}
                title={userStatus}
              />
            </div>

            <div className="space-y-2 min-w-0">
              {/* Title & Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground font-display truncate">
                  {displayName}
                </h1>
                {primaryRoleCode && <RoleChip roleCode={primaryRoleCode} />}
                <UserStatusBadge user={user} />
                <Badge
                  variant="outline"
                  className={
                    user.userType === "VENDOR"
                      ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 text-xs font-semibold rounded-lg"
                      : "bg-muted/70 text-muted-foreground text-xs font-medium rounded-lg"
                  }
                >
                  {user.userType === "VENDOR" ? "Vendor" : "Staff"}
                </Badge>
              </div>

              {/* Contact & Placement Metadata Chips */}
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-mono">
                  <Mail className="size-3.5 text-muted-foreground/70" />
                  <span className="text-foreground/90">{user.email}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(user.email, "email")}
                    className="hover:text-foreground p-0.5 text-muted-foreground/60 transition-colors"
                    title="Copy email"
                  >
                    {copiedField === "email" ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>

                <span className="text-muted-foreground/30">•</span>

                <div className="flex items-center gap-1.5 font-mono text-muted-foreground">
                  <span>@{user.username}</span>
                </div>

                {user.profile?.employeeId && (
                  <>
                    <span className="text-muted-foreground/30">•</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <Hash className="size-3.5 text-muted-foreground/70" />
                      <span>{user.profile.employeeId}</span>
                    </div>
                  </>
                )}

                {user.profile?.departmentName && (
                  <>
                    <span className="text-muted-foreground/30">•</span>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-muted-foreground/70" />
                      <span className="text-foreground/80 font-medium">
                        {user.profile.departmentName}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick KPI Overview Bar */}
        <div className="mt-6 pt-4 border-t border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-background/50 border border-border/50 space-y-1 shadow-2xs hover:bg-background/80 transition-colors">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Shield className="size-3.5 text-primary" />
              <span>Roles</span>
            </div>
            <div className="text-sm font-semibold text-foreground truncate">
              {activeRolesCount === 0 ? (
                <span className="text-amber-600 dark:text-amber-400 font-normal">No role assigned</span>
              ) : (
                <span>
                  {getRoleDisplayName(primaryRoleCode || "ROLE")}
                  {activeRolesCount > 1 && ` +${activeRolesCount - 1}`}
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-background/50 border border-border/50 space-y-1 shadow-2xs hover:bg-background/80 transition-colors">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Building2 className="size-3.5 text-primary" />
              <span>Access Scope</span>
            </div>
            <div className="text-sm font-semibold text-foreground truncate">
              {getScopeLevelDisplayName(primaryScope?.scopeCode)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-background/50 border border-border/50 space-y-1 shadow-2xs hover:bg-background/80 transition-colors">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Key className="size-3.5 text-primary" />
              <span>Permissions</span>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {permissionsCount} {permissionsCount === 1 ? "permission" : "permissions"}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-background/50 border border-border/50 space-y-1 shadow-2xs hover:bg-background/80 transition-colors">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Users className="size-3.5 text-primary" />
              <span>Delegations</span>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {delegationsCount > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {delegationsCount} active arrangement{delegationsCount !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-muted-foreground font-normal">Direct authority only</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Underline Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="w-full justify-start rounded-none border-b border-border/80 bg-transparent p-0 h-auto gap-7 flex-wrap">
          <TabsTrigger
            value="overview"
            className="group rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent shadow-none transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserCog className="size-4" />
            <span>Overview</span>
          </TabsTrigger>

          {user.userType !== "VENDOR" && (
            <TabsTrigger
              value="roles"
              className="group rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <Shield className="size-4" />
              <span>Roles</span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-muted group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary text-muted-foreground font-semibold">
                {activeRolesCount}
              </span>
            </TabsTrigger>
          )}

          {user.userType !== "VENDOR" && (
            <TabsTrigger
              value="access"
              className="group rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="size-4" />
              <span>Access Scope</span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-muted group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary text-muted-foreground font-semibold">
                {activeScopesCount}
              </span>
            </TabsTrigger>
          )}

          <TabsTrigger
            value="permissions"
            className="group rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent shadow-none transition-all flex items-center gap-2 cursor-pointer"
          >
            <Key className="size-4" />
            <span>Permissions</span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-muted group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary text-muted-foreground font-semibold">
              {permissionsCount}
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="delegations"
            className="group rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent shadow-none transition-all flex items-center gap-2 cursor-pointer"
          >
            <Users className="size-4" />
            <span>Delegations</span>
            {delegationsCount > 0 && (
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                {delegationsCount}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="activity"
            className="group rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent shadow-none transition-all flex items-center gap-2 cursor-pointer"
          >
            <Activity className="size-4" />
            <span>Activity</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview (Bento Grid) */}
        <TabsContent value="overview" className="space-y-6 animate-in fade-in-30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bento Card 1: Personal & Contact Profile */}
            <Card className="border-border/70 shadow-xs bg-card/80 backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-3.5 border-b border-border/50">
                <CardTitle className="text-base font-semibold font-display flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <UserCog className="size-4 text-primary" />
                    <span>Personal Profile</span>
                  </div>
                  {can("USER.UPDATE") && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditOpen(true)}
                      className="h-7 text-xs px-2.5 gap-1.5 text-muted-foreground hover:text-foreground rounded-lg"
                    >
                      <Edit className="size-3" />
                      Edit
                    </Button>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  Identity attributes and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <UserCog className="size-3.5 text-muted-foreground/70" />
                    Full Name
                  </span>
                  <span className="font-semibold text-foreground">{displayName}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Hash className="size-3.5 text-muted-foreground/70" />
                    Username
                  </span>
                  <span className="font-mono text-foreground font-medium">@{user.username}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Mail className="size-3.5 text-muted-foreground/70" />
                    Email Address
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-foreground font-medium">{user.email}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(user.email, "email")}
                      className="hover:text-foreground text-muted-foreground/60 transition-colors"
                      title="Copy email"
                    >
                      {copiedField === "email" ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Briefcase className="size-3.5 text-muted-foreground/70" />
                    Job Title
                  </span>
                  <span className="text-foreground font-medium">{user.profile?.jobTitle || "—"}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Phone className="size-3.5 text-muted-foreground/70" />
                    Phone Number
                  </span>
                  <span className="text-foreground font-medium">{user.profile?.phoneNumber || "—"}</span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Hash className="size-3.5 text-muted-foreground/70" />
                    Employee ID
                  </span>
                  <span className="font-mono text-foreground font-medium">{user.profile?.employeeId || "—"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Bento Card 2: Organizational Tree Placement */}
            <Card className="border-border/70 shadow-xs bg-card/80 backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-3.5 border-b border-border/50">
                <CardTitle className="text-base font-semibold font-display flex items-center gap-2.5">
                  <Building2 className="size-4 text-primary" />
                  <span>Organizational Placement</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Position within the corporate hierarchy.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-4 text-xs">
                {/* Visual Tree Connector */}
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                  {/* Org */}
                  <div className="relative flex items-center justify-between">
                    <div className="absolute -left-6 size-5 rounded-full bg-card border-2 border-primary/40 flex items-center justify-center">
                      <span className="size-1.5 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Organization
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {user.profile?.organizationName || "Dubai Integrated Economic Zones"}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-muted/40 font-mono">
                      DIEZ
                    </Badge>
                  </div>

                  {/* Business Unit */}
                  <div className="relative flex items-center justify-between">
                    <div className="absolute -left-6 size-5 rounded-full bg-card border-2 border-border flex items-center justify-center">
                      <span className="size-1.5 rounded-full bg-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Business Unit
                      </p>
                      <p className="text-xs font-medium text-foreground">
                        {user.profile?.businessUnitName || "—"}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-muted/40 font-mono">
                      BU
                    </Badge>
                  </div>

                  {/* Department */}
                  <div className="relative flex items-center justify-between">
                    <div className="absolute -left-6 size-5 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                      <span className="size-1.5 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-primary font-semibold">
                        Department
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {user.profile?.departmentName || "—"}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30 font-mono">
                      Dept
                    </Badge>
                  </div>

                  {/* Section */}
                  <div className="relative flex items-center justify-between">
                    <div className="absolute -left-6 size-5 rounded-full bg-card border-2 border-border flex items-center justify-center">
                      <span className="size-1.5 rounded-full bg-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Section / Sub-team
                      </p>
                      <p className="text-xs font-medium text-foreground">
                        {user.profile?.sectionName || "—"}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-muted/40 font-mono">
                      Section
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bento Card 3: Security & Credentials Command */}
          <Card className="border-border/70 shadow-xs bg-card/80 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-3.5 border-b border-border/50">
              <CardTitle className="text-base font-semibold font-display flex items-center gap-2.5">
                <ShieldCheck className="size-4 text-primary" />
                <span>Security & Credentials</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Manage sign-in status, lockout security, and active sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Account active Toggle Card */}
              {canManageActive && (
                <div className="p-4 rounded-xl border border-border/70 bg-background/60 flex items-center justify-between gap-4 shadow-2xs">
                  <div className="space-y-1">
                    <Label
                      htmlFor="detail-account-active"
                      className="font-semibold text-sm text-foreground cursor-pointer flex items-center gap-2"
                    >
                      <span>Account Active</span>
                      {isActive ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20 text-[10px]">
                          Turned off
                        </Badge>
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isActive
                        ? "This person can sign in and exercise their assigned operational capabilities."
                        : "Access is turned off. This person cannot sign in."}
                    </p>
                  </div>
                  <Switch
                    id="detail-account-active"
                    checked={isActive}
                    onCheckedChange={handleToggleActive}
                    disabled={deactivateMutation.isPending || reactivateMutation.isPending}
                    className="cursor-pointer"
                  />
                </div>
              )}

              {/* Locked out alert */}
              {isLocked && canUnlock && (
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/90 dark:border-rose-900/60 dark:bg-rose-950/30 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in-50">
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                      <Lock className="size-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs text-rose-900 dark:text-rose-200">
                        Locked out
                      </div>
                      <p className="text-xs text-rose-800/90 dark:text-rose-400">
                        Locked after {user.failedLoginCount || 5} failed sign-in attempts.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnlock}
                    disabled={unlockMutation.isPending}
                    className="border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/50 text-xs h-8 shrink-0 gap-1.5 rounded-xl cursor-pointer"
                  >
                    <Unlock className="size-3.5" />
                    {unlockMutation.isPending ? "Unlocking..." : "Unlock account"}
                  </Button>
                </div>
              )}

              {/* Hasn't signed in yet alert */}
              {isInvited && canInvite && (
                <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/90 dark:border-sky-900/60 dark:bg-sky-950/30 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in-50">
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-lg bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center shrink-0 text-sky-600 dark:text-sky-400">
                      <Mail className="size-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs text-sky-900 dark:text-sky-200">
                        Hasn&apos;t signed in yet
                      </div>
                      <p className="text-xs text-sky-800/90 dark:text-sky-400">
                        {invitationSentDate
                          ? `Invitation sent ${invitationSentDate}.`
                          : "Onboarding invitation has been dispatched to corporate email."}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendInvite}
                    disabled={inviteMutation.isPending}
                    className="border-sky-300 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-900/50 text-xs h-8 shrink-0 gap-1.5 rounded-xl cursor-pointer"
                  >
                    <Mail className="size-3.5" />
                    {inviteMutation.isPending ? "Sending..." : "Resend invitation"}
                  </Button>
                </div>
              )}

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {canResetPassword && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResetPasswordConfirm(true)}
                    disabled={resetPasswordMutation.isPending}
                    className="w-full justify-start text-xs h-10 gap-2.5 text-foreground font-normal hover:bg-muted/80 rounded-xl cursor-pointer border-border/70"
                  >
                    <RotateCcw className="size-4 text-muted-foreground shrink-0" />
                    <span>Ask them to set a new password</span>
                  </Button>
                )}

                {canRevokeSessions && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSignOutAllConfirm(true)}
                    disabled={revokeSessionsMutation.isPending}
                    className="w-full justify-start text-xs h-10 gap-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-border/70 font-normal rounded-xl cursor-pointer"
                  >
                    <LogOut className="size-4 shrink-0" />
                    <span>
                      Sign them out everywhere
                      {activeSessionCount > 0 && ` (${activeSessionCount})`}
                    </span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Roles (§Part 3.5) */}
        {user.userType !== "VENDOR" && (
          <TabsContent value="roles" className="space-y-6 animate-in fade-in-30">
            <Card className="border-border/70 shadow-xs bg-card/80 backdrop-blur-sm rounded-2xl">
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
          </TabsContent>
        )}

        {/* Tab 3: Access (§Part 3.6 — "What they can see") */}
        {user.userType !== "VENDOR" && (
          <TabsContent value="access" className="space-y-6 animate-in fade-in-30">
            <Card className="border-border/70 shadow-xs bg-card/80 backdrop-blur-sm rounded-2xl">
              <CardContent className="pt-6">
                <UserScopeSection
                  user={user}
                  serverScopes={serverScopes}
                  stagedScope={stagedScope}
                  onChangeScope={setStagedScope}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Tab 4: What they can do (§Part 3.7 — Full Audit View) */}
        <TabsContent value="permissions" className="space-y-6 animate-in fade-in-30">
          <UserPermissionsList
            userId={userId}
            effectiveData={effectivePerms}
            isLoading={isPermsLoading}
            onOpenOverrideDialog={() => setIsAddOverrideOpen(true)}
          />
        </TabsContent>

        {/* Tab 5: Standing in (§Part 3.8) */}
        <TabsContent value="delegations" className="space-y-6 animate-in fade-in-30">
          <UserDelegationsPanel
            userId={userId}
            userName={displayName}
            delegations={delegations}
            onOpenCreateDialog={() => setIsCreateDelegationOpen(true)}
          />
        </TabsContent>

        {/* Tab 6: Activity */}
        <TabsContent value="activity" className="space-y-6 animate-in fade-in-30">
          <UserActivityTimeline
            userId={userId}
            createdAt={user.createdAt}
            updatedAt={user.updatedAt}
            failedLoginCount={user.failedLoginCount}
            lockedUntil={user.lockedUntil}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <EditUserDialog open={isEditOpen} onOpenChange={setIsEditOpen} user={user} />

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
        <AlertDialogContent className="rounded-2xl">
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
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeactivate}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs rounded-xl"
            >
              Turn off access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog: Ask to set new password */}
      <AlertDialog open={showResetPasswordConfirm} onOpenChange={setShowResetPasswordConfirm}>
        <AlertDialogContent className="rounded-2xl">
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
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmResetPassword} className="shadow-xs rounded-xl">
              Send password link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog: Sign out everywhere */}
      <AlertDialog open={showSignOutAllConfirm} onOpenChange={setShowSignOutAllConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600 font-display">
              <LogOut className="size-5 text-rose-600" />
              Sign them out everywhere?
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              This will immediately invalidate all active sessions across browsers and devices for <strong className="text-foreground">{displayName}</strong>. They will need to sign in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSignOutAll}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs rounded-xl"
            >
              Sign out everywhere
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsaved Tab Transition Modal (§Part 5) */}
      <AlertDialog open={showTabUnsavedModal} onOpenChange={setShowTabUnsavedModal}>
        <AlertDialogContent className="rounded-2xl">
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
              className="rounded-xl"
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
              className="text-rose-600 hover:text-rose-700 rounded-xl"
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
              className="shadow-xs rounded-xl"
            >
              Save changes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dangerous Changes Confirmation Modal (§Part 4 & 5) */}
      <AlertDialog open={showDangerousRoleModal} onOpenChange={setShowDangerousRoleModal}>
        <AlertDialogContent className="rounded-2xl">
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
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setShowDangerousRoleModal(false);
                await executeSave();
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs rounded-xl"
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
        <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-44 rounded-2xl bg-card/60 border border-border/60" />
          <div className="h-12 w-96 rounded-xl bg-card/60 border border-border/60" />
        </div>
      }
    >
      <UserDetailPageContent />
    </React.Suspense>
  );
}
