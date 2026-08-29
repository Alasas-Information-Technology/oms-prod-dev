"use client";

import { useState, ReactNode, useMemo, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  Download,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  ColumnDef as TanstackColumnDef,
  flexRender,
  SortingState,
  GroupingState,
  ExpandedState,
  FilterFn,
} from "@tanstack/react-table";
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
import { Input } from "@/components/ui/input";

export interface ColumnDef<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => ReactNode;
}

export interface RowAction<T = any> {
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void;
  variant?: "default" | "destructive";
  separator?: boolean;
}

export interface DataTableProps<T = any> {
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
  onRowClick?: (row: T) => void;
  selectedRowKey?: string | null;
  isRowActive?: (row: T) => boolean;

  // Server-side / Manual Pagination Support
  manualPagination?: boolean;
  pageCount?: number;
  totalCount?: number;
  pageIndex?: number; // 0-indexed
  onPageChange?: (page: number) => void; // 1-indexed target page
  onPageSizeChange?: (pageSize: number) => void;
  hidePagination?: boolean;

  // High-Performance Features
  enableSearch?: boolean;
  searchPlaceholder?: string;
  globalFilterFields?: string[];
  enableExport?: boolean;
  exportFilename?: string;
  pageSizeOptions?: number[];
  groupBy?: string[];
}

