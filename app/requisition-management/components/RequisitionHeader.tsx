'use client';

import React, { useState } from 'react';
import { Plus, Download, Upload, BarChart3, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import NewRequisitionModal from './NewRequisitionModal';
import { Button } from '@/components/ui/button';

interface RequisitionHeaderProps {
    onSuccess?: () => void;
}

export default function RequisitionHeader({ onSuccess }: RequisitionHeaderProps) {
    const [showNewModal, setShowNewModal] = useState(false);
    const { currentUser } = useAuth();
    const roleForView = currentUser?.roles?.role_name || 'Guest';

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        Requisition Management
                        <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 shadow-sm">
                            ROLE VIEW: {roleForView}
                        </span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        14-step OMS workflow · All active and historical outsource requisitions
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast?.info('Refreshing requisition data…')}
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toast?.info('Generating Excel export…')}
                    >
                        <Download size={14} />
                        Export
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toast?.info('Opening bulk import…')}
                    >
                        <Upload size={14} />
                        Import
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toast?.info('Opening analytics view…')}
                    >
                        <BarChart3 size={14} />
                        Analytics
                    </Button>
                    {['DEPT_REQUESTOR', 'HR_ADMIN', 'SYSTEM_ADMIN'].includes(roleForView) && (
                        <Button
                            size="sm"
                            onClick={() => setShowNewModal(true)}
                        >
                            <Plus size={14} />
                            New Requisition
                        </Button>
                    )}
                </div>
            </div>
            {showNewModal && (
                <NewRequisitionModal 
                    onClose={() => setShowNewModal(false)} 
                    onSuccess={onSuccess}
                />
            )}
        </>
    );
}