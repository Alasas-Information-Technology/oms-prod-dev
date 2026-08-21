"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Briefcase,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  ArrowRightLeft,
  Power,
  ChevronRight,
  Loader2,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function BusinessUnitsPage() {
  const router = useRouter();
  const { can } = usePermission();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isMoveOpen, setIsMoveOpen] = React.useState(false);
  const [moveTargetUnit, setMoveTargetUnit] = React.useState<OrgUnitSummaryDto | null>(null);

  // Query units with type BUSINESS_UNIT (canonical level 2, orgUnitTypeId = 2)
  const { data: buData, isLoading, refetch } = useOrgUnits({
    orgUnitTypeId: 2,
    page: 1,
    pageSize: 100,
    search: searchTerm || undefined,
  });

  const createMutation = useCreateOrgUnit();
  const activateMutation = useActivateOrgUnit();
  const deactivateMutation = useDeactivateOrgUnit();

  const handleCreateSubmit = async (data: CreateOrgUnitDto) => {
    try {
      await createMutation.mutateAsync({ ...data, orgUnitTypeId: 2 });
      toast.success(`Business Unit ${data.name} created successfully.`);
      setIsCreateOpen(false);
      refetch();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create Business Unit.";
      toast.error(errorMsg);
    }
  };

  const handleToggleActive = async (unit: OrgUnitSummaryDto) => {
    try {
      if (unit.isActive) {
        await deactivateMutation.mutateAsync({
          id: unit.orgUnitId,
          effectiveTo: new Date().toISOString().split("T")[0],
        });
        toast.success(`Business Unit ${unit.name} deactivated.`);
      } else {
        await activateMutation.mutateAsync(unit.orgUnitId);
        toast.success(`Business Unit ${unit.name} activated.`);
      }
      refetch();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update status.";
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
      header: "Business Unit Name",
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
      header: "Departments",
      align: "center",
      render: (val) => (
        <span className="font-mono text-xs font-semibold text-foreground">{String(val || 0)}</span>
      ),
    },
    {
      key: "effectiveFrom",
      header: "Effective Date",
      render: (val) => (
        <span className="text-xs text-muted-foreground">{String(val).split("T")[0]}</span>
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Business Units
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of major corporate business divisions, leadership heads, and operational domains.
          </p>
        </div>

        {can(ORG_PERMISSIONS.CREATE) && (
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-xs shrink-0">
            <Plus className="h-4 w-4" />
            New Business Unit
          </Button>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={buData?.data || []}
        keyField="orgUnitId"
        loading={isLoading}
        emptyMessage="No Business Units found matching the current search criteria."
        rowActions={actions}
        enableSearch={true}
        searchPlaceholder="Search business units by code or name..."
      />

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] p-6 sm:p-8 overflow-y-auto rounded-2xl">
          <DialogHeader className="pb-2 border-b border-border/50">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2.5 text-foreground">
              <Briefcase className="h-6 w-6 text-primary" />
              New Business Unit
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Create an executive business division under the holding organization.
            </DialogDescription>
          </DialogHeader>
          <OrgUnitForm
            targetTypeId={2}
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