export function DataTable<T = any>({
  columns,
  data,
  keyField,
  selectable = false,
  onSelectionChange,
  rowActions,
  pageSize: initialPageSize = 10,
  loading = false,
  emptyMessage = "No records found.",
  className,
  compact = false,
  onRowClick,
  selectedRowKey,
  isRowActive,
  manualPagination = false,
  pageCount,
  totalCount,
  pageIndex,
  onPageChange,
  onPageSizeChange,
  hidePagination = false,
  enableSearch = false,
  searchPlaceholder = "Search records...",
  globalFilterFields,
  enableExport = false,
  exportFilename = "export",
  pageSizeOptions = [10, 20, 50, 100],
  groupBy,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [grouping, setGrouping] = useState<GroupingState>(groupBy || []);
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const [internalPagination, setInternalPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const activePageIndex = manualPagination ? (pageIndex ?? 0) : internalPagination.pageIndex;
  const activePageSize = manualPagination ? (initialPageSize) : internalPagination.pageSize;

  // Export to CSV utility (all filtered rows, ignoring pagination)
  const handleExport = (filteredRows: T[]) => {
    if (filteredRows.length === 0) return;

    // Headers
    const exportHeaders = columns.map(c => c.header).join(",");

    // Rows
    const csvContent = [
      exportHeaders,
      ...filteredRows.map(row =>
        columns.map(col => {
          const val = (row as any)[col.key];
          const stringVal = typeof val === "string" ? val : String(val ?? "");
          return `"${stringVal.replace(/"/g, '""')}"`;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${exportFilename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Map custom columns to TanStack columns
  const finalColumns = useMemo<TanstackColumnDef<T>[]>(() => {
    const cols: TanstackColumnDef<T>[] = [];

    if (selectable) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <div className="w-10 pl-4 flex items-center justify-center">
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="w-10 pl-4 flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    cols.push(
      ...columns.map((col) => ({
        id: col.key,
        accessorFn: (row: T) => (row as any)[col.key],
        header: col.header,
        enableSorting: col.sortable ?? false,
        cell: (info) => {
          const val = info.getValue();
          return col.render ? col.render(val, info.row.original) : String(val ?? "");
        },
        meta: { align: col.align, width: col.width },
      } as TanstackColumnDef<T>))
    );

    if (rowActions?.length) {
      cols.push({
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className={cn("flex justify-end pr-2")}>
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
                      onClick={() => action.onClick(row.original)}
                      className={cn(
                        "gap-2 text-sm",
                        action.variant === "destructive" && "text-destructive focus:text-destructive"
                      )}
                    >
                      {action.icon}
                      {action.label}
                    </DropdownMenuItem>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      });
    }

    return cols;
  }, [columns, selectable, rowActions]);

  // Custom global filter function that respects globalFilterFields prop
  const customGlobalFilterFn: FilterFn<T> = (row, columnId, filterValue) => {
    const value = filterValue.toLowerCase();

    // If fields are explicitly specified, search only those
    if (globalFilterFields && globalFilterFields.length > 0) {
      return globalFilterFields.some((fieldKey) => {
        const itemValue = (row.original as any)[fieldKey];
        return String(itemValue ?? "").toLowerCase().includes(value);
      });
    }

    // Default: search all object values
    return Object.values((row.original as Record<string, unknown>) || {}).some((val) =>
      String(val ?? "").toLowerCase().includes(value)
    );
  };

  const table = useReactTable({
    data,
    columns: finalColumns,
    manualPagination: Boolean(manualPagination),
    pageCount: manualPagination ? (pageCount ?? -1) : undefined,
    rowCount: manualPagination ? totalCount : undefined,
    state: {
      sorting,
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex: activePageIndex,
        pageSize: activePageSize,
      },
      grouping,
      expanded,
    },
    getRowId: (row) => String((row as any)[keyField]),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: manualPagination ? undefined : setInternalPagination,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: manualPagination ? undefined : getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: customGlobalFilterFn,
    autoResetPageIndex: false,
  });

  // Call the external onSelectionChange when internal selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getSelectedRowModel().rows.map(r => r.original);
      onSelectionChange(selectedRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  const hasToolbar = enableSearch || enableExport;

  return (
    <div className={cn("flex flex-col gap-3", className)}>

      {/* Top Toolbar */}
      {hasToolbar && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {enableSearch ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 shadow-sm"
              />
            </div>
          ) : <div />}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {enableExport && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 shadow-sm"
                onClick={() => handleExport(table.getFilteredRowModel().rows.map(r => r.original))}
              >
                <Download size={14} />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm glass-card">
        <Table className="border-none!">
          <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/80 border-slate-200 dark:border-slate-800">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as any;
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: meta?.width }}
                      className={cn(
                        "text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider",
                        compact ? "py-2 px-3" : "py-3 px-4",
                        meta?.align === "right" && "text-right",
                        meta?.align === "center" && "text-center"
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "group inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer select-none",
                            meta?.align === "right" && "justify-end w-full",
                            meta?.align === "center" && "justify-center w-full"
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="flex items-center">
                            {{
                              asc: <ChevronUp size={12} className="text-primary" />,
                              desc: <ChevronDown size={12} className="text-primary" />,
                            }[header.column.getIsSorted() as string] ?? (
                                <ChevronsUpDown size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                              )}
                          </span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={finalColumns.length} className="py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                    <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Loading records...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, idx) => {
                if (row.getIsGrouped()) {
                  const colId = row.groupingColumnId || "";
                  return (
                    <TableRow key={row.id} className="bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer font-medium" onClick={row.getToggleExpandedHandler()}>
                      <TableCell colSpan={finalColumns.length} className="py-2 px-4">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                          {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span>{colId}: {String(row.getValue(colId))} ({row.subRows.length})</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }

                const rowKeyVal = String((row.original as any)[keyField]);
                const isActive = (selectedRowKey !== undefined && selectedRowKey !== null && rowKeyVal === String(selectedRowKey)) || (isRowActive?.(row.original) ?? false);
                const isSelected = row.getIsSelected() || isActive;
                return (
                  <TableRow
                    key={row.id}
                    data-state={isSelected ? "selected" : undefined}
                    onClick={() => onRowClick?.(row.original)}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={onRowClick ? (e: React.KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(row.original);
                      }
                    } : undefined}
                    role={onRowClick ? "button" : undefined}
                    className={cn(
                      "border-slate-100 dark:border-slate-800 premium-transition hover:bg-slate-50 dark:hover:bg-slate-800/50 relative hover:z-10 hover:shadow-xs",
                      onRowClick && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                      idx % 2 === 1 && !isSelected && "bg-slate-50/40 dark:bg-slate-900/10",
                      isSelected && "bg-primary/10 dark:bg-primary/20 border-primary/40 font-medium"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      if (cell.getIsGrouped()) return null;
                      if (cell.getIsPlaceholder()) {
                        return <TableCell key={cell.id} />;
                      }
                      const meta = cell.column.columnDef.meta as any;
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "text-sm text-slate-800 dark:text-slate-200",
                            compact ? "py-2 px-3" : "py-3 px-4",
                            meta?.align === "right" && "text-right",
                            meta?.align === "center" && "text-center"
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={finalColumns.length} className="py-12 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Footer Pagination Info */}
        {!hidePagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {pageSizeOptions.length > 1 && (
                <select
                  value={activePageSize}
                  onChange={e => {
                    const newSize = Number(e.target.value);
                    if (manualPagination) {
                      onPageSizeChange?.(newSize);
                    } else {
                      table.setPageSize(newSize);
                      setInternalPagination(p => ({ ...p, pageSize: newSize, pageIndex: 0 }));
                    }
                  }}
                  className="h-8 px-2 rounded-md border border-input bg-white dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 text-xs shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                >
                  {pageSizeOptions.map(size => (
                    <option key={size} value={size}>
                      Show {size} rows
                    </option>
                  ))}
                </select>
              )}
              <div className="text-xs text-muted-foreground text-center sm:text-left">
                Showing {(() => {
                  const totalRows = manualPagination
                    ? (totalCount ?? data.length)
                    : (table.getFilteredRowModel()?.rows?.length ?? data.length);
                  if (totalRows === 0) return "0–0 of 0";
                  const start = activePageIndex * activePageSize + 1;
                  const end = Math.min((activePageIndex + 1) * activePageSize, totalRows);
                  return `${start}–${end} of ${totalRows}`;
                })()} records
                {Object.keys(rowSelection).length > 0 && (
                  <span className="ml-2 text-primary font-medium">({Object.keys(rowSelection).length} selected)</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-end">
              {(() => {
                const totalRows = manualPagination
                  ? (totalCount ?? data.length)
                  : (table.getFilteredRowModel()?.rows?.length ?? data.length);
                const totalPgs = manualPagination
                  ? (pageCount ?? Math.max(1, Math.ceil(totalRows / activePageSize)))
                  : Math.max(1, table.getPageCount());
                const currentPage = activePageIndex;
                const canPrev = activePageIndex > 0;
                const canNext = activePageIndex < totalPgs - 1;

                return (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (manualPagination) {
                          onPageChange?.(Math.max(1, activePageIndex));
                        } else {
                          table.previousPage();
                        }
                      }}
                      disabled={!canPrev}
                      className="size-7 p-0 rounded"
                    >
                      <ChevronLeft size={14} />
                    </Button>

                    {Array.from({ length: totalPgs }).map((_, i) => {
                      if (
                        i === 0 ||
                        i === totalPgs - 1 ||
                        (i >= currentPage - 1 && i <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={i}
                            variant={i === currentPage ? "default" : "ghost"}
                            size="sm"
                            onClick={() => {
                              if (manualPagination) {
                                onPageChange?.(i + 1);
                              } else {
                                table.setPageIndex(i);
                              }
                            }}
                            className="size-7 p-0 text-xs rounded"
                          >
                            {i + 1}
                          </Button>
                        );
                      }
                      if (i === currentPage - 2 || i === currentPage + 2) {
                        return <span key={i} className="px-1 text-slate-400">...</span>;
                      }
                      return null;
                    })}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (manualPagination) {
                          onPageChange?.(activePageIndex + 2);
                        } else {
                          table.nextPage();
                        }
                      }}
                      disabled={!canNext}
                      className="size-7 p-0 rounded"
                    >
                      <ChevronRight size={14} />
                    </Button>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
