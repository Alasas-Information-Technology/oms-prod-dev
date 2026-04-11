import React from 'react';
import MetricCard, { MetricData } from './MetricCard';

// Grid plan: 6 cards → grid-cols-4 → row 1: hero (spans 2 cols) + 2 regular; row 2: 3 regular cards (last spans extra col for balance)
// Layout: [Hero: Active Requisitions (2col)] [Pending Approvals] [Budget Health]
//         [SLA Breach Risk] [Emiratisation Rate] [Avg Time-to-Hire]

const metrics: MetricData[] = [
    {
        id: 'metric-active-req',
        title: 'Active Requisitions',
        value: '47',
        unit: '',
        delta: '+6 this week',
        deltaType: 'neutral' as const,
        subtitle: 'Across all 14 workflow stages',
        hero: true,
        colSpan: 2,
        breakdown: [
            { label: 'In Approval', value: '18' },
            { label: 'With Vendors', value: '12' },
            { label: 'Onboarding', value: '9' },
            { label: 'Active', value: '8' },
        ],
        icon: 'layers',
        color: 'blue',
    },
    {
        id: 'metric-pending-approvals',
        title: 'Pending My Approvals',
        value: '14',
        unit: '',
        delta: '3 overdue SLA',
        deltaType: 'negative' as const,
        subtitle: 'Requires action before auto-closure',
        hero: false,
        colSpan: 1,
        breakdown: [],
        icon: 'clock',
        color: 'red',
    },
    {
        id: 'metric-budget-reserved',
        title: 'Budget Reserved',
        value: '2.84M',
        unit: 'AED',
        delta: '71.0% of annual allocation',
        deltaType: 'warning' as const,
        subtitle: 'AED 1.16M remaining · FY2026',
        hero: false,
        colSpan: 1,
        breakdown: [],
        icon: 'wallet',
        color: 'amber',
    },
    {
        id: 'metric-sla-risk',
        title: 'SLA Breach Risk',
        value: '3',
        unit: '',
        delta: 'Auto-close in &lt;72 hrs',
        deltaType: 'negative' as const,
        subtitle: 'Requisitions pending response &gt;27 days',
        hero: false,
        colSpan: 1,
        breakdown: [],
        icon: 'alert',
        color: 'red',
    },
    {
        id: 'metric-emiratisation',
        title: 'Emiratisation Rate',
        value: '38.4',
        unit: '%',
        delta: '-11.6% below 50% target',
        deltaType: 'negative' as const,
        subtitle: 'Dubai Law No. 5 of 2026 · 1:1 mandate',
        hero: false,
        colSpan: 1,
        breakdown: [],
        icon: 'shield',
        color: 'orange',
    },
    {
        id: 'metric-time-to-hire',
        title: 'Avg. Time-to-Hire',
        value: '18.3',
        unit: 'days',
        delta: '-2.1 days vs. last quarter',
        deltaType: 'positive' as const,
        subtitle: 'Requisition to qualified candidate',
        hero: false,
        colSpan: 1,
        breakdown: [],
        icon: 'trending',
        color: 'green',
    },
];

export default function MetricsBentoGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
            {metrics.map((m) => (
                <div
                    key={m.id}
                    className={
                        m.colSpan === 2
                            ? 'sm:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2' : 'col-span-1'
                    }
                >
                    <MetricCard metric={m} />
                </div>
            ))}
        </div>
    );
}