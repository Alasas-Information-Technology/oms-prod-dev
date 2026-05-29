'use client';

import React, { useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import RequisitionHeader from './components/RequisitionHeader';
import RequisitionFilters from './components/RequisitionFilters';
import RequisitionTable from './components/RequisitionTable';

export interface FilterState {
    stages: string[];
    departments: string[];
    locations: string[];
    budgetType: string[];
    dateRange: string;
}

export default function RequisitionManagementPage() {
    const [refreshKey, setRefreshKey] = useState(0);
    const tableRef = useRef<{ exportData: () => void }>(null);
    const [filters, setFilters] = useState<FilterState>({
        stages: [],
        departments: [],
        locations: [],
        budgetType: [],
        dateRange: '',
    });

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleExport = () => {
        tableRef.current?.exportData();
    };

    return (
        <AppLayout>
            <div className=" mx-auto space-y-5">
                <RequisitionHeader
                    onSuccess={handleRefresh}
                    onExport={handleExport}
                />
                <div className="flex gap-5 items-start">
                    <RequisitionFilters filters={filters} setFilters={setFilters} />
                    <div className="flex-1 min-w-0">
                        <RequisitionTable
                            ref={tableRef}
                            refreshTrigger={refreshKey}
                            filters={filters}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}