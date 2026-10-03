"use client";

import * as React from "react";
import { Plus, Search, Calendar, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IBudgetPeriodDto, ICreateBudgetPeriodDto } from "@/lib/types/budget-master.types";
import { AddBudgetPeriodDialog } from "./AddBudgetPeriodDialog";

// Initial seed data with UUIDs matching [masters].[tbl_Budget_Period]
const INITIAL_BUDGET_PERIODS: IBudgetPeriodDto[] = [
  {
    period_id: "7d10e53a-4a21-4f81-8b92-628d01f92e01",
    period_code: "P01-2026",
    fiscal_year_id: "c8e1a720-3b95-4d64-9a82-1205fbc31a01",
    fiscal_year_code: "FY 2026",
    period_name: "January 2026",
    period_num: 1,
    start_date: "2026-01-01",
    end_date: "2026-01-31",
    status: "OPEN",
    oracle_period_name: "JAN-26",
    is_delete: false,
    created_date: "2025-11-20T10:00:00Z",
    created_by: "system_admin",
  },
  {
    period_id: "8e21f64b-5b32-4e92-9ca3-739e12fa3f02",
    period_code: "P02-2026",
    fiscal_year_id: "c8e1a720-3b95-4d64-9a82-1205fbc31a01",
    fiscal_year_code: "FY 2026",
    period_name: "February 2026",
    period_num: 2,
    start_date: "2026-02-01",
    end_date: "2026-02-28",
    status: "OPEN",
    oracle_period_name: "FEB-26",
    is_delete: false,
    created_date: "2025-11-20T10:00:00Z",
    created_by: "system_admin",
  },
  {
    period_id: "9f32a75c-6c43-4fa3-adb4-84af23fb4a03",
    period_code: "P03-2026",
    fiscal_year_id: "c8e1a720-3b95-4d64-9a82-1205fbc31a01",
    fiscal_year_code: "FY 2026",
    period_name: "March 2026",
    period_num: 3,
    start_date: "2026-03-01",
    end_date: "2026-03-31",
    status: "DRAFT",
    oracle_period_name: "MAR-26",
    is_delete: false,
    created_date: "2025-11-20T10:00:00Z",
    created_by: "system_admin",
  },
  {
    period_id: "a043b86d-7d54-4ab4-bec5-95ba34fc5b04",
    period_code: "P12-2025",
    fiscal_year_id: "b4f2c910-1e84-4c53-8b71-0194eab20b02",
    fiscal_year_code: "FY 2025",
    period_name: "December 2025",
    period_num: 12,
    start_date: "2025-12-01",
    end_date: "2025-12-31",
    status: "CLOSED",
    oracle_period_name: "DEC-25",
    is_delete: false,
    created_date: "2024-11-20T10:00:00Z",
    created_by: "system_admin",
  },
  {
    period_id: "b154c97e-8e65-4bc5-cfd6-06cb45fd6c05",
    period_code: "P11-2025",
    fiscal_year_id: "b4f2c910-1e84-4c53-8b71-0194eab20b02",
    fiscal_year_code: "FY 2025",
    period_name: "November 2025",
    period_num: 11,
    start_date: "2025-11-01",
    end_date: "2025-11-30",
    status: "FROZEN",
    oracle_period_name: "NOV-25",
    is_delete: false,
    created_date: "2024-11-20T10:00:00Z",
    created_by: "system_admin",
  },
];

