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
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { requisitionService } from '@/lib/services/requisitionService';
import { useEffect } from 'react';

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
    stage: string;
    stageId: number;
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

const stageStyles: Record<string, { bg: string; dot: string; text: string }> = {
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

interface RequisitionTableProps {
    refreshTrigger?: number;
}

export default function RequisitionTable({ refreshTrigger = 0 }: RequisitionTableProps) {
    const { currentUser } = useAuth();
    const router = useRouter();

    const [requisitions, setRequisitions] = useState<Requisition[]>([]);
    const [loading, setLoading] = useState(true);
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
    const [workflowStages, setWorkflowStages] = useState<any[]>([]);

    useEffect(() => {
        // Vendor Lockout Protection logic
        if (currentUser?.roles?.role_name === 'VENDOR_USER') {
            router.push('/vendor-portal');
            return;
        }

        const loadMeta = async () => {
            try {
                const stages = await requisitionService.getWorkflowStages();
                setWorkflowStages(stages);
            } catch (e) {}
        };
        loadMeta();
        loadRequisitions();
    }, [refreshTrigger, currentUser]);

    const loadRequisitions = async () => {
        if (!currentUser) return;
        
        setLoading(true);
        try {
            const data = await requisitionService.getRequisitions(currentUser);
            const mapped: Requisition[] = data.map(item => ({
                id: item.id,
                reqId: item.req_number, // Sync with SQL
                title: item.position_title, // Sync with SQL
                department: item.department,
                requestor: item.profiles?.full_name || 'System',
                stage: item.workflow_stages?.stage_name || 'Draft',
                stageId: item.stage_id,
                location: 'Onshore – DIEZA Premises' as LocationType,
                budgetAED: item.reserved_budget_aed, // Sync with SQL
                budgetType: 'Budgeted' as BudgetType,
                vendorCount: 0,
                candidateCount: 0,
                createdDate: new Date(item.created_at).toLocaleDateString(),
                slaRisk: false,
                emiratisationFlag: false,
                lpoGenerated: false,
            }));
            setRequisitions(mapped);
        } catch (error) {
            toast.error('Failed to load requisitions');
        } finally {
            setLoading(false);
        }
    };

    // Filter + sort
    const filtered = requisitions.filter((r) => {
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
                    <Input
                        type="text"
                        placeholder="Search by ID, title, department, requestor…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-9 pr-8 h-10 bg-white"
                    />
                    {search && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSearch('')}
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-transparent"
                        >
                            <X size={13} />
                        </Button>
                    )}
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                        {loading ? '---' : `${filtered.length} of ${requisitions.length} requisitions`}
                    </span>

                    {/* Column Visibility */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowColMenu(!showColMenu)}
                        >
                            <Columns size={14} />
                            Columns
                        </Button>
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
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleBulkApprove}
                            className="bg-white/15 text-white hover:bg-white/25 hover:text-white border-none"
                        >
                            Approve Selected
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleBulkExport}
                            className="bg-white/15 text-white hover:bg-white/25 hover:text-white border-none"
                        >
                            Export
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                        >
                            Cancel Requisitions
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelected([])}
                            className="h-8 w-8 text-white hover:bg-white/20 hover:text-white transition-colors"
                        >
                            <X size={13} />
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
            <Card className="overflow-hidden border-none shadow-card">
                <CardContent className="p-0">
                    <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="w-10 px-3 py-3 text-left">
                                    <Button variant="ghost" size="icon" onClick={toggleSelectAll} className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 transition-colors">
                                        {selected.length === paginated.length && paginated.length > 0 ? (
                                            <CheckSquare size={15} className="text-[hsl(214,67%,32%)]" />
                                        ) : (
                                            <Square size={15} />
                                        )}
                                    </Button>
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
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={`skeleton-${i}`} className="border-b border-slate-100 last:border-0 h-16">
                                        <td className="px-3 py-3"><Skeleton className="h-4 w-4" /></td>
                                        {visibleColumns.map((col) => (
                                            <td key={`skeleton-col-${i}-${col.id}`} className="px-3 py-3">
                                                <Skeleton className="h-4 w-full max-w-[120px]" />
                                            </td>
                                        ))}
                                        <td className="px-3 py-3 text-center"><Skeleton className="h-8 w-8 mx-auto rounded-full" /></td>
                                    </tr>
                                ))
                            ) : paginated.length === 0 ? (
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
                                    const stageSty = stageStyles[req.stage] || stageStyles['Draft'];
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
                                                <Button variant="ghost" size="icon" onClick={() => toggleSelect(req.id)} className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 transition-colors">
                                                    {isSelected ? (
                                                        <CheckSquare size={15} className="text-[hsl(214,67%,32%)]" />
                                                    ) : (
                                                        <Square size={15} />
                                                    )}
                                                </Button>
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
                                                        {req.stage === 'Blind Selection' ? (
                                                            <Link
                                                                href={`/requisition-management/blind-selection/${req.reqId}`}
                                                                className="font-mono text-xs font-semibold text-[hsl(214,67%,32%)] hover:underline flex items-center gap-1 cursor-pointer hover:bg-[hsl(214,67%,32%)]/10 rounded px-1 -ml-1 transition-colors"
                                                                title="Go to Blind Candidate Selection"
                                                            >
                                                                {req.reqId}
                                                            </Link>
                                                        ) : (
                                                            <span className="font-mono text-xs font-semibold text-[hsl(214,67%,32%)]">
                                                                {req.reqId}
                                                            </span>
                                                        )}
                                                        {req.emiratisationFlag && (
                                                            <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-orange-100 text-orange-700" title="Emiratisation compliance flag">
                                                                EMRT
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">Stage {req.stageId}/{workflowStages.length || 5}</p>
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
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => setStageDropdownId(stageDropdownId === req.id ? null : req.id)}
                                                        className={`inline-flex items-center gap-1 h-auto px-2 py-1 rounded-full text-xs font-semibold ${stageSty.bg} hover:bg-transparent ${stageSty.text} hover:opacity-80 transition-opacity`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${stageSty.dot}`} />
                                                        {req.stage}
                                                        <ChevronDown size={10} />
                                                    </Button>

                                                    {stageDropdownId === req.id && (
                                                        <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-xl border border-slate-200 shadow-modal z-50 py-1 animate-fade-in max-h-64 overflow-y-auto scrollbar-thin">
                                                            {stageOptions.map((s) => {
                                                                const sty = stageStyles[s];
                                                                return (
                                                                    <Button
                                                                        variant="ghost"
                                                                        key={`stage-opt-${req.id}-${s}`}
                                                                        onClick={() => handleStageChange(req.reqId, s)}
                                                                        className={`w-full justify-start h-auto flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 transition-colors ${s === req.stage ? 'font-bold' : ''}`}
                                                                    >
                                                                        <span className={`w-2 h-2 rounded-full ${sty.dot}`} />
                                                                        <span className={sty.text}>{s}</span>
                                                                        {s === req.stage && <span className="ml-auto text-[10px] text-slate-400">Current</span>}
                                                                    </Button>
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
                                                    <Link href={`/requisition-management/${req.reqId}`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-[hsl(214,67%,32%)] hover:bg-blue-50 transition-all"
                                                            title="View requisition details"
                                                        >
                                                            <Eye size={14} />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                                        title="Edit requisition"
                                                    >
                                                        <Edit3 size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all"
                                                        title="Advance to next stage"
                                                        onClick={() => toast.success(`${req.reqId} advanced to next stage`)}
                                                    >
                                                        <ArrowRight size={14} />
                                                    </Button>
                                                    <div className="relative">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                                                            title="More actions"
                                                            onClick={() => setActionMenuId(actionMenuId === req.id ? null : req.id)}
                                                        >
                                                            <MoreHorizontal size={14} />
                                                        </Button>
                                                        {actionMenuId === req.id && (
                                                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-modal z-50 py-1 animate-fade-in">
                                                                <Button
                                                                    variant="ghost"
                                                                    className="w-full h-auto justify-start flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                                                                    onClick={() => { toast.info(`Cloning ${req.reqId}…`); setActionMenuId(null); }}
                                                                >
                                                                    Clone Requisition
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    className="w-full h-auto justify-start flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                                                                    onClick={() => { toast.info(`Generating audit log for ${req.reqId}…`); setActionMenuId(null); }}
                                                                >
                                                                    View Audit Log
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    className="w-full h-auto justify-start flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                                                                    onClick={() => { toast.info(`Sending SLA reminder for ${req.reqId}…`); setActionMenuId(null); }}
                                                                >
                                                                    Send SLA Reminder
                                                                </Button>
                                                                <div className="border-t border-slate-100 my-1" />
                                                                <Button
                                                                    variant="ghost"
                                                                    className="w-full h-auto justify-start flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                                                    onClick={() => { toast.error(`Termination request initiated for ${req.reqId} — HOD approval required`); setActionMenuId(null); }}
                                                                >
                                                                    <Trash2 size={12} />
                                                                    Terminate / Cancel
                                                                </Button>
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
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Show</span>
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(val) => { setItemsPerPage(Number(val)); setCurrentPage(1); }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder={itemsPerPage.toString()} />
                                </SelectTrigger>
                                <SelectContent>
                                    {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                                        <SelectItem key={`page-opt-${opt}`} value={opt.toString()}>
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <span className="text-xs text-slate-400">
                            {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-8 w-8 text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        
                        <div className="flex items-center px-2">
                            <span className="text-xs font-semibold text-slate-700">{currentPage}</span>
                            <span className="text-xs text-slate-400 mx-1">/</span>
                            <span className="text-xs text-slate-400">{totalPages}</span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
                </CardContent>
            </Card>
        </div>
    );
}