"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  ArrowRightLeft,
  Power,
  ChevronRight,
  Loader2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/oms/StatusBadge";
import { DataTable, ColumnDef, RowAction } from "@/components/oms/DataTable";
import { OrgUnitForm } from "@/components/organization/OrgUnitForm";
import { MoveUnitDialog } from "@/components/organization/MoveUnitDialog";
import {
  useOrgUnits,
  useCreateOrgUnit,
  useActivateOrgUnit,
  useDeactivateOrgUnit,
} from "@/hooks/useOrganization";
import { usePermission } from "@/hooks/usePermission";
import {
  OrgUnitSummaryDto,
  CreateOrgUnitDto,
  ORG_PERMISSIONS,
} from "@/lib/types/organization.types";

export default function DepartmentsPage() {
  const router = useRouter();
  const { can } = usePermission();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isMoveOpen, setIsMoveOpen] = React.useState(false);
  const [moveTargetUnit, setMoveTargetUnit] = React.useState<OrgUnitSummaryDto | null>(null);

  // Query units with type DEPARTMENT (canonical level 3, orgUnitTypeId = 3)
  const { data: deptData, isLoading, refetch } = useOrgUnits({
    orgUnitTypeId: 3,
    page: 1,
    pageSize: 100,
    search: searchTerm || undefined,
  });

  const createMutation = useCreateOrgUnit();
  const activateMutation = useActivateOrgUnit();
  const deactivateMutation = useDeactivateOrgUnit();

  const handleCreateSubmit = async (data: CreateOrgUnitDto) => {
    try {
      await createMutation.mutateAsync({ ...data, orgUnitTypeId: 3 });
      toast.success(`Department ${data.name} created successfully.`);
      setIsCreateOpen(false);
      refetch();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create Department.";
      toast.error(errorMsg);
    }
  };

  const columns: ColumnDef<OrgUnitSummaryDto>[] = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground">
          {String(val)}
        </span>
      ),
    },
    {
      key: "name",
      header: "Department Name",
      sortable: true,
      render: (val, row) => (
        <div>
          <Link
            href={`/app/administration/master-data/organization/${row.orgUnitId}`}
            className="text-sm font-semibold hover:underline text-foreground"
          >
            {String(val)}
          </Link>
          {row.nameAr && (
            <p dir="rtl" className="text-xs text-muted-foreground font-arabic">
              {row.nameAr}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "head",
      header: "Head Manager",
      render: (_, row) => (
        <span className="text-xs text-foreground font-medium">
          {row.head ? (row.head.displayName || row.head.userDisplayName) : "—"}
        </span>
      ),
    },
    {
      key: "costCenterCode",
      header: "Cost Center",
      render: (val) => (
        <span className="font-mono text-xs text-muted-foreground">{val ? String(val) : "—"}</span>
      ),
    },
    {
      key: "childCount",
      header: "Sections",
      align: "center",
      render: (val) => (
        <span className="font-mono text-xs font-semibold text-foreground">{String(val || 0)}</span>
      ),
    },
    {
      key: "budgetAuthority",
      header: "Budget Authority",
      align: "center",
      render: () => (
        <Badge variant="outline" className="text-[10px] text-emerald-700 dark:text-emerald-300 border-emerald-300">
          AUTHORIZED
        </Badge>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      align: "center",
      render: (val) => (
        <StatusBadge status={val ? "active" : "terminated"} size="sm" />
      ),
    },
  ];

  const actions: RowAction<OrgUnitSummaryDto>[] = [
    {
      label: "View Detail",
      icon: <ExternalLink className="h-4 w-4" />,
      onClick: (row) => router.push(`/app/administration/master-data/organization/${row.orgUnitId}`),
    },
    {
      label: "Move Subtree",
      icon: <ArrowRightLeft className="h-4 w-4" />,
      onClick: (row) => {
        setMoveTargetUnit(row);
        setIsMoveOpen(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/app/administration/security-dashboard" className="hover:text-foreground">
              Administration
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Master Data</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Departments</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Building className="h-7 w-7 text-primary" />
            Departments Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Operational and functional departments, cost centers, and primary budget allocation owners.
          </p>
        </div>

        {can(ORG_PERMISSIONS.CREATE) && (
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-xs shrink-0">
            <Plus className="h-4 w-4" />
            New Department
          </Button>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={deptData?.data || []}
        keyField="orgUnitId"
        loading={isLoading}
        emptyMessage="No Departments found matching the current search criteria."
        rowActions={actions}
        enableSearch={true}
        searchPlaceholder="Search departments by code or name..."
      />

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Create Department
            </DialogTitle>
            <DialogDescription>
              Add a new Department under a Business Unit or Organization.
            </DialogDescription>
          </DialogHeader>
          <OrgUnitForm
            onSubmit={handleCreateSubmit as (data: CreateOrgUnitDto) => Promise<void>}
            onCancel={() => setIsCreateOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Move Modal */}
      <MoveUnitDialog
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
        unit={moveTargetUnit}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
