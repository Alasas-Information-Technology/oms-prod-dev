'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import {
    ShieldCheck,
    Send,
    UserPlus,
    XCircle,
    ChevronDown,
    Info,
    MessageSquare,
    ArrowRightLeft,
    Users,
    CheckCircle
} from 'lucide-react';

import { requisitionService } from '@/lib/services/requisitionService';

interface ActionPanelProps {
    reqId: string;
    currentStageId: number;
    actorId: string;
    requiredRoleId?: number;
    onApprove: () => void;
    hasQualifiedCandidate?: boolean;
}

export default function ActionPanel({ reqId, currentStageId, actorId, requiredRoleId, onApprove, hasQualifiedCandidate = false }: ActionPanelProps) {
    const { currentUser } = useAuth();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    // RBAC check: Only the required role for the CURRENT STAGE can approve
    // ADDED: HR_ADMIN and SYSTEM_ADMIN can bypass for agility
    const canApprove = currentUser && (
        currentUser.role_id === requiredRoleId ||
        currentUser.roles.role_name === 'SYSTEM_ADMIN' ||
        currentUser.roles.role_name === 'HR_ADMIN'
    );

    // DEBUG: console.log('ActionPanel RBAC Detail:', { userRole: currentUser?.roles?.role_name, userRoleId: currentUser?.role_id, requiredRoleId, canApprove });

    const stageActionMap: Record<number, string> = {
        1: 'Submit for Approval',
        2: 'Approve & Trigger ERP',
        3: 'Publish to Vendors',
        4: 'Qualify Candidate',
        5: 'Confirm Onboarding'
    };

    const actionLabel = stageActionMap[currentStageId] || 'Approve & Proceed';

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            await requisitionService.advanceRequisitionStage(reqId, currentStageId, actorId);
            toast.success(`Action Complete: ${actionLabel}`, {
                description: 'Requisition has been advanced to the next workflow phase.'
            });
            onApprove();
        } catch (error) {
            toast.error('Failed to advance stage');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleActionPlaceholder = (action: string) => {
        toast.info(`${action} initiated`, {
            description: 'Routing request to appropriate department'
        });
    };

    return (
        <Card className="border-none shadow-card border-l-4 border-l-[hsl(214,67%,32%)] overflow-hidden">
            <CardHeader className="bg-slate-50/50 pb-3">
                <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[hsl(214,67%,32%)]" />
                    Workflow Governance
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 mb-2">
                    <div className="flex gap-2">
                        <Info size={14} className="text-[hsl(214,67%,32%)] shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            Logged in as <strong>{currentUser?.roles?.role_name || 'Guest'}</strong>.
                            {canApprove
                                ? ` Ready for: ${actionLabel}`
                                : " You do not have the required permissions to approve this stage."}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {canApprove && currentStageId !== 4 && (
                        <Button
                            onClick={handleApprove}
                            disabled={isProcessing}
                            className="w-full bg-[hsl(214,67%,32%)] hover:bg-[hsl(214,67%,40%)] text-white font-bold h-11 flex items-center justify-between px-4 transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <Send size={16} />
                                <span>{actionLabel}</span>
                            </div>
                            <ChevronDown size={14} className="opacity-50" />
                        </Button>
                    )}

                    {/* Specialized Stage 4 Interface for Interviewers */}
                    {canApprove && currentStageId === 4 && (
                        <div className="space-y-3">
                            <Button
                                onClick={() => router.push(`/requisition-management/blind-selection/${reqId}`)}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 flex items-center justify-center gap-2 transition-all shadow-md"
                            >
                                <Users size={18} />
                                <span>Review Submitted Candidates</span>
                            </Button>

                            <Button
                                onClick={handleApprove}
                                disabled={isProcessing || !hasQualifiedCandidate}
                                variant="outline"
                                className={`w-full h-11 font-bold border-2 transition-all ${
                                    hasQualifiedCandidate 
                                    ? 'border-emerald-500 text-emerald-700 hover:bg-emerald-50' 
                                    : 'border-slate-200 text-slate-400 opacity-60'
                                }`}
                            >
                                <CheckCircle size={16} className={hasQualifiedCandidate ? 'text-emerald-500' : 'text-slate-300'} />
                                <span>Complete Stage 4 (Advance)</span>
                            </Button>
                            
                            {!hasQualifiedCandidate && (
                                <p className="text-[10px] text-center text-amber-600 font-medium">
                                    Requires at least one 'Qualified' candidate to proceed.
                                </p>
                            )}
                        </div>
                    )}

                    {!canApprove && (
                        <div className="flex items-center justify-center p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400 text-xs font-medium italic">
                            Governance Action Restricted
                        </div>
                    )}

                    <Button
                        variant="outline"
                        onClick={() => handleActionPlaceholder('Internal Hire Conversion')}
                        className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold h-11 flex items-center justify-start gap-2"
                    >
                        <UserPlus size={16} className="text-slate-400" />
                        Convert to Internal Hire
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => handleActionPlaceholder('Rejection')}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold h-11 flex items-center justify-start gap-2"
                    >
                        <XCircle size={16} className="text-red-400" />
                        Reject Requisition
                    </Button>
                </div>
                {/* 
                <div className="pt-4 border-t border-slate-100 mt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Supportive Actions</p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={16} className="text-slate-500" />
                                    Clarifications
                                </div>
                                <ChevronDown size={14} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[calc(var(--radix-dropdown-menu-trigger-width))]">
                            <DropdownMenuItem className="text-xs gap-2 py-2.5 font-medium cursor-pointer" onClick={() => handleActionPlaceholder('Email Request')}>
                                <Send size={14} className="text-slate-400" />
                                Request More Info (Email)
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs gap-2 py-2.5 font-medium cursor-pointer" onClick={() => handleActionPlaceholder('Approval Request')}>
                                <ArrowRightLeft size={14} className="text-slate-400" />
                                Request Addl. Info with Approval
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div> */}
            </CardContent>
        </Card>
    );
}
