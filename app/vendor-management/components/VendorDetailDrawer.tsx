"use client";

import React from "react";
import {
  X,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Hash,
  User,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface VendorDetailDrawerProps {
  vendor: any;
  onClose: () => void;
  onEdit: () => void;
}

export default function VendorDetailDrawer({
  vendor,
  onClose,
  onEdit,
}: VendorDetailDrawerProps) {
  const Field = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value?: string | null;
    icon?: any;
  }) =>
    value ? (
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-sm text-slate-700 flex items-center gap-1.5">
          {Icon && <Icon size={12} className="text-slate-400 shrink-0" />}
          {value}
        </span>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(214,67%,32%)]/10 flex items-center justify-center text-[hsl(214,67%,32%)] text-sm font-bold">
              {vendor.company_name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base leading-tight">
                {vendor.company_name}
              </h2>
              {vendor.vendor_code && (
                <span className="font-mono text-xs text-[hsl(214,67%,32%)]">
                  {vendor.vendor_code}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-400"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Status badge */}
        <div className="px-6 py-3 border-b border-slate-100">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              vendor.is_active
                ? "bg-green-50 text-green-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${vendor.is_active ? "bg-green-500" : "bg-slate-400"}`}
            />
            {vendor.is_active ? "Active Vendor" : "Inactive Vendor"}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Contact */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <User size={12} className="text-[hsl(214,67%,32%)]" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Contact
              </span>
            </div>
            <div className="space-y-3">
              <Field label="Contact Person" value={vendor.contact_person} />
              <Field label="Designation" value={vendor.designation} />
              <Field label="Email" value={vendor.email} icon={Mail} />
              <Field label="Phone" value={vendor.phone} icon={Phone} />
              <Field label="Mobile" value={vendor.mobile} icon={Phone} />
              <Field label="Website" value={vendor.website} icon={Globe} />
            </div>
          </section>

          {/* Address */}
          {(vendor.address_line1 || vendor.city || vendor.country) && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={12} className="text-[hsl(214,67%,32%)]" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Address
                </span>
              </div>
              <div className="space-y-3">
                <Field label="Address Line 1" value={vendor.address_line1} />
                <Field label="Address Line 2" value={vendor.address_line2} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City" value={vendor.city} />
                  <Field label="State" value={vendor.state} />
                  <Field label="Country" value={vendor.country} />
                  <Field label="Postal Code" value={vendor.postal_code} />
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <Button onClick={onEdit} className="w-full" size="sm">
            <Edit3 size={13} /> Edit Vendor
          </Button>
        </div>
      </div>
    </div>
  );
}
