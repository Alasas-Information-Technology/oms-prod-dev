import React from 'react';
import AppLayout from '@/components/AppLayout';
import RequisitionHeader from './components/RequisitionHeader';
import RequisitionFilters from './components/RequisitionFilters';
import RequisitionTable from './components/RequisitionTable';

export default function RequisitionManagementPage() {
    return (
        <AppLayout>
            <div className="max-w-screen-2xl mx-auto space-y-5">
                <RequisitionHeader />
                <div className="flex gap-5 items-start">
                    <RequisitionFilters />
                    <div className="flex-1 min-w-0">
                        <RequisitionTable />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}