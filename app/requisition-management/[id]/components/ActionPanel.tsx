'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { 
    ShieldCheck, 
    Send, 
    UserPlus, 
    XCircle, 
    ChevronDown, 
    Info, 
    MessageSquare, 
    ArrowRightLeft 
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { requisitionService } from '@/lib/services/requisitionService';

interface ActionPanelProps {
    reqId: string;
    currentStageId: number;
    actorId: string;
    requiredRoleId?: number;
    onApprove: () => void;
}

export default function ActionPanel({ reqId, currentStageId, actorId, requiredRoleId, onApprove }: ActionPanelProps) {
    const { currentUser } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    
    // RBAC check: Only the required role can approve this stage
    const canApprove = currentUser && (currentUser.role_id === requiredRoleId || currentUser.roles.role_name === 'SYSTEM_ADMIN');

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            await requisitionService.advanceRequisitionStage(reqId, currentStageId, actorId);
            toast.success('HR Approval logged', {
                description: 'Stage advanced and audit log recorded via secure RPC.'
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
                    HR Governance Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 mb-2">
                    <div className="flex gap-2">
                        <Info size={14} className="text-[hsl(214,67%,32%)] shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            Logged in as <strong>{currentUser?.roles?.role_name || 'Guest'}</strong>. 
                            {canApprove 
                                ? " Your approval will advance this requisition." 
                                : " You do not have the required permissions to approve this stage."}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {canApprove && (
                        <Button 
                            onClick={handleApprove}
                            disabled={isProcessing}
                            className="w-full bg-[hsl(214,67%,32%)] hover:bg-[hsl(214,67%,40%)] text-white font-bold h-11 flex items-center justify-between px-4 transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <Send size={16} />
                                <span>Approve & Proceed</span>
                            </div>
                            <ChevronDown size={14} className="opacity-50" />
                        </Button>
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
                </div>
            </CardContent>
        </Card>
    );
}
