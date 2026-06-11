"use client";

import * as React from "react";
import { Icon } from '@iconify/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc" | null;

export interface ColumnDef<T> {
    /** Unique key — also used as the accessor if accessor is not provided */
    key: string;
    /** Column header label */
    label: string;
    /**
     * How to read the cell value from a row.
     * - string   → dot-path on the row object (e.g. "user.name")
     * - function → custom extractor
     */
    accessor?: string | ((row: T) => unknown);
    /** Custom render — receives raw value and full row */
    render?: (value: unknown, row: T) => React.ReactNode;
    /** Whether this column is sortable. Default: true */
    sortable?: boolean;
    /**
     * Include this column in search filtering.
     * Pass true to use the resolved cell value, or a function for a custom string.
     */
    searchable?: boolean | ((row: T) => string);
    /** Tailwind classes applied to both <th> and <td> */
    className?: string;
    /** Tailwind classes applied to <th> only */
    headerClassName?: string;
    /** Tailwind classes applied to <td> only */
    cellClassName?: string;
}

export interface DataTableAction {
    label: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    /** Custom Tailwind classes; defaults to a neutral outlined button */
    className?: string;
}

export interface DataTableProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
    rowKey: (row: T) => string | number;

    // Header
    title?: string;
    description?: string;
    actions?: DataTableAction[];

    // Search
    searchable?: boolean;
    searchPlaceholder?: string;

    // Pagination
    paginated?: boolean;
    pageSizeOptions?: number[];
    defaultPageSize?: number;

    // States
    loading?: boolean;
    emptyMessage?: string;
    emptyDescription?: string;

    // Row interaction
    onRowClick?: (row: T) => void;

    // Styling
    className?: string;
    rowClassName?: string | ((row: T) => string);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getValueByPath(obj: unknown, path: string): unknown {
    return path.split(".").reduce<unknown>((acc, key) => {
        if (acc != null && typeof acc === "object") {
            return (acc as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
}

function getCellValue<T>(row: T, col: ColumnDef<T>): unknown {
    if (col.accessor) {
        return typeof col.accessor === "function"
            ? col.accessor(row)
            : getValueByPath(row, col.accessor);
    }
    return getValueByPath(row, col.key);
}

function getSearchValue<T>(row: T, col: ColumnDef<T>): string {
    if (typeof col.searchable === "function") return col.searchable(row);
    const v = getCellValue(row, col);
    return v == null ? "" : String(v);
}

function sortRows<T>(rows: T[], col: ColumnDef<T> | undefined, dir: SortDirection): T[] {
    if (!col || !dir) return rows;
    return [...rows].sort((a, b) => {
        const av = getCellValue(a, col);
        const bv = getCellValue(b, col);
        const cmp =
            av instanceof Date && bv instanceof Date
                ? av.getTime() - bv.getTime()
                : typeof av === "number" && typeof bv === "number"
                    ? av - bv
                    : String(av ?? "").localeCompare(String(bv ?? ""), undefined, { numeric: true });
        return dir === "asc" ? cmp : -cmp;
    });
}

/**
 * Builds the page number list with ellipsis tokens.
 *
 * Rules:
 *  - Always show first and last page.
 *  - Always show up to `siblings` pages either side of the current page.
 *  - Replace gaps with "..." — but only if the gap is > 1 page wide
 *    (a gap of exactly 1 just shows that page instead of the ellipsis).
 *
 * Examples (totalPages = 20, siblings = 1):
 *   current=1  → 1 2 3 … 20
 *   current=5  → 1 … 4 5 6 … 20
 *   current=19 → 1 … 18 19 20
 */
function buildPageItems(
    currentPage: number,
    totalPages: number,
    siblings = 1
): (number | "...")[] {
    if (totalPages <= 1) return [1];

    // Window around current page
    const rangeStart = Math.max(2, currentPage - siblings);
    const rangeEnd = Math.min(totalPages - 1, currentPage + siblings);

    const items: (number | "...")[] = [1];

    // Left gap
    if (rangeStart > 2) {
        items.push("...");
    } else if (rangeStart === 2) {
        // No gap — just include page 2 naturally via the loop below
    }

    for (let p = rangeStart; p <= rangeEnd; p++) {
        items.push(p);
    }

    // Right gap
    if (rangeEnd < totalPages - 1) {
        items.push("...");
    }

    items.push(totalPages);

    return items;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SortIcon({ direction }: { direction: SortDirection }) {
    if (direction === "asc") return <Icon icon="mdi:chevron-up" className="w-3.5 h-3.5 shrink-0" />;
    if (direction === "desc") return <Icon icon="mdi:chevron-down" className="w-3.5 h-3.5 shrink-0" />;
    return <Icon icon="mdi:swap-vertical" className="w-3.5 h-3.5 shrink-0 opacity-40" />;
}

function SkeletonRows({ cols }: { cols: number }) {
    return (
        <>
            {Array.from({ length: 5 }).map((_, ri) => (
                <TableRow key={ri} className="hover:bg-transparent">
                    {Array.from({ length: cols }).map((_, ci) => (
                        <TableCell key={ci}>
                            <div className="h-4 bg-muted animate-pulse rounded-md w-3/4" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DataTable<T>({
    columns,
    data,
    rowKey,
    title,
    description,
    actions,
    searchable = false,
    searchPlaceholder = "Search...",
    paginated = false,
    pageSizeOptions = [10, 25, 50],
    defaultPageSize = 10,
    loading = false,
    emptyMessage = "No results found",
    emptyDescription,
    onRowClick,
    className,
    rowClassName,
}: DataTableProps<T>) {
    const [search, setSearch] = React.useState("");
    const [sortKey, setSortKey] = React.useState<string | null>(null);
    const [sortDir, setSortDir] = React.useState<SortDirection>(null);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(defaultPageSize);

    React.useEffect(() => { setPage(1); }, [search]);

    // Filter
    const searchableCols = columns.filter((c) => c.searchable);
    const filtered = React.useMemo(() => {
        if (!search.trim() || searchableCols.length === 0) return data;
        const q = search.toLowerCase();
        return data.filter((row) =>
            searchableCols.some((col) =>
                getSearchValue(row, col).toLowerCase().includes(q)
            )
        );
    }, [data, search, searchableCols]);

    // Sort
    const sortCol = columns.find((c) => c.key === sortKey);
    const sorted = React.useMemo(
        () => sortRows(filtered, sortCol, sortDir),
        [filtered, sortCol, sortDir]
    );

    // Paginate
    const totalRows = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    const safePage = Math.min(page, totalPages);
    const visibleRows = paginated
        ? sorted.slice((safePage - 1) * pageSize, safePage * pageSize)
        : sorted;

    function handleSort(key: string) {
        if (sortKey !== key) { setSortKey(key); setSortDir("asc"); return; }
        if (sortDir === "asc") { setSortDir("desc"); return; }
        setSortKey(null); setSortDir(null);
    }

    const hasHeader = title || description || (actions && actions.length > 0) || searchable;

    // Page items for smart pagination
    const pageItems = buildPageItems(safePage, totalPages, 1);

    return (
        <div className={cn("bg-card text-card-foreground rounded-xl border border-border overflow-hidden", className)}>

            {/* ── Top bar ── */}
            {hasHeader && (
                <div className="flex flex-col gap-3 px-5 pt-5 pb-4 border-b border-border sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        {title && (
                            <h3 className="text-sm font-semibold text-foreground leading-tight">{title}</h3>
                        )}
                        {description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {searchable && (
                            <div className="relative">
                                <Icon
                                    icon="mdi:magnify"
                                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
                                />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="h-8 w-52 rounded-lg border border-border bg-background pl-8 pr-7 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                    >
                                        <Icon icon="mdi:close" className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        )}
                        {actions?.map((action, i) => (
                            <button
                                key={i}
                                onClick={action.onClick}
                                disabled={action.disabled}
                                className={cn(
                                    "cursor-pointer inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium transition-colors",
                                    "disabled:opacity-40 disabled:pointer-events-none",
                                    action.className ?? "border border-border text-foreground hover:bg-muted"
                                )}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Table ── */}
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        {columns.map((col) => {
                            const isSorted = sortKey === col.key;
                            const canSort = col.sortable !== false;
                            return (
                                <TableHead
                                    key={col.key}
                                    onClick={canSort ? () => handleSort(col.key) : undefined}
                                    className={cn(
                                        "text-[10px] font-semibold text-muted-foreground tracking-wider uppercase whitespace-nowrap",
                                        canSort && "cursor-pointer select-none",
                                        col.className,
                                        col.headerClassName
                                    )}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {canSort && <SortIcon direction={isSorted ? sortDir : null} />}
                                    </div>
                                </TableHead>
                            );
                        })}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {loading && <SkeletonRows cols={columns.length} />}

                    {!loading && visibleRows.length === 0 && (
                        <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={columns.length} className="py-16 text-center">
                                <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
                                {emptyDescription && (
                                    <p className="text-xs text-muted-foreground mt-1">{emptyDescription}</p>
                                )}
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && visibleRows.map((row) => {
                        const extraClass =
                            typeof rowClassName === "function" ? rowClassName(row) : rowClassName;
                        return (
                            <TableRow
                                key={rowKey(row)}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                                className={cn(onRowClick && "cursor-pointer", extraClass)}
                            >
                                {columns.map((col) => {
                                    const value = getCellValue(row, col);
                                    return (
                                        <TableCell
                                            key={col.key}
                                            className={cn(col.className, col.cellClassName)}
                                        >
                                            {col.render
                                                ? col.render(value, row)
                                                : value == null ? "—" : String(value)}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {/* ── Pagination ── */}
            {paginated && (
                <div className="flex flex-col gap-3 px-5 py-3 border-t border-border sm:flex-row sm:items-center sm:justify-between">

                    {/* Left side: row count + page-size picker */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                            {totalRows === 0
                                ? "0 results"
                                : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, totalRows)} of ${totalRows}`}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span>Rows</span>
                            <select
                                value={pageSize}
                                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                                className="h-7 rounded-md border border-border bg-background px-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                            >
                                {pageSizeOptions.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Right side: smart page controls */}
                    <div className="flex items-center gap-1">

                        {/* First page */}
                        <button
                            onClick={() => setPage(1)}
                            disabled={safePage === 1}
                            title="First page"
                            className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                            <Icon icon="mdi:chevron-double-left" className="w-3.5 h-3.5" />
                        </button>

                        {/* Previous page */}
                        <button
                            onClick={() => setPage((p) => p - 1)}
                            disabled={safePage === 1}
                            title="Previous page"
                            className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                            <Icon icon="mdi:chevron-left" className="w-3.5 h-3.5" />
                        </button>

                        {/* Smart page number pills */}
                        <div className="flex items-center gap-1 mx-0.5">
                            {pageItems.map((item, idx) =>
                                item === "..." ? (
                                    // Ellipsis — not interactive
                                    <span
                                        key={`ellipsis-${idx}`}
                                        className="w-7 h-7 flex items-center justify-center text-xs text-muted-foreground select-none"
                                    >
                                        …
                                    </span>
                                ) : (
                                    <button
                                        key={item}
                                        onClick={() => setPage(item)}
                                        className={cn(
                                            "cursor-pointer w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-colors",
                                            item === safePage
                                                ? "bg-primary text-primary-foreground border border-primary"
                                                : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        {item}
                                    </button>
                                )
                            )}
                        </div>

                        {/* Next page */}
                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={safePage === totalPages}
                            title="Next page"
                            className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                            <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5" />
                        </button>

                        {/* Last page */}
                        <button
                            onClick={() => setPage(totalPages)}
                            disabled={safePage === totalPages}
                            title="Last page"
                            className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                            <Icon icon="mdi:chevron-double-right" className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}