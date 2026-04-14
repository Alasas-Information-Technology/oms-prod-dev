import React from 'react';
import MetricCard, { MetricData } from './MetricCard';

interface MetricsBentoGridProps {
    stats: {
        activeRequisitions: number;
        totalCandidates: number;
        totalBudgetReserved: number;
        slaBreachRisk: number;
        emiratisationRate: number;
        avgTimeToHire: number;
    };
}

export default function MetricsBentoGrid({ stats }: MetricsBentoGridProps) {
    const metrics: MetricData[] = [
        {
            id: 'metric-active-req',
            title: 'Active Requisitions',
            value: stats.activeRequisitions.toString(),
            unit: '',
            delta: 'Active Pipeline',
            deltaType: 'neutral' as const,
            subtitle: 'Across all workflow stages',
            hero: true,
            colSpan: 2,
            breakdown: [
                { label: 'Pending', value: stats.activeRequisitions.toString() },
            ],
            icon: 'layers',
            color: 'blue',
        },
        {
            id: 'metric-total-candidates',
            title: 'Total Candidates',
            value: stats.totalCandidates.toString(),
            unit: '',
            delta: 'Candidate Pool',
            deltaType: 'positive' as const,
            subtitle: 'Market talent accessibility',
            hero: false,
            colSpan: 1,
            breakdown: [],
            icon: 'layers',
            color: 'blue',
        },
        {
            id: 'metric-budget-reserved',
            title: 'Budget Reserved',
            value: (stats.totalBudgetReserved / 1000000).toFixed(2) + 'M',
            unit: 'AED',
            delta: 'Active Allocations',
            deltaType: 'warning' as const,
            subtitle: 'FY2026 Reserved Capital',
            hero: false,
            colSpan: 1,
            breakdown: [],
            icon: 'wallet',
            color: 'amber',
        },
        {
            id: 'metric-sla-risk',
            title: 'SLA Breach Risk',
            value: stats.slaBreachRisk.toString(),
            unit: '',
            delta: 'Requires Oversight',
            deltaType: 'negative' as const,
            subtitle: 'Items exceeding response targets',
            hero: false,
            colSpan: 1,
            breakdown: [],
            icon: 'alert',
            color: 'red',
        },
        {
            id: 'metric-emiratisation',
            title: 'Emiratisation Rate',
            value: stats.emiratisationRate.toString(),
            unit: '%',
            delta: 'Nationalization Goal',
            deltaType: 'negative' as const,
            subtitle: 'Reflects local talent ratio',
            hero: false,
            colSpan: 1,
            breakdown: [],
            icon: 'shield',
            color: 'orange',
        },
        {
            id: 'metric-time-to-hire',
            title: 'Avg. Time-to-Hire',
            value: stats.avgTimeToHire.toString(),
            unit: 'days',
            delta: 'Quarterly Velocity',
            deltaType: 'positive' as const,
            subtitle: 'Speed of talent acquisition',
            hero: false,
            colSpan: 1,
            breakdown: [],
            icon: 'trending',
            color: 'green',
        },
    ];

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