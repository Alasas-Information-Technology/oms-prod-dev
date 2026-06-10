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
  ColumnDef as TanstackColumnDef,
  flexRender,
  SortingState,
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
  
  // High-Performance Features
  enableSearch?: boolean;
  globalFilterFields?: string[];
  enableExport?: boolean;
  exportFilename?: string;
  pageSizeOptions?: number[];
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  selectable = false,
  onSelectionChange,
  rowActions,
  pageSize: initialPageSize = 8,
  loading = false,
  emptyMessage = "No records found.",
  className,
  compact = false,
  enableSearch = false,
  globalFilterFields,
  enableExport = false,
  exportFilename = "export",
  pageSizeOptions = [8, 10, 20, 50, 100],
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

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
          const val = row[col.key];
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
        accessorFn: (row: T) => row[col.key],
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
        const itemValue = row.original[fieldKey];
        return String(itemValue ?? "").toLowerCase().includes(value);
      });
    }
    
    // Default: search all object values
    return Object.values(row.original).some((val) => 
      String(val ?? "").toLowerCase().includes(value)
    );
  };

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: {
      sorting,
      rowSelection,
      globalFilter,
      pagination,
    },
    getRowId: (row) => String(row[keyField]),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: customGlobalFilterFn,
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
                placeholder="Search records..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 bg-white shadow-sm"
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
      <div className="rounded-md border border-slate-200 overflow-hidden bg-white/50 backdrop-blur-sm glass-card">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-slate-50/80 border-slate-200">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as any;
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: meta?.width }}
                      className={cn(
                        "text-xs font-semibold text-slate-500 uppercase tracking-wider",
                        compact ? "py-2 px-3" : "py-3 px-4",
                        meta?.align === "right" && "text-right",
                        meta?.align === "center" && "text-center"
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "group inline-flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer select-none",
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
                const isSelected = row.getIsSelected();
                return (
                  <TableRow
                    key={row.id}
                    data-state={isSelected ? "selected" : undefined}
                    className={cn(
                      "border-slate-100 premium-transition hover:bg-slate-50 relative hover:z-10 hover:shadow-sm",
                      idx % 2 === 1 && !isSelected && "bg-slate-50/40",
                      isSelected && "bg-blue-50/60"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as any;
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "text-sm text-slate-800",
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
        {(table.getPageCount() > 1 || pageSizeOptions.length > 1) && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-2.5 border-t border-slate-200 bg-white">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {pageSizeOptions.length > 1 && (
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={e => {
                    table.setPageSize(Number(e.target.value))
                  }}
                  className="h-8 px-2 rounded-md border border-input bg-white text-xs shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                >
                  {pageSizeOptions.map(size => (
                    <option key={size} value={size}>
                      Show {size} rows
                    </option>
                  ))}
                </select>
              )}
              <div className="text-xs text-muted-foreground text-center sm:text-left">
                Showing {table.getFilteredRowModel().rows.length === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
                {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{" "}
                {table.getFilteredRowModel().rows.length} records
                {Object.keys(rowSelection).length > 0 && (
                  <span className="ml-2 text-primary font-medium">({Object.keys(rowSelection).length} selected)</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="size-7 p-0 rounded"
              >
                <ChevronLeft size={14} />
              </Button>
              
              {Array.from({ length: table.getPageCount() }).map((_, i) => {
                const currentPage = table.getState().pagination.pageIndex;
                if (
                  i === 0 || 
                  i === table.getPageCount() - 1 || 
                  (i >= currentPage - 1 && i <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={i}
                      variant={i === currentPage ? "default" : "ghost"}
                      size="sm"
                      onClick={() => table.setPageIndex(i)}
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
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="size-7 p-0 rounded"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
