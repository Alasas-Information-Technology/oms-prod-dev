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
    CheckCircle,
    Edit3
} from 'lucide-react';

import { requisitionService } from '@/lib/services/requisitionService';

interface ActionPanelProps {
    reqId: string;
    currentStageId: number;
    actorId: string;
    requiredRoleId?: number;
    onApprove: () => void;
    onEdit?: () => void;
    requestorId?: string;
    hasQualifiedCandidate?: boolean;
    isActive?: boolean;
}

export default function ActionPanel({ reqId, currentStageId, actorId, requiredRoleId, onApprove, onEdit, requestorId, hasQualifiedCandidate = false, isActive = true }: ActionPanelProps) {
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

    const canEdit = currentUser && (
        actorId === requestorId ||
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

    const handleTerminate = async () => {
        if (!window.confirm('Are you sure you want to terminate this requisition initiation? This action cannot be undone.')) return;
        
        setIsProcessing(true);
        try {
            await requisitionService.terminateRequisition(reqId, actorId, 'Requisition terminated by user during initiation stage.');
            toast.success('Initiation Terminated', {
                description: 'Requisition has been deactivated and reserved budget released.'
            });
            onApprove(); // Refresh data
        } catch (error) {
            toast.error('Failed to terminate requisition');
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
        <Card className="border border-[#DFE1E6] shadow-atlassian overflow-hidden rounded-sm">
            <CardHeader className="bg-[#F4F5F7] border-b border-[#DFE1E6] py-3">
                <CardTitle className="text-xs font-bold text-[#42526E] uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#0C66E4]" />
                    Workflow Governance
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="p-3 bg-[#EAE6FF] rounded-sm border border-[#C0B6F2] mb-2">
                    <div className="flex gap-2">
                        <Info size={14} className="text-[#403294] shrink-0 mt-0.5" />
                        <p className="text-[12px] text-[#403294] leading-relaxed font-semibold">
                            Logged in as <strong>{currentUser?.roles?.role_name || 'Guest'}</strong>.
                            {canApprove
                                ? ` Ready for: ${actionLabel}`
                                : " You do not have the required permissions to approve this stage."}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {!isActive ? (
                        <div className="p-6 rounded-sm bg-[#E3FCEF] border border-[#ABF5D1] flex flex-col items-center justify-center text-center gap-4 animate-in zoom-in-95 duration-500">
                            <div className="w-10 h-10 rounded-full bg-[#36B37E] flex items-center justify-center shadow-lg shadow-[#36B37E]/20">
                                <CheckCircle size={20} className="text-white" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold text-[#006644] uppercase tracking-wider">Process Finalized</h4>
                                <p className="text-[11px] text-[#006644] font-semibold leading-relaxed px-2">
                                    Requisition fulfilled and candidate onboarded.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
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
                                <div className="flex items-center justify-center p-3 border border-dashed border-[#DFE1E6] rounded-sm bg-[#F4F5F7] text-[#5E6C84] text-[11px] font-bold uppercase tracking-wider">
                                    Governance Restricted
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

                            {currentStageId === 1 && canEdit && onEdit && (
                                <Button
                                    variant="outline"
                                    onClick={onEdit}
                                    disabled={isProcessing}
                                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold h-11 flex items-center justify-start gap-2"
                                >
                                    <Edit3 size={16} className="text-blue-500" />
                                    Edit Specification
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                onClick={currentStageId === 1 ? handleTerminate : () => handleActionPlaceholder('Rejection')}
                                disabled={isProcessing}
                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold h-11 flex items-center justify-start gap-2"
                            >
                                <XCircle size={16} className="text-red-400" />
                                {currentStageId === 1 ? 'Terminate Initiation' : 'Reject Requisition'}
                            </Button>
                        </>
                    )}
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
