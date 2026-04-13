'use client';

import React, { useState } from 'react';
import { ChevronRight, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// Backend integration point: GET /api/dashboard/pending-approvals?role=HR_MANAGER
const pendingItems = [
    {
        id: 'pend-001',
        reqId: 'OMS-2026-0847',
        title: 'Senior IT Security Analyst',
        department: 'Information Technology',
        stage: 'HR Review',
        stageBadge: 'hr-review',
        requestor: 'Khalid Al-Mansoori',
        submittedAt: '2026-04-07',
        daysOpen: 2,
        urgent: false,
        budgetAED: 185000,
    },
    {
        id: 'pend-002',
        reqId: 'OMS-2026-0831',
        title: 'Business Intelligence Analyst',
        department: 'Finance',
        stage: 'HR Review',
        stageBadge: 'hr-review',
        requestor: 'Noura Al-Ketbi',
        submittedAt: '2026-03-12',
        daysOpen: 28,
        urgent: true,
        budgetAED: 142000,
    },
    {
        id: 'pend-003',
        reqId: 'OMS-2026-0839',
        title: 'Logistics Coordinator (x2)',
        department: 'Operations',
        stage: 'HR Review',
        stageBadge: 'hr-review',
        requestor: 'Ahmed Al-Dhaheri',
        submittedAt: '2026-03-10',
        daysOpen: 30,
        urgent: true,
        budgetAED: 98000,
    },
    {
        id: 'pend-004',
        reqId: 'OMS-2026-0852',
        title: 'Legal Counsel – Contract Review',
        department: 'Legal Affairs',
        stage: 'HR Review',
        stageBadge: 'hr-review',
        requestor: 'Sara Al-Mazrouei',
        submittedAt: '2026-04-08',
        daysOpen: 1,
        urgent: false,
        budgetAED: 220000,
    },
    {
        id: 'pend-005',
        reqId: 'OMS-2026-0841',
        title: 'Administrative Support Officer',
        department: 'Administration',
        stage: 'HR Review',
        stageBadge: 'hr-review',
        requestor: 'Mohammed Al-Suwaidi',
        submittedAt: '2026-04-01',
        daysOpen: 8,
        urgent: false,
        budgetAED: 72000,
    },
];

export default function PendingApprovalsPanel() {
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [dismissed, setDismissed] = useState<string[]>([]);

    const visibleItems = pendingItems.filter((i) => !dismissed.includes(i.id));

    const handleApprove = async (id: string, reqId: string) => {
        setProcessingId(id);
        // Backend integration point: POST /api/approvals/{id}/approve
        await new Promise((res) => setTimeout(res, 900));
        setDismissed((prev) => [...prev, id]);
        setProcessingId(null);
        toast.success(`${reqId} approved — advancing to Procurement stage`);
    };

    const handleReject = async (id: string, reqId: string) => {
        setProcessingId(id);
        // Backend integration point: POST /api/approvals/{id}/reject
        await new Promise((res) => setTimeout(res, 900));
        setDismissed((prev) => [...prev, id]);
        setProcessingId(null);
        toast.error(`${reqId} returned — requestor notified for revision`);
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between mb-0 pb-2">
                <div>
                    <CardTitle className="text-base font-semibold text-slate-900 border-none">Pending My Approvals</CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-0.5">HR Review stage · Role-filtered</CardDescription>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-red-600">{visibleItems.length} pending</span>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col pt-0">
                <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin">
                {visibleItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <CheckCircle2 size={32} className="text-green-400 mb-2" />
                        <p className="text-sm font-semibold text-slate-600">All approvals processed</p>
                        <p className="text-xs text-slate-400">No pending items in your queue</p>
                    </div>
                ) : (
                    visibleItems.map((item) => (
                        <div
                            key={item.id}
                            className={`p-3 rounded-xl border transition-all duration-200 hover:shadow-sm ${item.urgent ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        {item.urgent && <AlertTriangle size={12} className="text-red-500 shrink-0" />}
                                        <span className="text-xs font-mono font-semibold text-[hsl(214,67%,32%)]">{item.reqId}</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.daysOpen >= 27 ? 'bg-red-100 text-red-700' :
                                                item.daysOpen >= 14 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {item.daysOpen}d open
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{item.title}</p>
                                    <p className="text-xs text-slate-400">{item.department} · {item.requestor}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-mono font-bold text-slate-700 tabular-nums">
                                        AED {item.budgetAED.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => handleApprove(item.id, item.reqId)}
                                    disabled={processingId === item.id}
                                    className="flex-1 px-2 py-1.5 h-auto text-xs gap-1 bg-[hsl(214,67%,32%)] hover:bg-[hsl(214,67%,38%)]"
                                >
                                    {processingId === item.id ? (
                                        <Loader2 size={11} className="animate-spin" />
                                    ) : (
                                        <CheckCircle2 size={11} />
                                    )}
                                    Approve
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleReject(item.id, item.reqId)}
                                    disabled={processingId === item.id}
                                    className="flex-1 px-2 py-1.5 h-auto text-xs gap-1"
                                >
                                    <XCircle size={11} />
                                    Return
                                </Button>
                                <Link
                                    href="/requisition-management"
                                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all"
                                >
                                    <ChevronRight size={13} />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100">
                    <Link
                        href="/requisition-management"
                        className="text-xs text-[hsl(214,67%,32%)] font-semibold hover:underline flex items-center gap-1"
                    >
                        View all requisitions
                        <ChevronRight size={12} />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}