"use client";

import * as React from "react";
import {
  MoreHorizontal,
  ExternalLink,
  FileDown,
  Edit3,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Lock,
  AlertCircle,
} from "lucide-react";
import { IBudgetLineDto, IBudgetPeriodDto, IFundMovementDto } from "@/lib/types/budget.types";
import { useBudgetLineMovements, useBudgetRequests } from "@/hooks/useBudget";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { formatAmount } from "@/lib/money";
import { FundStateBar } from "./FundStateBar";
import { FundStateBadge } from "./FundStateBadge";
import { Amount } from "./Amount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatMovementDate(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

/** Whether moving into this state is a decrease (funds returned) vs an increase */
function isDecreasingEvent(movement: IFundMovementDto): boolean {
  // AVAILABLE going up means a release — that's returning funds
  return movement.toState === "AVAILABLE" && movement.fromState !== "AVAILABLE";
}

// ─── Section Heading ─────────────────────────────────────────────────────────

function SectionHeading({
  children,
  count,
}: {
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-2 bg-muted/30 border-b border-t border-border/40">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {children}
      </span>
      {count !== undefined && (
        <span className="text-[10px] font-bold text-muted-foreground tabular-nums">{count}</span>
      )}
    </div>
  );
}

// ─── Period Context Strip ────────────────────────────────────────────────────

function PeriodStrip({
  periodData,
  isClosed,
  onManage,
  canManage,
}: {
  periodData?: IBudgetPeriodDto;
  isClosed: boolean;
  onManage?: () => void;
  canManage: boolean;
}) {
  const code = periodData?.code ?? "FY 2026";
  const isPending = periodData?.status === "AMENDMENT_PENDING";

  let label: string;
  let stripClass: string;

  if (isClosed) {
    label = `${code} · Closed — no changes possible`;
    stripClass = "bg-zinc-500/8 border-b border-zinc-300/30 dark:border-zinc-700/40 text-zinc-600 dark:text-zinc-400";
  } else if (isPending) {
    label = `${code} · Closing — awaiting Finance HOD`;
    stripClass = "bg-amber-500/8 border-b border-amber-300/30 dark:border-amber-700/40 text-amber-700 dark:text-amber-400";
  } else {
    label = `${code} · Open — changes allowed`;
    stripClass = "bg-emerald-500/8 border-b border-emerald-300/30 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-400";
  }

  return (
    <div className={cn("flex items-center justify-between px-5 py-2", stripClass)}>
      <div className="flex items-center gap-1.5 text-[11px] font-medium">
        {isClosed && <Lock className="size-3 shrink-0" />}
        {isPending && <AlertCircle className="size-3 shrink-0" />}
        <span>{label}</span>
      </div>
      {canManage && onManage && (
        <button
          type="button"
          onClick={onManage}
          className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5 shrink-0 ml-2"
        >
          Manage <ChevronRight className="size-3" />
        </button>
      )}
    </div>
  );
}

// ─── Ledger Row ──────────────────────────────────────────────────────────────

function LedgerRow({ movement }: { movement: IFundMovementDto }) {
  const decreasing = isDecreasingEvent(movement);
  const date = formatMovementDate(movement.timestamp);

  return (
    <div className="flex items-start gap-3 px-5 py-2.5 text-xs border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
      {/* Date */}
      <span className="text-[11px] text-muted-foreground whitespace-nowrap w-20 shrink-0 pt-0.5">
        {date}
      </span>

      {/* Request + event */}
      <div className="flex-1 min-w-0 space-y-0.5">
        {movement.requestCode && (
          <a
            href={`/app/requisitions/${movement.requestId}`}
            className="font-mono text-[10px] text-primary hover:underline truncate block"
          >
            {movement.requestCode}
          </a>
        )}
        <FundStateBadge state={movement.toState} size="sm" />
      </div>

      {/* Amount — right-aligned, red if decreasing */}
      <span
        className={cn(
          "font-mono tabular-nums text-xs font-semibold shrink-0 text-right whitespace-nowrap",
          decreasing ? "text-rose-600 dark:text-rose-400" : "text-foreground"
        )}
      >
        {decreasing && <span>-</span>}
        {formatAmount(movement.amountFils)}
      </span>
    </div>
  );
}

// ─── Main Panel Contents ─────────────────────────────────────────────────────

export interface SelectedLinePanelProps {
  selectedLine?: IBudgetLineDto | null;
  periodData?: IBudgetPeriodDto;
  periodId?: string;
  departmentId?: string;
  onOpenManagePeriodDialog?: () => void;
  /** Called when panel should close (drawer mode) */
  onClose?: () => void;
  className?: string;
}

