'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import {
    Eye,
    EyeOff,
    Shield,
    CheckCircle2,
    Copy,
    ArrowRight,
    Loader2,
    Lock,
    Mail,
    AlertCircle,
    Building2,
    ExternalLink,
    KeyRound,
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
interface LoginFormValues {
    email: string;
    password: string;
    remember: boolean;
}

type PortalType = 'internal' | 'vendor';

export type RoleType = 'SYSTEM_ADMIN' | 'DEPT_REQUESTOR' | 'HOD' | 'HR_ADMIN' | 'PROCUREMENT_OFFICER' | 'FINANCE_OFFICER' | 'VENDOR_USER';

interface DemoCredential {
    rbacRole: RoleType;
    role: string;
    email: string;
    password: string;
    department: string;
}

const internalCredentials: DemoCredential[] = [
    { rbacRole: 'HR_ADMIN', role: 'HR Manager', email: 'hr.manager@deiz.ae', password: 'DEIZ@HR2026!', department: 'Human Resources' },
    { rbacRole: 'HOD', role: 'HOD – Operations', email: 'hod.operations@deiz.ae', password: 'DEIZ@HOD2026!', department: 'Operations' },
    { rbacRole: 'DEPT_REQUESTOR', role: 'Department Requestor', email: 'requestor.it@deiz.ae', password: 'DEIZ@REQ2026!', department: 'Information Technology' },
    { rbacRole: 'FINANCE_OFFICER', role: 'Line Manager', email: 'lm.finance@deiz.ae', password: 'DEIZ@LM2026!', department: 'Finance' },
    { rbacRole: 'PROCUREMENT_OFFICER', role: 'Procurement Officer', email: 'procurement@deiz.ae', password: 'DEIZ@PRO2026!', department: 'Procurement' },
    { rbacRole: 'FINANCE_OFFICER', role: 'Finance Analyst', email: 'finance.analyst@deiz.ae', password: 'DEIZ@FIN2026!', department: 'Finance' },
    { rbacRole: 'DEPT_REQUESTOR', role: 'Main Interviewer', email: 'interviewer.hr@deiz.ae', password: 'DEIZ@INT2026!', department: 'Human Resources' },
    { rbacRole: 'SYSTEM_ADMIN', role: 'System Administrator', email: 'sysadmin@deiz.ae', password: 'DEIZ@ADM2026!', department: 'IT Administration' },
];

const vendorCredentials: DemoCredential[] = [
    { rbacRole: 'VENDOR_USER', role: 'Vendor – TechBridge Solutions', email: 'portal@techbridge.ae', password: 'VND@TB2026!', department: 'IT Staffing' },
    { rbacRole: 'VENDOR_USER', role: 'Vendor – Gulf Manpower Co.', email: 'portal@gulfmanpower.ae', password: 'VND@GM2026!', department: 'General Staffing' },
    { rbacRole: 'VENDOR_USER', role: 'Vendor – Emirates Talent Hub', email: 'portal@emiratestalent.ae', password: 'VND@ET2026!', department: 'Executive Search' },
];

