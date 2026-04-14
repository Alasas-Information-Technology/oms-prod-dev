'use client';

import React, { useState } from 'react';
import { ChevronDown, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

interface FilterState {
    stages: string[];
    departments: string[];
    locations: string[];
    budgetType: string[];
    dateRange: string;
}

const stageOptions = [
    { id: 'filter-stage-draft', value: 'Draft', color: 'bg-slate-100 text-slate-600' },
    { id: 'filter-stage-submitted', value: 'Submitted', color: 'bg-blue-50 text-blue-700' },
    { id: 'filter-stage-line-manager', value: 'Line Manager Review', color: 'bg-indigo-50 text-indigo-700' },
    { id: 'filter-stage-hod', value: 'HOD Approval', color: 'bg-violet-50 text-violet-700' },
    { id: 'filter-stage-hr', value: 'HR Review', color: 'bg-purple-50 text-purple-700' },
    { id: 'filter-stage-procurement', value: 'Procurement', color: 'bg-cyan-50 text-cyan-700' },
    { id: 'filter-stage-vendor', value: 'Vendor Submission', color: 'bg-teal-50 text-teal-700' },
    { id: 'filter-stage-blind', value: 'Blind Selection', color: 'bg-orange-50 text-orange-700' },
    { id: 'filter-stage-interview', value: 'Interview', color: 'bg-amber-50 text-amber-700' },
    { id: 'filter-stage-qualified', value: 'Qualified', color: 'bg-lime-50 text-lime-700' },
    { id: 'filter-stage-onboarding', value: 'Onboarding', color: 'bg-emerald-50 text-emerald-700' },
    { id: 'filter-stage-active', value: 'Active', color: 'bg-green-50 text-green-700' },
    { id: 'filter-stage-renewal', value: 'Renewal', color: 'bg-sky-50 text-sky-700' },
    { id: 'filter-stage-closed', value: 'Closed', color: 'bg-slate-100 text-slate-500' },
];

const departmentOptions = [
    { id: 'dept-it', value: 'Information Technology' },
    { id: 'dept-finance', value: 'Finance' },
    { id: 'dept-ops', value: 'Operations' },
    { id: 'dept-hr', value: 'Human Resources' },
    { id: 'dept-legal', value: 'Legal Affairs' },
    { id: 'dept-admin', value: 'Administration' },
    { id: 'dept-logistics', value: 'Logistics' },
    { id: 'dept-procurement', value: 'Procurement' },
];

const locationOptions = [
    { id: 'loc-onshore', value: 'Onshore – DIEZA Premises' },
    { id: 'loc-wfh', value: 'UAE Remote (WFH)' },
    { id: 'loc-vendor-office', value: 'UAE Remote (Vendor Office)' },
    { id: 'loc-offshore', value: 'Remote Abroad' },
    { id: 'loc-pre-agreed', value: 'Pre-Agreed Rate' },
];

const budgetTypeOptions = [
    { id: 'budget-budgeted', value: 'BUDGETED' },
    { id: 'budget-unallocated', value: 'UNALLOCATED' },
    { id: 'budget-unbudgeted', value: 'UNBUDGETED' },
];

const dateRangeOptions = [
    { id: 'date-all', value: '', label: 'All Time' },
    { id: 'date-7d', value: '7d', label: 'Last 7 Days' },
    { id: 'date-30d', value: '30d', label: 'Last 30 Days' },
    { id: 'date-q2', value: 'q2', label: 'Q2 FY2026' },
    { id: 'date-q1', value: 'q1', label: 'Q1 FY2026' },
    { id: 'date-fy', value: 'fy', label: 'Full FY2026' },
];

interface FilterSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-slate-100 last:border-0 pb-3 mb-3 last:pb-0 last:mb-0">
            <Button
                variant="ghost"
                onClick={() => setOpen(!open)}
                className="flex h-auto px-0 w-full justify-between py-1 text-xs font-semibold text-slate-500 uppercase hover:bg-transparent tracking-widest hover:text-slate-700 transition-colors"
            >
                {title}
                <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </Button>
            {open && <div className="mt-2">{children}</div>}
        </div>
    );
}

