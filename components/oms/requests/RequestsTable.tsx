"use client";

import * as React from "react";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";

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
  | "updatedAt";

interface SortState {
  key: SortKey;
  direction: "asc" | "desc";
}

interface RequestsTableProps {
  requests: OmsRequest[];
  expandedRequestId: string | null;
  onExpandedRequestChange: (
    requestId: string | null
  ) => void;
}

const currencyFormatter =
  new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  });

function compareValues(
  a: string | number,
  b: string | number
) {
  if (
    typeof a === "number" &&
    typeof b === "number"
  ) {
    return a - b;
  }

  return String(a).localeCompare(
    String(b),
    "en",
    {
      numeric: true,
      sensitivity: "base",
    }
  );
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
  const isActive =
    sort.key === sortKey;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        "inline-flex w-full items-center gap-1 whitespace-normal text-xs font-semibold uppercase leading-4 tracking-wider text-slate-500 hover:text-foreground",

        align === "center" &&
          "justify-center",

        align === "right" &&
          "justify-end"
      )}
    >
      {label}

      {isActive ? (
        sort.direction === "asc" ? (
          <ChevronUp className="size-3 text-primary" />
        ) : (
          <ChevronDown className="size-3 text-primary" />
        )
      ) : (
        <ChevronsUpDown className="size-3 opacity-50" />
      )}
    </button>
  );
}

