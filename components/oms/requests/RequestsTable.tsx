"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Clock3,
  CircleAlert,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/components/ui/utils";
import { formatAmount } from "@/lib/money";

import { RequestExpandedDetails } from "./RequestExpandedDetails";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { OmsRequest } from "./request.types";

type SortKey =
  | "requestId"
  | "position"
  | "resources"
  | "actualStatus"
  | "currentStage"
  | "currentOwner"
  | "budget"
  | "updatedAt"
  | "sla";

interface SortState {
  key: SortKey;
  direction: "asc" | "desc";
}

interface RequestsTableProps {
  requests: OmsRequest[];
  expandedRequestId: string | null;
  onExpandedRequestChange: (requestId: string | null) => void;
  isNeedsActionTab?: boolean;
  currentUserId?: string;
}

function compareValues(a: any, b: any) {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  return String(a ?? "").localeCompare(String(b ?? ""), "en", {
    numeric: true,
    sensitivity: "base",
  });
}

function SortableHeader({
  label,
  sortKey,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
  align?: "left" | "center" | "right";
}) {
  const isActive = sort.key === sortKey;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold uppercase leading-4 tracking-wider text-muted-foreground hover:text-foreground transition-colors",
        align === "center" && "justify-center w-full",
        align === "right" && "justify-end w-full"
      )}
    >
      <span>{label}</span>
      {isActive ? (
        sort.direction === "asc" ? (
          <ChevronUp className="size-3 text-primary shrink-0" />
        ) : (
          <ChevronDown className="size-3 text-primary shrink-0" />
        )
      ) : (
        <ChevronsUpDown className="size-3 opacity-50 shrink-0" />
      )}
    </button>
  );
}

