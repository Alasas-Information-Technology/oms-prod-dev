"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Upload,
  Coins,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { IBudgetLineDto, BudgetLineStatus } from "@/lib/types/budget.types";
import { Amount } from "./Amount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/lib/utils";

export interface BudgetLinesTableProps {
  lines: IBudgetLineDto[];
  totalCount?: number;
  pageCount?: number;
  pageIndex?: number; // 0-indexed
  pageSize?: number;
  isLoading?: boolean;
  selectedLineId?: string | null;
  onSelectLine?: (line: IBudgetLineDto) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onOpenUploadDialog?: () => void;
  className?: string;
}

const STATUS_BADGE_CONFIG: Record<
  BudgetLineStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  ACTIVE: {
    label: "Active",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    dotClass: "bg-emerald-500",
  },
  FROZEN: {
    label: "Frozen",
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    dotClass: "bg-indigo-500",
  },
  DEPLETED: {
    label: "Depleted",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    dotClass: "bg-rose-500",
  },
  CLOSED: {
    label: "Closed",
    badgeClass: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/30",
    dotClass: "bg-zinc-500",
  },
};

export function BudgetLinesTable({
  lines,
  totalCount = 0,
  pageCount = 1,
  pageIndex = 0,
  pageSize = 10,
  isLoading = false,
  selectedLineId,
  onSelectLine,
  onPageChange,
  onPageSizeChange,
  onOpenUploadDialog,
  className,
}: BudgetLinesTableProps) {
  const { can } = usePermission();
  const canUpload = can("BUDGET.UPLOAD") || can("ADMIN.VIEW");

  // Define Columns matching Step 0 DataTable ColumnDef specification (Part 3 & Part 4)
  const columns: ColumnDef<IBudgetLineDto>[] = React.useMemo(() => {
    return [
      // 1. Select Column (Single-Row Selection driving Fund movements panel §2.1)
      {
        key: "select",
        header: "",
        width: "48px",
        align: "center",
        render: (_value, line) => {
          const isSelected = selectedLineId === line.id;
          return (
            <div className="flex items-center justify-center">
              <div
                className={cn(
                  "size-4 rounded-full border flex items-center justify-center transition-all",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                    : "border-muted-foreground/40 bg-background hover:border-primary/60"
                )}
                aria-hidden="true"
              >
                {isSelected && <div className="size-1.5 rounded-full bg-primary-foreground" />}
              </div>
            </div>
          );
        },
      },

      // 2. Budget Code (Mono font, separate link to ledger detail §Part 3)
      {
        key: "code",
        header: "Budget Code",
        sortable: true,
        width: "135px",
        render: (_value, line) => {
          return (
            <a
              href={`/app/budget/dept-budget?code=${encodeURIComponent(line.code)}`}
              onClick={(e) => {
                // Clicking code links to ledger detail; clicking row selects
                e.stopPropagation();
              }}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-primary hover:text-primary/80 hover:underline transition-colors group cursor-pointer"
              title={`View detailed ledger transactions for ${line.code}`}
            >
              <span>{line.code}</span>
              <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          );
        },
      },

      // 3. Budget Line Name & Department
      {
        key: "name",
        header: "Budget Line Name",
        sortable: true,
        render: (_value, line) => {
          return (
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-semibold text-foreground truncate" title={line.name}>
                {line.name}
              </span>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
                <span className="truncate">{line.departmentName}</span>
                {line.activeRequisitionsCount > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/60">
                    {line.activeRequisitionsCount} active
                  </span>
                )}
              </div>
            </div>
          );
        },
      },

      // 4. Total (AED) — Exact minor units formatted, tabular nums, right aligned (Part 4)
      {
        key: "totalFils",
        header: "Total (AED)",
        sortable: true,
        align: "right",
        width: "135px",
        render: (_value, line) => {
          return (
            <Amount
              value={line.totalFils}
              className="font-semibold text-foreground text-xs"
            />
          );
        },
      },

      // 5. Available (AED)
      {
        key: "availableFils",
        header: "Available (AED)",
        sortable: true,
        align: "right",
        width: "135px",
        render: (_value, line) => {
          return (
            <Amount
              value={line.availableFils}
              className="font-medium text-emerald-700 dark:text-emerald-400 text-xs"
            />
          );
        },
      },

      // 6. Reserved (AED)
      {
        key: "reservedFils",
        header: "Reserved (AED)",
        sortable: true,
        align: "right",
        width: "130px",
        render: (_value, line) => {
          return (
            <Amount
              value={line.reservedFils}
              className="font-medium text-amber-700 dark:text-amber-400 text-xs"
            />
          );
        },
      },

      // 7. Locked (AED)
      {
        key: "lockedFils",
        header: "Locked (AED)",
        sortable: true,
        align: "right",
        width: "130px",
        render: (_value, line) => {
          return (
            <Amount
              value={line.lockedFils}
              className="font-medium text-indigo-700 dark:text-indigo-400 text-xs"
            />
          );
        },
      },

      // 8. Consumed (AED)
      {
        key: "consumedFils",
        header: "Consumed (AED)",
        sortable: true,
        align: "right",
        width: "130px",
        render: (_value, line) => {
          return (
            <Amount
              value={line.consumedFils}
              className="text-muted-foreground text-xs"
            />
          );
        },
      },

      // 9. Status & Reconciliation Invariant Verification (Part 4)
      {
        key: "status",
        header: "Status",
        align: "center",
        width: "115px",
        render: (_value, line) => {
          const statusCfg = STATUS_BADGE_CONFIG[line.status] || STATUS_BADGE_CONFIG.ACTIVE;

          // Reconcile Check: Available + Reserved + Locked + Consumed === Total
          const sumFils =
            BigInt(line.availableFils) +
            BigInt(line.reservedFils) +
            BigInt(line.lockedFils) +
            BigInt(line.consumedFils);
          const totalBigInt = BigInt(line.totalFils);
          const isReconciled = sumFils === totalBigInt;

          return (
            <div className="flex items-center justify-center gap-1.5">
              <Badge
                variant="outline"
                className={cn(
                  "font-medium text-[10px] px-2 py-0.5 inline-flex items-center gap-1 shadow-2xs",
                  statusCfg.badgeClass
                )}
              >
                <span className={cn("size-1.5 rounded-full shrink-0", statusCfg.dotClass)} />
                {statusCfg.label}
              </Badge>

              {!isReconciled && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="p-0.5 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-help">
                      <AlertTriangle className="size-3.5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-xs text-rose-700 bg-rose-50 border-rose-200">
                    Sum discrepancy: Available + Reserved + Locked + Consumed does not match Total allocation.
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          );
        },
      },
    ];
  }, [selectedLineId]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("space-y-3", className)}>
        {/* Table header meta row */}
        <div className="flex items-center justify-between gap-4 flex-wrap px-1">
          <div className="flex items-center gap-2">
            <Coins className="size-4 text-primary" />
            <h2 className="text-sm font-bold font-display text-foreground">
              Budget Allocation Lines
            </h2>
            <Badge variant="secondary" className="text-xs px-2 py-0">
              {totalCount} {totalCount === 1 ? "Line" : "Lines"}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Exact fils precision · Reconciled</span>
            </span>
          </div>
        </div>

        {/* ── Main DataTable ── */}
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden h-fit">
          <DataTable<IBudgetLineDto>
            columns={columns}
            data={lines}
            keyField="id"
            loading={isLoading}
            manualPagination={true}
            pageCount={pageCount}
            totalCount={totalCount}
            pageIndex={pageIndex}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSize={pageSize}
            onRowClick={(row) => onSelectLine && onSelectLine(row)}
            isRowActive={(row) => row.id === selectedLineId}
            className="border-0 shadow-none"
            emptyMessage="No budget lines for this department"
          />

          {/* ── Custom Empty State Overlay with Upload Action when empty ── */}
          {!isLoading && lines.length === 0 && (
            <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="size-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center">
                <FileSpreadsheet className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  No budget lines for this department
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  There are no baseline budget allocation entries registered for the selected organizational scope.
                </p>
              </div>

              {canUpload && onOpenUploadDialog && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onOpenUploadDialog}
                  className="rounded-xl text-xs h-9 gap-2 mt-2 font-semibold shadow-xs cursor-pointer"
                >
                  <Upload className="size-3.5" />
                  <span>Upload Budget CSV</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
