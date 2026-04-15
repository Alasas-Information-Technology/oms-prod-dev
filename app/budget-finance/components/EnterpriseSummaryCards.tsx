'use client';

import React from 'react';
import { Banknote, TrendingDown, Lock, Wallet } from 'lucide-react';

interface EnterpriseSummary {
    totalBudget: number;
    totalConsumed: number;
    totalReserved: number;
    totalAvailable: number;
}

interface Props {
    summary: EnterpriseSummary;
}

function formatAED(value: number): string {
    return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

const CARDS = [
    {
        key: 'totalBudget' as keyof EnterpriseSummary,
        label: 'Total Enterprise Budget',
        sublabel: 'FY 2026 Allocation',
        icon: Banknote,
        gradient: 'from-blue-600 to-blue-800',
        glowColor: 'rgba(37,99,235,0.18)',
        textColor: 'text-blue-100',
        iconBg: 'bg-blue-500/30',
    },
    {
        key: 'totalConsumed' as keyof EnterpriseSummary,
        label: 'Total Consumed',
        sublabel: 'Expenditure to date',
        icon: TrendingDown,
        gradient: 'from-rose-600 to-rose-800',
        glowColor: 'rgba(225,29,72,0.18)',
        textColor: 'text-rose-100',
        iconBg: 'bg-rose-500/30',
    },
    {
        key: 'totalReserved' as keyof EnterpriseSummary,
        label: 'Total Reserved',
        sublabel: 'Committed & locked funds',
        icon: Lock,
        gradient: 'from-amber-500 to-amber-700',
        glowColor: 'rgba(245,158,11,0.18)',
        textColor: 'text-amber-100',
        iconBg: 'bg-amber-500/30',
    },
    {
        key: 'totalAvailable' as keyof EnterpriseSummary,
        label: 'Total Available Liquidity',
        sublabel: 'Budget − Consumed − Reserved',
        icon: Wallet,
        gradient: 'from-emerald-600 to-emerald-800',
        glowColor: 'rgba(5,150,105,0.18)',
        textColor: 'text-emerald-100',
        iconBg: 'bg-emerald-500/30',
    },
];

export default function EnterpriseSummaryCards({ summary }: Props) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {CARDS.map((card) => {
                const Icon = card.icon;
                const value = summary[card.key];
                return (
                    <div
                        key={card.key}
                        className={`
                            relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient}
                            p-5 text-white shadow-lg hover:shadow-xl
                            transition-all duration-300 hover:-translate-y-0.5
                        `}
                        style={{ boxShadow: `0 8px 32px ${card.glowColor}` }}
                    >
                        {/* Decorative circle */}
                        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
                        <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white/5" />

                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <p className={`text-xs font-semibold uppercase tracking-widest ${card.textColor}`}>
                                    {card.label}
                                </p>
                                <span className={`flex items-center justify-center w-9 h-9 rounded-xl ${card.iconBg} shrink-0`}>
                                    <Icon size={18} className="text-white" />
                                </span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold tracking-tight leading-none">
                                    {formatAED(value)}
                                </p>
                                <p className={`mt-1.5 text-xs ${card.textColor}`}>
                                    {card.sublabel}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