function PanelContents({
  selectedLine,
  periodData,
  periodId,
  departmentId,
  onOpenManagePeriodDialog,
}: SelectedLinePanelProps) {
  const { can } = usePermission();
  const canManagePeriod = can(PERMISSIONS.BUDGET_PERIOD_MANAGE);
  const isClosed = periodData?.status === "CLOSED";

  const isLineSelected = Boolean(selectedLine);

  // Fund movements — reuse existing hook
  const { data: movementsData, isLoading: isMovementsLoading } = useBudgetLineMovements(
    selectedLine?.id ?? null,
    departmentId
  );

  // Requests on this line
  const { data: requestsData, isLoading: isRequestsLoading } = useBudgetRequests(
    isLineSelected
      ? { periodId, departmentId, page: 1, limit: 20 }
      : undefined
  );

  const movements: IFundMovementDto[] = (movementsData?.movements ?? [])
    .filter((m) => m.isCompleted)
    .slice(0, 5);

  // Filter requests to this line only
  const lineRequests = (requestsData?.items ?? []).filter(
    (r) => r.budgetLineCode === selectedLine?.code
  );

  // ── Nothing selected: department summary ──────────────────────────────────
  if (!isLineSelected) {
    const deptMovements = (movementsData?.movements ?? []).filter((m) => m.isCompleted).slice(0, 5);

    return (
      <div className="h-full flex flex-col">
        {/* Period strip */}
        <PeriodStrip
          periodData={periodData}
          isClosed={isClosed}
          onManage={onOpenManagePeriodDialog}
          canManage={canManagePeriod}
        />

        {/* Empty state prompt */}
        <div className="px-5 py-4 bg-muted/20 border-b border-border/40">
          <p className="text-[11px] text-muted-foreground italic">
            Select a budget line to see its detail.
          </p>
        </div>

        {/* Department fund movements */}
        <SectionHeading count={deptMovements.length}>Recent Movements</SectionHeading>
        <div className="flex-1 overflow-y-auto">
          {isMovementsLoading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded-md" />)}
            </div>
          ) : deptMovements.length === 0 ? (
            <p className="text-[11px] text-muted-foreground px-5 py-4 italic">
              No recent movements across this department.
            </p>
          ) : (
            deptMovements.map((m) => <LedgerRow key={m.id} movement={m} />)
          )}
        </div>
      </div>
    );
  }

  // ── Line selected ─────────────────────────────────────────────────────────
  // selectedLine is guaranteed non-null here — isLineSelected check above returned early
  const line = selectedLine!;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 1. Period context strip */}
      <PeriodStrip
        periodData={periodData}
        isClosed={isClosed}
        onManage={onOpenManagePeriodDialog}
        canManage={canManagePeriod}
      />

      <div className="flex-1 overflow-y-auto">
        {/* 2. Line identity */}
        <div className="px-5 py-4 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="font-mono text-[11px] text-muted-foreground block">
                {line.code}
              </span>
              <h3 className="text-[17px] font-semibold text-foreground leading-snug mt-0.5">
                {line.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                AED{" "}
                <Amount
                  value={line.totalFils}
                  className="text-sm font-semibold text-foreground"
                />
              </p>
            </div>

            {/* ⋯ Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Line actions"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuItem asChild>
                  <a href={`/app/budget/dept-budget?code=${line.code}`} className="flex items-center gap-2 cursor-pointer">
                    <BookOpen className="size-3.5" /> View full ledger
                    <ExternalLink className="size-3 ml-auto opacity-50" />
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isClosed}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileDown className="size-3.5" /> Export line
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isClosed}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 className="size-3.5" /> Raise amendment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Closed-period action gate */}
          {isClosed && (
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
              <Lock className="size-3 shrink-0" />
              <span>Actions disabled — period is closed</span>
            </div>
          )}
        </div>

        <Separator className="opacity-30" />

        {/* 3. Fund state bar — REUSE, scoped to this line */}
        <div className="px-5 py-3">
          <FundStateBar
            totalFils={line.totalFils}
            availableFils={line.availableFils}
            reservedFils={line.reservedFils}
            lockedFils={line.lockedFils}
            consumedFils={line.consumedFils}
            legendLayout="vertical"
            className="py-2"
          />
        </div>

        <Separator className="opacity-30" />

        {/* 4. Fund movements — chronological ledger */}
        <SectionHeading>Fund Movements</SectionHeading>

        {/* Column headers */}
        <div className="flex items-center gap-3 px-5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/30">
          <span className="w-20 shrink-0">Date</span>
          <span className="flex-1">Request · Event</span>
          <span className="text-right">AED</span>
        </div>

        {isMovementsLoading ? (
          <div className="space-y-1.5 p-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded" />)}
          </div>
        ) : movements.length === 0 ? (
          <p className="text-[11px] text-muted-foreground px-5 py-4 italic">
            No movements yet on this budget line.
          </p>
        ) : (
          <>
            {movements.map((m) => <LedgerRow key={m.id} movement={m} />)}
            <div className="px-5 py-2">
              <a
                href={`/app/budget/dept-budget?code=${line.code}`}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View ledger <ArrowUpRight className="size-3" />
              </a>
            </div>
          </>
        )}

        <Separator className="opacity-30 mt-1" />

        {/* 5. Requests on this line */}
        <SectionHeading count={lineRequests.length}>
          Requests on This Line
        </SectionHeading>

        {isRequestsLoading ? (
          <div className="space-y-1.5 p-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-9 rounded" />)}
          </div>
        ) : lineRequests.length === 0 ? (
          <p className="text-[11px] text-muted-foreground px-5 py-4 italic">
            No open requests on this line.
          </p>
        ) : (
          <div>
            {lineRequests.map((req) => (
              <a
                key={req.id}
                href={`/app/requisitions/${req.id}`}
                className="flex items-center justify-between gap-3 px-5 py-2.5 text-xs border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors group"
              >
                <div className="min-w-0 space-y-0.5">
                  <span className="font-mono text-[10px] text-primary block">{req.requestCode}</span>
                  <span className="text-muted-foreground truncate block">{req.typeLabel}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] px-1.5 py-0 font-semibold",
                      req.status === "APPROVED" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                      req.status === "AWAITING_APPROVAL" && "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
                      req.status === "EXCEPTION" && "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                    )}
                  >
                    {req.status === "AWAITING_APPROVAL" ? "Awaiting" : req.status === "EXCEPTION" ? "Exception" : req.status.charAt(0) + req.status.slice(1).toLowerCase()}
                  </Badge>
                  <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Bottom padding */}
        <div className="h-6" />
      </div>

      {/* Raise amendment footer action */}
      {!isClosed && (
        <div className="px-5 py-3 border-t border-border/40 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-semibold gap-1.5"
            disabled={isClosed}
          >
            <Edit3 className="size-3.5" />
            Raise amendment
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PanelSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
      <Separator className="opacity-30 my-2" />
      <Skeleton className="h-6 w-full rounded-md" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-14 rounded-md" />
        <Skeleton className="h-14 rounded-md" />
        <Skeleton className="h-14 rounded-md" />
        <Skeleton className="h-14 rounded-md" />
      </div>
      <Separator className="opacity-30 my-2" />
      <div className="space-y-2">
        <Skeleton className="h-9 rounded-md" />
        <Skeleton className="h-9 rounded-md" />
        <Skeleton className="h-9 rounded-md" />
      </div>
    </div>
  );
}

// ─── Public Export: handles both sticky panel and drawer mode ─────────────────

export function SelectedLinePanel({
  selectedLine,
  periodData,
  periodId,
  departmentId,
  onOpenManagePeriodDialog,
  onClose,
  className,
}: SelectedLinePanelProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const panelProps: SelectedLinePanelProps = {
    selectedLine,
    periodData,
    periodId,
    departmentId,
    onOpenManagePeriodDialog,
  };

  // ── Drawer mode (< 1024px) — only open when a line is selected ───────────
  if (isMobile) {
    return (
      <Sheet open={Boolean(selectedLine)} onOpenChange={(open) => { if (!open) onClose?.(); }}>
        <SheetContent
          side="bottom"
          className="h-[85dvh] p-0 rounded-t-2xl overflow-hidden border-border/60"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>
              {selectedLine ? `${selectedLine.code} — ${selectedLine.name}` : "Budget line detail"}
            </SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-hidden">
            <PanelContents {...panelProps} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // ── Sticky panel mode (≥ 1024px) ─────────────────────────────────────────
  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-card overflow-hidden flex flex-col",
        "sticky top-6 max-h-[calc(100vh-96px)] shadow-xs",
        className
      )}
    >
      <PanelContents {...panelProps} />
    </div>
  );
}
