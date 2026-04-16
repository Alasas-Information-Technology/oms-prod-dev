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


export type RoleType = 'SYSTEM_ADMIN' | 'DEPT_REQUESTOR' | 'HOD' | 'HR_ADMIN' | 'PROCUREMENT_OFFICER' | 'FINANCE_OFFICER' | 'VENDOR_USER';

export default function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            router.push('/operations-dashboard');
        }
    }, [isAuthenticated, router]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        defaultValues: { email: '', password: '', remember: false },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setAuthError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (authError) {
                throw authError; 
            }

            toast.success('Login Successful', {
                description: 'Verifying credentials and synchronizing profile...',
            });
            
            // The AuthContext will catch the session change and redirect.
            // But we can also push here for immediate feedback if needed.
            router.push('/operations-dashboard');

        } catch (error: any) {
            console.error("Supabase Auth Error:", error);
            setAuthError(error.message || 'Invalid credentials. Please try again.');
            toast.error('Authentication Failed', {
                description: error.message || 'Invalid email or password.'
            });
        } finally {
            setIsLoading(false);
        }
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
                            <span className="block text-xl font-bold text-white leading-tight">Enterprise OMS</span>
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
                                Corporate Headquarters
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
                                { label: 'End-to-End Auditable Workflow', desc: 'Algorithmic approval routing with full RBAC' },
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
                                    Standard Regulatory Governance · TLS 1.3 · Immutable Audit Logging · RBAC Enforced
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
                            <span className="block text-base font-bold text-slate-900">Enterprise OMS</span>
                            <span className="block text-xs text-slate-400">Al Asas Information Technology</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign in to your account</h2>
                        <p className="text-slate-500 text-sm">
                            Use your Corporate Active Directory credentials or demo accounts below.
                        </p>
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
                                    placeholder="your.name@oms-pro.com"
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


                    {/* Terms */}
                    <p className="text-xs text-slate-400 text-center mt-8 leading-relaxed">
                        By signing in, you agree to the{' '}
                        <span className="text-[hsl(214,67%,32%)] cursor-pointer hover:underline">Terms of Service</span>
                        {' '}and{' '}
                        <span className="text-[hsl(214,67%,32%)] cursor-pointer hover:underline">Privacy Policy</span>.
                        All sessions are monitored and audited per Standard Regulatory Governance.
                    </p>
                </div>
            </div>
        </div>
    );
}