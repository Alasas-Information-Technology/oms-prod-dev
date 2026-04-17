'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Clock, ChevronRight, Inbox, Filter } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
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

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currentUser } = useAuth();
    const router = useRouter();

    const fetchNotifications = useCallback(async () => {
        if (!currentUser?.id) return;
        setIsLoading(true);
        try {
            const data = await notificationService.getUserNotifications(currentUser.id);
            setNotifications(data);
        } catch (error) {
            console.error('NotificationsPage: Error fetching notifications', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser?.id]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id: string, requisitionId?: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
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
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header Area */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#172B4D]">Notifications</h1>
                        <p className="text-sm text-[#5E6C84] mt-1">Stay updated on requisition approvals and workflow actions.</p>
                    </div>

                    <button
                        onClick={handleMarkAllAsRead}
                        disabled={notifications.every(n => n.is_read)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#F4F5F7] hover:bg-[#EBECF0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-sm text-sm font-medium text-[#172B4D] border border-[#DFE1E6]"
                    >
                        <Check size={16} />
                        Mark all as read
                    </button>
                </div>

                {/* Filters/Tabs (Optional but good for ADS look) */}
                <div className="flex gap-6 border-b border-[#DFE1E6] mb-6">
                    <button className="pb-3 text-sm font-bold text-[#0C66E4] border-b-2 border-[#0C66E4]">
                        All Notifications
                    </button>
                    <button className="pb-3 text-sm font-medium text-[#5E6C84] hover:text-[#172B4D] transition-colors">
                        Unread
                    </button>
                    <button className="pb-3 text-sm font-medium text-[#5E6C84] hover:text-[#172B4D] transition-colors">
                        Archived
                    </button>
                </div>

                {/* Notifications List Container */}
                <div className="bg-white rounded-sm border border-[#DFE1E6] shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-20 flex flex-col items-center justify-center">
                            <div className="w-8 h-8 border-4 border-[#0C66E4]/20 border-t-[#0C66E4] rounded-full animate-spin mb-4" />
                            <p className="text-sm text-[#5E6C84]">Loading your notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-[#F4F5F7] rounded-full flex items-center justify-center mb-4">
                                <Inbox size={32} className="text-[#A5ADBA]" />
                            </div>
                            <h3 className="text-lg font-bold text-[#172B4D]">All caught up!</h3>
                            <p className="text-[#5E6C84] text-sm mt-2 max-w-xs">
                                You don&apos;t have any notifications at the moment. Notifications related to your requisitions will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#F4F5F7]">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => handleMarkAsRead(n.id, n.requisition_id)}
                                    className={`group flex items-start gap-4 p-5 hover:bg-[#FAFBFC] cursor-pointer transition-all duration-200 ${!n.is_read ? 'bg-blue-50/50' : 'bg-white'}`}
                                >
                                    <div className="mt-1 shrink-0">
                                        {!n.is_read ? (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#0C66E4] shadow-[0_0_8px_rgba(12,102,228,0.5)]" />
                                        ) : (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#DFE1E6]" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className={`text-sm leading-none ${!n.is_read ? 'text-[#172B4D] font-bold' : 'text-[#42526E] font-medium'}`}>
                                                {n.title}
                                            </h4>
                                            <span className="text-[11px] text-[#8993A4] flex items-center gap-1 shrink-0">
                                                <Clock size={12} />
                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#5E6C84] leading-relaxed line-clamp-2 mb-2">
                                            {n.message}
                                        </p>
                                        
                                        {n.requisition_id && (
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#F4F5F7] rounded-sm text-[11px] font-bold text-[#42526E] group-hover:bg-[#EBECF0] transition-colors">
                                                <span>View Requisition</span>
                                                <ChevronRight size={12} />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(n.id);
                                            }}
                                            className="p-1.5 text-[#5E6C84] hover:text-[#0C66E4] hover:bg-[#0C66E4]/5 rounded-sm transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 p-6 rounded-sm bg-[#FAFBFC] border border-dashed border-[#DFE1E6] flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#DFE1E6] flex items-center justify-center text-[#5E6C84] shrink-0">
                        <Bell size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#172B4D]">Notification Settings</p>
                        <p className="text-xs text-[#5E6C84]">Configure how and when you receive alerts for your managed requisitions.</p>
                    </div>
                    <button className="ml-auto text-xs font-bold text-[#0C66E4] hover:underline">
                        Manage Settings
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
