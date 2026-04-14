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

interface BudgetData {
    dept: string;
    reserved: number;
    consumed: number;
    remaining: number;
}

interface BudgetUtilizationChartProps {
    data: BudgetData[];
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload || payload.length === 0) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-card px-3 py-2.5 min-w-[160px]">
            <p className="text-xs font-semibold text-slate-700 mb-2">{label} Department</p>
            {payload.map((p: any, i: number) => (
                <div key={`tooltip-item-${i}`} className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-500 capitalize">{p.name}</span>
                    <span className="text-xs font-bold text-slate-900 tabular-nums font-mono">
                        AED {(p.value / 1000).toFixed(0)}K
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function BudgetUtilizationChart({ data }: BudgetUtilizationChartProps) {
    const sortedData = [...data].sort((a, b) => b.reserved - a.reserved);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between mb-0 pb-2">
                <div>
                    <CardTitle className="text-base font-semibold text-slate-900 border-none">Budget vs. Consumed</CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-0.5">By department · AED · Live Data</CardDescription>
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
                {data.length === 0 ? (
                    <div className="h-full flex items-center justify-center italic text-slate-400 text-sm">
                        No budget data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sortedData} margin={{ top: 10, right: 0, left: -18, bottom: 0 }} barSize={10} barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis
                                dataKey="dept"
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100,116,139,0.06)' }} />
                            <Bar dataKey="reserved" name="reserved" radius={[3, 3, 0, 0]} fill="#bfdbfe">
                                {sortedData.map((entry, i) => (
                                    <Cell
                                        key={`reserved-cell-${i}`}
                                        fill={entry.remaining < (entry.reserved * 0.05) ? '#fca5a5' : '#bfdbfe'}
                                    />
                                ))}
                            </Bar>
                            <Bar dataKey="consumed" name="consumed" radius={[3, 3, 0, 0]} fill="hsl(214,67%,32%)">
                                {sortedData.map((entry, i) => (
                                    <Cell
                                        key={`consumed-cell-${i}`}
                                        fill={entry.remaining < (entry.reserved * 0.05) ? '#dc2626' : 'hsl(214,67%,32%)'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
                </div>
                <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-blue-50 border border-blue-100">
                    <span className="text-[10px] font-semibold text-blue-700">
                        Real-time budget tracking active across all registered departments.
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}