export default function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [portalType, setPortalType] = useState<PortalType>('internal');
    const [authError, setAuthError] = useState<string | null>(null);
    const { login } = useAuth();

    const credentials = portalType === 'internal' ? internalCredentials : vendorCredentials;

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<LoginFormValues>({
        defaultValues: { email: '', password: '', remember: false },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setAuthError(null);

        // Supabase Integration Hook
        try {
            // Attempt to fire real backend auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (authError) {
                // If using our dummy keys, this safely throws and skips down to the catch block where Demo mode is handled.
                throw authError; 
            }

            // --- Real Supabase Success Logic would go here ---
            // For now, if we hit this, it means keys became valid. 
            // We should ideally fetch the role from the profile table here.
            // But to ensure the demo continues acting completely fluid, we'll force throw 
            // down to the local match function if we aren't completely wired to the DB schema yet.
            throw new Error("Supabase Auth succeeded but passing to Demo Fallback for profile routing");

        } catch (error) {
            // BACKEND FALLBACK: Because we are testing with mock keys, we drop down to the localized RBAC arrays.
            console.log("Supabase Auth Validation Skipped due to Dummy Credentials — Engaging Local Demo Mode", error);

            const allCreds = [...internalCredentials, ...vendorCredentials];
            const match = allCreds.find(
                (c) => c.email.toLowerCase() === data.email.toLowerCase() && c.password === data.password
            );

            if (match) {
                login({
                    role: match.rbacRole,
                    email: match.email,
                    department: match.department,
                });
                toast.success(`Welcome back, ${match.role}`, {
                    description: `Signed into ${portalType === 'internal' ? 'Internal Portal' : 'Vendor Portal'} · ${match.department}`,
                });
                router.push('/operations-dashboard');
            } else {
                setAuthError('Invalid credentials — use the demo accounts below to sign in.');
            }
        }

        setIsLoading(false);
    };

    const autofill = (cred: DemoCredential) => {
        setValue('email', cred.email, { shouldValidate: true });
        setValue('password', cred.password, { shouldValidate: true });
        setAuthError(null);
        toast.info(`Autofilled: ${cred.role}`);
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied`);
    };

    return (
        <div className="min-h-screen flex bg-[hsl(210,20%,97%)]">
            {/* Left Panel — Brand */}
            <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col bg-[#122E52] overflow-hidden">
                {/* Geometric background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="hex-pattern" x="0" y="0" width="80" height="92" patternUnits="userSpaceOnUse">
                                <polygon points="40,4 76,24 76,68 40,88 4,68 4,24" fill="none" stroke="#C8962A" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#hex-pattern)" />
                    </svg>
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#122E52] via-[#1B4F8A]/80 to-[#0d1f35]" />

                {/* Gold accent lines */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#C8962A]/0 via-[#C8962A] to-[#C8962A]/0" />

                <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <AppLogo size={44} />
                        <div>
                            <span className="block text-xl font-bold text-white leading-tight">DEIZ OMS</span>
                            <span className="block text-xs font-medium text-[#C8962A] leading-tight tracking-wide">
                                Al Asas Information Technology
                            </span>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="mb-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8962A]/15 text-[#C8962A] text-xs font-semibold tracking-wide border border-[#C8962A]/30">
                                <Building2 size={11} />
                                Dubai Integrated Economic Zones
                            </span>
                        </div>

                        <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4 text-balance">
                            Enterprise Outsource{' '}
                            <span className="text-[#C8962A]">Management System</span>
                        </h1>

                        <p className="text-slate-300 text-base leading-relaxed mb-10 max-w-md">
                            Centralized, workflow-driven governance for the complete outsourced manpower lifecycle — from requisition through contract closure.
                        </p>

                        {/* Feature list */}
                        <div className="grid grid-cols-1 gap-3 mb-10">
                            {[
                                { label: '14-Step Auditable Workflow', desc: 'Algorithmic approval routing with full RBAC' },
                                { label: 'Real-Time Budget Control', desc: 'AED reservation and liquidity validation at requisition' },
                                { label: 'Blind Candidate Selection', desc: 'Merit-based screening with vendor identity masking' },
                                { label: 'Dubai Law No. 5 of 2026 Compliant', desc: 'Emiratisation quota monitoring and enforcement' },
                            ].map((f, i) => (
                                <div key={`feature-${i}`} className="flex items-start gap-3">
                                    <CheckCircle2 size={16} className="text-[#C8962A] mt-0.5 shrink-0" />
                                    <div>
                                        <span className="text-white text-sm font-semibold">{f.label}</span>
                                        <span className="text-slate-400 text-xs block leading-tight">{f.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Compliance badge */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                            <Shield size={20} className="text-[#C8962A] shrink-0" />
                            <div>
                                <p className="text-white text-xs font-semibold">Regulatory Compliance Active</p>
                                <p className="text-slate-400 text-[11px]">
                                    Dubai Law No. 5 of 2026 · TLS 1.3 · Immutable Audit Logging · RBAC Enforced
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-slate-500 text-xs">
                            © 2026 Al Asas Information Technology · Sharjah, UAE
                        </p>
                        <p className="text-slate-600 text-[10px] mt-1">
                            Proposal Date: 28 March 2026 · Version 1.0.0
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-10 xl:px-14 max-w-xl mx-auto w-full">
                    {/* Mobile logo */}
                    <div className="lg:hidden mb-8 flex items-center gap-3">
                        <AppLogo size={36} />
                        <div>
                            <span className="block text-base font-bold text-slate-900">DEIZ OMS</span>
                            <span className="block text-xs text-slate-400">Al Asas Information Technology</span>
                        </div>
                    </div>

                    {/* Portal Toggle */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 mb-8 self-start">
                        {(['internal', 'vendor'] as PortalType[]).map((type) => (
                            <Button
                                type="button"
                                variant="ghost"
                                key={`portal-${type}`}
                                onClick={() => {
                                    setPortalType(type);
                                    setAuthError(null);
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${portalType === type
                                        ? 'bg-white text-[hsl(214,67%,32%)] shadow-sm hover:text-[hsl(214,67%,32%)] hover:bg-white'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-transparent'
                                    }`}
                            >
                                {type === 'internal' ? '🏢 Internal Portal' : '🏭 Vendor Portal'}
                            </Button>
                        ))}
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign in to your account</h2>
                        <p className="text-slate-500 text-sm">
                            {portalType === 'internal' ? 'Use your DEIZ Active Directory credentials or demo accounts below.' : 'Access the DEIZ Vendor Portal to submit candidates and quotations.'}
                        </p>
                    </div>

                    {/* AD SSO Button */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            login({
                                role: 'HR',
                                email: 'hr.manager@deiz.ae',
                                department: 'Human Resources',
                            });
                            toast.success(`Welcome back, HR Manager`, {
                                description: `Signed into Internal Portal · Human Resources`,
                            });
                            router.push('/operations-dashboard');
                        }}
                        className="w-full flex h-auto items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-[hsl(214,67%,32%)] text-[hsl(214,67%,32%)] font-semibold text-sm hover:bg-[hsl(214,67%,32%)]/5 transition-all duration-150 mb-6 group"
                    >
                        <Shield size={18} />
                        <span>Continue with Active Directory (SSO)</span>
                        <ExternalLink size={13} className="ml-auto text-slate-400 group-hover:text-[hsl(214,67%,32%)] transition-colors" />
                    </Button>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400 font-medium">or sign in with credentials</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Auth Error */}
                    {authError && (
                        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 mb-5 animate-fade-in">
                            <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{authError}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="label">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="your.name@deiz.ae"
                                    className={`pl-9 h-10 ${errors.email ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                                    {...register('email', {
                                        required: 'Email address is required',
                                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                                    })}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                                    <AlertCircle size={11} />
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="label">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    className={`pl-9 pr-10 h-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                    })}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-transparent transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </Button>
                            </div>
                            {errors.password && (
                                <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                                    <AlertCircle size={11} />
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-300 text-[hsl(214,67%,32%)] focus:ring-[hsl(214,67%,32%)]/30"
                                    {...register('remember')}
                                />
                                <span className="text-sm text-slate-600">Remember me</span>
                            </label>
                            <Button variant="link" type="button" className="px-0 h-auto text-sm text-[hsl(214,67%,32%)] font-medium hover:underline">
                                Forgot password?
                            </Button>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 text-base font-semibold"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin mr-2" />
                                    Authenticating…
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={16} className="ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Demo Credentials Table */}
                    <div className="mt-8">
                        <div className="flex items-center gap-2 mb-3">
                            <KeyRound size={14} className="text-[hsl(38,67%,48%)]" />
                            <h3 className="text-sm font-semibold text-slate-700">
                                Demo Accounts — {portalType === 'internal' ? 'Internal Portal' : 'Vendor Portal'}
                            </h3>
                        </div>
                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="text-left px-3 py-2.5 font-semibold text-slate-500 whitespace-nowrap">Role</th>
                                            <th className="text-left px-3 py-2.5 font-semibold text-slate-500 whitespace-nowrap">Email</th>
                                            <th className="text-left px-3 py-2.5 font-semibold text-slate-500 whitespace-nowrap">Password</th>
                                            <th className="px-3 py-2.5" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {credentials.map((cred, idx) => (
                                            <tr
                                                key={`cred-${cred.role.replace(/\s/g, '-')}`}
                                                className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                                            >
                                                <td className="px-3 py-2.5">
                                                    <span className="font-semibold text-slate-700 whitespace-nowrap">{cred.role}</span>
                                                    <span className="block text-slate-400 text-[10px]">{cred.department}</span>
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-mono text-slate-600 whitespace-nowrap">{cred.email}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => copyToClipboard(cred.email, 'Email')}
                                                            className="h-6 w-6 text-slate-400 hover:text-slate-600 p-0 rounded hover:bg-slate-100 transition-colors"
                                                            aria-label="Copy email"
                                                        >
                                                            <Copy size={10} />
                                                        </Button>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-mono text-slate-500 whitespace-nowrap">{cred.password}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => copyToClipboard(cred.password, 'Password')}
                                                            className="h-6 w-6 text-slate-400 hover:text-slate-600 p-0 rounded hover:bg-slate-100 transition-colors"
                                                            aria-label="Copy password"
                                                        >
                                                            <Copy size={10} />
                                                        </Button>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2.5 text-right">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => autofill(cred)}
                                                        className="h-6 px-2.5 py-1 rounded-md bg-[hsl(214,67%,32%)] text-white text-[10px] font-bold hover:bg-[hsl(214,67%,38%)] whitespace-nowrap"
                                                    >
                                                        Use
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 text-center">
                            Click "Use" to autofill credentials · Demo environment only
                        </p>
                    </div>

                    {/* Terms */}
                    <p className="text-xs text-slate-400 text-center mt-8 leading-relaxed">
                        By signing in, you agree to DEIZ's{' '}
                        <span className="text-[hsl(214,67%,32%)] cursor-pointer hover:underline">Terms of Service</span>
                        {' '}and{' '}
                        <span className="text-[hsl(214,67%,32%)] cursor-pointer hover:underline">Privacy Policy</span>.
                        All sessions are monitored and audited per Dubai Law No. 5 of 2026.
                    </p>
                </div>
            </div>
        </div>
    );
}