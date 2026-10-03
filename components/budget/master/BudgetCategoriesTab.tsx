"use client";

import * as React from "react";
import { Plus, Search, FileSpreadsheet } from "lucide-react";
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
import { IBudgetCategoryDto, ICreateBudgetCategoryDto } from "@/lib/types/budget-master.types";
import { AddBudgetCategoryDialog } from "./AddBudgetCategoryDialog";

// Initial seed data with UUIDs matching [masters].[tbl_Budget_Categories]
const INITIAL_BUDGET_CATEGORIES: IBudgetCategoryDto[] = [
  {
    budget_category_id: "6f19e420-1a3b-4c5d-8e7f-9012a3b4c5d1",
    code: "CAPEX-IT",
    name: "IT Infrastructure & Cloud Platforms",
    expense_type: "CAPEX",
    oracle_account_code: "1010-00-5020-0000",
    is_active: true,
    is_delete: false,
    created_date: "2025-11-15T08:30:00Z",
    created_by: "system_admin",
  },
  {
    budget_category_id: "7a20f531-2b4c-5d6e-9f80-0123b4c5d6e2",
    code: "OPEX-SEC",
    name: "Cybersecurity Operations & Threat Defense",
    expense_type: "OPEX",
    oracle_account_code: "2020-01-6010-0000",
    is_active: true,
    is_delete: false,
    created_date: "2025-11-15T08:30:00Z",
    created_by: "system_admin",
  },
  {
    budget_category_id: "8b31a642-3c5d-6e7f-a091-1234c5d6e7f3",
    code: "OPEX-HR",
    name: "Talent Acquisition & Workforce Scaling",
    expense_type: "OPEX",
    oracle_account_code: "3030-00-6020-0000",
    is_active: true,
    is_delete: false,
    created_date: "2025-11-15T08:30:00Z",
    created_by: "system_admin",
  },
  {
    budget_category_id: "9c42b753-4d6e-7f80-b1a2-2345d6e7f8a4",
    code: "CAPEX-FAC",
    name: "Office Automation & Facilities Expansion",
    expense_type: "CAPEX",
    oracle_account_code: "1020-02-5010-0000",
    is_active: false,
    is_delete: false,
    created_date: "2024-11-10T09:00:00Z",
    created_by: "system_admin",
  },
  {
    budget_category_id: "ad53c864-5e7f-8091-c2b3-3456e7f8a9b5",
    code: "DIR-CONS",
    name: "Professional Consultancy & Advisory",
    expense_type: "DIRECT",
    oracle_account_code: "4040-00-6030-0000",
    is_active: true,
    is_delete: false,
    created_date: "2025-11-15T08:30:00Z",
    created_by: "system_admin",
  },
];

function ExpenseTypeBadge({ type }: { type: string }) {
  const normalized = (type || "").toUpperCase();
  if (normalized === "CAPEX") {
    return (
      <Badge tone="accent" className="font-medium text-sky-700 dark:text-sky-300 bg-sky-500/10 border-sky-500/20 px-2 py-0.5 text-xs">
        CAPEX
      </Badge>
    );
  }
  if (normalized === "OPEX") {
    return (
      <Badge tone="success" className="font-medium px-2 py-0.5 text-xs">
        OPEX
      </Badge>
    );
  }
  if (normalized === "DIRECT") {
    return (
      <Badge tone="warning" className="font-medium text-purple-700 dark:text-purple-300 bg-purple-500/10 border-purple-500/20 px-2 py-0.5 text-xs">
        DIRECT
      </Badge>
    );
  }
  return (
    <Badge tone="neutral" className="font-medium px-2 py-0.5 text-xs">
      {normalized || "INDIRECT"}
    </Badge>
  );
}

function ActiveStatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <Badge tone="success" className="gap-1.5 font-medium px-2 py-0.5 text-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </Badge>
    );
  }
  return (
    <Badge tone="neutral" className="gap-1.5 font-medium px-2 py-0.5 text-xs">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
      Inactive
    </Badge>
  );
}

export function BudgetCategoriesTab() {
  const [categories, setCategories] = React.useState<IBudgetCategoryDto[]>(INITIAL_BUDGET_CATEGORIES);
  const [search, setSearch] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  // Filtered list
  const filteredList = React.useMemo(() => {
    return categories.filter((item) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        String(item.budget_category_id).toLowerCase().includes(q) ||
        (item.expense_type && item.expense_type.toLowerCase().includes(q)) ||
        (item.oracle_account_code && item.oracle_account_code.toLowerCase().includes(q))
      );
    });
  }, [categories, search]);

  const handleCreateCategory = (data: ICreateBudgetCategoryDto) => {
    // Generate UUID for budget_category_id
    const newId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });

    const newRecord: IBudgetCategoryDto = {
      budget_category_id: newId,
      code: data.code,
      name: data.name,
      expense_type: data.expense_type,
      oracle_account_code: data.oracle_account_code,
      is_active: data.is_active,
      is_delete: false,
      created_date: new Date().toISOString(),
      created_by: "super_admin",
    };

    setCategories((prev) => [newRecord, ...prev]);
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
          Add Budget Category
        </Button>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/70 bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[280px] text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 pl-6">
                Budget Category ID (UUID)
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                Code
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                Name
              </TableHead>
              <TableHead className="w-[120px] text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                Expense Type
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">
                Oracle Account Code
              </TableHead>
              <TableHead className="w-[110px] text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 pr-6">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileSpreadsheet className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No budget categories found.</p>
                    <p className="text-xs text-muted-foreground/70">
                      {search
                        ? "Try clearing your search to view all records."
                        : "Click 'Add Budget Category' above to create the first record."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((item) => (
                <TableRow
                  key={String(item.budget_category_id)}
                  className="hover:bg-muted/30 transition-colors border-b border-border/50"
                >
                  {/* budget_category_id (UUID) */}
                  <TableCell className="pl-6 py-4 font-mono text-xs text-muted-foreground select-all">
                    {String(item.budget_category_id)}
                  </TableCell>

                  {/* code */}
                  <TableCell className="py-4">
                    <span className="font-semibold text-foreground text-sm">
                      {item.code}
                    </span>
                  </TableCell>

                  {/* name */}
                  <TableCell className="py-4 text-xs sm:text-sm text-foreground font-medium">
                    {item.name}
                  </TableCell>

                  {/* expense_type */}
                  <TableCell className="py-4">
                    <ExpenseTypeBadge type={item.expense_type} />
                  </TableCell>

                  {/* oracle_account_code */}
                  <TableCell className="py-4">
                    {item.oracle_account_code ? (
                      <span className="inline-block font-mono text-xs text-foreground bg-muted/60 px-2 py-1 rounded border border-border/40">
                        {item.oracle_account_code}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">-</span>
                    )}
                  </TableCell>

                  {/* is_active */}
                  <TableCell className="pr-6 py-4">
                    <ActiveStatusBadge isActive={item.is_active} />
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
            <strong className="text-foreground">{categories.length}</strong> budget categories
          </span>
        </div>
      </div>

      {/* Add Budget Category Modal Dialog */}
      <AddBudgetCategoryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleCreateCategory}
      />
    </div>
  );
}
