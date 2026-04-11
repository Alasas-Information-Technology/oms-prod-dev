import React from 'react';

type BadgeVariant =
    | 'draft' | 'submitted' | 'line-manager' | 'hod-approval' | 'hr-review' | 'procurement' | 'vendor-submission' | 'blind-selection' | 'interview' | 'qualified' | 'onboarding' | 'active' | 'renewal' | 'terminated' | 'closed' | 'sla-risk' | 'budget-exceeded' | 'unbudgeted' | 'budgeted' | 'onshore' | 'offshore' | 'wfh' | 'p1' | 'p2' | 'p3';

const variantStyles: Record<BadgeVariant, string> = {
    draft: 'bg-slate-100 text-slate-600',
    submitted: 'bg-blue-50 text-blue-700',
    'line-manager': 'bg-indigo-50 text-indigo-700',
    'hod-approval': 'bg-violet-50 text-violet-700',
    'hr-review': 'bg-purple-50 text-purple-700',
    procurement: 'bg-cyan-50 text-cyan-700',
    'vendor-submission': 'bg-teal-50 text-teal-700',
    'blind-selection': 'bg-orange-50 text-orange-700',
    interview: 'bg-amber-50 text-amber-700',
    qualified: 'bg-lime-50 text-lime-700',
    onboarding: 'bg-emerald-50 text-emerald-700',
    active: 'bg-green-50 text-green-700',
    renewal: 'bg-sky-50 text-sky-700',
    terminated: 'bg-red-50 text-red-700',
    closed: 'bg-slate-100 text-slate-500',
    'sla-risk': 'bg-red-100 text-red-700 font-bold',
    'budget-exceeded': 'bg-red-100 text-red-700',
    unbudgeted: 'bg-orange-100 text-orange-700',
    budgeted: 'bg-green-50 text-green-700',
    onshore: 'bg-blue-50 text-blue-700',
    offshore: 'bg-purple-50 text-purple-700',
    wfh: 'bg-teal-50 text-teal-700',
    p1: 'bg-red-100 text-red-700',
    p2: 'bg-amber-100 text-amber-700',
    p3: 'bg-slate-100 text-slate-600',
};

const variantDots: Record<BadgeVariant, string> = {
    draft: 'bg-slate-400',
    submitted: 'bg-blue-500',
    'line-manager': 'bg-indigo-500',
    'hod-approval': 'bg-violet-500',
    'hr-review': 'bg-purple-500',
    procurement: 'bg-cyan-500',
    'vendor-submission': 'bg-teal-500',
    'blind-selection': 'bg-orange-500',
    interview: 'bg-amber-500',
    qualified: 'bg-lime-500',
    onboarding: 'bg-emerald-500',
    active: 'bg-green-500',
    renewal: 'bg-sky-500',
    terminated: 'bg-red-500',
    closed: 'bg-slate-400',
    'sla-risk': 'bg-red-500',
    'budget-exceeded': 'bg-red-500',
    unbudgeted: 'bg-orange-500',
    budgeted: 'bg-green-500',
    onshore: 'bg-blue-500',
    offshore: 'bg-purple-500',
    wfh: 'bg-teal-500',
    p1: 'bg-red-500',
    p2: 'bg-amber-500',
    p3: 'bg-slate-400',
};

const variantLabels: Record<BadgeVariant, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    'line-manager': 'Line Manager Review',
    'hod-approval': 'HOD Approval',
    'hr-review': 'HR Review',
    procurement: 'Procurement',
    'vendor-submission': 'Vendor Submission',
    'blind-selection': 'Blind Selection',
    interview: 'Interview',
    qualified: 'Qualified',
    onboarding: 'Onboarding',
    active: 'Active',
    renewal: 'Renewal',
    terminated: 'Terminated',
    closed: 'Closed',
    'sla-risk': 'SLA Risk',
    'budget-exceeded': 'Budget Exceeded',
    unbudgeted: 'Unbudgeted',
    budgeted: 'Budgeted',
    onshore: 'Onshore',
    offshore: 'Offshore',
    wfh: 'WFH',
    p1: 'P1',
    p2: 'P2',
    p3: 'P3',
};

interface StatusBadgeProps {
    variant: BadgeVariant;
    showDot?: boolean;
    className?: string;
    label?: string;
}

export default function StatusBadge({ variant, showDot = true, className = '', label }: StatusBadgeProps) {
    return (
        <span className={`badge-base ${variantStyles[variant]} ${className}`}>
            {showDot && (
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${variantDots[variant]}`} />
            )}
            {label ?? variantLabels[variant]}
        </span>
    );
}