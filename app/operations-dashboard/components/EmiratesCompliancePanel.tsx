'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

// Backend integration point: GET /api/dashboard/emiratisation-compliance
const complianceData = [
    { name: 'UAE Nationals', value: 38.4, color: '#1B4F8A' },
    { name: 'Expatriates', value: 61.6, color: '#e2e8f0' },
];

const vendorCompliance = [
    { id: 'vendor-tb', vendor: 'TechBridge Solutions', rate: 52, status: 'compliant' },
    { id: 'vendor-gm', vendor: 'Gulf Manpower Co.', rate: 41, status: 'at-risk' },
    { id: 'vendor-et', vendor: 'Emirates Talent Hub', rate: 68, status: 'compliant' },
    { id: 'vendor-mp', vendor: 'MenaPath Staffing', rate: 28, status: 'breach' },
    { id: 'vendor-al', vendor: 'Al Wadi Consulting', rate: 35, status: 'at-risk' },
];

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-card px-3 py-2">
            <p className="text-xs font-semibold text-slate-700">{payload[0].name}</p>
            <p className="text-sm font-bold text-slate-900 tabular-nums">{payload[0].value}%</p>
        </div>
    );
}

export default function EmiratesCompliancePanel() {
    return (
        <Card className="h-full flex flex-col bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />
            
            <CardHeader className="flex flex-row items-start justify-between mb-0 pb-4 relative z-10">
                <div>
                    <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2 border-none">
                        <Shield size={16} className="text-[hsl(214,67%,32%)]" />
                        Emiratisation Compliance
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-0.5">Dubai Law No. 5 of 2026 · 1:1 mandate (50% target)</CardDescription>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between relative z-10 pt-0 pb-0">
            <div className="flex items-center gap-4 mb-4">
                <div style={{ width: 100, height: 100 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={complianceData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={46}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {complianceData.map((entry, i) => (
                                    <Cell key={`compliance-cell-${i}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex-1">
                    <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl font-bold text-slate-900 tabular-nums">38.4</span>
                        <span className="text-base font-semibold text-slate-400">%</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600 text-xs font-semibold mb-2">
                        <AlertTriangle size={11} />
                        11.6% below 50% mandate
                    </div>
                    {complianceData.map((d) => (
                        <div key={`legend-${d.name}`} className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                            <span>{d.name}</span>
                            <span className="ml-auto font-semibold text-slate-700 tabular-nums">{d.value}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Vendor Compliance Table */}
            <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Vendor Compliance</p>
                <div className="space-y-1.5">
                    {vendorCompliance.map((v) => (
                        <div key={v.id} className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-xs text-slate-700 truncate font-medium">{v.vendor}</span>
                                    <span className={`text-[10px] font-bold tabular-nums ${v.status === 'compliant' ? 'text-green-600' :
                                            v.status === 'at-risk' ? 'text-amber-600' : 'text-red-600'
                                        }`}>
                                        {v.rate}%
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${v.status === 'compliant' ? 'bg-green-500' :
                                                v.status === 'at-risk' ? 'bg-amber-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${v.rate}%` }}
                                    />
                                </div>
                            </div>
                            <span className={`badge-base text-[10px] shrink-0 ${v.status === 'compliant' ? 'bg-green-50 text-green-700' :
                                    v.status === 'at-risk' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {v.status === 'compliant' ? 'Compliant' : v.status === 'at-risk' ? 'At Risk' : 'Breach'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            </CardContent>

            <CardFooter className="mt-0 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400 relative z-10">
                <TrendingUp size={12} />
                <span>Target 50% by Q4 FY2026 per Dubai Law No. 5</span>
            </CardFooter>
        </Card>
    );
}