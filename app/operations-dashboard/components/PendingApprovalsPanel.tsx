'use client';

import React, { useState } from 'react';
import { ChevronRight, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { requisitionService } from '@/lib/services/requisitionService';
import { useAuth } from '@/contexts/AuthContext';

interface PendingItem {
    id: string;
    req_number: string;
    position_title: string;
    department: string;
    stage_id: number;
    reserved_budget_aed: number;
    created_at: string;
    workflow_stages?: {
        stage_name: string;
    };
}

interface PendingApprovalsPanelProps {
    items: PendingItem[];
}

export default function PendingApprovalsPanel({ items }: PendingApprovalsPanelProps) {
    const { currentUser } = useAuth();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [dismissed, setDismissed] = useState<string[]>([]);

    const visibleItems = items.filter((i) => !dismissed.includes(i.id));

    const handleApprove = async (id: string, reqId: string, currentStage: number) => {
        if (!currentUser) return;
        setProcessingId(id);
        try {
            await requisitionService.advanceRequisitionStage(id, currentStage, currentUser.id);
            setDismissed((prev) => [...prev, id]);
            toast.success(`${reqId} approved — advancing to next stage`);
        } catch (error) {
            toast.error(`Failed to approve ${reqId}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string, reqId: string) => {
        setProcessingId(id);
        // We don't have a rejection RPC yet, so we mock dismissal for UI
        await new Promise((res) => setTimeout(res, 600));
        setDismissed((prev) => [...prev, id]);
        setProcessingId(null);
        toast.error(`${reqId} returned for revision`);
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between mb-0 pb-2">
                <div>
                    <CardTitle className="text-base font-semibold text-slate-900 border-none">Pending My Approvals</CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-0.5">Action required · Role-filtered queue</CardDescription>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-red-600">{visibleItems.length} pending</span>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col pt-0">
                <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin max-h-[500px]">
                {visibleItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <CheckCircle2 size={32} className="text-green-400 mb-2" />
                        <p className="text-sm font-semibold text-slate-600">All approvals processed</p>
                        <p className="text-xs text-slate-400">No pending items in your queue</p>
                    </div>
                ) : (
                    visibleItems.map((item) => {
                        const daysOpen = Math.floor((new Date().getTime() - new Date(item.created_at).getTime()) / (1000 * 3600 * 24));
                        const isUrgent = daysOpen > 14;

                        return (
                            <div
                                key={item.id}
                                className={`p-3 rounded-xl border transition-all duration-200 hover:shadow-sm ${isUrgent ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            {isUrgent && <AlertTriangle size={12} className="text-red-500 shrink-0" />}
                                            <span className="text-xs font-mono font-semibold text-[hsl(214,67%,32%)]">{item.req_number}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${daysOpen >= 20 ? 'bg-red-100 text-red-700' :
                                                    daysOpen >= 10 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {daysOpen}d open
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{item.position_title}</p>
                                        <p className="text-xs text-slate-400">{item.department} · {item.workflow_stages?.stage_name}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-mono font-bold text-slate-700 tabular-nums">
                                            AED {Number(item.reserved_budget_aed).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {item.stage_id === 4 ? (
                                        <Link
                                            href={`/requisition-management/blind-selection/${item.id}`}
                                            className="flex-1"
                                        >
                                            <Button
                                                className="w-full px-2 py-1.5 h-auto text-xs gap-1 bg-amber-600 hover:bg-amber-700 font-bold"
                                            >
                                                Review Candidates
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button
                                            onClick={() => handleApprove(item.id, item.req_number, item.stage_id)}
                                            disabled={processingId === item.id}
                                            className={`flex-1 px-2 py-1.5 h-auto text-xs gap-1 font-bold ${
                                                item.stage_id === 2 ? 'bg-indigo-700 hover:bg-indigo-800' :
                                                item.stage_id === 3 ? 'bg-cyan-600 hover:bg-cyan-700' :
                                                'bg-[hsl(214,67%,32%)] hover:bg-[hsl(214,67%,38%)]'
                                            }`}
                                        >
                                            {processingId === item.id ? (
                                                <Loader2 size={11} className="animate-spin" />
                                            ) : (
                                                <CheckCircle2 size={11} />
                                            )}
                                            {item.stage_id === 1 ? 'Submit for Approval' :
                                             item.stage_id === 2 ? 'Approve & Trigger ERP' :
                                             item.stage_id === 3 ? 'Publish to Vendors' :
                                             item.stage_id === 5 ? 'Generate LPO & Close' :
                                             'Approve'}
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => handleReject(item.id, item.req_number)}
                                        disabled={processingId === item.id}
                                        className="flex-1 px-2 py-1.5 h-auto text-xs gap-1"
                                    >
                                        <XCircle size={11} />
                                        Return
                                    </Button>
                                    <Link
                                        href={`/requisition-management/${item.id}`}
                                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all font-bold"
                                    >
                                        <ChevronRight size={13} />
                                    </Link>
                                </div>
                            </div>
                        )
                    })
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