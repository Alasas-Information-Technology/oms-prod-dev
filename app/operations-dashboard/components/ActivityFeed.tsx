'use client';

import React from 'react';
import {
    FileText,
    CheckCircle2,
    AlertTriangle,
    Users,
    Wallet,
    UserCheck,
    XCircle,
    RefreshCw,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';


// Backend integration point: GET /api/dashboard/activity-feed?limit=12
const activities = [
    {
        id: 'act-001',
        type: 'approved',
        actor: 'Fatima Al-Rashidi',
        actorRole: 'HR',
        action: 'approved HR Review',
        target: 'OMS-2026-0843',
        time: '4m ago',
        icon: CheckCircle2,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-50',
    },
    {
        id: 'act-002',
        type: 'submitted',
        actor: 'TechBridge Solutions',
        actorRole: 'Vendor',
        action: 'submitted 8 CVs for',
        target: 'OMS-2026-0839',
        time: '18m ago',
        icon: Users,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50',
    },
    {
        id: 'act-003',
        type: 'budget',
        actor: 'Zayed Al-Falasi',
        actorRole: 'Finance',
        action: 'approved budget amendment for',
        target: 'OMS-2026-0821',
        time: '41m ago',
        icon: Wallet,
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-50',
    },
    {
        id: 'act-004',
        type: 'onboarded',
        actor: 'Procurement',
        actorRole: 'Procurement',
        action: 'generated LPO for',
        target: 'OMS-2026-0835',
        time: '1h ago',
        icon: UserCheck,
        iconColor: 'text-emerald-600',
        iconBg: 'bg-emerald-50',
    },
    {
        id: 'act-005',
        type: 'sla-risk',
        actor: 'System',
        actorRole: 'OMS',
        action: 'SLA breach warning triggered —',
        target: 'OMS-2026-0831',
        time: '2h ago',
        icon: AlertTriangle,
        iconColor: 'text-red-600',
        iconBg: 'bg-red-50',
    },
    {
        id: 'act-006',
        type: 'created',
        actor: 'Noura Al-Ketbi',
        actorRole: 'Requestor',
        action: 'created new requisition',
        target: 'OMS-2026-0852',
        time: '3h ago',
        icon: FileText,
        iconColor: 'text-[hsl(214,67%,32%)]',
        iconBg: 'bg-blue-50',
    },
    {
        id: 'act-007',
        type: 'terminated',
        actor: 'Ahmed Al-Dhaheri',
        actorRole: 'HOD',
        action: 'approved termination for',
        target: 'OMS-2026-0798',
        time: '5h ago',
        icon: XCircle,
        iconColor: 'text-red-600',
        iconBg: 'bg-red-50',
    },
    {
        id: 'act-008',
        type: 'renewal',
        actor: 'Sara Al-Mazrouei',
        actorRole: 'Line Mgr',
        action: 'initiated contract renewal for',
        target: 'OMS-2026-0776',
        time: '6h ago',
        icon: RefreshCw,
        iconColor: 'text-sky-600',
        iconBg: 'bg-sky-50',
    },
];

export default function ActivityFeed() {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between mb-0 pb-2">
                <div>
                    <CardTitle className="text-base font-semibold text-slate-900 border-none">Activity Feed</CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-0.5">System-wide · Immutable audit log</CardDescription>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mt-1.5" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-0">
                <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin">
                {activities?.map((act) => {
                    const Icon = act?.icon;
                    return (
                        <div key={act?.id} className="flex gap-2.5">
                            <div className={`w-7 h-7 rounded-full ${act?.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                                <Icon size={13} className={act?.iconColor} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-slate-700 leading-snug">
                                    <span className="font-semibold">{act?.actor}</span>
                                    <span className="text-slate-400 text-[10px] ml-1">({act?.actorRole})</span>
                                    {' '}{act?.action}{' '}
                                    <span className="font-mono font-semibold text-[hsl(214,67%,32%)]">{act?.target}</span>
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{act?.time}</p>
                            </div>
                        </div>
                )
            })}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100">
                    <Button variant="link" className="text-xs text-[hsl(214,67%,32%)] font-semibold p-0 h-auto">
                        View full audit log →
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}