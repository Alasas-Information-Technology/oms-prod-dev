"use client";

import { useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import { CircleAlert, Clock3, Search } from "lucide-react";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/money";
import { ApprovalTaskSummary } from "@/lib/types/approval.types";
import { cn } from "@/components/ui/utils";
import { Badge } from "@/components/ui/badge";

export interface ApprovalsTableProps {
  data: ApprovalTaskSummary[];
  isLoading: boolean;
  totalCount: number;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  /**
   * Used to determine if the current user owns the claim on a role-queue task
   */
  currentUserId: string;
}

export function ApprovalsTable({
  data,
  isLoading,
  totalCount,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  currentUserId,
}: ApprovalsTableProps) {
  const columns = useMemo<ColumnDef<ApprovalTaskSummary>[]>(() => [
    {
      key: "subject",
      header: "Subject",
      render: (_, row) => (
        <div className="flex flex-col gap-1 min-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/40">
              {row.subjectRef}
            </span>
            {row.actingFor && (
              <Badge variant="outline" className="text-[10px] font-medium bg-indigo-50 text-indigo-700 border-indigo-200">
                Acting for {row.actingFor.name}
              </Badge>
            )}
          </div>
          <span className="font-semibold text-sm text-foreground">{row.title}</span>
          <span className="text-xs text-muted-foreground">{row.context}</span>
        </div>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      render: (_, row) => (
        <StatusBadge status="pending" label={row.stage.label} />
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (_, row) => (
        <div className="flex flex-col items-end">
          <span className="font-semibold tabular-nums text-sm">
            {formatAmount(row.amount)}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            {row.currency}
          </span>
        </div>
      ),
    },
    {
      key: "waitingSince",
      header: "Waiting Since",
      render: (_, row) => {
        const date = new Date(row.assignedAt);
        return (
          <div className="text-xs text-muted-foreground">
            {format(date, "d MMM yyyy, HH:mm")}
          </div>
        );
      },
    },
    {
      key: "sla",
      header: "SLA",
      render: (_, row) => {
        const { daysRemaining, breached } = row.sla;
        
        let colorClass = "text-emerald-600 bg-emerald-50 border-emerald-200";
        let icon = <Clock3 className="size-3" />;
        
        if (breached || daysRemaining < 3) {
          colorClass = "text-red-600 bg-red-50 border-red-200";
          icon = <CircleAlert className="size-3" />;
        } else if (daysRemaining <= 7) {
          colorClass = "text-amber-600 bg-amber-50 border-amber-200";
        }

        const label = breached 
          ? "Breached" 
          : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`;

        return (
          <Badge variant="outline" className={cn("gap-1.5 font-medium", colorClass)}>
            {icon}
            {label}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      render: (_, row) => {
        const isRoleQueue = row.assignment.mode === "ROLE_QUEUE";
        const isClaimedByMe = row.assignment.claimedBy?.id === currentUserId;
        const isClaimed = !!row.assignment.claimedBy;

        if (isRoleQueue) {
          if (isClaimedByMe) {
            return (
              <div className="flex justify-end items-center gap-2">
                <Button variant="default" size="sm" className="h-8 text-xs font-semibold px-3">
                  Review
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs px-3">
                  Release
                </Button>
              </div>
            );
          }
          if (isClaimed) {
            return (
              <div className="flex justify-end items-center gap-2">
                <Badge variant="outline" className="bg-slate-50 text-slate-600">
                  Claimed by {row.assignment.claimedBy?.name}
                </Badge>
              </div>
            );
          }
          return (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold px-4 border-primary/30 text-primary hover:bg-primary/5">
                Claim Task
              </Button>
            </div>
          );
        }

        // Default named assignment
        return (
          <div className="flex justify-end">
            <Button variant="default" size="sm" className="h-8 text-xs font-semibold px-4">
              Review
            </Button>
          </div>
        );
      },
    },
  ], [currentUserId]);

  return (
    <DataTable
      columns={columns}
      data={data}
      keyField="approvalTaskId"
      loading={isLoading}
      manualPagination={true}
      totalCount={totalCount}
      pageCount={pageCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      selectable={false} // NO BULK APPROVE
      enableSearch={true}
      enableExport={false}
      emptyMessage="Nothing waiting on you."
    />
  );
}
