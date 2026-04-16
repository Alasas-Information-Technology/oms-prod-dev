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
import { useEffect, useImperativeHandle, forwardRef } from 'react';
import NewRequisitionModal from './NewRequisitionModal';
import { FilterState } from '../page';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

type WorkflowStage =
    | 'Initiation & Auto-Reserve' 
    | 'Executive Approval' 
    | 'Vendor Submission' 
    | 'Blind Selection & Interview' 
    | 'Digital Onboarding' 
    | 'Completed';

type LocationType = 'Onshore – Corporate Headquarters' | 'UAE Remote (WFH)' | 'UAE Remote (Vendor Office)' | 'Remote Abroad' | 'Pre-Agreed Rate';
type BudgetType = 'BUDGETED' | 'UNALLOCATED' | 'UNBUDGETED' | 'Budgeted' | 'Unallocated' | 'Unbudgeted';

interface Requisition {
    id: string;
    reqId: string;
    title: string;
    department: string;
    requestor: string;
    requestor_id: string;
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
    createdRaw: string;
    isActive: boolean;
    // Core data for cloning
    raw_data: any;
}

const stageStyles: Record<string, { bg: string; dot: string; text: string }> = {
    'Initiation & Auto-Reserve': { bg: 'bg-blue-50', dot: 'bg-blue-500', text: 'text-blue-700' },
    'Executive Approval': { bg: 'bg-indigo-50', dot: 'bg-indigo-500', text: 'text-indigo-700' },
    'Vendor Submission': { bg: 'bg-teal-50', dot: 'bg-teal-500', text: 'text-teal-700' },
    'Blind Selection & Interview': { bg: 'bg-amber-50', dot: 'bg-amber-500', text: 'text-amber-700' },
    'Digital Onboarding': { bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-700' },
    'Completed': { bg: 'bg-green-50', dot: 'bg-green-500', text: 'text-green-700' },
    'Draft': { bg: 'bg-slate-50', dot: 'bg-slate-400', text: 'text-slate-600' },
};

const locationBadge: Record<LocationType, { bg: string; text: string; short: string }> = {
    'Onshore – Corporate Headquarters': { bg: 'bg-blue-50', text: 'text-blue-700', short: 'Onshore' },
    'UAE Remote (WFH)': { bg: 'bg-teal-50', text: 'text-teal-700', short: 'WFH' },
    'UAE Remote (Vendor Office)': { bg: 'bg-cyan-50', text: 'text-cyan-700', short: 'Vendor Office' },
    'Remote Abroad': { bg: 'bg-purple-50', text: 'text-purple-700', short: 'Offshore' },
    'Pre-Agreed Rate': { bg: 'bg-slate-100', text: 'text-slate-600', short: 'Pre-Agreed' },
};

const budgetBadge: Record<string, { bg: string; text: string }> = {
    'BUDGETED': { bg: 'bg-green-50', text: 'text-green-700' },
    'UNALLOCATED': { bg: 'bg-amber-50', text: 'text-amber-700' },
    'UNBUDGETED': { bg: 'bg-red-50', text: 'text-red-700' },
    'Budgeted': { bg: 'bg-green-50', text: 'text-green-700' },
    'Unallocated': { bg: 'bg-amber-50', text: 'text-amber-700' },
    'Unbudgeted': { bg: 'bg-red-50', text: 'text-red-700' },
};

const DEFAULT_STAGE_STYLE = { bg: 'bg-slate-50', dot: 'bg-slate-400', text: 'text-slate-600' };
const DEFAULT_LOC_STYLE = { bg: 'bg-blue-50', text: 'text-blue-700', short: 'Onshore' };
const DEFAULT_BUDGET_STYLE = { bg: 'bg-green-50', text: 'text-green-700' };


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
    filters?: FilterState;
}

