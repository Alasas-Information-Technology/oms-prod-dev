'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ArrowRight, User, Building2, Briefcase, Info } from 'lucide-react';
import WorkflowStepper from './components/WorkflowStepper';
import RequisitionSpecs from './components/RequisitionSpecs';
import ActionPanel from './components/ActionPanel';
import Link from 'next/link';
import { toast } from 'sonner';

import { requisitionService } from '@/lib/services/requisitionService';
import { Skeleton } from '@/components/ui/skeleton';

export default function RequisitionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    
    const [requisition, setRequisition] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [status, setStatus] = useState('');
    
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
            const data = await requisitionService.getRequisitionById(id);
            setRequisition(data);
            setCurrentStep(data.stage_id);
            setStatus(data.workflow_stages?.stage_name || 'Draft');
        } catch (error) {
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
                                            Requisition <span className="text-[hsl(214,67%,32%)]">{requisition?.req_id}</span>
                                        </h1>
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
                                            ${currentStep === 2 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                            {status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={14} className="text-slate-400" />
                                            {requisition?.title}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building2 size={14} className="text-slate-400" />
                                            {requisition?.department}
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
                    <WorkflowStepper currentStep={currentStep} />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Specifications */}
                    <div className="lg:col-span-2 space-y-6">
                        {loading ? (
                            <Skeleton className="h-96 w-full rounded-2xl" />
                        ) : (
                            <RequisitionSpecs data={requisition} />
                        )}
                        
                        {/* Additional Info / Comments Section for premium feel */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                                <Info size={16} className="text-blue-500" />
                                Governance Notes
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                        <User size={14} className="text-slate-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-800">Sara Al-Mazrouei <span className="text-[10px] font-normal text-slate-400 ml-2">2 days ago</span></p>
                                        <p className="text-xs text-slate-600 leading-relaxed italic">
                                            "This role is critical for the Q3 fiscal audit. Budget has been provisionally reserved under the Corporate Strategy fund."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-6">
                        {loading ? (
                            <Skeleton className="h-64 w-full rounded-2xl" />
                        ) : (
                            <ActionPanel 
                                reqId={requisition?.id}
                                currentStageId={currentStep}
                                actorId={actorId}
                                requiredRoleId={requisition?.workflow_stages?.required_role_id}
                                onApprove={handleApprove} 
                            />
                        )}
                        
                        {/* Summary Info Card */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 opacity-80">SLA Tracking</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-bold">4.2 Days</span>
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Within SLA</span>
                                </div>
                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-400 h-full w-[40%]" />
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight">
                                    Target SLA for HR Approval is 7 working days. Current performance is optimized.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
