'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLogo from '@/components/ui/AppLogo';
import { dashboardService } from '@/lib/services/dashboardService';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    FileText,
    Users,
    Building2,
    Wallet,
    UserCheck,
    BarChart3,
    ShieldCheck,
    Settings,
    ChevronLeft,
    ChevronRight,
    Bell,
    ClipboardList,
    TrendingUp,
    LogOut,
} from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
    group: string;
    allowedRoles: string[];
}

const navItems: NavItem[] = [
    { id: 'nav-dashboard', label: 'Operations Dashboard', href: '/operations-dashboard', icon: LayoutDashboard, group: 'core', allowedRoles: ['ALL'] },
    { id: 'nav-requisitions', label: 'Requisition Management', href: '/requisition-management', icon: FileText, badge: 7, group: 'core', allowedRoles: ['ALL'] },
    { id: 'nav-candidates', label: 'Candidates', href: '/candidates', icon: Users, badge: 23, group: 'core', allowedRoles: ['HR_ADMIN', 'DEPT_REQUESTOR', 'SYSTEM_ADMIN'] },
    { id: 'nav-vendors', label: 'Vendor Management', href: '/vendor-management', icon: Building2, group: 'core', allowedRoles: ['PROCUREMENT_OFFICER', 'SYSTEM_ADMIN'] },
    { id: 'nav-onboarding', label: 'Onboarding Tracker', href: '/onboarding-tracker', icon: UserCheck, badge: 4, group: 'operations', allowedRoles: ['FINANCE_OFFICER', 'HR_ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'nav-budget', label: 'Budget & Finance', href: '/budget-finance', icon: Wallet, group: 'operations', allowedRoles: ['FINANCE_OFFICER', 'SYSTEM_ADMIN'] },
    { id: 'nav-contracts', label: 'Contracts & LPOs', href: '/contracts-lpos', icon: ClipboardList, group: 'operations', allowedRoles: ['PROCUREMENT_OFFICER', 'SYSTEM_ADMIN'] },
    { id: 'nav-reports', label: 'Reports & Analytics', href: '/reports-analytics', icon: BarChart3, group: 'reporting', allowedRoles: ['HR_ADMIN', 'HOD', 'SYSTEM_ADMIN'] },
    { id: 'nav-forecasting', label: 'Financial Forecasting', href: '/financial-forecasting', icon: TrendingUp, group: 'reporting', allowedRoles: ['FINANCE_OFFICER', 'SYSTEM_ADMIN'] },
    { id: 'nav-compliance', label: 'Compliance & Audit', href: '/compliance-audit', icon: ShieldCheck, group: 'admin', allowedRoles: ['HR_ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'nav-notifications', label: 'Notifications', href: '/notifications', icon: Bell, badge: 12, group: 'admin', allowedRoles: ['ALL'] },
    { id: 'nav-settings', label: 'System Settings', href: '/settings', icon: Settings, group: 'admin', allowedRoles: ['SYSTEM_ADMIN'] },
];

const groupLabels: Record<string, string> = {
    core: 'Core Modules',
    operations: 'Operations',
    reporting: 'Reporting',
    admin: 'Administration',
};

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { currentUser, isLoading } = useAuth();
    const [counts, setCounts] = useState<Record<string, number>>({
        requisitions: 0,
        candidates: 0,
        onboarding: 0,
        notifications: 0
    });
    
    // Default to 'Guest' if currentUser isn't perfectly loaded yet
    const currentRole = currentUser?.roles?.role_name || 'Guest';

    useEffect(() => {
        const fetchCounts = async () => {
            if (currentUser) {
                try {
                    const data = await dashboardService.getSidebarCounts(currentUser);
                    setCounts(data);
                } catch (error) {
                    console.error('Sidebar: Error fetching counts', error);
                }
            }
        };

        fetchCounts();
        // Refresh every 2 minutes for soft-real-time updates
        const interval = setInterval(fetchCounts, 120000);
        return () => clearInterval(interval);
    }, [currentUser]);

    useEffect(() => {
        const width = collapsed ? '68px' : '256px';
        document.documentElement.style.setProperty('--sidebar-width', width);
    }, [collapsed]);

    const groups = ['core', 'operations', 'reporting', 'admin'];

    return (
        <aside
            className="fixed left-0 top-0 h-full z-30 flex flex-col bg-[#F4F5F7] border-r border-[#DFE1E6] transition-all duration-300 ease-in-out"
            style={{ width: collapsed ? '68px' : '256px' }}
            aria-label="Main navigation"
        >
            {/* Logo */}
            <div className="flex items-center h-16 px-4 border-b border-[#DFE1E6] shrink-0 overflow-hidden bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                    <AppLogo size={32} className="text-[#0C66E4]" />
                    {!collapsed && (
                        <div className="min-w-0 overflow-hidden">
                            <span className="block text-sm font-bold text-[#0C66E4] truncate leading-tight tracking-tight">Enterprise OMS</span>
                            <span className="block text-[10px] font-semibold text-[#5E6C84] truncate uppercase tracking-wider">Internal Portal</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
                {groups.map((group) => {
                    const items = navItems.filter((n) => 
                        n.group === group && 
                        (n.allowedRoles.includes('ALL') || n.allowedRoles.includes(currentRole))
                    );

                    if (items.length === 0) return null;

                    return (
                        <div key={`group-${group}`} className="mb-4">
                            {!collapsed && (
                                <p className="section-header mb-1">{groupLabels[group]}</p>
                            )}
                            {items.map((item) => {
                                const active = pathname?.startsWith(item.href);
                                
                                // Map IDs to dynamic counts
                                let badgeCount = item.badge;
                                if (item.id === 'nav-requisitions') badgeCount = counts.requisitions;
                                if (item.id === 'nav-candidates') badgeCount = counts.candidates;
                                if (item.id === 'nav-onboarding') badgeCount = counts.onboarding;
                                if (item.id === 'nav-notifications') badgeCount = counts.notifications;

                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        title={collapsed ? item.label : undefined}
                                        className={`sidebar-nav-item mb-1 relative group ${active
                                                ? 'sidebar-nav-item-active' : 'sidebar-nav-item-inactive'
                                            }`}
                                    >
                                        <item.icon
                                            size={18}
                                            className={`shrink-0 ${active ? 'text-[hsl(215,90%,47%)]' : 'text-[#42526E]'}`}
                                        />
                                        {!collapsed && (
                                            <span className="truncate text-sm">{item.label}</span>
                                        )}
                                        {!collapsed && badgeCount !== undefined && badgeCount > 0 && (
                                            <span className="ml-auto shrink-0 px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF]">
                                                {badgeCount}
                                            </span>
                                        )}
                                        {collapsed && badgeCount !== undefined && badgeCount > 0 && (
                                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                                        )}
                                        {/* Tooltip for collapsed */}
                                        {collapsed && (
                                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-lg">
                                                {item.label}
                                                {badgeCount !== undefined && badgeCount > 0 && (
                                                    <span className="ml-1.5 px-1 py-0.5 bg-white/20 rounded text-[10px]">{badgeCount}</span>
                                                )}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                            {collapsed && group !== 'admin' && (
                                <div className="my-2 mx-auto w-6 h-px bg-slate-200" />
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="border-t border-[#DFE1E6] p-2 shrink-0 bg-white/30">
                <div className={`flex items-center gap-2.5 p-2 rounded-[3px] hover:bg-[#EBECF0] cursor-pointer transition-colors group relative ${collapsed ? 'justify-center' : ''}`}>
                    {isLoading ? (
                        <div className="w-8 h-8 rounded-[3px] bg-gray-100 animate-pulse shrink-0" />
                    ) : (
                        <div className="w-8 h-8 rounded-[3px] bg-[#0C66E4] flex items-center justify-center text-white text-[11px] font-bold shrink-0 tracking-tighter">
                            {currentUser?.roles?.role_name?.substring(0, 2) || 'GU'}
                        </div>
                    )}
                    
                    {!collapsed && (
                        <div className="min-w-0 flex-1">
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-24 bg-slate-100 animate-pulse rounded mb-1" />
                                    <div className="h-3 w-16 bg-slate-50 animate-pulse rounded" />
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                                        {currentUser?.full_name || 'Guest User'}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate leading-tight">
                                        {currentUser?.roles?.role_name || (currentUser ? 'User' : 'Sign in')}
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                    {!collapsed && (
                        <LogOut size={15} className="text-slate-400 shrink-0 group-hover:text-red-500 transition-colors" />
                    )}
                    {collapsed && (
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                            Fatima Al-Rashidi · HR Manager
                        </div>
                    )}
                </div>
            </div>

            {/* Collapse Toggle */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-[#DFE1E6] shadow-sm flex items-center justify-center hover:bg-[#F4F5F7] transition-colors z-40"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {collapsed ? (
                    <ChevronRight size={12} className="text-slate-600" />
                ) : (
                    <ChevronLeft size={12} className="text-slate-600" />
                )}
            </Button>
        </aside>
    );
}