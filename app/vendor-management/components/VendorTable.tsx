"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Edit3,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
  Phone,
  Mail,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vendorService } from "@/lib/services/vendorService";
import VendorModal from "./VendorModal";
import DeleteVendorDialog from "./DeleteVendorDialog";
import VendorDetailDrawer from "./VendorDetailDrawer";

type SortDir = "asc" | "desc" | null;
type SortKey =
  | "company_name"
  | "vendor_code"
  | "contact_person"
  | "city"
  | "country"
  | "email";

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

interface VendorTableProps {
  refreshTrigger?: number;
}

export default function VendorTable({ refreshTrigger = 0 }: VendorTableProps) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("company_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [editingVendor, setEditingVendor] = useState<any | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<any | null>(null);
  const [viewingVendor, setViewingVendor] = useState<any | null>(null);

  useEffect(() => {
    loadVendors();
  }, [refreshTrigger]);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const data = await vendorService.getVendors();
      setVendors(data || []);
    } catch {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const filtered = vendors.filter((v) => {
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? v.is_active
          : !v.is_active;

    if (!matchesStatus) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      v.company_name?.toLowerCase().includes(s) ||
      v.vendor_code?.toLowerCase().includes(s) ||
      v.contact_person?.toLowerCase().includes(s) ||
      v.email?.toLowerCase().includes(s) ||
      v.city?.toLowerCase().includes(s) ||
      v.country?.toLowerCase().includes(s)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortDir) return 0;
    const av = (a[sortKey] || "").toLowerCase();
    const bv = (b[sortKey] || "").toLowerCase();
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const paginated = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
    } else {
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
        {/* Search + Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Search by name, code, contact, city…"
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
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-transparent"
              >
                <X size={13} />
              </Button>
            )}
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
            {(["all", "active", "inactive"] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                  statusFilter === s
                    ? "bg-white text-[hsl(214,67%,32%)] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 ml-auto">
            {loading
              ? "---"
              : `${filtered.length} of ${vendors.length} vendors`}
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
                      { key: "company_name" as SortKey, label: "Company" },
                      { key: "vendor_code" as SortKey, label: "Code" },
                      { key: "contact_person" as SortKey, label: "Contact" },
                      { key: "email" as SortKey, label: "Email / Phone" },
                      { key: "city" as SortKey, label: "Location" },
                      { key: "country" as SortKey, label: "Country" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none whitespace-nowrap"
                        onClick={() => handleSort(col.key)}
                      >
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          <SortIcon col={col.key} />
                        </div>
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      Status
                    </th>
                    <th className="w-24 px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-100 h-16">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-3 py-3">
                            <Skeleton className="h-4 w-full max-w-[120px]" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                            <Building2 size={20} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              No vendors found
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Try adjusting your search or add a new vendor
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((vendor, idx) => (
                      <tr
                        key={vendor.id}
                        className={`border-b border-slate-100 last:border-0 transition-colors group ${
                          idx % 2 === 0
                            ? "bg-white hover:bg-slate-50/70"
                            : "bg-slate-50/40 hover:bg-slate-50"
                        }`}
                      >
                        {/* Company */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[hsl(214,67%,32%)]/10 flex items-center justify-center text-[hsl(214,67%,32%)] text-[11px] font-bold shrink-0">
                              {vendor.company_name?.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm leading-tight">
                                {vendor.company_name}
                              </p>
                              {vendor.website && (
                                <a
                                  href={vendor.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-slate-400 hover:text-[hsl(214,67%,32%)] flex items-center gap-0.5 transition-colors"
                                >
                                  <Globe size={9} />{" "}
                                  {vendor.website.replace(/^https?:\/\//, "")}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          {vendor.vendor_code ? (
                            <span className="font-mono text-xs font-semibold text-[hsl(214,67%,32%)] bg-[hsl(214,67%,32%)]/5 px-1.5 py-0.5 rounded">
                              {vendor.vendor_code}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Contact */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          {vendor.contact_person ? (
                            <div>
                              <p className="text-xs font-semibold text-slate-700">
                                {vendor.contact_person}
                              </p>
                              {vendor.designation && (
                                <p className="text-[10px] text-slate-400">
                                  {vendor.designation}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Email / Phone */}
                        <td className="px-3 py-3">
                          <div className="space-y-0.5">
                            {vendor.email && (
                              <a
                                href={`mailto:${vendor.email}`}
                                className="flex items-center gap-1 text-xs text-slate-600 hover:text-[hsl(214,67%,32%)] transition-colors"
                              >
                                <Mail size={10} className="text-slate-400" />{" "}
                                {vendor.email}
                              </a>
                            )}
                            {(vendor.phone || vendor.mobile) && (
                              <p className="flex items-center gap-1 text-xs text-slate-500">
                                <Phone size={10} className="text-slate-400" />{" "}
                                {vendor.mobile || vendor.phone}
                              </p>
                            )}
                            {!vendor.email &&
                              !vendor.phone &&
                              !vendor.mobile && (
                                <span className="text-slate-300 text-xs">
                                  —
                                </span>
                              )}
                          </div>
                        </td>

                        {/* City */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="text-xs text-slate-600">
                            {vendor.city || "—"}
                          </span>
                        </td>

                        {/* Country */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="text-xs text-slate-600">
                            {vendor.country || "—"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              vendor.is_active
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${vendor.is_active ? "bg-green-500" : "bg-slate-400"}`}
                            />
                            {vendor.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-[hsl(214,67%,32%)] hover:bg-blue-50 transition-all"
                              title="View details"
                              onClick={() => setViewingVendor(vendor)}
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                              title="Edit vendor"
                              onClick={() => setEditingVendor(vendor)}
                            >
                              <Edit3 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                              title="Delete vendor"
                              onClick={() => setDeletingVendor(vendor)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
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
                  className="h-8 w-8 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
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
                  className="h-8 w-8 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {editingVendor && (
        <VendorModal
          mode="edit"
          vendor={editingVendor}
          onClose={() => setEditingVendor(null)}
          onSuccess={loadVendors}
        />
      )}
      {deletingVendor && (
        <DeleteVendorDialog
          vendor={deletingVendor}
          onClose={() => setDeletingVendor(null)}
          onSuccess={loadVendors}
        />
      )}
      {viewingVendor && (
        <VendorDetailDrawer
          vendor={viewingVendor}
          onClose={() => setViewingVendor(null)}
          onEdit={() => {
            setEditingVendor(viewingVendor);
            setViewingVendor(null);
          }}
        />
      )}
    </>
  );
}
