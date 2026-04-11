import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardHeader from './components/DashboardHeader';
import MetricsBentoGrid from './components/MetricsBentoGrid';
import PipelineChart from './components/PipelineChart';
import BudgetUtilizationChart from './components/BudgetUtilizationChart';
import PendingApprovalsPanel from './components/PendingApprovalsPanel';
import ActivityFeed from './components/ActivityFeed';
import EmiratesCompliancePanel from './components/EmiratesCompliancePanel';

export default function OperationsDashboardPage() {
    return (
        <AppLayout>
            <div className="max-w-screen-2xl mx-auto space-y-6">
                <DashboardHeader />
                <MetricsBentoGrid />

                {/* Charts Row */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                    <div className="xl:col-span-3">
                        <PipelineChart />
                    </div>
                    <div className="xl:col-span-2">
                        <BudgetUtilizationChart />
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                    <div className="xl:col-span-2">
                        <EmiratesCompliancePanel />
                    </div>
                    <div className="xl:col-span-2">
                        <PendingApprovalsPanel />
                    </div>
                    <div className="xl:col-span-1">
                        <ActivityFeed />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}