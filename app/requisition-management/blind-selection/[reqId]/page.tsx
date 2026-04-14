'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    ShieldAlert,
    ChevronLeft,
    CheckCircle2,
    Eye,
    Briefcase,
    GraduationCap,
    Code,
    XCircle,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { candidateService } from '@/lib/services/candidateService';
import { Skeleton } from '@/components/ui/skeleton';

type PriorityRank = 'P1' | 'P2' | 'P3' | 'Rejected' | null;

export default function BlindSelectionView() {
    const params = useParams();
    const router = useRouter();
    const reqId = params?.reqId as string;

    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [rankings, setRankings] = useState<Record<string, PriorityRank>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (reqId) {
            loadCandidates();
        }
    }, [reqId]);

    const loadCandidates = async () => {
        setLoading(true);
        try {
            const data = await candidateService.getCandidatesForRequisition(reqId);
            setCandidates(data);
            
            // Map initial rankings from database
            const initialRankings: Record<string, PriorityRank> = {};
            data.forEach((cand: any) => {
                if (cand.status === 'REJECTED') {
                    initialRankings[cand.id] = 'Rejected';
                } else if (cand.priority_ranking) {
                    initialRankings[cand.id] = cand.priority_ranking as PriorityRank;
                }
            });
            setRankings(initialRankings);
        } catch (error) {
            toast.error('Failed to load candidates');
        } finally {
            setLoading(false);
        }
    };

    const handleSetPriority = (candId: string, rank: PriorityRank) => {
        setRankings(prev => ({
            ...prev,
            [candId]: rank
        }));
    };

    const handleViewCV = (alias: string) => {
        toast.info(`Opening redacted CV for ${alias}...`, {
            description: "Personal Details, Company Names, and Contact Info have been scrubbed."
        });
    };

    const handleSaveProgress = async () => {
        setSubmitting(true);
        try {
            await candidateService.updateCandidateRankings(rankings, false);
            toast.success("Draft rankings locked in database securely.");
        } catch (error) {
            toast.error("Failed to save progress.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFinalize = async () => {
        if (Object.keys(rankings).length === 0) {
            toast.error("Please rank at least one candidate before proceeding.");
            return;
        }

        setSubmitting(true);
        try {
            // Persist as QUALIFIED/REJECTED
            await candidateService.updateCandidateRankings(rankings, true);
            toast.success("Selections locked. Requisition advanced to Stage 5 (Onboarding).");
            router.push('/requisition-management');
        } catch (error) {
            toast.error("Failed to finalize selections.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-x-hidden pt-10 pb-40 selection:bg-blue-100">
            {/* Background Branding Shimmer */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-indigo-600 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 space-y-10 relative z-10">
                
                {/* Header Sequence */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Link href="/requisition-management" className="group inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[hsl(214,67%,32%)] transition-all uppercase tracking-widest">
                            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Return to Requisitions
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="px-2 py-0.5 rounded bg-[hsl(214,67%,32%)]/10 text-[hsl(214,67%,32%)] text-[10px] font-black uppercase tracking-tighter">Secure Selection Layer</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">REF: {reqId}</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
                                Candidate Selection Matrix
                            </h1>
                            <p className="text-slate-500 mt-3 font-medium flex items-center gap-2">
                                <Briefcase size={16} className="text-slate-300" />
                                Analyzing Candidates for <span className="text-slate-900 font-bold italic underline decoration-blue-500/30">Business Intelligence Analyst</span>
                            </p>
                        </div>
                    </div>

                    {/* Progress Circle Utility could go here but skipping for simplicity */}
                </div>

                {/* Blind Screening Notice Banner */}
                <div className="relative group overflow-hidden p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-amber-100 shadow-xl shadow-amber-900/5 items-center flex gap-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.03] to-transparent pointer-events-none" />
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <ShieldAlert size={28} className="text-amber-600" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-black text-amber-900 tracking-tight">Merit-First Integrity Mode Active</h3>
                        <p className="text-sm text-amber-800/80 leading-relaxed font-medium maw-w-3xl">
                            OMS has intercepted and redacted all personal identifiers including vendor names, financial quotes, and regional telemetry. Requisitions are processed based on technical competence and professional experience to eliminate unconscious bias in the shortlisting phase.
                        </p>
                    </div>
                </div>

                {/* Candidate Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={`skeleton-${i}`} className="h-80 w-full rounded-2xl shadow-sm" />
                        ))
                    ) : candidates.length === 0 ? (
                        <div className="lg:col-span-2 py-32 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100 border-dashed">
                             <div className="max-w-xs mx-auto space-y-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                    <Users size={32} />
                                </div>
                                <p className="text-slate-400 italic font-medium">No candidates are currently eligible for review in this requisition.</p>
                             </div>
                        </div>
                    ) : (
                        candidates.map(candidate => {
                            const currentRank = rankings[candidate.id];
                            const isRejected = currentRank === 'Rejected';
                            const isRanked = currentRank && currentRank !== 'Rejected';
                            const rankColor = currentRank === 'P1' ? 'bg-blue-600' : currentRank === 'P2' ? 'bg-blue-500' : currentRank === 'P3' ? 'bg-blue-400' : 'bg-slate-200';

                            return (
                                <div 
                                    key={candidate.id} 
                                    className={`relative group flex flex-col gap-6 rounded-3xl border-2 transition-all p-7 overflow-hidden ${
                                        isRejected 
                                            ? 'opacity-60 grayscale scale-[0.98] border-slate-200 bg-slate-50/50' 
                                            : isRanked 
                                                ? 'border-[hsl(214,67%,32%)] shadow-2xl shadow-[hsl(214,67%,32%)]/10 bg-white' 
                                                : 'border-white bg-white/80 backdrop-blur-md shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-blue-100'
                                    }`}
                                >
                                    {/* Dynamic Rank Indicator Strip */}
                                    {isRanked && <div className={`absolute top-0 right-0 w-32 h-1 ${rankColor} rounded-bl-full`} />}

                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile Alias</span>
                                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span className="text-[10px] font-bold text-blue-600 uppercase">Verified Competence</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                                {candidate.alias}
                                                {isRanked && (
                                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 animate-in zoom-in duration-300">
                                                        <CheckCircle2 size={12} />
                                                        Ranked {currentRank}
                                                    </span>
                                                )}
                                                {isRejected && (
                                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-red-50 text-red-600 rounded-lg border border-red-100">
                                                        <XCircle size={12} />
                                                        Rejected
                                                    </span>
                                                )}
                                            </h3>
                                        </div>
                                        <Button 
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleViewCV(candidate.alias)}
                                            className="h-10 px-4 rounded-xl text-xs font-bold gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border-none transition-all group-hover:bg-[hsl(214,67%,32%)] group-hover:text-white"
                                            disabled={isRejected}
                                        >
                                            <Eye size={14} className="group-hover:scale-110 transition-transform" />
                                            Redacted CV
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 group-hover:bg-white transition-colors duration-500">
                                            <div className="flex items-center gap-2 mb-2 text-slate-400">
                                                <GraduationCap size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Credentials</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 leading-snug min-h-[32px]">{candidate.education || 'Verification Pending'}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 group-hover:bg-white transition-colors duration-500">
                                            <div className="flex items-center gap-2 mb-2 text-slate-400">
                                                <Briefcase size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Exposure</span>
                                            </div>
                                            <p className="text-xl font-black text-slate-900">{candidate.years_of_experience}<span className="text-xs text-slate-400 ml-1">Years</span></p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Code size={14} className="text-slate-400" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Core Competencies</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {(candidate.skills || []).map((skill: string) => (
                                                <span 
                                                    key={skill} 
                                                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-[hsl(214,67%,32%)] text-[11px] font-bold shadow-sm shadow-slate-200/50 group-hover:border-blue-200 transition-colors"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-slate-50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Strategic Ranking</p>
                                        <div className="flex items-center gap-2">
                                            {(['P1', 'P2', 'P3', 'Rejected'] as PriorityRank[]).map((rankOption) => {
                                                if (!rankOption) return null;
                                                
                                                const isActive = currentRank === rankOption;
                                                let label: string = rankOption;
                                                if (rankOption === 'P1') label = 'H-Prior';
                                                if (rankOption === 'P2') label = 'Medium';
                                                if (rankOption === 'P3') label = 'Backup';

                                                const isRejectBtn = rankOption === 'Rejected';

                                                return (
                                                    <Button
                                                        key={rankOption}
                                                        variant={isActive ? (isRejectBtn ? 'destructive' : 'default') : 'outline'}
                                                        size="sm"
                                                        onClick={() => handleSetPriority(candidate.id, isActive ? null : rankOption)}
                                                        className={`flex-1 rounded-xl text-[10px] font-black uppercase h-10 transition-all border-slate-200 ${
                                                            isActive 
                                                                ? 'shadow-lg scale-[1.05] z-10' 
                                                                : 'text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                                        } ${isActive && !isRejectBtn ? 'bg-[hsl(214,67%,32%)]' : ''}`}
                                                    >
                                                        {label}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Selection Meta-Insights Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.1)] z-50 lg:left-64 transition-all overflow-hidden animate-in slide-in-from-bottom duration-500">
                {/* Visual Progress Bar */}
                <div className="h-1 w-full bg-slate-100 flex">
                    <div 
                        className="h-full bg-blue-600 transition-all duration-1000 ease-out" 
                        style={{ width: `${(Object.values(rankings).filter(r => r && r !== 'Rejected').length / Math.max(candidates.length, 1)) * 100}%` }}
                    />
                </div>

                <div className="max-w-7xl mx-auto px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600">
                            <Users size={24} />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <p className="text-xl font-black text-slate-900 leading-none tracking-tight">
                                    {Object.values(rankings).filter(r => r && r !== 'Rejected').length} / {candidates.length} Selected
                                </p>
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">Distribution Analysis Active</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Button 
                            variant="ghost"
                            className="flex-1 sm:flex-none h-14 px-8 rounded-2xl text-[hsl(214,67%,32%)] font-black uppercase text-xs tracking-widest hover:bg-slate-50"
                            onClick={handleSaveProgress}
                            disabled={submitting}
                        >
                            Save Progress
                        </Button>
                        <Button 
                            className="flex-1 sm:flex-none h-14 px-10 rounded-2xl bg-[hsl(214,67%,32%)] hover:bg-slate-900 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            onClick={handleFinalize}
                            disabled={submitting}
                        >
                            {submitting ? 'Authenticating...' : 'Lock Selections & Orchestrate'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