export default function RequisitionFilters() {
    const [filters, setFilters] = useState<FilterState>({
        stages: [],
        departments: [],
        locations: [],
        budgetType: [],
        dateRange: '',
    });

    const toggleFilter = (key: keyof FilterState, value: string) => {
        if (key === 'dateRange') {
            setFilters((prev) => ({ ...prev, dateRange: value }));
            return;
        }
        setFilters((prev) => {
            const arr = prev[key] as string[];
            return {
                ...prev,
                [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
            };
        });
    };

    const totalActive =
        filters.stages.length +
        filters.departments.length +
        filters.locations.length +
        filters.budgetType.length +
        (filters.dateRange ? 1 : 0);

    const clearAll = () =>
        setFilters({ stages: [], departments: [], locations: [], budgetType: [], dateRange: '' });

    return (
        <Card className="w-56 xl:w-64 shrink-0 p-4 sticky top-24 self-start border-none shadow-card">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">Filters</span>
                    {totalActive > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[hsl(214,67%,32%)] text-white text-[10px] font-bold">
                            {totalActive}
                        </span>
                    )}
                </div>
                {totalActive > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAll} className="flex h-auto p-0 px-2 items-center gap-1 text-xs text-destructive hover:text-destructive hover:bg-transparent font-medium">
                        <X size={11} />
                        Clear
                    </Button>
                )}
            </div>

            {/* Date Range */}
            <FilterSection title="Date Range">
                <div className="space-y-1">
                    {dateRangeOptions.map((opt) => (
                        <Button
                            variant="ghost"
                            key={opt.id}
                            onClick={() => toggleFilter('dateRange', opt.value)}
                            className={`w-full justify-start text-left px-2.5 py-1.5 h-auto rounded-lg text-xs transition-colors ${filters.dateRange === opt.value
                                    ? 'bg-[hsl(214,67%,32%)] text-white hover:bg-[hsl(214,67%,32%)] hover:text-white font-semibold'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>
            </FilterSection>

            {/* Workflow Stage */}
            <FilterSection title="Workflow Stage">
                <div className="space-y-1 max-h-52 overflow-y-auto scrollbar-thin pr-1">
                    {stageOptions.map((opt) => (
                        <div key={opt.id} className="flex items-center gap-2 group py-0.5">
                            <Checkbox
                                id={opt.id}
                                checked={filters.stages.includes(opt.value)}
                                onCheckedChange={() => toggleFilter('stages', opt.value)}
                            />
                            <label htmlFor={opt.id} className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full cursor-pointer ${opt.color}`}>
                                {opt.value}
                            </label>
                        </div>
                    ))}
                </div>
            </FilterSection>

            {/* Department */}
            <FilterSection title="Department" defaultOpen={false}>
                <div className="space-y-2">
                    {departmentOptions.map((opt) => (
                        <div key={opt.id} className="flex items-center gap-2">
                            <Checkbox
                                id={opt.id}
                                checked={filters.departments.includes(opt.value)}
                                onCheckedChange={() => toggleFilter('departments', opt.value)}
                            />
                            <label htmlFor={opt.id} className="text-xs text-slate-600 cursor-pointer">{opt.value}</label>
                        </div>
                    ))}
                </div>
            </FilterSection>

            {/* Work Location */}
            <FilterSection title="Work Location" defaultOpen={false}>
                <div className="space-y-2">
                    {locationOptions.map((opt) => (
                        <div key={opt.id} className="flex items-center gap-2">
                            <Checkbox
                                id={opt.id}
                                checked={filters.locations.includes(opt.value)}
                                onCheckedChange={() => toggleFilter('locations', opt.value)}
                            />
                            <label htmlFor={opt.id} className="text-xs text-slate-600 cursor-pointer">{opt.value}</label>
                        </div>
                    ))}
                </div>
            </FilterSection>

            {/* Budget Type */}
            <FilterSection title="Budget Type" defaultOpen={false}>
                <div className="space-y-2">
                    {budgetTypeOptions.map((opt) => (
                        <div key={opt.id} className="flex items-center gap-2">
                            <Checkbox
                                id={opt.id}
                                checked={filters.budgetType.includes(opt.value)}
                                onCheckedChange={() => toggleFilter('budgetType', opt.value)}
                            />
                            <label htmlFor={opt.id} className="text-xs text-slate-600 cursor-pointer">{opt.value}</label>
                        </div>
                    ))}
                </div>
            </FilterSection>

            {/* Active Filters Summary */}
            {totalActive > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 mb-2">Active filters:</p>
                    <div className="flex flex-wrap gap-1">
                        {filters.stages.map((s) => (
                            <span key={`active-stage-${s}`} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-semibold">
                                {s}
                                <Button variant="ghost" className="h-auto p-0 hover:bg-transparent hover:text-purple-900" onClick={() => toggleFilter('stages', s)}>
                                    <X size={8} />
                                </Button>
                            </span>
                        ))}
                        {filters.departments.map((d) => (
                            <span key={`active-dept-${d}`} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">
                                {d.split(' ')[0]}
                                <Button variant="ghost" className="h-auto p-0 hover:bg-transparent hover:text-blue-900" onClick={() => toggleFilter('departments', d)}>
                                    <X size={8} />
                                </Button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
}