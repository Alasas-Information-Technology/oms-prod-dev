'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle
} from '@/components/ui/dialog';
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
import { useAuth } from '@/contexts/AuthContext';
import { financeService } from '@/lib/services/financeService';
import { requisitionService } from '@/lib/services/requisitionService';
import {
    AlertTriangle,
    Briefcase,
    Check,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    Loader2,
    ShieldCheck,
    Wallet,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface NewRequisitionFormValues {
    positionTitle: string;
    departmentId: string;
    targetStartDate: string;
    workLocation: 'Onshore (UAE)' | 'Offshore (Remote)';
    reqLaptop: boolean;
    reqMobilePhone: boolean;
    reqEmailAccess: boolean;
    reqSoftwareLicenses: boolean;
    officeSeating: string;
    fundingType: 'BUDGETED' | 'UNALLOCATED' | 'UNBUDGETED' | '';
    reservedBudget: number | '';
}

interface DeptBudget {
    total: number;
    consumed: number;
    reserved: number;
    available: number;
}

interface Department {
    id: string;
    dept_name: string;
}

interface NewRequisitionModalProps {
    requisition?: any; // Added for edit mode
    onClose: () => void;
    onSuccess?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const fundingTypes = ['BUDGETED', 'UNALLOCATED', 'UNBUDGETED'];

function formatAED(value: number): string {
    return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function NewRequisitionModal({ requisition, onClose, onSuccess }: NewRequisitionModalProps) {
    const isEditMode = !!requisition;
    const corporateNavy = 'hsl(214,67%,32%)';

    // ── State ────────────────────────────────────────────────────────────────
    const [activeStep, setActiveStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [deptsLoading, setDeptsLoading] = useState(true);
    const [deptBudget, setDeptBudget] = useState<DeptBudget | null>(null);
    const [budgetLoading, setBudgetLoading] = useState(false);

    const { currentUser } = useAuth();
    const currentRole = currentUser?.roles?.role_name || '';
    const isDepartmentalRole = ['HOD', 'LINE_MANAGER', 'DEPT_REQUESTOR'].includes(currentRole);

    const {
        register,
        handleSubmit,
        watch,
        control,
        setValue,
        trigger,
        reset,
        formState: { errors, isValid },
    } = useForm<NewRequisitionFormValues>({
        mode: 'onChange',
        defaultValues: {
            workLocation: 'Onshore (UAE)',
            reqLaptop: false,
            reqMobilePhone: false,
            reqEmailAccess: false,
            reqSoftwareLicenses: false,
            fundingType: '',
            departmentId: currentUser?.department_id || '',
        },
    });

    // ── Edit Mode Population ─────────────────────────────────────────────
    useEffect(() => {
        if (isEditMode && requisition) {
            reset({
                positionTitle: requisition.positionTitle,
                departmentId: requisition.department_id,
                targetStartDate: requisition.targetStartDate,
                workLocation: requisition.workLocation === 'Onshore' ? 'Onshore (UAE)' : 'Offshore (Remote)',
                reqLaptop: requisition.reqLaptop,
                reqMobilePhone: requisition.reqMobilePhone,
                reqEmailAccess: requisition.reqEmailAccess,
                reqSoftwareLicenses: requisition.reqSoftwareLicenses,
                officeSeating: requisition.officeSeating,
                fundingType: requisition.fundingType as any,
                reservedBudget: requisition.budget,
            });
        }
    }, [isEditMode, requisition, reset]);

    // ── Form Sync & Fetching ─────────────────────────────────────────────────
    useEffect(() => {
        if (currentUser?.department_id) {
            setValue('departmentId', currentUser.department_id);
        }
    }, [currentUser, setValue]);

    const departmentId = watch('departmentId');
    const workLocation = watch('workLocation');
    const reservedBudget = watch('reservedBudget');
    const fundingType = watch('fundingType');

    useEffect(() => {
        if (!currentUser) return;
        financeService.getDepartments(currentRole)
            .then(data => setDepartments(data))
            .finally(() => setDeptsLoading(false));
    }, [currentUser, currentRole]);

    useEffect(() => {
        const fetchBudget = async () => {
            if (!departmentId) { setDeptBudget(null); return; }
            setBudgetLoading(true);
            try {
                const budget = await financeService.getDepartmentBudget(departmentId);
                setDeptBudget(budget);
            } catch {
                setDeptBudget(null);
            } finally {
                setBudgetLoading(false);
            }
        };
        fetchBudget();
    }, [departmentId]);

    // ── Validation Props ─────────────────────────────────────────────────────
    const requestedAmount = Number(reservedBudget) || 0;
    const isBudgeted = fundingType === 'BUDGETED';
    const availableAmount = deptBudget?.available ?? Infinity;
    const isOverBudget = isBudgeted && deptBudget !== null && requestedAmount > availableAmount;
    const submitBlocked = isOverBudget;

    // ── Navigation Logic ─────────────────────────────────────────────────────
    const nextStep = async () => {
        let fieldsToValidate: any[] = [];
        if (activeStep === 1) fieldsToValidate = ['positionTitle', 'departmentId', 'targetStartDate'];

        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) setActiveStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 1));

    const onSubmit = async (data: NewRequisitionFormValues) => {
        if (!currentUser || isOverBudget) return;
        setSubmitting(true);
        try {
            const selectedDept = departments.find(d => d.id === data.departmentId);
            const payload = {
                ...data,
                departmentName: selectedDept?.dept_name || currentUser.department
            };

            if (isEditMode) {
                await requisitionService.updateRequisition(requisition.id, payload);
                toast.success('Requisition updated successfully');
            } else {
                await requisitionService.createRequisition(payload, currentUser);
                toast.success('Requisition generated successfully');
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Submission error:', err);
            toast.error(isEditMode ? 'Failed to update requisition' : 'Failed to create requisition');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Render Helpers ───────────────────────────────────────────────────────
    const steps = [
        { id: 1, name: 'Job Specification', icon: Briefcase, desc: 'Position & Dept' },
        { id: 2, name: 'Infrastructure', icon: ShieldCheck, desc: 'Hardware & Access' },
        { id: 3, name: 'Financial Governance', icon: ClipboardCheck, desc: 'Budget & Approval' },
    ];

    const renderBudgetBadge = () => {
        if (!departmentId) return null;
        if (budgetLoading) return <div className="h-10 bg-slate-50 border border-slate-200 rounded-xl animate-pulse" />;
        if (!deptBudget) return <div className="text-[10px] text-slate-400 p-2 border border-dashed rounded-lg">No budget record found for FY2026.</div>;

        const utilization = deptBudget.total > 0 ? ((deptBudget.consumed + deptBudget.reserved) / deptBudget.total) * 100 : 0;
        const isDanger = utilization > 85;

        return (
            <div className={`flex items-center justify-between p-4 rounded-xl border-l-4 ${isDanger ? 'bg-amber-50 border-amber-200 border-l-amber-500 text-amber-900' : 'bg-blue-50/50 border-blue-100 border-l-[hsl(214,67%,32%)] text-slate-900'}`}>
                <div className="flex items-center gap-3">
                    <Wallet size={18} className={isDanger ? 'text-amber-600' : 'text-[hsl(214,67%,32%)]'} />
                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">Available Liquidity</p>
                        <p className="text-lg font-black tabular-nums">{formatAED(deptBudget.available)}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">Utilization</p>
                    <p className="text-sm font-bold">{utilization.toFixed(0)}%</p>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[95vw] lg:max-w-6xl w-full h-[100dvh] sm:h-[auto] sm:max-h-[95vh] flex flex-col p-0 overflow-hidden border-none shadow-premium-2xl">

                {/* ── Sleek Wizard Header ─────────────────────────────────────── */}
                <div className="bg-white px-6 pt-6 pb-2 sm:px-10 sm:pt-8 border-b border-slate-300 shrink-0">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="bg-[hsl(214,67%,32%)] text-white text-[10px] font-black px-2 py-0.5 rounded tracking-tighter">OMS PRO</span>
                                <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">
                                    {isEditMode ? 'Modify Requisition' : 'Enterprise Resourcing'}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-slate-500 font-medium text-xs sm:text-sm">
                                System-guided requisition workflow for departmental allocation
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Sleek Segmented Stepper */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            const isCompleted = activeStep > step.id;
                            const isActive = activeStep === step.id;

                            return (
                                <div key={step.id} className="relative group">
                                    <div className={`
                                        h-1.5 rounded-full mb-3 transition-all duration-500 ease-in-out
                                        ${isCompleted ? 'bg-[hsl(214,67%,32%)]' :
                                            isActive ? 'bg-[hsl(214,67%,32%)] shadow-[0_0_8px_rgba(10,54,103,0.3)]' : 'bg-slate-100'}
                                    `} />
                                    <div className={`
                                        flex items-center gap-3 transition-all duration-300
                                        ${isActive ? 'opacity-100' : 'opacity-40 grayscale'}
                                    `}>
                                        <div className={`
                                            w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
                                            ${isActive ? 'bg-[hsl(214,67%,32%)] text-white' : 'bg-slate-100 text-slate-500'}
                                        `}>
                                            {isCompleted ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
                                        </div>
                                        <div className="hidden sm:block min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 truncate">
                                                {step.name}
                                            </p>
                                            <p className="text-[9px] font-bold text-slate-400 truncate tracking-tight">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Step Content ──────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 scrollbar-thin bg-slate-50/30">
                    <form id="req-wizard-form" onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">

                        {/* ── STEP 1: JOB SPECIFICATION ── */}
                        {activeStep === 1 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Job Specification</h3>
                                    <p className="text-sm text-slate-500">Define the core parameters and organizational alignment for this hire.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Position Title</Label>
                                        <Input
                                            placeholder="e.g. Lead DevSecOps Engineer"
                                            className={`h-14 text-lg font-bold border-transparent bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-[hsl(214,67%,32%)] transition-all ${errors.positionTitle ? 'ring-red-500' : ''}`}
                                            {...register('positionTitle', { required: true })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Departmental Unit</Label>
                                            <Controller
                                                name="departmentId"
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={deptsLoading || isDepartmentalRole}>
                                                        <SelectTrigger className="h-14 border-transparent bg-white shadow-sm ring-1 ring-slate-200 font-bold">
                                                            <SelectValue placeholder="Selecting unit..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.dept_name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Activation Date</Label>
                                            <Input
                                                type="date"
                                                className="h-14 border-transparent bg-white shadow-sm ring-1 ring-slate-200 font-bold"
                                                {...register('targetStartDate', { required: true })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Deployment Strategy</Label>
                                        <Controller
                                            name="workLocation"
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <Label htmlFor="onshore" className={`
                                                        flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white
                                                        ${field.value === 'Onshore (UAE)' ? 'border-[hsl(214,67%,32%)] ring-1 ring-[hsl(214,67%,32%)] shadow-md text-slate-900' : 'border-slate-100 hover:border-slate-200'}
                                                    `}>
                                                        <RadioGroupItem value="Onshore (UAE)" id="onshore" className="border-slate-300" />
                                                        <div>
                                                            <p className="font-black text-sm">Onshore (UAE)</p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Entity-hosted Presence</p>
                                                        </div>
                                                    </Label>
                                                    <Label htmlFor="offshore" className={`
                                                        flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white
                                                        ${field.value === 'Offshore (Remote)' ? 'border-[hsl(214,67%,32%)] ring-1 ring-[hsl(214,67%,32%)] shadow-md text-slate-900' : 'border-slate-100 hover:border-slate-200'}
                                                    `}>
                                                        <RadioGroupItem value="Offshore (Remote)" id="offshore" className="border-slate-300" />
                                                        <div>
                                                            <p className="font-black text-sm">Offshore (Remote)</p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Global Service Delivery</p>
                                                        </div>
                                                    </Label>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: INFRASTRUCTURE ── */}
                        {activeStep === 2 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Hardware & Digital Access</h3>
                                    <p className="text-sm text-slate-500">Specify the essential infrastructure required for the role's professional kit.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {[
                                        { id: 'reqLaptop', label: 'Workstation', sub: 'Corp Provisioned Laptop', field: 'reqLaptop' },
                                        { id: 'reqMobile', label: 'Secure Mobility', sub: 'VoIP & Mobile Device', field: 'reqMobilePhone' },
                                        { id: 'reqEmail', label: 'IAM Identity', sub: 'AD & Azure SSO Access', field: 'reqEmailAccess' },
                                        { id: 'reqSoft', label: 'SaaS Tooling', sub: 'Enterprise Software Hub', field: 'reqSoftwareLicenses' },
                                    ].map((item) => (
                                        <Controller
                                            key={item.id}
                                            name={item.field as any}
                                            control={control}
                                            render={({ field }) => (
                                                <Label
                                                    htmlFor={item.id}
                                                    className={`
                                                        flex items-start gap-5 p-6 rounded-2xl border-2 transition-all cursor-pointer bg-white
                                                        ${field.value ? 'border-[hsl(214,67%,32%)] ring-1 ring-[hsl(214,67%,32%)] shadow-sm' : 'border-slate-100 hover:border-slate-200'}
                                                    `}
                                                >
                                                    <Checkbox
                                                        id={item.id}
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="mt-1 border-slate-300 data-[state=checked]:bg-[hsl(214,67%,32%)] data-[state=checked]:border-none"
                                                    />
                                                    <div>
                                                        <p className="font-black text-slate-900">{item.label}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1 leading-tight">{item.sub}</p>
                                                    </div>
                                                </Label>
                                            )}
                                        />
                                    ))}
                                </div>

                                {workLocation === 'Onshore (UAE)' && (
                                    <div className="space-y-3 pt-6 border-t border-slate-100">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Office Seating & Facility Access</Label>
                                        <textarea
                                            rows={5}
                                            placeholder="Detail specific seating requirements or local facility access cards needed..."
                                            className="w-full rounded-2xl border-2 border-slate-100 p-5 text-sm font-medium focus:outline-none focus:border-[hsl(214,67%,32%)] transition-all bg-white shadow-sm"
                                            {...register('officeSeating', { required: workLocation === 'Onshore (UAE)' })}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── STEP 3: FINANCIAL GOVERNANCE ── */}
                        {activeStep === 3 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Financial Governance</h3>
                                    <p className="text-sm text-slate-500">Final budget reservation and funding categorization for enterprise audit.</p>
                                </div>

                                {renderBudgetBadge()}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Funding Classification</Label>
                                        <Controller
                                            name="fundingType"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="h-14 border-2 border-slate-100 bg-white font-bold">
                                                        <SelectValue placeholder="System classification..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fundingTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Reserved Budget (AED)</Label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-300">AED</span>
                                            <Input
                                                type="number"
                                                className={`h-14 pl-16 border-2 font-black tabular-nums text-lg ${isOverBudget ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-slate-100 bg-white'}`}
                                                {...register('reservedBudget', { required: true, min: 1 })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {isOverBudget && (
                                    <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-100 flex gap-5 text-red-900 animate-in shake-in duration-500">
                                        <AlertTriangle size={24} className="text-red-500 shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-black uppercase tracking-tight">Budget Deviation Detected</p>
                                            <p className="text-xs font-bold leading-relaxed opacity-80">
                                                The requested {formatAED(requestedAmount)} exceeds the current liquid balance of {formatAED(availableAmount)}.
                                                Please liaise with Finance or adjust the reserved amount.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center text-center gap-3">
                                    <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Ready for Authorization</h4>
                                    <p className="text-xs text-slate-500 font-bold max-w-md leading-relaxed">
                                        Submitting this requisition will initiate the automated approval path.
                                        Ensure all data points are verified as per organizational policy.
                                    </p>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* ── Wizard Footer ─────────────────────────────────────────── */}
                <div className="p-8 bg-white border-t border-slate-300 shrink-0 flex items-center justify-between gap-4">
                    <Button
                        variant="ghost"
                        onClick={activeStep === 1 ? onClose : prevStep}
                        disabled={submitting}
                        className="font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        {activeStep === 1 ? 'Discard Entry' : 'Previous Step'}
                    </Button>

                    <div className="flex gap-4">
                        {activeStep < 3 ? (
                            <Button
                                onClick={nextStep}
                                className="bg-[hsl(214,67%,32%)] hover:bg-[hsl(214,67%,25%)] text-white font-black h-14 px-12 rounded-2xl gap-2 shadow-xl shadow-blue-900/10 transition-all active:scale-95 group"
                            >
                                Continue Path <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                form="req-wizard-form"
                                disabled={submitting || submitBlocked}
                                className="bg-[hsl(214,67%,32%)] hover:bg-[hsl(214,67%,25%)] text-white font-black h-14 px-12 rounded-2xl gap-2 shadow-xl shadow-blue-900/10 transition-all active:scale-95 disabled:grayscale"
                            >
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> {isEditMode ? 'Save Changes' : 'Initiate Workflow'}</>}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}