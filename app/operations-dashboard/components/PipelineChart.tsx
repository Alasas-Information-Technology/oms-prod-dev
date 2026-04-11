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

// Backend integration point: GET /api/dashboard/pipeline-distribution
const pipelineData = [
    { stage: 'Draft', count: 4, stageNum: 1 },
    { stage: 'Submitted', count: 6, stageNum: 2 },
    { stage: 'Line Mgr', count: 8, stageNum: 3 },
    { stage: 'HOD Apvl', count: 5, stageNum: 4 },
    { stage: 'HR Review', count: 7, stageNum: 5 },
    { stage: 'Procure', count: 4, stageNum: 6 },
    { stage: 'Vendor Sub', count: 5, stageNum: 7 },
    { stage: 'Blind Sel', count: 3, stageNum: 8 },
    { stage: 'Interview', count: 4, stageNum: 9 },
    { stage: 'Qualified', count: 3, stageNum: 10 },
    { stage: 'Onboarding', count: 5, stageNum: 11 },
    { stage: 'Active', count: 18, stageNum: 12 },
    { stage: 'Renewal', count: 6, stageNum: 13 },
    { stage: 'Closed', count: 9, stageNum: 14 },
];

const stageColors: Record<number, string> = {
    1: '#94a3b8',
    2: '#60a5fa',
    3: '#818cf8',
    4: '#a78bfa',
    5: '#c084fc',
    6: '#22d3ee',
    7: '#2dd4bf',
    8: '#fb923c',
    9: '#fbbf24',
    10: '#a3e635',
    11: '#34d399',
    12: '#22c55e',
    13: '#38bdf8',
    14: '#94a3b8',
};

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; payload: typeof pipelineData[0] }>;
    label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;
    const data = payload[0];
    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-card px-3 py-2.5">
            <p className="text-xs font-semibold text-slate-700">Stage {data.payload.stageNum}: {label}</p>
            <p className="text-base font-bold text-slate-900 tabular-nums">{data.value} requisitions</p>
        </div>
    );
}

export default function PipelineChart() {
    return (
        <div className="card p-5 h-full">
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h2 className="text-base font-semibold text-slate-900">Requisition Pipeline Distribution</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Count by 14-step OMS workflow stage · Live</p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    87 total
                </span>
            </div>
            <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pipelineData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={16}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                            dataKey="stage"
                            tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            angle={-35}
                            textAnchor="end"
                            height={52}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100,116,139,0.06)' }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {pipelineData.map((entry) => (
                                <Cell key={`cell-stage-${entry.stageNum}`} fill={stageColors[entry.stageNum]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}