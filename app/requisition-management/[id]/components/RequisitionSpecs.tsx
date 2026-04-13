'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Laptop, Armchair, Wallet, Landmark } from 'lucide-react';

export default function RequisitionSpecs() {
    return (
        <div className="space-y-6">
            <Card className="border-none shadow-card overflow-hidden">
                <CardHeader className="bg-slate-50/50 pb-3">
                    <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Laptop size={16} className="text-[hsl(214,67%,32%)]" />
                        Requisition Specifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Start Date</p>
                            <div className="flex items-center gap-2 text-slate-700">
                                <Calendar size={14} className="text-slate-400" />
                                <span className="text-sm font-semibold">May 01, 2026</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Work Location</p>
                            <div className="flex items-center gap-2 text-slate-700">
                                <MapPin size={14} className="text-slate-400" />
                                <span className="text-sm font-semibold">Onshore (DIEZA)</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hardware & Tools</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-[11px] font-bold">DIEZA Standard Laptop</span>
                            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-[11px] font-bold">Enterprise Email</span>
                            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-[11px] font-bold">VPN Access</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seating & Accommodations</p>
                        <div className="flex items-center gap-2 text-slate-700">
                            <Armchair size={14} className="text-slate-400" />
                            <span className="text-sm font-semibold">Standard Workstation (Level 4, Zone B)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-card overflow-hidden">
                <CardHeader className="bg-slate-50/50 pb-3">
                    <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Wallet size={16} className="text-[hsl(214,67%,32%)]" />
                        Financial Overview
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Funding Category</p>
                            <div className="flex items-center gap-2">
                                <Landmark size={14} className="text-emerald-500" />
                                <span className="text-sm font-bold text-emerald-700">Approved Budgeted</span>
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reserved Amount</p>
                            <p className="text-lg font-mono font-bold text-slate-800">150,000 <span className="text-xs text-slate-400">AED</span></p>
                        </div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                        <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
                            Budget code: <strong>DIEZA-OPS-2026-F1</strong>. Variance within 5% threshold compared to initial request.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
