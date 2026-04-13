'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLogo from '@/components/ui/AppLogo';
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
    const { currentUser } = useAuth();
    
    // Default to 'Guest' if currentUser isn't perfectly loaded yet
    const currentRole = currentUser?.role || 'Guest';

    useEffect(() => {
        const width = collapsed ? '68px' : '256px';
        document.documentElement.style.setProperty('--sidebar-width', width);
    }, [collapsed]);

    const groups = ['core', 'operations', 'reporting', 'admin'];

    return (
        <aside
            className="fixed left-0 top-0 h-full z-30 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out"
            style={{ width: collapsed ? '68px' : '256px' }}
            aria-label="Main navigation"
        >
            {/* Logo */}
            <div className="flex items-center h-16 px-3 border-b border-slate-200 shrink-0 overflow-hidden">
                <div className="flex items-center gap-2.5 min-w-0">
                    <AppLogo size={36} />
                    {!collapsed && (
                        <div className="min-w-0 overflow-hidden">
                            <span className="block text-sm font-bold text-slate-900 truncate leading-tight">DEIZ OMS</span>
                            <span className="block text-[10px] font-medium text-slate-400 truncate leading-tight">Al Asas IT</span>
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

                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        title={collapsed ? item.label : undefined}
                                        className={`sidebar-nav-item mb-0.5 relative group ${active
                                                ? 'sidebar-nav-item-active' : 'sidebar-nav-item-inactive'
                                            }`}
                                    >
                                        <item.icon
                                            size={18}
                                            className={`shrink-0 ${active ? 'text-[hsl(214,67%,32%)]' : 'text-slate-500'}`}
                                        />
                                        {!collapsed && (
                                            <span className="truncate text-sm">{item.label}</span>
                                        )}
                                        {!collapsed && item.badge !== undefined && item.badge > 0 && (
                                            <span className="ml-auto shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[hsl(214,67%,32%)] text-white min-w-[18px] text-center">
                                                {item.badge}
                                            </span>
                                        )}
                                        {collapsed && item.badge !== undefined && item.badge > 0 && (
                                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                                        )}
                                        {/* Tooltip for collapsed */}
                                        {collapsed && (
                                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-lg">
                                                {item.label}
                                                {item.badge !== undefined && item.badge > 0 && (
                                                    <span className="ml-1.5 px-1 py-0.5 bg-white/20 rounded text-[10px]">{item.badge}</span>
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
            <div className="border-t border-slate-200 p-2 shrink-0">
                <div className={`flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group relative ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-[hsl(214,67%,32%)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        FA
                    </div>
                    {!collapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800 truncate leading-tight">Fatima Al-Rashidi</p>
                            <p className="text-xs text-slate-400 truncate leading-tight">HR Manager</p>
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
                className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors z-40"
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