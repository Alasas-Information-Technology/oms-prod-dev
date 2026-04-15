'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardHeader from './components/DashboardHeader';
import MetricsBentoGrid from './components/MetricsBentoGrid';
import PipelineChart from './components/PipelineChart';
import BudgetUtilizationChart from './components/BudgetUtilizationChart';
import PendingApprovalsPanel from './components/PendingApprovalsPanel';
import ActivityFeed from './components/ActivityFeed';
import EmiratesCompliancePanel from './components/EmiratesCompliancePanel';
import { dashboardService } from '@/lib/services/dashboardService';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function OperationsDashboardPage() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [pipeline, setPipeline] = useState<any[]>([]);
    const [budget, setBudget] = useState<any[]>([]);
    const [activity, setActivity] = useState<any[]>([]);
    const [approvals, setApprovals] = useState<any[]>([]);

    useEffect(() => {
        if (currentUser) {
            loadDashboardData();
        }
    }, [currentUser]);

    const loadDashboardData = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const [s, p, b, a, app] = await Promise.all([
                dashboardService.getDashboardStats(currentUser),
                dashboardService.getPipelineData(currentUser),
                dashboardService.getBudgetByDepartment(currentUser),
                dashboardService.getRecentActivity(currentUser, 10),
                dashboardService.getPendingApprovals(currentUser)
            ]);

            setStats(s);
            setPipeline(p);
            setBudget(b);
            setActivity(a);
            setApprovals(app);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-screen-2xl mx-auto space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <Skeleton className="h-32 col-span-2" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </div>
                     <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                        <Skeleton className="xl:col-span-3 h-[300px]" />
                        <Skeleton className="xl:col-span-2 h-[300px]" />
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-screen-2xl mx-auto space-y-6 pb-20">
                <DashboardHeader 
                    onRefresh={loadDashboardData} 
                    refreshing={loading} 
                />
                
                {stats && <MetricsBentoGrid stats={stats} />}

                {/* Charts Row */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                    <div className="xl:col-span-3">
                        <PipelineChart data={pipeline} />
                    </div>
                    <div className="xl:col-span-2">
                        <BudgetUtilizationChart data={budget} />
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                    <div className="xl:col-span-2">
                        <EmiratesCompliancePanel />
                    </div>
                    <div className="xl:col-span-2">
                        <PendingApprovalsPanel items={approvals} />
                    </div>
                    <div className="xl:col-span-1">
                        <ActivityFeed activities={activity} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}