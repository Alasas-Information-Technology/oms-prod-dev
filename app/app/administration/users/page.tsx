"use client";

import { ColumnDef, DataTable, RowAction } from "@/components/shared/DataTable";
import {
  RoleChip,
  UserAvatar,
  UserDetailPanel,
  UserStatusBadge,
} from "@/components/users";
import { OrgUnitPicker } from "@/components/organization/OrgUnitPicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useDeactivateUser,
  useDeleteUser,
  useInviteUser,
  useReactivateUser,
  useResetPassword,
  useUnlockUser,
  useUsers,
} from "@/hooks/useAuthorization";
import { useDebounce } from "@/hooks/useDebounce";
import { usePermission } from "@/hooks/usePermission";
import {
  ROLE_DEFINITIONS,
  getRoleDisplayName
} from "@/lib/constants/user-admin.constants";
import { UserSummaryDto, UserType } from "@/lib/types/authorization.types";
import { OrgUnitSummaryDto } from "@/lib/types/organization.types";
import { formatDistanceToNow } from "date-fns";
import {
  Eye,
  FileSpreadsheet,
  Mail,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Store,
  Trash2,
  Unlock,
  UserCheck,
  UserPlus,
  UserX,
  Users
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

function PeopleListPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { can } = usePermission();

  // Active Tab: "people" | "vendors" | "invite"
  const [activeTab, setActiveTab] = React.useState<"people" | "vendors" | "invite">("people");

  // Selected User for Slide-over Panel (from query param ?selected={id})
  const selectedUserId = searchParams.get("selected");

  // Search & Filter State
  const [searchInput, setSearchInput] = React.useState("");
  const debouncedSearch = useDebounce(searchInput, 500); // 500ms debounce per Rate Tier 5

  const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");
  const [selectedRole, setSelectedRole] = React.useState<string>("ALL");
  const [selectedDepartment, setSelectedDepartment] = React.useState<OrgUnitSummaryDto | null>(null);
  const [hasNoRoleOnly, setHasNoRoleOnly] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(20);

  // Queries & Mutations
  const { data: usersData, isLoading, refetch, isFetching } = useUsers({
    page,
    pageSize,
    search: debouncedSearch || undefined,
    departmentId: selectedDepartment?.orgUnitId || undefined,
    userType: UserType.INTERNAL, // People list is internal staff per Part 1
    status:
      selectedStatus === "ACTIVE"
        ? "ACTIVE"
        : selectedStatus === "INACTIVE"
          ? "INACTIVE"
          : selectedStatus === "INVITED"
            ? "INVITED"
            : selectedStatus === "LOCKED"
              ? "LOCKED"
              : undefined,
    role: selectedRole !== "ALL" ? selectedRole : undefined,
    hasNoRole: hasNoRoleOnly ? true : undefined,
  });

  const deactivateMutation = useDeactivateUser();
  const reactivateMutation = useReactivateUser();
  const unlockMutation = useUnlockUser();
  const deleteMutation = useDeleteUser();
  const inviteMutation = useInviteUser();
  const resetPasswordMutation = useResetPassword();

  // Action Handlers
  const handleDeactivate = async (userId: string, username: string) => {
    try {
      await deactivateMutation.mutateAsync(userId);
      toast.success(`Access turned off for ${username}.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to turn off access");
    }
  };

  const handleReactivate = async (userId: string, username: string) => {
    try {
      await reactivateMutation.mutateAsync(userId);
      toast.success(`Access restored for ${username}.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to restore access");
    }
  };

  const handleUnlock = async (userId: string, username: string) => {
    try {
      await unlockMutation.mutateAsync(userId);
      toast.success(`Account unlocked for ${username}.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to unlock account");
    }
  };

  const handleResendInvite = async (userId: string, username: string) => {
    try {
      await inviteMutation.mutateAsync({ id: userId, resend: true });
      toast.success(`Invitation re-sent to ${username}.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to resend invite");
    }
  };

  const handleResetPassword = async (userId: string, username: string) => {
    try {
      await resetPasswordMutation.mutateAsync(userId);
      toast.success(`Password reset link dispatched to ${username}.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to trigger reset");
    }
  };

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to remove ${username}?`)) return;
    try {
      await deleteMutation.mutateAsync(userId);
      toast.success(`User removed.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to remove user");
    }
  };

  // Safe user list extraction from response envelope
  const displayUsers = React.useMemo(() => {
    let list: UserSummaryDto[] = [];
    if (Array.isArray(usersData)) {
      list = usersData;
    } else if (Array.isArray(usersData?.data)) {
      list = usersData.data;
    } else if (Array.isArray((usersData as any)?.data?.items)) {
      list = (usersData as any).data.items;
    } else if (Array.isArray((usersData as any)?.items)) {
      list = (usersData as any).items;
    }
    return list;
  }, [usersData]);

  const totalPeopleCount =
    (usersData as any)?.meta?.total ??
    (usersData as any)?.data?.total ??
    (usersData as any)?.total ??
    displayUsers.length;

  const totalPages =
    (usersData as any)?.meta?.totalPages ??
    (usersData as any)?.data?.totalPages ??
    (usersData as any)?.totalPages ??
    Math.max(1, Math.ceil(totalPeopleCount / pageSize));

  // Clear all filters handler
  const handleClearFilters = () => {
    setSearchInput("");
    setSelectedStatus("ALL");
    setSelectedRole("ALL");
    setSelectedDepartment(null);
    setHasNoRoleOnly(false);
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchInput ||
    selectedStatus !== "ALL" ||
    selectedRole !== "ALL" ||
    selectedDepartment ||
    hasNoRoleOnly
  );

  // DataTable Columns Definition (§Part 3.1)
  const columns: ColumnDef<UserSummaryDto>[] = React.useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        render: (_, row) => {
          const displayName =
            row.profile?.displayName ||
            `${row.profile?.firstName || ""} ${row.profile?.lastName || ""}`.trim() ||
            row.username;
          const empId = row.employeeId || row.profile?.employeeId;
          return (
            <div className="flex items-center gap-3">
              <UserAvatar name={displayName} username={row.username} email={row.email} size={32} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground truncate">{displayName}</span>
                  {empId && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                      {empId}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-mono truncate">
                  @{row.username}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        key: "email",
        header: "Email",
        render: (_, row) => (
          <span className="text-xs font-mono text-muted-foreground">{row.email}</span>
        ),
      },
      {
        key: "roles",
        header: "Role",
        render: (_, row) => {
          const roles = row.roles || [];
          if (roles.length === 0) {
            return (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground cursor-help select-none">
                      <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                      <span>—</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-xs p-2">
                    <p className="font-semibold text-amber-600 dark:text-amber-400">No role assigned</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      This person can sign in but won&apos;t be able to do anything until given a role.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          const firstRole = roles[0];
          const extraCount = roles.length - 1;

          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              <RoleChip roleCode={firstRole} />
              {extraCount > 0 && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0.5 font-normal cursor-help"
                      >
                        +{extraCount}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs p-2 space-y-1">
                      <p className="font-semibold text-foreground">Additional Roles:</p>
                      {roles.slice(1).map((r) => (
                        <div key={r} className="text-muted-foreground text-[11px]">
                          • {getRoleDisplayName(r)}
                        </div>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        },
      },
      {
        key: "lastLogin",
        header: "Last signed in",
        render: (_, row) => {
          if (!row.createdAt && !row.updatedAt) {
            return <span className="text-xs text-muted-foreground">Never</span>;
          }
          // Use last active or fallback relative timestamp
          try {
            const date = new Date(row.updatedAt || row.createdAt);
            return (
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(date, { addSuffix: true })}
              </span>
            );
          } catch {
            return <span className="text-xs text-muted-foreground">Never</span>;
          }
        },
      },
      {
        key: "status",
        header: "Status",
        render: (_, row) => <UserStatusBadge user={row} />,
      },
    ],
    []
  );

  // Row Actions Menu Definition
  const rowActions: RowAction<UserSummaryDto>[] = React.useMemo(
    () => [
      {
        label: "View details",
        icon: <Eye className="size-4" />,
        onClick: (row) => {
          router.push(`/app/administration/users/${row.userId}?tab=overview`);
        },
      },
      {
        label: "Ask them to set a new password",
        icon: <RotateCcw className="size-4" />,
        onClick: (row) => handleResetPassword(row.userId, row.username),
        separator: true,
      },
      {
        label: "Unlock account",
        icon: <Unlock className="size-4 text-rose-600" />,
        onClick: (row) => handleUnlock(row.userId, row.username),
      },
      {
        label: "Resend invitation",
        icon: <Mail className="size-4 text-sky-600" />,
        onClick: (row) => handleResendInvite(row.userId, row.username),
      },
      {
        label: "Turn off access",
        icon: <UserX className="size-4 text-rose-600" />,
        variant: "destructive",
        onClick: (row) => handleDeactivate(row.userId, row.username),
        separator: true,
      },
      {
        label: "Turn on access",
        icon: <UserCheck className="size-4 text-emerald-600" />,
        onClick: (row) => handleReactivate(row.userId, row.username),
      },
      {
        label: "Remove",
        icon: <Trash2 className="size-4 text-rose-600" />,
        variant: "destructive",
        onClick: (row) => handleDelete(row.userId, row.username),
      },
    ],
    []
  );

  return (
    <div className="p-6 space-y-6 w-full">
      {/* 3-Tab Header Structure (§Part 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-1 bg-muted p-1 rounded-md border">
          {/* Tab 1: People */}
          <button
            type="button"
            onClick={() => setActiveTab("people")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === "people"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Users className="size-4" />
            <span>People</span>
          </button>

          {/* Tab 2: Vendor Users (Gated on VENDORUSER.MANAGE per Part 1) */}
          {can("VENDORUSER.MANAGE") && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("vendors");
                router.push("/app/administration/users/vendors");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === "vendors"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Store className="size-4" />
              <span>Vendor users</span>
            </button>
          )}

          {/* Tab 3: Invite Someone (Inline / Action) */}
          {can("USER.CREATE") && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("invite");
                router.push("/app/administration/users/new");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === "invite"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <UserPlus className="size-4" />
              <span>Invite someone</span>
            </button>
          )}
        </div>

        {/* Secondary Import & Action utilities */}
        <div className="flex items-center gap-2">
          {can("USER.IMPORT") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/app/administration/users/import")}
              className="gap-1.5 text-xs h-9"
            >
              <FileSpreadsheet className="size-4" />
              Import staff
            </Button>
          )}
          {can("USER.CREATE") && (
            <Button
              size="sm"
              onClick={() => router.push("/app/administration/users/new")}
              className="gap-1.5 text-xs h-9 shadow-xs"
            >
              <Plus className="size-4" />
              Invite someone
            </Button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-border/80 shadow-2xs">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input with 500ms debounce */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, employee ID..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-xs bg-background"
              />
            </div>

            {/* Status Filter (All 4 plain states) */}
            <Select
              value={selectedStatus}
              onValueChange={(val) => {
                setSelectedStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INVITED">Hasn&apos;t signed in yet</SelectItem>
                <SelectItem value="LOCKED">Locked out</SelectItem>
                <SelectItem value="INACTIVE">Access turned off</SelectItem>
              </SelectContent>
            </Select>

            {/* Role Filter */}
            <Select
              value={selectedRole}
              onValueChange={(val) => {
                setSelectedRole(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Role: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                {Object.values(ROLE_DEFINITIONS)
                  .filter((r) => r.category !== "VENDOR")
                  .map((r) => (
                    <SelectItem key={r.code} value={r.code}>
                      {r.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Department Filter via OrgUnitPicker */}
            <OrgUnitPicker
              value={selectedDepartment?.orgUnitId || null}
              onChange={(unit) => {
                setSelectedDepartment(unit);
                setPage(1);
              }}
              filterByType={3} // 3 = Department
              placeholder="Filter by department..."
              className="h-9 text-xs"
            />
          </div>

          {/* Secondary Filter Row: "No Role" Toggle & Clear Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={hasNoRoleOnly}
                  onCheckedChange={(c) => {
                    setHasNoRoleOnly(Boolean(c));
                    setPage(1);
                  }}
                />
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber-500 inline-block" />
                  Show people without assigned roles
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all filters
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-7 text-xs gap-1"
              >
                <RefreshCw className={`size-3 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* People DataTable */}
      <div className="space-y-3">
        <DataTable
          columns={columns}
          data={displayUsers}
          keyField="userId"
          loading={isLoading}
          selectedRowKey={selectedUserId}
          onRowClick={(row) => {
            if (typeof window !== "undefined" && window.innerWidth < 1024) {
              router.push(`/app/administration/users/${row.userId}?tab=overview`);
              return;
            }
            const params = new URLSearchParams(searchParams.toString());
            params.set("selected", row.userId);
            router.push(`${pathname}?${params.toString()}`);
          }}
          emptyMessage="No one matches these filters."
          manualPagination={true}
          pageIndex={page - 1}
          pageCount={totalPages}
          totalCount={totalPeopleCount}
          pageSize={pageSize}
          pageSizeOptions={[20, 50, 100, 10]}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />

        {/* 520px Slide-over Person Details Panel (§USER-DRAWER-VS-PAGE Part 3 & Part 4) */}
        <UserDetailPanel
          isOpen={Boolean(selectedUserId)}
          userId={selectedUserId}
          onClose={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("selected");
            const newQuery = params.toString();
            router.push(newQuery ? `${pathname}?${newQuery}` : pathname);
          }}
        />

        {/* Empty State Custom Action if filters active */}
        {!isLoading && displayUsers.length === 0 && hasActiveFilters && (
          <div className="text-center py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              Reset search filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PeopleListPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading users...</div>}>
      <PeopleListPageContent />
    </React.Suspense>
  );
}
