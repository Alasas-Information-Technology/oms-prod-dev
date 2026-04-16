
'use client';

import React from 'react';
import {
    Layers,
    Clock,
    Wallet,
    AlertTriangle,
    Shield,
    TrendingUp,
    TrendingDown,
    Minus,
} from 'lucide-react';

export type MetricColor = 'blue' | 'red' | 'amber' | 'orange' | 'green';
export type DeltaType = 'positive' | 'negative' | 'neutral' | 'warning';

export interface MetricBreakdown {
    label: string;
    value: string;
}

export interface MetricData {
    id: string;
    title: string;
    value: string;
    unit: string;
    delta: string;
    deltaType: DeltaType;
    subtitle: string;
    hero: boolean;
    colSpan: number;
    breakdown: MetricBreakdown[];
    icon: string;
    color: MetricColor;
}

const colorConfig: Record<MetricColor, { bg: string; iconBg: string; iconColor: string; border: string; valueBg?: string }> = {
    blue: { bg: 'bg-white', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', border: 'border-slate-200' },
    red: { bg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600', border: 'border-red-200' },
    amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', border: 'border-amber-200' },
    orange: { bg: 'bg-orange-50', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', border: 'border-orange-200' },
    green: { bg: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600', border: 'border-green-200' },
};

const deltaConfig: Record<DeltaType, { color: string; icon: React.ElementType }> = {
    positive: { color: 'text-green-600', icon: TrendingUp },
    negative: { color: 'text-red-600', icon: TrendingDown },
    neutral: { color: 'text-slate-500', icon: Minus },
    warning: { color: 'text-amber-600', icon: AlertTriangle },
};

const IconMap: Record<string, React.ElementType> = {
    layers: Layers,
    clock: Clock,
    wallet: Wallet,
    alert: AlertTriangle,
    shield: Shield,
    trending: TrendingUp,
};

export default function MetricCard({ metric }: { metric: MetricData }) {
    const colors = colorConfig[metric.color] || colorConfig.blue;
    const delta = deltaConfig[metric.deltaType] || deltaConfig.neutral;
    const DeltaIcon = delta.icon;
    const MetricIcon = IconMap[metric.icon] ?? Layers;

    if (metric.hero) {
        return (
            <div className={`card ${colors.bg} ${colors.border} p-5 h-full flex flex-col hover:shadow-modal transition-shadow duration-200 rounded-sm`}>
                <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-sm ${colors.iconBg} flex items-center justify-center`}>
                        <MetricIcon size={20} className={colors.iconColor} />
                    </div>
                    <span className="text-[11px] font-bold text-[#0C66E4] uppercase tracking-wider">{metric.title}</span>
                </div>

                <div className="flex items-end gap-3 mb-2">
                    <span className="text-5xl font-bold text-slate-900 tabular-nums leading-none">{metric.value}</span>
                    {metric.unit && <span className="text-xl font-semibold text-slate-500 mb-1">{metric.unit}</span>}
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                    <DeltaIcon size={13} className={delta.color} />
                    <span className={`text-xs font-semibold ${delta.color}`}
                        dangerouslySetInnerHTML={{ __html: metric.delta }}
                    />
                </div>
                <p className="text-xs text-slate-400 mb-5">{metric.subtitle}</p>

                {/* Breakdown */}
                {metric.breakdown.length > 0 && (
                    <div className="mt-auto grid grid-cols-4 gap-2">
                        {metric.breakdown.map((b) => (
                            <div key={`breakdown-${b.label}`} className="bg-[#F4F5F7] border border-[#DFE1E6] rounded-sm p-2 text-center">
                                <p className="text-lg font-bold text-[#172B4D] tabular-nums leading-tight">{b.value}</p>
                                <p className="text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider mt-0.5">{b.label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`card ${colors.bg} ${colors.border} p-4 h-full flex flex-col hover:shadow-modal transition-shadow duration-200 rounded-sm`}>
            <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-sm ${colors.iconBg} flex items-center justify-center`}>
                    <MetricIcon size={16} className={colors.iconColor} />
                </div>
                <DeltaIcon size={12} className={delta.color} />
            </div>

            <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-2xl font-bold text-[#172B4D] tabular-nums leading-none">{metric.value}</span>
                {metric.unit && <span className="text-xs font-semibold text-[#5E6C84] uppercase">{metric.unit}</span>}
            </div>

            <p className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider mb-1">{metric.title}</p>
            <p className={`text-[11px] font-bold ${delta.color} mb-1`}
                dangerouslySetInnerHTML={{ __html: metric.delta }}
            />
            <p className="text-[11px] text-[#42526E] leading-snug mt-auto">{metric.subtitle}</p>
        </div>
    );
}