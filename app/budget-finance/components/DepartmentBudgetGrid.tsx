'use client';

import React from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface BudgetRow {
    id: string;
    dept_name: string;
    total_allocated: number;
    consumed: number;
    reserved: number;
    available: number;
    utilization: number;
}

interface Props {
    rows: BudgetRow[];
    /** RBAC-controlled: pass the role name so the grid can gate the Actions column */
    currentRole?: string;
    /** Called when user clicks the Edit Allocation button on a row */
    onEdit?: (row: BudgetRow) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const EDIT_ALLOWED_ROLES = ['FINANCE_OFFICER', 'SYSTEM_ADMIN'];

function formatAED(value: number): string {
    return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function UtilizationBar({ pct }: { pct: number }) {
    let barColor   = 'bg-emerald-500';
    let trackColor = 'bg-emerald-100';
    let labelColor = 'text-emerald-700';

    if (pct > 90) {
        barColor   = 'bg-red-500';
        trackColor = 'bg-red-100';
        labelColor = 'text-red-700';
    } else if (pct > 75) {
        barColor   = 'bg-amber-500';
        trackColor = 'bg-amber-100';
        labelColor = 'text-amber-700';
    }

    return (
        <div className="flex items-center gap-2">
            <div className={`relative flex-1 h-2 rounded-full ${trackColor} overflow-hidden`}>
                <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className={`text-xs font-bold w-10 text-right tabular-nums ${labelColor}`}>
                {pct.toFixed(1)}%
            </span>
        </div>
    );
}

function StatusBadge({ pct }: { pct: number }) {
    if (pct > 90) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Critical
            </span>
        );
    }
    if (pct > 75) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Warning
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Healthy
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function DepartmentBudgetGrid({ rows, currentRole, onEdit }: Props) {
    const canEdit = currentRole ? EDIT_ALLOWED_ROLES.includes(currentRole) : false;

    if (rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-slate-400 text-sm">No budget data found for FY 2026.</p>
                <p className="text-slate-300 text-xs mt-1">Ensure departments and budget rows have been seeded in Supabase.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-48">
                            Department
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Allocated
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Consumed
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Reserved
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Available
                        </th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-52">
                            Utilization
                        </th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Status
                        </th>
                        {/* Actions column — only rendered for authorised roles */}
                        {canEdit && (
                            <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center w-28">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                    {rows.map((row, idx) => (
                        <tr
                            key={row.id}
                            className="hover:bg-slate-50/60 transition-colors duration-150 group"
                            style={{ animationDelay: `${idx * 40}ms` }}
                        >
                            {/* Dept Name */}
                            <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                                        style={{ backgroundColor: getDeptColor(idx) }}
                                    >
                                        {row.dept_name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-slate-800 truncate max-w-[130px]" title={row.dept_name}>
                                        {row.dept_name}
                                    </span>
                                </div>
                            </td>

                            {/* Allocated */}
                            <td className="py-3.5 px-4 text-right">
                                <span className="font-semibold text-slate-700 tabular-nums">
                                    {formatAED(row.total_allocated)}
                                </span>
                            </td>

                            {/* Consumed */}
                            <td className="py-3.5 px-4 text-right">
                                <span className="text-rose-600 font-medium tabular-nums">
                                    {formatAED(row.consumed)}
                                </span>
                            </td>

                            {/* Reserved */}
                            <td className="py-3.5 px-4 text-right">
                                <span className="text-amber-600 font-medium tabular-nums">
                                    {formatAED(row.reserved)}
                                </span>
                            </td>

                            {/* Available */}
                            <td className="py-3.5 px-4 text-right">
                                <span className={`font-semibold tabular-nums ${row.available < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {formatAED(row.available)}
                                </span>
                            </td>

                            {/* Utilization bar */}
                            <td className="py-3.5 px-4">
                                <UtilizationBar pct={row.utilization} />
                            </td>

                            {/* Status badge */}
                            <td className="py-3.5 px-4">
                                <StatusBadge pct={row.utilization} />
                            </td>

                            {/* Actions — only rendered for authorised roles */}
                            {canEdit && (
                                <td className="py-3.5 px-4 text-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        id={`edit-budget-${row.id}`}
                                        aria-label={`Edit allocation for ${row.dept_name}`}
                                        onClick={() => onEdit?.(row)}
                                        className="h-7 px-2.5 gap-1.5 text-xs font-semibold border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                    >
                                        <Pencil size={12} />
                                        Edit
                                    </Button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic per-department avatar colours
// ─────────────────────────────────────────────────────────────────────────────
const DEPT_COLORS = [
    '#2563EB', // blue
    '#7C3AED', // violet
    '#0891B2', // cyan
    '#B45309', // amber-dark
    '#047857', // emerald
    '#BE185D', // pink
    '#C2410C', // orange
    '#4338CA', // indigo
];

function getDeptColor(idx: number): string {
    return DEPT_COLORS[idx % DEPT_COLORS.length];
}
