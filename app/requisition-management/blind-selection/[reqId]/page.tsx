'use client';

import React, { useState } from 'react';
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
    XCircle
} from 'lucide-react';
import Link from 'next/link';

interface Candidate {
    id: string;
    alias: string;
    experience: number;
    skills: string[];
    education: string;
}

const mockCandidates: Candidate[] = [
    {
        id: 'c-alpha',
        alias: 'Candidate Alpha',
        experience: 6,
        skills: ['Power BI', 'SQL Server', 'Python (Pandas)'],
        education: 'BSc Computer Science',
    },
    {
        id: 'c-bravo',
        alias: 'Candidate Bravo',
        experience: 8,
        skills: ['Tableau', 'Snowflake', 'dbt'],
        education: 'Master of Data Analytics',
    },
    {
        id: 'c-charlie',
        alias: 'Candidate Charlie',
        experience: 4,
        skills: ['Looker', 'PostgreSQL', 'ETL pipelines'],
        education: 'BEng Information Technology',
    },
    {
        id: 'c-delta',
        alias: 'Candidate Delta',
        experience: 10,
        skills: ['Power BI (Advanced)', 'DAX', 'Azure Synapse'],
        education: 'BSc Software Engineering',
    },
    {
        id: 'c-echo',
        alias: 'Candidate Echo',
        experience: 5,
        skills: ['Qlik Sense', 'Python', 'Machine Learning'],
        education: 'BSc Data Science',
    },
];

type PriorityRank = 'P1' | 'P2' | 'P3' | 'Rejected' | null;

export default function BlindSelectionView() {
    const params = useParams();
    const router = useRouter();
    const reqId = params?.reqId as string || 'OMS-2026-0831';

    const [rankings, setRankings] = useState<Record<string, PriorityRank>>({});
    const [submitting, setSubmitting] = useState(false);

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

    const handleFinalize = async () => {
        // Ensure at least one ranking is done to mock validation
        if (Object.keys(rankings).length === 0) {
            toast.error("Please rank at least one candidate before proceeding.");
            return;
        }

        setSubmitting(true);
        // Simulate API
        await new Promise(res => setTimeout(res, 1200));
        setSubmitting(false);

        toast.success("Candidates locked. Proceeding to Stage 6: Interview Orchestration.");
        router.push('/requisition-management');
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-x-hidden pt-8 pb-32">
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 space-y-6">
                
                {/* Header Sequence */}
                <div>
                    <Link href="/requisition-management" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[hsl(214,67%,32%)] transition-colors mb-3">
                        <ChevronLeft size={14} />
                        Back to Requisition Management
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Blind Candidate Review: {reqId}
                    </h1>
                    <p className="text-slate-500 mt-1">Role: Business Intelligence Analyst</p>
                </div>

                {/* Blind Screening Notice Banner */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <ShieldAlert size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-amber-900">Notice: Blind Selection Mode Active</h3>
                        <p className="text-sm text-amber-800 mt-1">
                            Vendor identities and financial quotations are currently hidden to ensure unbiased, merit-based screening. Names, gender, and regional indicators have been automatically redacted by OMS.
                        </p>
                    </div>
                </div>

                {/* Candidate Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {mockCandidates.map(candidate => {
                        const currentRank = rankings[candidate.id];
                        const isRejected = currentRank === 'Rejected';
                        const isRanked = currentRank && currentRank !== 'Rejected';

                        return (
                            <div 
                                key={candidate.id} 
                                className={`card flex flex-col gap-4 border-2 transition-all p-5 ${
                                    isRejected 
                                        ? 'opacity-60 grayscale border-slate-200 bg-slate-50/50' 
                                        : isRanked 
                                            ? 'border-[hsl(214,67%,32%)] shadow-md bg-white' 
                                            : 'border-slate-100 hover:border-slate-200 bg-white'
                                }`}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
                                            Alias Card
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            {candidate.alias}
                                            {isRanked && <CheckCircle2 size={16} className="text-green-500" />}
                                            {isRejected && <XCircle size={16} className="text-red-400" />}
                                        </h3>
                                    </div>
                                    <button 
                                        onClick={() => handleViewCV(candidate.alias)}
                                        className="btn-ghost text-xs px-3 py-1.5 shrink-0"
                                        disabled={isRejected}
                                    >
                                        <Eye size={14} />
                                        View Redacted CV
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                                    <div className="flex items-start gap-2.5">
                                        <Briefcase size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Experience</p>
                                            <p className="text-sm font-semibold text-slate-700">{candidate.experience} Years</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <GraduationCap size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Education</p>
                                            <p className="text-sm font-medium text-slate-700 leading-snug">{candidate.education}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5 sm:col-span-2">
                                        <Code size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">Top Skills</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {candidate.skills.map(skill => (
                                                    <span key={skill} className="px-2 py-0.5 rounded-md bg-[hsl(214,67%,32%)]/10 text-[hsl(214,67%,32%)] text-xs font-semibold">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-100">
                                    <p className="text-xs font-semibold text-slate-500 mb-2">Priority Ranking</p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {(['P1', 'P2', 'P3', 'Rejected'] as PriorityRank[]).map((rankOption) => {
                                            if (!rankOption) return null;
                                            
                                            const isActive = currentRank === rankOption;
                                            const isRejectBtn = rankOption === 'Rejected';
                                            
                                            // Dynamic pill styling based on active state and variant
                                            let pillClass = "px-4 py-2 border rounded-full text-xs font-bold transition-all ";
                                            
                                            if (isActive) {
                                                if (isRejectBtn) pillClass += "bg-red-500 border-red-500 text-white shadow-sm ring-2 ring-red-500/20";
                                                else pillClass += "bg-[hsl(214,67%,32%)] border-[hsl(214,67%,32%)] text-white shadow-sm ring-2 ring-[hsl(214,67%,32%)]/20";
                                            } else {
                                                if (isRejectBtn) pillClass += "bg-white border-slate-200 text-slate-600 hover:border-red-400 hover:text-red-500";
                                                else pillClass += "bg-white border-slate-200 text-slate-600 hover:border-[hsl(214,67%,32%)] hover:text-[hsl(214,67%,32%)]";
                                            }

                                            // Extended labels
                                            let label = rankOption;
                                            if (rankOption === 'P1') label = 'P1 (High)';
                                            if (rankOption === 'P2') label = 'P2 (Med)';
                                            if (rankOption === 'P3') label = 'P3 (Low)';

                                            return (
                                                <button
                                                    key={rankOption}
                                                    onClick={() => handleSetPriority(candidate.id, isActive ? null : rankOption)}
                                                    className={pillClass}
                                                >
                                                    {label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-40 lg:left-64 transition-all">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">
                            {Object.values(rankings).filter(r => r && r !== 'Rejected').length} Candidates Ranked
                        </p>
                        <p className="text-xs text-slate-500">
                            Selections remain anonymous until Stage 6.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                            className="btn-secondary w-full sm:w-auto"
                            onClick={() => toast.success("Draft rankings saved securely to OMS.")}
                            disabled={submitting}
                        >
                            Save Draft Rankings
                        </button>
                        <button 
                            className="btn-primary w-full sm:w-auto"
                            onClick={handleFinalize}
                            disabled={submitting}
                        >
                            {submitting ? 'Finalizing...' : 'Finalize Selection & Proceed to Interviews'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
