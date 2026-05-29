'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Laptop, Armchair, Wallet, Landmark, Users, Briefcase, FileText, UserCheck, Clock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RequisitionRecord } from '../../components/ComprehensiveRequisitionForm';

interface RequisitionSpecsProps {
    data: RequisitionRecord | null;
}

export default function RequisitionSpecs({ data }: RequisitionSpecsProps) {
    if (!data) return null;

    const sections = [
        {
            title: 'Resource & Role Details',
            icon: <Users size={14} className="text-[#0C66E4]" />,
            items: [
                { label: 'Role Profile', value: data.job_profile || 'N/A', icon: <Briefcase size={14} /> },
                { label: 'Resource Count', value: data.num_resources || 1, icon: <Users size={14} /> },
                { label: 'Salary Grade', value: data.salary_grade || 'N/A', icon: <ShieldCheck size={14} /> },
                { label: 'Department', value: data.departments?.dept_name || 'N/A', icon: <Landmark size={14} /> },
            ]
        },
        {
            title: 'Engagement Parameters',
            icon: <Clock size={14} className="text-[#0C66E4]" />,
            items: [
                { label: 'Engagement Period', value: `${data.engagement_period || 0} ${data.engagement_unit || 'Months'}`, icon: <Calendar size={14} /> },
                { label: 'Target Start', value: data.target_start_date ? new Date(data.target_start_date).toLocaleDateString() : 'N/A', icon: <Calendar size={14} /> },
                { label: 'Expected End', value: data.expected_end_date ? new Date(data.expected_end_date).toLocaleDateString() : 'N/A', icon: <Calendar size={14} /> },
                { label: 'Work Location', value: data.work_location || 'N/A', icon: <MapPin size={14} /> },
            ]
        },
        {
            title: 'Governance & Stakes',
            icon: <UserCheck size={14} className="text-[#0C66E4]" />,
            items: [
                { label: 'Line Manager', value: data.manager?.full_name || 'N/A', icon: <UserCheck size={14} /> },
                { label: 'Requestor', value: data.requestor?.full_name || 'N/A', icon: <UserCheck size={14} /> },
                { label: 'Main Interviewer', value: data.interviewer?.full_name || 'N/A', icon: <UserCheck size={14} /> },
                { label: 'Workflow Stage', value: data.workflow_stages?.stage_name || 'Initiation', icon: <ShieldCheck size={14} /> },
            ]
        }
    ];

    const hardwareItems = [
        { label: 'Laptop', active: data.req_laptop },
        { label: 'Mobile Device', active: data.req_mobile_phone },
        { label: 'Email Access', active: data.req_email_access },
        { label: 'Software Licenses', active: data.req_software_licenses },
    ];

    return (
        <div className="space-y-6">
            {/* Business Justification - High Visibility */}
            {data.justification && (
                <Card className="border border-[#DFE1E6] shadow-atlassian overflow-hidden rounded-sm">
                    <CardHeader className="bg-[#F4F5F7] border-b border-[#DFE1E6] py-3">
                        <CardTitle className="text-xs font-bold text-[#42526E] uppercase tracking-wider flex items-center gap-2">
                            <FileText size={14} className="text-[#0C66E4]" />
                            Business Justification
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                            {data.justification}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Main Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.slice(0, 2).map((section, idx) => (
                    <Card key={idx} className="border border-[#DFE1E6] shadow-atlassian overflow-hidden rounded-sm">
                        <CardHeader className="bg-[#F4F5F7] border-b border-[#DFE1E6] py-3">
                            <CardTitle className="text-xs font-bold text-[#42526E] uppercase tracking-wider flex items-center gap-2">
                                {section.icon}
                                {section.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                {section.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-start border-b border-slate-50 last:border-0 pb-2">
                                        <div className="flex items-center gap-2 text-[#5E6C84]">
                                            {item.icon && React.cloneElement(item.icon as React.ReactElement, { size: 12, className: 'text-slate-400' })}
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-900">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Logistics & Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card className="border border-[#DFE1E6] shadow-atlassian overflow-hidden rounded-sm">
                    <CardHeader className="bg-[#F4F5F7] border-b border-[#DFE1E6] py-3">
                        <CardTitle className="text-xs font-bold text-[#42526E] uppercase tracking-wider flex items-center gap-2">
                            <Armchair size={14} className="text-[#0C66E4]" />
                            Logistics & Workspace
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start border-b border-slate-50 pb-2">
                                <span className="text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider">Seating Status</span>
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                                    data.seating_available ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                                )}>
                                    {data.seating_available ? 'Available' : 'Plan Required'}
                                </span>
                            </div>
                            {data.seating_location && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider">Allocation/Location</p>
                                    <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                        <MapPin size={12} className="text-slate-400" />
                                        {data.seating_location}
                                    </p>
                                </div>
                            )}
                            {data.accommodation_plan && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider">Accommodation Strategy</p>
                                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic">
                                        {data.accommodation_plan}
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        <div className="pt-2 border-t border-slate-100">
                             <p className="text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider mb-2">Hardware Provisions</p>
                             <div className="flex flex-wrap gap-2">
                                {hardwareItems.map((item, i) => (
                                    <span key={i} className={cn(
                                        "px-2 py-1 rounded-[3px] text-[10px] font-bold border",
                                        item.active 
                                            ? "bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]" 
                                            : "bg-slate-50 text-slate-400 border-slate-200 opacity-60"
                                    )}>
                                        {item.label}
                                    </span>
                                ))}
                             </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Governance Stakeholders */}
                <Card className="border border-[#DFE1E6] shadow-atlassian overflow-hidden rounded-sm">
                    <CardHeader className="bg-[#F4F5F7] border-b border-[#DFE1E6] py-3">
                        <CardTitle className="text-xs font-bold text-[#42526E] uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck size={14} className="text-[#0C66E4]" />
                            Governance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {sections[2].items.map((item, i) => (
                                <div key={i} className="flex justify-between items-start border-b border-slate-50 last:border-0 pb-2">
                                    <div className="flex items-center gap-2 text-[#5E6C84]">
                                        {React.cloneElement(item.icon as React.ReactElement, { size: 12, className: 'text-slate-400' })}
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Financial Overview */}
             <Card className="border border-[#DFE1E6] shadow-atlassian overflow-hidden rounded-sm">
                <CardHeader className="bg-[#F4F5F7] border-b border-[#DFE1E6] py-3">
                    <CardTitle className="text-xs font-bold text-[#42526E] uppercase tracking-wider flex items-center gap-2">
                        <Wallet size={14} className="text-[#0C66E4]" />
                        Financial Overview
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider">Funding Category</p>
                                <div className="flex items-center gap-2 font-bold">
                                    <Landmark size={14} className="text-[#36B37E]" />
                                    <span className="text-sm text-[#006644]">{data.funding_category || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider">Budget Allocation</p>
                                <p className="text-xl font-mono font-bold text-[#172B4D]">
                                    {data.reserved_budget_aed?.toLocaleString() || '0'} <span className="text-xs text-[#5E6C84]">AED</span>
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <p className="text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider">Supporting Documents</p>
                            <div className="flex gap-2">
                                {data.job_description_path ? (
                                    <a 
                                        href={data.job_description_path} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-blue-50 text-[hsl(214,67%,32%)] border border-blue-100 text-[10px] font-bold hover:bg-blue-100 transition-colors"
                                    >
                                        <FileText size={12} />
                                        VIEW JD
                                    </a>
                                ) : (
                                    <span className="text-[10px] text-slate-400 italic">No JD uploaded</span>
                                )}
                                {(data.supporting_attachments?.length || 0) > 0 && (
                                    <div className="px-3 py-1.5 rounded-sm bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold">
                                        {data.supporting_attachments.length} ATTACHMENTS
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
