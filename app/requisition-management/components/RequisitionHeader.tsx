'use client';

import React, { useState } from 'react';
import { Plus, Download, Upload, BarChart3, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NewRequisitionModal from './NewRequisitionModal';
import { Button } from '@/components/ui/button';

interface RequisitionHeaderProps {
    onSuccess?: () => void;
    onExport?: () => void;
}

export default function RequisitionHeader({ onSuccess, onExport }: RequisitionHeaderProps) {
    const [showNewModal, setShowNewModal] = useState(false);
    const { currentUser } = useAuth();
    const router = useRouter();
    const roleForView = currentUser?.roles?.role_name || 'Guest';

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0C66E4] flex items-center gap-3 tracking-tight">
                        Manpower Requisitions
                        <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                            ROLE: {roleForView}
                        </span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5 font-medium">
                        Agile Lifecycle Management · 5-stage real-time governance for outsourced talent
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
                    <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onExport}
                            className="text-slate-600 hover:text-[hsl(214,67%,32%)] hover:bg-slate-50 gap-1.5"
                        >
                            <Download size={14} />
                            Export
                        </Button>
                    </div>

                    <div className="h-4 w-[1px] bg-slate-200 mx-1" />
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push('/operations-dashboard')}
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