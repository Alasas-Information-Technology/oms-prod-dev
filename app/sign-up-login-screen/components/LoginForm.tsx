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
    ArrowRight,
    Loader2,
    Lock,
    Mail,
    AlertCircle,
    Users,
    ChevronRight,
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
interface LoginFormValues {
    email: string;
    password: string;
    remember: boolean;
}


export type RoleType = 'SYSTEM_ADMIN' | 'DEPT_REQUESTOR' | 'HOD' | 'HR_ADMIN' | 'PROCUREMENT_OFFICER' | 'FINANCE_OFFICER' | 'VENDOR_USER';

const DEMO_PERSONAS = [
    { name: 'HR Admin', email: 'hr.manager@oms-pro.com', role: 'HR_ADMIN', fullName: 'HR Manager' },
    { name: 'HOD Operations', email: 'hod.operations@oms-pro.com', role: 'HOD', fullName: 'HOD Operations' },
    { name: 'IT Requestor', email: 'requestor.it@oms-pro.com', role: 'DEPT_REQUESTOR', fullName: 'IT Requestor' },
    { name: 'Procurement', email: 'procurement@oms-pro.com', role: 'PROCUREMENT_OFFICER', fullName: 'Procurement Officer' },
];

const DEMO_PASSWORD = 'DemoPassword123!';

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

    const handleQuickLogin = async (persona: typeof DEMO_PERSONAS[0]) => {
        setIsLoading(true);
        setAuthError(null);

        try {
            // 1. Try to Sign In
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: persona.email,
                password: DEMO_PASSWORD,
            });

            if (signInError) {
                // 2. If doesn't exist, Provision (Sign Up)
                if (signInError.message.includes('Invalid login credentials')) {
                    toast.info('Account not found. Provisioning demo persona...');

                    const { error: signUpError } = await supabase.auth.signUp({
                        email: persona.email,
                        password: DEMO_PASSWORD,
                        options: {
                            data: {
                                full_name: persona.fullName,
                                role: persona.role,
                            }
                        }
                    });

                    if (signUpError) throw signUpError;

                    toast.success('Persona Provisioned');

                    // Final attempt to sign in after signup
                    const { error: finalSignInError } = await supabase.auth.signInWithPassword({
                        email: persona.email,
                        password: DEMO_PASSWORD,
                    });

                    if (finalSignInError) throw finalSignInError;
                } else {
                    throw signInError;
                }
            }

            toast.success('Demo Session Started', {
                description: `Authenticated as ${persona.name}`,
            });

            router.push('/operations-dashboard');
        } catch (error: any) {
            console.error("Quick Login Error:", error);
            const msg = error.message || 'Failed to provision demo persona.';
            setAuthError(msg);
            toast.error('Provisioning Failed', { description: msg });
        } finally {
            setIsLoading(false);
        }
    };

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

        } catch (error: unknown) {
            console.error("Supabase Auth Error:", error);
            const errorMessage = error instanceof Error ? error.message : 'Invalid credentials. Please try again.';
            setAuthError(errorMessage);
            toast.error('Authentication Failed', {
                description: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F7] p-6 relative font-sans">
            {/* Centered Authentication Card */}
            <div className="w-full max-w-md bg-white rounded-sm p-8 shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)] animate-in fade-in zoom-in-95 duration-300">
                {/* Header Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="mb-6">
                        <AppLogo size={42} />
                    </div>
                    <h2 className="text-xl font-medium text-[#172B4D] text-center">Sign in to your account</h2>
                    <p className="text-sm text-[#42526E] text-center mt-2 leading-relaxed">
                        Access the Enterprise Outsource Management System using your corporate credentials.
                    </p>
                </div>

                {/* Auth Error Message */}
                {authError && (
                    <div className="flex items-start gap-2.5 p-3 rounded-[3px] bg-red-50 border border-red-200 mb-6 animate-fade-in">
                        <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 font-medium leading-normal">{authError}</p>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
                    {/* Email Field */}
                    <div className="mb-4">
                        <label htmlFor="email" className="text-[#42526E] text-xs font-semibold mb-1.5 block">
                            Email Address
                        </label>
                        <div className="relative group">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B778C] transition-colors group-focus-within:text-[#0C66E4]" />
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="name@oms-pro.com"
                                className={`w-full h-10 pl-9 pr-3 py-2 bg-[#FAFBFC] border ${errors.email ? 'border-red-500' : 'border-[#DFE1E6]'} rounded-[3px] text-sm text-[#172B4D] placeholder:text-[#A5ADBA] focus:bg-white focus:ring-2 focus:ring-[#388BFF] focus:border-transparent outline-none transition-all`}
                                {...register('email', {
                                    required: 'Email address is required',
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                                })}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-600 text-[11px] mt-1.5 font-medium flex items-center gap-1">
                                <AlertCircle size={11} />
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="mb-4">
                        <label htmlFor="password" className="text-[#42526E] text-xs font-semibold mb-1.5 block">
                            Password
                        </label>
                        <div className="relative group">
                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B778C] transition-colors group-focus-within:text-[#0C66E4]" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className={`w-full h-10 pl-9 pr-10 py-2 bg-[#FAFBFC] border ${errors.password ? 'border-red-500' : 'border-[#DFE1E6]'} rounded-[3px] text-sm text-[#172B4D] placeholder:text-[#A5ADBA] focus:bg-white focus:ring-2 focus:ring-[#388BFF] focus:border-transparent outline-none transition-all`}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Minimum 6 characters' },
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#6B778C] hover:text-[#172B4D] hover:bg-slate-100 rounded-sm transition-colors"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-600 text-[11px] mt-1.5 font-medium flex items-center gap-1">
                                <AlertCircle size={11} />
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between mb-8 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-3.5 h-3.5 rounded-sm border-[#DFE1E6] bg-[#FAFBFC] text-[#0C66E4] focus:ring-offset-0 focus:ring-2 focus:ring-[#388BFF] transition-all"
                                {...register('remember')}
                            />
                            <span className="text-xs text-[#42526E] font-medium group-hover:text-[#172B4D]">Remember me</span>
                        </label>
                        <button type="button" className="text-xs text-[#0C66E4] font-semibold hover:underline">
                            Forgot password?
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-10 bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight size={14} />
                            </>
                        )}
                    </button>
                </form>


            </div>

            {/* Absolute Footer */}
            <div className="absolute bottom-10 left-0 right-0 text-center">
                <p className="text-[11px] text-[#5E6C84] tracking-wide">
                    © 2026 Al Asas Information Technology · Dubai & Sharjah, UAE
                </p>
            </div>
        </div>
    );
}
