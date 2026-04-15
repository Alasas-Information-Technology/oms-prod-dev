'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import EnterpriseSummaryCards from './components/EnterpriseSummaryCards';
import DepartmentBudgetGrid, { type BudgetRow } from './components/DepartmentBudgetGrid';
import EditBudgetModal from './components/EditBudgetModal';
import AllocateBudgetModal from './components/AllocateBudgetModal';
import { financeService } from '@/lib/services/financeService';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, RefreshCw, AlertTriangle, CalendarDays, PlusCircle, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
interface EnterpriseSummary {
    totalBudget: number;
    totalConsumed: number;
    totalReserved: number;
    totalAvailable: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Skeleton Loading State
// ──────────────────────────────────────────────────────────────────────────────
function PageSkeleton() {
    return (
        <AppLayout>
            <div className="max-w-screen-2xl mx-auto space-y-7 pb-20">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-64" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-9 w-28 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-2xl" />
                    ))}
                </div>
                <Skeleton className="h-96 rounded-2xl" />
            </div>
        </AppLayout>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// Access guard for non-permitted roles (403 Component)
// ──────────────────────────────────────────────────────────────────────────────
function AccessDenied() {
    const router = useRouter();
    
    return (
        <AppLayout>
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 max-w-lg mx-auto">
                <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center mb-8 shadow-sm border border-rose-100">
                    <ShieldAlert className="text-rose-500" size={40} />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-4">403 Unauthorized</h1>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    You do not have clearance to view enterprise financial data. This area is restricted to 
                    <span className="font-semibold text-slate-700"> Finance Officers</span> and 
                    <span className="font-semibold text-slate-700"> System Administrators</span>.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Button 
                        onClick={() => router.push('/operations-dashboard')}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white gap-2 h-11"
                    >
                        <ArrowLeft size={16} />
                        Return to Dashboard
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="flex-1 border-slate-200 text-slate-600 gap-2 h-11"
                    >
                        <RefreshCw size={16} />
                        Retry Access
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────────────────────
export default function BudgetFinancePage() {
    const { currentUser, isLoading: authLoading } = useAuth();
    const [budgetRows, setBudgetRows] = useState<BudgetRow[]>([]);
    const [summary, setSummary] = useState<EnterpriseSummary>({
        totalBudget: 0,
        totalConsumed: 0,
        totalReserved: 0,
        totalAvailable: 0,
    });
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing]  = useState(false);
    const [error, setError]            = useState<string | null>(null);

    // ── Modal state ────────────────────────────────────────────────────────
    const [editingRow, setEditingRow]   = useState<BudgetRow | null>(null);
    const [allocating, setAllocating]   = useState(false);   // + Allocate New Budget modal

    const allowedRoles = ['FINANCE_OFFICER', 'SYSTEM_ADMIN'];
    const currentRole  = currentUser?.roles?.role_name ?? '';
    const hasAccess    = allowedRoles.includes(currentRole);

    // ── Data loading ───────────────────────────────────────────────────────
    const loadData = useCallback(async (isRefresh = false) => {
        if (!hasAccess) return; // Prevent API calls if unauthorized

        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            // API PASS: Pass userRole for service-layer validation
            const rows               = await financeService.getBudgetData(currentRole);
            const enterpriseSummary  = financeService.getEnterpriseSummary(rows);
            setBudgetRows(rows);
            setSummary(enterpriseSummary);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unable to fetch budget data.';
            setError(msg);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentRole, hasAccess]);

    useEffect(() => {
        if (!authLoading) {
            loadData();
        }
    }, [loadData, authLoading]);

    // Show skeleton on initial auth or data load
    if (authLoading || (loading && hasAccess)) return <PageSkeleton />;

    // Show access guard (403) if user lacks permission
    if (currentUser && !hasAccess) return <AccessDenied />;

    const lastRefreshed = new Date().toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' });

    return (
        <AppLayout>
            <div className="max-w-screen-2xl mx-auto space-y-7 pb-20 animate-fade-in">

                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shrink-0">
                            <Wallet size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 leading-tight">
                                Budget &amp; Finance Dashboard
                            </h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <CalendarDays size={12} className="text-slate-400" />
                                <p className="text-xs text-slate-400">
                                    Financial Year 2026 · Last updated {lastRefreshed}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        {/* Refresh */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadData(true)}
                            disabled={refreshing}
                            className="flex items-center gap-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600"
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                            {refreshing ? 'Refreshing…' : 'Refresh'}
                        </Button>

                        {/* Allocate New Budget — RBAC gated */}
                        {hasAccess && (
                            <Button
                                id="allocate-new-budget-btn"
                                size="sm"
                                onClick={() => setAllocating(true)}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            >
                                <PlusCircle size={14} />
                                Allocate New Budget
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── Error Banner ── */}
                {error && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Data Fetch Error</p>
                            <p className="text-rose-600 text-xs mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                {/* ── Enterprise Summary Cards ── */}
                <EnterpriseSummaryCards summary={summary} />

                {/* ── Departmental Budget Grid ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Grid Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Departmental Budget Overview
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {budgetRows.length} department{budgetRows.length !== 1 ? 's' : ''} · FY 2026
                            </p>
                        </div>

                        {/* Legend */}
                        <div className="hidden sm:flex items-center gap-4 text-[11px] font-medium text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                Healthy (&lt;75%)
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                Warning (75–90%)
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                Critical (&gt;90%)
                            </span>
                        </div>
                    </div>

                    {/* Table — passes role + edit handler */}
                    <DepartmentBudgetGrid
                        rows={budgetRows}
                        currentRole={currentRole}
                        onEdit={(row) => setEditingRow(row)}
                    />
                </div>

                {/* ── Footer ── */}
                <p className="text-center text-[11px] text-slate-300">
                    All figures displayed in UAE Dirhams (AED) · Data sourced from Supabase budgets table · Financial Year 2026
                </p>
            </div>

            {/* ── Edit Budget Modal ── */}
            {editingRow && currentUser && (
                <EditBudgetModal
                    row={editingRow}
                    actorId={currentUser.id}
                    userRole={currentRole}
                    onClose={() => setEditingRow(null)}
                    onSuccess={() => {
                        setEditingRow(null);
                        loadData(true);
                    }}
                />
            )}

            {/* ── Allocate New Budget Modal ── */}
            {allocating && currentUser && (
                <AllocateBudgetModal
                    actorId={currentUser.id}
                    userRole={currentRole}
                    onClose={() => setAllocating(false)}
                    onSuccess={() => {
                        setAllocating(false);
                        loadData(true); // refresh grid + summary cards after new allocation
                    }}
                />
            )}
        </AppLayout>
    );
}
