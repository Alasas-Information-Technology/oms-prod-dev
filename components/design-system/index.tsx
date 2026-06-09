"use client";

/* MARKER-MAKE-KIT-INVOKED */
import { useState, type ReactNode } from "react";
import {
    Building2, Bell, Search, Filter,
    DollarSign, AlertCircle, CheckCircle, Clock, Info, Plus,
    Download, Eye, Edit, Trash2, Copy, Palette, Type, MousePointer,
    Tag, LayoutGrid, GitBranch, ChevronRight, ArrowUpRight,
    ArrowDownRight, Shield, Loader, FormInput, FileCheck2,
    X, LayoutDashboard, BarChart3, Settings, FileText, Users,
    Layers, SlidersHorizontal, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectGroup,
    SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { StatusBadge, type OMSStatus } from "@/components/oms/StatusBadge";
import { MultiSelect } from "@/components/oms/MultiSelect";
import { DatePickerField } from "@/components/oms/DatePickerField";
import { DataTable, type ColumnDef } from "@/components/oms/DataTable";
import { Timeline, type TimelineItem } from "@/components/oms/Timeline";
import { ApprovalWorkflow, type ApprovalStep } from "@/components/oms/ApprovalWorkflow";
import { NotificationPanel, type Notification } from "@/components/oms/NotificationPanel";
import { cn } from "@/components/ui/utils";
import { SimpleKpiCard } from "../oms/simple-kpi";
import { BudgetKpiCard } from "../oms/budget-kpi";
import { formatCompactNumber } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// ─── Sample Data ──────────────────────────────────────────────────────────────

type Contract = {
    id: string; contractNo: string; vendor: string; type: string;
    value: number; startDate: string; endDate: string; status: OMSStatus;
};

const CONTRACTS: Contract[] = [
    { id: "1", contractNo: "OMS-2025-001", vendor: "TechServ Philippines Inc.", type: "IT Services", value: 4500000, startDate: "Jan 1, 2025", endDate: "Dec 31, 2025", status: "active" },
    { id: "2", contractNo: "OMS-2025-002", vendor: "InfraBuild Corp.", type: "Works", value: 18500000, startDate: "Feb 1, 2025", endDate: "Jan 31, 2026", status: "active" },
    { id: "3", contractNo: "OMS-2024-089", vendor: "ConsultPro Advisory", type: "Consultancy", value: 2200000, startDate: "Jul 1, 2024", endDate: "Dec 31, 2024", status: "expired" },
    { id: "4", contractNo: "OMS-2025-003", vendor: "SupplyMax Trading", type: "Supplies", value: 850000, startDate: "Mar 1, 2025", endDate: "Aug 31, 2025", status: "under-review" },
    { id: "5", contractNo: "OMS-2025-004", vendor: "CleanEco Services Ltd.", type: "Janitorial", value: 1200000, startDate: "Jan 15, 2025", endDate: "Jun 30, 2025", status: "pending" },
    { id: "6", contractNo: "OMS-2024-075", vendor: "DataVault Systems", type: "IT Services", value: 3800000, startDate: "Jun 1, 2024", endDate: "Dec 31, 2024", status: "terminated" },
    { id: "7", contractNo: "OMS-2025-005", vendor: "GreenScape Landscaping", type: "Services", value: 760000, startDate: "Apr 1, 2025", endDate: "Sep 30, 2025", status: "draft" },
    { id: "8", contractNo: "OMS-2025-006", vendor: "MechTech Engineering Corp.", type: "Works", value: 12000000, startDate: "May 1, 2025", endDate: "Apr 30, 2026", status: "approved" },
    { id: "9", contractNo: "OMS-2025-007", vendor: "LogiFreight Inc.", type: "Logistics", value: 980000, startDate: "Feb 15, 2025", endDate: "Aug 15, 2025", status: "active" },
    { id: "10", contractNo: "OMS-2025-008", vendor: "SecureGuard Solutions", type: "Security", value: 1650000, startDate: "Jan 1, 2025", endDate: "Dec 31, 2025", status: "on-hold" },
    { id: "11", contractNo: "OMS-2024-061", vendor: "AquaWorks Corp.", type: "Works", value: 7200000, startDate: "Apr 1, 2024", endDate: "Dec 31, 2024", status: "completed" },
    { id: "12", contractNo: "OMS-2025-009", vendor: "PrintMedia Group", type: "Supplies", value: 340000, startDate: "Mar 1, 2025", endDate: "Jun 30, 2025", status: "pending" },
];

const CONTRACT_TIMELINE: TimelineItem[] = [
    { id: "1", title: "Procurement Request Submitted", description: "Purchase request endorsed by Requesting Division with supporting documents.", timestamp: "Jan 5, 2025 · 09:15", status: "completed", user: { name: "Maria Santos", role: "Division Chief" } },
    { id: "2", title: "Document Review Completed", description: "All required documents verified complete. BAC pre-procurement conference conducted.", timestamp: "Jan 8, 2025 · 14:30", status: "completed", user: { name: "John Reyes", role: "Document Officer" } },
    { id: "3", title: "Public Bidding Conducted", description: "Invitation to Bid published. Evaluation of bids completed, winning bidder identified.", timestamp: "Jan 12, 2025 · 10:00", status: "completed", user: { name: "Ana Cruz", role: "BAC Secretariat" } },
    { id: "4", title: "Contract Approval In Progress", description: "Awaiting counter-signatures from Finance Manager and Authority Head.", timestamp: "Jan 15, 2025", status: "current", user: { name: "Roberto Lim", role: "Finance Manager" } },
    { id: "5", title: "Notice to Proceed Issuance", description: "NTP will be issued after all parties have signed the contract.", status: "pending" },
    { id: "6", title: "Contract Implementation & Monitoring", description: "Contract officially active with regular monitoring and reporting.", status: "pending" },
];

const APPROVAL_STEPS: ApprovalStep[] = [
    { id: "1", order: 1, approverName: "Lourdes Dela Cruz", approverRole: "IT Section Chief", department: "IT Division", status: "approved", timestamp: "Jan 12, 2025", comments: "Approved. Consistent with approved IT budget allocation for FY 2025." },
    { id: "2", order: 2, approverName: "Marcos Villanueva", approverRole: "Division Manager", department: "Operations", status: "approved", timestamp: "Jan 14, 2025" },
    { id: "3", order: 3, approverName: "Roberto Lim", approverRole: "Finance Manager", department: "Finance Dept.", status: "pending" },
    { id: "4", order: 4, approverName: "Carmen Aguinaldo", approverRole: "Procurement Head", department: "Procurement", status: "waiting" },
    { id: "5", order: 5, approverName: "Jose Rizaldy", approverRole: "Executive Director", department: "Executive", status: "waiting" },
];

const SAMPLE_NOTIFICATIONS: Notification[] = [
    { id: "1", title: "Contract Approved", description: "OMS-2025-006 (MechTech Engineering) has been approved by Finance Manager Roberto Lim and is ready for signing.", type: "success", timestamp: "2 minutes ago", read: false, module: "Contracts", actionLabel: "View Contract" },
    { id: "2", title: "Approval Action Required", description: "Procurement request OMS-2025-PRO-0421 requires your review. Deadline: January 20, 2025.", type: "warning", timestamp: "15 minutes ago", read: false, module: "Approvals", actionLabel: "Review Now" },
    { id: "3", title: "New Vendor Accredited", description: "InfraBuild Corp. has successfully completed accreditation and is now eligible to participate in public bidding.", type: "info", timestamp: "1 hour ago", read: false, module: "Vendors" },
    { id: "4", title: "Document Upload Failed", description: "File upload for OMS-2024-089 failed — the file exceeds the 10MB limit. Please compress and retry.", type: "error", timestamp: "3 hours ago", read: false, module: "Documents" },
    { id: "5", title: "Contract Expiring in 7 Days", description: "OMS-2024-089 with ConsultPro Advisory expires Dec 31, 2024. Initiate renewal if services are to continue.", type: "warning", timestamp: "1 day ago", read: true, module: "Contracts", actionLabel: "Renew" },
    { id: "6", title: "Monthly Report Generated", description: "The January 2025 Outsource Activity Report is ready for download.", type: "info", timestamp: "2 days ago", read: true, module: "Reports" },
];

// ─── Navigation Structure ─────────────────────────────────────────────────────

const NAV_GROUPS = [
    {
        label: "Foundations",
        items: [
            { id: "foundation", label: "Colors & Tokens", Icon: Palette },
            { id: "typography", label: "Typography", Icon: Type },
        ],
    },
    {
        label: "Components",
        items: [
            { id: "actions", label: "Buttons & Actions", Icon: MousePointer },
            { id: "forms", label: "Form Controls", Icon: FormInput },
            { id: "status", label: "Status & Badges", Icon: Tag },
            { id: "data", label: "Data Display", Icon: LayoutGrid },
            { id: "navigation", label: "Navigation & Tabs", Icon: LayoutDashboard },
            { id: "extras", label: "Additional UI", Icon: Layers },
        ],
    },
    {
        label: "OMS Patterns",
        items: [
            { id: "kpis", label: "KPI Cards", Icon: Wallet },
            { id: "workflow", label: "Approval Workflow", Icon: GitBranch },
            { id: "timeline", label: "Timeline", Icon: Clock },
            { id: "feedback", label: "Notifications", Icon: Bell },
        ],
    },
];

const SECTION_TITLES: Record<string, string> = {
    foundation: "Colors & Design Tokens",
    typography: "Typography Scale",
    actions: "Buttons & Actions",
    forms: "Form Controls",
    status: "Status & Badges",
    data: "Data Display",
    navigation: "Navigation & Tabs",
    extras: "Additional UI Components",
    kpis: "KPI Cards",
    workflow: "Approval Workflow",
    timeline: "Timeline",
    feedback: "Notifications & Feedback",
};

// ─── Shared Helpers ───────────────────────────────────────────────────────────

function SL({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <p className={cn("text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-3", className)}>
            {children}
        </p>
    );
}

function SectionWrapper({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="p-6 max-w-5xl mx-auto pb-32">
            <div className="mb-6 pb-4 border-b border-slate-200">
                <h1 className="text-xl font-bold text-slate-900">{title}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">OMS Design System · Component Library v1.0 · Dubai Integrated Economic Zones</p>
            </div>
            {children}
        </div>
    );
}

// ─── Section: Foundation (Colors & Tokens) ────────────────────────────────────

const COLOR_SWATCHES = [
    {
        label: "Primary", shades: [
            { name: "Solid", cls: "bg-primary", hex: "var(--primary)", dark: true },
            { name: "90%", cls: "bg-primary/90", hex: "var(--primary)", dark: true },
            { name: "80%", cls: "bg-primary/80", hex: "var(--primary)", dark: true },
            { name: "50%", cls: "bg-primary/50", hex: "var(--primary)", dark: true },
            { name: "20%", cls: "bg-primary/20", hex: "var(--primary)", dark: false },
            { name: "10%", cls: "bg-primary/10", hex: "var(--primary)", dark: false },
        ]
    },
    {
        label: "Secondary", shades: [
            { name: "Solid", cls: "bg-secondary", hex: "var(--secondary)", dark: true },
            { name: "90%", cls: "bg-secondary/90", hex: "var(--secondary)", dark: true },
            { name: "80%", cls: "bg-secondary/80", hex: "var(--secondary)", dark: true },
            { name: "50%", cls: "bg-secondary/50", hex: "var(--secondary)", dark: true },
            { name: "20%", cls: "bg-secondary/20", hex: "var(--secondary)", dark: false },
            { name: "10%", cls: "bg-secondary/10", hex: "var(--secondary)", dark: false },
        ]
    },
    {
        label: "Destructive", shades: [
            { name: "Solid", cls: "bg-destructive", hex: "var(--destructive)", dark: true },
            { name: "90%", cls: "bg-destructive/90", hex: "var(--destructive)", dark: true },
            { name: "80%", cls: "bg-destructive/80", hex: "var(--destructive)", dark: true },
            { name: "50%", cls: "bg-destructive/50", hex: "var(--destructive)", dark: true },
            { name: "20%", cls: "bg-destructive/20", hex: "var(--destructive)", dark: false },
            { name: "10%", cls: "bg-destructive/10", hex: "var(--destructive)", dark: false },
        ]
    },
    {
        label: "Muted", shades: [
            { name: "Solid", cls: "bg-muted", hex: "var(--muted)", dark: false },
            { name: "90%", cls: "bg-muted/90", hex: "var(--muted)", dark: false },
            { name: "80%", cls: "bg-muted/80", hex: "var(--muted)", dark: false },
            { name: "50%", cls: "bg-muted/50", hex: "var(--muted)", dark: false },
            { name: "20%", cls: "bg-muted/20", hex: "var(--muted)", dark: false },
            { name: "10%", cls: "bg-muted/10", hex: "var(--muted)", dark: false },
        ]
    },
    {
        label: "Accent", shades: [
            { name: "Solid", cls: "bg-accent", hex: "var(--accent)", dark: false },
            { name: "90%", cls: "bg-accent/90", hex: "var(--accent)", dark: false },
            { name: "80%", cls: "bg-accent/80", hex: "var(--accent)", dark: false },
            { name: "50%", cls: "bg-accent/50", hex: "var(--accent)", dark: false },
            { name: "20%", cls: "bg-accent/20", hex: "var(--accent)", dark: false },
            { name: "10%", cls: "bg-accent/10", hex: "var(--accent)", dark: false },
        ]
    },
];

function FoundationSection() {
    return (
        <div className="space-y-8">
            {COLOR_SWATCHES.map((group) => (
                <div key={group.label}>
                    <SL>{group.label}</SL>
                    <div className="flex gap-2 flex-wrap">
                        {group.shades.map((s) => (
                            <div key={s.name} className="flex flex-col items-center gap-1.5">
                                <div className={cn("w-16 h-10 rounded border border-black/10", s.cls)} />
                                <div className="text-center">
                                    <div className="text-xs font-semibold text-slate-600">{s.name}</div>
                                    <div className="text-[10px] text-muted-foreground font-mono">{s.hex}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <Separator />

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <SL>Border Radius Scale</SL>
                    <div className="flex items-end gap-4">
                        {[["none", "0", "rounded-none"], ["sm", "2px", "rounded-sm"], ["md", "4px", "rounded"], ["lg", "6px", "rounded-md"], ["xl", "8px", "rounded-lg"]].map(([name, val, cls]) => (
                            <div key={name} className="flex flex-col items-center gap-2">
                                <div className={cn("w-12 h-12 bg-primary/20 border-2 border-primary/40", cls)} />
                                <div className="text-xs font-medium text-slate-600">{name}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">{val}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <SL>Shadow Scale</SL>
                    <div className="flex items-end gap-4">
                        {[["none", "shadow-none"], ["sm", "shadow-sm"], ["md", "shadow-md"], ["lg", "shadow-lg"]].map(([name, cls]) => (
                            <div key={name} className="flex flex-col items-center gap-2">
                                <div className={cn("w-12 h-12 bg-white rounded-md border border-slate-100", cls)} />
                                <div className="text-xs font-medium text-slate-600">{name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Section: Typography ──────────────────────────────────────────────────────

function TypographySection() {
    const scale = [
        { name: "Display", cls: "text-3xl font-bold tracking-tight text-slate-900", sample: "Dubai Integrated Economic Zones" },
        { name: "Heading 1", cls: "text-2xl font-semibold text-slate-900", sample: "Outsource Management System" },
        { name: "Heading 2", cls: "text-xl font-semibold text-slate-900", sample: "Contract Registry & Monitoring" },
        { name: "Heading 3", cls: "text-lg font-semibold text-slate-800", sample: "Active Vendor Directory" },
        { name: "Heading 4", cls: "text-base font-semibold text-slate-800", sample: "Procurement Request Details" },
        { name: "Body / Default", cls: "text-sm text-slate-700 leading-relaxed", sample: "All procurement activities shall comply with RA 9184 and its Implementing Rules and Regulations. Contracts must be properly documented and endorsed to the BAC Secretariat within the prescribed timelines." },
        { name: "Body Small", cls: "text-xs text-slate-600 leading-relaxed", sample: "Supplementary information, helper text, and secondary descriptions use this size for de-emphasis in high-density interfaces and data-rich screens." },
        { name: "Caption", cls: "text-xs text-muted-foreground", sample: "Last updated: January 2025 · OMS v1.0 · Philippines Economic Zone Authority" },
        { name: "Label / Overline", cls: "text-[11px] font-semibold uppercase tracking-widest text-slate-500", sample: "Contract Status · Vendor Type · Approval Level · Procurement Mode" },
        { name: "Mono / Code", cls: "text-sm font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded", sample: "OMS-2025-PRO-0421" },
    ];

    return (
        <div className="space-y-5">
            {scale.map((item) => (
                <div key={item.name} className="flex gap-8 items-baseline border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                    <div className="w-36 shrink-0 text-xs font-medium text-muted-foreground">{item.name}</div>
                    <div className={item.cls}>{item.sample}</div>
                </div>
            ))}
        </div>
    );
}

// ─── Section: Actions ─────────────────────────────────────────────────────────

function ActionsSection() {
    const [loading, setLoading] = useState(false);
    const confirm = useConfirm()
    const simulateLoad = () => { setLoading(true); setTimeout(() => setLoading(false), 2000); };

    const handleDelete = confirm(
        {
            title: "Delete record?",
            description: "This will permanently remove OMS-2025-001.",
            confirmLabel: "Delete Permanently",
            variant: "destructive",
        },
        async () => {
            console.log("delete");
        },
    )

    return (
        <div className="space-y-8">
            <div>
                <SL>Button Variants</SL>
                <div className="flex flex-wrap gap-3 items-center">
                    <Button variant="default">Primary Action</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="link">Link Button</Button>
                </div>
            </div>

            <div>
                <SL>Button Sizes</SL>
                <div className="flex flex-wrap gap-3 items-center">
                    <Button size="sm">Small Button</Button>
                    <Button size="default">Default Button</Button>
                    <Button size="lg">Large Button</Button>
                    <Button size="icon" variant="outline"><Plus size={16} /></Button>
                    <Button size="icon"><Filter size={16} /></Button>
                </div>
            </div>

            <div>
                <SL>With Icons</SL>
                <div className="flex flex-wrap gap-3 items-center">
                    <Button><Plus size={14} /> New Contract</Button>
                    <Button variant="outline"><Download size={14} /> Export Report</Button>
                    <Button variant="secondary"><Filter size={14} /> Filter Records</Button>
                    <Button variant="ghost"><Eye size={14} /> View Details</Button>
                    <Button variant="outline"><FileCheck2 size={14} /> Submit Approval</Button>
                </div>
            </div>

            <div>
                <SL>States</SL>
                <div className="flex flex-wrap gap-3 items-center">
                    <Button disabled>Disabled</Button>
                    <Button variant="outline" disabled>Disabled Outline</Button>
                    <Button variant="secondary" disabled>Disabled Secondary</Button>
                    <Button onClick={simulateLoad} disabled={loading}>
                        {loading && <Loader size={14} className="animate-spin" />}
                        {loading ? "Submitting..." : "Submit for Approval"}
                    </Button>
                </div>
            </div>

            <div>
                <SL>Button Groups & Segmented Controls</SL>
                <div className="flex gap-5 flex-wrap items-start">
                    <div className="flex rounded overflow-hidden border border-slate-300 w-fit">
                        {["All", "Active", "Pending", "Expired"].map((label, i) => (
                            <button key={label} className={cn("px-3 py-1.5 text-sm font-medium transition-colors border-r last:border-r-0 border-slate-300", i === 0 ? "bg-primary text-white" : "bg-white text-slate-600 hover:bg-slate-50")}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-1">
                        <Button size="sm" variant="ghost"><Eye size={13} /> View</Button>
                        <Button size="sm" variant="ghost"><Edit size={13} /> Edit</Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"><Trash2 size={13} /> Delete</Button>
                    </div>
                </div>
            </div>

            <div>
                <SL>Dialog / Modal</SL>
                <div className="flex gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Plus size={14} /> New Procurement Request</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Submit Procurement Request</DialogTitle>
                                <DialogDescription>Complete the form below to initiate a new procurement request for BAC review.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 py-2">
                                <div className="flex flex-col gap-1"><Label>Request Title</Label><Input placeholder="e.g. IT Infrastructure Upgrade FY2025" /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1"><Label>Estimated Amount</Label><Input placeholder="₱ 0.00" type="number" /></div>
                                    <div className="flex flex-col gap-1"><Label>Procurement Mode</Label>
                                        <Select><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                            <SelectContent><SelectItem value="pb">Public Bidding</SelectItem><SelectItem value="dc">Direct Contracting</SelectItem><SelectItem value="sh">Shopping</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1"><Label>Justification</Label><Textarea placeholder="Describe the purpose and urgency of this request..." rows={3} /></div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost">Cancel</Button>
                                <Button>Submit Request</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>


                    <Button variant="destructive" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
                </div>
            </div>
        </div>
    );
}

// ─── Section: Forms ───────────────────────────────────────────────────────────

function FormsSection() {
    const [multiVal, setMultiVal] = useState<string[]>([]);
    const [dateVal, setDateVal] = useState<Date | undefined>();
    const [radioVal, setRadioVal] = useState("public");
    const [switchVals, setSwitchVals] = useState([false, true, false]);

    const vendorOptions = [
        { value: "techserv", label: "TechServ Philippines Inc." },
        { value: "infrabuild", label: "InfraBuild Corp." },
        { value: "consultpro", label: "ConsultPro Advisory" },
        { value: "supplymax", label: "SupplyMax Trading" },
        { value: "cleaneco", label: "CleanEco Services Ltd." },
        { value: "secureguard", label: "SecureGuard Solutions" },
        { value: "greencape", label: "GreenScape Landscaping" },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                    <SL>Text Inputs</SL>
                    <div className="flex flex-col gap-1">
                        <Label>Contract Number</Label>
                        <Input placeholder="e.g. OMS-2025-001" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>Search Vendor</Label>
                        <div className="relative">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input className="pl-8" placeholder="Search by vendor name or TIN..." />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-destructive">Contract Value (₱)</Label>
                        <Input aria-invalid placeholder="0.00" defaultValue="abc" className="border-destructive" />
                        <p className="text-xs text-destructive">Please enter a valid numeric amount.</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>Authority Code</Label>
                        <Input disabled defaultValue="GEZ-PEZA-0001" />
                        <p className="text-xs text-muted-foreground">Auto-generated. Cannot be edited.</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>Remarks / Justification</Label>
                        <Textarea placeholder="Provide justification for the procurement request..." rows={3} />
                    </div>
                </div>

                <div className="space-y-4">
                    <SL>Select, Multi-Select & Date</SL>
                    <div className="flex flex-col gap-1">
                        <Label>Contract Type</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Select procurement type..." /></SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Procurement Types</SelectLabel>
                                    <SelectItem value="services">Services</SelectItem>
                                    <SelectItem value="supplies">Supplies & Materials</SelectItem>
                                    <SelectItem value="works">Works / Infrastructure</SelectItem>
                                    <SelectItem value="consultancy">Consultancy Services</SelectItem>
                                    <SelectItem value="lease">Lease of Assets</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <MultiSelect
                        label="Participating Vendors"
                        options={vendorOptions}
                        value={multiVal}
                        onChange={setMultiVal}
                        placeholder="Select eligible vendors..."
                        helperText={multiVal.length > 0 ? `${multiVal.length} vendor(s) selected for this bidding` : "Select one or more pre-qualified vendors"}
                    />

                    <DatePickerField
                        label="Contract Start Date"
                        value={dateVal}
                        onChange={setDateVal}
                        placeholder="Select start date..."
                        helperText="Must be on or after the Notice to Proceed date"
                    />

                    <div className="flex flex-col gap-1">
                        <Label>Funding Source</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Select funding source..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gaa">General Appropriations Act (GAA)</SelectItem>
                                <SelectItem value="fez">Free Zone Development Fund</SelectItem>
                                <SelectItem value="prf">Program Reserve Fund</SelectItem>
                                <SelectItem value="other">Other Special Funds</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-8">
                <div>
                    <SL>Checkboxes — Procurement Checklist</SL>
                    <div className="space-y-3 mt-1">
                        {[
                            { id: "chk1", label: "Request for Quotation (RFQ) submitted", checked: true, disabled: false },
                            { id: "chk2", label: "Abstract of Quotation prepared", checked: true, disabled: false },
                            { id: "chk3", label: "Purchase Order / Contract drafted", checked: false, disabled: false },
                            { id: "chk4", label: "Notice of Award issued", checked: false, disabled: false },
                            { id: "chk5", label: "Performance Bond posted", checked: false, disabled: true },
                            { id: "chk6", label: "Certificate of Final Acceptance signed", checked: false, disabled: true },
                        ].map((item) => (
                            <div key={item.id} className="flex items-center gap-2.5">
                                <Checkbox id={item.id} defaultChecked={item.checked} disabled={item.disabled} />
                                <Label htmlFor={item.id} className={cn("font-normal cursor-pointer text-sm", item.disabled && "opacity-50 cursor-not-allowed")}>
                                    {item.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <SL>Radio Group — Procurement Mode</SL>
                        <RadioGroup value={radioVal} onValueChange={setRadioVal} className="space-y-2 mt-1">
                            {[["public", "Public Bidding"], ["limited", "Limited Source Bidding"], ["direct", "Direct Contracting"], ["shopping", "Shopping"], ["lease", "Lease of Real Property"]].map(([val, label]) => (
                                <div key={val} className="flex items-center gap-2.5">
                                    <RadioGroupItem value={val} id={val} />
                                    <Label htmlFor={val} className="font-normal cursor-pointer text-sm">{label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <div>
                        <SL>Toggle Switches</SL>
                        <div className="space-y-3">
                            {["Enable email notifications for approvals", "Auto-generate contract reference numbers", "Require two-factor approval for high-value contracts"].map((label, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <Label className="font-normal text-sm">{label}</Label>
                                    <Switch
                                        checked={switchVals[i]}
                                        onCheckedChange={(v) => setSwitchVals((prev) => prev.map((val, j) => j === i ? v : val))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Section: Status & Badges ─────────────────────────────────────────────────

const ALL_STATUSES: { group: string; statuses: OMSStatus[] }[] = [
    { group: "Contract Lifecycle", statuses: ["draft", "active", "under-review", "expired", "terminated"] },
    { group: "Approval Workflow", statuses: ["pending", "approved", "rejected", "on-hold", "waiting"] },
    { group: "Vendor Registry", statuses: ["accredited", "provisional", "suspended", "blacklisted"] },
    { group: "General / Workflow", statuses: ["new", "in-progress", "completed", "cancelled"] },
];

function StatusSection() {
    return (
        <div className="space-y-8">
            {ALL_STATUSES.map((group) => (
                <div key={group.group}>
                    <SL>{group.group}</SL>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {group.statuses.map((s) => <StatusBadge key={s} status={s} showDot />)}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {group.statuses.map((s) => <StatusBadge key={s} status={s} showDot={false} size="md" />)}
                    </div>
                </div>
            ))}

            <Separator />

            <div>
                <SL>System Alerts</SL>
                <div className="space-y-3">
                    {[
                        { Icon: Info, cls: "border-blue-200 bg-blue-50", ic: "text-blue-600", tc: "text-blue-800", dc: "text-blue-700", title: "Information", desc: "The procurement process for OMS-2025-PRO-0421 has been initiated. All required documents must be submitted by January 20, 2025." },
                        { Icon: CheckCircle, cls: "border-emerald-200 bg-emerald-50", ic: "text-emerald-600", tc: "text-emerald-800", dc: "text-emerald-700", title: "Contract Approved", desc: "OMS-2025-006 has been approved by all required signatories. The Notice to Proceed can now be issued to the vendor." },
                        { Icon: AlertCircle, cls: "border-amber-200 bg-amber-50", ic: "text-amber-600", tc: "text-amber-800", dc: "text-amber-700", title: "Attention Required", desc: "Three contracts are expiring within 30 days. Please initiate renewal proceedings to avoid service disruption." },
                        { Icon: AlertCircle, cls: "border-red-200 bg-red-50", ic: "text-red-600", tc: "text-red-800", dc: "text-red-700", title: "Validation Error", desc: "Contract value of ₱18,500,000 exceeds the approved budget ceiling. Please revise or seek augmentation approval." },
                    ].map((a, i) => (
                        <Alert key={i} className={a.cls}>
                            <a.Icon size={15} className={a.ic} />
                            <AlertTitle className={cn("text-sm font-semibold", a.tc)}>{a.title}</AlertTitle>
                            <AlertDescription className={cn("text-xs", a.dc)}>{a.desc}</AlertDescription>
                        </Alert>
                    ))}
                </div>
            </div>

            <div>
                <SL>Progress Indicators</SL>
                <div className="space-y-4">
                    {[
                        { label: "Budget Utilization (FY 2025)", value: 72, cls: "text-primary" },
                        { label: "Contract Compliance Rate", value: 94, cls: "text-emerald-600" },
                        { label: "Pending Approvals Resolved", value: 38, cls: "text-amber-600" },
                        { label: "Vendor Accreditation Progress", value: 61, cls: "text-slate-600" },
                    ].map((item) => (
                        <div key={item.label} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-700">{item.label}</span>
                                <span className={cn("text-xs font-bold", item.cls)}>{item.value}%</span>
                            </div>
                            <Progress value={item.value} className="h-1.5" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Section: Data Display ────────────────────────────────────────────────────

const KPI_CARDS = [
    { label: "Total Contracts", value: 1247, sub: "FY 2025 registry", trend: "+12%", up: true, Icon: "material-symbols:lab-profile-rounded", color: "text-primary", bg: "bg-primary/10" },
    { label: "Active Vendors", value: 89, sub: "3 new this month", trend: "+3.5%", up: true, Icon: "material-symbols:person-check-rounded", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Procurement Value", value: 2830000000, sub: "68% budget utilised", trend: "+8.2%", up: true, Icon: "material-symbols:chair-umbrella-rounded", color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Pending Approvals", value: 23, sub: "5 marked urgent", trend: "-4", up: false, Icon: "material-symbols:hourglass-bottom-rounded", color: "text-amber-600", bg: "bg-amber-50" },
];

const CONTRACT_COLS: ColumnDef<Contract>[] = [
    {
        key: "contractNo", header: "Contract No.", sortable: true, width: "140px",
        render: (v) => <span className="font-mono text-xs font-semibold text-slate-700">{String(v)}</span>
    },
    { key: "vendor", header: "Vendor / Supplier", sortable: true },
    { key: "type", header: "Type", sortable: true, width: "120px" },
    {
        key: "value", header: "Value (₱)", sortable: true, width: "140px", align: "right",
        render: (v) => <span className="font-semibold text-slate-800">{Number(v).toLocaleString()}</span>
    },
    {
        key: "endDate", header: "End Date", sortable: true, width: "120px",
        render: (v) => <span className="text-slate-600 text-xs">{String(v)}</span>
    },
    {
        key: "status", header: "Status", width: "130px",
        render: (v) => <StatusBadge status={v as OMSStatus} />
    },
];

function DataSection() {
    return (
        <div className="space-y-6">
            <div>
                <SL>KPI Metric Cards</SL>
                <div className="grid grid-cols-4 gap-4">
                    {KPI_CARDS.map((card) => {
                        return (
                            <>
                                <SimpleKpiCard
                                    icon={card.Icon}
                                    title={card.label}
                                    description={card.sub}
                                    value={Number(card.value)}
                                    color={card.color}
                                    bg={card.bg}
                                />
                            </>
                        );
                    })}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <SL className="mb-0">Contract Registry — Sortable Data Table</SL>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline"><Download size={13} /> Export CSV</Button>
                        <Button size="sm"><Plus size={13} /> New Contract</Button>
                    </div>
                </div>
                <DataTable
                    columns={CONTRACT_COLS}
                    data={CONTRACTS}
                    keyField="id"
                    selectable
                    pageSize={6}
                    rowActions={[
                        { label: "View Details", icon: <Eye size={14} />, onClick: () => { } },
                        { label: "Edit Contract", icon: <Edit size={14} />, onClick: () => { } },
                        { label: "Copy Reference", icon: <Copy size={14} />, onClick: () => { } },
                        { label: "Terminate", icon: <X size={14} />, onClick: () => { }, variant: "destructive", separator: true },
                    ]}
                />
            </div>
        </div>
    );
}

// ─── Section: Navigation ──────────────────────────────────────────────────────

function NavigationSection() {
    return (
        <div className="space-y-8">
            <div>
                <SL>Tabs — Contract Details View</SL>
                <Tabs defaultValue="overview">
                    <TabsList className="h-9 rounded-md">
                        <TabsTrigger value="overview" className="rounded text-xs">Overview</TabsTrigger>
                        <TabsTrigger value="documents" className="rounded text-xs">Documents (4)</TabsTrigger>
                        <TabsTrigger value="approvals" className="rounded text-xs">Approvals</TabsTrigger>
                        <TabsTrigger value="history" className="rounded text-xs">Activity Log</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="mt-4">
                        <Card className="rounded-md shadow-none border-slate-200">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-sm font-semibold text-slate-900">Contract Overview</CardTitle>
                                <CardDescription className="text-xs">OMS-2025-001 · TechServ Philippines Inc.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4 grid grid-cols-3 gap-4">
                                {[["Contract Value", "₱4,500,000.00"], ["Contract Type", "IT Services"], ["Term", "Jan 1 – Dec 31, 2025"], ["Funding Source", "GAA FY 2025"], ["Mode of Procurement", "Public Bidding"], ["Current Status", "Active"]].map(([k, v]) => (
                                    <div key={k}>
                                        <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{k}</div>
                                        <div className="text-sm font-semibold text-slate-800 mt-0.5">{v}</div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="documents" className="mt-4">
                        <div className="py-4 text-sm text-muted-foreground">Attached documents (BAC Resolution, NTP, Contract Agreement, Performance Bond) would appear here.</div>
                    </TabsContent>
                    <TabsContent value="approvals" className="mt-4">
                        <div className="py-4 text-sm text-muted-foreground">Approval chain and countersignature tracking would appear here.</div>
                    </TabsContent>
                    <TabsContent value="history" className="mt-4">
                        <div className="py-4 text-sm text-muted-foreground">Full audit trail and change history would appear here.</div>
                    </TabsContent>
                </Tabs>
            </div>

            <Separator />

            <div>
                <SL>Breadcrumbs</SL>
                <div className="space-y-2.5">
                    {[
                        ["OMS", "Contracts", "OMS-2025-001"],
                        ["OMS", "Vendors", "TechServ Philippines Inc.", "Accreditation Documents"],
                        ["OMS", "Procurement", "FY 2025 Plan", "IT Cluster", "Public Bidding"],
                    ].map((crumbs, i) => (
                        <div key={i} className="flex items-center gap-1 text-sm">
                            {crumbs.map((crumb, j) => (
                                <span key={j} className="flex items-center gap-1">
                                    {j < crumbs.length - 1 ? (
                                        <><button className="text-primary hover:underline text-sm">{crumb}</button><ChevronRight size={12} className="text-slate-300" /></>
                                    ) : (
                                        <span className="text-slate-800 font-semibold">{crumb}</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            <div>
                <SL>Module Cards</SL>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { title: "Contracts Management", desc: "Track and manage all outsource contracts, amendments, and renewals across all procurement types.", Icon: FileText, stat: "1,247 records", color: "text-primary", bg: "bg-primary/10" },
                        { title: "Vendor Accreditation", desc: "Screen, evaluate and maintain the registry of accredited outsource service providers.", Icon: Shield, stat: "89 accredited", color: "text-emerald-600", bg: "bg-emerald-50" },
                        { title: "Procurement Reports", desc: "Generate compliance reports aligned with COA, DBM and GPPB regulatory requirements.", Icon: BarChart3, stat: "12 report types", color: "text-indigo-600", bg: "bg-indigo-50" },
                    ].map((card) => {
                        const Icon = card.Icon;
                        return (
                            <Card key={card.title} className="rounded-md shadow-none hover:shadow-sm transition-shadow cursor-pointer border-slate-200 group">
                                <CardContent className="p-5">
                                    <div className={cn("size-9 rounded-md flex items-center justify-center mb-3", card.bg)}>
                                        <Icon size={17} className={card.color} />
                                    </div>
                                    <div className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">{card.title}</div>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.desc}</p>
                                    <div className="mt-3 text-xs font-semibold text-primary flex items-center gap-1">
                                        {card.stat} <ChevronRight size={12} />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Section: Approval Workflow ───────────────────────────────────────────────

function WorkflowSection() {
    return (
        <div className="space-y-8">
            <div>
                <SL>Horizontal Approval Chain — Procurement Request</SL>
                <ApprovalWorkflow
                    steps={APPROVAL_STEPS}
                    title="IT Infrastructure Upgrade — FY 2025 Procurement Approval"
                    referenceNumber="OMS-2025-PRO-0421"
                    requestedBy={{ name: "Juana Dela Cruz", role: "IT Section Chief", department: "IT Division", date: "January 10, 2025" }}
                    orientation="horizontal"
                />
            </div>
            <div>
                <SL>Vertical Approval Chain</SL>
                <div className="max-w-lg">
                    <ApprovalWorkflow steps={APPROVAL_STEPS} orientation="vertical" />
                </div>
            </div>
        </div>
    );
}

// ─── Section: Timeline ────────────────────────────────────────────────────────

function TimelineSection() {
    return (
        <div className="space-y-6">
            <div className="max-w-2xl">
                <SL>Contract Lifecycle — Procurement Timeline</SL>
                <Timeline items={CONTRACT_TIMELINE} />
            </div>
        </div>
    );
}

// ─── Section: Feedback ────────────────────────────────────────────────────────

function FeedbackSection() {
    const [notifs, setNotifs] = useState(SAMPLE_NOTIFICATIONS);
    const markRead = (id: string) => setNotifs((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
    const markAll = () => setNotifs((p) => p.map((n) => ({ ...n, read: true })));
    const dismiss = (id: string) => setNotifs((p) => p.filter((n) => n.id !== id));

    return (
        <div className="grid grid-cols-2 gap-6 items-start">
            <div>
                <SL>Notification Panel</SL>
                <NotificationPanel notifications={notifs} onMarkRead={markRead} onMarkAllRead={markAll} onDismiss={dismiss} />
            </div>

            <div className="space-y-6">
                <div>
                    <SL>Inline Alerts</SL>
                    <div className="space-y-3">
                        {[
                            { Icon: Info, cls: "border-blue-200 bg-blue-50", ic: "text-blue-600", tc: "text-blue-800", dc: "text-blue-700", t: "Information", d: "Procurement posting deadline is in 3 business days." },
                            { Icon: CheckCircle, cls: "border-emerald-200 bg-emerald-50", ic: "text-emerald-600", tc: "text-emerald-800", dc: "text-emerald-700", t: "Approved", d: "Your procurement request has been approved by all signatories." },
                            { Icon: AlertCircle, cls: "border-amber-200 bg-amber-50", ic: "text-amber-600", tc: "text-amber-800", dc: "text-amber-700", t: "Contract Expiring", d: "This contract expires in 14 days. Initiate renewal process." },
                            { Icon: AlertCircle, cls: "border-red-200 bg-red-50", ic: "text-red-600", tc: "text-red-800", dc: "text-red-700", t: "Validation Error", d: "Contract value exceeds the approved budget ceiling of ₱5M." },
                        ].map((a, i) => (
                            <Alert key={i} className={a.cls}>
                                <a.Icon size={15} className={a.ic} />
                                <AlertTitle className={cn("text-sm font-semibold", a.tc)}>{a.t}</AlertTitle>
                                <AlertDescription className={cn("text-xs", a.dc)}>{a.d}</AlertDescription>
                            </Alert>
                        ))}
                    </div>
                </div>

                <div>
                    <SL>System Badges (shadcn)</SL>
                    <div className="flex flex-wrap gap-2">
                        <Badge>System Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="outline">Outline</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                        {["HR", "Finance", "Procurement", "IT", "Legal", "Executive"].map((d) => (
                            <Badge key={d} variant="outline" className="text-slate-600 border-slate-300">{d}</Badge>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Section: KPI Cards ───────────────────────────────────────────────────────

function KpiSection() {
    return (
        <div className="space-y-8">
            <div>
                <SL>Simple KPI Cards</SL>
                <div className="grid grid-cols-4 gap-4">
                    {KPI_CARDS.map((card) => (
                        <SimpleKpiCard
                            key={card.label}
                            icon={card.Icon}
                            title={card.label}
                            description={card.sub}
                            value={Number(card.value)}
                            color={card.color}
                            bg={card.bg}
                        />
                    ))}
                </div>
            </div>

            <Separator />

            <div>
                <SL>Budget KPI Card</SL>
                <div className="grid grid-cols-3 gap-4">
                    <BudgetKpiCard reserved={100000} consumed={68500} />
                    <BudgetKpiCard reserved={50000} consumed={49200} />
                    <BudgetKpiCard reserved={250000} consumed={42000} />
                </div>
            </div>
        </div>
    );
}

// ─── Section: Additional UI Components ────────────────────────────────────────

function ExtrasSection() {
    const confirm = useConfirm();
    const [sliderVal, setSliderVal] = useState([40]);

    const handleConfirmDemo = confirm(
        {
            title: "Confirm Action",
            description: "Are you sure you want to proceed with this action? This is a demo of the global useConfirm hook.",
            confirmLabel: "Yes, proceed",
            variant: "default",
        },
        () => { alert("Confirmed!"); },
    );

    const handleDestructiveDemo = confirm(
        {
            title: "Delete Contract?",
            description: "This will permanently remove contract OMS-2025-001 and all associated documents from the system.",
            confirmLabel: "Delete Permanently",
            variant: "destructive",
        },
        () => { alert("Deleted!"); },
    );

    return (
        <div className="space-y-8">

            {/* ── Confirm Dialog ───────────────────────────────── */}
            <div>
                <SL>Confirm Dialog (useConfirm hook)</SL>
                <p className="text-xs text-muted-foreground mb-3">A global, imperative confirmation dialog rendered once in the app via context. No need to declare the dialog in every component.</p>
                <div className="flex gap-3">
                    <Button onClick={handleConfirmDemo}>Confirm Action</Button>
                    <Button variant="destructive" onClick={handleDestructiveDemo}>
                        <Trash2 size={14} /> Destructive Confirm
                    </Button>
                </div>
            </div>

            <Separator />

            {/* ── Accordion ────────────────────────────────────── */}
            <div>
                <SL>Accordion</SL>
                <Accordion type="single" collapsible className="w-full max-w-lg">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>What is the OMS?</AccordionTrigger>
                        <AccordionContent>
                            The Outsource Management System (OMS) is a platform for managing contracts, vendors, procurement workflows, and compliance reporting.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>How are contracts approved?</AccordionTrigger>
                        <AccordionContent>
                            Contracts follow a multi-step approval workflow, requiring sign-off from Section Chiefs, Division Managers, Finance, Procurement, and Executive Directors.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>What procurement modes are supported?</AccordionTrigger>
                        <AccordionContent>
                            The system supports Public Bidding, Limited Source Bidding, Direct Contracting, Shopping, and Lease of Real Property.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            <Separator />

            {/* ── Avatars ──────────────────────────────────────── */}
            <div>
                <SL>Avatars</SL>
                <div className="flex items-center gap-3">
                    {[
                        { initials: "JR", bg: "bg-primary text-white" },
                        { initials: "MS", bg: "bg-emerald-600 text-white" },
                        { initials: "RL", bg: "bg-indigo-600 text-white" },
                        { initials: "AC", bg: "bg-amber-600 text-white" },
                        { initials: "LC", bg: "bg-rose-600 text-white" },
                    ].map((a) => (
                        <Avatar key={a.initials} className="size-10">
                            <AvatarFallback className={cn("text-xs font-bold", a.bg)}>{a.initials}</AvatarFallback>
                        </Avatar>
                    ))}

                    <Separator orientation="vertical" className="h-8" />

                    {/* Stacked avatars */}
                    <div className="flex -space-x-2">
                        {["JR", "MS", "RL", "AC", "+3"].map((initials, i) => (
                            <Avatar key={i} className="size-8 border-2 border-background">
                                <AvatarFallback className={cn("text-[10px] font-bold", i === 4 ? "bg-muted text-muted-foreground" : "bg-primary text-white")}>{initials}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                </div>
            </div>

            <Separator />

            {/* ── Tooltips ─────────────────────────────────────── */}
            <div>
                <SL>Tooltips</SL>
                <div className="flex gap-3">
                    {(["top", "right", "bottom", "left"] as const).map((side) => (
                        <Tooltip key={side}>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm">Tooltip {side}</Button>
                            </TooltipTrigger>
                            <TooltipContent side={side}>
                                <p>This is a {side} tooltip</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>

            <Separator />

            {/* ── Hover Card ───────────────────────────────────── */}
            <div>
                <SL>Hover Card</SL>
                <HoverCard>
                    <HoverCardTrigger asChild>
                        <Button variant="link" className="text-primary p-0 h-auto">@TechServ Philippines Inc.</Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                        <div className="flex gap-3">
                            <Avatar className="size-10">
                                <AvatarFallback className="bg-primary text-white text-xs font-bold">TP</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold">TechServ Philippines Inc.</h4>
                                <p className="text-xs text-muted-foreground">Accredited IT service provider since 2019. Specializes in infrastructure, cloud services, and enterprise software.</p>
                                <div className="flex items-center gap-2 pt-1">
                                    <StatusBadge status="accredited" />
                                    <span className="text-xs text-muted-foreground">12 active contracts</span>
                                </div>
                            </div>
                        </div>
                    </HoverCardContent>
                </HoverCard>
            </div>

            <Separator />

            {/* ── Sheet (Slide-over panel) ──────────────────────── */}
            <div>
                <SL>Sheet (Slide-over Panel)</SL>
                <div className="flex gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline"><Eye size={14} /> View Details</Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Contract Details</SheetTitle>
                                <SheetDescription>OMS-2025-001 · TechServ Philippines Inc.</SheetDescription>
                            </SheetHeader>
                            <div className="space-y-4 mt-6">
                                {[["Contract Value", "₱4,500,000.00"], ["Type", "IT Services"], ["Term", "Jan 1 – Dec 31, 2025"], ["Status", "Active"], ["Funding", "GAA FY 2025"]].map(([k, v]) => (
                                    <div key={k} className="flex justify-between border-b pb-2">
                                        <span className="text-sm text-muted-foreground">{k}</span>
                                        <span className="text-sm font-medium">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <Separator />

            {/* ── Skeleton ─────────────────────────────────────── */}
            <div>
                <SL>Skeleton Loading States</SL>
                <div className="grid grid-cols-2 gap-6">
                    <Card className="shadow-none">
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-5/6" />
                            <Skeleton className="h-3 w-4/6" />
                        </CardContent>
                    </Card>
                    <Card className="shadow-none">
                        <CardContent className="p-5 space-y-3">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-2 w-full mt-4" />
                            <div className="flex justify-between">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator />

            {/* ── Slider ───────────────────────────────────────── */}
            <div>
                <SL>Slider</SL>
                <div className="max-w-md space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <Label>Budget Allocation</Label>
                            <span className="text-sm font-semibold text-primary">{sliderVal[0]}%</span>
                        </div>
                        <Slider value={sliderVal} onValueChange={setSliderVal} max={100} step={1} />
                    </div>
                    <div>
                        <Label className="mb-2 block">Disabled Slider</Label>
                        <Slider defaultValue={[65]} max={100} step={1} disabled />
                    </div>
                </div>
            </div>

            <Separator />

            {/* ── Toggle & Toggle Group ─────────────────────────── */}
            <div>
                <SL>Toggle & Toggle Group</SL>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Toggle aria-label="Toggle bold" variant="outline"><Type size={14} /> Bold</Toggle>
                        <Toggle aria-label="Toggle italic" variant="outline">Italic</Toggle>
                        <Toggle aria-label="Toggle underline" variant="outline" disabled>Disabled</Toggle>
                    </div>

                    <div>
                        <Label className="mb-2 block text-xs text-muted-foreground">View Mode</Label>
                        <ToggleGroup type="single" defaultValue="grid" variant="outline">
                            <ToggleGroupItem value="grid" aria-label="Grid view"><LayoutGrid size={14} /> Grid</ToggleGroupItem>
                            <ToggleGroupItem value="list" aria-label="List view"><FileText size={14} /> List</ToggleGroupItem>
                            <ToggleGroupItem value="chart" aria-label="Chart view"><BarChart3 size={14} /> Chart</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>
            </div>

            <Separator />

            {/* ── Popover ──────────────────────────────────────── */}
            <div>
                <SL>Popover</SL>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">Open Popover</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Dimensions</h4>
                                <p className="text-sm text-muted-foreground">
                                    Set the dimensions for the layer.
                                </p>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <Separator />

            {/* ── Dropdown Menu ────────────────────────────────── */}
            <div>
                <SL>Dropdown Menu</SL>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Open Menu</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem>Team</DropdownMenuItem>
                        <DropdownMenuItem>Subscription</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Separator />

            {/* ── Calendar ─────────────────────────────────────── */}
            <div>
                <SL>Calendar</SL>
                <div className="border rounded-md inline-block bg-white p-3">
                    <Calendar mode="single" className="rounded-md border" />
                </div>
            </div>

            <Separator />

            {/* ── Breadcrumb ───────────────────────────────────── */}
            <div>
                <SL>Breadcrumb</SL>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="#">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="#">Components</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <Separator />

            {/* ── Pagination ───────────────────────────────────── */}
            <div>
                <SL>Pagination</SL>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" isActive>2</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
    const [section, setSection] = useState("foundation");
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifs, setNotifs] = useState(SAMPLE_NOTIFICATIONS);
    const unread = notifs.filter((n) => !n.read).length;

    const SECTION_MAP: Record<string, ReactNode> = {
        foundation: <FoundationSection />,
        typography: <TypographySection />,
        actions: <ActionsSection />,
        forms: <FormsSection />,
        status: <StatusSection />,
        data: <DataSection />,
        navigation: <NavigationSection />,
        extras: <ExtrasSection />,
        kpis: <KpiSection />,
        workflow: <WorkflowSection />,
        timeline: <TimelineSection />,
        feedback: <FeedbackSection />,
    };

    return (
        <div className="flex min-h-screen mesh-bg">

            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside className="w-60 bg-sidebar flex flex-col h-screen sticky top-0 shrink-0 border-r border-sidebar-border overflow-hidden">
                {/* Logo */}
                <div className="px-4 py-5 border-b border-sidebar-border shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="size-8 bg-primary rounded-md flex items-center justify-center shrink-0">
                            <Building2 size={15} className="text-white" />
                        </div>
                        <div>
                            <div className="text-white font-bold text-sm leading-none">OMS</div>
                            <div className="text-[10px] text-sidebar-foreground/40 leading-none mt-0.5 uppercase tracking-widest">Design System</div>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between px-2 py-1 bg-sidebar-accent/70 rounded">
                        <span className="text-[10px] text-sidebar-foreground/50 font-mono">v1.0.0</span>
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">STABLE</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
                    {NAV_GROUPS.map((group) => (
                        <div key={group.label}>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/30 px-2 mb-1">
                                {group.label}
                            </p>
                            <div className="space-y-0.5">
                                {group.items.map(({ id, label, Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => { setSection(id); setNotifOpen(false); }}
                                        className={cn(
                                            "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors text-left",
                                            section === id
                                                ? "bg-primary text-white font-medium"
                                                : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        )}
                                    >
                                        <Icon size={14} className="shrink-0" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* ── Main Area ───────────────────────────────────────── */}
            <main
                className="flex-1 w-full min-w-0"
                onClick={() => notifOpen && setNotifOpen(false)}
            >
                <SectionWrapper title={SECTION_TITLES[section]}>
                    {SECTION_MAP[section]}
                </SectionWrapper>
            </main>
        </div>
    );
}
