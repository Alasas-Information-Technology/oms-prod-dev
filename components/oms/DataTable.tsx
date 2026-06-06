"use client";

import { useState, ReactNode } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/components/ui/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ColumnDef<T = Record<string, unknown>> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => ReactNode;
}

export interface RowAction<T = Record<string, unknown>> {
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void;
  variant?: "default" | "destructive";
  separator?: boolean;
}

interface DataTableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  columns: ColumnDef<T>[];
  data: T[];
  keyField: string;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  rowActions?: RowAction<T>[];
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  compact?: boolean;
}

type SortDir = "asc" | "desc" | null;

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  selectable = false,
  onSelectionChange,
  rowActions,
  pageSize = 8,
  loading = false,
  emptyMessage = "No records found.",
  className,
  compact = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortDir(null); setSortKey(null); }
      else setSortDir("asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const av = String(a[sortKey] ?? "");
    const bv = String(b[sortKey] ?? "");
    const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const toggleRow = (key: string) => {
    const next = new Set(selected);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelected(next);
    onSelectionChange?.(data.filter((r) => next.has(String(r[keyField]))));
  };

  const allPageSelected =
    paginated.length > 0 && paginated.every((r) => selected.has(String(r[keyField])));

  const toggleAll = () => {
    const pageKeys = paginated.map((r) => String(r[keyField]));
    const next = new Set(selected);
    if (allPageSelected) pageKeys.forEach((k) => next.delete(k));
    else pageKeys.forEach((k) => next.add(k));
    setSelected(next);
    onSelectionChange?.(data.filter((r) => next.has(String(r[keyField]))));
  };

  const colCount =
    columns.length + (selectable ? 1 : 0) + (rowActions?.length ? 1 : 0);

  const pageNums = (() => {
    const start = Math.max(0, Math.min(page - 2, totalPages - 5));
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);
  })();

  const SortIndicator = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey)
      return <ChevronsUpDown size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" />;
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="text-primary" />
    ) : (
      <ChevronDown size={12} className="text-primary" />
    );
  };

  return (
    <div className={cn("flex flex-col rounded-md border border-slate-200 overflow-hidden glass-card", className)}>
      <Table>
        <TableHeader className="bg-slate-50 border-b border-slate-200">
          <TableRow className="hover:bg-slate-50 border-slate-200">
            {selectable && (
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={allPageSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  "text-xs font-semibold text-slate-500 uppercase tracking-wider",
                  compact ? "py-2 px-3" : "py-3 px-4",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center"
                )}
              >
                {col.sortable ? (
                  <button
                    onClick={() => handleSort(col.key)}
                    className="group inline-flex items-center gap-1 hover:text-slate-800 transition-colors"
                  >
                    {col.header}
                    <SortIndicator colKey={col.key} />
                  </button>
                ) : (
                  col.header
                )}
              </TableHead>
            ))}
            {rowActions?.length ? (
              <TableHead className={cn("w-12", compact ? "py-2" : "py-3")} />
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={colCount} className="py-12 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading records...
                </div>
              </TableCell>
            </TableRow>
          ) : paginated.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colCount} className="py-12 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((row, idx) => {
              const rowKey = String(row[keyField]);
              const isSelected = selected.has(rowKey);
              return (
                <TableRow
                  key={rowKey}
                  data-state={isSelected ? "selected" : undefined}
                  className={cn(
                    "border-slate-100 premium-transition hover:bg-slate-50 relative hover:z-10 hover:shadow-sm",
                    idx % 2 === 1 && !isSelected && "bg-slate-50/40",
                    isSelected && "bg-blue-50/60"
                  )}
                >
                  {selectable && (
                    <TableCell className={cn("pl-4", compact ? "py-2" : "py-3")}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleRow(rowKey)}
                        aria-label="Select row"
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "text-sm text-slate-800",
                        compact ? "py-2 px-3" : "py-3 px-4",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center"
                      )}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? "")}
                    </TableCell>
                  ))}
                  {rowActions?.length ? (
                    <TableCell className={cn("pr-2 text-right", compact ? "py-1.5" : "py-2")}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7 rounded">
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {rowActions.map((action, i) => (
                            <div key={i}>
                              {action.separator && i > 0 && <DropdownMenuSeparator />}
                              <DropdownMenuItem
                                onClick={() => action.onClick(row)}
                                className={cn(
                                  "gap-2 text-sm",
                                  action.variant === "destructive" &&
                                    "text-destructive focus:text-destructive"
                                )}
                              >
                                {action.icon}
                                {action.label}
                              </DropdownMenuItem>
                            </div>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 bg-white">
          <div className="text-xs text-muted-foreground">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of{" "}
            {sorted.length} records
            {selected.size > 0 && (
              <span className="ml-2 text-primary font-medium">({selected.size} selected)</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="size-7 p-0 rounded"
            >
              <ChevronLeft size={14} />
            </Button>
            {pageNums.map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "ghost"}
                size="sm"
                onClick={() => setPage(p)}
                className="size-7 p-0 text-xs rounded"
              >
                {p + 1}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="size-7 p-0 rounded"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
