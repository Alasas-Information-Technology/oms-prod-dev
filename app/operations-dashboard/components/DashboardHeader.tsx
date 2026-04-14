'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
    onRefresh: () => void;
    refreshing: boolean;
}

export default function DashboardHeader({ onRefresh, refreshing }: DashboardHeaderProps) {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        const now = new Date();
        setLastUpdated(
            now?.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit', hour12: true }) +
            ' · ' + now?.toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' })
        );
    }, []);

    const handleRefresh = async () => {
        onRefresh();
        const now = new Date();
        setLastUpdated(
            now?.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit', hour12: true }) +
            ' · ' + now?.toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' })
        );
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-slate-900">Operations Dashboard</h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        LIVE
                    </span>
                </div>
                <p className="text-slate-500 text-sm">
                    Outsourced manpower lifecycle overview · Q2 FY2026
                </p>
                {lastUpdated && (
                    <p className="text-slate-400 text-xs mt-1">Last updated: {lastUpdated}</p>
                )}
            </div>

            {/* SLA Alert Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    <AlertTriangle size={13} />
                    <span>3 requisitions at SLA breach risk — auto-close in &lt;3 days</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" className="gap-2">
                        <Calendar size={14} />
                        Q2 FY2026
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button variant="secondary" size="sm" className="gap-2">
                        <Download size={14} />
                        Export
                    </Button>
                </div>
            </div>
        </div>
    );
}