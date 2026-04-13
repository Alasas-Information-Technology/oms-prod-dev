'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { X, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { requisitionService } from '@/lib/services/requisitionService';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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
    onSuccess?: () => void;
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

export default function NewRequisitionModal({ onClose, onSuccess }: NewRequisitionModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const { currentUser } = useAuth();

    const {
        register,
        handleSubmit,
        watch,
        control,
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
        if (!currentUser) {
            toast.error('You must be logged in to create a requisition');
            return;
        }

        setSubmitting(true);
        try {
            await requisitionService.createRequisition({
                ...data,
                requestorId: currentUser.id
            });
            
            toast.success('Requisition generated and workflow initiated');
            
            if (onSuccess) {
                onSuccess();
            }
            
            onClose();
        } catch (error) {
            toast.error('Failed to create requisition. Please check your permissions.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-modal">
                <DialogHeader className="px-6 py-4 border-b border-slate-200 shrink-0">
                    <DialogTitle className="text-xl font-bold text-slate-900 border-none">New Requisition</DialogTitle>
                    <DialogDescription className="text-sm text-slate-500 mt-1">Complete the enterprise resourcing form</DialogDescription>
                </DialogHeader>

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
                                    <Input
                                        type="text"
                                        placeholder="e.g. Cloud Architect"
                                        className={`${errors.positionTitle ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        {...register('positionTitle', { required: 'Position Title is required' })}
                                    />
                                    {errors.positionTitle && <p className="text-red-600 text-xs mt-1">{errors.positionTitle.message}</p>}
                                </div>

                                <div>
                                    <Label className="label">Department <span className="text-red-500">*</span></Label>
                                    <Controller
                                        name="department"
                                        control={control}
                                        rules={{ required: 'Department is required' }}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className={`w-full ${errors.department ? 'border-red-500' : ''}`}>
                                                    <SelectValue placeholder="Select a department..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departments.map(dept => (
                                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.department && <p className="text-red-600 text-xs mt-1">{errors.department.message}</p>}
                                </div>

                                <div>
                                    <Label className="label">Target Start Date <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="date"
                                        className={`${errors.targetStartDate ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        {...register('targetStartDate', { required: 'Target Start Date is required' })}
                                    />
                                    {errors.targetStartDate && <p className="text-red-600 text-xs mt-1">{errors.targetStartDate.message}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <Label className="label mb-3">Work Location <span className="text-red-500">*</span></Label>
                                    <Controller
                                        name="workLocation"
                                        control={control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex gap-6 mt-1"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Onshore (UAE)" id="onshore" />
                                                    <Label htmlFor="onshore" className="cursor-pointer">Onshore (UAE)</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Offshore (Remote)" id="offshore" />
                                                    <Label htmlFor="offshore" className="cursor-pointer">Offshore (Remote)</Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Hardware & Infrastructure Requirements */}
                        <section className="space-y-5">
                            <h3 className="text-sm font-bold tracking-wider text-[hsl(214,67%,32%)] uppercase border-b border-slate-100 pb-2">
                                Section 2: Hardware & Infrastructure Requirements
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Controller
                                    name="reqLaptop"
                                    control={control}
                                    render={({ field }) => (
                                        <label 
                                            className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                                        >
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Corporate Laptop</p>
                                                <p className="text-xs text-slate-500">Standard IT provisioned device</p>
                                            </div>
                                        </label>
                                    )}
                                />
                                
                                <Controller
                                    name="reqMobilePhone"
                                    control={control}
                                    render={({ field }) => (
                                        <label 
                                            className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                                        >
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Mobile Phone</p>
                                                <p className="text-xs text-slate-500">Requires line manager approval</p>
                                            </div>
                                        </label>
                                    )}
                                />
                                
                                <Controller
                                    name="reqEmailAccess"
                                    control={control}
                                    render={({ field }) => (
                                        <label 
                                            className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                                        >
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Enterprise Email Access</p>
                                                <p className="text-xs text-slate-500">Provided via Active Directory</p>
                                            </div>
                                        </label>
                                    )}
                                />

                                <Controller
                                    name="reqSoftwareLicenses"
                                    control={control}
                                    render={({ field }) => (
                                        <label 
                                            className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                                        >
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Specialized Software Licenses</p>
                                                <p className="text-xs text-slate-500">e.g. Adobe CC, GitHub, Oracle</p>
                                            </div>
                                        </label>
                                    )}
                                />
                            </div>

                            {workLocation === 'Onshore (UAE)' && (
                                <div className="mt-4 animate-fade-in">
                                    <Label className="label">Office Seating Accommodations <span className="text-red-500">*</span></Label>
                                    <p className="text-xs text-slate-500 mb-2">Required since location is Onshore. Describe desk placement or facility needs.</p>
                                    <textarea
                                        rows={3}
                                        placeholder="e.g. Requires a dual-monitor setup on the 3rd floor..."
                                        className={`input-field resize-none block w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(214,67%,32%)]/20 ${errors.officeSeating ? 'border-red-500' : ''}`}
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
                                    <Label className="label">Funding Type <span className="text-red-500">*</span></Label>
                                    <Controller
                                        name="fundingType"
                                        control={control}
                                        rules={{ required: 'Funding Type is required' }}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className={`w-full ${errors.fundingType ? 'border-red-500' : ''}`}>
                                                    <SelectValue placeholder="Select funding classification..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {fundingTypes.map(type => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.fundingType && <p className="text-red-600 text-xs mt-1">{errors.fundingType.message}</p>}
                                </div>

                                <div>
                                    <Label className="label">Reserved Budget (AED) <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">AED</span>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            className={`pl-12 ${errors.reservedBudget ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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

                <DialogFooter className="px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="new-req-form"
                        className="bg-[hsl(214,67%,32%)] hover:bg-[hsl(214,67%,28%)] text-white min-w-[200px]"
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
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}