const RequisitionTable = forwardRef(({ refreshTrigger = 0, filters }: RequisitionTableProps, ref) => {
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
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);
    const [workflowStages, setWorkflowStages] = useState<any[]>([]);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [editingReq, setEditingReq] = useState<Requisition | null>(null);

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
                department: item.departments?.dept_name || 'System / External',
                requestor: item.profiles?.full_name || 'System',
                requestor_id: item.requestor_id,
                stage: item.is_active ? (item.workflow_stages?.stage_name || 'Initiation & Auto-Reserve') : 'Completed',
                stageId: item.stage_id,
                isActive: item.is_active,
                location: item.work_location === 'Onshore' ? 'Onshore – Corporate Headquarters' : 'Remote Abroad',
                budgetAED: item.reserved_budget_aed, // Sync with SQL
                budgetType: (item.funding_category || 'BUDGETED') as BudgetType,
                vendorCount: 0,
                candidateCount: 0,
                createdDate: new Date(item.created_at).toLocaleDateString(),
                createdRaw: item.created_at,
                slaRisk: false,
                emiratisationFlag: false,
                lpoGenerated: false,
                raw_data: item
            }));
            setRequisitions(mapped);
        } catch (error) {
            toast.error('Failed to load requisitions');
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        exportData: () => {
            if (filtered.length === 0) {
                toast.error('No data to export');
                return;
            }
            
            const headers = ['Req ID', 'Title', 'Department', 'Requestor', 'Stage', 'Location', 'Budget (AED)', 'Created'];
            const rows = filtered.map(r => [
                r.reqId,
                r.title,
                r.department,
                r.requestor,
                r.stage,
                r.location,
                r.budgetAED,
                r.createdDate
            ]);
            
            const csvContent = "data:text/csv;charset=utf-8," 
                + headers.join(",") + "\n"
                + rows.map(e => e.join(",")).join("\n");
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `requisitions_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Exporting filtered data to CSV…');
        }
    }));

    // Filter + sort
    const filtered = requisitions.filter((r) => {
        // 1. Text Search
        const s = search.toLowerCase();
        const matchesSearch = !search || (
            r.reqId.toLowerCase().includes(s) ||
            r.title.toLowerCase().includes(s) ||
            r.department.toLowerCase().includes(s) ||
            r.requestor.toLowerCase().includes(s) ||
            r.stage.toLowerCase().includes(s)
        );

        if (!matchesSearch) return false;

        // 2. Multi-panel filters
        if (filters) {
            if (filters.stages.length > 0) {
                const isSelected = filters.stages.includes(r.stage);
                // Also handle virtual 'Completed' check if the badge logic didn't catch it
                const isCompletedSelected = filters.stages.includes('Completed') && !r.isActive;
                if (!isSelected && !isCompletedSelected) return false;
            }
            if (filters.departments.length > 0 && !filters.departments.includes(r.department)) return false;
            if (filters.locations.length > 0 && !filters.locations.includes(r.location)) return false;
            if (filters.budgetType.length > 0 && !filters.budgetType.includes(r.budgetType)) return false;
            
            // Date Filter Logic
            if (filters.dateRange) {
                const createdDate = new Date(r.createdRaw);
                const now = new Date();
                if (filters.dateRange === '7d') {
                    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
                    if (createdDate < sevenDaysAgo) return false;
                } else if (filters.dateRange === '30d') {
                    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
                    if (createdDate < thirtyDaysAgo) return false;
                }
            }
        }

        return true;
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

    const handleBulkApprove = () => {
        toast.success(`${selected.length} requisitions approved and advanced`);
        setSelected([]);
    };

    const handleBulkExport = () => {
        toast.info(`Exporting ${selected.length} requisitions to Excel…`);
        setSelected([]);
    };

    const handleBulkDelete = () => {
        toast.error(`${selected.length} requisitions cancelled and archived`);
        setSelected([]);
    };

    const handleClone = async (req: Requisition) => {
        if (!currentUser) return;
        setActionMenuId(null);
        setLoading(true);
        try {
            const cloneData = {
                positionTitle: `Copy of ${req.title}`,
                departmentId: req.raw_data.department_id,
                departmentName: req.department,
                targetStartDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +14 days default
                workLocation: req.raw_data.work_location === 'Onshore' ? 'Onshore (UAE)' : 'Offshore (Remote)',
                reqLaptop: req.raw_data.req_laptop,
                reqMobilePhone: req.raw_data.req_mobile,
                reqEmailAccess: req.raw_data.req_email,
                reqSoftwareLicenses: req.raw_data.req_software !== 'None',
                officeSeating: req.raw_data.seating_accommodations,
                fundingType: req.raw_data.funding_category,
                reservedBudget: 0, // Reset budget for manual re-entry
            };

            await requisitionService.createRequisition(cloneData, currentUser);
            toast.success(`Requisition ${req.reqId} cloned successfully`);
            loadRequisitions();
        } catch (e) {
            toast.error('Cloning failed');
            setLoading(false);
        }
    };

    const handleViewAuditLogs = (reqId: string) => {
        setActionMenuId(null);
        router.push(`/requisition-management/${reqId}`);
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
                                    const stageSty = stageStyles[req.stage] || stageStyles['Draft'] || DEFAULT_STAGE_STYLE;
                                    const locBadge = (req.location && locationBadge[req.location]) || locationBadge['Onshore – Corporate Headquarters'] || DEFAULT_LOC_STYLE;
                                    const budBadge = (req.budgetType && budgetBadge[req.budgetType]) || budgetBadge['BUDGETED'] || DEFAULT_BUDGET_STYLE;

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
                                                        <Link
                                                            href={`/requisition-management/${req.reqId}`}
                                                            className="font-mono text-xs font-semibold text-[hsl(214,67%,32%)] hover:underline flex items-center gap-1 cursor-pointer hover:bg-[hsl(214,67%,32%)]/10 rounded px-1 -ml-1 transition-colors"
                                                            title="View Requisition"
                                                        >
                                                            {req.reqId}
                                                        </Link>
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

                                            {/* Stage Badge (Read-only) */}
                                            {visibleCols.includes('col-stage') && (
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <div
                                                        className={`inline-flex items-center gap-1.5 h-auto px-2.5 py-1 rounded-full text-[11px] font-bold ${stageSty.bg} ${stageSty.text} border border-transparent shadow-sm`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${stageSty.dot} animate-pulse-subtle`} />
                                                        {req.stage}
                                                    </div>
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
                                                    {currentUser?.id === req.requestor_id && req.stageId === 1 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                                            title="Edit requisition"
                                                            onClick={() => setEditingReq(req)}
                                                        >
                                                            <Edit3 size={14} />
                                                        </Button>
                                                    )}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all focus:ring-0 focus:ring-offset-0"
                                                                title="More actions"
                                                            >
                                                                <MoreHorizontal size={14} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 p-1 shadow-modal rounded-xl border-slate-200">
                                                            <DropdownMenuItem 
                                                                className="text-xs flex items-center gap-2 cursor-pointer py-2 px-3 focus:bg-slate-50 rounded-lg transition-colors"
                                                                onClick={() => handleClone(req)}
                                                            >
                                                                Clone Requisition
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                className="text-xs flex items-center gap-2 cursor-pointer py-2 px-3 focus:bg-slate-50 rounded-lg transition-colors"
                                                                onClick={() => handleViewAuditLogs(req.reqId)}
                                                            >
                                                                View Audit Log
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                className="text-xs flex items-center gap-2 cursor-pointer py-2 px-3 focus:bg-slate-50 rounded-lg transition-colors"
                                                                onClick={() => toast.info(`Sending SLA reminder for ${req.reqId}…`)}
                                                            >
                                                                Send SLA Reminder
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                                            <DropdownMenuItem 
                                                                className="text-xs flex items-center gap-2 cursor-pointer py-2 px-3 text-red-600 focus:bg-red-50 focus:text-red-700 rounded-lg transition-colors"
                                                                onClick={() => toast.error(`Termination initiated for ${req.reqId}`)}
                                                            >
                                                                <Trash2 size={12} />
                                                                Terminate / Cancel
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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

            {editingReq && (
                <NewRequisitionModal 
                    requisition={editingReq}
                    onClose={() => setEditingReq(null)} 
                    onSuccess={loadRequisitions}
                />
            )}
        </div>
    );
});

export default RequisitionTable;