'use client';

import React, { useState } from 'react';
import { Loader2, AlertTriangle, CheckCircle2, TrendingDown, Lock, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
export interface BudgetRowForEdit {
    id: string;
    dept_name: string;
    total_allocated: number;
    consumed: number;
    reserved: number;
    available: number;
}

interface Props {
    row: BudgetRowForEdit;
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

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function EditBudgetModal({ row, actorId, userRole, onClose, onSuccess }: Props) {
    // Pre-fill with the current allocation
    const [newAllocation, setNewAllocation] = useState<string>(String(row.total_allocated));
    const [saving, setSaving] = useState(false);

    const parsedAmount  = parseFloat(newAllocation) || 0;
    const minAllowed    = row.consumed + row.reserved;    // floor — can't go below commitments
    const isBelowFloor  = parsedAmount < minAllowed;
    const isUnchanged   = parsedAmount === row.total_allocated;
    const isInvalid     = parsedAmount <= 0 || isBelowFloor;
    const saveBlocked   = isInvalid || isUnchanged || saving;

    const delta         = parsedAmount - row.total_allocated;
    const deltaPositive = delta >= 0;

    const handleSave = async () => {
        if (saveBlocked) return;
        setSaving(true);
        try {
            await financeService.updateDepartmentBudget(
                row.id,
                parsedAmount,
                actorId,
                userRole,
                row.dept_name
            );
            toast.success('Department budget successfully amended.');
            onSuccess();   // triggers parent data refresh
            onClose();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to update budget.';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg border-none shadow-modal p-0 overflow-hidden">
                {/* ── Header ── */}
                <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shrink-0">
                            <Pencil size={15} className="text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-slate-900 leading-tight">
                                Modify Budget Allocation
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-400 mt-0.5">
                                {row.dept_name} · FY 2026
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* ── Body ── */}
                <div className="px-6 py-5 space-y-5">
                    {/* Contextual read-only facts */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                                <TrendingDown size={12} />
                                Currently Consumed
                            </div>
                            <span className="text-base font-bold text-rose-700 tabular-nums">
                                {formatAED(row.consumed)}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                                <Lock size={12} />
                                Currently Reserved
                            </div>
                            <span className="text-base font-bold text-amber-700 tabular-nums">
                                {formatAED(row.reserved)}
                            </span>
                        </div>
                    </div>

                    {/* Minimum floor info */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500">
                        <AlertTriangle size={11} className="text-slate-400 shrink-0" />
                        Minimum allocation floor:{' '}
                        <span className="font-semibold text-slate-700">{formatAED(minAllowed)}</span>
                        &nbsp;(consumed + reserved)
                    </div>

                    {/* New allocation input */}
                    <div className="space-y-1.5">
                        <Label htmlFor="new-allocation" className="text-sm font-semibold text-slate-700">
                            New Total Allocation (AED) <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 pointer-events-none">
                                AED
                            </span>
                            <Input
                                id="new-allocation"
                                type="number"
                                min={minAllowed}
                                step={1000}
                                value={newAllocation}
                                onChange={(e) => setNewAllocation(e.target.value)}
                                className={`pl-12 text-base font-semibold tabular-nums ${
                                    isBelowFloor ? 'border-red-400 focus-visible:ring-red-400' : ''
                                }`}
                            />
                        </div>
                    </div>

                    {/* ── Validation messages ── */}
                    {isBelowFloor && (
                        <div
                            id="allocation-floor-warning"
                            className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 animate-fade-in"
                            role="alert"
                        >
                            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-500" />
                            <div>
                                <p className="font-semibold">Allocation cannot be lower than existing commitments.</p>
                                <p className="text-xs text-red-600 mt-0.5">
                                    Total commitments are {formatAED(minAllowed)}. Enter a value at or above this amount.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Delta preview — only when valid and changed */}
                    {!isInvalid && !isUnchanged && parsedAmount > 0 && (
                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs animate-fade-in ${
                            deltaPositive
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                            <CheckCircle2 size={13} className="shrink-0" />
                            <span>
                                Allocation will{' '}
                                <strong>{deltaPositive ? 'increase' : 'decrease'}</strong> by{' '}
                                <strong>{formatAED(Math.abs(delta))}</strong>.
                                New available liquidity:{' '}
                                <strong>{formatAED(parsedAmount - minAllowed)}</strong>.
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="border-slate-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        id="save-budget-btn"
                        type="button"
                        onClick={handleSave}
                        disabled={saveBlocked}
                        className="bg-[hsl(214,67%,32%)] hover:bg-[hsl(214,67%,28%)] text-white min-w-[140px] disabled:opacity-60 disabled:cursor-not-allowed"
                        title={isBelowFloor ? 'Resolve allocation conflict to save' : undefined}
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" />
                                Saving…
                            </span>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
