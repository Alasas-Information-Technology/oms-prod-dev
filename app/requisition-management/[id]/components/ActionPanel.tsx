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
    Edit3,
    Lock,
    AlertTriangle,
    Zap
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { requisitionService } from '@/lib/services/requisitionService';
import CandidateModal from '@/app/candidates/components/CandidateModal';

interface ActionPanelProps {
    reqId: string;
    currentStageId: number;
    actorId: string;
    requiredRoleId?: number;
    onApprove: () => void;
    onEdit?: () => void;
    requestorId?: string;
    hasQualifiedCandidate?: boolean;
    totalSubmitted?: number;
    numResources?: number;
    mainInterviewerId?: string;
    isActive?: boolean;
}

export default function ActionPanel({ reqId, currentStageId, actorId, requiredRoleId, onApprove, onEdit, requestorId, hasQualifiedCandidate = false, totalSubmitted = 0, numResources = 1, mainInterviewerId, isActive = true }: ActionPanelProps) {
    const { currentUser } = useAuth();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
    const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
    const [closureJustification, setClosureJustification] = useState('');

    // RBAC check: Only the required role for the CURRENT STAGE can approve
    // ADDED: HR_ADMIN and SYSTEM_ADMIN can bypass for agility
    const isLeadInterviewer = currentUser?.id === mainInterviewerId;

    const canApprove = currentUser && (() => {
        // Stage 4: Special handling to allow panel visibility but strict lead advancement
        // The Lead Interviewer ALWAYS gets access to the panel in Stage 4
        if (currentStageId === 4) {
            return isLeadInterviewer || 
                   currentUser.roles.role_name === 'INTERVIEWER' || 
                   currentUser.roles.role_name === 'SYSTEM_ADMIN' || 
                   currentUser.roles.role_name === 'HR_ADMIN';
        }

        // Other Stages: Role-based + Admin/HR Bypass
        return (
            currentUser.role_id === requiredRoleId ||
            currentUser.roles.role_name === 'SYSTEM_ADMIN' ||
            currentUser.roles.role_name === 'HR_ADMIN' ||
            (currentStageId === 3 && (currentUser.roles.role_name === 'DEPT_REQUESTOR' || currentUser.roles.role_name === 'INTERVIEWER'))
        );
    })();

    const canEdit = currentUser && (
        actorId === requestorId ||
        currentUser.roles.role_name === 'SYSTEM_ADMIN' ||
        currentUser.roles.role_name === 'HR_ADMIN'
    );

    const isHRGatekeeper = currentUser?.roles?.role_name === 'HR_ADMIN' && currentStageId === 2;
    
    const canRequestClosure = isActive && currentStageId >= 3 && (
        actorId === requestorId || 
        currentUser?.roles?.role_name === 'HOD' || 
        currentUser?.roles?.role_name === 'SYSTEM_ADMIN'
    );

    // DEBUG: console.log('ActionPanel RBAC Detail:', { userRole: currentUser?.roles?.role_name, userRoleId: currentUser?.role_id, requiredRoleId, canApprove });

    const stageActionMap: Record<number, string> = {
        1: 'Submit for Approval',
        2: 'Approve & Trigger ERP',
        3: 'Publish to Vendors',
        4: 'Qualify Candidate',
        5: 'Confirm Onboarding'
    };

    const minRequired = numResources || 1;
    const isSourcingGated = totalSubmitted < minRequired;

    const actionLabel = currentStageId === 3 ? 'Complete Sourcing (Advance to Stage 4)' : (stageActionMap[currentStageId] || 'Approve & Proceed');

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

    const handleReject = async () => {
        const comments = window.prompt('Please provide a reason for rejection:');
        if (comments === null) return;

        setIsProcessing(true);
        try {
            await requisitionService.rejectRequisition(reqId, actorId, comments);
            toast.success('Requisition Rejected', {
                description: 'The requisition has been terminated and returned to the department.'
            });
            onApprove(); // Refresh
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject requisition');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClosureSubmit = async () => {
        if (!closureJustification.trim()) {
            toast.error('Justification required');
            return;
        }

        setIsProcessing(true);
        try {
            const result = await requisitionService.requestRequisitionClosure(
                reqId, 
                actorId, 
                currentUser?.roles?.role_name || '', 
                closureJustification
            );

            if (result.status === 'CLOSED') {
                toast.success('Requisition Closed', { description: 'Deactivated and budget released.' });
            } else {
                toast.success('Closure Requested', { description: 'Sent to HOD for final approval.' });
            }
            
            setIsClosureModalOpen(false);
            onApprove(); // Refresh
        } catch (error: any) {
            toast.error(error.message || 'Failed to process closure');
        } finally {
            setIsProcessing(false);
        }
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
                            {canApprove && currentStageId !== 4 && currentStageId !== 3 && (
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

                             {/* Specialized Stage 3 Interface for Demo Sourcing */}
                             {canApprove && currentStageId === 3 && (
                                 <div className="space-y-3">
                                     <Button
                                         onClick={() => setIsAddCandidateModalOpen(true)}
                                         disabled={isProcessing}
                                         className="w-full bg-[#0C66E4] hover:bg-[#0052CC] text-white font-bold h-12 flex items-center justify-center gap-2 transition-all shadow-md"
                                     >
                                         <UserPlus size={18} />
                                         <span>+ Add Candidate (Demo)</span>
                                     </Button>
 
                                     <Button
                                         onClick={handleApprove}
                                         disabled={isProcessing || isSourcingGated}
                                         variant="outline"
                                         className={`w-full h-11 font-bold border-2 transition-all ${!isSourcingGated
                                                 ? 'border-emerald-500 text-emerald-700 hover:bg-emerald-50'
                                                 : 'border-slate-200 text-slate-400 opacity-60'
                                             }`}
                                     >
                                         <CheckCircle size={16} className={!isSourcingGated ? 'text-emerald-500' : 'text-slate-300'} />
                                         <span>{actionLabel}</span>
                                     </Button>
 
                                     {isSourcingGated && (
                                         <p className="text-[10px] text-center text-amber-600 font-medium italic">
                                             Requires at least {minRequired} candidate{minRequired !== 1 ? 's' : ''} for demo purposes.
                                         </p>
                                     )}
                                 </div>
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
                                        disabled={isProcessing || !hasQualifiedCandidate || (currentStageId === 4 && !isLeadInterviewer)}
                                        variant="outline"
                                        className={`w-full h-11 font-bold border-2 transition-all ${
                                           (hasQualifiedCandidate && (currentStageId !== 4 || isLeadInterviewer))
                                                ? 'border-emerald-500 text-emerald-700 hover:bg-emerald-50'
                                                : 'border-slate-200 text-slate-400 opacity-60'
                                            }`}
                                    >
                                        <CheckCircle size={16} className={(hasQualifiedCandidate && (currentStageId !== 4 || isLeadInterviewer)) ? 'text-emerald-500' : 'text-slate-300'} />
                                        <span>Complete Stage 4 (Advance)</span>
                                    </Button>

                                    {!hasQualifiedCandidate && (
                                        <p className="text-[10px] text-center text-amber-600 font-medium">
                                            Requires at least one 'Qualified' candidate to proceed.
                                        </p>
                                    )}

                                    {currentStageId === 4 && !isLeadInterviewer && (
                                        <div className="p-2 bg-red-50 border border-red-100 rounded-sm">
                                            <p className="text-[10px] text-center text-red-600 font-bold uppercase">
                                                Governance: Strictly Restricted to LEAD INTERVIEWER
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!canApprove && (
                                <div className="flex items-center justify-center p-3 border border-dashed border-[#DFE1E6] rounded-sm bg-[#F4F5F7] text-[#5E6C84] text-[11px] font-bold uppercase tracking-wider">
                                    Governance Restricted
                                </div>
                            )}



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

                            {canRequestClosure && (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsClosureModalOpen(true)}
                                    disabled={isProcessing}
                                    className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 font-semibold h-11 flex items-center justify-start gap-2"
                                >
                                    <AlertTriangle size={16} className="text-amber-500" />
                                    Request Closure / Abort
                                </Button>
                            )}

                            {(currentStageId === 1 || isHRGatekeeper) && (
                                <Button
                                    variant="ghost"
                                    onClick={currentStageId === 1 ? handleTerminate : handleReject}
                                    disabled={isProcessing}
                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold h-11 flex items-center justify-start gap-2"
                                >
                                    <XCircle size={16} className="text-red-400" />
                                    {currentStageId === 1 ? 'Terminate Initiation' : 'Reject Requisition'}
                                </Button>
                            )}

                            {!canApprove && !canEdit && !canRequestClosure && !isHRGatekeeper && (
                                <p className="text-[10px] text-slate-400 italic text-center py-2">
                                    No further actions available for your role at this stage.
                                </p>
                            )}
                        </>
                    )}
                </div>

                <Dialog open={isClosureModalOpen} onOpenChange={setIsClosureModalOpen}>
                    <DialogContent className="sm:max-w-[425px] rounded-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-slate-900">
                                <Zap size={18} className="text-amber-500" />
                                Requisition Closure Request
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Are you sure you want to stop this search? This will release reserved budget back to the department pool.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="justification" className="text-xs font-bold text-slate-700 uppercase">
                                    Closure Justification *
                                </Label>
                                <Textarea 
                                    id="justification"
                                    placeholder="Explain why this position is being cancelled or closed (e.g., Internal Fill, Budget Review, Role Deprecated)..."
                                    className="min-h-[120px] rounded-lg border-slate-200 text-sm focus:ring-amber-500"
                                    value={closureJustification}
                                    onChange={(e) => setClosureJustification(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setIsClosureModalOpen(false)} disabled={isProcessing}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleClosureSubmit} 
                                disabled={isProcessing}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                            >
                                {isProcessing ? 'Processing...' : 'Confirm Closure Request'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {isAddCandidateModalOpen && (
                    <CandidateModal
                        mode="create"
                        preselectedRequisitionId={reqId}
                        onClose={() => setIsAddCandidateModalOpen(false)}
                        onSuccess={() => {
                            toast.success('Candidate added to demo pipeline');
                            onApprove(); // Refresh counters
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
}
