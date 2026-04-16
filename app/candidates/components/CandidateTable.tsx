"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { candidateService } from "@/lib/services/candidateService";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Edit3,
  Eye,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CandidateDetailDrawer from "./CandidateDetailDrawer";
import CandidateModal from "./CandidateModal";
import DeleteCandidateDialog from "./DeleteCandidateDialog";

type SortKey =
  | "alias"
  | "financial_quote_aed"
  | "total_years_experience"
  | "status"
  | "created_at";
type SortDir = "asc" | "desc" | null;

const STATUS_OPTIONS = [
  "ALL",
  "SUBMITTED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW_SCHEDULED",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
];

const statusStyles: Record<string, { bg: string; dot: string; text: string }> =
{
  SUBMITTED: { bg: "bg-blue-50", dot: "bg-blue-500", text: "text-blue-700" },
  UNDER_REVIEW: {
    bg: "bg-amber-50",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
  SHORTLISTED: {
    bg: "bg-violet-50",
    dot: "bg-violet-500",
    text: "text-violet-700",
  },
  INTERVIEW_SCHEDULED: {
    bg: "bg-cyan-50",
    dot: "bg-cyan-500",
    text: "text-cyan-700",
  },
  SELECTED: {
    bg: "bg-green-50",
    dot: "bg-green-500",
    text: "text-green-700",
  },
  REJECTED: { bg: "bg-red-50", dot: "bg-red-500", text: "text-red-700" },
  WITHDRAWN: {
    bg: "bg-slate-100",
    dot: "bg-slate-400",
    text: "text-slate-500",
  },
};

const priorityStyles: Record<string, string> = {
  P1: "bg-red-50 text-red-700",
  P2: "bg-amber-50 text-amber-700",
  P3: "bg-slate-100 text-slate-500",
};

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

interface CandidateTableProps {
  refreshTrigger?: number;
}

export default function CandidateTable({
  refreshTrigger = 0,
}: CandidateTableProps) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [editingCandidate, setEditingCandidate] = useState<any | null>(null);
  const [deletingCandidate, setDeletingCandidate] = useState<any | null>(null);
  const [viewingCandidate, setViewingCandidate] = useState<any | null>(null);

  useEffect(() => {
    loadCandidates();
  }, [refreshTrigger]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await candidateService.getCandidates();
      setCandidates(data || []);
    } catch {
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const filtered = candidates.filter((c) => {
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    if (!matchStatus) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.alias?.toLowerCase().includes(s) ||
      c.vendors?.company_name?.toLowerCase().includes(s) ||
      c.requisitions?.position_title?.toLowerCase().includes(s) ||
      c.requisitions?.req_number?.toLowerCase().includes(s) ||
      c.education_level?.toLowerCase().includes(s) ||
      c.top_skills?.some((sk: string) => sk.toLowerCase().includes(s))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortDir) return 0;
    const av = a[sortKey] ?? "";
    const bv = b[sortKey] ?? "";
    if (typeof av === "number" && typeof bv === "number") {
      return sortDir === "asc" ? av - bv : bv - av;
    }
    return sortDir === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const paginated = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key)
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col)
      return <ChevronsUpDown size={12} className="text-slate-300" />;
    if (sortDir === "asc")
      return <ChevronUp size={12} className="text-[hsl(214,67%,32%)]" />;
    if (sortDir === "desc")
      return <ChevronDown size={12} className="text-[hsl(214,67%,32%)]" />;
    return <ChevronsUpDown size={12} className="text-slate-300" />;
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Search + Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Search alias, vendor, position, skills…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-10 bg-white"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearch("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:bg-transparent"
              >
                <X size={13} />
              </Button>
            )}
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 flex-wrap">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${statusFilter === s
                  ? "bg-white text-[hsl(214,67%,32%)] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {s === "ALL" ? "All" : s.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 ml-auto">
            {loading
              ? "---"
              : `${filtered.length} of ${candidates.length} candidates`}
          </span>
        </div>

        {/* Table */}
        <Card className="overflow-hidden border-none shadow-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {[
                      { key: "alias" as SortKey, label: "Alias / ID" },
                      {
                        key: "alias" as SortKey,
                        label: "Requisition",
                        noSort: true,
                      },
                      {
                        key: "alias" as SortKey,
                        label: "Vendor",
                        noSort: true,
                      },
                      {
                        key: "total_years_experience" as SortKey,
                        label: "Exp.",
                      },
                      {
                        key: "alias" as SortKey,
                        label: "Skills",
                        noSort: true,
                      },
                      {
                        key: "financial_quote_aed" as SortKey,
                        label: "Quote (AED)",
                      },
                      {
                        key: "alias" as SortKey,
                        label: "Priority",
                        noSort: true,
                      },
                      { key: "status" as SortKey, label: "Status" },
                    ].map((col, i) => (
                      <th
                        key={i}
                        onClick={() => !col.noSort && handleSort(col.key)}
                        className={`px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${!col.noSort ? "cursor-pointer hover:text-slate-700 select-none" : ""}`}
                      >
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          {!col.noSort && <SortIcon col={col.key} />}
                        </div>
                      </th>
                    ))}
                    <th className="w-24 px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-100 h-16">
                        {Array.from({ length: 9 }).map((_, j) => (
                          <td key={j} className="px-3 py-3">
                            <Skeleton className="h-4 w-full max-w-[100px]" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                            <Users size={20} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              No candidates found
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Try adjusting your search or add a new candidate
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((c, idx) => {
                      const sty = (c.status && statusStyles[c.status]) || statusStyles["SUBMITTED"] || { bg: "bg-blue-50", dot: "bg-blue-500", text: "text-blue-700" };
                      return (
                        <tr
                          key={c.id}
                          className={`border-b border-slate-100 last:border-0 transition-colors group ${idx % 2 === 0
                            ? "bg-white hover:bg-slate-50/70"
                            : "bg-slate-50/40 hover:bg-slate-50"
                            }`}
                        >
                          {/* Alias */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-[hsl(214,67%,32%)]/10 flex items-center justify-center text-[hsl(214,67%,32%)] text-[10px] font-bold shrink-0">
                                {c.alias?.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-semibold text-slate-800 text-xs">
                                {c.alias}
                              </span>
                            </div>
                          </td>

                          {/* Requisition */}
                          <td className="px-3 py-3 max-w-[160px]">
                            {c.requisitions ? (
                              <div>
                                <p className="text-xs font-semibold text-slate-700 truncate">
                                  {c.requisitions.position_title}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {c.requisitions.req_number}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>

                          {/* Vendor */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="text-xs text-slate-600">
                              {c.vendors?.company_name || "—"}
                            </span>
                          </td>

                          {/* Experience */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-semibold text-slate-700">
                              {c.total_years_experience != null
                                ? `${c.total_years_experience}y`
                                : "—"}
                            </span>
                          </td>

                          {/* Skills */}
                          <td className="px-3 py-3 max-w-[160px]">
                            <div className="flex flex-wrap gap-1">
                              {c.top_skills?.slice(0, 3).map((sk: string) => (
                                <span
                                  key={sk}
                                  className="px-1.5 py-0.5 rounded bg-[hsl(214,67%,32%)]/8 text-[hsl(214,67%,32%)] text-[10px] font-semibold"
                                >
                                  {sk}
                                </span>
                              ))}
                              {c.top_skills?.length > 3 && (
                                <span className="text-[10px] text-slate-400">
                                  +{c.top_skills.length - 3}
                                </span>
                              )}
                              {(!c.top_skills || c.top_skills.length === 0) && (
                                <span className="text-slate-300 text-xs">
                                  —
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Quote */}
                          <td className="px-3 py-3 text-right whitespace-nowrap">
                            <span className="font-mono text-xs font-semibold text-slate-800 tabular-nums">
                              {Number(c.financial_quote_aed).toLocaleString()}
                            </span>
                          </td>

                          {/* Priority */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            {c.priority_ranking ? (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityStyles[c.priority_ranking]}`}
                              >
                                {c.priority_ranking}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sty.bg} ${sty.text}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${sty.dot}`}
                              />
                              {c.status?.replace(/_/g, " ")}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-[hsl(214,67%,32%)] hover:bg-blue-50 transition-all"
                                onClick={() => setViewingCandidate(c)}
                              >
                                <Eye size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                onClick={() => setEditingCandidate(c)}
                              >
                                <Edit3 size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                onClick={() => setDeletingCandidate(c)}
                              >
                                <Trash2 size={14} />
                              </Button>
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
                    onValueChange={(val) => {
                      setItemsPerPage(Number(val));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEMS_PER_PAGE_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o.toString()}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-xs text-slate-400">
                  {sorted.length === 0
                    ? "0"
                    : `${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, sorted.length)}`}{" "}
                  of {sorted.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </Button>
                <div className="flex items-center px-2">
                  <span className="text-xs font-semibold text-slate-700">
                    {currentPage}
                  </span>
                  <span className="text-xs text-slate-400 mx-1">/</span>
                  <span className="text-xs text-slate-400">{totalPages}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {editingCandidate && (
        <CandidateModal
          mode="edit"
          candidate={editingCandidate}
          onClose={() => setEditingCandidate(null)}
          onSuccess={loadCandidates}
        />
      )}
      {deletingCandidate && (
        <DeleteCandidateDialog
          candidate={deletingCandidate}
          onClose={() => setDeletingCandidate(null)}
          onSuccess={loadCandidates}
        />
      )}
      {viewingCandidate && (
        <CandidateDetailDrawer
          candidate={viewingCandidate}
          onClose={() => setViewingCandidate(null)}
          onEdit={() => {
            setEditingCandidate(viewingCandidate);
            setViewingCandidate(null);
          }}
        />
      )}
    </>
  );
}