const FISCAL_YEAR_MAP: Record<string, string> = {
  "c8e1a720-3b95-4d64-9a82-1205fbc31a01": "FY 2026",
  "b4f2c910-1e84-4c53-8b71-0194eab20b02": "FY 2025",
  "a3d1b800-0d73-4b42-7a60-9083d9a10c03": "FY 2024",
  "e5a3d030-2f96-4e65-ab93-2316acd42d04": "FY 2027",
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function StatusBadge({ status }: { status: string }) {
  const normalized = (status || "").toUpperCase();
  if (normalized === "OPEN" || normalized === "ACTIVE") {
    return (
      <Badge tone="success" className="gap-1.5 font-medium px-2 py-0.5 text-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        OPEN
      </Badge>
    );
  }
  if (normalized === "DRAFT" || normalized === "PLANNING") {
    return (
      <Badge tone="warning" className="gap-1.5 font-medium px-2 py-0.5 text-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        DRAFT
      </Badge>
    );
  }
  if (normalized === "FROZEN") {
    return (
      <Badge tone="accent" className="gap-1.5 font-medium px-2 py-0.5 text-xs text-sky-700 dark:text-sky-300 bg-sky-500/10 border-sky-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
        FROZEN
      </Badge>
    );
  }
  return (
    <Badge tone="neutral" className="gap-1.5 font-medium px-2 py-0.5 text-xs">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
      {normalized || "CLOSED"}
    </Badge>
  );
}

export function BudgetPeriodTab() {
  const [budgetPeriods, setBudgetPeriods] = React.useState<IBudgetPeriodDto[]>(INITIAL_BUDGET_PERIODS);
  const [search, setSearch] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  // Filtered list
  const filteredList = React.useMemo(() => {
    return budgetPeriods.filter((item) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.period_code.toLowerCase().includes(q) ||
        item.period_name.toLowerCase().includes(q) ||
        String(item.period_id).toLowerCase().includes(q) ||
        String(item.fiscal_year_id).toLowerCase().includes(q) ||
        (item.fiscal_year_code && item.fiscal_year_code.toLowerCase().includes(q)) ||
        (item.oracle_period_name && item.oracle_period_name.toLowerCase().includes(q))
      );
    });
  }, [budgetPeriods, search]);

  const handleCreateBudgetPeriod = (data: ICreateBudgetPeriodDto) => {
    // Generate UUID for period_id
    const newId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });

    const newRecord: IBudgetPeriodDto = {
      period_id: newId,
      period_code: data.period_code,
      fiscal_year_id: data.fiscal_year_id,
      fiscal_year_code: FISCAL_YEAR_MAP[data.fiscal_year_id] || "Fiscal Year",
      period_name: data.period_name,
      period_num: data.period_num,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
      oracle_period_name: data.oracle_period_name,
      is_delete: false,
      created_date: new Date().toISOString(),
      created_by: "super_admin",
    };

    setBudgetPeriods((prev) => [newRecord, ...prev]);
  };

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-200">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/60 p-3 rounded-lg border border-border/60">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs sm:text-sm bg-background/50"
          />
        </div>

        <Button
          onClick={() => setIsAddDialogOpen(true)}
          variant="primary"
          className="h-9 px-3.5 text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Budget Period
        </Button>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/70 bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[260px] text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 pl-6">
                Period ID (UUID)
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                Period Code
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                Fiscal Year
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                Period Name
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                Start Date
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                End Date
              </TableHead>
              <TableHead className="w-[110px] text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 pr-6">
                Oracle Period Name
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileSpreadsheet className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No budget periods found.</p>
                    <p className="text-xs text-muted-foreground/70">
                      {search
                        ? "Try clearing your search to view all records."
                        : "Click 'Add Budget Period' above to create the first record."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((item) => (
                <TableRow
                  key={String(item.period_id)}
                  className="hover:bg-muted/30 transition-colors border-b border-border/50"
                >
                  {/* period_id (UUID) */}
                  <TableCell className="pl-6 py-4 font-mono text-xs text-muted-foreground select-all">
                    {String(item.period_id)}
                  </TableCell>

                  {/* period_code */}
                  <TableCell className="py-4">
                    <span className="font-semibold text-foreground text-sm">
                      {item.period_code}
                    </span>
                  </TableCell>

                  {/* Fiscal Year */}
                  <TableCell className="py-4 text-xs sm:text-sm text-foreground font-medium">
                    {item.fiscal_year_code || "FY"}
                  </TableCell>

                  {/* period_name */}
                  <TableCell className="py-4 text-xs sm:text-sm text-foreground">
                    {item.period_name}
                  </TableCell>

                  {/* start_date */}
                  <TableCell className="py-4 text-xs sm:text-sm text-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                      <span>{formatDate(item.start_date)}</span>
                    </div>
                  </TableCell>

                  {/* end_date */}
                  <TableCell className="py-4 text-xs sm:text-sm text-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                      <span>{formatDate(item.end_date)}</span>
                    </div>
                  </TableCell>

                  {/* status */}
                  <TableCell className="py-4">
                    <StatusBadge status={item.status} />
                  </TableCell>

                  {/* oracle_period_name */}
                  <TableCell className="pr-6 py-4">
                    {item.oracle_period_name ? (
                      <span className="inline-block font-mono text-xs text-foreground bg-muted/60 px-2 py-1 rounded border border-border/40">
                        {item.oracle_period_name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Footer row with record count */}
        <div className="px-6 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{filteredList.length}</strong> of{" "}
            <strong className="text-foreground">{budgetPeriods.length}</strong> budget periods
          </span>
        </div>
      </div>

      {/* Add Budget Period Modal Dialog */}
      <AddBudgetPeriodDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleCreateBudgetPeriod}
      />
    </div>
  );
}