export function RequestsTable({
  requests,
  expandedRequestId,
  onExpandedRequestChange,
}: RequestsTableProps) {
  const [sort, setSort] =
    React.useState<SortState>({
      key: "updatedAt",
      direction: "desc",
    });

  const [pageIndex, setPageIndex] =
    React.useState(0);

  const [pageSize, setPageSize] =
    React.useState(5);

  const sortedRequests =
    React.useMemo(() => {
      return [...requests].sort(
        (requestA, requestB) => {
          const result =
            compareValues(
              requestA[sort.key],
              requestB[sort.key]
            );

          return sort.direction === "asc"
            ? result
            : -result;
        }
      );
    }, [requests, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedRequests.length / pageSize
    )
  );

  const safePageIndex = Math.min(
    pageIndex,
    totalPages - 1
  );

  const startIndex =
    safePageIndex * pageSize;

  const visibleRequests =
    sortedRequests.slice(
      startIndex,
      startIndex + pageSize
    );

  const changeSort = (
    key: SortKey
  ) => {
    setSort((current) =>
      current.key === key
        ? {
            key,
            direction:
              current.direction === "asc"
                ? "desc"
                : "asc",
          }
        : {
            key,
            direction: "asc",
          }
    );
  };

  const toggleExpanded = (
    requestId: string
  ) => {
    onExpandedRequestChange(
      expandedRequestId === requestId
        ? null
        : requestId
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-xs">
      <Table className="w-full table-fixed border-none">
        <colgroup>
          <col className="w-[3%]" />
          <col className="w-[11%]" />
          <col className="w-[16%]" />
          <col className="w-[7%]" />
          <col className="w-[13%]" />
          <col className="w-[11%]" />
          <col className="w-[13%]" />
          <col className="w-[10%]" />
          <col className="w-[7%]" />
          <col className="w-[9%]" />
        </colgroup>

        <TableHeader className="border-b border-border bg-slate-50/80">
          <TableRow className="hover:bg-slate-50/80">
            <TableHead className="w-10 px-2">
              <span className="sr-only">
                Expand request
              </span>
            </TableHead>

            <TableHead className="px-2 py-3">
              <SortableHeader
                label="Request ID"
                sortKey="requestId"
                sort={sort}
                onSort={changeSort}
              />
            </TableHead>

            <TableHead className="px-2 py-3">
              <SortableHeader
                label="Position"
                sortKey="position"
                sort={sort}
                onSort={changeSort}
              />
            </TableHead>

            <TableHead className="px-2 py-3 text-center">
              <SortableHeader
                label="Resources"
                sortKey="resources"
                sort={sort}
                onSort={changeSort}
                align="center"
              />
            </TableHead>

            <TableHead className="px-2 py-3">
              <SortableHeader
                label="Actual Status"
                sortKey="actualStatus"
                sort={sort}
                onSort={changeSort}
              />
            </TableHead>

            <TableHead className="px-2 py-3">
              <SortableHeader
                label="Current Stage"
                sortKey="currentStage"
                sort={sort}
                onSort={changeSort}
              />
            </TableHead>

            <TableHead className="px-2 py-3">
              <SortableHeader
                label="Current Owner"
                sortKey="currentOwner"
                sort={sort}
                onSort={changeSort}
              />
            </TableHead>

            <TableHead className="px-2 py-3 text-right">
              <SortableHeader
                label="Budget"
                sortKey="budget"
                sort={sort}
                onSort={changeSort}
                align="right"
              />
            </TableHead>

            <TableHead className="px-2 py-3">
              <SortableHeader
                label="Updated"
                sortKey="updatedAt"
                sort={sort}
                onSort={changeSort}
              />
            </TableHead>

            <TableHead className="whitespace-normal px-2 py-3 text-xs font-semibold uppercase leading-4 tracking-wider text-slate-500">
              Next Action
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibleRequests.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="h-32 text-center text-sm text-muted-foreground"
              >
                No requests match the
                current filters.
              </TableCell>
            </TableRow>
          ) : (
            visibleRequests.map(
              (request, index) => {
                const isExpanded =
                  expandedRequestId ===
                  request.requestId;

                return (
                  <React.Fragment
                    key={request.id}
                  >
                    <TableRow
                      aria-expanded={
                        isExpanded
                      }
                      tabIndex={0}
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.target ===
                            event.currentTarget &&
                          (event.key ===
                            "Enter" ||
                            event.key ===
                              " ")
                        ) {
                          event.preventDefault();

                          toggleExpanded(
                            request.requestId
                          );
                        }
                      }}
                      onDoubleClick={(
                        event
                      ) => {
                        const target =
                          event.target as HTMLElement;

                        if (
                          target.closest(
                            "button, a, input, select, textarea, [role='menuitem']"
                          )
                        ) {
                          return;
                        }

                        toggleExpanded(
                          request.requestId
                        );
                      }}
                      className={cn(
                        "cursor-pointer border-slate-100 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60",

                        index % 2 === 1 &&
                          "bg-slate-50/40",

                        isExpanded &&
                          "bg-primary/5"
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
                          onClick={() =>
                            toggleExpanded(
                              request.requestId
                            )
                          }
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </Button>
                      </TableCell>

                      <TableCell className="px-3 py-3">
                        <span className="whitespace-nowrap font-mono text-xs font-semibold text-secondary">
                          {request.requestId}
                        </span>
                      </TableCell>

                      <TableCell className="whitespace-normal break-words px-2 py-3 text-sm font-medium leading-5 text-foreground">
                        {request.position}
                      </TableCell>

                      <TableCell className="px-3 py-3 text-center text-sm">
                        {request.resources}
                      </TableCell>

                      <TableCell className="whitespace-normal px-2 py-3">
                        <RequestStatusBadge
                          status={
                            request.actualStatus
                          }
                          className="max-w-full whitespace-normal text-center leading-4"
                        />
                      </TableCell>

                      <TableCell className="whitespace-normal break-words px-2 py-3 text-sm leading-5">
                        {request.currentStage}
                      </TableCell>

                      <TableCell className="whitespace-normal break-words px-2 py-3 text-sm leading-5">
                        {request.currentOwner}
                      </TableCell>

                      <TableCell className="px-3 py-3 text-right text-sm font-semibold">
                        {currencyFormatter.format(
                          request.budget
                        )}
                      </TableCell>

                      <TableCell className="whitespace-nowrap px-3 py-3 text-sm text-muted-foreground">
                        {request.updatedLabel}
                      </TableCell>

                      <TableCell className="whitespace-normal px-2 py-3">
                        <Button
                          size="sm"
                          className="h-auto min-h-8 w-full whitespace-normal rounded-lg px-2 py-1 text-xs leading-4"
                          onClick={() =>
                            onExpandedRequestChange(
                              request.requestId
                            )
                          }
                        >
                          {request.nextAction}
                        </Button>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="border-primary/20 hover:bg-white">
                        <TableCell
                          colSpan={10}
                          className="whitespace-normal p-0"
                        >
                          <RequestExpandedDetails
                            request={request}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              }
            )
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-white px-4 py-3 sm:flex-row">
        <div className="flex items-center gap-3">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(
                Number(value)
              );

              setPageIndex(0);
            }}
          >
            <SelectTrigger className="h-8 w-[125px] bg-white text-xs">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="5">
                Show 5 rows
              </SelectItem>

              <SelectItem value="10">
                Show 10 rows
              </SelectItem>

              <SelectItem value="20">
                Show 20 rows
              </SelectItem>
            </SelectContent>
          </Select>

          <p className="text-xs text-muted-foreground">
            Showing{" "}
            {sortedRequests.length ===
            0
              ? "0–0 of 0"
              : `${startIndex + 1}–${Math.min(
                  startIndex +
                    pageSize,
                  sortedRequests.length
                )} of ${
                  sortedRequests.length
                }`}{" "}
            requests
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="size-7 rounded p-0"
            disabled={
              safePageIndex === 0
            }
            onClick={() =>
              setPageIndex(
                Math.max(
                  0,
                  safePageIndex - 1
                )
              )
            }
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {Array.from({
            length: totalPages,
          }).map((_, index) => (
            <Button
              key={index}
              variant={
                index ===
                safePageIndex
                  ? "default"
                  : "ghost"
              }
              size="sm"
              className="size-7 rounded p-0 text-xs"
              onClick={() =>
                setPageIndex(index)
              }
            >
              {index + 1}
            </Button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="size-7 rounded p-0"
            disabled={
              safePageIndex >=
              totalPages - 1
            }
            onClick={() =>
              setPageIndex(
                Math.min(
                  totalPages - 1,
                  safePageIndex + 1
                )
              )
            }
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}