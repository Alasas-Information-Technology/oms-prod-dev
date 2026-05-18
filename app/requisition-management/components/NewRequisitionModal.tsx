'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { requisitionService } from '@/lib/services/requisitionService';
import { 
    X, 
    Loader2 
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ComprehensiveRequisitionForm, { 
    RequisitionFormValues, 
    RequisitionRecord 
} from './ComprehensiveRequisitionForm';

interface NewRequisitionModalProps {
    requisition?: RequisitionRecord; 
    onClose: () => void;
    onSuccess?: () => void;
}

export default function NewRequisitionModal({ requisition, onClose, onSuccess }: NewRequisitionModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const { currentUser } = useAuth();
    const isEditMode = !!requisition;

    const handleSubmit = async (data: RequisitionFormValues) => {
        if (!currentUser) return;
        setSubmitting(true);
        try {
            if (isEditMode && requisition) {
                await requisitionService.updateRequisition(requisition.id, data);
                toast.success(data.isDraft ? 'Draft updated successfully' : 'Requisition updated successfully');
            } else {
                await requisitionService.createRequisition(data, currentUser);
                toast.success(data.isDraft ? 'Draft saved successfully' : 'Requisition initiated successfully');
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Submission error:', err);
            toast.error('Failed to process requisition. Please check connection.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-7xl w-full h-[95vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl bg-white rounded-3xl">
                
                {/* --- Modal Header --- */}
                <div className="bg-white px-8 pt-8 pb-4 border-b border-n40 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="bg-[#0C66E4] text-white text-[10px] font-black px-2 py-0.5 rounded tracking-widest">STEP 1</span>
                                <DialogTitle className="text-2xl font-black tracking-tight text-[#172B4D]">
                                    {isEditMode ? 'Modify Requisition' : 'New Manpower Requisition'}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-slate-500 font-bold text-sm">
                                Complete all required fields to initiate the agile resourcing workflow.
                            </DialogDescription>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* --- Form Content (Scrollable) --- */}
                <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin">
                    <div className="max-w-5xl mx-auto">
                        <ComprehensiveRequisitionForm 
                            onCancel={onClose}
                            onSubmit={handleSubmit}
                            submitting={submitting}
                            initialData={requisition}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}