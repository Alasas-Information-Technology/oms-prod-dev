'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Search, ChevronDown, HelpCircle, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Topbar() {
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { currentUser, logout } = useAuth();

    const notifications = [
        { id: 'notif-001', type: 'approval', message: 'Req #OMS-2026-0847 awaiting your HR approval', time: '8m ago', urgent: true },
        { id: 'notif-002', type: 'sla', message: 'SLA breach risk: OMS-2026-0831 auto-closes in 3 days', time: '42m ago', urgent: true },
        { id: 'notif-003', type: 'vendor', message: 'TechBridge Solutions submitted 8 CVs for OMS-2026-0839', time: '1h ago', urgent: false },
        { id: 'notif-004', type: 'budget', message: 'Budget amendment approved — AED 45,000 released for OMS-2026-0821', time: '2h ago', urgent: false },
        { id: 'notif-005', type: 'onboarding', message: 'Emirates ID expiring in 14 days: Candidate Khalid M.', time: '3h ago', urgent: false },
    ];

    return (
        <header
            className="fixed top-0 right-0 left-0 z-20 h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-4"
            style={{ paddingLeft: 'calc(var(--sidebar-width) + 16px)' }}
        >
            {/* Search */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search requisitions, vendors, candidates… (⌘K)"
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(214,67%,32%)]/20 focus:border-[hsl(214,67%,32%)] transition-all"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
                {/* Help */}
                <button className="btn-ghost p-2" aria-label="Help">
                    <HelpCircle size={18} className="text-slate-500" />
                </button>

                {/* Settings */}
                <Link href="/requisition-management" className="btn-ghost p-2" aria-label="Settings">
                    <Settings size={18} className="text-slate-500" />
                </Link>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="btn-ghost p-2 relative"
                        aria-label="Notifications"
                    >
                        <Bell size={18} className="text-slate-500" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                    </button>

                    {notifOpen && (
                        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl border border-slate-200 shadow-modal animate-fade-in z-50">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                                <span className="text-xs text-[hsl(214,67%,32%)] font-medium cursor-pointer hover:underline">
                                    Mark all read
                                </span>
                            </div>
                            <div className="max-h-80 overflow-y-auto scrollbar-thin">
                                {notifications?.map((n) => (
                                    <div
                                        key={n?.id}
                                        className={`flex gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${n?.urgent ? 'bg-red-50/50' : ''}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n?.urgent ? 'bg-red-500' : 'bg-slate-300'}`} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-slate-700 leading-snug">{n?.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{n?.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-2.5 border-t border-slate-100">
                                <button className="text-xs text-[hsl(214,67%,32%)] font-medium hover:underline w-full text-center">
                                    View all notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-slate-200 mx-1" />

                {/* User */}
                <div className="relative">
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-[hsl(214,67%,32%)] flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
                            {currentUser?.role ? currentUser.role.substring(0, 2) : 'FA'}
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-sm font-semibold text-slate-800 leading-tight max-w-[140px] truncate">{currentUser?.role || 'Guest User'}</p>
                            <p className="text-[10px] text-slate-400 leading-tight max-w-[140px] truncate">{currentUser?.department || 'Session Expired'}</p>
                        </div>
                        <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-modal animate-fade-in z-50 py-1">
                            <div className="px-4 py-2.5 border-b border-slate-100 mb-1">
                                <p className="text-xs text-slate-500 font-medium truncate">{currentUser?.email || 'guest@deiz.ae'}</p>
                            </div>
                            <button onClick={() => setProfileOpen(false)} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[hsl(214,67%,32%)] transition-colors text-left">
                                <User size={15} />
                                Profile Settings
                            </button>
                            <button onClick={() => setProfileOpen(false)} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[hsl(214,67%,32%)] transition-colors text-left">
                                <Settings size={15} />
                                Preferences
                            </button>
                            <div className="h-px bg-slate-100 my-1.5" />
                            <button
                                onClick={() => {
                                    setProfileOpen(false);
                                    logout();
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                            >
                                <LogOut size={15} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}