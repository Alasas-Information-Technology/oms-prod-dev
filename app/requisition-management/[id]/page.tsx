'use client';

import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Briefcase, Building2, ChevronLeft, Info, User, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ActionPanel from './components/ActionPanel';
import RequisitionSpecs from './components/RequisitionSpecs';
import WorkflowStepper from './components/WorkflowStepper';
import NewRequisitionModal from '../components/NewRequisitionModal';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requisitionService } from '@/lib/services/requisitionService';
import { profileService } from '@/lib/services/profileService';
import { RequisitionRecord } from '../components/ComprehensiveRequisitionForm';

export default function RequisitionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [requisition, setRequisition] = useState<RequisitionRecord | null>(null);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [workflowStages, setWorkflowStages] = useState<any[]>([]);
    const [interviewers, setInterviewers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [status, setStatus] = useState('');
    const [candidateStatus, setCandidateStatus] = useState({ totalSubmitted: 0, hasQualified: false });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { currentUser } = useAuth();

    // In real app, this is the logged-in user's ID
    const actorId = currentUser?.id || '00000000-0000-0000-0000-000000000000';

    useEffect(() => {
        if (id) {
            loadRequisition();
        }
    }, [id]);

    const loadRequisition = async () => {
        setLoading(true);
        try {
            // Parallel fetch for details, logs, stages, and candidate status
            const [data, stages, candStatus] = await Promise.all([
                requisitionService.getRequisitionById(id),
                requisitionService.getWorkflowStages(),
                requisitionService.getCandidateReviewStatus(id)
            ]);

            setRequisition(data);
            setWorkflowStages(stages);
            setCandidateStatus(candStatus);

            if (data) {
                setCurrentStep(data.stage_id);
                setStatus(data.workflow_stages?.stage_name || 'Draft');
                
                // Fetch interviewer profiles
                if (data.interviewer_ids?.length > 0) {
                    const profiles = await profileService.getProfilesByIds(data.interviewer_ids);
                    setInterviewers(profiles);
                }

                // Now fetch logs
                const logs = await requisitionService.getAuditLogs(data.id);
                setAuditLogs(logs);
            } else {
                toast.error('Requisition not found');
                router.push('/requisition-management');
            }
        } catch (error) {
            console.error('Error in loadRequisition:', error);
            toast.error('Failed to load requisition details');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = () => {
        // Refresh data after approval callback
        loadRequisition();
    };

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                {/* Navigation & Title */}
                <div className="flex flex-col gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="w-fit -ml-2 text-slate-500 hover:text-[hsl(214,67%,32%)]"
                    >
                        <Link href="/requisition-management">
                            <ChevronLeft size={16} />
                            Back to Requisitions
                        </Link>
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            {loading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-8 w-64" />
                                    <Skeleton className="h-4 w-96" />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                            Requisition <span className="text-[hsl(214,67%,32%)]">{requisition?.req_number}</span>
                                        </h1>
                                        {requisition?.is_active === false ? (
                                            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-sm border border-emerald-700">
                                                Completed - Active Engagement
                                            </span>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
                                                ${currentStep === 2 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                                {status}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 shadow-sm transition-all hover:bg-white hover:border-[hsl(214,67%,32%)]">
                                            <Users size={12} className="text-slate-400" />
                                            {candidateStatus.totalSubmitted} / {requisition?.num_resources || 1} Candidates
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={14} className="text-slate-400" />
                                            {requisition?.position_title}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building2 size={14} className="text-slate-400" />
                                            {requisition?.departments?.dept_name}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-slate-400" />
                                            Requested by {requisition?.profiles?.full_name || 'System'}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" className="border-slate-200 font-bold hover:bg-slate-50">
                                Export PDF
                            </Button>
                            <Button className="bg-[hsl(214,67%,32%)] text-white font-bold hover:bg-[hsl(214,67%,25%)]">
                                View History
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stepper Banner */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <WorkflowStepper
                        currentStep={currentStep}
                        stages={workflowStages}
                        workflowFinished={requisition?.is_active === false}
                    />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Specifications */}
                    <div className="lg:col-span-2 space-y-6">
                        {loading ? (
                            <Skeleton className="h-96 w-full rounded-2xl" />
                        ) : (
                            <>
                                <RequisitionSpecs data={requisition} />

                                {/* Interviewer Panel - Main Column (Left) */}
                                {!loading && interviewers.length > 0 && (
                                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                <Users size={16} className="text-orange-500" />
                                                Interviewers & Panel
                                            </h3>
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100">
                                                {interviewers.length} Members Assigned
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {interviewers.map((intv) => {
                                                const isLead = intv.id === requisition?.main_interviewer_id;
                                                return (
                                                    <div 
                                                        key={intv.id} 
                                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                                            isLead 
                                                            ? 'bg-orange-50/50 border-orange-200 ring-1 ring-orange-200' 
                                                            : 'bg-slate-50 border-slate-100'
                                                        }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                                            isLead ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'
                                                        }`}>
                                                            {intv.full_name?.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs font-bold text-slate-800 truncate">{intv.full_name}</p>
                                                                {isLead && (
                                                                    <span className="text-[8px] font-black bg-orange-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                                        Lead
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 font-medium truncate">{intv.roles?.role_name || 'Panelist'}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Sourcing Overview Card */}
                                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            <Users size={16} className="text-blue-500" />
                                            Sourcing Overview
                                        </h3>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                                            {candidateStatus.totalSubmitted} Total Submissions
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Resources</p>
                                            <p className="text-2xl font-bold text-slate-900">{requisition?.num_resources || 1}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Qualified Status</p>
                                            <p className={`text-sm font-bold mt-1 ${candidateStatus.hasQualified ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {candidateStatus.hasQualified ? '✓ QUALIFIED CANDIDATES FOUND' : '✖ NO QUALIFIED CANDIDATES'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Additional Info / Comments Section for premium feel */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                                <Info size={16} className="text-blue-500" />
                                Governance & Activity History
                            </h3>
                            <div className="space-y-4">
                                {auditLogs.length > 0 ? (
                                    auditLogs.map((log) => (
                                        <div key={log.id} className="flex gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                                            <div className="w-8 h-8 rounded-full bg-[hsl(214,67%,32%)]/10 flex items-center justify-center shrink-0">
                                                <User size={14} className="text-[hsl(214,67%,32%)]" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-slate-800">
                                                    {log.profiles?.full_name || 'System / Unknown Actor'}
                                                    <span className="text-[10px] font-normal text-slate-400 ml-2">
                                                        {new Date(log.cryptographic_timestamp).toLocaleString()}
                                                    </span>
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] text-blue-600 font-bold uppercase tracking-tight">
                                                    {log.action_type}
                                                </div>
                                                {log.comments && (
                                                    <p className="text-xs text-slate-600 leading-relaxed italic mt-1">
                                                        "{log.comments}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-400 italic text-sm">
                                        No activity logs recorded for this requisition yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-6">
                        {/* Sourcing Fulfillment Card */}
                        {!loading && requisition && (
                            <Card className="border border-[#DFE1E6] shadow-sm overflow-hidden rounded-sm animate-in slide-in-from-right-4 duration-500">
                                <CardHeader className="bg-[#EBECF0] border-b border-[#DFE1E6] py-2.5">
                                    <CardTitle className="text-[10px] font-bold text-[#42526E] uppercase tracking-widest flex items-center gap-2">
                                        <Users size={12} className="text-[#0C66E4]" />
                                        Sourcing Fulfillment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                                            <div className="text-xl font-bold text-slate-900">{candidateStatus.totalSubmitted}</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Candidates</div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                                            <div className="text-xl font-bold text-[hsl(214,67%,32%)]">{requisition?.num_resources || 1}</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Required</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-bold text-[#6B778C] uppercase tracking-widest">Progress</span>
                                            <span className="text-[10px] font-bold text-[hsl(214,67%,32%)]">
                                                {Math.round((candidateStatus.totalSubmitted / (requisition?.num_resources || 1)) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[#EBECF0] rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-[hsl(214,67%,32%)] transition-all duration-700"
                                                style={{ width: `${Math.min(100, (candidateStatus.totalSubmitted / (requisition?.num_resources || 1)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {candidateStatus.totalSubmitted < (requisition?.num_resources || 1) && (
                                        <div className="p-2 bg-amber-50 rounded border border-amber-100 flex gap-2">
                                            <Info size={12} className="text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-[9px] text-amber-700 font-medium leading-tight">
                                                Insufficient candidates to fulfill requirements. Sourcing active.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {loading ? (
                            <Skeleton className="h-64 w-full rounded-2xl" />
                        ) : (
                            <ActionPanel
                                reqId={requisition?.id}
                                currentStageId={currentStep}
                                actorId={actorId}
                                requestorId={requisition?.requestor_id}
                                requiredRoleId={requisition?.workflow_stages?.required_role_id}
                                onApprove={handleApprove}
                                onEdit={() => setIsEditModalOpen(true)}
                                hasQualifiedCandidate={candidateStatus.hasQualified}
                                totalSubmitted={candidateStatus.totalSubmitted}
                                numResources={requisition?.num_resources}
                                mainInterviewerId={requisition?.main_interviewer_id}
                                isActive={requisition?.is_active}
                            />
                        )}

                        {/* Summary Info Card - Dynamic SLA */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 opacity-80">SLA Tracking</h3>
                            <div className="space-y-3">
                                {(() => {
                                    const created = new Date(requisition?.created_at || Date.now());
                                    const diff = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
                                    const slaTarget = 7;
                                    const percent = Math.min(100, (diff / slaTarget) * 100);
                                    const isAtRisk = diff >= slaTarget;

                                    return (
                                        <>
                                            <div className="flex justify-between items-end">
                                                <span className="text-2xl font-bold">{diff} Days</span>
                                                <span className={`text-[10px] font-bold uppercase ${isAtRisk ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {isAtRisk ? 'SLA BREACH' : 'Within SLA'}
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${isAtRisk ? 'bg-red-400 border-none' : 'bg-emerald-400 border-none'}`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 leading-tight">
                                                Target SLA for full approval cycle is {slaTarget} working days.
                                                Current tenure for <span className="text-white font-bold">{requisition?.req_number}</span> is {diff} days.
                                            </p>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isEditModalOpen && (
                <NewRequisitionModal
                    requisition={{
                        id: requisition.id,
                        positionTitle: requisition.position_title,
                        department_id: requisition.department_id,
                        targetStartDate: requisition.target_start_date,
                        workLocation: requisition.work_location,
                        reqLaptop: requisition.req_laptop,
                        reqMobilePhone: requisition.req_mobile,
                        reqEmailAccess: requisition.req_email,
                        reqSoftwareLicenses: requisition.req_software === 'Standard Suite',
                        officeSeating: requisition.seating_accommodations,
                        fundingType: requisition.funding_category,
                        budget: requisition.reserved_budget_aed,
                    }}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        setIsEditModalOpen(false);
                        loadRequisition();
                    }}
                />
            )}
        </AppLayout>
    );
}
