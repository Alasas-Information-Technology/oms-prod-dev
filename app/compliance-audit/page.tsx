'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
    Users, 
    Search, 
    Building2, 
    ShieldCheck, 
    Mail, 
    Filter, 
    Download,
    RefreshCw,
    BadgeCheck,
    UserCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { profileService } from '@/lib/services/profileService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ComplianceAuditPage() {
    const { currentUser } = useAuth();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (currentUser) {
            loadUsers();
        }
    }, [currentUser]);

    const loadUsers = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const data = await profileService.getUsers(currentUser);
            setProfiles(data);
        } catch (error) {
            console.error('Directory: Failed to load users', error);
            toast.error('Failed to load user directory');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadUsers();
    };

    const filtered = profiles.filter(p => 
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.departments?.dept_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.roles?.role_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout>
            <div className="max-w-screen-2xl mx-auto space-y-6 animate-fade-in">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-[#0C66E4]/10 flex items-center justify-center">
                                <ShieldCheck size={18} className="text-[#0C66E4]" />
                            </div>
                            <h1 className="text-2xl font-bold text-[#0C66E4] tracking-tight">System Directory & Compliance</h1>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">
                            {currentUser?.roles?.role_name === 'SYSTEM_ADMIN' || currentUser?.roles?.role_name === 'HR_ADMIN' 
                                ? 'Global workforce directory and role assignments' 
                                : `Departmental directory for ${currentUser?.department || 'your department'}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="bg-white font-bold gap-2">
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                            Refresh
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white font-bold gap-2">
                            <Download size={14} />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Main Directory Table */}
                <Card className="border-none shadow-card overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input 
                                    placeholder="Search by name, email, or department…" 
                                    className="pl-9 bg-white border-slate-200"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="sm" className="text-slate-500 font-bold gap-2">
                                    <Filter size={14} />
                                    Filter
                                </Button>
                                <div className="h-6 w-px bg-slate-200" />
                                <span className="text-xs font-bold text-slate-500 tabular-nums">
                                    {loading ? '--' : filtered.length} Active Records
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                        <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Employee Information</th>
                                        <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                                        <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Primary Role</th>
                                        <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Security Clearance</th>
                                        <th className="px-6 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        [...Array(6)].map((_, i) => (
                                            <tr key={i} className="border-b border-slate-50">
                                                <td className="px-6 py-4"><Skeleton className="h-10 w-48 rounded-lg" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-6 w-32 rounded-lg" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-lg" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-6 w-20 mx-auto rounded-lg" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-6 w-16 ml-auto rounded-lg" /></td>
                                            </tr>
                                        ))
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <Users size={20} className="text-slate-300" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">No matches found</p>
                                                        <p className="text-xs text-slate-400">Try adjusting your search parameters</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((profile) => (
                                            <tr key={profile.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[#0C66E4] font-bold text-xs ring-2 ring-white shadow-sm border border-slate-200/50">
                                                            {profile.full_name?.substring(0, 2).toUpperCase() || '??'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-[#172B4D] truncate leading-tight">{profile.full_name || 'Unset Profile Name'}</p>
                                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                                                <Mail size={10} className="text-slate-300" />
                                                                {profile.email || 'no-email@oms.ae'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 bg-slate-100/50 w-fit px-2.5 py-1 rounded-lg border border-slate-200/40">
                                                        <Building2 size={12} className="text-slate-400" />
                                                        <span className="text-xs font-bold text-slate-700">{profile.departments?.dept_name || 'General'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-semibold text-slate-600">
                                                        {profile.roles?.role_name?.replace('_', ' ') || 'Internal User'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center">
                                                        {profile.roles?.role_name === 'SYSTEM_ADMIN' || profile.roles?.role_name === 'HR_ADMIN' ? (
                                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                                                <BadgeCheck size={10} />
                                                                LEVEL 1: FULL
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                                                LEVEL 3: DEPT
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Active
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Insight Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-[#0C66E4] text-white border-none shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-70">Compliance Logic</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={28} className="text-blue-300 shrink-0" />
                                <p className="text-[11px] font-medium leading-relaxed">
                                    This directory uses strict departmental filtering. 
                                    Internal users are restricted to viewing colleagues within their own business unit.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#172B4D] text-white border-none shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-70">Audited Access</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <UserCircle2 size={28} className="text-slate-400 shrink-0" />
                                <p className="text-[11px] font-medium leading-relaxed">
                                    All directory requests are logged. Your view is currently scoped to 
                                    <strong> {filtered.length} employees </strong> based on your assigned role.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-emerald-600 text-white border-none shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-70">Data Integrity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Building2 size={28} className="text-emerald-200 shrink-0" />
                                <p className="text-[11px] font-medium leading-relaxed">
                                    Department IDs are validated against the corporate schema. 
                                    Cross-department visibility requires Global View clearance.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
