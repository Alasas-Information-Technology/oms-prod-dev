'use client';

import React, { useState } from 'react';
import {
    Search,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Eye,
    Edit3,
    ArrowRight,
    Trash2,
    MoreHorizontal,
    AlertTriangle,
    CheckSquare,
    Square,
    Columns,
    X,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';


type WorkflowStage =
    | 'Draft' | 'Submitted' | 'Line Manager Review' | 'HOD Approval' | 'HR Review' | 'Procurement' | 'Vendor Submission' | 'Blind Selection' | 'Interview' | 'Qualified' | 'Onboarding' | 'Active' | 'Renewal' | 'Terminated' | 'Closed';

type LocationType = 'Onshore – DIEZA Premises' | 'UAE Remote (WFH)' | 'UAE Remote (Vendor Office)' | 'Remote Abroad' | 'Pre-Agreed Rate';
type BudgetType = 'Budgeted' | 'Unallocated' | 'Unbudgeted';

interface Requisition {
    id: string;
    reqId: string;
    title: string;
    department: string;
    requestor: string;
    stage: WorkflowStage;
    stageNum: number;
    location: LocationType;
    budgetAED: number;
    budgetType: BudgetType;
    vendorCount: number;
    candidateCount: number;
    createdDate: string;
    slaRisk: boolean;
    emiratisationFlag: boolean;
    lpoGenerated: boolean;
}

// Backend integration point: GET /api/requisitions?page=1&limit=12&sort=createdDate&order=desc
const mockRequisitions: Requisition[] = [
    {
        id: 'req-001',
        reqId: 'OMS-2026-0852',
        title: 'Legal Counsel – Contract Review',
        department: 'Legal Affairs',
        requestor: 'Sara Al-Mazrouei',
        stage: 'HR Review',
        stageNum: 5,
        location: 'Onshore – DIEZA Premises',
        budgetAED: 220000,
        budgetType: 'Budgeted',
        vendorCount: 0,
        candidateCount: 0,
        createdDate: '09/04/2026',
        slaRisk: false,
        emiratisationFlag: false,
        lpoGenerated: false,
    },
    {
        id: 'req-002',
        reqId: 'OMS-2026-0847',
        title: 'Senior IT Security Analyst',
        department: 'Information Technology',
        requestor: 'Khalid Al-Mansoori',
        stage: 'HR Review',
        stageNum: 5,
        location: 'Onshore – DIEZA Premises',
        budgetAED: 185000,
        budgetType: 'Budgeted',
        vendorCount: 0,
        candidateCount: 0,
        createdDate: '07/04/2026',
        slaRisk: false,
        emiratisationFlag: false,
        lpoGenerated: false,
    },
    {
        id: 'req-003',
        reqId: 'OMS-2026-0843',
        title: 'Data Governance Specialist',
        department: 'Information Technology',
        requestor: 'Khalid Al-Mansoori',
        stage: 'Procurement',
        stageNum: 6,
        location: 'UAE Remote (WFH)',
        budgetAED: 165000,
        budgetType: 'Budgeted',
        vendorCount: 3,
        candidateCount: 0,
        createdDate: '04/04/2026',
        slaRisk: false,
        emiratisationFlag: false,
        lpoGenerated: false,
    },
    {
        id: 'req-004',
        reqId: 'OMS-2026-0841',
        title: 'Administrative Support Officer',
        department: 'Administration',
        requestor: 'Mohammed Al-Suwaidi',
        stage: 'HOD Approval',
        stageNum: 4,
        location: 'Onshore – DIEZA Premises',
        budgetAED: 72000,
        budgetType: 'Budgeted',
        vendorCount: 0,
        candidateCount: 0,
        createdDate: '01/04/2026',
        slaRisk: false,
        emiratisationFlag: false,
        lpoGenerated: false,
    },
    {
        id: 'req-005',
        reqId: 'OMS-2026-0839',
        title: 'Logistics Coordinator (x2)',
        department: 'Operations',
        requestor: 'Ahmed Al-Dhaheri',
        stage: 'Vendor Submission',
        stageNum: 7,
        location: 'Onshore – DIEZA Premises',
        budgetAED: 98000,
        budgetType: 'Budgeted',
        vendorCount: 4,
        candidateCount: 8,
        createdDate: '10/03/2026',
        slaRisk: true,
        emiratisationFlag: true,
        lpoGenerated: false,
    },
    {
        id: 'req-006',
        reqId: 'OMS-2026-0835',
        title: 'Financial Reporting Analyst',
        department: 'Finance',
        requestor: 'Noura Al-Ketbi',
        stage: 'Onboarding',
        stageNum: 11,
        location: 'Onshore – DIEZA Premises',
        budgetAED: 142000,
        budgetType: 'Budgeted',
        vendorCount: 3,
        candidateCount: 12,
        createdDate: '18/02/2026',
        slaRisk: false,
        emiratisationFlag: false,
        lpoGenerated: true,
    },
    {
        id: 'req-007',
        reqId: 'OMS-2026-0831',
        title: 'Business Intelligence Analyst',
        department: 'Finance',
        requestor: 'Noura Al-Ketbi',
        stage: 'HR Review',
        stageNum: 5,
        location: 'UAE Remote (WFH)',
        budgetAED: 158000,
        budgetType: 'Unallocated',
        vendorCount: 0,
        candidateCount: 0,
        createdDate: '12/03/2026',
        slaRisk: true,
        emiratisationFlag: false,
        lpoGenerated: false,
    },
    {
        id: 'req-008',
        reqId: 'OMS-2026-0828',
        title: 'Cloud Infrastructure Engineer',
        department: 'Information Technology',
        requestor: 'Khalid Al-Mansoori',
        stage: 'Interview',
        stageNum: 9,
        location: 'UAE Remote (Vendor Office)',
        budgetAED: 210000,
        budgetType: 'Budgeted',
        vendorCount: 2,
        candidateCount: 6,
        createdDate: '05/03/2026',
        slaRisk: false,
        emiratisationFlag: false,
        lpoGenerated: false,
    },
    {
        id: 'req-009',
        reqId: 'OMS-2026-0821',
        title: 'Compliance & Risk Officer',
        department: 'Legal Affairs',
        requestor: 'Sara Al-Mazrouei',
        stage: 'Active',
        stageNum: 12,
        location: 'Onshore – DIEZA Premises',
        budgetAED: 195000,
        budgetType: 'Budgeted',
        vendorCount: 1,
        candidateCount: 4,
        createdDate: '14/01/2026',
        slaRisk: false,
        emiratisationFlag: false,
        lpoGenerated: true,
    },
    {
        id: 'req-010',
        reqId: 'OMS-2026-0815',
        title: 'Procurement Specialist (x3)',
        department: 'Procurement',
        requestor: 'Rashid Al-Bloushi',
        stage: 'Renewal',
        stageNum: 13,
        location: 'Onshore – DIEZA Premises',
        budgetAED: 267000,
        budgetType: 'Budgeted',
        vendorCount: 2,
        candidateCount: 9,
        createdDate: '02/01/2026',
        slaRisk: false,
        emiratisationFlag: true,
        lpoGenerated: true,
    },
    {
        id: 'req-011',
        reqId: 'OMS-2026-0807',
        title: 'HR Business Partner',
        department: 'Human Resources',
        requestor: 'Fatima Al-Rashidi',
        stage: 'Active',
        stageNum: 12,
        location: 'Onshore – DIEZA Premises',
        budgetAED: 148000,
        budgetType: 'Budgeted',
        vendorCount: 1,
        candidateCount: 7,
        createdDate: '10/12/2025',
        slaRisk: false,
        emiratisationFlag: false,
        lpoGenerated: true,
    },
    {
        id: 'req-012',
        reqId: 'OMS-2026-0798',
        title: 'Operations Analyst – Logistics',
        department: 'Logistics',
        requestor: 'Ahmed Al-Dhaheri',
        stage: 'Terminated',
        stageNum: 14,
        location: 'Remote Abroad',
        budgetAED: 88000,
        budgetType: 'Budgeted',
        vendorCount: 2,
        candidateCount: 5,
        createdDate: '18/11/2025',
        slaRisk: false,
        emiratisationFlag: false,
        lpoGenerated: true,
    },
];

const stageStyles: Record<WorkflowStage, { bg: string; dot: string; text: string }> = {
    'Draft': { bg: 'bg-slate-100', dot: 'bg-slate-400', text: 'text-slate-600' },
    'Submitted': { bg: 'bg-blue-50', dot: 'bg-blue-500', text: 'text-blue-700' },
    'Line Manager Review': { bg: 'bg-indigo-50', dot: 'bg-indigo-500', text: 'text-indigo-700' },
    'HOD Approval': { bg: 'bg-violet-50', dot: 'bg-violet-500', text: 'text-violet-700' },
    'HR Review': { bg: 'bg-purple-50', dot: 'bg-purple-500', text: 'text-purple-700' },
    'Procurement': { bg: 'bg-cyan-50', dot: 'bg-cyan-500', text: 'text-cyan-700' },
    'Vendor Submission': { bg: 'bg-teal-50', dot: 'bg-teal-500', text: 'text-teal-700' },
    'Blind Selection': { bg: 'bg-orange-50', dot: 'bg-orange-500', text: 'text-orange-700' },
    'Interview': { bg: 'bg-amber-50', dot: 'bg-amber-500', text: 'text-amber-700' },
    'Qualified': { bg: 'bg-lime-50', dot: 'bg-lime-500', text: 'text-lime-700' },
    'Onboarding': { bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-700' },
    'Active': { bg: 'bg-green-50', dot: 'bg-green-500', text: 'text-green-700' },
    'Renewal': { bg: 'bg-sky-50', dot: 'bg-sky-500', text: 'text-sky-700' },
    'Terminated': { bg: 'bg-red-50', dot: 'bg-red-500', text: 'text-red-700' },
    'Closed': { bg: 'bg-slate-100', dot: 'bg-slate-400', text: 'text-slate-500' },
};

const locationBadge: Record<LocationType, { bg: string; text: string; short: string }> = {
    'Onshore – DIEZA Premises': { bg: 'bg-blue-50', text: 'text-blue-700', short: 'Onshore' },
    'UAE Remote (WFH)': { bg: 'bg-teal-50', text: 'text-teal-700', short: 'WFH' },
    'UAE Remote (Vendor Office)': { bg: 'bg-cyan-50', text: 'text-cyan-700', short: 'Vendor Office' },
    'Remote Abroad': { bg: 'bg-purple-50', text: 'text-purple-700', short: 'Offshore' },
    'Pre-Agreed Rate': { bg: 'bg-slate-100', text: 'text-slate-600', short: 'Pre-Agreed' },
};

const budgetBadge: Record<BudgetType, { bg: string; text: string }> = {
    'Budgeted': { bg: 'bg-green-50', text: 'text-green-700' },
    'Unallocated': { bg: 'bg-amber-50', text: 'text-amber-700' },
    'Unbudgeted': { bg: 'bg-red-50', text: 'text-red-700' },
};

type SortKey = keyof Requisition;
type SortDir = 'asc' | 'desc' | null;

const columns = [
    { id: 'col-reqId', key: 'reqId' as SortKey, label: 'Req ID', sortable: true, defaultVisible: true },
    { id: 'col-title', key: 'title' as SortKey, label: 'Position Title', sortable: true, defaultVisible: true },
    { id: 'col-department', key: 'department' as SortKey, label: 'Department', sortable: true, defaultVisible: true },
    { id: 'col-requestor', key: 'requestor' as SortKey, label: 'Requestor', sortable: true, defaultVisible: true },
    { id: 'col-stage', key: 'stage' as SortKey, label: 'Workflow Stage', sortable: true, defaultVisible: true },
    { id: 'col-location', key: 'location' as SortKey, label: 'Work Location', sortable: false, defaultVisible: true },
    { id: 'col-budget', key: 'budgetAED' as SortKey, label: 'Budget (AED)', sortable: true, defaultVisible: true },
    { id: 'col-budgetType', key: 'budgetType' as SortKey, label: 'Budget Type', sortable: false, defaultVisible: true },
    { id: 'col-vendors', key: 'vendorCount' as SortKey, label: 'Vendors', sortable: true, defaultVisible: true },
    { id: 'col-candidates', key: 'candidateCount' as SortKey, label: 'Candidates', sortable: true, defaultVisible: true },
    { id: 'col-created', key: 'createdDate' as SortKey, label: 'Created', sortable: true, defaultVisible: true },
];

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

export default function RequisitionTable() {
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('createdDate');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [selected, setSelected] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [visibleCols, setVisibleCols] = useState<string[]>(columns.map((c) => c.id));
    const [showColMenu, setShowColMenu] = useState(false);
    const [stageDropdownId, setStageDropdownId] = useState<string | null>(null);
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);

    // Filter + sort
    const filtered = mockRequisitions.filter((r) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            r.reqId.toLowerCase().includes(s) ||
            r.title.toLowerCase().includes(s) ||
            r.department.toLowerCase().includes(s) ||
            r.requestor.toLowerCase().includes(s) ||
            r.stage.toLowerCase().includes(s)
        );
    });

    const sorted = [...filtered].sort((a, b) => {
        if (!sortDir) return 0;
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === 'number' && typeof bv === 'number') {
            return sortDir === 'asc' ? av - bv : bv - av;
        }
        return sortDir === 'asc'
            ? String(av).localeCompare(String(bv))
            : String(bv).localeCompare(String(av));
    });

    const totalPages = Math.ceil(sorted.length / itemsPerPage);
    const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const toggleSelect = (id: string) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
    };

    const toggleSelectAll = () => {
        if (selected.length === paginated.length) {
            setSelected([]);
        } else {
            setSelected(paginated.map((r) => r.id));
        }
    };

    const toggleCol = (id: string) => {
        setVisibleCols((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    const SortIcon = ({ colKey }: { colKey: SortKey }) => {
        if (sortKey !== colKey) return <ChevronsUpDown size={12} className="text-slate-300" />;
        if (sortDir === 'asc') return <ChevronUp size={12} className="text-[hsl(214,67%,32%)]" />;
        if (sortDir === 'desc') return <ChevronDown size={12} className="text-[hsl(214,67%,32%)]" />;
        return <ChevronsUpDown size={12} className="text-slate-300" />;
    };

    const stageOptions: WorkflowStage[] = [
        'Draft', 'Submitted', 'Line Manager Review', 'HOD Approval', 'HR Review',
        'Procurement', 'Vendor Submission', 'Blind Selection', 'Interview',
        'Qualified', 'Onboarding', 'Active', 'Renewal', 'Terminated', 'Closed',
    ];

    const handleStageChange = (reqId: string, newStage: WorkflowStage) => {
        setStageDropdownId(null);
        toast.success(`${reqId} stage updated to "${newStage}"`);
    };

    const handleBulkApprove = () => {
        toast.success(`${selected.length} requisitions approved and advanced`);
        setSelected([]);
    };

    const handleBulkExport = () => {
        toast.info(`Exporting ${selected.length} requisitions to Excel…`);
        setSelected([]);
    };

    const handleBulkDelete = () => {
        toast.error(`${selected.length} requisitions cancelled — HOD notified`);
        setSelected([]);
    };

    const visibleColumns = columns.filter((c) => visibleCols.includes(c.id));

    return (
        <div className="flex flex-col gap-4">
            {/* Search + Column Toggle */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, title, department, requestor…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(214,67%,32%)]/20 focus:border-[hsl(214,67%,32%)] transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                        {filtered.length} of {mockRequisitions.length} requisitions
                    </span>

                    {/* Column Visibility */}
                    <div className="relative">
                        <button
                            onClick={() => setShowColMenu(!showColMenu)}
                            className="btn-ghost text-xs px-3 py-2"
                        >
                            <Columns size={14} />
                            Columns
                        </button>
                        {showColMenu && (
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-slate-200 shadow-modal z-50 p-3 animate-fade-in">
                                <p className="text-xs font-semibold text-slate-500 mb-2">Toggle Columns</p>
                                <div className="space-y-1.5">
                                    {columns.map((col) => (
                                        <label key={`col-toggle-${col.id}`} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={visibleCols.includes(col.id)}
                                                onChange={() => toggleCol(col.id)}
                                                className="w-3.5 h-3.5 rounded border-slate-300 text-[hsl(214,67%,32%)]"
                                            />
                                            <span className="text-xs text-slate-600">{col.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selected.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[hsl(214,67%,32%)] text-white animate-slide-up">
                    <span className="text-sm font-semibold">{selected.length} selected</span>
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={handleBulkApprove}
                            className="px-3 py-1.5 rounded-lg bg-white/15 text-white text-xs font-semibold hover:bg-white/25 transition-colors"
                        >
                            Approve Selected
                        </button>
                        <button
                            onClick={handleBulkExport}
                            className="px-3 py-1.5 rounded-lg bg-white/15 text-white text-xs font-semibold hover:bg-white/25 transition-colors"
                        >
                            Export
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className="px-3 py-1.5 rounded-lg bg-red-500/80 text-white text-xs font-semibold hover:bg-red-500 transition-colors"
                        >
                            Cancel Requisitions
                        </button>
                        <button
                            onClick={() => setSelected([])}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <X size={13} />
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="w-10 px-3 py-3 text-left">
                                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600 transition-colors">
                                        {selected.length === paginated.length && paginated.length > 0 ? (
                                            <CheckSquare size={15} className="text-[hsl(214,67%,32%)]" />
                                        ) : (
                                            <Square size={15} />
                                        )}
                                    </button>
                                </th>
                                {visibleColumns.map((col) => (
                                    <th
                                        key={col.id}
                                        className={`px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-slate-700 select-none' : ''}`}
                                        onClick={() => col.sortable && handleSort(col.key)}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {col.label}
                                            {col.sortable && <SortIcon colKey={col.key} />}
                                        </div>
                                    </th>
                                ))}
                                <th className="w-20 px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumns.length + 2} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Search size={20} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">No requisitions found</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Try adjusting your search or filters to find what you need
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((req, rowIdx) => {
                                    const isSelected = selected.includes(req.id);
                                    const stageSty = stageStyles[req.stage];
                                    const locBadge = locationBadge[req.location];
                                    const budBadge = budgetBadge[req.budgetType];

                                    return (
                                        <tr
                                            key={req.id}
                                            className={`border-b border-slate-100 last:border-0 transition-colors group ${isSelected ? 'bg-[hsl(214,67%,32%)]/5' : rowIdx % 2 === 0 ? 'bg-white hover:bg-slate-50/70' : 'bg-slate-50/40 hover:bg-slate-50'
                                                } ${req.slaRisk ? 'border-l-2 border-l-red-400' : ''}`}
                                        >
                                            {/* Checkbox */}
                                            <td className="px-3 py-3">
                                                <button onClick={() => toggleSelect(req.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                                    {isSelected ? (
                                                        <CheckSquare size={15} className="text-[hsl(214,67%,32%)]" />
                                                    ) : (
                                                        <Square size={15} />
                                                    )}
                                                </button>
                                            </td>

                                            {/* Req ID */}
                                            {visibleCols.includes('col-reqId') && (
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        {req.slaRisk && (
                                                            <span title="SLA breach risk">
                                                                <AlertTriangle size={11} className="text-red-500 shrink-0" />
                                                            </span>
                                                        )}
                                                        <span className="font-mono text-xs font-semibold text-[hsl(214,67%,32%)]">
                                                            {req.reqId}
                                                        </span>
                                                        {req.emiratisationFlag && (
                                                            <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-orange-100 text-orange-700" title="Emiratisation compliance flag">
                                                                EMRT
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">Stage {req.stageNum}/14</p>
                                                </td>
                                            )}

                                            {/* Title */}
                                            {visibleCols.includes('col-title') && (
                                                <td className="px-3 py-3 max-w-[200px]">
                                                    <p className="font-semibold text-slate-800 text-sm truncate leading-tight">{req.title}</p>
                                                    {req.lpoGenerated && (
                                                        <span className="text-[10px] font-semibold text-emerald-600">LPO Generated</span>
                                                    )}
                                                </td>
                                            )}

                                            {/* Department */}
                                            {visibleCols.includes('col-department') && (
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <span className="text-xs text-slate-600">{req.department}</span>
                                                </td>
                                            )}

                                            {/* Requestor */}
                                            {visibleCols.includes('col-requestor') && (
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-[hsl(214,67%,32%)]/10 flex items-center justify-center text-[hsl(214,67%,32%)] text-[10px] font-bold shrink-0">
                                                            {req.requestor.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                                        </div>
                                                        <span className="text-xs text-slate-600 whitespace-nowrap">{req.requestor}</span>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Stage — clickable dropdown */}
                                            {visibleCols.includes('col-stage') && (
                                                <td className="px-3 py-3 whitespace-nowrap relative">
                                                    <button
                                                        onClick={() => setStageDropdownId(stageDropdownId === req.id ? null : req.id)}
                                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${stageSty.bg} ${stageSty.text} hover:opacity-80 transition-opacity`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${stageSty.dot}`} />
                                                        {req.stage}
                                                        <ChevronDown size={10} />
                                                    </button>

                                                    {stageDropdownId === req.id && (
                                                        <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-xl border border-slate-200 shadow-modal z-50 py-1 animate-fade-in max-h-64 overflow-y-auto scrollbar-thin">
                                                            {stageOptions.map((s) => {
                                                                const sty = stageStyles[s];
                                                                return (
                                                                    <button
                                                                        key={`stage-opt-${req.id}-${s}`}
                                                                        onClick={() => handleStageChange(req.reqId, s)}
                                                                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 transition-colors ${s === req.stage ? 'font-bold' : ''}`}
                                                                    >
                                                                        <span className={`w-2 h-2 rounded-full ${sty.dot}`} />
                                                                        <span className={sty.text}>{s}</span>
                                                                        {s === req.stage && <span className="ml-auto text-[10px] text-slate-400">Current</span>}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </td>
                                            )}

                                            {/* Location */}
                                            {visibleCols.includes('col-location') && (
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <span className={`badge-base text-[11px] ${locBadge.bg} ${locBadge.text}`}>
                                                        {locBadge.short}
                                                    </span>
                                                </td>
                                            )}

                                            {/* Budget */}
                                            {visibleCols.includes('col-budget') && (
                                                <td className="px-3 py-3 whitespace-nowrap text-right">
                                                    <span className="font-mono text-xs font-semibold text-slate-800 tabular-nums">
                                                        {req.budgetAED.toLocaleString()}
                                                    </span>
                                                </td>
                                            )}

                                            {/* Budget Type */}
                                            {visibleCols.includes('col-budgetType') && (
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <span className={`badge-base text-[11px] ${budBadge.bg} ${budBadge.text}`}>
                                                        {req.budgetType}
                                                    </span>
                                                </td>
                                            )}

                                            {/* Vendors */}
                                            {visibleCols.includes('col-vendors') && (
                                                <td className="px-3 py-3 text-center">
                                                    <span className="text-xs font-semibold text-slate-700 tabular-nums">
                                                        {req.vendorCount > 0 ? req.vendorCount : '—'}
                                                    </span>
                                                </td>
                                            )}

                                            {/* Candidates */}
                                            {visibleCols.includes('col-candidates') && (
                                                <td className="px-3 py-3 text-center">
                                                    <span className={`text-xs font-semibold tabular-nums ${req.candidateCount > 0 ? 'text-[hsl(214,67%,32%)]' : 'text-slate-400'}`}>
                                                        {req.candidateCount > 0 ? req.candidateCount : '—'}
                                                    </span>
                                                </td>
                                            )}

                                            {/* Created */}
                                            {visibleCols.includes('col-created') && (
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <span className="font-mono text-xs text-slate-500">{req.createdDate}</span>
                                                </td>
                                            )}

                                            {/* Actions */}
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative">
                                                    <button
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-[hsl(214,67%,32%)] hover:bg-blue-50 transition-all"
                                                        title="View requisition details"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                                        title="Edit requisition"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all"
                                                        title="Advance to next stage"
                                                        onClick={() => toast.success(`${req.reqId} advanced to next stage`)}
                                                    >
                                                        <ArrowRight size={14} />
                                                    </button>
                                                    <div className="relative">
                                                        <button
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                                                            title="More actions"
                                                            onClick={() => setActionMenuId(actionMenuId === req.id ? null : req.id)}
                                                        >
                                                            <MoreHorizontal size={14} />
                                                        </button>
                                                        {actionMenuId === req.id && (
                                                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-modal z-50 py-1 animate-fade-in">
                                                                <button
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                                                                    onClick={() => { toast.info(`Cloning ${req.reqId}…`); setActionMenuId(null); }}
                                                                >
                                                                    Clone Requisition
                                                                </button>
                                                                <button
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                                                                    onClick={() => { toast.info(`Generating audit log for ${req.reqId}…`); setActionMenuId(null); }}
                                                                >
                                                                    View Audit Log
                                                                </button>
                                                                <button
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                                                                    onClick={() => { toast.info(`Sending SLA reminder for ${req.reqId}…`); setActionMenuId(null); }}
                                                                >
                                                                    Send SLA Reminder
                                                                </button>
                                                                <div className="border-t border-slate-100 my-1" />
                                                                <button
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                                                                    onClick={() => { toast.error(`Termination request initiated for ${req.reqId} — HOD approval required`); setActionMenuId(null); }}
                                                                >
                                                                    <Trash2 size={12} />
                                                                    Terminate / Cancel
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">Rows per page:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[hsl(214,67%,32%)]/20"
                        >
                            {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                                <option key={`page-opt-${opt}`} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <span className="text-xs text-slate-400">
                            {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={14} />
                        </button>

                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={`page-btn-${page}`}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${currentPage === page
                                        ? 'bg-[hsl(214,67%,32%)] text-white'
                                        : 'text-slate-500 hover:bg-slate-200'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}