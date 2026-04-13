'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// Backend integration point: GET /api/dashboard/budget-utilization-by-department
const budgetData = [
    { dept: 'IT', reserved: 680000, consumed: 512000, remaining: 168000 },
    { dept: 'Finance', reserved: 420000, consumed: 398000, remaining: 22000 },
    { dept: 'Ops', reserved: 560000, consumed: 441000, remaining: 119000 },
    { dept: 'HR', reserved: 310000, consumed: 278000, remaining: 32000 },
    { dept: 'Legal', reserved: 190000, consumed: 142000, remaining: 48000 },
    { dept: 'Admin', reserved: 280000, consumed: 195000, remaining: 85000 },
    { dept: 'Logistics', reserved: 400000, consumed: 380000, remaining: 20000 },
];

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; name: string }>;
    label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-card px-3 py-2.5 min-w-[160px]">
            <p className="text-xs font-semibold text-slate-700 mb-2">{label} Department</p>
            {payload.map((p, i) => (
                <div key={`tooltip-item-${i}`} className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-500">{p.name === 'reserved' ? 'Reserved' : 'Consumed'}</span>
                    <span className="text-xs font-bold text-slate-900 tabular-nums font-mono">
                        AED {(p.value / 1000).toFixed(0)}K
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function BudgetUtilizationChart() {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between mb-0 pb-2">
                <div>
                    <CardTitle className="text-base font-semibold text-slate-900 border-none">Budget vs. Consumed</CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-0.5">By department · AED · FY2026</CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500">
                        <span className="w-2.5 h-2.5 rounded-sm bg-blue-200 inline-block" />Reserved
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[hsl(214,67%,32%)] inline-block" />Consumed
                    </span>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetData} margin={{ top: 0, right: 0, left: -18, bottom: 0 }} barSize={10} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                            dataKey="dept"
                            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100,116,139,0.06)' }} />
                        <Bar dataKey="reserved" name="reserved" radius={[3, 3, 0, 0]} fill="#bfdbfe">
                            {budgetData.map((entry, i) => (
                                <Cell
                                    key={`reserved-cell-${i}`}
                                    fill={entry.remaining < 30000 ? '#fca5a5' : '#bfdbfe'}
                                />
                            ))}
                        </Bar>
                        <Bar dataKey="consumed" name="consumed" radius={[3, 3, 0, 0]} fill="hsl(214,67%,32%)">
                            {budgetData.map((entry, i) => (
                                <Cell
                                    key={`consumed-cell-${i}`}
                                    fill={entry.remaining < 30000 ? '#dc2626' : 'hsl(214,67%,32%)'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </div>
                <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-100">
                    <span className="text-[10px] font-semibold text-red-700">
                        ⚠ Finance &amp; Logistics at &lt;6% budget remaining — amendment required
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}