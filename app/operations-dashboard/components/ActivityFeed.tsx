'use client';

import React from 'react';
import {
    FileText,
    CheckCircle2,
    Users,
    Wallet,
    RefreshCw,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
    id: string;
    actor: string;
    role: string;
    action: string;
    target: string;
    timestamp: string;
    type: string;
}

interface ActivityFeedProps {
    activities: ActivityItem[];
}

const actionConfig: Record<string, { icon: React.ElementType, color: string, bg: string }> = {
    'STAGE_ADVANCED': { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    'CREATED': { icon: FileText, color: 'text-[hsl(214,67%,32%)]', bg: 'bg-blue-50' },
    'REJECTED': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    'BUDGET_AMENDMENT': { icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
    'DEFAULT': { icon: RefreshCw, color: 'text-slate-600', bg: 'bg-slate-50' }
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
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
                <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin max-h-[400px]">
                {activities.length === 0 ? (
                    <div className="py-8 text-center italic text-slate-400 text-xs">No recent activity</div>
                ) : (
                    activities.map((act) => {
                        const config = actionConfig[act.type] || actionConfig.DEFAULT;
                        const Icon = config.icon;
                        return (
                            <div key={act.id} className="flex gap-2.5">
                                <div className={`w-7 h-7 rounded-full ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                    <Icon size={13} className={config.color} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-slate-700 leading-snug">
                                        <span className="font-semibold">{act.actor}</span>
                                        <span className="text-slate-400 text-[10px] ml-1">({act.role})</span>
                                        {' '}{act.action}{' '}
                                        <span className="font-mono font-semibold text-[hsl(214,67%,32%)]">{act.target}</span>
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        {formatDistanceToNow(new Date(act.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
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