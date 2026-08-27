"use client";

import {
  RoleChip,
  SummaryCard,
  SummaryCardRow,
  UserAvatar,
  UserStatusBadge,
} from "@/components/oms/users";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/components/ui/utils";
import { useAuth } from "@/context/AuthContext";
import {
  useAssignRole,
  useAssignScope,
  useEffectivePermissions,
  useRevokeRole,
  useRevokeScope,
  useUserDetail,
  useUserRoles,
  useUserScopes,
} from "@/hooks/useAuthorization";
import {
  getPlainErrorMessage,
  SCOPE_LEVEL_DEFINITIONS,
} from "@/lib/constants/user-admin.constants";
import {
  IUserRoleAssignmentDto,
  IUserScopeAssignmentDto,
} from "@/lib/types/authorization.types";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Building2,
  Clock,
  Key,
  Save,
  Shield,
  Users,
  X
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { UserAccessSection } from "./UserAccessSection";
import { StagedRoleState, UserRolesSection } from "./UserRolesSection";
import { StagedScopeState, UserScopeSection } from "./UserScopeSection";

const EMPTY_ROLES: IUserRoleAssignmentDto[] = [];
const EMPTY_SCOPES: IUserScopeAssignmentDto[] = [];

export interface UserDetailPanelProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  isDirty?: boolean;
  onSave?: () => Promise<void> | void;
  onDiscard?: () => void;
  isSaving?: boolean;
  onOpenPermissionsModal?: () => void;
  onOpenActivityModal?: () => void;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Slide-over Panel Skeleton matching the real 520px layout.
 */
function UserDetailPanelSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col h-full bg-background animate-pulse">
      {/* Header Skeleton */}
      <div className="p-6 border-b border-border/80 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3.5 w-32" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="size-8 rounded-lg">
          <X className="size-4" />
        </Button>
      </div>

      {/* Body Skeleton */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 4 Summary Cards Skeleton */}
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60">
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="size-4 rounded" />
          </div>
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <Skeleton className="size-4 rounded" />
          </div>
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="size-4 rounded" />
          </div>
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="size-4 rounded" />
          </div>
        </div>

        {/* Section Skeleton */}
        <div className="p-4 rounded-xl border border-border/80 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Not-found state when user does not exist or is out-of-scope.
 * Security rule: Renders genuine not found rather than 403 Access Denied.
 */
function UserDetailNotFound({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b flex justify-end">
        <Button variant="ghost" size="icon" onClick={onClose} className="size-8 rounded-lg">
          <X className="size-4" />
        </Button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Users className="size-6" />
        </div>
        <h3 className="font-semibold text-lg text-foreground">Person not found</h3>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          The requested account could not be found or is no longer available in the organizational directory.
        </p>
        <Button variant="outline" size="sm" onClick={onClose} className="mt-2">
          Close panel
        </Button>
      </div>
    </div>
  );
}

