'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Search, ChevronDown, HelpCircle, Settings, LogOut, User, Command } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCommand } from '@/contexts/CommandContext';
import { notificationService } from '@/lib/services/notificationService';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    recipient_id: string;
    requisition_id?: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export default function Topbar() {
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { currentUser, logout, isLoading } = useAuth();
    const { toggle } = useCommand();
    const router = useRouter();

    const fetchNotifications = useCallback(async () => {
        if (!currentUser?.id) return;
        try {
            const [data, count] = await Promise.all([
                notificationService.getUserNotifications(currentUser.id),
                notificationService.getUnreadCount(currentUser.id)
            ]);
            setNotifications(data.slice(0, 5));
            setUnreadCount(count);
        } catch (error) {
            console.error('Topbar: Error fetching notifications', error);
        }
    }, [currentUser?.id]);

    useEffect(() => {
        if (!currentUser?.id) return;

        fetchNotifications();

        // Subscribe to real-time updates
        const subscription = notificationService.subscribeToNotifications(currentUser.id, (payload: any) => {
            if (payload.eventType === 'INSERT') {
                setUnreadCount(prev => prev + 1);
                fetchNotifications(); // Refresh list to get the new item
            } else if (payload.eventType === 'UPDATE') {
                fetchNotifications(); // Refresh to update list state (read/unread)
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [currentUser, fetchNotifications]);

    const handleMarkAsRead = async (id: string, requisitionId?: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifOpen(false);
            if (requisitionId) {
                router.push(`/requisition-management/${requisitionId}`);
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!currentUser?.id) return;
        try {
            await notificationService.markAllAsRead(currentUser.id);
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    return (
        <header
            className="fixed top-0 right-0 left-0 z-20 h-16 bg-white border-b border-[#DFE1E6] flex items-center px-4 gap-4 transition-all duration-300 ease-in-out"
            style={{ paddingLeft: 'calc(var(--sidebar-width) + 16px)' }}
        >
            {/* Search */}
            <div className="flex-1 max-w-sm">
                <button 
                    onClick={toggle}
                    className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-sm bg-[#FAFBFC] border border-[#DFE1E6] text-[13px] text-[#42526E] hover:bg-[#F4F5F7] hover:border-[#C1C7D0] transition-all group focus:bg-white focus:ring-2 focus:ring-primary"
                >
                    <div className="flex items-center gap-2.5">
                        <Search size={14} className="text-[#42526E] opacity-70 group-hover:opacity-100 transition-opacity" />
                        <span>Search OMS&hellip;</span>
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] border border-[#DFE1E6] bg-white shadow-sm group-hover:border-[#C1C7D0] transition-colors">
                        <Command size={10} className="text-[#42526E]" />
                        <span className="text-[10px] uppercase font-bold text-[#42526E] tracking-tighter">K</span>
                    </div>
                </button>
            </div>
            
            <div className="flex items-center gap-2 ml-auto">

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className={`btn-ghost p-2 relative transition-colors ${notifOpen ? 'bg-[#F4F5F7] text-[#0C66E4]' : ''}`}
                        aria-label="Notifications"
                    >
                        <Bell size={18} className={unreadCount > 0 ? "text-[#0C66E4]" : "text-slate-500"} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 border-2 border-white text-[9px] font-bold text-white flex items-center justify-center animate-in zoom-in duration-200">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {notifOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-[4px] border border-[#DFE1E6] shadow-modal animate-fade-in z-50 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 bg-[#F4F5F7]/30 border-b border-[#DFE1E6]">
                                    <h3 className="text-[11px] font-bold text-[#42526E] uppercase tracking-wider">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={handleMarkAllAsRead}
                                            className="text-[11px] text-[#0C66E4] font-bold cursor-pointer hover:underline bg-transparent border-none p-0"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                                    {notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                                                <Bell size={20} className="text-slate-300" />
                                            </div>
                                            <p className="text-xs font-medium text-slate-500">No new notifications</p>
                                            <p className="text-[10px] text-slate-400 mt-1">We&apos;ll let you know when something requires your attention.</p>
                                        </div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                onClick={() => handleMarkAsRead(n.id, n.requisition_id)}
                                                className={`flex gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-[#F4F5F7] last:border-0 hover:bg-[#F4F5F7]/50 ${!n.is_read ? 'bg-blue-50/50' : 'bg-white'}`}
                                            >
                                                <div className="pt-1.5 shrink-0">
                                                    {!n.is_read ? (
                                                        <div className="w-2 h-2 rounded-full bg-[#0C66E4]" />
                                                    ) : (
                                                        <div className="w-2 h-2" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className={`text-xs leading-snug ${!n.is_read ? 'text-[#172B4D] font-bold' : 'text-[#42526E] font-medium'}`}>{n.title}</p>
                                                    <p className="text-[11px] text-[#5E6C84] mt-0.5 line-clamp-2">{n.message}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="px-4 py-3 border-t border-[#DFE1E6] bg-[#FAFBFC]">
                                    <Link 
                                        href="/notifications" 
                                        onClick={() => setNotifOpen(false)}
                                        className="text-[11px] text-[#0C66E4] font-bold hover:underline w-full flex items-center justify-center gap-2"
                                    >
                                        View all notifications
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-slate-200 mx-1" />

                {/* User */}
                <div className="relative">
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-sm hover:bg-[#F4F5F7] transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-sm bg-[#0C66E4] flex items-center justify-center text-white text-[11px] font-bold uppercase shrink-0">
                            {isLoading ? (
                                <div className="w-full h-full rounded-sm bg-white/20 animate-pulse" />
                            ) : (
                                currentUser?.roles?.role_name ? currentUser.roles.role_name.substring(0, 2) : 'GU'
                            )}
                        </div>
                        <div className="text-left hidden sm:block">
                            {isLoading ? (
                                <>
                                    <div className="h-3 w-24 bg-slate-100 animate-pulse rounded mb-1" />
                                    <div className="h-2 w-16 bg-slate-50 animate-pulse rounded" />
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-semibold text-slate-800 leading-tight max-w-[140px] truncate">{currentUser?.full_name || 'Guest User'}</p>
                                    <p className="text-[10px] text-slate-400 leading-tight max-w-[140px] truncate">{currentUser?.department || (currentUser ? 'No Department' : 'Session Expired')}</p>
                                </>
                            )}
                        </div>
                        <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                    </button>

                    {profileOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-sm border border-[#DFE1E6] shadow-modal animate-fade-in z-50 py-1">
                                <div className="px-4 py-2.5 border-b border-[#DFE1E6] mb-1">
                                    <p className="text-[10px] uppercase font-bold text-[#5E6C84] tracking-wider mb-0.5">Account</p>
                                    <p className="text-xs text-[#172B4D] font-medium truncate">{currentUser?.email || 'guest@example.com'}</p>
                                </div>
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
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}