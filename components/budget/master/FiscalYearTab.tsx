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
import { IFiscalYearDto, ICreateFiscalYearDto } from "@/lib/types/budget-master.types";
import { AddFiscalYearDialog } from "./AddFiscalYearDialog";

// Initial seed data with UUID fiscal_year_id matching [masters].[tbl_Fiscal_Year]
const INITIAL_FISCAL_YEARS: IFiscalYearDto[] = [
  {
    fiscal_year_id: "c8e1a720-3b95-4d64-9a82-1205fbc31a01",
    code: "FY 2026",
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    status: "OPEN",
    oracle_budget_name: "OB_DEZ_CORP_2026",
    is_delete: false,
    created_date: "2025-11-15T08:30:00Z",
    created_by: "system_admin",
  },
  {
    fiscal_year_id: "b4f2c910-1e84-4c53-8b71-0194eab20b02",
    code: "FY 2025",
    start_date: "2025-01-01",
    end_date: "2025-12-31",
    status: "CLOSED",
    oracle_budget_name: "OB_DEZ_CORP_2025",
    is_delete: false,
    created_date: "2024-11-10T09:00:00Z",
    created_by: "system_admin",
  },
  {
    fiscal_year_id: "a3d1b800-0d73-4b42-7a60-9083d9a10c03",
    code: "FY 2024",
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    status: "CLOSED",
    oracle_budget_name: "OB_DEZ_CORP_2024",
    is_delete: false,
    created_date: "2023-11-20T10:15:00Z",
    created_by: "system_admin",
  },
  {
    fiscal_year_id: "e5a3d030-2f96-4e65-ab93-2316acd42d04",
    code: "FY 2027",
    start_date: "2027-01-01",
    end_date: "2027-12-31",
    status: "DRAFT",
    oracle_budget_name: "OB_DEZ_CORP_2027",
    is_delete: false,
    created_date: "2026-08-01T14:00:00Z",
    created_by: "system_admin",
  },
];

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

export function FiscalYearTab() {
  const [fiscalYears, setFiscalYears] = React.useState<IFiscalYearDto[]>(INITIAL_FISCAL_YEARS);
  const [search, setSearch] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  // Filtered list
  const filteredList = React.useMemo(() => {
    return fiscalYears.filter((item) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.code.toLowerCase().includes(q) ||
        String(item.fiscal_year_id).toLowerCase().includes(q) ||
        (item.oracle_budget_name && item.oracle_budget_name.toLowerCase().includes(q))
      );
    });
  }, [fiscalYears, search]);

  const handleCreateFiscalYear = (data: ICreateFiscalYearDto) => {
    // Generate UUID for fiscal_year_id
    const newId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });

    const newRecord: IFiscalYearDto = {
      fiscal_year_id: newId,
      code: data.code,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
      oracle_budget_name: data.oracle_budget_name,
      is_delete: false,
      created_date: new Date().toISOString(),
      created_by: "super_admin",
    };

    setFiscalYears((prev) => [newRecord, ...prev]);
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
          Add Fiscal Year
        </Button>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/70 bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[300px] text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 pl-6">
                Fiscal Year ID (UUID)
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                Code
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                Start Date
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                End Date
              </TableHead>
              <TableHead className="w-[120px] text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 pr-6">
                Oracle Budget Name
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileSpreadsheet className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No fiscal years found.</p>
                    <p className="text-xs text-muted-foreground/70">
                      {search
                        ? "Try clearing your search to view all records."
                        : "Click 'Add Fiscal Year' above to create the first record."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((item) => (
                <TableRow
                  key={String(item.fiscal_year_id)}
                  className="hover:bg-muted/30 transition-colors border-b border-border/50"
                >
                  {/* fiscal_year_id (UUID) */}
                  <TableCell className="pl-6 py-4 font-mono text-xs text-muted-foreground select-all">
                    {String(item.fiscal_year_id)}
                  </TableCell>

                  {/* code */}
                  <TableCell className="py-4">
                    <span className="font-semibold text-foreground text-sm">
                      {item.code}
                    </span>
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

                  {/* oracle_budget_name */}
                  <TableCell className="pr-6 py-4">
                    {item.oracle_budget_name ? (
                      <span className="inline-block font-mono text-xs text-foreground bg-muted/60 px-2 py-1 rounded border border-border/40">
                        {item.oracle_budget_name}
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
            <strong className="text-foreground">{fiscalYears.length}</strong> fiscal years
          </span>
        </div>
      </div>

      {/* Add Fiscal Year Modal Dialog */}
      <AddFiscalYearDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleCreateFiscalYear}
      />
    </div>
  );
}
