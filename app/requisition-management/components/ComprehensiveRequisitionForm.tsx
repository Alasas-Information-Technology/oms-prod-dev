'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { financeService } from '@/lib/services/financeService';
import { profileService } from '@/lib/services/profileService';
import { cn } from '@/lib/utils';
import {
    AlertTriangle,
    Briefcase,
    Check,
    Paperclip,
    Star,
    Truck,
    Users,
    Wallet
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    department_id: string | null;
    role_id: string;
    nationality: string | null;
}

interface BudgetLine {
    id: string;
    name: string;
}

interface BudgetSummary {
    total: number;
    consumed: number;
    reserved: number;
    available: number;
}

export interface RequisitionFormValues {
    positionTitle: string;
    numResources: number;
    jobProfile: string;
    justification: string;
    reportingLineManagerId: string;
    workCompletionAssigneeIds: string[];
    interviewerIds: string[];
    mainInterviewerId: string;
    engagementPeriod: number;
    engagementUnit: 'Days' | 'Months';
    expectedStartDate: string;
    expectedEndDate: string;
    softwareHardwareRequirements: string[];
    workLocation: 'Onshore' | 'Offshore';
    seatingAvailable: 'Yes' | 'No';
    seatingLocation: string;
    accommodationPlan: string;
    budgetAmount: number;
    salaryGrade: string;
    fundingCategory: 'BUDGETED' | 'UNALLOCATED' | 'UNBUDGETED';
    budgetLineIds: string[];
    isDraft: boolean;
    jobDescription?: FileList;
    supportingFiles?: FileList;
    additionalFiles?: FileList;
    jobDescriptionPath?: string;
    supportingAttachments?: string[];
    additionalAttachments?: string[];
}

export interface RequisitionRecord {
    id: string;
    req_number: string;
    position_title: string;
    num_resources: number;
    job_profile: string;
    justification: string;
    reporting_line_manager_id: string;
    work_completion_assignee_ids: string[];
    interviewer_ids: string[];
    main_interviewer_id: string;
    engagement_period: number;
    engagement_unit: 'Days' | 'Months';
    target_start_date: string;
    expected_end_date: string;
    software_hardware_requirements: string[];
    work_location: 'Onshore' | 'Offshore';
    seating_available: boolean;
    seating_location: string;
    accommodation_plan: string;
    reserved_budget_aed: number;
    salary_grade: string;
    funding_category: 'BUDGETED' | 'UNALLOCATED' | 'UNBUDGETED';
    budget_line_ids: string[];
    job_description_path: string;
    supporting_attachments: string[];
    additional_attachments: string[];
    is_active?: boolean;
    created_at?: string;
    
    // Joined relations
    requestor?: { full_name: string };
    manager?: { full_name: string };
    interviewer?: { full_name: string };
    workflow_stages?: { stage_name: string; required_role_id: number };
    departments?: { dept_name: string };
}

interface ComprehensiveRequisitionFormProps {
    onCancel: () => void;
    onSubmit: (data: RequisitionFormValues) => Promise<void>;
    submitting: boolean;
    initialData?: RequisitionRecord;
}

