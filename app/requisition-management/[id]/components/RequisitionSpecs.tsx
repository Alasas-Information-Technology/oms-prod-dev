'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Laptop, Armchair, Wallet, Landmark } from 'lucide-react';

interface RequisitionSpecsProps {
    data: any;
}

export default function RequisitionSpecs({ data }: RequisitionSpecsProps) {
    return (
        <div className="space-y-6">
            <Card className="border border-[#DFE1E6] shadow-atlassian overflow-hidden rounded-sm">
                <CardHeader className="bg-[#F4F5F7] border-b border-[#DFE1E6] py-3">
                    <CardTitle className="text-xs font-bold text-[#42526E] uppercase tracking-wider flex items-center gap-2">
                        <Laptop size={14} className="text-[#0C66E4]" />
                        Specifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">Target Start</p>
                            <div className="flex items-center gap-2 text-slate-700">
                                <Calendar size={14} className="text-slate-400" />
                                <span className="text-sm font-semibold">
                                    {data?.target_start_date ? new Date(data.target_start_date).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">Location</p>
                            <div className="flex items-center gap-2 text-slate-700">
                                <MapPin size={14} className="text-slate-400" />
                                <span className="text-sm font-semibold">{data?.work_location || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">Tools & Hardware</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                             {data?.req_laptop && <span className="px-2 py-0.5 rounded-[3px] bg-[#DEEBFF] text-[#0747A6] text-[11px] font-bold border border-[#B3D4FF]">Laptop</span>}
                            {data?.req_email && <span className="px-2 py-0.5 rounded-[3px] bg-[#DEEBFF] text-[#0747A6] text-[11px] font-bold border border-[#B3D4FF]">Email</span>}
                            {data?.req_mobile && <span className="px-2 py-0.5 rounded-[3px] bg-[#DEEBFF] text-[#0747A6] text-[11px] font-bold border border-[#B3D4FF]">Mobile</span>}
                            <span className="px-2 py-0.5 rounded-[3px] bg-[#F4F5F7] text-[#42526E] text-[11px] font-bold border border-[#DFE1E6]">
                                Software: {data?.req_software || 'Standard'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">Accommodations</p>
                        <div className="flex items-center gap-2 text-slate-700">
                            <Armchair size={14} className="text-slate-400" />
                            <span className="text-sm font-semibold">{data?.seating_accommodations || 'Unspecified'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-[#DFE1E6] shadow-atlassian overflow-hidden rounded-sm">
                <CardHeader className="bg-[#F4F5F7] border-b border-[#DFE1E6] py-3">
                    <CardTitle className="text-xs font-bold text-[#42526E] uppercase tracking-wider flex items-center gap-2">
                        <Wallet size={14} className="text-[#0C66E4]" />
                        Finance
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">Category</p>
                            <div className="flex items-center gap-2">
                                <Landmark size={14} className="text-[#36B37E]" />
                                <span className="text-sm font-bold text-[#006644]">{data?.funding_category || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">Reserved</p>
                            <p className="text-lg font-mono font-bold text-[#172B4D]">
                                {data?.reserved_budget_aed?.toLocaleString() || '0'} <span className="text-xs text-[#5E6C84]">AED</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="p-3 rounded-sm bg-[#E3FCEF] border border-[#ABF5D1]">
                        <p className="text-[11px] text-[#006644] leading-relaxed font-bold">
                            Budget code: <span className="font-mono">CORP-OPS-26-F1</span>. Variance threshold: 5%.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