export function RequestsTable({
  requests,
  expandedRequestId,
  onExpandedRequestChange,
  isNeedsActionTab = false,
  currentUserId = "u-101",
}: RequestsTableProps) {
  // Part 3: Default sort on Needs My Action: SLA urgency, then oldest first
  const [sort, setSort] = React.useState<SortState>(() =>
    isNeedsActionTab
      ? { key: "sla", direction: "asc" }
      : { key: "updatedAt", direction: "desc" }
  );

  React.useEffect(() => {
    if (isNeedsActionTab) {
      setSort({ key: "sla", direction: "asc" });
    }
  }, [isNeedsActionTab]);

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(5);

  const sortedRequests = React.useMemo(() => {
    return [...requests].sort((requestA, requestB) => {
      if (sort.key === "sla") {
        // Breached items first, then lowest daysRemaining, then fallback to updatedAt asc
        const slaA = requestA.sla;
        const slaB = requestB.sla;

        if (slaA && !slaB) return -1;
        if (!slaA && slaB) return 1;
        if (slaA && slaB) {
          if (slaA.breached && !slaB.breached) return -1;
          if (!slaA.breached && slaB.breached) return 1;
          if (slaA.daysRemaining !== slaB.daysRemaining) {
            return sort.direction === "asc"
              ? slaA.daysRemaining - slaB.daysRemaining
              : slaB.daysRemaining - slaA.daysRemaining;
          }
        }
        // Fallback: oldest first on Needs My Action
        return requestA.updatedAt.localeCompare(requestB.updatedAt);
      }

      const result = compareValues(
        requestA[sort.key as keyof OmsRequest],
        requestB[sort.key as keyof OmsRequest]
      );

      return sort.direction === "asc" ? result : -result;
    });
  }, [requests, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedRequests.length / pageSize));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const startIndex = safePageIndex * pageSize;
  const visibleRequests = sortedRequests.slice(startIndex, startIndex + pageSize);

  const changeSort = (key: SortKey) => {
    setSort((current) =>
      current.key === key
        ? {
            key,
            direction: current.direction === "asc" ? "desc" : "asc",
          }
        : {
            key,
            direction: "asc",
          }
    );
  };

  const toggleExpanded = (requestId: string) => {
    onExpandedRequestChange(expandedRequestId === requestId ? null : requestId);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60 dark:border-white/[0.08] bg-card shadow-xs">
      <Table className="w-full border-none">
        <TableHeader className="border-b border-border/60 bg-muted/40">
          <TableRow className="hover:bg-muted/40">
            <TableHead className="w-9 px-2">
              <span className="sr-only">Expand request</span>
            </TableHead>

            <TableHead className="px-3 py-3 whitespace-nowrap min-w-[140px]">
              <SortableHeader
                label="Request ID"
                sortKey="requestId"
                sort={sort}
                onSort={changeSort}
              />
            </TableHead>

            <TableHead className="px-3 py-3 whitespace-nowrap min-w-[180px]">
              <SortableHeader
                label="Position"
                sortKey="position"
                sort={sort}
                onSort={changeSort}
              />
            </TableHead>

            <TableHead className="px-2 py-3 text-center whitespace-nowrap w-14">
              <SortableHeader
                label="Qty"
                sortKey="resources"
                sort={sort}
                onSort={changeSort}
                align="center"
              />
            </TableHead>

            <TableHead className="px-3 py-3 whitespace-nowrap min-w-[150px]">
              <SortableHeader
                label="Status / SLA"
                sortKey="actualStatus"
                sort={sort}
                onSort={changeSort}
              />
            </TableHead>

            <TableHead className="px-3 py-3 whitespace-nowrap min-w-[130px]">
              <SortableHeader
                label="Current Stage"
                sortKey="currentStage"
                sort={sort}
                onSort={changeSort}
              />
            </TableHead>

            <TableHead className="px-3 py-3 whitespace-nowrap min-w-[140px]">
              <SortableHeader
                label="Current Owner"
                sortKey="currentOwner"
                sort={sort}
                onSort={changeSort}
              />
            </TableHead>

            <TableHead className="px-3 py-3 text-right whitespace-nowrap min-w-[140px]">
              <SortableHeader
                label="Budget"
                sortKey="budget"
                sort={sort}
                onSort={changeSort}
                align="right"
              />
            </TableHead>

            <TableHead className="px-3 py-3 whitespace-nowrap min-w-[110px]">
              <SortableHeader
                label="Updated"
                sortKey="updatedAt"
                sort={sort}
                onSort={changeSort}
              />
            </TableHead>

            <TableHead className="px-3 py-3 text-right whitespace-nowrap min-w-[150px] text-xs font-semibold uppercase leading-4 tracking-wider text-muted-foreground">
              Next Action
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibleRequests.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="h-44 text-center py-10"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {isNeedsActionTab
                      ? "Nothing waiting on you."
                      : "No requests match the current filters."}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    {isNeedsActionTab
                      ? "All your assigned tasks and requisitions are up to date."
                      : "Try adjusting your search criteria or resetting active filters."}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            visibleRequests.map((request, index) => {
              const isExpanded = expandedRequestId === request.requestId;

              // SLA calculations
              const sla = request.sla;
              let slaColor = "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
              let slaIcon = <Clock3 className="size-3" />;

              if (sla) {
                if (sla.breached || sla.daysRemaining < 3) {
                  slaColor = "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";
                  slaIcon = <CircleAlert className="size-3" />;
                } else if (sla.daysRemaining <= 7) {
                  slaColor = "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
                }
              }

              // Role Queue & Assignment Status
              const isRoleQueue = request.assignment?.mode === "ROLE_QUEUE";
              const isClaimedByMe = request.assignment?.claimedBy?.id === currentUserId;
              const isClaimedByOther = request.assignment?.claimedBy && !isClaimedByMe;

              return (
                <React.Fragment key={request.id}>
                  <TableRow
                    aria-expanded={isExpanded}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (
                        event.target === event.currentTarget &&
                        (event.key === "Enter" || event.key === " ")
                      ) {
                        event.preventDefault();
                        toggleExpanded(request.requestId);
                      }
                    }}
                    onDoubleClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (
                        target.closest(
                          "button, a, input, select, textarea, [role='menuitem']"
                        )
                      ) {
                        return;
                      }
                      toggleExpanded(request.requestId);
                    }}
                    className={cn(
                      "cursor-pointer border-border/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60 transition-colors",
                      index % 2 === 1 && "bg-muted/15",
                      isExpanded && "bg-primary/5"
                    )}
                  >
                    <TableCell className="px-2 py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg text-muted-foreground"
                        aria-label={
                          isExpanded
                            ? `Collapse ${request.requestId}`
                            : `Expand ${request.requestId}`
                        }
                        onClick={() => toggleExpanded(request.requestId)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </Button>
                    </TableCell>

                    <TableCell className="px-3 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="whitespace-nowrap font-mono text-xs font-semibold text-foreground/90">
                          {request.requestId}
                        </span>
                        {request.actingFor && (
                          <Badge
                            variant="outline"
                            className="text-[9px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20 w-max px-1.5 py-0 truncate max-w-[130px]"
                            title={`Acting for ${request.actingFor.name}`}
                          >
                            Acting for {request.actingFor.name}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-3">
                      <div className="font-medium text-foreground text-sm truncate max-w-[200px]" title={request.position}>
                        {request.position}
                      </div>
                    </TableCell>

                    <TableCell className="px-2 py-3 text-center text-sm font-medium">
                      {request.resources}
                    </TableCell>

                    <TableCell className="px-3 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <RequestStatusBadge
                          status={request.actualStatus}
                        />
                        {/* SLA Indicator per Part 3 */}
                        {sla && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "gap-1 font-medium text-[10px] w-max py-0.5 px-1.5 whitespace-nowrap",
                              slaColor
                            )}
                          >
                            {slaIcon}
                            <span>
                              {sla.breached
                                ? "Breached"
                                : `${sla.daysRemaining}d left`}
                            </span>
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-3 text-sm">
                      <div className="truncate max-w-[120px]" title={request.currentStage}>
                        {request.currentStage}
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-3 text-sm">
                      <div className="truncate max-w-[130px]" title={request.currentOwner}>
                        {request.currentOwner}
                      </div>
                    </TableCell>

                    {/* Money column: exact via lib/money.ts, tabular-nums */}
                    <TableCell className="px-3 py-3 text-right text-sm font-semibold tabular-nums whitespace-nowrap">
                      AED {formatAmount(request.budget * 100)}
                    </TableCell>

                    <TableCell className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">
                      {request.updatedLabel}
                    </TableCell>

                    {/* Next Action Column: Part 3 Reuse */}
                    <TableCell className="whitespace-nowrap px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {request.actionType === "APPROVE" ? (
                          isRoleQueue ? (
                            isClaimedByMe ? (
                              <div className="flex items-center gap-1.5">
                                <Link
                                  href={`/app/requests/${
                                    request.approvalTaskId || request.requestId
                                  }?action=approve`}
                                >
                                  <Button
                                    size="sm"
                                    className="h-8 w-32 rounded-lg px-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white text-center justify-center shadow-xs"
                                  >
                                    Review & approve
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 rounded-lg px-2 text-xs"
                                >
                                  Release
                                </Button>
                              </div>
                            ) : isClaimedByOther ? (
                              <Badge
                                variant="outline"
                                className="bg-muted text-muted-foreground border-border/40 text-xs py-1"
                              >
                                Claimed by {request.assignment?.claimedBy?.name}
                              </Badge>
                            ) : (
                              <Link href={`/app/requests/${request.requestId}/documents`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-32 rounded-lg px-2 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/5 text-center justify-center"
                                >
                                  Claim
                                </Button>
                              </Link>
                            )
                          ) : (
                            <Link
                              href={`/app/requests/${
                                request.approvalTaskId || request.requestId
                              }?action=approve`}
                            >
                              <Button
                                size="sm"
                                className="h-8 w-32 rounded-lg px-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white text-center justify-center shadow-xs"
                              >
                                Review & approve
                              </Button>
                            </Link>
                          )
                        ) : request.actionType === "CLARIFY" ? (
                          <Link href={`/app/requests/${request.requestId}/clarifications/clar-001`}>
                            <Button
                              size="sm"
                              className="h-8 w-32 rounded-lg px-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white text-center justify-center shadow-xs"
                            >
                              Respond to HR
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-32 rounded-lg px-2 text-xs font-medium text-center justify-center truncate"
                            onClick={() => toggleExpanded(request.requestId)}
                          >
                            {request.nextAction}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow className="border-primary/20 hover:bg-transparent">
                      <TableCell colSpan={10} className="whitespace-normal p-0">
                        <RequestExpandedDetails request={request} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-border/60 bg-card px-4 py-3 sm:flex-row">
        <div className="flex items-center gap-3">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPageIndex(0);
            }}
          >
            <SelectTrigger className="h-8 w-[125px] bg-background/80 dark:bg-card/40 text-xs">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="5">Show 5 rows</SelectItem>
              <SelectItem value="10">Show 10 rows</SelectItem>
              <SelectItem value="20">Show 20 rows</SelectItem>
            </SelectContent>
          </Select>

          <p className="text-xs text-muted-foreground">
            Showing {sortedRequests.length === 0 ? 0 : startIndex + 1}–
            {Math.min(startIndex + pageSize, sortedRequests.length)} of{" "}
            {sortedRequests.length} requests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={safePageIndex === 0}
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="text-xs text-muted-foreground">
            Page {safePageIndex + 1} of {totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={safePageIndex >= totalPages - 1}
            onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}