export default function ComprehensiveRequisitionForm({ onCancel, onSubmit, submitting, initialData }: ComprehensiveRequisitionFormProps) {
    const { currentUser } = useAuth();

    // --- Data Fetching State ---
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);
    const [loadingProfiles, setLoadingProfiles] = useState(true);
    const [loadingBudgets, setLoadingBudgets] = useState(false);

    // --- Form Setup ---
    const {
        register,
        handleSubmit,
        watch,
        control,
        setValue,
        getValues,
        reset,
        formState: { errors },
    } = useForm<RequisitionFormValues>({
        defaultValues: {
            positionTitle: '',
            numResources: 1,
            jobProfile: '',
            justification: '',
            reportingLineManagerId: '',
            engagementPeriod: 1,
            engagementUnit: 'Months',
            workLocation: 'Onshore',
            fundingCategory: 'BUDGETED',
            softwareHardwareRequirements: [],
            seatingAvailable: 'Yes',
            isDraft: false,
            interviewerIds: [],
            workCompletionAssigneeIds: [],
            budgetLineIds: [],
            budgetAmount: 0,
            salaryGrade: ''
        }
    });

    // --- Watchers for Conditional Logic ---
    const selectedWorkLocation = watch('workLocation');
    const seatingAvailable = watch('seatingAvailable');
    const fundingCategory = watch('fundingCategory');
    const selectedInterviewers = watch('interviewerIds') || [];
    const mainInterviewerId = watch('mainInterviewerId');

    // --- Pre-populate Form in Edit Mode ---
    useEffect(() => {
        if (initialData) {
            // Map Snake Case DB fields to Camel Case Form fields
            reset({
                positionTitle: initialData.position_title || '',
                numResources: initialData.num_resources || 1,
                jobProfile: initialData.job_profile || '',
                justification: initialData.justification || '',
                reportingLineManagerId: initialData.reporting_line_manager_id || '',
                workCompletionAssigneeIds: initialData.work_completion_assignee_ids || [],
                interviewerIds: initialData.interviewer_ids || [],
                mainInterviewerId: initialData.main_interviewer_id || '',
                engagementPeriod: initialData.engagement_period || 0,
                engagementUnit: initialData.engagement_unit || 'Months',
                expectedStartDate: initialData.target_start_date || '',
                expectedEndDate: initialData.expected_end_date || '',
                softwareHardwareRequirements: initialData.software_hardware_requirements || [],
                workLocation: (initialData.work_location as 'Onshore' | 'Offshore') || 'Onshore',
                seatingAvailable: initialData.seating_available === true ? 'Yes' : 'No',
                seatingLocation: initialData.seating_location || '',
                accommodationPlan: initialData.accommodation_plan || '',
                budgetAmount: initialData.reserved_budget_aed || 0,
                salaryGrade: initialData.salary_grade || '',
                fundingCategory: (initialData.funding_category as any) || 'BUDGETED',
                budgetLineIds: initialData.budget_line_ids || [],
                jobDescriptionPath: initialData.job_description_path || '',
                supportingAttachments: initialData.supporting_attachments || [],
                additionalAttachments: initialData.additional_attachments || []
            });
        }
    }, [initialData, reset]);

    // --- UX: Auto-select Main Interviewer if only one ---
    useEffect(() => {
        const interviewers = watch('interviewerIds') || [];
        if (interviewers.length === 1 && !watch('mainInterviewerId')) {
            setValue('mainInterviewerId', interviewers[0]);
        }
    }, [watch('interviewerIds'), setValue]);

    // --- Fetch Data ---
    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                const users = await profileService.getUsers(currentUser);
                setProfiles(users);
            } catch (error) {
                console.error('Failed to fetch profiles:', error);
            } finally {
                setLoadingProfiles(false);
            }
        };
        fetchData();
    }, [currentUser]);

    useEffect(() => {
        const fetchBudgets = async () => {
            const fundingCategory = watch('fundingCategory');
            
            if (!currentUser?.department_id || (fundingCategory !== 'BUDGETED' && fundingCategory !== 'UNALLOCATED')) {
                setBudgetLines([
                    { id: 'B-001', name: 'IT Infrastructure FY2026' },
                    { id: 'B-002', name: 'Software Development FY2026' }
                ]);
                setLoadingBudgets(false);
                return;
            }
            setLoadingBudgets(true);
            try {
                const budgets = await financeService.getDepartmentBudget(currentUser.department_id) as BudgetSummary | null;
                // Mocking lines for now as they are not currently in the DB schema
                setBudgetLines([
                    { id: 'B-001', name: 'IT Infrastructure FY2026' },
                    { id: 'B-002', name: 'Software Development FY2026' }
                ]);
            } catch (error) {
                console.error('Non-critical: Failed to fetch budget lines (likely unauthorized):', error);
                // Fallback to empty for non-finance roles
                setBudgetLines([]);
            } finally {
                setLoadingBudgets(false);
            }
        };
        fetchBudgets();
    }, [currentUser, fundingCategory]);

    // --- Helper: Get Profile Name ---
    const getProfileName = (id: string) => profiles.find((p: Profile) => p.id === id)?.full_name || id;

    // --- Submission Handlers ---
    const handleActualSubmit = (data: RequisitionFormValues) => {
        // Validation checks for non-register managed fields
        const assignees = getValues('workCompletionAssigneeIds') || [];
        const interviewers = getValues('interviewerIds') || [];

        if (assignees.length === 0) {
            toast.error('Please select at least one Work Completion Assignee');
            return;
        }
        if (interviewers.length === 0) {
            toast.error('Please select at least one Interviewer');
            return;
        }
        if (interviewers.length > 0 && !getValues('mainInterviewerId')) {
            toast.error('Please designate a Main Interviewer');
            return;
        }

        onSubmit({ ...data, isDraft: false });
    };

    const handleSaveDraft = () => {
        toast.warning('Drafts not submitted within 60 days will be automatically deleted.', {
            duration: 5000,
        });
        const data = watch();
        onSubmit({ ...data, isDraft: true });
    };

    return (
        <form id="comprehensive-req-form" onSubmit={handleSubmit(handleActualSubmit)} className="space-y-8 animate-in fade-in duration-500 pb-20">

            {/* --- SECTION 1: GENERAL INFORMATION --- */}
            <section className="section-ads">
                <div className="flex items-center gap-2 mb-6 text-[#0C66E4]">
                    <Briefcase size={20} />
                    <h2 className="text-sm font-black uppercase tracking-widest leading-none">1. General Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 md:col-span-2">
                        <Label className="label-ads">Position Title *</Label>
                        <Input
                            {...register('positionTitle', { required: true })}
                            className="input-ads h-10 font-bold"
                            placeholder="e.g. Senior Software Engineer"
                        />
                        {errors.positionTitle && <p className="text-[10px] text-red-500 font-bold uppercase">Field is required</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="label-ads">Number of Resources Required *</Label>
                        <Input
                            type="number"
                            {...register('numResources', { required: true, min: 1 })}
                            className="input-ads h-10"
                            min={1}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="label-ads">Job Profile *</Label>
                        <Controller
                            name="jobProfile"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="input-ads h-10">
                                        <SelectValue placeholder="Select Profile..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Developer">Developer</SelectItem>
                                        <SelectItem value="Analyst">Analyst</SelectItem>
                                        <SelectItem value="Manager">Manager</SelectItem>
                                        <SelectItem value="Specialist">Specialist</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <Label className="label-ads">Justification *</Label>
                        <Textarea
                            {...register('justification', { required: true })}
                            className="input-ads min-h-[100px] resize-none font-bold"
                            placeholder="Detailed business case for this resource..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="label-ads">Job Description (Mandatory) *</Label>
                        <div className="relative group p-4 border border-dashed border-n40 rounded bg-white hover:border-[#0C66E4] transition-all cursor-pointer">
                            <input
                                type="file"
                                {...register('jobDescription', { required: !initialData })}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                <Paperclip size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-tight">Upload JD File</span>
                            </div>
                            {watch('jobDescription') && watch('jobDescription')!.length > 0 && (
                                <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                    <Check size={10} /> {watch('jobDescription')![0].name}
                                </div>
                            )}
                        </div>
                        {errors.jobDescription && <p className="text-[10px] text-red-500 font-bold uppercase">JD is required</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="label-ads">Supporting Attachments</Label>
                        <div className="relative group p-4 border border-dashed border-n40 rounded bg-white hover:border-[#0C66E4] transition-all cursor-pointer">
                            <input
                                type="file"
                                multiple
                                {...register('supportingFiles')}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                <Paperclip size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-tight">Project Docs / Approvals</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="label-ads">Additional Attachments</Label>
                        <div className="relative group p-4 border border-dashed border-n40 rounded bg-white hover:border-[#0C66E4] transition-all cursor-pointer">
                            <input
                                type="file"
                                multiple
                                {...register('additionalFiles')}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                <Paperclip size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-tight">Extra Documents</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 2: PERSONNEL & GOVERNANCE --- */}
            <section className="section-ads">
                <div className="flex items-center gap-2 mb-6 text-[#0C66E4]">
                    <Users size={20} />
                    <h2 className="text-sm font-black uppercase tracking-widest leading-none">2. Personnel & Governance</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 md:col-span-2">
                        <Label className="label-ads">Reporting Line Manager *</Label>
                        <Controller
                            name="reportingLineManagerId"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="input-ads h-10 w-full">
                                        <SelectValue placeholder="Select Manager..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {profiles.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="label-ads">Work Completion Assignee(s) *</Label>
                        <div className="p-3 border border-n40 rounded bg-white max-h-[150px] overflow-y-auto space-y-2 scrollbar-thin">
                            {profiles.map(p => (
                                <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer group">
                                    <Checkbox
                                        onCheckedChange={(checked) => {
                                            const current = getValues('workCompletionAssigneeIds') || [];
                                            if (checked) setValue('workCompletionAssigneeIds', [...current, p.id]);
                                            else setValue('workCompletionAssigneeIds', current.filter((id: string) => id !== p.id));
                                        }}
                                        checked={(watch('workCompletionAssigneeIds') || []).includes(p.id)}
                                        className="border-n40 data-[state=checked]:bg-[#0C66E4] data-[state=checked]:border-[#0C66E4]"
                                    />
                                    <span className="font-bold text-slate-700 group-hover:text-[#0C66E4] transition-colors">{p.full_name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="label-ads">Interviewers *</Label>
                        <div className="p-3 border border-n40 rounded bg-white max-h-[150px] overflow-y-auto space-y-2 scrollbar-thin">
                            {profiles.map(p => (
                                <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer group">
                                    <Checkbox
                                        onCheckedChange={(checked) => {
                                            const current = getValues('interviewerIds') || [];
                                            if (checked) setValue('interviewerIds', [...current, p.id]);
                                            else {
                                                setValue('interviewerIds', current.filter((id: string) => id !== p.id));
                                                if (mainInterviewerId === p.id) setValue('mainInterviewerId', '');
                                            }
                                        }}
                                        checked={(watch('interviewerIds') || []).includes(p.id)}
                                        className="border-n40 data-[state=checked]:bg-[#0C66E4] data-[state=checked]:border-[#0C66E4]"
                                    />
                                    <span className="font-bold text-slate-700 group-hover:text-[#0C66E4] transition-colors">{p.full_name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {selectedInterviewers.length > 0 && (
                        <div className="md:col-span-2 space-y-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100 animate-in slide-in-from-top-1 duration-300">
                            <div className="flex items-center gap-2">
                                <Star size={14} className="text-[#0C66E4] fill-[#0C66E4]" />
                                <Label className="label-ads text-[#0C66E4] mb-0">Designate Main Interviewer *</Label>
                            </div>
                            <RadioGroup className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2' value={mainInterviewerId} onValueChange={(val) => setValue('mainInterviewerId', val)}>

                                {selectedInterviewers.map((id: string) => (
                                    <label key={id} className={cn(
                                        "flex items-center gap-2 p-2.5 border rounded-md cursor-pointer transition-all",
                                        mainInterviewerId === id ? "bg-white border-[#0C66E4] shadow-sm" : "bg-transparent border-transparent hover:bg-white/50"
                                    )}>
                                        <RadioGroupItem value={id} className="border-n40 data-[state=checked]:border-[#0C66E4] data-[state=checked]:text-[#0C66E4]" />
                                        <span className="text-[11px] font-black text-slate-700">{getProfileName(id)}</span>
                                        {mainInterviewerId === id && <Check size={12} className="text-emerald-500 ml-auto" />}
                                    </label>
                                ))}
                            </RadioGroup>
                        </div>
                    )}
                </div>
            </section>

            {/* --- SECTION 3: ENGAGEMENT & LOGISTICS --- */}
            <section className="section-ads">
                <div className="flex items-center gap-2 mb-6 text-[#0C66E4]">
                    <Truck size={20} />
                    <h2 className="text-sm font-black uppercase tracking-widest leading-none">3. Engagement & Logistics</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1 space-y-1.5 w-full">
                            <Label className="label-ads w-full">Engagement Period *</Label>
                            <Input
                                type="number"
                                {...register('engagementPeriod', { required: true, min: 1 })}
                                className="input-ads h-10 font-bold"
                            />
                        </div>
                        <Controller
                            name="engagementUnit"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-1 bg-white p-1 border border-n40 rounded mb-0">
                                    <Label className={cn(
                                        "flex items-center gap-1.5 px-3 h-8 rounded text-[10px] font-black uppercase cursor-pointer transition-all",
                                        field.value === 'Days' ? "bg-[#0C66E4] text-white" : "text-slate-500 hover:bg-slate-50"
                                    )}>
                                        <RadioGroupItem value="Days" className="hidden" />
                                        Days
                                    </Label>
                                    <Label className={cn(
                                        "flex items-center gap-1.5 px-3 h-8 rounded text-[10px] font-black uppercase cursor-pointer transition-all",
                                        field.value === 'Months' ? "bg-[#0C66E4] text-white" : "text-slate-500 hover:bg-slate-50"
                                    )}>
                                        <RadioGroupItem value="Months" className="hidden" />
                                        Months
                                    </Label>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="label-ads">Expected Start *</Label>
                            <Input type="date" {...register('expectedStartDate', { required: true })} className="input-ads h-10 font-bold" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="label-ads">Expected End *</Label>
                            <Input type="date" {...register('expectedEndDate', { required: true })} className="input-ads h-10 font-bold" />
                        </div>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <Label className="label-ads">Software & Hardware Requirements</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border border-n40 rounded bg-white">
                            {['Laptop', 'External Monitor', 'Email Access', 'VPN Access', 'SaaS Subscriptions', 'Mobile Device'].map(item => (
                                <label key={item} className="flex items-center gap-2.5 text-[11px] font-bold cursor-pointer group">
                                    <Checkbox
                                        onCheckedChange={(checked) => {
                                            const current = getValues('softwareHardwareRequirements') || [];
                                            if (checked) setValue('softwareHardwareRequirements', [...current, item]);
                                            else setValue('softwareHardwareRequirements', current.filter((i: string) => i !== item));
                                        }}
                                        className="border-n40 data-[state=checked]:bg-[#0C66E4] data-[state=checked]:border-[#0C66E4]"
                                    />
                                    <span className="group-hover:text-[#0C66E4] transition-colors">{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 md:col-span-2">
                        <Label className="label-ads">Work Location *</Label>
                        <Controller
                            name="workLocation"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-3">
                                    {['Onshore', 'Offshore'].map(loc => (
                                        <Label key={loc} className={cn(
                                            "flex flex-col gap-1 p-3 border rounded cursor-pointer transition-all",
                                            field.value === loc ? "bg-white border-[#0C66E4] shadow-sm text-[#0C66E4]" : "bg-white border-n40 hover:border-slate-300"
                                        )}>
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem value={loc} className="border-n40 data-[state=checked]:border-[#0C66E4] data-[state=checked]:text-[#0C66E4]" />
                                                <span className="text-[10px] font-black uppercase tracking-tight">{loc}</span>
                                            </div>
                                        </Label>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                    </div>

                    {selectedWorkLocation === 'Onshore' && (
                        <div className="md:col-span-2 p-5 bg-slate-100/50 border border-n40 rounded-lg space-y-4 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between border-b border-n40 pb-3">
                                <Label className="label-ads mb-0">Seating Available? *</Label>
                                <Controller
                                    name="seatingAvailable"
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-6">
                                            <Label className="flex items-center gap-2 cursor-pointer group">
                                                <RadioGroupItem value="Yes" className="border-n40 data-[state=checked]:border-[#0C66E4]" />
                                                <span className="text-xs font-black uppercase group-hover:text-[#0C66E4]">Yes</span>
                                            </Label>
                                            <Label className="flex items-center gap-2 cursor-pointer group">
                                                <RadioGroupItem value="No" className="border-n40 data-[state=checked]:border-red-500" />
                                                <span className="text-xs font-black uppercase group-hover:text-red-500">No</span>
                                            </Label>
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                            {seatingAvailable === 'Yes' ? (
                                <div className="space-y-1.5 pt-1">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Planned Seating Office/Location *</Label>
                                    <Input {...register('seatingLocation', { required: selectedWorkLocation === 'Onshore' && seatingAvailable === 'Yes' })} className="input-ads h-10 font-bold" placeholder="e.g. Block C, Level 4, Desk 42" />
                                </div>
                            ) : (
                                <div className="space-y-1.5 pt-1 text-red-900 bg-red-50/50 p-3 rounded border border-red-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle size={14} className="text-red-500" />
                                        <Label className="text-[10px] font-black uppercase text-red-600 mb-0">Accommodation Plan Required *</Label>
                                    </div>
                                    <Input {...register('accommodationPlan', { required: selectedWorkLocation === 'Onshore' && seatingAvailable === 'No' })} className="input-ads border-red-200 h-10 font-bold" placeholder="Describe the plan for seating/facilities..." />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* --- SECTION 4: FINANCIALS --- */}
            <section className="section-ads">
                <div className="flex items-center gap-2 mb-6 text-[#0C66E4]">
                    <Wallet size={20} />
                    <h2 className="text-sm font-black uppercase tracking-widest leading-none">4. Financials</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                        <Label className="label-ads">Budget Amount (AED) *</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">AED</span>
                            <Input type="number" {...register('budgetAmount', { required: true })} className="input-ads h-10 pl-10 font-black tabular-nums" />
                        </div>
                        {errors.budgetAmount && <p className="text-[10px] text-red-500 font-bold uppercase">Required</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="label-ads">Salary Grade *</Label>
                        <Controller
                            name="salaryGrade"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="input-ads h-10">
                                        <SelectValue placeholder="Select Grade..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10+'].map(g => (
                                            <SelectItem key={g} value={g}>{g}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.salaryGrade && <p className="text-[10px] text-red-500 font-bold uppercase">Required</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="label-ads">Funding Category *</Label>
                        <Controller
                            name="fundingCategory"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="grid grid-cols-3 gap-1 bg-white p-1 border border-n40 rounded h-10"
                                >
                                    {[
                                        { label: 'Budgeted', value: 'BUDGETED' },
                                        { label: 'Unallocated', value: 'UNALLOCATED' },
                                        { label: 'Unbudgeted', value: 'UNBUDGETED' }
                                    ].map(cat => (
                                        <Label key={cat.value} className={cn(
                                            "flex items-center justify-center text-[9px] font-black uppercase rounded cursor-pointer transition-all h-full",
                                            field.value === cat.value ? "bg-[#0C66E4] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                                        )}>
                                            <RadioGroupItem value={cat.value} className="hidden" />
                                            {cat.label}
                                        </Label>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                    </div>

                    {(fundingCategory === 'BUDGETED' || fundingCategory === 'UNALLOCATED') && (
                        <div className="md:col-span-3 space-y-3 p-5 bg-emerald-50/20 border-2 border-dashed border-emerald-100 rounded-xl animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <Check size={16} className="text-emerald-500" />
                                <Label className="label-ads text-emerald-800 mb-0 font-black">Select Budget Line(s) *</Label>
                            </div>
                            {loadingBudgets ? (
                                <div className="h-10 bg-slate-50 animate-pulse rounded" />
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {budgetLines.map(line => (
                                        <label key={line.id} className={cn(
                                            "flex items-center gap-3 p-3 bg-white border rounded-xl cursor-pointer transition-all group",
                                            (watch('budgetLineIds') || []).includes(line.id) ? "border-emerald-500 ring-1 ring-emerald-500 shadow-sm" : "border-n40 hover:border-emerald-200"
                                        )}>
                                            <Checkbox
                                                onCheckedChange={(checked) => {
                                                    const current = getValues('budgetLineIds') || [];
                                                    if (checked) setValue('budgetLineIds', [...current, line.id]);
                                                    else setValue('budgetLineIds', current.filter((id: string) => id !== line.id));
                                                }}
                                                checked={(watch('budgetLineIds') || []).includes(line.id)}
                                                className="border-n40 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                            />
                                            <div className="flex flex-col">
                                                <span className={cn("text-[11px] font-black uppercase tracking-tight", (watch('budgetLineIds') || []).includes(line.id) ? "text-emerald-700" : "text-slate-600")}>
                                                    {line.name}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400">LIQUIDITY VERIFIED</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="pb-10">
                {/* Section 5 Removed: Candidates handled in separate module */}
            </section>

            {/* --- ACTION BAR (Sticky) --- */}
            <div className="flex items-center justify-between p-6 bg-white/95 border border-n40 rounded-3xl shadow-2xl backdrop-blur-md sticky bottom-4 z-10 transition-all hover:shadow-blue-500/10">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all h-12 px-6"
                >
                    Cancel Creation
                </Button>

                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleSaveDraft}
                        disabled={submitting}
                        className="bg-white border border-n40 text-[#172B4D] text-[10px] font-black uppercase tracking-widest px-8 hover:bg-slate-50 transition-all h-12 shadow-sm active:scale-95"
                    >
                        Save as Draft
                    </Button>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-[#0C66E4] hover:bg-[#0055CC] text-white text-[11px] font-black uppercase tracking-widest px-12 shadow-xl shadow-blue-700/20 transition-all h-12 active:scale-95"
                    >
                        {submitting ? 'Initiating Workflow...' : 'Initiate Requisition'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