export function UserDetailPanel({
  userId,
  isOpen,
  onClose,
  isDirty: externalIsDirty,
  onSave: externalOnSave,
  onDiscard: externalOnDiscard,
  isSaving: externalIsSaving,
  onOpenPermissionsModal,
  onOpenActivityModal,
  children,
  className,
}: UserDetailPanelProps) {
  const [showUnsavedGuard, setShowUnsavedGuard] = React.useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [internalIsSaving, setInternalIsSaving] = React.useState(false);
  const { user: currentAdmin } = useAuth();

  // Queries
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useUserDetail(userId ?? undefined, {
    enabled: isOpen && Boolean(userId),
  });

  const { data: serverRolesData } = useUserRoles(userId ?? undefined, {
    enabled: isOpen && Boolean(userId),
  });
  const serverRoles: IUserRoleAssignmentDto[] = Array.isArray(serverRolesData)
    ? serverRolesData
    : Array.isArray((serverRolesData as any)?.data)
      ? (serverRolesData as any).data
      : EMPTY_ROLES;

  const { data: serverScopesData } = useUserScopes(userId ?? undefined, {
    enabled: isOpen && Boolean(userId),
  });
  const serverScopes: IUserScopeAssignmentDto[] = Array.isArray(serverScopesData)
    ? serverScopesData
    : Array.isArray((serverScopesData as any)?.data)
      ? (serverScopesData as any).data
      : EMPTY_SCOPES;

  const { data: effectivePerms } = useEffectivePermissions(userId ?? undefined, {
    enabled: isOpen && Boolean(userId),
  });

  // Staged Roles State (§Part 4)
  const [stagedRoles, setStagedRoles] = React.useState<Map<string, StagedRoleState>>(new Map());

  // Staged Scope State (§Part 3.6 & Part 4)
  const [stagedScope, setStagedScope] = React.useState<StagedScopeState>({
    levelCode: "SELF_ONLY",
    scopeDefinitionId: "",
    orgUnitId: null,
    orgUnitName: null,
  });

  // Mutations
  const assignRoleMutation = useAssignRole();
  const revokeRoleMutation = useRevokeRole();
  const assignScopeMutation = useAssignScope();
  const revokeScopeMutation = useRevokeScope();

  // Sync staged roles whenever server roles update
  React.useEffect(() => {
    if (serverRolesData) {
      const map = new Map<string, StagedRoleState>();
      serverRolesData.forEach((r) => {
        if (r.isActive !== false) {
          map.set(r.roleCode, {
            roleCode: r.roleCode,
            roleId: r.roleId,
            isAssigned: true,
            effectiveFrom: r.effectiveFrom,
            effectiveTo: r.effectiveTo,
          });
        }
      });
      setStagedRoles(map);
    } else if (!userId) {
      setStagedRoles(new Map());
    }
  }, [serverRolesData, userId]);

  // Sync staged scope whenever server scopes update
  React.useEffect(() => {
    if (serverScopesData) {
      const activeScope = serverScopesData.find((s) => s.isActive !== false);
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
          orgUnitId: activeScope.orgUnitId || activeScope.departmentId || activeScope.businessUnitId || activeScope.sectionId || null,
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
    } else if (!userId) {
      setStagedScope({
        levelCode: "SELF_ONLY",
        scopeDefinitionId: "",
        orgUnitId: null,
        orgUnitName: null,
      });
    }
  }, [serverScopesData, userId]);

  // Compute dirty state
  const isRolesDirty = React.useMemo(() => {
    const serverActiveCodes = new Set(
      serverRoles.filter((r) => r.isActive !== false).map((r) => r.roleCode)
    );
    const stagedActiveCodes = new Set(
      Array.from(stagedRoles.values())
        .filter((r) => r.isAssigned)
        .map((r) => r.roleCode)
    );

    if (serverActiveCodes.size !== stagedActiveCodes.size) return true;
    for (const code of stagedActiveCodes) {
      if (!serverActiveCodes.has(code)) return true;
      const staged = stagedRoles.get(code);
      const server = serverRoles.find((r) => r.roleCode === code && r.isActive !== false);
      if (staged?.effectiveFrom !== server?.effectiveFrom) return true;
      if (staged?.effectiveTo !== server?.effectiveTo) return true;
    }
    return false;
  }, [serverRoles, stagedRoles]);

  const isScopeDirty = React.useMemo(() => {
    const activeScope = serverScopes.find((s) => s.isActive !== false);
    if (!activeScope) {
      return stagedScope.levelCode !== "SELF_ONLY";
    }
    const serverCode = activeScope.scopeCode.toUpperCase();
    let serverLevel = "SELF_ONLY";
    if (serverCode === "GLOBAL" || serverCode === "ORGANIZATION") serverLevel = "GLOBAL";
    else if (serverCode === "BUSINESS_UNIT") serverLevel = "BUSINESS_UNIT";
    else if (serverCode === "DEPARTMENT") serverLevel = "DEPARTMENT";
    else if (serverCode === "SECTION") serverLevel = "SECTION";

    if (stagedScope.levelCode !== serverLevel) return true;
    const serverUnitId = activeScope.orgUnitId || activeScope.departmentId || activeScope.businessUnitId || activeScope.sectionId || null;
    if ((stagedScope.orgUnitId || null) !== serverUnitId) return true;

    return false;
  }, [serverScopes, stagedScope]);

  const isDirty = externalIsDirty ?? (isRolesDirty || isScopeDirty);
  const isSaving = externalIsSaving ?? internalIsSaving;

  // Staged Role Handlers
  const handleToggleRole = (roleCode: string, roleId: string) => {
    setStagedRoles((prev) => {
      const next = new Map(prev);
      const existing = next.get(roleCode);
      if (existing) {
        next.set(roleCode, { ...existing, isAssigned: !existing.isAssigned });
      } else {
        next.set(roleCode, {
          roleCode,
          roleId,
          isAssigned: true,
          effectiveFrom: new Date().toISOString(),
        });
      }
      return next;
    });
  };

  const handleUpdateRoleDates = (
    roleCode: string,
    roleId: string,
    effectiveFrom?: string,
    effectiveTo?: string | null
  ) => {
    setStagedRoles((prev) => {
      const next = new Map(prev);
      const existing = next.get(roleCode) || {
        roleCode,
        roleId,
        isAssigned: true,
      };
      next.set(roleCode, {
        ...existing,
        effectiveFrom,
        effectiveTo,
      });
      return next;
    });
  };

  const handleDiscard = () => {
    if (externalOnDiscard) {
      externalOnDiscard();
    } else {
      // Revert staged roles to server roles
      const map = new Map<string, StagedRoleState>();
      serverRoles.forEach((r) => {
        if (r.isActive !== false) {
          map.set(r.roleCode, {
            roleCode: r.roleCode,
            roleId: r.roleId,
            isAssigned: true,
            effectiveFrom: r.effectiveFrom,
            effectiveTo: r.effectiveTo,
          });
        }
      });
      setStagedRoles(map);

      // Revert staged scope
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
          orgUnitId: activeScope.orgUnitId || null,
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

  const handleSave = async () => {
    if (externalOnSave) {
      await externalOnSave();
      return;
    }

    if (!userId) return;

    // Self-scope modification block
    if (
      currentAdmin?.userId &&
      currentAdmin.userId === userId &&
      stagedScope.levelCode === "SELF_ONLY" &&
      serverScopes.some((s) => s.isActive !== false)
    ) {
      toast.error("You cannot remove your own organizational access.");
      return;
    }

    try {
      setInternalIsSaving(true);

      const serverActiveMap = new Map(
        serverRoles.filter((r) => r.isActive !== false).map((r) => [r.roleCode, r])
      );

      // 1. Roles to Assign
      for (const [code, staged] of stagedRoles.entries()) {
        if (staged.isAssigned && !serverActiveMap.has(code)) {
          await assignRoleMutation.mutateAsync({
            userId,
            dto: {
              roleId: staged.roleId,
              effectiveFrom: staged.effectiveFrom || new Date().toISOString(),
              effectiveTo: staged.effectiveTo || null,
            },
          });
        }
      }

      // 2. Roles to Revoke
      for (const [code, serverRole] of serverActiveMap.entries()) {
        const staged = stagedRoles.get(code);
        if (!staged || !staged.isAssigned) {
          await revokeRoleMutation.mutateAsync({
            userId,
            roleId: serverRole.roleId,
          });
        }
      }

      // 3. Scope Assignment & Revocation (§Part 3.6 & Part 4)
      if (isScopeDirty) {
        if (stagedScope.levelCode === "SELF_ONLY") {
          // Revoke existing scopes
          for (const s of serverScopes.filter((s) => s.isActive !== false)) {
            await revokeScopeMutation.mutateAsync({
              userId,
              scopeId: s.userOrganizationScopeId,
            });
          }
        } else {
          // Assign new scope
          await assignScopeMutation.mutateAsync({
            userId,
            dto: {
              scopeDefinitionId: stagedScope.scopeDefinitionId,
              orgUnitId: stagedScope.orgUnitId || undefined,
            },
          });

          // Revoke old scopes if different
          for (const s of serverScopes.filter((s) => s.isActive !== false)) {
            if (s.scopeDefinitionId !== stagedScope.scopeDefinitionId || s.orgUnitId !== stagedScope.orgUnitId) {
              await revokeScopeMutation.mutateAsync({
                userId,
                scopeId: s.userOrganizationScopeId,
              });
            }
          }
        }
      }

      toast.success("Changes saved successfully.");
    } catch (err: any) {
      const errorCode = err?.response?.data?.code || err?.code;
      const msg = getPlainErrorMessage(errorCode, err?.response?.data?.message || err?.message);
      toast.error(msg);
    } finally {
      setInternalIsSaving(false);
    }
  };

  // Attempt close with dirty state guard
  const handleAttemptClose = () => {
    if (isDirty) {
      setShowUnsavedGuard(true);
    } else {
      onClose();
    }
  };

  // Scroll to internal section anchor
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el && scrollContainerRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!isOpen || !userId) return null;

  // Format values as sentences (§Part 3.3)
  const activeRolesCount = Array.from(stagedRoles.values()).filter((r) => r.isAssigned).length;
  const rolesSentence =
    activeRolesCount === 0
      ? "No roles assigned"
      : activeRolesCount === 1
        ? "1 role"
        : `${activeRolesCount} roles`;

  // Determine Scope sentence
  const isGlobalScope = stagedScope.levelCode === "GLOBAL";
  const scopeSentence = isGlobalScope
    ? "All departments"
    : stagedScope.levelCode === "SELF_ONLY"
      ? "Only their own requests"
      : stagedScope.orgUnitName
        ? `${stagedScope.orgUnitName}`
        : "1 department";

  // Permissions count sentence
  const capabilitiesCount = effectivePerms?.permissions?.length ?? 0;
  const capabilitiesSentence = `${capabilitiesCount} ${capabilitiesCount === 1 ? "thing" : "things"
    }`;

  // Last signed in relative time
  const lastActiveDate = user?.updatedAt || user?.createdAt;
  const lastSignedInSentence = lastActiveDate
    ? formatDistanceToNow(new Date(lastActiveDate), { addSuffix: true })
    : "Never";

  const displayName =
    user?.profile?.displayName ||
    `${user?.profile?.firstName || ""} ${user?.profile?.lastName || ""}`.trim() ||
    user?.username ||
    "Staff Member";

  const primaryRoleCode = serverRoles[0]?.roleCode || user?.roles?.[0];

  return (
    <>
      {/* 520px Slide-over Panel (§Part 1 & §3.2) */}
      <aside
        aria-label="Person details panel"
        className={cn(
          "fixed top-14 right-0 bottom-0 z-40 w-full sm:w-[520px] bg-background border-l border-border/80 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          className
        )}
      >
        {isUserLoading ? (
          <UserDetailPanelSkeleton onClose={handleAttemptClose} />
        ) : isUserError || !user ? (
          <UserDetailNotFound onClose={handleAttemptClose} />
        ) : (
          <div className="flex flex-col h-full">
            {/* Fixed Header (§Part 3.2) */}
            <div className="p-6 border-b border-border/80 bg-background/95 backdrop-blur-xs flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                {/* 56px Avatar */}
                <UserAvatar
                  name={displayName}
                  username={user.username}
                  email={user.email}
                  size={56}
                />

                <div className="space-y-1 min-w-0">
                  {/* Name 20px / 600 */}
                  <h2 className="text-xl font-semibold text-foreground tracking-tight truncate">
                    {displayName}
                  </h2>

                  {/* Email */}
                  <p className="text-xs font-mono text-muted-foreground truncate">
                    {user.email}
                  </p>

                  {/* Badges inline */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {primaryRoleCode && <RoleChip roleCode={primaryRoleCode} />}
                    <UserStatusBadge user={user} />
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAttemptClose}
                aria-label="Close person details panel"
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Scrollable Body (§Part 1) */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
              {/* Four Summary Cards (§Part 3.3) */}
              <SummaryCard>
                {/* 1. Roles -> Scrolls to Roles section */}
                <SummaryCardRow
                  icon={Shield}
                  label="Roles"
                  value={rolesSentence}
                  onClick={() => scrollToSection("roles-section")}
                />

                {/* 2. What they can see -> Scrolls to Scope section */}
                <SummaryCardRow
                  icon={Building2}
                  label="What they can see"
                  value={scopeSentence}
                  onClick={() => scrollToSection("scope-section")}
                />

                {/* 3. What they can do -> Opens full permissions audit modal (§3.7) */}
                <SummaryCardRow
                  icon={Key}
                  label="What they can do"
                  value={capabilitiesSentence}
                  onClick={onOpenPermissionsModal}
                  badge={
                    <Badge variant="secondary" className="text-[10px]">
                      Audit
                    </Badge>
                  }
                />

                {/* 4. Last signed in -> Opens activity history */}
                <SummaryCardRow
                  icon={Clock}
                  label="Last signed in"
                  value={lastSignedInSentence}
                  onClick={onOpenActivityModal}
                />
              </SummaryCard>

              {/* Access Section (§Part 3.4) */}
              <UserAccessSection user={user} />

              {/* Roles Section (§Part 3.5) */}
              <UserRolesSection
                user={user}
                serverRoles={serverRoles}
                stagedRoles={stagedRoles}
                onToggleRole={handleToggleRole}
                onUpdateRoleDates={handleUpdateRoleDates}
              />

              {/* What They Can See (Scope) Section (§Part 3.6) */}
              <UserScopeSection
                user={user}
                serverScopes={serverScopes}
                stagedScope={stagedScope}
                onChangeScope={setStagedScope}
              />

              {/* Additional Child Sections (Standing In, etc.) */}
              {children}
            </div>

            {/* Sticky Footer: Cancel & Save Changes (§Part 1 & Part 4) */}
            {isDirty && (
              <div className="p-4 border-t border-border/80 bg-background/95 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0 shadow-lg animate-in fade-in-50 duration-200">
                <span className="text-xs text-muted-foreground">
                  You have unsaved changes.
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDiscard}
                    disabled={isSaving}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-9 text-xs shadow-xs gap-1.5"
                  >
                    <Save className="size-3.5" />
                    {isSaving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Dirty State Guard Dialog (§Part 4) */}
      <AlertDialog open={showUnsavedGuard} onOpenChange={setShowUnsavedGuard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              You have unsaved changes
            </AlertDialogTitle>
            <AlertDialogDescription>
              Leaving now will discard changes made to <strong>{displayName}</strong>. Would you like to save them before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setShowUnsavedGuard(false)}>
              Keep editing
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => {
                setShowUnsavedGuard(false);
                handleDiscard();
                onClose();
              }}
              className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              Discard changes
            </Button>
            <AlertDialogAction
              onClick={async () => {
                setShowUnsavedGuard(false);
                await handleSave();
                onClose();
              }}
              className="shadow-xs"
            >
              Save changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
