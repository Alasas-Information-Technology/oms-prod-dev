'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface PipelineChartProps {
    data: {
        name: string;
        count: number;
    }[];
}

const colors = [
    'hsl(214, 67%, 32%)', // Initiation
    'hsl(214, 67%, 45%)', // Approval
    'hsl(214, 67%, 55%)', // Vendor
    'hsl(214, 67%, 65%)', // Selection
    'hsl(214, 67%, 75%)', // Onboarding
];

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload || payload.length === 0) return null;
    const data = payload[0];
    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-card px-3 py-2.5">
            <p className="text-xs font-semibold text-slate-700">{label}</p>
            <p className="text-base font-bold text-slate-900 tabular-nums">{data.value} requisitions</p>
        </div>
    );
}

export default function PipelineChart({ data }: PipelineChartProps) {
    const totalCount = data.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between mb-0 pb-2">
                <div>
                    <CardTitle className="text-base font-semibold text-slate-900 border-none">Workflow Pipeline Distribution</CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-0.5">Active requisitions by current lifecycle stage</CardDescription>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {totalCount} total
                </span>
            </CardHeader>
            <CardContent className="pt-0">
                <div style={{ height: 240 }}>
                    {data.length === 0 ? (
                        <div className="h-full flex items-center justify-center italic text-slate-400 text-sm">
                            No active requisitions in pipeline
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100,116,139,0.06)' }} />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-pipeline-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}