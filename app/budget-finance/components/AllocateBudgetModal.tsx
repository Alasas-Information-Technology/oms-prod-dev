'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertTriangle, CheckCircle2, PlusCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { financeService } from '@/lib/services/financeService';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Department {
    id: string;
    dept_name: string;
}

interface Props {
    actorId: string;
    userRole: string; // Passed for service-layer RBAC verification
    onClose: () => void;
    onSuccess: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatAED(value: number): string {
    return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

const CURRENT_YEAR = new Date().getFullYear();

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AllocateBudgetModal({ actorId, userRole, onClose, onSuccess }: Props) {

    // ── Static data (fetched once) ────────────────────────────────────────────
    const [allDepartments, setAllDepartments]  = useState<Department[]>([]);

    // ── Dynamic state (re-evaluated on year change) ───────────────────────────
    const [filteredDepts, setFilteredDepts]    = useState<Department[]>([]);
    const [filterLoading, setFilterLoading]    = useState(true);   // initial load

    // ── Form fields ───────────────────────────────────────────────────────────
    const [selectedDeptId, setSelectedDeptId]  = useState<string>('');
    const [financialYear, setFinancialYear]    = useState<string>(String(CURRENT_YEAR));
    const [allocation, setAllocation]          = useState<string>('');
    const [saving, setSaving]                  = useState(false);

    // ── 1. Fetch all departments once on mount ────────────────────────────────
    useEffect(() => {
        financeService.getDepartments(userRole)
            .then((data: Department[]) => setAllDepartments(data))
            .catch(() => toast.error('Failed to load departments list.'));
    }, [userRole]);

    // ── 2. Re-run filter whenever year OR the master dept list changes ─────────
    const refreshFilteredDepts = useCallback(async (year: number, allDepts: Department[]) => {
        if (allDepts.length === 0) return;
        if (isNaN(year) || year < 2020 || year > 2100) {
            setFilteredDepts(allDepts);
            return;
        }

        setFilterLoading(true);
        setSelectedDeptId('');

        try {
            const takenIds: Set<string> = await financeService.getExistingBudgetDeptIds(year, userRole);
            setFilteredDepts(allDepts.filter(d => !takenIds.has(d.id)));
        } catch {
            setFilteredDepts(allDepts);
        } finally {
            setFilterLoading(false);
        }
    }, [userRole]);

    // Trigger filter when allDepartments loads or year changes
    useEffect(() => {
        const year = parseInt(financialYear, 10);
        refreshFilteredDepts(year, allDepartments);
    }, [financialYear, allDepartments, refreshFilteredDepts]);

    // ── Derived values ────────────────────────────────────────────────────────
    const parsedYear         = parseInt(financialYear, 10);
    const parsedAmount       = parseFloat(allocation) || 0;
    const selectedDept       = filteredDepts.find(d => d.id === selectedDeptId);
    const isYearInvalid      = !financialYear || isNaN(parsedYear) || parsedYear < 2020 || parsedYear > 2100;
    const isAmountInvalid    = parsedAmount <= 0;
    const allAllocated       = !filterLoading && !isYearInvalid && filteredDepts.length === 0;
    const saveBlocked        = !selectedDeptId || isYearInvalid || isAmountInvalid || allAllocated || saving || filterLoading;

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleAllocate = async () => {
        if (saveBlocked || !selectedDept) return;
        setSaving(true);
        try {
            await financeService.allocateNewBudget(
                selectedDeptId,
                parsedYear,
                parsedAmount,
                actorId,
                userRole,
                selectedDept.dept_name
            );
            toast.success('New budget allocated successfully.');
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const anyErr = err as { code?: string; message?: string };
            if (anyErr?.code === '23505') {
                toast.error('A budget record for this department and year already exists.');
                refreshFilteredDepts(parsedYear, allDepartments);
            } else {
                toast.error(anyErr?.message ?? 'Failed to allocate budget.');
            }
        } finally {
            setSaving(false);
        }
    };

    // ── Year change handler ───────────────────────────────────────────────────
    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFinancialYear(e.target.value);
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg border-none shadow-modal p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0">
                            <PlusCircle size={16} className="text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-slate-900 leading-tight">
                                Allocate New Departmental Budget
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-400 mt-0.5">
                                Only unallocated departments for the selected year are shown.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 py-5 space-y-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="financial-year" className="text-sm font-semibold text-slate-700">
                            Financial Year <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="financial-year"
                                type="number"
                                min={2020}
                                max={2100}
                                value={financialYear}
                                onChange={handleYearChange}
                                className={`tabular-nums pr-9 ${isYearInvalid && financialYear ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                            />
                            {filterLoading && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <RefreshCw size={13} className="text-slate-400 animate-spin" />
                                </span>
                            )}
                        </div>
                        {isYearInvalid && financialYear && (
                            <p className="text-red-500 text-[11px]">Enter a year between 2020–2100.</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="dept-select" className="text-sm font-semibold text-slate-700">
                                Department <span className="text-red-500">*</span>
                            </Label>
                            {!filterLoading && !isYearInvalid && (
                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                    allAllocated
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                    {allAllocated
                                        ? 'All allocated'
                                        : `${filteredDepts.length} available`
                                    }
                                </span>
                            )}
                        </div>

                        {filterLoading ? (
                            <div className="flex items-center gap-2 h-10 px-3 border border-slate-200 rounded-md bg-slate-50 text-xs text-slate-400">
                                <Loader2 size={12} className="animate-spin" />
                                Checking availability for FY {parsedYear}…
                            </div>
                        ) : (
                            <Select
                                value={selectedDeptId}
                                onValueChange={setSelectedDeptId}
                                disabled={allAllocated || isYearInvalid}
                            >
                                <SelectTrigger
                                    id="dept-select"
                                    className={`w-full ${allAllocated ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    <SelectValue
                                        placeholder={
                                            allAllocated
                                                ? 'All departments allocated for this year.'
                                                : 'Select an unallocated department…'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredDepts.map(dept => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.dept_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {allAllocated && (
                            <div
                                id="all-allocated-warning"
                                className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 animate-fade-in"
                                role="status"
                            >
                                <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-500" />
                                <div>
                                    <p className="font-semibold">All departments have been allocated for FY {parsedYear}.</p>
                                    <p className="text-xs text-amber-700 mt-0.5">
                                        Switch to a different financial year, or use{' '}
                                        <em>Edit Allocation</em> to amend an existing budget.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="total-allocation" className="text-sm font-semibold text-slate-700">
                            Total Allocation (AED) <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 pointer-events-none">
                                AED
                            </span>
                            <Input
                                id="total-allocation"
                                type="number"
                                min={1}
                                step={1000}
                                placeholder="0"
                                value={allocation}
                                onChange={e => setAllocation(e.target.value)}
                                className="pl-12 tabular-nums font-semibold"
                                disabled={allAllocated}
                            />
                        </div>
                    </div>

                    {!saveBlocked && selectedDept && (
                        <div
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 animate-fade-in"
                        >
                            <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
                            <span>
                                Ready to allocate <strong>{formatAED(parsedAmount)}</strong> to{' '}
                                <strong>{selectedDept.dept_name}</strong> for FY {parsedYear}.
                            </span>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
                    <Button variant="outline" type="button" onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button
                        id="allocate-funds-btn"
                        type="button"
                        onClick={handleAllocate}
                        disabled={saveBlocked}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[150px] disabled:opacity-60 disabled:cursor-not-allowed gap-2"
                        title={allAllocated ? 'All departments are allocated for this year' : undefined}
                    >
                        {saving ? (
                            <><Loader2 size={14} className="animate-spin" /> Allocating…</>
                        ) : (
                            <><PlusCircle size={14} /> Allocate Funds</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
