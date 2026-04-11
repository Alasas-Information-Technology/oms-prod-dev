'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { X, Loader2, Info } from 'lucide-react';

interface NewRequisitionFormValues {
    positionTitle: string;
    department: string;
    targetStartDate: string;
    workLocation: 'Onshore (UAE)' | 'Offshore (Remote)';
    reqLaptop: boolean;
    reqMobilePhone: boolean;
    reqEmailAccess: boolean;
    reqSoftwareLicenses: boolean;
    officeSeating: string;
    fundingType: 'Budgeted' | 'Unallocated' | 'Unbudgeted' | '';
    reservedBudget: number | '';
}

interface NewRequisitionModalProps {
    onClose: () => void;
}

const departments = [
    'Information Technology',
    'Finance',
    'Operations',
    'Human Resources',
    'Legal Affairs',
    'Administration',
    'Logistics',
    'Procurement',
];

const fundingTypes = ['Budgeted', 'Unallocated', 'Unbudgeted'];

export default function NewRequisitionModal({ onClose }: NewRequisitionModalProps) {
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<NewRequisitionFormValues>({
        defaultValues: {
            workLocation: 'Onshore (UAE)',
            reqLaptop: false,
            reqMobilePhone: false,
            reqEmailAccess: false,
            reqSoftwareLicenses: false,
            fundingType: '',
        },
    });

    const workLocation = watch('workLocation');

    const onSubmit = async (data: NewRequisitionFormValues) => {
        setSubmitting(true);
        // Simulate API interaction
        await new Promise((res) => setTimeout(res, 1200));
        setSubmitting(false);

        toast.success('Requisition generated and funds conditionally reserved');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-modal flex flex-col max-h-[90vh] animate-slide-up">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">New Requisition</h2>
                        <p className="text-sm text-slate-500 mt-1">Complete the enterprise resourcing form</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body / Scrollable Form */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    <form id="new-req-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        
                        {/* Section 1: Job Specification */}
                        <section className="space-y-5">
                            <h3 className="text-sm font-bold tracking-wider text-[hsl(214,67%,32%)] uppercase border-b border-slate-100 pb-2">
                                Section 1: Job Specification
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="label">Position Title <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Cloud Architect"
                                        className={`input-field ${errors.positionTitle ? 'input-error' : ''}`}
                                        {...register('positionTitle', { required: 'Position Title is required' })}
                                    />
                                    {errors.positionTitle && <p className="text-red-600 text-xs mt-1">{errors.positionTitle.message}</p>}
                                </div>

                                <div>
                                    <label className="label">Department <span className="text-red-500">*</span></label>
                                    <select
                                        className={`input-field ${errors.department ? 'input-error' : ''}`}
                                        {...register('department', { required: 'Department is required' })}
                                    >
                                        <option value="">Select a department...</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                    {errors.department && <p className="text-red-600 text-xs mt-1">{errors.department.message}</p>}
                                </div>

                                <div>
                                    <label className="label">Target Start Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        className={`input-field ${errors.targetStartDate ? 'input-error' : ''}`}
                                        {...register('targetStartDate', { required: 'Target Start Date is required' })}
                                    />
                                    {errors.targetStartDate && <p className="text-red-600 text-xs mt-1">{errors.targetStartDate.message}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="label mb-3">Work Location <span className="text-red-500">*</span></label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="Onshore (UAE)"
                                                className="w-4 h-4 text-[hsl(214,67%,32%)]"
                                                {...register('workLocation')}
                                            />
                                            <span className="text-sm font-medium text-slate-700">Onshore (UAE)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="Offshore (Remote)"
                                                className="w-4 h-4 text-[hsl(214,67%,32%)]"
                                                {...register('workLocation')}
                                            />
                                            <span className="text-sm font-medium text-slate-700">Offshore (Remote)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Hardware & Infrastructure Requirements */}
                        <section className="space-y-5">
                            <h3 className="text-sm font-bold tracking-wider text-[hsl(214,67%,32%)] uppercase border-b border-slate-100 pb-2">
                                Section 2: Hardware & Infrastructure Requirements
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                    <input type="checkbox" className="mt-1 w-4 h-4 text-[hsl(214,67%,32%)] rounded" {...register('reqLaptop')} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Corporate Laptop</p>
                                        <p className="text-xs text-slate-500">Standard IT provisioned device</p>
                                    </div>
                                </label>
                                
                                <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                    <input type="checkbox" className="mt-1 w-4 h-4 text-[hsl(214,67%,32%)] rounded" {...register('reqMobilePhone')} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Mobile Phone</p>
                                        <p className="text-xs text-slate-500">Requires line manager approval</p>
                                    </div>
                                </label>
                                
                                <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                    <input type="checkbox" className="mt-1 w-4 h-4 text-[hsl(214,67%,32%)] rounded" {...register('reqEmailAccess')} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Enterprise Email Access</p>
                                        <p className="text-xs text-slate-500">Provided via Active Directory</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                    <input type="checkbox" className="mt-1 w-4 h-4 text-[hsl(214,67%,32%)] rounded" {...register('reqSoftwareLicenses')} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Specialized Software Licenses</p>
                                        <p className="text-xs text-slate-500">e.g. Adobe CC, GitHub, Oracle</p>
                                    </div>
                                </label>
                            </div>

                            {workLocation === 'Onshore (UAE)' && (
                                <div className="mt-4 animate-fade-in">
                                    <label className="label">Office Seating Accommodations <span className="text-red-500">*</span></label>
                                    <p className="text-xs text-slate-500 mb-2">Required since location is Onshore. Describe desk placement or facility needs.</p>
                                    <textarea
                                        rows={3}
                                        placeholder="e.g. Requires a dual-monitor setup on the 3rd floor..."
                                        className={`input-field resize-none ${errors.officeSeating ? 'input-error' : ''}`}
                                        {...register('officeSeating', { required: 'Seating Accommodations required for Onshore personnel' })}
                                    />
                                    {errors.officeSeating && <p className="text-red-600 text-xs mt-1">{errors.officeSeating.message}</p>}
                                </div>
                            )}
                        </section>

                        {/* Section 3: Financial Categorization & Budget Reservation */}
                        <section className="space-y-5">
                            <h3 className="text-sm font-bold tracking-wider text-[hsl(214,67%,32%)] uppercase border-b border-slate-100 pb-2">
                                Section 3: Financial Categorization & Budget Reservation
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="label">Funding Type <span className="text-red-500">*</span></label>
                                    <select
                                        className={`input-field ${errors.fundingType ? 'input-error' : ''}`}
                                        {...register('fundingType', { required: 'Funding Type is required' })}
                                    >
                                        <option value="">Select funding classification...</option>
                                        {fundingTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {errors.fundingType && <p className="text-red-600 text-xs mt-1">{errors.fundingType.message}</p>}
                                </div>

                                <div>
                                    <label className="label">Reserved Budget (AED) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">AED</span>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className={`input-field pl-12 ${errors.reservedBudget ? 'input-error' : ''}`}
                                            {...register('reservedBudget', { 
                                                required: 'Budget amount is required',
                                                min: { value: 1, message: 'Must be greater than 0' } 
                                            })}
                                        />
                                    </div>
                                    {errors.reservedBudget && <p className="text-red-600 text-xs mt-1">{errors.reservedBudget.message}</p>}
                                </div>
                            </div>
                        </section>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-ghost font-medium text-slate-600 hover:bg-slate-200"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="new-req-form"
                        className="btn-primary min-w-[200px]"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            'Submit for HR Approval'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}