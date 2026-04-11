'use client';

import React, { useState } from 'react';
import { Plus, Download, Upload, BarChart3, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import NewRequisitionModal from './NewRequisitionModal';

export default function RequisitionHeader() {
    const [showNewModal, setShowNewModal] = useState(false);

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Requisition Management</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        14-step OMS workflow · All active and historical outsource requisitions
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className="btn-ghost text-xs px-3 py-2"
                        onClick={() => toast?.info('Refreshing requisition data…')}
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                    <button
                        className="btn-secondary text-xs px-3 py-2"
                        onClick={() => toast?.info('Generating Excel export…')}
                    >
                        <Download size={14} />
                        Export
                    </button>
                    <button
                        className="btn-secondary text-xs px-3 py-2"
                        onClick={() => toast?.info('Opening bulk import…')}
                    >
                        <Upload size={14} />
                        Import
                    </button>
                    <button
                        className="btn-secondary text-xs px-3 py-2"
                        onClick={() => toast?.info('Opening analytics view…')}
                    >
                        <BarChart3 size={14} />
                        Analytics
                    </button>
                    <button
                        className="btn-primary text-xs px-4 py-2"
                        onClick={() => setShowNewModal(true)}
                    >
                        <Plus size={14} />
                        New Requisition
                    </button>
                </div>
            </div>
            {showNewModal && <NewRequisitionModal onClose={() => setShowNewModal(false)} />}
        </>
    );
}